import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Ranking de corretores
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get("periodo") || "30d";

    // Calcular data de início baseado no período
    const now = new Date();
    let dateFrom: Date | null = null;
    const daysMatch = periodo.match(/^(\d+)d$/);
    if (daysMatch) {
      dateFrom = new Date(now.getTime() - parseInt(daysMatch[1]) * 24 * 60 * 60 * 1000);
    }

    // Buscar corretores ativos
    const corretores = await prisma.user.findMany({
      where: {
        role: { in: ["CORRETOR", "ADMIN"] },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        totalSales: true,
        totalValue: true,
        conversionRate: true,
        comissoes: {
          where: {
            status: "PAGO",
            ...(dateFrom ? { paidAt: { gte: dateFrom } } : {}),
          },
          select: {
            valorComissao: true,
          },
        },
        metas: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            status: true,
          },
        },
        _count: {
          select: {
            leads: true,
          },
        },
      },
      orderBy: { totalSales: "desc" },
    });

    // Buscar visitas e propostas por corretor no período
    const visitCounts = await prisma.scheduledVisit.groupBy({
      by: ["corretorId"],
      where: {
        corretorId: { not: null },
        ...(dateFrom ? { createdAt: { gte: dateFrom } } : {}),
      },
      _count: { id: true },
    });
    const visitMap = new Map(visitCounts.map((v) => [v.corretorId, v._count.id]));

    // Propostas no período - contar por proprietário do imóvel (corretor captador)
    const proposalsRaw: Array<{ ownerId: string; count: bigint }> = dateFrom
      ? await prisma.$queryRaw`
          SELECT p."ownerId" AS "ownerId", COUNT(pp.id)::bigint AS count
          FROM property_proposals pp
          INNER JOIN properties p ON pp."propertyId" = p.id
          WHERE p."ownerId" IS NOT NULL
            AND pp."createdAt" >= ${dateFrom}
          GROUP BY p."ownerId"
        `
      : await prisma.$queryRaw`
          SELECT p."ownerId" AS "ownerId", COUNT(pp.id)::bigint AS count
          FROM property_proposals pp
          INNER JOIN properties p ON pp."propertyId" = p.id
          WHERE p."ownerId" IS NOT NULL
          GROUP BY p."ownerId"
        `;
    const proposalMap = new Map(proposalsRaw.map((p) => [p.ownerId, Number(p.count)]));

    // Vendas no período (properties com soldAt dentro do intervalo e ownerId = corretor)
    const salesInPeriod = dateFrom
      ? await prisma.property.groupBy({
          by: ["ownerId"],
          where: {
            ownerId: { not: null },
            soldAt: { gte: dateFrom },
            status: "VENDIDO",
          },
          _count: { id: true },
          _sum: { soldPrice: true },
        })
      : [];
    const salesCountMap = new Map(salesInPeriod.map((s) => [s.ownerId, s._count.id]));
    const salesValueMap = new Map(salesInPeriod.map((s) => [s.ownerId, s._sum.soldPrice || 0]));

    // Calcular pontos e formatar ranking
    const ranking = corretores.map((c, index) => {
      const comissaoTotal = c.comissoes.reduce((acc, com) => acc + com.valorComissao, 0);
      const visitas = visitMap.get(c.id) || 0;
      const propostas = proposalMap.get(c.id) || 0;
      const vendasPeriodo = dateFrom ? (salesCountMap.get(c.id) || 0) : c.totalSales;
      const valorPeriodo = dateFrom ? (salesValueMap.get(c.id) || 0) : c.totalValue;

      // Sistema de pontos: vendas * 100 + valor/10000 + conversão * 50 + visitas * 10 + propostas * 30
      const pontos = Math.round(
        (vendasPeriodo * 100) +
        (valorPeriodo / 10000) +
        (c.conversionRate * 50) +
        (visitas * 10) +
        (propostas * 30)
      );

      // Badges baseados em performance
      const badges: string[] = [];
      if (c.totalSales >= 50) badges.push("Top Seller");
      if (c.metas[0]?.status === "SUPERADA") badges.push("Meta Superada");
      if (c.metas[0]?.status === "ATINGIDA") badges.push("Meta Atingida");
      if (c.conversionRate >= 30) badges.push("Alta Conversão");
      if (c.totalSales >= 100) badges.push("Veterano");

      return {
        id: c.id,
        position: index + 1,
        previousPosition: index + 1,
        name: c.name,
        avatar: c.avatar,
        vendas: vendasPeriodo,
        valorTotal: valorPeriodo,
        comissao: comissaoTotal,
        conversao: c.conversionRate,
        pontos,
        streak: 0,
        badges,
        leadsAtivos: c._count.leads,
        visitas,
        propostas,
      };
    });

    // Ordenar por pontos
    ranking.sort((a, b) => b.pontos - a.pontos);

    // Atualizar posições após ordenação
    ranking.forEach((r, i) => {
      r.position = i + 1;
    });

    return NextResponse.json(ranking);
  } catch (error) {
    console.error("Error fetching ranking:", error);
    return NextResponse.json(
      { error: "Erro ao buscar ranking" },
      { status: 500 }
    );
  }
}
