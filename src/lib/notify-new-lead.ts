import { prisma } from "@/lib/prisma";
import { getResend, DEFAULT_FROM } from "@/lib/resend";
import { wahaClient } from "@/lib/waha";
import { sendPushToUser, sendPushToUsers } from "@/lib/push";

interface LeadNotifyData {
  leadId: string;
  leadName: string;
  leadPhone?: string | null;
  leadEmail?: string | null;
  source: string;
  propertyCode?: string | null;
  message?: string | null;
}

export async function notifyNewLead(data: LeadNotifyData) {
  try {
    const [admins, notifConfig] = await Promise.all([
      prisma.user.findMany({
        where: { role: "ADMIN", isActive: true },
        select: { id: true, phone: true, name: true, email: true },
      }),
      prisma.systemConfig.findUnique({ where: { key: "lead_notifications" } }),
    ]);

    const cfg = (notifConfig?.value as any) || {};
    const channels = { whatsapp: true, email: true, panel: true, ...cfg.channels };
    const dbExtraPhones: string[] = cfg.extraPhones || [];

    const sourceLabel = getSourceLabel(data.source);
    const propertyInfo = data.propertyCode ? ` — Imóvel ${data.propertyCode}` : "";

    // 1. Notificações internas no painel
    if (channels.panel) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          type: "new_lead",
          title: `Novo lead ${sourceLabel}`,
          message: `${data.leadName} entrou em contato${propertyInfo}`,
          link: `/admin/clientes/leads?search=${encodeURIComponent(data.leadName)}`,
          read: false,
        })),
      });
    }

    // 2. E-mail via Resend para todos os admins
    if (channels.email) {
      const adminEmails = admins.map((a) => a.email).filter(Boolean) as string[];
      if (adminEmails.length > 0) {
        try {
          await getResend().emails.send({
            from: DEFAULT_FROM,
            to: adminEmails,
            subject: `🔔 Novo lead ${sourceLabel} — ${data.leadName}`,
            html: buildEmailHtml(data, sourceLabel),
          });
        } catch (emailErr) {
          console.error("[notify-new-lead] Erro ao enviar e-mail:", emailErr);
        }
      }
    }

    // 3. WhatsApp via WAHA
    if (channels.whatsapp) {
    // Sessão configurada no painel tem prioridade sobre env var
    const wahaSession = cfg.wahaSession || process.env.WAHA_DEFAULT_SESSION || "Jake";
    const msg = buildWhatsAppMessage(data, sourceLabel);

    // Destinos: telefones dos admins + extras do env + extras salvos no painel
    const destinos = new Set<string>();
    for (const admin of admins) {
      if (!admin.phone) continue;
      const digits = admin.phone.replace(/\D/g, "");
      if (digits.length < 10) continue;
      destinos.add(digits.startsWith("55") ? digits : `55${digits}`);
    }
    for (const extra of (process.env.LEAD_NOTIFY_PHONES || "").split(",")) {
      const d = extra.replace(/\D/g, "");
      if (d.length >= 10) destinos.add(d.startsWith("55") ? d : `55${d}`);
    }
    for (const extra of dbExtraPhones) {
      const d = extra.replace(/\D/g, "");
      if (d.length >= 10) destinos.add(d.startsWith("55") ? d : `55${d}`);
    }

    // Número da própria sessão (não adianta enviar pra si mesmo)
    let sessionPhone = "";
    try {
      const sess: any = await wahaClient.getSession(wahaSession);
      sessionPhone = (sess?.me?.id || "").replace(/@.*/, "").replace(/\D/g, "");
    } catch { /* ignora */ }

    for (const fullPhone of destinos) {
      if (sessionPhone && fullPhone === sessionPhone) continue; // pula auto-envio
      try {
        await wahaClient.sendMessage(wahaSession, `${fullPhone}@c.us`, msg);
      } catch (waErr) {
        console.error(`[notify-new-lead] WhatsApp falhou para ${fullPhone} (sessão ${wahaSession}):`, waErr instanceof Error ? waErr.message : waErr);
      }
    }
    } // fim if (channels.whatsapp)

    // 3.5 Push notification no app (Bloco A.6) para os admins
    try {
      await sendPushToUsers(
        admins.map((a) => a.id),
        {
          title: `Novo lead ${sourceLabel}`,
          body: `${data.leadName} entrou em contato${propertyInfo}`,
          data: { type: "new_lead", leadId: data.leadId },
        }
      );
    } catch (pushErr) {
      console.error("[notify-new-lead] push para admins falhou:", pushErr);
    }

    // 4. Notificar corretor atribuído (se houver)
    const lead = await prisma.lead.findUnique({
      where: { id: data.leadId },
      select: { corretorId: true, corretor: { select: { id: true, phone: true, name: true, email: true } } },
    });

    if (lead?.corretor) {
      await prisma.notification.create({
        data: {
          userId: lead.corretor.id,
          type: "new_lead",
          title: "Novo lead atribuído a você",
          message: `${data.leadName} entrou em contato${propertyInfo}`,
          link: `/corretor/clientes?search=${encodeURIComponent(data.leadName)}`,
          read: false,
        },
      });

      // Push no app do corretor atribuído
      try {
        await sendPushToUser(lead.corretor.id, {
          title: "Novo lead atribuído a você",
          body: `${data.leadName} entrou em contato${propertyInfo}`,
          data: { type: "new_lead", leadId: data.leadId },
        });
      } catch (pushErr) {
        console.error("[notify-new-lead] push para corretor falhou:", pushErr);
      }

      // E-mail para corretor
      if (lead.corretor.email) {
        try {
          await getResend().emails.send({
            from: DEFAULT_FROM,
            to: lead.corretor.email,
            subject: `🔔 Lead atribuído a você — ${data.leadName}`,
            html: buildEmailHtml(data, sourceLabel, lead.corretor.name),
          });
        } catch {}
      }

      // WhatsApp para corretor
      if (lead.corretor.phone) {
        const digits = lead.corretor.phone.replace(/\D/g, "");
        if (digits.length >= 10) {
          const fullPhone = digits.startsWith("55") ? digits : `55${digits}`;
          try {
            await wahaClient.sendMessage(
              process.env.WAHA_DEFAULT_SESSION || "WhatsApp",
              `${fullPhone}@c.us`,
              buildWhatsAppMessage(data, sourceLabel)
            );
          } catch {}
        }
      }
    }
  } catch (error) {
    console.error("[notify-new-lead] Erro geral:", error);
  }
}

