// Lead Types
export type LeadTicket = "COMPRA" | "LOCACAO" | "AMBOS" | "INVESTIMENTO" | "PERMUTA" | "LANCAMENTO" | "OUTRO";
export type LeadTemperature = "QUENTE" | "MORNO" | "FRIO";
export type LeadProfile = "COMPRADOR" | "INVESTIDOR" | "CONSTRUTOR" | "OUTRO";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string | null;
  status: LeadStatus;
  source: LeadSource;
  score: number; // 0-100 AI score
  probability: number; // 0-100%
  
  // Ticket / Finalidade
  ticket: LeadTicket;
  temperature: LeadTemperature;
  profile: LeadProfile; // Perfil: Comprador, Investidor, Construtor
  
  // Permuta
  hasPermuta: boolean;
  permutaValue: number | null;
  permutaLocation: string | null;
  permutaDescription: string | null;
  permutaPropertyCode: string | null;
  permutaType: string | null;
  permutaCity: string | null;
  permutaNeighborhood: string | null;
  permutaBedrooms: number | null;
  permutaArea: number | null;
  
  // Condições por finalidade
  directInstallment: boolean;
  rentalGuarantees: string[];
  
  // Perfil de busca
  searchTypologies: string[];
  searchSubtype: string | null;
  searchSubtypes?: string[];
  searchBedrooms: string | null;
  searchFurnished: boolean | null;
  
  // Condomínios/Empreendimentos de interesse
  condominiumsOfInterest: string[]; // Lista de nomes de condomínios
  
  // Budget
  budget: number | null;
  minBudget: number | null;
  maxBudget: number | null;
  hasFinancing: boolean;
  financingApproved: boolean;
  approvedAmount: number | null;
  preferredPayment: string | null;
  
  // BANT Qualification
  bantBudget: number;
  bantAuthority: number;
  bantNeed: number;
  bantTimeline: number;
  
  // Tags and notes
  tags: string[];
  notes: LeadNote[];
  schedules: LeadSchedule[];
  contracts: LeadContract[];
  
  // AI Analysis
  aiAnalysis: AIAnalysis | null;
  
  // Property interest
  propertyId: string | null;
  property: {
    id: string;
    code: string;
    title: string;
    price: number;
    thumbnail: string | null;
    address?: string;
    neighborhood?: string;
    city?: string;
  } | null;
  
  // Corretor
  corretorId: string | null;
  corretor: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    avatar: string | null;
  } | null;
  
  // Counts
  _count?: {
    notes: number;
    schedules: number;
    contracts: number;
  };
  
  // Segundo contato (família/acompanhante)
  contact2Name?: string | null;
  contact2Phone?: string | null;
  contact2Role?: string | null;

  // Fase de visitação
  visitStage?: string | null; // "nenhuma" | "agendada" | "em_visita" | "visitou" | "relutante"

  // Dates
  createdAt: string;
  updatedAt: string;
  lastContact: string | null;
  nextFollowUp: string | null;
  
  // Arquivamento (Limbo)
  archivedAt: string | null;
  archivedReason: string | null;
  archivedById: string | null;
  previousStatus: LeadStatus | null;
}

export interface LeadNote {
  id: string;
  content: string;
  createdAt: string;
  authorId: string | null;
}

export interface LeadSchedule {
  id: string;
  type: "LIGACAO" | "REUNIAO" | "VISITA" | "FOLLOWUP";
  date: string;
  time: string;
  notes: string | null;
  completed: boolean;
  cancelled: boolean;
}

export interface LeadContract {
  id: string;
  type: string;
  name: string;
  status: "rascunho" | "enviado" | "assinado" | "cancelado";
  documentUrl: string | null;
  createdAt: string;
  signedAt: string | null;
}

export interface AIAnalysis {
  score: number;
  probability: number;
  insights: string[];
  recommendations: string[];
  strengths: string[];
  risks: string[];
  nextSteps: string[];
  lastAnalysis: string;
}

export type LeadSource = 
  | "SITE"
  | "WHATSAPP"
  | "INDICACAO"
  | "PORTAIS"
  | "REDES_SOCIAIS"
  | "TELEFONE"
  | "PRESENCIAL"
  | "EMAIL"
  | "INSTAGRAM"
  | "FACEBOOK"
  | "TIKTOK"
  | "YOUTUBE"
  | "GOOGLE_ADS"
  | "META_ADS"
  | "OLX"
  | "ZAP_IMOVEIS"
  | "VIVA_REAL"
  | "IMOVELWEB"
  | "CHAVES_NA_MAO"
  | "PLACA"
  | "PLANTAO"
  | "EVENTO"
  | "AVALIACAO"
  | "CAPTACAO"
  | "OUTROS";

