import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar corretores parceiros (BusinessPartner) para seleção de gestor de exclusividade
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const where: any = {
      type: "CORRETOR",
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { creci: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    const brokers = await prisma.businessPartner.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        creci: true,
        avatar: true,
        cpf: true,
        gender: true,
        isActive: true,
        agency: {
          select: {
            id: true,
            companyName: true,
            tradeName: true,
          },
        },
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
