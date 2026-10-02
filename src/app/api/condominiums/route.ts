import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar condomínios
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const city = searchParams.get("city") || "";

    const condominiums = await prisma.condominium.findMany({
      where: {
        AND: [
          search ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { neighborhood: { contains: search, mode: "insensitive" } },
            ],
          } : {},
          city ? { city: { equals: city, mode: "insensitive" } } : {},
        ],
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        condoType: true,
        address: true,
        number: true,
        neighborhood: true,
        city: true,
        state: true,
        zipCode: true,
        fakeAddress: true,
        fakeNumber: true,
        showRealAddress: true,
        totalUnits: true,
        builder: true,
        amenities: true,
        thumbnail: true,
        towers: {
          select: {
            id: true,
            name: true,
            floors: true,
            unitsPerFloor: true,
            totalUnits: true,
          },
          orderBy: { name: "asc" },
        },
        _count: {
          select: { properties: true },
        },
      },
    });

    return NextResponse.json({ condominiums });
  } catch (error) {
    console.error("Erro ao buscar condomínios:", error);
    return NextResponse.json(
      { error: "Erro ao buscar condomínios" },
      { status: 500 }
    );
  }
}

// POST - Criar condomínio
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Gerar slug
    const slug = data.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const condominium = await prisma.condominium.create({
      data: {
        name: data.name,
        slug,
        condoType: data.condoType || "VERTICAL",
        address: data.address,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        totalUnits: data.totalUnits,
        yearBuilt: data.yearBuilt,
        builder: data.builder,
        amenities: data.amenities || [],
        adminName: data.adminName,
        adminPhone: data.adminPhone,
        adminEmail: data.adminEmail,
        thumbnail: data.thumbnail,
        images: data.images || [],
      },
    });

    return NextResponse.json({ condominium }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar condomínio:", error);
    return NextResponse.json(
      { error: "Erro ao criar condomínio" },
      { status: 500 }
    );
  }
}
