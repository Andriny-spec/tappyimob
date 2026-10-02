import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { filterOwnedSessions } from "@/lib/waha";

const WAHA_API_URL = process.env.WAHA_API_URL || "http://waha-plus:3000";
const WAHA_API_KEY = process.env.WAHA_API_KEY || "";

// GET /api/admin/tappy-summit/waha-sessions - List available WAHA sessions
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const res = await fetch(`${WAHA_API_URL}/api/sessions`, {
      headers: { "X-Api-Key": WAHA_API_KEY },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`[WAHA] Error fetching sessions: ${res.status}`);
      return NextResponse.json({ sessions: [], error: `WAHA API error: ${res.status}` });
    }

    const allSessions = await res.json();
    // SÓ as sessões deste site — a instância WAHA é compartilhada com outros clientes.
    const sessions = filterOwnedSessions(allSessions);

    return NextResponse.json({
      sessions: sessions.map((s: any) => ({
        name: s.name,
        status: s.status,
        me: s.me,
      })),
    });
  } catch (error: any) {
    console.error("[WAHA] Error fetching sessions:", error?.message);
    return NextResponse.json({ sessions: [], error: error?.message });
  }
}
