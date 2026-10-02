"use client";

import { useState, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  RiBuilding4Line,
  RiMapPinLine,
  RiHome4Line,
  RiArrowLeftLine,
  RiPhoneLine,
  RiMailLine,
  RiCheckLine,
  RiImageLine,
  RiShareLine,
  RiWhatsappLine,
  RiCalendarLine,
  RiShieldCheckLine,
  RiCloseLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiPlayCircleLine,
  RiFullscreenLine,
  RiUser3Line,
  RiTeamLine,
  RiParkingBoxLine,
  RiBasketballLine,
  RiPlantLine,
  RiShieldStarLine,
  RiDoorOpenLine,
} from "react-icons/ri";
// Header e Footer são adicionados pelo LayoutWrapper

// Types
interface Property {
  id: string;
  code: string;
  title: string;
  slug: string;
  type: string;
  category: string;
  status: string;
  price: number;
  rentPrice: number | null;
  area: number;
  bedrooms: number;
  suites: number;
  bathrooms: number;
  parkingSpaces: number;
  thumbnail: string;
  images: string[];
  neighborhood: string;
  city: string;
  state: string;
  isFeatured: boolean;
  isExclusive: boolean;
  isOffMarket?: boolean;
}

interface Condominium {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  condoType: string;
  neighborhood: string;
  city: string;
  state: string;
  address: string | null;
  thumbnail: string | null;
  images: string[];
  videos: string[];
  virtualTour: string | null;
  amenities: string[];
  availableSizes: string[];
  totalUnits: number | null;
  totalLots: number | null;
  yearBuilt: number | null;
  builder: string | null;
  hasSportsAdvisory: boolean;
  hasApartment: boolean;
  hasHouse: boolean;
  hasTerrain: boolean;
  hasCommercial: boolean;
  adminName: string | null;
  adminPhone: string | null;
  adminEmail: string | null;
  porterPhone: string | null;
  isFeatured: boolean;
  properties: Property[];
  _count: {
    properties: number;
  };
}

const condoTypeLabels: Record<string, string> = {
  VERTICAL: "Condomínio Vertical",
  HORIZONTAL: "Condomínio Horizontal",
  MISTO: "Condomínio Misto",
};

const typeLabels: Record<string, string> = {
  APARTAMENTO: "Apartamento",
  CASA: "Casa",
  TERRENO: "Terreno",
  COMERCIAL: "Comercial",
};

const categoryLabels: Record<string, string> = {
  VENDA: "Venda",
  LOCACAO: "Locação",
  VENDA_LOCACAO: "Venda/Locação",
};

// ============ COMPONENTS ============

