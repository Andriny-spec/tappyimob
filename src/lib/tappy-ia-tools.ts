/**
 * Tappy IA — Tools de leitura (Fase 1)
 * Read-only: lista/busca registros do banco com permissões básicas por role.
 */

import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

export interface ToolContext {
  userId: string;
  role: "ADMIN" | "CORRETOR" | "FOTOGRAFO" | "SDR" | "CLIENTE" | "PARCEIRO_EXTERNO";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ToolHandler = (args: any, ctx: ToolContext) => Promise<any>;

export const clampLimit = (n: unknown, def = 10, max = 25) => {
  const v = Number(n);
  if (!Number.isFinite(v) || v <= 0) return def;
  return Math.min(Math.floor(v), max);
};

export const ci = (q?: string) =>
  q && typeof q === "string" && q.trim()
    ? { contains: q.trim(), mode: "insensitive" as const }
    : undefined;

export const SUMMARY_USER = {
  id: true, name: true, email: true, role: true, avatar: true,
} as const;

// ===================================================================
// DEFINITIONS
// ===================================================================
export const TOOL_DEFINITIONS: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "query_properties",
      description: "Busca imóveis. Use para listas, filtros ou estatísticas de imóveis.",
      parameters: {
        type: "object",
        properties: {
          orderBy: { type: "string", enum: ["views_desc", "price_desc", "price_asc", "newest", "oldest"] },
          limit: { type: "number" },
          status: { type: "string", enum: ["DISPONIVEL", "VENDIDO", "ALUGADO", "RESERVADO", "SUSPENSO", "INDISPONIVEL", "INATIVO"] },
          category: { type: "string", enum: ["VENDA", "LOCACAO", "VENDA_LOCACAO", "TEMPORADA", "LEILAO"] },
          type: { type: "string", enum: ["APARTAMENTO", "CASA", "TERRENO", "COMERCIAL", "COBERTURA", "STUDIO", "FAZENDA", "GALPAO", "KITNET", "LOFT", "FLAT", "SOBRADO", "CHACARA"] },
          neighborhood: { type: "string" }, city: { type: "string" }, search: { type: "string" },
          minPrice: { type: "number" }, maxPrice: { type: "number" }, minBedrooms: { type: "number" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_condominiums",
      description: "Lista condomínios.",
      parameters: { type: "object", properties: { limit: { type: "number" }, search: { type: "string" }, city: { type: "string" }, neighborhood: { type: "string" } } },
    },
  },
  {
    type: "function",
    function: {
      name: "query_leads",
      description:
        "LISTA leads/clientes (nomes, telefones, status). Para CONTAR ou agrupar use contar_leads. Áreas: kanban=funil ativo; acervo=arquivados (efetivados, relacionamento…); limbo=perdidos/nurturing/reativar/sem perfil; sdr=triagem.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number" },
          status: { type: "string", enum: ["NOVO", "CONTATADO", "QUALIFICADO", "NEGOCIANDO", "FECHADO", "PERDIDO", "ARQUIVADO", "TRIAGEM", "VISITA_FRIA", "VISITA_MORNA", "VISITA_QUENTE", "PROPOSTA", "SEM_INTERACAO", "RETORNO", "EM_ESPERA"] },
          bucket: { type: "string", enum: ["kanban", "acervo", "limbo", "sdr"] },
          temperatura: { type: "string", enum: ["QUENTE", "MORNO", "FRIO"] },
          categoria_arquivo: { type: "string", description: "efetivados, relacionamento, sem_interacao, perdido, nurturing…" },
          origem: { type: "string", description: "Código da origem (SITE, WHATSAPP, INSTAGRAM, GOOGLE_ADS, ZAP_IMOVEIS…)." },
          search: { type: "string" },
          corretor: { type: "string", description: "Nome ou id do corretor." },
          minScore: { type: "number" },
          sem_followup_ha_dias: { type: "number", description: "Só leads sem contato há pelo menos N dias." },
          orderBy: { type: "string", enum: ["newest", "oldest", "score_desc", "updated_desc"] },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_users",
      description: "Lista usuários (corretores, vendedores, fotógrafos, SDR, admins).",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number" },
          role: { type: "string", enum: ["ADMIN", "CORRETOR", "FOTOGRAFO", "SDR", "CLIENTE", "PARCEIRO_EXTERNO"] },
          search: { type: "string" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_sellers",
      description: "Lista vendedores/proprietários (leads com isAlsoSeller=true).",
      parameters: { type: "object", properties: { limit: { type: "number" }, search: { type: "string" } } },
    },
  },
  {
    type: "function",
    function: {
      name: "query_contracts",
      description: "Lista contratos.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number" },
          status: { type: "string", enum: ["RASCUNHO", "ENVIADO", "ASSINADO", "CANCELADO"] },
          type: { type: "string", enum: ["PROPOSTA", "CONTRATO", "ADITIVO", "DISTRATO"] },
          category: { type: "string", enum: ["VENDA", "LOCACAO", "PERMUTA"] },
          search: { type: "string" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_visits",
      description: "Lista visitas agendadas a imóveis.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number" },
          status: { type: "string", enum: ["AGENDADA", "CONFIRMADA", "REALIZADA", "CANCELADA", "REAGENDADA", "NAO_COMPARECEU"] },
          corretorId: { type: "string" }, fromDate: { type: "string" }, toDate: { type: "string" }, upcoming: { type: "boolean" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_photo_sessions",
      description: "Lista sessões/agendamentos de produção de fotos.",
      parameters: {
        type: "object",
        properties: { limit: { type: "number" }, status: { type: "string" }, photographerId: { type: "string" }, upcoming: { type: "boolean" } },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_blog_posts",
      description: "Lista posts do blog.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number" },
          status: { type: "string", enum: ["RASCUNHO", "PUBLICADO", "AGENDADO", "ARQUIVADO"] },
          search: { type: "string" }, orderBy: { type: "string", enum: ["newest", "views_desc"] },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_tasks",
      description: "Lista cards de tarefas no Kanban.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number" }, priority: { type: "string" }, status: { type: "string" },
          assignee: { type: "string" }, overdue: { type: "boolean" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_partnerships",
      description: "Lista parceiros de negócio (corretores externos, imobiliárias, etc.).",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number" },
          type: { type: "string", enum: ["CORRETOR", "IMOBILIARIA", "CORRESPONDENTE_BANCARIO", "ARQUITETO", "CONSTRUTORA"] },
          search: { type: "string" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_storage_files",
      description: "Lista arquivos no Storage (não deletados).",
      parameters: {
        type: "object",
        properties: { limit: { type: "number" }, search: { type: "string" }, mimeContains: { type: "string" }, folderId: { type: "string" } },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_dashboard_stats",
      description: "Contagens agregadas (totais de imóveis, leads, contratos, visitas, etc.).",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "run_due_diligence",
      description: "Executa uma due diligence completa de CPF ou CNPJ. Consulta automaticamente TST, Receita Federal, TJSP, TRF3, TRT2, PGE-SP, MPF, MPSP, PF Criminal, Fazenda SP, SPC/Serasa e outras fontes. Use quando o usuário pedir 'due diligence', 'verificar CPF', 'análise jurídica de', 'certidões de', 'checar antecedentes de', 'score de risco' ou similar.",
      parameters: {
        type: "object",
        properties: {
          document: {
            type: "string",
            description: "CPF (11 dígitos) ou CNPJ (14 dígitos), só números.",
          },
          documentType: {
            type: "string",
            enum: ["cpf", "cnpj"],
            description: "Tipo do documento.",
          },
          matricula: {
            type: "string",
            description: "Número da matrícula do imóvel (opcional, ex: 45.892). Forneça quando a due diligence for de uma transação imobiliária específica.",
          },
        },
        required: ["document", "documentType"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_creci",
      description: "Busca o registro CRECI de um corretor de imóveis pelo nome ou número CRECI. Retorna situação cadastral, status (ativo/inativo/suspenso), dados de contato e especialidade. Use quando o usuário perguntar 'CRECI de', 'corretor está ativo', 'verificar registro', 'buscar corretor por nome' ou similar.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Nome do corretor ou número CRECI a buscar.",
          },
          searchType: {
            type: "string",
            enum: ["name", "creci_number"],
            description: "Busca por nome ou por número CRECI.",
          },
          state: {
            type: "string",
            description: "UF do CRECI (ex: 'sp', 'rj', 'mg'). Padrão 'sp' se não informado.",
          },
        },
        required: ["query", "searchType"],
      },
    },
  },
];
