import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type Params = { params: Promise<{ tid: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { tid } = await params;
  const body = await req.json();

  const updateData: any = {};
  if (body.ativo !== undefined) updateData.ativo = body.ativo;
  if (body.aiInstrucao !== undefined) updateData.aiInstrucao = body.aiInstrucao;

  const template = await prisma.contratoTemplate.update({
    where: { id: tid },
    data: updateData,
  });

  return NextResponse.json({ template });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { tid } = await params;

  await prisma.contratoTemplate.delete({ where: { id: tid } });

  return NextResponse.json({ ok: true });
}
