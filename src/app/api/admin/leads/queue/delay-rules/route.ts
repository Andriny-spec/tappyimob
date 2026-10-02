import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

interface DelayRules {
  warningMinutes?: number;
  reassignMinutes?: number;
  pauseAfterDelays?: number;
  notifyManagerMinutes?: number;
}

// POST - Processar regras de atraso para leads aceitos sem primeiro contato
export async function POST() {
  try {
    const now = new Date();
    const results = { warnings: 0, reassigned: 0, paused: 0, managerNotified: 0 };

    // Buscar filas ativas com regras de atraso configuradas
    const queues = await prisma.leadQueue.findMany({
      where: {
        isActive: true,
        delayRules: { not: null },
      },
    });

    for (const queue of queues) {
      const rules = queue.delayRules as DelayRules | null;
      if (!rules) continue;

      // Buscar assignments ACCEPTED (lead aceito mas possivelmente sem contato)
      const acceptedAssignments = await prisma.leadQueueAssignment.findMany({
        where: {
          queueId: queue.id,
          status: "ACCEPTED",
          acceptedAt: { not: null },
        },
        include: {
          queue: { select: { name: true } },
        },
      });

      for (const assignment of acceptedAssignments) {
        if (!assignment.acceptedAt) continue;

        const minutesSinceAccepted = Math.floor(
          (now.getTime() - assignment.acceptedAt.getTime()) / 60000
        );

        // Verificar se o lead já teve alguma atividade/contato do corretor
        const hasActivity = await prisma.leadActivity.findFirst({
          where: {
            leadId: assignment.leadId,
            userId: assignment.assignedToId,
            createdAt: { gte: assignment.acceptedAt },
          },
        });

        if (hasActivity) continue; // Lead já teve contato, pular

        // 1. Notificar gerente após X minutos
        if (rules.notifyManagerMinutes && minutesSinceAccepted >= rules.notifyManagerMinutes) {
          const alreadyNotifiedManager = await prisma.notification.findFirst({
            where: {
              type: "delay_manager_alert",
              link: { contains: assignment.leadId },
              createdAt: { gte: assignment.acceptedAt },
            },
          });

          if (!alreadyNotifiedManager) {
            // Buscar admins para notificar
            const admins = await prisma.user.findMany({
              where: { role: "ADMIN", isActive: true },
              select: { id: true },
            });

            const lead = await prisma.lead.findUnique({
              where: { id: assignment.leadId },
              select: { name: true },
            });

            const broker = await prisma.user.findUnique({
              where: { id: assignment.assignedToId },
              select: { name: true },
            });

            for (const admin of admins) {
              await createNotification({
                userId: admin.id,
                type: "delay_manager_alert",
                title: "Atraso no atendimento",
                message: `${broker?.name || "Corretor"} não contatou ${lead?.name || "lead"} há ${minutesSinceAccepted} min (Fila: ${queue.name})`,
                link: `/admin/clientes/leads/${assignment.leadId}`,
              });
            }
            results.managerNotified++;
          }
        }

        // 2. Reatribuir após X minutos
        if (rules.reassignMinutes && minutesSinceAccepted >= rules.reassignMinutes) {
          // Marcar assignment como REASSIGNED
          await prisma.leadQueueAssignment.update({
            where: { id: assignment.id },
            data: {
              status: "REASSIGNED",
              reason: `Sem contato após ${minutesSinceAccepted} minutos`,
            },
          });

          // Remover corretor do lead
          await prisma.lead.update({
            where: { id: assignment.leadId },
            data: { brokerId: null },
          });

          // Decrementar contadores do membro
          await prisma.leadQueueMember.updateMany({
            where: { queueId: queue.id, userId: assignment.assignedToId },
            data: {
              totalLeads: { decrement: 1 },
              leadsToday: { decrement: 1 },
            },
          });

          // Registrar atividade no lead
          await prisma.leadActivity.create({
            data: {
              leadId: assignment.leadId,
              action: "DELAY_REASSIGNED",
              description: `Lead reatribuído automaticamente por atraso de ${minutesSinceAccepted} minutos`,
            },
          });

          // Notificar corretor
          await createNotification({
            userId: assignment.assignedToId,
            type: "delay_reassigned",
            title: "Lead reatribuído por atraso",
            message: `Seu lead da fila "${queue.name}" foi reatribuído por falta de contato`,
            link: `/admin/clientes/leads`,
          });

          // Incrementar delay count para verificar pausa
          const delayCount = await prisma.leadQueueAssignment.count({
            where: {
              queueId: queue.id,
              assignedToId: assignment.assignedToId,
              status: "REASSIGNED",
              reason: { contains: "Sem contato" },
              assignedAt: {
                gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // última semana
              },
            },
          });

          // 3. Pausar corretor após N atrasos na semana
          if (rules.pauseAfterDelays && delayCount >= rules.pauseAfterDelays) {
            await prisma.leadQueueMember.updateMany({
              where: { queueId: queue.id, userId: assignment.assignedToId },
              data: {
                isPaused: true,
                pauseReason: `Pausado automaticamente: ${delayCount} atrasos na semana`,
                pausedUntil: new Date(now.getTime() + 24 * 60 * 60 * 1000), // pausa de 24h
              },
            });

            await createNotification({
              userId: assignment.assignedToId,
              type: "delay_paused",
              title: "Pausado na fila por atrasos",
              message: `Você foi pausado na fila "${queue.name}" por ${delayCount} atrasos. Pausa de 24h.`,
              link: `/admin/clientes/leads/configuracoes`,
            });

            results.paused++;
          }

          // Tentar reatribuir o lead para o próximo corretor da fila
          try {
            await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/admin/leads/queue/assign`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ leadId: assignment.leadId, queueId: queue.id }),
            });
          } catch {
            // Silenciar erro de reatribuição
          }

          results.reassigned++;
          continue; // Já reatribuiu, não precisa avisar
        }

        // 4. Enviar aviso após X minutos (sem reatribuir ainda)
        if (rules.warningMinutes && minutesSinceAccepted >= rules.warningMinutes) {
          const alreadyWarned = await prisma.notification.findFirst({
            where: {
              userId: assignment.assignedToId,
              type: "delay_warning",
              link: { contains: assignment.leadId },
              createdAt: { gte: assignment.acceptedAt },
            },
          });

          if (!alreadyWarned) {
            const lead = await prisma.lead.findUnique({
              where: { id: assignment.leadId },
              select: { name: true },
            });

            await createNotification({
              userId: assignment.assignedToId,
              type: "delay_warning",
              title: "Atenção: Lead sem contato",
              message: `Você não contatou ${lead?.name || "o lead"} há ${minutesSinceAccepted} min. ${
                rules.reassignMinutes
                  ? `Será reatribuído em ${rules.reassignMinutes - minutesSinceAccepted} min.`
                  : ""
              }`,
              link: `/admin/clientes/leads/${assignment.leadId}`,
            });
            results.warnings++;
          }
        }
      }
    }

    // Despausar membros com pausa expirada
    await prisma.leadQueueMember.updateMany({
      where: {
        isPaused: true,
        pausedUntil: { lte: now },
      },
      data: {
        isPaused: false,
        pauseReason: null,
        pausedUntil: null,
      },
    });

    return NextResponse.json({
      success: true,
      processed: results,
      message: `Processado: ${results.warnings} avisos, ${results.reassigned} reatribuídos, ${results.paused} pausados, ${results.managerNotified} gestores notificados`,
    });
  } catch (error) {
    console.error("Erro ao processar regras de atraso:", error);
    return NextResponse.json({ error: "Erro ao processar regras" }, { status: 500 });
  }
}
