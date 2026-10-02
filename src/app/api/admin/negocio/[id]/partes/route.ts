import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    const { id } = await params;
    const partes = await prisma.negocioParte.findMany({
      where: { negocioId: id },
      orderBy: [{ tipo: "asc" }, { ordem: "asc" }],
    });
    return NextResponse.json(partes);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar partes" }, { status: 500 });
  }
}

// POST — upsert de uma parte (cria ou atualiza pelo id externo)
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    const { id } = await params;
    const body = await request.json();
    const { externalId, ...data } = body;

    // Verificar se já existe parte com este negocioId + tipo + ordem
    const existente = await prisma.negocioParte.findFirst({
      where: { negocioId: id, tipo: data.tipo, ordem: data.ordem ?? 0 },
    });

    let parte;
    if (existente) {
      parte = await prisma.negocioParte.update({ where: { id: existente.id }, data });
    } else {
      parte = await prisma.negocioParte.create({ data: { negocioId: id, ...data } });
    }
    return NextResponse.json(parte, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao salvar parte" }, { status: 500 });
  }
}

// PUT — substituir todas as partes de um tipo
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    const { id } = await params;
    const partes: any[] = await request.json();

    await prisma.$transaction([
      prisma.negocioParte.deleteMany({ where: { negocioId: id } }),
      prisma.negocioParte.createMany({
        data: partes.map((p, idx) => ({ negocioId: id, ordem: idx, ...p })),
      }),
    ]);

    const result = await prisma.negocioParte.findMany({ where: { negocioId: id }, orderBy: [{ tipo: "asc" }, { ordem: "asc" }] });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar partes" }, { status: 500 });
  }
}
