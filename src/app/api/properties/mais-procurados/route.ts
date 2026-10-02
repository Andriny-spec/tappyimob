import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Mesmo shape do modo fields=minimal de /api/properties, para manter
// compatibilidade com convertToCardFormat no client.
const MINIMAL_SELECT = {
  id: true,
  code: true,
  title: true,
  type: true,
  subType: true,
  category: true,
  status: true,
  saleStatus: true,
  rentalStatus: true,
  websitePublishMode: true,
  price: true,
  rentPrice: true,
  condoFee: true,
  area: true,
  totalArea: true,
  bedrooms: true,
  suites: true,
  parkingSpaces: true,
  neighborhood: true,
  city: true,
  address: true,
  thumbnail: true,
  images: true,
  isFeatured: true,
  isExclusive: true,
  isOffMarket: true,
  acceptsExchange: true,
  isFurnished: true,
  acceptsPets: true,
  rentalWarranties: true,
  landTopography: true,
  hasApprovedProject: true,
  websiteCategories: true,
  amenities: true,
  features: true,
  extras: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
  condominium: {
    select: { id: true, name: true, slug: true },
  },
} as const;

// GET - Imóveis mais vistos no site em uma janela de tempo recente (não vitalícia).
// Corrige o "Mais Procurados" da home, que antes ordenava por Property.views
// (contador acumulado desde sempre) e por isso nunca mudava.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const days = parseInt(searchParams.get("days") || "30");

    const since = new Date();
    since.setDate(since.getDate() - days);

    const propertyFilter = {
      status: "DISPONIVEL" as const,
      showOnWebsite: true,
      isOffMarket: false,
    };

    const viewsByProperty = await prisma.propertyViewLog.groupBy({
      by: ["propertyId"],
      where: {
        source: "site",
        createdAt: { gte: since },
        property: propertyFilter,
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: limit,
    });

    const rankedIds = viewsByProperty.map((v) => v.propertyId);

    // Se a janela recente não tiver imóveis suficientes (site novo, semana fraca de
    // tráfego), completa com o contador vitalício para não deixar a seção vazia.
    let fallbackIds: string[] = [];
    if (rankedIds.length < limit) {
      const fallbackProperties = await prisma.property.findMany({
        where: { ...propertyFilter, id: { notIn: rankedIds }, views: { gt: 0 } },
        orderBy: { views: "desc" },
        take: limit - rankedIds.length,
        select: { id: true },
      });
      fallbackIds = fallbackProperties.map((p) => p.id);
    }

    const orderedIds = [...rankedIds, ...fallbackIds];
    if (orderedIds.length === 0) {
      return NextResponse.json({ properties: [] });
    }

    const properties = await prisma.property.findMany({
      where: { id: { in: orderedIds } },
      select: MINIMAL_SELECT,
    });

    const byId = new Map(properties.map((p) => [p.id, p]));
    const ordered = orderedIds
      .map((id) => byId.get(id))
      .filter((p): p is NonNullable<typeof p> => !!p)
      .map((p) => ({ ...p, images: (p.images || []).slice(0, 3) }));

    const response = NextResponse.json({ properties: ordered });
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return response;
  } catch (error) {
    console.error("Erro ao buscar mais procurados:", error);
    return NextResponse.json({ properties: [] }, { status: 500 });
  }
}
