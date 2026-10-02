import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  ph3aSearch,
  ph3aConfigured,
  ph3aBuscar,
  ph3aDetailBySequentialId,
} from "@/lib/ph3a";
import { findCached, logBusca, cacheKeyPh3a, stableKey } from "@/lib/tappy-iq-cache";

const ROLES_PERMITIDAS = new Set(["ADMIN", "SDR", "CORRETOR"]);

// GET → status da configuração (a página usa para sinalizar a aba PH3A).
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  return NextResponse.json({ configured: ph3aConfigured() });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!ROLES_PERMITIDAS.has(session.role)) {
    return NextResponse.json({ error: "Sem permissão para o Tappy IQ" }, { status: 403 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido" }, { status: 400 });
  }

  const action = body?.action;
  const sess = { userId: session.id, userName: session.name };

  // ── Busca avançada multi-parâmetro (/search) → lista de candidatos com prévia ──
  if (action === "search") {
    const params = (body?.params || {}) as Record<string, string>;
    const cacheKey = `ph3a:search:${stableKey(params)}`;

    const cached = await findCached(cacheKey);
    if (cached) {
      await logBusca({ ...sess, source: "ph3a", tipo: "busca", kind: "lista", cacheKey,
        label: "Busca avançada", resultado: cached, fromCache: true });
      return NextResponse.json({ ...cached, cached: true });
    }

    const result = await ph3aBuscar(params);
    if (result.ok) {
      await logBusca({ ...sess, source: "ph3a", tipo: "busca", kind: "lista", cacheKey,
        label: "Busca avançada", resultado: result, fromCache: false });
    }
    return NextResponse.json({ ...result, cached: false });
  }

  // ── Dossiê a partir de um candidato (SequentialId) ──
  if (action === "detail") {
    const sid = body?.sequentialId;
    if (!sid) return NextResponse.json({ error: "sequentialId é obrigatório" }, { status: 400 });
    const cacheKey = `ph3a:seq:${sid}`;

    const cached = await findCached(cacheKey);
    if (cached) {
      await logBusca({ ...sess, source: "ph3a", tipo: "detail", kind: "dossie", cacheKey,
        label: `Dossiê ${cached?.dossie?.nome || sid}`, documento: cached?.dossie?.documento || null,
        nome: cached?.dossie?.nome || null, resultado: cached, fromCache: true });
      return NextResponse.json({ ...cached, cached: true });
    }

    const result = await ph3aDetailBySequentialId(sid);
    if (result.ok && result.dossie) {
      const payload = { ...result, raw: result.raw };
      await logBusca({ ...sess, source: "ph3a", tipo: "detail", kind: "dossie", cacheKey,
        label: `Dossiê ${result.dossie.nome}`, documento: result.dossie.documento || null,
        nome: result.dossie.nome || null, resultado: payload, fromCache: false });
      return NextResponse.json({ ...payload, cached: false });
    }
    return NextResponse.json(result);
  }

  // ── Dossiê direto por documento (CPF/CNPJ) ──
  const documento = String(body?.params?.doc || body?.doc || "").trim();
  if (!documento) {
    return NextResponse.json({ error: "Informe um CPF ou CNPJ" }, { status: 400 });
  }
  const cacheKey = cacheKeyPh3a(documento);

  const cached = await findCached(cacheKey);
  if (cached) {
    await logBusca({ ...sess, source: "ph3a", tipo: "documento", kind: "dossie", cacheKey,
      label: `CPF/CNPJ ${cached?.dossie?.documento || documento}`, documento,
      nome: cached?.dossie?.nome || null, resultado: cached, fromCache: true });
    return NextResponse.json({ ...cached, cached: true });
  }

  const result = await ph3aSearch(documento);
  if (result.ok && result.dossie) {
    const payload = { ...result, raw: result.raw };
    await logBusca({ ...sess, source: "ph3a", tipo: "documento", kind: "dossie", cacheKey,
      label: `CPF/CNPJ ${result.dossie.documento || documento}`, documento,
      nome: result.dossie.nome || null, resultado: payload, fromCache: false });
    return NextResponse.json({ ...payload, cached: false });
  }
  return NextResponse.json(result);
}
