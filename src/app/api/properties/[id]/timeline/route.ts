import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Etapas padrão da timeline
const DEFAULT_STEPS = [
  { step: "fotos", title: "Fotos", description: "Fotografias profissionais do imóvel", order: 1 },
  { step: "placa", title: "Placa", description: "Placa de venda/locação instalada", order: 2 },
  { step: "reavaliacao", title: "Reavaliação", description: "Reavaliação do valor do imóvel", order: 3 },
  { step: "exclusividade", title: "Exclusividade", description: "Conseguiu contrato de exclusividade", order: 4 },
  { step: "gestao_exclusividade", title: "Gestão da Exclusividade", description: "Gerenciamento ativo da exclusividade", order: 5 },
];

// GET - Listar timeline do imóvel
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const includeRelations = {
      assignedTo: {
        select: { id: true, name: true, avatar: true }
      },
      completedByUser: {
        select: { id: true, name: true, avatar: true }
      }
    };

    // Buscar timeline existente (excluindo etapa "captacao" antiga)
    let timeline = await prisma.propertyTimeline.findMany({
      where: { propertyId: id, step: { not: "captacao" } },
      orderBy: { order: "asc" },
      include: includeRelations,
    });

    // Verificar se as etapas padrão existem (não apenas se há entradas na timeline)
    const existingSteps = timeline.map(t => t.step);
    const missingSteps = DEFAULT_STEPS.filter(s => !existingSteps.includes(s.step));

    if (missingSteps.length > 0) {
      // Remover eventuais entradas "captacao" antigas
      await prisma.propertyTimeline.deleteMany({
        where: { propertyId: id, step: "captacao" }
      });

      await prisma.propertyTimeline.createMany({
        data: missingSteps.map(step => ({
          ...step,
          propertyId: id,
          status: "PENDENTE"
        }))
      });

      timeline = await prisma.propertyTimeline.findMany({
        where: { propertyId: id, step: { not: "captacao" } },
        orderBy: { order: "asc" },
        include: includeRelations,
      });
    }

    return NextResponse.json(timeline);
  } catch (error) {
    console.error("Error fetching timeline:", error);
    return NextResponse.json({ error: "Erro ao buscar timeline" }, { status: 500 });
  }
}

