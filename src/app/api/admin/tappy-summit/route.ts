import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/tappy-summit - List registrations with filters
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const where: any = {
      eventSlug: "tappy-summit-2026",
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { companyName: { contains: search, mode: "insensitive" } },
      ];
    }

    if (type && type !== "all") {
      where.type = type;
    }

    const [registrations, total] = await Promise.all([
      prisma.eventRegistration.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          followUpLogs: {
            include: {
              followUp: {
                select: { id: true, name: true, sortOrder: true },
              },
            },
            orderBy: { followUp: { sortOrder: "asc" } },
          },
        },
      }),
      prisma.eventRegistration.count({ where }),
    ]);

    // Stats
    const stats = await prisma.eventRegistration.groupBy({
      by: ["type"],
      where: { eventSlug: "tappy-summit-2026" },
      _count: true,
    });

    const totalAll = await prisma.eventRegistration.count({
      where: { eventSlug: "tappy-summit-2026" },
    });

    const confirmed = await prisma.eventRegistration.count({
      where: { eventSlug: "tappy-summit-2026", confirmed: true },
    });

    const attended = await prisma.eventRegistration.count({
      where: { eventSlug: "tappy-summit-2026", attended: true },
    });

    // Analytics - page views and clicks
    let analytics: any = {};
    try {
      const pageViewsByType = await prisma.eventPageView.groupBy({
        by: ["type"],
        where: { eventSlug: "tappy-summit-2026" },
        _count: true,
      });

      const pageViewsByPage = await prisma.eventPageView.groupBy({
        by: ["page"],
        where: { eventSlug: "tappy-summit-2026", type: "pageview" },
        _count: true,
      });

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayViews = await prisma.eventPageView.count({
        where: {
          eventSlug: "tappy-summit-2026",
          type: "pageview",
          createdAt: { gte: todayStart },
        },
      });

      analytics = {
        byType: pageViewsByType.reduce((acc: any, s: any) => {
          acc[s.type] = s._count;
          return acc;
        }, {}),
        byPage: pageViewsByPage.reduce((acc: any, s: any) => {
          acc[s.page] = s._count;
          return acc;
        }, {}),
        todayViews,
      };
    } catch (e) {
      // Table may not exist yet
      analytics = { byType: {}, byPage: {}, todayViews: 0 };
    }

    return NextResponse.json({
      registrations,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      stats: {
        total: totalAll,
        confirmed,
        attended,
        byType: stats.reduce((acc: any, s: any) => {
          acc[s.type] = s._count;
          return acc;
        }, {}),
      },
      analytics,
    });
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json(
      { error: "Erro ao buscar inscrições" },
      { status: 500 }
    );
  }
}
