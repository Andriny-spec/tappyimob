import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { recalcularPendencias } from "../../../route";

type Params = { params: Promise<{ id: string; docId: string }> };

// Mapeamento de campos extraídos por tipo de documento → campos do Negocio/NegocioParte
const CAMPO_MAP: Record<string, Record<string, string>> = {
  MATRICULA: {
    matriculaNumero: "imovelMatricula",
    cri: "imovelCri",
    endereco: "imovelEndereco",
    cep: "imovelCep",
    inscricaoFiscal: "imovelInscricaoFiscal",
    situacao: "imovelSituacao",
    saldoDevedor: "imovelSaldoDevedor",
    bancoCredor: "imovelBancoCredor",
    condominio: "imovelCondominio",
  },
  ESPELHO_IPTU: {
    inscricaoFiscal: "imovelInscricaoFiscal",
  },
};

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { id, docId } = await params;
    const body = await request.json();
    // body.campos: { campo: { valor, corrigido } } — valores confirmados ou corrigidos pelo corretor

    const documento = await prisma.negocioDocumento.findUnique({ where: { id: docId } });
    if (!documento || documento.negocioId !== id) {
      return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 });
    }

    // Atualizar documento como validado
    await prisma.negocioDocumento.update({
      where: { id: docId },
      data: { status: "VALIDADO" },
    });

    // Aplicar campos extraídos ao negócio
    const negocioAtual = await prisma.negocio.findUnique({ where: { id } });
    if (!negocioAtual) return NextResponse.json({ error: "Negócio não encontrado" }, { status: 404 });

    const mapa = CAMPO_MAP[documento.tipo] || {};
    const updateNegocio: any = {};
    const logEntries: any[] = [];

    if (body.campos && mapa) {
      for (const [campoDoc, dadosCampo] of Object.entries(body.campos as Record<string, any>)) {
        const campoNegocio = mapa[campoDoc];
        if (!campoNegocio) continue;

        const valorNovo = dadosCampo.valor;
        const corrigido = dadosCampo.corrigido === true;
        const valorAnterior = (negocioAtual as any)[campoNegocio];

        if (valorNovo !== undefined && valorNovo !== null) {
          updateNegocio[campoNegocio] = valorNovo;
          logEntries.push({
            negocioId: id,
            campo: campoNegocio,
            valorAnterior: valorAnterior != null ? String(valorAnterior) : null,
            valorNovo: String(valorNovo),
            origem: corrigido ? "extraido_corrigido" : "extraido_confirmado",
            userId: session.id,
            userName: session.name,
          });
        }
      }
    }

    // Verificar matrícula vencida (data de emissão > 30 dias)
    if (documento.tipo === "MATRICULA" && body.campos?.dataEmissao?.valor) {
      const dataEmissao = new Date(body.campos.dataEmissao.valor);
      const trintaDiasAtras = new Date();
      trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
      updateNegocio.imovelMatriculaVencida = dataEmissao < trintaDiasAtras;
    }

    // Verificar laudêmio
    if (documento.tipo === "MATRICULA" && body.campos?.laudemio?.valor) {
      updateNegocio.imovelLaudemioDetectado = body.campos.laudemio.valor === true ||
        body.campos.laudemio.valor === "true";
    }

    if (Object.keys(updateNegocio).length > 0) {
      await prisma.$transaction([
        prisma.negocio.update({ where: { id }, data: updateNegocio }),
        ...(logEntries.length > 0 ? [prisma.negocioLog.createMany({ data: logEntries })] : []),
      ]);
    }

    // CND positiva: registrar alerta jurídico (só admin vê)
    if (documento.tipo === "CND_CONDOMINIO" && body.campos?.temDebitos?.valor === true) {
      await prisma.negocioPendencia.upsert({
        where: { id: "cnd-positiva-" + id } as any,
        create: {
          negocioId: id,
          campo: "cndPositiva",
          descricao: "CND positiva: condomínio inadimplente. Verificar com o vendedor antes da assinatura.",
          bloqueante: false,
          responsavel: "Jurídico",
        },
        update: {},
      }).catch(() => {
        // upsert por campo composto não suportado, criar se não existir
        return prisma.negocioPendencia.create({
          data: {
            negocioId: id,
            campo: "cndPositiva",
            descricao: "CND positiva: condomínio inadimplente. Verificar com o vendedor antes da assinatura.",
            bloqueante: false,
            responsavel: "Jurídico",
          },
        }).catch(() => {});
      });
    }

    await recalcularPendencias(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error confirming documento:", error);
    return NextResponse.json({ error: "Erro ao confirmar documento" }, { status: 500 });
  }
}
