import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyFotografoAccess } from "@/lib/fotografo-auth";

export const dynamic = "force-dynamic";

const MINIO_PUBLIC_URL = process.env.MINIO_PUBLIC_URL || "https://tappyimob.com.br/storage";

// POST /api/fotografo/galeria/finalize
// body: { storageKey, mimeType, sizeBytes, caption? }
export async function POST(request: NextRequest) {
  const user = await verifyFotografoAccess(request);
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const storageKey: string | undefined = body?.storageKey;
    const mimeType: string | undefined = body?.mimeType;
    const sizeBytes: number | undefined = body?.sizeBytes;
    const caption: string | null = body?.caption ?? null;

    if (!storageKey || typeof storageKey !== "string") {
      return NextResponse.json({ error: "storageKey obrigatório" }, { status: 400 });
    }

    const publicUrl = `${MINIO_PUBLIC_URL}/${storageKey}`;

    const photo = await prisma.tappyGalleryPhoto.create({
      data: {
        url: publicUrl,
        storageKey,
        caption,
        mimeType: mimeType || null,
        sizeBytes: sizeBytes ?? null,
        uploadedById: user.userId,
        isPublished: true,
      },
    });

    return NextResponse.json({ photo });
  } catch (err) {
    console.error("[fotografo/galeria/finalize] error:", err);
    return NextResponse.json({ error: "Erro ao finalizar upload" }, { status: 500 });
  }
}
