import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - CRON: Redistribuir leads com timer expirado
export async function POST(request: NextRequest) {
  try {
    // Verificar CRON_SECRET
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Buscar assignments expirados (status PENDING + expiresAt no passado)
    const expiredAssignments = await prisma.leadQueueAssignment.findMany({
      where: {
        status: "PENDING",
        expiresAt: { lt: now },
      },
      include: {
        queue: {
          include: {
            members: {
              where: { isActive: true, isPaused: false },
              include: { user: { select: { id: true, name: true } } },
              orderBy: { turnOrder: "asc" },
            },
          },
        },
      },
    });

    const results = [];

    for (const assignment of expiredAssignments) {
      const queue = assignment.queue;

      // Marcar assignment como expirado
      await prisma.leadQueueAssignment.update({
        where: { id: assignment.id },
        data: { status: "EXPIRED" },
      });

      // Notificar corretor que perdeu o lead
      await prisma.notification.create({
        data: {
          userId: assignment.assignedToId,
          type: "lead_expired",
          title: "Lead expirado",
          message: `Tempo limite atingido — lead redistribuído`,
          link: `/corretor/clientes/leads`,
          read: false,
        },
      });

      // Buscar próximo corretor disponível (excluir o anterior)
      const availableMembers = queue.members.filter(m => m.userId !== assignment.assignedToId);

      if (availableMembers.length === 0) {
        results.push({ assignmentId: assignment.id, action: "no_available_members" });
        continue;
      }

      // Round Robin: próximo da vez
      const nextMember = availableMembers.sort((a, b) => {
        if (!a.lastTurnAt && !b.lastTurnAt) return a.turnOrder - b.turnOrder;
        if (!a.lastTurnAt) return -1;
        if (!b.lastTurnAt) return 1;
        return new Date(a.lastTurnAt).getTime() - new Date(b.lastTurnAt).getTime();
      })[0];

      // Calcular novo expiresAt
      let newExpiresAt: Date | null = null;
      if (queue.responseTimeMinutes) {
        newExpiresAt = new Date(now.getTime() + queue.responseTimeMinutes * 60 * 1000);
      }

      // Criar novo assignment
      await prisma.$transaction([
        prisma.lead.update({
          where: { id: assignment.leadId },
          data: { corretorId: nextMember.userId },
        }),
        prisma.leadQueueAssignment.create({
          data: {
            queueId: queue.id,
            leadId: assignment.leadId,
            assignedToId: nextMember.userId,
            previousAssigneeId: assignment.assignedToId,
            status: "PENDING",
            expiresAt: newExpiresAt,
          },
        }),
        prisma.leadQueueMember.update({
          where: { id: nextMember.id },
          data: {
            lastTurnAt: now,
            lastLeadAt: now,
            leadsToday: { increment: 1 },
            totalLeads: { increment: 1 },
          },
        }),
        prisma.leadActivity.create({
          data: {
            leadId: assignment.leadId,
            type: "queue_reassigned",
            description: `Lead redistribuído de ${assignment.assignedToId} para ${nextMember.user.name} (timer expirado)`,
            metadata: {
              queueId: queue.id,
              previousAssigneeId: assignment.assignedToId,
              newAssigneeId: nextMember.userId,
              reason: "timer_expired",
            },
          },
        }),
      ]);

      // Notificar novo corretor
      await prisma.notification.create({
        data: {
          userId: nextMember.userId,
          type: "new_lead",
          title: queue.responseTimeMinutes
            ? `Lead redistribuído — ${queue.responseTimeMinutes}min para aceitar`
            : "Lead redistribuído para você",
          message: `Um lead foi redistribuído para você via ${queue.name}`,
          link: `/corretor/clientes/leads`,
          read: false,
        },
      });

      results.push({
        assignmentId: assignment.id,
        action: "reassigned",
        from: assignment.assignedToId,
        to: nextMember.userId,
        toName: nextMember.user.name,
      });
    }

    // Enviar alertas de "prestes a expirar" (warning)
    const warningAssignments = await prisma.leadQueueAssignment.findMany({
      where: {
        status: "PENDING",
        expiresAt: { gt: now },
      },
      include: {
        queue: true,
      },
    });

    let warnings = 0;
    for (const assignment of warningAssignments) {
      const delayRules = assignment.queue.delayRules as any;
      const warningMinutes = delayRules?.warningMinutes || 5;
      const warningTime = new Date((assignment.expiresAt as Date).getTime() - warningMinutes * 60 * 1000);

      if (now >= warningTime) {
        const minutesLeft = Math.ceil(((assignment.expiresAt as Date).getTime() - now.getTime()) / 60000);
        
        // Verificar se já notificou (evitar duplicatas)
        const alreadyWarned = await prisma.notification.findFirst({
          where: {
            userId: assignment.assignedToId,
            type: "lead_warning",
            createdAt: { gte: warningTime },
            link: { contains: assignment.leadId },
          },
        });

        if (!alreadyWarned) {
          await prisma.notification.create({
            data: {
              userId: assignment.assignedToId,
              type: "lead_warning",
              title: `⚠️ Lead expira em ${minutesLeft}min`,
              message: `Você tem ${minutesLeft} minutos para aceitar o lead`,
              link: `/corretor/clientes/leads?assignmentId=${assignment.id}`,
              read: false,
            },
          });
          warnings++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      expired: expiredAssignments.length,
      reassigned: results.filter(r => r.action === "reassigned").length,
      warnings,
      results,
    });
  } catch (error: any) {
    console.error("Erro no CRON queue-reassign:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
