import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET - Buscar slide por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const slide = await prisma.heroSlide.findUnique({
      where: { id },
    });

    if (!slide) {
      return NextResponse.json({ error: "Slide não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ slide });
  } catch (error) {
    console.error("Erro ao buscar slide:", error);
    return NextResponse.json({ error: "Erro ao buscar slide" }, { status: 500 });
  }
}

// PUT - Atualizar slide
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const slide = await prisma.heroSlide.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ slide });
  } catch (error) {
    console.error("Erro ao atualizar slide:", error);
    return NextResponse.json({ error: "Erro ao atualizar slide" }, { status: 500 });
  }
}

// DELETE - Excluir slide
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.heroSlide.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir slide:", error);
    return NextResponse.json({ error: "Erro ao excluir slide" }, { status: 500 });
  }
}
