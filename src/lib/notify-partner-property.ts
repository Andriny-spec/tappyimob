import { prisma } from "@/lib/prisma";
import { getResend, DEFAULT_FROM } from "@/lib/resend";
import { wahaClient } from "@/lib/waha";

const fmtBRL = (v: number | null | undefined) =>
  typeof v === "number" && v > 0
    ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
    : "—";

/**
 * Notifica os admins quando um parceiro externo submete um imóvel para aprovação.
 * Reaproveita o mesmo padrão de canais (painel / e-mail / WhatsApp) do notify-new-lead,
 * lendo a config "lead_notifications" do SystemConfig.
 */
export async function notifyPartnerPropertySubmission(propertyId: string) {
  try {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        code: true,
        title: true,
        address: true,
        number: true,
        neighborhood: true,
        city: true,
        price: true,
        rentPrice: true,
        towerName: true,
        partnerSubmittedById: true,
        condominium: { select: { name: true } },
      },
    });
    if (!property) return;

    const submitter = property.partnerSubmittedById
      ? await prisma.user.findUnique({
          where: { id: property.partnerSubmittedById },
          select: { name: true, email: true, phone: true },
        })
      : null;

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

    const condominio = property.condominium?.name || property.towerName || "—";
    const enderecoPartes = [property.address, property.number].filter(Boolean).join(", ");
    const endereco = [enderecoPartes, property.neighborhood, property.city].filter(Boolean).join(" — ") || "—";
    const valor = fmtBRL(property.price) !== "—" ? fmtBRL(property.price) : `${fmtBRL(property.rentPrice)}/mês`;
    const corretor = submitter?.name || "Parceiro externo";
    const link = `/admin/parcerias/imoveis?status=PENDENTE`;

    // 1. Painel
    if (channels.panel && admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          type: "partner_property",
          title: "Novo imóvel para aprovação",
          message: `${corretor} cadastrou ${property.code} (${condominio}) — ${valor}`,
          link,
          read: false,
        })),
      });
    }

    // 2. E-mail
    if (channels.email) {
      const adminEmails = admins.map((a) => a.email).filter(Boolean) as string[];
      if (adminEmails.length > 0) {
        try {
          await getResend().emails.send({
            from: DEFAULT_FROM,
            to: adminEmails,
            subject: `🏠 Imóvel para aprovação — ${condominio} (${corretor})`,
            html: buildEmailHtml({ condominio, endereco, valor, corretor, code: property.code }),
          });
        } catch (err) {
          console.error("[notify-partner-property] e-mail falhou:", err);
        }
      }
    }

    // 3. WhatsApp
    if (channels.whatsapp) {
      const wahaSession = cfg.wahaSession || process.env.WAHA_DEFAULT_SESSION || "Jake";
      const msg = buildWhatsAppMessage({ condominio, endereco, valor, corretor, code: property.code });

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

      let sessionPhone = "";
      try {
        const sess: any = await wahaClient.getSession(wahaSession);
        sessionPhone = (sess?.me?.id || "").replace(/@.*/, "").replace(/\D/g, "");
      } catch { /* ignora */ }

      for (const fullPhone of destinos) {
        if (sessionPhone && fullPhone === sessionPhone) continue;
        try {
          await wahaClient.sendMessage(wahaSession, `${fullPhone}@c.us`, msg);
        } catch (err) {
          console.error(`[notify-partner-property] WhatsApp falhou para ${fullPhone}:`, err instanceof Error ? err.message : err);
        }
      }
    }
  } catch (error) {
    console.error("[notify-partner-property] Erro geral:", error);
  }
}

interface MsgData {
  condominio: string;
  endereco: string;
  valor: string;
  corretor: string;
  code: string;
}

function buildWhatsAppMessage(d: MsgData): string {
  return [
    `🏠 *Novo imóvel para aprovação*`,
    ``,
    `🏢 *Condomínio:* ${d.condominio}`,
    `📍 *Endereço:* ${d.endereco}`,
    `💰 *Valor:* ${d.valor}`,
    `🤝 *Corretor parceiro:* ${d.corretor}`,
    `🔖 *Código:* ${d.code}`,
    ``,
    `📲 Acesse Parcerias › Cadastros de Imóveis para aprovar ou recusar.`,
  ].join("\n");
}

function buildEmailHtml(d: MsgData): string {
  const rows = [
    ["Condomínio", d.condominio],
    ["Endereço", d.endereco],
    ["Valor", d.valor],
    ["Corretor parceiro", d.corretor],
    ["Código", d.code],
  ]
    .map(
      (row) => `<tr>
        <td style="padding:8px 12px;font-weight:600;color:#374151;background:#f9fafb;border:1px solid #e5e7eb;white-space:nowrap">${row[0]}</td>
        <td style="padding:8px 12px;color:#111827;border:1px solid #e5e7eb">${row[1]}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
    <div style="background:#0B2545;padding:24px 32px">
      <h1 style="margin:0;color:#fff;font-size:20px">🏠 Imóvel aguardando aprovação</h1>
    </div>
    <div style="padding:24px 32px">
      <p style="margin:0 0 20px;color:#374151">Um parceiro externo cadastrou um imóvel que precisa da sua aprovação.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
      <div style="margin-top:24px">
        <a href="https://tappyimob.com.br/admin/parcerias/imoveis?status=PENDENTE" style="display:inline-block;padding:12px 24px;background:#0B2545;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">
          Revisar cadastro →
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
