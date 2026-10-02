import { SignJWT, jwtVerify } from "jose";

// Funções JWT puras (sem Prisma, sem next/headers) — seguras para rodar no
// middleware (edge runtime) e em qualquer route handler.
/**
 * Segredo que assina as sessões. Em produção é obrigatório: sem ele qualquer
 * pessoa que leia o código poderia forjar um login de administrador. Em
 * desenvolvimento cai num valor local para não travar o `pnpm dev`.
 */
function lerSegredoJwt(): string {
  const valor = process.env.JWT_SECRET;
  if (valor && valor.length >= 32) return valor;
  // Durante o `next build` o segredo pode não estar disponível: só o app
  // rodando precisa dele.
  if (process.env.NEXT_PHASE === "phase-production-build") return "build-sem-segredo";
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET ausente ou curto (mínimo 32 caracteres). Defina no ambiente antes de subir.");
  }
  return "dev-apenas-local-nao-usar-em-producao";
}

/** Segredo em texto, para bibliotecas que pedem string (jsonwebtoken). */
export const JWT_SECRET_TEXTO = lerSegredoJwt();
export const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_TEXTO);

export interface UserPayload {
  id: string;
  email: string;
  name: string;
  role:
    | "ADMIN"
    | "CORRETOR"
    | "CLIENTE"
    | "FOTOGRAFO"
    | "SDR"
    | "PARCEIRO_EXTERNO"
    | "MARKETING" | "ASSINANTE";
  avatar?: string | null;
  allowedModules?: string[];
}

export async function createToken(user: UserPayload): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as UserPayload;
  } catch {
    return null;
  }
}
