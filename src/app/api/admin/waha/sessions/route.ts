import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { wahaClient, filterOwnedSessions, namespacedSessionName } from "@/lib/waha";

const ROLES_PERMITIDAS = new Set(["ADMIN", "SDR", "CORRETOR"]);

// GET - Listar sessões do WAHA (SÓ as deste site — a instância é compartilhada)
export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (!ROLES_PERMITIDAS.has(session.role)) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const sessions = await wahaClient.getSessions();
    return NextResponse.json(filterOwnedSessions(sessions));
  } catch (error: any) {
    console.error("Error fetching WAHA sessions:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar sessões" },
      { status: 500 }
    );
  }
}

// POST - Criar nova sessão (nome é automaticamente namespaced a este site)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (!ROLES_PERMITIDAS.has(session.role)) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Nome da sessão é obrigatório" },
        { status: 400 }
      );
    }

    const scopedName = namespacedSessionName(name);
    const created = await wahaClient.createSession(scopedName);
    return NextResponse.json(created);
  } catch (error: any) {
    console.error("Error creating WAHA session:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao criar sessão" },
      { status: 500 }
    );
  }
}
