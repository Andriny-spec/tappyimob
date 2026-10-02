import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Regras da gestão SaaS, compartilhadas pelas rotas de /api/admin/saas.

/** Domínio base dos sites dos assinantes (nome.DOMINIO). */
export const DOMINIO_SAAS = process.env.NEXT_PUBLIC_SAAS_DOMAIN || "tappyimob.com.br";

/** Subdomínios que pertencem à plataforma e não podem virar site de assinante. */
export const SLUGS_RESERVADOS = new Set([
  "www", "app", "api", "admin", "painel", "mail", "smtp", "imap", "webmail", "storage",
  "sites", "site", "status", "blog", "ajuda", "suporte", "docs", "login", "cdn", "static",
  "tappy", "tappyimob", "teste", "test", "dev", "staging",
]);

/** "Imobiliária São João Ltda" → "imobiliaria-sao-joao-ltda" */
export function gerarSlug(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/** Erro de validação do slug, ou null se ele serve. */
export function validarSlug(slug: string): string | null {
  if (!/^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/.test(slug)) {
    return "Use de 3 a 40 letras minúsculas, números e hífen (sem começar ou terminar com hífen).";
  }
  if (SLUGS_RESERVADOS.has(slug)) return `"${slug}" é reservado da plataforma.`;
  return null;
}

/** Valor cobrado por ciclo: no anual, 12 × o mensal equivalente do plano anual. */
export function valorDoCiclo(plano: { precoMensal: number; precoAnual: number }, ciclo: "MENSAL" | "ANUAL") {
  return ciclo === "ANUAL" ? Math.round(plano.precoAnual * 12 * 100) / 100 : plano.precoMensal;
}

/** Soma 1 mês ou 1 ano a uma data. */
export function proximoVencimento(base: Date, ciclo: "MENSAL" | "ANUAL") {
  const d = new Date(base);
  if (ciclo === "ANUAL") d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d;
}

/** "10/2026" no mensal, "2026/2027" no anual. */
export function referenciaDo(vencimento: Date, ciclo: "MENSAL" | "ANUAL") {
  if (ciclo === "ANUAL") return `Anual ${vencimento.getFullYear()}/${vencimento.getFullYear() + 1}`;
  return `${String(vencimento.getMonth() + 1).padStart(2, "0")}/${vencimento.getFullYear()}`;
}

/** Só administradores gerenciam o SaaS. Devolve a sessão ou a resposta de erro. */
export async function exigirAdmin() {
  const session = await getSession();
  if (!session) return { erro: NextResponse.json({ error: "Não autorizado" }, { status: 401 }) };
  if (session.role !== "ADMIN") {
    return { erro: NextResponse.json({ error: "Acesso restrito ao administrador" }, { status: 403 }) };
  }
  return { session };
}

export async function registrarEvento(assinanteId: string, tipo: string, descricao: string, autor?: string | null) {
  await prisma.saasEvento.create({ data: { assinanteId, tipo, descricao, autor: autor ?? null } });
}

/**
 * Marca como ATRASADO o que venceu sem pagamento e põe o assinante ativo
 * nessa situação como INADIMPLENTE. Chamado nas leituras do painel — barato
 * (dois updateMany) e dispensa um cron só para isso.
 */
export async function atualizarAtrasos() {
  const agora = new Date();
  await prisma.saasPagamento.updateMany({
    where: { status: "PENDENTE", vencimento: { lt: agora } },
    data: { status: "ATRASADO" },
  });
  await prisma.saasAssinante.updateMany({
    where: { status: "ATIVA", pagamentos: { some: { status: "ATRASADO" } } },
    data: { status: "INADIMPLENTE" },
  });
}

export const CONFIG_SAAS_KEY = "saas_config";

export type ConfigSaas = {
  dominioBase: string;
  trialPadraoDias: number;
  diasCarencia: number;
  suspenderSiteAposDias: number;
  gateway: "nenhum" | "asaas" | "pagarme" | "stripe";
  gatewayAmbiente: "sandbox" | "producao";
  emailCobranca: string;
  whatsappCobranca: string;
  lembreteDiasAntes: number;
  permitirDominioProprio: boolean;
  permitirTrialSemCartao: boolean;
};

export const CONFIG_SAAS_PADRAO: ConfigSaas = {
  dominioBase: DOMINIO_SAAS,
  trialPadraoDias: 14,
  diasCarencia: 5,
  suspenderSiteAposDias: 15,
  gateway: "nenhum",
  gatewayAmbiente: "sandbox",
  emailCobranca: "",
  whatsappCobranca: "",
  lembreteDiasAntes: 3,
  permitirDominioProprio: true,
  permitirTrialSemCartao: true,
};
