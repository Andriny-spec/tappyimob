import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST - Criar pasta
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { name, parentId, color, icon } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    // Verificar se já existe pasta com mesmo nome no mesmo nível
    const existing = await prisma.storageFolder.findFirst({
      where: {
        name: name.trim(),
        parentId: parentId || null,
        isDeleted: false,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Já existe uma pasta com este nome" },
        { status: 400 }
      );
    }

    const folder = await prisma.storageFolder.create({
      data: {
        name: name.trim(),
        parentId: parentId || null,
        color: color || null,
        icon: icon || null,
        createdById: session.id,
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

    return NextResponse.json(folder, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar pasta:", error);
    return NextResponse.json({ error: "Erro ao criar pasta" }, { status: 500 });
  }
}
