"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  RiBuilding4Line,
  RiSearchLine,
  RiMapPinLine,
  RiHome4Line,
  RiArrowRightLine,
  RiStarFill,
} from "react-icons/ri";
import { Header } from "@/components/header/Header";
import { Footer } from "@/components/footer/Footer";

interface Condominium {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: string;
  neighborhood: string;
  city: string;
  state: string;
  thumbnail: string | null;
  images: string[];
  amenities: string[];
  isFeatured: boolean;
  _count: {
    properties: number;
  };
}

const typeLabels: Record<string, string> = {
  APARTAMENTO: "Apartamentos",
  CASA: "Casas",
  TERRENO: "Terrenos",
  COMERCIAL: "Comerciais",
};

const typeColors: Record<string, string> = {
  APARTAMENTO: "bg-blue-500",
  CASA: "bg-green-500",
  TERRENO: "bg-amber-500",
  COMERCIAL: "bg-purple-500",
};

export default function CondominiosPage() {
  const [condominiums, setCondominiums] = useState<Condominium[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    const fetchCondominiums = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (typeFilter) params.append("type", typeFilter);

        const res = await fetch(`/api/site/condominiums?${params}`);
        const data = await res.json();
        setCondominiums(data.condominiums || []);
      } catch (error) {
        console.error("Erro ao buscar condomínios:", error);
      }
      setLoading(false);
    };

    const debounce = setTimeout(fetchCondominiums, 300);
    return () => clearTimeout(debounce);
  }, [search, typeFilter]);

  const featuredCondos = condominiums.filter((c) => c.isFeatured);
  const regularCondos = condominiums.filter((c) => !c.isFeatured);

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        {/* Hero */}
        <section className="relative bg-[#0B2545] py-16 md:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Conheça os Condomínios
              </h1>
              <p className="text-lg text-white/70 mb-8">
                Explore os melhores condomínios de Sua Cidade e região. 
                Encontre informações completas sobre infraestrutura, lazer e imóveis disponíveis.
              </p>

              {/* Search */}
              <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
                <div className="flex-1 relative">
                  <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Buscar condomínio..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white dark:bg-neutral-900 border-0 focus:ring-2 focus:ring-white/30"
                  />
                </div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-4 rounded-xl bg-white dark:bg-neutral-900 border-0"
                >
                  <option value="">Todos os tipos</option>
                  <option value="APARTAMENTO">Apartamentos</option>
                  <option value="CASA">Casas</option>
                  <option value="TERRENO">Terrenos</option>
                  <option value="COMERCIAL">Comerciais</option>
                </select>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured */}
        {featuredCondos.length > 0 && (
          <section className="py-12 bg-white dark:bg-neutral-900">
            <div className="container mx-auto px-4 lg:px-8">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                <RiStarFill className="w-5 h-5 text-amber-500" />
                Condomínios em Destaque
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredCondos.map((condo, index) => (
                  <CondoCard key={condo.id} condo={condo} index={index} featured />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Condos */}
        <section className="py-12">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                {typeFilter ? typeLabels[typeFilter] || "Condomínios" : "Todos os Condomínios"}
              </h2>
              <span className="text-sm text-neutral-500">
                {condominiums.length} encontrados
              </span>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden animate-pulse">
                    <div className="h-48 bg-neutral-200 dark:bg-neutral-800" />
                    <div className="p-4 space-y-3">
                      <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4" />
                      <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : regularCondos.length === 0 && featuredCondos.length === 0 ? (
              <div className="text-center py-16">
                <RiBuilding4Line className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-500">Nenhum condomínio encontrado</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {regularCondos.map((condo, index) => (
                  <CondoCard key={condo.id} condo={condo} index={index} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

function CondoCard({ condo, index, featured = false }: { condo: Condominium; index: number; featured?: boolean }) {
  const image = condo.thumbnail || condo.images?.[0] || "/placeholder-condo.jpg";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={`/condominio/${condo.slug}`}
        className={`block bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 hover:shadow-xl transition-all group ${
          featured ? "ring-2 ring-amber-400" : ""
        }`}
      >
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={image}
            alt={condo.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Type badge */}
          <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-medium text-white ${typeColors[condo.type] || "bg-neutral-500"}`}>
            {typeLabels[condo.type] || condo.type}
          </div>

          {/* Featured badge */}
          {condo.isFeatured && (
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500 text-white flex items-center gap-1">
              <RiStarFill className="w-3 h-3" />
              Destaque
            </div>
          )}

          {/* Properties count */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white text-sm">
            <RiHome4Line className="w-4 h-4" />
            {condo._count.properties} imóveis
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-neutral-900 dark:text-white group-hover:text-[#0B2545] dark:group-hover:text-sky-400 transition-colors">
            {condo.name}
          </h3>
          <p className="text-sm text-neutral-500 flex items-center gap-1 mt-1">
            <RiMapPinLine className="w-4 h-4" />
            {condo.neighborhood}, {condo.city}
          </p>

          {/* Amenities preview */}
          {condo.amenities?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {condo.amenities.slice(0, 3).map((amenity) => (
                <span
                  key={amenity}
                  className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-600 dark:text-neutral-400"
                >
                  {amenity}
                </span>
              ))}
              {condo.amenities.length > 3 && (
                <span className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-600 dark:text-neutral-400">
                  +{condo.amenities.length - 3}
                </span>
              )}
            </div>
          )}

          {/* CTA */}
          <div className="flex items-center justify-end mt-4 text-sm text-[#0B2545] dark:text-sky-400 font-medium group-hover:gap-2 transition-all">
            Ver detalhes
            <RiArrowRightLine className="w-4 h-4 ml-1" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
