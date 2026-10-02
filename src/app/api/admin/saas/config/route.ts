import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CONFIG_SAAS_KEY, CONFIG_SAAS_PADRAO, exigirAdmin, type ConfigSaas } from "@/lib/saas";

export async function GET() {
  const { erro } = await exigirAdmin();
  if (erro) return erro;
  const c = await prisma.systemConfig.findUnique({ where: { key: CONFIG_SAAS_KEY } });
  return NextResponse.json({ ...CONFIG_SAAS_PADRAO, ...((c?.value as Partial<ConfigSaas>) || {}) });
}

export async function PUT(request: NextRequest) {
  const { erro } = await exigirAdmin();
  if (erro) return erro;
  const b = (await request.json().catch(() => ({}))) as Partial<ConfigSaas>;

  // Só chaves conhecidas, com o tipo do padrão
  const limpo: Record<string, unknown> = {};
  for (const [k, padrao] of Object.entries(CONFIG_SAAS_PADRAO)) {
    const v = (b as Record<string, unknown>)[k];
    if (v === undefined) continue;
    if (typeof padrao === "number") {
      const n = Number(v);
      if (!Number.isFinite(n) || n < 0) return NextResponse.json({ error: `Valor inválido em ${k}` }, { status: 400 });
      limpo[k] = Math.round(n);
    } else if (typeof padrao === "boolean") limpo[k] = !!v;
    else limpo[k] = String(v).trim();
  }

  const atual = await prisma.systemConfig.findUnique({ where: { key: CONFIG_SAAS_KEY } });
  const valor = { ...CONFIG_SAAS_PADRAO, ...((atual?.value as object) || {}), ...limpo };
  await prisma.systemConfig.upsert({
    where: { key: CONFIG_SAAS_KEY },
    create: { key: CONFIG_SAAS_KEY, value: valor },
    update: { value: valor },
  });
  return NextResponse.json(valor);
}
