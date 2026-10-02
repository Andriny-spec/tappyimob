import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/campanha-summit/properties - Lista pública dos imóveis ativos
// Para cada item, calcula linkUrl: driveUrl preferencial; fallback /imovel/[slug] do acervo
export async function GET() {
  try {
    const properties = await prisma.summitCampaignProperty.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    const codes = properties
      .map((p) => p.referenceCode)
      .filter((c): c is string => !!c);

    const acervo =
      codes.length > 0
        ? await prisma.property.findMany({
            where: { code: { in: codes } },
            select: { code: true, slug: true, id: true },
          })
        : [];
    const slugByCode = new Map(acervo.map((a) => [a.code, a.slug || a.id]));

    const enriched = properties.map((p) => ({
      ...p,
      linkUrl:
        p.driveUrl ||
        (p.referenceCode && slugByCode.get(p.referenceCode)
          ? `/imovel/${slugByCode.get(p.referenceCode)}`
          : null),
    }));

    return NextResponse.json({ properties: enriched });
  } catch (error) {
    console.error("Erro ao listar imóveis da campanha:", error);
    return NextResponse.json({ error: "Erro ao carregar imóveis" }, { status: 500 });
  }
}
