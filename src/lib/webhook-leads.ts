import { leadSourceLabels } from "@/types/lead";
import { rotuloOrigem } from "@/lib/utm";

/**
 * Espelha cada lead do site num webhook externo (Make, Zapier, planilha).
 *
 * A URL vem de variável de ambiente, não do código: o marketing troca o
 * cenário no Make sem precisar de deploy, e sem a variável o recurso fica
 * simplesmente desligado (útil em dev, onde ninguém quer poluir a planilha).
 *
 * NUNCA bloqueia nem derruba a criação do lead. Quando isto roda, o lead já
 * está gravado e a equipe já foi notificada — o espelho é a parte menos
 * crítica do fluxo e falha em silêncio, só com log.
 */

const TIMEOUT_MS = 8000;

/**
 * Nome do formulário a partir das tags que cada tela envia.
 * É o que responde "de onde veio esse lead?" com mais precisão que `source`,
 * que agrupa vários formulários sob o mesmo rótulo (vários são "SITE").
 */
const FORMULARIO_POR_TAG: Record<string, string> = {
  BOTAO_WHATSAPP: "Botão de WhatsApp",
  INTERESSE_IMOVEL: "Interesse na ficha do imóvel",
  VIDEO_IMOVEL: "Pedido de vídeo do imóvel",
  CONTATO_SITE: "Página de contato",
  POPUP_FORM: "Pop-up do site",
  AVALIACAO_IMOVEL: "Avaliação de imóvel",
  VENDA_IMOVEL: "Quero vender meu imóvel",
  OFF_MARKET_PROPRIETARIO: "Off-market — proprietário",
  OFF_MARKET_CORRETOR: "Off-market — corretor",
  OFF_MARKET_CLIENTE: "Off-market — cliente",
  OFF_MARKET: "Off-market",
  AGENDAMENTO_VISITA: "Agendamento de visita",
};

/** Primeira tag conhecida vence; a ordem do mapa define a prioridade. */
function nomeDoFormulario(tags: string[]): string {
  for (const tag of Object.keys(FORMULARIO_POR_TAG)) {
    if (tags.includes(tag)) return FORMULARIO_POR_TAG[tag];
  }
  return "Formulário do site";
}

export type LeadParaWebhook = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  message?: string | null;
  source: string;
  tags?: string[];
  createdAt: Date;

  /** Campanha, capturada quando o visitante chegou ao site (cookie ci_origem). */
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  gclid?: string | null;
  fbclid?: string | null;
  landingPage?: string | null;
  referrer?: string | null;

  /** Imóvel, quando o lead saiu de uma ficha. */
  propertyCode?: string | null;
  propertyTitle?: string | null;
  propertyPrice?: number | null;

  /** Botão exato de onde partiu — só os botões de WhatsApp informam isso. */
  botao?: string | null;
};

/** Data e hora legíveis no fuso de São Paulo, prontas para a célula da planilha. */
function dataBR(d: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export async function enviarLeadParaWebhook(lead: LeadParaWebhook) {
  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url) return;

  const tags = lead.tags || [];

  /*
    Objeto RASO de propósito. O destino é uma planilha, e campo aninhado vira
    coluna com JSON dentro — ilegível para quem lê a linha. Chaves em português
    porque quem monta o cenário no Make é a equipe de marketing.
  */
  const payload = {
    id: lead.id,
    data: dataBR(lead.createdAt),
    data_iso: lead.createdAt.toISOString(),

    nome: lead.name,
    telefone: lead.phone || "",
    email: lead.email || "",
    mensagem: lead.message || "",

    formulario: nomeDoFormulario(tags),
    botao: lead.botao || "",
    origem: leadSourceLabels[lead.source] || lead.source,
    origem_codigo: lead.source,
    tags: tags.join(", "),

    campanha: rotuloOrigem(lead),
    utm_source: lead.utmSource || "",
    utm_medium: lead.utmMedium || "",
    utm_campaign: lead.utmCampaign || "",
    utm_content: lead.utmContent || "",
    utm_term: lead.utmTerm || "",
    gclid: lead.gclid || "",
    fbclid: lead.fbclid || "",
    pagina_entrada: lead.landingPage || "",
    site_origem: lead.referrer || "",

    imovel_codigo: lead.propertyCode || "",
    imovel_titulo: lead.propertyTitle || "",
    imovel_valor: lead.propertyPrice ?? "",

    link_crm: `https://tappyimob.com.br/admin/clientes/leads?lead=${lead.id}`,
  };

  try {
    // AbortSignal.timeout evita que um webhook lento segure a resposta ao visitante
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error(
        "[webhook-leads] destino respondeu",
        res.status,
        await res.text().catch(() => "")
      );
    }
  } catch (erro) {
    console.error("[webhook-leads] falhou:", erro instanceof Error ? erro.message : erro);
  }
}
