"use client";

import { motion, AnimatePresence } from "framer-motion";
import { RiHome4Line, RiEyeLine, RiRulerLine, RiHotelBedLine, RiCloseLine } from "react-icons/ri";
import Image from "next/image";

interface Property {
  id: string;
  code: string;
  title: string;
  price: number;
  slug: string | null;
  views: number;
  category: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  neighborhood: string;
  city: string;
  images: string[];
}

interface Props {
  properties: Property[];
  onClose: () => void;
}

function formatPrice(value: number) {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1).replace(".", ",")} mi`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)} mil`;
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function PropertiesModal({ properties, onClose }: Props) {
  return (
    <AnimatePresence>
      <motion.div
        key="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        style={{ background: "rgba(7,15,28,0.7)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 60, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 60, opacity: 0, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-3xl"
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div className="flex items-center gap-2">
              <RiHome4Line className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-semibold text-white/80">
                {properties.length} imóveis encontrados
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <RiCloseLine className="w-4 h-4 text-white/60" />
            </button>
          </div>

          {/* Cards */}
          <div className="overflow-y-auto max-h-[calc(80vh-72px)] px-4 pb-5 space-y-3">
            {properties.map((p, i) => (
              <motion.a
                key={p.id}
                href={p.slug ? `/imovel/${p.slug}` : `/imovel/${p.code}`}
                target="_blank"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex gap-3 p-3 rounded-2xl transition-colors cursor-pointer group"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                {/* Thumbnail */}
                <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-white/5">
                  {p.images[0] ? (
                    <Image src={p.images[0]} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <RiHome4Line className="w-8 h-8 text-white/20" />
                    </div>
                  )}
                  {/* Rank badge */}
                  <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-orange-500/80 flex items-center justify-center text-[10px] font-bold text-white">
                    {i + 1}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white/90 text-sm font-medium truncate group-hover:text-orange-300 transition-colors">
                    {p.title}
                  </p>
                  <p className="text-white/40 text-xs mt-0.5 truncate">{p.neighborhood}, {p.city}</p>

                  <div className="flex items-center gap-3 mt-2 text-white/40 text-[11px]">
                    {p.bedrooms > 0 && (
                      <span className="flex items-center gap-1">
                        <RiHotelBedLine className="w-3 h-3" /> {p.bedrooms}
                      </span>
                    )}
                    {p.area > 0 && (
                      <span className="flex items-center gap-1">
                        <RiRulerLine className="w-3 h-3" /> {p.area}m²
                      </span>
                    )}
                    <span className="flex items-center gap-1 ml-auto">
                      <RiEyeLine className="w-3 h-3" /> {p.views.toLocaleString("pt-BR")}
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-orange-400 text-sm font-bold">{formatPrice(p.price)}</p>
                  <p className="text-white/30 text-[10px] mt-0.5">{p.category === "LOCACAO" ? "aluguel" : "venda"}</p>
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
