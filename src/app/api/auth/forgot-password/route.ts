import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getResend, DEFAULT_FROM } from "@/lib/resend";
import crypto from "node:crypto";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://tappyimob.com.br";

export async function POST(request: NextRequest) {
  const { email } = await request.json().catch(() => ({ email: "" }));
  const normalized = String(email || "").trim().toLowerCase();

  // Resposta sempre genérica — não revela se o e-mail existe (evita enumeração).
  const genericOk = NextResponse.json({
    ok: true,
    message: "Se houver uma conta com este e-mail, enviaremos as instruções de redefinição.",
  });

  if (!normalized || !normalized.includes("@")) return genericOk;

  const user = await prisma.user.findUnique({
    where: { email: normalized },
    select: { id: true, name: true, email: true, isActive: true },
  });
  if (!user || !user.isActive) return genericOk;

  // Gera token aleatório; guarda só o hash. O token cru vai no link por e-mail.
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

  // Invalida tokens anteriores não usados deste usuário
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  });
  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  const link = `${APP_URL}/reset-password?token=${rawToken}`;

  try {
    await getResend().emails.send({
      from: DEFAULT_FROM,
      to: user.email,
      subject: "Redefinição de senha — Tappy Imob",
      html: `
        <div style="font-family: -apple-system, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <div style="background: linear-gradient(135deg, #0B2545, #081733); border-radius: 12px; padding: 24px; text-align: center;">
            <h1 style="color: #fff; font-size: 20px; margin: 0;">Tappy Imob</h1>
          </div>
          <div style="padding: 24px 8px;">
            <p style="color: #374151; font-size: 15px;">Olá, ${user.name?.split(" ")[0] || ""}.</p>
            <p style="color: #374151; font-size: 15px; line-height: 1.6;">
              Recebemos um pedido para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha. O link expira em <strong>1 hora</strong>.
            </p>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${link}" style="display: inline-block; background: #0B2545; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 15px;">
                Redefinir minha senha
              </a>
            </div>
            <p style="color: #6b7280; font-size: 13px; line-height: 1.6;">
              Se você não solicitou isto, ignore este e-mail — sua senha continua a mesma.
            </p>
            <p style="color: #9ca3af; font-size: 12px; word-break: break-all; margin-top: 16px;">
              Ou copie e cole este endereço no navegador:<br/>${link}
            </p>
          </div>
        </div>
      `,
    });
  } catch (e) {
    console.error("[forgot-password] Falha ao enviar e-mail:", e);
    // ainda retorna genérico — não vaza estado
  }

  return genericOk;
}
