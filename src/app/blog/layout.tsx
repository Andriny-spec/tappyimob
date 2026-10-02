import type { Metadata } from "next";

const url = "https://www.tappyimob.com.br/blog";

export const metadata: Metadata = {
  title: { absolute: "Blog | Mercado Imobiliário de Sua Cidade | Tappy Imob" },
  description:
    "Notícias, dicas e tendências do mercado imobiliário de Sua Cidade e região. Acompanhe o blog da Tappy Imob para comprar, vender ou investir com segurança.",
  alternates: { canonical: url },
  openGraph: {
    title: { absolute: "Blog | Mercado Imobiliário de Sua Cidade | Tappy Imob" },
    description:
      "Notícias, dicas e tendências do mercado imobiliário de Sua Cidade e região.",
    url,
    siteName: "Tappy Imob",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Blog Tappy Imob" }],
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
