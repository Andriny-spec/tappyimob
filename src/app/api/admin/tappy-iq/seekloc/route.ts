import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { seeklocSearch, seeklocDetail, type SeeklocTipo } from "@/lib/seekloc";
import {
  findCached,
  logBusca,
  cacheKeySeeklocSearch,
  cacheKeySeeklocDetail,
} from "@/lib/tappy-iq-cache";

const TIPOS_VALIDOS: SeeklocTipo[] = [
  "documento",
  "nome",
  "telefone",
  "email",
  "endereco",
  "cep",
  "placa",
];

// Quem pode usar o Tappy IQ (equipe interna de qualificação).
const ROLES_PERMITIDAS = new Set(["ADMIN", "SDR", "CORRETOR"]);

const labelParams = (tipo: string, params: Record<string, string>) =>
  `${tipo}: ${Object.values(params).filter(Boolean).join(" ").slice(0, 80)}`;

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

  try {
    if (action === "detail") {
      const { id, doc } = body;
      if (!id || !doc) {
        return NextResponse.json({ error: "id e doc são obrigatórios" }, { status: 400 });
      }
      const cacheKey = cacheKeySeeklocDetail(String(id), String(doc));

      const cached = await findCached(cacheKey);
      if (cached) {
        await logBusca({
          userId: session.id, userName: session.name, source: "seekloc", tipo: "detail",
          kind: "dossie", cacheKey, label: `Dossiê ${cached?.dossie?.nome || doc}`,
          documento: String(doc), nome: cached?.dossie?.nome || null, resultado: cached, fromCache: true,
        });
        return NextResponse.json({ ...cached, cached: true });
      }

      const result = await seeklocDetail(String(id), String(doc));
      await logBusca({
        userId: session.id, userName: session.name, source: "seekloc", tipo: "detail",
        kind: "dossie", cacheKey, label: `Dossiê ${result?.dossie?.nome || doc}`,
        documento: String(doc), nome: result?.dossie?.nome || null, resultado: result, fromCache: false,
      });
      return NextResponse.json({ ...result, cached: false });
    }

    // drill: clicar num nome dentro da ficha → abre o dossiê dele.
    // Com documento: busca por doc → pega o id → detalhe (encadeado, com cache).
    // Só com nome: devolve a lista de candidatos para o usuário escolher.
    if (action === "drill") {
      const doc = String(body?.doc || "").replace(/\D/g, "");
      const nome = String(body?.nome || "").trim();

      if (doc.length === 11 || doc.length === 14) {
        const detailKeyByDoc = `seekloc:drill:${doc}`;
        const cached = await findCached(detailKeyByDoc);
        if (cached) {
          await logBusca({
            userId: session.id, userName: session.name, source: "seekloc", tipo: "detail",
            kind: "dossie", cacheKey: detailKeyByDoc, label: `Dossiê ${cached?.dossie?.nome || doc}`,
            documento: doc, nome: cached?.dossie?.nome || null, resultado: cached, fromCache: true,
          });
          return NextResponse.json({ ...cached, cached: true });
        }
        const busca = await seeklocSearch("documento", { doc });
        const hit = busca.hits.find((h) => h.doc.replace(/\D/g, "") === doc) || busca.hits[0];
        if (!hit) {
          return NextResponse.json({ ok: false, mensagem: "Não foi possível localizar o dossiê deste documento.", hits: [] });
        }
        const result = await seeklocDetail(hit.id, hit.doc);
        await logBusca({
          userId: session.id, userName: session.name, source: "seekloc", tipo: "detail",
          kind: "dossie", cacheKey: detailKeyByDoc, label: `Dossiê ${result?.dossie?.nome || doc}`,
          documento: doc, nome: result?.dossie?.nome || null, resultado: result, fromCache: false,
        });
        return NextResponse.json({ ...result, cached: false });
      }

      // só nome → devolve candidatos para o usuário escolher
      if (nome) {
        const busca = await seeklocSearch("nome", { nome });
        return NextResponse.json({ ...busca, candidatesOnly: true });
      }
      return NextResponse.json({ error: "Informe documento ou nome para o drill" }, { status: 400 });
    }

    // default: busca (etapa 1 — lista de candidatos)
    const tipo = body?.tipo as SeeklocTipo;
    if (!TIPOS_VALIDOS.includes(tipo)) {
      return NextResponse.json({ error: "Tipo de busca inválido" }, { status: 400 });
    }
    const params = (body?.params || {}) as Record<string, string>;

    // valida que há ao menos um campo preenchido
    const algumPreenchido = Object.values(params).some((v) => (v || "").trim());
    if (!algumPreenchido) {
      return NextResponse.json({ error: "Informe ao menos um dado para a busca" }, { status: 400 });
    }

    const cacheKey = cacheKeySeeklocSearch(tipo, params);
    const cached = await findCached(cacheKey);
    if (cached) {
      await logBusca({
        userId: session.id, userName: session.name, source: "seekloc", tipo,
        kind: "lista", cacheKey, label: labelParams(tipo, params),
        documento: params.doc || null, nome: null, resultado: cached, fromCache: true,
      });
      return NextResponse.json({ ...cached, cached: true });
    }

    const result = await seeklocSearch(tipo, params);
    await logBusca({
      userId: session.id, userName: session.name, source: "seekloc", tipo,
      kind: "lista", cacheKey, label: labelParams(tipo, params),
      documento: params.doc || null, nome: null, resultado: result, fromCache: false,
    });
    return NextResponse.json({ ...result, cached: false });
  } catch (error: any) {
    console.error("[TAPPY_IQ/SEEKLOC]", error);
    return NextResponse.json(
      { error: error?.message || "Falha ao consultar o Seekloc" },
      { status: 502 }
    );
  }
}
