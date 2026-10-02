import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SITE_URL = "https://tappyimob.com.br";
const SITE_NAME = "Tappy Imob";
const DEFAULT_TITLE = "Tappy Imob | Imóveis em Sua Cidade e Região";
const DEFAULT_DESC = "Encontre seu imóvel ideal em Sua Cidade e região. Casas, apartamentos, terrenos e salas comerciais. Atendimento exclusivo e personalizado.";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

function html(meta: { title: string; description: string; image: string; url: string; favicon: string }) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${escHtml(meta.title)}</title>
<meta name="description" content="${escHtml(meta.description)}"/>
<link rel="icon" href="${meta.favicon}" sizes="32x32"/>
<link rel="icon" href="/favicon.png" sizes="250x250" type="image/png"/>
<link rel="shortcut icon" href="${meta.favicon}"/>
<link rel="apple-touch-icon" href="/favicon.png"/>
<meta property="og:type" content="website"/>
<meta property="og:locale" content="pt_BR"/>
<meta property="og:site_name" content="${SITE_NAME}"/>
<meta property="og:title" content="${escHtml(meta.title)}"/>
<meta property="og:description" content="${escHtml(meta.description)}"/>
<meta property="og:url" content="${escHtml(meta.url)}"/>
<meta property="og:image" content="${escHtml(meta.image)}"/>
<meta property="og:image:type" content="image/jpeg"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${escHtml(meta.title)}"/>
<meta name="twitter:description" content="${escHtml(meta.description)}"/>
<meta name="twitter:image" content="${escHtml(meta.image)}"/>
<link rel="canonical" href="${escHtml(meta.url)}"/>
</head>
<body>
<p>${escHtml(meta.title)}</p>
<p>${escHtml(meta.description)}</p>
<a href="${escHtml(meta.url)}">Acessar</a>
</body>
</html>`;
}

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

async function getPropertyMeta(id: string) {
  let property = await prisma.property.findUnique({
    where: { id },
    select: { id: true, code: true, title: true, slug: true, type: true, category: true, price: true, rentPrice: true, area: true, totalArea: true, bedrooms: true, suites: true, parkingSpaces: true, neighborhood: true, city: true, state: true, thumbnail: true, images: true, condominium: { select: { name: true } } },
  });
  if (!property) {
    property = await prisma.property.findUnique({
      where: { slug: id },
      select: { id: true, code: true, title: true, slug: true, type: true, category: true, price: true, rentPrice: true, area: true, totalArea: true, bedrooms: true, suites: true, parkingSpaces: true, neighborhood: true, city: true, state: true, thumbnail: true, images: true, condominium: { select: { name: true } } },
    });
  }
  if (!property) {
    property = await prisma.property.findUnique({
      where: { code: id },
      select: { id: true, code: true, title: true, slug: true, type: true, category: true, price: true, rentPrice: true, area: true, totalArea: true, bedrooms: true, suites: true, parkingSpaces: true, neighborhood: true, city: true, state: true, thumbnail: true, images: true, condominium: { select: { name: true } } },
    });
  }
  if (!property) return null;

  const condoName = property.condominium?.name;
  const displayName = condoName || property.title;
  const typeLabels: Record<string, string> = {
    APARTAMENTO: "Apartamento", CASA: "Casa", TERRENO: "Terreno", COMERCIAL: "Comercial",
    COBERTURA: "Cobertura", SOBRADO: "Sobrado", STUDIO: "Studio", FLAT: "Flat", KITNET: "Kitnet", LOFT: "Loft",
  };
  const typeLabel = typeLabels[property.type] || property.type;
  const formatPrice = (p: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(p);
  const price = property.category === "LOCACAO" && property.rentPrice
    ? `${formatPrice(property.rentPrice)}/mês`
    : property.price > 0 ? formatPrice(property.price) : "";

  const title = `${displayName} - ${property.code} | ${property.neighborhood}, ${property.city}`;
  const descParts = [typeLabel];
  if (property.type !== "TERRENO" && property.bedrooms > 0) {
    descParts.push(`${property.bedrooms} quartos`);
    if (property.suites > 0) descParts.push(`${property.suites} suítes`);
  }
  if (property.type !== "TERRENO" && property.parkingSpaces > 0) descParts.push(`${property.parkingSpaces} vagas`);
  if (property.type !== "TERRENO" && property.area > 0) descParts.push(`${property.area}m²`);
  if (property.totalArea && property.totalArea > 0) descParts.push(`${property.totalArea}m² terreno`);
  if (price) descParts.push(price);
  descParts.push(`${property.neighborhood}, ${property.city}/${property.state}`);

  const slug = property.slug || property.id;
  const hasImage = !!(property.images?.[0] || property.thumbnail);

  return {
    title: `${title} | Tappy Imob`,
    description: descParts.join(" · "),
    image: hasImage ? `${SITE_URL}/api/og-image/${slug}` : DEFAULT_IMAGE,
    url: `${SITE_URL}/imovel/${slug}`,
  };
}

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("path") || request.headers.get("x-crawler-path") || "/";

  let meta = {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
    image: DEFAULT_IMAGE,
    url: `${SITE_URL}${path}`,
    favicon: "/favicon.ico",
  };

  // A home agora apresenta o SaaS; o portal imobiliário permanece em /portal.
  if (path === "/") {
    meta.title = "TappyImob | CRM e gestão para o seu negócio imobiliário";
    meta.description = "CRM, imóveis, WhatsApp, inteligência artificial e gestão em um só lugar. Conecte o próximo capítulo da sua imobiliária.";
  }

  // Property page
  const propertyMatch = path.match(/^\/imovel\/(.+)$/);
  if (propertyMatch) {
    const propMeta = await getPropertyMeta(propertyMatch[1]);
    if (propMeta) {
      meta = { ...meta, ...propMeta };
    }
  }

  // /imoveis listing
  if (path.startsWith("/imoveis")) {
    meta.title = "Imóveis à Venda e Locação em Sua Cidade e Região | Tappy Imob";
    meta.description = "Encontre casas, apartamentos, terrenos e imóveis comerciais em Sua Cidade, Barueri, Santana de Parnaíba e região.";
  }

  // /vender
  if (path === "/vender") {
    meta.title = "Venda seu Imóvel | Tappy Imob";
    meta.description = "Avalie e venda seu imóvel em Sua Cidade e região com a Tappy Imob. Atendimento personalizado.";
  }

  return new NextResponse(html(meta), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
