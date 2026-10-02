import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ROLES_PERMITIDAS = new Set(["ADMIN", "SDR", "CORRETOR"]);

// GET → reabre um dossiê já consultado (do cache/histórico), SEM nova cobrança.
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!ROLES_PERMITIDAS.has(session.role)) {
    return NextResponse.json({ error: "Sem permissão para o Tappy IQ" }, { status: 403 });
  }

  const { id } = await ctx.params;

  try {
    const row = await prisma.tappyIqBusca.findUnique({
      where: { id },
      select: { userId: true, source: true, nome: true, documento: true, resultado: true, createdAt: true },
    });
    if (!row) return NextResponse.json({ error: "Registro não encontrado" }, { status: 404 });

    // Não-admin só acessa as próprias buscas.
    if (session.role !== "ADMIN" && row.userId && row.userId !== session.id) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    return NextResponse.json({
      source: row.source,
      nome: row.nome,
      documento: row.documento,
      createdAt: row.createdAt,
      resultado: row.resultado, // { dossie, raw }
    });
  } catch (error: any) {
    console.error("[TAPPY_IQ/HISTORICO/ID]", error);
    return NextResponse.json({ error: "Falha ao carregar o registro" }, { status: 500 });
  }
}
