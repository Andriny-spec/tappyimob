import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET - Listar proprietários/vendedores com contagem de imóveis
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const phone = searchParams.get("phone") || "";
    const sortBy = searchParams.get("sortBy") || "properties"; // properties, name, createdAt
    const minProperties = parseInt(searchParams.get("minProperties") || "0");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Buscar todos os proprietários com contagem de imóveis
    const owners = await prisma.propertyOwner.findMany({
      where: {
        AND: [
          search ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { cpf: { contains: search, mode: "insensitive" } },
            ],
          } : {},
          phone ? {
            phones: { has: phone },
          } : {},
        ],
      },
      include: {
        _count: {
          select: { properties: true },
        },
        properties: {
          select: {
            id: true,
            code: true,
            title: true,
            price: true,
            status: true,
            category: true,
            thumbnail: true,
            address: true,
            neighborhood: true,
            city: true,
          },
          orderBy: { price: "desc" },
        },
      },
      orderBy: sortBy === "name" 
        ? { name: "asc" } 
        : sortBy === "createdAt" 
        ? { createdAt: "desc" } 
        : undefined,
    });

    // Filtrar por mínimo de propriedades e ordenar se necessário
    let filteredOwners = owners.filter(o => o._count.properties >= minProperties);

    // Ordenar por número de propriedades se necessário
    if (sortBy === "properties") {
      filteredOwners.sort((a, b) => b._count.properties - a._count.properties);
    }

    // Calcular patrimônio total de cada proprietário
    const ownersWithPatrimony = filteredOwners.map(owner => {
      const totalValue = owner.properties.reduce((acc, p) => acc + (p.price || 0), 0);
      const activeProperties = owner.properties.filter(p => p.status === "DISPONIVEL").length;
      const soldProperties = owner.properties.filter(p => p.status === "VENDIDO" || p.status === "ALUGADO").length;
      
      return {
        ...owner,
        patrimony: {
          totalValue,
          totalProperties: owner._count.properties,
          activeProperties,
          soldProperties,
        },
      };
    });

    // Paginação
    const total = ownersWithPatrimony.length;
    const paginatedOwners = ownersWithPatrimony.slice((page - 1) * limit, page * limit);

    // Estatísticas gerais
    const stats = {
      totalOwners: owners.length,
      ownersWithMultiple: owners.filter(o => o._count.properties > 1).length,
      totalPatrimony: ownersWithPatrimony.reduce((acc, o) => acc + o.patrimony.totalValue, 0),
      avgPropertiesPerOwner: owners.length > 0 
        ? (owners.reduce((acc, o) => acc + o._count.properties, 0) / owners.length).toFixed(1) 
        : 0,
    };

    return NextResponse.json({
      owners: paginatedOwners,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      stats,
    });
  } catch (error) {
    console.error("Erro ao listar proprietários:", error);
    return NextResponse.json(
      { error: "Erro ao listar proprietários" },
      { status: 500 }
    );
  }
}

// POST - Criar novo proprietário
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();

    // Extrair phones flat e phoneContacts (com nomes)
    const phoneContacts = body.phoneContacts || undefined;
    const phones = phoneContacts
      ? (phoneContacts as Array<{ name?: string; phone: string }>)
          .map((p: any) => p.phone?.trim())
          .filter(Boolean)
      : body.phones || [];

    const ownerData = {
      name: body.name,
      email: body.email || null,
      emails: (body.emails || []).filter((e: string) => e?.trim()),
      phones: phones,
      phoneContacts: phoneContacts || [],
      cpf: body.cpf || null,
      rg: body.rg || null,
      birthDate: body.birthDate ? new Date(body.birthDate) : null,
      profile: body.profile || "PROPRIETARIO",
      maritalStatus: body.maritalStatus || null,
      residentialAddress: body.residentialAddress || null,
      residentialNumber: body.residentialNumber || null,
      residentialComplement: body.residentialComplement || null,
      residentialNeighborhood: body.residentialNeighborhood || null,
      residentialCity: body.residentialCity || null,
      residentialState: body.residentialState || null,
      residentialZipCode: body.residentialZipCode || null,
      notes: body.notes || null,
    };

    // Upsert: se já existe com mesmo telefone ou CPF, atualizar
    let existing: any = null;
    if (phones.length > 0) {
      existing = await prisma.propertyOwner.findFirst({
        where: { phones: { hasSome: phones } },
      });
    }
    if (!existing && body.cpf) {
      existing = await prisma.propertyOwner.findFirst({
        where: { cpf: body.cpf },
      });
    }

    if (existing) {
      const owner = await prisma.propertyOwner.update({
        where: { id: existing.id },
        data: ownerData,
      });
      return NextResponse.json(owner, { status: 200 });
    }

    const owner = await prisma.propertyOwner.create({ data: ownerData });
    return NextResponse.json(owner, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar proprietário:", error);
    return NextResponse.json(
      { error: "Erro ao criar proprietário" },
      { status: 500 }
    );
  }
}
