import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { uploadFile, getFileUrl } from "@/lib/minio";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const templates = await prisma.contratoTemplate.findMany({
    orderBy: { tipoOperacao: "asc" },
  });

  // Refresh presigned URLs
  const withUrls = await Promise.all(
    templates.map(async (t) => {
      let url = t.docxUrl;
      if (t.docxKey) {
        try { url = await getFileUrl(t.docxKey, 3600); } catch { /* keep existing */ }
      }
      return { ...t, docxUrl: url };
    })
  );

  return NextResponse.json({ templates: withUrls });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const tipoOperacao = formData.get("tipoOperacao") as string;

    if (!file || !tipoOperacao) {
      return NextResponse.json({ error: "Arquivo e tipoOperacao são obrigatórios" }, { status: 400 });
    }

    if (!file.name.endsWith(".docx")) {
      return NextResponse.json({ error: "Apenas arquivos .docx são aceitos" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const docxKey = `templates/negocio/${tipoOperacao.toLowerCase()}_${Date.now()}.docx`;

    await uploadFile(buffer, docxKey, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    const docxUrl = await getFileUrl(docxKey, 3600);

    const template = await prisma.contratoTemplate.upsert({
      where: { tipoOperacao: tipoOperacao as any },
      update: {
        docxKey,
        docxUrl,
        ativo: true,
        uploadedById: session.id,
        uploadedByNome: session.name,
      },
      create: {
        tipoOperacao: tipoOperacao as any,
        docxKey,
        docxUrl,
        ativo: true,
        uploadedById: session.id,
        uploadedByNome: session.name,
      },
    });

    return NextResponse.json({ template });
  } catch (error: any) {
    console.error("Error uploading template:", error);
    return NextResponse.json({ error: `Erro ao enviar template: ${error.message}` }, { status: 500 });
  }
}
