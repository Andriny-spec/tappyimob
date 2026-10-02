import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Buscar matches de permuta (leads com permuta x imóveis compatíveis)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get("leadId");

    // Buscar leads com permuta
    const leadsWithPermuta = await prisma.lead.findMany({
      where: {
        hasPermuta: true,
        isBanned: false,
        archivedAt: null,
        status: { notIn: ["FECHADO", "PERDIDO", "ARQUIVADO"] },
        ...(leadId ? { id: leadId } : {}),
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        permutaValue: true,
        permutaLocation: true,
        permutaDescription: true,
        budget: true,
        minBudget: true,
        maxBudget: true,
        ticket: true,
        property: {
          select: {
            id: true,
            code: true,
            title: true,
            price: true,
          },
        },
      },
    });

    // Para cada lead com permuta, buscar imóveis compatíveis
    const matches = await Promise.all(
      leadsWithPermuta.map(async (lead) => {
        // Calcular range de preço considerando permuta
        const permutaValue = lead.permutaValue || 0;
        const budget = lead.budget || lead.maxBudget || 0;
        const totalBudget = permutaValue + budget;

        // Buscar imóveis na faixa de preço
        const compatibleProperties = await prisma.property.findMany({
          where: {
            status: "ATIVO",
            price: {
              gte: totalBudget * 0.7, // 70% do budget
              lte: totalBudget * 1.3, // 130% do budget
            },
            // Se tem localização da permuta, priorizar mesma região
            ...(lead.permutaLocation
              ? {
                  OR: [
                    { neighborhood: { contains: lead.permutaLocation, mode: "insensitive" } },
                    { city: { contains: lead.permutaLocation, mode: "insensitive" } },
                  ],
                }
              : {}),
          },
          select: {
            id: true,
            code: true,
            title: true,
            price: true,
            neighborhood: true,
            city: true,
            thumbnail: true,
            type: true,
            category: true,
            bedrooms: true,
            area: true,
          },
          take: 10,
          orderBy: { price: "asc" },
        });

        // Calcular score de compatibilidade
        const scoredProperties = compatibleProperties.map((property) => {
          let score = 0;

          // Score por proximidade de preço
          const priceDiff = Math.abs(property.price - totalBudget) / totalBudget;
          score += Math.max(0, 100 - priceDiff * 100);

          // Score por localização (se bate com permuta)
          if (lead.permutaLocation) {
            const locationMatch =
              property.neighborhood?.toLowerCase().includes(lead.permutaLocation.toLowerCase()) ||
              property.city?.toLowerCase().includes(lead.permutaLocation.toLowerCase());
            if (locationMatch) score += 20;
          }

          return {
            ...property,
            matchScore: Math.round(score),
            permutaDiff: property.price - totalBudget,
          };
        });

        // Ordenar por score
        scoredProperties.sort((a, b) => b.matchScore - a.matchScore);

        return {
          lead: {
            id: lead.id,
            name: lead.name,
            phone: lead.phone,
            permutaValue: lead.permutaValue,
            permutaLocation: lead.permutaLocation,
            permutaDescription: lead.permutaDescription,
            budget: lead.budget,
            totalBudget,
            propertyOfInterest: lead.property,
          },
          matches: scoredProperties,
          matchCount: scoredProperties.length,
        };
      })
    );

    return NextResponse.json({
      totalLeadsWithPermuta: leadsWithPermuta.length,
      matches: leadId ? matches[0] : matches,
    });
  } catch (error) {
    console.error("Erro ao buscar matches de permuta:", error);
    return NextResponse.json({ error: "Erro ao buscar matches de permuta" }, { status: 500 });
  }
}

// POST - Registrar interesse em match de permuta
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId, propertyId, notes } = body;

    if (!leadId || !propertyId) {
      return NextResponse.json(
        { error: "leadId e propertyId são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o lead existe e tem permuta
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead || !lead.hasPermuta) {
      return NextResponse.json(
        { error: "Lead não encontrado ou não possui permuta" },
        { status: 404 }
      );
    }

    // Registrar interesse no imóvel (criar/atualizar LeadProperty)
    const leadProperty = await prisma.leadProperty.upsert({
      where: {
        leadId_propertyId: { leadId, propertyId },
      },
      create: {
        leadId,
        propertyId,
        type: "INTERESSE_PERMUTA",
        notes,
      },
      update: {
        type: "INTERESSE_PERMUTA",
        notes,
        updatedAt: new Date(),
      },
    });

    // Registrar atividade
    await prisma.leadActivity.create({
      data: {
        leadId,
        type: "permuta_match",
        description: `Interesse registrado em imóvel via match de permuta`,
        metadata: { propertyId, notes },
      },
    });

    return NextResponse.json({
      success: true,
      leadProperty,
    });
  } catch (error) {
    console.error("Erro ao registrar match de permuta:", error);
    return NextResponse.json({ error: "Erro ao registrar match" }, { status: 500 });
  }
}
