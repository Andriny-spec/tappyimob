import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Executar automações (chamado por CRON ou manualmente)
export async function POST() {
  try {
    const automations = await prisma.leadAutomation.findMany({
      where: { isActive: true },
      orderBy: { priority: "asc" },
    });

    // Buscar colunas kanban para mapear status ↔ funnelStage
    const columns = await prisma.kanbanColumn.findMany({ orderBy: { order: "asc" } });

    const results: any[] = [];

    for (const automation of automations) {
      const config = automation.triggerConfig as any;
      let matchedLeads: any[] = [];

      // Automação: Tempo em status sem contato
      if (automation.triggerType === "TIME_IN_STATUS") {
        const status = config.status;
        const hours = config.hours || 48;
        const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);

        matchedLeads = await prisma.lead.findMany({
          where: {
            status,
            statusChangedAt: { lt: cutoffDate },
            isBanned: false,
            archivedAt: null,
          },
        });
      }

      // Automação: Sem contato por X horas
      if (automation.triggerType === "NO_CONTACT") {
        const hours = config.hours || 48;
        const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);

        matchedLeads = await prisma.lead.findMany({
          where: {
            status: { notIn: ["FECHADO", "PERDIDO", "ARQUIVADO"] },
            lastContact: { lt: cutoffDate },
            isBanned: false,
            archivedAt: null,
          },
        });
      }

      // Automação: Follow-up pós visita (24h depois)
      if (automation.triggerType === "VISIT_COMPLETED") {
        const hoursAfter = config.hoursAfter || 24;
        const minDate = new Date(Date.now() - (hoursAfter + 1) * 60 * 60 * 1000);
        const maxDate = new Date(Date.now() - hoursAfter * 60 * 60 * 1000);

        const completedVisits = await prisma.leadSchedule.findMany({
          where: {
            type: "VISITA",
            completed: true,
            date: { gte: minDate, lte: maxDate },
            lead: {
              isBanned: false,
              archivedAt: null,
              status: { notIn: ["FECHADO", "PERDIDO", "ARQUIVADO"] },
            },
          },
          include: { lead: true },
        });

        for (const visit of completedVisits) {
          const existingFollowUp = await prisma.leadFollowUp.findFirst({
            where: {
              leadId: visit.leadId,
              type: "VISIT_FOLLOWUP",
              scheduledFor: { gte: new Date(Date.now() - 48 * 60 * 60 * 1000) },
            },
          });

          if (!existingFollowUp) {
            matchedLeads.push(visit.lead);
          }
        }
      }

      // Automação de FUNIL: Tempo na coluna sem progresso → regredir
      if (automation.triggerType === "FUNNEL_NO_PROGRESS") {
        const days = config.days || 20;
        const fromStatus = config.fromStatus; // Status atual (ex: QUALIFICADO)
        const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        if (fromStatus) {
          matchedLeads = await prisma.lead.findMany({
            where: {
              status: fromStatus,
              statusChangedAt: { lt: cutoffDate },
              isBanned: false,
              archivedAt: null,
            },
          });

          // Filtrar leads que tiveram atividade recente (visita, proposta, etc)
          if (config.requireNoActivity) {
            const filteredLeads: any[] = [];
            for (const lead of matchedLeads) {
              const recentActivity = await prisma.leadActivity.findFirst({
                where: {
                  leadId: lead.id,
                  createdAt: { gte: cutoffDate },
                  type: { in: ["visit_scheduled", "visit_completed", "proposal_sent", "property_sent", "contact_made"] },
                },
              });
              if (!recentActivity) {
                filteredLeads.push(lead);
              }
            }
            matchedLeads = filteredLeads;
          }
        }
      }

      // Automação de FUNIL: Sem visita agendada por X dias
      if (automation.triggerType === "FUNNEL_NO_VISIT") {
        const days = config.days || 15;
        const fromStatus = config.fromStatus;
        const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        if (fromStatus) {
          const leads = await prisma.lead.findMany({
            where: {
              status: fromStatus,
              statusChangedAt: { lt: cutoffDate },
              isBanned: false,
              archivedAt: null,
            },
          });

          for (const lead of leads) {
            const hasVisit = await prisma.leadSchedule.findFirst({
              where: {
                leadId: lead.id,
                type: "VISITA",
                date: { gte: cutoffDate },
              },
            });
            if (!hasVisit) {
              matchedLeads.push(lead);
            }
          }
        }
      }

      // Automação de FUNIL: Tempo sem contato em etapa específica
      if (automation.triggerType === "FUNNEL_NO_CONTACT") {
        const days = config.days || 10;
        const fromStatus = config.fromStatus;
        const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        if (fromStatus) {
          matchedLeads = await prisma.lead.findMany({
            where: {
              status: fromStatus,
              lastContact: { lt: cutoffDate },
              isBanned: false,
              archivedAt: null,
            },
          });
        }
      }

      // Automação de FUNIL: Progressão automática (ex: se teve visita, avançar etapa)
      if (automation.triggerType === "FUNNEL_AUTO_PROGRESS") {
        const fromStatus = config.fromStatus;
        const requiredEvent = config.requiredEvent; // "visit_completed", "proposal_sent", etc
        const withinDays = config.withinDays || 7;
        const cutoffDate = new Date(Date.now() - withinDays * 24 * 60 * 60 * 1000);

        if (fromStatus && requiredEvent) {
          const leads = await prisma.lead.findMany({
            where: {
              status: fromStatus,
              isBanned: false,
              archivedAt: null,
            },
          });

          for (const lead of leads) {
            const hasEvent = await prisma.leadActivity.findFirst({
              where: {
                leadId: lead.id,
                type: requiredEvent,
                createdAt: { gte: cutoffDate },
              },
            });
            if (hasEvent) {
              matchedLeads.push(lead);
            }
          }
        }
      }

      // Executar ações nos leads encontrados
      for (const lead of matchedLeads) {
        const executed = await executeAction(automation, lead, columns);
        results.push({ automationId: automation.id, leadId: lead.id, ...executed });
      }

      // Atualizar contador de execuções
      const count = results.filter((r) => r.automationId === automation.id && r.success).length;
      if (count > 0) {
        await prisma.leadAutomation.update({
          where: { id: automation.id },
          data: {
            executionCount: { increment: count },
            lastExecutedAt: new Date(),
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      executed: results.filter((r) => r.success).length,
      results,
    });
  } catch (error) {
    console.error("Erro ao executar automações:", error);
    return NextResponse.json({ error: "Erro ao executar automações" }, { status: 500 });
  }
}

async function executeAction(automation: any, lead: any, columns: any[] = []) {
  const actionConfig = automation.actionConfig as any;

  try {
    // Verificar se já executou essa automação nesse lead recentemente (evita duplicação)
    const recentLog = await prisma.leadAutomationLog.findFirst({
      where: {
        automationId: automation.id,
        leadId: lead.id,
        status: "SUCCESS",
        executedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });
    if (recentLog) {
      return { success: false, skipped: true, reason: "Já executada nas últimas 24h" };
    }

    // Ação: Mudar status
    if (automation.actionType === "CHANGE_STATUS") {
      const newStatus = actionConfig.newStatus;
      const previousStatus = lead.status;

      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          status: newStatus,
          statusChangedAt: new Date(),
          previousStatus,
          ...(newStatus === "ARQUIVADO"
            ? {
                archivedAt: new Date(),
                archivedReason: `Automação: ${automation.name}`,
                archivedCategory: actionConfig.archiveCategory || "automatico",
              }
            : {}),
        },
      });

      await prisma.leadActivity.create({
        data: {
          leadId: lead.id,
          type: "automation_executed",
          description: `Automação "${automation.name}" alterou status de ${previousStatus} para ${newStatus}`,
          metadata: { automationId: automation.id, from: previousStatus, to: newStatus },
        },
      });

      await prisma.leadAutomationLog.create({
        data: { automationId: automation.id, leadId: lead.id, status: "SUCCESS", result: { action: "CHANGE_STATUS", from: previousStatus, to: newStatus } },
      });

      return { success: true, action: "CHANGE_STATUS", from: previousStatus, to: newStatus };
    }

    // Ação: Mover para outra coluna (funil)
    if (automation.actionType === "MOVE_COLUMN") {
      const toStatus = actionConfig.toStatus;
      const previousStatus = lead.status;

      if (!toStatus || toStatus === previousStatus) {
        return { success: false, error: "Status destino inválido ou igual ao atual" };
      }

      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          status: toStatus,
          statusChangedAt: new Date(),
          previousStatus,
        },
      });

      const fromCol = columns.find((c) => c.status === previousStatus);
      const toCol = columns.find((c) => c.status === toStatus);
      const direction = (toCol?.order ?? 0) > (fromCol?.order ?? 0) ? "avançou" : "regrediu";

      await prisma.leadActivity.create({
        data: {
          leadId: lead.id,
          type: "funnel_automation",
          description: `Automação "${automation.name}": lead ${direction} de "${fromCol?.title || previousStatus}" para "${toCol?.title || toStatus}"`,
          metadata: { automationId: automation.id, from: previousStatus, to: toStatus, direction },
        },
      });

      await prisma.leadAutomationLog.create({
        data: { automationId: automation.id, leadId: lead.id, status: "SUCCESS", result: { action: "MOVE_COLUMN", from: previousStatus, to: toStatus, direction } },
      });

      return { success: true, action: "MOVE_COLUMN", from: previousStatus, to: toStatus, direction };
    }

    // Ação: Criar tarefa de follow-up
    if (automation.actionType === "CREATE_FOLLOW_UP") {
      const scheduledFor = new Date(Date.now() + (actionConfig.delayHours || 24) * 60 * 60 * 1000);

      await prisma.leadFollowUp.create({
        data: {
          leadId: lead.id,
          type: actionConfig.followUpType || "AUTOMATION",
          scheduledFor,
          channel: actionConfig.channel || "WHATSAPP",
          message: actionConfig.message,
          assignedToId: lead.corretorId,
        },
      });

      await prisma.leadAutomationLog.create({
        data: { automationId: automation.id, leadId: lead.id, status: "SUCCESS", result: { action: "CREATE_FOLLOW_UP", scheduledFor } },
      });

      return { success: true, action: "CREATE_FOLLOW_UP", scheduledFor };
    }

    // Ação: Banir/Negativar lead
    if (automation.actionType === "BAN_LEAD") {
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          isBanned: true,
          bannedAt: new Date(),
          bannedReason: `Automação: ${automation.name}`,
          status: "ARQUIVADO",
          archivedAt: new Date(),
          archivedReason: `Banido por automação: ${automation.name}`,
          archivedCategory: "banido",
        },
      });

      await prisma.leadAutomationLog.create({
        data: { automationId: automation.id, leadId: lead.id, status: "SUCCESS", result: { action: "BAN_LEAD" } },
      });

      return { success: true, action: "BAN_LEAD" };
    }

    // Ação: Enviar notificação ao corretor
    if (automation.actionType === "SEND_NOTIFICATION") {
      if (lead.corretorId) {
        await prisma.notification.create({
          data: {
            userId: lead.corretorId,
            title: actionConfig.title || `Automação: ${automation.name}`,
            message: actionConfig.message || `Lead "${lead.name}" requer atenção.`,
            type: "LEAD",
            link: `/admin/clientes/leads?leadId=${lead.id}`,
          },
        });
      }

      await prisma.leadAutomationLog.create({
        data: { automationId: automation.id, leadId: lead.id, status: "SUCCESS", result: { action: "SEND_NOTIFICATION" } },
      });

      return { success: true, action: "SEND_NOTIFICATION" };
    }

    return { success: false, error: "Ação não implementada" };
  } catch (error: any) {
    await prisma.leadAutomationLog.create({
      data: {
        automationId: automation.id,
        leadId: lead.id,
        status: "FAILED",
        error: error.message,
      },
    });

    return { success: false, error: error.message };
  }
}
