import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET - Buscar banner ativo (público) ou todos (admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    if (activeOnly) {
      // Público - retorna apenas o banner ativo
      const banner = await prisma.popupBanner.findFirst({
        where: { isActive: true },
        orderBy: { updatedAt: "desc" },
      });
      return NextResponse.json({ banner });
    }

    // Admin - retorna todos
    const banners = await prisma.popupBanner.findMany({
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ banners });
  } catch (error) {
    console.error("Erro ao buscar popup banner:", error);
    return NextResponse.json(
      { error: "Erro ao buscar popup banner" },
      { status: 500 }
    );
  }
}

// POST - Criar ou atualizar banner (admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, description, imageUrl, buttonText, buttonLink, clicksToShow, isActive } = body;

    let banner;

    if (id) {
      // Atualizar existente
      banner = await prisma.popupBanner.update({
        where: { id },
        data: {
          title,
          description,
          imageUrl,
          buttonText,
          buttonLink,
          clicksToShow: clicksToShow || 10,
          isActive: isActive ?? true,
        },
      });
    } else {
      // Criar novo
      banner = await prisma.popupBanner.create({
        data: {
          title: title || "Não perca essa oportunidade!",
          description,
          imageUrl,
          buttonText: buttonText || "Saiba mais",
          buttonLink,
          clicksToShow: clicksToShow || 10,
          isActive: isActive ?? true,
        },
      });
    }

    return NextResponse.json({ banner }, { status: 201 });
  } catch (error) {
    console.error("Erro ao salvar popup banner:", error);
    return NextResponse.json(
      { error: "Erro ao salvar popup banner" },
      { status: 500 }
    );
  }
}

// DELETE - Remover banner (admin)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID não informado" }, { status: 400 });
    }

    await prisma.popupBanner.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar popup banner:", error);
    return NextResponse.json(
      { error: "Erro ao deletar popup banner" },
      { status: 500 }
    );
  }
}
