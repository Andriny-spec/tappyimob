import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyLeadFromQueue } from "@/lib/notifications";

// POST - Atribuir lead via rodízio
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId, queueId, forceAssigneeId } = body;

    if (!leadId) {
      return NextResponse.json({ error: "leadId é obrigatório" }, { status: 400 });
    }

    // Buscar a fila (ou fila padrão)
    let queue;
    if (queueId) {
      queue = await prisma.leadQueue.findUnique({
        where: { id: queueId },
        include: {
          members: {
            where: { isActive: true, isPaused: false },
            include: { user: true },
            orderBy: { turnOrder: "asc" },
          },
        },
      });
    } else {
      // Buscar primeira fila ativa
      queue = await prisma.leadQueue.findFirst({
        where: { isActive: true },
        include: {
          members: {
            where: { isActive: true, isPaused: false },
            include: { user: true },
            orderBy: { turnOrder: "asc" },
          },
        },
      });
    }

    if (!queue) {
      return NextResponse.json({ error: "Nenhuma fila disponível" }, { status: 404 });
    }

    if (queue.members.length === 0) {
      return NextResponse.json({ error: "Nenhum corretor disponível na fila" }, { status: 400 });
    }

    let assignedMember;

    if (forceAssigneeId) {
      // Atribuição manual forçada
      assignedMember = queue.members.find((m) => m.userId === forceAssigneeId);
      if (!assignedMember) {
        return NextResponse.json({ error: "Corretor não está na fila" }, { status: 400 });
      }
    } else {
      // Rodízio automático
      if (queue.rotationType === "ROUND_ROBIN") {
        // Round Robin: pegar o próximo na ordem
        const sortedMembers = [...queue.members].sort((a, b) => {
          // Ordenar por última atribuição (quem não recebeu há mais tempo)
          const aTime = a.lastLeadAt?.getTime() || 0;
          const bTime = b.lastLeadAt?.getTime() || 0;
          return aTime - bTime;
        });
        assignedMember = sortedMembers[0];
      } else if (queue.rotationType === "WEIGHTED") {
        // Ponderado: usar peso para distribuição
        const totalWeight = queue.members.reduce((sum, m) => sum + m.weight, 0);
        let random = Math.random() * totalWeight;
        for (const member of queue.members) {
          random -= member.weight;
          if (random <= 0) {
            assignedMember = member;
            break;
          }
        }
      } else {
        // Manual: retornar erro pois precisa de forceAssigneeId
        return NextResponse.json({ error: "Fila manual requer forceAssigneeId" }, { status: 400 });
      }
    }

    if (!assignedMember) {
      return NextResponse.json({ error: "Não foi possível determinar corretor" }, { status: 500 });
    }

    // Verificar limites
    if (assignedMember.maxLeadsPerDay && assignedMember.leadsToday >= assignedMember.maxLeadsPerDay) {
      return NextResponse.json({ error: "Corretor atingiu limite diário" }, { status: 400 });
    }

    const hasTimer = !!queue.responseTimeMinutes;
    const now = new Date();
    const expiresAt = hasTimer
      ? new Date(now.getTime() + queue.responseTimeMinutes! * 60 * 1000)
      : null;

    // Se tem timer, o lead fica PENDING até o corretor aceitar
    // Se não tem timer, já aceita automaticamente
    const assignmentStatus = hasTimer ? "PENDING" : "ACCEPTED";

    const [assignment, lead, _] = await prisma.$transaction([
      prisma.leadQueueAssignment.create({
        data: {
          queueId: queue.id,
          leadId,
          assignedToId: assignedMember.userId,
          status: assignmentStatus,
          acceptedAt: hasTimer ? null : now,
          expiresAt,
        },
      }),
      prisma.lead.update({
        where: { id: leadId },
        data: { corretorId: assignedMember.userId },
      }),
      prisma.leadQueueMember.update({
        where: { id: assignedMember.id },
        data: {
          leadsToday: { increment: 1 },
          leadsThisWeek: { increment: 1 },
          totalLeads: { increment: 1 },
          lastLeadAt: now,
        },
      }),
    ]);

    // Registrar atividade
    await prisma.leadActivity.create({
      data: {
        leadId,
        type: "queue_assignment",
        description: hasTimer
          ? `Lead atribuído para ${assignedMember.user.name} (aguardando aceite em ${queue.responseTimeMinutes} min)`
          : `Lead atribuído para ${assignedMember.user.name} via rodízio`,
        metadata: {
          queueId: queue.id,
          queueName: queue.name,
          assignedToId: assignedMember.userId,
          assignedToName: assignedMember.user.name,
          hasTimer,
          responseTimeMinutes: queue.responseTimeMinutes,
        },
      },
    });

    await notifyLeadFromQueue(assignedMember.userId, lead.name, queue.name);

    return NextResponse.json({
      success: true,
      assignment,
      assignedTo: {
        id: assignedMember.userId,
        name: assignedMember.user.name,
      },
      pendingAcceptance: hasTimer,
      expiresAt,
    });
  } catch (error) {
    console.error("Erro ao atribuir lead:", error);
    return NextResponse.json({ error: "Erro ao atribuir lead" }, { status: 500 });
  }
}
