import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string; pid: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { pid } = await params;
    const body = await request.json();

    const data: any = { ...body };
    if (body.status === "RESOLVIDA") {
      data.resolvidoAt = new Date();
      data.resolvidoPorId = session.id;
    }

    const pendencia = await prisma.negocioPendencia.update({
      where: { id: pid },
      data,
    });

    return NextResponse.json(pendencia);
  } catch (error) {
    console.error("Error updating pendencia:", error);
    return NextResponse.json({ error: "Erro ao atualizar pendência" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { pid } = await params;
    await prisma.negocioPendencia.delete({ where: { id: pid } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting pendencia:", error);
    return NextResponse.json({ error: "Erro ao excluir pendência" }, { status: 500 });
  }
}