function buildWhatsAppMessage(data: LeadNotifyData, sourceLabel: string): string {
  const lines = [
    `🔔 *Novo Lead ${sourceLabel}*`,
    ``,
    `👤 *Nome:* ${data.leadName}`,
  ];
  if (data.leadPhone) lines.push(`📱 *Telefone:* ${data.leadPhone}`);
  if (data.leadEmail) lines.push(`📧 *Email:* ${data.leadEmail}`);
  if (data.propertyCode) lines.push(`🏠 *Imóvel:* ${data.propertyCode}`);
  if (data.message) {
    lines.push(``, `💬 *Mensagem:*`, data.message.substring(0, 300));
  }
  lines.push(``, `📲 Acesse o sistema para gerenciar este lead.`);
  return lines.join("\n");
}

function buildEmailHtml(data: LeadNotifyData, sourceLabel: string, recipientName?: string): string {
  const greeting = recipientName ? `Olá, ${recipientName}!` : "Olá!";
  const rows = [
    ["Nome", data.leadName],
    data.leadPhone ? ["Telefone", data.leadPhone] : null,
    data.leadEmail ? ["E-mail", data.leadEmail] : null,
    data.propertyCode ? ["Imóvel", data.propertyCode] : null,
    ["Origem", sourceLabel],
    data.message ? ["Mensagem", data.message.substring(0, 500)] : null,
  ]
    .filter(Boolean)
    .map(
      (row) => `<tr>
        <td style="padding:8px 12px;font-weight:600;color:#374151;background:#f9fafb;border:1px solid #e5e7eb;white-space:nowrap">${row![0]}</td>
        <td style="padding:8px 12px;color:#111827;border:1px solid #e5e7eb">${row![1]}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
    <div style="background:#0B2545;padding:24px 32px">
      <h1 style="margin:0;color:#fff;font-size:20px">🔔 Novo Lead ${sourceLabel}</h1>
    </div>
    <div style="padding:24px 32px">
      <p style="margin:0 0 20px;color:#374151">${greeting} Um novo lead chegou pelo site.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
      <div style="margin-top:24px">
        <a href="https://tappyimob.com.br/admin/clientes/leads" style="display:inline-block;padding:12px 24px;background:#0B2545;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">
          Ver no sistema →
        </a>
      </div>
    </div>
    <div style="padding:16px 32px;background:#f9fafb;color:#9ca3af;font-size:12px">
      Tappy Imob — notificação automática
    </div>
  </div>
</body>
</html>`;
}

function getSourceLabel(source: string): string {
  const labels: Record<string, string> = {
    SITE: "do Site",
    PORTAL: "do Portal",
    PRESENCIAL: "Presencial",
    INDICACAO: "por Indicação",
    FACEBOOK: "do Facebook",
    INSTAGRAM: "do Instagram",
    GOOGLE: "do Google",
    WHATSAPP: "do WhatsApp",
    TELEFONE: "por Telefone",
    EMAIL: "por Email",
    AVALIACAO: "— Avaliação de Imóvel 📋",
    CAPTACAO: "— Captação de Imóvel 🏠",
    RODIZIO: "via Rodízio",
    OFF_MARKET: "— Off Market 🔐",
    OUTRO: "",
  };
  return labels[source] || source;
}
