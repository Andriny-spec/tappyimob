"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  RiBuilding4Line,
  RiAddLine,
  RiSearchLine,
  RiFilterLine,
  RiEditLine,
  RiDeleteBinLine,
  RiMapPinLine,
  RiHome4Line,
  RiEyeLine,
  RiMoreLine,
  RiCloseLine,
  RiCheckLine,
  RiUploadCloud2Line,
  RiArrowLeftSLine,
  RiArrowRightSLine,
} from "react-icons/ri";

interface Condominium {
  id: string;
  name: string;
  slug: string;
  condoCategory: string;
  condoType: string;
  neighborhood: string;
  city: string;
  state: string;
  thumbnail: string | null;
  isActive: boolean;
  isFeatured: boolean;
  isLaunchProject: boolean;
  hasSportsAdvisory: boolean;
  totalUnits: number | null;
  totalLots: number | null;
  builder: string | null;
  builderId: string | null;
  builderPartner?: {
    id: string;
    name: string;
  } | null;
  _count: {
    properties: number;
  };
}

interface Builder {
  id: string;
  name: string;
}

export default function CondominiosPage() {
  const [condominiums, setCondominiums] = useState<Condominium[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [formatFilter, setFormatFilter] = useState("");
  const [launchFilter, setLaunchFilter] = useState(false);
  const [sportsFilter, setSportsFilter] = useState(false);
  const [builderFilter, setBuilderFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [showFilters, setShowFilters] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; errors: number } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [stats, setStats] = useState({ total: 0, vertical: 0, horizontal: 0, misto: 0, residencial: 0, comercial: 0, hibrido: 0 });
  const [builders, setBuilders] = useState<Builder[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const ITEMS_PER_PAGE = 20;

  const syncCondominiums = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/condominiums/sync", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert(`Sincronizado! ${data.totalUpdated} imóveis vinculados.`);
        fetchCondominiums();
      }
    } catch (error) {
      console.error("Erro ao sincronizar:", error);
    }
    setSyncing(false);
  };

  const fetchBuilders = async () => {
    try {
      const res = await fetch("/api/admin/business-partners?type=CONSTRUTORA&limit=100");
      const data = await res.json();
      setBuilders(data.partners || []);
    } catch (error) {
      console.error("Erro ao buscar construtoras:", error);
    }
  };

  const fetchCondominiums = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("limit", String(ITEMS_PER_PAGE));
      params.append("page", String(page));
      if (search) params.append("search", search);
      if (categoryFilter) params.append("category", categoryFilter);
      if (formatFilter) params.append("format", formatFilter);
      if (launchFilter) params.append("launch", "true");
      if (sportsFilter) params.append("sports", "true");
      if (builderFilter) params.append("builderId", builderFilter);
      if (sortBy) params.append("sortBy", sortBy);

      const res = await fetch(`/api/admin/condominiums?${params}`);
      const data = await res.json();
      setCondominiums(data.condominiums || []);
      setTotalPages(data.pages || 1);
      setTotalItems(data.total || 0);
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Erro ao buscar condomínios:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBuilders();
  }, []);

  useEffect(() => {
    fetchCondominiums();
  }, [search, categoryFilter, formatFilter, launchFilter, sportsFilter, builderFilter, sortBy, page]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, formatFilter, launchFilter, sportsFilter, builderFilter, sortBy]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o condomínio "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/condominiums/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Erro ao excluir");
        return;
      }

      fetchCondominiums();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert("Erro ao excluir condomínio");
    }
  };

  const handleImport = async () => {
    setImporting(true);
    setImportResult(null);

    try {
      const res = await fetch("/api/admin/condominiums/import", { method: "POST" });
      const data = await res.json();

      setImportResult({ success: data.imported || 0, errors: data.errors || 0 });
      fetchCondominiums();
    } catch (error) {
      console.error("Erro ao importar:", error);
      setImportResult({ success: 0, errors: 1 });
    }

    setImporting(false);
  };

  const categoryLabels: Record<string, string> = {
    RESIDENCIAL: "Residencial",
    COMERCIAL: "Comercial",
    HIBRIDO: "Híbrido",
  };

  const categoryColors: Record<string, string> = {
    RESIDENCIAL: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
    COMERCIAL: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
    HIBRIDO: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400",
  };

  const formatLabels: Record<string, string> = {
    VERTICAL: "Vertical",
    HORIZONTAL: "Horizontal",
    VILLAGIO: "Villagio",
    MISTO: "Misto",
  };

  const formatColors: Record<string, string> = {
    VERTICAL: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
    HORIZONTAL: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
    VILLAGIO: "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400",
    MISTO: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <RiBuilding4Line className="w-7 h-7 text-[#0B2545]" />
            Condomínios
          </h1>
          <p className="text-neutral-500 mt-1">
            Gerencie os condomínios e suas informações
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={syncCondominiums}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            {syncing ? (
              <div className="w-5 h-5 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <RiCheckLine className="w-5 h-5" />
            )}
            Sincronizar
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <RiUploadCloud2Line className="w-5 h-5" />
            Importar
          </button>
          <Link
            href="/admin/imoveis/condominios/novo"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B2545] text-white hover:bg-[#081733] transition-colors"
          >
            <RiAddLine className="w-5 h-5" />
            Novo Condomínio
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por nome, bairro ou cidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-[#0B2545] focus:border-transparent"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
              showFilters 
                ? "bg-[#0B2545] text-white border-[#0B2545]" 
                : "border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            }`}
          >
            <RiFilterLine className="w-5 h-5" />
            Filtros
            {(categoryFilter || formatFilter || launchFilter || sportsFilter || builderFilter) && (
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            )}
          </button>
        </div>

        {/* Filtros Avançados */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {/* Tipo (Categoria) */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Tipo
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                >
                  <option value="">Todos</option>
                  <option value="RESIDENCIAL">Residencial</option>
                  <option value="COMERCIAL">Comercial</option>
                  <option value="HIBRIDO">Híbrido</option>
                </select>
              </div>

              {/* Formato */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Formato
                </label>
                <select
                  value={formatFilter}
                  onChange={(e) => setFormatFilter(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                >
                  <option value="">Todos</option>
                  <option value="VERTICAL">Vertical (Edifícios)</option>
                  <option value="HORIZONTAL">Horizontal (Casas)</option>
                  <option value="MISTO">Misto</option>
                </select>
              </div>

              {/* Construtora */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Construtora
                </label>
                <select
                  value={builderFilter}
                  onChange={(e) => setBuilderFilter(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                >
                  <option value="">Todas</option>
                  {builders.map((builder) => (
                    <option key={builder.id} value={builder.id}>
                      {builder.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lançamento */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Especiais
                </label>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={launchFilter}
                      onChange={(e) => setLaunchFilter(e.target.checked)}
                      className="w-4 h-4 rounded border-neutral-300 text-[#0B2545] focus:ring-[#0B2545]"
                    />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">Lançamento</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sportsFilter}
                      onChange={(e) => setSportsFilter(e.target.checked)}
                      className="w-4 h-4 rounded border-neutral-300 text-[#0B2545] focus:ring-[#0B2545]"
                    />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">Assessoria Esportiva</span>
                  </label>
                </div>
              </div>

              {/* Ordenação */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Ordenar por
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                >
                  <option value="name">Nome (A-Z)</option>
                  <option value="properties">Mais imóveis</option>
                  <option value="views">Mais vistos (site)</option>
                  <option value="visits">Mais visitados</option>
                  <option value="sold">Mais vendidos</option>
                </select>
              </div>
            </div>

            {/* Limpar filtros */}
            {(categoryFilter || formatFilter || launchFilter || sportsFilter || builderFilter) && (
              <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <button
                  onClick={() => {
                    setCategoryFilter("");
                    setFormatFilter("");
                    setLaunchFilter(false);
                    setSportsFilter(false);
                    setBuilderFilter("");
                  }}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Limpar todos os filtros
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
          <p className="text-sm text-neutral-500">Total</p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
          <p className="text-sm text-neutral-500">Verticais</p>
          <p className="text-2xl font-bold text-blue-600">{stats.vertical}</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
          <p className="text-sm text-neutral-500">Horizontais</p>
          <p className="text-2xl font-bold text-green-600">{stats.horizontal}</p>
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-[#0B2545] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-neutral-500 mt-2">Carregando...</p>
          </div>
        ) : condominiums.length === 0 ? (
          <div className="p-8 text-center">
            <RiBuilding4Line className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500">Nenhum condomínio encontrado</p>
            <Link
              href="/admin/imoveis/condominios/novo"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-[#0B2545] text-white text-sm"
            >
              <RiAddLine className="w-4 h-4" />
              Cadastrar primeiro condomínio
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Condomínio</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Tipo</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Formato</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Localização</th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-neutral-500">Imóveis</th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-neutral-500">Status</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-neutral-500">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {condominiums.map((condo) => (
                  <tr key={condo.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden">
                          {condo.thumbnail ? (
                            <img src={condo.thumbnail} alt={condo.name} className="w-full h-full object-cover" />
                          ) : (
                            <RiBuilding4Line className="w-6 h-6 text-neutral-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-white">{condo.name}</p>
                          {condo.isFeatured && (
                            <span className="text-xs text-amber-600">⭐ Destaque</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${categoryColors[condo.condoCategory] || "bg-neutral-100 text-neutral-600"}`}>
                        {categoryLabels[condo.condoCategory] || condo.condoCategory || "Residencial"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${formatColors[condo.condoType] || "bg-neutral-100 text-neutral-600"}`}>
                        {formatLabels[condo.condoType] || condo.condoType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400">
                        <RiMapPinLine className="w-4 h-4" />
                        {condo.neighborhood}, {condo.city}/{condo.state}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-sm">
                        <RiHome4Line className="w-4 h-4" />
                        {condo._count.properties}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                        condo.isActive 
                          ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                          : "bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400"
                      }`}>
                        {condo.isActive ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/condominio/${condo.slug}`}
                          target="_blank"
                          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                          title="Ver no site"
                        >
                          <RiEyeLine className="w-5 h-5 text-neutral-500" />
                        </Link>
                        <Link
                          href={`/admin/imoveis/condominios/${condo.id}`}
                          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                          title="Editar"
                        >
                          <RiEditLine className="w-5 h-5 text-neutral-500" />
                        </Link>
                        <button
                          onClick={() => handleDelete(condo.id, condo.name)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          title="Excluir"
                        >
                          <RiDeleteBinLine className="w-5 h-5 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-neutral-500">
            Mostrando {((page - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(page * ITEMS_PER_PAGE, totalItems)} de {totalItems}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <RiArrowLeftSLine className="w-5 h-5" />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (page <= 4) {
                pageNum = i + 1;
              } else if (page >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = page - 3 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    page === pageNum
                      ? "bg-[#0B2545] text-white"
                      : "border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <RiArrowRightSLine className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Importar Condomínios</h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>

            {importResult ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <RiCheckLine className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                  Importação concluída!
                </p>
                <p className="text-neutral-500">
                  {importResult.success} condomínios importados
                  {importResult.errors > 0 && `, ${importResult.errors} erros`}
                </p>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="mt-6 px-6 py-2.5 rounded-xl bg-[#0B2545] text-white"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <>
                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                  Isso irá importar os condomínios do arquivo Excel para o sistema.
                  Condomínios já existentes serão ignorados.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={importing}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#0B2545] text-white hover:bg-[#081733] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {importing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Importando...
                      </>
                    ) : (
                      <>
                        <RiUploadCloud2Line className="w-5 h-5" />
                        Importar
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
