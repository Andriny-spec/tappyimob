import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Buscar imóveis compatíveis para permuta
// Lógica: Imóvel A aceita permuta de X até Y -> buscar imóveis com preço entre X e Y que também aceitam permuta
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");
    const tolerance = parseFloat(searchParams.get("tolerance") || "0.1"); // 10% de margem padrão

    if (!propertyId) {
      return NextResponse.json(
        { error: "propertyId é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar o imóvel de referência
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        code: true,
        title: true,
        type: true,
        price: true,
        acceptsExchange: true,
        exchangeType: true,
        exchangeMinValue: true,
        exchangeMaxValue: true,
        city: true,
        neighborhood: true,
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Imóvel não encontrado" },
        { status: 404 }
      );
    }

    if (!property.acceptsExchange) {
      return NextResponse.json({
        property,
        matches: [],
        message: "Este imóvel não aceita permuta",
      });
    }

    // Calcular faixa de busca com margem de tolerância
    const minValue = property.exchangeMinValue 
      ? property.exchangeMinValue * (1 - tolerance) 
      : property.price * 0.5;
    const maxValue = property.exchangeMaxValue 
      ? property.exchangeMaxValue * (1 + tolerance) 
      : property.price * 1.5;

    // Buscar imóveis compatíveis
    // Critérios:
    // 1. Aceita permuta
    // 2. Preço está dentro da faixa que o imóvel de referência aceita
    // 3. O imóvel de referência está dentro da faixa que o outro aceita (match bidirecional)
    // 4. Não é o mesmo imóvel
    // 5. Está disponível
    const matches = await prisma.property.findMany({
      where: {
        id: { not: propertyId },
        status: "DISPONIVEL",
        acceptsExchange: true,
        price: {
          gte: minValue,
          lte: maxValue,
        },
        // Match bidirecional: o outro imóvel também deve aceitar o valor do imóvel de referência
        OR: [
          // Caso 1: O outro imóvel tem faixa definida e o preço de referência está dentro
          {
            AND: [
              { exchangeMinValue: { lte: property.price * (1 + tolerance) } },
              { exchangeMaxValue: { gte: property.price * (1 - tolerance) } },
            ],
          },
          // Caso 2: O outro imóvel não tem faixa definida (aceita qualquer valor)
          {
            exchangeMinValue: null,
            exchangeMaxValue: null,
          },
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
      orderBy: [
        // Ordenar por proximidade de valor
        { price: "asc" },
      ],
      take: 20,
    });

    // Calcular score de compatibilidade para cada match
    const matchesWithScore = matches.map((match) => {
      // Score baseado em:
      // 1. Proximidade de valor (quanto mais próximo, melhor)
      // 2. Tipo de imóvel compatível
      // 3. Mesma cidade/região

      const priceDiff = Math.abs(match.price - property.price);
      const priceScore = Math.max(0, 100 - (priceDiff / property.price) * 100);

      const typeMatch = property.exchangeType
        ? match.type.toLowerCase().includes(property.exchangeType.toLowerCase()) ||
          property.exchangeType.toLowerCase().includes(match.type.toLowerCase())
        : true;
      const typeScore = typeMatch ? 20 : 0;

      const sameCity = match.city === property.city;
      const sameNeighborhood = match.neighborhood === property.neighborhood;
      const locationScore = sameNeighborhood ? 20 : sameCity ? 10 : 0;

      const totalScore = Math.round(priceScore * 0.6 + typeScore + locationScore);

      return {
        ...match,
        matchScore: totalScore,
        matchDetails: {
          priceScore: Math.round(priceScore),
          typeMatch,
          sameCity,
          sameNeighborhood,
          priceDifference: priceDiff,
        },
      };
    });

    // Ordenar por score
    matchesWithScore.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({
      property,
      matches: matchesWithScore,
      searchCriteria: {
        minValue,
        maxValue,
        tolerance,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar permutas compatíveis:", error);
    return NextResponse.json(
      { error: "Erro ao buscar permutas compatíveis" },
      { status: 500 }
    );
  }
}
