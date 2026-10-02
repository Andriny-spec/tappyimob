import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Banir/Negativar lead
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { reason, bannedById } = body;

    const lead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
    }

    // Banir o lead
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        isBanned: true,
        bannedAt: new Date(),
        bannedReason: reason || "Cliente sem potencial",
        bannedById,
        previousStatus: lead.status,
        status: "ARQUIVADO",
        archivedAt: new Date(),
        archivedReason: reason || "Cliente negativado",
        archivedCategory: "banido",
      },
    });

    // Registrar atividade
    await prisma.leadActivity.create({
      data: {
        leadId: id,
        type: "banned",
        description: `Lead negativado: ${reason || "Cliente sem potencial"}`,
        metadata: { reason, bannedById },
      },
    });

    return NextResponse.json({ 
      success: true, 
      lead: updatedLead,
      message: "Lead negativado com sucesso" 
    });
  } catch (error) {
    console.error("Erro ao banir lead:", error);
    return NextResponse.json({ error: "Erro ao banir lead" }, { status: 500 });
  }
}

// DELETE - Desbanir lead (repescar do limbo)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const lead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
    }

    if (!lead.isBanned) {
      return NextResponse.json({ error: "Lead não está banido" }, { status: 400 });
    }

    // Desbanir o lead
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        isBanned: false,
        bannedAt: null,
        bannedReason: null,
        bannedById: null,
        status: (lead.previousStatus || "NOVO") as any,
        archivedAt: null,
        archivedReason: null,
        archivedCategory: null,
      },
    });

    // Registrar atividade
    await prisma.leadActivity.create({
      data: {
        leadId: id,
        type: "unbanned",
        description: "Lead reativado do limbo/negativação",
        metadata: { previousStatus: lead.previousStatus },
      },
    });

    return NextResponse.json({ 
      success: true, 
      lead: updatedLead,
      message: "Lead reativado com sucesso" 
    });
  } catch (error) {
    console.error("Erro ao desbanir lead:", error);
    return NextResponse.json({ error: "Erro ao desbanir lead" }, { status: 500 });
  }
}
