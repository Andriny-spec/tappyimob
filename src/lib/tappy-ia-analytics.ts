/**
 * Tappy IA — ferramentas ANALÍTICAS (rankings, contagens agrupadas, dossiês).
 *
 * As ferramentas de `tappy-ia-tools.ts` listam registros; estas respondem as
 * perguntas de dono: "qual imóvel teve mais acessos este mês", "quem mais
 * efetivou", "quantos leads quentes por corretor". Todas são somente leitura.
 *
 * Regras que valem para todas:
 * - Números vêm do banco, nunca da IA. Cada resposta diz o critério usado
 *   (`criterio`) para a IA repetir ao usuário em vez de supor.
 * - Nomes de corretor são resolvidos aqui dentro (`corretor: "Jussara"`), para
 *   a IA não precisar de uma consulta extra só para descobrir o id.
 * - Corretor só enxerga os próprios leads, propostas e números; rankings da
 *   equipe e dossiês de colegas são exclusivos do admin.
 */

import OpenAI from "openai";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { leadSourceLabels, leadTicketLabels } from "@/types/lead";
import {
  CONDICAO_POR_AREA,
  ROTULO_AREA,
  areaDoLead,
  carregarRotulosDeEtapa,
  type Area,
} from "@/lib/lead-areas";
import { clampLimit, ci, type ToolHandler, type ToolContext } from "./tappy-ia-tools";

const SITE = "https://tappyimob.com.br";

/** Os logs de acesso por data começam aqui; antes disso só existe o contador acumulado. */
const INICIO_LOG_ACESSOS = "07/04/2026";

// ===================================================================
// UTILITÁRIOS
// ===================================================================

type Periodo = { de: Date | null; ate: Date; rotulo: string };

/**
 * Período a partir de `periodo_dias` OU `de`/`ate` (AAAA-MM-DD). Sem nenhum
 * dos dois, o período é "todo o histórico" (`de = null`).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function lerPeriodo(args: any): Periodo {
  const ate = args.ate ? new Date(`${args.ate}T23:59:59.999-03:00`) : new Date();
  if (args.de) {
    const de = new Date(`${args.de}T00:00:00-03:00`);
    if (!Number.isNaN(de.getTime())) {
      return { de, ate, rotulo: `de ${dataBR(de)} até ${dataBR(ate)}` };
    }
  }
  const dias = Number(args.periodo_dias);
  // Mais de 10 anos é o modelo pedindo "tudo" com um número grande
  if (Number.isFinite(dias) && dias > 0 && dias <= 3650) {
    const de = new Date(ate.getTime() - dias * 86_400_000);
    return { de, ate, rotulo: `últimos ${dias} dias (desde ${dataBR(de)})` };
  }
  return { de: null, ate, rotulo: "todo o histórico" };
}

function dataBR(d: Date | null | undefined) {
  if (!d) return null;
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric" }).format(d);
}

/** Filtro de período para SQL cru: sempre verdadeiro quando não há início. */
function noPeriodo(coluna: Prisma.Sql, p: Periodo) {
  return p.de
    ? Prisma.sql`${coluna} >= ${p.de} AND ${coluna} <= ${p.ate}`
    : Prisma.sql`${coluna} <= ${p.ate}`;
}

/** Mesmo filtro no formato do Prisma Client. */
function periodoPrisma(p: Periodo) {
  return p.de ? { gte: p.de, lte: p.ate } : { lte: p.ate };
}

/**
 * Nome de condomínio normalizado para agrupar: "Sua Cidade 09", "sua cidade 9"
 * e "Sua Cidade  9 " são o mesmo lugar. Sem isso, a tela de Insights mostra
 * o mesmo condomínio duas vezes com contagens partidas.
 */
