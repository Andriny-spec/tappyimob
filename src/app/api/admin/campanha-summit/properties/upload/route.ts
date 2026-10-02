import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { uploadFile } from "@/lib/minio";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const FOLDER = "campanha-summit-imoveis";
const MINIO_PUBLIC_URL =
  process.env.MINIO_PUBLIC_URL || "https://tappyimob.com.br/storage";

// POST /api/admin/campanha-summit/properties/upload - Upload da foto do imóvel
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

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Arquivo deve ser uma imagem" }, { status: 400 });
    }

    const maxSize = 15 * 1024 * 1024; // 15MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "Imagem muito grande (max 15MB)" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}_${cleanName}`;

    const objectKey = await uploadFile(buffer, fileName, file.type, FOLDER);
    const publicUrl = `${MINIO_PUBLIC_URL}/${objectKey}`;

    return NextResponse.json({
      url: publicUrl,
      key: objectKey,
      fileName: file.name,
      size: file.size,
    });
  } catch (error) {
    console.error("Erro no upload de foto da campanha:", error);
    return NextResponse.json({ error: "Erro no upload" }, { status: 500 });
  }
}
