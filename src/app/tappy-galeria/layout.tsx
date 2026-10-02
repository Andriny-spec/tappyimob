import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galeria Tappy Summit 2026 — Fotos do Evento",
  description:
    "Acesse e baixe todas as fotos oficiais do Tappy Summit 2026. Mosaico ao vivo, atualizado durante o evento.",
  openGraph: {
    title: "Galeria Tappy Summit 2026",
    description:
      "Acesse e baixe todas as fotos oficiais do evento. Mosaico ao vivo, atualizado durante o Summit.",
    url: "https://tappyimob.com.br/tappy-galeria",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Galeria Tappy Summit 2026",
    description:
      "Acesse e baixe todas as fotos oficiais do evento.",
  },
};

export default function TappyGaleriaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
