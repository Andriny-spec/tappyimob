"use client";

import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RiCloseLine, RiLoader4Line } from "react-icons/ri";

// ------------------------------------------------------------------ tipos

export type Plano = {
  id: string;
  nome: string;
  slug: string;
  chamada: string | null;
  descricao: string | null;
  precoMensal: number;
  precoAnual: number;
  limiteUsuarios: number | null;
  limiteImoveis: number | null;
  limiteWhatsapp: number | null;
  limiteStorageGb: number | null;
  trialDias: number;
  recursos: string[];
  destaque: boolean;
  ativo: boolean;
  ordem: number;
  _count?: { assinantes: number };
};

export type StatusAssinatura = "TRIAL" | "ATIVA" | "INADIMPLENTE" | "SUSPENSA" | "CANCELADA";
export type StatusSite = "CONFIGURANDO" | "PUBLICADO" | "SUSPENSO";
export type StatusPagamento = "PENDENTE" | "PAGO" | "ATRASADO" | "CANCELADO" | "ESTORNADO";

export type Pagamento = {
  id: string;
  valor: number;
  referencia: string;
  vencimento: string;
  pagoEm: string | null;
  status: StatusPagamento;
  metodo: "PIX" | "BOLETO" | "CARTAO" | "MANUAL";
  observacao: string | null;
};

export type Assinante = {
  id: string;
  nome: string;
  responsavel: string;
  email: string;
  telefone: string | null;
  documento: string | null;
  slug: string;
  dominioProprio: string | null;
  status: StatusAssinatura;
  ciclo: "MENSAL" | "ANUAL";
  valor: number;
  trialAte: string | null;
  inicioEm: string;
  proximaCobranca: string | null;
  siteStatus: StatusSite;
  observacoes: string | null;
  createdAt: string;
  plano: { id: string; nome: string };
  pagamentos?: Pagamento[];
};

// ------------------------------------------------------------------ formatos

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const moeda = (v: number | null | undefined) => BRL.format(v || 0);
export const data = (d: string | Date | null | undefined) =>
  d ? new Date(d).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "—";
export const dataHora = (d: string | Date) =>
  new Date(d).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
export const DOMINIO = process.env.NEXT_PUBLIC_SAAS_DOMAIN || "tappyimob.com.br";

// ------------------------------------------------------------------ selos

