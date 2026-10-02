import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const WAHA_API_URL = process.env.WAHA_API_URL || "http://waha-plus:3000";
const WAHA_API_KEY = process.env.WAHA_API_KEY || "";
const EVENT_SLUG = "tappy-summit-2026";

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10 || digits.length === 11) return `55${digits}@c.us`;
  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) return `${digits}@c.us`;
  return `${digits}@c.us`;
}

async function wahaSilent(path: string, body: object): Promise<void> {
  try {
    await fetch(`${WAHA_API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Api-Key": WAHA_API_KEY },
      body: JSON.stringify(body),
    });
  } catch {
    // silent — anti-ban steps are best-effort, never block the send
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function sendImage(
  sessionName: string,
  chatId: string,
  mediaUrl: string,
  mediaMimeType: string,
  caption: string
): Promise<void> {
  const mimetype = mediaMimeType || "image/jpeg";
  const res = await fetch(`${WAHA_API_URL}/api/sendImage`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Api-Key": WAHA_API_KEY },
    body: JSON.stringify({
      session: sessionName,
      chatId,
      file: { mimetype, url: mediaUrl },
      caption,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WAHA sendImage ${res.status}: ${err}`);
  }
}

async function sendVideo(
  sessionName: string,
  chatId: string,
  mediaUrl: string,
  mediaMimeType: string,
  caption: string
): Promise<void> {
  const mimetype = mediaMimeType || "video/mp4";
  const res = await fetch(`${WAHA_API_URL}/api/sendVideo`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Api-Key": WAHA_API_KEY },
    body: JSON.stringify({
      session: sessionName,
      chatId,
      file: { mimetype, url: mediaUrl },
      caption,
      convert: true,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WAHA sendVideo ${res.status}: ${err}`);
  }
}

async function sendVoice(
  sessionName: string,
  chatId: string,
  voiceUrl: string,
  voiceMimeType: string
): Promise<void> {
  const mimetype = voiceMimeType || "audio/ogg; codecs=opus";
  const res = await fetch(`${WAHA_API_URL}/api/sendVoice`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Api-Key": WAHA_API_KEY },
    body: JSON.stringify({
      session: sessionName,
      chatId,
      file: { mimetype, url: voiceUrl },
      convert: true,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WAHA sendVoice ${res.status}: ${err}`);
  }
}

async function sendMessageAntiBan(
  sessionName: string,
  chatId: string,
  text: string
): Promise<void> {
  await wahaSilent("/api/sendSeen", { session: sessionName, chatId });
  await wahaSilent("/api/startTyping", { session: sessionName, chatId });

  const baseDelay = 1500;
  const charDelay = text.length * 40;
  const randomDelay = Math.random() * 1500;
  const typingDelay = Math.min(baseDelay + charDelay + randomDelay, 8000);
  await sleep(typingDelay);

  await wahaSilent("/api/stopTyping", { session: sessionName, chatId });

  const res = await fetch(`${WAHA_API_URL}/api/sendText`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Api-Key": WAHA_API_KEY },
    body: JSON.stringify({ session: sessionName, chatId, text }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WAHA sendText ${res.status}: ${err}`);
  }
}

/**
 * Background worker — dispatches all recipients of a blast job, updating
 * each recipient's status in DB as it goes. Runs async (fire-and-forget)
 * so the HTTP response can return immediately and avoid proxy timeouts.
 */
async function runBlastJob(blastId: string, opts: {
  sessionName: string;
  message: string;
  delayMs: number;
  voiceUrl?: string;
  voiceMimeType?: string;
  voiceFirst: boolean;
  mediaUrl?: string;
  mediaType?: string;
  mediaMimeType?: string;
}) {
  const recipients = await prisma.eventBlastRecipient.findMany({
    where: { blastId, status: "pending" },
    orderBy: { createdAt: "asc" },
  });

  let sent = 0;
  let errors = 0;

  for (let i = 0; i < recipients.length; i++) {
    const rec = recipients[i];
    try {
      const chatId = formatPhone(rec.phone);
      const firstName = rec.name.trim().split(" ")[0];
      const text = opts.message
        .replace(/\{nome\}/gi, firstName)
        .replace(/\{nome_completo\}/gi, rec.name)
        .replace(/\{telefone\}/gi, rec.phone);

      const sendTextOrMedia = async () => {
        if (opts.mediaUrl && opts.mediaType === "image") {
          await sendImage(opts.sessionName, chatId, opts.mediaUrl, opts.mediaMimeType || "", text);
        } else if (opts.mediaUrl && opts.mediaType === "video") {
          await sendVideo(opts.sessionName, chatId, opts.mediaUrl, opts.mediaMimeType || "", text);
        } else {
          await sendMessageAntiBan(opts.sessionName, chatId, text);
        }
      };

      const sendVoiceStep = async () => {
        await sendVoice(opts.sessionName, chatId, opts.voiceUrl!, opts.voiceMimeType || "");
      };

      if (opts.voiceUrl && opts.voiceFirst) {
        await sendVoiceStep();
        await sleep(1200 + Math.random() * 800);
        await sendTextOrMedia();
      } else if (opts.voiceUrl) {
        await sendTextOrMedia();
        await sleep(1200 + Math.random() * 800);
        await sendVoiceStep();
      } else {
        await sendTextOrMedia();
      }

      sent++;
      await prisma.eventBlastRecipient.update({
        where: { id: rec.id },
        data: { status: "sent", sentAt: new Date(), error: null },
      });
      await prisma.eventBlast.update({
        where: { id: blastId },
        data: { sentCount: { increment: 1 } },
      });

      // Atualiza flag rápida no EventRegistration pra compatibilidade com a aba Inscritos
      if (rec.registrationId) {
        await prisma.eventRegistration
          .update({ where: { id: rec.registrationId }, data: { whatsappSent: true } })
          .catch(() => {});
      }

      if (i < recipients.length - 1) {
        const gap = opts.delayMs + Math.random() * 2000;
        await sleep(gap);
      }
    } catch (err: any) {
      errors++;
      await prisma.eventBlastRecipient.update({
        where: { id: rec.id },
        data: { status: "failed", error: String(err?.message || err).slice(0, 500) },
      });
      await prisma.eventBlast.update({
        where: { id: blastId },
        data: { errorCount: { increment: 1 } },
      });
      console.error(`[WhatsBlast][${blastId}] ❌ ${rec.phone}:`, err?.message);
      await sleep(2000);
    }
  }

  await prisma.eventBlast.update({
    where: { id: blastId },
    data: { status: "completed", finishedAt: new Date() },
  });
  console.log(`[WhatsBlast][${blastId}] ✅ concluído: ${sent} enviados, ${errors} erros`);
}

// POST /api/admin/tappy-summit/whatsapp-blast
// Cria o blast + recipients (pending) e dispara o worker em background.
// Retorna imediatamente com o blastId pra UI acompanhar o progresso.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      sessionName,
      message,
      recipientIds,
      sendToAll,
      delayMs = 4000,
      voiceUrl,
      voiceMimeType,
      voiceFirst = false,
      mediaUrl,
      mediaType,
      mediaMimeType,
      testPhone,
    } = body;

    if (!sessionName || !message) {
      return NextResponse.json({ error: "Sessão e mensagem são obrigatórios" }, { status: 400 });
    }

    // Lista de destinatários
    let registrations: { id: string | null; name: string; phone: string }[];
    if (testPhone && typeof testPhone === "string") {
      registrations = [{ id: null, name: "Teste", phone: testPhone }];
    } else {
      const where: any = { eventSlug: EVENT_SLUG };
      if (!sendToAll && recipientIds?.length > 0) {
        where.id = { in: recipientIds };
      }
      const regs = await prisma.eventRegistration.findMany({
        where,
        select: { id: true, name: true, phone: true },
      });
      registrations = regs.map((r) => ({ id: r.id, name: r.name, phone: r.phone }));
    }

    if (registrations.length === 0) {
      return NextResponse.json({ error: "Nenhum destinatário encontrado" }, { status: 404 });
    }

    // Cria o job + recipients (pending)
    const blast = await prisma.eventBlast.create({
      data: {
        eventSlug: EVENT_SLUG,
        sessionName,
        message,
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || null,
        voiceUrl: voiceUrl || null,
        voiceFirst,
        delayMs,
        totalRecipients: registrations.length,
        createdById: session.id,
        createdByName: session.name,
      },
    });

    await prisma.eventBlastRecipient.createMany({
      data: registrations.map((r) => ({
        blastId: blast.id,
        registrationId: r.id,
        name: r.name,
        phone: r.phone,
      })),
    });

    // Dispara worker em background (fire-and-forget). Next.js/serverless
    // costuma matar promessas após o response — em Node/standalone (produção
    // atual) roda até o fim.
    runBlastJob(blast.id, {
      sessionName,
      message,
      delayMs,
      voiceUrl,
      voiceMimeType,
      voiceFirst,
      mediaUrl,
      mediaType,
      mediaMimeType,
    }).catch((err) => {
      console.error(`[WhatsBlast][${blast.id}] fatal:`, err);
      prisma.eventBlast
        .update({
          where: { id: blast.id },
          data: { status: "failed", finishedAt: new Date() },
        })
        .catch(() => {});
    });

    return NextResponse.json({
      message: "Disparo iniciado",
      blastId: blast.id,
      total: registrations.length,
    });
  } catch (err: any) {
    console.error("[WhatsBlast] Erro:", err?.message);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
