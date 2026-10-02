import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Buscar configuração por key
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ error: "Parâmetro 'key' obrigatório" }, { status: 400 });
    }

    const config = await prisma.systemConfig.findUnique({
      where: { key },
    });

    return NextResponse.json({ value: config?.value || null });
  } catch (error) {
    console.error("Erro ao buscar configuração:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// PUT - Salvar configuração (apenas ADMIN)
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Apenas administradores podem alterar configurações" }, { status: 403 });
    }

    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: "'key' e 'value' são obrigatórios" }, { status: 400 });
    }

    const config = await prisma.systemConfig.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });

    return NextResponse.json({ config });
  } catch (error) {
    console.error("Erro ao salvar configuração:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
