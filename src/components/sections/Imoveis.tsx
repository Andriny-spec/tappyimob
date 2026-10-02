"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  RiMapPinLine,
  RiHotelBedLine,
  RiCarLine,
  RiRuler2Line,
  RiHeartLine,
  RiHeartFill,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiVerifiedBadgeFill,
} from "react-icons/ri";
import { Button } from "@/components/ui/button";

const imoveis = [
  {
    id: 1,
    title: "Apartamento Alto Padrão",
    location: "Jardins, São Paulo - SP",
    price: "R$ 1.850.000",
    pricePerM2: "R$ 18.500/m²",
    beds: 3,
    parking: 2,
    area: 120,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
    tag: "Destaque",
    tagColor: "orange",
    isNew: true,
  },
  {
    id: 2,
    title: "Cobertura Duplex Vista Mar",
    location: "Leblon, Rio de Janeiro - RJ",
    price: "R$ 4.200.000",
    pricePerM2: "R$ 21.000/m²",
    beds: 4,
    parking: 3,
    area: 200,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
    tag: "Premium",
    tagColor: "purple",
    isNew: false,
  },
  {
    id: 3,
    title: "Casa em Condomínio Fechado",
    location: "Sua Cidade, Barueri - SP",
    price: "R$ 2.300.000",
    pricePerM2: "R$ 8.200/m²",
    beds: 4,
    parking: 4,
    area: 280,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
    tag: "Exclusivo",
    tagColor: "green",
    isNew: true,
  },
  {
    id: 4,
    title: "Studio Moderno Centro",
    location: "República, São Paulo - SP",
    price: "R$ 420.000",
    pricePerM2: "R$ 14.000/m²",
    beds: 1,
    parking: 1,
    area: 30,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
    tag: "Investimento",
    tagColor: "blue",
    isNew: false,
  },
  {
    id: 5,
    title: "Mansão com Piscina",
    location: "Morumbi, São Paulo - SP",
    price: "R$ 8.500.000",
    pricePerM2: "R$ 17.000/m²",
    beds: 6,
    parking: 6,
    area: 500,
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop",
    tag: "Luxo",
    tagColor: "amber",
    isNew: false,
  },
  {
    id: 6,
    title: "Loft Industrial",
    location: "Vila Madalena, São Paulo - SP",
    price: "R$ 890.000",
    pricePerM2: "R$ 12.700/m²",
    beds: 1,
    parking: 1,
    area: 70,
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
    tag: "Moderno",
    tagColor: "cyan",
    isNew: true,
  },
  {
    id: 7,
    title: "Apartamento Garden",
    location: "Moema, São Paulo - SP",
    price: "R$ 1.450.000",
    pricePerM2: "R$ 14.500/m²",
    beds: 2,
    parking: 2,
    area: 100,
    image: "https://images.unsplash.com/photo-1600573472591-ee6c563ece46?w=800&h=600&fit=crop",
    tag: "Com Jardim",
    tagColor: "green",
    isNew: false,
  },
  {
    id: 8,
    title: "Penthouse Exclusiva",
    location: "Itaim Bibi, São Paulo - SP",
    price: "R$ 6.800.000",
    pricePerM2: "R$ 22.700/m²",
    beds: 4,
    parking: 4,
    area: 300,
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop",
    tag: "Cobertura",
    tagColor: "rose",
    isNew: true,
  },
];

// Removed colored tags - using brand colors only

export function Imoveis() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [favorites, setFavorites] = useState<number[]>([]);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section id="imoveis" className="py-20 lg:py-32 overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12"
        >
          <div>
            <span className="inline-block px-3 py-1 text-xs font-semibold text-orange-500 bg-orange-100 dark:bg-orange-500/10 rounded-full mb-4">
              IMÓVEIS EM DESTAQUE
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
              Encontre o imóvel
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
                dos seus sonhos
              </span>
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-xl">
              Explore nossa seleção exclusiva de imóveis em todo o Brasil.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll("left")}
                className="p-3 rounded-full border border-neutral-300 dark:border-neutral-700 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all"
              >
                <RiArrowLeftSLine className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="p-3 rounded-full border border-neutral-300 dark:border-neutral-700 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all"
              >
                <RiArrowRightSLine className="w-5 h-5" />
              </button>
            </div>
            <Button variant="outline">Ver todos os imóveis</Button>
          </div>
        </motion.div>
      </div>

      {/* Cards carousel - aligned with container */}
      <div className="container mx-auto px-4 lg:px-8">
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mr-4 lg:-mr-8 pr-4 lg:pr-8 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {imoveis.map((imovel, i) => (
            <motion.div
              key={imovel.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex-shrink-0 w-80 snap-start group"
            >
              <Link href={`/imovel/${imovel.id}`} target="_blank" className="block bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700 hover:shadow-2xl transition-all duration-500">
                {/* Image container */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={imovel.image}
                    alt={imovel.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Tags - brand colors only */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 text-xs font-semibold text-white rounded-full bg-neutral-900/80 backdrop-blur-sm">
                      {imovel.tag}
                    </span>
                    {imovel.isNew && (
                      <span className="px-2.5 py-1 text-xs font-semibold text-white bg-orange-500 rounded-full">
                        Novo
                      </span>
                    )}
                  </div>

                  {/* Favorite button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavorite(imovel.id);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-colors"
                  >
                    {favorites.includes(imovel.id) ? (
                      <RiHeartFill className="w-5 h-5 text-orange-500" />
                    ) : (
                      <RiHeartLine className="w-5 h-5 text-white" />
                    )}
                  </button>

                  {/* Price on image */}
                  <div className="absolute bottom-3 left-3">
                    <div className="text-2xl font-bold text-white">{imovel.price}</div>
                    <div className="text-xs text-white/80">{imovel.pricePerM2}</div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Title */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white line-clamp-1">
                      {imovel.title}
                    </h3>
                    <RiVerifiedBadgeFill className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 mb-4">
                    <RiMapPinLine className="w-4 h-4" />
                    <span className="text-sm">{imovel.location}</span>
                  </div>

                  {/* Features */}
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-700">
                    <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                      <RiHotelBedLine className="w-4 h-4" />
                      <span className="text-sm">{imovel.beds} quartos</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                      <RiCarLine className="w-4 h-4" />
                      <span className="text-sm">{imovel.parking} vagas</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                      <RiRuler2Line className="w-4 h-4" />
                      <span className="text-sm">{imovel.area}m²</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
