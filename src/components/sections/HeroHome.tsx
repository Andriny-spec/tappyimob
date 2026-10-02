"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  RiSearchLine,
  RiArrowDownSLine,
  RiHome4Line,
  RiBuilding2Line,
  RiStore2Line,
  RiLandscapeLine,
  RiCheckLine,
  RiFilter3Line,
  RiAddLine,
  RiSubtractLine,
} from "react-icons/ri";

// Sem imagens fallback - usa gradiente da marca quando não há slides

// Tipo do slide
type HeroSlide = {
  id: string;
  title: string;
  paragraph?: string;
  badge?: string;
  bgImage?: string;
  bgOverlay: string;
  titleColor: string;
  paragraphColor: string;
};

// Opções dos filtros
const negocioOptions = [
  { value: "venda", label: "Comprar" },
  { value: "aluguel", label: "Alugar" },
];

const tipoOptions = [
  { value: "apartamento", label: "Apartamento", icon: RiBuilding2Line },
  { value: "casa", label: "Casa", icon: RiHome4Line },
  { value: "comercial", label: "Comercial", icon: RiStore2Line },
  { value: "terreno", label: "Terreno", icon: RiLandscapeLine },
];

// Condomínios serão carregados da API

// Função para formatar valor em BRL
const formatBRL = (value: string) => {
  const numbers = value.replace(/\D/g, "");
  if (!numbers) return "";
  const num = parseInt(numbers, 10);
  return num.toLocaleString("pt-BR");
};

// Função para parsear valor BRL para número
const parseBRL = (value: string) => {
  return value.replace(/\D/g, "");
};

// Componente Dropdown Expansivo
function DropdownFilter({
  label,
  value,
  placeholder,
  isOpen,
  onToggle,
  onClose,
  children,
}: {
  label: string;
  value: string;
  placeholder: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    // Delay para não fechar imediatamente
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 10);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div ref={ref} className="relative flex-1 min-w-[100px] sm:min-w-[120px]">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggle();
        }}
        className="w-full flex flex-col items-start px-3 sm:px-4 py-2 sm:py-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
      >
        <span className="text-[9px] sm:text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-1.5 sm:gap-2 w-full">
          <span className="text-xs sm:text-sm font-medium text-neutral-900 dark:text-white truncate">
            {value || placeholder}
          </span>
          <RiArrowDownSLine className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400 ml-auto flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 bg-white dark:bg-neutral-800 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 z-50 overflow-hidden min-w-[180px]"
          >
            <div className="max-h-[300px] overflow-y-auto p-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Modal carregado sob demanda — só entra no bundle quando o usuário de fato o abre
const CondominioModal = dynamic(
  () => import("./hero/CondominioModal").then((m) => m.CondominioModal),
  { ssr: false }
);

