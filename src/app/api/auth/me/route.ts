import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

// Nunca cachear: reflete permissões/role do usuário em tempo real (RBAC da sidebar).
export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
};

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401, headers: NO_STORE });
    }

    return NextResponse.json({ user }, { headers: NO_STORE });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500, headers: NO_STORE }
    );
  }
}
