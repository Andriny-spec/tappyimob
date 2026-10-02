import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/corretor",
          "/corretor/*",
          "/fotografo",
          "/fotografo/*",
          "/api",
          "/api/*",
          "/login",
          "/register",
          "/forgot-password",
          "/manutencao",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/admin",
          "/corretor",
          "/fotografo",
          "/api",
          "/login",
        ],
      },
    ],
    sitemap: "https://www.tappyimob.com.br/sitemap.xml",
  };
}
