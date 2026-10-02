import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyLeadFromQueue, notifyLeadAssigned } from "@/lib/notifications";

// PUT - Qualificar lead e repassar para corretor/fila
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      leadId,
      name,
      phone,
      email,
      ticket,
      budget,
      minBudget,
      maxBudget,
      temperature,
      notes,
      assignToQueue,
      assignToCorretorId,
      queueId,
    } = body;

    if (!leadId) {
      return NextResponse.json({ error: "leadId é obrigatório" }, { status: 400 });
    }

    // Atualizar dados do lead
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (ticket !== undefined) updateData.ticket = ticket;
    if (budget !== undefined) updateData.budget = budget ? parseFloat(budget) : null;
    if (minBudget !== undefined) updateData.minBudget = minBudget ? parseFloat(minBudget) : null;
    if (maxBudget !== undefined) updateData.maxBudget = maxBudget ? parseFloat(maxBudget) : null;
    if (temperature !== undefined) updateData.temperature = temperature;

    const lead = await prisma.lead.update({
      where: { id: leadId },
      data: updateData,
    });

    // Adicionar nota se houver
    if (notes) {
      await prisma.leadNote.create({
        data: {
          leadId,
          content: `[SDR] ${notes}`,
        },
      });
    }

    // Registrar atividade de qualificação
    await prisma.leadActivity.create({
      data: {
        leadId,
        type: "qualified",
        description: "Lead qualificado pelo SDR",
        metadata: updateData,
      },
    });

    // Atribuir via fila automática
    if (assignToQueue) {
      try {
        const queue = queueId
          ? await prisma.leadQueue.findUnique({
              where: { id: queueId },
              include: {
                members: {
                  where: { isActive: true, isPaused: false },
                  include: { user: true },
                  orderBy: { turnOrder: "asc" },
                },
              },
            })
          : await prisma.leadQueue.findFirst({
              where: { isActive: true },
              include: {
                members: {
                  where: { isActive: true, isPaused: false },
                  include: { user: true },
                  orderBy: { turnOrder: "asc" },
                },
              },
            });

        if (queue && queue.members.length > 0) {
          const sortedMembers = [...queue.members].sort((a, b) => {
            const aTime = a.lastLeadAt?.getTime() || 0;
            const bTime = b.lastLeadAt?.getTime() || 0;
            return aTime - bTime;
          });
          const assignedMember = sortedMembers[0];

          await prisma.$transaction([
            prisma.lead.update({
              where: { id: leadId },
              data: { corretorId: assignedMember.userId, status: "CONTATADO" },
            }),
            prisma.leadQueueAssignment.create({
              data: {
                queueId: queue.id,
                leadId,
                assignedToId: assignedMember.userId,
                status: "ACCEPTED",
                acceptedAt: new Date(),
              },
            }),
            prisma.leadQueueMember.update({
              where: { id: assignedMember.id },
              data: {
                leadsToday: { increment: 1 },
                leadsThisWeek: { increment: 1 },
                totalLeads: { increment: 1 },
                lastLeadAt: new Date(),
              },
            }),
          ]);

          await prisma.leadActivity.create({
            data: {
              leadId,
              type: "queue_assignment",
              description: `Lead repassado para ${assignedMember.user.name} via rodízio`,
              metadata: {
                queueId: queue.id,
                queueName: queue.name,
                assignedToId: assignedMember.userId,
              },
            },
          });

          await notifyLeadFromQueue(assignedMember.userId, lead.name, queue.name);

          return NextResponse.json({
            lead,
            assigned: true,
            assignedTo: { id: assignedMember.userId, name: assignedMember.user.name },
            queue: { id: queue.id, name: queue.name },
          });
        }
      } catch (queueError) {
        console.error("Erro ao atribuir via fila:", queueError);
      }
    }

    // Atribuir manualmente a corretor
    if (assignToCorretorId) {
      await prisma.lead.update({
        where: { id: leadId },
        data: { corretorId: assignToCorretorId, status: "CONTATADO" },
      });

      const corretor = await prisma.user.findUnique({
        where: { id: assignToCorretorId },
        select: { name: true },
      });

      await prisma.leadActivity.create({
        data: {
          leadId,
          type: "assigned",
          description: `Lead repassado manualmente para ${corretor?.name || "corretor"} via SDR`,
        },
      });

      await notifyLeadAssigned(assignToCorretorId, lead.name, "SDR");

      return NextResponse.json({
        lead,
        assigned: true,
        assignedTo: { id: assignToCorretorId, name: corretor?.name },
      });
    }

    return NextResponse.json({ lead, assigned: false });
  } catch (error) {
    console.error("Erro ao qualificar lead:", error);
    return NextResponse.json({ error: "Erro ao qualificar lead" }, { status: 500 });
  }
}
