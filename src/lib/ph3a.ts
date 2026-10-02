/**
 * Cliente da API PH3A (DataBusca) — Tappy IQ. SERVER-ONLY.
 *
 * Contrato confirmado ao vivo (host api.ph3a.com.br, basePath /DataBusca):
 *   Login:   POST /api/Account/Login  { UserName, Password }  → { data: { Token } }
 *   Dossiê:  POST /data/v2  (header `token`)  body: { Document, Type }
 *            Type: 0=Document, 2=CPF, 3=CNPJ, 4=SequentialId
 *   Busca:   POST /search  (header `token`)  body: { Name | Phone | Email | Document | BirthDate }
 *            → lista de candidatos com prévia (doc mascarado).
 *
 * ⚠️ A "API key" da PH3A é um GUID usado como UserName E Password no login.
 * O usuário de API já vem com pacote default (não precisa PackageId).
 *
 * Config via env:
 *   PH3A_API_URL=https://api.ph3a.com.br/DataBusca
 *   PH3A_API_KEY=<GUID>   (login=senha)   | ou PH3A_USER/PH3A_PWD
 */

const PH3A_URL = (process.env.PH3A_API_URL || "https://api.ph3a.com.br/DataBusca").replace(/\/$/, "");
const PH3A_API_KEY = process.env.PH3A_API_KEY || "";
const PH3A_USER = PH3A_API_KEY || process.env.PH3A_USER || "";
const PH3A_PWD = PH3A_API_KEY || process.env.PH3A_PWD || "";

export function ph3aConfigured(): boolean {
  return !!(PH3A_USER && PH3A_PWD);
}

// ─────────────────────────── Tipos ───────────────────────────

export interface Ph3aTelefone {
  numero: string;
  operadora?: string;
  whatsapp?: boolean;
  celular?: boolean;
  historico?: boolean; // Status 0 = histórico (PH3A separa de ativos)
}
export interface Ph3aEmail {
  email: string;
  validado?: boolean;
}
export interface Ph3aEndereco {
  endereco: string;
  cidade?: string;
  uf?: string;
  cep?: string;
}
export interface Ph3aDossie {
  nome: string;
  documento: string;
  nascimento?: string;
  idade?: number;
  sexo?: string;
  mae?: string;
  pai?: string;
  estadoCivil?: string; // sempre preenchido (cai em "Não informado")
  escolaridade?: string;
  dependentes?: number;
  flags?: string[]; // PPE/VIP/óbito etc. (best-effort)
  blacklist?: boolean; // lista restritiva (vem da busca /search)
  // score
  scoreD00?: number;
  scoreD30?: number;
  scoreD60?: number;
  scoreD90?: number;
  // financeiro
  rendaPessoal?: number;
  rendaFamiliar?: number;
  rendaPresumida?: number;
  aposentadoria?: number;
  rendaEmpresarial?: number;
  classePessoal?: string; // A–E
  classeFamiliar?: string;
  // listas
  telefones: Ph3aTelefone[];
  emails: Ph3aEmail[];
  enderecos: Ph3aEndereco[];
}

export interface Ph3aCandidato {
  sequentialId: number;
  personType: number;
  nome: string;
  idade?: number;
  documentoMasc?: string;
  mae?: string;
  local?: string;
  probabilidade?: number;
  blacklist?: boolean;
  flags?: number;
}

export interface Ph3aResult {
  configured: boolean;
  ok: boolean;
  mensagem?: string;
  notFound?: boolean;
  dossie?: Ph3aDossie;
  data?: any;
  raw?: any;
}

export interface Ph3aSearchResult {
  configured: boolean;
  ok: boolean;
  mensagem?: string;
  candidatos: Ph3aCandidato[];
  raw?: any;
}

const onlyDigits = (v?: string) => (v || "").replace(/\D/g, "");

const SEXO: Record<number, string> = { 1: "Masculino", 2: "Feminino" };
// Calibrado pela verdade da cliente: código 1 = Casado.
const ESTADO_CIVIL: Record<number, string> = {
  0: "Não informado",
  1: "Casado(a)",
  2: "Solteiro(a)",
  3: "Divorciado(a)",
  4: "Viúvo(a)",
  5: "Separado(a)",
  6: "União estável",
  7: "Outros",
};
// EducationalLevelGroup (coarse, confiável). 4 = Superior (confirmado).
const ESCOLARIDADE_GRUPO: Record<number, string> = {
  0: "Não informado",
  1: "Analfabeto / Fundamental",
  2: "Ensino fundamental",
  3: "Ensino médio",
  4: "Ensino superior",
  5: "Pós-graduação",
};
// Classe social: 0=A … 4=E (confirmado: PersonalClass 1=B, FamilyClass 2=C).
const CLASSE: Record<number, string> = { 0: "A", 1: "B", 2: "C", 3: "D", 4: "E" };

