import { getSession, UserPayload } from "./auth";

const ALLOWED_ROLES: UserPayload["role"][] = ["ADMIN", "CORRETOR", "FOTOGRAFO"];

/**
 * Retorna a sessão do usuário se ele tiver permissão para acessar a Tappy IA.
 * Roles permitidas: ADMIN, CORRETOR, FOTOGRAFO.
 */
export async function requireTappyIAAccess(): Promise<
  { ok: true; user: UserPayload } | { ok: false; status: number; error: string }
> {
  const session = await getSession();
  if (!session) {
    return { ok: false, status: 401, error: "Não autenticado" };
  }
  if (!ALLOWED_ROLES.includes(session.role)) {
    return { ok: false, status: 403, error: "Sem permissão para a Tappy IA" };
  }
  return { ok: true, user: session };
}
