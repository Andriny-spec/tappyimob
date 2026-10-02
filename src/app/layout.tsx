import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { ImageProtection } from "@/components/public/ImageProtection";
import { TrackingScripts, GTMNoScript } from "@/components/tracking/TrackingScripts";
import { UtmTracker } from "@/components/tracking/UtmTracker";
import { OrganizationJsonLd } from "@/components/seo/JsonLd";
import { prisma } from "@/lib/prisma";
import { TRACKING_CONFIG_KEY, DEFAULT_TRACKING_CONFIG } from "@/lib/tracking-config";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "optional",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "optional",
});

const siteUrl = "https://www.tappyimob.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Tappy Imob | Imóveis em Sua Cidade e Região",
    template: "%s | Tappy Imob",
  },
  description: "Encontre seu imóvel ideal em Sua Cidade e região. Casas, apartamentos, terrenos e salas comerciais. Atendimento exclusivo e personalizado.",
  keywords: [
    "imóveis sua cidade", "casas sua cidade", "apartamentos sua cidade",
    "imobiliária sua cidade", "terrenos sua cidade", "imóveis barueri",
    "imóveis santana de parnaíba", "condomínios sua cidade",
    "comprar imóvel sua cidade", "alugar imóvel sua cidade",
    "tappy imob", "imobiliária",
  ],
  authors: [{ name: "Tappy Imob" }],
  creator: "Tappy Imob",
  publisher: "Tappy Imob",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.png", sizes: "250x250", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "Tappy Imob",
    title: "Tappy Imob | Imóveis em Sua Cidade e Região",
    description: "Encontre seu imóvel ideal em Sua Cidade e região. Casas, apartamentos, terrenos e salas comerciais. Atendimento exclusivo e personalizado.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tappy Imob - Imóveis em Sua Cidade",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tappy Imob | Imóveis em Sua Cidade e Região",
    description: "Encontre seu imóvel ideal em Sua Cidade e região.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code",
  },
  alternates: {
    canonical: siteUrl,
  },
};

// IDs de tracking (GTM/GA4/Meta Pixel) são lidos do banco (editáveis em
// /admin/marketing/configuracoes), com cache de 5min pra não bater no Prisma
// a cada request e não forçar a home a virar 100% dinâmica.
const getTrackingConfig = unstable_cache(
  async () => {
    try {
      const config = await prisma.systemConfig.findUnique({ where: { key: TRACKING_CONFIG_KEY } });
      return { ...DEFAULT_TRACKING_CONFIG, ...((config?.value as object) || {}) };
    } catch {
      return DEFAULT_TRACKING_CONFIG;
    }
  },
  ["marketing-tracking-config"],
  { revalidate: 300, tags: ["marketing-tracking-config"] }
);

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const trackingConfig = await getTrackingConfig();
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Preconnect para domínios externos - reduz latência de conexão */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://objectstorage.sa-saopaulo-1.oraclecloud.com" />
        <link rel="dns-prefetch" href="https://objectstorage.sa-saopaulo-1.oraclecloud.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
        <TrackingScripts gtmId={trackingConfig.gtmId} ga4Id={trackingConfig.ga4Id} metaPixelId={trackingConfig.metaPixelId} />
        <OrganizationJsonLd />
      </head>
      <body
        className={`${inter.variable} ${jakarta.variable} font-sans antialiased bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white`}
      >
        <GTMNoScript gtmId={trackingConfig.gtmId} />
        <UtmTracker />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
              <FavoritesProvider>
                <ImageProtection />
                <LayoutWrapper>
                  {children}
                </LayoutWrapper>
              </FavoritesProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
