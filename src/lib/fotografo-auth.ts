import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { getSession } from "./auth";

export interface FotografoSession {
  userId: string;
  role: string;
  type?: string;
  email?: string;
}

/**
 * Verifica Bearer token legado (login dedicado /fotografo/login).
 */
function verifyBearerToken(request: NextRequest): FotografoSession | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.substring(7);
  if (!token || token === "null" || token === "undefined") return null;
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret-key"
    ) as FotografoSession;
    if (decoded.type !== "fotografo" || decoded.role !== "FOTOGRAFO") return null;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Autenticação do fotógrafo aceitando:
 *  1. Bearer token (fluxo legado /fotografo/login)
 *  2. Cookie de sessão padrão (login via /login) — qualquer user com role FOTOGRAFO
 *
 * Retorna a sessão ou null.
 */
export async function verifyFotografoAccess(
  request: NextRequest
): Promise<FotografoSession | null> {
  const bearer = verifyBearerToken(request);
  if (bearer) return bearer;

  const session = await getSession();
  if (session && session.role === "FOTOGRAFO") {
    return {
      userId: session.id,
      role: session.role,
      email: session.email,
      type: "fotografo",
    };
  }
  return null;
}

/**
 * @deprecated use verifyFotografoAccess (async).
 * Mantido para rotas legadas que usam apenas Bearer.
 */
export function verifyFotografoToken(request: NextRequest): FotografoSession | null {
  return verifyBearerToken(request);
}
