"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  RiArrowRightLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiMapPinLine,
  RiHome4Line,
  RiCarLine,
  RiRulerLine,
} from "react-icons/ri";
import { IoBedOutline } from "react-icons/io5";

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
  price: number;
  rentPrice?: number;
  thumbnail: string | null;
  images: string[];
  condominium?: { id: string; name: string } | null;
  saleStatus?: string;
  rentalStatus?: string;
  websitePublishMode?: string;
};

const getEffectiveCategory = (imovel: ImovelAPI): string => {
  if (imovel.category !== "VENDA_LOCACAO") return imovel.category;
  const saleActive = imovel.saleStatus !== "VENDIDO";
  const rentalActive = imovel.rentalStatus !== "ALUGADO";
  if (imovel.websitePublishMode === "SALE_ONLY" || (saleActive && !rentalActive)) return "VENDA";
  if (imovel.websitePublishMode === "RENTAL_ONLY" || (!saleActive && rentalActive)) return "LOCACAO";
  return "VENDA_LOCACAO";
};

const getDisplayPrice = (imovel: ImovelAPI): string => {
  const cat = getEffectiveCategory(imovel);
  if (cat === "LOCACAO" && imovel.rentPrice) return `R$ ${imovel.rentPrice.toLocaleString("pt-BR")}/mês`;
  return `R$ ${imovel.price.toLocaleString("pt-BR")}`;
};

function EspecialCard({ imovel }: { imovel: ImovelAPI }) {
  const images = imovel.images?.length > 0
    ? imovel.images
    : [imovel.thumbnail || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80"];
  const [currentImage, setCurrentImage] = useState(0);

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <Link href={`/imovel/${imovel.slug || imovel.id}`} target="_blank">
      <div className="group relative bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-neutral-100 dark:border-neutral-800">
        {/* Image Container */}
        <div className="relative h-[280px] overflow-hidden">
          <Image
            src={images[currentImage]}
            alt={imovel.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
          />

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2 z-10">
            {imovel.isExclusive && (
              <span className="px-3 py-1 bg-[#25D366] text-white text-xs font-bold uppercase rounded-full shadow-lg">
                Exclusivo
              </span>
            )}
            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-neutral-900 text-xs font-semibold rounded-full shadow-lg">
              {imovel.code}
            </span>
          </div>

          {/* Category Badge */}
          <div className="absolute top-4 right-4 flex gap-1.5 z-10">
            {(getEffectiveCategory(imovel) === "VENDA" || getEffectiveCategory(imovel) === "VENDA_LOCACAO") && (
              <span className="px-3 py-1 bg-[#0B2545] text-white text-xs font-bold uppercase rounded-full">
                Venda
              </span>
            )}
            {(getEffectiveCategory(imovel) === "LOCACAO" || getEffectiveCategory(imovel) === "VENDA_LOCACAO") && (
              <span className="px-3 py-1 bg-[#25D366] text-white text-xs font-bold uppercase rounded-full">
                Locação
              </span>
            )}
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                aria-label="Foto anterior"
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white transition-colors z-20"
              >
                <RiArrowLeftSLine className="w-4 h-4 text-neutral-700" />
              </button>
              <button
                onClick={nextImage}
                aria-label="Próxima foto"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white transition-colors z-20"
              >
                <RiArrowRightSLine className="w-4 h-4 text-neutral-700" />
              </button>
            </>
          )}

          {/* Image dots (max 5 visible) */}
          {images.length > 1 && (() => {
            const total = images.length;
            const maxDots = 5;
            let start = 0;
            if (total > maxDots) {
              start = Math.min(Math.max(currentImage - Math.floor(maxDots / 2), 0), total - maxDots);
            }
            const visibleCount = Math.min(total, maxDots);
            return (
              <div className="absolute bottom-[60px] right-4 flex gap-1 items-center z-20">
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
                          ? "w-5 h-1.5 bg-white"
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

          {/* Price on Image */}
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <p className="text-white/80 text-sm mb-1 flex items-center gap-1">
              <RiMapPinLine className="w-4 h-4" />
              {imovel.neighborhood}, {imovel.city}
            </p>
            <p className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
              {getDisplayPrice(imovel)}
            </p>
          </div>
        </div>

        {/* Content - Compacto */}
        <div className="p-4">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-3 line-clamp-1 group-hover:text-[#0B2545] dark:group-hover:text-amber-400 transition-colors">
            {imovel.condominium?.name || imovel.title}
          </h3>

          {/* Features - Inline */}
          <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="flex items-center gap-1">
              <IoBedOutline className="w-4 h-4" />
              <strong className="text-neutral-700 dark:text-neutral-200">{imovel.bedrooms}</strong> qts
            </span>
            <span className="flex items-center gap-1">
              <RiCarLine className="w-4 h-4" />
              <strong className="text-neutral-700 dark:text-neutral-200">{imovel.parkingSpaces}</strong> vg
            </span>
            <span className="flex items-center gap-1">
              <RiRulerLine className="w-4 h-4" />
              <strong className="text-neutral-700 dark:text-neutral-200">{imovel.area}</strong>m²
            </span>
            <RiArrowRightLine className="w-4 h-4 ml-auto text-[#0B2545] dark:text-amber-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ImoveisDestaqueEspecial({ initialImoveis }: { initialImoveis?: ImovelAPI[] } = {}) {
  const [imoveis, setImoveis] = useState<ImovelAPI[]>(initialImoveis || []);
  const [loading, setLoading] = useState(!initialImoveis?.length);

  useEffect(() => {
    if (initialImoveis?.length) {
      setLoading(false);
      return;
    }
    const fetchImoveis = async () => {
      try {
        // Buscar 3 imóveis em destaque
        const res = await fetch("/api/properties?isFeatured=true&limit=3&status=DISPONIVEL&showOnWebsite=true&fields=minimal");
        if (res.ok) {
          const data = await res.json();
          if (data.properties) {
            setImoveis(data.properties.slice(0, 3));
          }
        }
      } catch (error) {
        console.error("Erro ao buscar imóveis:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImoveis();
  }, []);

  const formatPrice = (price: number) => {
    return `R$ ${price.toLocaleString("pt-BR")}`;
  };

  if (loading) {
    return (
      <section className="py-4 md:py-8 bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-950">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[400px] bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (imoveis.length === 0) return null;

  return (
    <section className="py-4 md:py-8 bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-950 overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#25D366] text-white text-[10px] font-semibold uppercase rounded">Premium</span>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Seleção Especial</h3>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {imoveis.map((imovel) => (
            <EspecialCard key={imovel.id} imovel={imovel} />
          ))}
        </div>
      </div>
    </section>
  );
}