// POST - Criar nova etapa ou marcar como concluída
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { timelineId, action, notes, assignedToId } = body;

    // Ação: marcar etapa como concluída
    if (action === "complete" && timelineId) {
      const stepData = await prisma.propertyTimeline.findUnique({ where: { id: timelineId } });
      const updated = await prisma.propertyTimeline.update({
        where: { id: timelineId },
        data: {
          status: "CONCLUIDO",
          completedAt: new Date(),
          completedBy: user.name || "Usuário",
          completedById: user.id,
          notes: notes || null
        }
      });

      // Se a etapa "placa" foi concluída, marcar hasPlate = true no imóvel
      if (stepData?.step === "placa") {
        const propBeforePlate = await prisma.property.findUnique({ where: { id }, select: { updatedAt: true } });
        await prisma.property.update({
          where: { id },
          data: { hasPlate: true }
        });
        if (propBeforePlate) await prisma.$executeRaw`UPDATE "properties" SET "updatedAt" = ${propBeforePlate.updatedAt} WHERE "id" = ${id}`;
      }

      return NextResponse.json(updated);
    }

    // Ação: atribuir corretor à etapa
    if (action === "assign" && timelineId && assignedToId) {
      const assignedUser = await prisma.user.findUnique({
        where: { id: assignedToId },
        select: { id: true, name: true }
      });

      const updated = await prisma.propertyTimeline.update({
        where: { id: timelineId },
        data: {
          assignedToId,
          assignedToName: assignedUser?.name || null,
          status: "EM_ANDAMENTO"
        }
      });
      return NextResponse.json(updated);
    }

    // Ação: editar etapa concluída (apenas admin)
    if (action === "edit" && timelineId) {
      if (user.role !== "ADMIN") {
        return NextResponse.json({ error: "Apenas ADMIN pode editar etapas" }, { status: 403 });
      }

      const updateData: any = {};
      if (body.notes !== undefined) updateData.notes = body.notes || null;
      if (body.completedById) {
        const completedUser = await prisma.user.findUnique({
          where: { id: body.completedById },
          select: { id: true, name: true }
        });
        if (completedUser) {
          updateData.completedById = completedUser.id;
          updateData.completedBy = completedUser.name;
        }
      }
      if (body.assignedToId !== undefined) {
        if (body.assignedToId) {
          const assignUser = await prisma.user.findUnique({
            where: { id: body.assignedToId },
            select: { id: true, name: true }
          });
          updateData.assignedToId = assignUser?.id || null;
          updateData.assignedToName = assignUser?.name || null;
        } else {
          updateData.assignedToId = null;
          updateData.assignedToName = null;
        }
      }

      const updated = await prisma.propertyTimeline.update({
        where: { id: timelineId },
        data: updateData,
        include: {
          assignedTo: { select: { id: true, name: true, avatar: true } },
          completedByUser: { select: { id: true, name: true, avatar: true } },
        },
      });
      return NextResponse.json(updated);
    }

    // Ação: criar nova etapa customizada
    if (action === "create") {
      const { step, title, description, order } = body;
      
      const newStep = await prisma.propertyTimeline.create({
        data: {
          step: step || `custom_${Date.now()}`,
          title: title || "Nova Etapa",
          description: description || null,
          order: order || 99,
          status: "PENDENTE",
          propertyId: id
        }
      });
      return NextResponse.json(newStep);
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    console.error("Error updating timeline:", error);
    return NextResponse.json({ error: "Erro ao atualizar timeline" }, { status: 500 });
  }
}

// PATCH - Desfazer etapa (apenas admin ou próprio usuário)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { timelineId, action } = body;

    if (action === "undo" && timelineId) {
      // Buscar a etapa
      const step = await prisma.propertyTimeline.findUnique({
        where: { id: timelineId }
      });

      if (!step) {
        return NextResponse.json({ error: "Etapa não encontrada" }, { status: 404 });
      }

      // Verificar permissão: apenas admin ou o próprio usuário que completou
      const isAdmin = user.role === "ADMIN";
      const isOwner = step.completedById === user.id;

      if (!isAdmin && !isOwner) {
        return NextResponse.json({ 
          error: "Apenas o ADMIN ou quem executou a ação pode desfazer" 
        }, { status: 403 });
      }

      // Desfazer a etapa
      const updated = await prisma.propertyTimeline.update({
        where: { id: timelineId },
        data: {
          status: "PENDENTE",
          completedAt: null,
          completedBy: null,
          completedById: null,
          notes: null
        }
      });

      // Se desfez a etapa "placa", desmarcar hasPlate no imóvel
      if (step.step === "placa") {
        const propBeforePlate2 = await prisma.property.findUnique({ where: { id }, select: { updatedAt: true } });
        await prisma.property.update({
          where: { id },
          data: { hasPlate: false }
        });
        if (propBeforePlate2) await prisma.$executeRaw`UPDATE "properties" SET "updatedAt" = ${propBeforePlate2.updatedAt} WHERE "id" = ${id}`;
      }

      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    console.error("Error patching timeline:", error);
    return NextResponse.json({ error: "Erro ao desfazer etapa" }, { status: 500 });
  }
}

// DELETE - Remover etapa customizada (apenas admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Apenas ADMIN pode remover etapas" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const timelineId = searchParams.get("timelineId");

    if (!timelineId) {
      return NextResponse.json({ error: "ID da etapa não informado" }, { status: 400 });
    }

    await prisma.propertyTimeline.delete({
      where: { id: timelineId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting timeline step:", error);
    return NextResponse.json({ error: "Erro ao remover etapa" }, { status: 500 });
  }
}
