"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiHeartLine,
  RiHeartFill,
  RiMapPinLine,
} from "react-icons/ri";
import { useTracking } from "@/hooks/useTracking";
import { useFavorites } from "@/contexts/FavoritesContext";
import { getRecentlyViewedIds } from "@/lib/recently-viewed";

// Tipo do imóvel vindo da API
export type ImovelAPI = {
  id: string;
  slug?: string;
  code: string;
  title: string;
  category: string;
  isExclusive: boolean;
  isFeatured: boolean;
  neighborhood: string;
  city: string;
  bedrooms: number;
  suites: number;
  parkingSpaces: number;
  area: number;
  totalArea?: number;
  price: number;
  rentPrice: number;
  thumbnail: string | null;
  images: string[];
  createdAt: string;
  condominium?: { id: string; name: string } | null;
  saleStatus?: string;
  rentalStatus?: string;
  websitePublishMode?: string;
};

// Tipo interno para o card
type Imovel = {
  id: string;
  slug?: string;
  ref: string;
  titulo: string;
  categoria: string; // VENDA, LOCACAO, VENDA_LOCACAO
  exclusivo: boolean;
  localizacao: string;
  dormitorios: number;
  suites: number;
  garagens: number;
  areaConstruida: number;
  areaTerreno?: number;
  preco: number;
  precoAluguel?: number;
  imagens: string[];
};

// Computar categoria efetiva (para VENDA_LOCACAO, checar status)
const getEffectiveCategoria = (imovel: ImovelAPI): string => {
  if (imovel.category !== "VENDA_LOCACAO") return imovel.category;
  const saleActive = imovel.saleStatus !== "VENDIDO";
  const rentalActive = imovel.rentalStatus !== "ALUGADO";
  if (imovel.websitePublishMode === "SALE_ONLY" || (saleActive && !rentalActive)) return "VENDA";
  if (imovel.websitePublishMode === "RENTAL_ONLY" || (!saleActive && rentalActive)) return "LOCACAO";
  return "VENDA_LOCACAO";
};

