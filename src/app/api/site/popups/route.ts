import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Buscar popups ativos para o site público
export async function GET(request: NextRequest) {
  try {
    const now = new Date();

    const popups = await prisma.popupBanner.findMany({
      where: {
        isActive: true,
        OR: [
          { startDate: null },
          { startDate: { lte: now } },
        ],
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } },
            ],
          },
        ],
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ popups });
  } catch (error) {
    console.error("Erro ao buscar popups:", error);
    return NextResponse.json({ popups: [] });
  }
}
