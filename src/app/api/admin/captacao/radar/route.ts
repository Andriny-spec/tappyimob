import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET - Listar imóveis no radar para captação
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const assignedToId = searchParams.get("assignedToId");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const tipoImovel = searchParams.get("tipoImovel");
    const neighborhood = searchParams.get("neighborhood");
    const condominiumId = searchParams.get("condominiumId");
    const origem = searchParams.get("origem");

    const where: any = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedToId) where.assignedToId = assignedToId;
    if (tipoImovel) where.tipoImovel = tipoImovel;
    if (neighborhood) where.neighborhood = { contains: neighborhood, mode: "insensitive" };
    if (condominiumId) where.condominiumId = condominiumId;
    if (origem) where.origem = origem;
    if (search) {
      where.OR = [
        { titulo: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { neighborhood: { contains: search, mode: "insensitive" } },
        { condominio: { contains: search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      (prisma.captacaoRadar as any).findMany({
        where,
        orderBy: [
          { priority: "desc" },
          { createdAt: "desc" },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      (prisma.captacaoRadar as any).count({ where }),
    ]);

    // Estatísticas
    const stats = await (prisma.captacaoRadar as any).groupBy({
      by: ["status"],
      _count: { id: true },
    });

    const statsMap = {
      total,
      pendente: stats.find((s: any) => s.status === "PENDENTE")?._count?.id || 0,
      emCaptacao: stats.find((s: any) => s.status === "EM_CAPTACAO")?._count?.id || 0,
      captado: stats.find((s: any) => s.status === "CAPTADO")?._count?.id || 0,
      vendido: stats.find((s: any) => s.status === "VENDIDO")?._count?.id || 0,
      descartado: stats.find((s: any) => s.status === "DESCARTADO")?._count?.id || 0,
    };

    return NextResponse.json({
      items,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      stats: statsMap,
    });
  } catch (error) {
    console.error("Erro ao listar radar:", error);
    return NextResponse.json(
      { error: "Erro ao listar radar" },
      { status: 500 }
    );
  }
}

// POST - Criar novo imóvel no radar
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();

    const item = await (prisma.captacaoRadar as any).create({
      data: {
        titulo: body.titulo,
        descricao: body.descricao,
        condominio: body.condominio,
        condominiumId: body.condominiumId || null,
        condoType: body.condoType || null,
        torre: body.torre || null,
        apartamento: body.apartamento || null,
        origem: body.origem || "OUTRO",
        origemUrl: body.origemUrl,
        origemNotes: body.origemNotes,
        address: body.address,
        number: body.number,
        neighborhood: body.neighborhood,
        city: body.city || "Santana de Parnaíba",
        state: body.state || "SP",
        reference: body.reference,
        images: body.images || [],
        tipoImovel: body.tipoImovel,
        precoEstimado: body.precoEstimado,
        areaEstimada: body.areaEstimada,
        status: "PENDENTE",
        priority: body.priority || "NORMAL",
        createdById: session.user.id,
        createdByName: session.user.name,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar radar:", error);
    return NextResponse.json(
      { error: "Erro ao criar radar" },
      { status: 500 }
    );
  }
}
