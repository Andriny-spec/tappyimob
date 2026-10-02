import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Sincronizar imóveis com condomínios baseado no nome
export async function POST(request: NextRequest) {
  try {
    // Buscar todos os condomínios
    const condominiums = await prisma.condominium.findMany({
      select: { id: true, name: true },
    });

    let totalUpdated = 0;
    const updates: { condominium: string; count: number }[] = [];

    // Para cada condomínio, buscar imóveis que mencionam o nome no título ou descrição
    for (const condo of condominiums) {
      // Buscar imóveis sem condominiumId que mencionam este condomínio
      const properties = await prisma.property.findMany({
        where: {
          condominiumId: null,
          OR: [
            { title: { contains: condo.name, mode: "insensitive" } },
            { neighborhood: { contains: condo.name, mode: "insensitive" } },
          ],
        },
        select: { id: true },
      });

      if (properties.length > 0) {
        const propIds = properties.map(p => p.id);
        // Buscar updatedAt de todos os imóveis antes de atualizar
        const propsBefore = await prisma.property.findMany({
          where: { id: { in: propIds } },
          select: { id: true, updatedAt: true },
        });
        // Atualizar esses imóveis com o condominiumId
        const result = await prisma.property.updateMany({
          where: {
            id: { in: propIds },
          },
          data: {
            condominiumId: condo.id,
          },
        });
        // Preservar updatedAt original — sync de condomínio não altera essa data
        for (const p of propsBefore) {
          await prisma.$executeRaw`UPDATE "properties" SET "updatedAt" = ${p.updatedAt} WHERE "id" = ${p.id}`;
        }

        totalUpdated += result.count;
        updates.push({ condominium: condo.name, count: result.count });
      }
    }

    return NextResponse.json({ 
      success: true, 
      totalUpdated,
      updates,
    });
  } catch (error) {
    console.error("Erro ao sincronizar:", error);
    return NextResponse.json(
      { error: "Erro ao sincronizar imóveis com condomínios" },
      { status: 500 }
    );
  }
}

// GET - Verificar status atual da vinculação
export async function GET() {
  try {
    const [total, withCondo, withoutCondo] = await Promise.all([
      prisma.property.count(),
      prisma.property.count({ where: { condominiumId: { not: null } } }),
      prisma.property.count({ where: { condominiumId: null } }),
    ]);

    return NextResponse.json({
      total,
      withCondominium: withCondo,
      withoutCondominium: withoutCondo,
    });
  } catch (error) {
    console.error("Erro:", error);
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}
