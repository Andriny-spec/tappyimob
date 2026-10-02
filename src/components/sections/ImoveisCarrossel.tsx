"use client";

import { useRef, useState } from "react";
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
} from "react-icons/ri";

// Mock de imóveis com múltiplas imagens
const imoveis = [
  {
    id: "1",
    ref: "CNCF00138",
    titulo: "Gênesis 01",
    tipo: "VENDA",
    exclusivo: true,
    localizacao: "Sua Cidade - Santana de Parnaíba",
    condominio: "Gênesis",
    dormitorios: 4,
    suites: 4,
    garagens: 4,
    areaConstruida: 375,
    preco: 4600000,
    imagens: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80",
    ],
  },
  {
    id: "2",
    ref: "CNCF00245",
    titulo: "Residência Moderna",
    tipo: "VENDA",
    exclusivo: false,
    localizacao: "Tamboré - Barueri",
    condominio: "Tamboré 10",
    dormitorios: 5,
    suites: 5,
    garagens: 6,
    areaConstruida: 520,
    preco: 6800000,
    imagens: [
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&q=80",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=600&q=80",
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=600&q=80",
    ],
  },
  {
    id: "3",
    ref: "CNCF00312",
    titulo: "Casa Alto Padrão",
    tipo: "VENDA",
    exclusivo: true,
    localizacao: "Aldeia da Serra - Barueri",
    condominio: "Morada dos Lagos",
    dormitorios: 4,
    suites: 3,
    garagens: 4,
    areaConstruida: 420,
    preco: 3900000,
    imagens: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80",
      "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=600&q=80",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=600&q=80",
    ],
  },
  {
    id: "4",
    ref: "CNCF00189",
    titulo: "Mansão Contemporânea",
    tipo: "VENDA",
    exclusivo: false,
    localizacao: "Sua Cidade - Santana de Parnaíba",
    condominio: "Burle Marx",
    dormitorios: 6,
    suites: 6,
    garagens: 8,
    areaConstruida: 850,
    preco: 12500000,
    imagens: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
    ],
  },
  {
    id: "5",
    ref: "CNCF00267",
    titulo: "Casa Térrea",
    tipo: "VENDA",
    exclusivo: true,
    localizacao: "Granja Viana - Cotia",
    condominio: "Reserva Santa Maria",
    dormitorios: 3,
    suites: 3,
    garagens: 3,
    areaConstruida: 280,
    preco: 2200000,
    imagens: [
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&q=80",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&q=80",
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=600&q=80",
    ],
  },
  {
    id: "6",
    ref: "CNCF00401",
    titulo: "Sobrado Luxuoso",
    tipo: "ALUGUEL",
    exclusivo: false,
    localizacao: "Sua Cidade - Barueri",
    condominio: "Alphasítio",
    dormitorios: 4,
    suites: 4,
    garagens: 4,
    areaConstruida: 400,
    preco: 25000,
    imagens: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80",
      "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=600&q=80",
    ],
  },
];