function normalizarNome(s: string) {
  return s
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\b0+(\d)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/** Resolve um corretor/usuário por id, e-mail ou parte do nome. */
async function resolverUsuario(busca: string | undefined) {
  if (!busca || !String(busca).trim()) return { usuario: null as null | { id: string; name: string } };
  const q = String(busca).trim();
  const porId = await prisma.user.findUnique({ where: { id: q }, select: { id: true, name: true } });
  if (porId) return { usuario: porId };
  const candidatos = await prisma.user.findMany({
    where: {
      role: { notIn: ["CLIENTE"] },
      OR: [{ name: ci(q) }, { email: ci(q) }],
    },
    select: { id: true, name: true, role: true, isActive: true },
    take: 6,
  });
  if (candidatos.length === 1) return { usuario: candidatos[0] };
  // Nome exato desempata "Lucas" vs "Lucas da Silva"
  const exato = candidatos.find((c) => normalizarNome(c.name) === normalizarNome(q));
  if (exato) return { usuario: exato };
  if (candidatos.length === 0) return { erro: `Nenhum usuário encontrado para "${q}".` };
  return {
    erro: `Mais de um usuário corresponde a "${q}". Pergunte qual.`,
    candidatos: candidatos.map((c) => ({ id: c.id, nome: c.name, perfil: c.role, ativo: c.isActive })),
  };
}

/** Aceita o código ("ZAP_IMOVEIS") ou o rótulo ("ZAP Imóveis") da origem. */
function codigoOrigem(origem: string | undefined) {
  if (!origem) return undefined;
  const alvo = normalizarNome(origem);
  if (leadSourceLabels[origem.toUpperCase()]) return origem.toUpperCase();
  const achado = Object.entries(leadSourceLabels).find(([k, v]) => normalizarNome(v) === alvo || normalizarNome(k) === alvo);
  return achado?.[0] ?? origem.toUpperCase();
}

const apenasAdmin = (ctx: ToolContext) =>
  ctx.role === "ADMIN" ? null : { error: "Esta consulta é restrita ao administrador." };

const semFotografo = (ctx: ToolContext) =>
  ctx.role === "FOTOGRAFO" ? { error: "Sem permissão para dados de clientes." } : null;

/** Origens que o site grava mas o mapa de rótulos do CRM não cobre. */
const ROTULOS_ORIGEM_EXTRA: Record<string, string> = {
  OFF_MARKET: "Off Market", AVALIACAO: "Avaliação", CAPTACAO: "Captação", POPUP: "Pop-up do site",
  PARCERIA_CORRETOR: "Parceria Corretor", OPEN_HOUSE: "Open House",
};
const rotuloOrigem = (s: string) => leadSourceLabels[s] || ROTULOS_ORIGEM_EXTRA[s] || s;

const num = (v: unknown) => (typeof v === "bigint" ? Number(v) : v == null ? 0 : Number(v));

// ===================================================================
// DEFINIÇÕES
// ===================================================================

const PERIODO_PROPS = {
  periodo_dias: { type: "number", description: "Janela em dias até hoje (7, 30, 90, 365…). Omitir = todo o histórico." },
  de: { type: "string", description: "Início AAAA-MM-DD (alternativa a periodo_dias)." },
  ate: { type: "string", description: "Fim AAAA-MM-DD. Padrão hoje." },
} as const;

export const ANALYTICS_DEFINITIONS: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "ranking_imoveis",
      description:
        "Ranking de imóveis por desempenho: mais acessados, mais clicados, mais favoritados, mais compartilhados, com mais leads, visitas, propostas ou maior interesse geral. Use para 'imóvel mais acessado/visto/clicado/procurado', 'imóveis com mais interesse', 'imóveis do corretor X com mais acessos', 'top imóveis do condomínio Y'.",
      parameters: {
        type: "object",
        properties: {
          metrica: {
            type: "string",
            enum: ["acessos", "cliques", "favoritos", "compartilhamentos", "leads", "visitas", "propostas", "interesse", "preco"],
            description:
              "acessos=visualizações da página; cliques=cliques no card/WhatsApp (acumulado); leads=contatos gerados; interesse=pontuação lead(1)+visita(2)+proposta(3).",
          },
          ...PERIODO_PROPS,
          corretor: { type: "string", description: "Nome ou id do corretor responsável (captador)." },
          condominio: { type: "string" },
          bairro: { type: "string" },
          tipo: { type: "string", enum: ["APARTAMENTO", "CASA", "TERRENO", "COMERCIAL", "COBERTURA", "STUDIO", "FAZENDA", "GALPAO", "KITNET", "LOFT", "FLAT", "SOBRADO", "CHACARA"] },
          categoria: { type: "string", enum: ["VENDA", "LOCACAO", "VENDA_LOCACAO", "TEMPORADA", "LEILAO"] },
          status: { type: "string", enum: ["DISPONIVEL", "VENDIDO", "ALUGADO", "RESERVADO", "SUSPENSO", "INDISPONIVEL", "INATIVO", "TODOS"], description: "Padrão: todos exceto INATIVO." },
          precoMin: { type: "number" },
          precoMax: { type: "number" },
          limite: { type: "number", description: "Padrão 10, máx 25." },
        },
        required: ["metrica"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "ranking_corretores",
      description:
        "Ranking da equipe. Use para 'corretor que mais vendeu/efetivou', 'quem mais fez visitas', 'quem recebeu mais leads', 'quem mais captou', 'corretores cujos imóveis têm mais acessos', 'quem tem mais leads quentes'. Somente admin.",
      parameters: {
        type: "object",
        properties: {
          metrica: {
            type: "string",
            enum: [
              "efetivados", "vendidos_tappy", "propostas_aceitas", "valor_propostas_aceitas", "propostas",
              "visitas", "visitas_realizadas", "leads_recebidos", "leads_quentes", "imoveis_captados", "acessos_imoveis",
            ],
            description:
              "efetivados=leads fechados/efetivados (melhor sinal de venda); vendidos_tappy=imóveis captados pelo corretor marcados como vendidos pela Tappy; imoveis_captados=imóveis sob responsabilidade dele; acessos_imoveis=acessos somados dos imóveis dele.",
          },
          ...PERIODO_PROPS,
          limite: { type: "number" },
        },
        required: ["metrica"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "contar_leads",
      description:
        "Conta leads/clientes com filtros e AGRUPA. Use para qualquer 'quantos leads…', distribuição por temperatura (quente/morno/frio), por etapa do funil, por área (Kanban/Acervo/Limbo), por origem/mídia, por campanha, por corretor, por condomínio de interesse, por tipologia buscada, por finalidade, por perfil ou por mês.",
      parameters: {
        type: "object",
        properties: {
          agrupar_por: {
            type: "string",
            enum: ["nenhum", "temperatura", "etapa", "area", "origem", "campanha", "utm_source", "corretor", "condominio_interesse", "tipologia", "finalidade", "perfil", "mes", "dia"],
          },
          area: { type: "string", enum: ["kanban", "acervo", "limbo", "sdr"], description: "kanban=funil ativo; acervo=arquivados (efetivados, relacionamento…); limbo=perdidos/nurturing/reativar/sem perfil; sdr=em triagem." },
          temperatura: { type: "string", enum: ["QUENTE", "MORNO", "FRIO"] },
          status: { type: "string", description: "Status interno (NOVO, CONTATADO, QUALIFICADO, NEGOCIANDO, VISITA_QUENTE, PROPOSTA, FECHADO, TRIAGEM…)." },
          categoria_arquivo: { type: "string", description: "Categoria do Acervo/Limbo: efetivados, relacionamento, sem_interacao, investidores, perdido, nurturing, reativar, sem_perfil…" },
          origem: { type: "string", description: "Código ou nome da origem: SITE, WHATSAPP, INSTAGRAM, GOOGLE_ADS, META_ADS, ZAP_IMOVEIS, IMOVELWEB, INDICACAO…" },
          campanha: { type: "string", description: "Trecho do nome da campanha (utm_campaign) ou fonte (utm_source)." },
          corretor: { type: "string", description: "Nome ou id do corretor." },
          condominio: { type: "string", description: "Condomínio de interesse." },
          finalidade: { type: "string", enum: ["COMPRA", "LOCACAO", "INVESTIMENTO", "TEMPORADA"] },
          sem_corretor: { type: "boolean" },
          sem_contato_ha_dias: { type: "number", description: "Só leads sem contato há pelo menos N dias." },
          ...PERIODO_PROPS,
          campo_data: { type: "string", enum: ["entrada", "atualizacao"], description: "Período aplica sobre a data de entrada (padrão) ou da última atualização." },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "dossie_imovel",
      description:
        "Tudo sobre UM imóvel: dados, corretor responsável, acessos (total, 7 e 30 dias), cliques, favoritos, leads gerados, visitas, propostas com valores, histórico de preço, portais onde está anunciado e exclusividade. Use quando perguntarem sobre um imóvel específico pelo código ou nome.",
      parameters: {
        type: "object",
        properties: { busca: { type: "string", description: "Código (ex.: CNCD881) ou parte do título." } },
        required: ["busca"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "dossie_lead",
      description:
        "Tudo sobre UM cliente/lead: área e etapa, temperatura, corretor, origem e campanha, orçamento, condomínios de interesse, imóveis enviados/visitados, visitas, propostas, últimas anotações e próximo follow-up.",
      parameters: {
        type: "object",
        properties: { busca: { type: "string", description: "Nome, telefone, e-mail ou id." } },
        required: ["busca"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "dossie_corretor",
      description:
        "Raio-X de UM corretor: leads por área e temperatura, efetivados, propostas, visitas, imóveis captados, os imóveis dele mais acessados e a agenda. Admin consulta qualquer um; corretor só a si mesmo.",
      parameters: {
        type: "object",
        properties: {
          busca: { type: "string", description: "Nome ou id do corretor. Corretor logado pode omitir." },
          ...PERIODO_PROPS,
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_propostas",
      description: "Propostas de compra/locação feitas em imóveis: totais por status, valor somado das aceitas e a lista.",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["PENDENTE", "EM_NEGOCIACAO", "CONTRA_PROPOSTA", "ACEITA", "RECUSADA", "DESISTENCIA"] },
          corretor: { type: "string" },
          imovel: { type: "string", description: "Código do imóvel." },
          ...PERIODO_PROPS,
          ordenar: { type: "string", enum: ["recentes", "maior_valor"] },
          limite: { type: "number" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_negocios",
      description: "Negócios em andamento no módulo jurídico/fechamento (fases: dados recebidos, extração IA, pendente doc, validação interna, minuta gerada, pronto p/ assinatura).",
      parameters: {
        type: "object",
        properties: {
          fase: { type: "string" },
          busca: { type: "string", description: "Código do negócio ou condomínio." },
          incluir_arquivados: { type: "boolean" },
          limite: { type: "number" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "resumo_portais",
      description: "Portais imobiliários: quantos imóveis estão anunciados em cada portal (ZAP, Imovelweb, OLX, Chaves na Mão…) e quantos leads cada portal gerou no período.",
      parameters: { type: "object", properties: { ...PERIODO_PROPS } },
    },
  },
];

// ===================================================================
// HANDLERS
// ===================================================================

/** Coluna de ordenação do ranking de imóveis — lista fechada, nunca texto livre no SQL. */
function ordemImoveis(metrica: string, temPeriodo: boolean) {
  const mapa: Record<string, string> = {
    acessos: temPeriodo ? "acessos_periodo" : "views",
    cliques: "clicks",
    favoritos: "favorites",
    compartilhamentos: "shares",
    leads: "leads",
    visitas: "visitas",
    propostas: "propostas",
    interesse: "interesse",
    preco: "price",
  };
  return Prisma.raw(`"${mapa[metrica] ?? "views"}"`);
}

/**
 * Todas as métricas por corretor numa consulta só. Serve ao ranking e ao
 * dossiê (com `usuarioId`), para os dois nunca divergirem.
 */
async function metricasCorretores(p: Periodo, usuarioId?: string) {
  const filtroUsuario = usuarioId ? Prisma.sql`AND u.id = ${usuarioId}` : Prisma.empty;
  // Efetivado não tem data própria: vale a do arquivamento, senão a da mudança de status.
  const dataEfetivado = Prisma.sql`COALESCE(l."archivedAt", l."statusChangedAt", l."updatedAt")`;
  const acessos = p.de
    ? Prisma.sql`(SELECT COUNT(*) FROM property_view_logs v JOIN properties pr ON pr.id = v."propertyId"
                  WHERE pr."ownerId" = u.id AND ${noPeriodo(Prisma.sql`v."createdAt"`, p)})`
    : Prisma.sql`(SELECT COALESCE(SUM(pr.views), 0) FROM properties pr WHERE pr."ownerId" = u.id)`;

  const linhas = await prisma.$queryRaw<Record<string, unknown>[]>`
    SELECT u.id, u.name AS nome, u.role::text AS perfil, u."isActive" AS ativo,
      (SELECT COUNT(*) FROM leads l WHERE l."corretorId" = u.id
         AND (l.status::text = 'FECHADO' OR l."archivedCategory" = 'efetivados')
         AND ${noPeriodo(dataEfetivado, p)}) AS efetivados,
      (SELECT COUNT(*) FROM properties pr WHERE pr."ownerId" = u.id AND pr."soldBy" = 'TAPPY'
         AND ${noPeriodo(Prisma.sql`COALESCE(pr."soldAt", pr."updatedAt")`, p)}) AS vendidos_tappy,
      (SELECT COUNT(*) FROM property_proposals pp WHERE pp."corretorId" = u.id AND pp.status = 'ACEITA'
         AND ${noPeriodo(Prisma.sql`pp."createdAt"`, p)}) AS propostas_aceitas,
      (SELECT COALESCE(SUM(pp."proposedValue"), 0) FROM property_proposals pp WHERE pp."corretorId" = u.id AND pp.status = 'ACEITA'
         AND ${noPeriodo(Prisma.sql`pp."createdAt"`, p)}) AS valor_propostas_aceitas,
      (SELECT COUNT(*) FROM property_proposals pp WHERE pp."corretorId" = u.id
         AND ${noPeriodo(Prisma.sql`pp."createdAt"`, p)}) AS propostas,
      (SELECT COUNT(*) FROM scheduled_visits sv WHERE sv."corretorId" = u.id AND sv.status::text <> 'CANCELADA'
         AND ${noPeriodo(Prisma.sql`sv.date`, p)}) AS visitas,
      (SELECT COUNT(*) FROM scheduled_visits sv WHERE sv."corretorId" = u.id AND sv.status::text = 'REALIZADA'
         AND ${noPeriodo(Prisma.sql`sv.date`, p)}) AS visitas_realizadas,
      (SELECT COUNT(*) FROM leads l WHERE l."corretorId" = u.id
         AND ${noPeriodo(Prisma.sql`l."createdAt"`, p)}) AS leads_recebidos,
      (SELECT COUNT(*) FROM leads l WHERE l."corretorId" = u.id AND l.temperature::text = 'QUENTE'
         AND l.status::text NOT IN ('ARQUIVADO', 'PERDIDO')) AS leads_quentes,
      (SELECT COUNT(*) FROM properties pr WHERE pr."ownerId" = u.id
         AND ${noPeriodo(Prisma.sql`pr."createdAt"`, p)}) AS imoveis_captados,
      ${acessos} AS acessos_imoveis
    FROM users u
    WHERE u.role::text IN ('CORRETOR', 'ADMIN', 'SDR') ${filtroUsuario}
  `;

  return linhas.map((r) => {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(r)) out[k] = typeof v === "bigint" || k.startsWith("valor") ? num(v) : v;
    return out;
  });
}

export const ANALYTICS_HANDLERS: Record<string, ToolHandler> = {
  // -------- RANKING DE IMÓVEIS --------
  async ranking_imoveis(args, ctx) {
    const p = lerPeriodo(args);
    const limite = clampLimit(args.limite, 10, 25);
    const metrica = String(args.metrica || "acessos");

    const filtros: Prisma.Sql[] = [];
    if (!args.status) filtros.push(Prisma.sql`p.status::text <> 'INATIVO'`);
    else if (args.status !== "TODOS") filtros.push(Prisma.sql`p.status::text = ${args.status}`);
    if (args.tipo) filtros.push(Prisma.sql`p.type::text = ${args.tipo}`);
    if (args.categoria) filtros.push(Prisma.sql`p.category::text = ${args.categoria}`);
    if (args.bairro) filtros.push(Prisma.sql`p.neighborhood ILIKE ${"%" + args.bairro + "%"}`);
    if (args.condominio) {
      // Aceita "Sua Cidade 9" para "Sua Cidade 09" e vice-versa
      const semZero = String(args.condominio).replace(/\b0+(\d)/g, "$1");
      filtros.push(Prisma.sql`regexp_replace(c.name, '\\m0+(\\d)', '\\1', 'g') ILIKE ${"%" + semZero + "%"}`);
    }
    if (args.precoMin) filtros.push(Prisma.sql`p.price >= ${Number(args.precoMin)}`);
    if (args.precoMax) filtros.push(Prisma.sql`p.price <= ${Number(args.precoMax)}`);
    if (args.corretor) {
      const r = await resolverUsuario(args.corretor);
      if (!r.usuario) return r;
      filtros.push(Prisma.sql`p."ownerId" = ${r.usuario.id}`);
    }
    const where = filtros.length ? Prisma.sql`WHERE ${Prisma.join(filtros, " AND ")}` : Prisma.empty;

    const linhas = await prisma.$queryRaw<Record<string, unknown>[]>`
      WITH pv AS (
        SELECT "propertyId", COUNT(*) n FROM property_view_logs
        WHERE ${noPeriodo(Prisma.sql`"createdAt"`, p)} GROUP BY 1
      ),
      ld AS (
        -- Lead gerado na página do imóvel + lead que demonstrou interesse nele no CRM
        SELECT pid, COUNT(DISTINCT lid) n FROM (
          SELECT "propertyId" pid, id lid FROM leads
            WHERE "propertyId" IS NOT NULL AND ${noPeriodo(Prisma.sql`"createdAt"`, p)}
          UNION ALL
          SELECT "propertyId", "leadId" FROM lead_properties
            WHERE (interested = true OR type::text IN ('VISITADO', 'PROPOSTA', 'COMPRADO'))
              AND ${noPeriodo(Prisma.sql`"createdAt"`, p)}
        ) x GROUP BY 1
      ),
      vs AS (
        SELECT svp."propertyId", COUNT(*) n FROM scheduled_visit_properties svp
        JOIN scheduled_visits sv ON sv.id = svp."visitId"
        WHERE sv.status::text <> 'CANCELADA' AND ${noPeriodo(Prisma.sql`sv.date`, p)} GROUP BY 1
      ),
      pp AS (
        SELECT "propertyId", COUNT(*) n FROM property_proposals
        WHERE ${noPeriodo(Prisma.sql`"createdAt"`, p)} GROUP BY 1
      ),
      base AS (
        SELECT p.id, p.code, p.title, p.slug, p.status::text AS status, p.type::text AS tipo,
          p.category::text AS categoria, p.price, p.neighborhood AS bairro, c.name AS condominio,
          u.name AS corretor, p.views, p.clicks, p.favorites, p.shares,
          COALESCE(pv.n, 0) AS acessos_periodo, COALESCE(ld.n, 0) AS leads,
          COALESCE(vs.n, 0) AS visitas, COALESCE(pp.n, 0) AS propostas,
          COALESCE(ld.n, 0) + 2 * COALESCE(vs.n, 0) + 3 * COALESCE(pp.n, 0) AS interesse
        FROM properties p
        LEFT JOIN condominiums c ON c.id = p."condominiumId"
        LEFT JOIN users u ON u.id = p."ownerId"
        LEFT JOIN pv ON pv."propertyId" = p.id
        LEFT JOIN ld ON ld.pid = p.id
        LEFT JOIN vs ON vs."propertyId" = p.id
        LEFT JOIN pp ON pp."propertyId" = p.id
        ${where}
      )
      SELECT * FROM base
      ORDER BY ${ordemImoveis(metrica, !!p.de)} DESC NULLS LAST, views DESC
      LIMIT ${limite}
    `;

    const itens = linhas.map((r, i) => ({
      posicao: i + 1,
      codigo: r.code,
      titulo: r.title,
      condominio: r.condominio,
      bairro: r.bairro,
      tipo: r.tipo,
      status: r.status,
      preco: num(r.price),
      corretor_responsavel: r.corretor,
      acessos_total: num(r.views),
      ...(p.de ? { acessos_no_periodo: num(r.acessos_periodo) } : {}),
      cliques_total: num(r.clicks),
      favoritos_total: num(r.favorites),
      compartilhamentos_total: num(r.shares),
      leads: num(r.leads),
      visitas: num(r.visitas),
      propostas: num(r.propostas),
      pontuacao_interesse: num(r.interesse),
      link: `${SITE}/imovel/${r.slug || r.code}`,
    }));

    const avisos: string[] = [];
    if (["cliques", "favoritos", "compartilhamentos"].includes(metrica) && p.de) {
      avisos.push("Cliques, favoritos e compartilhamentos só existem como total acumulado — o ranking ignorou o período.");
    }
    if (metrica === "acessos" && p.de && p.de < new Date("2026-04-07")) {
      avisos.push(`Acessos por data só são registrados desde ${INICIO_LOG_ACESSOS}.`);
    }
    if (ctx.role === "FOTOGRAFO") {
      itens.forEach((i) => { i.leads = 0; i.propostas = 0; });
    }

    return {
      criterio:
        metrica === "interesse"
          ? "pontuação de interesse = leads + 2×visitas + 3×propostas no período"
          : `ordenado por ${metrica}${metrica === "acessos" ? (p.de ? " no período" : " (total acumulado)") : ""}`,
      periodo: p.rotulo,
      avisos,
      itens,
    };
  },

  // -------- RANKING DE CORRETORES --------
  async ranking_corretores(args, ctx) {
    const negado = apenasAdmin(ctx);
    if (negado) return negado;
    const p = lerPeriodo(args);
    const limite = clampLimit(args.limite, 10, 25);
    const metrica = String(args.metrica || "efetivados");

    const todos = await metricasCorretores(p);
    const itens = todos
      .filter((r) => num(r[metrica]) > 0)
      .sort((a, b) => num(b[metrica]) - num(a[metrica]))
      .slice(0, limite)
      .map((r, i) => ({ posicao: i + 1, ...r, id: undefined }));

    const explicacao: Record<string, string> = {
      efetivados: "leads do corretor com status Fechado ou arquivados como Efetivados",
      vendidos_tappy: "imóveis captados pelo corretor, marcados como vendidos pela Tappy",
      propostas_aceitas: "propostas com status Aceita registradas pelo corretor",
      valor_propostas_aceitas: "soma do valor proposto das propostas aceitas",
      imoveis_captados: "imóveis em que ele é o corretor responsável",
      acessos_imoveis: "acessos somados dos imóveis em que ele é o responsável",
    };

    return {
      criterio: explicacao[metrica] || metrica,
      periodo: p.rotulo,
      total_com_valor: todos.filter((r) => num(r[metrica]) > 0).length,
      avisos: [
        "Quem não aparece nesta lista NÃO tem necessariamente zero — só ficou abaixo do corte. Para o número de uma pessoa específica, use dossie_corretor.",
        "Comissões, metas e contratos não têm registros no sistema; 'venda' aqui é medida por efetivados, propostas aceitas e imóveis vendidos pela Tappy.",
      ],
      itens,
    };
  },

  // -------- CONTAGEM AGRUPADA DE LEADS --------
  async contar_leads(args, ctx) {
    const negado = semFotografo(ctx);
    if (negado) return negado;
    const p = lerPeriodo(args);
    const agrupar = String(args.agrupar_por || "nenhum");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const and: any[] = [];
    if (args.area === "sdr") and.push({ status: "TRIAGEM" });
    else if (args.area && CONDICAO_POR_AREA[args.area as Area]) and.push(CONDICAO_POR_AREA[args.area as Area]);
    if (args.temperatura) and.push({ temperature: args.temperatura });
    if (args.status) and.push({ status: String(args.status).toUpperCase() });
    if (args.categoria_arquivo) and.push({ archivedCategory: ci(args.categoria_arquivo) });
    if (args.origem) and.push({ source: codigoOrigem(args.origem) });
    if (args.finalidade) and.push({ ticket: args.finalidade });
    if (args.campanha) and.push({ OR: [{ utmCampaign: ci(args.campanha) }, { utmSource: ci(args.campanha) }] });
    if (args.sem_corretor) and.push({ corretorId: null });
    if (args.sem_contato_ha_dias) {
      const limite = new Date(Date.now() - Number(args.sem_contato_ha_dias) * 86_400_000);
      and.push({ OR: [{ lastContact: { lt: limite } }, { lastContact: null, updatedAt: { lt: limite } }] });
    }
    if (p.de) and.push({ [args.campo_data === "atualizacao" ? "updatedAt" : "createdAt"]: periodoPrisma(p) });

    let corretorNome: string | null = null;
    if (ctx.role === "CORRETOR") {
      and.push({ corretorId: ctx.userId });
    } else if (args.corretor) {
      const r = await resolverUsuario(args.corretor);
      if (!r.usuario) return r;
      corretorNome = r.usuario.name;
      and.push({ corretorId: r.usuario.id });
    }

    const leads = await prisma.lead.findMany({
      where: and.length ? { AND: and } : {},
      select: {
        status: true, archivedCategory: true, temperature: true, source: true,
        utmCampaign: true, utmSource: true, ticket: true, profile: true,
        condominiumsOfInterest: true, searchTypologies: true, createdAt: true,
        corretor: { select: { name: true } },
      },
    });

    // Condomínio filtra em memória: o campo é uma lista de textos livres, e
    // "Sua Cidade 9" precisa casar com "Sua Cidade 09".
    const alvoCondo = args.condominio ? normalizarNome(String(args.condominio)) : null;
    const filtrados = alvoCondo
      ? leads.filter((l) => (l.condominiumsOfInterest || []).some((c) => normalizarNome(String(c)).includes(alvoCondo)))
      : leads;

    const resposta: Record<string, unknown> = {
      total: filtrados.length,
      periodo: p.rotulo,
      filtros: { ...args, corretor: corretorNome ?? args.corretor, agrupar_por: undefined },
    };
    if (agrupar === "nenhum") return resposta;

    const etapaDoLead = agrupar === "etapa" ? await carregarRotulosDeEtapa() : null;
    const grupos = new Map<string, { rotulo: string; n: number }>();
    const somar = (chave: string, rotulo = chave) => {
      const g = grupos.get(chave) || { rotulo, n: 0 };
      g.n++;
      grupos.set(chave, g);
    };
    const fmtMes = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", month: "2-digit", year: "numeric" });

    for (const l of filtrados) {
      switch (agrupar) {
        case "temperatura": somar(l.temperature); break;
        case "area": somar(ROTULO_AREA[areaDoLead(l)]); break;
        case "etapa": {
          const area = ROTULO_AREA[areaDoLead(l)];
          somar(`${area} › ${etapaDoLead!(l)}`);
          break;
        }
        case "origem": somar(l.source, rotuloOrigem(l.source)); break;
        case "campanha": somar(l.utmCampaign || "(sem campanha)"); break;
        case "utm_source": somar(l.utmSource || "(direto / sem UTM)"); break;
        case "corretor": somar(l.corretor?.name || "Sem corretor"); break;
        case "finalidade": somar(l.ticket, leadTicketLabels[l.ticket as keyof typeof leadTicketLabels] || l.ticket); break;
        case "perfil": somar(l.profile || "Não informado"); break;
        case "mes": somar(fmtMes.format(l.createdAt)); break;
        case "dia": somar(dataBR(l.createdAt)!); break;
        case "condominio_interesse":
          for (const c of l.condominiumsOfInterest || []) {
            const nome = String(c).trim();
            if (nome) somar(normalizarNome(nome), nome);
          }
          break;
        case "tipologia":
          for (const t of l.searchTypologies || []) if (t) somar(normalizarNome(t), t);
          break;
      }
    }

    let lista = [...grupos.values()].map((g) => ({ grupo: g.rotulo, quantidade: g.n }));
    lista.sort((a, b) => (agrupar === "mes" || agrupar === "dia" ? 0 : b.quantidade - a.quantidade));
    if (agrupar === "mes" || agrupar === "dia") {
      // Ordem cronológica, que é o que se espera de uma série
      const chave = (s: string) => s.split("/").reverse().join("");
      lista.sort((a, b) => chave(a.grupo).localeCompare(chave(b.grupo)));
    }
    if (lista.length > 40) lista = lista.slice(0, 40);

    return {
      ...resposta,
      agrupado_por: agrupar,
      observacao: ["condominio_interesse", "tipologia"].includes(agrupar)
        ? "Um lead pode ter vários condomínios/tipologias; a soma dos grupos pode passar do total."
        : undefined,
      grupos: lista,
    };
  },

  // -------- DOSSIÊ DO IMÓVEL --------
  async dossie_imovel(args, ctx) {
    const q = String(args.busca || "").trim();
    if (!q) return { error: "Informe o código ou nome do imóvel." };

    const candidatos = await prisma.property.findMany({
      where: { OR: [{ code: { equals: q, mode: "insensitive" } }, { code: ci(q) }, { title: ci(q) }, { slug: ci(q) }] },
      select: { id: true, code: true, title: true },
      take: 6,
    });
    const exato = candidatos.find((c) => c.code.toLowerCase() === q.toLowerCase());
    if (!exato && candidatos.length > 1) {
      return { erro: `Mais de um imóvel corresponde a "${q}". Pergunte qual.`, candidatos };
    }
    const alvo = exato || candidatos[0];
    if (!alvo) return { error: `Imóvel "${q}" não encontrado.` };

    const d7 = new Date(Date.now() - 7 * 86_400_000);
    const d30 = new Date(Date.now() - 30 * 86_400_000);
    const [p, acessos7, acessos30, leadsOrigem, vinculos, visitas, propostas, precos] = await Promise.all([
      prisma.property.findUnique({
        where: { id: alvo.id },
        select: {
          id: true, code: true, title: true, slug: true, status: true, category: true, type: true,
          price: true, rentPrice: true, condoFee: true, iptu: true, area: true, usefulArea: true, totalArea: true,
          bedrooms: true, suites: true, bathrooms: true, parkingSpaces: true, neighborhood: true, city: true,
          views: true, clicks: true, favorites: true, shares: true, activePortals: true,
          isExclusive: true, isFeatured: true, isOffMarket: true, soldAt: true, soldBy: true,
          publishedAt: true, createdAt: true, updatedAt: true,
          condominium: { select: { name: true } },
          owner: { select: { name: true, phone: true } },
        },
      }),
      prisma.propertyViewLog.count({ where: { propertyId: alvo.id, createdAt: { gte: d7 } } }),
      prisma.propertyViewLog.count({ where: { propertyId: alvo.id, createdAt: { gte: d30 } } }),
      prisma.lead.findMany({
        where: { propertyId: alvo.id, ...(ctx.role === "CORRETOR" ? { corretorId: ctx.userId } : {}) },
        select: { name: true, status: true, temperature: true, source: true, createdAt: true, corretor: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.leadProperty.groupBy({ by: ["type"], where: { propertyId: alvo.id }, _count: { _all: true } }),
      prisma.scheduledVisitProperty.findMany({
        where: { propertyId: alvo.id },
        select: { liked: true, visit: { select: { date: true, status: true, visitorName: true, lead: { select: { name: true } }, corretor: { select: { name: true } } } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.propertyProposal.findMany({
        where: { propertyId: alvo.id },
        select: { clientName: true, proposedValue: true, status: true, createdAt: true, corretor: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.propertyPriceHistory.findMany({
        where: { propertyId: alvo.id },
        select: { oldPrice: true, newPrice: true, changePercent: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);
    if (!p) return { error: "Imóvel não encontrado." };

    const verNomes = ctx.role === "ADMIN" || ctx.role === "CORRETOR";
    const dias = Math.floor((Date.now() - (p.publishedAt || p.createdAt).getTime()) / 86_400_000);

    return {
      imovel: {
        codigo: p.code, titulo: p.title, status: p.status, categoria: p.category, tipo: p.type,
        preco: p.price, aluguel: p.rentPrice, condominio_taxa: p.condoFee, iptu: p.iptu,
        area_util: p.usefulArea ?? p.area, area_total: p.totalArea,
        dormitorios: p.bedrooms, suites: p.suites, banheiros: p.bathrooms, vagas: p.parkingSpaces,
        condominio: p.condominium?.name, bairro: p.neighborhood, cidade: p.city,
        corretor_responsavel: p.owner?.name,
        exclusivo: p.isExclusive, destaque: p.isFeatured, off_market: p.isOffMarket,
        vendido_em: dataBR(p.soldAt), vendido_por: p.soldBy,
        dias_no_ar: dias,
        link_site: `${SITE}/imovel/${p.slug || p.code}`,
        link_admin: `${SITE}/admin/imoveis/${p.id}`,
      },
      desempenho: {
        acessos_total: p.views, acessos_7_dias: acessos7, acessos_30_dias: acessos30,
        cliques_total: p.clicks, favoritos: p.favorites, compartilhamentos: p.shares,
        leads_gerados_na_pagina: leadsOrigem.length,
        vinculos_no_crm: Object.fromEntries(vinculos.map((v) => [v.type, v._count._all])),
        visitas: visitas.filter((v) => v.visit.status !== "CANCELADA").length,
        propostas: propostas.length,
      },
      portais_ativos: p.activePortals,
      ultimos_leads: leadsOrigem.slice(0, 5).map((l) => ({
        nome: verNomes ? l.name : undefined, status: l.status, temperatura: l.temperature,
        origem: rotuloOrigem(l.source), corretor: l.corretor?.name, data: dataBR(l.createdAt),
      })),
      ultimas_visitas: visitas.slice(0, 5).map((v) => ({
        data: dataBR(v.visit.date), status: v.visit.status, gostou: v.liked,
        cliente: verNomes ? v.visit.lead?.name || v.visit.visitorName : undefined, corretor: v.visit.corretor?.name,
      })),
      propostas: ctx.role === "FOTOGRAFO" ? undefined : propostas.slice(0, 8).map((x) => ({
        cliente: x.clientName, valor: x.proposedValue, status: x.status, corretor: x.corretor?.name, data: dataBR(x.createdAt),
      })),
      historico_preco: precos.map((h) => ({ de: h.oldPrice, para: h.newPrice, variacao_pct: h.changePercent, data: dataBR(h.createdAt) })),
    };
  },

  // -------- DOSSIÊ DO LEAD --------
  async dossie_lead(args, ctx) {
    const negado = semFotografo(ctx);
    if (negado) return negado;
    const q = String(args.busca || "").trim();
    if (!q) return { error: "Informe nome, telefone ou e-mail." };
    const digitos = q.replace(/\D/g, "");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      OR: [
        { id: q }, { name: ci(q) }, { email: ci(q) },
        ...(digitos.length >= 8 ? [{ phone: { contains: digitos.slice(-8) } }] : []),
      ],
    };
    if (ctx.role === "CORRETOR") where.corretorId = ctx.userId;

    const achados = await prisma.lead.findMany({
      where, take: 6, orderBy: { updatedAt: "desc" },
      select: { id: true, name: true, phone: true, status: true, corretor: { select: { name: true } } },
    });
    if (achados.length === 0) return { error: `Nenhum cliente encontrado para "${q}".` };
    const exato = achados.find((a) => normalizarNome(a.name) === normalizarNome(q)) || (achados.length === 1 ? achados[0] : null);
    if (!exato) {
      return {
        erro: `Mais de um cliente corresponde a "${q}". Pergunte qual.`,
        candidatos: achados.map((a) => ({ nome: a.name, telefone: a.phone, status: a.status, corretor: a.corretor?.name })),
      };
    }

    const [l, etapaDoLead, visitas, propostas, notas] = await Promise.all([
      prisma.lead.findUnique({
        where: { id: exato.id },
        select: {
          id: true, name: true, phone: true, email: true, status: true, archivedCategory: true, archivedReason: true,
          temperature: true, score: true, source: true, ticket: true, profile: true,
          budget: true, minBudget: true, maxBudget: true, condominiumsOfInterest: true, searchTypologies: true,
          searchBedrooms: true, hasFinancing: true, hasPermuta: true, isAlsoSeller: true,
          utmSource: true, utmMedium: true, utmCampaign: true, landingPage: true,
          lastContact: true, nextFollowUp: true, createdAt: true, updatedAt: true, message: true,
          corretor: { select: { name: true } },
          property: { select: { code: true, title: true } },
          linkedProperties: { select: { type: true, interested: true, property: { select: { code: true, title: true } } }, take: 15, orderBy: { createdAt: "desc" } },
        },
      }),
      carregarRotulosDeEtapa(),
      prisma.scheduledVisit.findMany({
        where: { leadId: exato.id },
        select: { date: true, status: true, feedback: true, properties: { select: { property: { select: { code: true } } } } },
        orderBy: { date: "desc" }, take: 8,
      }),
      prisma.propertyProposal.findMany({
        where: { leadId: exato.id },
        select: { proposedValue: true, status: true, createdAt: true, property: { select: { code: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.leadNote.findMany({ where: { leadId: exato.id }, select: { content: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 5 }),
    ]);
    if (!l) return { error: "Cliente não encontrado." };

    const area = areaDoLead(l);
    return {
      cliente: {
        nome: l.name, telefone: l.phone, email: l.email,
        area: ROTULO_AREA[area], etapa: etapaDoLead(l), motivo_arquivamento: l.archivedReason,
        temperatura: l.temperature, score: l.score,
        corretor: l.corretor?.name || "Sem corretor",
        origem: rotuloOrigem(l.source),
        campanha: l.utmCampaign || l.utmSource ? `${l.utmSource || "?"} / ${l.utmMedium || "?"} / ${l.utmCampaign || "-"}` : null,
        finalidade: l.ticket, perfil: l.profile,
        orcamento: l.budget ?? (l.minBudget || l.maxBudget ? `${l.minBudget ?? "?"} a ${l.maxBudget ?? "?"}` : null),
        condominios_de_interesse: l.condominiumsOfInterest, tipologias: l.searchTypologies, dormitorios: l.searchBedrooms,
        financiamento: l.hasFinancing, permuta: l.hasPermuta, tambem_vendedor: l.isAlsoSeller,
        imovel_de_origem: l.property ? `${l.property.code} — ${l.property.title}` : null,
        entrou_em: dataBR(l.createdAt), ultimo_contato: dataBR(l.lastContact), proximo_followup: dataBR(l.nextFollowUp),
        mensagem_inicial: l.message?.slice(0, 300),
        link_crm: `${SITE}/admin/clientes/leads?lead=${l.id}`,
      },
      imoveis_vinculados: l.linkedProperties.map((v) => ({ codigo: v.property.code, titulo: v.property.title, tipo: v.type, interessado: v.interested })),
      visitas: visitas.map((v) => ({ data: dataBR(v.date), status: v.status, imoveis: v.properties.map((x) => x.property.code), feedback: v.feedback })),
      propostas: propostas.map((x) => ({ imovel: x.property?.code, valor: x.proposedValue, status: x.status, data: dataBR(x.createdAt) })),
      ultimas_anotacoes: notas.map((n) => ({ data: dataBR(n.createdAt), texto: n.content.slice(0, 280) })),
    };
  },

  // -------- DOSSIÊ DO CORRETOR --------
  async dossie_corretor(args, ctx) {
    const negado = semFotografo(ctx);
    if (negado) return negado;
    let usuario: { id: string; name: string } | null = null;
    if (ctx.role === "CORRETOR") {
      usuario = await prisma.user.findUnique({ where: { id: ctx.userId }, select: { id: true, name: true } });
    } else {
      if (!args.busca) return { error: "Informe o nome do corretor." };
      const r = await resolverUsuario(args.busca);
      if (!r.usuario) return r;
      usuario = r.usuario;
    }
    if (!usuario) return { error: "Corretor não encontrado." };

    const p = lerPeriodo(args.periodo_dias || args.de ? args : { periodo_dias: 30 });
    const [metricas, total, porArea, porTemp, topImoveis, agenda] = await Promise.all([
      metricasCorretores(p, usuario.id),
      metricasCorretores({ de: null, ate: new Date(), rotulo: "todo o histórico" }, usuario.id),
      Promise.all((["kanban", "acervo", "limbo"] as Area[]).map((a) =>
        prisma.lead.count({ where: { AND: [CONDICAO_POR_AREA[a], { corretorId: usuario!.id }] } }))),
      prisma.lead.groupBy({
        by: ["temperature"],
        where: { corretorId: usuario.id, status: { notIn: ["ARQUIVADO", "PERDIDO"] } },
        _count: { _all: true },
      }),
      ANALYTICS_HANDLERS.ranking_imoveis({ metrica: "acessos", corretor: usuario.id, limite: 5, ...(p.de ? { periodo_dias: Math.round((p.ate.getTime() - p.de.getTime()) / 86_400_000) } : {}) }, { ...ctx, role: "ADMIN" }),
      prisma.scheduledVisit.findMany({
        where: { corretorId: usuario.id, date: { gte: new Date() }, status: { in: ["AGENDADA", "CONFIRMADA"] } },
        select: { date: true, time: true, status: true, visitorName: true, lead: { select: { name: true } }, properties: { select: { property: { select: { code: true } } } } },
        orderBy: { date: "asc" }, take: 5,
      }),
    ]);

    const limpar = (m?: Record<string, unknown>) => m && { ...m, id: undefined, nome: undefined, perfil: undefined, ativo: undefined };
    return {
      corretor: usuario.name,
      periodo: p.rotulo,
      no_periodo: limpar(metricas[0]),
      historico_total: limpar(total[0]),
      carteira_atual: {
        kanban: porArea[0], acervo: porArea[1], limbo: porArea[2],
        temperatura_do_funil_ativo: Object.fromEntries(porTemp.map((t) => [t.temperature, t._count._all])),
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      imoveis_mais_acessados: (topImoveis as any).itens?.map((i: any) => ({
        codigo: i.codigo, titulo: i.titulo, acessos: i.acessos_no_periodo ?? i.acessos_total, leads: i.leads, status: i.status,
      })),
      proximas_visitas: agenda.map((v) => ({
        data: dataBR(v.date), hora: v.time, status: v.status,
        cliente: v.lead?.name || v.visitorName, imoveis: v.properties.map((x) => x.property.code),
      })),
    };
  },

  // -------- PROPOSTAS --------
  async query_propostas(args, ctx) {
    const negado = semFotografo(ctx);
    if (negado) return negado;
    const p = lerPeriodo(args);
    const limite = clampLimit(args.limite, 10, 25);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (p.de) where.createdAt = periodoPrisma(p);
    if (args.imovel) where.property = { code: { equals: String(args.imovel), mode: "insensitive" } };
    if (ctx.role === "CORRETOR") where.corretorId = ctx.userId;
    else if (args.corretor) {
      const r = await resolverUsuario(args.corretor);
      if (!r.usuario) return r;
      where.corretorId = r.usuario.id;
    }

    const [porStatus, itens] = await Promise.all([
      prisma.propertyProposal.groupBy({ by: ["status"], where, _count: { _all: true }, _sum: { proposedValue: true } }),
      prisma.propertyProposal.findMany({
        where: args.status ? { ...where, status: args.status } : where,
        take: limite,
        orderBy: args.ordenar === "maior_valor" ? { proposedValue: "desc" } : { createdAt: "desc" },
        select: {
          clientName: true, proposedValue: true, originalValue: true, status: true, createdAt: true,
          corretor: { select: { name: true } }, property: { select: { code: true, title: true } },
        },
      }),
    ]);

    return {
      periodo: p.rotulo,
      por_status: porStatus.map((s) => ({ status: s.status, quantidade: s._count._all, valor_somado: s._sum.proposedValue })),
      total: porStatus.reduce((a, s) => a + s._count._all, 0),
      itens: itens.map((x) => ({
        cliente: x.clientName, imovel: x.property ? `${x.property.code} — ${x.property.title}` : null,
        valor_proposto: x.proposedValue, valor_pedido: x.originalValue, status: x.status,
        corretor: x.corretor?.name, data: dataBR(x.createdAt),
      })),
    };
  },

  // -------- NEGÓCIOS --------
  async query_negocios(args, ctx) {
    const negado = semFotografo(ctx);
    if (negado) return negado;
    const limite = clampLimit(args.limite, 10, 25);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = args.incluir_arquivados ? {} : { arquivado: false };
    if (args.fase) where.fase = String(args.fase).toUpperCase();
    if (args.busca) where.OR = [{ codigo: ci(args.busca) }, { imovelCondominio: ci(args.busca) }];
    if (ctx.role === "CORRETOR") where.corretorId = ctx.userId;

    const [porFase, itens] = await Promise.all([
      prisma.negocio.groupBy({ by: ["fase"], where, _count: { _all: true }, _sum: { valorTotal: true } }),
      prisma.negocio.findMany({
        where, take: limite, orderBy: { updatedAt: "desc" },
        select: {
          codigo: true, fase: true, tipoNegocio: true, valorTotal: true, comissaoValor: true,
          imovelCondominio: true, imovelEndereco: true, corretorId: true, createdAt: true, updatedAt: true,
          corretores: { select: { nome: true, percentual: true } },
        },
      }),
    ]);

    const ids = [...new Set(itens.map((n) => n.corretorId).filter(Boolean))] as string[];
    const nomes = new Map(
      (await prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } })).map((u) => [u.id, u.name])
    );

    return {
      por_fase: porFase.map((f) => ({ fase: f.fase, quantidade: f._count._all, valor_somado: f._sum.valorTotal })),
      itens: itens.map((n) => ({
        codigo: n.codigo, fase: n.fase, tipo: n.tipoNegocio, valor: n.valorTotal, comissao: n.comissaoValor,
        imovel: n.imovelCondominio || n.imovelEndereco,
        corretor: n.corretorId ? nomes.get(n.corretorId) : null,
        corretores_envolvidos: n.corretores.map((c) => `${c.nome} (${c.percentual}%)`),
        criado_em: dataBR(n.createdAt), atualizado_em: dataBR(n.updatedAt),
      })),
    };
  },

  // -------- PORTAIS --------
  async resumo_portais(args, ctx) {
    const negado = semFotografo(ctx);
    if (negado) return negado;
    const p = lerPeriodo(args.periodo_dias || args.de ? args : { periodo_dias: 30 });
    const ORIGENS_PORTAL = ["ZAP_IMOVEIS", "VIVA_REAL", "IMOVELWEB", "OLX", "CHAVES_NA_MAO", "MERCADO_LIVRE", "ATTRIA", "PORTAIS"];

    const [anunciados, leads] = await Promise.all([
      prisma.$queryRaw<{ portal: string; imoveis: bigint }[]>`
        SELECT unnest("activePortals") AS portal, COUNT(*) AS imoveis
        FROM properties WHERE status::text = 'DISPONIVEL'
        GROUP BY 1 ORDER BY 2 DESC`,
      prisma.lead.groupBy({
        by: ["source"],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        where: { source: { in: ORIGENS_PORTAL as any }, createdAt: periodoPrisma(p), ...(ctx.role === "CORRETOR" ? { corretorId: ctx.userId } : {}) },
        _count: { _all: true },
      }),
    ]);

    return {
      periodo_dos_leads: p.rotulo,
      imoveis_disponiveis_anunciados_por_portal: anunciados.map((a) => ({ portal: a.portal, imoveis: num(a.imoveis) })),
      leads_por_portal: leads
        .map((l) => ({ portal: rotuloOrigem(l.source), leads: l._count._all }))
        .sort((a, b) => b.leads - a.leads),
    };
  },
};
