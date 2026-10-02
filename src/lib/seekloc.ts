/**
 * Cliente do webservice Seekloc (Tappy IQ).
 *
 * ⚠️ SERVER-ONLY. O webservice é HTTP puro (sem TLS) num IP fixo e as
 * credenciais (usr/pwd/emp) vão em toda chamada — nunca importar no client.
 *
 * Fonte: "webservice novo 2022 (1).pdf" (doc da Jakeline). Endpoint:
 *   POST http://200.201.193.100/seekloc/ws.php  (form urlencoded, resposta JSON)
 *
 * Fluxo em 2 etapas:
 *   1) busca por um critério (tp=1/2/5/6/8/13/14) → lista { id, doc, nome }
 *   2) detalhe (tp=3) reenviando id+doc → dossiê completo
 */

// Credenciais ficam SOMENTE em env (a senha nunca é hardcoded no repositório).
const WS_URL = process.env.SEEKLOC_WS_URL || "http://200.201.193.100/seekloc/ws.php";
const WS_USER = process.env.SEEKLOC_WS_USER || "webservice";
const WS_PWD = process.env.SEEKLOC_WS_PWD || "";
const WS_EMP = process.env.SEEKLOC_WS_EMP || "0037";

export type SeeklocTipo =
  | "documento"
  | "nome"
  | "telefone"
  | "email"
  | "endereco"
  | "cep"
  | "placa";

const TP_MAP: Record<SeeklocTipo, string> = {
  placa: "1",
  endereco: "2",
  telefone: "5",
  email: "6",
  nome: "8",
  cep: "13",
  documento: "14",
};

export interface SeeklocHit {
  id: string;
  doc: string;
  nome: string;
}

export interface SeeklocSearchResult {
  ok: boolean;
  codocor: string;
  mensagem: string;
  qtde: number;
  hits: SeeklocHit[];
  raw?: any;
}

async function postWs(fields: Record<string, string>): Promise<any> {
  if (!WS_PWD) {
    throw new Error(
      "Seekloc não configurado: defina SEEKLOC_WS_PWD (e opcionalmente SEEKLOC_WS_USER/EMP/URL) no servidor."
    );
  }
  const body = new URLSearchParams({
    usr: WS_USER,
    pwd: WS_PWD,
    emp: WS_EMP,
    ...fields,
  });

  const res = await fetch(WS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
    },
    body: body.toString(),
    cache: "no-store",
    signal: AbortSignal.timeout(25000),
  });

  if (!res.ok) throw new Error(`Seekloc respondeu HTTP ${res.status}`);
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Resposta do Seekloc não é um JSON válido");
  }
}

/** Limpa um valor para somente dígitos. */
const onlyDigits = (v?: string) => (v || "").replace(/\D/g, "");

/**
 * Etapa 1 — busca por um critério. Retorna a lista de candidatos (id/doc/nome).
 */
