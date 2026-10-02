import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { launchPdfBrowser } from "@/lib/pdf";

const ROLES_PERMITIDAS = new Set(["ADMIN", "SDR", "CORRETOR"]);

// Rótulos amigáveis para as chaves dos dossiês (Tier Basic / Tier Plus).
const LABELS: Record<string, string> = {
  nome: "Nome", doc: "Documento", documento: "Documento", mae: "Mãe", pai: "Pai",
  sexo: "Sexo", nascimento: "Nascimento", nascimentoAbertura: "Nasc./Abertura",
  idade: "Idade", estadoCivil: "Estado civil", escolaridade: "Escolaridade",
  dependentes: "Nº de dependentes", obito: "Óbito", fantasia: "Nome fantasia",
  situacao: "Situação", atividadePrincipal: "Atividade principal", natureza: "Natureza",
  blacklist: "Lista restritiva", scoreD00: "Score D00", scoreD30: "Score D30",
  scoreD60: "Score D60", scoreD90: "Score D90", rendaPessoal: "Renda pessoal",
  rendaFamiliar: "Renda familiar", rendaPresumida: "Renda presumida",
  aposentadoria: "Aposentadoria", rendaEmpresarial: "Renda empresarial",
  classePessoal: "Classe social (pessoal)", classeFamiliar: "Classe social (familiar)",
  enderecos: "Endereços", telefones: "Telefones", emails: "E-mails", veiculos: "Veículos",
  empregos: "Empregos", societario: "Quadro societário", participacoes: "Participações",
  vizinhos: "Vizinhos", irmaos: "Irmãos", parentes: "Parentes", flags: "Sinalizadores",
};

const moneyKeys = new Set(["rendaPessoal", "rendaFamiliar", "rendaPresumida", "aposentadoria", "rendaEmpresarial"]);
const brl = (v: any) =>
  typeof v === "number" ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : String(v);

function escapeHtml(s: any): string {
  return String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
}

function renderItem(it: any): string {
  if (it == null) return "";
  if (typeof it === "object") {
    return Object.values(it).filter((x) => x != null && x !== "" && x !== false).map((x) => escapeHtml(typeof x === "boolean" ? "Sim" : x)).join(" · ");
  }
  return escapeHtml(it);
}

function buildHtml(source: string, nome: string, documento: string, dossie: any): string {
  const tier = source === "ph3a" ? "Tier Plus" : "Tier Basic";
  const rows: string[] = [];
  const sections: string[] = [];

  for (const [k, v] of Object.entries(dossie || {})) {
    if (v == null || v === "" || k === "nome" || k === "doc" || k === "documento") continue;
    if (Array.isArray(v)) {
      const items = v.map(renderItem).filter(Boolean);
      if (!items.length) continue;
      sections.push(`
        <div class="section">
          <h3>${escapeHtml(LABELS[k] || k)} <span class="count">(${items.length})</span></h3>
          <ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>
        </div>`);
    } else if (typeof v !== "object") {
      let val: string = typeof v === "boolean" ? (v ? "Sim" : "Não") : String(v);
      if (moneyKeys.has(k)) val = brl(v);
      rows.push(`<tr><td class="lbl">${escapeHtml(LABELS[k] || k)}</td><td>${escapeHtml(val)}</td></tr>`);
    }
  }

  const dataStr = new Date().toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"/>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, Arial, sans-serif; color: #1a1a1a; margin: 0; padding: 28px 32px; font-size: 12px; }
    .brand { display:flex; align-items:center; justify-content:space-between; border-bottom: 3px solid #0B2545; padding-bottom: 12px; }
    .brand .logo { font-size: 22px; font-weight: 800; color: #0B2545; letter-spacing: -0.5px; }
    .brand .tier { font-size: 11px; color:#fff; background:#0B2545; padding: 3px 10px; border-radius: 999px; }
    .hdr { margin: 16px 0 6px; }
    .hdr h1 { margin: 0; font-size: 18px; color:#111; }
    .hdr .doc { color:#555; font-size: 12px; margin-top: 2px; }
    .meta { color:#888; font-size: 10px; margin-bottom: 14px; }
    table { width:100%; border-collapse: collapse; margin-bottom: 14px; }
    td { padding: 5px 8px; border-bottom: 1px solid #eee; vertical-align: top; }
    td.lbl { color:#666; width: 200px; font-weight: 600; }
    .section { margin-bottom: 12px; page-break-inside: avoid; }
    .section h3 { font-size: 12px; color:#0B2545; margin: 10px 0 6px; border-bottom:1px solid #e5e5e5; padding-bottom:3px; }
    .section .count { color:#aaa; font-weight: 400; }
    .section ul { margin: 0; padding-left: 16px; }
    .section li { margin: 2px 0; }
    .foot { margin-top: 18px; border-top:1px solid #eee; padding-top: 8px; color:#aaa; font-size:9px; text-align:center; }
  </style></head>
  <body>
    <div class="brand"><span class="logo">BuscaImob</span><span class="tier">${escapeHtml(tier)}</span></div>
    <div class="hdr"><h1>${escapeHtml(nome || "—")}</h1>${documento ? `<div class="doc">${escapeHtml(documento)}</div>` : ""}</div>
    <div class="meta">Dossiê gerado em ${escapeHtml(dataStr)}</div>
    ${rows.length ? `<table>${rows.join("")}</table>` : ""}
    ${sections.join("")}
    <div class="foot">BuscaImob — documento gerado automaticamente. Uso restrito e confidencial.</div>
  </body></html>`;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!ROLES_PERMITIDAS.has(session.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido" }, { status: 400 });
  }

  const source = body?.source === "ph3a" ? "ph3a" : "seekloc";
  const dossie = body?.dossie;
  const nome = String(body?.nome || dossie?.nome || "Dossie").trim();
  const documento = String(body?.documento || dossie?.documento || dossie?.doc || "").trim();
  if (!dossie || typeof dossie !== "object") {
    return NextResponse.json({ error: "Dossiê ausente" }, { status: 400 });
  }

  const html = buildHtml(source, nome, documento, dossie);
  const fileSafe = (nome || "Dossie").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 60) || "Dossie";

  let browser: any;
  try {
    browser = await launchPdfBrowser();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({ format: "A4", printBackground: true, margin: { top: "12mm", bottom: "12mm", left: "10mm", right: "10mm" } });
    await browser.close();

    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="BuscaImob_${fileSafe}.pdf"`,
      },
    });
  } catch (error: any) {
    try { if (browser) await browser.close(); } catch {}
    console.error("[TAPPY_IQ/PDF]", error);
    return NextResponse.json({ error: "Falha ao gerar o PDF" }, { status: 500 });
  }
}
