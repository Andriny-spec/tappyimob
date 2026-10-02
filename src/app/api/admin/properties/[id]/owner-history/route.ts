import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET - Buscar histórico de proprietários do imóvel
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Buscar imóvel com dados do proprietário atual e histórico
    const property = await (prisma.property.findUnique as any)({
      where: { id },
      select: {
        id: true,
        code: true,
        prefeituraOwnerName: true,
        prefeituraOwnerCpf: true,
        propertyOwner: {
          select: {
            id: true,
            name: true,
            cpf: true,
            email: true,
            phones: true,
            createdAt: true,
          },
        },
        ownerHistory: {
          orderBy: [
            { type: "asc" },
            { startDate: "desc" },
            { createdAt: "desc" },
          ],
        },
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Imóvel não encontrado" }, { status: 404 });
    }

    // Montar timeline completa
    const history: any[] = [];

    // Adicionar proprietário atual (PropertyOwner)
    if (property.propertyOwner) {
      history.push({
        id: property.propertyOwner.id,
        type: "ATUAL",
        name: property.propertyOwner.name,
        cpf: property.propertyOwner.cpf,
        email: property.propertyOwner.email,
        phone: property.propertyOwner.phones?.[0] || null,
        startDate: null,
        endDate: null,
        notes: null,
        createdAt: property.propertyOwner.createdAt,
      });
    }

    // Adicionar dados da prefeitura
    if (property.prefeituraOwnerName) {
      history.push({
        id: `prefeitura-${property.id}`,
        type: "PREFEITURA",
        name: property.prefeituraOwnerName,
        cpf: property.prefeituraOwnerCpf,
        email: null,
        phone: null,
        startDate: null,
        endDate: null,
        notes: "Dados importados do cadastro da prefeitura (IPTU)",
        createdAt: new Date(),
      });
    }

    // Adicionar histórico de proprietários
    property.ownerHistory.forEach((entry: any) => {
      history.push({
        id: entry.id,
        type: entry.type,
        name: entry.name,
        cpf: entry.cpf,
        email: entry.email,
        phone: entry.phone,
        startDate: entry.startDate,
        endDate: entry.endDate,
        notes: entry.notes,
        createdAt: entry.createdAt,
      });
    });

    // Ordenar por tipo (ATUAL primeiro, depois PREFEITURA, depois ANTERIOR) e data
    const typeOrder = { ATUAL: 0, PREFEITURA: 1, ANTERIOR: 2 };
    history.sort((a, b) => {
      const typeA = typeOrder[a.type as keyof typeof typeOrder] ?? 3;
      const typeB = typeOrder[b.type as keyof typeof typeOrder] ?? 3;
      if (typeA !== typeB) return typeA - typeB;
      // Se mesmo tipo, ordenar por data mais recente
      const dateA = a.startDate ? new Date(a.startDate).getTime() : a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.startDate ? new Date(b.startDate).getTime() : b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json({
      propertyId: property.id,
      propertyCode: property.code,
      history,
    });
  } catch (error) {
    console.error("Erro ao buscar histórico de proprietários:", error);
    return NextResponse.json(
      { error: "Erro ao buscar histórico de proprietários" },
      { status: 500 }
    );
  }
}
