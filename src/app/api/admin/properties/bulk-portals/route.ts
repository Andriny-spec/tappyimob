import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: Atribuir portais em massa a múltiplos imóveis
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyIds, portals, position, action } = body;

    // Validação
    if (!propertyIds || !Array.isArray(propertyIds) || propertyIds.length === 0) {
      return NextResponse.json({ error: "Nenhum imóvel selecionado" }, { status: 400 });
    }

    if (!portals || !Array.isArray(portals) || portals.length === 0) {
      return NextResponse.json({ error: "Nenhum portal selecionado" }, { status: 400 });
    }

    if (!action || !["add", "remove", "set"].includes(action)) {
      return NextResponse.json({ error: "Ação inválida. Use: add, remove, set" }, { status: 400 });
    }

    let updatedCount = 0;

    if (action === "set") {
      // SET: substitui activePortals com os portais selecionados
      const portalPositions = position
        ? Object.fromEntries(portals.map((p: string) => [p, position]))
        : undefined;

      const updateData: any = { activePortals: portals };
      if (portalPositions) {
        updateData.portalPositions = portalPositions;
      }

      // Buscar updatedAt de todos os imóveis antes de atualizar
      const propsBeforeSet = await prisma.property.findMany({
        where: { id: { in: propertyIds } },
        select: { id: true, updatedAt: true },
      });
      const result = await prisma.property.updateMany({
        where: { id: { in: propertyIds } },
        data: updateData,
      });
      // Preservar updatedAt original — operações de portal não devem alterar essa data
      for (const p of propsBeforeSet) {
        await prisma.$executeRaw`UPDATE "properties" SET "updatedAt" = ${p.updatedAt} WHERE "id" = ${p.id}`;
      }
      updatedCount = result.count;

    } else if (action === "add") {
      // ADD: adiciona portais sem remover os existentes
      const properties = await prisma.property.findMany({
        where: { id: { in: propertyIds } },
        select: { id: true, activePortals: true, portalPositions: true },
      });

      for (const prop of properties) {
        const currentPortals = new Set(prop.activePortals || []);
        portals.forEach((p: string) => currentPortals.add(p));

        const currentPositions = (prop.portalPositions as Record<string, string>) || {};
        if (position) {
          portals.forEach((p: string) => {
            currentPositions[p] = position;
          });
        }

        const propBefore = await prisma.property.findUnique({ where: { id: prop.id }, select: { updatedAt: true } });
        await prisma.property.update({
          where: { id: prop.id },
          data: {
            activePortals: Array.from(currentPortals),
            portalPositions: currentPositions,
          },
        });
        if (propBefore) await prisma.$executeRaw`UPDATE "properties" SET "updatedAt" = ${propBefore.updatedAt} WHERE "id" = ${prop.id}`;
        updatedCount++;
      }

    } else if (action === "remove") {
      // REMOVE: remove portais específicos
      const properties = await prisma.property.findMany({
        where: { id: { in: propertyIds } },
        select: { id: true, activePortals: true, portalPositions: true },
      });

      for (const prop of properties) {
        const portalsSet = new Set(portals);
        const filtered = (prop.activePortals || []).filter((p) => !portalsSet.has(p));

        const currentPositions = (prop.portalPositions as Record<string, string>) || {};
        portals.forEach((p: string) => {
          delete currentPositions[p];
        });

        const propBeforeRm = await prisma.property.findUnique({ where: { id: prop.id }, select: { updatedAt: true } });
        await prisma.property.update({
          where: { id: prop.id },
          data: {
            activePortals: filtered,
            portalPositions: currentPositions,
          },
        });
        if (propBeforeRm) await prisma.$executeRaw`UPDATE "properties" SET "updatedAt" = ${propBeforeRm.updatedAt} WHERE "id" = ${prop.id}`;
        updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      updatedCount,
      message: `${updatedCount} imóveis atualizados`,
    });
  } catch (error) {
    console.error("Error bulk updating portals:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar portais em massa" },
      { status: 500 }
    );
  }
}

// GET: Listar imóveis disponíveis com info de portais para a tela de atribuição
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const city = searchParams.get("city") || "";
    const portal = searchParams.get("portal") || ""; // filtrar por portal
    const noPortal = searchParams.get("noPortal") === "true"; // sem nenhum portal

    const where: any = {
      status: "DISPONIVEL",
      isOffMarket: false,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { neighborhood: { contains: search, mode: "insensitive" } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    if (portal) {
      where.activePortals = { has: portal };
    }

    if (noPortal) {
      where.activePortals = { isEmpty: true };
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        select: {
          id: true,
          code: true,
          title: true,
          type: true,
          category: true,
          price: true,
          rentPrice: true,
          neighborhood: true,
          city: true,
          state: true,
          thumbnail: true,
          activePortals: true,
          portalPositions: true,
          bedrooms: true,
          area: true,
          condominium: { select: { name: true } },
        },
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.property.count({ where }),
    ]);

    return NextResponse.json({
      properties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching properties for portal assignment:", error);
    return NextResponse.json(
      { error: "Erro ao buscar imóveis" },
      { status: 500 }
    );
  }
}
