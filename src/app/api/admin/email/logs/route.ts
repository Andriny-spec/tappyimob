import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getMailLogs } from "@/lib/mailcow";

// GET /api/admin/email/logs - Logs de envio do Postfix
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const count = parseInt(searchParams.get("count") || "100");

    const logs = await getMailLogs(Math.min(count, 500));

    return NextResponse.json({ logs: Array.isArray(logs) ? logs : [], total: Array.isArray(logs) ? logs.length : 0 });
  } catch (error: any) {
    console.error("Erro ao buscar logs:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar logs de email" },
      { status: 500 }
    );
  }
}
