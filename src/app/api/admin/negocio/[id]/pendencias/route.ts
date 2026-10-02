import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { id } = await params;

    const pendencias = await prisma.negocioPendencia.findMany({
      where: { negocioId: id },
      orderBy: [{ bloqueante: "desc" }, { createdAt: "asc" }],
    });

    return NextResponse.json(pendencias);
  } catch (error) {
    console.error("Error fetching pendencias:", error);
    return NextResponse.json({ error: "Erro ao buscar pendências" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const pendencia = await prisma.negocioPendencia.create({
      data: {
        negocioId: id,
        campo: body.campo,
        descricao: body.descricao,
        bloqueante: body.bloqueante ?? false,
        responsavel: body.responsavel || "Corretor",
      },
    });

    return NextResponse.json(pendencia, { status: 201 });
  } catch (error) {
    console.error("Error creating pendencia:", error);
    return NextResponse.json({ error: "Erro ao criar pendência" }, { status: 500 });
  }
}
