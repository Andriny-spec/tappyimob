export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Tappy Imob",
    url: "https://www.tappyimob.com.br",
    logo: "https://www.tappyimob.com.br/favicon.png",
    description:
      "Encontre seu imóvel ideal em Sua Cidade e região. Casas, apartamentos, terrenos e salas comerciais. Atendimento exclusivo e personalizado.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Barueri",
      addressRegion: "SP",
      addressCountry: "BR",
    },
    areaServed: [
      { "@type": "City", name: "Barueri" },
      { "@type": "City", name: "Santana de Parnaíba" },
      { "@type": "City", name: "Osasco" },
      { "@type": "City", name: "Carapicuíba" },
      { "@type": "City", name: "São Paulo" },
    ],
    sameAs: [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface PropertyJsonLdProps {
  name: string;
  description: string;
  url: string;
  images: string[];
  price: number;
  priceCurrency?: string;
  address: {
    street?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
  latitude?: number;
  longitude?: number;
  propertyType?: string;
  numberOfRooms?: number;
  numberOfBathrooms?: number;
  floorSize?: number;
  floorSizeUnit?: string;
}

export function PropertyJsonLd({
  name,
  description,
  url,
  images,
  price,
  priceCurrency = "BRL",
  address,
  latitude,
  longitude,
  propertyType,
  numberOfRooms,
  numberOfBathrooms,
  floorSize,
  floorSizeUnit = "SQM",
}: PropertyJsonLdProps) {
  const data: any = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name,
    description,
    url,
    image: images,
    offers: {
      "@type": "Offer",
      price,
      priceCurrency,
      availability: "https://schema.org/InStock",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: address.street,
      addressLocality: address.city,
      addressRegion: address.state,
      postalCode: address.postalCode,
      addressCountry: "BR",
    },
  };

  if (latitude && longitude) {
    data.geo = {
      "@type": "GeoCoordinates",
      latitude,
      longitude,
    };
  }

  if (floorSize) {
    data.floorSize = {
      "@type": "QuantitativeValue",
      value: floorSize,
      unitCode: floorSizeUnit,
    };
  }

  if (numberOfRooms) data.numberOfRooms = numberOfRooms;
  if (numberOfBathrooms) data.numberOfBathroomsTotal = numberOfBathrooms;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface BlogPostJsonLdProps {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
}

export function BlogPostJsonLd({
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
  authorName = "Tappy Imob",
}: BlogPostJsonLdProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    url,
    image: image || "https://www.tappyimob.com.br/og-image.png",
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      "@type": "Organization",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "Tappy Imob",
      logo: {
        "@type": "ImageObject",
        url: "https://www.tappyimob.com.br/favicon.png",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