// Componente do Card de Imóvel
function ImovelCard({ imovel }: { imovel: typeof imoveis[0] }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [favorito, setFavorito] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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

  const formatPrice = (price: number, tipo: string) => {
    if (tipo === "ALUGUEL") {
      return `R$ ${price.toLocaleString("pt-BR")}/mês`;
    }
    return `R$ ${price.toLocaleString("pt-BR")}`;
  };

  return (
    <Link href={`/imovel/${imovel.id}`} target="_blank">
      <motion.div
        className="flex-shrink-0 w-[300px] bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-lg border border-neutral-100 dark:border-neutral-800 group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
      >
        {/* Image Slider */}
        <div className="relative h-[200px] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <Image
                src={imovel.imagens[currentImage]}
                alt={imovel.titulo}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </motion.div>
          </AnimatePresence>

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Badges no topo */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {imovel.exclusivo && (
              <span className="px-2.5 py-1 bg-[#25D366] text-white text-[10px] font-bold uppercase rounded-md">
                Exclusividade
              </span>
            )}
          </div>

          {/* Badges no bottom-left */}
          <div className="absolute bottom-3 left-3 flex gap-2">
            <span className="px-2 py-1 bg-neutral-900/80 backdrop-blur-sm text-white text-[10px] font-medium rounded">
              Ref: {imovel.ref}
            </span>
            <span className={`px-2 py-1 text-white text-[10px] font-bold uppercase rounded ${
              imovel.tipo === "VENDA" ? "bg-[#0B2545]" : "bg-[#25D366]"
            }`}>
              {imovel.tipo}
            </span>
          </div>

          {/* Navigation Arrows */}
          <AnimatePresence>
            {isHovered && imovel.imagens.length > 1 && (
              <>
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 dark:bg-neutral-900/90 flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                >
                  <RiArrowLeftSLine className="w-5 h-5 text-neutral-700 dark:text-white" />
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 dark:bg-neutral-900/90 flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                >
                  <RiArrowRightSLine className="w-5 h-5 text-neutral-700 dark:text-white" />
                </motion.button>
              </>
            )}
          </AnimatePresence>

          {/* Image indicators */}
          <div className="absolute bottom-3 right-3 flex gap-1">
            {imovel.imagens.map((_, index) => (
              <button
                key={index}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImage(index); }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  index === currentImage ? "w-4 bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Location */}
          <div className="flex items-center gap-1 text-neutral-500 text-xs mb-1">
            <RiMapPinLine className="w-3.5 h-3.5 text-[#0B2545]" />
            <span className="truncate">{imovel.localizacao}</span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-neutral-900 dark:text-white text-base mb-3">
            {imovel.titulo}
          </h3>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-y-2 text-sm mb-4">
            <div className="flex items-center gap-2">
              <RiHotelBedLine className="w-4 h-4 text-neutral-400" />
              <span className="text-neutral-600 dark:text-neutral-400">
                <strong className="text-neutral-900 dark:text-white">{imovel.dormitorios}</strong> sendo{" "}
                <strong className="text-neutral-900 dark:text-white">{imovel.suites}</strong> suítes
              </span>
            </div>
            <div className="flex items-center gap-2">
              <RiCarLine className="w-4 h-4 text-neutral-400" />
              <span className="text-neutral-600 dark:text-neutral-400">
                <strong className="text-neutral-900 dark:text-white">{imovel.garagens}</strong> vagas
              </span>
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <RiRuler2Line className="w-4 h-4 text-neutral-400" />
              <span className="text-neutral-600 dark:text-neutral-400">
                Área: <strong className="text-neutral-900 dark:text-white">{imovel.areaConstruida}m²</strong>
              </span>
            </div>
          </div>

          {/* Price and Favorite */}
          <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <span className="text-xl font-bold text-[#0B2545] dark:text-sky-400">
              {formatPrice(imovel.preco, imovel.tipo)}
            </span>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFavorito(!favorito); }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                favorito 
                  ? "bg-red-50 dark:bg-red-500/10 text-red-500" 
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 hover:text-red-500"
              }`}
            >
              {favorito ? <RiHeartFill className="w-5 h-5" /> : <RiHeartLine className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export function ImoveisCarrossel() {
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
      const scrollAmount = direction === "left" ? -350 : 350;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <section className="py-20 bg-neutral-50 dark:bg-neutral-900">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block text-sm font-semibold text-[#0B2545] dark:text-sky-400 uppercase tracking-wider mb-2"
            >
              Destaques
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white"
            >
              Imóveis em Destaque
            </motion.h2>
          </div>

          {/* Navigation Arrows */}
          <div className="hidden md:flex items-center gap-2">
            <motion.button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                canScrollLeft
                  ? "bg-[#0B2545] text-white hover:bg-[#081733]"
                  : "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed"
              }`}
            >
              <RiArrowLeftSLine className="w-6 h-6" />
            </motion.button>
            <motion.button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                canScrollRight
                  ? "bg-[#0B2545] text-white hover:bg-[#081733]"
                  : "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed"
              }`}
            >
              <RiArrowRightSLine className="w-6 h-6" />
            </motion.button>
          </div>
        </div>

        {/* Carrossel - Sai da tela à direita */}
        <div className="relative -mr-4 lg:-mr-8 xl:-mr-[calc((100vw-1280px)/2+2rem)]">
          {/* Fade Left */}
          <div
            className={`absolute left-0 top-0 bottom-4 w-24 bg-gradient-to-r from-neutral-50 dark:from-neutral-900 to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
              canScrollLeft ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 pr-8 lg:pr-16"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {imoveis.map((imovel) => (
              <div key={imovel.id} style={{ scrollSnapAlign: "start" }}>
                <ImovelCard imovel={imovel} />
              </div>
            ))}
            {/* Spacer */}
            <div className="flex-shrink-0 w-8 lg:w-16" />
          </div>

          {/* Fade Right */}
          <div className="absolute right-0 top-0 bottom-4 w-32 lg:w-48 bg-gradient-to-l from-neutral-50 dark:from-neutral-900 via-neutral-50/80 dark:via-neutral-900/80 to-transparent z-10 pointer-events-none" />
        </div>

        {/* Mobile scroll hint */}
        <div className="flex justify-center mt-6 md:hidden">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <RiArrowLeftSLine className="w-4 h-4" />
            <span>Deslize para ver mais</span>
            <RiArrowRightSLine className="w-4 h-4" />
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href="/imoveis"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#0B2545] text-white font-semibold rounded-full hover:bg-[#081733] transition-colors"
          >
            Ver todos os imóveis
            <RiArrowRightSLine className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
