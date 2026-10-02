"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiHome4Line,
  RiBuilding2Line,
  RiHotelLine,
  RiCommunityLine,
  RiStore2Line,
  RiLandscapeLine,
  RiBuilding4Line,
  RiHome8Line,
} from "react-icons/ri";

// Tipo do card
export type TipoCard = {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  image?: string;
  icon?: string;
  bgColor: string;
  textColor: string;
  order: number;
  isActive: boolean;
};

// Mapeamento de ícones
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  RiHome4Line,
  RiBuilding2Line,
  RiHotelLine,
  RiCommunityLine,
  RiStore2Line,
  RiLandscapeLine,
  RiBuilding4Line,
  RiHome8Line,
};

// Dados fallback
const tiposFallback = [
  {
    id: "tambore",
    type: "TAMBORE_I_II_III",
    title: "Tamboré I, II e III",
    subtitle: "234 imóveis",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80",
    icon: "RiBuilding2Line",
    bgColor: "#0B2545",
    textColor: "#FFFFFF",
    order: 0,
    isActive: true,
  },
  {
    id: "retrofit",
    type: "RETROFIT",
    title: "Retrofit",
    subtitle: "156 imóveis",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80",
    icon: "RiHome4Line",
    bgColor: "#0B2545",
    textColor: "#FFFFFF",
    order: 1,
    isActive: true,
  },
  {
    id: "terreas",
    type: "CASAS_TERREAS",
    title: "Casas Térreas",
    subtitle: "45 imóveis",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80",
    icon: "RiHotelLine",
    bgColor: "#0B2545",
    textColor: "#FFFFFF",
    order: 2,
    isActive: true,
  },
  {
    id: "villagios",
    type: "VILLAGIOS",
    title: "Villagios",
    subtitle: "89 imóveis",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
    icon: "RiCommunityLine",
    bgColor: "#0B2545",
    textColor: "#FFFFFF",
    order: 3,
    isActive: true,
  },
  {
    id: "centro-sua-cidade",
    type: "CASAS_CENTRO_SUA_CIDADE",
    title: "Casas (Centro de Sua Cidade)",
    subtitle: "67 imóveis",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
    icon: "RiStore2Line",
    bgColor: "#0B2545",
    textColor: "#FFFFFF",
    order: 4,
    isActive: true,
  },
  {
    id: "lancamentos",
    type: "LANCAMENTOS",
    title: "Lançamentos",
    subtitle: "34 imóveis",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80",
    icon: "RiLandscapeLine",
    bgColor: "#0B2545",
    textColor: "#FFFFFF",
    order: 5,
    isActive: true,
  },
  {
    id: "apartamentos-sua-cidade",
    type: "APARTAMENTOS_CENTRO_SUA_CIDADE",
    title: "Apartamentos (Centro de Sua Cidade)",
    subtitle: "78 imóveis",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80",
    icon: "RiBuilding4Line",
    bgColor: "#0B2545",
    textColor: "#FFFFFF",
    order: 6,
    isActive: true,
  },
  {
    id: "vistas-incriveis",
    type: "VISTAS_INCRIVEIS",
    title: "Vistas Incríveis",
    subtitle: "42 imóveis",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80",
    icon: "RiLandscapeLine",
    bgColor: "#0B2545",
    textColor: "#FFFFFF",
    order: 7,
    isActive: true,
  },
  {
    id: "exclusividades",
    type: "EXCLUSIVIDADES",
    title: "Exclusividades",
    subtitle: "28 imóveis",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
    icon: "RiHome8Line",
    bgColor: "#0B2545",
    textColor: "#FFFFFF",
    order: 8,
    isActive: true,
  },
];

