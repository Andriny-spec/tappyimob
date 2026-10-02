const STORAGE_KEY = "tappyimob_recently_viewed";
const MAX_ITEMS = 20;

// Histórico de navegação por visitante (client-only, via localStorage) — usado
// pela seção "Vistos Recentemente" da home. Não depende de contadores globais.
export function recordRecentlyViewed(propertyId: string) {
  if (typeof window === "undefined" || !propertyId) return;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const ids: string[] = stored ? JSON.parse(stored) : [];
    const filtered = ids.filter((id) => id !== propertyId);
    filtered.unshift(propertyId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, MAX_ITEMS)));
  } catch {
    // localStorage indisponível (modo privado, etc.) — ignora silenciosamente
  }
}

export function getRecentlyViewedIds(excludeId?: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const ids: string[] = stored ? JSON.parse(stored) : [];
    return excludeId ? ids.filter((id) => id !== excludeId) : ids;
  } catch {
    return [];
  }
}
