/**
 * Origem de campanha (UTM) dos leads do site.
 *
 * O problema que isso resolve: quem chega por um anúncio cai numa página com
 * `?utm_source=google&...`, navega pelo site e só preenche o formulário duas ou
 * três páginas depois — quando os parâmetros já sumiram da URL. Ler a URL na
 * hora do envio perderia praticamente todo lead de anúncio.
 *
 * Por isso a origem é gravada num cookie assim que a pessoa entra e lida no
 * servidor na hora de criar o lead. Como o cookie viaja sozinho em toda
 * requisição, qualquer formulário — inclusive os que forem criados depois —
 * já nasce rastreado sem precisar passar nada no corpo do POST.
 */

export const UTM_COOKIE = "ci_origem";

/** 90 dias: cobre ciclo de decisão de imóvel, que é longo. */
export const UTM_COOKIE_MAX_AGE = 60 * 60 * 24 * 90;

export type UtmData = {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  gclid: string | null;
  fbclid: string | null;
  landingPage: string | null;
  referrer: string | null;
};

export const UTM_VAZIO: UtmData = {
  utmSource: null,
  utmMedium: null,
  utmCampaign: null,
  utmTerm: null,
  utmContent: null,
  gclid: null,
  fbclid: null,
  landingPage: null,
  referrer: null,
};

/** Valores longos demais são lixo ou tentativa de encher o cookie. */
const LIMITE = 200;

function limpar(valor: string | null | undefined): string | null {
  if (!valor) return null;
  const v = valor.trim().slice(0, LIMITE);
  return v.length > 0 ? v : null;
}

/** Só o host, sem www — é o que interessa para saber de onde veio. */
function hostDoReferrer(referrer: string | null): string | null {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * Deduz origem e mídia quando o anúncio não veio com utm_source.
 *
 * Isso não é um extra: o Google Ads com marcação automática ligada manda só
 * `gclid`, sem nenhum utm_*. Sem esta dedução, justamente as campanhas de
 * Google chegariam ao CRM sem origem — que é o problema que se quer resolver.
 */
function deduzirOrigem(
  dados: UtmData
): { source: string | null; medium: string | null } {
  if (dados.gclid) return { source: "google", medium: "cpc" };
  if (dados.fbclid) return { source: "facebook", medium: "social" };

  const host = hostDoReferrer(dados.referrer);
  if (!host) return { source: "direto", medium: "none" };

  if (host.includes("google")) return { source: "google", medium: "organico" };
  if (host.includes("bing")) return { source: "bing", medium: "organico" };
  if (host.includes("instagram")) return { source: "instagram", medium: "social" };
  if (host.includes("facebook")) return { source: "facebook", medium: "social" };
  if (host.includes("linkedin")) return { source: "linkedin", medium: "social" };
  if (host.includes("youtube")) return { source: "youtube", medium: "social" };

  return { source: host, medium: "referral" };
}

/**
 * Lê a origem a partir da query string de entrada.
 *
 * Devolve `null` quando não há nenhum sinal de campanha — o chamador usa isso
 * para decidir se sobrescreve o que já estava gravado.
 */
export function lerOrigemDaUrl(
  search: string,
  referrer: string | null,
  caminho: string
): { dados: UtmData; temCampanha: boolean } {
  const p = new URLSearchParams(search);

  const bruto: UtmData = {
    utmSource: limpar(p.get("utm_source")),
    utmMedium: limpar(p.get("utm_medium")),
    utmCampaign: limpar(p.get("utm_campaign")),
    utmTerm: limpar(p.get("utm_term")),
    utmContent: limpar(p.get("utm_content")),
    gclid: limpar(p.get("gclid")),
    fbclid: limpar(p.get("fbclid")),
    landingPage: limpar(caminho),
    referrer: limpar(referrer),
  };

  const temCampanha = Boolean(
    bruto.utmSource ||
      bruto.utmMedium ||
      bruto.utmCampaign ||
      bruto.utmTerm ||
      bruto.utmContent ||
      bruto.gclid ||
      bruto.fbclid
  );

  const deduzido = deduzirOrigem(bruto);

  return {
    dados: {
      ...bruto,
      utmSource: bruto.utmSource || deduzido.source,
      utmMedium: bruto.utmMedium || deduzido.medium,
    },
    temCampanha,
  };
}

export function serializarOrigem(dados: UtmData): string {
  // Campos nulos ficam de fora para o cookie não crescer à toa.
  const enxuto: Record<string, string> = {};
  for (const [k, v] of Object.entries(dados)) {
    if (v) enxuto[k] = v as string;
  }
  return encodeURIComponent(JSON.stringify(enxuto));
}

export function desserializarOrigem(bruto: string | null | undefined): UtmData {
  if (!bruto) return { ...UTM_VAZIO };
  try {
    const obj = JSON.parse(decodeURIComponent(bruto));
    if (!obj || typeof obj !== "object") return { ...UTM_VAZIO };
    const saida: UtmData = { ...UTM_VAZIO };
    for (const chave of Object.keys(UTM_VAZIO) as (keyof UtmData)[]) {
      saida[chave] = limpar(obj[chave]);
    }
    return saida;
  } catch {
    // Cookie corrompido não pode derrubar a criação do lead.
    return { ...UTM_VAZIO };
  }
}

/** Rótulo curto para telas e planilhas: "google / cpc". */
export function rotuloOrigem(dados: Partial<UtmData>): string {
  const source = dados.utmSource || "direto";
  const medium = dados.utmMedium;
  return medium ? `${source} / ${medium}` : source;
}
