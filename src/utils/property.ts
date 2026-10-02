/**
 * Utilitários para propriedades
 */

/**
 * Extrai apenas o nome do condomínio para exibição (remove prefixos tipo "Casa no", "Apartamento no")
 * Mantém o título original para SEO nas meta tags
 */
export function getDisplayTitle(title: string): string {
  if (!title) return "";
  return title.replace(/^(Casa|Apartamento|Terreno|Sala|Loja|Galpão|Ponto|Prédio|Sobrado|Cobertura|Flat|Studio|Kitnet|Loft|Chácara|Sítio|Fazenda)\s+(no|na|em|à venda no|à venda na|para locação no|para locação na)\s+/i, "");
}
