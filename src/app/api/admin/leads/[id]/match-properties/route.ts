import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/leads/[id]/match-properties - Find compatible properties for a lead
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Fetch lead with relevant data
    const lead = await prisma.lead.findUnique({
      where: { id },
      select: {
        id: true,
        ticket: true,
        minBudget: true,
        maxBudget: true,
        searchTypologies: true,
        searchSubtype: true,
        searchBedrooms: true,
        searchFurnished: true,
        hasPermuta: true,
        permutaType: true,
        permutaValue: true,
        hasFinancing: true,
        directInstallment: true,
        condominiumsOfInterest: true,
        property: {
          select: { id: true, price: true },
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
    }

    // Build property query based on lead criteria
    const where: any = {
      status: "DISPONIVEL",
      isActive: true,
    };

    // Category filter based on ticket
    if (lead.ticket === "COMPRA") {
      where.category = { in: ["VENDA", "VENDA_LOCACAO"] };
    } else if (lead.ticket === "LOCACAO") {
      where.category = { in: ["LOCACAO", "VENDA_LOCACAO"] };
    }
    // AMBOS: no category filter needed

    // Price range filter
    const minBudget = lead.minBudget;
    const maxBudget = lead.maxBudget;
    if (minBudget || maxBudget) {
      where.price = {};
      if (minBudget) {
        // Allow 20% below min budget for flexibility
        where.price.gte = minBudget * 0.8;
      }
      if (maxBudget) {
        // Allow 20% above max budget for flexibility
        where.price.lte = maxBudget * 1.2;
      }
    }

    // Typology filter (property type)
    if (lead.searchTypologies && lead.searchTypologies.length > 0) {
      where.type = { in: lead.searchTypologies };
    }

    // Bedrooms filter
    if (lead.searchBedrooms) {
      const beds = parseInt(lead.searchBedrooms);
      if (!isNaN(beds) && beds > 0) {
        where.bedrooms = { gte: beds };
      }
    }

    // Furnished filter
    if (lead.searchFurnished === true) {
      where.isFurnished = true;
    }

    // Condominium filter - match by name
    const condominiumIds: string[] = [];
    if (lead.condominiumsOfInterest && Array.isArray(lead.condominiumsOfInterest)) {
      const condoNames = (lead.condominiumsOfInterest as any[])
        .map((c: any) => (typeof c === "string" ? c : c.name || ""))
        .filter(Boolean);

      if (condoNames.length > 0) {
        const matchingCondos = await prisma.condominium.findMany({
          where: {
            name: { in: condoNames, mode: "insensitive" },
          },
          select: { id: true },
        });
        condominiumIds.push(...matchingCondos.map((c) => c.id));
      }
    }

    // Fetch properties - two queries: one for condo match, one general
    const [condoProperties, generalProperties] = await Promise.all([
      // Properties in matching condominiums (high relevance)
      condominiumIds.length > 0
        ? prisma.property.findMany({
            where: {
              ...where,
              condominiumId: { in: condominiumIds },
            },
            select: {
              id: true,
              code: true,
              title: true,
              slug: true,
              type: true,
              subType: true,
              category: true,
              price: true,
              rentPrice: true,
              area: true,
              bedrooms: true,
              suites: true,
              bathrooms: true,
              parkingSpaces: true,
              neighborhood: true,
              city: true,
              thumbnail: true,
              isFurnished: true,
              acceptsExchange: true,
              acceptsFinancing: true,
              acceptsDirectPayment: true,
              condominiumId: true,
              condominium: {
                select: { id: true, name: true },
              },
            },
            orderBy: { price: "asc" },
            take: 50,
          })
        : Promise.resolve([]),

      // General properties matching criteria
      prisma.property.findMany({
        where: {
          ...where,
          ...(condominiumIds.length > 0
            ? { condominiumId: { notIn: condominiumIds } }
            : {}),
        },
        select: {
          id: true,
          code: true,
          title: true,
          slug: true,
          type: true,
          subType: true,
          category: true,
          price: true,
          rentPrice: true,
          area: true,
          bedrooms: true,
          suites: true,
          bathrooms: true,
          parkingSpaces: true,
          neighborhood: true,
          city: true,
          thumbnail: true,
          isFurnished: true,
          acceptsExchange: true,
          acceptsFinancing: true,
          acceptsDirectPayment: true,
          condominiumId: true,
          condominium: {
            select: { id: true, name: true },
          },
        },
        orderBy: { price: "asc" },
        take: 50,
      }),
    ]);

    // Score and rank properties
    const scoreProperty = (prop: any) => {
      let score = 0;
      const reasons: string[] = [];

      // Condominium match (highest weight)
      if (condominiumIds.includes(prop.condominiumId)) {
        score += 50;
        reasons.push("Condomínio de interesse");
      }

      // Price within budget range
      if (minBudget && maxBudget) {
        if (prop.price >= minBudget && prop.price <= maxBudget) {
          score += 30;
          reasons.push("Dentro do orçamento");
        } else if (
          prop.price >= minBudget * 0.8 &&
          prop.price <= maxBudget * 1.2
        ) {
          score += 15;
          reasons.push("Próximo do orçamento");
        }
      } else if (maxBudget) {
        if (prop.price <= maxBudget) {
          score += 30;
          reasons.push("Dentro do orçamento");
        }
      }

      // Typology match
      if (
        lead.searchTypologies &&
        lead.searchTypologies.includes(prop.type)
      ) {
        score += 15;
        reasons.push("Tipo compatível");
      }

      // Bedrooms match
      if (lead.searchBedrooms) {
        const beds = parseInt(lead.searchBedrooms);
        if (prop.bedrooms === beds) {
          score += 10;
          reasons.push("Quartos exatos");
        } else if (prop.bedrooms > beds) {
          score += 5;
          reasons.push("Mais quartos");
        }
      }

      // Permuta compatibility
      if (lead.hasPermuta && prop.acceptsExchange) {
        score += 10;
        reasons.push("Aceita permuta");
      }

      // Financing compatibility
      if (lead.hasFinancing && prop.acceptsFinancing) {
        score += 5;
        reasons.push("Aceita financiamento");
      }

      // Direct payment compatibility
      if (lead.directInstallment && prop.acceptsDirectPayment) {
        score += 5;
        reasons.push("Aceita parcelamento direto");
      }

      // Furnished match
      if (lead.searchFurnished === true && prop.isFurnished) {
        score += 5;
        reasons.push("Mobiliado");
      }

      return { ...prop, matchScore: score, matchReasons: reasons };
    };

    const allProperties = [...condoProperties, ...generalProperties];
    const scored = allProperties.map(scoreProperty);

    // Sort by score descending
    scored.sort((a, b) => b.matchScore - a.matchScore);

    // Criteria summary for UI
    const criteria = {
      ticket: lead.ticket,
      minBudget: lead.minBudget,
      maxBudget: lead.maxBudget,
      typologies: lead.searchTypologies,
      bedrooms: lead.searchBedrooms,
      furnished: lead.searchFurnished,
      hasPermuta: lead.hasPermuta,
      hasFinancing: lead.hasFinancing,
      directInstallment: lead.directInstallment,
      condominiums: (lead.condominiumsOfInterest as any[])?.map((c: any) =>
        typeof c === "string" ? c : c.name
      ),
    };

    return NextResponse.json({
      properties: scored.slice(0, 30),
      total: scored.length,
      criteria,
    });
  } catch (error) {
    console.error("Erro ao buscar imóveis compatíveis:", error);
    return NextResponse.json(
      { error: "Erro ao buscar imóveis compatíveis" },
      { status: 500 }
    );
  }
}
