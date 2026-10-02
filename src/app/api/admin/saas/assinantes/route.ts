import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  atualizarAtrasos,
  exigirAdmin,
  gerarSlug,
  proximoVencimento,
  referenciaDo,
  registrarEvento,
  validarSlug,
  valorDoCiclo,
} from "@/lib/saas";

// GET — lista de assinantes + indicadores do topo da tela
export async function GET(request: NextRequest) {
  const { erro } = await exigirAdmin();
  if (erro) return erro;
  await atualizarAtrasos();

  const sp = request.nextUrl.searchParams;
  const where: Prisma.SaasAssinanteWhereInput = {};
  const status = sp.get("status");
  if (status) where.status = status as Prisma.SaasAssinanteWhereInput["status"];
  if (sp.get("planoId")) where.planoId = sp.get("planoId")!;
  if (sp.get("siteStatus")) where.siteStatus = sp.get("siteStatus") as Prisma.SaasAssinanteWhereInput["siteStatus"];
  const busca = sp.get("busca")?.trim();
  if (busca) {
    where.OR = [
      { nome: { contains: busca, mode: "insensitive" } },
      { responsavel: { contains: busca, mode: "insensitive" } },
      { email: { contains: busca, mode: "insensitive" } },
      { slug: { contains: busca.toLowerCase() } },
      { dominioProprio: { contains: busca.toLowerCase() } },
    ];
  }

  const [assinantes, porStatus, ativosParaMrr, abertos] = await Promise.all([
    prisma.saasAssinante.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        plano: { select: { id: true, nome: true } },
        pagamentos: { orderBy: { vencimento: "desc" }, take: 1, select: { status: true, vencimento: true, valor: true } },
      },
    }),
    prisma.saasAssinante.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.saasAssinante.findMany({ where: { status: { in: ["ATIVA", "INADIMPLENTE"] } }, select: { valor: true, ciclo: true } }),
    prisma.saasPagamento.aggregate({ where: { status: { in: ["PENDENTE", "ATRASADO"] } }, _sum: { valor: true }, _count: { _all: true } }),
  ]);

  const contagem = Object.fromEntries(porStatus.map((s) => [s.status, s._count._all]));
  // Receita recorrente mensal: anual entra dividido por 12
  const mrr = ativosParaMrr.reduce((t, a) => t + (a.ciclo === "ANUAL" ? a.valor / 12 : a.valor), 0);

  return NextResponse.json({
    assinantes,
    resumo: {
      total: porStatus.reduce((t, s) => t + s._count._all, 0),
      ativos: contagem.ATIVA || 0,
      trial: contagem.TRIAL || 0,
      inadimplentes: contagem.INADIMPLENTE || 0,
      suspensos: contagem.SUSPENSA || 0,
      cancelados: contagem.CANCELADA || 0,
      mrr: Math.round(mrr * 100) / 100,
      emAberto: abertos._sum.valor || 0,
      cobrancasEmAberto: abertos._count._all,
    },
  });
}

// POST — cadastra assinante. Opcionalmente cria o login (perfil ASSINANTE)
// e já gera a primeira cobrança.
export async function POST(request: NextRequest) {
  const { erro, session } = await exigirAdmin();
  if (erro) return erro;
  const b = await request.json().catch(() => ({}));

  const nome = String(b.nome || "").trim();
  const responsavel = String(b.responsavel || "").trim();
  const email = String(b.email || "").trim().toLowerCase();
  if (!nome || !responsavel || !email) {
    return NextResponse.json({ error: "Nome da imobiliária, responsável e e-mail são obrigatórios" }, { status: 400 });
  }

  const plano = await prisma.saasPlano.findUnique({ where: { id: String(b.planoId || "") } });
  if (!plano) return NextResponse.json({ error: "Escolha um plano" }, { status: 400 });

  const slug = gerarSlug(b.slug || nome);
  const erroSlug = validarSlug(slug);
  if (erroSlug) return NextResponse.json({ error: erroSlug }, { status: 400 });
  if (await prisma.saasAssinante.findUnique({ where: { slug } })) {
    return NextResponse.json({ error: `O endereço ${slug} já está em uso` }, { status: 409 });
  }

  const ciclo = b.ciclo === "ANUAL" ? "ANUAL" : "MENSAL";
  const valor = b.valor !== undefined && b.valor !== "" ? Number(b.valor) : valorDoCiclo(plano, ciclo);
  const emTrial = b.trial !== false && plano.trialDias > 0;
  const agora = new Date();
  const trialAte = emTrial ? new Date(agora.getTime() + plano.trialDias * 86_400_000) : null;
  const primeiroVencimento = trialAte ?? agora;

  // Login do assinante: cria um usuário novo, ou reaproveita um existente com o mesmo e-mail
  let usuarioId: string | null = null;
  let senhaProvisoria: string | null = null;
  if (b.criarLogin !== false) {
    const existente = await prisma.user.findUnique({ where: { email }, select: { id: true, saasAssinante: { select: { id: true } } } });
    if (existente?.saasAssinante) {
      return NextResponse.json({ error: "Este e-mail já é o login de outro assinante" }, { status: 409 });
    }
    if (existente) {
      usuarioId = existente.id;
    } else {
      senhaProvisoria = randomBytes(9).toString("base64").replace(/[+/=]/g, "").slice(0, 10) + "!7";
      const u = await prisma.user.create({
        data: { email, name: responsavel, phone: b.telefone || null, role: "ASSINANTE", password: await bcrypt.hash(senhaProvisoria, 10) },
      });
      usuarioId = u.id;
    }
  }

  const assinante = await prisma.saasAssinante.create({
    data: {
      nome,
      responsavel,
      email,
      telefone: b.telefone || null,
      documento: b.documento || null,
      slug,
      dominioProprio: b.dominioProprio ? String(b.dominioProprio).trim().toLowerCase() : null,
      status: emTrial ? "TRIAL" : "ATIVA",
      ciclo,
      valor,
      trialAte,
      proximaCobranca: primeiroVencimento,
      observacoes: b.observacoes || null,
      planoId: plano.id,
      usuarioId,
      pagamentos: {
        create: {
          valor,
          vencimento: primeiroVencimento,
          referencia: referenciaDo(primeiroVencimento, ciclo),
          metodo: ["PIX", "BOLETO", "CARTAO", "MANUAL"].includes(b.metodo) ? b.metodo : "PIX",
        },
      },
    },
  });

  await registrarEvento(
    assinante.id,
    "CRIADO",
    `Assinatura criada no plano ${plano.nome} (${ciclo === "ANUAL" ? "anual" : "mensal"})${emTrial ? `, com ${plano.trialDias} dias de teste` : ""}.`,
    session!.name
  );

  return NextResponse.json({ assinante, senhaProvisoria, proximoVencimento: proximoVencimento(primeiroVencimento, ciclo) }, { status: 201 });
}
