import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Buscar card com detalhes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    const card = await prisma.taskCard.findUnique({
      where: { id },
      include: {
        checklists: {
          orderBy: { position: "asc" },
          include: {
            items: {
              orderBy: { position: "asc" },
            },
          },
        },
        comments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!card) {
      return NextResponse.json({ error: "Card não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ card });
  } catch (error) {
    console.error("Erro ao buscar card:", error);
    return NextResponse.json({ error: "Erro ao buscar card" }, { status: 500 });
  }
}

// POST - Criar card
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { columnId, title, description, priority, labels, color, startDate, dueDate } = body;

    if (!columnId) {
      return NextResponse.json({ error: "Column ID é obrigatório" }, { status: 400 });
    }

    // Pegar a última posição
    const lastCard = await prisma.taskCard.findFirst({
      where: { columnId },
      orderBy: { position: "desc" },
    });

    const card = await prisma.taskCard.create({
      data: {
        columnId,
        title: title || "Nova Tarefa",
        description,
        priority: priority || "MEDIUM",
        labels: labels || [],
        color,
        startDate: startDate ? new Date(startDate) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        position: (lastCard?.position ?? -1) + 1,
      },
    });

    return NextResponse.json({ card });
  } catch (error) {
    console.error("Erro ao criar card:", error);
    return NextResponse.json({ error: "Erro ao criar card" }, { status: 500 });
  }
}

// PUT - Atualizar card ou mover/reordenar
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      title,
      description,
      priority,
      status,
      labels,
      color,
      startDate,
      dueDate,
      completedAt,
      progress,
      estimatedHours,
      actualHours,
      attachments,
      assigneeIds,
      isArchived,
      columnId,
      position,
      reorder,
    } = body;

    // Reordenar múltiplos cards
    if (reorder && Array.isArray(reorder)) {
      await prisma.$transaction(
        reorder.map((item: { id: string; columnId: string; position: number }) =>
          prisma.taskCard.update({
            where: { id: item.id },
            data: { columnId: item.columnId, position: item.position },
          })
        )
      );
      return NextResponse.json({ success: true });
    }

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    const card = await prisma.taskCard.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(priority !== undefined && { priority }),
        ...(status !== undefined && { status }),
        ...(labels !== undefined && { labels }),
        ...(color !== undefined && { color }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(completedAt !== undefined && { completedAt: completedAt ? new Date(completedAt) : null }),
        ...(progress !== undefined && { progress }),
        ...(estimatedHours !== undefined && { estimatedHours }),
        ...(actualHours !== undefined && { actualHours }),
        ...(attachments !== undefined && { attachments }),
        ...(assigneeIds !== undefined && { assigneeIds }),
        ...(isArchived !== undefined && { isArchived }),
        ...(columnId !== undefined && { columnId }),
        ...(position !== undefined && { position }),
      },
      include: {
        checklists: {
          include: { items: true },
        },
      },
    });

    return NextResponse.json({ card });
  } catch (error) {
    console.error("Erro ao atualizar card:", error);
    return NextResponse.json({ error: "Erro ao atualizar card" }, { status: 500 });
  }
}

// DELETE - Deletar card
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    await prisma.taskCard.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar card:", error);
    return NextResponse.json({ error: "Erro ao deletar card" }, { status: 500 });
  }
}
