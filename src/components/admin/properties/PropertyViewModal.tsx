"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  RiCloseLine,
  RiHotelBedLine,
  RiCarLine,
  RiRulerLine,
  RiMapPinLine,
  RiEyeLine,
  RiHeartLine,
  RiShareLine,
  RiPhoneLine,
  RiWhatsappLine,
  RiMailLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiStarFill,
  RiCheckboxCircleFill,
  RiHome4Line,
  RiMoneyDollarCircleLine,
  RiCalendarLine,
  RiUserLine,
} from "react-icons/ri";
import { LuBath } from "react-icons/lu";
import {
  Property,
  propertyTypeLabels,
  propertyCategoryLabels,
  propertyStatusLabels,
  propertyConditionLabels,
  statusColors,
  categoryColors,
} from "@/types/property";

interface PropertyViewModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PropertyViewModal({ property, isOpen, onClose }: PropertyViewModalProps) {
  const [currentImage, setCurrentImage] = useState(0);

  if (!property) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const allImages = property.thumbnail 
    ? [property.thumbnail, ...property.images]
    : property.images;

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const statusColor = statusColors[property.status];
  const categoryColor = categoryColors[property.category];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 lg:inset-10 bg-white dark:bg-neutral-900 rounded-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 lg:p-6 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-4">
                <span className="text-sm font-mono text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-lg">
                  {property.code}
                </span>
                <span className={`px-3 py-1 text-sm font-semibold rounded-lg ${statusColor.bg} ${statusColor.text}`}>
                  {propertyStatusLabels[property.status]}
                </span>
                <span className={`px-3 py-1 text-sm font-semibold rounded-lg ${categoryColor.bg} ${categoryColor.text}`}>
                  {propertyCategoryLabels[property.category]}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
              >
                <RiCloseLine className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 lg:p-6">
                {/* Left - Images */}
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                    {allImages.length > 0 ? (
                      <>
                        <Image
                          src={allImages[currentImage]}
                          alt={property.title}
                          fill
                          className="object-cover"
                        />
                        {allImages.length > 1 && (
                          <>
                            <button
                              onClick={prevImage}
                              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
                            >
                              <RiArrowLeftSLine className="w-5 h-5 text-neutral-700" />
                            </button>
                            <button
                              onClick={nextImage}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
                            >
                              <RiArrowRightSLine className="w-5 h-5 text-neutral-700" />
                            </button>
                            <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/60 rounded-lg text-white text-sm">
                              {currentImage + 1} / {allImages.length}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <RiMapPinLine className="w-16 h-16 text-neutral-400" />
                      </div>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {allImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {allImages.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImage(i)}
                          className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 ${
                            currentImage === i
                              ? "ring-2 ring-orange-500"
                              : "opacity-60 hover:opacity-100"
                          }`}
                        >
                          <Image src={img} alt="" fill className="object-cover" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-center">
                      <RiEyeLine className="w-6 h-6 text-neutral-400 mx-auto mb-1" />
                      <p className="text-lg font-bold text-neutral-900 dark:text-white">{property.views}</p>
                      <p className="text-xs text-neutral-500">Visualizações</p>
                    </div>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-center">
                      <RiHeartLine className="w-6 h-6 text-neutral-400 mx-auto mb-1" />
                      <p className="text-lg font-bold text-neutral-900 dark:text-white">{property.favorites}</p>
                      <p className="text-xs text-neutral-500">Favoritos</p>
                    </div>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-center">
                      <RiShareLine className="w-6 h-6 text-neutral-400 mx-auto mb-1" />
                      <p className="text-lg font-bold text-neutral-900 dark:text-white">{property.shares}</p>
                      <p className="text-xs text-neutral-500">Compartilhamentos</p>
                    </div>
                  </div>
                </div>

                {/* Right - Details */}
                <div className="space-y-6">
                  {/* Title & Price */}
                  <div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {property.isFeatured && (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 flex items-center gap-1">
                          <RiStarFill className="w-3 h-3" />
                          Destaque
                        </span>
                      )}
                      {property.isExclusive && (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 flex items-center gap-1">
                          <RiCheckboxCircleFill className="w-3 h-3" />
                          Exclusivo
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                      {property.title}
                    </h2>
                    <p className="text-neutral-500 flex items-center gap-1">
                      <RiMapPinLine className="w-4 h-4" />
                      {property.address}, {property.number && `${property.number}, `}{property.neighborhood}, {property.city} - {property.state}
                    </p>
                    
                    <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-500/10 rounded-xl">
                      <p className="text-3xl font-bold text-orange-500">
                        {formatPrice(property.price)}
                      </p>
                      {property.rentPrice && (
                        <p className="text-neutral-600 dark:text-neutral-400">
                          Aluguel: {formatPrice(property.rentPrice)}/mês
                        </p>
                      )}
                      {property.condoFee && (
                        <p className="text-sm text-neutral-500">
                          Condomínio: {formatPrice(property.condoFee)}/mês
                        </p>
                      )}
                      {property.iptu && (
                        <p className="text-sm text-neutral-500">
                          IPTU: {formatPrice(property.iptu)}/ano
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-center">
                      <RiHotelBedLine className="w-6 h-6 text-orange-500 mx-auto mb-1" />
                      <p className="text-lg font-bold text-neutral-900 dark:text-white">{property.bedrooms}</p>
                      <p className="text-xs text-neutral-500">
                        Quartos{property.suites > 0 && ` (${property.suites} suítes)`}
                      </p>
                    </div>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-center">
                      <LuBath className="w-6 h-6 text-orange-500 mx-auto mb-1" />
                      <p className="text-lg font-bold text-neutral-900 dark:text-white">{property.bathrooms}</p>
                      <p className="text-xs text-neutral-500">Banheiros</p>
                    </div>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-center">
                      <RiCarLine className="w-6 h-6 text-orange-500 mx-auto mb-1" />
                      <p className="text-lg font-bold text-neutral-900 dark:text-white">{property.parkingSpaces}</p>
                      <p className="text-xs text-neutral-500">Vagas</p>
                    </div>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-center">
                      <RiRulerLine className="w-6 h-6 text-orange-500 mx-auto mb-1" />
                      <p className="text-lg font-bold text-neutral-900 dark:text-white">{property.area}</p>
                      <p className="text-xs text-neutral-500">m²</p>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-neutral-500">Tipo</p>
                      <p className="font-medium text-neutral-900 dark:text-white">
                        {propertyTypeLabels[property.type]}
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Condição</p>
                      <p className="font-medium text-neutral-900 dark:text-white">
                        {propertyConditionLabels[property.condition]}
                      </p>
                    </div>
                    {property.suites > 0 && (
                      <div>
                        <p className="text-neutral-500">Suítes</p>
                        <p className="font-medium text-neutral-900 dark:text-white">{property.suites}</p>
                      </div>
                    )}
                    {property.floor && (
                      <div>
                        <p className="text-neutral-500">Andar</p>
                        <p className="font-medium text-neutral-900 dark:text-white">{property.floor}º</p>
                      </div>
                    )}
                    {property.yearBuilt && (
                      <div>
                        <p className="text-neutral-500">Ano de construção</p>
                        <p className="font-medium text-neutral-900 dark:text-white">{property.yearBuilt}</p>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                      Descrição
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
                      {property.description}
                    </p>
                  </div>

                  {/* Amenities */}
                  {property.amenities.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                        Comodidades
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {property.amenities.map((amenity, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg text-sm"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Owner */}
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                    <h3 className="font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                      <RiUserLine className="w-5 h-5 text-orange-500" />
                      Responsável
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-lg font-semibold">
                        {property.owner.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-neutral-900 dark:text-white">
                          {property.owner.name}
                        </p>
                        <p className="text-sm text-neutral-500">{property.owner.email}</p>
                      </div>
                      <div className="flex gap-2">
                        {property.owner.phone && (
                          <a
                            href={`tel:${property.owner.phone}`}
                            className="p-2 bg-white dark:bg-neutral-700 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-orange-500 transition-colors"
                          >
                            <RiPhoneLine className="w-5 h-5" />
                          </a>
                        )}
                        {property.owner.phone && (
                          <a
                            href={`https://wa.me/${property.owner.phone.replace(/\D/g, "")}`}
                            target="_blank"
                            className="p-2 bg-green-500 rounded-lg text-white hover:bg-green-600 transition-colors"
                          >
                            <RiWhatsappLine className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center gap-4 text-sm text-neutral-500">
                    <div className="flex items-center gap-1">
                      <RiCalendarLine className="w-4 h-4" />
                      Criado: {new Date(property.createdAt).toLocaleDateString("pt-BR")}
                    </div>
                    {property.publishedAt && (
                      <div className="flex items-center gap-1">
                        Publicado: {new Date(property.publishedAt).toLocaleDateString("pt-BR")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
