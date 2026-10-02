import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { uploadFile } from "@/lib/minio";

function getPublicUrl(objectKey: string): string {
  return `/api/storage/${objectKey}`;
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "PARCEIRO_EXTERNO") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ error: "Arquivo não fornecido" }, { status: 400 });

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Use JPEG, PNG ou WebP" }, { status: 400 });
    }
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: "Arquivo muito grande. Máximo: 15MB" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "jpg";
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const objectKey = await uploadFile(buffer, name, file.type, `partner-uploads/${session.id}`);
    return NextResponse.json({ url: getPublicUrl(objectKey) });
  } catch {
    return NextResponse.json({ error: "Erro ao fazer upload" }, { status: 500 });
  }
}
