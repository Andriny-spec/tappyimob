"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type FavoriteProperty = {
  id: string;
  slug?: string;
  title: string;
  price: number;
  thumbnail?: string;
};

type FavoritesContextType = {
  favorites: FavoriteProperty[];
  favoriteIds: Set<string>;
  addFavorite: (property: FavoriteProperty) => void;
  removeFavorite: (id: string) => void;
  toggleFavorite: (property: FavoriteProperty) => boolean;
  isFavorite: (id: string) => boolean;
  isLoading: boolean;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteProperty[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Carregar favoritos do localStorage ao iniciar
  useEffect(() => {
    const stored = localStorage.getItem("tappyimob_favorites");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as FavoriteProperty[];
        setFavorites(parsed);
        setFavoriteIds(new Set(parsed.map(f => f.id)));
      } catch (e) {
        console.error("Erro ao carregar favoritos:", e);
      }
    }
    setIsLoading(false);
  }, []);

  // Salvar no localStorage quando mudar
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("tappyimob_favorites", JSON.stringify(favorites));
    }
  }, [favorites, isLoading]);

  const addFavorite = (property: FavoriteProperty) => {
    if (!favoriteIds.has(property.id)) {
      setFavorites(prev => [...prev, property]);
      setFavoriteIds(prev => new Set([...prev, property.id]));
    }
  };

  const removeFavorite = (id: string) => {
    setFavorites(prev => prev.filter(f => f.id !== id));
    setFavoriteIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const toggleFavorite = (property: FavoriteProperty): boolean => {
    if (favoriteIds.has(property.id)) {
      removeFavorite(property.id);
      return false;
    } else {
      addFavorite(property);
      return true;
    }
  };

  const isFavorite = (id: string): boolean => {
    return favoriteIds.has(id);
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      favoriteIds,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      isFavorite,
      isLoading,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
