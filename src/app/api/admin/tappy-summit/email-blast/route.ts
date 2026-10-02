import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getResend } from "@/lib/resend";

const EVENT_SLUG = "tappy-summit-2026";
const FROM_EMAIL = "Tappy Summit <evento@tappyimob.com.br>";

function personalize(tpl: string, reg: {
  name: string;
  email: string;
  phone: string;
  type?: string | null;
  companyName?: string | null;
}): string {
  const firstName = reg.name.split(" ")[0];
  return tpl
    .replace(/\{nome\}/gi, firstName)
    .replace(/\{nome_completo\}/gi, reg.name)
    .replace(/\{email\}/gi, reg.email)
    .replace(/\{telefone\}/gi, reg.phone)
    .replace(/\{tipo\}/gi, reg.type === "AUTONOMO" ? "Autônomo" : reg.type === "IMOBILIARIA" ? "Imobiliária" : "")
    .replace(/\{imobiliaria\}/gi, reg.companyName || "");
}

/**
 * Worker em background: envia emails um a um atualizando o status
 * de cada recipient no banco. Dessa forma:
 * - UI pode fazer polling e mostrar progresso em tempo real
 * - Timeout do proxy não derruba o disparo
 * - Falhados ficam registrados com a mensagem de erro
 */
async function runEmailBlastJob(blastId: string, opts: {
  subject: string;
  htmlBody: string;
}) {
  const resend = getResend();
  const recipients = await prisma.eventBlastRecipient.findMany({
    where: { blastId, status: "pending" },
    orderBy: { createdAt: "asc" },
  });

  for (let i = 0; i < recipients.length; i++) {
    const rec = recipients[i];
    try {
      // Recarrega dados completos da inscrição pra poder personalizar
      const reg = rec.registrationId
        ? await prisma.eventRegistration.findUnique({
            where: { id: rec.registrationId },
            select: { name: true, email: true, phone: true, type: true, companyName: true },
          })
        : null;

      const regData = reg || { name: rec.name, email: rec.email, phone: rec.phone, type: null, companyName: null };

      const finalHtml = personalize(opts.htmlBody, regData);
      const finalSubject = personalize(opts.subject, regData);

      const { error: resendError } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [regData.email],
        subject: finalSubject,
        html: finalHtml,
      });
      if (resendError) {
        throw new Error(resendError.message || "Erro Resend");
      }

      await prisma.eventBlastRecipient.update({
        where: { id: rec.id },
        data: { status: "sent", sentAt: new Date(), error: null },
      });
      await prisma.eventBlast.update({
        where: { id: blastId },
        data: { sentCount: { increment: 1 } },
      });

      if (rec.registrationId) {
        await prisma.eventRegistration
          .update({ where: { id: rec.registrationId }, data: { emailSent: true } })
          .catch(() => {});
      }

      // Delay entre envios pra evitar marcação de spam
      if (i < recipients.length - 1) {
        await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1000));
      }
    } catch (err: any) {
      await prisma.eventBlastRecipient.update({
        where: { id: rec.id },
        data: { status: "failed", error: String(err?.message || err).slice(0, 500) },
      });
      await prisma.eventBlast.update({
        where: { id: blastId },
        data: { errorCount: { increment: 1 } },
      });
      console.error(`[EmailBlast][${blastId}] ❌ ${rec.email}:`, err?.message);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  await prisma.eventBlast.update({
    where: { id: blastId },
    data: { status: "completed", finishedAt: new Date() },
  });
  console.log(`[EmailBlast][${blastId}] ✅ concluído`);
}

// POST /api/admin/tappy-summit/email-blast
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { subject, htmlBody, testEmail, recipientIds } = body as {
      subject?: string;
      htmlBody?: string;
      testEmail?: string;
      recipientIds?: string[];
    };

    if (!subject || !htmlBody) {
      return NextResponse.json({ error: "Assunto e corpo do email são obrigatórios" }, { status: 400 });
    }

    // Modo teste: síncrono (um único envio, não precisa de job)
    if (testEmail) {
      const finalHtml = personalize(htmlBody, {
        name: "Usuário de Teste",
        email: testEmail,
        phone: "(11) 99999-9999",
        type: "AUTONOMO",
        companyName: "",
      });
      const finalSubject = personalize(subject, {
        name: "Usuário de Teste",
        email: testEmail,
        phone: "",
      });

      const { error: resendError } = await getResend().emails.send({
        from: FROM_EMAIL,
        to: [testEmail],
        subject: finalSubject,
        html: finalHtml,
      });
      if (resendError) {
        return NextResponse.json({ error: resendError.message || "Erro Resend" }, { status: 500 });
      }

      return NextResponse.json({ message: "Email de teste enviado", sent: 1, errors: 0, total: 1 });
    }

    // Modo blast: async com tracking por destinatário
    const registrations = await prisma.eventRegistration.findMany({
      where: {
        eventSlug: EVENT_SLUG,
        ...(recipientIds && recipientIds.length > 0 ? { id: { in: recipientIds } } : {}),
      },
      select: { id: true, name: true, email: true, phone: true },
    });

    if (registrations.length === 0) {
      return NextResponse.json({ error: "Nenhum inscrito encontrado" }, { status: 404 });
    }

    const blast = await prisma.eventBlast.create({
      data: {
        eventSlug: EVENT_SLUG,
        channel: "email",
        subject,
        message: htmlBody,
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
        email: r.email,
      })),
    });

    // Fire-and-forget do worker
    runEmailBlastJob(blast.id, { subject, htmlBody }).catch((err) => {
      console.error(`[EmailBlast][${blast.id}] fatal:`, err);
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
  } catch (error: any) {
    console.error("[EmailBlast] Erro:", error?.message);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
