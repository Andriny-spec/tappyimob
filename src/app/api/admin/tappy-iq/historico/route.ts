import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ROLES_PERMITIDAS = new Set(["ADMIN", "SDR", "CORRETOR"]);

// GET → histórico de dossiês consultados, filtrável por usuário (ADMIN) e texto.
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!ROLES_PERMITIDAS.has(session.role)) {
    return NextResponse.json({ error: "Sem permissão para o Tappy IQ" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const isAdmin = session.role === "ADMIN";
  const filtroUser = searchParams.get("userId");
  const source = searchParams.get("source");
  const q = (searchParams.get("q") || "").trim();

  const where: any = { kind: "dossie" };
  // Não-admin só enxerga as próprias buscas; admin pode filtrar por usuário.
  if (!isAdmin) where.userId = session.id;
  else if (filtroUser) where.userId = filtroUser;
  if (source === "seekloc" || source === "ph3a") where.source = source;
  if (q) {
    where.OR = [
      { nome: { contains: q, mode: "insensitive" } },
      { documento: { contains: q } },
    ];
  }

  try {
    const [rows, usuarios] = await Promise.all([
      prisma.tappyIqBusca.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 100,
        select: {
          id: true, source: true, nome: true, documento: true,
          userName: true, userId: true, fromCache: true, createdAt: true,
        },
      }),
      // lista de usuários que já pesquisaram (para o filtro do admin)
      isAdmin
        ? prisma.tappyIqBusca.findMany({
            where: { kind: "dossie", userId: { not: null } },
            distinct: ["userId"],
            select: { userId: true, userName: true },
            orderBy: { userName: "asc" },
          })
        : Promise.resolve([]),
    ]);

    return NextResponse.json({ rows, usuarios, isAdmin });
  } catch (error: any) {
    console.error("[TAPPY_IQ/HISTORICO]", error);
    return NextResponse.json({ error: "Falha ao carregar o histórico" }, { status: 500 });
  }
}
