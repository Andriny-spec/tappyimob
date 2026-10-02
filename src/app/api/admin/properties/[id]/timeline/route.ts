import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Etapas padrão da timeline (com vinculação de corretor)
const DEFAULT_TIMELINE_STEPS = [
  { step: "fotos", title: "Fotos Profissionais", description: "Sessão de fotos profissionais realizada (vincular corretor que agendou)", order: 1 },
  { step: "placa", title: "Fixação Placa", description: "Instalação de placa no imóvel (vincular corretor)", order: 2 },
  { step: "reavaliacao", title: "Reavaliação", description: "Reavaliação de preço do imóvel (vincular corretor)", order: 3 },
  { step: "exclusividade", title: "Exclusividade", description: "Contrato de exclusividade firmado (vincular corretor)", order: 4 },
  { step: "gestao_exclusividade", title: "Gestão da Exclusividade", description: "Acompanhamento da exclusividade (vincular corretor)", order: 5 },
];

// GET - Buscar timeline do imóvel
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Buscar timeline existente com corretor vinculado
    let timeline = await (prisma.propertyTimeline.findMany as any)({
      where: { propertyId: id },
      orderBy: { order: "asc" },
      include: {
        assignedTo: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    // Se não existe, criar timeline padrão
    if (timeline.length === 0) {
      await prisma.propertyTimeline.createMany({
        data: DEFAULT_TIMELINE_STEPS.map((step) => ({
          ...step,
          propertyId: id,
          status: "PENDENTE",
        })),
      });

      timeline = await prisma.propertyTimeline.findMany({
        where: { propertyId: id },
        orderBy: { order: "asc" },
      });
    }

    // Filtrar etapa "captacao" de timelines antigas
    timeline = timeline.filter((t: any) => t.step !== "captacao");

    // Calcular progresso
    const completed = timeline.filter((t: any) => t.status === "CONCLUIDO").length;
    const total = timeline.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return NextResponse.json({
      timeline,
      progress,
      completed,
      total,
    });
  } catch (error) {
    console.error("Erro ao buscar timeline:", error);
    return NextResponse.json(
      { error: "Erro ao buscar timeline" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar etapa da timeline
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { stepId, status, notes, completedBy, assignedToId, assignedToName } = body;

    // Buscar etapa antes de atualizar para verificar o step
    const existingStep = await prisma.propertyTimeline.findUnique({
      where: { id: stepId },
    });

    const timeline = await (prisma.propertyTimeline.update as any)({
      where: { id: stepId },
      data: {
        status,
        notes,
        completedBy,
        completedAt: status === "CONCLUIDO" ? new Date() : null,
        assignedToId: assignedToId || null,
        assignedToName: assignedToName || null,
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    // Linkar etapa "placa" com campo hasPlate do imóvel
    if (existingStep?.step === "placa") {
      const propBeforePlateAdmin = await prisma.property.findUnique({ where: { id }, select: { updatedAt: true } });
      await prisma.property.update({
        where: { id },
        data: { hasPlate: status === "CONCLUIDO" },
      });
      if (propBeforePlateAdmin) await prisma.$executeRaw`UPDATE "properties" SET "updatedAt" = ${propBeforePlateAdmin.updatedAt} WHERE "id" = ${id}`;
    }

    return NextResponse.json({ timeline });
  } catch (error) {
    console.error("Erro ao atualizar timeline:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar timeline" },
      { status: 500 }
    );
  }
}
