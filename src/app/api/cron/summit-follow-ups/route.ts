import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { wahaClient } from "@/lib/waha";
import nodemailer from "nodemailer";

const EVENT_SLUG = "tappy-summit-2026";
const CRON_SECRET = process.env.CRON_SECRET || "summit-cron-2026";

// GET /api/cron/summit-follow-ups - Process pending follow-ups
// Called by external cron or internal setInterval
export async function GET(req: NextRequest) {
  // Simple auth via query param or header
  const secret = req.nextUrl.searchParams.get("secret") || req.headers.get("x-cron-secret");
  if (secret !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const config = await prisma.eventConfig.findUnique({
      where: { eventSlug: EVENT_SLUG },
    });

    if (!config) {
      return NextResponse.json({ message: "No config found", processed: 0 });
    }

    // Find pending follow-up logs where scheduledFor <= now
    const pendingLogs = await prisma.eventFollowUpLog.findMany({
      where: {
        scheduledFor: { lte: new Date() },
        OR: [
          { whatsappSent: false },
          { emailSent: false },
        ],
        followUp: {
          active: true,
          eventSlug: EVENT_SLUG,
        },
      },
      include: {
        followUp: true,
        registration: true,
      },
      orderBy: { scheduledFor: "asc" },
      take: 20, // Process in batches to avoid timeouts
    });

    if (pendingLogs.length === 0) {
      return NextResponse.json({ message: "No pending follow-ups", processed: 0 });
    }

    let whatsappSent = 0;
    let emailsSent = 0;
    let errors = 0;

    for (const log of pendingLogs) {
      const { followUp, registration } = log;
      const firstName = registration.name.split(" ")[0];
      const updateData: any = {};

      // Send WhatsApp if enabled and not yet sent
      if (followUp.whatsappEnabled && !log.whatsappSent && config.whatsappEnabled && config.whatsappSession) {
        try {
          const phone = registration.phone.replace(/\D/g, "");
          const chatId = `55${phone}@c.us`;
          const message = followUp.whatsappMessage
            .replace(/\{nome\}/gi, firstName)
            .replace(/\{nome_completo\}/gi, registration.name)
            .replace(/\{email\}/gi, registration.email)
            .replace(/\{telefone\}/gi, registration.phone)
            .replace(/\{tipo\}/gi, registration.type === "AUTONOMO" ? "Autônomo" : "Imobiliária")
            .replace(/\{imobiliaria\}/gi, registration.companyName || "");

          // Send media first if configured
          if (followUp.whatsappMediaUrl && followUp.whatsappMediaType) {
            const mediaType = followUp.whatsappMediaType as "image" | "audio" | "video" | "document";
            const caption = mediaType !== "audio" ? message : undefined;
            await wahaClient.sendMediaSafe(config.whatsappSession, chatId, followUp.whatsappMediaUrl, mediaType, caption);
            // If media has caption, skip text. If audio (no caption), send text after
            if (mediaType === "audio" && message) {
              await new Promise((r) => setTimeout(r, 1500 + Math.random() * 2000));
              await wahaClient.sendMessageSafe(config.whatsappSession, chatId, message);
            }
          } else {
            await wahaClient.sendMessageSafe(config.whatsappSession, chatId, message);
          }
          updateData.whatsappSent = true;
          updateData.whatsappSentAt = new Date();
          whatsappSent++;
          console.log(`[FollowUp] WhatsApp "${followUp.name}" enviado para ${phone}`);

          // Anti-ban: delay between sends (3-8 seconds random)
          await new Promise((r) => setTimeout(r, 3000 + Math.random() * 5000));
        } catch (err: any) {
          console.error(`[FollowUp] ERRO WhatsApp "${followUp.name}" para ${registration.phone}:`, err?.message);
          updateData.error = (updateData.error || "") + `WhatsApp: ${err?.message}\n`;
          errors++;
        }
      } else if (!followUp.whatsappEnabled || !config.whatsappEnabled) {
        updateData.whatsappSent = true; // Mark as "sent" (skipped) if disabled
      }

      // Send Email if enabled and not yet sent
      if (followUp.emailEnabled && !log.emailSent && config.emailEnabled) {
        try {
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

          const emailBody = followUp.emailBody
            .replace(/\{nome\}/gi, firstName)
            .replace(/\{nome_completo\}/gi, registration.name)
            .replace(/\{email\}/gi, registration.email)
            .replace(/\{telefone\}/gi, registration.phone)
            .replace(/\{tipo\}/gi, registration.type === "AUTONOMO" ? "Autônomo" : "Imobiliária")
            .replace(/\{imobiliaria\}/gi, registration.companyName || "");

          const subject = followUp.emailSubject
            .replace(/\{nome\}/gi, firstName)
            .replace(/\{nome_completo\}/gi, registration.name);

          await transporter.sendMail({
            from: '"Tappy Summit" <evento@tappyimob.com.br>',
            to: registration.email,
            subject,
            html: emailBody,
          });

          updateData.emailSent = true;
          updateData.emailSentAt = new Date();
          emailsSent++;
          console.log(`[FollowUp] Email "${followUp.name}" enviado para ${registration.email}`);
        } catch (err: any) {
          console.error(`[FollowUp] ERRO Email "${followUp.name}" para ${registration.email}:`, err?.message);
          updateData.error = (updateData.error || "") + `Email: ${err?.message}\n`;
          errors++;
        }
      } else if (!followUp.emailEnabled || !config.emailEnabled) {
        updateData.emailSent = true; // Mark as "sent" (skipped) if disabled
      }

      // Update log
      if (Object.keys(updateData).length > 0) {
        await prisma.eventFollowUpLog.update({
          where: { id: log.id },
          data: updateData,
        });
      }
    }

    return NextResponse.json({
      message: "Follow-ups processed",
      processed: pendingLogs.length,
      whatsappSent,
      emailsSent,
      errors,
    });
  } catch (error: any) {
    console.error("[FollowUp] ERRO no cron:", error?.message);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
