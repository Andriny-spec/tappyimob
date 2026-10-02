import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Buscar categoria por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const category = await prisma.postCategory.findUnique({
      where: { id },
      include: {
        _count: { select: { posts: true } },
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Erro ao buscar categoria:", error);
    return NextResponse.json({ error: "Erro ao buscar categoria" }, { status: 500 });
  }
}

// PUT - Atualizar categoria
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, slug, description, color } = body;

    if (slug) {
      const existing = await prisma.postCategory.findFirst({
        where: { slug, NOT: { id } },
      });
      if (existing) {
        return NextResponse.json({ error: "Já existe uma categoria com este slug" }, { status: 400 });
      }
    }

    const category = await prisma.postCategory.update({
      where: { id },
      data: { name, slug, description, color },
      include: {
        _count: { select: { posts: true } },
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    return NextResponse.json({ error: "Erro ao atualizar categoria" }, { status: 500 });
  }
}

// DELETE - Excluir categoria
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.post.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });

    await prisma.postCategory.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Categoria excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir categoria:", error);
    return NextResponse.json({ error: "Erro ao excluir categoria" }, { status: 500 });
  }
}
