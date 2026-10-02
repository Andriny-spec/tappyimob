import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar corretores/brokers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const search = searchParams.get("search");
    const isActive = searchParams.get("isActive");

    const where: any = {
      role: { in: ["CORRETOR", "ADMIN"] },
    };

    if (isActive !== null) {
      where.isActive = isActive === "true";
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { creci: { contains: search, mode: "insensitive" } },
      ];
    }

    const brokers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        creci: true,
        region: true,
        isActive: true,
        rating: true,
        ratingCount: true,
        totalSales: true,
        totalValue: true,
        conversionRate: true,
        createdAt: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ brokers });
  } catch (error) {
    console.error("Error fetching brokers:", error);
    return NextResponse.json(
      { error: "Erro ao buscar corretores" },
      { status: 500 }
    );
  }
}
