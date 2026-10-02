import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Criar coluna
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { boardId, name, color } = body;

    if (!boardId) {
      return NextResponse.json({ error: "Board ID é obrigatório" }, { status: 400 });
    }

    // Pegar a última posição
    const lastColumn = await prisma.taskColumn.findFirst({
      where: { boardId },
      orderBy: { position: "desc" },
    });

    const column = await prisma.taskColumn.create({
      data: {
        boardId,
        name: name || "Nova Coluna",
        color: color || "#6b7280",
        position: (lastColumn?.position ?? -1) + 1,
      },
    });

    return NextResponse.json({ column });
  } catch (error) {
    console.error("Erro ao criar coluna:", error);
    return NextResponse.json({ error: "Erro ao criar coluna" }, { status: 500 });
  }
}

// PUT - Atualizar coluna ou reordenar
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, color, position, isArchived, reorder } = body;

    // Reordenar múltiplas colunas
    if (reorder && Array.isArray(reorder)) {
      await prisma.$transaction(
        reorder.map((item: { id: string; position: number }) =>
          prisma.taskColumn.update({
            where: { id: item.id },
            data: { position: item.position },
          })
        )
      );
      return NextResponse.json({ success: true });
    }

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    const column = await prisma.taskColumn.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(color !== undefined && { color }),
        ...(position !== undefined && { position }),
        ...(isArchived !== undefined && { isArchived }),
      },
    });

    return NextResponse.json({ column });
  } catch (error) {
    console.error("Erro ao atualizar coluna:", error);
    return NextResponse.json({ error: "Erro ao atualizar coluna" }, { status: 500 });
  }
}

// DELETE - Deletar coluna
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    await prisma.taskColumn.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar coluna:", error);
    return NextResponse.json({ error: "Erro ao deletar coluna" }, { status: 500 });
  }
}
