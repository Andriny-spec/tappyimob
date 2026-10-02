import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar condomínios
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const format = searchParams.get("format");
    const launch = searchParams.get("launch");
    const sports = searchParams.get("sports");
    const builderId = searchParams.get("builderId");
    const city = searchParams.get("city");
    const neighborhood = searchParams.get("neighborhood");
    const isActive = searchParams.get("isActive");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");
    const sortBy = searchParams.get("sortBy") || "name";

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { neighborhood: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filtro por tipo (legado) ou formato
    if (type) {
      where.condoType = type;
    }
    if (format) {
      where.condoType = format;
    }

    // Filtro por categoria (Residencial/Comercial/Híbrido)
    if (category) {
      where.condoCategory = category;
    }

    // Filtro por lançamento
    if (launch === "true") {
      where.isLaunchProject = true;
    }

    // Filtro por assessoria esportiva
    if (sports === "true") {
      where.hasSportsAdvisory = true;
    }

    // Filtro por construtora
    if (builderId) {
      where.builderId = builderId;
    }

    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    if (neighborhood) {
      where.neighborhood = { contains: neighborhood, mode: "insensitive" };
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    // Definir ordenação baseada no sortBy
    let orderByClause: any = { name: "asc" };
    
    // Para ordenações agregadas (views, visits, sold), precisamos fazer query especial
    const needsAggregation = ["views", "visits", "sold", "properties"].includes(sortBy);
    
    if (!needsAggregation) {
      if (sortBy === "name") orderByClause = { name: "asc" };
      else orderByClause = { [sortBy]: "desc" };
    }

    const [condominiumsRaw, total, formatStats, categoryStats] = await Promise.all([
      (prisma.condominium.findMany as any)({
        where,
        include: {
          _count: {
            select: { properties: true },
          },
          builderPartner: {
            select: {
              id: true,
              name: true,
            },
          },
          properties: needsAggregation ? {
            select: {
              views: true,
              inPersonVisits: true,
              status: true,
            }
          } : false,
        },
        orderBy: needsAggregation ? undefined : orderByClause,
        take: needsAggregation ? undefined : limit,
        skip: needsAggregation ? undefined : (page - 1) * limit,
      }),
      prisma.condominium.count({ where }),
      // Estatísticas por formato (sem filtro)
      prisma.condominium.groupBy({
        by: ['condoType'],
        _count: { id: true },
      }),
      // Estatísticas por categoria (sem filtro)
      (prisma.condominium.groupBy as any)({
        by: ['condoCategory'],
        _count: { id: true },
      }),
    ]);

    // Se precisar de agregação, calcular métricas e ordenar manualmente
    let condominiums = condominiumsRaw;
    if (needsAggregation) {
      condominiums = condominiumsRaw.map((condo: any) => {
        const props = condo.properties || [];
        const totalViews = props.reduce((acc: number, p: any) => acc + (p.views || 0), 0);
        const totalVisits = props.reduce((acc: number, p: any) => acc + (p.inPersonVisits || 0), 0);
        const totalSold = props.filter((p: any) => p.status === "VENDIDO" || p.status === "ALUGADO").length;
        
        // Remover properties da resposta para não sobrecarregar
        const { properties, ...rest } = condo;
        return {
          ...rest,
          _metrics: {
            views: totalViews,
            visits: totalVisits,
            sold: totalSold,
          }
        };
      });

      // Ordenar
      if (sortBy === "views") {
        condominiums.sort((a: any, b: any) => b._metrics.views - a._metrics.views);
      } else if (sortBy === "visits") {
        condominiums.sort((a: any, b: any) => b._metrics.visits - a._metrics.visits);
      } else if (sortBy === "sold") {
        condominiums.sort((a: any, b: any) => b._metrics.sold - a._metrics.sold);
      } else if (sortBy === "properties") {
        condominiums.sort((a: any, b: any) => b._count.properties - a._count.properties);
      }

      // Aplicar paginação manual
      condominiums = condominiums.slice((page - 1) * limit, page * limit);
    }

    // Calcular totais por formato
    const totalAll = formatStats.reduce((acc: number, s: any) => acc + (s._count?.id || 0), 0);
    const totalVertical = formatStats.find((s: any) => s.condoType === 'VERTICAL')?._count?.id || 0;
    const totalHorizontal = formatStats.find((s: any) => s.condoType === 'HORIZONTAL')?._count?.id || 0;
    const totalMisto = formatStats.find((s: any) => s.condoType === 'MISTO')?._count?.id || 0;

    // Calcular totais por categoria
    const catStats = categoryStats as any[];
    const totalResidencial = catStats.find((s: any) => s.condoCategory === 'RESIDENCIAL')?._count?.id || 0;
    const totalComercial = catStats.find((s: any) => s.condoCategory === 'COMERCIAL')?._count?.id || 0;
    const totalHibrido = catStats.find((s: any) => s.condoCategory === 'HIBRIDO')?._count?.id || 0;

    return NextResponse.json({
      condominiums,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      stats: {
        total: totalAll,
        vertical: totalVertical,
        horizontal: totalHorizontal,
        misto: totalMisto,
        residencial: totalResidencial,
        comercial: totalComercial,
        hibrido: totalHibrido,
      },
    });
  } catch (error) {
    console.error("Erro ao listar condomínios:", error);
    return NextResponse.json(
      { error: "Erro ao listar condomínios" },
      { status: 500 }
    );
  }
}

