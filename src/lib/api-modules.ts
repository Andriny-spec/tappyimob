// Mapa de módulos e regra de acesso por módulo — funções PURAS (sem Prisma,
// sem next/headers), seguras para o middleware (edge) e para qualquer handler.
//
// A regra espelha exatamente a Sidebar do admin:
//   - ADMIN sem allowedModules (lista vazia) = acesso total
//   - demais papéis = só os módulos listados em allowedModules
//   - tokens antigos (emitidos antes do allowedModules entrar no JWT) NÃO são
//     restringidos aqui — continuam funcionando como antes até o re-login.

export interface ModuleSession {
  role: string;
  allowedModules?: string[];
}

// Módulos transversais, que todo papel autenticado pode acessar (topbar,
// dashboard, assistente de IA). Não vazam dado de cliente.
export const ALWAYS_ALLOWED_MODULES = new Set<string>([
  "dashboard",
  "notifications",
  "tappy-ia",
]);

// Segmento da rota /api/admin/<segmento>/...  ->  moduleKey (mesmos do Sidebar)
export const API_MODULE_MAP: Record<string, string> = {
  // Clientes
  leads: "clientes",
  proposals: "clientes",
  sdr: "clientes",
  birthdays: "clientes",
  // Agendamentos
  agendamentos: "agendamentos",
  "scheduled-visits": "agendamentos",
  followups: "agendamentos",
  "photo-sessions": "agendamentos",
  fotografos: "agendamentos",
  // Imóveis
  properties: "imoveis",
  condominiums: "imoveis",
  "property-access": "imoveis",
  "property-logs": "imoveis",
  "property-owners": "imoveis",
  "owner-contact-log": "imoveis",
  "generate-slugs": "imoveis",
  "import-owners": "imoveis",
  rankings: "imoveis",
  "sync-tecimob": "imoveis",
  captacao: "captacao", // subitem com permissão própria
  // Usuários / equipe
  users: "usuarios",
  usuarios: "usuarios",
  corretores: "corretores",
  brokers: "corretores",
  vendedores: "vendedores",
  // Contratos / negócios
  contratos: "contratos",
  negocio: "contratos",
  // Financeiro
  financeiro: "financeiro",
  // Relatórios
  relatorios: "relatorios",
  reports: "relatorios",
  // Marketing
  marketing: "marketing",
  google: "marketing-google",
  // Site
  site: "site",
  popups: "site",
  newsletter: "site",
  maintenance: "site",
  // Storage
  storage: "storage",
  // Portais
  portals: "portais",
  // Parcerias / multi-sites
  parcerias: "parcerias",
  partners: "parcerias",
  "partner-exclusives": "parcerias",
  "partner-funnels": "parcerias",
  "business-partners": "parcerias",
  "real-estate-agencies": "parcerias",
  // Tappy
  "tappy-iq": "tappy-iq",
  "tappy-summit": "tappy-summit",
  "campanha-summit": "tappy-summit",
  mindmaps: "tappy-ia",
  // Tarefas
  tasks: "tarefas",
  "task-boards": "tarefas",
  // E-mails
  email: "emails",
  // WhatsApp
  waha: "leads-whats",
  // Configurações
  config: "configuracoes",
  watermark: "configuracoes",
};

// Mapa de segundo nível para segmentos que têm módulos próprios por sub-rota.
// Ex.: o módulo "marketing" virou sub-módulos (analytics, facebook, ...).
export const API_SUBMODULE_MAP: Record<string, Record<string, string>> = {
  marketing: {
    stats: "marketing-analytics",
    analytics: "marketing-analytics",
    "tracking-config": "marketing-configuracoes",
    configuracoes: "marketing-configuracoes",
    facebook: "marketing-facebook",
    instagram: "marketing-instagram",
    google: "marketing-google",
    insights: "marketing-insights",
  },
};

export function canAccessModule(
  session: ModuleSession | null | undefined,
  moduleKey: string
): boolean {
  if (!session) return false;
  if (ALWAYS_ALLOWED_MODULES.has(moduleKey)) return true;

  const mods = session.allowedModules;
  // Token antigo (antes do allowedModules entrar no JWT): não restringir.
  if (mods === undefined) return true;
  // ADMIN com lista vazia = acesso total (mesma regra da Sidebar).
  if (session.role === "ADMIN" && mods.length === 0) return true;

  return mods.includes(moduleKey);
}

/**
 * Retorna o moduleKey correspondente a um pathname de API, ou null se a rota
 * não for mapeada (ex.: /api/admin raiz, ou segmento desconhecido → permite).
 */
export function moduleForApiPath(pathname: string): string | null {
  const parts = pathname.split("/").filter(Boolean);
  // Esperado: ["api", "admin", <segmento>, ...]
  if (parts[0] !== "api" || parts[1] !== "admin") return null;
  const segment = parts[2];
  if (!segment) return null;

  // Segmentos com sub-módulos próprios (ex.: /api/admin/marketing/stats)
  const subMap = API_SUBMODULE_MAP[segment];
  if (subMap) {
    const subSeg = parts[3];
    if (subSeg && subMap[subSeg]) return subMap[subSeg];
  }

  return API_MODULE_MAP[segment] ?? null;
}
