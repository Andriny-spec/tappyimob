import { SignJWT, jwtVerify } from "jose";

// Funções JWT puras (sem Prisma, sem next/headers) — seguras para rodar no
// middleware (edge runtime) e em qualquer route handler.
export const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "tappyimob-super-secret-key-2024"
);

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
