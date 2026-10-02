import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET - Lê a base de conhecimento geral da IA jurídica
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const config = await prisma.juridicoIAConfig.findUnique({ where: { id: "default" } });
  return NextResponse.json({ baseConhecimento: config?.baseConhecimento || "", updatedAt: config?.updatedAt, updatedByNome: config?.updatedByNome });
}

// PUT - Salva a base de conhecimento geral
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const baseConhecimento = String(body.baseConhecimento || "");

  const config = await prisma.juridicoIAConfig.upsert({
    where: { id: "default" },
    update: { baseConhecimento, updatedByNome: session.name },
    create: { id: "default", baseConhecimento, updatedByNome: session.name },
  });

  return NextResponse.json({ ok: true, updatedAt: config.updatedAt });
}
