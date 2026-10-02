import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Revalidar a cada 1 hora

const BASE_URL = "https://www.tappyimob.com.br";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Páginas estáticas
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/imoveis`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/condominios`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/encontre-seu-imovel`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/calculadora`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contato`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/sobre`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/vender`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/corretor-parceiro`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/gestao-exclusiva`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/regularizacao`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/off-market`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacidade`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/termos`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Imóveis disponíveis e visíveis no site
  const properties = await prisma.property.findMany({
    where: {
      status: "DISPONIVEL",
      showOnWebsite: true,
      isOffMarket: false,
    },
    select: {
      id: true,
      slug: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const propertyPages: MetadataRoute.Sitemap = properties.map((property) => ({
    url: `${BASE_URL}/imovel/${property.slug || property.id}`,
    lastModified: property.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Blog posts publicados
  const posts = await prisma.post.findMany({
    where: {
      status: "PUBLICADO",
    },
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Condomínios
  const condominiums = await prisma.condominium.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      slug: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const condominiumPages: MetadataRoute.Sitemap = condominiums.map((condo) => ({
    url: `${BASE_URL}/condominio/${condo.slug || condo.id}`,
    lastModified: condo.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...propertyPages, ...blogPages, ...condominiumPages];
}
