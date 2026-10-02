import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { uploadFile, getFileUrl } from "@/lib/minio";

const ALLOWED = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "image/jpeg",
  "image/png",
  "image/webp",
];
const MAX_SIZE = 25 * 1024 * 1024; // 25MB

// GET — lista documentos de referência da base de conhecimento
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const docs = await prisma.juridicoIaReferencia.findMany({ orderBy: { createdAt: "desc" } });
  const withUrls = await Promise.all(
    docs.map(async (d) => {
      let url = "";
      try { url = await getFileUrl(d.fileKey, 3600); } catch { /* ignore */ }
      return {
        id: d.id, fileName: d.fileName, mimeType: d.mimeType, size: d.size,
        tipoOperacao: d.tipoOperacao, uploadedByNome: d.uploadedByNome, createdAt: d.createdAt, url,
      };
    })
  );
  return NextResponse.json({ referencias: withUrls });
}

// POST — anexa um documento de referência
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const tipoOperacao = (formData.get("tipoOperacao") as string) || null;

    if (!file) return NextResponse.json({ error: "Arquivo é obrigatório" }, { status: 400 });
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Arquivo acima de 25MB" }, { status: 400 });
    }
    const mime = file.type || "application/octet-stream";
    if (!ALLOWED.includes(mime)) {
      return NextResponse.json({ error: "Formato não aceito (use PDF, DOCX ou imagem)" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^\w.\-]+/g, "_");
    const fileKey = `ia-referencias/${Date.now()}_${safeName}`;
    await uploadFile(buffer, fileKey, mime);

    const doc = await prisma.juridicoIaReferencia.create({
      data: {
        fileName: file.name,
        fileKey,
        mimeType: mime,
        size: file.size,
        tipoOperacao: tipoOperacao ? (tipoOperacao as any) : null,
        uploadedByNome: session.name,
      },
    });

    const url = await getFileUrl(fileKey, 3600).catch(() => "");
    return NextResponse.json({
      referencia: {
        id: doc.id, fileName: doc.fileName, mimeType: doc.mimeType, size: doc.size,
        tipoOperacao: doc.tipoOperacao, uploadedByNome: doc.uploadedByNome, createdAt: doc.createdAt, url,
      },
    });
  } catch (error: any) {
    console.error("[ia-config/docs] upload:", error?.message || error);
    return NextResponse.json({ error: `Erro ao anexar: ${error?.message || error}` }, { status: 500 });
  }
}
