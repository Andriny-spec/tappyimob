import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const url = "https://www.tappyimob.com.br/imoveis";

export const metadata: Metadata = {
  title: { absolute: "Imóveis à Venda e Locação em Sua Cidade | Tappy Imob" },
  description:
    "Casas, apartamentos, terrenos e salas comerciais à venda e para alugar em Sua Cidade, Barueri e Santana de Parnaíba. Encontre seu imóvel ideal na Tappy Imob.",
  alternates: { canonical: url },
  openGraph: {
    title: { absolute: "Imóveis à Venda e Locação em Sua Cidade | Tappy Imob" },
    description:
      "Casas, apartamentos, terrenos e salas comerciais em Sua Cidade e região. Veja todos os imóveis disponíveis.",
    url,
    siteName: "Tappy Imob",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Imóveis em Sua Cidade - Tappy Imob" }],
  },
};

const TYPE_LABELS: Record<string, string> = {
  APARTAMENTO: "Apartamento", CASA: "Casa", TERRENO: "Terreno", COMERCIAL: "Comercial",
  COBERTURA: "Cobertura", SOBRADO: "Sobrado", STUDIO: "Studio", FLAT: "Flat",
  KITNET: "Kitnet", LOFT: "Loft", GALPAO: "Galpão",
};

function fmtPrice(v: number) {
  if (!v) return "Sob consulta";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);
}

// Layout server-side: além de envolver a página client, renderiza um bloco
// SSR com texto + links de imóveis reais direto no HTML inicial, para que o
// Google sempre veja conteúdo indexável (a listagem interativa é via JS).
export default async function ImoveisLayout({ children }: { children: React.ReactNode }) {
  let imoveis: any[] = [];
  try {
    imoveis = await prisma.property.findMany({
      where: { status: "DISPONIVEL", showOnWebsite: { not: false }, isOffMarket: false },
      select: {
        id: true, slug: true, title: true, type: true, category: true,
        price: true, rentPrice: true, bedrooms: true, area: true,
        neighborhood: true, city: true, state: true,
        condominium: { select: { name: true } },
      },
      orderBy: [{ isSuperFeatured: "desc" }, { isFeatured: "desc" }, { updatedAt: "desc" }],
      take: 60,
    });
  } catch {
    imoveis = [];
  }

  return (
    <>
      {children}
      <section aria-label="Imóveis disponíveis" className="sr-only">
        <h2>Imóveis à venda e para alugar em Sua Cidade e região</h2>
        <p>
          A Tappy Imob reúne casas, apartamentos, coberturas, terrenos e salas comerciais
          em Sua Cidade, Barueri, Santana de Parnaíba e região. Confira os imóveis disponíveis
          e encontre a melhor opção para comprar ou alugar.
        </p>
        {imoveis.length > 0 && (
          <ul>
            {imoveis.map((p) => {
              const nome = p.condominium?.name || p.title;
              const tipo = TYPE_LABELS[p.type] || p.type;
              const preco = p.category === "LOCACAO" && p.rentPrice ? `${fmtPrice(p.rentPrice)}/mês` : fmtPrice(p.price);
              const partes = [tipo];
              if (p.bedrooms) partes.push(`${p.bedrooms} quartos`);
              if (p.area) partes.push(`${p.area}m²`);
              return (
                <li key={p.id}>
                  <Link href={`/imovel/${p.slug || p.id}`}>
                    {nome} — {partes.join(", ")} — {p.neighborhood}, {p.city}/{p.state} — {preco}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