function fmtDataISO(iso?: string): string | undefined {
  if (!iso) return undefined;
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : undefined;
}

const num = (v: any): number | undefined => (typeof v === "number" && !Number.isNaN(v) ? v : undefined);
const posNum = (v: any): number | undefined => {
  const n = num(v);
  return n != null && n >= 0 ? n : undefined;
};

/** Mapeia a resposta crua do /data/v2 num dossiê limpo para a UI. */
export function normalizePh3a(json: any): Ph3aDossie | undefined {
  const d = json?.Data;
  if (!d) return undefined;
  const person = d.Person || {};
  const inc = d.Income || {};
  const cs = d.CreditScore || {};

  const telefones: Ph3aTelefone[] = (Array.isArray(d.Phones) ? d.Phones : []).map((p: any) => ({
    numero: p.FormattedNumber || `(${p.AreaCode}) ${p.Number}`,
    operadora: p.Operator || undefined,
    whatsapp: !!p.IsWhatsapp,
    celular: !!p.IsMobile,
    historico: p.Status === 0, // 0 = histórico; 1/3 = ativo
  }));

  const emails: Ph3aEmail[] = (Array.isArray(d.Emails) ? d.Emails : [])
    .map((e: any) => ({ email: e.Email, validado: !!e.IsValidated }))
    .filter((e: Ph3aEmail) => e.email);

  const enderecos: Ph3aEndereco[] = (Array.isArray(d.Addresses) ? d.Addresses : []).map((a: any) => ({
    endereco: a.Alias || [a.Street, a.Number, a.District].filter(Boolean).join(", "),
    cidade: a.City || undefined,
    uf: a.State || undefined,
    cep: a.ZipCode ? String(a.ZipCode).replace(/(\d{5})(\d{3})/, "$1-$2") : undefined,
  }));

  // flags do próprio titular (best-effort) — exibe óbito quando presente
  const flags: string[] = [];
  if (Array.isArray(d.FlagList) && d.FlagList.includes(64)) flags.push("Registro especial (Receita)");

  return {
    nome: d.NameBrasil || d.Name || "—",
    documento: d.DocumentFormatted || d.Document || "",
    nascimento: fmtDataISO(d.BirthDate),
    idade: num(d.Age),
    sexo: SEXO[d.Gender],
    mae: person.MotherName || undefined,
    pai: person.FatherName || undefined,
    estadoCivil: ESTADO_CIVIL[person.MaritalStatus] ?? ESTADO_CIVIL[0], // SEMPRE exibe
    escolaridade: ESCOLARIDADE_GRUPO[person.EducationalLevelGroup],
    dependentes: num(person.Dependents),
    flags: flags.length ? flags : undefined,
    scoreD00: posNum(cs.D00),
    scoreD30: posNum(cs.D30),
    scoreD60: posNum(cs.D60),
    scoreD90: posNum(cs.D90),
    rendaPessoal: posNum(inc.Personal),
    rendaFamiliar: posNum(inc.Family),
    rendaPresumida: posNum(inc.Presumed),
    aposentadoria: posNum(inc.Retired),
    rendaEmpresarial: posNum(inc.Business ?? inc.Company ?? inc.Corporate),
    classePessoal: CLASSE[inc.PersonalClass],
    classeFamiliar: CLASSE[inc.FamilyClass],
    telefones,
    emails,
    enderecos,
  };
}

function normalizeCandidato(c: any): Ph3aCandidato {
  return {
    sequentialId: c.SequentialId,
    personType: c.PersonType,
    nome: c.Name || "—",
    idade: num(c.Age),
    documentoMasc: c.DocumentFmt || undefined,
    mae: c.MotherNameFmt || undefined,
    local: c.Location || undefined,
    probabilidade: num(c.Probability),
    blacklist: !!c.IsFromBlackList,
    flags: num(c.Flags),
  };
}

// ─────────────────────────── Auth ───────────────────────────

let tokenCache: { token: string; exp: number } | null = null;

