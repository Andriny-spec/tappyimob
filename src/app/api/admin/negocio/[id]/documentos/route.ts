import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { uploadFile, getFileUrl } from "@/lib/minio";
import { recalcularPendencias } from "../route";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { id } = await params;
    const documentos = await prisma.negocioDocumento.findMany({
      where: { negocioId: id },
      orderBy: { createdAt: "asc" },
    });

    // Gerar URLs de acesso para cada documento
    const docsComUrl = await Promise.all(
      documentos.map(async (doc) => {
        let url = doc.fileUrl;
        if (doc.fileKey) {
          try { url = await getFileUrl(doc.fileKey, 3600); } catch {}
        }
        return { ...doc, fileUrl: url };
      })
    );

    return NextResponse.json(docsComUrl);
  } catch (error) {
    console.error("Error fetching documentos:", error);
    return NextResponse.json({ error: "Erro ao buscar documentos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { id } = await params;

    const negocio = await prisma.negocio.findUnique({ where: { id } });
    if (!negocio) return NextResponse.json({ error: "Negócio não encontrado" }, { status: 404 });
    if (session.role === "CORRETOR" && negocio.corretorId !== session.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const tipo = formData.get("tipo") as string;
    const parteId = formData.get("parteId") as string | null;

    if (!file || !tipo) {
      return NextResponse.json({ error: "Arquivo e tipo são obrigatórios" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop() || "pdf";
    const fileKey = `juridico/${id}/${tipo}_${Date.now()}.${ext}`;

    await uploadFile(buffer, fileKey, file.type || "application/octet-stream");
    const fileUrl = await getFileUrl(fileKey, 3600);

    // Se já existe documento deste tipo para esta parte, atualiza
    const existente = await prisma.negocioDocumento.findFirst({
      where: {
        negocioId: id,
        tipo: tipo as any,
        ...(parteId ? { parteId } : { parteId: null }),
      },
    });

    let documento;
    if (existente) {
      documento = await prisma.negocioDocumento.update({
        where: { id: existente.id },
        data: {
          fileUrl,
          fileKey,
          fileName: file.name,
          status: "ENVIADO",
          dadosExtraidos: null,
          confiancaPorCampo: null,
          uploadedById: session.id,
        },
      });
    } else {
      documento = await prisma.negocioDocumento.create({
        data: {
          negocioId: id,
          tipo: tipo as any,
          parteId: parteId || null,
          fileUrl,
          fileKey,
          fileName: file.name,
          status: "ENVIADO",
          uploadedById: session.id,
        },
      });
    }

    await prisma.negocioLog.create({
      data: {
        negocioId: id,
        campo: `documento_${tipo}`,
        valorAnterior: null,
        valorNovo: file.name,
        origem: "manual",
        userId: session.id,
        userName: session.name,
      },
    });

    await recalcularPendencias(id);

    return NextResponse.json(documento, { status: 201 });
  } catch (error) {
    console.error("Error uploading documento:", error);
    return NextResponse.json({ error: "Erro ao fazer upload do documento" }, { status: 500 });
  }
}
