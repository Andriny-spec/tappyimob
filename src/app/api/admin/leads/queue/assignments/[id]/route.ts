import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { notifyLeadFromQueue } from "@/lib/notifications";

// PUT - Aceitar ou rejeitar assignment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded?.id) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const body = await request.json();
    const { action, reason } = body; // action: "accept" | "reject"

    if (!action || !["accept", "reject"].includes(action)) {
      return NextResponse.json({ error: "action deve ser 'accept' ou 'reject'" }, { status: 400 });
    }

    const assignment = await prisma.leadQueueAssignment.findUnique({
      where: { id },
      include: {
        queue: true,
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Atribuição não encontrada" }, { status: 404 });
    }

    if (assignment.assignedToId !== decoded.id) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    if (assignment.status !== "PENDING") {
      return NextResponse.json({ error: "Atribuição não está pendente" }, { status: 400 });
    }

    // Verificar se expirou
    if (assignment.expiresAt && new Date() > assignment.expiresAt) {
      return NextResponse.json({ error: "Tempo expirado para aceitar" }, { status: 400 });
    }

    if (action === "accept") {
      await prisma.leadQueueAssignment.update({
        where: { id },
        data: {
          status: "ACCEPTED",
          acceptedAt: new Date(),
        },
      });

      await prisma.leadActivity.create({
        data: {
          leadId: assignment.leadId,
          type: "assignment_accepted",
          description: "Corretor aceitou o lead",
        },
      });

      return NextResponse.json({ success: true, status: "ACCEPTED" });
    }

    // action === "reject"
    // 1. Marcar assignment como rejeitado
    await prisma.leadQueueAssignment.update({
      where: { id },
      data: {
        status: "REJECTED",
        rejectedAt: new Date(),
        reason: reason || "Rejeitado pelo corretor",
      },
    });

    // 2. Remover corretor do lead
    await prisma.lead.update({
      where: { id: assignment.leadId },
      data: { corretorId: null },
    });

    // 3. Decrementar contadores do membro
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

    // 4. Registrar atividade
    await prisma.leadActivity.create({
      data: {
        leadId: assignment.leadId,
        type: "assignment_rejected",
        description: `Corretor rejeitou o lead: ${reason || "Sem motivo"}`,
      },
    });

    // 5. Tentar reatribuir para próximo da fila
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

    if (nextMember) {
      const queue = assignment.queue;
      const hasTimer = !!queue.responseTimeMinutes;
      const now = new Date();
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

      return NextResponse.json({
        success: true,
        status: "REJECTED",
        reassignedTo: { id: nextMember.userId, name: nextMember.user.name },
      });
    }

    return NextResponse.json({
      success: true,
      status: "REJECTED",
      reassignedTo: null,
      message: "Nenhum corretor disponível para reatribuição",
    });
  } catch (error) {
    console.error("Erro ao processar assignment:", error);
    return NextResponse.json({ error: "Erro ao processar" }, { status: 500 });
  }
}
