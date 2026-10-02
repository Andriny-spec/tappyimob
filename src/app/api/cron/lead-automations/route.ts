import { NextRequest, NextResponse } from "next/server";

// CRON endpoint para executar automações de leads
// Chamado a cada 1h pelo sistema de cron (vercel.json, pm2, etc)
export async function GET(request: NextRequest) {
  try {
    // Verificar token de segurança (opcional, para proteger a rota)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Chamar a API de execução de automações
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/admin/leads/automations/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...data,
    });
  } catch (error: any) {
    console.error("Erro no cron de automações de leads:", error);
    return NextResponse.json(
      { error: "Erro ao executar automações", details: error.message },
      { status: 500 }
    );
  }
}
