import { jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { createToken, verifyToken, JWT_SECRET, type UserPayload } from "./jwt";

// Re-exporta as funções JWT puras para manter compatibilidade com quem
// importa de "@/lib/auth" (refresh, queue, parceiro/register, tappy-ia-auth).
export { createToken, verifyToken, JWT_SECRET };
export type { UserPayload };

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.isActive) {
    return { error: "Credenciais inválidas" };
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return { error: "Credenciais inválidas" };
  }

  const token = await createToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    allowedModules: user.allowedModules,
  });

  // Set cookie
  const headerStore = await headers();
  const isHttps = headerStore.get("x-forwarded-proto") === "https";
  const cookieStore = await cookies();
  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      allowedModules: user.allowedModules,
    },
  };
}

export async function register(data: {
  email: string;
  password: string;
  name: string;
  phone?: string;
}) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    return { error: "Este e-mail já está cadastrado" };
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      phone: data.phone,
      role: "CLIENTE",
    },
  });

  const token = await createToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    allowedModules: user.allowedModules,
  });

  // Set cookie
  const headerStore2 = await headers();
  const isHttps2 = headerStore2.get("x-forwarded-proto") === "https";
  const cookieStore = await cookies();
  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: isHttps2,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      allowedModules: user.allowedModules,
    },
  };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("auth-token");
}

export async function getSession(): Promise<UserPayload | null> {
  // O app React Native não usa cookies httpOnly: aceita Authorization: Bearer
  // (e segue aceitando o cookie para o site continuar funcionando igual).
  const headerStore = await headers();
  const auth = headerStore.get("authorization");
  const token = auth?.startsWith("Bearer ")
    ? auth.slice(7).trim()
    : (await cookies()).get("auth-token")?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  if (!payload) return null;

  // Check if token was invalidated (password change, deactivation, etc.)
  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { isActive: true, tokenInvalidatedAt: true },
    });
    if (!user || !user.isActive) return null;
    if (user.tokenInvalidatedAt) {
      const { payload: raw } = await jwtVerify(token, JWT_SECRET);
      const issuedAt = raw.iat ? raw.iat * 1000 : 0;
      if (issuedAt < user.tokenInvalidatedAt.getTime()) return null;
    }
  } catch {
    // If DB check fails, still allow the token (graceful degradation)
  }

  return payload;
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      avatar: true,
      role: true,
      allowedModules: true,
      creci: true,
      bio: true,
      isActive: true,
      createdAt: true,
    },
  });

  return user;
}
