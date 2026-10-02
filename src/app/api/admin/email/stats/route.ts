import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getMailcowStatus, getDomains, getMailboxes, getDKIM } from "@/lib/mailcow";

// GET /api/admin/email/stats - Estatísticas gerais do email
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const status = await getMailcowStatus();

    return NextResponse.json(status);
  } catch (error: any) {
    console.error("Erro ao buscar stats:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