export const STATUS_ASSINATURA: Record<StatusAssinatura, { rotulo: string; cor: string }> = {
  TRIAL: { rotulo: "Em teste", cor: "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/20" },
  ATIVA: { rotulo: "Ativa", cor: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20" },
  INADIMPLENTE: { rotulo: "Inadimplente", cor: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20" },
  SUSPENSA: { rotulo: "Suspensa", cor: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20" },
  CANCELADA: { rotulo: "Cancelada", cor: "bg-neutral-100 text-neutral-600 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:ring-neutral-700" },
};

export const STATUS_SITE: Record<StatusSite, { rotulo: string; cor: string }> = {
  CONFIGURANDO: { rotulo: "Em configuração", cor: "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/20" },
  PUBLICADO: { rotulo: "No ar", cor: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20" },
  SUSPENSO: { rotulo: "Fora do ar", cor: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20" },
};

export const STATUS_PAGAMENTO: Record<StatusPagamento, { rotulo: string; cor: string }> = {
  PENDENTE: { rotulo: "Em aberto", cor: "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/20" },
  PAGO: { rotulo: "Pago", cor: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20" },
  ATRASADO: { rotulo: "Atrasado", cor: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20" },
  CANCELADO: { rotulo: "Cancelado", cor: "bg-neutral-100 text-neutral-600 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:ring-neutral-700" },
  ESTORNADO: { rotulo: "Estornado", cor: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20" },
};

export const METODOS: Record<Pagamento["metodo"], string> = { PIX: "Pix", BOLETO: "Boleto", CARTAO: "Cartão", MANUAL: "Manual" };

export function Selo({ rotulo, cor }: { rotulo: string; cor: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${cor}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {rotulo}
    </span>
  );
}

// ------------------------------------------------------------------ layout

export function Cabecalho({ icone, titulo, texto, acoes }: { icone: ReactNode; titulo: string; texto: string; acoes?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 to-emerald-600 text-white shadow-lg shadow-orange-500/20 [&>svg]:h-6 [&>svg]:w-6">
          {icone}
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">{titulo}</h1>
          <p className="mt-0.5 text-sm text-neutral-500">{texto}</p>
        </div>
      </div>
      {acoes && <div className="flex flex-wrap items-center gap-2">{acoes}</div>}
    </div>
  );
}

export function Indicador({ rotulo, valor, detalhe, destaque }: { rotulo: string; valor: string; detalhe?: string; destaque?: boolean }) {
  return (
    <div
      className={`rounded-3xl border p-5 ${
        destaque
          ? "border-transparent bg-gradient-to-br from-[#0B2545] to-[#163A6B] text-white"
          : "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
      }`}
    >
      <p className={`text-xs font-medium ${destaque ? "text-white/70" : "text-neutral-500"}`}>{rotulo}</p>
      <p className={`mt-2 text-2xl font-bold tabular-nums tracking-tight ${destaque ? "" : "text-neutral-900 dark:text-white"}`}>{valor}</p>
      {detalhe && <p className={`mt-1 text-xs ${destaque ? "text-emerald-300" : "text-neutral-400"}`}>{detalhe}</p>}
    </div>
  );
}

export function Cartao({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 ${className}`}>{children}</div>;
}

export function Vazio({ icone, titulo, texto, acao }: { icone: ReactNode; titulo: string; texto: string; acao?: ReactNode }) {
  return (
    <div className="py-16 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-neutral-100 text-neutral-400 dark:bg-neutral-800 [&>svg]:h-7 [&>svg]:w-7">{icone}</span>
      <p className="mt-4 font-semibold text-neutral-800 dark:text-neutral-100">{titulo}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-500">{texto}</p>
      {acao && <div className="mt-5">{acao}</div>}
    </div>
  );
}

export function Carregando() {
  return (
    <div className="flex items-center justify-center py-20 text-neutral-400">
      <RiLoader4Line className="h-6 w-6 animate-spin text-orange-500" />
    </div>
  );
}

// ------------------------------------------------------------------ botões

type BotaoProps = {
  children: ReactNode;
  onClick?: () => void;
  tipo?: "primario" | "secundario" | "perigo" | "fantasma";
  disabled?: boolean;
  carregando?: boolean;
  type?: "button" | "submit";
  className?: string;
};

export function Botao({ children, onClick, tipo = "primario", disabled, carregando, type = "button", className = "" }: BotaoProps) {
  const estilos = {
    primario: "bg-orange-500 text-white shadow-lg shadow-orange-500/25 hover:bg-orange-600",
    secundario: "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800",
    perigo: "bg-rose-600 text-white hover:bg-rose-700",
    fantasma: "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || carregando}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 [&>svg]:h-4 [&>svg]:w-4 ${estilos[tipo]} ${className}`}
    >
      {carregando && <RiLoader4Line className="animate-spin" />}
      {children}
    </button>
  );
}

// ------------------------------------------------------------------ campos

export function Campo({ rotulo, ajuda, children, className = "" }: { rotulo: string; ajuda?: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-semibold text-neutral-600 dark:text-neutral-300">{rotulo}</span>
      {children}
      {ajuda && <span className="mt-1 block text-[11px] text-neutral-400">{ajuda}</span>}
    </label>
  );
}

export const estiloInput =
  "h-11 w-full rounded-2xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-400 transition focus:border-orange-500/60 focus:outline-none focus:ring-4 focus:ring-orange-500/10 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white";

export function Alternar({ ligado, onChange, rotulo }: { ligado: boolean; onChange: (v: boolean) => void; rotulo: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ligado}
      onClick={() => onChange(!ligado)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-neutral-200 px-4 py-3 text-left text-sm text-neutral-700 dark:border-neutral-700 dark:text-neutral-200"
    >
      {rotulo}
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${ligado ? "bg-orange-500" : "bg-neutral-300 dark:bg-neutral-700"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${ligado ? "translate-x-[22px]" : "translate-x-0.5"}`} />
      </span>
    </button>
  );
}

// ------------------------------------------------------------------ modal

export function Modal({
  aberto,
  onFechar,
  titulo,
  subtitulo,
  children,
  rodape,
  largura = "max-w-2xl",
}: {
  aberto: boolean;
  onFechar: () => void;
  titulo: string;
  subtitulo?: string;
  children: ReactNode;
  rodape?: ReactNode;
  largura?: string;
}) {
  useEffect(() => {
    if (!aberto) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [aberto, onFechar]);

  return (
    <AnimatePresence>
      {aberto && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.div
            className="absolute inset-0 bg-neutral-950/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onFechar}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={titulo}
            className={`relative flex max-h-[92vh] w-full ${largura} flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl dark:bg-neutral-900 sm:rounded-[28px]`}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-neutral-100 px-6 py-5 dark:border-neutral-800">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">{titulo}</h2>
                {subtitulo && <p className="mt-0.5 text-sm text-neutral-500">{subtitulo}</p>}
              </div>
              <button type="button" onClick={onFechar} aria-label="Fechar" className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <RiCloseLine className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {rodape && <div className="flex flex-wrap justify-end gap-2 border-t border-neutral-100 px-6 py-4 dark:border-neutral-800">{rodape}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/** Erros da API num formato só. */
export async function chamar<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers || {}) } });
  const corpo = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(corpo.error || "Não foi possível concluir. Tente de novo.");
  return corpo as T;
}
