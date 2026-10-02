"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/header";
import { Footer, FooterMobile } from "@/components/footer";
import { CookieBanner } from "@/components/gdpr";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { PopupBanner } from "@/components/PopupBanner";
import { OffMarketBanner } from "@/components/OffMarketBanner";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  
  // Pages that should not have the main site layout
  const isAdminPage = pathname.startsWith("/admin");
  const isCorretorPage = pathname.startsWith("/corretor");
  const isFotografoPage = pathname.startsWith("/fotografo");
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/forgot-password");
  const isAIPage = pathname === "/encontre-seu-imovel" || pathname.startsWith("/tappy-ia");
  const isMaintenancePage = pathname === "/manutencao";
  const isEventPage = pathname.startsWith("/tappysummit") || pathname.startsWith("/campanha-summit");
  const isGalleryPage = pathname.startsWith("/tappy-galeria");
  const isSharedPage = pathname.startsWith("/compartilhado");
  const isParceiroPage = pathname.startsWith("/parceiro") || pathname.startsWith("/cadastro-parceiro");

  // Pages with minimal layout (no footer)
  const isMinimalLayout = pathname === "/imoveis";
  
  // Single property page - light footer without newsletter
  const isSinglePropertyPage = pathname.startsWith("/imovel/");
  
  // Home page - no floating WhatsApp (already in header)
  const isHomePage = pathname === "/" || pathname === "/portal";
  
  // Pages where Off-Market banner should NOT appear
  const isOffMarketPage = pathname === "/off-market";
  const isGestaoExclusivaPage = pathname === "/gestao-exclusiva";
  const isVenderPage = pathname === "/vender";
  const isSobrePage = pathname === "/sobre";
  const isImovelPage = pathname.startsWith("/imovel/");
  const showOffMarketBanner = !isOffMarketPage && !isHomePage && !isGestaoExclusivaPage && !isVenderPage && !isSobrePage && !isImovelPage;
  
  const hideLayout = pathname === "/" || isAdminPage || isCorretorPage || isFotografoPage || isAuthPage || isAIPage || isMaintenancePage || isEventPage || isGalleryPage || isSharedPage || isParceiroPage;

  if (hideLayout) {
    return <>{children}</>;
  }

  // Minimal layout - only header, no footer (página /imoveis já tem sua própria barra)
  if (isMinimalLayout) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-white dark:bg-neutral-950">
          {children}
        </main>
        <FloatingWhatsApp />
        <PopupBanner />
      </>
    );
  }

  // Single property page - light footer without newsletter
  // FloatingWhatsApp with custom message is handled inside the property page itself
  if (isSinglePropertyPage) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-white dark:bg-neutral-950 pt-2">
          {children}
        </main>
        <Footer variant="light" showNewsletter={false} />
        <FooterMobile />
        <PopupBanner />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white dark:bg-neutral-950">
        {showOffMarketBanner && (
          <div className="container mx-auto px-4 lg:px-8 my-5">
            <OffMarketBanner position="top" />
          </div>
        )}
        {children}
        {showOffMarketBanner && (
          <div className="container mx-auto px-4 lg:px-8 my-5">
            <OffMarketBanner position="bottom" />
          </div>
        )}
      </main>
      <Footer />
      <FooterMobile />
      <FloatingWhatsApp />
      <CookieBanner />
      <PopupBanner />
    </>
  );
}