function TipoCard({ tipo }: { tipo: TipoCard; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const IconComponent = iconMap[tipo.icon || "RiHome4Line"] || RiHome4Line;

  return (
    <Link href={`/imoveis?categoria=${encodeURIComponent(tipo.type)}`}>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative flex-shrink-0 w-[200px] h-[280px] rounded-2xl overflow-hidden cursor-pointer group"
      >
        {/* Background Image */}
        {tipo.image && (
          <Image
            src={tipo.image}
            alt={tipo.title}
            fill
            className={`object-cover transition-transform duration-700 ${
              isHovered ? "scale-110" : "scale-100"
            }`}
            sizes="200px"
            loading="lazy"
          />
        )}

        {/* Gradient Overlay */}
        <div
          className={`absolute inset-0 transition-all duration-500 ${
            isHovered
              ? "bg-gradient-to-t from-[#0B2545] via-[#0B2545]/60 to-transparent"
              : "bg-gradient-to-t from-black/80 via-black/40 to-transparent"
          }`}
        />

        {/* Icon Badge */}
        <div
          className={`absolute top-4 left-4 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
            isHovered ? "bg-white text-[#0B2545] scale-110" : "bg-white/20 text-white backdrop-blur-sm scale-100"
          }`}
        >
          <IconComponent className="w-5 h-5" />
        </div>

        {/* Content - Posições fixas absolutas em relação ao card */}
        {/* Título sempre a 56px do fundo */}
        <h3
          className={`absolute bottom-14 left-4 right-4 text-lg font-bold text-white leading-tight transition-transform duration-300 ${
            isHovered ? "-translate-y-1" : ""
          }`}
        >
          {tipo.title}
        </h3>

        {/* Subtítulo sempre a 36px do fundo */}
        <p
          className={`absolute bottom-9 left-4 right-4 text-white/70 text-xs line-clamp-1 transition-transform duration-300 ${
            isHovered ? "-translate-y-1" : ""
          }`}
        >
          {tipo.subtitle}
        </p>

        {/* CTA que aparece no hover - sempre a 16px do fundo */}
        <div
          className={`absolute bottom-4 left-4 transition-all duration-300 ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2.5"
          }`}
        >
          <span className="inline-flex items-center gap-1 text-xs font-medium text-white">
            Ver imóveis
            <RiArrowRightSLine className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Border on hover */}
        <div
          className={`absolute inset-0 rounded-2xl border-2 transition-colors duration-300 ${
            isHovered ? "border-white/30" : "border-white/0"
          }`}
        />
      </div>
    </Link>
  );
}

interface TiposCarrosselProps {
  compact?: boolean; // Modo compacto sem fundo e título
  initialTipos?: TipoCard[]; // Dados pré-carregados no server (evita fetch client-side)
}

export function TiposCarrossel({ compact = false, initialTipos }: TiposCarrosselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [tipos, setTipos] = useState<TipoCard[]>(initialTipos || []);
  const [isLoading, setIsLoading] = useState(!initialTipos?.length);

  // Estados para drag no desktop
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Buscar tipos do banco (só se não recebeu dados pré-carregados do server)
  useEffect(() => {
    if (initialTipos?.length) {
      setIsLoading(false);
      return;
    }
    const fetchTipos = async () => {
      try {
        const res = await fetch("/api/site/property-types?active=true");
        const data = await res.json();
        if (data.types && data.types.length > 0) {
          setTipos(data.types);
        } else {
          // Só usa fallback se a API não retornou dados
          setTipos(tiposFallback);
        }
      } catch (error) {
        console.error("Erro ao buscar tipos:", error);
        setTipos(tiposFallback);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTipos();
  }, []);

  // Verificar scroll na montagem e quando tipos mudam
  useEffect(() => {
    const timer = setTimeout(() => {
      checkScroll();
    }, 100);
    return () => clearTimeout(timer);
  }, [tipos]);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setTimeout(checkScroll, 300);
    }
  };

  // Funções de drag para desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Velocidade do scroll
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // Skeleton loading
  if (isLoading) {
    return (
      <section className={`overflow-hidden ${compact ? "py-0" : "pt-6 md:pt-10 pb-2 md:pb-4 bg-white dark:bg-neutral-950"}`}>
        <div className={compact ? "" : "container mx-auto px-4 lg:px-8"}>
          <div className="flex gap-3 overflow-hidden pb-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[160px] sm:w-[200px] h-[180px] sm:h-[220px] rounded-2xl bg-neutral-200 dark:bg-neutral-800 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`overflow-hidden ${compact ? "py-0" : "pt-6 md:pt-10 pb-2 md:pb-4 bg-white dark:bg-neutral-950"}`}>
      <div className={compact ? "" : "container mx-auto px-4 lg:px-8"}>
        {/* Carrossel — contido na largura do container (mesma largura de header/footer) */}
        <div className="relative">
          {/* Navigation Arrows - Desktop */}
          <button
            onClick={() => scroll("left")}
            className={`hidden md:flex absolute -left-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center rounded-full bg-white dark:bg-neutral-800 shadow-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-white hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-all ${!canScrollLeft ? "opacity-0 pointer-events-none" : "opacity-100"}`}
          >
            <RiArrowLeftSLine className="w-6 h-6" />
          </button>
          <button
            onClick={() => scroll("right")}
            className={`hidden md:flex absolute right-20 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center rounded-full bg-white dark:bg-neutral-800 shadow-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-white hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-all ${!canScrollRight ? "opacity-0 pointer-events-none" : "opacity-100"}`}
          >
            <RiArrowRightSLine className="w-6 h-6" />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className={`flex gap-3 overflow-x-auto scrollbar-hide pb-4 ${isDragging ? "cursor-grabbing select-none" : "cursor-grab"}`}
            style={{ scrollSnapType: isDragging ? "none" : "x mandatory" }}
          >
            {tipos.map((tipo, index) => (
              <div key={tipo.id} style={{ scrollSnapAlign: "start" }}>
                <TipoCard tipo={tipo} index={index} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
