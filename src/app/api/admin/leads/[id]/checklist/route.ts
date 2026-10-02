import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET - Listar itens do checklist de um lead
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

    const lead = await prisma.lead.findUnique({
      where: { id },
    }) as any;

    if (!lead) {
      return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
    }

    // checklistItems é um campo JSON
    const items = lead.checklistItems || [];

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Erro ao buscar checklist:", error);
    return NextResponse.json({ error: "Erro ao buscar checklist" }, { status: 500 });
  }
}

// POST - Adicionar item ao checklist
export async function POST(
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
    const { item } = body;

    if (!item || !item.text) {
      return NextResponse.json(
        { error: "Item é obrigatório" },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.findUnique({
      where: { id },
    }) as any;

    if (!lead) {
      return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
    }

    const currentItems = (lead.checklistItems as any[]) || [];
    const updatedItems = [...currentItems, item];

    await prisma.lead.update({
      where: { id },
      data: { checklistItems: updatedItems } as any,
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Erro ao adicionar item:", error);
    return NextResponse.json({ error: "Erro ao adicionar item" }, { status: 500 });
  }
}
