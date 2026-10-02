import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar boards ou buscar um específico
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const board = await prisma.taskBoard.findUnique({
        where: { id },
        include: {
          columns: {
            where: { isArchived: false },
            orderBy: { position: "asc" },
            include: {
              cards: {
                where: { isArchived: false },
                orderBy: { position: "asc" },
                include: {
                  checklists: {
                    orderBy: { position: "asc" },
                    include: {
                      items: {
                        orderBy: { position: "asc" },
                      },
                    },
                  },
                  _count: {
                    select: { comments: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!board) {
        return NextResponse.json({ error: "Board não encontrado" }, { status: 404 });
      }

      return NextResponse.json({ board });
    }

    // Listar todos os boards
    const boards = await prisma.taskBoard.findMany({
      where: { isArchived: false },
      include: {
        _count: {
          select: { columns: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ boards });
  } catch (error) {
    console.error("Erro ao buscar boards:", error);
    return NextResponse.json({ error: "Erro ao buscar boards" }, { status: 500 });
  }
}

// POST - Criar board
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, color, icon } = body;

    const board = await prisma.taskBoard.create({
      data: {
        name: name || "Novo Quadro",
        description,
        color: color || "#7c3aed",
        icon,
        columns: {
          create: [
            { name: "A Fazer", color: "#6b7280", position: 0 },
            { name: "Em Progresso", color: "#3b82f6", position: 1 },
            { name: "Concluído", color: "#22c55e", position: 2 },
          ],
        },
      },
      include: {
        columns: {
          orderBy: { position: "asc" },
        },
      },
    });

    return NextResponse.json({ board });
  } catch (error) {
    console.error("Erro ao criar board:", error);
    return NextResponse.json({ error: "Erro ao criar board" }, { status: 500 });
  }
}

// PUT - Atualizar board
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, color, icon, isArchived } = body;

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    const board = await prisma.taskBoard.update({
      where: { id },
      data: {
        name,
        description,
        color,
        icon,
        isArchived,
      },
    });

    return NextResponse.json({ board });
  } catch (error) {
    console.error("Erro ao atualizar board:", error);
    return NextResponse.json({ error: "Erro ao atualizar board" }, { status: 500 });
  }
}

// DELETE - Deletar board
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    await prisma.taskBoard.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar board:", error);
    return NextResponse.json({ error: "Erro ao deletar board" }, { status: 500 });
  }
}
