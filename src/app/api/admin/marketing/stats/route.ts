import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// Sources de Lead agrupadas por canal — usado pelas telas de Facebook/Instagram/Google.
export const CHANNEL_SOURCES: Record<string, string[]> = {
  facebook: ["FACEBOOK", "FACEBOOK_GROUPS", "META_ADS"],
  instagram: [
    "INSTAGRAM",
    "INSTAGRAM_TAPPY_ORGANICO",
    "INSTAGRAM_TAPPY_ADS",
    "INSTAGRAM_PESSOAL_ORGANICO",
    "INSTAGRAM_PESSOAL_ADS",
  ],
  google: ["GOOGLE", "GOOGLE_ADS"],
};

const SOURCE_LABELS: Record<string, string> = {
  SITE: "Site", WHATSAPP: "WhatsApp", INDICACAO: "Indicação", PORTAIS: "Portais",
  REDES_SOCIAIS: "Redes Sociais", TELEFONE: "Telefone", PRESENCIAL: "Presencial",
  OUTROS: "Outros", EMAIL: "E-mail", INSTAGRAM: "Instagram", FACEBOOK: "Facebook",
  TIKTOK: "TikTok", YOUTUBE: "YouTube", GOOGLE_ADS: "Google Ads", META_ADS: "Meta Ads",
  OLX: "OLX", ZAP_IMOVEIS: "ZAP Imóveis", VIVA_REAL: "Viva Real", IMOVELWEB: "Imóvel Web",
  CHAVES_NA_MAO: "Chaves na Mão", PLACA: "Placa", PLANTAO: "Plantão", EVENTO: "Evento",
  MERCADO_LIVRE: "Mercado Livre", ATTRIA: "Attria",
  INSTAGRAM_TAPPY_ORGANICO: "Instagram Tappy (Orgânico)", INSTAGRAM_TAPPY_ADS: "Instagram Tappy (Ads)",
  INSTAGRAM_PESSOAL_ORGANICO: "Instagram Pessoal (Orgânico)", INSTAGRAM_PESSOAL_ADS: "Instagram Pessoal (Ads)",
  FACEBOOK_GROUPS: "Grupos Facebook", GOOGLE: "Google", PARCERIA_CORRETOR: "Parceria Corretor",
  OPEN_HOUSE: "Open House", OFF_MARKET: "Off Market", AVALIACAO: "Avaliação", CAPTACAO: "Captação",
};

const STATUS_LABELS: Record<string, string> = {
  NOVO: "Novo", CONTATADO: "Contatado", QUALIFICADO: "Qualificado",
  NEGOCIANDO: "Negociando", FECHADO: "Fechado", PERDIDO: "Perdido", ARQUIVADO: "Arquivado",
};

// GET - Estatísticas de marketing (leads por origem/dia/status + views de imóveis)
// Um único endpoint alimenta as telas Analytics/Facebook/Instagram/Google/Insights —
// cada tela filtra o recorte de `leadsBySource` que interessa no client.
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "MARKETING")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d";
    const daysMap: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };
    const days = daysMap[period] || 30;

    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);

    const [leadsInPeriod, allLeadsBySourceRaw, leadsByStatusRaw, viewsInPeriod, totalViewsAllTime] = await Promise.all([
      prisma.lead.findMany({
        where: { createdAt: { gte: startDate } },
        select: { source: true, status: true, createdAt: true, condominiumsOfInterest: true, searchTypologies: true, temperature: true, profile: true },
      }),
      prisma.lead.groupBy({ by: ["source"], where: { createdAt: { gte: startDate } }, _count: { id: true } }),
      prisma.lead.groupBy({ by: ["status"], where: { createdAt: { gte: startDate } }, _count: { id: true } }),
      prisma.propertyViewLog.count({ where: { createdAt: { gte: startDate }, source: "site" } }),
      prisma.propertyViewLog.count({ where: { source: "site" } }),
    ]);

    const totalLeads = leadsInPeriod.length;

    const leadsBySource = allLeadsBySourceRaw
      .map((g) => ({
        source: g.source,
        label: SOURCE_LABELS[g.source] || g.source,
        count: g._count.id,
        percent: totalLeads > 0 ? Math.round((g._count.id / totalLeads) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const leadsByStatus = leadsByStatusRaw
      .map((g) => ({ status: g.status, label: STATUS_LABELS[g.status] || g.status, count: g._count.id }))
      .sort((a, b) => b.count - a.count);

    // Série diária (últimos N dias) — total e por canal (facebook/instagram/google)
    const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const leadsByDay: { date: string; day: string; total: number; facebook: number; instagram: number; google: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
      const dayLeads = leadsInPeriod.filter((l) => l.createdAt >= dayStart && l.createdAt < dayEnd);
      leadsByDay.push({
        date: d.toISOString().split("T")[0],
        day: dayNames[d.getDay()],
        total: dayLeads.length,
        facebook: dayLeads.filter((l) => CHANNEL_SOURCES.facebook.includes(l.source)).length,
        instagram: dayLeads.filter((l) => CHANNEL_SOURCES.instagram.includes(l.source)).length,
        google: dayLeads.filter((l) => CHANNEL_SOURCES.google.includes(l.source)).length,
      });
    }

    // Top condomínios/tipologias de interesse (pra Insights)
    const condMap: Record<string, number> = {};
    leadsInPeriod.forEach((l) => {
      const conds = (l.condominiumsOfInterest as unknown[]) || [];
      conds.forEach((c) => {
        const name = typeof c === "string" ? c : (c as { name?: string })?.name || "";
        if (name) condMap[name] = (condMap[name] || 0) + 1;
      });
    });
    const topCondominiums = Object.entries(condMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count }));

    const typMap: Record<string, number> = {};
    leadsInPeriod.forEach((l) => {
      ((l.searchTypologies as string[]) || []).forEach((t) => { if (t) typMap[t] = (typMap[t] || 0) + 1; });
    });
    const topTypologies = Object.entries(typMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count }));

    const tempMap: Record<string, number> = {};
    leadsInPeriod.forEach((l) => { const t = l.temperature || "MORNO"; tempMap[t] = (tempMap[t] || 0) + 1; });
    const temperatureData = Object.entries(tempMap).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));

    const profileMap: Record<string, number> = {};
    leadsInPeriod.forEach((l) => { const p = l.profile || "NÃO INFORMADO"; profileMap[p] = (profileMap[p] || 0) + 1; });
    const profileData = Object.entries(profileMap).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));

    const fechados = leadsInPeriod.filter((l) => l.status === "FECHADO").length;
    const conversionRate = totalLeads > 0 ? Math.round((fechados / totalLeads) * 100) : 0;

    return NextResponse.json({
      period,
      kpis: {
        totalLeads,
        totalViews: viewsInPeriod,
        totalViewsAllTime,
        conversionRate,
        fechados,
      },
      leadsBySource,
      leadsByStatus,
      leadsByDay,
      topCondominiums,
      topTypologies,
      temperatureData,
      profileData,
      channelSources: CHANNEL_SOURCES,
    });
  } catch (error) {
    console.error("Erro ao gerar estatísticas de marketing:", error);
    return NextResponse.json({ error: "Erro ao gerar estatísticas" }, { status: 500 });
  }
}
