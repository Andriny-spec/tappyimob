import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { uploadFile } from "@/lib/minio";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const FOLDER = "tappysummit";
const MINIO_PUBLIC_URL = process.env.MINIO_PUBLIC_URL || "https://tappyimob.com.br/storage";

// POST /api/admin/tappy-summit/follow-ups/upload - Upload media for follow-ups
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });
    }

    // Validate size (max 25MB for WhatsApp media)
    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Máximo 25MB para mídia WhatsApp" },
        { status: 400 }
      );
    }

    // Determine media type from MIME
    let mediaType = "document";
    if (file.type.startsWith("image/")) mediaType = "image";
    else if (file.type.startsWith("audio/")) mediaType = "audio";
    else if (file.type.startsWith("video/")) mediaType = "video";

    // Prepare buffer and unique name
    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}_${cleanName}`;

    // Upload to MinIO in tappysummit folder
    const objectKey = await uploadFile(buffer, fileName, file.type, FOLDER);

    // Build public URL
    const publicUrl = `${MINIO_PUBLIC_URL}/${objectKey}`;

    return NextResponse.json({
      url: publicUrl,
      key: objectKey,
      mediaType,
      fileName: file.name,
      size: file.size,
      mimeType: file.type,
    });
  } catch (error) {
    console.error("Erro no upload de mídia follow-up:", error);
    return NextResponse.json({ error: "Erro ao fazer upload" }, { status: 500 });
  }
}
