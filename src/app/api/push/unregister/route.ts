import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Nunca cachear.
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * DELETE /api/push/unregister
 * Remove o token Expo do aparelho (chamado no logout do app).
 * Aceita ?token=... na query ou { token } no corpo.
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    let token: string | null = request.nextUrl.searchParams.get("token");

    if (!token) {
      try {
        const body = await request.json();
        token = body?.token || null;
      } catch {
        token = null;
      }
    }

    if (!token) {
      return NextResponse.json(
        { error: "Token não informado" },
        { status: 400 }
      );
    }

    // Só remove se pertencer ao usuário autenticado.
    await prisma.pushToken.deleteMany({
      where: { token, userId: session.id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Push unregister error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
