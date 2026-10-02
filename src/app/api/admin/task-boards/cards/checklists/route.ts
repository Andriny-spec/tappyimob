import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Criar checklist ou item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cardId, checklistId, title, text } = body;

    // Criar item de checklist
    if (checklistId) {
      const lastItem = await prisma.taskCardChecklistItem.findFirst({
        where: { checklistId },
        orderBy: { position: "desc" },
      });

      const item = await prisma.taskCardChecklistItem.create({
        data: {
          checklistId,
          text: text || "Novo item",
          position: (lastItem?.position ?? -1) + 1,
        },
      });

      return NextResponse.json({ item });
    }

    // Criar checklist
    if (cardId) {
      const lastChecklist = await prisma.taskCardChecklist.findFirst({
        where: { cardId },
        orderBy: { position: "desc" },
      });

      const checklist = await prisma.taskCardChecklist.create({
        data: {
          cardId,
          title: title || "Checklist",
          position: (lastChecklist?.position ?? -1) + 1,
        },
        include: { items: true },
      });

      return NextResponse.json({ checklist });
    }

    return NextResponse.json({ error: "cardId ou checklistId é obrigatório" }, { status: 400 });
  } catch (error) {
    console.error("Erro ao criar checklist/item:", error);
    return NextResponse.json({ error: "Erro ao criar" }, { status: 500 });
  }
}

// PUT - Atualizar checklist ou item
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, type, title, text, isCompleted } = body;

    if (!id || !type) {
      return NextResponse.json({ error: "ID e type são obrigatórios" }, { status: 400 });
    }

    if (type === "checklist") {
      const checklist = await prisma.taskCardChecklist.update({
        where: { id },
        data: { title },
        include: { items: true },
      });
      return NextResponse.json({ checklist });
    }

    if (type === "item") {
      const item = await prisma.taskCardChecklistItem.update({
        where: { id },
        data: {
          ...(text !== undefined && { text }),
          ...(isCompleted !== undefined && { isCompleted }),
        },
      });
      return NextResponse.json({ item });
    }

    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
  } catch (error) {
    console.error("Erro ao atualizar:", error);
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}

// DELETE - Deletar checklist ou item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type");

    if (!id || !type) {
      return NextResponse.json({ error: "ID e type são obrigatórios" }, { status: 400 });
    }

    if (type === "checklist") {
      await prisma.taskCardChecklist.delete({ where: { id } });
    } else if (type === "item") {
      await prisma.taskCardChecklistItem.delete({ where: { id } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar:", error);
    return NextResponse.json({ error: "Erro ao deletar" }, { status: 500 });
  }
}
