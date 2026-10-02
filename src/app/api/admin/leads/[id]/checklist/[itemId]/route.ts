import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// PATCH - Atualizar item do checklist
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id, itemId } = await params;

    const body = await request.json();
    const { completed } = body;

    const lead = await prisma.lead.findUnique({
      where: { id },
    }) as any;

    if (!lead) {
      return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
    }

    const currentItems = (lead.checklistItems as any[]) || [];
    const updatedItems = currentItems.map((item: any) =>
      item.id === itemId ? { ...item, completed } : item
    );

    await prisma.lead.update({
      where: { id },
      data: { checklistItems: updatedItems } as any,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar item:", error);
    return NextResponse.json({ error: "Erro ao atualizar item" }, { status: 500 });
  }
}

// DELETE - Remover item do checklist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id, itemId } = await params;

    const lead = await prisma.lead.findUnique({
      where: { id },
    }) as any;

    if (!lead) {
      return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
    }

    const currentItems = (lead.checklistItems as any[]) || [];
    const updatedItems = currentItems.filter((item: any) => item.id !== itemId);

    await prisma.lead.update({
      where: { id },
      data: { checklistItems: updatedItems } as any,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar item:", error);
    return NextResponse.json({ error: "Erro ao deletar item" }, { status: 500 });
  }
}
