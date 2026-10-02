import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/admin/leads/[id]/archive - Arquivar lead
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { reason, category = "perdido" } = await request.json();

    if (!reason) {
      return NextResponse.json(
        { error: "Motivo do arquivamento é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar lead atual para salvar status anterior
    const currentLead = await prisma.lead.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!currentLead) {
      return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
    }

    // Atualizar lead para arquivado
    const lead = await prisma.lead.update({
      where: { id },
      data: {
        status: "ARQUIVADO",
        archivedAt: new Date(),
        archivedReason: reason,
        archivedCategory: category,
        previousStatus: currentLead.status,
      },
    });

    // Registrar na timeline de atividades
    await prisma.leadActivity.create({
      data: {
        leadId: id,
        type: "archived",
        description: `Lead arquivado. Motivo: ${reason}`,
        metadata: { reason, category },
      },
    });

    return NextResponse.json(lead);
  } catch (error) {
    console.error("Erro ao arquivar lead:", error);
    return NextResponse.json(
      { error: "Erro ao arquivar lead" },
      { status: 500 }
    );
  }
}
