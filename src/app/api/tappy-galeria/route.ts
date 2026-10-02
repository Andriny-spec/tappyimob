import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/tappy-galeria?offset=0&limit=40 — paginated public photos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = Math.max(0, parseInt(searchParams.get("offset") || "0", 10) || 0);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "40", 10) || 40));

    // Só a galeria pública principal (Summit/legado). Galerias-evento ficam fora do mosaico público.
    const where = { isPublished: true, galeriaId: null };
    const [photos, total] = await Promise.all([
      prisma.tappyGalleryPhoto.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        skip: offset,
        take: limit,
        select: {
          id: true,
          url: true,
          caption: true,
          width: true,
          height: true,
        },
      }),
      prisma.tappyGalleryPhoto.count({ where }),
    ]);

    const hasMore = offset + photos.length < total;
    return NextResponse.json({ photos, total, hasMore, nextOffset: offset + photos.length });
  } catch (err) {
    console.error("[tappy-galeria] list error:", err);
    return NextResponse.json({ error: "Erro ao carregar galeria" }, { status: 500 });
  }
}
