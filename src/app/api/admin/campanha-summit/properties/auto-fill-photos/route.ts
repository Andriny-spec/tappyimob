import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

function extractPhotoUrl(property: { thumbnail: string | null; images: unknown }): string | null {
  if (property.thumbnail) return property.thumbnail;
  const imgs = property.images;
  if (Array.isArray(imgs) && imgs.length > 0) {
    const first = imgs[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object") {
      const obj = first as Record<string, unknown>;
      const url = obj.url || obj.src || obj.path;
      if (typeof url === "string") return url;
    }
  }
  return null;
}

/**
 * POST /api/admin/campanha-summit/properties/auto-fill-photos
 * Body: { onlyMissing?: boolean, ids?: string[] }
 * - Para cada SummitCampaignProperty com referenceCode, busca Property pelo code
 *   e preenche o photoUrl com thumbnail/primeira imagem.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const onlyMissing: boolean = body.onlyMissing !== false; // default true
    const ids: string[] | undefined = Array.isArray(body.ids) ? body.ids : undefined;

    const where: Record<string, unknown> = { referenceCode: { not: null } };
    if (ids && ids.length > 0) where.id = { in: ids };
    if (onlyMissing) where.photoUrl = null;

    const summitProps = await prisma.summitCampaignProperty.findMany({
      where: where as never,
      select: { id: true, referenceCode: true, name: true, photoUrl: true },
    });

    if (summitProps.length === 0) {
      return NextResponse.json({ updated: 0, notFound: [], skipped: 0, message: "Nada para preencher" });
    }

    const codes = summitProps
      .map((p) => p.referenceCode)
      .filter((c): c is string => !!c);

    const properties = await prisma.property.findMany({
      where: { code: { in: codes } },
      select: { code: true, thumbnail: true, images: true },
    });

    const byCode = new Map<string, { thumbnail: string | null; images: unknown }>();
    for (const p of properties) byCode.set(p.code, p);

    let updated = 0;
    let skipped = 0;
    const notFound: string[] = [];

    for (const sp of summitProps) {
      if (!sp.referenceCode) continue;
      const match = byCode.get(sp.referenceCode);
      if (!match) {
        notFound.push(sp.referenceCode);
        continue;
      }
      const url = extractPhotoUrl(match);
      if (!url) {
        skipped++;
        continue;
      }
      await prisma.summitCampaignProperty.update({
        where: { id: sp.id },
        data: { photoUrl: url },
      });
      updated++;
    }

    return NextResponse.json({
      total: summitProps.length,
      updated,
      skipped,
      notFound,
    });
  } catch (error) {
    console.error("Erro auto-fill fotos:", error);
    return NextResponse.json({ error: "Erro ao preencher fotos" }, { status: 500 });
  }
}
