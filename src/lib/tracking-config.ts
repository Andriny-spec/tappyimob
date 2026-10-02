export const TRACKING_CONFIG_KEY = "marketing_tracking_ids";

// Valores originalmente hardcoded em TrackingScripts.tsx — usados como fallback
// enquanto ninguém salvou uma config própria (editável em /admin/marketing/configuracoes).
export const DEFAULT_TRACKING_CONFIG = {
  gtmId: "GTM-M94LJHT",
  ga4Id: "G-RSWFRX3J7D",
  metaPixelId: "166571789168288",
  metaPixelIdSummit: "1640174846844504",
  googleAdsId: "",
};

export type TrackingConfig = typeof DEFAULT_TRACKING_CONFIG;
