import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Atribuir lead a um corretor
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { corretorId } = body;

    if (!corretorId) {
      return NextResponse.json(
        { error: "corretorId é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se o lead existe
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
    }

    // Verificar se o corretor existe
    const corretor = await prisma.user.findUnique({ where: { id: corretorId } });
    if (!corretor) {
      return NextResponse.json({ error: "Corretor não encontrado" }, { status: 404 });
    }

    // Atualizar o lead (forçar status NOVO ao reatribuir)
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        corretorId,
        status: "NOVO",
        updatedAt: new Date(),
      },
      include: {
        corretor: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    // Criar notificação para o corretor
    await prisma.notification.create({
      data: {
        userId: corretorId,
        type: "LEAD_ATRIBUIDO",
        title: `${lead.name} — Novo lead atribuído`,
        message: `O cliente "${lead.name}" foi atribuído a você.`,
        read: false,
      },
    });

    return NextResponse.json({
      success: true,
      lead: updatedLead,
      message: `Lead atribuído a ${corretor.name}`,
    });
  } catch (error) {
    console.error("Erro ao atribuir lead:", error);
    return NextResponse.json(
      { error: "Erro ao atribuir lead" },
      { status: 500 }
    );
  }
}

// GET - Próximo corretor no rodízio
export async function GET(request: NextRequest) {
  try {
    // Buscar corretores ativos
    const corretores = await prisma.user.findMany({
      where: {
        role: "CORRETOR",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
    });

    // Contar leads ativos de cada corretor
    const corretoresWithCount = await Promise.all(
      corretores.map(async (corretor) => {
        const leadsCount = await prisma.lead.count({
          where: {
            corretorId: corretor.id,
            status: { notIn: ["FECHADO", "PERDIDO"] },
          },
        });
        return {
          ...corretor,
          leadsCount,
        };
      })
    );

    // Ordenar por quantidade de leads (menos primeiro)
    const sorted = corretoresWithCount.sort((a, b) => a.leadsCount - b.leadsCount);

    // O primeiro é o próximo no rodízio (menos leads)
    const nextInQueue = sorted[0] || null;

    return NextResponse.json({
      corretores: sorted,
      nextInQueue,
    });
  } catch (error) {
    console.error("Erro ao buscar rodízio:", error);
    return NextResponse.json(
      { error: "Erro ao buscar rodízio" },
      { status: 500 }
    );
  }
}
