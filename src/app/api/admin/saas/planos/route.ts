import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigirAdmin, gerarSlug } from "@/lib/saas";
import { plans as planosDaHome } from "@/components/saas/plans-data";

// Limites dos planos de demonstração da home, para o catálogo começar igual
const LIMITES_HOME: Record<string, { usuarios: number; imoveis: number; whatsapp: number; storage: number }> = {
  essencial: { usuarios: 2, imoveis: 300, whatsapp: 1, storage: 5 },
  imobiliaria: { usuarios: 10, imoveis: 2000, whatsapp: 3, storage: 30 },
  escala: { usuarios: 30, imoveis: 10000, whatsapp: 10, storage: 100 },
};

// GET — catálogo de planos com quantos assinantes cada um tem.
// Primeira abertura com a tabela vazia: importa os planos da home.
export async function GET() {
  const { erro } = await exigirAdmin();
  if (erro) return erro;

  if ((await prisma.saasPlano.count()) === 0) {
    await prisma.saasPlano.createMany({
      data: planosDaHome.map((p, i) => ({
        nome: p.name,
        slug: p.id,
        chamada: p.tagline,
        descricao: p.description,
        precoMensal: p.price,
        precoAnual: p.annualPrice,
        limiteUsuarios: LIMITES_HOME[p.id]?.usuarios ?? null,
        limiteImoveis: LIMITES_HOME[p.id]?.imoveis ?? null,
        limiteWhatsapp: LIMITES_HOME[p.id]?.whatsapp ?? null,
        limiteStorageGb: LIMITES_HOME[p.id]?.storage ?? null,
        recursos: [...p.features],
        destaque: p.featured,
        ordem: i,
      })),
      skipDuplicates: true,
    });
  }

  const planos = await prisma.saasPlano.findMany({
    orderBy: [{ ordem: "asc" }, { precoMensal: "asc" }],
    include: { _count: { select: { assinantes: { where: { status: { in: ["TRIAL", "ATIVA", "INADIMPLENTE"] } } } } } },
  });
  return NextResponse.json(planos);
}

// POST — novo plano
export async function POST(request: NextRequest) {
  const { erro } = await exigirAdmin();
  if (erro) return erro;
  const b = await request.json().catch(() => ({}));

  const nome = String(b.nome || "").trim();
  const precoMensal = Number(b.precoMensal);
  const precoAnual = Number(b.precoAnual ?? b.precoMensal);
  if (!nome) return NextResponse.json({ error: "Informe o nome do plano" }, { status: 400 });
  if (!(precoMensal >= 0) || !(precoAnual >= 0)) return NextResponse.json({ error: "Preços inválidos" }, { status: 400 });

  const slug = gerarSlug(b.slug || nome);
  if (await prisma.saasPlano.findUnique({ where: { slug } })) {
    return NextResponse.json({ error: "Já existe um plano com esse identificador" }, { status: 409 });
  }

  const plano = await prisma.saasPlano.create({
    data: {
      nome,
      slug,
      chamada: b.chamada || null,
      descricao: b.descricao || null,
      precoMensal,
      precoAnual,
      limiteUsuarios: b.limiteUsuarios ?? null,
      limiteImoveis: b.limiteImoveis ?? null,
      limiteWhatsapp: b.limiteWhatsapp ?? null,
      limiteStorageGb: b.limiteStorageGb ?? null,
      trialDias: Number(b.trialDias ?? 14),
      recursos: Array.isArray(b.recursos) ? b.recursos.map(String).filter(Boolean) : [],
      destaque: !!b.destaque,
      ativo: b.ativo !== false,
      ordem: Number(b.ordem ?? (await prisma.saasPlano.count())),
    },
  });
  return NextResponse.json(plano, { status: 201 });
}
