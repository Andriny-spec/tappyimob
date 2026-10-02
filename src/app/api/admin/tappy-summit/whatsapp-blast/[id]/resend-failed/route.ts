import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// POST /api/admin/tappy-summit/whatsapp-blast/:id/resend-failed
// Cria um novo blast apenas com os destinatários que falharam no blast original
// e redireciona pra chamada do disparo normal.
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const original = await prisma.eventBlast.findUnique({
    where: { id },
    include: {
      recipients: { where: { status: "failed" } },
    },
  });

  if (!original) {
    return NextResponse.json({ error: "Disparo original não encontrado" }, { status: 404 });
  }
  if (original.recipients.length === 0) {
    return NextResponse.json({ error: "Nenhum destinatário falhado para reenviar" }, { status: 400 });
  }

  // Chama a rota de blast principal com recipientIds=os que falharam (por registrationId)
  const recipientIds = original.recipients
    .map((r) => r.registrationId)
    .filter((x): x is string => !!x);

  if (recipientIds.length === 0) {
    return NextResponse.json({ error: "Destinatários falhados sem vínculo válido" }, { status: 400 });
  }

  const headers = {
    "Content-Type": "application/json",
    cookie: req.headers.get("cookie") || "",
  };

  if (original.channel === "email") {
    const url = new URL("/api/admin/tappy-summit/email-blast", req.url);
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        subject: original.subject || "",
        htmlBody: original.message,
        recipientIds,
      }),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  }

  const url = new URL("/api/admin/tappy-summit/whatsapp-blast", req.url);
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      sessionName: original.sessionName,
      message: original.message,
      recipientIds,
      sendToAll: false,
      delayMs: original.delayMs,
      mediaUrl: original.mediaUrl || undefined,
      mediaType: original.mediaType || undefined,
      voiceUrl: original.voiceUrl || undefined,
      voiceFirst: original.voiceFirst,
    }),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
