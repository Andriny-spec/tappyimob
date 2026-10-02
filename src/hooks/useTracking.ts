"use client";

import { useCallback, useRef } from "react";

type TrackingEvent = "view" | "click" | "favorite" | "unfavorite" | "share";

export function useTracking() {
  // Evitar múltiplos tracks do mesmo evento
  const trackedViews = useRef<Set<string>>(new Set());

  const track = useCallback(async (propertyId: string, event: TrackingEvent) => {
    // Para views, evitar duplicatas na mesma sessão
    if (event === "view") {
      const key = `${propertyId}-view`;
      if (trackedViews.current.has(key)) {
        return;
      }
      trackedViews.current.add(key);
    }

    try {
      await fetch("/api/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, event }),
      });
    } catch (error) {
      console.error("Erro no tracking:", error);
    }
  }, []);

  const trackView = useCallback((propertyId: string) => {
    track(propertyId, "view");
  }, [track]);

  const trackClick = useCallback((propertyId: string) => {
    track(propertyId, "click");
    // Disparar evento customizado para o PopupBanner
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("propertyClick"));
    }
  }, [track]);

  const trackFavorite = useCallback((propertyId: string, isFavorite: boolean) => {
    track(propertyId, isFavorite ? "favorite" : "unfavorite");
  }, [track]);

  const trackShare = useCallback((propertyId: string) => {
    track(propertyId, "share");
  }, [track]);

  return {
    track,
    trackView,
    trackClick,
    trackFavorite,
    trackShare,
  };
}
