import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Acesse seu workspace | TappyImob" },
  description:
    "Acesse o TappyImob. Seus imóveis, leads, equipe e negócios em um só lugar.",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: true },
  openGraph: {
    title: "Acesse seu workspace | TappyImob",
    description:
      "Seu time, seus imóveis e suas oportunidades. Tudo pronto para o próximo capítulo.",
    url: "/login",
  },
};
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
