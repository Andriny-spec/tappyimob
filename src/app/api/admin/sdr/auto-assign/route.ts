import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyNewLead } from "@/lib/notify-new-lead";

// POST - Auto-assign lead via rodízio (round-robin)
export async function POST(request: NextRequest) {
  try {
    const { leadId, queueId } = await request.json();

    if (!leadId) {
      return NextResponse.json({ error: "leadId é obrigatório" }, { status: 400 });
    }

    // Buscar lead
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { id: true, name: true, phone: true, email: true, corretorId: true, status: true },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
    }

    if (lead.corretorId) {
      return NextResponse.json({ assigned: false, message: "Lead já tem corretor atribuído" });
    }

    // Buscar fila ativa (específica ou primeira ativa)
    const queue = queueId
      ? await prisma.leadQueue.findUnique({
          where: { id: queueId },
          include: {
            members: {
              where: { isActive: true, isPaused: false },
              include: { user: { select: { id: true, name: true, phone: true, email: true } } },
              orderBy: { turnOrder: "asc" },
            },
          },
        })
      : await prisma.leadQueue.findFirst({
          where: { isActive: true },
          include: {
            members: {
              where: { isActive: true, isPaused: false },
              include: { user: { select: { id: true, name: true, phone: true, email: true } } },
              orderBy: { turnOrder: "asc" },
            },
          },
          orderBy: { createdAt: "asc" },
        });

    if (!queue) {
      return NextResponse.json({ assigned: false, message: "Nenhuma fila ativa encontrada" });
    }

    if (queue.members.length === 0) {
      return NextResponse.json({ assigned: false, message: "Nenhum corretor disponível na fila" });
    }

    // Filtrar membros que não excederam limites
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const availableMembers = [];
    for (const member of queue.members) {
      // Verificar pausedUntil
      if (member.pausedUntil && new Date(member.pausedUntil) > now) continue;

      // Verificar limite diário
      if (member.maxLeadsPerDay && member.leadsToday >= member.maxLeadsPerDay) continue;

      // Verificar limite de leads ativos simultâneos
      if (member.maxActiveLeads) {
        const activeCount = await prisma.lead.count({
          where: {
            corretorId: member.userId,
            archivedAt: null,
            status: { notIn: ["VENDIDO", "PERDIDO"] },
          },
        });
        if (activeCount >= member.maxActiveLeads) continue;
      }

      availableMembers.push(member);
    }

    if (availableMembers.length === 0) {
      return NextResponse.json({ assigned: false, message: "Todos os corretores atingiram seus limites" });
    }

    // Round Robin: pegar o membro com lastTurnAt mais antigo (ou null = nunca recebeu)
    let selectedMember;
    if (queue.rotationType === "WEIGHTED") {
      // Ponderado: usar peso para distribuição
      const totalWeight = availableMembers.reduce((sum, m) => sum + m.weight, 0);
      let random = Math.random() * totalWeight;
      for (const member of availableMembers) {
        random -= member.weight;
        if (random <= 0) {
          selectedMember = member;
          break;
        }
      }
      if (!selectedMember) selectedMember = availableMembers[0];
    } else {
      // Round Robin: próximo da vez
      selectedMember = availableMembers.sort((a, b) => {
        if (!a.lastTurnAt && !b.lastTurnAt) return a.turnOrder - b.turnOrder;
        if (!a.lastTurnAt) return -1;
        if (!b.lastTurnAt) return 1;
        return new Date(a.lastTurnAt).getTime() - new Date(b.lastTurnAt).getTime();
      })[0];
    }

    // Calcular expiresAt baseado no responseTimeMinutes da fila
    let expiresAt: Date | null = null;
    if (queue.responseTimeMinutes) {
      expiresAt = new Date(now.getTime() + queue.responseTimeMinutes * 60 * 1000);
    }

    // Atribuir lead ao corretor
    await prisma.$transaction([
      // Atualizar lead
      prisma.lead.update({
        where: { id: leadId },
        data: {
          corretorId: selectedMember.userId,
          lastContact: now,
        },
      }),

      // Registrar assignment
      prisma.leadQueueAssignment.create({
        data: {
          queueId: queue.id,
          leadId: leadId,
          assignedToId: selectedMember.userId,
          status: queue.responseTimeMinutes ? "PENDING" : "ACCEPTED",
          expiresAt,
        },
      }),

      // Atualizar membro da fila
      prisma.leadQueueMember.update({
        where: { id: selectedMember.id },
        data: {
          lastTurnAt: now,
          lastLeadAt: now,
          leadsToday: { increment: 1 },
          leadsThisWeek: { increment: 1 },
          totalLeads: { increment: 1 },
        },
      }),

      // Registrar atividade
      prisma.leadActivity.create({
        data: {
          leadId: leadId,
          type: "queue_assigned",
          description: `Lead atribuído via rodízio para ${selectedMember.user.name} (Fila: ${queue.name})`,
          metadata: {
            queueId: queue.id,
            queueName: queue.name,
            assignedToId: selectedMember.userId,
            assignedToName: selectedMember.user.name,
            rotationType: queue.rotationType,
            expiresAt: expiresAt?.toISOString() || null,
          },
        },
      }),
    ]);

    // Criar notificação para o corretor
    await prisma.notification.create({
      data: {
        userId: selectedMember.userId,
        type: "new_lead",
        title: queue.responseTimeMinutes
          ? `Novo lead — ${queue.responseTimeMinutes}min para aceitar`
          : "Novo lead atribuído",
        message: `${lead.name} foi atribuído a você via ${queue.name}`,
        link: `/corretor/clientes/leads?search=${encodeURIComponent(lead.name)}`,
        read: false,
      },
    });

    // Notificar via WhatsApp (non-blocking)
    notifyNewLead({
      leadId: lead.id,
      leadName: lead.name,
      leadPhone: lead.phone,
      leadEmail: lead.email,
      source: "RODIZIO",
      message: `Atribuído via fila "${queue.name}"`,
    }).catch(() => {});

    return NextResponse.json({
      assigned: true,
      assignedTo: { id: selectedMember.userId, name: selectedMember.user.name },
      queueName: queue.name,
      expiresAt: expiresAt?.toISOString() || null,
    });
  } catch (error: any) {
    console.error("Erro no auto-assign:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
