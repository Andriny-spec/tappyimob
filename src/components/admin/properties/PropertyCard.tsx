"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  RiHotelBedLine,
  RiCarLine,
  RiRulerLine,
  RiEyeLine,
  RiHeartLine,
  RiShareLine,
  RiMoreLine,
  RiEditLine,
  RiDeleteBinLine,
  RiExternalLinkLine,
  RiMapPinLine,
  RiStarFill,
  RiCheckboxCircleFill,
  RiTimeLine,
  RiHistoryLine,
  RiUserVoiceLine,
} from "react-icons/ri";
import { LuBath } from "react-icons/lu";
import {
  Property,
  propertyTypeLabels,
  propertyCategoryLabels,
  propertyStatusLabels,
  statusColors,
  categoryColors,
} from "@/types/property";
import { useState } from "react";

interface PropertyCardProps {
  property: Property;
  onEdit?: (property: Property) => void;
  onDelete?: (property: Property) => void;
  onView?: (property: Property) => void;
}

export function PropertyCard({ property, onEdit, onDelete, onView }: PropertyCardProps) {
  const pathname = usePathname();
  const basePath = pathname.startsWith("/corretor") ? "/corretor" : "/admin";
  const [showMenu, setShowMenu] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatArea = (area: number) => {
    return `${area.toLocaleString("pt-BR")} m²`;
  };

  // Usa o status do banco diretamente
  const computedStatus = property.status || "DISPONIVEL";

  // Extrai apenas o nome do condomínio para exibição (remove prefixos tipo "Casa no", "Apartamento no")
  const getDisplayTitle = (title: string) => {
    if (!title) return "";
    return title.replace(/^(Casa|Apartamento|Terreno|Sala|Loja|Galpão|Ponto|Prédio|Sobrado|Cobertura|Flat|Studio|Kitnet|Loft|Chácara|Sítio|Fazenda)\s+(no|na|em|à venda no|à venda na|para locação no|para locação na)\s+/i, "");
  };
  const rawDisplayTitle = getDisplayTitle(property.title);

  // Detecta títulos genéricos que não agregam informação (ex: "Apartamento Alto Padrão", "Casa em Condomínio", "Condomínio")
  const genericTitlePatterns = /^(Apartamento|Casa|Terreno|Sala|Loja|Galpão|Sobrado|Cobertura|Flat|Studio|Kitnet|Loft|Chácara|Sítio|Fazenda|Condomínio)(\s+(Alto Padrão|em Condomínio|Padrão|Residencial))?$/i;
  const isGenericTitle = genericTitlePatterns.test(property.title?.trim() || "") || genericTitlePatterns.test(rawDisplayTitle?.trim() || "");

  const condoName = (property as any).condominium?.name?.trim();
  // Prioridade: condomínio > título útil > tipo + bairro
  const displayTitle = condoName || (!isGenericTitle ? rawDisplayTitle : property.neighborhood || rawDisplayTitle);
  const hasCondoOrUsefulTitle = !!condoName || !isGenericTitle;

  const statusColor = statusColors[computedStatus] || { bg: "bg-neutral-100", text: "text-neutral-700" };
  const categoryColor = categoryColors[property.category] || { bg: "bg-neutral-100", text: "text-neutral-700" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-lg hover:border-orange-200 dark:hover:border-orange-500/30 transition-all duration-300"
    >
      {/* Image - Clicável para ir para a single */}
      <Link href={`${basePath}/imoveis/${property.id}`} className="relative aspect-[16/10] overflow-hidden block">
        {property.thumbnail ? (
          <Image
            src={property.thumbnail}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-800 flex items-center justify-center">
            <RiMapPinLine className="w-12 h-12 text-neutral-400" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {property.category === "VENDA_LOCACAO" ? (
            <>
              {(!((property as any).saleStatus) || !["VENDIDO", "INATIVO"].includes((property as any).saleStatus)) && (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400">
                  Venda
                </span>
              )}
              {((property as any).rentPrice ?? 0) > 0 && (!((property as any).rentalStatus) || !["ALUGADO", "INATIVO"].includes((property as any).rentalStatus)) && (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                  Aluguel
                </span>
              )}
            </>
          ) : (
            <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${categoryColor.bg} ${categoryColor.text}`}>
              {propertyCategoryLabels[property.category]}
            </span>
          )}
          {property.isFeatured && (
            <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-yellow-100 text-yellow-700">
              <RiStarFill className="w-2.5 h-2.5 inline" />
            </span>
          )}
          {(property as any).isOffMarket && (
            <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400">
              OFF-MARKET
            </span>
          )}
        </div>

        {/* Status Badge */}
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
          <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${statusColor.bg} ${statusColor.text}`}>
            {propertyStatusLabels[computedStatus] || computedStatus}
          </span>
          {(computedStatus === "VENDIDO" || computedStatus === "ALUGADO") && (property as any).soldBy && (
            <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${(property as any).soldBy === "TAPPY" ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-600"}`}>
              {(property as any).soldBy === "TAPPY" ? "✓ Tappy" : "Terceiros"}
            </span>
          )}
        </div>

        {/* Image Count */}
        {property.images.length > 0 && (
          <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/60 rounded text-white text-[9px]">
            {property.images.length} fotos
          </div>
        )}
      </Link>

      {/* Content - Compacto */}
      <Link href={`${basePath}/imoveis/${property.id}`} className="block p-2">
        {/* Title + Code inline */}
        <div className="flex items-start justify-between gap-1 mb-0.5">
          <h3 className="font-semibold text-xs text-neutral-900 dark:text-white line-clamp-1 group-hover:text-orange-500 transition-colors flex-1">
            {displayTitle}
          </h3>
          <span className="text-[9px] font-mono text-neutral-400 flex-shrink-0">{property.code}</span>
        </div>

        {/* Location */}
        <p className="text-[10px] text-neutral-500 mb-1.5 truncate">
          {condoName ? `${propertyTypeLabels[property.type] || property.type} · ` : ""}{property.neighborhood}, {property.city}
        </p>

        {/* Features inline */}
        <div className="flex items-center gap-2 text-[10px] text-neutral-500 mb-1.5">
          {property.bedrooms > 0 && (
            <span>
              {property.bedrooms} quartos{property.suites > 0 && ` (${property.suites} suítes)`}
            </span>
          )}
          {property.parkingSpaces > 0 && <span>{property.parkingSpaces} vagas</span>}
          <span>{formatArea(property.area)}</span>
        </div>

        {/* Price */}
        <div className="flex flex-col">
          {(() => {
            const rentPrice = (property as any).rentPrice;
            if (property.category === "LOCACAO") {
              return <p className="text-sm font-bold text-orange-500">{formatPrice(rentPrice || property.price)}/mês</p>;
            }
            if (property.category === "VENDA_LOCACAO") {
              return (
                <>
                  {property.price > 0 && (
                    <p className="text-sm font-bold text-orange-500">{formatPrice(property.price)}</p>
                  )}
                  {(rentPrice ?? 0) > 0 && (
                    <p className="text-[11px] font-semibold text-blue-500">{formatPrice(rentPrice)}/mês</p>
                  )}
                </>
              );
            }
            return <p className="text-sm font-bold text-orange-500">{formatPrice(property.price || rentPrice || 0)}</p>;
          })()}
        </div>
      </Link>

      {/* Footer compacto */}
      <div className="flex items-center justify-between px-2 pb-2 pt-1 border-t border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-full bg-[#0A1E3D] flex items-center justify-center text-white text-[8px] font-semibold">
            {property.owner.name.charAt(0)}
          </div>
          <span className="text-[9px] text-neutral-500">{property.owner.name.split(" ")[0]}</span>
        </div>
        
        {/* Menu */}
        <div className="relative">
          <button onClick={(e) => { e.preventDefault(); setShowMenu(!showMenu); }} className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <RiMoreLine className="w-3.5 h-3.5 text-neutral-400" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 bottom-full mb-1 w-32 bg-white dark:bg-neutral-900 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 z-50 overflow-hidden">
                <Link href={`${basePath}/imoveis/${property.id}`} onClick={() => setShowMenu(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 text-[10px] hover:bg-neutral-50 dark:hover:bg-neutral-800">
                  <RiEyeLine className="w-3 h-3" /> Ver ficha
                </Link>
                <Link href={`${basePath}/imoveis/novo?id=${property.id}`} onClick={() => setShowMenu(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 text-[10px] hover:bg-neutral-50 dark:hover:bg-neutral-800">
                  <RiEditLine className="w-3 h-3" /> Editar
                </Link>
                <a href={`/imovel/${property.slug || property.id}`} target="_blank"
                  className="flex items-center gap-2 px-2.5 py-1.5 text-[10px] hover:bg-neutral-50 dark:hover:bg-neutral-800">
                  <RiExternalLinkLine className="w-3 h-3" /> Ver no site
                </a>
                <div className="border-t border-neutral-100 dark:border-neutral-800" />
                <button onClick={() => { onDelete?.(property); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[10px] text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                  <RiDeleteBinLine className="w-3 h-3" /> Excluir
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
