import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET - Listar tipos de imóveis configurados
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    const types = await prisma.propertyTypeCard.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ types });
  } catch (error) {
    console.error("Erro ao buscar tipos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar tipos" },
      { status: 500 }
    );
  }
}

// POST - Criar ou atualizar tipo
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { type, ...data } = body;

    // Upsert - cria ou atualiza baseado no tipo
    const typeCard = await prisma.propertyTypeCard.upsert({
      where: { type },
      update: data,
      create: { type, ...data },
    });

    return NextResponse.json({ typeCard }, { status: 201 });
  } catch (error) {
    console.error("Erro ao salvar tipo:", error);
    return NextResponse.json(
      { error: "Erro ao salvar tipo" },
      { status: 500 }
    );
  }
}
