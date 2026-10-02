import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyFotografoAccess } from "@/lib/fotografo-auth";

const verifyToken = verifyFotografoAccess;

// GET - Listar sessões do fotógrafo
export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: any = {
      OR: [
        { photographerId: user.userId },
        { photographerIds: { has: user.userId } },
      ],
    };

    if (status) {
      where.status = status;
    }

    const sessions = await prisma.photoSession.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            code: true,
            title: true,
            address: true,
            number: true,
            neighborhood: true,
            city: true,
            thumbnail: true,
            type: true,
          },
        },
        broker: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: { media: true },
        },
      },
      orderBy: { scheduledDate: "asc" },
    });

    // Calcular estatísticas
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const stats = {
      today: sessions.filter((s) => {
        const d = new Date(s.scheduledDate);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime() && s.status !== "CANCELADO";
      }).length,
      week: sessions.filter((s) => {
        const d = new Date(s.scheduledDate);
        return d >= today && d < endOfWeek && s.status !== "CANCELADO";
      }).length,
      pending: sessions.filter((s) => 
        ["AGENDADO", "PENDENTE_CONFIRMACAO"].includes(s.status)
      ).length,
      completed: sessions.filter((s) => s.status === "CONCLUIDO").length,
    };

    return NextResponse.json({ sessions, stats });
  } catch (error) {
    console.error("Erro ao listar sessões:", error);
    return NextResponse.json({ error: "Erro ao listar sessões" }, { status: 500 });
  }
}

// PUT - Atualizar status da sessão (fotógrafo pode marcar como concluído, etc)
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, status, notes } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "ID da sessão é obrigatório" }, { status: 400 });
    }

    // Verificar se a sessão pertence ao fotógrafo
    const session = await prisma.photoSession.findFirst({
      where: {
        id: sessionId,
        OR: [
          { photographerId: user.userId },
          { photographerIds: { has: user.userId } },
        ],
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 });
    }

    // Atualizar sessão
    const updated = await prisma.photoSession.update({
      where: { id: sessionId },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        property: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({ session: updated });
  } catch (error) {
    console.error("Erro ao atualizar sessão:", error);
    return NextResponse.json({ error: "Erro ao atualizar sessão" }, { status: 500 });
  }
}
