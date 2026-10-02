/**
 * Due Diligence PDF — gera relatório A4 via Puppeteer e sobe no MinIO.
 * Chamado pelo handler run_due_diligence após o resultado chegar do BuscaImob.
 */

import { uploadFile, getFileUrl } from "@/lib/minio";

// ───────────────────────────────────────────────────────────────────────────
// HTML builder
// ───────────────────────────────────────────────────────────────────────────

const RISK_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  BAIXO: { bg: "#16a34a", color: "#fff", label: "RISCO BAIXO" },
  MÉDIO: { bg: "#d97706", color: "#fff", label: "RISCO MÉDIO" },
  ALTO: { bg: "#dc2626", color: "#fff", label: "RISCO ALTO" },
};

const STATUS_LABEL: Record<string, string> = {
  ok: "Regular",
  alert: "Alerta",
  error: "Erro",
  not_found: "Não encontrada",
  pending: "Pendente",
  processing: "Processando",
};

const STATUS_COLOR: Record<string, string> = {
  ok: "#16a34a",
  alert: "#dc2626",
  error: "#d97706",
  not_found: "#6b7280",
  pending: "#6b7280",
  processing: "#2563eb",
};

const CATEGORY_LABEL: Record<string, string> = {
  fiscal: "Fiscal / Tributário",
  judicial: "Judicial",
  cadastral: "Cadastral",
  imovel: "Imóvel / Matrícula",
  trabalhista: "Trabalhista",
  criminal: "Criminal",
  financeiro: "Financeiro",
};

function fmtDoc(doc: string, type: string) {
  if (type === "cpf" && doc.length === 11)
    return `${doc.slice(0, 3)}.${doc.slice(3, 6)}.${doc.slice(6, 9)}-${doc.slice(9)}`;
  if (type === "cnpj" && doc.length === 14)
    return `${doc.slice(0, 2)}.${doc.slice(2, 5)}.${doc.slice(5, 8)}/${doc.slice(8, 12)}-${doc.slice(12)}`;
  return doc;
}

