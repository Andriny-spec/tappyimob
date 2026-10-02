"use client";

import { useState, useEffect, useCallback } from "react";
import {
  RiSearchLine,
  RiCheckboxCircleLine,
  RiCheckboxBlankCircleLine,
  RiStarFill,
  RiVipCrownFill,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiFilterLine,
  RiLoader4Line,
  RiImage2Line,
  RiSettings3Line,
  RiCloseLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiSortDesc,
} from "react-icons/ri";
import Link from "next/link";

const PORTALS = [
  { id: "grupozap", name: "Grupo ZAP (ZAP/VivaReal/OLX)" },
  { id: "imovelweb", name: "ImovelWeb" },
  { id: "chavesnamao", name: "Chaves na Mão" },
];

const CATEGORIES = [
  { id: "simples", label: "Simples", color: "bg-gray-100 text-gray-700 border-gray-300", activeColor: "bg-gray-700 text-white border-gray-700" },
  { id: "destaque", label: "Destaque", color: "bg-orange-50 text-orange-700 border-orange-300", activeColor: "bg-orange-500 text-white border-orange-500" },
  { id: "super_destaque", label: "Super Destaque", color: "bg-purple-50 text-purple-700 border-purple-300", activeColor: "bg-purple-600 text-white border-purple-600" },
  { id: "destaque_exclusivo", label: "Destaque Exclusivo", color: "bg-blue-50 text-blue-700 border-blue-300", activeColor: "bg-blue-600 text-white border-blue-600" },
];

const PROPERTY_TYPES = [
  { value: "", label: "Todas" },
  { value: "CASA", label: "Casa" },
  { value: "CASA_CONDOMINIO", label: "Casa Condomínio" },
  { value: "APARTAMENTO", label: "Apartamento" },
  { value: "COBERTURA", label: "Cobertura" },
  { value: "TERRENO", label: "Terreno" },
  { value: "TERRENO_CONDOMINIO", label: "Terreno Condomínio" },
  { value: "COMERCIAL", label: "Comercial" },
  { value: "SALA_COMERCIAL", label: "Sala Comercial" },
  { value: "FLAT", label: "Flat" },
  { value: "KITNET", label: "Kitnet" },
  { value: "LOFT", label: "Loft" },
  { value: "SOBRADO", label: "Sobrado" },
  { value: "STUDIO", label: "Studio" },
  { value: "GALPAO", label: "Galpão" },
  { value: "LOJA", label: "Loja" },
  { value: "RURAL", label: "Rural" },
  { value: "CHACARA", label: "Chácara" },
];

const SORT_OPTIONS = [
  { value: "updatedAt", label: "Mais recentes" },
  { value: "price-desc", label: "Mais caro" },
  { value: "price-asc", label: "Mais barato" },
  { value: "area-desc", label: "Maior área" },
  { value: "area-asc", label: "Menor área" },
  { value: "bedrooms-desc", label: "Mais dormitórios" },
  { value: "code", label: "Código" },
];

interface Property {
  id: string;
  code: string;
  title: string;
  type: string;
  category: string;
  price: number | null;
  rentPrice: number | null;
  area: number | null;
  totalArea: number | null;
  usefulArea: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parkingSpaces: number | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  thumbnail: string | null;
  images: string[];
  portalCategory: string;
  condominium: { id: string; name: string; neighborhood: string; city: string; state: string } | null;
}

interface Counts {
  simples: number;
  destaque: number;
  super_destaque: number;
  destaque_exclusivo: number;
}

interface Limits {
  simples: number;
  destaque: number;
  super_destaque: number;
  destaque_exclusivo: number;
}

const formatPrice = (price: number | null) => {
  if (!price) return "-";
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
};

const formatArea = (area: number | null) => {
  if (!area) return "-";
  return `${area}m²`;
};

const typeLabel = (type: string) => {
  const t = PROPERTY_TYPES.find((t) => t.value === type);
  return t ? t.label : type;
};

