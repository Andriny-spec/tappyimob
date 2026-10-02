import type { Metadata } from "next";

const url = "https://www.tappyimob.com.br/sobre";

export const metadata: Metadata = {
  title: { absolute: "Sobre a Tappy Imob | Imobiliária em Sua Cidade" },
  description:
    "Conheça a Tappy Imob: especialistas em compra, venda e locação de imóveis de alto padrão em Sua Cidade, Barueri e Santana de Parnaíba. Atendimento exclusivo e personalizado.",
  alternates: { canonical: url },
  openGraph: {
    title: { absolute: "Sobre a Tappy Imob | Imobiliária em Sua Cidade" },
    description:
      "Especialistas em imóveis de alto padrão em Sua Cidade e região. Conheça nossa história e equipe.",
    url,
    siteName: "Tappy Imob",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Sobre a Tappy Imob" }],
  },
};

export default function SobreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
