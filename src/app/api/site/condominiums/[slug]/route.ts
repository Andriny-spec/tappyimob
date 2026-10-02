import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Buscar condomínio por slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const condominium = await prisma.condominium.findFirst({
      where: {
        slug,
        isActive: true,
      },
      include: {
        properties: {
          where: {
            status: "DISPONIVEL",
          },
          select: {
            id: true,
            code: true,
            title: true,
            slug: true,
            type: true,
            category: true,
            status: true,
            price: true,
            rentPrice: true,
            area: true,
            bedrooms: true,
            suites: true,
            bathrooms: true,
            parkingSpaces: true,
            thumbnail: true,
            images: true,
            neighborhood: true,
            city: true,
            state: true,
            isFeatured: true,
            isExclusive: true,
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        _count: {
          select: { 
            properties: {
              where: { status: "DISPONIVEL" }
            }
          },
        },
      },
    });

    if (!condominium) {
      return NextResponse.json(
        { error: "Condomínio não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(condominium);
  } catch (error) {
    console.error("Erro ao buscar condomínio:", error);
    return NextResponse.json(
      { error: "Erro ao buscar condomínio" },
      { status: 500 }
    );
  }
}
