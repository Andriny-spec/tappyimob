import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Buscar mapa por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const map = await (prisma as any).mindMap.findUnique({
      where: { id },
    });

    if (!map) {
      return NextResponse.json(
        { error: "Mapa não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(map);
  } catch (error) {
    console.error("Erro ao buscar mapa:", error);
    return NextResponse.json(
      { error: "Erro ao buscar mapa" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar mapa
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, data } = body;

    const map = await (prisma as any).mindMap.update({
      where: { id },
      data: {
        name,
        description,
        data,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(map);
  } catch (error) {
    console.error("Erro ao atualizar mapa:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar mapa" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir mapa
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await (prisma as any).mindMap.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir mapa:", error);
    return NextResponse.json(
      { error: "Erro ao excluir mapa" },
      { status: 500 }
    );
  }
}
