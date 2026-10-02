"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiSearchLine,
  RiFilterLine,
  RiCloseLine,
  RiArrowDownSLine,
  RiRefreshLine,
  RiMapPinLine,
  RiMoneyDollarCircleLine,
  RiRulerLine,
  RiHome4Line,
  RiBuildingLine,
} from "react-icons/ri";
import {
  PropertyFilters as Filters,
  PropertyType,
  PropertyCategory,
  PropertyStatus,
  Condominium,
  propertyTypeLabels,
  propertyCategoryLabels,
  propertyStatusLabels,
} from "@/types/property";

interface PropertyFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onReset: () => void;
}


export function PropertyFilters({ filters, onFiltersChange, onReset }: PropertyFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [condominiums, setCondominiums] = useState<Condominium[]>([]);
  const [existingStatuses, setExistingStatuses] = useState<string[]>([]);
  const [dynamicTypes, setDynamicTypes] = useState<{type: string; title: string}[]>([]);
  const [brokers, setBrokers] = useState<{id: string; name: string}[]>([]);
  const [propertyFeatures, setPropertyFeatures] = useState<string[]>([]);
  
  // Estado local para busca com debounce
  const [localSearch, setLocalSearch] = useState(filters.search || "");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const urlDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const advancedRef = useRef<HTMLDivElement>(null);

  // Fechar filtros ao clicar fora
  useEffect(() => {
    if (!showAdvanced) return;
    const handleClickOutside = (e: MouseEvent) => {
      // Arrastar a barra de rolagem dispara mousedown com target fora do painel,
      // o que fechava os filtros ao rolar a página no desktop. A barra fica além
      // do clientWidth/clientHeight, então dá pra descartar por coordenada.
      const doc = document.documentElement;
      if (e.clientX > doc.clientWidth || e.clientY > doc.clientHeight) return;

      if (advancedRef.current && !advancedRef.current.contains(e.target as Node)) {
        setShowAdvanced(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showAdvanced]);

  // Carregar condomínios, cidades, status existentes e tipos dinâmicos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [condoRes, statusRes, typesRes, brokersRes, optionsRes] = await Promise.all([
          fetch("/api/condominiums"),
          fetch("/api/properties/statuses"),
          fetch("/api/site/property-types?active=true"),
          fetch("/api/admin/brokers"),
          fetch("/api/admin/properties/options")
        ]);
        
        if (condoRes.ok) {
          const data = await condoRes.json();
          setCondominiums(data.condominiums || []);
        }
        if (statusRes.ok) {
          const data = await statusRes.json();
          setExistingStatuses(data.statuses || []);
        }
        if (typesRes.ok) {
          const data = await typesRes.json();
          setDynamicTypes(data.types || []);
        }
        if (brokersRes.ok) {
          const data = await brokersRes.json();
          setBrokers(data.brokers || []);
        }
        if (optionsRes.ok) {
          const data = await optionsRes.json();
          setPropertyFeatures(data.features || []);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };
    fetchData();
  }, []);

  // Sincronizar filtros com URL
  const updateUrlParams = (newFilters: Filters) => {
    const params = new URLSearchParams();
    if (newFilters.search) params.set("search", newFilters.search);
    if (newFilters.status) params.set("status", newFilters.status);
    if (newFilters.city) params.set("city", newFilters.city);
    if (newFilters.type) params.set("type", newFilters.type);
    if (newFilters.categories?.length) params.set("categories", newFilters.categories.join(","));
    if ((newFilters as any).condominiumIds?.length) params.set("condominiumIds", (newFilters as any).condominiumIds.join(","));
    if (newFilters.minPrice) params.set("minPrice", String(newFilters.minPrice));
    if (newFilters.maxPrice) params.set("maxPrice", String(newFilters.maxPrice));
    if (newFilters.minArea) params.set("minArea", String(newFilters.minArea));
    if (newFilters.maxArea) params.set("maxArea", String(newFilters.maxArea));
    if (newFilters.bedrooms) params.set("bedrooms", String(newFilters.bedrooms));
    if (newFilters.parkingSpaces) params.set("parkingSpaces", String(newFilters.parkingSpaces));
    if (newFilters.isFeatured) params.set("isFeatured", "true");
    if (newFilters.hasElevator) params.set("hasElevator", "true");
    if (newFilters.isFurnished) params.set("isFurnished", "true");
    if (newFilters.acceptsExchange) params.set("acceptsExchange", "true");
    // Novos filtros
    if (newFilters.isExclusive) params.set("isExclusive", "true");
    if (newFilters.isThirdPartyExclusive) params.set("isThirdPartyExclusive", "true");
    if (newFilters.hasPlate) params.set("hasPlate", "true");
    if ((newFilters as any).noPlate) params.set("noPlate", "true");
    if ((newFilters as any).isOccupied) params.set("isOccupied", "true");
    if (newFilters.hasPriceReduction) params.set("hasPriceReduction", "true");
    if ((newFilters as any).hasWall) params.set("hasWall", "true");
    if ((newFilters as any).hasPriceIncrease) params.set("hasPriceIncrease", "true");
    if ((newFilters as any).hiddenFromSite) params.set("hiddenFromSite", "true");
    if ((newFilters as any).semFoto) params.set("semFoto", "true");
    if ((newFilters as any).noCondominium) params.set("noCondominium", "true");
    if ((newFilters as any).isOffMarket) params.set("isOffMarket", "true");
    if (newFilters.soldDateFrom) params.set("soldDateFrom", newFilters.soldDateFrom);
    if (newFilters.soldDateTo) params.set("soldDateTo", newFilters.soldDateTo);
    if ((newFilters as any).createdFrom) params.set("createdFrom", (newFilters as any).createdFrom);
    if ((newFilters as any).createdTo) params.set("createdTo", (newFilters as any).createdTo);
    if ((newFilters as any).updatedFrom) params.set("updatedFrom", (newFilters as any).updatedFrom);
    if ((newFilters as any).updatedTo) params.set("updatedTo", (newFilters as any).updatedTo);
    if (newFilters.sortBy) params.set("sortBy", newFilters.sortBy);
    if (newFilters.sortOrder) params.set("sortOrder", newFilters.sortOrder);
    // Filtros de permuta
    if ((newFilters as any).exchangeMinValue) params.set("exchangeMinValue", String((newFilters as any).exchangeMinValue));
    if ((newFilters as any).exchangeMaxValue) params.set("exchangeMaxValue", String((newFilters as any).exchangeMaxValue));
    if ((newFilters as any).exchangeTypes?.length) params.set("exchangeTypes", (newFilters as any).exchangeTypes.join(","));
    if ((newFilters as any).ownerId) params.set("ownerId", (newFilters as any).ownerId);
    if ((newFilters as any).featuresFilter?.length) params.set("featuresFilter", (newFilters as any).featuresFilter.join(","));
    if ((newFilters as any).address) params.set("address", (newFilters as any).address);
    if ((newFilters as any).number) params.set("number", (newFilters as any).number);
    if ((newFilters as any).complement) params.set("complement", (newFilters as any).complement);
    if ((newFilters as any).ownerSearch) params.set("ownerSearch", (newFilters as any).ownerSearch);
    
    const queryString = params.toString();
    const url = `${pathname}${queryString ? `?${queryString}` : ""}`;

    // Debounce da navegação: sem isso cada tecla digitada dispara um router.replace,
    // o que no mobile enfileira navegações e faz o input perder caracteres.
    if (urlDebounceRef.current) clearTimeout(urlDebounceRef.current);
    urlDebounceRef.current = setTimeout(() => {
      router.replace(url, { scroll: false });
    }, 500);
  };

  // Helper para formatar valor com separador de milhar (3.000)
  const formatCurrency = (value: number | undefined): string => {
    if (!value) return "";
    return value.toLocaleString("pt-BR");
  };

  // Helper para parse de valor formatado (remove pontos de milhar)
  const parseCurrency = (value: string): number | undefined => {
    const cleaned = value.replace(/\./g, "").replace(/\D/g, "");
    if (!cleaned) return undefined;
    return Number(cleaned);
  };

  const updateFilter = (key: keyof Filters, value: any) => {
    const newFilters = { ...filters, [key]: value || undefined };
    onFiltersChange(newFilters);
    updateUrlParams(newFilters);
  };

  // Campos de digitação livre (texto/número) precisam de estado local: o valor
  // exibido vem do estado do pai, que só atualiza depois do fetch. Sem isso, no
  // mobile o input "não aceita" o que se digita — o caractere é sobrescrito pelo
  // valor antigo antes do pai re-renderizar.
  const [localText, setLocalText] = useState<Record<string, string>>({});
  const textDebounceRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Limpa o rascunho local junto com o reset, senão o input segue exibindo o
  // texto digitado mesmo depois de "Limpar filtros".
  const handleReset = () => {
    Object.values(textDebounceRef.current).forEach(clearTimeout);
    textDebounceRef.current = {};
    if (urlDebounceRef.current) clearTimeout(urlDebounceRef.current);
    setLocalText({});
    setLocalSearch("");
    onReset();
  };

  const textValue = (key: string, current: string | number | undefined): string =>
    localText[key] !== undefined ? localText[key] : current != null && current !== "" ? String(current) : "";

  const updateTextFilter = (key: string, raw: string, parse?: (v: string) => any) => {
    setLocalText((prev) => ({ ...prev, [key]: raw }));

    // Um timer POR CAMPO. Com um timer só compartilhado, preencher preço
    // mínimo e passar para o máximo dentro da janela do debounce cancelava a
    // atualização do primeiro — e como ele nunca chegava ao estado, o filtro
    // era perdido e a busca voltava sem restrição.
    const anterior = textDebounceRef.current[key];
    if (anterior) clearTimeout(anterior);

    textDebounceRef.current[key] = setTimeout(() => {
      const parsed = parse ? parse(raw) : raw || undefined;
      const newFilters = { ...filtersRef.current, [key]: parsed } as Filters;
      onFiltersChange(newFilters);
      updateUrlParams(newFilters);
      delete textDebounceRef.current[key];
    }, 450);
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  // Atualizar localSearch quando filters.search mudar externamente
  useEffect(() => {
    setLocalSearch(filters.search || "");
  }, [filters.search]);

  // Função de busca com debounce (usa ref para evitar stale closure dos filtros)
  const handleSearchChange = useCallback((value: string) => {
    setLocalSearch(value);
    
    // Limpar timeout anterior
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Aguardar 400ms antes de atualizar o filtro
    debounceRef.current = setTimeout(() => {
      const currentFilters = filtersRef.current;
      const newFilters = { ...currentFilters, search: value || undefined };
      onFiltersChange(newFilters);
      updateUrlParams(newFilters);
    }, 400);
  }, [onFiltersChange]);

  // Limpar timeout ao desmontar
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (urlDebounceRef.current) {
        clearTimeout(urlDebounceRef.current);
      }
      Object.values(textDebounceRef.current).forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="space-y-2">
      {/* Search Bar Compacto */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={(e) => {
              // Ao pressionar Enter, buscar imediatamente
              if (e.key === "Enter") {
                if (debounceRef.current) clearTimeout(debounceRef.current);
                const currentFilters = filtersRef.current;
                const newFilters = { ...currentFilters, search: localSearch || undefined };
                onFiltersChange(newFilters);
                updateUrlParams(newFilters);
              }
            }}
            placeholder="Buscar por código, título, bairro, cidade, telefone..."
            className="w-full h-10 sm:h-9 pl-9 pr-3 text-base sm:text-sm rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#0A1E3D]"
          />
        </div>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-1.5 h-10 sm:h-9 px-3.5 sm:px-3 rounded-lg border text-sm transition-all ${
            showAdvanced || activeFiltersCount > 0
              ? "bg-[#0A1E3D] border-[#0A1E3D] text-white"
              : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 hover:border-[#0A1E3D]"
          }`}
        >
          <RiFilterLine className="w-4 h-4" />
          {activeFiltersCount > 0 && (
            <span className="w-4 h-4 flex items-center justify-center bg-white text-[#0A1E3D] rounded-full text-[10px] font-bold">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {activeFiltersCount > 0 && (
          <button
            onClick={handleReset}
            className="h-10 sm:h-9 px-3.5 sm:px-3 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:border-red-500 hover:text-red-500 text-sm"
          >
            <RiRefreshLine className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            ref={advancedRef}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 sm:p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-5 sm:space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-neutral-900 dark:text-white">
                  Filtros Avançados
                </h3>
                <button
                  onClick={() => setShowAdvanced(false)}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {/* Finalidade - Multi-seleção */}
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Finalidade
                  </label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const current = filters.categories || [];
                        if (current.includes("VENDA")) {
                          updateFilter("categories", current.filter(c => c !== "VENDA"));
                        } else {
                          updateFilter("categories", [...current, "VENDA"]);
                        }
                      }}
                      className={`flex-1 h-10 sm:h-9 px-2 rounded-lg text-sm sm:text-xs font-medium transition-colors ${
                        (filters.categories || []).includes("VENDA")
                          ? "bg-[#0A1E3D] text-white"
                          : "bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-[#0A1E3D]"
                      }`}
                    >
                      Venda
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const current = filters.categories || [];
                        if (current.includes("LOCACAO")) {
                          updateFilter("categories", current.filter(c => c !== "LOCACAO"));
                        } else {
                          updateFilter("categories", [...current, "LOCACAO"]);
                        }
                      }}
                      className={`flex-1 h-10 sm:h-9 px-2 rounded-lg text-sm sm:text-xs font-medium transition-colors ${
                        (filters.categories || []).includes("LOCACAO")
                          ? "bg-[#0A1E3D] text-white"
                          : "bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-[#0A1E3D]"
                      }`}
                    >
                      Locação
                    </button>
                  </div>
                </div>

                {/* Condomínio - Multi-seleção */}
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    <RiBuildingLine className="inline w-3 h-3 mr-1" />
                    Condomínios
                  </label>
                  <div className="relative">
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          const currentIds = (filters as any).condominiumIds || [];
                          if (!currentIds.includes(e.target.value)) {
                            updateFilter("condominiumIds" as any, [...currentIds, e.target.value]);
                          }
                        }
                      }}
                      className="w-full h-10 sm:h-9 px-3 text-base sm:text-sm rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A1E3D]/20"
                    >
                      <option value="">+ Adicionar condomínio</option>
                      {condominiums
                        .filter(c => !((filters as any).condominiumIds || []).includes(c.id))
                        .map((condo) => (
                          <option key={condo.id} value={condo.id}>
                            {condo.name} {condo.neighborhood ? `- ${condo.neighborhood}` : ""}
                          </option>
                        ))}
                    </select>
                    {((filters as any).condominiumIds || []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {((filters as any).condominiumIds || []).map((id: string) => {
                          const condo = condominiums.find(c => c.id === id);
                          return condo ? (
                            <span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-[#0A1E3D]/10 text-[#0A1E3D] dark:bg-sky-500/20 dark:text-sky-400 rounded text-xs">
                              {condo.name}
                              <button
                                type="button"
                                onClick={() => {
                                  const newIds = ((filters as any).condominiumIds || []).filter((i: string) => i !== id);
                                  updateFilter("condominiumIds" as any, newIds.length > 0 ? newIds : undefined);
                                }}
                                className="hover:text-red-500"
                              >
                                <RiCloseLine className="w-3 h-3" />
                              </button>
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Corretor Captador */}
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Corretor Captador
                  </label>
                  <select
                    value={(filters as any).ownerId || ""}
                    onChange={(e) => updateFilter("ownerId" as any, e.target.value)}
                    className="w-full h-10 sm:h-9 px-3 text-base sm:text-sm rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A1E3D]/20"
                  >
                    <option value="">Todos</option>
                    {brokers.map((broker) => (
                      <option key={broker.id} value={broker.id}>
                        {broker.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tipo - CASA/APTO/TERRENO/COMERCIAL (multi-seleção) */}
                <div className="min-w-0">
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    <RiHome4Line className="inline w-3 h-3 mr-1" />
                    Tipo
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { value: "CASA", label: "Casa" },
                      { value: "APARTAMENTO", label: "Apto" },
                      { value: "TERRENO", label: "Terreno" },
                      { value: "COMERCIAL", label: "Com." },
                    ].map((item) => {
                      const selectedTypes = (filters.type || "").split(",").filter(Boolean);
                      const isSelected = selectedTypes.includes(item.value);
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => {
                            const current = (filters.type || "").split(",").filter(Boolean);
                            let newTypes: string[];
                            if (isSelected) {
                              newTypes = current.filter(t => t !== item.value);
                            } else {
                              newTypes = [...current, item.value];
                            }
                            const newFilters = {
                              ...filters,
                              type: newTypes.length > 0 ? newTypes.join(",") as PropertyType : undefined,
                              subType: undefined,
                            } as any;
                            onFiltersChange(newFilters);
                            updateUrlParams(newFilters);
                          }}
                          className={`flex-1 h-10 sm:h-9 px-2 rounded-lg text-sm sm:text-xs font-medium transition-colors ${
                            isSelected
                              ? "bg-[#0A1E3D] text-white"
                              : "bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-[#0A1E3D]"
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                  {/* Subtipo - aparece quando tipo(s) selecionado(s) */}
                  {filters.type && (() => {
                    const subTypesByType: Record<string, { value: string; label: string }[]> = {
                      APARTAMENTO: [
                        { value: "APARTAMENTO_COBERTURA", label: "Cobertura" },
                        { value: "APARTAMENTO_DUPLEX", label: "Duplex" },
                        { value: "APARTAMENTO_GARDEN", label: "Garden" },
                        { value: "APARTAMENTO_FLAT", label: "Flat" },
                        { value: "APARTAMENTO_STUDIO", label: "Studio" },
                        { value: "APARTAMENTO_LOFT", label: "Loft" },
                      ],
                      CASA: [
                        { value: "CASA_TERREA", label: "Térrea" },
                        { value: "CASA_SOBRADO", label: "Sobrado" },
                        { value: "CASA_DUPLEX", label: "Duplex" },
                        { value: "CASA_CONDOMINIO", label: "Condomínio" },
                        { value: "CASA_GEMINADA", label: "Geminada" },
                        { value: "CASA_VILLAGIO", label: "Villagio" },
                      ],
                      TERRENO: [
                        { value: "TERRENO_ESQUINA", label: "Esquina" },
                        { value: "TERRENO_PLANO", label: "Plano" },
                        { value: "TERRENO_ACLIVE", label: "Aclive" },
                        { value: "TERRENO_DECLIVE", label: "Declive" },
                      ],
                      COMERCIAL: [
                        { value: "SALA_COMERCIAL", label: "Sala" },
                        { value: "LOJA", label: "Loja" },
                        { value: "GALPAO", label: "Galpão" },
                        { value: "PREDIO_COMERCIAL", label: "Prédio" },
                        { value: "PONTO_COMERCIAL", label: "Ponto" },
                      ],
                    };
                    const selectedTypes = (filters.type || "").split(",").filter(Boolean);
                    const subs = selectedTypes.flatMap(t => subTypesByType[t] || []);
                    if (subs.length === 0) return null;
                    return (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {subs.map(s => (
                          <button
                            key={s.value}
                            type="button"
                            onClick={() => updateFilter("subType" as any, (filters as any).subType === s.value ? undefined : s.value)}
                            className={`px-2.5 py-1.5 sm:py-1 rounded text-xs sm:text-[10px] font-medium transition-colors ${
                              (filters as any).subType === s.value
                                ? "bg-[#25D366] text-white"
                                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200"
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Status
                  </label>
                  <select
                    value={(filters as any).soldByTappy ? "VENDIDO_TAPPY" : (filters.status || "")}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "VENDIDO_TAPPY") {
                        const newF = { ...filters, status: "VENDIDO" as any, soldByTappy: true } as any;
                        onFiltersChange(newF);
                        updateUrlParams(newF);
                      } else {
                        const { soldByTappy, ...rest } = filters as any;
                        const newF = { ...rest, status: val as PropertyStatus } as any;
                        onFiltersChange(newF);
                        updateUrlParams(newF);
                      }
                    }}
                    className="w-full h-10 sm:h-9 px-3 text-base sm:text-sm rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A1E3D]/20"
                  >
                    <option value="">Todos</option>
                    {existingStatuses.length > 0 
                      ? existingStatuses.map((status) => (
                          <option key={status} value={status}>{propertyStatusLabels[status as PropertyStatus] || status}</option>
                        ))
                      : Object.entries(propertyStatusLabels).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))
                    }
                    <option value="VENDIDO_TAPPY" className="font-semibold text-green-600">🏆 Vendidos pela Tappy</option>
                  </select>
                </div>

                {/* Endereço */}
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    <RiMapPinLine className="inline w-3 h-3 mr-1" />
                    Endereço (Rua, Alameda...)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={textValue("address", (filters as any).address)}
                      onChange={(e) => updateTextFilter("address", e.target.value)}
                      placeholder="Ex: Alameda dos Antúrios"
                      className="col-span-2 w-full h-10 sm:h-9 px-3 text-base sm:text-sm rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#0A1E3D]/20"
                    />
                    <input
                      type="text"
                      value={textValue("number", (filters as any).number)}
                      onChange={(e) => updateTextFilter("number", e.target.value)}
                      placeholder="Nº"
                      className="w-full h-10 sm:h-9 px-3 text-base sm:text-sm rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#0A1E3D]/20"
                    />
                    <input
                      type="text"
                      value={textValue("complement", (filters as any).complement)}
                      onChange={(e) => updateTextFilter("complement", e.target.value)}
                      placeholder="Torre/Bloco/Apto"
                      className="w-full h-10 sm:h-9 px-3 text-base sm:text-sm rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#0A1E3D]/20"
                    />
                  </div>
                </div>

                {/* Vendedor (CPF ou Nome) */}
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Vendedor (CPF ou Nome)
                  </label>
                  <input
                    type="text"
                    value={textValue("ownerSearch", (filters as any).ownerSearch)}
                    onChange={(e) => updateTextFilter("ownerSearch", e.target.value)}
                    placeholder="Digite CPF ou nome do proprietário..."
                    className="w-full h-10 sm:h-9 px-3 text-base sm:text-sm rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#0A1E3D]/20"
                  />
                </div>

                {/* Bairro - INATIVO
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Bairro
                  </label>
                  <input
                    type="text"
                    value={filters.neighborhood || ""}
                    onChange={(e) => updateFilter("neighborhood", e.target.value)}
                    placeholder="Bairro"
                    className="w-full h-10 sm:h-9 px-3 text-base sm:text-sm rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#0A1E3D]/20"
                  />
                </div>
                */}
              </div>

              {/* Price Range e Áreas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    <RiMoneyDollarCircleLine className="inline w-3 h-3 mr-1" />
                    Faixa de Preço
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-500 text-xs">R$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={localText.minPrice !== undefined ? localText.minPrice : formatCurrency(filters.minPrice)}
                        onChange={(e) => updateTextFilter("minPrice", e.target.value, parseCurrency)}
                        placeholder="Mínimo"
                        className="w-full h-10 sm:h-9 pl-8 pr-2 text-base sm:text-sm rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#0A1E3D]/20"
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-500 text-xs">R$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={localText.maxPrice !== undefined ? localText.maxPrice : formatCurrency(filters.maxPrice)}
                        onChange={(e) => updateTextFilter("maxPrice", e.target.value, parseCurrency)}
                        placeholder="Máximo"
                        className="w-full h-10 sm:h-9 pl-8 pr-2 text-base sm:text-sm rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#0A1E3D]/20"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    <RiRulerLine className="inline w-3 h-3 mr-1" />
                    Área Construída (m²)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={textValue("minArea", filters.minArea)}
                      onChange={(e) => updateTextFilter("minArea", e.target.value, (v) => (v ? Number(v) : undefined))}
                      placeholder="Mínimo"
                      className="w-full h-10 sm:h-9 px-3 text-base sm:text-sm rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#0A1E3D]/20"
                    />
                    <input
                      type="number"
                      value={textValue("maxArea", filters.maxArea)}
                      onChange={(e) => updateTextFilter("maxArea", e.target.value, (v) => (v ? Number(v) : undefined))}
                      placeholder="Máximo"
                      className="w-full h-10 sm:h-9 px-3 text-base sm:text-sm rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#0A1E3D]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    <RiRulerLine className="inline w-3 h-3 mr-1" />
                    Área de Terreno (m²)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={textValue("minTotalArea", (filters as any).minTotalArea)}
                      onChange={(e) => updateTextFilter("minTotalArea", e.target.value, (v) => (v ? Number(v) : undefined))}
                      placeholder="Mínimo"
                      className="w-full h-10 sm:h-9 px-3 text-base sm:text-sm rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#0A1E3D]/20"
                    />
                    <input
                      type="number"
                      value={textValue("maxTotalArea", (filters as any).maxTotalArea)}
                      onChange={(e) => updateTextFilter("maxTotalArea", e.target.value, (v) => (v ? Number(v) : undefined))}
                      placeholder="Máximo"
                      className="w-full h-10 sm:h-9 px-3 text-base sm:text-sm rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#0A1E3D]/20"
                    />
                  </div>
                </div>
              </div>

              {/* Quartos e Vagas - Sem Banheiros */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Quartos
                  </label>
                  <select
                    value={filters.bedrooms || ""}
                    onChange={(e) => updateFilter("bedrooms", e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full h-10 sm:h-9 px-2 text-base sm:text-sm rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A1E3D]/20"
                  >
                    <option value="">Todos</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Vagas
                  </label>
                  <select
                    value={filters.parkingSpaces || ""}
                    onChange={(e) => updateFilter("parkingSpaces", e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full h-10 sm:h-9 px-2 text-base sm:text-sm rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A1E3D]/20"
                  >
                    <option value="">Todas</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                  </select>
                </div>
              </div>

              {/* Características - Grid Compacto com Checkboxes */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Características
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    { key: "hasElevator", label: "Elevador", icon: "🛗" },
                    { key: "isFurnished", label: "Mobiliado", icon: "🛋️" },
                    { key: "hasGroundFloorSuite", label: "Suíte Térrea", icon: "🏠" },
                    { key: "hasFreeView", label: "Vista Livre", icon: "🌅" },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className={`flex items-center gap-2 px-2 py-2.5 sm:py-1.5 rounded-lg cursor-pointer transition-colors text-xs ${
                        (filters as any)[item.key]
                          ? "bg-[#0A1E3D]/10 text-[#0A1E3D] dark:text-sky-400"
                          : "bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={(filters as any)[item.key] || false}
                        onChange={(e) => updateFilter(item.key as any, e.target.checked || undefined)}
                        className="sr-only"
                      />
                      <span>{item.icon}</span>
                      <span className="leading-tight">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Diferenciais e Características (dinâmicos da API) */}
              {propertyFeatures.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Diferenciais e Características
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {propertyFeatures.map((feat) => {
                      const selectedFeatures: string[] = (filters as any).featuresFilter || [];
                      const isSelected = selectedFeatures.includes(feat);
                      return (
                        <label
                          key={feat}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer transition-colors text-xs ${
                            isSelected
                              ? "bg-[#0A1E3D]/10 text-[#0A1E3D] dark:bg-sky-500/20 dark:text-sky-400"
                              : "bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              const current: string[] = (filters as any).featuresFilter || [];
                              const newVal = isSelected
                                ? current.filter((f: string) => f !== feat)
                                : [...current, feat];
                              updateFilter("featuresFilter" as any, newVal.length > 0 ? newVal : undefined);
                            }}
                            className="sr-only"
                          />
                          <span className="leading-tight">{feat}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Filtros Especiais */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Filtros Especiais
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {[
                    { key: "isExclusive", label: "Exclusividade", icon: "⭐", color: "purple" },
                    { key: "isThirdPartyExclusive", label: "Exclus. Terceiros", icon: "🤝", color: "blue" },
                    { key: "hasPlate", label: "Com Placa", icon: "🪧", color: "green" },
                    { key: "noPlate", label: "Sem Placa", icon: "🚫", color: "red" },
                    { key: "isOccupied", label: "Habitado", icon: "🏠", color: "amber" },
                    { key: "hasPriceReduction", label: "Redução de Preço", icon: "📉", color: "red" },
                    { key: "hasPriceIncrease", label: "Aumento de Valor", icon: "📈", color: "amber" },
                    { key: "hasWall", label: "No Muro", icon: "🧱", color: "blue" },
                    { key: "hasIrregularDocs", label: "Doc. Irregular", icon: "⚠️", color: "amber" },
                    { key: "hiddenFromSite", label: "Oculto do Site", icon: "🚫", color: "red" },
                    { key: "semFoto", label: "Sem Foto", icon: "📷", color: "amber" },
                    { key: "noCondominium", label: "Sem Condomínio", icon: "🏢", color: "neutral" },
                    { key: "isOffMarket", label: "Off Market", icon: "🔒", color: "purple" },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className={`flex items-center gap-2 px-2 py-2.5 sm:py-1.5 rounded-lg cursor-pointer transition-colors text-xs ${
                        (filters as any)[item.key]
                          ? item.color === "purple"
                            ? "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400"
                            : item.color === "blue"
                            ? "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400"
                            : item.color === "green"
                            ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                            : item.color === "red"
                            ? "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400"
                            : item.color === "amber"
                            ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"
                            : "bg-[#0A1E3D]/10 text-[#0A1E3D] dark:text-sky-400"
                          : "bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={(filters as any)[item.key] || false}
                        onChange={(e) => updateFilter(item.key as any, e.target.checked || undefined)}
                        className="sr-only"
                      />
                      <span>{item.icon}</span>
                      <span className="leading-tight">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filtros de Condições Comerciais */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  💰 Condições Comerciais
                </label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <label
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors text-xs ${
                      (filters as any).acceptsDirectPayment
                        ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                        : "bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={(filters as any).acceptsDirectPayment || false}
                      onChange={(e) => updateFilter("acceptsDirectPayment" as any, e.target.checked || undefined)}
                      className="sr-only"
                    />
                    <span>💰</span>
                    <span>Parcelamento Direto</span>
                  </label>
                  <label
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors text-xs ${
                      filters.acceptsExchange
                        ? "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400"
                        : "bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={filters.acceptsExchange || false}
                      onChange={(e) => updateFilter("acceptsExchange", e.target.checked || undefined)}
                      className="sr-only"
                    />
                    <span>🔄</span>
                    <span>Aceita Permuta</span>
                  </label>
                  
                  <div>
                    <label className="block text-xs sm:text-[10px] text-neutral-500 mb-1">Valor Mín. Permuta</label>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-500 text-xs">R$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={localText.exchangeMinValue !== undefined ? localText.exchangeMinValue : formatCurrency((filters as any).exchangeMinValue)}
                        onChange={(e) => updateTextFilter("exchangeMinValue", e.target.value, parseCurrency)}
                        placeholder="Mínimo"
                        className="w-full h-10 sm:h-8 pl-8 pr-2 text-base sm:text-xs rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-[10px] text-neutral-500 mb-1">Valor Máx. Permuta</label>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-500 text-xs">R$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={localText.exchangeMaxValue !== undefined ? localText.exchangeMaxValue : formatCurrency((filters as any).exchangeMaxValue)}
                        onChange={(e) => updateTextFilter("exchangeMaxValue", e.target.value, parseCurrency)}
                        placeholder="Máximo"
                        className="w-full h-10 sm:h-8 pl-8 pr-2 text-base sm:text-xs rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Tipologia de Permuta */}
                <div className="mt-3">
                  <label className="block text-xs sm:text-[10px] text-neutral-500 mb-1">Tipologia de Permuta</label>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { value: "CASA", label: "Casa" },
                      { value: "APARTAMENTO", label: "Apto" },
                      { value: "TERRENO", label: "Terreno" },
                      { value: "CARRO", label: "Carro" },
                      { value: "OUTRO", label: "Outro" },
                    ].map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => {
                          const current = (filters as any).exchangeTypes || [];
                          if (current.includes(item.value)) {
                            const newTypes = current.filter((t: string) => t !== item.value);
                            updateFilter("exchangeTypes" as any, newTypes.length > 0 ? newTypes : undefined);
                          } else {
                            updateFilter("exchangeTypes" as any, [...current, item.value]);
                          }
                        }}
                        className={`px-2.5 py-1.5 sm:py-1 rounded text-xs font-medium transition-colors ${
                          ((filters as any).exchangeTypes || []).includes(item.value)
                            ? "bg-orange-500 text-white"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-orange-100 dark:hover:bg-orange-500/20"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Filtro de Período de Cadastro */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  📅 Período de Cadastro
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={(filters as any).createdFrom || ""}
                    onChange={(e) => updateFilter("createdFrom" as any, e.target.value || undefined)}
                    className="w-full h-10 sm:h-9 px-3 text-base sm:text-sm rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A1E3D]/20"
                  />
                  <input
                    type="date"
                    value={(filters as any).createdTo || ""}
                    onChange={(e) => updateFilter("createdTo" as any, e.target.value || undefined)}
                    className="w-full h-10 sm:h-9 px-3 text-base sm:text-sm rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A1E3D]/20"
                  />
                </div>
              </div>

              {/* Filtro de Período de Atualização */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  🔄 Período de Atualização
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={(filters as any).updatedFrom || ""}
                    onChange={(e) => updateFilter("updatedFrom" as any, e.target.value || undefined)}
                    className="w-full h-10 sm:h-9 px-3 text-base sm:text-sm rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A1E3D]/20"
                  />
                  <input
                    type="date"
                    value={(filters as any).updatedTo || ""}
                    onChange={(e) => updateFilter("updatedTo" as any, e.target.value || undefined)}
                    className="w-full h-10 sm:h-9 px-3 text-base sm:text-sm rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A1E3D]/20"
                  />
                </div>
              </div>

              {/* Filtro de Data para Vendidos/Inativos */}
              {(filters.status === "VENDIDO" || filters.status === "ALUGADO" || filters.status === "INATIVO" || filters.status === "INDISPONIVEL") && (
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    📅 Período de Inativação
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={(filters as any).soldDateFrom || ""}
                      onChange={(e) => updateFilter("soldDateFrom" as any, e.target.value || undefined)}
                      className="w-full h-10 sm:h-9 px-3 text-base sm:text-sm rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A1E3D]/20"
                      placeholder="De"
                    />
                    <input
                      type="date"
                      value={(filters as any).soldDateTo || ""}
                      onChange={(e) => updateFilter("soldDateTo" as any, e.target.value || undefined)}
                      className="w-full h-10 sm:h-9 px-3 text-base sm:text-sm rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A1E3D]/20"
                      placeholder="Até"
                    />
                  </div>
                </div>
              )}

              {/* Ordenação */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  📊 Ordenar por
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                  <select
                    value={filters.sortBy || "createdAt"}
                    onChange={(e) => updateFilter("sortBy", e.target.value)}
                    className="col-span-2 md:col-span-3 h-10 sm:h-9 px-3 text-base sm:text-sm rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A1E3D]/20"
                  >
                    <option value="createdAt">Mais recentes</option>
                    <option value="updatedAt">Última atualização</option>
                    <option value="views">Mais vistos (site)</option>
                    <option value="inPersonVisits">Mais visitados (presencial)</option>
                    <option value="price">Preço</option>
                    <option value="area">Área</option>
                    <option value="priceIncreaseDate">Aumento de valor (recentes)</option>
                  </select>
                  <select
                    value={filters.sortOrder || "desc"}
                    onChange={(e) => updateFilter("sortOrder", e.target.value as "asc" | "desc")}
                    className="h-10 sm:h-9 px-3 text-base sm:text-sm rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A1E3D]/20"
                  >
                    <option value="desc">Maior → Menor</option>
                    <option value="asc">Menor → Maior</option>
                  </select>
                </div>
              </div>

              {/* Featured */}
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.isFeatured || false}
                    onChange={(e) => updateFilter("isFeatured", e.target.checked || undefined)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0A1E3D]"></div>
                </label>
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  Apenas imóveis em destaque
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
