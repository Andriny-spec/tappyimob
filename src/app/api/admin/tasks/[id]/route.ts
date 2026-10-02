import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET - Buscar tarefa específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            id: true,
            code: true,
            title: true,
            thumbnail: true,
          },
        },
        lead: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (error: any) {
    console.error("Erro ao buscar tarefa:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Atualizar tarefa
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const {
      title,
      description,
      type,
      priority,
      status,
      dueDate,
      dueTime,
      reminderDate,
      assignedToId,
      completionNotes,
    } = body;

    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);
    if (dueTime !== undefined) updateData.dueTime = dueTime;
    if (reminderDate !== undefined) updateData.reminderDate = reminderDate ? new Date(reminderDate) : null;
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId;
    if (completionNotes !== undefined) updateData.completionNotes = completionNotes;

    // Se mudou para CONCLUIDA, registrar data e quem concluiu
    if (status !== undefined) {
      updateData.status = status;
      if (status === "CONCLUIDA") {
        updateData.completedAt = new Date();
        updateData.completedById = session.id;
      } else if (status === "PENDENTE" || status === "EM_ANDAMENTO") {
        updateData.completedAt = null;
        updateData.completedById = null;
      }
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        property: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ task });
  } catch (error: any) {
    console.error("Erro ao atualizar tarefa:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Excluir tarefa
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao excluir tarefa:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
