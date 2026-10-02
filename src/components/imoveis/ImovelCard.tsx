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
  RiHotelBedLine,
  RiCarLine,
  RiRuler2Line,
  RiLockLine,
  RiEyeOffLine,
} from "react-icons/ri";
import { OffMarketAccessModal } from "@/components/OffMarketAccessModal";

export interface ImovelData {
  id: string;
  slug?: string;
  ref: string;
  titulo: string;
  tipo: string;
  negocio: string; // VENDA, LOCACAO, VENDA_LOCACAO
  exclusivo: boolean;
  isOffMarket?: boolean;
  localizacao: string;
  condominio: string;
  condominioNome?: string;
  dormitorios: number;
  suites: number;
  garagens: number;
  areaConstruida: number;
  areaTerreno?: number;
  taxaCondominio?: number;
  preco: number;
  precoAluguel?: number;
  imagens: string[];
  acceptsExchange?: boolean;
  descricao?: string;
}

interface ImovelCardProps {
  imovel: ImovelData;
}

export function ImovelCard({ imovel }: ImovelCardProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [favorito, setFavorito] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);

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

  const formatPrice = (price: number, negocio: string) => {
    if (negocio === "aluguel") return `R$ ${price.toLocaleString("pt-BR")}/mês`;
    return `R$ ${price.toLocaleString("pt-BR")}`;
  };

  // Se for Off Market, não usa Link, abre o formulário de solicitação de acesso
  const CardWrapper = imovel.isOffMarket ? 'div' : Link;
  const cardProps = imovel.isOffMarket
    ? {
        onClick: (e: React.MouseEvent) => {
          e.preventDefault();
          setShowAccessModal(true);
        },
        className: "cursor-pointer block"
      }
    : { href: `/imovel/${imovel.slug || imovel.id}`, target: "_blank" };

  return (
    <>
    <CardWrapper {...cardProps as any}>
      <motion.div
        className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-lg border border-neutral-100 dark:border-neutral-800 group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
        layout
      >
        {/* Image Slider */}
        <div className="relative aspect-[3/2] sm:aspect-square overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src={imovel.imagens[currentImage]}
              alt={`${imovel.titulo} - ${imovel.localizacao}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Off-Market Overlay - Mantém escuro mesmo quando expandido */}
          {imovel.isOffMarket && (
            <div className={`absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-10 transition-all duration-300`}>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-2 border border-white/20">
                  <RiLockLine className="w-6 h-6 text-white" />
                </div>
                <p className="text-white text-xs font-medium">
                  Clique para solicitar acesso
                </p>
              </div>
            </div>
          )}

          {/* Badges no topo */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-20">
            {imovel.isOffMarket && (
              <span className="px-1.5 py-px sm:px-2.5 sm:py-1 bg-neutral-900/90 backdrop-blur-sm text-white text-[6px] sm:text-[10px] font-bold uppercase rounded-md flex items-center gap-0.5 sm:gap-1">
                <RiEyeOffLine className="w-2 h-2 sm:w-3 sm:h-3" />
                Off Market
              </span>
            )}
            {imovel.exclusivo && !imovel.isOffMarket && (
              <span className="px-1.5 py-px sm:px-2.5 sm:py-1 bg-amber-500 text-white text-[6px] sm:text-[10px] font-bold uppercase rounded-md">
                Exclusividade
              </span>
            )}
          </div>

          {/* Badges no bottom-left */}
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
            <span className="px-1 py-px sm:px-2 sm:py-1 bg-neutral-900/80 backdrop-blur-sm text-white text-[6px] sm:text-[10px] font-medium rounded">
              Ref: {imovel.ref}
            </span>
            {(imovel.negocio === "venda" || imovel.negocio === "venda_locacao") && (
              <span className="px-1 py-px sm:px-2 sm:py-1 bg-[#0B2545] text-white text-[6px] sm:text-[10px] font-bold uppercase rounded">
                Venda
              </span>
            )}
            {(imovel.negocio === "aluguel" || imovel.negocio === "venda_locacao") && (
              <span className="px-1 py-px sm:px-2 sm:py-1 bg-[#25D366] text-white text-[6px] sm:text-[10px] font-bold uppercase rounded">
                Aluguel
              </span>
            )}
            {imovel.acceptsExchange && (
              <span className="px-1 py-px sm:px-2 sm:py-1 bg-[#8B6F4E] text-white text-[6px] sm:text-[10px] font-bold uppercase rounded">
                Estuda Permuta
              </span>
            )}
          </div>

          {/* Favoritar */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setFavorito(!favorito);
            }}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 dark:bg-neutral-900/90 flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
          >
            {favorito ? (
              <RiHeartFill className="w-5 h-5 text-red-500" />
            ) : (
              <RiHeartLine className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            )}
          </button>

          {/* Navigation Arrows */}
          <AnimatePresence>
            {isHovered && imovel.imagens.length > 1 && (
              <>
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                >
                  <RiArrowLeftSLine className="w-5 h-5 text-neutral-700" />
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                >
                  <RiArrowRightSLine className="w-5 h-5 text-neutral-700" />
                </motion.button>
              </>
            )}
          </AnimatePresence>

          {/* Image indicators */}
          <div className="absolute bottom-3 right-3 flex gap-1">
            {imovel.imagens.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImage(index);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  index === currentImage ? "w-4 bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-2.5 sm:p-4">
          {/* Location */}
          <div className="flex items-center gap-1 text-neutral-500 text-[10px] sm:text-xs mb-0.5 sm:mb-1">
            <RiMapPinLine className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#0B2545]" />
            <span className="truncate">{imovel.localizacao}</span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-neutral-900 dark:text-white text-xs sm:text-base mb-1 sm:mb-3 truncate">
            {imovel.titulo}
          </h3>

          {/* Info Grid */}
          <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-sm text-neutral-600 dark:text-neutral-400 mb-2 sm:mb-4">
            {imovel.dormitorios > 0 && (
              <div className="flex items-center gap-1.5">
                <RiHotelBedLine className="w-4 h-4 text-neutral-400" />
                <span>
                  <strong className="text-neutral-900 dark:text-white">{imovel.dormitorios}</strong> quartos
                  {imovel.suites > 0 && (
                    <span className="text-xs text-neutral-400"> ({imovel.suites} suítes)</span>
                  )}
                </span>
              </div>
            )}
            {imovel.garagens > 0 && (
              <div className="flex items-center gap-1.5">
                <RiCarLine className="w-4 h-4 text-neutral-400" />
                <span><strong className="text-neutral-900 dark:text-white">{imovel.garagens}</strong> vagas</span>
              </div>
            )}
            {(imovel.areaConstruida > 0 || (imovel.areaTerreno && imovel.areaTerreno > 0)) && (
              <div className="flex items-center gap-1.5">
                <RiRuler2Line className="w-4 h-4 text-neutral-400" />
                <span><strong className="text-neutral-900 dark:text-white">{imovel.areaConstruida > 0 ? imovel.areaConstruida : imovel.areaTerreno}</strong> m²</span>
              </div>
            )}
          </div>

          {/* Price and Favorite */}
          <div className="flex items-center justify-between pt-1.5 sm:pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <div className="flex flex-col">
              {imovel.negocio === "aluguel" && imovel.precoAluguel ? (
                <span className="text-sm sm:text-xl font-bold text-[#25D366] dark:text-orange-400">
                  {formatPrice(imovel.precoAluguel, "aluguel")}
                </span>
              ) : imovel.negocio === "venda_locacao" ? (
                <>
                  <span className="text-sm sm:text-xl font-bold text-[#0B2545] dark:text-sky-400">
                    {formatPrice(imovel.preco, "venda")}
                  </span>
                  {imovel.precoAluguel && imovel.precoAluguel > 0 && (
                    <span className="text-xs sm:text-sm font-semibold text-[#25D366] dark:text-orange-400">
                      {formatPrice(imovel.precoAluguel, "aluguel")}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-sm sm:text-xl font-bold text-[#0B2545] dark:text-sky-400">
                  {formatPrice(imovel.preco, imovel.negocio)}
                </span>
              )}
            </div>
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
