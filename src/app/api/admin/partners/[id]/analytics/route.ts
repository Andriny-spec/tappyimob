import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Buscar analytics do parceiro
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30"; // Últimos X dias

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const analytics = await prisma.partnerAnalytics.findMany({
      where: {
        partnerId: id,
        date: { gte: startDate },
      },
      orderBy: { date: "asc" },
    });

    // Calcular totais
    const totals = analytics.reduce(
      (acc, day) => ({
        pageViews: acc.pageViews + day.pageViews,
        uniqueVisitors: acc.uniqueVisitors + day.uniqueVisitors,
        sessions: acc.sessions + day.sessions,
        propertyViews: acc.propertyViews + day.propertyViews,
        leadsGenerated: acc.leadsGenerated + day.leadsGenerated,
        whatsappClicks: acc.whatsappClicks + day.whatsappClicks,
        phoneClicks: acc.phoneClicks + day.phoneClicks,
        apiRequests: acc.apiRequests + day.apiRequests,
      }),
      {
        pageViews: 0,
        uniqueVisitors: 0,
        sessions: 0,
        propertyViews: 0,
        leadsGenerated: 0,
        whatsappClicks: 0,
        phoneClicks: 0,
        apiRequests: 0,
      }
    );

    // Calcular médias
    const avgBounceRate = analytics.length
      ? analytics.reduce((sum, day) => sum + day.bounceRate, 0) / analytics.length
      : 0;

    const avgSessionDuration = analytics.length
      ? analytics.reduce((sum, day) => sum + day.avgSessionDuration, 0) / analytics.length
      : 0;

    return NextResponse.json({
      analytics,
      totals,
      averages: {
        bounceRate: avgBounceRate,
        sessionDuration: avgSessionDuration,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar analytics:", error);
    return NextResponse.json({ error: "Erro ao buscar analytics" }, { status: 500 });
  }
}
