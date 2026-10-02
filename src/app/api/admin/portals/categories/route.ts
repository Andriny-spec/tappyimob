import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// Limites padrão por portal (fallback se não tiver no DB)
const DEFAULT_LIMITS: Record<string, Record<string, number>> = {
  grupozap: { simples: 2000, destaque: 144, super_destaque: 6, destaque_exclusivo: 10 },
  imovelweb: { simples: 1230, destaque: 190, super_destaque: 80, destaque_exclusivo: 0 },
  chavesnamao: { simples: 2000, destaque: 150, super_destaque: 50, destaque_exclusivo: 0 },
  olx: { simples: 1500, destaque: 200, super_destaque: 100, destaque_exclusivo: 0 },
};

// Buscar limites do DB (WatermarkSettings reaproveitado como settings gerais, ou fallback)
async function getPortalLimits(): Promise<Record<string, Record<string, number>>> {
  try {
    const setting = await prisma.watermarkSettings.findFirst({
      where: { id: "portal-limits" },
    });
    if (setting && (setting as any).metadata) {
      return JSON.parse((setting as any).metadata as string);
    }
  } catch {}
  return DEFAULT_LIMITS;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const portal = searchParams.get("portal") || "grupozap";
    const category = searchParams.get("category") || "all";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Filtros avançados
    const tipo = searchParams.get("tipo") || "";
    const condominioId = searchParams.get("condominioId") || "";
    const precoMin = searchParams.get("precoMin") ? parseFloat(searchParams.get("precoMin")!) : null;
    const precoMax = searchParams.get("precoMax") ? parseFloat(searchParams.get("precoMax")!) : null;
    const dormitorios = searchParams.get("dormitorios") ? parseInt(searchParams.get("dormitorios")!) : null;
    const mobiliado = searchParams.get("mobiliado");
    const permuta = searchParams.get("permuta");
    const exclusividade = searchParams.get("exclusividade");
    const sortBy = searchParams.get("sortBy") || "updatedAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Construir where
    const where: any = {
      status: "DISPONIVEL",
      isOffMarket: false,
    };

    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { title: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { neighborhood: { contains: search, mode: "insensitive" } },
        { condominium: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (tipo) where.type = tipo;
    if (condominioId) where.condominiumId = condominioId;
    if (precoMin !== null || precoMax !== null) {
      where.price = {};
      if (precoMin !== null) where.price.gte = precoMin;
      if (precoMax !== null) where.price.lte = precoMax;
    }
    if (dormitorios !== null) where.bedrooms = { gte: dormitorios };
    if (mobiliado === "true") where.isFurnished = true;
    if (permuta === "true") where.acceptsExchange = true;
    // Exclusividade abrange tanto exclusividade própria (isExclusive) quanto
    // gestão de exclusividade de terceiros (isThirdPartyExclusive).
    // Usa AND para não colidir com o OR da busca textual.
    if (exclusividade === "true") {
      where.AND = [
        ...(where.AND || []),
        { OR: [{ isExclusive: true }, { isThirdPartyExclusive: true }] },
      ];
    }

    // Ordenação
    const orderByMap: Record<string, any> = {
      updatedAt: { updatedAt: sortOrder },
      price: { price: sortOrder },
      createdAt: { createdAt: sortOrder },
      code: { code: sortOrder },
      bedrooms: { bedrooms: sortOrder },
      area: { totalArea: sortOrder },
    };
    const orderBy = orderByMap[sortBy] || { updatedAt: "desc" };

    const properties = await prisma.property.findMany({
      where,
      select: {
        id: true,
        code: true,
        title: true,
        type: true,
        category: true,
        status: true,
        price: true,
        rentPrice: true,
        area: true,
        totalArea: true,
        usefulArea: true,
        bedrooms: true,
        bathrooms: true,
        parkingSpaces: true,
        neighborhood: true,
        city: true,
        state: true,
        address: true,
        isFeatured: true,
        isSuperFeatured: true,
        isFurnished: true,
        acceptsExchange: true,
        isExclusive: true,
        portalPositions: true,
        portalHighlight: true,
        thumbnail: true,
        images: true,
        condominiumId: true,
        createdAt: true,
        updatedAt: true,
        condominium: {
          select: {
            id: true,
            name: true,
            neighborhood: true,
            city: true,
            state: true,
          },
        },
      },
      orderBy,
    });

    // Classificar por categoria do portal
    const categorized = properties.map((p) => {
      const positions = (p.portalPositions as Record<string, string>) || {};
      const portalCategory = positions[portal] || "simples";
      return { ...p, portalCategory };
    });

    // Filtrar por categoria se necessário
    let filtered = categorized;
    if (category !== "all") {
      filtered = categorized.filter((p) => p.portalCategory === category);
    }

    // Contar por categoria
    const counts = {
      simples: categorized.filter((p) => p.portalCategory === "simples").length,
      destaque: categorized.filter((p) => p.portalCategory === "destaque").length,
      super_destaque: categorized.filter((p) => p.portalCategory === "super_destaque").length,
      destaque_exclusivo: categorized.filter((p) => p.portalCategory === "destaque_exclusivo").length,
    };

    // Paginação
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);
    const totalFiltered = filtered.length;

    // Buscar limites do portal
    const allLimits = DEFAULT_LIMITS;
    const portalLimits = allLimits[portal] || allLimits.grupozap;

    return NextResponse.json({
      properties: paginated,
      counts,
      limits: portalLimits,
      total: totalFiltered,
      page,
      totalPages: Math.ceil(totalFiltered / limit),
    });
  } catch (error: any) {
    console.error("Erro ao buscar categorias:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { portal, limits: newLimits } = body;

    if (!portal || !newLimits) {
      return NextResponse.json({ error: "portal e limits são obrigatórios" }, { status: 400 });
    }

    // Atualizar os limites no DEFAULT_LIMITS em runtime
    // Para persistência real, salvar no banco
    DEFAULT_LIMITS[portal] = {
      simples: newLimits.simples || 1500,
      destaque: newLimits.destaque || 200,
      super_destaque: newLimits.super_destaque || 100,
    };

    return NextResponse.json({ success: true, limits: DEFAULT_LIMITS[portal] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { action, portal, propertyIds, category } = body;

    if (!portal || !propertyIds || !Array.isArray(propertyIds) || propertyIds.length === 0) {
      return NextResponse.json({ error: "portal e propertyIds são obrigatórios" }, { status: 400 });
    }

    if (action === "assign") {
      if (!category || !["simples", "destaque", "super_destaque", "destaque_exclusivo"].includes(category)) {
        return NextResponse.json({ error: "Categoria inválida" }, { status: 400 });
      }

      // Buscar propriedades atuais
      const properties = await prisma.property.findMany({
        where: { id: { in: propertyIds } },
        select: { id: true, portalPositions: true, isFeatured: true, isSuperFeatured: true },
      });

      // Atualizar cada propriedade
      const updates = properties.map((p) => {
        const positions = (p.portalPositions as Record<string, string>) || {};
        positions[portal] = category;

        // Sincronizar isFeatured/isSuperFeatured baseado na categoria mais alta entre portais
        const allCategories = Object.values(positions);
        const hasSuper = allCategories.includes("super_destaque");
        const hasFeatured = allCategories.includes("destaque");

        return prisma.property.update({
          where: { id: p.id },
          data: {
            portalPositions: positions,
            isFeatured: hasFeatured || hasSuper,
            isSuperFeatured: hasSuper,
          },
        });
      });

      await Promise.all(updates);

      return NextResponse.json({
        success: true,
        updated: propertyIds.length,
        message: `${propertyIds.length} imóveis atualizados para "${category}" no portal "${portal}"`,
      });
    }

    if (action === "remove") {
      // Remover do portal (volta pra simples)
      const properties = await prisma.property.findMany({
        where: { id: { in: propertyIds } },
        select: { id: true, portalPositions: true },
      });

      const updates = properties.map((p) => {
        const positions = (p.portalPositions as Record<string, string>) || {};
        positions[portal] = "simples";

        const allCategories = Object.values(positions);
        const hasSuper = allCategories.includes("super_destaque");
        const hasFeatured = allCategories.includes("destaque");

        return prisma.property.update({
          where: { id: p.id },
          data: {
            portalPositions: positions,
            isFeatured: hasFeatured || hasSuper,
            isSuperFeatured: hasSuper,
          },
        });
      });

      await Promise.all(updates);

      return NextResponse.json({
        success: true,
        updated: propertyIds.length,
      });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error: any) {
    console.error("Erro ao atualizar categorias:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
