import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { recalcularPendencias } from "../route";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    const { id } = await params;
    const parcelas: any[] = await request.json();

    await prisma.$transaction([
      prisma.negocioParcela.deleteMany({ where: { negocioId: id } }),
      prisma.negocioParcela.createMany({
        data: parcelas.map((p, idx) => ({
          negocioId: id,
          tipo: p.tipo,
          valor: p.valor || 0,
          data: p.data ? new Date(p.data) : null,
          condicao: p.condicao || null,
          ordem: idx,
        })),
      }),
    ]);

    await recalcularPendencias(id);
    const result = await prisma.negocioParcela.findMany({ where: { negocioId: id }, orderBy: { ordem: "asc" } });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar parcelas" }, { status: 500 });
  }
}
