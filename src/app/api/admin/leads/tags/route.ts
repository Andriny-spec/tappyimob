import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar todas as tags
export async function GET() {
  try {
    const tags = await prisma.leadTag.findMany({
      where: { isActive: true },
      orderBy: [{ usageCount: "desc" }, { name: "asc" }],
    });

    return NextResponse.json({ tags });
  } catch (error) {
    console.error("Erro ao buscar tags:", error);
    return NextResponse.json({ error: "Erro ao buscar tags" }, { status: 500 });
  }
}

// POST - Criar nova tag
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, color, icon, description } = body;

    if (!name) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    // Gerar slug
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Verificar se já existe
    const existing = await prisma.leadTag.findFirst({
      where: { OR: [{ name }, { slug }] },
    });

    if (existing) {
      return NextResponse.json({ error: "Tag já existe" }, { status: 400 });
    }

    const tag = await prisma.leadTag.create({
      data: {
        name,
        slug,
        color: color || "#6B7280",
        icon,
        description,
      },
    });

    return NextResponse.json({ tag });
  } catch (error) {
    console.error("Erro ao criar tag:", error);
    return NextResponse.json({ error: "Erro ao criar tag" }, { status: 500 });
  }
}

// PUT - Atualizar tag
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, color, icon, description, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    const tag = await prisma.leadTag.update({
      where: { id },
      data: {
        name,
        color,
        icon,
        description,
        isActive,
      },
    });

    return NextResponse.json({ tag });
  } catch (error) {
    console.error("Erro ao atualizar tag:", error);
    return NextResponse.json({ error: "Erro ao atualizar tag" }, { status: 500 });
  }
}

// DELETE - Deletar tag (só se não for do sistema)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    const tag = await prisma.leadTag.findUnique({ where: { id } });

    if (!tag) {
      return NextResponse.json({ error: "Tag não encontrada" }, { status: 404 });
    }

    if (tag.isSystem) {
      return NextResponse.json({ error: "Tags do sistema não podem ser deletadas" }, { status: 403 });
    }

    await prisma.leadTag.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar tag:", error);
    return NextResponse.json({ error: "Erro ao deletar tag" }, { status: 500 });
  }
}
