import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar condomínios públicos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type");
    const featured = searchParams.get("featured");
    const available = searchParams.get("available");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = {
      isActive: true,
    };

    // Filtrar apenas condomínios que tenham imóveis disponíveis
    if (available === "true") {
      where.properties = {
        some: { status: "DISPONIVEL" },
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { neighborhood: { contains: search, mode: "insensitive" } },
      ];
    }

    if (type) {
      where.condoType = type;
    }

    if (featured === "true") {
      where.isFeatured = true;
    }

    const condominiums = await prisma.condominium.findMany({
      where,
      orderBy: [
        { isFeatured: "desc" },
        { name: "asc" },
      ],
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        condoType: true,
        condoCategory: true,
        neighborhood: true,
        city: true,
        state: true,
        thumbnail: true,
        images: true,
        amenities: true,
        isFeatured: true,
        _count: {
          select: { properties: true },
        },
      },
    });

    const response = NextResponse.json({ condominiums });
    response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return response;
  } catch (error) {
    console.error("Erro ao buscar condomínios:", error);
    return NextResponse.json(
      { error: "Erro ao buscar condomínios" },
      { status: 500 }
    );
  }
}
