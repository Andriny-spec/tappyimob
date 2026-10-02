import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar imóveis exclusivos para parceiros (público)
export async function GET(request: NextRequest) {
  try {
    // Buscar exclusividades ativas
    const exclusives = await prisma.partnerExclusiveAccess.findMany({
      where: {
        showToPartners: true,
        OR: [
          { validUntil: null },
          { validUntil: { gte: new Date() } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    // Buscar dados dos imóveis
    const propertyIds = exclusives.map((e: any) => e.propertyId);
    const properties = await prisma.property.findMany({
      where: {
        id: { in: propertyIds },
        status: "ATIVO",
      },
      select: {
        id: true,
        code: true,
        title: true,
        price: true,
        thumbnail: true,
        images: true,
        videos: true,
        neighborhood: true,
        city: true,
        bedrooms: true,
        bathrooms: true,
        suites: true,
        parkingSpaces: true,
        area: true,
        builtArea: true,
        status: true,
        description: true,
      },
    });

    // Combinar dados e incrementar visualização
    const result = exclusives.map((exclusive: any) => ({
      ...exclusive,
      property: properties.find((p: any) => p.id === exclusive.propertyId),
    })).filter((e: any) => e.property); // Apenas os que têm imóvel ativo

    return NextResponse.json({ exclusives: result });
  } catch (error) {
    console.error("Erro ao listar exclusividades:", error);
    return NextResponse.json({ error: "Erro ao listar exclusividades" }, { status: 500 });
  }
}
