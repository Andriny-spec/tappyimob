/**
 * Limpa descrições de imóveis removendo tags HTML, markdown e caracteres especiais
 */
export function cleanDescription(text: string | null | undefined): string {
  if (!text) return "";

  let cleaned = text;

  // Remove tags HTML completas
  cleaned = cleaned.replace(/<[^>]*>/g, "");

  // Remove entidades HTML comuns
  cleaned = cleaned.replace(/&nbsp;/g, " ");
  cleaned = cleaned.replace(/&amp;/g, "&");
  cleaned = cleaned.replace(/&lt;/g, "<");
  cleaned = cleaned.replace(/&gt;/g, ">");
  cleaned = cleaned.replace(/&quot;/g, '"');
  cleaned = cleaned.replace(/&#39;/g, "'");
  cleaned = cleaned.replace(/&apos;/g, "'");

  // Remove markdown bold/italic
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, "$1"); // **bold**
  cleaned = cleaned.replace(/\*([^*]+)\*/g, "$1"); // *italic*
  cleaned = cleaned.replace(/__([^_]+)__/g, "$1"); // __bold__
  cleaned = cleaned.replace(/_([^_]+)_/g, "$1"); // _italic_

  // Remove markdown headers
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, "");

  // Remove markdown links mantendo o texto
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  // Remove markdown images
  cleaned = cleaned.replace(/!\[([^\]]*)\]\([^)]+\)/g, "");

  // Remove caracteres de escape
  cleaned = cleaned.replace(/\\([*_`#])/g, "$1");

  // Remove múltiplas quebras de linha consecutivas (máximo 2)
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  // Remove espaços múltiplos
  cleaned = cleaned.replace(/  +/g, " ");

  // Remove espaços no início e fim de cada linha
  cleaned = cleaned
    .split("\n")
    .map((line) => line.trim())
    .join("\n");

  // Remove espaços no início e fim do texto
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Aplica limpeza em lote para múltiplos campos de descrição
 */
export function cleanPropertyDescriptions(property: any): any {
  return {
    ...property,
    description: cleanDescription(property.description),
    shortDescription: cleanDescription(property.shortDescription),
    condoDescription: cleanDescription(property.condoDescription),
    exchangeDescription: cleanDescription(property.exchangeDescription),
  };
}
