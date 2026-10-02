import { prisma } from "@/lib/prisma";
import { getResend, DEFAULT_FROM } from "@/lib/resend";

const BASE_URL = "https://tappyimob.com.br";

const FASE_LABELS: Record<string, string> = {
  DADOS_RECEBIDOS: "Dados recebidos",
  VALIDACAO_INTERNA: "Validação interna",
  PENDENTE_DOC: "Pendente documentos",
  EXTRACAO_IA: "Extração IA",
  VALIDACAO_PARTES: "Validação das partes",
  REVISAO_JURIDICA: "Revisão jurídica",
  MINUTA_GERADA: "Minuta gerada",
  PRONTO_ASSINATURA: "Pronto para assinatura",
};

async function getAdmins() {
  return prisma.user.findMany({
    where: { role: "ADMIN", isActive: true },
    select: { id: true, name: true, email: true },
  });
}

// Negocio submetido pelo corretor → notifica admins
export async function notifyNegocioSubmetido(negocioId: string, negocioCodigo: string, corretorNome: string) {
  try {
    const admins = await getAdmins();
    const link = `${BASE_URL}/admin/negocio/${negocioId}`;
    const adminLink = `/admin/negocio/${negocioId}`;

    await prisma.notification.createMany({
      data: admins.map((a) => ({
        userId: a.id,
        type: "negocio_submetido",
        title: `Novo negócio recebido`,
        message: `${negocioCodigo} enviado por ${corretorNome}`,
        link: adminLink,
        read: false,
      })),
    });

    const adminEmails = admins.map((a) => a.email).filter(Boolean) as string[];
    if (adminEmails.length > 0) {
      await getResend().emails.send({
        from: DEFAULT_FROM,
        to: adminEmails,
        subject: `📋 Novo negócio recebido — ${negocioCodigo}`,
        html: buildEmailBase(
          `Novo negócio: ${negocioCodigo}`,
          `O corretor <strong>${corretorNome}</strong> enviou um novo negócio para análise jurídica.`,
          [["Código", negocioCodigo], ["Corretor", corretorNome], ["Status", "Aguardando validação interna"]],
          link,
          "Ver negócio no sistema →"
        ),
      }).catch((e) => console.error("[notify-negocio] email error:", e));
    }
  } catch (err) {
    console.error("[notify-negocio] notifyNegocioSubmetido:", err);
  }
}

// Negocio avançou para revisão jurídica → notifica admins
export async function notifyFaseRevisaoJuridica(negocioId: string, negocioCodigo: string) {
  try {
    const admins = await getAdmins();
    const link = `${BASE_URL}/admin/negocio/${negocioId}`;
    const adminLink = `/admin/negocio/${negocioId}`;

    await prisma.notification.createMany({
      data: admins.map((a) => ({
        userId: a.id,
        type: "negocio_revisao",
        title: "Negócio em revisão jurídica",
        message: `${negocioCodigo} está aguardando revisão e geração de minuta`,
        link: adminLink,
        read: false,
      })),
    });

    const adminEmails = admins.map((a) => a.email).filter(Boolean) as string[];
    if (adminEmails.length > 0) {
      await getResend().emails.send({
        from: DEFAULT_FROM,
        to: adminEmails,
        subject: `⚖️ Negócio pronto para revisão jurídica — ${negocioCodigo}`,
        html: buildEmailBase(
          `Revisão jurídica pendente`,
          `O negócio <strong>${negocioCodigo}</strong> avançou para a fase de revisão jurídica e está aguardando geração de minuta.`,
          [["Código", negocioCodigo], ["Fase", FASE_LABELS.REVISAO_JURIDICA]],
          link,
          "Revisar e gerar minuta →"
        ),
      }).catch((e) => console.error("[notify-negocio] email error:", e));
    }
  } catch (err) {
    console.error("[notify-negocio] notifyFaseRevisaoJuridica:", err);
  }
}

