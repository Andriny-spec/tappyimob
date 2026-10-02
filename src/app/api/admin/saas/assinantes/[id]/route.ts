import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { atualizarAtrasos, exigirAdmin, gerarSlug, registrarEvento, validarSlug, valorDoCiclo } from "@/lib/saas";

const ROTULO_STATUS: Record<string, string> = {
  TRIAL: "em teste", ATIVA: "ativa", INADIMPLENTE: "inadimplente", SUSPENSA: "suspensa", CANCELADA: "cancelada",
};
const ROTULO_SITE: Record<string, string> = { CONFIGURANDO: "em configuração", PUBLICADO: "publicado", SUSPENSO: "suspenso" };

// GET — ficha completa do assinante
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { erro } = await exigirAdmin();
  if (erro) return erro;
  await atualizarAtrasos();
  const { id } = await params;
  const a = await prisma.saasAssinante.findUnique({
    where: { id },
    include: {
      plano: true,
      usuario: { select: { id: true, email: true, name: true, isActive: true } },
      pagamentos: { orderBy: { vencimento: "desc" } },
      eventos: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });
  if (!a) return NextResponse.json({ error: "Assinante não encontrado" }, { status: 404 });
  return NextResponse.json(a);
}

// PATCH — edita dados, plano, ciclo, status da assinatura e do site.
// Cada mudança relevante entra na linha do tempo.
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { erro, session } = await exigirAdmin();
  if (erro) return erro;
  const { id } = await params;
  const b = await request.json().catch(() => ({}));

  const atual = await prisma.saasAssinante.findUnique({ where: { id }, include: { plano: true } });
  if (!atual) return NextResponse.json({ error: "Assinante não encontrado" }, { status: 404 });

  const data: Record<string, unknown> = {};
  const eventos: [string, string][] = [];

  for (const c of ["nome", "responsavel", "email", "telefone", "documento", "observacoes", "siteConfig"] as const) {
    if (b[c] !== undefined) data[c] = b[c] === "" ? null : b[c];
  }
  if (data.email) data.email = String(data.email).toLowerCase();
  if (data.nome === null || data.responsavel === null || data.email === null) {
    return NextResponse.json({ error: "Nome, responsável e e-mail não podem ficar vazios" }, { status: 400 });
  }

  if (b.slug !== undefined && b.slug !== atual.slug) {
    const slug = gerarSlug(b.slug);
    const e = validarSlug(slug);
    if (e) return NextResponse.json({ error: e }, { status: 400 });
    if (await prisma.saasAssinante.findFirst({ where: { slug, NOT: { id } } })) {
      return NextResponse.json({ error: `O endereço ${slug} já está em uso` }, { status: 409 });
    }
    data.slug = slug;
    eventos.push(["SITE", `Endereço do site alterado de ${atual.slug} para ${slug}.`]);
  }

  if (b.dominioProprio !== undefined) {
    const dom = b.dominioProprio ? String(b.dominioProprio).trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "") : null;
    if (dom && !/^([a-z0-9-]+\.)+[a-z]{2,}$/.test(dom)) return NextResponse.json({ error: "Domínio inválido" }, { status: 400 });
    if (dom && (await prisma.saasAssinante.findFirst({ where: { dominioProprio: dom, NOT: { id } } }))) {
      return NextResponse.json({ error: "Este domínio já está ligado a outro assinante" }, { status: 409 });
    }
    if (dom !== atual.dominioProprio) {
      data.dominioProprio = dom;
      eventos.push(["SITE", dom ? `Domínio próprio definido: ${dom}.` : "Domínio próprio removido."]);
    }
  }

  if (b.siteStatus && b.siteStatus !== atual.siteStatus) {
    data.siteStatus = b.siteStatus;
    eventos.push(["SITE", `Site ${ROTULO_SITE[b.siteStatus] || b.siteStatus}.`]);
  }

  // Troca de plano ou ciclo recalcula o valor, salvo se vier um valor explícito
  const novoPlano = b.planoId && b.planoId !== atual.planoId ? await prisma.saasPlano.findUnique({ where: { id: b.planoId } }) : null;
  if (b.planoId && b.planoId !== atual.planoId && !novoPlano) return NextResponse.json({ error: "Plano não encontrado" }, { status: 400 });
  const novoCiclo = b.ciclo && b.ciclo !== atual.ciclo ? (b.ciclo === "ANUAL" ? "ANUAL" : "MENSAL") : null;
  if (novoPlano || novoCiclo) {
    const plano = novoPlano ?? atual.plano;
    const ciclo = novoCiclo ?? atual.ciclo;
    if (novoPlano) data.planoId = novoPlano.id;
    if (novoCiclo) data.ciclo = novoCiclo;
    data.valor = b.valor !== undefined && b.valor !== "" ? Number(b.valor) : valorDoCiclo(plano, ciclo);
    eventos.push(["PLANO", `Plano ${plano.nome}, ${ciclo === "ANUAL" ? "anual" : "mensal"}, ${Number(data.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}. Vale a partir da próxima cobrança.`]);
  } else if (b.valor !== undefined && b.valor !== "" && Number(b.valor) !== atual.valor) {
    data.valor = Number(b.valor);
    eventos.push(["PLANO", `Valor ajustado para ${Number(b.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}.`]);
  }

  if (b.status && b.status !== atual.status) {
    data.status = b.status;
    if (b.status === "CANCELADA") data.canceladoEm = new Date();
    if (atual.status === "CANCELADA") data.canceladoEm = null;
    // Assinatura suspensa ou cancelada tira o site do ar junto
    if (b.status === "SUSPENSA" || b.status === "CANCELADA") data.siteStatus = "SUSPENSO";
    eventos.push(["STATUS", `Assinatura ${ROTULO_STATUS[b.status] || b.status}${b.motivo ? `: ${b.motivo}` : "."}`]);
  }

  const a = await prisma.saasAssinante.update({ where: { id }, data });

  // Login acompanha a assinatura: bloqueado se suspensa/cancelada
  if (a.usuarioId && b.status) {
    await prisma.user.update({ where: { id: a.usuarioId }, data: { isActive: !["SUSPENSA", "CANCELADA"].includes(a.status) } }).catch(() => null);
  }
  for (const [tipo, descricao] of eventos) await registrarEvento(id, tipo, descricao, session!.name);

  return NextResponse.json(a);
}

// DELETE — remove o assinante e o histórico. O login é desativado, não apagado.
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { erro } = await exigirAdmin();
  if (erro) return erro;
  const { id } = await params;
  const a = await prisma.saasAssinante.findUnique({ where: { id }, select: { usuarioId: true, status: true } });
  if (!a) return NextResponse.json({ error: "Assinante não encontrado" }, { status: 404 });
  if (a.status !== "CANCELADA") {
    return NextResponse.json({ error: "Cancele a assinatura antes de excluir" }, { status: 409 });
  }
  if (a.usuarioId) await prisma.user.update({ where: { id: a.usuarioId }, data: { isActive: false } }).catch(() => null);
  await prisma.saasAssinante.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
