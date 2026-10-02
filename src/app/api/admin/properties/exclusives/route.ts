import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET - Buscar imóveis exclusivos
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar imóveis que são exclusivos OU que têm dados de exclusividade
    const properties = await prisma.property.findMany({
      where: {
        OR: [
          { isExclusive: true },
          { exclusivity: { isNot: null } },
        ],
      },
      orderBy: [
        { isExclusive: "desc" },
        { updatedAt: "desc" },
      ],
      select: {
        id: true,
        code: true,
        title: true,
        thumbnail: true,
        neighborhood: true,
        city: true,
        price: true,
        status: true,
        isExclusive: true,
        exclusivity: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            captadorName: true,
            gestorName: true,
            lastFeedbackDate: true,
            feedbackIntervalDays: true,
          },
        },
        owner: {
          select: {
            name: true,
          },
        },
        propertyOwner: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ properties });
  } catch (error) {
    console.error("Erro ao buscar imóveis exclusivos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar imóveis exclusivos" },
      { status: 500 }
    );
  }
}
