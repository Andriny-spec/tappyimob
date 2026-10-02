import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getResend, DEFAULT_FROM } from "@/lib/resend";

// POST /api/admin/email/test-send - Envia email de teste via Resend
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { to, fromName, fromEmail } = body;

    if (!to) {
      return NextResponse.json(
        { error: "Campo obrigatório: to (email de destino)" },
        { status: 400 }
      );
    }

    const from = fromName && fromEmail
      ? `${fromName} <${fromEmail}>`
      : DEFAULT_FROM;

    const { data, error } = await getResend().emails.send({
      from,
      to: [to],
      subject: "Email de Teste - Tappy Imob",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #0B2545; color: white; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 20px;">Tappy Imob</h1>
            <p style="margin: 5px 0 0; opacity: 0.8; font-size: 13px;">Email de Teste</p>
          </div>
          <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="color: #374151; font-size: 14px; line-height: 1.6;">
              Este é um email de teste enviado pelo painel administrativo da Tappy Imob.
            </p>
            <p style="color: #374151; font-size: 14px; line-height: 1.6;">
              Se você recebeu este email, a configuração está funcionando corretamente via Resend.
            </p>
            <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 12px; margin-top: 16px;">
              <p style="color: #065f46; font-size: 13px; margin: 0;">
                <strong>Serviço:</strong> Resend API<br/>
                <strong>Remetente:</strong> ${fromEmail || "noreply@tappyimob.com.br"}<br/>
                <strong>Data:</strong> ${new Date().toLocaleString("pt-BR")}
              </p>
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Erro Resend:", error);
      return NextResponse.json(
        { error: error.message || "Erro ao enviar email de teste" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Email de teste enviado com sucesso!", id: data?.id });
  } catch (error: any) {
    console.error("Erro ao enviar email de teste:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao enviar email de teste" },
      { status: 500 }
    );
  }
}
