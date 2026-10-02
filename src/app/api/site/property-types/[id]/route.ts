import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// PUT - Atualizar tipo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const typeCard = await prisma.propertyTypeCard.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ typeCard });
  } catch (error) {
    console.error("Erro ao atualizar tipo:", error);
    return NextResponse.json({ error: "Erro ao atualizar tipo" }, { status: 500 });
  }
}

// DELETE - Excluir tipo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.propertyTypeCard.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir tipo:", error);
    return NextResponse.json({ error: "Erro ao excluir tipo" }, { status: 500 });
  }
}
