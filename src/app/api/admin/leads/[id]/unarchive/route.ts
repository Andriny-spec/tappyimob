import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/admin/leads/[id]/unarchive - Repescar lead (desarquivar)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Body é opcional - se não enviar, usa o status anterior
    let newStatus = "NOVO";
    let corretorId = null;
    
    try {
      const body = await request.json();
      if (body.newStatus) newStatus = body.newStatus;
      if (body.corretorId) corretorId = body.corretorId;
    } catch {
      // Body vazio - usar defaults
    }

    // Buscar lead para pegar o status anterior
    const currentLead = await prisma.lead.findUnique({
      where: { id },
      select: { previousStatus: true },
    });

    // Usar status anterior se disponível
    const finalStatus = currentLead?.previousStatus || newStatus;

    // Atualizar lead para o novo status
    const lead = await prisma.lead.update({
      where: { id },
      data: {
        status: finalStatus,
        archivedAt: null,
        archivedReason: null,
        archivedCategory: null,
        archivedById: null,
        previousStatus: null,
        ...(corretorId && { corretorId }),
      },
    });

    // Registrar na timeline de atividades
    await prisma.leadActivity.create({
      data: {
        leadId: id,
        type: "unarchived",
        description: `Lead repescado do arquivo`,
        metadata: { newStatus: finalStatus },
      },
    });

    return NextResponse.json(lead);
  } catch (error) {
    console.error("Erro ao repescar lead:", error);
    return NextResponse.json(
      { error: "Erro ao repescar lead" },
      { status: 500 }
    );
  }
}
