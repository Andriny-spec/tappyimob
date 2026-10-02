import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

export const metadata: Metadata = {
  title: "Painel Administrativo | Tappy Imob",
  description: "Gerencie seus imóveis, leads e equipe na Tappy Imob.",
  openGraph: {
    title: "Painel Administrativo | Tappy Imob",
    description: "Gerencie seus imóveis, leads e equipe na Tappy Imob.",
    url: "https://www.tappyimob.com.br/admin",
    siteName: "Tappy Imob",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tappy Imob - Imóveis em Sua Cidade",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Painel Administrativo | Tappy Imob",
    description: "Gerencie seus imóveis, leads e equipe na Tappy Imob.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Gate de autenticação NO SERVIDOR: evita o "flash" do painel admin para quem
  // não está logado. Sem sessão válida, redireciona antes de enviar qualquer HTML.
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  // CLIENTE e PARCEIRO_EXTERNO nunca acessam o painel administrativo.
  // (ADMIN/SDR têm acesso pleno; CORRETOR/FOTOGRAFO seguem com o RBAC por módulo
  // tratado no cliente.)
  if (session.role === "CLIENTE" || session.role === "PARCEIRO_EXTERNO") {
    redirect("/");
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
