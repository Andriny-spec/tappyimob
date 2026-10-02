import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET - Listar observações de um imóvel
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Por enquanto, retornar array vazio até rodar a migration
    // Depois de rodar prisma db push, descomentar o código abaixo
    
    const observations = await prisma.propertyObservation.findMany({
      where: { propertyId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { isPinned: "desc" },  // Fixadas primeiro
        { createdAt: "desc" }, // Depois por data
      ],
    });

    return NextResponse.json({ observations });
  } catch (error: any) {
    console.error("Erro ao buscar observações:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar observações" },
      { status: 500 }
    );
  }
}

// POST - Criar nova observação
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    
    if (!user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Conteúdo da observação é obrigatório" },
        { status: 400 }
      );
    }

    const observation = await prisma.propertyObservation.create({
      data: {
        propertyId: id,
        userId: user.id,
        content: content.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Criar entrada no histórico (timeline)
    try {
      const property = await prisma.property.findUnique({
        where: { id },
        select: { code: true, title: true },
      });
      await prisma.propertyChangelog.create({
        data: {
          propertyId: id,
          field: "Observação",
          oldValue: null,
          newValue: content.trim().substring(0, 200),
          userId: user.id,
          userName: user.name || "Corretor",
        },
      });
    } catch (e) {
      console.error("Erro ao criar changelog da observação:", e);
    }

    // Atualizar updatedAt do imóvel
    try {
      await prisma.property.update({
        where: { id },
        data: { updatedAt: new Date() },
      });
    } catch (e) {
      console.error("Erro ao atualizar updatedAt do imóvel:", e);
    }

    console.log("Observação criada:", observation.id);
    return NextResponse.json({ observation });
  } catch (error: any) {
    console.error("Erro ao criar observação:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao criar observação" },
      { status: 500 }
    );
  }
}
