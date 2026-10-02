import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET - Buscar documentos do imóvel
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    const documents = await prisma.propertyDocument.findUnique({
      where: { propertyId: id },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Erro ao buscar documentos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar documentos" },
      { status: 500 }
    );
  }
}

// POST - Criar/atualizar documentos do imóvel
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const {
      matriculaNumber,
      matriculaUrl,
      iptuNumber,
      iptuUrl,
      certidaoSPU,
      certidaoSPUUrl,
      otherDocuments,
    } = body;

    // Verificar se o imóvel existe
    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Imóvel não encontrado" },
        { status: 404 }
      );
    }

    // Upsert - criar ou atualizar documentos
    const documents = await prisma.propertyDocument.upsert({
      where: { propertyId: id },
      create: {
        propertyId: id,
        matriculaNumber,
        matriculaUrl,
        iptuNumber,
        iptuUrl,
        certidaoSPU,
        certidaoSPUUrl,
        otherDocuments,
      },
      update: {
        ...(matriculaNumber !== undefined && { matriculaNumber }),
        ...(matriculaUrl !== undefined && { matriculaUrl }),
        ...(iptuNumber !== undefined && { iptuNumber }),
        ...(iptuUrl !== undefined && { iptuUrl }),
        ...(certidaoSPU !== undefined && { certidaoSPU }),
        ...(certidaoSPUUrl !== undefined && { certidaoSPUUrl }),
        ...(otherDocuments !== undefined && { otherDocuments }),
      },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Erro ao salvar documentos:", error);
    return NextResponse.json(
      { error: "Erro ao salvar documentos" },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar campo específico
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Whitelist de campos permitidos para evitar erro Prisma com campos desconhecidos
    const allowedFields = new Set([
      "matriculaNumber", "matriculaUrl",
      "iptuNumber", "iptuUrl",
      "certidaoSPU", "certidaoSPUUrl",
      "otherDocuments",
    ]);
    const filteredData: Record<string, any> = {};
    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.has(key)) {
        filteredData[key] = value;
      }
    }

    if (Object.keys(filteredData).length === 0) {
      return NextResponse.json({ error: "Nenhum campo válido enviado" }, { status: 400 });
    }

    // Verificar se já existe documento para o imóvel
    const existing = await prisma.propertyDocument.findUnique({
      where: { propertyId: id },
    });

    let documents;
    if (existing) {
      documents = await prisma.propertyDocument.update({
        where: { propertyId: id },
        data: filteredData,
      });
    } else {
      documents = await prisma.propertyDocument.create({
        data: {
          propertyId: id,
          ...filteredData,
        },
      });
    }

    return NextResponse.json({ documents });
  } catch (error: any) {
    console.error("Erro ao atualizar documentos:", error?.message || error);
    return NextResponse.json(
      { error: "Erro ao atualizar documentos" },
      { status: 500 }
    );
  }
}
