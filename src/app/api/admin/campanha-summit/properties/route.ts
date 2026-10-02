import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET - Lista todos os imóveis da campanha (admin)
export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const properties = await prisma.summitCampaignProperty.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ properties });
  } catch (error) {
    console.error("Erro ao listar imóveis:", error);
    return NextResponse.json({ error: "Erro ao listar" }, { status: 500 });
  }
}

// POST - Criar imóvel
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await request.json();
    if (!body.name?.trim() || !body.price?.trim() || !body.bonus?.trim()) {
      return NextResponse.json({ error: "Nome, preço e bônus são obrigatórios" }, { status: 400 });
    }

    const last = await prisma.summitCampaignProperty.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const property = await prisma.summitCampaignProperty.create({
      data: {
        name: body.name.trim(),
        referenceCode: body.referenceCode?.trim() || null,
        price: body.price.trim(),
        bonus: body.bonus.trim(),
        bonusIcon: body.bonusIcon || "plane",
        specs: body.specs?.trim() || null,
        photoUrl: body.photoUrl || null,
        driveUrl: body.driveUrl || null,
        highlight: !!body.highlight,
        isActive: body.isActive !== false,
        sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : (last?.sortOrder ?? -1) + 1,
      },
    });

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar imóvel:", error);
    return NextResponse.json({ error: "Erro ao criar" }, { status: 500 });
  }
}
