import { NextRequest, NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { createToken, verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "tappyimob-super-secret-key-2024"
);

// Nunca cachear: emite token novo com dados frescos do usuário.
export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
};

/**
 * POST /api/auth/refresh
 * Renova o token de um usuário ainda válido (sliding session de 7 dias).
 * O app chama isso antes de o token expirar, para o corretor não ser
 * deslogado no meio da semana. Aceita Bearer ou cookie.
 */
export async function POST(request: NextRequest) {
  try {
    const headerStore = await headers();
    const auth = headerStore.get("authorization");
    const currentToken = auth?.startsWith("Bearer ")
      ? auth.slice(7).trim()
      : (await cookies()).get("auth-token")?.value;

    if (!currentToken) {
      return NextResponse.json(
        { error: "Sem token para renovar" },
        { status: 401, headers: NO_STORE }
      );
    }

    const payload = await verifyToken(currentToken);
    if (!payload || !payload.id) {
      return NextResponse.json(
        { error: "Token inválido ou expirado" },
        { status: 401, headers: NO_STORE }
      );
    }

    // Mesmas validações do getSession(): usuário ativo e token não invalidado.
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        allowedModules: true,
        isActive: true,
        tokenInvalidatedAt: true,
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Usuário inativo" },
        { status: 401, headers: NO_STORE }
      );
    }

    if (user.tokenInvalidatedAt) {
      const { payload: raw } = await jwtVerify(currentToken, JWT_SECRET);
      const issuedAt = raw.iat ? raw.iat * 1000 : 0;
      if (issuedAt < user.tokenInvalidatedAt.getTime()) {
        return NextResponse.json(
          { error: "Sessão revogada, faça login novamente" },
          { status: 401, headers: NO_STORE }
        );
      }
    }

    const token = await createToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      allowedModules: user.allowedModules,
    });

    const { isActive: _ia, tokenInvalidatedAt: _ti, ...safeUser } = user;

    return NextResponse.json(
      { token, user: safeUser },
      { headers: NO_STORE }
    );
  } catch (error) {
    console.error("Refresh error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500, headers: NO_STORE }
    );
  }
}
