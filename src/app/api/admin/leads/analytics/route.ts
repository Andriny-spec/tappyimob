import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/admin/leads/analytics - Real analytics data for leads
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const isCorretor = session?.role === "CORRETOR";

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d";
    // Se é corretor, FORÇAR seu próprio ID
    const corretorId = isCorretor ? session.id : (searchParams.get("corretorId") || "");

    // Calculate date range
    const now = new Date();
    const daysMap: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };
    const days = daysMap[period] || 30;
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);

    const where: any = {
      createdAt: { gte: startDate },
    };
    if (corretorId) {
      where.corretorId = corretorId;
    }

    // Previous period for comparison
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - days);
    const prevWhere: any = {
      createdAt: { gte: prevStartDate, lt: startDate },
    };
    if (corretorId) {
      prevWhere.corretorId = corretorId;
    }

    // 1. Current period leads
    const currentLeads = await prisma.lead.findMany({
      where,
      select: {
        id: true,
        status: true,
        source: true,
        temperature: true,
        createdAt: true,
        updatedAt: true,
        corretor: { select: { id: true, name: true } },
        condominiumsOfInterest: true,
        searchTypologies: true,
        hasPermuta: true,
        profile: true,
        _count: {
          select: {
            scheduledVisits: true,
            linkedProperties: true,
          },
        },
      },
    });

    // 2. Previous period count for comparison
    const prevCount = await prisma.lead.count({ where: prevWhere });

    // 3. All-time status counts (for overall stats)
    const allTimeWhere: any = {};
    if (corretorId) allTimeWhere.corretorId = corretorId;

    const allLeads = await prisma.lead.findMany({
      where: { ...allTimeWhere, status: { not: "ARQUIVADO" } },
      select: { status: true },
    });

    const statusCounts = allLeads.reduce((acc: Record<string, number>, l) => {
      acc[l.status] = (acc[l.status] || 0) + 1;
      return acc;
    }, {});

    // 4. Weekly data (last 7 days breakdown)
    const weeklyData: { day: string; date: string; novos: number; convertidos: number }[] = [];
    const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);

      const dayLeads = currentLeads.filter(
        (l) => l.createdAt >= dayStart && l.createdAt < dayEnd
      );
      const dayConverted = currentLeads.filter(
        (l) =>
          l.status === "FECHADO" &&
          l.updatedAt >= dayStart &&
          l.updatedAt < dayEnd
      );

      weeklyData.push({
        day: dayNames[d.getDay()],
        date: d.toISOString().split("T")[0],
        novos: dayLeads.length,
        convertidos: dayConverted.length,
      });
    }

    // 5. Monthly trend (last 6 months)
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const monthlyTrend: { month: string; leads: number; conversoes: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const monthWhere: any = {
        createdAt: { gte: monthStart, lt: monthEnd },
      };
      if (corretorId) monthWhere.corretorId = corretorId;

      const [monthLeads, monthConversions] = await Promise.all([
        prisma.lead.count({ where: monthWhere }),
        prisma.lead.count({ where: { ...monthWhere, status: "FECHADO" } }),
      ]);

      monthlyTrend.push({
        month: monthNames[monthStart.getMonth()],
        leads: monthLeads,
        conversoes: monthConversions,
      });
    }

    // 6. Source distribution
    const sourceMap: Record<string, number> = {};
    currentLeads.forEach((l) => {
      const src = l.source || "OUTROS";
      sourceMap[src] = (sourceMap[src] || 0) + 1;
    });

    const sourceLabels: Record<string, string> = {
      SITE: "Site",
      WHATSAPP: "WhatsApp",
      INDICACAO: "Indicação",
      IMOVELWEB: "Imóvel Web",
      ZAP_IMOVEIS: "ZAP Imóveis",
      OLX: "OLX",
      INSTAGRAM: "Instagram",
      INSTAGRAM_TAPPY_ORGANICO: "Instagram Tappy",
      INSTAGRAM_TAPPY_ADS: "Instagram Ads",
      INSTAGRAM_PESSOAL_ORGANICO: "Instagram Pessoal",
      INSTAGRAM_PESSOAL_ADS: "Instagram Pessoal Ads",
      FACEBOOK: "Facebook",
      FACEBOOK_GROUPS: "Facebook Groups",
      GOOGLE_ADS: "Google Ads",
      GOOGLE: "Google",
      META_ADS: "Meta Ads",
      TELEFONE: "Telefone",
      PRESENCIAL: "Presencial",
      EMAIL: "E-mail",
      CHAVES_NA_MAO: "Chaves na Mão",
      VIVA_REAL: "Viva Real",
      MERCADO_LIVRE: "Mercado Livre",
      ATTRIA: "Attria",
      PORTAIS: "Portais",
      PLACA: "Placa",
      OPEN_HOUSE: "Open House",
      PLANTAO: "Plantão",
      EVENTO: "Evento",
      PARCERIA_CORRETOR: "Parceria Corretor",
      TIKTOK: "TikTok",
      YOUTUBE: "YouTube",
      REDES_SOCIAIS: "Redes Sociais",
      OUTROS: "Outros",
    };

    const sourceColors: Record<string, string> = {
      SITE: "#3B82F6",
      WHATSAPP: "#22C55E",
      INDICACAO: "#F59E0B",
      IMOVELWEB: "#8B5CF6",
      ZAP_IMOVEIS: "#EC4899",
      OLX: "#EF4444",
      INSTAGRAM: "#E11D48",
      INSTAGRAM_TAPPY_ORGANICO: "#E11D48",
      INSTAGRAM_TAPPY_ADS: "#BE185D",
      INSTAGRAM_PESSOAL_ORGANICO: "#F43F5E",
      INSTAGRAM_PESSOAL_ADS: "#DB2777",
      FACEBOOK: "#1D4ED8",
      FACEBOOK_GROUPS: "#2563EB",
      GOOGLE_ADS: "#059669",
      GOOGLE: "#16A34A",
      META_ADS: "#7C3AED",
      TELEFONE: "#0EA5E9",
      PRESENCIAL: "#D97706",
      EMAIL: "#6366F1",
      CHAVES_NA_MAO: "#14B8A6",
      VIVA_REAL: "#25D366",
      MERCADO_LIVRE: "#FACC15",
      ATTRIA: "#A855F7",
      PORTAIS: "#6D28D9",
      PLACA: "#78716C",
      OPEN_HOUSE: "#1EBE5A",
      PLANTAO: "#CA8A04",
      EVENTO: "#0D9488",
      PARCERIA_CORRETOR: "#4F46E5",
      TIKTOK: "#000000",
      YOUTUBE: "#DC2626",
      REDES_SOCIAIS: "#C026D3",
      OUTROS: "#6B7280",
    };

    const totalCurrentLeads = currentLeads.length;
    const sourceData = Object.entries(sourceMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([source, count]) => ({
        source: sourceLabels[source] || source,
        count,
        color: sourceColors[source] || "#6B7280",
        percent: totalCurrentLeads > 0 ? Math.round((count / totalCurrentLeads) * 100) : 0,
      }));

    // 7. KPIs
    const totalAllTime = allLeads.length;
    const fechados = statusCounts.FECHADO || 0;
    const conversionRate = totalAllTime > 0 ? Math.round((fechados / totalAllTime) * 100) : 0;
    const negociando = statusCounts.NEGOCIANDO || 0;

    // Growth comparison
    const currentCount = currentLeads.length;
    const growthPercent = prevCount > 0 ? Math.round(((currentCount - prevCount) / prevCount) * 100) : 0;

    // Average time (createdAt to updatedAt for FECHADO leads in period)
    const closedLeads = await prisma.lead.findMany({
      where: {
        status: "FECHADO",
        updatedAt: { gte: startDate },
        ...(corretorId ? { corretorId } : {}),
      },
      select: { createdAt: true, updatedAt: true },
    });

    let avgDays = 0;
    if (closedLeads.length > 0) {
      const totalDays = closedLeads.reduce((sum, l) => {
        const diff = (l.updatedAt.getTime() - l.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        return sum + diff;
      }, 0);
      avgDays = Math.round(totalDays / closedLeads.length);
    }

    // 8. Top corretores (only for admin, not filtered by corretorId)
    const topCorretores: { name: string; leads: number; conversao: number }[] = [];
    if (!corretorId) {
      const corretorStats = await prisma.lead.groupBy({
        by: ["corretorId"],
        where: {
          corretorId: { not: null },
          createdAt: { gte: startDate },
        },
        _count: { id: true },
      });

      const corretorConversions = await prisma.lead.groupBy({
        by: ["corretorId"],
        where: {
          corretorId: { not: null },
          status: "FECHADO",
          createdAt: { gte: startDate },
        },
        _count: { id: true },
      });

      const conversionMap = new Map(
        corretorConversions.map((c) => [c.corretorId, c._count.id])
      );

      const corretorIds = corretorStats
        .filter((c) => c.corretorId)
        .sort((a, b) => b._count.id - a._count.id)
        .slice(0, 5)
        .map((c) => c.corretorId!);

      if (corretorIds.length > 0) {
        const corretorNames = await prisma.user.findMany({
          where: { id: { in: corretorIds } },
          select: { id: true, name: true },
        });
        const nameMap = new Map(corretorNames.map((c) => [c.id, c.name]));

        corretorStats
          .filter((c) => corretorIds.includes(c.corretorId!))
          .sort((a, b) => b._count.id - a._count.id)
          .forEach((c) => {
            topCorretores.push({
              name: nameMap.get(c.corretorId!) || "Desconhecido",
              leads: c._count.id,
              conversao: conversionMap.get(c.corretorId!) || 0,
            });
          });
      }
    }

    // 9. Top Condomínios de interesse
    const condMap: Record<string, number> = {};
    currentLeads.forEach((l) => {
      const conds = (l.condominiumsOfInterest as any[]) || [];
      conds.forEach((c) => {
        const name = typeof c === "string" ? c : (c as any)?.name || "";
        if (name) condMap[name] = (condMap[name] || 0) + 1;
      });
    });
    const topCondominiums = Object.entries(condMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // 10. Tipologias mais buscadas
    const typMap: Record<string, number> = {};
    currentLeads.forEach((l) => {
      const typs = (l.searchTypologies as string[]) || [];
      typs.forEach((t) => {
        if (t) typMap[t] = (typMap[t] || 0) + 1;
      });
    });
    const topTypologies = Object.entries(typMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // 11. Leads com permuta
    const permutaCount = currentLeads.filter((l) => l.hasPermuta).length;

    // 12. Perfil/Finalidade
    const profileMap: Record<string, number> = {};
    currentLeads.forEach((l) => {
      const p = l.profile || "NÃO INFORMADO";
      profileMap[p] = (profileMap[p] || 0) + 1;
    });
    const profileData = Object.entries(profileMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    // 13. Leads com visita e com proposta
    const leadsWithVisit = currentLeads.filter((l) => (l._count?.scheduledVisits || 0) > 0).length;
    const leadsWithLinkedProperties = currentLeads.filter((l) => (l._count?.linkedProperties || 0) > 0).length;

    // 14b. Propostas no período
    const proposalsWhere: any = { createdAt: { gte: startDate } };
    if (corretorId) proposalsWhere.corretorId = corretorId;
    const [proposalsTotal, proposalsStatusGroups] = await Promise.all([
      prisma.propertyProposal.count({ where: proposalsWhere }),
      prisma.propertyProposal.groupBy({
        by: ["status"],
        where: proposalsWhere,
        _count: { id: true },
      }),
    ]);
    const proposalsByStatus = proposalsStatusGroups.reduce((acc: Record<string, number>, g) => {
      acc[g.status] = g._count.id;
      return acc;
    }, {});

    // 14. Temperatura distribution
    const tempMap: Record<string, number> = {};
    currentLeads.forEach((l) => {
      const t = l.temperature || "MORNO";
      tempMap[t] = (tempMap[t] || 0) + 1;
    });
    const temperatureData = Object.entries(tempMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    return NextResponse.json({
      kpis: {
        total: totalAllTime,
        currentPeriod: currentCount,
        conversionRate,
        negociando,
        avgDays,
        growthPercent,
        leadsWithVisit,
        leadsWithLinkedProperties,
        permutaCount,
      },
      statusCounts,
      weeklyData,
      monthlyTrend,
      sourceData,
      topCorretores,
      topCondominiums,
      topTypologies,
      profileData,
      temperatureData,
      proposalsStats: {
        total: proposalsTotal,
        byStatus: proposalsByStatus,
      },
    });
  } catch (error) {
    console.error("Erro ao gerar analytics:", error);
    return NextResponse.json(
      { error: "Erro ao gerar analytics" },
      { status: 500 }
    );
  }
}