// Hero Gallery Component
function HeroGallery({ 
  images, 
  name, 
  onOpenGallery 
}: { 
  images: string[]; 
  name: string; 
  onOpenGallery: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="relative h-[40vh] md:h-[50vh] lg:h-[60vh] bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-900 flex items-center justify-center">
        <RiBuilding4Line className="w-24 h-24 text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="relative h-[40vh] md:h-[50vh] lg:h-[60vh]">
      {/* Main Image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
        >
          <Image
            src={images[activeIndex]}
            alt={name}
            fill
            className="object-cover"
            priority
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={() => setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-all"
          >
            <RiArrowLeftSLine className="w-6 h-6" />
          </button>
          <button
            onClick={() => setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-all"
          >
            <RiArrowRightSLine className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Gallery Button */}
      {images.length > 1 && (
        <button
          onClick={onOpenGallery}
          className="absolute bottom-6 right-6 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/95 backdrop-blur-sm text-neutral-900 text-sm font-medium hover:bg-white transition-all shadow-lg"
        >
          <RiImageLine className="w-4 h-4" />
          Ver {images.length} fotos
        </button>
      )}

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-6 right-32 hidden md:flex gap-2 overflow-x-auto">
          {images.slice(0, 5).map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                activeIndex === i 
                  ? "border-white ring-2 ring-white/50" 
                  : "border-white/30 opacity-70 hover:opacity-100 hover:border-white/60"
              }`}
            >
              <Image src={img} alt="" width={80} height={56} className="w-full h-full object-cover" />
            </button>
          ))}
          {images.length > 5 && (
            <button
              onClick={onOpenGallery}
              className="flex-shrink-0 w-20 h-14 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center text-white text-sm font-medium border-2 border-white/30 hover:border-white/60 transition-all"
            >
              +{images.length - 5}
            </button>
          )}
        </div>
      )}

      {/* Dots for mobile */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden">
          {images.slice(0, 7).map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                activeIndex === i ? "bg-white w-6" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Stats Card Component
function StatCard({ 
  icon: Icon, 
  value, 
  label 
}: { 
  icon: React.ElementType; 
  value: string | number; 
  label: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow"
    >
      <Icon className="w-7 h-7 text-[#0B2545] dark:text-sky-400 mb-3" />
      <p className="text-2xl font-bold text-neutral-900 dark:text-white">{value}</p>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
    </motion.div>
  );
}

// Property Card Component
function PropertyCard({ property }: { property: Property }) {
  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  };

  return (
    <Link href={`/imovel/${property.slug || property.id}`} target="_blank">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        className="group bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-100 dark:border-neutral-800 shadow-sm hover:shadow-xl transition-all duration-300"
      >
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={property.thumbnail || property.images?.[0] || "/placeholder-imovel.jpg"}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Off-Market Overlay - Quase totalmente opaco (95%) */}
          {property.isOffMarket && (
            <div className="absolute inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-2 border border-white/20">
                  <RiShieldStarLine className="w-6 h-6 text-white" />
                </div>
                <p className="text-white text-xs font-medium">Exclusividade</p>
              </div>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2 z-20">
            {property.isOffMarket && (
              <span className="px-2.5 py-1 rounded-lg bg-neutral-900/90 backdrop-blur-sm text-white text-xs font-medium flex items-center gap-1">
                <RiShieldStarLine className="w-3 h-3" />
                Off Market
              </span>
            )}
            {!property.isOffMarket && (
              <span className="px-2.5 py-1 rounded-lg bg-[#0B2545] text-white text-xs font-medium">
                {typeLabels[property.type] || property.type}
              </span>
            )}
            {property.isExclusive && !property.isOffMarket && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-white text-xs font-medium">
                Exclusivo
              </span>
            )}
          </div>

          {/* Price */}
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-white font-bold text-lg">{formatPrice(property.price)}</p>
            {property.rentPrice && (
              <p className="text-white/80 text-sm">{formatPrice(property.rentPrice)}/mês</p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-neutral-900 dark:text-white mb-2 line-clamp-1 group-hover:text-[#0B2545] dark:group-hover:text-sky-400 transition-colors">
            {property.title}
          </h3>
          
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3 flex items-center gap-1">
            <RiMapPinLine className="w-4 h-4" />
            {property.neighborhood}, {property.city}
          </p>

          {/* Features */}
          <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-300">
            {property.bedrooms > 0 && (
              <span className="flex items-center gap-1">
                <RiDoorOpenLine className="w-4 h-4" />
                {property.bedrooms} {property.bedrooms === 1 ? "quarto" : "quartos"}
                {property.suites > 0 && ` (${property.suites} ${property.suites === 1 ? "suíte" : "suítes"})`}
              </span>
            )}
            {property.area > 0 && (
              <span>{property.area}m²</span>
            )}
            {property.parkingSpaces > 0 && (
              <span className="flex items-center gap-1">
                <RiParkingBoxLine className="w-4 h-4" />
                {property.parkingSpaces} {property.parkingSpaces === 1 ? "vaga" : "vagas"}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

// Amenity Badge Component
function AmenityBadge({ amenity }: { amenity: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 text-sm text-neutral-700 dark:text-neutral-300">
      <RiCheckLine className="w-4 h-4 text-green-500 flex-shrink-0" />
      {amenity}
    </div>
  );
}

// Contact Sidebar Component
function ContactSidebar({ condominium }: { condominium: Condominium }) {
  const whatsappMessage = encodeURIComponent(
    `Olá! Gostaria de saber mais sobre o condomínio ${condominium.name}`
  );

  return (
    <div className="sticky top-24 space-y-4">
      {/* Main CTA */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-[#0B2545] to-[#2a3a6e] text-white shadow-xl"
      >
        <h3 className="text-xl font-bold mb-2">Interessado?</h3>
        <p className="text-white/70 text-sm mb-5">
          Fale com um especialista e encontre o imóvel ideal neste condomínio.
        </p>
        <a
          href={`https://wa.me/5511934823060?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors shadow-lg"
        >
          <RiWhatsappLine className="w-5 h-5" />
          Falar no WhatsApp
        </a>
      </motion.div>

      {/* Admin Info */}
      {(condominium.adminName || condominium.adminPhone || condominium.adminEmail || condominium.porterPhone) && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm"
        >
          <h3 className="font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
            <RiShieldStarLine className="w-5 h-5 text-[#0B2545] dark:text-sky-400" />
            Administração
          </h3>
          <div className="space-y-3">
            {condominium.adminName && (
              <div className="flex items-start gap-3">
                <RiUser3Line className="w-4 h-4 text-neutral-400 mt-0.5" />
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Administradora</p>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">{condominium.adminName}</p>
                </div>
              </div>
            )}
            {condominium.adminPhone && (
              <a
                href={`tel:${condominium.adminPhone}`}
                className="flex items-start gap-3 hover:text-[#0B2545] dark:hover:text-sky-400 transition-colors"
              >
                <RiPhoneLine className="w-4 h-4 text-neutral-400 mt-0.5" />
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Telefone</p>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">{condominium.adminPhone}</p>
                </div>
              </a>
            )}
            {condominium.adminEmail && (
              <a
                href={`mailto:${condominium.adminEmail}`}
                className="flex items-start gap-3 hover:text-[#0B2545] dark:hover:text-sky-400 transition-colors"
              >
                <RiMailLine className="w-4 h-4 text-neutral-400 mt-0.5" />
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">E-mail</p>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white break-all">{condominium.adminEmail}</p>
                </div>
              </a>
            )}
            {condominium.porterPhone && (
              <a
                href={`tel:${condominium.porterPhone}`}
                className="flex items-start gap-3 hover:text-[#0B2545] dark:hover:text-sky-400 transition-colors"
              >
                <RiTeamLine className="w-4 h-4 text-neutral-400 mt-0.5" />
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Portaria</p>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">{condominium.porterPhone}</p>
                </div>
              </a>
            )}
          </div>
        </motion.div>
      )}

      {/* Share Button */}
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        onClick={() => {
          if (navigator.share) {
            navigator.share({ title: condominium.name, url: window.location.href });
          } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copiado!");
          }
        }}
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-sm"
      >
        <RiShareLine className="w-5 h-5" />
        Compartilhar
      </motion.button>
    </div>
  );
}

