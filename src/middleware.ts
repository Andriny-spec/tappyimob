import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { canAccessModule, moduleForApiPath } from "@/lib/api-modules";

// Crawlers que precisam de OG meta tags no <head>
const CRAWLER_UAS = [
  "facebookexternalhit", "Facebot", "WhatsApp", "Twitterbot",
  "LinkedInBot", "Slackbot", "TelegramBot", "Pinterest",
  "Discordbot", "Embedly", "Quora Link Preview", "Showyoubot",
  "vkShare", "Slack-ImgProxy", "redditbot",
];

// Rotas que NUNCA são afetadas pela manutenção
const EXCLUDED_PATHS = [
  "/admin",
  "/login",
  "/manutencao",
  "/tappysummit",
  "/tappy-galeria",
  "/campanha-summit",
  "/corretor-parceiro",
  "/api",
  "/_next",
  "/favicon",
  "/static",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Guard de módulo nas rotas de admin (Bloco A — permissão por módulo na API).
  // Só adiciona a camada 403 quando o usuário ESTÁ autenticado mas não tem o
  // módulo; autenticação/401 continua sendo feita pelos próprios handlers.
  if (pathname === "/api/admin" || pathname.startsWith("/api/admin/")) {
    const moduleKey = moduleForApiPath(pathname);
    if (moduleKey) {
      const auth = request.headers.get("authorization");
      const token = auth?.startsWith("Bearer ")
        ? auth.slice(7).trim()
        : request.cookies.get("auth-token")?.value;

      if (token) {
        const session = await verifyToken(token);
        if (session && !canAccessModule(session, moduleKey)) {
          return NextResponse.json(
            { error: "Sem permissão para este módulo" },
            { status: 403 }
          );
        }
      }
    }
  }

  // Não verifica em rotas excluídas
  const isExcluded = EXCLUDED_PATHS.some((path) => pathname.startsWith(path));
  if (isExcluded) {
    return NextResponse.next();
  }

  // Detectar crawlers e servir HTML com OG tags no <head>
  const ua = request.headers.get("user-agent") || "";
  const isCrawler = CRAWLER_UAS.some((bot) => ua.toLowerCase().includes(bot.toLowerCase()));
  if (isCrawler) {
    const crawlerUrl = new URL(`/api/crawler?path=${encodeURIComponent(pathname)}`, request.url);
    const response = NextResponse.rewrite(crawlerUrl);
    response.headers.set("x-crawler-path", pathname);
    return response;
  }

  try {
    // Usa nextUrl.origin para construir URL interna (funciona dentro do Docker)
    const apiUrl = new URL("/api/maintenance/status", request.nextUrl.origin);
    
    const res = await fetch(apiUrl, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data.isActive) {
        return NextResponse.redirect(new URL("/manutencao", request.url));
      }
    }
  } catch (error) {
    // Silently ignore - maintenance check is not critical
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Aplica em todas as rotas exceto arquivos estáticos
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
