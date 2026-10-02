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
    const corretores: any[] = await request.json();

    await prisma.$transaction([
      prisma.negocioCorretorEnvolvido.deleteMany({ where: { negocioId: id } }),
      prisma.negocioCorretorEnvolvido.createMany({
        data: corretores.map((c) => ({
          negocioId: id,
          nome: c.nome,
          creci: c.creci || null,
          empresa: c.empresa || null,
          percentual: c.percentual || 0,
          valorComissao: c.valorComissao || null,
          formaPagamento: c.formaPagamento || null,
          parcelasVinculadas: c.parcelasVinculadas || null,
        })),
      }),
    ]);

    await recalcularPendencias(id);
    const result = await prisma.negocioCorretorEnvolvido.findMany({ where: { negocioId: id } });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar corretores" }, { status: 500 });
  }
}