export type LeadStatus = 
  | "NOVO"
  | "CONTATADO"
  | "QUALIFICADO"
  | "NEGOCIANDO"
  | "FECHADO"
  | "PERDIDO"
  | "ARQUIVADO"
  | "TRIAGEM"
  | "VISITA_FRIA"
  | "VISITA_MORNA"
  | "VISITA_QUENTE"
  | "PROPOSTA"
  | "SEM_INTERACAO"
  | "RETORNO"
  | "EM_ESPERA";

export interface KanbanColumn {
  id: string;
  title: string;
  status: LeadStatus;
  color: string;
  icon: string;
  order: number;
  automationEnabled: boolean;
  automationRules: AutomationRule[];
  funnelStage?: string | null;
  leads: Lead[];
}

export const FUNNEL_STAGES = [
  { key: "TRIAGEM", name: "Triagem de Demanda" },
  { key: "QUALIFICACAO", name: "Qualificação" },
  { key: "DESENVOLVIMENTO", name: "Desenvolvimento" },
  { key: "NEGOCIACAO", name: "Em negociação" },
  { key: "EFETIVADOS", name: "Efetivados" },
] as const;

export type FunnelStageKey = typeof FUNNEL_STAGES[number]["key"];

export interface AutomationRule {
  id: string;
  trigger: "days_without_contact" | "score_above" | "score_below" | "property_viewed" | "ai_detected";
  value: number | string;
  action: "move_to" | "notify" | "tag" | "assign";
  targetColumn?: LeadStatus;
  targetValue?: string;
}

export const leadStatusLabels: Record<LeadStatus, string> = {
  NOVO: "Novo",
  CONTATADO: "Contatado",
  QUALIFICADO: "Qualificado",
  NEGOCIANDO: "Negociando",
  FECHADO: "Fechado",
  PERDIDO: "Perdido",
  ARQUIVADO: "Arquivo",
  TRIAGEM: "Triagem",
  VISITA_FRIA: "Visita Fria",
  VISITA_MORNA: "Visita Morna",
  VISITA_QUENTE: "Visita Quente",
  PROPOSTA: "Proposta",
  SEM_INTERACAO: "Sem Interação",
  RETORNO: "Retorno",
  EM_ESPERA: "Em Espera",
};

export const leadStatusColors: Record<LeadStatus, string> = {
  NOVO: "#3b82f6", // blue
  CONTATADO: "#8b5cf6", // purple
  QUALIFICADO: "#f59e0b", // amber
  NEGOCIANDO: "#10b981", // emerald
  FECHADO: "#22c55e", // green
  PERDIDO: "#ef4444", // red
  ARQUIVADO: "#6b7280", // gray
  TRIAGEM: "#06b6d4", // cyan
  VISITA_FRIA: "#64748b", // slate
  VISITA_MORNA: "#25D366", // orange
  VISITA_QUENTE: "#dc2626", // red-600
  PROPOSTA: "#a855f7", // purple-500
  SEM_INTERACAO: "#78716c", // stone
  RETORNO: "#0ea5e9", // sky
  EM_ESPERA: "#eab308", // yellow
};

export const leadSourceLabels: Record<string, string> = {
  // Portais Imobiliários
  IMOVELWEB: "Imóvel Web",
  ZAP_IMOVEIS: "ZAP Imóveis",
  OLX: "OLX",
  CHAVES_NA_MAO: "Chaves na Mão",
  MERCADO_LIVRE: "Mercado Livre",
  VIVA_REAL: "Viva Real",
  ATTRIA: "Attria",
  PORTAIS: "Portais (outros)",
  // Redes Sociais / Digital
  INSTAGRAM_TAPPY_ORGANICO: "Instagram Tappy (Orgânico)",
  INSTAGRAM_TAPPY_ADS: "Instagram Tappy (Ads)",
  INSTAGRAM_PESSOAL_ORGANICO: "Instagram Pessoal (Orgânico)",
  INSTAGRAM_PESSOAL_ADS: "Instagram Pessoal (Ads)",
  FACEBOOK_GROUPS: "Facebook Groups",
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  TIKTOK: "TikTok",
  YOUTUBE: "YouTube",
  REDES_SOCIAIS: "Redes Sociais (outros)",
  // Mídia Paga
  GOOGLE_ADS: "Google Ads",
  GOOGLE: "Google",
  META_ADS: "Meta Ads",
  // Canais Diretos
  SITE: "Site",
  WHATSAPP: "WhatsApp",
  EMAIL: "E-mail",
  TELEFONE: "Telefone",
  PRESENCIAL: "Presencial",
  INDICACAO: "Indicação",
  PARCERIA_CORRETOR: "Parceria Corretor",
  // Offline
  PLACA: "Placa",
  OPEN_HOUSE: "Open House",
  PLANTAO: "Plantão",
  EVENTO: "Evento",
  // Avaliação / Captação
  AVALIACAO: "Avaliação de Imóvel",
  CAPTACAO: "Captação de Imóvel",
  // Carteira
  CLIENTE_CARTEIRA: "Cliente Carteira",
  OUTROS: "Outros",
};

