import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar parceiros de negócios
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type");
    const creciStatus = searchParams.get("creciStatus");
    const agencyId = searchParams.get("agencyId");
    const isActive = searchParams.get("isActive");
    const partnershipFormat = searchParams.get("partnershipFormat");
    const partnershipTermStatus = searchParams.get("partnershipTermStatus");
    const createdFrom = searchParams.get("createdFrom");
    const createdTo = searchParams.get("createdTo");
    const minVisits = searchParams.get("minVisits");
    const minProposals = searchParams.get("minProposals");
    const minContracts = searchParams.get("minContracts");
    const tag = searchParams.get("tag");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { creci: { contains: search, mode: "insensitive" } },
        { cpf: { contains: search, mode: "insensitive" } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (creciStatus) {
      where.creciStatus = creciStatus;
    }

    if (agencyId) {
      where.agencyId = agencyId;
    }

    if (isActive !== null && isActive !== undefined && isActive !== "") {
      where.isActive = isActive === "true";
    }

    if (partnershipFormat) {
      where.partnershipFormat = partnershipFormat;
    }

    if (partnershipTermStatus) {
      where.partnershipTermStatus = partnershipTermStatus;
    }

    if (createdFrom || createdTo) {
      where.createdAt = {};
      if (createdFrom) where.createdAt.gte = new Date(createdFrom);
      if (createdTo) where.createdAt.lte = new Date(createdTo + "T23:59:59");
    }

    if (minVisits) {
      where.totalVisits = { gte: parseInt(minVisits) };
    }

    if (minProposals) {
      where.totalProposals = { gte: parseInt(minProposals) };
    }

    if (minContracts) {
      where.totalContracts = { gte: parseInt(minContracts) };
    }

    if (tag) {
      where.tags = { has: tag };
    }

    const [partners, total, stats] = await Promise.all([
      prisma.businessPartner.findMany({
        where,
        include: {
          agency: {
            select: {
              id: true,
              companyName: true,
              tradeName: true,
            },
          },
          _count: {
            select: {
              visits: true,
              proposals: true,
              contracts: true,
            },
          },
        },
        orderBy: { name: "asc" },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.businessPartner.count({ where }),
      prisma.businessPartner.groupBy({
        by: ["type"],
        _count: { id: true },
      }),
    ]);

    // Calcular totais por tipo
    const statsByType = {
      CORRETOR: stats.find((s) => s.type === "CORRETOR")?._count.id || 0,
      CORRESPONDENTE_BANCARIO: stats.find((s) => s.type === "CORRESPONDENTE_BANCARIO")?._count.id || 0,
      ARQUITETO: stats.find((s) => s.type === "ARQUITETO")?._count.id || 0,
      CONSTRUTORA: stats.find((s) => s.type === "CONSTRUTORA")?._count.id || 0,
    };

    return NextResponse.json({
      partners,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      stats: statsByType,
    });
  } catch (error) {
    console.error("Erro ao listar parceiros:", error);
    return NextResponse.json({ error: "Erro ao listar parceiros" }, { status: 500 });
  }
}

// POST - Criar parceiro
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verificar se CPF já existe
    if (body.cpf) {
      const existing = await prisma.businessPartner.findUnique({
        where: { cpf: body.cpf },
      });
      if (existing) {
        return NextResponse.json({ error: "CPF já cadastrado" }, { status: 400 });
      }
    }

    const partner = await prisma.businessPartner.create({
      data: {
        type: body.type || "CORRETOR",
        name: body.name,
        email: body.email,
        phone: body.phone,
        cpf: body.cpf,
        rg: body.rg,
        creci: body.creci,
        creciStatus: body.creciStatus || "ATIVO",
        gender: body.gender,
        birthDate: body.birthDate ? new Date(body.birthDate) : null,
        isAutonomous: body.isAutonomous ?? true,
        actingRegions: body.actingRegions || [],
        specialties: body.specialties || [],
        partnershipFormat: body.partnershipFormat || "CAPTADOR",
        attachments: body.attachments,
        address: body.address,
        neighborhood: body.neighborhood,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        avatar: body.avatar,
        partnershipTermStatus: body.partnershipTermStatus || "SEM_CONTRATO",
        tags: body.tags || [],
        agencyId: body.agencyId,
      },
      include: {
        agency: {
          select: {
            id: true,
            companyName: true,
            tradeName: true,
          },
        },
      },
    });

    // Registrar atividade
    await prisma.businessPartnerActivity.create({
      data: {
        partnerId: partner.id,
        type: "CADASTRO",
        description: `Parceiro ${partner.name} cadastrado`,
      },
    });

    return NextResponse.json(partner, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar parceiro:", error);
    return NextResponse.json({ error: "Erro ao criar parceiro" }, { status: 500 });
  }
}
