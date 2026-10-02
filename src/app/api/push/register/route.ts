import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Nunca cachear.
export const dynamic = "force-dynamic";
export const revalidate = 0;

const registerSchema = z.object({
  token: z.string().min(10, "Token inválido"),
  platform: z.enum(["ios", "android"]).optional(),
  deviceId: z.string().optional(),
});

/**
 * POST /api/push/register
 * Registra o token Expo do aparelho para o usuário autenticado.
 * Idempotente: se o token já existe (mesmo de outro usuário, ex. troca de
 * conta no mesmo aparelho), reatribui para o usuário atual.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { token, platform, deviceId } = validation.data;

    await prisma.pushToken.upsert({
      where: { token },
      create: {
        token,
        userId: session.id,
        platform: platform ?? "android",
        deviceId,
        lastUsedAt: new Date(),
      },
      update: {
        userId: session.id,
        platform: platform ?? "android",
        deviceId,
        lastUsedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Push register error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
