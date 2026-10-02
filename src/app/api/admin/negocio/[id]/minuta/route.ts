import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { uploadFile, getFileUrl } from "@/lib/minio";
import { notifyMinutaGerada } from "@/lib/notify-negocio";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

type Params = { params: Promise<{ id: string }> };

function numeroExtenso(valor: number): string {
  if (!valor) return "zero reais";
  // Implementação simplificada — em produção usar lib como numero-por-extenso
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function buildVariables(negocio: any): Record<string, string> {
  const vendedores = negocio.partes?.filter((p: any) => p.tipo === "VENDEDOR") || [];
  const compradores = negocio.partes?.filter((p: any) => p.tipo === "COMPRADOR") || [];
  const v1 = vendedores[0] || {};
  const c1 = compradores[0] || {};

  const vars: Record<string, string> = {
    // Vendedor
    vendedor_nome: v1.nome || "[PENDENTE — nome do vendedor]",
    vendedor_cpf: v1.cpf || "[PENDENTE — CPF do vendedor]",
    vendedor_nascimento: v1.nascimento ? new Date(v1.nascimento).toLocaleDateString("pt-BR") : "[PENDENTE — nascimento]",
    vendedor_estado_civil: v1.estadoCivil || "[PENDENTE — estado civil]",
    vendedor_regime: v1.regimeBens || "",
    vendedor_conjuge: v1.conjuge || "",
    vendedor_profissao: v1.profissao || "[PENDENTE — profissão]",
    vendedor_endereco: [v1.logradouro, v1.numero, v1.cidade, v1.uf].filter(Boolean).join(", ") || "[PENDENTE — endereço]",

    // Comprador
    comprador_nome: c1.nome || "[PENDENTE — nome do comprador]",
    comprador_cpf: c1.cpf || "[PENDENTE — CPF do comprador]",
    comprador_nascimento: c1.nascimento ? new Date(c1.nascimento).toLocaleDateString("pt-BR") : "[PENDENTE — nascimento]",
    comprador_estado_civil: c1.estadoCivil || "[PENDENTE — estado civil]",
    comprador_regime: c1.regimeBens || "",
    comprador_conjuge: c1.conjuge || "",
    comprador_profissao: c1.profissao || "[PENDENTE — profissão]",
    comprador_endereco: [c1.logradouro, c1.numero, c1.cidade, c1.uf].filter(Boolean).join(", ") || "[PENDENTE — endereço]",

    // Imóvel
    imovel_endereco: [negocio.imovelLogradouro, negocio.imovelNumero, negocio.imovelCidade, negocio.imovelUf].filter(Boolean).join(", ") || "[PENDENTE — endereço]",
    imovel_matricula: negocio.imovelMatricula || "[PENDENTE — matrícula]",
    imovel_cri: negocio.imovelCri || "[PENDENTE — CRI]",
    imovel_inscricao_fiscal: negocio.imovelInscricaoFiscal || "[PENDENTE — inscrição fiscal]",
    imovel_condominio: negocio.imovelCondominio || "",

    // Financeiro
    valor_total: negocio.valorTotal ? negocio.valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "[PENDENTE — valor]",
    valor_extenso: negocio.valorTotal ? numeroExtenso(negocio.valorTotal) : "[PENDENTE — valor por extenso]",
    comissao_valor: negocio.comissaoValor ? negocio.comissaoValor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "",
    comissao_percentual: negocio.comissaoPercentual ? `${negocio.comissaoPercentual}%` : "",
    comissao_responsavel_pagamento: negocio.comissaoResponsavel || "",
    valor_liquido_vendedor: negocio.valorTotal && negocio.comissaoValor
      ? (negocio.valorTotal - negocio.comissaoValor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      : "",
    data_posse: negocio.posseTextoGerado || negocio.possePrazo || "[PENDENTE — data/prazo de posse]",

    // Corretor captador (primeiro da lista)
    corretor_captador_pgto_tabela: negocio.corretores?.[0]
      ? `${negocio.corretores[0].nome} — ${negocio.corretores[0].percentual}%`
      : "",

    // Cláusulas condicionais
    clausula_outorga: (v1.estadoCivil === "Casado(a)" || v1.estadoCivil === "União estável")
      ? `Outorgante cônjuge: ${v1.conjuge || "[nome do cônjuge]"}, ${v1.regimeBens || "regime a confirmar"}.`
      : "",
    clausula_laudemio: negocio.imovelLaudemioDetectado
      ? "O imóvel está sujeito ao pagamento de laudêmio, nos termos da legislação federal aplicável à enfiteuse."
      : "",
    clausula_mobiliario: negocio.imovelMobiliario
      ? `A presente venda inclui os seguintes bens móveis: ${(negocio.imovelMobiliarioItens || []).join(", ") || "a listar"}.`
      : "",
  };

  // Sinal e saldo
  const sinal = negocio.parcelas?.find((p: any) => p.tipo === "SINAL");
  const saldo = negocio.parcelas?.find((p: any) => p.tipo === "SALDO");
  if (sinal) {
    vars["sinal_valor"] = sinal.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    vars["sinal_data"] = sinal.condicao || (sinal.data ? new Date(sinal.data).toLocaleDateString("pt-BR") : "");
  }
  if (saldo) {
    vars["saldo_valor"] = saldo.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    vars["saldo_condicao"] = saldo.condicao || "";
  }

  // Variáveis adicionais por tipo
  const extras = negocio.dadosAdicionais || {};
  if (negocio.tipoOperacao?.startsWith("FINANCIAMENTO")) {
    vars["banco_financiador"] = extras.bancoFinanciador || "[PENDENTE — banco financiador]";
    vars["valor_financiado"] = extras.valorFinanciado ? Number(extras.valorFinanciado).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "";
    vars["banco_credor"] = negocio.imovelBancoCredor || extras.bancoCredorAtual || "";
    vars["saldo_devedor"] = negocio.imovelSaldoDevedor ? negocio.imovelSaldoDevedor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "";
  }
  if (negocio.tipoOperacao?.startsWith("CESSAO")) {
    vars["incorporadora"] = extras.incorporadora || "[PENDENTE — incorporadora]";
    vars["contrato_original"] = extras.contratoOriginal || "[PENDENTE — contrato original]";
    vars["valor_pago_cedente"] = extras.valorPagoCedente ? Number(extras.valorPagoCedente).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "";
    vars["saldo_incorporadora"] = extras.saldoIncorporadora ? Number(extras.saldoIncorporadora).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "";
  }
  if (negocio.tipoOperacao?.startsWith("PERMUTA")) {
    const permuta = negocio.permutaDados || {};
    vars["permuta_imovel_endereco"] = permuta.endereco || "";
    vars["permuta_imovel_matricula"] = permuta.matricula || "";
    vars["permuta_valor_atribuido"] = permuta.valor ? Number(permuta.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "";
    vars["veiculo_descricao"] = permuta.descricao || "";
    vars["veiculo_placa"] = permuta.placa || "";
    vars["torna_valor"] = permuta.torna ? Number(permuta.torna).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "";
  }

  return vars;
}

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Verificar bloqueantes
    const bloqueantes = await prisma.negocioPendencia.count({
      where: { negocioId: id, status: "ABERTA", bloqueante: true },
    });
    if (bloqueantes > 0) {
      return NextResponse.json({ error: "Existem pendências bloqueantes que impedem a geração da minuta." }, { status: 422 });
    }

    const negocio = await prisma.negocio.findUnique({
      where: { id },
      include: {
        partes: true,
        parcelas: { orderBy: { ordem: "asc" } },
        corretores: true,
        minutas: { orderBy: { versao: "desc" }, take: 1 },
      },
    });
    if (!negocio) return NextResponse.json({ error: "Negócio não encontrado" }, { status: 404 });

    // Buscar template
    const template = await prisma.contratoTemplate.findFirst({
      where: { tipoOperacao: negocio.tipoOperacao, ativo: true },
    });

    if (!template?.docxKey) {
      return NextResponse.json({
        error: "Template DOCX não encontrado para este tipo de operação. Cadastre um template em /admin/negocio/templates."
      }, { status: 404 });
    }

    // Baixar template do MinIO
    const { Client } = await import("minio");
    const minioClient = new Client({
      endPoint: process.env.MINIO_ENDPOINT?.replace("http://", "").replace("https://", "").split(":")[0] || "localhost",
      port: parseInt(process.env.MINIO_ENDPOINT?.split(":")[2] || "9000"),
      useSSL: process.env.MINIO_ENDPOINT?.startsWith("https") || false,
      accessKey: process.env.MINIO_ROOT_USER || "",
      secretKey: process.env.MINIO_ROOT_PASSWORD || "",
    });

    const bucket = process.env.MINIO_BUCKET || "tappyimob";
    const stream = await minioClient.getObject(bucket, template.docxKey);
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    const templateBuffer = Buffer.concat(chunks);

    // Gerar DOCX com docxtemplater
    const zip = new PizZip(templateBuffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: () => "",
    });

    const variables = buildVariables(negocio);
    doc.render(variables);

    const docxBuffer = doc.getZip().generate({ type: "nodebuffer", compression: "DEFLATE" });

    // Salvar no MinIO
    const versao = (negocio.minutas[0]?.versao || 0) + 1;
    const docxKey = `juridico/${id}/minuta_v${versao}_${Date.now()}.docx`;
    await uploadFile(docxBuffer, docxKey, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    const docxUrl = await getFileUrl(docxKey, 7200);

    // Registrar minuta
    const minuta = await prisma.negocioMinuta.create({
      data: {
        negocioId: id,
        versao,
        docxKey,
        docxUrl,
        geradoPorId: session.id,
        geradoPorNome: session.name,
      },
    });

    // Avançar fase para MINUTA_GERADA
    await prisma.negocio.update({ where: { id }, data: { fase: "MINUTA_GERADA" } });

    await prisma.negocioLog.create({
      data: {
        negocioId: id,
        campo: "minuta",
        valorAnterior: null,
        valorNovo: `Versão ${versao} gerada`,
        origem: "manual",
        userId: session.id,
        userName: session.name,
      },
    });

    notifyMinutaGerada(id, negocio.codigo, negocio.corretorId).catch(() => {});

    return NextResponse.json({ minuta, docxUrl });
  } catch (error: any) {
    console.error("Error generating minuta:", error);
    return NextResponse.json({ error: `Erro ao gerar minuta: ${error.message}` }, { status: 500 });
  }
}
