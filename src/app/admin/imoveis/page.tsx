"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  RiAddLine,
  RiGridLine,
  RiListUnordered,
  RiLoader4Line,
  RiBuilding2Line,
  RiRefreshLine,
  RiDownloadLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiMapPinLine,
  RiEyeLine,
  RiEditLine,
  RiDeleteBinLine,
  RiSortDesc,
  RiArrowDownSLine,
  RiAlertLine,
} from "react-icons/ri";
import Link from "next/link";
import {
  PropertyCard,
  PropertyFilters,
  PropertyViewModal,
  PropertyDeleteModal,
  PropertyFormModal,
} from "@/components/admin/properties";
import { Property, PropertyFilters as Filters, propertyTypeLabels, propertyStatusLabels } from "@/types/property";
import { getDisplayTitle } from "@/utils/property";

function ImoveisContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOpen, setSortOpen] = useState(false);
  const [pagination, setPagination] = useState(() => {
    let savedPage = 1;
    if (typeof window !== "undefined") {
      try {
        const p = sessionStorage.getItem("admin_imoveis_page");
        if (p) savedPage = parseInt(p) || 1;
      } catch {}
    }
    return {
      page: savedPage,
      limit: 12,
      total: 0,
      totalAll: 0,
      totalPages: 0,
    };
  });

  // Modals
  const [viewProperty, setViewProperty] = useState<Property | null>(null);
  const [deleteProperty, setDeleteProperty] = useState<Property | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editProperty, setEditProperty] = useState<Property | null>(null);

  // Filters - restaurar da sessionStorage (persistência) ou da URL
  const FILTERS_STORAGE_KEY = "admin_imoveis_filters";
  const PAGE_STORAGE_KEY = "admin_imoveis_page";

  const [filters, setFilters] = useState<Filters>(() => {
    // Prioridade 1: URL params (quando vem de link direto com filtros)
    const hasUrlFilters = searchParams.toString().length > 0;
    if (hasUrlFilters) {
      const category = searchParams.get("categoria");
      const categoriesParam = searchParams.get("categories");
      return {
        category: category?.toUpperCase() as Filters["category"] || undefined,
        categories: categoriesParam ? categoriesParam.split(",") as Filters["categories"] : undefined,
        search: searchParams.get("search") || undefined,
        status: searchParams.get("status") as Filters["status"] || undefined,
        type: searchParams.get("type") as Filters["type"] || undefined,
        condominiumId: searchParams.get("condominiumId") || undefined,
        condominiumIds: searchParams.get("condominiumIds") ? searchParams.get("condominiumIds")!.split(",") : undefined,
        neighborhood: searchParams.get("neighborhood") || undefined,
        minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
        maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
        minArea: searchParams.get("minArea") ? Number(searchParams.get("minArea")) : undefined,
        maxArea: searchParams.get("maxArea") ? Number(searchParams.get("maxArea")) : undefined,
        bedrooms: searchParams.get("bedrooms") ? Number(searchParams.get("bedrooms")) : undefined,
        bathrooms: searchParams.get("bathrooms") ? Number(searchParams.get("bathrooms")) : undefined,
        parkingSpaces: searchParams.get("parkingSpaces") ? Number(searchParams.get("parkingSpaces")) : undefined,
        isFeatured: searchParams.get("isFeatured") === "true" || undefined,
        hasElevator: searchParams.get("hasElevator") === "true" || undefined,
        isFurnished: searchParams.get("isFurnished") === "true" || undefined,
        acceptsExchange: searchParams.get("acceptsExchange") === "true" || undefined,
        isExclusive: (searchParams.get("isExclusive") === "true" || searchParams.get("exclusivo") === "true") || undefined,
        isThirdPartyExclusive: searchParams.get("isThirdPartyExclusive") === "true" || undefined,
        hasPlate: searchParams.get("hasPlate") === "true" || undefined,
        hasPriceReduction: searchParams.get("hasPriceReduction") === "true" || undefined,
        hasPriceIncrease: searchParams.get("hasPriceIncrease") === "true" || undefined,
        soldDateFrom: searchParams.get("soldDateFrom") || undefined,
        soldDateTo: searchParams.get("soldDateTo") || undefined,
        createdFrom: searchParams.get("createdFrom") || undefined,
        createdTo: searchParams.get("createdTo") || undefined,
        updatedFrom: searchParams.get("updatedFrom") || undefined,
        updatedTo: searchParams.get("updatedTo") || undefined,
        ownerId: searchParams.get("ownerId") || undefined,
        featuresFilter: searchParams.get("featuresFilter") ? searchParams.get("featuresFilter")!.split(",") : undefined,
        semFoto: searchParams.get("semFoto") === "true" || undefined,
      } as any;
    }

    // Prioridade 2: sessionStorage (filtros salvos da última visita)
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem(FILTERS_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {}
    }

    return {};
  });

  // Fetch properties
  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(pagination.page));
      params.set("limit", String(pagination.limit));

      if (filters.search) params.set("search", filters.search);
      if (filters.categories && filters.categories.length > 0) {
        params.set("categories", filters.categories.join(","));
      } else if (filters.category) {
        params.set("category", filters.category);
      }
      if (filters.type) params.set("type", filters.type);
      if ((filters as any).subType) params.set("subType", (filters as any).subType);
      if (filters.status) params.set("status", filters.status);
      if ((filters as any).address) params.set("address", (filters as any).address);
      if ((filters as any).number) params.set("number", (filters as any).number);
      if ((filters as any).complement) params.set("complement", (filters as any).complement);
      if ((filters as any).ownerSearch) params.set("ownerSearch", (filters as any).ownerSearch);
      if ((filters as any).ownerId) params.set("ownerId", (filters as any).ownerId);
      if (filters.neighborhood) params.set("neighborhood", filters.neighborhood);
      if (filters.condominiumId) params.set("condominiumId", filters.condominiumId);
      if ((filters as any).condominiumIds?.length) params.set("condominiumIds", (filters as any).condominiumIds.join(","));
      if (filters.minPrice) params.set("minPrice", String(filters.minPrice));
      if (filters.maxPrice) params.set("maxPrice", String(filters.maxPrice));
      if (filters.minArea) params.set("minArea", String(filters.minArea));
      if (filters.maxArea) params.set("maxArea", String(filters.maxArea));
      if ((filters as any).minTotalArea) params.set("minTotalArea", String((filters as any).minTotalArea));
      if ((filters as any).maxTotalArea) params.set("maxTotalArea", String((filters as any).maxTotalArea));
      if (filters.bedrooms) params.set("bedrooms", String(filters.bedrooms));
      if (filters.bathrooms) params.set("bathrooms", String(filters.bathrooms));
      if (filters.parkingSpaces) params.set("parkingSpaces", String(filters.parkingSpaces));
      if (filters.isFeatured) params.set("isFeatured", "true");
      if (filters.hasElevator) params.set("hasElevator", "true");
      if (filters.isFurnished) params.set("isFurnished", "true");
      if (filters.hasGroundFloorSuite) params.set("hasGroundFloorSuite", "true");
      if (filters.hasFreeView) params.set("hasFreeView", "true");
      if (filters.acceptsExchange) params.set("acceptsExchange", "true");
      if (filters.sortBy) params.set("sortBy", filters.sortBy);
      if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
      // Novos filtros
      if (filters.isExclusive) params.set("isExclusive", "true");
      if (filters.isThirdPartyExclusive) params.set("isThirdPartyExclusive", "true");
      if (filters.hasPlate) params.set("hasPlate", "true");
      if ((filters as any).noPlate) params.set("noPlate", "true");
      if ((filters as any).isOccupied) params.set("isOccupied", "true");
      if (filters.hasPriceReduction) params.set("hasPriceReduction", "true");
      if ((filters as any).hasPriceIncrease) params.set("hasPriceIncrease", "true");
      if (filters.hasWall) params.set("hasWall", "true");
      if ((filters as any).hasIrregularDocs) params.set("hasIrregularDocs", "true");
      if ((filters as any).acceptsDirectPayment) params.set("acceptsDirectPayment", "true");
      if (filters.soldDateFrom) params.set("soldDateFrom", filters.soldDateFrom);
      if (filters.soldDateTo) params.set("soldDateTo", filters.soldDateTo);
      if ((filters as any).createdFrom) params.set("createdFrom", (filters as any).createdFrom);
      if ((filters as any).createdTo) params.set("createdTo", (filters as any).createdTo);
      if ((filters as any).updatedFrom) params.set("updatedFrom", (filters as any).updatedFrom);
      if ((filters as any).updatedTo) params.set("updatedTo", (filters as any).updatedTo);
      if ((filters as any).featuresFilter?.length) params.set("featuresFilter", (filters as any).featuresFilter.join(","));
      if ((filters as any).semFoto) params.set("semFoto", "true");
      if ((filters as any).hiddenFromSite) params.set("hiddenFromSite", "true");
      if ((filters as any).noCondominium) params.set("noCondominium", "true");
      if ((filters as any).isOffMarket) params.set("isOffMarket", "true");
      if ((filters as any).soldByTappy) {
        params.set("soldBy", "TAPPY");
        params.set("status", "VENDIDO");
      }
      if ((filters as any).exchangeMinValue) params.set("exchangeMinValue", String((filters as any).exchangeMinValue));
      if ((filters as any).exchangeMaxValue) params.set("exchangeMaxValue", String((filters as any).exchangeMaxValue));
      if ((filters as any).exchangeTypes?.length) params.set("exchangeTypes", (filters as any).exchangeTypes.join(","));
      
      // Admin vê todos os imóveis, incluindo Off-Market e todos os status
      params.set("offMarket", "all");
      params.set("showAll", "true");

      const response = await fetch(`/api/properties?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setProperties(data.properties);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
          totalAll: data.pagination.totalAll || data.pagination.total,
          totalPages: data.pagination.totalPages,
        }));
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Persistir filtros no sessionStorage sempre que mudarem
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const hasFilters = Object.values(filters).some(v => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0));
        if (hasFilters) {
          sessionStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
        } else {
          sessionStorage.removeItem(FILTERS_STORAGE_KEY);
        }
      } catch {}
    }
  }, [filters]);

  // Persistir página atual no sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(PAGE_STORAGE_KEY, String(pagination.page));
      } catch {}
    }
  }, [pagination.page]);

  // Update URL when category changes
  useEffect(() => {
    const category = searchParams.get("categoria");
    if (category) {
      setFilters((prev) => ({
        ...prev,
        category: category.toUpperCase() as Filters["category"],
      }));
    }
  }, [searchParams]);

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({});
    setPagination((prev) => ({ ...prev, page: 1 }));
    // Limpar filtros salvos no sessionStorage
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem(FILTERS_STORAGE_KEY);
        sessionStorage.removeItem(PAGE_STORAGE_KEY);
      } catch {}
    }
    router.push("/admin/imoveis");
  };

  const handleDeleteConfirm = async (id: string) => {
    try {
      const response = await fetch(`/api/properties/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProperties((prev) => prev.filter((p) => p.id !== id));
        setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
      }
    } catch (error) {
      console.error("Error deleting property:", error);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleOpenCreateModal = () => {
    setEditProperty(null);
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (property: Property) => {
    setEditProperty(property);
    setFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setFormModalOpen(false);
    setEditProperty(null);
  };

  const handleSaveProperty = async (data: any) => {
    if (editProperty) {
      // Update existing
      const response = await fetch(`/api/properties/${editProperty.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Erro ao atualizar imóvel");
      }

      fetchProperties();
    } else {
      // Create new
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Erro ao criar imóvel");
      }

      fetchProperties();
    }
  };

  return (
    <div className="space-y-3">
      {/* Header Compacto */}
      <div className="flex items-center justify-between gap-2">
        {/* Título */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
            <RiBuilding2Line className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-neutral-900 dark:text-white">Imóveis</h1>
            <p className="text-[10px] text-neutral-500">{pagination.total} de {pagination.totalAll} cadastrados</p>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-1.5">
          {/* View Mode */}
          <div className="flex items-center bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded transition-colors ${
                viewMode === "grid" ? "bg-[#0A1E3D] text-white" : "text-neutral-400"
              }`}
            >
              <RiGridLine className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded transition-colors ${
                viewMode === "list" ? "bg-[#0A1E3D] text-white" : "text-neutral-400"
              }`}
            >
              <RiListUnordered className="w-4 h-4" />
            </button>
          </div>

          {/* Ordenação */}
          <div className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-orange-500 text-sm"
            >
              <RiSortDesc className="w-4 h-4" />
              <span className="hidden sm:inline">Ordenar</span>
              <RiArrowDownSLine className="w-4 h-4" />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-neutral-900 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 py-1 z-50">
                {[
                  { value: "createdAt-desc", label: "Mais recentes" },
                  { value: "createdAt-asc", label: "Mais antigos" },
                  { value: "updatedAt-desc", label: "Última atualização" },
                  { value: "price-asc", label: "Menor preço" },
                  { value: "price-desc", label: "Maior preço" },
                  { value: "area-desc", label: "Maior área" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      const [sortBy, sortOrder] = opt.value.split("-");
                      handleFiltersChange({ ...filters, sortBy, sortOrder: sortOrder as "asc" | "desc" });
                      setSortOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                      filters.sortBy === opt.value.split("-")[0] && filters.sortOrder === opt.value.split("-")[1]
                        ? "text-orange-500 font-medium"
                        : "text-neutral-700 dark:text-neutral-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={fetchProperties}
            disabled={isLoading}
            className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:border-orange-500 disabled:opacity-50"
          >
            <RiRefreshLine className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <button 
            onClick={() => {
              const params = new URLSearchParams();
              params.set("format", "xlsx");
              if (filters.search) params.set("search", filters.search);
              if (filters.categories?.length) params.set("categories", filters.categories.join(","));
              else if (filters.category) params.set("category", filters.category);
              if (filters.type) params.set("type", filters.type);
              if (filters.status) params.set("status", filters.status);
              if ((filters as any).address) params.set("address", (filters as any).address);
              if ((filters as any).ownerSearch) params.set("ownerSearch", (filters as any).ownerSearch);
              if ((filters as any).ownerId) params.set("ownerId", (filters as any).ownerId);
              if (filters.condominiumId) params.set("condominiumId", filters.condominiumId);
              if ((filters as any).condominiumIds?.length) params.set("condominiumIds", (filters as any).condominiumIds.join(","));
              if (filters.minPrice) params.set("minPrice", String(filters.minPrice));
              if (filters.maxPrice) params.set("maxPrice", String(filters.maxPrice));
              if (filters.minArea) params.set("minArea", String(filters.minArea));
              if (filters.maxArea) params.set("maxArea", String(filters.maxArea));
              if ((filters as any).minTotalArea) params.set("minTotalArea", String((filters as any).minTotalArea));
              if ((filters as any).maxTotalArea) params.set("maxTotalArea", String((filters as any).maxTotalArea));
              if (filters.bedrooms) params.set("bedrooms", String(filters.bedrooms));
              if (filters.parkingSpaces) params.set("parkingSpaces", String(filters.parkingSpaces));
              if (filters.isExclusive) params.set("isExclusive", "true");
              if (filters.hasPlate) params.set("hasPlate", "true");
              if (filters.acceptsExchange) params.set("acceptsExchange", "true");
              if (filters.isFeatured) params.set("isFeatured", "true");
              if ((filters as any).semFoto) params.set("semFoto", "true");
              if ((filters as any).hiddenFromSite) params.set("hiddenFromSite", "true");
              if (filters.neighborhood) params.set("neighborhood", filters.neighborhood);
              window.open(`/api/properties/export?${params.toString()}`, "_blank");
            }}
            title="Exportar Excel"
            className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:border-orange-500"
          >
            <RiDownloadLine className="w-4 h-4" />
          </button>

          <Link
            href="/admin/imoveis/duplicados"
            title="Verificar Duplicados"
            className="p-2 rounded-lg border border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            <RiAlertLine className="w-4 h-4" />
          </Link>

          <Link
            href="/admin/imoveis/novo"
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#0A1E3D] text-white text-sm font-medium hover:bg-[#1A3560]"
          >
            <RiAddLine className="w-4 h-4" />
            <span className="hidden sm:inline">Novo</span>
          </Link>
        </div>
      </div>

      {/* Filters Inline */}
      <PropertyFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleResetFilters}
      />

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <RiLoader4Line className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      ) : properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
            <RiBuilding2Line className="w-10 h-10 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
            Nenhum imóvel encontrado
          </h3>
          <p className="text-neutral-500 mb-6 max-w-md">
            {Object.keys(filters).length > 0
              ? "Tente ajustar os filtros para encontrar mais resultados."
              : "Comece cadastrando seu primeiro imóvel."}
          </p>
          {Object.keys(filters).length > 0 ? (
            <button
              onClick={handleResetFilters}
              className="px-6 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-orange-500 transition-colors"
            >
              Limpar filtros
            </button>
          ) : (
            <Link
              href="/admin/imoveis/novo"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0A1E3D] text-white font-medium hover:bg-[#1A3560] transition-colors"
            >
              <RiAddLine className="w-5 h-5" />
              Cadastrar Imóvel
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Grid ou Tabela */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {properties.map((property, i) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <PropertyCard
                    property={property}
                    onView={(p) => setViewProperty(p)}
                    onEdit={(p) => handleOpenEditModal(p)}
                    onDelete={(p) => setDeleteProperty(p)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Imóvel</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Condomínio</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Valor</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Finalidade</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Atualização</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                    {properties.map((property) => (
                      <tr key={property.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
                              {property.thumbnail ? (
                                <img src={property.thumbnail} alt={property.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <RiMapPinLine className="w-5 h-5 text-neutral-400" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-neutral-900 dark:text-white truncate max-w-[200px]">{getDisplayTitle(property.title)}</p>
                              <p className="text-xs text-neutral-500">#{property.code}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-neutral-600 dark:text-neutral-400 truncate max-w-[150px] block">
                            {(property as any).condominium?.name || property.neighborhood || "-"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm font-semibold text-[#0A1E3D] dark:text-white">
                            {(() => {
                              const price = property.category === "LOCACAO" 
                                ? ((property as any).rentPrice || property.price)
                                : property.price || (property as any).rentPrice;
                              const isRent = property.category === "LOCACAO" || (!property.price && (property as any).rentPrice);
                              return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(price) + (isRent ? "/mês" : "");
                            })()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            property.category === "VENDA" ? "bg-blue-100 text-blue-700" :
                            property.category === "LOCACAO" ? "bg-amber-100 text-amber-700" :
                            "bg-purple-100 text-purple-700"
                          }`}>
                            {property.category === "VENDA" ? "Venda" : property.category === "LOCACAO" ? "Locação" : ((property as any).rentPrice > 0 ? "Venda/Locação" : "Venda")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {(() => {
                            // Usa o status do banco diretamente
                            const displayStatus = property.status;
                            
                            return (
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                displayStatus === "DISPONIVEL" ? "bg-green-100 text-green-700" :
                                displayStatus === "VENDIDO" ? "bg-blue-100 text-blue-700" :
                                displayStatus === "ALUGADO" ? "bg-purple-100 text-purple-700" :
                                displayStatus === "RESERVADO" ? "bg-yellow-100 text-yellow-700" :
                                displayStatus === "SUSPENSO" ? "bg-amber-100 text-amber-700" :
                                displayStatus === "INDISPONIVEL" ? "bg-red-100 text-red-700" :
                                "bg-neutral-100 text-neutral-600"
                              }`}>
                                {propertyStatusLabels[displayStatus] || displayStatus}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-xs text-neutral-500">
                            {new Date(property.updatedAt).toLocaleDateString("pt-BR")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setViewProperty(property)}
                              className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                              title="Visualizar"
                            >
                              <RiEyeLine className="w-4 h-4" />
                            </button>
                            <Link
                              href={`/admin/imoveis/novo?id=${property.id}`}
                              className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 hover:text-blue-600"
                              title="Editar"
                            >
                              <RiEditLine className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => setDeleteProperty(property)}
                              className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 hover:text-red-600"
                              title="Excluir"
                            >
                              <RiDeleteBinLine className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages >= 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <p className="text-sm text-neutral-500">
                  Mostrando {(pagination.page - 1) * pagination.limit + 1} a{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} de{" "}
                  {pagination.total} imóveis
                </p>
                <select
                  value={pagination.limit}
                  onChange={(e) => {
                    const newLimit = parseInt(e.target.value);
                    setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
                  }}
                  className="px-2 py-1 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                >
                  <option value={12}>12/pág</option>
                  <option value={24}>24/pág</option>
                  <option value={36}>36/pág</option>
                  <option value={42}>42/pág</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RiArrowLeftSLine className="w-5 h-5" />
                </button>

                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        pagination.page === pageNum
                          ? "bg-[#0A1E3D] text-white"
                          : "border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-[#0A1E3D]"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RiArrowRightSLine className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <PropertyViewModal
        property={viewProperty}
        isOpen={!!viewProperty}
        onClose={() => setViewProperty(null)}
      />

      <PropertyDeleteModal
        property={deleteProperty}
        isOpen={!!deleteProperty}
        onClose={() => setDeleteProperty(null)}
        onConfirm={handleDeleteConfirm}
      />

      <PropertyFormModal
        property={editProperty}
        isOpen={formModalOpen}
        onClose={handleCloseFormModal}
        onSave={handleSaveProperty}
      />
    </div>
  );
}

// Loading fallback
function ImoveisLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <RiLoader4Line className="w-8 h-8 animate-spin text-orange-500" />
    </div>
  );
}

export default function ImoveisPage() {
  return (
    <Suspense fallback={<ImoveisLoading />}>
      <ImoveisContent />
    </Suspense>
  );
}
