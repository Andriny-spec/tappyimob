import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Portais disponíveis no sistema
const PORTAIS_CONFIG = [
  { id: "zap", nome: "ZAP Imóveis", grupo: "Grupo ZAP+", filterKeys: ["zap"] },
  { id: "vivareal", nome: "VivaReal", grupo: "Grupo ZAP+", filterKeys: ["zap"] },
  { id: "olx", nome: "OLX", grupo: "Grupo ZAP+", filterKeys: ["zap", "olx"] },
  { id: "imovelweb", nome: "Imóvel Web", grupo: null, filterKeys: ["imovelweb"] },
  { id: "chavesnamao", nome: "Chaves na Mão", grupo: null, filterKeys: ["chavesnamao"] },
  { id: "trovit", nome: "Trovit", grupo: null, filterKeys: ["trovit"] },
  { id: "123i", nome: "123i", grupo: null, filterKeys: ["123i"] },
  { id: "casaminheira", nome: "Casa Mineira", grupo: null, filterKeys: ["casaminheira"] },
  { id: "lugarcerto", nome: "Lugar Certo", grupo: null, filterKeys: ["lugarcerto"] },
];

export async function GET(request: NextRequest) {
  try {
    // Buscar imóveis exportáveis — MESMO critério do feed real (/api/integrations/portals):
    // status DISPONIVEL + não off-market + visível no site.
    // Mantém a contagem do painel idêntica ao que é realmente exportado.
    const properties = await prisma.property.findMany({
      where: {
        status: "DISPONIVEL",
        isOffMarket: false,
        showOnWebsite: { not: false },
      },
      select: {
        id: true,
        activePortals: true,
        portalPositions: true,
        portalViews: true,
        views: true,
      },
    });

    // Contar imóveis por portal
    const portalStats = PORTAIS_CONFIG.map((portal) => {
      const published = properties.filter((p) =>
        p.activePortals.some((ap) => portal.filterKeys.includes(ap))
      );

      const totalViews = published.reduce((sum, p) => sum + (p.portalViews || 0), 0);

      // Contar destaques
      const destaques = published.filter((p) => {
        const positions = p.portalPositions as Record<string, string> | null;
        return positions?.[portal.id] === "destaque";
      }).length;

      return {
        id: portal.id,
        nome: portal.nome,
        grupo: portal.grupo,
        imoveisPublicados: published.length,
        destaques,
        visualizacoes: totalViews,
      };
    });

    // Stats gerais
    const portaisAtivos = portalStats.filter((p) => p.imoveisPublicados > 0).length;
    const totalPublicados = properties.filter((p) => p.activePortals.length > 0).length;
    const totalViews = properties.reduce((sum, p) => sum + (p.portalViews || 0), 0);

    return NextResponse.json({
      stats: {
        portaisAtivos,
        totalPublicados,
        totalViews,
        totalImoveisDisponiveis: properties.length,
      },
      portais: portalStats,
    });
  } catch (error) {
    console.error("Error fetching portal stats:", error);
    return NextResponse.json(
      { error: "Erro ao buscar estatísticas de portais" },
      { status: 500 }
    );
  }
}
