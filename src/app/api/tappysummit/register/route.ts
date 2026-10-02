import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import nodemailer from "nodemailer";

const registerSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  phone: z.string().min(10, "Telefone inválido"),
  email: z.string().email("E-mail inválido"),
  type: z.enum(["AUTONOMO", "IMOBILIARIA"]),
  companyName: z.string().optional(),
  acceptedTerms: z.literal(true, { errorMap: () => ({ message: "Aceite os termos" }) }),
  acceptedPrivacy: z.literal(true, { errorMap: () => ({ message: "Aceite a política de privacidade" }) }),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});

const REGISTRATIONS_CLOSED = true;

export async function POST(req: NextRequest) {
  try {
    if (REGISTRATIONS_CLOSED) {
      return NextResponse.json(
        { error: "As inscrições para o Tappy Summit foram encerradas." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const data = registerSchema.parse(body);

    // Check if already registered
    const existing = await prisma.eventRegistration.findUnique({
      where: {
        email_eventSlug: {
          email: data.email,
          eventSlug: "tappy-summit-2026",
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Este e-mail já está inscrito no evento!" },
        { status: 409 }
      );
    }

    const registration = await prisma.eventRegistration.create({
      data: {
        eventSlug: "tappy-summit-2026",
        name: data.name,
        phone: data.phone.replace(/\D/g, ""),
        email: data.email.toLowerCase().trim(),
        type: data.type,
        companyName: data.companyName || null,
        acceptedTerms: data.acceptedTerms,
        acceptedPrivacy: data.acceptedPrivacy,
        utmSource: data.utmSource || null,
        utmMedium: data.utmMedium || null,
        utmCampaign: data.utmCampaign || null,
      },
    });

    // Fire-and-forget: send email, WhatsApp and schedule follow-ups in background
    // This avoids blocking the user response (~1 min wait)
    processRegistrationAsync(registration.id, data).catch((err) => {
      console.error(`[TappySummit] Erro no processamento async:`, err?.message || err);
    });

    return NextResponse.json({
      success: true,
      id: registration.id,
      message: "Inscrição realizada com sucesso!",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Error registering for event:", error);
    return NextResponse.json(
      { error: "Erro ao processar inscrição. Tente novamente." },
      { status: 500 }
    );
  }
}

// Background processing: email + WhatsApp + follow-ups (fire-and-forget)
async function processRegistrationAsync(
  registrationId: string,
  data: { name: string; phone: string; email: string; type: string; companyName?: string }
) {
  const config = await prisma.eventConfig.findUnique({
    where: { eventSlug: "tappy-summit-2026" },
  });

  // Send confirmation email via SMTP (Mailcow)
  if (config?.emailEnabled !== false) {
    try {
      const firstName = data.name.split(" ")[0];
      console.log(`[TappySummit] Enviando email SMTP para ${data.email}...`);

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "172.18.0.1",
        port: 587,
        secure: false,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        auth: {
          user: "evento@tappyimob.com.br",
          pass: process.env.SMTP_EVENTO_PASSWORD,
        },
      });

      const info = await transporter.sendMail({
        from: '"Tappy Summit" <evento@tappyimob.com.br>',
        to: data.email,
        subject: "Sua inscrição no Tappy Summit está confirmada! 🎉",
        html: buildConfirmationEmail(firstName),
      });
      console.log(`[TappySummit] Email enviado com sucesso: ${info.messageId}`);

      await prisma.eventRegistration.update({
        where: { id: registrationId },
        data: { emailSent: true },
      });
    } catch (emailError: any) {
      console.error(`[TappySummit] ERRO ao enviar email para ${data.email}:`, emailError?.message || emailError);
    }
  }

  // Send WhatsApp confirmation via WAHA
  if (config?.whatsappEnabled && config.whatsappSession) {
    try {
      const firstName = data.name.split(" ")[0];
      const phone = data.phone.replace(/\D/g, "");
      const chatId = `55${phone}@c.us`;
      const message = config.whatsappMessage
        .replace(/\{nome\}/gi, firstName)
        .replace(/\{nome_completo\}/gi, data.name)
        .replace(/\{email\}/gi, data.email)
        .replace(/\{telefone\}/gi, data.phone)
        .replace(/\{tipo\}/gi, data.type === "AUTONOMO" ? "Autônomo" : "Imobiliária")
        .replace(/\{imobiliaria\}/gi, data.companyName || "");

      const { wahaClient } = await import("@/lib/waha");
      await wahaClient.sendMessageSafe(config.whatsappSession, chatId, message);
      console.log(`[TappySummit] WhatsApp enviado (safe) para ${phone} via sessão ${config.whatsappSession}`);

      await prisma.eventRegistration.update({
        where: { id: registrationId },
        data: { whatsappSent: true },
      });
    } catch (whatsappError: any) {
      console.error(`[TappySummit] ERRO ao enviar WhatsApp:`, whatsappError?.message || whatsappError);
    }
  }

  // Schedule follow-ups
  try {
    const followUps = await prisma.eventFollowUp.findMany({
      where: { eventSlug: "tappy-summit-2026", active: true },
    });

    if (followUps.length > 0) {
      await prisma.eventFollowUpLog.createMany({
        data: followUps.map((fu) => ({
          followUpId: fu.id,
          registrationId: registrationId,
          scheduledFor: new Date(Date.now() + fu.delayHours * 60 * 60 * 1000),
        })),
        skipDuplicates: true,
      });
      console.log(`[TappySummit] ${followUps.length} follow-ups agendados para ${data.email}`);
    }
  } catch (fuError: any) {
    console.error(`[TappySummit] ERRO ao agendar follow-ups:`, fuError?.message);
  }
}

function buildConfirmationEmail(firstName: string): string {
  const WHATSAPP_GRUPO = "https://chat.whatsapp.com/E0roUUeG2h49g8rcUHIVA9";
  const INSTAGRAM = "https://www.instagram.com/tappyimob.parcerias";
  const WHATSAPP_ATENDIMENTO = "https://wa.me/5511973817808?text=Ol%C3%A1%21+Vim+pelo+e-mail+do+Tappy+Summit+e+gostaria+de+mais+informa%C3%A7%C3%B5es.+%F0%9F%98%8A";

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
    <body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">
            
            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#0B2545 0%,#0b1628 100%);padding:40px 32px;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:300;letter-spacing:2px;">TAPPY SUMMIT</h1>
                <p style="margin:8px 0 0;color:rgba(37, 211, 102,0.8);font-size:12px;letter-spacing:3px;text-transform:uppercase;">Parceiros 2026</p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:40px 32px;">
                <p style="color:#333;font-size:16px;line-height:1.8;margin:0 0 20px;">
                  Olá, <strong>${firstName}</strong>,
                </p>
                <p style="color:#333;font-size:16px;line-height:1.8;margin:0 0 20px;">
                  Sua inscrição no <strong>Tappy Summit Parceiros 2026</strong> está confirmada. Fico feliz em ter você com a gente nessa tarde.
                </p>
                <p style="color:#333;font-size:16px;line-height:1.8;margin:0 0 20px;">
                  Em breve, te contamos mais sobre o que preparamos. Vai valer cada minuto.
                </p>
                <p style="color:#333;font-size:16px;line-height:1.8;margin:0 0 32px;">
                  Tem demanda agora? Não precisa esperar o dia 23 — nosso canal está aberto para negócios hoje.
                </p>

                <!-- CTA Buttons -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                  <tr>
                    <td style="padding:6px 0;">
                      <a href="${WHATSAPP_GRUPO}" target="_blank" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:14px;font-weight:600;letter-spacing:0.5px;">
                        📱 Grupo de Parcerias (WhatsApp)
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;">
                      <a href="${INSTAGRAM}" target="_blank" style="display:inline-block;background:linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:14px;font-weight:600;letter-spacing:0.5px;">
                        📸 Instagram @tappyimob.parcerias
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;">
                      <a href="${WHATSAPP_ATENDIMENTO}" target="_blank" style="display:inline-block;background:#0B2545;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:14px;font-weight:600;letter-spacing:0.5px;">
                        💬 WhatsApp de Atendimento
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- Event Info -->
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;border-radius:8px;border:1px solid #e9ecef;">
                  <tr>
                    <td style="padding:20px 24px;">
                      <p style="margin:0 0 4px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:2px;">Detalhes do evento</p>
                      <p style="margin:0;color:#333;font-size:14px;line-height:2;">
                        📅 <strong>23 de Abril de 2026</strong> · Quinta-feira<br/>
                        📍 Hotel Blue Tree Premium Sua Cidade<br/>
                        🕐 Credenciamento a partir das 14h00
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f8f9fa;padding:24px 32px;text-align:center;border-top:1px solid #e9ecef;">
                <p style="margin:0;color:#999;font-size:12px;line-height:1.6;">
                  Tappy Imob · Sua Cidade, Barueri/SP<br/>
                  <a href="${INSTAGRAM}" style="color:#25D366;text-decoration:none;">@tappyimob.parcerias</a>
                </p>
              </td>
            </tr>

          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;
}

// GET - Count registrations (public counter)
export async function GET() {
  try {
    const count = await prisma.eventRegistration.count({
      where: { eventSlug: "tappy-summit-2026" },
    });
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
