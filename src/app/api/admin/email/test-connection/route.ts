import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDomains, getMailboxes } from "@/lib/mailcow";

// GET /api/admin/email/test-connection - Testa conexão com Mailcow
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const start = Date.now();
    const [domains, mailboxes] = await Promise.all([
      getDomains(),
      getMailboxes(),
    ]);
    const latency = Date.now() - start;

    return NextResponse.json({
      connected: true,
      latency,
      domains: domains.length,
      mailboxes: mailboxes.length,
      apiUrl: process.env.MAILCOW_API_URL || "https://mail.tappyimob.com.br",
    });
  } catch (error: any) {
    return NextResponse.json({
      connected: false,
      error: error.message || "Falha na conexão",
      apiUrl: process.env.MAILCOW_API_URL || "",
    });
  }
}
