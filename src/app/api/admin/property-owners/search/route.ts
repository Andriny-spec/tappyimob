import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET - Buscar proprietário por telefone, CPF ou nome
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone") || "";
    const cpf = searchParams.get("cpf") || "";
    const name = searchParams.get("name") || "";

    if (!phone && !cpf && !name) {
      return NextResponse.json({ error: "Informe telefone, CPF ou nome para buscar" }, { status: 400 });
    }

    // Normalizar telefone (remover caracteres não numéricos)
    const normalizedPhone = phone.replace(/\D/g, "");

    const whereConditions: any[] = [];

    if (normalizedPhone) {
      // Buscar por telefone (parcial ou completo)
      whereConditions.push({
        phones: {
          hasSome: [normalizedPhone, phone],
        },
      });
      // Também buscar se algum telefone contém os dígitos
      whereConditions.push({
        phones: {
          has: normalizedPhone,
        },
      });
    }

    if (cpf) {
      const normalizedCpf = cpf.replace(/\D/g, "");
      whereConditions.push({
        cpf: { contains: normalizedCpf },
      });
    }

    if (name) {
      whereConditions.push({
        name: { contains: name, mode: "insensitive" },
      });
    }

    const owners = await prisma.propertyOwner.findMany({
      where: {
        OR: whereConditions,
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
            thumbnail: true,
          },
          take: 5,
        },
      },
      take: 10,
    });

    // Se buscar por telefone e não encontrar exato, tentar busca mais flexível
    if (normalizedPhone && owners.length === 0) {
      // Buscar proprietários onde algum telefone contém parte do número
      const allOwners = await prisma.propertyOwner.findMany({
        where: {
          phones: { isEmpty: false },
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
              thumbnail: true,
            },
            take: 5,
          },
        },
      });

      // Filtrar manualmente por telefones que contenham o número buscado
      const filtered = allOwners.filter(owner => 
        owner.phones.some(p => {
          const normalizedP = p.replace(/\D/g, "");
          return normalizedP.includes(normalizedPhone) || normalizedPhone.includes(normalizedP);
        })
      );

      return NextResponse.json({
        owners: filtered.slice(0, 10),
        total: filtered.length,
        searchType: "partial",
      });
    }

    return NextResponse.json({
      owners,
      total: owners.length,
      searchType: "exact",
    });
  } catch (error) {
    console.error("Erro ao buscar proprietário:", error);
    return NextResponse.json(
      { error: "Erro ao buscar proprietário" },
      { status: 500 }
    );
  }
}
