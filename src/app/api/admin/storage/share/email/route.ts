import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getResend, DEFAULT_FROM } from "@/lib/resend";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { type, id, emails, message } = body;

    if (!type || !id || !emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: "type, id e emails são obrigatórios" }, { status: 400 });
    }

    // Validate emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails = emails.filter((e: string) => emailRegex.test(e.trim()));
    if (validEmails.length === 0) {
      return NextResponse.json({ error: "Nenhum e-mail válido" }, { status: 400 });
    }

    // Get or create share link
    let shareToken: string | null = null;
    let itemName = "";

    if (type === "folder") {
      const folder = await prisma.storageFolder.findUnique({
        where: { id },
        select: { id: true, name: true, shareToken: true },
      });
      if (!folder) {
        return NextResponse.json({ error: "Pasta não encontrada" }, { status: 404 });
      }
      itemName = folder.name;
      if (folder.shareToken) {
        shareToken = folder.shareToken;
      } else {
        shareToken = crypto.randomBytes(32).toString("hex");
        await prisma.storageFolder.update({
          where: { id },
          data: { shareToken },
        });
      }
    } else if (type === "file") {
      const file = await prisma.storageFile.findUnique({
        where: { id },
        select: { id: true, name: true, shareToken: true },
      });
      if (!file) {
        return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
      }
      itemName = file.name;
      if (file.shareToken) {
        shareToken = file.shareToken;
      } else {
        shareToken = crypto.randomBytes(32).toString("hex");
        await prisma.storageFile.update({
          where: { id },
          data: { shareToken },
        });
      }
    } else {
      return NextResponse.json({ error: "type inválido" }, { status: 400 });
    }

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://tappyimob.com.br"}/compartilhado/${shareToken}`;
    const senderName = session.name || "Equipe Tappy Imob";

    const resend = getResend();
    const sent: string[] = [];
    const failed: string[] = [];

    for (const email of validEmails) {
      try {
        await resend.emails.send({
          from: DEFAULT_FROM,
          to: email.trim(),
          subject: `${senderName} compartilhou "${itemName}" com você`,
          html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: 'Segoe UI', sans-serif; background: #f4f5f7; padding: 40px 20px;">
  <div style="max-width: 520px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
    <div style="background: #0B2545; padding: 24px 30px;">
      <h1 style="color: white; font-size: 18px; margin: 0;">Tappy Imob</h1>
    </div>
    <div style="padding: 30px;">
      <p style="color: #1f2937; font-size: 15px; margin: 0 0 15px;">
        <strong>${senderName}</strong> compartilhou ${type === "folder" ? "uma pasta" : "um arquivo"} com você:
      </p>
      <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; margin-bottom: 20px; border-left: 3px solid #25D366;">
        <p style="font-weight: 600; color: #0B2545; margin: 0; font-size: 15px;">${itemName}</p>
      </div>
      ${message ? `
      <div style="background: #fffbeb; border-radius: 8px; padding: 12px 15px; margin-bottom: 20px;">
        <p style="color: #92400e; font-size: 13px; margin: 0; font-style: italic;">"${message}"</p>
      </div>
      ` : ""}
      <a href="${shareUrl}" style="display: block; text-align: center; background: #0B2545; color: white; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">
        Acessar ${type === "folder" ? "Pasta" : "Arquivo"}
      </a>
    </div>
    <div style="padding: 16px 30px; background: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
      <p style="color: #9ca3af; font-size: 11px; margin: 0;">Tappy Imob — Especialistas em Sua Cidade e Região</p>
    </div>
  </div>
</body>
</html>`,
        });
        sent.push(email.trim());
      } catch (err) {
        console.error(`Erro ao enviar para ${email}:`, err);
        failed.push(email.trim());
      }
    }

    // Log
    await prisma.storageActivityLog.create({
      data: {
        action: "SHARE",
        fileId: type === "file" ? id : null,
        folderId: type === "folder" ? id : null,
        userId: session.id,
        userName: session.name || session.email,
        details: {
          emailsSent: sent,
          emailsFailed: failed,
          message: message || null,
        },
      },
    });

    return NextResponse.json({
      sent,
      failed,
      shareUrl: `/compartilhado/${shareToken}`,
      shareToken,
    });
  } catch (error) {
    console.error("Erro ao enviar emails de compartilhamento:", error);
    return NextResponse.json({ error: "Erro ao enviar emails" }, { status: 500 });
  }
}
