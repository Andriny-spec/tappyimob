"use client";

import { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import { motion } from "framer-motion";
import {
  RiMailSendLine,
  RiSearchLine,
  RiDownloadLine,
  RiDeleteBinLine,
  RiLoader4Line,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiUserLine,
} from "react-icons/ri";

interface Subscriber {
  id: string;
  email: string;
  isActive: boolean;
  source: string | null;
  createdAt: string;
}

const sourceLabel = (source: string | null) => {
  if (source === "footer") return "Rodapé do site";
  if (source === "blog") return "Blog";
  return "-";
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ isActive: "", source: "", createdFrom: "", createdTo: "" });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [activeTotal, setActiveTotal] = useState(0);
  const [exporting, setExporting] = useState(false);

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, page: String(pagination.page), limit: String(pagination.limit) });
      if (filters.isActive) params.set("isActive", filters.isActive);
      if (filters.source) params.set("source", filters.source);
      if (filters.createdFrom) params.set("createdFrom", filters.createdFrom);
      if (filters.createdTo) params.set("createdTo", filters.createdTo);
      const res = await fetch(`/api/admin/newsletter?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data.subscribers || []);
        setActiveTotal(data.activeTotal || 0);
        setPagination((prev) => ({ ...prev, total: data.total || 0, totalPages: data.pages || 0 }));
      }
    } catch (error) {
      console.error("Erro ao carregar inscritos da newsletter:", error);
    } finally {
      setLoading(false);
    }
  }, [search, filters, pagination.page, pagination.limit]);

  useEffect(() => { fetchSubscribers(); }, [fetchSubscribers]);
  useEffect(() => { setPagination((prev) => ({ ...prev, page: 1 })); }, [search, filters]);

  const handleDelete = async (subscriber: Subscriber) => {
    if (!confirm(`Remover "${subscriber.email}" da lista de newsletter?`)) return;
    try {
      const res = await fetch(`/api/admin/newsletter/${subscriber.id}`, { method: "DELETE" });
      if (res.ok) fetchSubscribers();
      else alert("Erro ao remover inscrito.");
    } catch (error) {
      console.error("Erro ao remover inscrito:", error);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({ search, page: "1", limit: "100000" });
      if (filters.isActive) params.set("isActive", filters.isActive);
      if (filters.source) params.set("source", filters.source);
      if (filters.createdFrom) params.set("createdFrom", filters.createdFrom);
      if (filters.createdTo) params.set("createdTo", filters.createdTo);
      const res = await fetch(`/api/admin/newsletter?${params}`);
      if (!res.ok) { alert("Erro ao exportar."); return; }
      const data = await res.json();
      const all: Subscriber[] = data.subscribers || [];
      if (all.length === 0) { alert("Nenhum inscrito para exportar com os filtros atuais."); return; }

      const rows = all.map((s) => ({
        "E-mail": s.email,
        Origem: sourceLabel(s.source),
        Status: s.isActive ? "Ativo" : "Inativo",
        "Data de Inscrição": formatDate(s.createdAt),
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Newsletter");
      XLSX.writeFile(wb, `newsletter-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      console.error("Erro ao exportar newsletter:", error);
      alert("Erro ao exportar.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
              <RiMailSendLine className="w-5 h-5 text-orange-500" />
            </div>
            Newsletter
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Inscritos capturados pelo rodapé do site e pelo blog
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors disabled:opacity-60"
        >
          {exporting ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiDownloadLine className="w-4 h-4" />}
          {exporting ? "Exportando..." : "Exportar"}
        </button>
      </div>

      {/* Resumo */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm">
          <RiUserLine className="w-4 h-4 text-orange-500" />
          <span className="text-neutral-500">{pagination.total} inscrito{pagination.total !== 1 ? "s" : ""} no total</span>
        </div>
        <div className="px-3 py-1.5 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg text-sm text-green-700 dark:text-green-400">
          {activeTotal} ativo{activeTotal !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 relative min-w-[220px]">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por e-mail..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          />
        </div>
        <select
          value={filters.source}
          onChange={(e) => setFilters({ ...filters, source: e.target.value })}
          className="px-3 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm"
        >
          <option value="">Todas as origens</option>
          <option value="footer">Rodapé do site</option>
          <option value="blog">Blog</option>
        </select>
        <select
          value={filters.isActive}
          onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
          className="px-3 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm"
        >
          <option value="">Todos os status</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </select>
        <input
          type="date"
          value={filters.createdFrom}
          onChange={(e) => setFilters({ ...filters, createdFrom: e.target.value })}
          className="px-3 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm"
        />
        <input
          type="date"
          value={filters.createdTo}
          onChange={(e) => setFilters({ ...filters, createdTo: e.target.value })}
          className="px-3 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm"
        />
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : subscribers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <RiMailSendLine className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mb-4" />
            <p className="text-neutral-500">Nenhum inscrito encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700 text-left text-xs text-neutral-500">
                  <th className="px-4 py-3 font-medium">E-mail</th>
                  <th className="px-4 py-3 font-medium">Origem</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                  >
                    <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">{s.email}</td>
                    <td className="px-4 py-3 text-neutral-500">{sourceLabel(s.source)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        s.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                          : "bg-neutral-100 text-neutral-700 dark:bg-neutral-500/20 dark:text-neutral-400"
                      }`}>
                        {s.isActive ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-500">{formatDate(s.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(s)}
                        className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <RiDeleteBinLine className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginação */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-neutral-500">
            Página {pagination.page} de {pagination.totalPages} — {pagination.total} inscritos
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RiArrowLeftSLine className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RiArrowRightSLine className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
