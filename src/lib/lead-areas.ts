import { LeadStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { leadStatusLabels } from "@/types/lead";

// Kanban, Acervo e Limbo são a MESMA tabela `leads` — o que separa os três é o
// status e a categoria de arquivamento. Esta é a única definição da regra: a
// exportação de clientes e a Tappy IA leem daqui, para os números baterem
// com o que as telas mostram.

/** Categorias de arquivamento que jogam o lead no Limbo em vez do Acervo. */
export const CATEGORIAS_LIMBO = ["perdido", "nurturing", "reativar", "sem_perfil"];

/** Rótulos padrão das categorias — os mesmos das telas de Acervo e Limbo. */
const ROTULOS_LIMBO_PADRAO: Record<string, string> = {
  perdido: "Perdido",
  nurturing: "Nurturing",
  reativar: "Reativar",
  sem_perfil: "Sem perfil",
};
const ROTULOS_ACERVO_PADRAO: Record<string, string> = {
  efetivados: "Efetivados",
  investidores: "Investidores",
  sem_interacao: "Sem interação",
};

export type Area = "kanban" | "acervo" | "limbo";

/** Condição Prisma de cada área, para montar o `where` conforme a seleção. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CONDICAO_POR_AREA: Record<Area, any> = {
  kanban: { status: { notIn: ["ARQUIVADO", "PERDIDO"] as LeadStatus[] } },
  acervo: {
    status: "ARQUIVADO" as LeadStatus,
    OR: [{ archivedCategory: null }, { archivedCategory: { notIn: CATEGORIAS_LIMBO } }],
  },
  limbo: {
    OR: [
      { status: "PERDIDO" as LeadStatus },
      { status: "ARQUIVADO" as LeadStatus, archivedCategory: { in: CATEGORIAS_LIMBO } },
    ],
  },
};

export const ROTULO_AREA: Record<Area, string> = {
  kanban: "Kanban",
  acervo: "Acervo",
  limbo: "Limbo",
};

/** Em qual área um lead está, a partir do status e da categoria de arquivamento. */
export function areaDoLead(l: { status: string; archivedCategory: string | null }): Area {
  if (l.status !== "ARQUIVADO" && l.status !== "PERDIDO") return "kanban";
  if (l.status === "PERDIDO") return "limbo";
  return l.archivedCategory && CATEGORIAS_LIMBO.includes(l.archivedCategory) ? "limbo" : "acervo";
}

/**
 * Carrega os nomes que o admin deu às colunas do Kanban e às categorias do
 * Acervo/Limbo, e devolve uma função que diz a etapa de um lead com esses nomes
 * — "Visita Quente", "Relacionamento" — e não o código interno.
 */
export async function carregarRotulosDeEtapa() {
  const [colunas, configs] = await Promise.all([
    prisma.kanbanColumn.findMany({
      where: { scope: "ADMIN" },
      select: { title: true, status: true },
      orderBy: { order: "asc" },
    }),
    prisma.systemConfig.findMany({
      where: { key: { in: ["acervo_category_labels", "acervo_custom_categories", "limbo_category_labels"] } },
    }),
  ]);

  const tituloPorStatus = new Map<string, string>();
  for (const c of colunas) {
    if (!tituloPorStatus.has(c.status)) tituloPorStatus.set(c.status, c.title);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config = (key: string) => (configs.find((c) => c.key === key)?.value as any) || {};
  const rotulosAcervo: Record<string, string> = {
    ...ROTULOS_ACERVO_PADRAO,
    ...Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Object.entries(config("acervo_custom_categories")).map(([k, v]: [string, any]) => [k, v?.label || k])
    ),
    ...config("acervo_category_labels"),
  };
  const rotulosLimbo: Record<string, string> = {
    ...ROTULOS_LIMBO_PADRAO,
    ...config("limbo_category_labels"),
  };

  return function etapaDoLead(l: { status: string; archivedCategory: string | null }) {
    const area = areaDoLead(l);
    if (area === "kanban") {
      // Nem todo status tem coluna configurada (ex.: EM_ESPERA); nesse caso
      // vale o nome amigável do status em vez do enum cru.
      return (
        tituloPorStatus.get(l.status) ||
        leadStatusLabels[l.status as keyof typeof leadStatusLabels] ||
        l.status
      );
    }
    const rotulos = area === "limbo" ? rotulosLimbo : rotulosAcervo;
    return (l.archivedCategory && rotulos[l.archivedCategory]) || "Sem categoria";
  };
}
