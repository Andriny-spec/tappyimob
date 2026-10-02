import { NextRequest, NextResponse } from "next/server";
import { getTokensFromCode } from "@/lib/google-calendar";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

// GET - Callback do OAuth do Google
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        new URL(`/admin/configuracoes?google_error=${error}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/admin/configuracoes?google_error=no_code", request.url)
      );
    }

    // Trocar código por tokens
    const tokens = await getTokensFromCode(code);

    // Salvar tokens no banco (associado ao usuário atual)
    // Por enquanto, vamos salvar em cookies seguros
    const cookieStore = await cookies();
    
    if (tokens.access_token) {
      cookieStore.set("google_access_token", tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: tokens.expiry_date ? (tokens.expiry_date - Date.now()) / 1000 : 3600,
      });
    }

    if (tokens.refresh_token) {
      cookieStore.set("google_refresh_token", tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 dias
      });
    }

    // Redirecionar de volta para a página de configurações
    return NextResponse.redirect(
      new URL("/admin/configuracoes?google_connected=true", request.url)
    );
  } catch (error) {
    console.error("Erro no callback do Google:", error);
    return NextResponse.redirect(
      new URL("/admin/configuracoes?google_error=token_error", request.url)
    );
  }
}