export async function seeklocSearch(
  tipo: SeeklocTipo,
  params: Record<string, string>
): Promise<SeeklocSearchResult> {
  const tp = TP_MAP[tipo];
  const fields: Record<string, string> = { tp };

  switch (tipo) {
    case "documento":
      fields.doc = onlyDigits(params.doc);
      break;
    case "nome":
      fields.nome = (params.nome || "").trim();
      if (params.dtnasc) fields.dtnasc = onlyDigits(params.dtnasc); // yyyymmdd
      if (params.uf) fields.uf = params.uf.trim().toUpperCase();
      break;
    case "telefone":
      fields.ddd = onlyDigits(params.ddd);
      fields.fone = onlyDigits(params.fone);
      break;
    case "email":
      fields.email = (params.email || "").trim();
      break;
    case "placa":
      fields.placa = (params.placa || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
      break;
    case "endereco":
      if (params.logradouro) fields.logradouro = params.logradouro.trim();
      if (params.numero) fields.numero = onlyDigits(params.numero);
      if (params.numero1) fields.numero1 = onlyDigits(params.numero1);
      if (params.bairro) fields.bairro = params.bairro.trim();
      if (params.cidade) fields.cidade = params.cidade.trim();
      if (params.uf) fields.uf = params.uf.trim().toUpperCase();
      if (params.cep) fields.cep = onlyDigits(params.cep);
      break;
    case "cep":
      fields.cep = onlyDigits(params.cep);
      if (params.numero) fields.numero = onlyDigits(params.numero);
      if (params.numero1) fields.numero1 = onlyDigits(params.numero1);
      break;
  }

  const json = await postWs(fields);
  const oc = json?.ocorrencia || {};
  const codocor = String(oc.codocor ?? "");
  const ok = codocor === "0";

  // docs pode vir como array direto ou aninhado — normaliza defensivamente.
  const hits: SeeklocHit[] = digArray(json?.docs, "doc")
    .map((d: any) => ({
      id: String(d?.id ?? ""),
      doc: String(d?.doc ?? ""),
      nome: String(d?.nome ?? ""),
    }))
    .filter((h) => h.id || h.doc);

  return {
    ok,
    codocor,
    mensagem: String(oc.msgocor ?? (ok ? "Sucesso" : "Nenhum dado encontrado")),
    qtde: Number(oc.qtde ?? hits.length) || hits.length,
    hits,
  };
}

/**
 * Etapa 2 — detalhe (tp=3). Retorna o dossiê normalizado + o JSON cru.
 */
export async function seeklocDetail(id: string, doc: string) {
  const json = await postWs({ tp: "3", id: String(id), doc: onlyDigits(doc) });
  return { dossie: normalizeDossie(json), raw: json };
}

// ───────────────────────────────────────────────────────────────────────────
// Normalização do dossiê
// ───────────────────────────────────────────────────────────────────────────

/**
 * O Seekloc devolve listas ora como array direto, ora aninhadas
 * (`{ endereco: [...], qtde }` / `{ "0": {...}, qtde }`). Este helper extrai um
 * array "limpo" de objetos em qualquer um desses formatos.
 */
function digArray(node: any, innerKey?: string): any[] {
  if (!node) return [];
  if (Array.isArray(node)) return node.filter((v) => v && typeof v === "object");
  if (typeof node !== "object") return [];

  if (innerKey && node[innerKey] != null) {
    return digArray(node[innerKey]);
  }
  // Objeto genérico: pega valores que são objetos/arrays, ignora contadores.
  const out: any[] = [];
  for (const [k, v] of Object.entries(node)) {
    if (k === "qtde" || k === "qtdece" || k === "qtdefix") continue;
    if (Array.isArray(v)) out.push(...digArray(v));
    else if (v && typeof v === "object") out.push(v);
  }
  return out;
}

const SEXO: Record<string, string> = { "1": "Masculino", "0": "Feminino", "2": "Indefinido" };

/** yyyymmdd → dd/mm/yyyy */
function fmtData(v?: string): string {
  const s = onlyDigits(v);
  if (s.length !== 8) return v || "";
  return `${s.slice(6, 8)}/${s.slice(4, 6)}/${s.slice(0, 4)}`;
}

export interface SeeklocDossie {
  doc: string;
  nome: string;
  mae: string;
  sexo: string;
  nascimentoAbertura: string;
  obito: string;
  fantasia: string;
  situacao: string;
  atividadePrincipal: string;
  atividadeSecundaria: string;
  natureza: string;
  enderecos: any[];
  telefones: { ddd: string; fone: string; tipo: string }[];
  emails: string[];
  veiculos: any[];
  empregos: any[];
  societario: any[];
  participacoes: any[];
  vizinhos: any[];
  irmaos: any[];
  parentes: any[];
}

function normalizeDossie(json: any): SeeklocDossie {
  const tel = json?.telefones || {};
  const fixos = digArray(tel.fixo).map((t: any) => ({
    ddd: String(t?.ddd ?? ""),
    fone: String(t?.fone ?? ""),
    tipo: "Fixo",
  }));
  const cels = digArray(tel.celulares).map((t: any) => ({
    ddd: String(t?.ddd ?? ""),
    fone: String(t?.fone ?? ""),
    tipo: "Celular",
  }));

  return {
    doc: String(json?.doc ?? ""),
    nome: String(json?.nome ?? ""),
    mae: String(json?.mae ?? ""),
    sexo: SEXO[String(json?.sexo ?? "")] || "",
    nascimentoAbertura: fmtData(json?.dtnasc_abertura),
    obito: fmtData(json?.dtobito),
    fantasia: String(json?.fantasia ?? ""),
    situacao: String(json?.situacao ?? ""),
    atividadePrincipal: String(json?.descatvpri ?? ""),
    atividadeSecundaria: String(json?.descatvseg ?? ""),
    natureza: String(json?.descnat ?? ""),
    enderecos: digArray(json?.enderecos, "endereco"),
    telefones: [...cels, ...fixos],
    emails: digArray(json?.emails, "email")
      .map((e: any) => String(e?.email ?? e ?? ""))
      .filter(Boolean),
    veiculos: digArray(json?.veiculos, "veiculo"),
    empregos: digArray(json?.empregos, "emprego"),
    societario: digArray(json?.quadrosoc, "quadrosoc"),
    participacoes: digArray(json?.participsoc, "participsoc"),
    vizinhos: digArray(json?.vizinhos, "vizinho"),
    irmaos: digArray(json?.irmaos, "irmao"),
    parentes: digArray(json?.parentes, "parente"),
  };
}
