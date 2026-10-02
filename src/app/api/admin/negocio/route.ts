import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const fase = searchParams.get("fase");
    const tipoOperacao = searchParams.get("tipoOperacao");
    const corretorId = searchParams.get("corretorId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = { arquivado: false };

    // Corretor só vê os próprios negócios
    if (session.role === "CORRETOR") {
      where.corretorId = session.id;
    } else if (corretorId) {
      where.corretorId = corretorId;
    }

    if (fase) where.fase = fase;
    if (tipoOperacao) where.tipoOperacao = tipoOperacao;
    if (startDate || endDate) {
      where.createdAt = {
        ...(startDate ? { gte: new Date(startDate) } : {}),
        ...(endDate ? { lte: new Date(`${endDate}T23:59:59`) } : {}),
      };
    }

    const [negocios, total] = await Promise.all([
      prisma.negocio.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          corretor: { select: { id: true, name: true } },
          pendencias: { where: { status: "ABERTA" }, select: { id: true, bloqueante: true } },
          _count: { select: { partes: true, documentos: true } },
        },
      }),
      prisma.negocio.count({ where }),
    ]);

    // Métricas agregadas
    const metricas = await prisma.negocio.aggregate({
      where: { ...where, fase: { notIn: ["PRONTO_ASSINATURA"] } },
      _sum: { valorTotal: true, comissaoValor: true },
      _count: { id: true },
    });

    return NextResponse.json({
      negocios,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      metricas: {
        negociosAtivos: metricas._count.id,
        vgvEmAndamento: metricas._sum.valorTotal || 0,
        comissaoTotal: metricas._sum.comissaoValor || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching negocios:", error);
    return NextResponse.json({ error: "Erro ao buscar negócios" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await request.json();

    // Gera código sequencial baseado no MAIOR código existente (não no count —
    // count quebra quando há negócios excluídos, gerando código duplicado).
    const ano = new Date().getFullYear();
    async function gerarCodigoUnico(): Promise<string> {
      const ultimo = await prisma.negocio.findFirst({
        where: { codigo: { startsWith: `NJC-${ano}-` } },
        orderBy: { codigo: "desc" },
        select: { codigo: true },
      });
      let proximo = 1;
      if (ultimo) {
        const n = parseInt(ultimo.codigo.split("-").pop() || "0", 10);
        if (Number.isFinite(n)) proximo = n + 1;
      }
      // Garante unicidade mesmo com concorrência
      for (let i = 0; i < 50; i++) {
        const cod = `NJC-${ano}-${String(proximo + i).padStart(4, "0")}`;
        const existe = await prisma.negocio.findUnique({ where: { codigo: cod }, select: { id: true } });
        if (!existe) return cod;
      }
      return `NJC-${ano}-${Date.now().toString().slice(-6)}`;
    }
    const codigo = await gerarCodigoUnico();

    const negocio = await prisma.negocio.create({
      data: {
        codigo,
        corretorId: session.role === "CORRETOR" ? session.id : (body.corretorId || session.id),
        tipoOperacao: body.tipoOperacao || "PADRAO",
        tipoNegocio: body.tipoNegocio || "VENDA",
        fase: "DADOS_RECEBIDOS",
      },
    });

    await prisma.negocioLog.create({
      data: {
        negocioId: negocio.id,
        campo: "negocio",
        valorAnterior: null,
        valorNovo: "criado",
        origem: "manual",
        userId: session.id,
        userName: session.name,
      },
    });

    return NextResponse.json(negocio, { status: 201 });
  } catch (error) {
    console.error("Error creating negocio:", error);
    return NextResponse.json({ error: "Erro ao criar negócio" }, { status: 500 });
  }
}
