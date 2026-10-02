import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { wahaClient, isOwnedSession } from "@/lib/waha";

const ROLES_PERMITIDAS = new Set(["ADMIN", "SDR", "CORRETOR"]);

async function guard(): Promise<NextResponse | null> {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!ROLES_PERMITIDAS.has(session.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }
  return null;
}

// GET - Buscar sessão específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const denied = await guard();
  if (denied) return denied;

  try {
    const { sessionId } = await params;
    if (!isOwnedSession(sessionId)) {
      return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 });
    }
    const session = await wahaClient.getSession(sessionId);
    return NextResponse.json(session);
  } catch (error: any) {
    console.error("Error fetching WAHA session:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar sessão" },
      { status: 500 }
    );
  }
}

// POST - Logout da sessão (desconecta mas mantém a sessão)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const denied = await guard();
  if (denied) return denied;

  try {
    const { sessionId } = await params;
    if (!isOwnedSession(sessionId)) {
      return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const action = body.action || "logout";

    if (action === "logout") {
      await wahaClient.logoutSession(sessionId);
      return NextResponse.json({ success: true, action: "logout" });
    } else if (action === "stop") {
      await wahaClient.stopSession(sessionId);
      return NextResponse.json({ success: true, action: "stop" });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error: any) {
    console.error("Error with WAHA session action:", error);
    return NextResponse.json(
      { error: error.message || "Erro na ação da sessão" },
      { status: 500 }
    );
  }
}

// DELETE - Deletar sessão
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const denied = await guard();
  if (denied) return denied;

  try {
    const { sessionId } = await params;
    if (!isOwnedSession(sessionId)) {
      return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 });
    }
    await wahaClient.deleteSession(sessionId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting WAHA session:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao deletar sessão" },
      { status: 500 }
    );
  }
}
