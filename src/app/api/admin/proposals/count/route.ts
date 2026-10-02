import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET - Count active proposals for a corretor
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const corretorId = request.nextUrl.searchParams.get("corretorId");
    const isAdmin = session.role === "ADMIN";

    const where: any = {
      status: { notIn: ["RECUSADA", "CANCELADA"] },
    };

    if (corretorId) {
      where.corretorId = corretorId;
    } else if (!isAdmin) {
      where.corretorId = session.id;
    }

    const count = await prisma.propertyProposal.count({ where });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Erro ao contar propostas:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
