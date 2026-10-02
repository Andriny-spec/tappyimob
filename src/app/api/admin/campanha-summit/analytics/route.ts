import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PAGE = "lp-campanha";

// GET /api/admin/campanha-summit/analytics
// Retorna métricas agregadas da LP /campanha-summit
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const days = Math.min(Number(url.searchParams.get("days")) || 30, 365);
    const since = new Date();
    since.setDate(since.getDate() - days);

    const startToday = new Date();
    startToday.setHours(0, 0, 0, 0);

    // Totais por tipo no período
    const byTypeRaw = await prisma.eventPageView.groupBy({
      by: ["type"],
      where: { page: PAGE, createdAt: { gte: since } },
      _count: { _all: true },
    });
    const byType: Record<string, number> = {};
    byTypeRaw.forEach((r) => (byType[r.type] = r._count._all));

    // Total geral no período
    const total = byTypeRaw.reduce((acc, r) => acc + r._count._all, 0);

    // Acessos hoje (pageview)
    const todayPageviews = await prisma.eventPageView.count({
      where: { page: PAGE, type: "pageview", createdAt: { gte: startToday } },
    });

    // Top imóveis (click_property)
    const topPropertiesRaw = await prisma.eventPageView.groupBy({
      by: ["target"],
      where: {
        page: PAGE,
        type: "click_property",
        createdAt: { gte: since },
        target: { not: null },
      },
      _count: { _all: true },
      orderBy: { _count: { target: "desc" } },
      take: 20,
    });
    const topProperties = topPropertiesRaw.map((r) => ({
      target: r.target,
      count: r._count._all,
    }));

    // Top membros da equipe (click_team)
    const topTeamRaw = await prisma.eventPageView.groupBy({
      by: ["target"],
      where: {
        page: PAGE,
        type: "click_team",
        createdAt: { gte: since },
        target: { not: null },
      },
      _count: { _all: true },
      orderBy: { _count: { target: "desc" } },
      take: 20,
    });
    const topTeam = topTeamRaw.map((r) => ({
      target: r.target,
      count: r._count._all,
    }));

    // Top âncoras de navegação (click_nav)
    const topNavRaw = await prisma.eventPageView.groupBy({
      by: ["target"],
      where: {
        page: PAGE,
        type: "click_nav",
        createdAt: { gte: since },
        target: { not: null },
      },
      _count: { _all: true },
      orderBy: { _count: { target: "desc" } },
      take: 20,
    });
    const topNav = topNavRaw.map((r) => ({
      target: r.target,
      count: r._count._all,
    }));

    // Série temporal por dia (pageview)
    const timeline = await prisma.$queryRawUnsafe<
      { day: Date; total: bigint }[]
    >(
      `SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::bigint AS total
       FROM event_page_views
       WHERE page = $1 AND type = 'pageview' AND "createdAt" >= $2
       GROUP BY day
       ORDER BY day ASC`,
      PAGE,
      since
    );
    const timelineSerialized = timeline.map((t) => ({
      day: t.day.toISOString(),
      total: Number(t.total),
    }));

    // Top UTMs
    const topUtmRaw = await prisma.eventPageView.groupBy({
      by: ["utmSource"],
      where: {
        page: PAGE,
        createdAt: { gte: since },
        utmSource: { not: null },
      },
      _count: { _all: true },
      orderBy: { _count: { utmSource: "desc" } },
      take: 10,
    });
    const topUtm = topUtmRaw.map((r) => ({
      source: r.utmSource,
      count: r._count._all,
    }));

    return NextResponse.json({
      days,
      total,
      byType,
      todayPageviews,
      topProperties,
      topTeam,
      topNav,
      topUtm,
      timeline: timelineSerialized,
    });
  } catch (err) {
    console.error("[campanha-summit/analytics] Error:", err);
    return NextResponse.json(
      { error: "Falha ao carregar métricas" },
      { status: 500 }
    );
  }
}
