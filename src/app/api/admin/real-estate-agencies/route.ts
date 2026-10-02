import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar imobiliárias
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const creciStatus = searchParams.get("creciStatus");
    const isActive = searchParams.get("isActive");
    const isAdministrator = searchParams.get("isAdministrator");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");

    const where: any = {};

    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: "insensitive" } },
        { tradeName: { contains: search, mode: "insensitive" } },
        { cnpj: { contains: search, mode: "insensitive" } },
        { creciJuridico: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (creciStatus) {
      where.creciStatus = creciStatus;
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    if (isAdministrator !== null && isAdministrator !== undefined) {
      where.isAdministrator = isAdministrator === "true";
    }

    const [agencies, total] = await Promise.all([
      prisma.realEstateAgency.findMany({
        where,
        include: {
          _count: {
            select: {
              partners: true,
              visits: true,
              proposals: true,
            },
          },
        },
        orderBy: { companyName: "asc" },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.realEstateAgency.count({ where }),
    ]);

    return NextResponse.json({
      agencies,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Erro ao listar imobiliárias:", error);
    return NextResponse.json({ error: "Erro ao listar imobiliárias" }, { status: 500 });
  }
}

// POST - Criar imobiliária
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verificar se CNPJ já existe
    if (body.cnpj) {
      const existing = await prisma.realEstateAgency.findUnique({
        where: { cnpj: body.cnpj },
      });
      if (existing) {
        return NextResponse.json({ error: "CNPJ já cadastrado" }, { status: 400 });
      }
    }

    const agency = await prisma.realEstateAgency.create({
      data: {
        companyName: body.companyName,
        tradeName: body.tradeName,
        cnpj: body.cnpj,
        creciJuridico: body.creciJuridico,
        creciStatus: body.creciStatus || "ATIVO",
        phone: body.phone,
        email: body.email,
        website: body.website,
        address: body.address,
        number: body.number,
        complement: body.complement,
        neighborhood: body.neighborhood,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        mainPartnerId: body.mainPartnerId,
        isAdministrator: body.isAdministrator || false,
        branches: body.branches,
        logo: body.logo,
        tags: body.tags || [],
      },
    });

    // Registrar atividade
    await prisma.businessPartnerActivity.create({
      data: {
        agencyId: agency.id,
        type: "CADASTRO",
        description: `Imobiliária ${agency.companyName} cadastrada`,
      },
    });

    return NextResponse.json(agency, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar imobiliária:", error);
    return NextResponse.json({ error: "Erro ao criar imobiliária" }, { status: 500 });
  }
}
