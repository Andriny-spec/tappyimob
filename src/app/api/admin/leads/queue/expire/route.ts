import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyLeadFromQueue, createNotification } from "@/lib/notifications";

// POST - Verificar e processar assignments expirados
export async function POST(request: NextRequest) {
  try {
    const now = new Date();

    // Buscar assignments pendentes que expiraram
    const expiredAssignments = await prisma.leadQueueAssignment.findMany({
      where: {
        status: "PENDING",
        expiresAt: { lt: now },
      },
      include: {
        queue: true,
      },
    });

    if (expiredAssignments.length === 0) {
      return NextResponse.json({ processed: 0 });
    }

    const results = [];

    for (const assignment of expiredAssignments) {
      // 1. Marcar como expirado
      await prisma.leadQueueAssignment.update({
        where: { id: assignment.id },
        data: {
          status: "EXPIRED",
          reason: "Tempo limite excedido",
        },
      });

      // 2. Notificar o corretor que perdeu o lead
      await createNotification(
        assignment.assignedToId,
        "Lead expirado",
        "Você não aceitou o lead a tempo e ele foi reatribuído",
        "lead_expired",
        "/admin/clientes/leads"
      );

      // 3. Remover corretor do lead
      await prisma.lead.update({
        where: { id: assignment.leadId },
        data: { corretorId: null },
      });

      // 4. Decrementar contadores
      const member = await prisma.leadQueueMember.findFirst({
        where: { queueId: assignment.queueId, userId: assignment.assignedToId },
      });
      if (member) {
        await prisma.leadQueueMember.update({
          where: { id: member.id },
          data: {
            leadsToday: { decrement: 1 },
            leadsThisWeek: { decrement: 1 },
            totalLeads: { decrement: 1 },
          },
        });
      }

      // 5. Registrar atividade
      await prisma.leadActivity.create({
        data: {
          leadId: assignment.leadId,
          type: "assignment_expired",
          description: `Tempo limite excedido para ${assignment.assignedToId}`,
        },
      });

      // 6. Tentar reatribuir para próximo da fila
      const nextMember = await prisma.leadQueueMember.findFirst({
        where: {
          queueId: assignment.queueId,
          isActive: true,
          isPaused: false,
          userId: { not: assignment.assignedToId },
        },
        include: { user: true },
        orderBy: { lastLeadAt: "asc" },
      });

      let reassignedTo = null;

      if (nextMember) {
        const queue = assignment.queue;
        const hasTimer = !!queue.responseTimeMinutes;
        const expiresAt = hasTimer
          ? new Date(now.getTime() + queue.responseTimeMinutes! * 60 * 1000)
          : null;

        await prisma.$transaction([
          prisma.leadQueueAssignment.create({
            data: {
              queueId: assignment.queueId,
              leadId: assignment.leadId,
              assignedToId: nextMember.userId,
              status: hasTimer ? "PENDING" : "ACCEPTED",
              acceptedAt: hasTimer ? null : now,
              expiresAt,
              previousAssigneeId: assignment.assignedToId,
            },
          }),
          prisma.lead.update({
            where: { id: assignment.leadId },
            data: { corretorId: nextMember.userId },
          }),
          prisma.leadQueueMember.update({
            where: { id: nextMember.id },
            data: {
              leadsToday: { increment: 1 },
              leadsThisWeek: { increment: 1 },
              totalLeads: { increment: 1 },
              lastLeadAt: now,
            },
          }),
        ]);

        const lead = await prisma.lead.findUnique({ where: { id: assignment.leadId } });
        await notifyLeadFromQueue(nextMember.userId, lead?.name || "Lead", queue.name);

        reassignedTo = { id: nextMember.userId, name: nextMember.user.name };
      }

      results.push({
        assignmentId: assignment.id,
        leadId: assignment.leadId,
        expiredFrom: assignment.assignedToId,
        reassignedTo,
      });
    }

    return NextResponse.json({
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error("Erro ao processar expirados:", error);
    return NextResponse.json({ error: "Erro ao processar" }, { status: 500 });
  }
}
