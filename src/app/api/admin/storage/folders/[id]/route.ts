import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Detalhes da pasta
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

    const folder = await prisma.storageFolder.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, avatar: true },
        },
        parent: {
          select: { id: true, name: true },
        },
        _count: {
          select: { files: true, children: true },
        },
      },
    });

    if (!folder) {
      return NextResponse.json({ error: "Pasta não encontrada" }, { status: 404 });
    }

    return NextResponse.json(folder);
  } catch (error) {
    console.error("Erro ao buscar pasta:", error);
    return NextResponse.json({ error: "Erro ao buscar pasta" }, { status: 500 });
  }
}

// PATCH - Atualizar pasta
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
    const { name, color, icon, parentId } = body;

    const folder = await prisma.storageFolder.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(color !== undefined && { color }),
        ...(icon !== undefined && { icon }),
        ...(parentId !== undefined && { parentId }),
      },
      include: {
        createdBy: {
          select: { id: true, name: true, avatar: true },
        },
        _count: {
          select: { files: true, children: true },
        },
      },
    });

    return NextResponse.json(folder);
  } catch (error) {
    console.error("Erro ao atualizar pasta:", error);
    return NextResponse.json({ error: "Erro ao atualizar pasta" }, { status: 500 });
  }
}

// DELETE - Excluir pasta (soft delete)
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

    // Soft delete da pasta e todos os arquivos dentro
    await prisma.$transaction([
      prisma.storageFile.updateMany({
        where: { folderId: id },
        data: { isDeleted: true, deletedAt: new Date() },
      }),
      prisma.storageFolder.update({
        where: { id },
        data: { isDeleted: true, deletedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir pasta:", error);
    return NextResponse.json({ error: "Erro ao excluir pasta" }, { status: 500 });
  }
}
