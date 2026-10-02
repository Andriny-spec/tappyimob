import type { Metadata } from "next";
import { SaasHome } from "@/components/saas/home";

const title = "TappyImob | CRM e gestão para o seu negócio imobiliário";
const description =
  "CRM, imóveis, WhatsApp, inteligência artificial e gestão em um só lugar. Conheça o TappyImob e conecte o próximo capítulo da sua imobiliária.";
export const metadata: Metadata = {
  title: { absolute: title },
  description,
  keywords: [
    "CRM imobiliário",
    "software para imobiliárias",
    "gestão imobiliária",
    "TappyImob",
    "CRM para corretores",
    "site imobiliário",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    url: "/",
    type: "website",
    locale: "pt_BR",
    siteName: "TappyImob",
  },
  twitter: { card: "summary_large_image", title, description },
};
export default function Home() {
  return <SaasHome />;
}
