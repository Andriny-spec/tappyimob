import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Buscar parceiro por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const partner = await prisma.businessPartner.findUnique({
      where: { id },
      include: {
        agency: true,
        visits: {
          orderBy: { visitDate: "desc" },
          take: 10,
        },
        proposals: {
          orderBy: { proposalDate: "desc" },
          take: 10,
        },
        contracts: {
          orderBy: { contractDate: "desc" },
          take: 10,
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        notes: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!partner) {
      return NextResponse.json({ error: "Parceiro não encontrado" }, { status: 404 });
    }

    return NextResponse.json(partner);
  } catch (error) {
    console.error("Erro ao buscar parceiro:", error);
    return NextResponse.json({ error: "Erro ao buscar parceiro" }, { status: 500 });
  }
}

// PATCH - Atualizar parceiro
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const partner = await prisma.businessPartner.update({
      where: { id },
      data: {
        ...body,
        birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
        updatedAt: new Date(),
      },
      include: {
        agency: {
          select: {
            id: true,
            companyName: true,
            tradeName: true,
          },
        },
      },
    });

    return NextResponse.json(partner);
  } catch (error) {
    console.error("Erro ao atualizar parceiro:", error);
    return NextResponse.json({ error: "Erro ao atualizar parceiro" }, { status: 500 });
  }
}

// DELETE - Remover parceiro
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.businessPartner.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao remover parceiro:", error);
    return NextResponse.json({ error: "Erro ao remover parceiro" }, { status: 500 });
  }
}
