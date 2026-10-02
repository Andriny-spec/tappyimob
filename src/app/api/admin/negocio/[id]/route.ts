import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notifyNegocioEditado } from "@/lib/notify-negocio";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { id } = await params;

    const negocio = await prisma.negocio.findUnique({
      where: { id },
      include: {
        corretor: { select: { id: true, name: true, email: true, phone: true } },
        partes: { orderBy: [{ tipo: "asc" }, { ordem: "asc" }] },
        documentos: { orderBy: { createdAt: "asc" } },
        parcelas: { orderBy: { ordem: "asc" } },
        corretores: { orderBy: { createdAt: "asc" } },
        pendencias: { orderBy: [{ bloqueante: "desc" }, { createdAt: "asc" }] },
        logs: { orderBy: { createdAt: "desc" }, take: 100 },
        minutas: { orderBy: { versao: "desc" } },
      },
    });

    if (!negocio) return NextResponse.json({ error: "Negócio não encontrado" }, { status: 404 });

    // Corretor só vê os próprios
    if (session.role === "CORRETOR" && negocio.corretorId !== session.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    return NextResponse.json(negocio);
  } catch (error) {
    console.error("Error fetching negocio:", error);
    return NextResponse.json({ error: "Erro ao buscar negócio" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    const negocioAtual = await prisma.negocio.findUnique({ where: { id } });
    if (!negocioAtual) return NextResponse.json({ error: "Negócio não encontrado" }, { status: 404 });

    if (session.role === "CORRETOR" && negocioAtual.corretorId !== session.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    // Campos que admins não podem editar via PATCH direto (campos computados/protegidos)
    const { id: _id, codigo: _codigo, createdAt: _created, updatedAt: _updated,
            partes: _partes, documentos: _docs, parcelas: _parcelas,
            corretores: _corrs, pendencias: _pends, logs: _logs, minutas: _mins, ...updateData } = body;

    // Gravar log de cada campo alterado
    const logEntries: any[] = [];
    for (const [campo, valorNovo] of Object.entries(updateData)) {
      const valorAnterior = (negocioAtual as any)[campo];
      if (valorAnterior !== valorNovo) {
        logEntries.push({
          negocioId: id,
          campo,
          valorAnterior: valorAnterior != null ? String(valorAnterior) : null,
          valorNovo: valorNovo != null ? String(valorNovo) : null,
          origem: "manual",
          userId: session.id,
          userName: session.name,
        });
      }
    }

    const [negocio] = await prisma.$transaction([
      prisma.negocio.update({ where: { id }, data: updateData }),
      ...(logEntries.length > 0 ? [prisma.negocioLog.createMany({ data: logEntries })] : []),
    ]);

    // Notificar sobre edição após envio
    if (negocioAtual.snapshotEnviado && logEntries.length > 0) {
      const camposAlterados = logEntries.map((l) => l.campo);
      notifyNegocioEditado(id, negocioAtual.codigo, session.name, session.role, negocioAtual.corretorId, camposAlterados).catch(() => {});
    }

    // Recalcular pendências automáticas
    await recalcularPendencias(id);

    return NextResponse.json(negocio);
  } catch (error) {
    console.error("Error updating negocio:", error);
    return NextResponse.json({ error: "Erro ao atualizar negócio" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.negocio.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting negocio:", error);
    return NextResponse.json({ error: "Erro ao excluir negócio" }, { status: 500 });
  }
}

// Recalcula pendências automáticas com base no estado atual do negócio
export async function recalcularPendencias(negocioId: string) {
  const negocio = await prisma.negocio.findUnique({
    where: { id: negocioId },
    include: { documentos: true, parcelas: true, corretores: true },
  });
  if (!negocio) return;

  const pendenciasExistentes = await prisma.negocioPendencia.findMany({
    where: { negocioId, status: "ABERTA" },
  });

  const toCreate: any[] = [];
  const toResolve: string[] = [];

  const temDoc = (tipo: string) =>
    negocio.documentos.some((d) => d.tipo === tipo && ["ENVIADO", "EXTRAIDO", "VALIDADO"].includes(d.status));

  const jaTemPendencia = (campo: string) => pendenciasExistentes.some((p) => p.campo === campo);
  const getPendencia = (campo: string) => pendenciasExistentes.find((p) => p.campo === campo);

  // Matrícula não anexada — BLOQUEANTE
  if (!temDoc("MATRICULA")) {
    if (!jaTemPendencia("imovelMatricula")) {
      toCreate.push({
        negocioId,
        campo: "imovelMatricula",
        descricao: "Matrícula do imóvel não anexada. O documento completo é necessário.",
        bloqueante: true,
        responsavel: "Corretor",
      });
    }
  } else {
    const p = getPendencia("imovelMatricula");
    if (p) toResolve.push(p.id);
  }

  // Matrícula vencida — não bloqueante
  if (negocio.imovelMatriculaVencida) {
    if (!jaTemPendencia("imovelMatriculaVencida")) {
      toCreate.push({
        negocioId,
        campo: "imovelMatriculaVencida",
        descricao: "Matrícula vencida (emitida há mais de 30 dias). Solicitar nova.",
        bloqueante: false,
        responsavel: "Corretor",
      });
    }
  } else {
    const p = getPendencia("imovelMatriculaVencida");
    if (p) toResolve.push(p.id);
  }

  // Espelho IPTU não anexado — não bloqueante
  if (!temDoc("ESPELHO_IPTU")) {
    if (!jaTemPendencia("espelhoIptu")) {
      toCreate.push({
        negocioId,
        campo: "espelhoIptu",
        descricao: "Espelho IPTU não anexado. Campo aparecerá como [PENDENTE] na minuta.",
        bloqueante: false,
        responsavel: "Corretor",
      });
    }
  } else {
    const p = getPendencia("espelhoIptu");
    if (p) toResolve.push(p.id);
  }

  // CND condomínio não anexada — não bloqueante
  if (!temDoc("CND_CONDOMINIO")) {
    if (!jaTemPendencia("cndCondominio")) {
      toCreate.push({
        negocioId,
        campo: "cndCondominio",
        descricao: "CND do condomínio não anexada. Campo aparecerá como [PENDENTE] na minuta.",
        bloqueante: false,
        responsavel: "Corretor",
      });
    }
  } else {
    const p = getPendencia("cndCondominio");
    if (p) toResolve.push(p.id);
  }

  // Fluxo financeiro não fecha — BLOQUEANTE
  if (negocio.valorTotal && negocio.parcelas.length > 0) {
    const somaParcelas = negocio.parcelas.reduce((acc, p) => acc + p.valor, 0);
    const diferenca = Math.abs(somaParcelas - negocio.valorTotal);
    if (diferenca > 0.01) {
      if (!jaTemPendencia("fluxoFinanceiro")) {
        toCreate.push({
          negocioId,
          campo: "fluxoFinanceiro",
          descricao: `Fluxo financeiro não fecha. Diferença: R$ ${diferenca.toFixed(2)}`,
          bloqueante: true,
          responsavel: "Corretor",
        });
      }
    } else {
      const p = getPendencia("fluxoFinanceiro");
      if (p) toResolve.push(p.id);
    }
  }

  // Comissões não fecham 100% — BLOQUEANTE para minuta
  if (negocio.corretores.length > 0) {
    const somaComissoes = negocio.corretores.reduce((acc, c) => acc + c.percentual, 0);
    if (Math.abs(somaComissoes - 100) > 0.01) {
      if (!jaTemPendencia("comissoesCorretores")) {
        toCreate.push({
          negocioId,
          campo: "comissoesCorretores",
          descricao: `Soma das comissões dos corretores não fecha 100% (atual: ${somaComissoes.toFixed(1)}%).`,
          bloqueante: true,
          responsavel: "Corretor",
        });
      }
    } else {
      const p = getPendencia("comissoesCorretores");
      if (p) toResolve.push(p.id);
    }
  }

  // Cessão de direitos: anuência da incorporadora — BLOQUEANTE
  if (["CESSAO_PLANTA", "CESSAO_PRONTA"].includes(negocio.tipoOperacao)) {
    if (!temDoc("ANUENCIA_INCORPORADORA")) {
      if (!jaTemPendencia("anuenciaIncorporadora")) {
        toCreate.push({
          negocioId,
          campo: "anuenciaIncorporadora",
          descricao: "Anuência da incorporadora não anexada. Obrigatória para cessão de direitos.",
          bloqueante: true,
          responsavel: "Corretor",
        });
      }
    } else {
      const p = getPendencia("anuenciaIncorporadora");
      if (p) toResolve.push(p.id);
    }
  }

  await prisma.$transaction([
    ...(toCreate.length > 0 ? [prisma.negocioPendencia.createMany({ data: toCreate })] : []),
    ...(toResolve.length > 0
      ? [prisma.negocioPendencia.updateMany({
          where: { id: { in: toResolve } },
          data: { status: "RESOLVIDA", resolvidoAt: new Date() },
        })]
      : []),
  ]);
}
