/**
 * Cache + log das consultas do Tappy IQ (Seekloc/PH3A). SERVER-ONLY.
 *
 * Toda busca vira uma linha em `TappyIqBusca`. Antes de bater na API externa
 * (que é COBRADA por consulta), procuramos um resultado idêntico recente pelo
 * `cacheKey`; se houver dentro do TTL, reaproveitamos — sem cobrar de novo —
 * e ainda registramos a linha do usuário atual (fromCache=true) para o histórico.
 */

import { prisma } from "@/lib/prisma";

// TTL do cache em dias (configurável). Default: 60 dias.
const TTL_DAYS = Math.max(1, Number(process.env.TAPPY_IQ_CACHE_DAYS || 60));

export type CiqSource = "seekloc" | "ph3a";
export type CiqKind = "lista" | "dossie";

const onlyDigits = (v?: string) => (v || "").replace(/\D/g, "");

/** Serialização estável de params (ordena chaves) para compor o cacheKey. */
export function stableKey(obj: Record<string, any>): string {
  const clean: Record<string, string> = {};
  Object.keys(obj || {})
    .sort()
    .forEach((k) => {
      const v = String(obj[k] ?? "").trim();
      if (v) clean[k] = v.toLowerCase();
    });
  return JSON.stringify(clean);
}

export function cacheKeySeeklocSearch(tipo: string, params: Record<string, any>) {
  return `seekloc:search:${tipo}:${stableKey(params)}`;
}
export function cacheKeySeeklocDetail(id: string, doc: string) {
  return `seekloc:detail:${String(id)}:${onlyDigits(doc)}`;
}
export function cacheKeyPh3a(doc: string) {
  return `ph3a:${onlyDigits(doc)}`;
}

/** Procura um resultado recente (dentro do TTL) com o mesmo cacheKey. */
export async function findCached(cacheKey: string): Promise<any | null> {
  const since = new Date(Date.now() - TTL_DAYS * 86400000);
  try {
    const row = await prisma.tappyIqBusca.findFirst({
      where: { cacheKey, createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      select: { resultado: true },
    });
    return row?.resultado ?? null;
  } catch {
    return null; // cache nunca deve quebrar a busca
  }
}

export interface LogBuscaInput {
  userId?: string | null;
  userName?: string | null;
  source: CiqSource;
  tipo: string;
  kind: CiqKind;
  cacheKey: string;
  label?: string | null;
  documento?: string | null;
  nome?: string | null;
  resultado: any;
  fromCache: boolean;
}

/** Registra a consulta no histórico (best-effort — não quebra a resposta). */
export async function logBusca(input: LogBuscaInput): Promise<void> {
  try {
    await prisma.tappyIqBusca.create({
      data: {
        userId: input.userId ?? null,
        userName: input.userName ?? null,
        source: input.source,
        tipo: input.tipo,
        kind: input.kind,
        cacheKey: input.cacheKey,
        label: input.label ?? null,
        documento: input.documento ?? null,
        nome: input.nome ?? null,
        resultado: input.resultado ?? undefined,
        fromCache: input.fromCache,
      },
    });
  } catch {
    /* ignora falha de log */
  }
}

export const cacheTtlDays = TTL_DAYS;
