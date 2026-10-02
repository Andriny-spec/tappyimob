import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

export async function POST(request: NextRequest) {
  const { token, password } = await request.json().catch(() => ({}));
  const rawToken = String(token || "").trim();
  const newPassword = String(password || "");

  if (!rawToken) {
    return NextResponse.json({ error: "Token inválido." }, { status: 400 });
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ error: "A nova senha deve ter pelo menos 6 caracteres." }, { status: 400 });
  }

  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: { id: true, userId: true, expiresAt: true, usedAt: true },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return NextResponse.json({ error: "Link expirado ou já utilizado. Solicite um novo." }, { status: 400 });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      // invalida sessões antigas: obriga novo login com a senha nova
      data: { password: hashed, tokenInvalidatedAt: new Date() },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.userProfileLog.create({
      data: { userId: record.userId, field: "password", oldValue: null, newValue: "(redefinida via e-mail)" },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