// Negocio editado após envio → notifica admins + corretor responsável
export async function notifyNegocioEditado(
  negocioId: string,
  negocioCodigo: string,
  editadoPorNome: string,
  editadoPorRole: string,
  corretorId: string | null,
  campos: string[]
) {
  try {
    const admins = await getAdmins();
    const adminLink = `/admin/negocio/${negocioId}`;
    const camposStr = campos.slice(0, 5).join(", ") + (campos.length > 5 ? ` +${campos.length - 5}` : "");

    // Notify admins (if edited by non-admin)
    if (editadoPorRole !== "ADMIN") {
      await prisma.notification.createMany({
        data: admins.map((a) => ({
          userId: a.id,
          type: "negocio_editado",
          title: "Negócio editado após envio",
          message: `${negocioCodigo} foi alterado por ${editadoPorNome} (${camposStr})`,
          link: adminLink,
          read: false,
        })),
      });
    }

    // Notify corretor (if edited by admin)
    if (editadoPorRole === "ADMIN" && corretorId) {
      const corretor = await prisma.user.findUnique({ where: { id: corretorId }, select: { id: true, name: true, email: true } });
      if (corretor) {
        await prisma.notification.create({
          data: {
            userId: corretor.id,
            type: "negocio_editado",
            title: "Negócio atualizado pela equipe",
            message: `${negocioCodigo} foi atualizado pelo jurídico (${camposStr})`,
            link: `/admin/negocio/${negocioId}`,
            read: false,
          },
        });

        if (corretor.email) {
          const link = `${BASE_URL}/admin/negocio/${negocioId}`;
          await getResend().emails.send({
            from: DEFAULT_FROM,
            to: corretor.email,
            subject: `📝 Atualização no negócio ${negocioCodigo}`,
            html: buildEmailBase(
              `Negócio atualizado`,
              `Sua equipe jurídica fez uma atualização no negócio <strong>${negocioCodigo}</strong>.`,
              [["Código", negocioCodigo], ["Campos alterados", camposStr], ["Por", editadoPorNome]],
              link,
              "Ver detalhes →"
            ),
          }).catch((e) => console.error("[notify-negocio] email error:", e));
        }
      }
    }
  } catch (err) {
    console.error("[notify-negocio] notifyNegocioEditado:", err);
  }
}

// Minuta gerada → notifica corretor
export async function notifyMinutaGerada(negocioId: string, negocioCodigo: string, corretorId: string | null) {
  try {
    if (!corretorId) return;

    const corretor = await prisma.user.findUnique({ where: { id: corretorId }, select: { id: true, name: true, email: true } });
    if (!corretor) return;

    await prisma.notification.create({
      data: {
        userId: corretor.id,
        type: "minuta_gerada",
        title: "Minuta disponível",
        message: `A minuta do negócio ${negocioCodigo} foi gerada`,
        link: `/admin/negocio/${negocioId}`,
        read: false,
      },
    });

    if (corretor.email) {
      const link = `${BASE_URL}/admin/negocio/${negocioId}`;
      await getResend().emails.send({
        from: DEFAULT_FROM,
        to: corretor.email,
        subject: `✅ Minuta pronta — ${negocioCodigo}`,
        html: buildEmailBase(
          `Minuta gerada`,
          `A minuta do negócio <strong>${negocioCodigo}</strong> foi gerada com sucesso e está disponível para download.`,
          [["Código", negocioCodigo], ["Status", FASE_LABELS.MINUTA_GERADA]],
          link,
          "Ver e baixar minuta →"
        ),
      }).catch((e) => console.error("[notify-negocio] email error:", e));
    }
  } catch (err) {
    console.error("[notify-negocio] notifyMinutaGerada:", err);
  }
}

function buildEmailBase(
  titulo: string,
  intro: string,
  campos: [string, string][],
  ctaLink: string,
  ctaLabel: string
): string {
  const rows = campos.map(([k, v]) => `
    <tr>
      <td style="padding:8px 12px;font-weight:600;color:#374151;background:#f9fafb;border:1px solid #e5e7eb;white-space:nowrap">${k}</td>
      <td style="padding:8px 12px;color:#111827;border:1px solid #e5e7eb">${v}</td>
    </tr>`).join("");

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
    <div style="background:#1e40af;padding:24px 32px">
      <h1 style="margin:0;color:#fff;font-size:18px">⚖️ Sistema Jurídico Tappy</h1>
      <p style="margin:6px 0 0;color:#bfdbfe;font-size:14px">${titulo}</p>
    </div>
    <div style="padding:24px 32px">
      <p style="margin:0 0 20px;color:#374151;line-height:1.6">${intro}</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
      <div style="margin-top:24px">
        <a href="${ctaLink}" style="display:inline-block;padding:12px 24px;background:#1e40af;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px">
          ${ctaLabel}
        </a>
      </div>
    </div>
    <div style="padding:16px 32px;background:#f9fafb;color:#9ca3af;font-size:12px">
      Tappy Imob — Sistema Jurídico — notificação automática
    </div>
  </div>
</body>
</html>`;
}
