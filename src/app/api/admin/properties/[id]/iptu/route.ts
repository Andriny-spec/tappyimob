import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET - Buscar registros IPTU da base que correspondem a este imóvel
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Buscar o imóvel
    const property = await prisma.property.findUnique({
      where: { id },
      select: {
        id: true,
        address: true,
        number: true,
        neighborhood: true,
        city: true,
        zipCode: true,
        prefeituraInscricao: true,
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Imóvel não encontrado" }, { status: 404 });
    }

    // 1. Buscar por vínculo direto (propertyId)
    const linkedIptu = await (prisma.iptuBase as any).findMany({
      where: { propertyId: id },
      orderBy: { updatedAt: "desc" },
    });

    // 2. Buscar por inscrição imobiliária (se o imóvel já tem)
    let byInscricao: any[] = [];
    if (property.prefeituraInscricao) {
      byInscricao = await (prisma.iptuBase as any).findMany({
        where: {
          inscricaoImobiliaria: property.prefeituraInscricao,
          propertyId: { not: id },
        },
      });
    }

    // 3. Buscar por endereço similar
    const whereAddress: any = {
      propertyId: { not: id },
      AND: [] as any[],
    };

    if (property.address) {
      // Pegar palavras significativas do endereço
      const palavrasIgnorar = ["dos", "das", "de", "do", "da", "e", "a", "o", "as", "os", "rua", "avenida", "av", "alameda", "al", "travessa"];
      const palavras = property.address.split(/\s+/).filter(
        (p: string) => p.length > 2 && !palavrasIgnorar.includes(p.toLowerCase())
      );

      if (palavras.length > 0) {
        whereAddress.AND.push({
          OR: palavras.map((palavra: string) => ({
            address: { contains: palavra, mode: "insensitive" },
          })),
        });
      }
    }

    if (property.neighborhood) {
      whereAddress.AND.push({
        neighborhood: { contains: property.neighborhood, mode: "insensitive" },
      });
    }

    if (property.number) {
      whereAddress.AND.push({ number: property.number });
    }

    let byAddress: any[] = [];
    if (whereAddress.AND.length >= 2) {
      byAddress = await (prisma.iptuBase as any).findMany({
        where: whereAddress,
        take: 10,
        orderBy: { updatedAt: "desc" },
      });
    }

    // Deduplicar resultados
    const allIds = new Set<string>();
    const results: any[] = [];

    for (const item of [...linkedIptu, ...byInscricao, ...byAddress]) {
      if (!allIds.has(item.id)) {
        allIds.add(item.id);
        results.push({
          ...item,
          matchType: linkedIptu.some((l: any) => l.id === item.id)
            ? "VINCULADO"
            : byInscricao.some((l: any) => l.id === item.id)
            ? "INSCRICAO"
            : "ENDERECO",
        });
      }
    }

    return NextResponse.json({ items: results, total: results.length });
  } catch (error) {
    console.error("Erro ao buscar IPTU:", error);
    return NextResponse.json({ error: "Erro ao buscar IPTU" }, { status: 500 });
  }
}

// POST - Importar dados de um registro IPTU para os campos de prefeitura do imóvel
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { iptuId } = body;

    if (!iptuId) {
      return NextResponse.json({ error: "iptuId é obrigatório" }, { status: 400 });
    }

    // Buscar registro IPTU
    const iptuRecord = await (prisma.iptuBase as any).findUnique({
      where: { id: iptuId },
    });

    if (!iptuRecord) {
      return NextResponse.json({ error: "Registro IPTU não encontrado" }, { status: 404 });
    }

    // Atualizar campos de prefeitura no imóvel
    const propBeforeIptu = await prisma.property.findUnique({ where: { id }, select: { updatedAt: true } });
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        prefeituraOwnerName: iptuRecord.contribuinte || undefined,
        prefeituraOwnerCpf: iptuRecord.cpfCnpj || undefined,
        prefeituraInscricao: iptuRecord.inscricaoImobiliaria || undefined,
        prefeituraData: {
          areaTerreno: iptuRecord.areaTerreno,
          areaConstruida: iptuRecord.areaConstruida,
          tipoImovel: iptuRecord.tipoImovel,
          usoImovel: iptuRecord.usoImovel,
          anoConstricao: iptuRecord.anoConstricao,
          address: iptuRecord.address,
          number: iptuRecord.number,
          neighborhood: iptuRecord.neighborhood,
          city: iptuRecord.city,
          importedAt: new Date().toISOString(),
          iptuBaseId: iptuRecord.id,
        },
      },
      select: {
        prefeituraOwnerName: true,
        prefeituraOwnerCpf: true,
        prefeituraInscricao: true,
        prefeituraData: true,
      },
    });
    // Preservar updatedAt original — importação IPTU não altera essa data
    if (propBeforeIptu) await prisma.$executeRaw`UPDATE "properties" SET "updatedAt" = ${propBeforeIptu.updatedAt} WHERE "id" = ${id}`;

    // Vincular o registro IPTU ao imóvel
    await (prisma.iptuBase as any).update({
      where: { id: iptuId },
      data: {
        propertyId: id,
        matchStatus: "VINCULADO",
        matchedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      property: updatedProperty,
    });
  } catch (error) {
    console.error("Erro ao importar IPTU:", error);
    return NextResponse.json({ error: "Erro ao importar IPTU" }, { status: 500 });
  }
}
