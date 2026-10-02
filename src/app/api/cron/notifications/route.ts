import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CRON_SECRET = process.env.CRON_SECRET || "tappyimob-cron-2026";

// GET /api/cron/notifications?secret=xxx
// Gera notificações automáticas:
// 1. Lembretes de tarefas agendadas (vencidas ou para hoje)
// 2. Novos imóveis cadastrados (últimas 24h)
// 3. Imóveis com suspensão expirada (captador recebe pendência)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = {
    taskReminders: 0,
    newPropertyNotifications: 0,
    suspensionExpired: 0,
    errors: [] as string[],
  };

  try {
    // ============================================
    // 1. LEMBRETES DE TAREFAS AGENDADAS
    // ============================================
    const now = new Date();
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    // Buscar tarefas pendentes com dueDate <= hoje
    const pendingTasks = await prisma.task.findMany({
      where: {
        status: { in: ["PENDENTE", "EM_ANDAMENTO"] },
        dueDate: { lte: todayEnd },
      },
      include: {
        assignedTo: { select: { id: true, name: true } },
        property: { select: { id: true, code: true, title: true } },
        lead: { select: { id: true, name: true } },
      },
    });

    for (const task of pendingTasks) {
      if (!task.assignedToId) continue;

      // Verificar se já existe notificação recente (últimas 12h) para esta tarefa
      const recentNotification = await prisma.notification.findFirst({
        where: {
          userId: task.assignedToId,
          type: "task_reminder",
          link: { contains: task.id },
          createdAt: { gte: new Date(now.getTime() - 12 * 60 * 60 * 1000) },
        },
      });

      if (recentNotification) continue;

      const isOverdue = task.dueDate < new Date(now.toDateString());
      const propertyInfo = task.property ? ` (${task.property.code})` : "";
      const leadInfo = task.lead ? ` - ${task.lead.name}` : "";

      await prisma.notification.create({
        data: {
          userId: task.assignedToId,
          title: isOverdue ? "⚠️ Tarefa atrasada" : "📋 Lembrete de tarefa",
          message: `${task.title}${propertyInfo}${leadInfo}${isOverdue ? " — esta tarefa está atrasada!" : " — vence hoje!"}`,
          type: "task_reminder",
          link: task.propertyId
            ? `/admin/imoveis/${task.propertyId}`
            : "/admin/agendamentos",
        },
      });
      results.taskReminders++;
    }

    // ============================================
    // 2. NOVOS IMÓVEIS CADASTRADOS (últimas 24h)
    // ============================================
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const newProperties = await prisma.property.findMany({
      where: {
        createdAt: { gte: yesterday },
        status: "DISPONIVEL",
      },
      select: {
        id: true,
        code: true,
        title: true,
        neighborhood: true,
        city: true,
      },
    });

    if (newProperties.length > 0) {
      // Buscar todos os admins e corretores ativos
      const users = await prisma.user.findMany({
        where: {
          role: { in: ["ADMIN", "CORRETOR"] },
          isActive: true,
        },
        select: { id: true },
      });

      for (const property of newProperties) {
        // Verificar se já notificou sobre este imóvel
        const alreadyNotified = await prisma.notification.findFirst({
          where: {
            type: "new_property",
            link: `/admin/imoveis/${property.id}`,
          },
        });

        if (alreadyNotified) continue;

        const location = [property.neighborhood, property.city].filter(Boolean).join(", ");

        for (const user of users) {
          await prisma.notification.create({
            data: {
              userId: user.id,
              title: "🏠 Novo imóvel cadastrado",
              message: `${property.code} — ${property.title || "Sem título"}${location ? ` em ${location}` : ""}`,
              type: "new_property",
              link: `/admin/imoveis/${property.id}`,
            },
          });
        }
        results.newPropertyNotifications++;
      }
    }

    // ============================================
    // 3. IMÓVEIS COM SUSPENSÃO EXPIRADA
    // ============================================
    const expiredSuspensions = await prisma.property.findMany({
      where: {
        suspensionEndDate: { lte: now },
        status: "SUSPENSO",
      },
      select: {
        id: true,
        code: true,
        title: true,
        suspensionReason: true,
        suspensionEndDate: true,
        exclusivity: {
          select: { captadorId: true, captadorName: true },
        },
      },
    });

    for (const property of expiredSuspensions) {
      const targetUserId = property.exclusivity?.captadorId;
      if (!targetUserId) continue;

      // Verificar se já notificou sobre esta suspensão expirada
      const alreadyNotified = await prisma.notification.findFirst({
        where: {
          userId: targetUserId,
          type: "suspension_expired",
          link: `/admin/imoveis/${property.id}`,
          createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
        },
      });

      if (alreadyNotified) continue;

      await prisma.notification.create({
        data: {
          userId: targetUserId,
          title: "🔔 Suspensão expirada",
          message: `O imóvel ${property.code} (${property.title || ""}) teve a suspensão encerrada${property.suspensionReason ? ` (motivo: ${property.suspensionReason})` : ""}. Verifique a pendência.`,
          type: "suspension_expired",
          link: `/admin/imoveis/${property.id}`,
        },
      });
      results.suspensionExpired++;

      // Notificar admins também
      const admins = await prisma.user.findMany({
        where: { role: "ADMIN", active: true },
        select: { id: true },
      });

      for (const admin of admins) {
        if (admin.id === targetUserId) continue;
        await prisma.notification.create({
          data: {
            userId: admin.id,
            title: "🔔 Suspensão expirada",
            message: `O imóvel ${property.code} (captador: ${property.exclusivity?.captadorName || "N/A"}) teve a suspensão encerrada.`,
            type: "suspension_expired",
            link: `/admin/imoveis/${property.id}`,
          },
        });
      }
    }

    // ============================================
    // 4. FOLLOW-UP DE IMÓVEIS ALUGADOS POR CONCORRENTES
    // ============================================
    const followUpProperties = await prisma.property.findMany({
      where: {
        followUpDate: { lte: now },
        rentedBy: "CONCORRENTE",
        status: { in: ["ALUGADO", "DISPONIVEL"] },
      },
      select: {
        id: true,
        code: true,
        title: true,
        followUpDate: true,
        followUpMonths: true,
        exclusivity: {
          select: { captadorId: true },
        },
      },
    });

    for (const property of followUpProperties) {
      const targetUserId = property.exclusivity?.captadorId;
      if (!targetUserId) continue;

      const alreadyNotified = await prisma.notification.findFirst({
        where: {
          userId: targetUserId,
          type: "task_reminder",
          link: `/admin/imoveis/${property.id}`,
          message: { contains: "follow-up" },
          createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
        },
      });

      if (alreadyNotified) continue;

      await prisma.notification.create({
        data: {
          userId: targetUserId,
          title: "📞 Follow-up de locação",
          message: `O imóvel ${property.code} foi alugado por concorrente há ${property.followUpMonths || "?"} meses. Hora do follow-up!`,
          type: "task_reminder",
          link: `/admin/imoveis/${property.id}`,
        },
      });
      results.taskReminders++;
    }

    // ============================================
    // 5. FOLLOW-UP DE LEADS ATRASADOS
    // ============================================
    let leadFollowUpReminders = 0;
    try {
      // Buscar leads ativos com último contato antigo (>2 dias para quentes, >4 para mornos, >7 para frios)
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      const overdueLeads = await prisma.lead.findMany({
        where: {
          status: { notIn: ["FECHADO", "PERDIDO", "ARQUIVADO"] },
          corretorId: { not: null },
          OR: [
            { lastContact: { lte: twoDaysAgo } },
            { lastContact: null, createdAt: { lte: twoDaysAgo } },
          ],
        },
        select: {
          id: true,
          name: true,
          temperature: true,
          lastContact: true,
          createdAt: true,
          corretorId: true,
        },
        take: 50,
      });

      for (const lead of overdueLeads) {
        if (!lead.corretorId) continue;

        const contactDate = lead.lastContact || lead.createdAt;
        const daysSince = Math.floor((now.getTime() - new Date(contactDate).getTime()) / (1000 * 60 * 60 * 24));

        // Verificar threshold por temperatura
        const temp = lead.temperature || "MORNO";
        const thresholds: Record<string, number> = { QUENTE: 2, MORNO: 4, FRIO: 7 };
        if (daysSince < (thresholds[temp] || 4)) continue;

        // Verificar se já existe notificação recente (últimas 24h)
        const recentNotif = await prisma.notification.findFirst({
          where: {
            userId: lead.corretorId,
            type: "lead_followup",
            link: { contains: lead.id },
            createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
          },
        });

        if (recentNotif) continue;

        const tempEmoji = temp === "QUENTE" ? "🔥" : temp === "FRIO" ? "❄️" : "🌤";
        const leadName = lead.name || "Lead sem nome";

        await prisma.notification.create({
          data: {
            userId: lead.corretorId,
            title: `${tempEmoji} Follow-up: ${leadName}`,
            message: `${leadName} está sem contato há ${daysSince} dias. Faça o follow-up!`,
            type: "lead_followup",
            link: `/corretor/clientes/leads`,
          },
        });
        leadFollowUpReminders++;
      }
    } catch (err) {
      results.errors.push(`Lead follow-up error: ${(err as any)?.message}`);
    }

    console.log("[CRON Notifications]", { ...results, leadFollowUpReminders });

    return NextResponse.json({
      success: true,
      ...results,
      leadFollowUpReminders,
    });
  } catch (error: any) {
    console.error("[CRON Notifications] Erro:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao processar notificações" },
      { status: 500 }
    );
  }
}
