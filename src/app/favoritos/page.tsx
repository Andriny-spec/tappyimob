"use client";

import { useFavorites } from "@/contexts/FavoritesContext";
import { RiHeartLine, RiHeartFill, RiArrowLeftLine } from "react-icons/ri";
import Link from "next/link";
import Image from "next/image";

function formatPrice(value: number) {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1).replace(".", ",")} mi`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)} mil`;
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function FavoritosPage() {
  const { favorites, removeFavorite, isLoading } = useFavorites();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#0B2545] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            <RiArrowLeftLine className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          </Link>
          <div className="flex items-center gap-2">
            <RiHeartFill className="w-5 h-5 text-[#25D366]" />
            <h1 className="text-lg font-bold text-neutral-900 dark:text-white">Meus Favoritos</h1>
          </div>
          {favorites.length > 0 && (
            <span className="ml-auto text-sm text-neutral-500">{favorites.length} imóvel{favorites.length !== 1 ? "is" : ""}</span>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
              <RiHeartLine className="w-10 h-10 text-neutral-400" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Nenhum favorito salvo</h2>
            <p className="text-neutral-500 text-sm mb-6 max-w-xs">
              Clique no coração nos cards de imóveis para salvar seus favoritos
            </p>
            <Link
              href="/imoveis"
              className="px-6 py-3 bg-[#0B2545] text-white rounded-xl font-medium hover:bg-[#152a45] transition-colors"
            >
              Explorar imóveis
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {favorites.map((fav) => (
              <div
                key={fav.id}
                className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex gap-3 p-3"
              >
                <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-neutral-100">
                  {fav.thumbnail ? (
                    <Image src={fav.thumbnail} alt={fav.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400 text-2xl">🏠</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={fav.slug ? `/imovel/${fav.slug}` : `/imovel/${fav.id}`}>
                    <p className="font-semibold text-neutral-900 dark:text-white text-sm truncate hover:text-[#0B2545] dark:hover:text-orange-400 transition-colors">
                      {fav.title}
                    </p>
                  </Link>
                  {fav.price > 0 && (
                    <p className="text-[#0B2545] dark:text-orange-400 font-bold text-sm mt-0.5">
                      {formatPrice(fav.price)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeFavorite(fav.id)}
                  className="flex-shrink-0 p-2 text-[#25D366] hover:text-red-500 transition-colors"
                  aria-label="Remover dos favoritos"
                >
                  <RiHeartFill className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
