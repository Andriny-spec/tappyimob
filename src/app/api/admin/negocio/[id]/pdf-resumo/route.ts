import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

function fmt(v?: number | null) {
  if (!v) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function fmtDate(d?: Date | string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

const FASE_LABELS: Record<string, string> = {
  DADOS_RECEBIDOS: "Dados recebidos",
  VALIDACAO_INTERNA: "Validação interna",
  PENDENTE_DOC: "Pendente doc.",
  EXTRACAO_IA: "Extração IA",
  VALIDACAO_PARTES: "Validação partes",
  REVISAO_JURIDICA: "Revisão jurídica",
  MINUTA_GERADA: "Minuta gerada",
  PRONTO_ASSINATURA: "Pronto p/ assinatura",
};

const TIPO_LABELS: Record<string, string> = {
  PADRAO: "Padrão (à vista)",
  FINANCIAMENTO_QUITADO: "Financiamento - quitado na mesa",
  FINANCIAMENTO_INTERVENIENTE: "Financiamento - interveniente quitante",
  PARCELAMENTO_AF: "Parcelamento com alienação fiduciária",
  PARCELAMENTO_SIMPLES: "Parcelamento simples",
  CESSAO_PLANTA: "Cessão de direitos (planta)",
  CESSAO_PRONTA: "Cessão de direitos (pronta)",
  PERMUTA_IMOVEL: "Permuta - imóvel",
  PERMUTA_VEICULO: "Permuta - veículo",
  PERMUTA_TORNA: "Permuta com torna",
};

function buildHtml(negocio: any, isAdmin: boolean): string {
  const vendedores = negocio.partes?.filter((p: any) => p.tipo === "VENDEDOR") || [];
  const compradores = negocio.partes?.filter((p: any) => p.tipo === "COMPRADOR") || [];
  const bloqueantes = negocio.pendencias?.filter((p: any) => p.status === "ABERTA" && p.bloqueante) || [];
  const naoBloquantes = negocio.pendencias?.filter((p: any) => p.status === "ABERTA" && !p.bloqueante) || [];

  const parteHtml = (parte: any) => `
    <div class="parte-card">
      <div class="field-row"><span class="label">Nome</span><span>${parte.nome || "—"}</span></div>
      <div class="field-row"><span class="label">CPF/CNPJ</span><span>${parte.cpf || parte.cnpj || "—"}</span></div>
      <div class="field-row"><span class="label">Nascimento</span><span>${fmtDate(parte.nascimento)}</span></div>
      <div class="field-row"><span class="label">Estado civil</span><span>${parte.estadoCivil || "—"}${parte.regimeBens ? ` — ${parte.regimeBens}` : ""}${parte.conjuge ? ` (cônjuge: ${parte.conjuge})` : ""}</span></div>
      <div class="field-row"><span class="label">Profissão</span><span>${parte.profissao || "—"}</span></div>
      <div class="field-row"><span class="label">Endereço</span><span>${[parte.logradouro, parte.numero, parte.cidade, parte.uf].filter(Boolean).join(", ") || "—"}</span></div>
      <div class="field-row"><span class="label">E-mail</span><span>${parte.email || "—"}</span></div>
      <div class="field-row"><span class="label">Telefone</span><span>${parte.telefone || "—"}</span></div>
      ${parte.procuracao ? `<div class="badge orange">Com procuração</div>` : ""}
      ${parte.fgts ? `<div class="badge blue">Utiliza FGTS</div>` : ""}
      ${parte.estrangeiro ? `<div class="badge red">Estrangeiro</div>` : ""}
    </div>`;

  const parcelasHtml = negocio.parcelas?.length
    ? `<table class="table">
        <thead><tr><th>#</th><th>Tipo</th><th>Valor</th><th>Condição / Data</th></tr></thead>
        <tbody>
          ${negocio.parcelas.map((p: any) => `
            <tr>
              <td>${p.ordem}</td>
              <td>${p.tipo}</td>
              <td>${fmt(p.valor)}</td>
              <td>${p.condicao || fmtDate(p.data)}</td>
            </tr>`).join("")}
        </tbody>
      </table>`
    : `<p class="empty">Nenhuma parcela cadastrada</p>`;

  const corretoresHtml = negocio.corretores?.length
    ? negocio.corretores.map((c: any) => `
        <div class="field-row"><span class="label">${c.nome}</span><span>${c.percentual}% — ${c.empresa || "autônomo"} — ${c.formaPagamento || "—"}</span></div>`).join("")
    : `<p class="empty">Nenhum corretor</p>`;

  const pendenciasHtml = `
    ${bloqueantes.length ? bloqueantes.map((p: any) => `
      <div class="badge red">BLOQUEANTE: ${p.descricao}</div>`).join("") : ""}
    ${naoBloquantes.length ? naoBloquantes.map((p: any) => `
      <div class="badge orange">${p.descricao}</div>`).join("") : ""}
    ${!bloqueantes.length && !naoBloquantes.length ? `<div class="badge green">Sem pendências abertas</div>` : ""}`;

  const juridicoHtml = isAdmin && negocio.observacoesJuridico
    ? `<section>
        <h2>Seção Jurídica <span class="admin-only">(somente admin)</span></h2>
        <p class="juridico-obs">${negocio.observacoesJuridico.replace(/\n/g, "<br>")}</p>
      </section>`
    : "";

  const dadosAdicionais = negocio.dadosAdicionais || {};
  const permutaDados = negocio.permutaDados || {};

  const condicionaisHtml = (() => {
    const tipo = negocio.tipoOperacao || "";
    if (tipo.startsWith("FINANCIAMENTO")) {
      return `<div class="field-row"><span class="label">Banco financiador</span><span>${dadosAdicionais.bancoFinanciador || "—"}</span></div>
              <div class="field-row"><span class="label">Valor financiado</span><span>${fmt(dadosAdicionais.valorFinanciado ? Number(dadosAdicionais.valorFinanciado) : null)}</span></div>
              <div class="field-row"><span class="label">Banco credor atual</span><span>${negocio.imovelBancoCredor || dadosAdicionais.bancoCredorAtual || "—"}</span></div>
              <div class="field-row"><span class="label">Saldo devedor</span><span>${fmt(negocio.imovelSaldoDevedor)}</span></div>`;
    }
    if (tipo.startsWith("CESSAO")) {
      return `<div class="field-row"><span class="label">Incorporadora</span><span>${dadosAdicionais.incorporadora || "—"}</span></div>
              <div class="field-row"><span class="label">Contrato original</span><span>${dadosAdicionais.contratoOriginal || "—"}</span></div>
              <div class="field-row"><span class="label">Valor pago pelo cedente</span><span>${fmt(dadosAdicionais.valorPagoCedente ? Number(dadosAdicionais.valorPagoCedente) : null)}</span></div>
              <div class="field-row"><span class="label">Saldo c/ incorporadora</span><span>${fmt(dadosAdicionais.saldoIncorporadora ? Number(dadosAdicionais.saldoIncorporadora) : null)}</span></div>`;
    }
    if (tipo.startsWith("PERMUTA")) {
      return `<div class="field-row"><span class="label">Imóvel/veículo permutado</span><span>${permutaDados.endereco || permutaDados.descricao || "—"}</span></div>
              <div class="field-row"><span class="label">Matrícula / Placa</span><span>${permutaDados.matricula || permutaDados.placa || "—"}</span></div>
              <div class="field-row"><span class="label">Valor atribuído</span><span>${fmt(permutaDados.valor ? Number(permutaDados.valor) : null)}</span></div>
              ${permutaDados.torna ? `<div class="field-row"><span class="label">Torna</span><span>${fmt(Number(permutaDados.torna))}</span></div>` : ""}`;
    }
    return "";
  })();

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Resumo do Negócio ${negocio.codigo}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; color: #1a1a1a; background: white; }
  .page { padding: 36px 44px; max-width: 800px; margin: 0 auto; }

  /* Header */
  .header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 18px; border-bottom: 2px solid #1e40af; margin-bottom: 24px; }
  .logo { font-size: 18px; font-weight: 800; color: #1e40af; letter-spacing: -0.5px; }
  .logo span { color: #3b82f6; }
  .header-right { text-align: right; }
  .header-right .codigo { font-size: 14px; font-weight: 700; color: #1e40af; }
  .header-right .fase { font-size: 10px; color: #6b7280; margin-top: 2px; }
  .header-right .data { font-size: 10px; color: #9ca3af; }

  /* Sections */
  section { margin-bottom: 22px; page-break-inside: avoid; }
  h2 { font-size: 12px; font-weight: 700; color: #1e40af; text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 6px; border-bottom: 1px solid #dbeafe; margin-bottom: 10px; }
  h3 { font-size: 11px; font-weight: 600; color: #374151; margin: 8px 0 4px; }

  /* Field rows */
  .field-row { display: flex; gap: 8px; padding: 3px 0; border-bottom: 1px solid #f3f4f6; }
  .field-row .label { color: #6b7280; min-width: 160px; flex-shrink: 0; }
  .field-row span:last-child { color: #111827; font-weight: 500; }

  /* Parte cards */
  .parte-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px 12px; margin-bottom: 8px; }

  /* Table */
  .table { width: 100%; border-collapse: collapse; font-size: 10.5px; }
  .table th { background: #eff6ff; color: #1e40af; font-weight: 600; text-align: left; padding: 5px 8px; border: 1px solid #dbeafe; }
  .table td { padding: 4px 8px; border: 1px solid #e5e7eb; }
  .table tr:nth-child(even) td { background: #f9fafb; }

  /* Badges */
  .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; margin: 2px; }
  .badge.red { background: #fee2e2; color: #991b1b; }
  .badge.orange { background: #ffedd5; color: #92400e; }
  .badge.green { background: #dcfce7; color: #166534; }
  .badge.blue { background: #dbeafe; color: #1e40af; }
  .empty { color: #9ca3af; font-style: italic; font-size: 10.5px; }

  /* Financial summary */
  .financial-summary { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px 14px; }
  .financial-summary .total { font-size: 15px; font-weight: 800; color: #1e40af; }
  .financial-row { display: flex; justify-content: space-between; padding: 2px 0; }
  .financial-row .fl { color: #6b7280; }
  .financial-row .fv { font-weight: 600; color: #111827; }

  /* Admin only */
  .admin-only { font-size: 9px; color: #6b7280; font-weight: 400; background: #fef3c7; padding: 1px 5px; border-radius: 4px; margin-left: 6px; }
  .juridico-obs { background: #fffbeb; border-left: 3px solid #f59e0b; padding: 8px 12px; font-size: 11px; color: #374151; border-radius: 0 4px 4px 0; }

  /* Footer */
  .footer { margin-top: 32px; padding-top: 14px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: flex-start; }
  .footer-left { font-size: 9px; color: #9ca3af; max-width: 420px; line-height: 1.5; }
  .footer-right { font-size: 9px; color: #9ca3af; text-align: right; }

  /* Print */
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    section { page-break-inside: avoid; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div class="logo">Tappy<span>Imóvel</span></div>
    <div class="header-right">
      <div class="codigo">${negocio.codigo}</div>
      <div class="fase">${FASE_LABELS[negocio.fase] || negocio.fase}</div>
      <div class="data">Emitido em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</div>
    </div>
  </div>

  <!-- Imóvel -->
  <section>
    <h2>Imóvel</h2>
    <div class="field-row"><span class="label">Endereço</span><span>${[negocio.imovelLogradouro, negocio.imovelNumero, negocio.imovelComplemento].filter(Boolean).join(", ") || "—"}</span></div>
    <div class="field-row"><span class="label">Bairro / Cidade / UF</span><span>${[negocio.imovelBairro, negocio.imovelCidade, negocio.imovelUf].filter(Boolean).join(", ") || "—"}</span></div>
    ${negocio.imovelCondominio ? `<div class="field-row"><span class="label">Condomínio</span><span>${negocio.imovelCondominio}</span></div>` : ""}
    <div class="field-row"><span class="label">Matrícula</span><span>${negocio.imovelMatricula || "—"}</span></div>
    <div class="field-row"><span class="label">CRI</span><span>${negocio.imovelCri || "—"}</span></div>
    <div class="field-row"><span class="label">Inscrição fiscal</span><span>${negocio.imovelInscricaoFiscal || "—"}</span></div>
    ${negocio.imovelLaudemioDetectado ? `<div class="badge orange" style="margin-top:6px">Sujeito a laudêmio</div>` : ""}
    ${negocio.imovelMobiliario ? `<div class="badge blue" style="margin-top:6px">Inclui mobiliário: ${(negocio.imovelMobiliarioItens || []).join(", ") || "a listar"}</div>` : ""}
  </section>

  <!-- Negócio -->
  <section>
    <h2>Negócio</h2>
    <div class="field-row"><span class="label">Tipo de operação</span><span>${TIPO_LABELS[negocio.tipoOperacao] || negocio.tipoOperacao || "—"}</span></div>
    <div class="financial-summary" style="margin: 10px 0;">
      <div class="financial-row">
        <span class="fl">Valor total</span>
        <span class="total">${fmt(negocio.valorTotal)}</span>
      </div>
      <div class="financial-row">
        <span class="fl">Comissão (${negocio.comissaoPercentual || 0}%)</span>
        <span class="fv">${fmt(negocio.comissaoValor)}</span>
      </div>
      ${negocio.comissaoValor && negocio.valorTotal ? `
      <div class="financial-row">
        <span class="fl">Líquido ao vendedor</span>
        <span class="fv">${fmt(negocio.valorTotal - negocio.comissaoValor)}</span>
      </div>` : ""}
      <div class="financial-row">
        <span class="fl">Responsável pela comissão</span>
        <span class="fv">${negocio.comissaoResponsavel || "—"}</span>
      </div>
    </div>
    <div class="field-row"><span class="label">Posse</span><span>${negocio.posseTextoGerado || negocio.possePrazo || "—"}</span></div>
    ${condicionaisHtml}
    <h3>Fluxo de pagamento</h3>
    ${parcelasHtml}
  </section>

  <!-- Corretores -->
  <section>
    <h2>Corretores envolvidos</h2>
    ${corretoresHtml}
  </section>

  <!-- Vendedores -->
  <section>
    <h2>Vendedores (${vendedores.length})</h2>
    ${vendedores.length ? vendedores.map(parteHtml).join("") : `<p class="empty">Nenhum vendedor cadastrado</p>`}
  </section>

  <!-- Compradores -->
  <section>
    <h2>Compradores (${compradores.length})</h2>
    ${compradores.length ? compradores.map(parteHtml).join("") : `<p class="empty">Nenhum comprador cadastrado</p>`}
  </section>

  <!-- Pendências -->
  <section>
    <h2>Pendências</h2>
    ${pendenciasHtml}
  </section>

  ${juridicoHtml}

  <!-- Footer -->
  <div class="footer">
    <div class="footer-left">
      Este documento é um resumo interno gerado pelo Sistema Jurídico Tappy Imob e não substitui instrumentos contratuais formais.
      As informações aqui contidas são de responsabilidade dos cadastrantes e devem ser verificadas pelo setor jurídico antes da lavratura.
    </div>
    <div class="footer-right">
      Corretor responsável<br>
      <strong>${negocio.corretor?.name || "—"}</strong><br>
      ${negocio.codigo}
    </div>
  </div>

</div>
</body>
</html>`;
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { id } = await params;
    const isAdmin = session.role === "ADMIN";

    const negocio = await prisma.negocio.findUnique({
      where: { id },
      include: {
        partes: true,
        parcelas: { orderBy: { ordem: "asc" } },
        corretores: true,
        pendencias: { where: { status: "ABERTA" }, orderBy: { bloqueante: "desc" } },
        corretor: { select: { id: true, name: true } },
      },
    });

    if (!negocio) return NextResponse.json({ error: "Negócio não encontrado" }, { status: 404 });

    // Restrict corretor to own negocios
    if (session.role === "CORRETOR" && negocio.corretorId !== session.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const html = buildHtml(negocio, isAdmin);

    // Gera o PDF com o navegador headless (Chromium do sistema em produção).
    let browser: any;
    try {
      const { launchPdfBrowser } = await import("@/lib/pdf");
      browser = await launchPdfBrowser();
    } catch (e) {
      // Sem navegador disponível: devolve o HTML para o usuário imprimir/salvar.
      console.error("Error launching browser for PDF:", e);
      return new NextResponse(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });

      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "0", right: "0", bottom: "0", left: "0" },
      });

      return new NextResponse(pdf, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="resumo_${negocio.codigo}.pdf"`,
        },
      });
    } finally {
      await browser.close();
    }
  } catch (error: any) {
    console.error("Error generating PDF:", error);
    return NextResponse.json({ error: `Erro ao gerar PDF: ${error.message}` }, { status: 500 });
  }
}