export function HeroHome({ initialSlides }: { initialSlides?: HeroSlide[] }) {
  const router = useRouter();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [slides, setSlides] = useState<HeroSlide[]>(initialSlides || []);
  const [isLoading, setIsLoading] = useState(!initialSlides?.length);

  // Estados dos filtros
  const [negocio, setNegocio] = useState("venda");
  const [tipo, setTipo] = useState("");
  const [valorMin, setValorMin] = useState("");
  const [valorMax, setValorMax] = useState("");
  const [condominios, setCondominios] = useState<string[]>([]);
  const [referencia, setReferencia] = useState("");

  // Estado para condomínios (carregados da API)
  const [condominioOptions, setCondominioOptions] = useState<{ value: string; label: string; condoType?: string; condoCategory?: string }[]>([]);

  // Estados dos filtros avançados
  const [quartos, setQuartos] = useState(0);
  const [suites, setSuites] = useState(0);
  const [vagas, setVagas] = useState(0);
  const [areaMin, setAreaMin] = useState("");
  const [areaMax, setAreaMax] = useState("");
  const [areaTerrenoMin, setAreaTerrenoMin] = useState("");
  const [areaTerrenoMax, setAreaTerrenoMax] = useState("");

  // Estados dos dropdowns e modal
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [condominioModal, setCondominioModal] = useState(false);
  const [showFiltrosAvancados, setShowFiltrosAvancados] = useState(false);
  
  // Estados adicionais para filtros avançados
  const [caracteristicas, setCaracteristicas] = useState<string[]>([]);
  const [subtipos, setSubtipos] = useState<string[]>([]);
  
  // Diferenciais carregados da API (respeita hidden/criados na pág de edição)
  const [diferenciaisOptions, setDiferenciaisOptions] = useState<string[]>([]);

  const closeDropdown = () => setOpenDropdown(null);

  // Flag para saber se já carregou dados dos filtros (condomínios/opções)
  const [filtersDataLoaded, setFiltersDataLoaded] = useState(false);

  // Carregar condomínios e opções APENAS quando o usuário interagir com filtros
  const loadFiltersData = async () => {
    if (filtersDataLoaded) return;
    setFiltersDataLoaded(true);
    try {
      const [condominiosRes, opcoesRes] = await Promise.all([
        fetch("/api/site/condominiums?limit=500&available=true"),
        fetch("/api/admin/properties/options"),
      ]);

      const condominiosData = await condominiosRes.json();
      if (condominiosData.condominiums) {
        setCondominioOptions(
          condominiosData.condominiums.map((c: any) => ({
            value: c.slug || c.id,
            label: c.name,
            condoType: c.condoType,
            condoCategory: c.condoCategory,
          }))
        );
      }

      if (opcoesRes.ok) {
        const opcoesData = await opcoesRes.json();
        const allDiferenciais = new Set<string>();
        for (const item of (opcoesData.features || [])) { if (item) allDiferenciais.add(item); }
        setDiferenciaisOptions(Array.from(allDiferenciais).sort((a, b) => a.localeCompare(b, 'pt-BR')));
      }
    } catch (error) {
      console.error("Erro ao buscar dados dos filtros:", error);
    }
  };

  // Buscar slides somente se não recebeu initialSlides do server
  useEffect(() => {
    if (initialSlides?.length) {
      setIsLoading(false);
      return;
    }
    const fetchSlides = async () => {
      try {
        const slidesRes = await fetch("/api/site/hero-slides?active=true");
        const slidesData = await slidesRes.json();
        if (slidesData.slides?.length > 0) {
          setSlides(slidesData.slides);
        }
      } catch (error) {
        console.error("Erro ao buscar slides:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSlides();
  }, []);

  // Slides ativos - fallback com gradiente da marca (sem imagens fictícias)
  const fallbackSlides: HeroSlide[] = [{
    id: "default-0",
    title: "Encontre o imóvel ideal",
    paragraph: "",
    badge: "+ de 2.000 imóveis em Sua Cidade e Tamboré",
    bgImage: undefined,
    bgOverlay: "bg-gradient-to-br from-[#0B2545] via-[#163A6B] to-[#1a2d4a]",
    titleColor: "#FFFFFF",
    paragraphColor: "#FFFFFF",
  }];
  const activeSlides = slides.length > 0 ? slides : fallbackSlides;

  // Auto-rotate slides
  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % activeSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeSlides.length]);

  const currentSlide = activeSlides[currentSlideIndex] || activeSlides[0];

  // Handle valor input with BRL mask
  const handleValorMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValorMin(formatBRL(e.target.value));
  };

  const handleValorMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValorMax(formatBRL(e.target.value));
  };

  // Handle search
  const handleSearch = () => {
    setIsSearching(true);
    const params = new URLSearchParams();
    
    // Se buscar por código de referência, enviar apenas o código (sem outros filtros)
    if (referencia) {
      params.set("ref", referencia.toUpperCase());
      setTimeout(() => {
        router.push(`/imoveis?${params.toString()}`);
      }, 500);
      return;
    }

    if (negocio) params.set("negocio", negocio);
    if (tipo) params.set("tipo", tipo);
    if (valorMin) params.set("valorMin", parseBRL(valorMin));
    if (valorMax) params.set("valorMax", parseBRL(valorMax));
    if (condominios.length > 0) params.set("condominio", condominios.join(","));
    // Filtros avançados
    if (quartos > 0) params.set("quartos", quartos.toString());
    if (suites > 0) params.set("suites", suites.toString());
    if (vagas > 0) params.set("vagas", vagas.toString());
    if (areaMin) params.set("areaMin", areaMin);
    if (areaMax) params.set("areaMax", areaMax);
    if (areaTerrenoMin) params.set("areaTerrenoMin", areaTerrenoMin);
    if (areaTerrenoMax) params.set("areaTerrenoMax", areaTerrenoMax);
    if (caracteristicas.length > 0) params.set("caracteristicas", caracteristicas.join(","));
    if (subtipos.length > 0) params.set("subtipos", subtipos.join(","));

    setTimeout(() => {
      router.push(`/imoveis?${params.toString()}`);
    }, 500);
  };

  const toggleDropdown = (name: string) => {
    loadFiltersData();
    setOpenDropdown(openDropdown === name ? null : name);
  };

  // items-center centraliza o conteúdo na vertical. Ao abrir os filtros
  // avançados o bloco cresce e a centralização empurra o topo para cima — como
  // a seção sobe 20 (-mt-20) para ficar sob o header fixo, o título e os
  // rótulos dos filtros acabavam encobertos. Com o avançado aberto o conteúdo
  // passa a ancorar no topo e só cresce para baixo.
  return (
    <section
      className={`relative min-h-[50vh] sm:min-h-[60vh] flex justify-center -mt-20 pt-20 ${
        showFiltrosAvancados ? "items-start" : "items-center"
      }`}
    >
      {/* Background Images — primeiro slide sem animação p/ LCP rápido */}
      <div className="absolute inset-0 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${slides.length > 0 ? "api" : "fallback"}-${currentSlideIndex}`}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0"
          >
            {currentSlide?.bgImage && (
              <Image
                src={currentSlide.bgImage}
                alt="Imóvel de luxo"
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Overlay gradiente */}
      <div className={`absolute inset-0 ${currentSlide?.bgOverlay || "bg-gradient-to-b from-[#0B2545]/60 via-[#0B2545]/40 to-[#0B2545]/90"}`} />

      {/* Indicadores de slide */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {activeSlides.map((_: HeroSlide, index: number) => (
            <button
              key={index}
              onClick={() => setCurrentSlideIndex(index)}
              aria-label={`Ir para slide ${index + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentSlideIndex ? "w-8 bg-white" : "w-1.5 bg-white/50 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}

      {/* Conteúdo */}
      <div className="relative container mx-auto px-3 sm:px-4 py-8 sm:py-20 z-10">
        <div className="text-center mb-4 sm:mb-12">
          {/* Badge - menor no mobile */}
          {currentSlide?.badge && (
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 backdrop-blur-sm mb-2 sm:mb-4">
              <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-green-500" />
              </span>
              <span className="text-[10px] sm:text-sm font-medium text-white">{currentSlide.badge}</span>
            </div>
          )}

          {/* Título */}
          <h1
            className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-2 sm:mb-4 drop-shadow-lg"
            style={{ 
              color: currentSlide?.titleColor || "#FFFFFF",
              textShadow: "0 2px 20px rgba(0,0,0,0.3)"
            }}
          >
            {currentSlide?.title || "Encontre o imóvel ideal"}
          </h1>

          {/* Parágrafo - oculto no mobile */}
          {currentSlide?.paragraph && (
            <p
              className="hidden sm:block text-lg md:text-xl max-w-2xl mx-auto mb-6"
              style={{ color: currentSlide?.paragraphColor || "#FFFFFF" }}
            >
              {currentSlide.paragraph}
            </p>
          )}
        </div>

        {/* Search Box - Glass effect */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl rounded-2xl sm:rounded-[2rem] p-1.5 sm:p-2 shadow-2xl border border-white/20">
            {/* Filtros em linha */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-0.5 lg:gap-0 bg-neutral-50/80 dark:bg-neutral-800/80 rounded-xl sm:rounded-[1.5rem] overflow-visible lg:divide-x divide-neutral-200 dark:divide-neutral-700">
              {/* Negócio */}
              <DropdownFilter
                label="Negócio"
                value={negocio === "venda" ? "Comprar" : "Alugar"}
                placeholder="Selecione"
                isOpen={openDropdown === "negocio"}
                onToggle={() => toggleDropdown("negocio")}
                onClose={closeDropdown}
              >
                {negocioOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setNegocio(option.value);
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                      negocio === option.value
                        ? "bg-[#0B2545]/10 text-[#0B2545]"
                        : "hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    }`}
                  >
                    <span className="font-medium">{option.label}</span>
                    {negocio === option.value && <RiCheckLine className="w-4 h-4" />}
                  </button>
                ))}
              </DropdownFilter>

              {/* Tipo */}
              <DropdownFilter
                label="Tipo"
                value={tipoOptions.find(t => t.value === tipo)?.label || ""}
                placeholder="Todos"
                isOpen={openDropdown === "tipo"}
                onToggle={() => toggleDropdown("tipo")}
                onClose={closeDropdown}
              >
                <button
                  onClick={() => {
                    setTipo("");
                    setOpenDropdown(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors whitespace-nowrap ${
                    !tipo ? "bg-[#0B2545]/10 text-[#0B2545]" : "hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  }`}
                >
                  <span className="text-sm font-medium">Todos</span>
                  {!tipo && <RiCheckLine className="w-4 h-4 ml-2" />}
                </button>
                {tipoOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setTipo(option.value);
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors whitespace-nowrap ${
                      tipo === option.value
                        ? "bg-[#0B2545]/10 text-[#0B2545]"
                        : "hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    }`}
                  >
                    <option.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium">{option.label}</span>
                    {tipo === option.value && <RiCheckLine className="w-4 h-4 ml-auto flex-shrink-0" />}
                  </button>
                ))}
              </DropdownFilter>

              {/* Valor Mín - Input */}
              <div className="flex-1 min-w-[100px] sm:min-w-[140px] px-3 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-neutral-800 lg:bg-transparent">
                <span className="text-[9px] sm:text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Valor Mín.</span>
                <div className="flex items-center">
                  <span className="text-xs sm:text-sm text-neutral-400 mr-1">R$</span>
                  <input
                    type="text"
                    value={valorMin}
                    onChange={handleValorMinChange}
                    placeholder="0,00"
                    className="w-full text-base sm:text-sm font-medium text-neutral-900 dark:text-white bg-transparent outline-none placeholder:text-neutral-400"
                  />
                </div>
              </div>

              {/* Valor Máx - Input */}
              <div className="flex-1 min-w-[100px] sm:min-w-[140px] px-3 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-neutral-800 lg:bg-transparent">
                <span className="text-[9px] sm:text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Valor Máx.</span>
                <div className="flex items-center">
                  <span className="text-xs sm:text-sm text-neutral-400 mr-1">R$</span>
                  <input
                    type="text"
                    value={valorMax}
                    onChange={handleValorMaxChange}
                    placeholder="Ilimitado"
                    className="w-full text-base sm:text-sm font-medium text-neutral-900 dark:text-white bg-transparent outline-none placeholder:text-neutral-400"
                  />
                </div>
              </div>

              {/* Condomínio - Botão para abrir modal */}
              <button
                type="button"
                onClick={() => { loadFiltersData(); setCondominioModal(true); }}
                className="flex-1 min-w-[100px] sm:min-w-[120px] flex flex-col items-start px-3 sm:px-4 py-2 sm:py-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                <span className="text-[9px] sm:text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Condomínio</span>
                <div className="flex items-center gap-1.5 sm:gap-2 w-full">
                  <span className="text-xs sm:text-sm font-medium text-neutral-900 dark:text-white truncate">
                    {condominios.length > 0 ? `${condominios.length} selecionado${condominios.length > 1 ? "s" : ""}` : "Todos"}
                  </span>
                  <RiArrowDownSLine className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400 ml-auto flex-shrink-0" />
                </div>
              </button>

              {/* Referência */}
              <div className="flex-1 min-w-[100px] sm:min-w-[110px] px-3 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-neutral-800 lg:bg-transparent">
                <span className="text-[9px] sm:text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Ref.</span>
                <input
                  type="text"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value.toUpperCase())}
                  placeholder="CNCF00000"
                  className="w-full text-base sm:text-sm font-medium text-neutral-900 dark:text-white bg-transparent outline-none placeholder:text-neutral-400 uppercase"
                />
              </div>

              {/* Botão Pesquisar - Desktop */}
              <motion.button
                onClick={handleSearch}
                disabled={isSearching}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="hidden lg:flex items-center gap-2 px-8 py-4 bg-[#25D366] text-white font-semibold rounded-[1.25rem] hover:bg-[#1DA851] transition-colors disabled:opacity-70 m-1"
              >
                {isSearching ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <>
                    <RiSearchLine className="w-5 h-5" />
                    Pesquisar Imóveis
                  </>
                )}
              </motion.button>
            </div>

            {/* Botão Pesquisar - Mobile */}
            <motion.button
              onClick={handleSearch}
              disabled={isSearching}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="lg:hidden w-full mt-4 py-4 bg-[#25D366] text-white font-semibold rounded-xl hover:bg-[#1DA851] transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSearching ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  <RiSearchLine className="w-5 h-5" />
                  Pesquisar Imóveis
                </>
              )}
            </motion.button>
          </div>

          {/* Botão Filtros Avançados */}
          <button
            type="button"
            onClick={() => { loadFiltersData(); setShowFiltrosAvancados(!showFiltrosAvancados); }}
            className="mt-3 flex items-center justify-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors mx-auto"
          >
            <RiFilter3Line className="w-4 h-4" />
            Filtros Avançados
            {(quartos > 0 || suites > 0 || vagas > 0 || areaMin || areaMax || areaTerrenoMin || areaTerrenoMax || caracteristicas.length > 0 || subtipos.length > 0) && (
              <span className="px-1.5 py-0.5 bg-white/20 rounded text-xs">
                {[quartos > 0, suites > 0, vagas > 0, areaMin, areaMax, areaTerrenoMin, areaTerrenoMax, caracteristicas.length > 0, subtipos.length > 0].filter(Boolean).length}
              </span>
            )}
            <RiArrowDownSLine className={`w-4 h-4 transition-transform ${showFiltrosAvancados ? 'rotate-180' : ''}`} />
          </button>

          {/* Filtros Avançados Expandidos */}
          <AnimatePresence>
            {showFiltrosAvancados && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mt-4"
              >
                <div className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-xl border border-white/20">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {/* Quartos */}
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3">
                      <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Quartos</span>
                      <div className="flex items-center justify-between mt-2">
                        <button
                          type="button"
                          onClick={() => setQuartos(Math.max(0, quartos - 1))}
                          className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                        >
                          <RiSubtractLine className="w-4 h-4" />
                        </button>
                        <span className="font-semibold text-neutral-900 dark:text-white">{quartos}+</span>
                        <button
                          type="button"
                          onClick={() => setQuartos(quartos + 1)}
                          className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                        >
                          <RiAddLine className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Suítes */}
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3">
                      <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Suítes</span>
                      <div className="flex items-center justify-between mt-2">
                        <button
                          type="button"
                          onClick={() => setSuites(Math.max(0, suites - 1))}
                          className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                        >
                          <RiSubtractLine className="w-4 h-4" />
                        </button>
                        <span className="font-semibold text-neutral-900 dark:text-white">{suites}+</span>
                        <button
                          type="button"
                          onClick={() => setSuites(suites + 1)}
                          className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                        >
                          <RiAddLine className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Vagas */}
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3">
                      <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Vagas</span>
                      <div className="flex items-center justify-between mt-2">
                        <button
                          type="button"
                          onClick={() => setVagas(Math.max(0, vagas - 1))}
                          className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                        >
                          <RiSubtractLine className="w-4 h-4" />
                        </button>
                        <span className="font-semibold text-neutral-900 dark:text-white">{vagas}+</span>
                        <button
                          type="button"
                          onClick={() => setVagas(vagas + 1)}
                          className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                        >
                          <RiAddLine className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Área Construída Mín */}
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3">
                      <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Área Mín (m²)</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={areaMin}
                        onChange={(e) => setAreaMin(e.target.value)}
                        className="w-full mt-2 px-3 py-2 rounded-lg bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-base sm:text-sm focus:ring-2 focus:ring-[#0B2545] outline-none"
                      />
                    </div>

                    {/* Área Construída Máx */}
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3">
                      <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Área Máx (m²)</span>
                      <input
                        type="number"
                        placeholder="Ilimitado"
                        value={areaMax}
                        onChange={(e) => setAreaMax(e.target.value)}
                        className="w-full mt-2 px-3 py-2 rounded-lg bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-base sm:text-sm focus:ring-2 focus:ring-[#0B2545] outline-none"
                      />
                    </div>
                  </div>

                  {/* Área Terreno */}
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 mt-4">
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3">
                      <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Terreno Mín (m²)</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={areaTerrenoMin}
                        onChange={(e) => setAreaTerrenoMin(e.target.value)}
                        className="w-full mt-2 px-3 py-2 rounded-lg bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-base sm:text-sm focus:ring-2 focus:ring-[#0B2545] outline-none"
                      />
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3">
                      <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Terreno Máx (m²)</span>
                      <input
                        type="number"
                        placeholder="Ilimitado"
                        value={areaTerrenoMax}
                        onChange={(e) => setAreaTerrenoMax(e.target.value)}
                        className="w-full mt-2 px-3 py-2 rounded-lg bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-base sm:text-sm focus:ring-2 focus:ring-[#0B2545] outline-none"
                      />
                    </div>
                  </div>

                  {/* Subtipos */}
                  {tipo && (
                    <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                      <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Subtipo</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(tipo === "apartamento" ? [
                          { value: "APARTAMENTO_PADRAO", label: "Padrão" },
                          { value: "APARTAMENTO_COBERTURA", label: "Cobertura" },
                          { value: "APARTAMENTO_DUPLEX", label: "Duplex" },
                          { value: "APARTAMENTO_GARDEN", label: "Garden" },
                          { value: "APARTAMENTO_STUDIO", label: "Studio" },
                          { value: "APARTAMENTO_FLAT", label: "Flat" },
                        ] : tipo === "casa" ? [
                          { value: "CASA_PADRAO", label: "Padrão" },
                          { value: "CASA_SOBRADO", label: "Sobrado" },
                          { value: "CASA_TERREA", label: "Térrea" },
                          { value: "CASA_DUPLEX", label: "Duplex" },
                          { value: "CASA_TRIPLEX", label: "Triplex" },
                          { value: "CASA_VILLAGIO", label: "Villagio" },
                        ] : tipo === "terreno" ? [
                          { value: "TERRENO_PADRAO", label: "Padrão" },
                          { value: "TERRENO_PLANO", label: "Plano" },
                          { value: "TERRENO_ESQUINA", label: "Esquina" },
                          { value: "TERRENO_ACLIVE", label: "Aclive" },
                          { value: "TERRENO_DECLIVE", label: "Declive" },
                        ] : tipo === "comercial" ? [
                          { value: "SALA_COMERCIAL", label: "Sala Comercial" },
                          { value: "LOJA", label: "Loja" },
                          { value: "PREDIO_COMERCIAL", label: "Prédio Comercial" },
                        ] : []).map((sub) => (
                          <button
                            key={sub.value}
                            type="button"
                            onClick={() => {
                              if (subtipos.includes(sub.value)) {
                                setSubtipos(subtipos.filter(s => s !== sub.value));
                              } else {
                                setSubtipos([...subtipos, sub.value]);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                              subtipos.includes(sub.value)
                                ? "bg-[#0B2545] text-white"
                                : "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                            }`}
                          >
                            {sub.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Diferenciais - Carregados da API (sincronizado com pág de edição) */}
                  <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Diferenciais</span>
                    <div className="flex flex-wrap gap-2 mt-2 max-h-[200px] overflow-y-auto scrollbar-hide">
                      {diferenciaisOptions.map((car) => (
                        <button
                          key={car}
                          type="button"
                          onClick={() => {
                            if (caracteristicas.includes(car)) {
                              setCaracteristicas(caracteristicas.filter(c => c !== car));
                            } else {
                              setCaracteristicas([...caracteristicas, car]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            caracteristicas.includes(car)
                              ? "bg-[#0B2545] text-white"
                              : "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                          }`}
                        >
                          {car}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Botão Limpar Filtros */}
                  {(quartos > 0 || suites > 0 || vagas > 0 || areaMin || areaMax || areaTerrenoMin || areaTerrenoMax || caracteristicas.length > 0 || subtipos.length > 0) && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuartos(0);
                        setSuites(0);
                        setVagas(0);
                        setAreaMin("");
                        setAreaMax("");
                        setAreaTerrenoMin("");
                        setAreaTerrenoMax("");
                        setCaracteristicas([]);
                        setSubtipos([]);
                      }}
                      className="mt-4 text-sm text-[#25D366] hover:text-[#1DA851] font-medium transition-colors"
                    >
                      Limpar filtros avançados
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* Modal de Condomínios */}
      <CondominioModal
        isOpen={condominioModal}
        onClose={() => setCondominioModal(false)}
        condominios={condominios}
        setCondominios={setCondominios}
        condominioOptions={condominioOptions}
        tipoSelecionado={tipo}
      />
    </section>
  );
}
