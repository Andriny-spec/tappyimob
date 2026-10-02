import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notifyLeadFromQueue, notifyLeadAssigned } from "@/lib/notifications";
import { detectDuplicatesForLead } from "@/lib/detect-duplicates";

// GET - Listar leads para recepção SDR (sem corretor atribuído ou leads novos)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "NOVO";
    const onlyUnassigned = searchParams.get("unassigned") === "true";

    const where: any = {
      status,
    };

    if (onlyUnassigned) {
      where.corretorId = null;
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          corretor: {
            select: { id: true, name: true, avatar: true },
          },
          notes: {
            orderBy: { createdAt: "desc" },
            take: 3,
          },
        },
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({ leads, total });
  } catch (error) {
    console.error("Erro ao buscar leads SDR:", error);
    return NextResponse.json({ error: "Erro ao buscar leads" }, { status: 500 });
  }
}

// POST - Criar novo lead via SDR (recepção manual)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();
    const {
      name,
      phone,
      email,
      source,
      ticket,
      budget,
      minBudget,
      maxBudget,
      notes,
      temperature,
      assignToQueue,
      assignToCorretorId,
      queueId,
    } = body;

    if (!name) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    // Criar lead
    const lead = await prisma.lead.create({
      data: {
        name,
        phone: phone || null,
        email: email || null,
        source: source || "PRESENCIAL",
        ...(ticket ? { ticket } : {}),
        budget: budget ? parseFloat(budget) : null,
        minBudget: minBudget ? parseFloat(minBudget) : null,
        maxBudget: maxBudget ? parseFloat(maxBudget) : null,
        temperature: temperature || "MORNO",
        status: "NOVO",
        createdById: session?.id || null,
      },
    });

    // Registrar observação inicial se houver
    if (notes) {
      await prisma.leadNote.create({
        data: {
          leadId: lead.id,
          content: `[SDR] ${notes}`,
        },
      });
    }

    // Registrar atividade
    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        type: "created",
        description: "Lead criado via recepção SDR",
      },
    });

    // Detectar duplicados automaticamente (non-blocking)
    detectDuplicatesForLead(lead.id).catch(() => {});

    // Se deve atribuir via fila automática
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
          // Round robin: pegar quem recebeu há mais tempo
          const sortedMembers = [...queue.members].sort((a, b) => {
            const aTime = a.lastLeadAt?.getTime() || 0;
            const bTime = b.lastLeadAt?.getTime() || 0;
            return aTime - bTime;
          });
          const assignedMember = sortedMembers[0];

          await prisma.$transaction([
            prisma.lead.update({
              where: { id: lead.id },
              data: { corretorId: assignedMember.userId, status: "CONTATADO" },
            }),
            prisma.leadQueueAssignment.create({
              data: {
                queueId: queue.id,
                leadId: lead.id,
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
              leadId: lead.id,
              type: "queue_assignment",
              description: `Lead atribuído para ${assignedMember.user.name} via rodízio SDR`,
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
          });
        }
      } catch (queueError) {
        console.error("Erro ao atribuir via fila:", queueError);
      }
    }

    // Se deve atribuir manualmente a um corretor
    if (assignToCorretorId) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: { corretorId: assignToCorretorId, status: "CONTATADO" },
      });

      const corretor = await prisma.user.findUnique({
        where: { id: assignToCorretorId },
        select: { name: true },
      });

      await prisma.leadActivity.create({
        data: {
          leadId: lead.id,
          type: "assigned",
          description: `Lead atribuído manualmente para ${corretor?.name || "corretor"} via SDR`,
        },
      });

      await notifyLeadAssigned(assignToCorretorId, lead.name, "SDR");

      return NextResponse.json({ lead, assigned: true, assignedTo: { id: assignToCorretorId, name: corretor?.name } });
    }

    return NextResponse.json({ lead, assigned: false });
  } catch (error) {
    console.error("Erro ao criar lead SDR:", error);
    return NextResponse.json({ error: "Erro ao criar lead" }, { status: 500 });
  }
}

// DELETE - Excluir leads em massa
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadIds } = body;

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ error: "IDs dos leads são obrigatórios" }, { status: 400 });
    }

    // Deletar registros relacionados que não têm onDelete: Cascade
    await prisma.$transaction([
      prisma.leadQueueAssignment.deleteMany({ where: { leadId: { in: leadIds } } }),
      prisma.leadFollowUp.deleteMany({ where: { leadId: { in: leadIds } } }),
      prisma.leadDuplicate.deleteMany({ where: { OR: [{ leadId1: { in: leadIds } }, { leadId2: { in: leadIds } }] } }),
      prisma.leadAutomationLog.deleteMany({ where: { leadId: { in: leadIds } } }),
      prisma.leadEnrichment.deleteMany({ where: { leadId: { in: leadIds } } }),
      prisma.leadProperty.deleteMany({ where: { leadId: { in: leadIds } } }),
      prisma.lead.deleteMany({ where: { id: { in: leadIds } } }),
    ]);

    return NextResponse.json({ success: true, deleted: leadIds.length });
  } catch (error) {
    console.error("Erro ao excluir leads SDR:", error);
    return NextResponse.json({ error: "Erro ao excluir leads" }, { status: 500 });
  }
}
