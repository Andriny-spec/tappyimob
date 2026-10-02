import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET - Relatório consolidado do proprietário
export async function GET(
  request: NextRequest,
  { params }: { params: { ownerId: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { ownerId } = await params;

    // Buscar proprietário
    const owner = await prisma.propertyOwner.findUnique({
      where: { id: ownerId },
      select: {
        id: true,
        name: true,
        phones: true,
        email: true,
        cpf: true,
      },
    });

    if (!owner) {
      return NextResponse.json({ error: "Proprietário não encontrado" }, { status: 404 });
    }

    // Buscar todos os imóveis do proprietário
    const properties = await prisma.property.findMany({
      where: { propertyOwnerId: ownerId },
      select: {
        id: true,
        code: true,
        title: true,
        address: true,
        number: true,
        neighborhood: true,
        city: true,
        type: true,
        category: true,
        status: true,
        price: true,
        rentalPrice: true,
        thumbnail: true,
        views: true,
        portalViews: true,
        clicks: true,
        favorites: true,
        shares: true,
        area: true,
        bedrooms: true,
        createdAt: true,
        scheduledVisitProperties: {
          include: {
            visit: {
              select: {
                id: true,
                status: true,
                date: true,
                feedback: true,
                rating: true,
              },
            },
          },
        },
      },
    });

    // Calcular métricas consolidadas
    const totalViews = properties.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalPortalViews = properties.reduce((sum, p) => sum + (p.portalViews || 0), 0);
    const totalClicks = properties.reduce((sum, p) => sum + (p.clicks || 0), 0);
    const totalFavorites = properties.reduce((sum, p) => sum + (p.favorites || 0), 0);
    const totalShares = properties.reduce((sum, p) => sum + (p.shares || 0), 0);

    // Visitas por imóvel
    let totalVisits = 0;
    let completedVisits = 0;
    let cancelledVisits = 0;

    const propertiesWithStats = properties.map((p) => {
      const visits = p.scheduledVisitProperties.map((svp) => svp.visit);
      const propertyVisitsTotal = visits.length;
      const propertyVisitsCompleted = visits.filter((v) => v.status === "REALIZADA").length;
      const propertyVisitsCancelled = visits.filter((v) => v.status === "CANCELADA" || v.status === "NAO_COMPARECEU").length;

      totalVisits += propertyVisitsTotal;
      completedVisits += propertyVisitsCompleted;
      cancelledVisits += propertyVisitsCancelled;

      return {
        id: p.id,
        code: p.code,
        title: p.title,
        address: p.address,
        number: p.number,
        neighborhood: p.neighborhood,
        city: p.city,
        type: p.type,
        category: p.category,
        status: p.status,
        price: p.price,
        rentalPrice: p.rentalPrice,
        thumbnail: p.thumbnail,
        area: p.area,
        bedrooms: p.bedrooms,
        createdAt: p.createdAt,
        metrics: {
          views: p.views || 0,
          portalViews: p.portalViews || 0,
          clicks: p.clicks || 0,
          favorites: p.favorites || 0,
          shares: p.shares || 0,
          totalVisits: propertyVisitsTotal,
          completedVisits: propertyVisitsCompleted,
          cancelledVisits: propertyVisitsCancelled,
        },
      };
    });

    return NextResponse.json({
      owner,
      properties: propertiesWithStats,
      summary: {
        totalProperties: properties.length,
        activeProperties: properties.filter((p) => p.status === "DISPONIVEL").length,
        soldProperties: properties.filter((p) => p.status === "VENDIDO").length,
        rentedProperties: properties.filter((p) => p.status === "LOCADO").length,
        totalViews,
        totalPortalViews,
        totalClicks,
        totalFavorites,
        totalShares,
        totalVisits,
        completedVisits,
        cancelledVisits,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Erro ao gerar relatório:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
