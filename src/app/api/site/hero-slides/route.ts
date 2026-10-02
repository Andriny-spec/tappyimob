import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET - Listar slides (público para o site, completo para admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    const slides = await prisma.heroSlide.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ slides });
  } catch (error) {
    console.error("Erro ao buscar slides:", error);
    return NextResponse.json(
      { error: "Erro ao buscar slides" },
      { status: 500 }
    );
  }
}

// POST - Criar slide (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();

    // Pegar a maior ordem atual
    const lastSlide = await prisma.heroSlide.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const slide = await prisma.heroSlide.create({
      data: {
        ...body,
        order: (lastSlide?.order || 0) + 1,
      },
    });

    return NextResponse.json({ slide }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar slide:", error);
    return NextResponse.json(
      { error: "Erro ao criar slide" },
      { status: 500 }
    );
  }
}