// Gallery Modal Component
function GalleryModal({ 
  images, 
  isOpen, 
  onClose, 
  initialIndex = 0 
}: { 
  images: string[]; 
  isOpen: boolean; 
  onClose: () => void;
  initialIndex?: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setCurrentIndex(initialIndex);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      if (e.key === "ArrowRight") setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, images.length, onClose]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black"
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <span className="text-white/80 text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </span>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <RiCloseLine className="w-6 h-6" />
        </button>
      </div>

      {/* Main Image */}
      <div className="absolute inset-0 flex items-center justify-center p-4 md:p-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full h-full"
          >
            <Image
              src={images[currentIndex]}
              alt=""
              fill
              className="object-contain"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <button
        onClick={() => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        <RiArrowLeftSLine className="w-8 h-8" />
      </button>
      <button
        onClick={() => setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        <RiArrowRightSLine className="w-8 h-8" />
      </button>

      {/* Thumbnails */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex gap-2 justify-center overflow-x-auto max-w-4xl mx-auto">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`flex-shrink-0 w-16 h-12 md:w-20 md:h-14 rounded-lg overflow-hidden border-2 transition-all ${
                currentIndex === i 
                  ? "border-white ring-2 ring-white/30" 
                  : "border-transparent opacity-50 hover:opacity-100"
              }`}
            >
              <Image src={img} alt="" width={80} height={56} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ============ MAIN PAGE ============

export default function CondominioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [condominium, setCondominium] = useState<Condominium | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGallery, setShowGallery] = useState(false);

  useEffect(() => {
    const fetchCondominium = async () => {
      try {
        const res = await fetch(`/api/site/condominiums/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setCondominium(data);
        }
      } catch (error) {
        console.error("Erro ao buscar condomínio:", error);
      }
      setLoading(false);
    };

    fetchCondominium();
  }, [slug]);

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#0B2545] border-t-transparent rounded-full animate-spin" />
          <p className="text-neutral-500">Carregando...</p>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!condominium) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center px-4">
          <RiBuilding4Line className="w-20 h-20 text-neutral-300 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-3">
            Condomínio não encontrado
          </h1>
          <p className="text-neutral-500 mb-6">
            O condomínio que você está procurando não existe ou foi removido.
          </p>
          <Link
            href="/condominios"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0B2545] text-white font-medium hover:bg-[#081733] transition-colors"
          >
            <RiArrowLeftLine className="w-4 h-4" />
            Ver todos os condomínios
          </Link>
        </div>
      </div>
    );
  }

  const allImages = [condominium.thumbnail, ...condominium.images].filter(Boolean) as string[];

  // Property types available
  const propertyTypes = [];
  if (condominium.hasApartment) propertyTypes.push("Apartamentos");
  if (condominium.hasHouse) propertyTypes.push("Casas");
  if (condominium.hasTerrain) propertyTypes.push("Terrenos");
  if (condominium.hasCommercial) propertyTypes.push("Comerciais");

  return (
    <div className="bg-neutral-50 dark:bg-neutral-950 -mt-[72px] pt-[72px]">
      {/* Back Button - Fixed */}
      <Link
        href="/condominios"
        className="fixed top-24 left-4 z-40 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm text-sm font-medium shadow-lg hover:shadow-xl transition-all border border-neutral-200 dark:border-neutral-700"
      >
        <RiArrowLeftLine className="w-4 h-4" />
        <span className="hidden sm:inline">Voltar</span>
      </Link>

      {/* Hero Gallery */}
      <HeroGallery
        images={allImages}
        name={condominium.name}
        onOpenGallery={() => setShowGallery(true)}
      />

      {/* Title Section */}
      <section className="bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-lg bg-[#0B2545] text-white text-sm font-medium">
                  {condoTypeLabels[condominium.condoType] || condominium.condoType}
                </span>
                {condominium.isFeatured && (
                  <span className="px-3 py-1 rounded-lg bg-amber-500 text-white text-sm font-medium">
                    Destaque
                  </span>
                )}
                {condominium.hasSportsAdvisory && (
                  <span className="px-3 py-1 rounded-lg bg-green-500 text-white text-sm font-medium">
                    Assessoria Esportiva
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-2">
                {condominium.name}
              </h1>
              <p className="text-neutral-500 dark:text-neutral-400 flex items-center gap-2 text-lg">
                <RiMapPinLine className="w-5 h-5" />
                {condominium.neighborhood}, {condominium.city}/{condominium.state}
              </p>
              {condominium.address && (
                <p className="text-neutral-400 dark:text-neutral-500 text-sm mt-1">
                  {condominium.address}
                </p>
              )}
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-6 text-center">
              {condominium._count.properties > 0 && (
                <div>
                  <p className="text-3xl font-bold text-[#0B2545] dark:text-sky-400">
                    {condominium._count.properties}
                  </p>
                  <p className="text-sm text-neutral-500">Imóveis</p>
                </div>
              )}
              {condominium.totalUnits && (
                <div>
                  <p className="text-3xl font-bold text-[#0B2545] dark:text-sky-400">
                    {condominium.totalUnits}
                  </p>
                  <p className="text-sm text-neutral-500">Unidades</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 lg:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-10">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {condominium._count.properties > 0 && (
                <StatCard
                  icon={RiHome4Line}
                  value={condominium._count.properties}
                  label="Imóveis disponíveis"
                />
              )}
              {condominium.totalUnits && (
                <StatCard
                  icon={RiBuilding4Line}
                  value={condominium.totalUnits}
                  label="Unidades totais"
                />
              )}
              {condominium.totalLots && (
                <StatCard
                  icon={RiPlantLine}
                  value={condominium.totalLots}
                  label="Lotes"
                />
              )}
              {condominium.yearBuilt && (
                <StatCard
                  icon={RiCalendarLine}
                  value={condominium.yearBuilt}
                  label="Ano de construção"
                />
              )}
              {condominium.builder && (
                <StatCard
                  icon={RiShieldCheckLine}
                  value={condominium.builder}
                  label="Construtora"
                />
              )}
            </div>

            {/* Property Types - OCULTADO conforme solicitação
            {propertyTypes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm"
              >
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">
                  Tipos de Imóveis Disponíveis
                </h2>
                <div className="flex flex-wrap gap-2">
                  {propertyTypes.map((type) => (
                    <span
                      key={type}
                      className="px-4 py-2 rounded-xl bg-[#0B2545]/10 dark:bg-sky-500/20 text-[#0B2545] dark:text-sky-400 text-sm font-medium"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
            */}

            {/* Available Sizes */}
            {condominium.availableSizes?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm"
              >
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">
                  Metragens Disponíveis
                </h2>
                <div className="flex flex-wrap gap-2">
                  {condominium.availableSizes.map((size) => (
                    <span
                      key={size}
                      className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-sm font-medium"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Description */}
            {condominium.description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm"
              >
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">
                  Sobre o Condomínio
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 whitespace-pre-line leading-relaxed">
                  {condominium.description}
                </p>
              </motion.div>
            )}

            {/* Amenities */}
            {condominium.amenities?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm"
              >
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">
                  Infraestrutura e Lazer
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {condominium.amenities.map((amenity) => (
                    <AmenityBadge key={amenity} amenity={amenity} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Virtual Tour */}
            {condominium.virtualTour && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm"
              >
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">
                  Tour Virtual
                </h2>
                <a
                  href={condominium.virtualTour}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-[#0B2545] to-[#2a3a6e] text-white hover:shadow-lg transition-all"
                >
                  <RiPlayCircleLine className="w-8 h-8" />
                  <div>
                    <p className="font-semibold">Explorar em 360°</p>
                    <p className="text-sm text-white/70">Faça um tour virtual pelo condomínio</p>
                  </div>
                  <RiFullscreenLine className="w-5 h-5 ml-auto" />
                </a>
              </motion.div>
            )}

            {/* Properties */}
            {condominium.properties?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                    Imóveis Disponíveis
                  </h2>
                  <span className="px-3 py-1 rounded-full bg-[#0B2545]/10 dark:bg-sky-500/20 text-[#0B2545] dark:text-sky-400 text-sm font-medium">
                    {condominium.properties.length} {condominium.properties.length === 1 ? "imóvel" : "imóveis"}
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  {condominium.properties.map((property, index) => (
                    <motion.div
                      key={property.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <PropertyCard property={property} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            <ContactSidebar condominium={condominium} />
          </div>
        </div>
      </section>

      {/* Gallery Modal */}
      <AnimatePresence>
        {showGallery && (
          <GalleryModal
            images={allImages}
            isOpen={showGallery}
            onClose={() => setShowGallery(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
