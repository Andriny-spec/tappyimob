"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiHeartLine,
  RiHeartFill,
  RiMapPinLine,
  RiLockLine,
  RiEyeOffLine,
  RiHotelBedLine,
  RiCarLine,
  RiRuler2Line,
  RiLandscapeLine,
} from "react-icons/ri";
import { useTracking } from "@/hooks/useTracking";
import { useFavorites } from "@/contexts/FavoritesContext";
import { OffMarketAccessModal } from "@/components/OffMarketAccessModal";

import type { ImovelData } from "./ImovelCard";

interface ImovelCardMiniProps {
  imovel: ImovelData;
}

export function ImovelCardMini({ imovel }: ImovelCardMiniProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [showAccessModal, setShowAccessModal] = useState(false);
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

  // Verificar se é apartamento ou casa
  const isApartamento = imovel.tipo?.toLowerCase().includes("apartamento") || 
                        imovel.tipo?.toLowerCase().includes("cobertura") ||
                        imovel.tipo?.toLowerCase().includes("flat") ||
                        imovel.tipo?.toLowerCase().includes("studio");
  
  const isCasa = imovel.tipo?.toLowerCase().includes("casa") || 
                 imovel.tipo?.toLowerCase().includes("sobrado") ||
                 imovel.tipo?.toLowerCase().includes("terrea");

  const handleCardClick = () => {
    // Tracking de clique no card
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

  // Se for Off Market, não usa Link, abre o formulário de solicitação de acesso
  const CardWrapper = imovel.isOffMarket ? 'div' : Link;
  const cardProps = imovel.isOffMarket
    ? {
        onClick: (e: React.MouseEvent) => {
          e.preventDefault();
          setShowAccessModal(true);
        },
        className: "cursor-pointer block h-full"
      }
    : { href: `/imovel/${imovel.slug || imovel.id}`, onClick: handleCardClick, target: "_blank", className: "block h-full" };

  return (
    <>
    <CardWrapper {...cardProps as any}>
      <motion.div
        className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-md border border-neutral-100 dark:border-neutral-800 group h-full flex flex-col"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        layout
      >
        {/* Image Slider - Compact */}
        <div className="relative aspect-[3/2] sm:aspect-[4/3] overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src={imovel.imagens[currentImage]}
              alt={imovel.titulo}
              fill
              className="object-cover object-center"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="lazy"
            />
          </div>

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Off-Market Overlay - Mantém escuro mesmo quando expandido */}
          {imovel.isOffMarket && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-10 transition-all duration-300">
              <div className="text-center">
                <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-1 border border-white/20">
                  <RiLockLine className="w-4 h-4 text-white" />
                </div>
                <p className="text-white text-[10px] font-medium">
                  Clique para solicitar acesso
                </p>
              </div>
            </div>
          )}

          {/* Badges no topo */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-20">
            {imovel.isOffMarket && (
              <span className="px-1 py-px sm:px-2 bg-neutral-900/90 backdrop-blur-sm text-white text-[6px] sm:text-[9px] font-bold uppercase rounded flex items-center gap-0.5 sm:gap-1">
                <RiEyeOffLine className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                Off Market
              </span>
            )}
            {imovel.exclusivo && !imovel.isOffMarket && (
              <span className="px-1 py-px sm:px-2 bg-[#25D366] text-white text-[6px] sm:text-[9px] font-bold uppercase rounded">
                Exclusividade
              </span>
            )}
          </div>

          {/* Badges no bottom-left */}
          <div className="absolute bottom-2 left-3 flex flex-wrap gap-1">
            <span className="px-1.5 py-0.5 bg-neutral-900/80 backdrop-blur-sm text-white text-[10px] sm:text-[11px] font-semibold rounded">
              {imovel.ref}
            </span>
            {(imovel.negocio === "venda" || imovel.negocio === "venda_locacao") && (
              <span className="px-1.5 py-0.5 bg-[#0B2545] text-white text-[10px] sm:text-[11px] font-bold uppercase rounded">
                Venda
              </span>
            )}
            {(imovel.negocio === "aluguel" || imovel.negocio === "venda_locacao") && (
              <span className="px-1.5 py-0.5 bg-[#25D366] text-white text-[10px] sm:text-[11px] font-bold uppercase rounded">
                Aluguel
              </span>
            )}
            {imovel.acceptsExchange && (
              <span className="px-1.5 py-0.5 bg-[#8B6F4E] text-white text-[10px] sm:text-[11px] font-bold uppercase rounded">
                Permuta
              </span>
            )}
          </div>

          {/* Favoritar */}
          <button
            onClick={handleFavorite}
            aria-label={favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/90 dark:bg-neutral-900/90 flex items-center justify-center hover:scale-110 transition-transform shadow"
          >
            {favorito ? (
              <RiHeartFill className="w-4 h-4 text-red-500" />
            ) : (
              <RiHeartLine className="w-4 h-4 text-neutral-600" />
            )}
          </button>

          {/* Navigation Arrows — sempre visíveis no mobile (touch não dispara hover);
              no desktop só aparecem no hover, via CSS (não depende de isHovered/JS) */}
          {imovel.imagens.length > 1 && (
            <>
              <button
                onClick={prevImage}
                aria-label="Foto anterior"
                className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white transition-opacity opacity-100 md:opacity-0 md:group-hover:opacity-100"
              >
                <RiArrowLeftSLine className="w-4 h-4 text-neutral-700" />
              </button>
              <button
                onClick={nextImage}
                aria-label="Próxima foto"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white transition-opacity opacity-100 md:opacity-0 md:group-hover:opacity-100"
              >
                <RiArrowRightSLine className="w-4 h-4 text-neutral-700" />
              </button>
            </>
          )}

          {/* Image indicators */}
          <div className="absolute bottom-2 right-2 flex gap-0.5">
            {imovel.imagens.map((_, index) => (
              <button
                key={index}
                aria-label={`Ir para foto ${index + 1}`}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImage(index); }}
                className={`w-1 h-1 rounded-full transition-all ${
                  index === currentImage ? "w-3 bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-3.5 flex-1 flex flex-col">
          {/* Location */}
          <div className="flex items-center gap-1 text-neutral-500 text-[11px] sm:text-xs mb-1">
            <RiMapPinLine className="w-3 h-3 text-[#0B2545] flex-shrink-0" />
            <span className="truncate">{imovel.localizacao}</span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-neutral-900 dark:text-white text-sm sm:text-base mb-1 sm:mb-1.5 line-clamp-2 leading-snug">
            {imovel.titulo}
          </h3>

          {/* Resumo/Descrição */}
          {imovel.descricao && (
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-1.5 leading-relaxed">
              {imovel.descricao.replace(/<[^>]*>/g, '').slice(0, 120)}
            </p>
          )}

          {/* Info: Dormitórios (suítes) / Metragem
              A taxa de condomínio saiu daqui: aparecia como "R$ 3.500" sem
              rótulo, ao lado do preço do imóvel, e o cliente lia como se
              fosse o valor da venda. Segue disponível na página do imóvel. */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-500 mb-2">
            {/* Dormitórios (suítes) */}
            {imovel.dormitorios > 0 && (
              <span className="flex items-center gap-1.5">
                <RiHotelBedLine className="w-3.5 h-3.5 text-neutral-400" />
                <strong className="text-neutral-800 dark:text-white">{imovel.dormitorios}</strong>
                {imovel.suites > 0 && <span className="text-neutral-400">({imovel.suites})</span>}
              </span>
            )}
            {/* Metragem útil */}
            {(imovel.areaConstruida > 0 || (imovel.areaTerreno && imovel.areaTerreno > 0)) && (
              <span className="flex items-center gap-1.5">
                <RiRuler2Line className="w-3.5 h-3.5 text-neutral-400" />
                <strong className="text-neutral-800 dark:text-white">{imovel.areaConstruida > 0 ? imovel.areaConstruida : imovel.areaTerreno}</strong>m²
              </span>
            )}
            {/* Vagas (apartamentos) */}
            {isApartamento && imovel.garagens > 0 && (
              <span className="flex items-center gap-1.5">
                <RiCarLine className="w-3.5 h-3.5 text-neutral-400" />
                <strong className="text-neutral-800 dark:text-white">{imovel.garagens}</strong>
              </span>
            )}
            {/* Área terreno (casas) */}
            {isCasa && imovel.areaTerreno && imovel.areaTerreno > 0 && (
              <span className="flex items-center gap-1.5">
                <RiLandscapeLine className="w-3.5 h-3.5 text-neutral-400" />
                <strong className="text-neutral-800 dark:text-white">{imovel.areaTerreno}</strong>m²
              </span>
            )}
          </div>

          {/* Preços - Venda e/ou Locação */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 mt-auto">
            {imovel.negocio === "venda_locacao" ? (
              <div className="flex flex-col gap-0.5">
                {imovel.preco > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-[#0B2545] bg-[#0B2545]/10 px-1.5 py-0.5 rounded">Venda</span>
                    <span className="text-base font-bold text-[#0B2545] dark:text-sky-400">
                      {formatPrice(imovel.preco)}
                    </span>
                  </div>
                )}
                {imovel.precoAluguel && imovel.precoAluguel > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-[#25D366] bg-[#25D366]/10 px-1.5 py-0.5 rounded">Locação</span>
                    <span className="text-base font-bold text-[#25D366] dark:text-[#5EE08E]">
                      {formatPrice(imovel.precoAluguel, true)}
                    </span>
                  </div>
                )}
              </div>
            ) : imovel.negocio === "aluguel" ? (
              <span className="text-base font-bold text-[#25D366] dark:text-[#5EE08E]">
                {formatPrice(imovel.precoAluguel || 0, true) || "Consulte"}
              </span>
            ) : (
              <span className="text-base font-bold text-[#0B2545] dark:text-sky-400">
                {formatPrice(imovel.preco) || "Consulte"}
              </span>
            )}
          </div>

        </div>
      </motion.div>
    </CardWrapper>

    {imovel.isOffMarket && (
      <AnimatePresence>
        {showAccessModal && (
          <OffMarketAccessModal
            imovel={{ id: imovel.id, ref: imovel.ref, titulo: imovel.titulo, condominio: imovel.condominioNome || imovel.condominio, localizacao: imovel.localizacao }}
            onClose={() => setShowAccessModal(false)}
          />
        )}
      </AnimatePresence>
    )}
    </>
  );
}
