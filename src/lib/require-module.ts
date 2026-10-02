import { NextResponse } from "next/server";
import { getSession } from "./auth";
import { canAccessModule } from "./api-modules";

/**
 * Guard de módulo para uso DENTRO de um route handler:
 *
 *   const denied = await requireModule("clientes");
 *   if (denied) return denied;
 *
 * Devolve null quando liberado, ou uma NextResponse 401/403 quando bloquear.
 * A aplicação global nas rotas /api/admin/* fica no middleware.ts; use este
 * helper quando quiser checagem explícita por módulo em um handler específico.
 */
export async function requireModule(
  moduleKey: string
): Promise<NextResponse | null> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  if (!canAccessModule(session, moduleKey)) {
    return NextResponse.json(
      { error: "Sem permissão para este módulo" },
      { status: 403 }
    );
  }
  return null;
}
