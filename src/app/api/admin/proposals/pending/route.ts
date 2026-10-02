import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET - List pending (non-refused) proposals for the current broker
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const isAdmin = session.role === "ADMIN";

    const where: any = {
      status: { in: ["PENDENTE", "EM_NEGOCIACAO", "CONTRA_PROPOSTA"] },
    };

    if (!isAdmin) {
      where.corretorId = session.id;
    }

    const proposals = await prisma.propertyProposal.findMany({
      where,
      select: {
        id: true,
        propertyId: true,
        status: true,
        proposedValue: true,
        updatedAt: true,
        property: {
          select: {
            code: true,
            title: true,
          },
        },
      },
      orderBy: { updatedAt: "asc" },
      take: 20,
    });

    return NextResponse.json({ proposals });
  } catch (error) {
    console.error("Erro ao buscar propostas pendentes:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