export default function PortalAnunciosPage() {
  const [portal, setPortal] = useState("grupozap");
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [properties, setProperties] = useState<Property[]>([]);
  const [counts, setCounts] = useState<Counts>({ simples: 0, destaque: 0, super_destaque: 0, destaque_exclusivo: 0 });
  const [limits, setLimits] = useState<Limits>({ simples: 2000, destaque: 144, super_destaque: 6, destaque_exclusivo: 10 });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showLimitsModal, setShowLimitsModal] = useState(false);

  // Filtros avançados
  const [filterTipo, setFilterTipo] = useState("");
  const [filterPrecoMin, setFilterPrecoMin] = useState("");
  const [filterPrecoMax, setFilterPrecoMax] = useState("");
  const [filterDormitorios, setFilterDormitorios] = useState("");
  const [filterMobiliado, setFilterMobiliado] = useState(false);
  const [filterPermuta, setFilterPermuta] = useState(false);
  const [filterExclusividade, setFilterExclusividade] = useState(false);
  const [filterSort, setFilterSort] = useState("updatedAt");

  // Limites editáveis (modal)
  const [editLimits, setEditLimits] = useState<Limits>({ simples: 2000, destaque: 144, super_destaque: 6, destaque_exclusivo: 10 });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sortField, sortDir] = filterSort.includes("-") ? filterSort.split("-") : [filterSort, "desc"];
      const params = new URLSearchParams({
        portal,
        category: activeCategory,
        search: searchDebounced,
        page: page.toString(),
        limit: "50",
        sortBy: sortField,
        sortOrder: sortDir,
      });
      if (filterTipo) params.set("tipo", filterTipo);
      if (filterPrecoMin) params.set("precoMin", filterPrecoMin);
      if (filterPrecoMax) params.set("precoMax", filterPrecoMax);
      if (filterDormitorios) params.set("dormitorios", filterDormitorios);
      if (filterMobiliado) params.set("mobiliado", "true");
      if (filterPermuta) params.set("permuta", "true");
      if (filterExclusividade) params.set("exclusividade", "true");

      const res = await fetch(`/api/admin/portals/categories?${params}`);
      if (!res.ok) throw new Error("Erro ao buscar dados");
      const data = await res.json();
      setProperties(data.properties);
      setCounts(data.counts);
      setLimits(data.limits);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [portal, activeCategory, searchDebounced, page, filterTipo, filterPrecoMin, filterPrecoMax, filterDormitorios, filterMobiliado, filterPermuta, filterExclusividade, filterSort]);

  useEffect(() => {
    fetchData();
    setSelected(new Set());
  }, [fetchData]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [portal, activeCategory, searchDebounced, filterTipo, filterPrecoMin, filterPrecoMax, filterDormitorios, filterMobiliado, filterPermuta, filterExclusividade, filterSort]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === properties.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(properties.map((p) => p.id)));
    }
  };

  const handleBulkAssign = async (category: string) => {
    if (selected.size === 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/portals/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "assign",
          portal,
          propertyIds: Array.from(selected),
          category,
        }),
      });
      if (!res.ok) throw new Error("Erro ao atualizar");
      setSelected(new Set());
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLimits = async () => {
    try {
      const res = await fetch("/api/admin/portals/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portal, limits: editLimits }),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      const data = await res.json();
      setLimits(data.limits);
      setShowLimitsModal(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const clearFilters = () => {
    setFilterTipo("");
    setFilterPrecoMin("");
    setFilterPrecoMax("");
    setFilterDormitorios("");
    setFilterMobiliado(false);
    setFilterPermuta(false);
    setFilterExclusividade(false);
    setFilterSort("updatedAt");
  };

  const hasActiveFilters = filterTipo || filterPrecoMin || filterPrecoMax || filterDormitorios || filterMobiliado || filterPermuta || filterExclusividade || filterSort !== "updatedAt";

  const totalAll = counts.simples + counts.destaque + counts.super_destaque;

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorias de Anúncio</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie as categorias de anúncio (Simples, Destaque, Super Destaque) por portal
          </p>
        </div>
        <Link
          href="/admin/imoveis/portais"
          className="text-sm text-orange-600 hover:text-orange-700 font-medium"
        >
          ← Voltar para Portais
        </Link>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <div className={`${showFilters ? "block" : "hidden"} lg:block w-64 shrink-0`}>
          <div className="bg-white rounded-xl border shadow-sm p-4 sticky top-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-gray-800">Filtros</h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs text-orange-600 hover:underline">
                  Limpar
                </button>
              )}
            </div>

            {/* Tipologia */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Tipologia</label>
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className="w-full border rounded-lg px-2.5 py-1.5 text-sm bg-white"
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Valor */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Valor</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={filterPrecoMin}
                  onChange={(e) => setFilterPrecoMin(e.target.value)}
                  placeholder="Mín"
                  className="w-1/2 border rounded-lg px-2 py-1.5 text-sm"
                />
                <input
                  type="number"
                  value={filterPrecoMax}
                  onChange={(e) => setFilterPrecoMax(e.target.value)}
                  placeholder="Máx"
                  className="w-1/2 border rounded-lg px-2 py-1.5 text-sm"
                />
              </div>
            </div>

            {/* Dormitórios */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Dormitórios (mín)</label>
              <div className="flex gap-1">
                {["", "1", "2", "3", "4", "5"].map((d) => (
                  <button
                    key={d}
                    onClick={() => setFilterDormitorios(d)}
                    className={`flex-1 py-1 text-xs rounded-md border transition-colors ${
                      filterDormitorios === d
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {d || "–"}
                  </button>
                ))}
              </div>
            </div>

            {/* Ordenação */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Ordenar por</label>
              <select
                value={filterSort}
                onChange={(e) => setFilterSort(e.target.value)}
                className="w-full border rounded-lg px-2.5 py-1.5 text-sm bg-white"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Toggles */}
            <div className="space-y-2 pt-2 border-t">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterMobiliado}
                  onChange={(e) => setFilterMobiliado(e.target.checked)}
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-gray-700">Mobiliado</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterPermuta}
                  onChange={(e) => setFilterPermuta(e.target.checked)}
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-gray-700">Aceita Permuta</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterExclusividade}
                  onChange={(e) => setFilterExclusividade(e.target.checked)}
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-gray-700">Exclusividade</span>
              </label>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border shadow-sm">
            {/* Portal + Search */}
            <div className="p-4 border-b flex items-center gap-4 flex-wrap">
              <label className="text-sm font-medium text-gray-700">Portal:</label>
              <select
                value={portal}
                onChange={(e) => setPortal(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {PORTALS.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`lg:hidden p-2 rounded-lg border transition-colors ${
                    showFilters ? "bg-orange-50 border-orange-300 text-orange-600" : "bg-white text-gray-500"
                  }`}
                >
                  <RiFilterLine className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setEditLimits({ ...limits });
                    setShowLimitsModal(true);
                  }}
                  className="p-2 rounded-lg border bg-white text-gray-500 hover:text-orange-600 hover:border-orange-300 transition-colors"
                  title="Editar limites do plano"
                >
                  <RiSettings3Line className="w-4 h-4" />
                </button>
                <div className="relative">
                  <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por código, nome, endereço..."
                    className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-2 p-4 border-b bg-gray-50/50 overflow-x-auto">
              <button
                onClick={() => setActiveCategory("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors whitespace-nowrap ${
                  activeCategory === "all"
                    ? "bg-gray-800 text-white border-gray-800"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
              >
                Todos
                <span className="ml-2 text-xs opacity-75">{totalAll}</span>
              </button>

              {CATEGORIES.map((cat) => {
                const count = counts[cat.id as keyof Counts] || 0;
                const limit = limits[cat.id as keyof Limits] || 0;
                const isActive = activeCategory === cat.id;
                const isOver = count > limit;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors whitespace-nowrap ${
                      isActive ? cat.activeColor : cat.color
                    } hover:opacity-90`}
                  >
                    {cat.label}
                    <span className={`ml-2 text-xs ${isOver ? "text-red-300" : "opacity-75"}`}>
                      {count}/{limit}
                    </span>
                  </button>
                );
              })}

              {hasActiveFilters && (
                <span className="ml-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full whitespace-nowrap">
                  Filtros ativos
                </span>
              )}
            </div>

            {/* Bulk Actions */}
            {selected.size > 0 && (
              <div className="flex items-center gap-3 p-3 bg-orange-50 border-b">
                <span className="text-sm font-medium text-orange-800">
                  {selected.size} {selected.size === 1 ? "imóvel selecionado" : "imóveis selecionados"}
                </span>
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs text-gray-500 mr-2">Mover para:</span>
                  <button
                    onClick={() => handleBulkAssign("simples")}
                    disabled={saving}
                    className="px-3 py-1.5 bg-gray-600 text-white text-xs font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
                  >
                    Simples
                  </button>
                  <button
                    onClick={() => handleBulkAssign("destaque")}
                    disabled={saving}
                    className="px-3 py-1.5 bg-orange-500 text-white text-xs font-medium rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
                  >
                    Destaque
                  </button>
                  <button
                    onClick={() => handleBulkAssign("super_destaque")}
                    disabled={saving}
                    className="px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                  >
                    Super Destaque
                  </button>
                  <button
                    onClick={() => handleBulkAssign("destaque_exclusivo")}
                    disabled={saving}
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    Exclusivo
                  </button>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3 w-10">
                      <button onClick={toggleSelectAll} className="text-gray-400 hover:text-gray-600">
                        {selected.size === properties.length && properties.length > 0 ? (
                          <RiCheckboxCircleLine className="w-5 h-5 text-orange-500" />
                        ) : (
                          <RiCheckboxBlankCircleLine className="w-5 h-5" />
                        )}
                      </button>
                    </th>
                    <th className="px-3 py-3 w-14"></th>
                    <th className="px-3 py-3">Referência</th>
                    <th className="px-3 py-3">Tipo</th>
                    <th className="px-3 py-3">Categoria</th>
                    <th className="px-3 py-3">Características</th>
                    <th className="px-3 py-3">Bairro/Cidade/UF</th>
                    <th className="px-3 py-3 text-right">Preço</th>
                    <th className="px-3 py-3 text-center">Anúncio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center">
                        <RiLoader4Line className="w-6 h-6 animate-spin text-orange-500 mx-auto mb-2" />
                        <span className="text-gray-400 text-sm">Carregando...</span>
                      </td>
                    </tr>
                  ) : properties.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                        Nenhum imóvel encontrado {activeCategory !== "all" ? `na categoria "${CATEGORIES.find(c => c.id === activeCategory)?.label}"` : ""}
                      </td>
                    </tr>
                  ) : (
                    properties.map((p) => {
                      const isSelected = selected.has(p.id);
                      const hood = p.condominium?.neighborhood || p.neighborhood || "";
                      const city = p.condominium?.city || p.city || "";
                      const state = p.condominium?.state || p.state || "";
                      const location = [hood, city].filter(Boolean).join(" - ") + (state ? `/${state}` : "");
                      const thumb = p.thumbnail || (p.images && p.images[0]) || null;
                      const displayArea = p.usefulArea || p.totalArea || p.area;
                      const displayPrice = p.category === "LOCACAO" ? p.rentPrice : p.price;

                      return (
                        <tr
                          key={p.id}
                          className={`hover:bg-gray-50/50 transition-colors ${isSelected ? "bg-orange-50/30" : ""}`}
                        >
                          <td className="px-4 py-2.5">
                            <button onClick={() => toggleSelect(p.id)} className="text-gray-400 hover:text-gray-600">
                              {isSelected ? (
                                <RiCheckboxCircleLine className="w-5 h-5 text-orange-500" />
                              ) : (
                                <RiCheckboxBlankCircleLine className="w-5 h-5" />
                              )}
                            </button>
                          </td>
                          <td className="px-3 py-2.5">
                            {thumb ? (
                              <img src={thumb} alt="" className="w-11 h-9 object-cover rounded border" />
                            ) : (
                              <div className="w-11 h-9 bg-gray-100 rounded border flex items-center justify-center">
                                <RiImage2Line className="w-3.5 h-3.5 text-gray-300" />
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="font-medium text-gray-900 text-xs">{p.code}</div>
                            <div className="text-[11px] text-gray-400 truncate max-w-[150px]">
                              {p.condominium?.name || p.title}
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-gray-600 text-xs">{typeLabel(p.type)}</td>
                          <td className="px-3 py-2.5">
                            <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                              p.category === "LOCACAO"
                                ? "bg-blue-50 text-blue-700"
                                : p.category === "VENDA_LOCACAO"
                                ? "bg-green-50 text-green-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}>
                              {p.category === "LOCACAO" ? "Locação" : p.category === "VENDA_LOCACAO" ? "Venda/Loc" : "Venda"}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2 text-[11px] text-gray-500">
                              {p.bedrooms ? <span title="Quartos">🛏 {p.bedrooms}</span> : null}
                              {p.bathrooms ? <span title="Banheiros">🚿 {p.bathrooms}</span> : null}
                              {p.parkingSpaces ? <span title="Vagas">🚗 {p.parkingSpaces}</span> : null}
                              {displayArea ? <span>{formatArea(displayArea)}</span> : null}
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-gray-600 text-[11px] max-w-[180px] truncate">
                            {location || "-"}
                          </td>
                          <td className="px-3 py-2.5 text-right font-medium text-gray-900 text-xs">
                            {formatPrice(displayPrice)}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <CategoryBadge category={p.portalCategory} />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50/50">
                <span className="text-xs text-gray-500">
                  {(page - 1) * 50 + 1}-{Math.min(page * 50, total)} de {total}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-30"
                  >
                    <RiArrowLeftLine className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600">{page} / {totalPages}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-30"
                  >
                    <RiArrowRightLine className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Editar Limites do Plano */}
      {showLimitsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-[420px] max-w-[95vw]">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-900">Limites do Plano — {PORTALS.find(p => p.id === portal)?.name}</h3>
              <button onClick={() => setShowLimitsModal(false)} className="text-gray-400 hover:text-gray-600">
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-xs text-gray-500">Configure os limites de anúncios contratados para este portal.</p>
              {(["simples", "destaque", "super_destaque", "destaque_exclusivo"] as const).map((cat) => (
                <div key={cat} className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 capitalize">
                    {cat === "super_destaque" ? "Super Destaque" : cat === "destaque_exclusivo" ? "Destaque Exclusivo" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </label>
                  <input
                    type="number"
                    value={editLimits[cat]}
                    onChange={(e) => setEditLimits({ ...editLimits, [cat]: parseInt(e.target.value) || 0 })}
                    className="w-28 border rounded-lg px-3 py-1.5 text-sm text-right focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setShowLimitsModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveLimits}
                className="px-4 py-2 text-sm font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Salvar Limites
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryBadge({ category }: { category: string }) {
  if (category === "super_destaque") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-100 text-purple-700">
        <RiVipCrownFill className="w-3 h-3" />
        Super
      </span>
    );
  }
  if (category === "destaque_exclusivo") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-700">
        <RiStarFill className="w-3 h-3" />
        Exclusivo
      </span>
    );
  }
  if (category === "destaque") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-orange-100 text-orange-700">
        <RiStarFill className="w-3 h-3" />
        Destaque
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-500">
      Simples
    </span>
  );
}
