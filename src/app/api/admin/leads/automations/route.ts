import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar automações
export async function GET() {
  try {
    const automations = await prisma.leadAutomation.findMany({
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ automations });
  } catch (error) {
    console.error("Erro ao buscar automações:", error);
    return NextResponse.json({ error: "Erro ao buscar automações" }, { status: 500 });
  }
}

// POST - Criar automação
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, triggerType, triggerConfig, actionType, actionConfig, priority } = body;

    if (!name || !triggerType || !actionType) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    const automation = await prisma.leadAutomation.create({
      data: {
        name,
        description,
        triggerType,
        triggerConfig,
        actionType,
        actionConfig,
        priority: priority || 0,
      },
    });

    return NextResponse.json({ automation });
  } catch (error) {
    console.error("Erro ao criar automação:", error);
    return NextResponse.json({ error: "Erro ao criar automação" }, { status: 500 });
  }
}

// PUT - Atualizar automação
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, triggerType, triggerConfig, actionType, actionConfig, isActive, priority } = body;

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    const automation = await prisma.leadAutomation.update({
      where: { id },
      data: {
        name,
        description,
        triggerType,
        triggerConfig,
        actionType,
        actionConfig,
        isActive,
        priority,
      },
    });

    return NextResponse.json({ automation });
  } catch (error) {
    console.error("Erro ao atualizar automação:", error);
    return NextResponse.json({ error: "Erro ao atualizar automação" }, { status: 500 });
  }
}

// DELETE - Deletar automação
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    await prisma.leadAutomation.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar automação:", error);
    return NextResponse.json({ error: "Erro ao deletar automação" }, { status: 500 });
  }
}
