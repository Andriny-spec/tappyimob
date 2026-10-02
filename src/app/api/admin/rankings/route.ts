import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Buscar rankings de imóveis
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    
    // Filtros de data
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    
    // Filtros adicionais
    const category = searchParams.get("category");
    const city = searchParams.get("city");
    const status = searchParams.get("status");

    // Construir filtro de data
    let dateFilter: { gte?: Date; lte?: Date } | undefined;
    if (dateFrom || dateTo) {
      dateFilter = {};
      if (dateFrom) dateFilter.gte = new Date(dateFrom);
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        dateFilter.lte = endDate;
      }
    }

    // Filtro base para propriedades
    const propertyFilter: any = {};
    if (category) propertyFilter.category = category;
    if (city) propertyFilter.city = city;
    if (status) {
      propertyFilter.status = status;
    } else {
      // Por padrão, excluir imóveis vendidos/alugados do ranking
      propertyFilter.status = { notIn: ["VENDIDO", "ALUGADO"] };
    }

    // 1. Ranking de imóveis mais vistos no SITE
    let mostViewedSite: any[] = [];
    if (dateFilter) {
      // Com filtro de período: usar PropertyViewLog para dados temporais
      const viewsByProperty = await prisma.propertyViewLog.groupBy({
        by: ["propertyId"],
        where: {
          source: "site",
          createdAt: dateFilter,
          property: propertyFilter,
        },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: limit,
      });

      if (viewsByProperty.length > 0) {
        const siteViewIds = viewsByProperty.map((v) => v.propertyId);
        const siteProperties = await prisma.property.findMany({
          where: { id: { in: siteViewIds } },
          select: {
            id: true, code: true, title: true, thumbnail: true,
            neighborhood: true, city: true, price: true,
            views: true, portalViews: true, clicks: true, favorites: true, status: true,
          },
        });
        mostViewedSite = viewsByProperty.map((v) => {
          const prop = siteProperties.find((p) => p.id === v.propertyId);
          return { ...prop, views: v._count.id };
        });
      }
    } else {
      // Sem filtro de período: usar contadores acumulados
      mostViewedSite = await (prisma.property.findMany as any)({
        where: { ...propertyFilter, views: { gt: 0 } },
        orderBy: { views: "desc" },
        take: limit,
        select: {
          id: true, code: true, title: true, thumbnail: true,
          neighborhood: true, city: true, price: true,
          views: true, portalViews: true, clicks: true, favorites: true, status: true,
        },
      });
    }

    // 2. Ranking de imóveis mais vistos nos PORTAIS
    let mostViewedPortals: any[] = [];
    if (dateFilter) {
      // Com filtro de período: usar PropertyViewLog source=portal
      const portalViewsByProperty = await prisma.propertyViewLog.groupBy({
        by: ["propertyId"],
        where: {
          source: "portal",
          createdAt: dateFilter,
          property: propertyFilter,
        },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: limit,
      });

      if (portalViewsByProperty.length > 0) {
        const portalViewIds = portalViewsByProperty.map((v) => v.propertyId);
        const portalProperties = await prisma.property.findMany({
          where: { id: { in: portalViewIds } },
          select: {
            id: true, code: true, title: true, thumbnail: true,
            neighborhood: true, city: true, price: true,
            views: true, portalViews: true, clicks: true, favorites: true, status: true,
          },
        });
        mostViewedPortals = portalViewsByProperty.map((v) => {
          const prop = portalProperties.find((p) => p.id === v.propertyId);
          return { ...prop, portalViews: v._count.id };
        });
      }
    } else {
      // Sem filtro de período: usar contadores acumulados
      mostViewedPortals = await (prisma.property.findMany as any)({
        where: { ...propertyFilter, portalViews: { gt: 0 } },
        orderBy: { portalViews: "desc" },
        take: limit,
        select: {
          id: true, code: true, title: true, thumbnail: true,
          neighborhood: true, city: true, price: true,
          views: true, portalViews: true, clicks: true, favorites: true, status: true,
        },
      });
    }

    // 2. Ranking de imóveis com mais propostas (usar count real da relação)
    const mostProposalsRaw = await prisma.property.findMany({
      where: {
        proposals: { some: dateFilter ? { createdAt: dateFilter } : {} },
        ...propertyFilter,
      },
      select: {
        id: true,
        code: true,
        title: true,
        thumbnail: true,
        neighborhood: true,
        city: true,
        price: true,
        proposalsCount: true,
        status: true,
        _count: {
          select: { proposals: dateFilter ? { where: { createdAt: dateFilter } } : true },
        },
      },
    });

    // Usar count real e ordenar
    const mostProposals = mostProposalsRaw
      .map((p) => ({
        ...p,
        proposalsCount: p._count.proposals || p.proposalsCount || 0,
      }))
      .sort((a, b) => b.proposalsCount - a.proposalsCount)
      .slice(0, limit);

    // 3. Ranking de imóveis com mais origem de 1º contato (leads)
    const mostLeadOrigins = await prisma.leadProperty.groupBy({
      by: ["propertyId"],
      where: {
        type: "ORIGEM",
        ...(dateFilter && { createdAt: dateFilter }),
        property: propertyFilter,
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: limit,
    });

    // Buscar detalhes dos imóveis com mais leads de origem
    const propertyIds = mostLeadOrigins.map((item) => item.propertyId).filter(Boolean) as string[];
    const propertiesWithLeads = await prisma.property.findMany({
      where: { id: { in: propertyIds } },
      select: {
        id: true,
        code: true,
        title: true,
        thumbnail: true,
        neighborhood: true,
        city: true,
        price: true,
        status: true,
      },
    });

    // Combinar dados
    const leadOriginsRanking = mostLeadOrigins.map((item) => {
      const property = propertiesWithLeads.find((p) => p.id === item.propertyId);
      return {
        ...property,
        leadCount: item._count?.id || 0,
      };
    });

    // 4. Ranking de imóveis com mais visitas agendadas (ScheduledVisitProperty)
    const mostVisitRecords = await prisma.scheduledVisitProperty.groupBy({
      by: ["propertyId"],
      where: {
        property: propertyFilter,
        visit: {
          ...(dateFilter && { date: dateFilter }),
        },
      },
      _count: { propertyId: true },
      orderBy: { _count: { propertyId: "desc" } },
      take: limit,
    });

    const visitPropertyIds = mostVisitRecords.map((item) => item.propertyId);
    const propertiesWithVisits = await prisma.property.findMany({
      where: { id: { in: visitPropertyIds } },
      select: {
        id: true,
        code: true,
        title: true,
        thumbnail: true,
        neighborhood: true,
        city: true,
        price: true,
        status: true,
        inPersonVisits: true,
      },
    });

    const visitsRanking = mostVisitRecords.map((item) => {
      const property = propertiesWithVisits.find((p) => p.id === item.propertyId);
      return {
        ...property,
        visitCount: item._count?.propertyId || 0,
      };
    });

    // 5. Estatísticas gerais
    let totalViewsSite = 0;
    let totalViewsPortals = 0;

    if (dateFilter) {
      // Com filtro de período: contar do log
      totalViewsSite = await prisma.propertyViewLog.count({
        where: { source: "site", createdAt: dateFilter, property: propertyFilter },
      });
      totalViewsPortals = await prisma.propertyViewLog.count({
        where: { source: "portal", createdAt: dateFilter, property: propertyFilter },
      });
    } else {
      // Sem filtro: usar contadores acumulados
      const viewsSiteStats = await prisma.property.aggregate({
        where: propertyFilter,
        _sum: { views: true },
      });
      const viewsPortalsStats = await (prisma.property.aggregate as any)({
        where: propertyFilter,
        _sum: { portalViews: true },
      });
      totalViewsSite = viewsSiteStats._sum?.views || 0;
      totalViewsPortals = viewsPortalsStats._sum?.portalViews || 0;
    }

    // Ranking de corretores por novos cadastros de imóveis
    const brokerRegistrationFilter: any = {};
    if (dateFilter) brokerRegistrationFilter.createdAt = dateFilter;
    const brokerGroupsRaw = await prisma.property.groupBy({
      by: ["ownerId"],
      where: brokerRegistrationFilter,
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 20,
    });
    // Prisma v7 não aceita `NOT: { ownerId: null }` nem `{ not: null }` em groupBy:
    // filtramos no JS e mantemos top 10.
    const brokerGroups = brokerGroupsRaw
      .filter((g) => g.ownerId)
      .slice(0, 10);

    const brokerIds = brokerGroups.map((g) => g.ownerId).filter(Boolean) as string[];
    const brokerUsers = brokerIds.length > 0 ? await prisma.user.findMany({
      where: { id: { in: brokerIds } },
      select: { id: true, name: true, avatar: true, role: true },
    }) : [];

    const brokersRanking = brokerGroups.map((g) => {
      const user = brokerUsers.find((u) => u.id === g.ownerId);
      return { userId: g.ownerId, name: user?.name || "Desconhecido", avatar: user?.avatar, role: user?.role, count: g._count.id };
    });

    const totalProposals = await prisma.propertyProposal.count({
      where: dateFilter ? { createdAt: dateFilter } : undefined,
    });

    const totalLeadOrigins = await prisma.leadProperty.count({
      where: { 
        type: "ORIGEM",
        ...(dateFilter && { createdAt: dateFilter }),
      },
    });

    const totalVisitRecords = await prisma.scheduledVisit.count({
      where: dateFilter ? { date: dateFilter } : undefined,
    });

    return NextResponse.json({
      rankings: {
        mostViewedSite,
        mostViewedPortals,
        mostProposals,
        leadOriginsRanking,
        visitsRanking,
        brokersRanking,
      },
      stats: {
        totalViewsSite,
        totalViewsPortals,
        totalProposals,
        totalLeadOrigins,
        totalVisitRecords,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar rankings:", error);
    return NextResponse.json(
      { error: "Erro ao buscar rankings" },
      { status: 500 }
    );
  }
}
