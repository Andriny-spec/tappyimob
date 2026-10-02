import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { LeadStatus } from "@prisma/client";

// Endpoint LEVE de estatísticas dos leads.
// Em vez de baixar todos os leads (com joins pesados) e contar no navegador,
// usa groupBy/aggregate no banco — rápido mesmo com milhares de leads.
// ARQUIVADO e PERDIDO ficam no "Limbo" e não entram nos contadores.
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const isCorretor = session.role === "CORRETOR";
    const { searchParams } = new URL(request.url);

    const corretorId = isCorretor ? session.id : searchParams.get("corretorId");
    // A tela filtra por NOME do corretor (é o que o select guarda). Mesmo par
    // de parâmetros que /api/admin/leads já aceita — sem isso o resumo do topo
    // zerava enquanto as colunas continuavam com dados.
    const corretorName = isCorretor ? null : searchParams.get("corretorName");
    const search = searchParams.get("search");
    const sourceIn = searchParams.getAll("sourceIn");
    const temperatureIn = searchParams.getAll("temperatureIn");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const utm = searchParams.get("utm");

    const where: any = {
      // exclui Limbo (ARQUIVADO/PERDIDO) — mesmo critério da tela
      status: { notIn: ["ARQUIVADO", "PERDIDO"] as LeadStatus[] },
    };
    if (corretorId) {
      where.corretorId = corretorId;
    } else if (corretorName) {
      where.corretor = { name: { contains: corretorName, mode: "insensitive" } };
    }
    if (sourceIn.length > 0) where.source = { in: sourceIn };
    if (temperatureIn.length > 0) where.temperature = { in: temperatureIn };
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo + "T23:59:59.999Z");
    }
    if (search) {
      where.AND = [{
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
        ],
      }];
    }
    // Mesmo critério de campanha da listagem — os contadores do topo têm que
    // bater com o que o filtro mostra no quadro.
    if (utm) {
      const contem = { contains: utm, mode: "insensitive" as const };
      where.AND = where.AND || [];
      where.AND.push({
        OR: [
          { utmSource: contem },
          { utmMedium: contem },
          { utmCampaign: contem },
          { utmContent: contem },
          { utmTerm: contem },
        ],
      });
    }

    const [grouped, budget, ids] = await Promise.all([
      prisma.lead.groupBy({ by: ["status"], where, _count: { _all: true } }),
      prisma.lead.aggregate({ where, _sum: { budget: true }, _avg: { budget: true }, _count: { budget: true } }),
      prisma.lead.findMany({ where, select: { id: true } }),
    ]);

    const counts: Record<string, number> = {};
    let total = 0;
    for (const g of grouped) {
      counts[g.status] = g._count._all;
      total += g._count._all;
    }

    return NextResponse.json({
      total,
      counts,
      ids: ids.map((i) => i.id),
      ticketTotal: budget._sum.budget || 0,
      ticketAvg: budget._avg.budget || 0,
      ticketCount: budget._count.budget || 0,
    });
  } catch (error) {
    console.error("[leads/stats]", error);
    return NextResponse.json({ error: "Erro ao calcular estatísticas" }, { status: 500 });
  }
}
