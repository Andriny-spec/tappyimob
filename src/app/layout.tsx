import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/providers/session-provider";
import { Toaster } from 'sonner';

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "TappyImob | Sistema Imobiliário Completo",
  description: "Sistema de gestão imobiliária completo da Tappy. Automatize processos, gerencie clientes, imóveis e contratos em um só lugar.",
  keywords: "sistema imobiliário, gestão imobiliária, imobiliárias, corretores, automação imobiliária, Tappy, TappyImob",
  icons: [
    { rel: "icon", url: "/favicon.svg" },
    { rel: "apple-touch-icon", url: "/favicon.svg" }
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://imob.tappy.com.br",
    title: "TappyImob | Sistema Imobiliário Completo",
    description: "Sistema de gestão imobiliária completo da Tappy. Automatize processos, gerencie clientes, imóveis e contratos em um só lugar.",
    images: [{ url: "/TAPPY - HORIZONTAL - VERDE.svg", width: 1200, height: 630, alt: "TappyImob" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${inter.variable} antialiased`}
      >
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster richColors position="top-center" closeButton />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