async function getToken(): Promise<string> {
  if (tokenCache && tokenCache.exp > Date.now()) return tokenCache.token;
  const res = await fetch(`${PH3A_URL}/api/Account/Login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ UserName: PH3A_USER, Password: PH3A_PWD }),
    cache: "no-store",
    signal: AbortSignal.timeout(25000),
  });
  const json = await res.json().catch(() => null);
  const token = json?.data?.Token;
  if (!res.ok || !token) throw new Error(json?.message || `Falha no login PH3A (HTTP ${res.status})`);
  tokenCache = { token, exp: Date.now() + 8 * 60 * 1000 };
  return token;
}

const NAO_ENCONTRADO =
  "Nenhum registro foi localizado para os dados informados. Verifique o documento/parâmetro e tente novamente.";

// ─────────────────────────── Dossiê por documento (CPF/CNPJ) ───────────────────────────

export async function ph3aSearch(documento: string): Promise<Ph3aResult> {
  if (!ph3aConfigured()) {
    return { configured: false, ok: false, mensagem: "PH3A ainda não configurado (defina PH3A_API_KEY no servidor)." };
  }
  const doc = onlyDigits(documento);
  if (doc.length !== 11 && doc.length !== 14) {
    return { configured: true, ok: false, mensagem: "Informe um CPF (11 dígitos) ou CNPJ (14 dígitos)." };
  }
  const Type = doc.length === 11 ? 2 : 3;
  return ph3aFetchDossie({ Document: doc, Type });
}

/** Dossiê por SequentialId (vem da busca /search). Type 4. */
export async function ph3aDetailBySequentialId(sequentialId: number | string): Promise<Ph3aResult> {
  if (!ph3aConfigured()) {
    return { configured: false, ok: false, mensagem: "PH3A ainda não configurado." };
  }
  return ph3aFetchDossie({ Document: String(sequentialId), Type: 4 });
}

async function ph3aFetchDossie(body: Record<string, any>): Promise<Ph3aResult> {
  try {
    const token = await getToken();
    const res = await fetch(`${PH3A_URL}/data/v2`, {
      method: "POST",
      headers: { "Content-Type": "application/json", token },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(40000),
    });
    const json = await res.json().catch(() => null);

    if (res.status === 401) tokenCache = null;
    if (!res.ok || json?.Status === 404) {
      return { configured: true, ok: false, notFound: true, mensagem: NAO_ENCONTRADO, raw: json };
    }
    if (!json?.Data) {
      return { configured: true, ok: false, notFound: true, mensagem: NAO_ENCONTRADO, raw: json };
    }
    return { configured: true, ok: true, dossie: normalizePh3a(json), data: json, raw: json };
  } catch (error: any) {
    tokenCache = null;
    return { configured: true, ok: false, mensagem: error?.message || "Falha ao consultar a PH3A" };
  }
}

// ─────────────────────────── Busca multi-parâmetro (/search) ───────────────────────────

// Nomes EXATOS dos campos aceitos pelo /search (lidos do front oficial do PH3A).
const SEARCH_FIELDS = [
  "PersonType", "Name", "CompanyName", "Document", "MotherName", "BirthDate",
  "City", "State", "Street", "AddressNumber", "ZipCode", "Radius",
  "CarPlate", "Renavam", "PhoneNumber", "Email", "Url",
] as const;
const DIGIT_FIELDS = new Set(["Document", "ZipCode", "AddressNumber", "Radius", "PhoneNumber", "Renavam"]);

/**
 * Busca avançada multi-parâmetro. `fields` usa os nomes da API
 * (Name, City, State, PhoneNumber, CarPlate, …). PersonType: 0=PF, 1=PJ (omitir = ambos).
 */
export async function ph3aBuscar(fields: Record<string, string | number>): Promise<Ph3aSearchResult> {
  if (!ph3aConfigured()) {
    return { configured: false, ok: false, mensagem: "PH3A ainda não configurado.", candidatos: [] };
  }

  const body: Record<string, any> = {};
  for (const k of SEARCH_FIELDS) {
    const rawv = fields[k];
    if (rawv == null || String(rawv).trim() === "") continue;
    if (k === "PersonType") {
      const pt = Number(rawv);
      if (pt === 0 || pt === 1) body.PersonType = pt;
      continue;
    }
    let v = String(rawv).trim();
    if (k === "CarPlate") v = v.toUpperCase().replace(/[^A-Z0-9]/g, "");
    else if (DIGIT_FIELDS.has(k)) v = onlyDigits(v);
    if (v) body[k] = v;
  }

  // precisa de ao menos um critério além do PersonType
  const criterios = Object.keys(body).filter((k) => k !== "PersonType");
  if (criterios.length === 0) {
    return { configured: true, ok: false, mensagem: "Informe ao menos um dado para a busca.", candidatos: [] };
  }

  try {
    const token = await getToken();
    const res = await fetch(`${PH3A_URL}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json", token },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(30000),
    });
    if (res.status === 401) tokenCache = null;
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      return { configured: true, ok: false, mensagem: `PH3A respondeu HTTP ${res.status}`, candidatos: [], raw: json };
    }
    const list = Array.isArray(json) ? json : [];
    const candidatos = list.map(normalizeCandidato).filter((c) => c.sequentialId);
    return {
      configured: true,
      ok: true,
      mensagem: candidatos.length ? undefined : NAO_ENCONTRADO,
      candidatos,
      raw: json,
    };
  } catch (error: any) {
    tokenCache = null;
    return { configured: true, ok: false, mensagem: error?.message || "Falha na busca PH3A", candidatos: [] };
  }
}
