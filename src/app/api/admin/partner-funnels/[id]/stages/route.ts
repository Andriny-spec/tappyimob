import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Criar etapa no funil
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: funnelId } = await params;
    const body = await request.json();

    // Buscar última ordem
    const lastStage = await prisma.partnerFunnelStage.findFirst({
      where: { funnelId },
      orderBy: { order: "desc" },
    });

    const stage = await prisma.partnerFunnelStage.create({
      data: {
        funnelId,
        name: body.name,
        description: body.description,
        color: body.color || "#6b7280",
        order: body.order ?? (lastStage?.order ?? -1) + 1,
        daysToStagnate: body.daysToStagnate,
        autoMoveAfterDays: body.autoMoveAfterDays,
        autoMoveToStageId: body.autoMoveToStageId,
      },
    });

    return NextResponse.json(stage, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar etapa:", error);
    return NextResponse.json({ error: "Erro ao criar etapa" }, { status: 500 });
  }
}

// PATCH - Reordenar etapas
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: funnelId } = await params;
    const body = await request.json();
    const { stages } = body; // Array de { id, order }

    // Atualizar ordem de cada etapa
    await Promise.all(
      stages.map((stage: { id: string; order: number }) =>
        prisma.partnerFunnelStage.update({
          where: { id: stage.id },
          data: { order: stage.order },
        })
      )
    );

    // Retornar etapas atualizadas
    const updatedStages = await prisma.partnerFunnelStage.findMany({
      where: { funnelId },
      orderBy: { order: "asc" },
      include: { _count: { select: { partners: true } } },
    });

    return NextResponse.json({ stages: updatedStages });
  } catch (error) {
    console.error("Erro ao reordenar etapas:", error);
    return NextResponse.json({ error: "Erro ao reordenar etapas" }, { status: 500 });
  }
}
