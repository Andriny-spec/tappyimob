import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PropertyJsonLd } from "@/components/seo/JsonLd";

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

async function getProperty(id: string) {
  // Tentar por ID, slug, ou código
  let property = await prisma.property.findUnique({
    where: { id },
    select: {
      id: true,
      code: true,
      title: true,
      slug: true,
      type: true,
      category: true,
      price: true,
      rentPrice: true,
      area: true,
      totalArea: true,
      bedrooms: true,
      suites: true,
      parkingSpaces: true,
      neighborhood: true,
      city: true,
      state: true,
      thumbnail: true,
      images: true,
      metaTitle: true,
      metaDescription: true,
      condominium: { select: { name: true } },
    },
  });

  if (!property) {
    property = await prisma.property.findUnique({
      where: { slug: id },
      select: {
        id: true,
        code: true,
        title: true,
        slug: true,
        type: true,
        category: true,
        price: true,
        rentPrice: true,
        area: true,
        totalArea: true,
        bedrooms: true,
        suites: true,
        parkingSpaces: true,
        neighborhood: true,
        city: true,
        state: true,
        thumbnail: true,
        images: true,
        metaTitle: true,
      metaDescription: true,
      condominium: { select: { name: true } },
      },
    });
  }

  if (!property) {
    property = await prisma.property.findUnique({
      where: { code: id },
      select: {
        id: true,
        code: true,
        title: true,
        slug: true,
        type: true,
        category: true,
        price: true,
        rentPrice: true,
        area: true,
        totalArea: true,
        bedrooms: true,
        suites: true,
        parkingSpaces: true,
        neighborhood: true,
        city: true,
        state: true,
        thumbnail: true,
        images: true,
        metaTitle: true,
      metaDescription: true,
      condominium: { select: { name: true } },
      },
    });
  }

  return property;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) {
    return {
      title: "Imóvel não encontrado | Tappy Imob",
      description: "O imóvel que você procura não foi encontrado.",
    };
  }

  const condoName = property.condominium?.name;
  const displayName = condoName || property.title;
  const typeLabels: Record<string, string> = {
    APARTAMENTO: "Apartamento",
    CASA: "Casa",
    TERRENO: "Terreno",
    COMERCIAL: "Comercial",
    COBERTURA: "Cobertura",
    SOBRADO: "Sobrado",
    STUDIO: "Studio",
    FLAT: "Flat",
    KITNET: "Kitnet",
    LOFT: "Loft",
  };
  const typeLabel = typeLabels[property.type] || property.type;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(price);

  const price = property.category === "LOCACAO" && property.rentPrice
    ? `${formatPrice(property.rentPrice)}/mês`
    : property.price > 0
    ? formatPrice(property.price)
    : "";

  // Título: usa metaTitle customizado se preenchido no cadastro
  const title = (property.metaTitle && property.metaTitle.trim())
    ? property.metaTitle
    : `${displayName} - ${property.code} | ${property.neighborhood}, ${property.city}`;

  const descParts = [typeLabel];
  if (property.type !== "TERRENO" && property.bedrooms > 0) {
    descParts.push(`${property.bedrooms} quartos`);
    if (property.suites > 0) descParts.push(`${property.suites} suítes`);
  }
  if (property.type !== "TERRENO" && property.parkingSpaces > 0) {
    descParts.push(`${property.parkingSpaces} vagas`);
  }
  if (property.type !== "TERRENO" && property.area > 0) {
    descParts.push(`${property.area}m²`);
  }
  if (property.totalArea && property.totalArea > 0) {
    descParts.push(`${property.totalArea}m² terreno`);
  }
  if (price) descParts.push(price);
  descParts.push(`${property.neighborhood}, ${property.city}/${property.state}`);

  // Descrição: usa metaDescription customizada se preenchida no cadastro
  const description = (property.metaDescription && property.metaDescription.trim())
    ? property.metaDescription
    : descParts.join(" · ");
  // OG image: endpoint dedicado que serve JPEG 1200x630 otimizado (crawlers não suportam bem WebP)
  const hasImage = !!(property.images?.[0] || property.thumbnail);
  const image = hasImage
    ? `https://www.tappyimob.com.br/api/og-image/${property.slug || property.id}`
    : "";
  const url = `https://www.tappyimob.com.br/imovel/${property.slug || property.id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "Tappy Imob",
      type: "website",
      images: image
        ? [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: displayName,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "32x32" },
        { url: "/favicon.png", sizes: "250x250", type: "image/png" },
      ],
      shortcut: "/favicon.ico",
      apple: "/favicon.png",
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function ImovelLayout({ params, children }: Props) {
  const { id } = await params;
  const property = await getProperty(id);

  let jsonLd = null;
  if (property) {
    const displayName = property.condominium?.name || property.title;
    const url = `https://www.tappyimob.com.br/imovel/${property.slug || property.id}`;
    const images = (property.images?.length ? property.images : property.thumbnail ? [property.thumbnail] : []).slice(0, 6);
    const isLocacao = property.category === "LOCACAO";
    const price = isLocacao && property.rentPrice ? property.rentPrice : property.price;
    const descParts = [property.type, property.bedrooms ? `${property.bedrooms} quartos` : "", `${property.neighborhood}, ${property.city}/${property.state}`].filter(Boolean);

    jsonLd = (
      <PropertyJsonLd
        name={`${displayName} - ${property.code}`}
        description={descParts.join(" · ")}
        url={url}
        images={images}
        price={price || 0}
        address={{
          neighborhood: property.neighborhood,
          city: property.city,
          state: property.state,
        }}
        propertyType={property.type}
        numberOfRooms={property.bedrooms || undefined}
        floorSize={property.area || undefined}
      />
    );
  }

  return (
    <>
      {jsonLd}
      {children}
    </>
  );
}