export function buildDueDiligenceHtml(data: {
  queryId: string;
  partial?: boolean;
  subject: { name?: string; document: string; documentType: string };
  riskScore: string;
  riskColor?: string;
  summary: { total: number; ok: number; alerts: number; errors: number };
  alerts: { name: string; source: string; details: string }[];
  enrichment?: any;
  completedAt?: string;
  certificates?: any[];
}): string {
  const risk = RISK_CONFIG[data.riskScore] || { bg: "#6b7280", color: "#fff", label: data.riskScore };
  const subject = data.subject;
  const enrich = data.enrichment || {};
  const certs: any[] = data.certificates || [];

  const certsByCategory: Record<string, any[]> = {};
  for (const c of certs) {
    const cat = c.category || "outros";
    if (!certsByCategory[cat]) certsByCategory[cat] = [];
    certsByCategory[cat].push(c);
  }

  const certRows = Object.entries(certsByCategory).map(([cat, items]) => `
    <tr class="cat-header">
      <td colspan="4">${CATEGORY_LABEL[cat] || cat}</td>
    </tr>
    ${items.map(c => `
    <tr>
      <td>${c.name || "—"}</td>
      <td>${c.source || "—"}</td>
      <td><span class="badge" style="background:${STATUS_COLOR[c.status] || "#6b7280"}">${STATUS_LABEL[c.status] || c.status}</span></td>
      <td class="details-cell">${c.details || "—"}</td>
    </tr>`).join("")}
  `).join("");

  const alertRows = data.alerts.map(a => `
    <div class="alert-item">
      <div class="alert-header">
        <span class="alert-name">${a.name}</span>
        <span class="alert-source">${a.source}</span>
      </div>
      <p class="alert-details">${a.details}</p>
    </div>
  `).join("");

  const restricoes = enrich.restricoesFinanceiras?.ocorrencias || [];
  const restricoesHtml = restricoes.length > 0 ? `
    <section>
      <h2 class="section-title">Restrições Financeiras</h2>
      <table class="data-table">
        <thead><tr><th>Credor</th><th>Valor</th><th>Vencimento</th><th>Origem</th></tr></thead>
        <tbody>
          ${restricoes.map((r: any) => `<tr>
            <td>${r.credor || "—"}</td>
            <td>${r.valor ? `${r.moeda || "BRL"} ${r.valor}` : "—"}</td>
            <td>${r.dataVencimento || "—"}</td>
            <td>${r.origem || "—"}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </section>` : "";

  const empresas = enrich.participacaoEmpresas?.empresas || [];
  const empresasHtml = empresas.length > 0 ? `
    <section>
      <h2 class="section-title">Participação em Empresas</h2>
      <table class="data-table">
        <thead><tr><th>Empresa</th><th>CNPJ</th><th>Participação</th><th>Situação</th></tr></thead>
        <tbody>
          ${empresas.map((e: any) => `<tr>
            <td>${e.nome || "—"}</td>
            <td>${e.cnpj || "—"}</td>
            <td>${e.participacao || "—"}</td>
            <td>${e.situacao || "—"}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </section>` : "";

  const geradoEm = data.completedAt
    ? new Date(data.completedAt).toLocaleString("pt-BR")
    : new Date().toLocaleString("pt-BR");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #1a1a1a; background: #fff; }

  /* HEADER */
  .header { background: #1e293b; color: #fff; padding: 20px 32px; display: flex; align-items: center; justify-content: space-between; }
  .header-title { font-size: 18px; font-weight: 700; letter-spacing: 0.5px; }
  .header-sub { font-size: 10px; color: #94a3b8; margin-top: 2px; }
  .header-right { text-align: right; font-size: 10px; color: #94a3b8; }

  /* RISK BANNER */
  .risk-banner { padding: 14px 32px; display: flex; align-items: center; gap: 16px; }
  .risk-badge { padding: 8px 20px; border-radius: 6px; font-size: 15px; font-weight: 800; letter-spacing: 1px; }
  .risk-label { font-size: 12px; color: #475569; }
  .risk-label strong { color: #1e293b; }

  /* SUBJECT */
  .subject-box { margin: 0 32px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
  .subject-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .subject-field label { font-size: 9px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
  .subject-field p { font-size: 12px; font-weight: 600; color: #1e293b; margin-top: 2px; }

  /* SUMMARY */
  .summary-row { display: flex; gap: 12px; margin: 0 32px 20px; }
  .summary-card { flex: 1; border-radius: 8px; padding: 12px 16px; text-align: center; }
  .summary-card.total { background: #f1f5f9; border: 1px solid #e2e8f0; }
  .summary-card.ok { background: #f0fdf4; border: 1px solid #bbf7d0; }
  .summary-card.alert { background: #fef2f2; border: 1px solid #fecaca; }
  .summary-card.error { background: #fff7ed; border: 1px solid #fed7aa; }
  .summary-card .num { font-size: 24px; font-weight: 800; }
  .summary-card .lbl { font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-top: 2px; }
  .summary-card.total .num { color: #1e293b; }
  .summary-card.ok .num { color: #16a34a; }
  .summary-card.alert .num { color: #dc2626; }
  .summary-card.error .num { color: #d97706; }

  /* SECTIONS */
  section { margin: 0 32px 20px; }
  .section-title { font-size: 13px; font-weight: 700; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px; }

  /* TABLES */
  .data-table { width: 100%; border-collapse: collapse; font-size: 10px; }
  .data-table thead tr { background: #f1f5f9; }
  .data-table th { padding: 8px 10px; text-align: left; font-weight: 700; color: #475569; font-size: 9px; text-transform: uppercase; letter-spacing: 0.3px; }
  .data-table td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
  .data-table tr:last-child td { border-bottom: none; }
  .cat-header td { background: #1e293b; color: #fff; font-weight: 700; padding: 5px 10px; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; }
  .details-cell { max-width: 200px; color: #475569; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; color: #fff; font-size: 9px; font-weight: 700; }

  /* ALERTS */
  .alert-item { background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 10px 14px; margin-bottom: 8px; }
  .alert-header { display: flex; justify-content: space-between; margin-bottom: 4px; }
  .alert-name { font-weight: 700; color: #dc2626; font-size: 11px; }
  .alert-source { font-size: 9px; color: #64748b; background: #f1f5f9; padding: 1px 6px; border-radius: 3px; }
  .alert-details { font-size: 10px; color: #374151; }

  /* PARTIAL BANNER */
  .partial-banner { margin: 0 32px 16px; background: #fefce8; border: 1px solid #fef08a; border-radius: 6px; padding: 10px 14px; font-size: 10px; color: #854d0e; }

  /* FOOTER */
  .footer { margin-top: 24px; border-top: 1px solid #e2e8f0; padding: 14px 32px; font-size: 9px; color: #94a3b8; display: flex; justify-content: space-between; }
  .footer p { line-height: 1.5; }
</style>
</head>
<body>

<div class="header">
  <div>
    <div class="header-title">Relatório de Due Diligence</div>
    <div class="header-sub">Tappy Imob · Análise Jurídica e Cadastral</div>
  </div>
  <div class="header-right">
    <p>Protocolo: ${data.queryId.slice(-8).toUpperCase()}</p>
    <p>Gerado em: ${geradoEm}</p>
  </div>
</div>

${data.partial ? `<div class="partial-banner">⚠️ Resultado parcial — algumas certidões ainda estavam sendo processadas no momento da geração deste relatório.</div>` : ""}

<div class="risk-banner">
  <div class="risk-badge" style="background:${risk.bg};color:${risk.color}">${risk.label}</div>
  <div class="risk-label">
    <strong>${subject.name || "Nome não identificado"}</strong><br/>
    ${fmtDoc(subject.document, subject.documentType)} · ${subject.documentType.toUpperCase()}
  </div>
</div>

<div class="summary-row">
  <div class="summary-card total">
    <div class="num">${data.summary.total}</div>
    <div class="lbl">Certidões</div>
  </div>
  <div class="summary-card ok">
    <div class="num">${data.summary.ok}</div>
    <div class="lbl">Regulares</div>
  </div>
  <div class="summary-card alert">
    <div class="num">${data.summary.alerts}</div>
    <div class="lbl">Alertas</div>
  </div>
  <div class="summary-card error">
    <div class="num">${data.summary.errors}</div>
    <div class="lbl">Erros</div>
  </div>
</div>

${data.alerts.length > 0 ? `
<section>
  <h2 class="section-title">⚠ Alertas Identificados (${data.alerts.length})</h2>
  ${alertRows}
</section>` : ""}

${certs.length > 0 ? `
<section>
  <h2 class="section-title">Certidões Consultadas</h2>
  <table class="data-table">
    <thead>
      <tr>
        <th>Certidão</th>
        <th>Fonte</th>
        <th>Status</th>
        <th>Resultado</th>
      </tr>
    </thead>
    <tbody>
      ${certRows}
    </tbody>
  </table>
</section>` : ""}

${restricoesHtml}
${empresasHtml}

<div class="footer">
  <p>Este relatório foi gerado automaticamente pela plataforma Tappy Imob.<br/>As informações refletem o estado das bases de dados consultadas na data de geração.</p>
  <p style="text-align:right">Protocolo: ${data.queryId}<br/>© Tappy Imob</p>
</div>

</body>
</html>`;
}

// ───────────────────────────────────────────────────────────────────────────
// Generator + upload
// ───────────────────────────────────────────────────────────────────────────

export async function generateAndUploadDueDiligencePdf(
  queryId: string,
  data: Parameters<typeof buildDueDiligenceHtml>[0]
): Promise<string | null> {
  try {
    const html = buildDueDiligenceHtml(data);

    let browser: any;
    try {
      const { launchPdfBrowser } = await import("@/lib/pdf");
      browser = await launchPdfBrowser();
    } catch (e) {
      console.error("[DD_PDF] launch failed", e);
      return null;
    }

    let pdfBuffer: Buffer;
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });
      pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "0", right: "0", bottom: "0", left: "0" },
      });
    } finally {
      await browser.close();
    }

    const objectName = `due-diligence/${queryId}.pdf`;
    await uploadFile(pdfBuffer, objectName, "application/pdf");
    const url = await getFileUrl(objectName, 3600);
    return url;
  } catch (err) {
    console.error("[DD_PDF]", err);
    return null;
  }
}
