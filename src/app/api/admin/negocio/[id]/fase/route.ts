import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notifyNegocioSubmetido, notifyFaseRevisaoJuridica } from "@/lib/notify-negocio";

const FASES_ORDEM = [
  "DADOS_RECEBIDOS",
  "EXTRACAO_IA",
  "PENDENTE_DOC",
  "VALIDACAO_INTERNA",
  "MINUTA_GERADA",
  "REVISAO_JURIDICA",
  "VALIDACAO_PARTES",
  "PRONTO_ASSINATURA",
];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { fase: novaFase } = body;

    const negocio = await prisma.negocio.findUnique({
      where: { id },
      include: {
        pendencias: { where: { status: "ABERTA", bloqueante: true } },
      },
    });

    if (!negocio) return NextResponse.json({ error: "Negócio não encontrado" }, { status: 404 });

    // Validações de avanço
    const faseAtualIdx = FASES_ORDEM.indexOf(negocio.fase);
    const novaFaseIdx = FASES_ORDEM.indexOf(novaFase);

    // Avançando para MINUTA_GERADA: verificar bloqueantes
    if (novaFase === "MINUTA_GERADA" && negocio.pendencias.length > 0) {
      return NextResponse.json({
        error: "Existem pendências bloqueantes que impedem a geração da minuta.",
        pendencias: negocio.pendencias,
      }, { status: 422 });
    }

    // Só admin pode retroceder fase ou pular fases
    if (session.role !== "ADMIN") {
      if (novaFaseIdx <= faseAtualIdx) {
        return NextResponse.json({ error: "Apenas admins podem retroceder fases." }, { status: 403 });
      }
      if (novaFaseIdx > faseAtualIdx + 1) {
        return NextResponse.json({ error: "Não é possível pular fases." }, { status: 422 });
      }
    }

    const negocioAtualizado = await prisma.negocio.update({
      where: { id },
      data: { fase: novaFase },
    });

    await prisma.negocioLog.create({
      data: {
        negocioId: id,
        campo: "fase",
        valorAnterior: negocio.fase,
        valorNovo: novaFase,
        origem: "manual",
        userId: session.id,
        userName: session.name,
      },
    });

    // Trigger notifications async (best-effort)
    const codigo = negocio.codigo;
    const corretorId = negocio.corretorId;
    if (novaFase === "VALIDACAO_INTERNA") {
      notifyNegocioSubmetido(id, codigo, session.name).catch(() => {});
    }
    if (novaFase === "REVISAO_JURIDICA") {
      notifyFaseRevisaoJuridica(id, codigo).catch(() => {});
    }

    return NextResponse.json(negocioAtualizado);
  } catch (error) {
    console.error("Error updating fase:", error);
    return NextResponse.json({ error: "Erro ao atualizar fase" }, { status: 500 });
  }
}