// Converter imóvel da API para o formato do card
const convertToCardFormat = (imovel: ImovelAPI): Imovel => ({
  id: imovel.id,
  slug: imovel.slug,
  ref: imovel.code,
  titulo: imovel.condominium?.name || imovel.title,
  categoria: getEffectiveCategoria(imovel),
  exclusivo: imovel.isExclusive,
  localizacao: `${imovel.neighborhood} - ${imovel.city}`,
  dormitorios: imovel.bedrooms,
  suites: imovel.suites,
  garagens: imovel.parkingSpaces,
  areaConstruida: imovel.area,
  areaTerreno: imovel.totalArea,
  preco: imovel.price,
  precoAluguel: imovel.rentPrice,
  imagens: imovel.images.length > 0 
    ? imovel.images 
    : [imovel.thumbnail || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80"],
});

// Componente do Card de Imóvel
function ImovelCard({ imovel }: { imovel: Imovel }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const { trackClick, trackFavorite } = useTracking();
  const { isFavorite, toggleFavorite } = useFavorites();
  
  const favorito = isFavorite(imovel.id);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev + 1) % imovel.imagens.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev - 1 + imovel.imagens.length) % imovel.imagens.length);
  };

  const formatPrice = (price: number, isRent?: boolean) => {
    if (price === 0) return null;
    return `R$ ${price.toLocaleString("pt-BR")}${isRent ? "/mês" : ""}`;
  };

  // Determinar qual preço mostrar baseado na categoria
  const getDisplayPrice = () => {
    if (imovel.categoria === "LOCACAO") {
      return formatPrice(imovel.precoAluguel || 0, true);
    }
    if (imovel.categoria === "VENDA_LOCACAO") {
      if (imovel.preco > 0) return formatPrice(imovel.preco);
      return formatPrice(imovel.precoAluguel || 0, true);
    }
    return formatPrice(imovel.preco);
  };

  const handleCardClick = () => {
    trackClick(imovel.id);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newFavoriteState = toggleFavorite({
      id: imovel.id,
      title: imovel.titulo,
      price: imovel.preco,
      thumbnail: imovel.imagens[0],
    });
    trackFavorite(imovel.id, newFavoriteState);
  };

  return (
    <Link href={`/imovel/${imovel.slug || imovel.id}`} target="_blank" onClick={handleCardClick}>
      <motion.div
        className="flex-shrink-0 w-[75vw] sm:w-[220px] bg-white dark:bg-neutral-900 rounded-xl overflow-hidden shadow-md border border-neutral-100 dark:border-neutral-800 group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        {/* Image Slider */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src={imovel.imagens[currentImage]}
              alt={imovel.titulo}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              loading="lazy"
            />
          </div>

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Badges no topo */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
            {imovel.exclusivo && (
              <span className="px-2 py-0.5 bg-[#25D366] text-white text-[9px] font-bold uppercase rounded">
                Exclusivo
              </span>
            )}
          </div>

          {/* Badges no bottom-left */}
          <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
            <span className="px-1.5 py-0.5 bg-neutral-900/80 backdrop-blur-sm text-white text-[11px] font-semibold rounded">
              {imovel.ref}
            </span>
            {(imovel.categoria === "VENDA" || imovel.categoria === "VENDA_LOCACAO") && (
              <span className="px-1.5 py-0.5 bg-[#0B2545] text-white text-[9px] font-bold uppercase rounded">
                Venda
              </span>
            )}
          </div>

          {/* Navigation Arrows - always visible */}
          {imovel.imagens.length > 1 && (
            <>
              <button
                onClick={prevImage}
                aria-label="Foto anterior"
                className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white transition-colors z-10"
              >
                <RiArrowLeftSLine className="w-4 h-4 text-neutral-700" />
              </button>
              <button
                onClick={nextImage}
                aria-label="Próxima foto"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white transition-colors z-10"
              >
                <RiArrowRightSLine className="w-4 h-4 text-neutral-700" />
              </button>
            </>
          )}

          {/* Image dots (max 5 visible) */}
          {imovel.imagens.length > 1 && (() => {
            const total = imovel.imagens.length;
            const maxDots = 5;
            let start = 0;
            if (total > maxDots) {
              start = Math.min(Math.max(currentImage - Math.floor(maxDots / 2), 0), total - maxDots);
            }
            const visibleCount = Math.min(total, maxDots);
            return (
              <div className="absolute bottom-3 right-2 flex gap-1 items-center z-10">
                {Array.from({ length: visibleCount }).map((_, i) => {
                  const idx = start + i;
                  const isActive = idx === currentImage;
                  const isEdge = total > maxDots && (i === 0 || i === visibleCount - 1) && !isActive;
                  return (
                    <button
                      key={idx}
                      aria-label={`Ir para foto ${idx + 1}`}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImage(idx); }}
                      className={`rounded-full transition-all ${
                        isActive
                          ? "w-4 h-1.5 bg-white"
                          : isEdge
                            ? "w-1 h-1 bg-white/40"
                            : "w-1.5 h-1.5 bg-white/60"
                      }`}
                    />
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* Content */}
        <div className="p-3 sm:p-3">
          {/* Location */}
          <div className="flex items-center gap-1 text-neutral-500 text-[11px] sm:text-[10px] mb-1 sm:mb-0.5">
            <RiMapPinLine className="w-3 h-3 text-[#0B2545] flex-shrink-0" />
            <span className="truncate">{imovel.localizacao}</span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-neutral-900 dark:text-white text-base sm:text-sm mb-2 line-clamp-2 leading-snug">
            {imovel.titulo}
          </h3>

          {/* Info */}
          <div className="flex items-center gap-3 sm:gap-2 text-xs sm:text-[10px] text-neutral-500 mb-2 sm:mb-1.5">
            {imovel.dormitorios > 0 && <span><strong className="text-neutral-800 dark:text-white">{imovel.dormitorios}</strong> qts</span>}
            {imovel.garagens > 0 && <span><strong className="text-neutral-800 dark:text-white">{imovel.garagens}</strong> vgs</span>}
            {(imovel.areaConstruida > 0 || (imovel.areaTerreno && imovel.areaTerreno > 0)) && (
              <span><strong className="text-neutral-800 dark:text-white">{imovel.areaConstruida > 0 ? imovel.areaConstruida : imovel.areaTerreno}</strong>m²</span>
            )}
          </div>

          {/* Price and Favorite */}
          <div className="flex items-center justify-between pt-2 sm:pt-1.5 border-t border-neutral-100 dark:border-neutral-800">
            <span className={`text-lg sm:text-base font-bold ${imovel.categoria === "LOCACAO" ? "text-[#25D366]" : "text-[#0B2545] dark:text-sky-400"}`}>
              {getDisplayPrice() || "Consulte"}
            </span>
            <button
              onClick={handleFavorite}
              aria-label={favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              className={`w-8 h-8 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all ${
                favorito 
                  ? "bg-red-50 dark:bg-red-500/10 text-red-500" 
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 hover:text-red-500"
              }`}
            >
              {favorito ? <RiHeartFill className="w-4 h-4" /> : <RiHeartLine className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

// Componente de Carrossel Reutilizável
function CarrosselRow({ imoveis }: { imoveis: Imovel[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setTimeout(checkScroll, 300);
    }
  };

  if (imoveis.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500">
        Nenhum imóvel encontrado
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Navigation Arrows - Floating */}
      <div className="hidden md:flex absolute -top-14 right-0 items-center gap-2 z-20">
        <motion.button
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            canScrollLeft
              ? "bg-[#0B2545] text-white hover:bg-[#081733]"
              : "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed"
          }`}
        >
          <RiArrowLeftSLine className="w-5 h-5" />
        </motion.button>
        <motion.button
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            canScrollRight
              ? "bg-[#0B2545] text-white hover:bg-[#081733]"
              : "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed"
          }`}
        >
          <RiArrowRightSLine className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Carrossel — contido na largura do container (mesma largura de header/footer) */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {imoveis.map((imovel) => (
          <div key={imovel.id} style={{ scrollSnapAlign: "start" }}>
            <ImovelCard imovel={imovel} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ImoveisDestaque({
  initialDestaques,
}: { initialDestaques?: ImovelAPI[] } = {}) {
  const [destaques, setDestaques] = useState<Imovel[]>(() => (initialDestaques || []).map(convertToCardFormat));
  const [recentes, setRecentes] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(!initialDestaques?.length);

  // "Mais Procurados": imóveis mais vistos no site numa janela recente (não vitalícia),
  // só busca se não recebeu dados pré-carregados do server.
  useEffect(() => {
    if (initialDestaques?.length) {
      setLoading(false);
      return;
    }
    const fetchDestaques = async () => {
      try {
        const res = await fetch("/api/properties/mais-procurados?limit=10");
        if (res.ok) {
          const data = await res.json();
          const properties: ImovelAPI[] = data.properties || [];
          setDestaques(properties.map(convertToCardFormat));
        }
      } catch (error) {
        console.error("Erro ao buscar mais procurados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDestaques();
  }, [initialDestaques]);

  // "Vistos Recentemente": histórico real de navegação do próprio visitante,
  // guardado no localStorage (client-only — nunca vem do server).
  useEffect(() => {
    const ids = getRecentlyViewedIds().slice(0, 10);
    if (ids.length === 0) return;
    const fetchRecentes = async () => {
      try {
        const res = await fetch(`/api/properties?ids=${ids.join(",")}&fields=minimal&limit=${ids.length}`);
        if (res.ok) {
          const data = await res.json();
          const properties: ImovelAPI[] = data.properties || [];
          const byId = new Map(properties.map((p) => [p.id, p]));
          const ordered = ids
            .map((id) => byId.get(id))
            .filter((p): p is ImovelAPI => !!p);
          setRecentes(ordered.map(convertToCardFormat));
        }
      } catch (error) {
        console.error("Erro ao buscar vistos recentemente:", error);
      }
    };

    fetchRecentes();
  }, []);

  return (
    <section className="pt-2 md:pt-4 pb-4 md:pb-8 bg-white dark:bg-neutral-950 overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header Principal */}
      

        {/* Loading State */}
        {loading ? (
          <div className="space-y-8">
            {[0, 1].map((row) => (
              <div key={row}>
                <div className="h-8 w-48 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse mb-4" />
                <div className="flex gap-4 overflow-hidden">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex-shrink-0 w-[75vw] sm:w-[220px] rounded-xl overflow-hidden border border-neutral-100 dark:border-neutral-800">
                      <div className="aspect-[4/3] bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
                      <div className="p-3 space-y-2">
                        <div className="h-3 w-24 rounded bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
                        <div className="h-4 w-full rounded bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
                        <div className="h-3 w-32 rounded bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
                        <div className="h-5 w-28 rounded bg-neutral-100 dark:bg-neutral-800 animate-pulse mt-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Primeira Linha - Destaques */}
            {destaques.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-[#0B2545]/5 border border-[#0B2545]/15">
                    <div className="w-1.5 h-6 rounded-full bg-[#0B2545]" />
                    <h3 className="text-lg font-bold text-[#0B2545] dark:text-white">Mais Procurados</h3>
                    <span className="px-2.5 py-0.5 bg-[#0B2545] text-white text-[10px] font-bold uppercase rounded-full">Destaque</span>
                  </div>
                  <Link
                    href="/imoveis"
                    className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-[#0B2545] dark:text-sky-400 hover:underline"
                  >
                    Ver todos
                    <RiArrowRightSLine className="w-4 h-4" />
                  </Link>
                </div>
                <CarrosselRow imoveis={destaques} />
              </div>
            )}

            {/* Segunda Linha - Recentes */}
            {recentes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-[#25D366]/5 border border-[#25D366]/15">
                    <div className="w-1.5 h-6 rounded-full bg-[#25D366]" />
                    <h3 className="text-lg font-bold text-[#25D366] dark:text-white">Vistos Recentemente</h3>
                    <span className="px-2.5 py-0.5 bg-[#25D366] text-white text-[10px] font-bold uppercase rounded-full">Popular</span>
                  </div>
                </div>
                <CarrosselRow imoveis={recentes} />
              </div>
            )}

            {/* Sem imóveis */}
            {destaques.length === 0 && recentes.length === 0 && (
              <div className="text-center py-16">
                <p className="text-neutral-500">Nenhum imóvel disponível no momento.</p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
