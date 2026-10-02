import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Buscar imobiliária por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const agency = await prisma.realEstateAgency.findUnique({
      where: { id },
      include: {
        partners: {
          orderBy: { name: "asc" },
        },
        visits: {
          orderBy: { visitDate: "desc" },
          take: 10,
        },
        proposals: {
          orderBy: { proposalDate: "desc" },
          take: 10,
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!agency) {
      return NextResponse.json({ error: "Imobiliária não encontrada" }, { status: 404 });
    }

    return NextResponse.json(agency);
  } catch (error) {
    console.error("Erro ao buscar imobiliária:", error);
    return NextResponse.json({ error: "Erro ao buscar imobiliária" }, { status: 500 });
  }
}

// PATCH - Atualizar imobiliária
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const agency = await prisma.realEstateAgency.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(agency);
  } catch (error) {
    console.error("Erro ao atualizar imobiliária:", error);
    return NextResponse.json({ error: "Erro ao atualizar imobiliária" }, { status: 500 });
  }
}

// DELETE - Remover imobiliária
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Desvincular corretores antes de deletar
    await prisma.businessPartner.updateMany({
      where: { agencyId: id },
      data: { agencyId: null },
    });

    await prisma.realEstateAgency.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao remover imobiliária:", error);
    return NextResponse.json({ error: "Erro ao remover imobiliária" }, { status: 500 });
  }
}
