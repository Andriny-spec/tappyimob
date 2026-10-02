import { NextRequest, NextResponse } from "next/server";
import { getPresignedPutUrl } from "@/lib/minio";
import { verifyFotografoAccess } from "@/lib/fotografo-auth";

export const dynamic = "force-dynamic";

const FOLDER = "tappy-galeria";
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

// POST /api/fotografo/galeria/presign
// body: { fileName: string, mimeType: string, sizeBytes: number }
// returns: { uploadUrl: string, storageKey: string, publicUrl: string }
export async function POST(request: NextRequest) {
  const user = await verifyFotografoAccess(request);
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const fileName: string | undefined = body?.fileName;
    const mimeType: string | undefined = body?.mimeType;
    const sizeBytes: number | undefined = body?.sizeBytes;

    if (!fileName || typeof fileName !== "string") {
      return NextResponse.json({ error: "fileName obrigatório" }, { status: 400 });
    }
    // Aceita por mime image/* OU por extensão (HEIC/HEIF do iPhone às vezes vem com mime vazio)
    const ext = fileName.toLowerCase().split(".").pop() || "";
    const allowedExts = ["jpg", "jpeg", "png", "webp", "gif", "heic", "heif", "avif"];
    const isImage = (mimeType && mimeType.startsWith("image/")) || allowedExts.includes(ext);
    if (!isImage) {
      return NextResponse.json(
        { error: `Formato não suportado (${mimeType || ext || "desconhecido"})` },
        { status: 400 }
      );
    }
    if (!sizeBytes || sizeBytes > MAX_SIZE) {
      return NextResponse.json({ error: "Imagem muito grande. Máximo 50MB" }, { status: 400 });
    }

    const timestamp = Date.now();
    const cleanName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const objectKey = `${FOLDER}/${timestamp}_${cleanName}`;

    const uploadUrl = await getPresignedPutUrl(objectKey, 600);
    const MINIO_PUBLIC_URL = process.env.MINIO_PUBLIC_URL || "https://tappyimob.com.br/storage";
    const publicUrl = `${MINIO_PUBLIC_URL}/${objectKey}`;

    return NextResponse.json({ uploadUrl, storageKey: objectKey, publicUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[fotografo/galeria/presign] error:", message, err);
    return NextResponse.json(
      { error: `Erro ao gerar URL: ${message || "desconhecido"}` },
      { status: 500 }
    );
  }
}
