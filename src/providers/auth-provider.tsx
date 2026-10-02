"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "CORRETOR" | "CLIENTE" | "FOTOGRAFO" | "SDR" | "PARCEIRO_EXTERNO" | "MARKETING" | "ASSINANTE";
  allowedModules?: string[];
  avatar?: string | null;
  phone?: string | null;
  creci?: string | null;
  bio?: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_ROUTES = [
  "/",
  "/home",
  "/portal",
  "/imoveis",
  "/encontre-seu-imovel",
  "/calculadora",
  "/login",
  "/register",
  "/forgot-password",
  "/blog",
  "/contato",
  "/sobre",
  "/vender",
  "/privacidade",
  "/termos",
  "/cookies",
  "/corretor-parceiro",
  "/gestao-exclusiva",
  "/regularizacao",
  "/off-market",
  "/condominio",
  "/condominios",
  "/parceiros/exclusivos",
  "/manutencao",
  "/tappysummit",
  "/tappysummit-b",
  "/campanha-summit",
  "/tappy-galeria",
  "/cadastro-parceiro",
  "/compartilhado",
];
const ADMIN_ROUTES = ["/admin"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = async () => {
    try {
      // no-store: sempre busca permissões/role atuais (evita sidebar com permissão defasada)
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await response.json();
      
      if (response.ok && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Proteção de rotas
  useEffect(() => {
    if (isLoading) return;

    const isPublicRoute = PUBLIC_ROUTES.some(route => 
      pathname === route || 
      pathname.startsWith(route + "/") ||
      pathname.startsWith("/imovel/")
    );
    const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route));
    const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/cadastro-parceiro";

    // Se não está logado e tenta acessar rota protegida
    if (!user && !isPublicRoute) {
      router.push("/login");
      return;
    }

    // Se está logado e tenta acessar página de auth
    if (user && isAuthPage) {
      if (user.role === "ADMIN" || user.role === "SDR" || user.role === "MARKETING") {
        router.push("/admin");
      } else if (user.role === "PARCEIRO_EXTERNO") {
        router.push("/parceiro");
      } else if (user.role === "CORRETOR") {
        router.push("/corretor");
      } else if (user.role === "FOTOGRAFO") {
        router.push("/fotografo");
      } else {
        router.push("/");
      }
      return;
    }

    // Se não é admin e tenta acessar /admin
    // Permite: ADMIN pleno, SDR, PARCEIRO_EXTERNO, ou qualquer role com allowedModules (RBAC)
    const hasModuleAccess = user?.allowedModules && user.allowedModules.length > 0;
    const canAccessAdmin = user?.role === "ADMIN" || user?.role === "SDR" || hasModuleAccess;
    if (user && isAdminRoute && !canAccessAdmin) {
      if (user.role === "CORRETOR") {
        router.push("/corretor");
      } else {
        router.push("/");
      }
      return;
    }

    // Se não é corretor/admin e tenta acessar /corretor
    const isCorretorRoute = pathname.startsWith("/corretor");
    if (user && isCorretorRoute && user.role === "CLIENTE") {
      router.push("/");
      return;
    }

    // /parceiro só para PARCEIRO_EXTERNO
    const isParceiroRoute = pathname.startsWith("/parceiro");
    if (isParceiroRoute && user && user.role !== "PARCEIRO_EXTERNO") {
      router.push("/");
      return;
    }
    if (isParceiroRoute && !user) {
      router.push("/cadastro-parceiro");
      return;
    }

    // Redireciona PARCEIRO_EXTERNO que tenta acessar /admin
    if (user && user.role === "PARCEIRO_EXTERNO" && pathname.startsWith("/admin")) {
      router.push("/parceiro");
      return;
    }
  }, [user, isLoading, pathname, router]);

  const login = async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error };
    }

    setUser(data.user);
    return {};
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  };

  const refresh = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
