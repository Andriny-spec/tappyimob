import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar corretores
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

    const corretores = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        creci: true,
        region: true,
        role: true,
        isActive: true,
        rating: true,
        ratingCount: true,
        totalSales: true,
        totalValue: true,
        conversionRate: true,
        createdAt: true,
        _count: {
          select: {
            leads: true,
            comissoes: true,
          },
        },
      },
      orderBy: { totalSales: "desc" },
    });

    // Calcular ranking
    const corretoresWithRanking = corretores.map((c, index) => ({
      ...c,
      ranking: index + 1,
      leadsActive: c._count.leads,
    }));

    return NextResponse.json(corretoresWithRanking);
  } catch (error) {
    console.error("Error fetching corretores:", error);
    return NextResponse.json(
      { error: "Erro ao buscar corretores" },
      { status: 500 }
    );
  }
}

// POST - Criar corretor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Hash da senha (em produção, usar bcrypt)
    const hashedPassword = body.password; // TODO: hash password

    const corretor = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        password: hashedPassword,
        role: "CORRETOR",
        creci: body.creci,
        region: body.region,
        bio: body.bio,
      },
    });

    return NextResponse.json(corretor, { status: 201 });
  } catch (error) {
    console.error("Error creating corretor:", error);
    return NextResponse.json(
      { error: "Erro ao criar corretor" },
      { status: 500 }
    );
  }
}