// POST - Criar condomínio
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Gerar slug
    const slug = body.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Verificar se slug já existe
    const existingSlug = await prisma.condominium.findUnique({
      where: { slug },
    });

    const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

    // Criar condomínio com torres
    const { towers, ...condoData } = body;

    const condominium = await (prisma.condominium.create as any)({
      data: {
        name: condoData.name,
        slug: finalSlug,
        description: condoData.description,
        condoCategory: condoData.condoCategory || "RESIDENCIAL",
        condoType: condoData.condoType || "VERTICAL",
        builderId: condoData.builderId || null,
        address: condoData.address,
        number: condoData.number,
        neighborhood: condoData.neighborhood,
        city: condoData.city || "Santana de Parnaíba",
        state: condoData.state || "SP",
        zipCode: condoData.zipCode,
        latitude: condoData.latitude,
        longitude: condoData.longitude,
        fakeAddress: condoData.fakeAddress,
        fakeNumber: condoData.fakeNumber,
        showRealAddress: condoData.showRealAddress || false,
        totalUnits: condoData.totalUnits,
        totalLots: condoData.totalLots,
        yearBuilt: condoData.yearBuilt,
        builder: condoData.builder,
        availableSizes: condoData.availableSizes || [],
        hasApartment: condoData.hasApartment || false,
        hasHouse: condoData.hasHouse || false,
        hasTerrain: condoData.hasTerrain || false,
        hasCommercial: condoData.hasCommercial || false,
        hasCobertura: condoData.hasCobertura || false,
        hasGarden: condoData.hasGarden || false,
        hasFlat: condoData.hasFlat || false,
        hasStudio: condoData.hasStudio || false,
        hasCasaTerrea: condoData.hasCasaTerrea || false,
        hasSobrado: condoData.hasSobrado || false,
        amenities: condoData.amenities || [],
        hasSportsAdvisory: condoData.hasSportsAdvisory || false,
        activityScheduleImage: condoData.activityScheduleImage,
        adminName: condoData.adminName,
        adminPhone: condoData.adminPhone,
        adminEmail: condoData.adminEmail,
        porterPhone: condoData.porterPhone,
        // Contatos do condomínio (JSON)
        contacts: condoData.contacts || [],
        // Administradora
        managementCompany: condoData.managementCompany,
        managementCompanyPhone: condoData.managementCompanyPhone,
        managementCompanyEmail: condoData.managementCompanyEmail,
        managementCompanyWebsite: condoData.managementCompanyWebsite,
        // Projeto em fase de lançamento
        isLaunchProject: condoData.isLaunchProject || false,
        launchStage: condoData.launchStage,
        expectedDelivery: condoData.expectedDelivery ? new Date(condoData.expectedDelivery) : null,
        launchDescription: condoData.launchDescription,
        // Mídia
        thumbnail: condoData.thumbnail,
        images: condoData.images || [],
        videos: condoData.videos || [],
        virtualTour: condoData.virtualTour,
        // Documentos internos
        internalMap: condoData.internalMap,
        maps: condoData.maps || [],
        implantation: condoData.implantation,
        floorPlans: condoData.floorPlans || [],
        // SEO
        metaTitle: condoData.metaTitle,
        metaDescription: condoData.metaDescription,
        isActive: condoData.isActive ?? true,
        isFeatured: condoData.isFeatured || false,
        // Criar torres se houver
        towers: towers?.length > 0 ? {
          create: towers.map((t: any) => ({
            name: t.name,
            floors: t.floors,
            unitsPerFloor: t.unitsPerFloor,
            totalUnits: t.totalUnits,
            availableSizes: t.availableSizes || [],
          })),
        } : undefined,
      },
      include: {
        towers: true,
      },
    });

    return NextResponse.json(condominium, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar condomínio:", error);
    return NextResponse.json(
      { error: "Erro ao criar condomínio" },
      { status: 500 }
    );
  }
}
