import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/saas";

const CAMPOS = [
  "nome", "chamada", "descricao", "precoMensal", "precoAnual", "limiteUsuarios", "limiteImoveis",
  "limiteWhatsapp", "limiteStorageGb", "trialDias", "recursos", "destaque", "ativo", "ordem",
] as const;

// PATCH — edita o plano. Mudar preço não altera quem já assina (o valor fica
// gravado no assinante); vale para as próximas contratações.
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { erro } = await exigirAdmin();
  if (erro) return erro;
  const { id } = await params;
  const b = await request.json().catch(() => ({}));

  const data: Record<string, unknown> = {};
  for (const c of CAMPOS) if (b[c] !== undefined) data[c] = b[c];
  if (data.recursos && Array.isArray(data.recursos)) data.recursos = (data.recursos as unknown[]).map(String).filter(Boolean);

  try {
    return NextResponse.json(await prisma.saasPlano.update({ where: { id }, data }));
  } catch {
    return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });
  }
}

// DELETE — só sem assinantes. Com assinantes, desative em vez de excluir.
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { erro } = await exigirAdmin();
  if (erro) return erro;
  const { id } = await params;
  const emUso = await prisma.saasAssinante.count({ where: { planoId: id } });
  if (emUso > 0) {
    return NextResponse.json(
      { error: `Este plano tem ${emUso} assinante(s). Desative-o para tirar da home sem afetar quem já assina.` },
      { status: 409 }
    );
  }
  await prisma.saasPlano.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