// Cores por categoria de origem (para diferenciar cards no Kanban)
export const leadSourceCategoryColors: Record<string, { color: string; label: string }> = {
  SITE: { color: "#25D366", label: "Site" }, // orange
  PORTAL: { color: "#8b5cf6", label: "Portal" }, // purple
  SOCIAL: { color: "#ec4899", label: "Social" }, // pink
  ADS: { color: "#06b6d4", label: "Ads" }, // cyan
  DIRETO: { color: "#10b981", label: "Direto" }, // emerald
  OFFLINE: { color: "#78716c", label: "Offline" }, // stone
  AVALIACAO: { color: "#3b82f6", label: "Avaliação" }, // blue
};

// Mapear cada source para sua categoria
export const getSourceCategory = (source?: string | null): string => {
  if (!source) return "DIRETO";
  const portalSources = ["IMOVELWEB", "ZAP_IMOVEIS", "OLX", "CHAVES_NA_MAO", "MERCADO_LIVRE", "VIVA_REAL", "ATTRIA", "PORTAIS"];
  const socialSources = ["INSTAGRAM", "INSTAGRAM_TAPPY_ORGANICO", "INSTAGRAM_PESSOAL_ORGANICO", "FACEBOOK", "FACEBOOK_GROUPS", "TIKTOK", "YOUTUBE", "REDES_SOCIAIS"];
  const adsSources = ["GOOGLE_ADS", "GOOGLE", "META_ADS", "INSTAGRAM_TAPPY_ADS", "INSTAGRAM_PESSOAL_ADS"];
  const offlineSources = ["PLACA", "OPEN_HOUSE", "PLANTAO", "EVENTO", "PRESENCIAL"];
  if (source === "SITE") return "SITE";
  if (source === "AVALIACAO" || source === "CAPTACAO") return "AVALIACAO";
  if (portalSources.includes(source)) return "PORTAL";
  if (socialSources.includes(source)) return "SOCIAL";
  if (adsSources.includes(source)) return "ADS";
  if (offlineSources.includes(source)) return "OFFLINE";
  return "DIRETO";
};

export const tagColors: Record<string, string> = {
  urgente: "#ef4444",
  vip: "#f59e0b",
  investidor: "#8b5cf6",
  primeira_compra: "#3b82f6",
  financiamento: "#10b981",
  permuta: "#ec4899",
  retorno: "#06b6d4",
};

export const leadTicketLabels: Record<LeadTicket, string> = {
  COMPRA: "Compra",
  LOCACAO: "Locação",
  AMBOS: "Compra e Locação",
  INVESTIMENTO: "Investimento",
  PERMUTA: "Permuta",
  LANCAMENTO: "Lançamento",
  OUTRO: "Outro",
};

export const leadTicketColors: Record<LeadTicket, string> = {
  COMPRA: "#3b82f6",
  LOCACAO: "#8b5cf6",
  AMBOS: "#10b981",
  INVESTIMENTO: "#f59e0b",
  PERMUTA: "#ec4899",
  LANCAMENTO: "#06b6d4",
  OUTRO: "#6b7280",
};

export const leadTemperatureLabels: Record<LeadTemperature, string> = {
  QUENTE: "Quente",
  MORNO: "Morno",
  FRIO: "Frio",
};

export const leadTemperatureColors: Record<LeadTemperature, string> = {
  QUENTE: "#ef4444",
  MORNO: "#f59e0b",
  FRIO: "#3b82f6",
};

// Prazo de follow-up por temperatura (em dias)
export const followUpDaysByTemperature: Record<LeadTemperature, number> = {
  QUENTE: 2,
  MORNO: 5,
  FRIO: 15,
};

export const leadProfileLabels: Record<LeadProfile, string> = {
  COMPRADOR: "Comprador",
  INVESTIDOR: "Investidor",
  CONSTRUTOR: "Construtor",
  OUTRO: "Outro",
};

export const leadProfileColors: Record<LeadProfile, string> = {
  COMPRADOR: "#3b82f6",
  INVESTIDOR: "#8b5cf6",
  CONSTRUTOR: "#f59e0b",
  OUTRO: "#6b7280",
};
