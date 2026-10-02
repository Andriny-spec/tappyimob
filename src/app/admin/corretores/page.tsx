"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  RiUserStarLine,
  RiSearchLine,
  RiAddLine,
  RiPhoneLine,
  RiMailLine,
  RiHome4Line,
  RiTeamLine,
  RiLayoutGridLine,
  RiListCheck,
  RiCheckDoubleLine,
  RiCloseLine,
  RiLoader4Line,
  RiFilterLine,
  RiScales3Line,
  RiTrophyLine,
  RiBarChartLine,
  RiCalendarLine,
  RiTimeLine,
  RiArrowRightSLine,
  RiStarFill,
  RiMoneyDollarCircleLine,
} from "react-icons/ri";
import { AddCorretorModal } from "@/components/admin/corretores/modals/AddCorretorModal";

interface Corretor {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  creci: string | null;
  region: string | null;
  role: string;
  isActive: boolean;
  rating: number | null;
  totalSales: number | null;
  totalValue: number | null;
  conversionRate: number | null;
  leadsActive: number;
  ranking: number;
  createdAt: string;
}

interface CorretorStats {
  leadsTotal: number;
  leadsLimbo: number;
  propertiesCount: number;
  visitsCompleted: number;
  comissoesCount: number;
  activityLogsCount: number;
}

const PERIODS = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "12m", days: 365 },
];

const COMPARE_METRICS = [
  { key: "leadsTotal", label: "Leads Totais", icon: RiTeamLine, color: "text-blue-500" },
  { key: "propertiesCount", label: "Captações", icon: RiHome4Line, color: "text-orange-500" },
  { key: "visitsCompleted", label: "Visitas", icon: RiCalendarLine, color: "text-green-500" },
  { key: "comissoesCount", label: "Propostas", icon: RiMoneyDollarCircleLine, color: "text-emerald-500" },
  { key: "leadsLimbo", label: "Leads Limbo", icon: RiTimeLine, color: "text-amber-500" },
  { key: "activityLogsCount", label: "Atualizações", icon: RiBarChartLine, color: "text-purple-500" },
];

export default function CorretoresPage() {
  const router = useRouter();
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [showAddModal, setShowAddModal] = useState(false);

  // Date filter
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  // Compare mode
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [compareStats, setCompareStats] = useState<Record<string, CorretorStats>>({});
  const [loadingCompare, setLoadingCompare] = useState(false);
  const [showCompareResult, setShowCompareResult] = useState(false);

  const fetchCorretores = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/corretores");
      if (res.ok) {
        const data = await res.json();
        setCorretores(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchCorretores(); }, [fetchCorretores]);

  const applyPeriod = (days: number) => {
    const from = new Date(Date.now() - days * 86400_000).toISOString().split("T")[0];
    setStartDate(from);
    setEndDate(today);
  };

  const clearDates = () => { setStartDate(""); setEndDate(""); };

  const filteredCorretores = corretores.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" ||
      (statusFilter === "active" && c.isActive) ||
      (statusFilter === "inactive" && !c.isActive);
    return matchSearch && matchStatus;
  });

  const getRankingBadge = (ranking: number) => {
    if (ranking === 1) return "bg-amber-500 text-white";
    if (ranking === 2) return "bg-neutral-400 text-white";
    if (ranking === 3) return "bg-amber-700 text-white";
    return "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400";
  };

  const stats = [
    { label: "Total", value: corretores.length, icon: RiTeamLine, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-500/20" },
    { label: "Ativos", value: corretores.filter(c => c.isActive).length, icon: RiCheckDoubleLine, color: "text-green-500", bg: "bg-green-100 dark:bg-green-500/20" },
  ];

  const handleCorretorClick = (corretor: Corretor) => {
    if (compareMode) {
      setSelectedIds(prev =>
        prev.includes(corretor.id)
          ? prev.filter(id => id !== corretor.id)
          : prev.length < 4 ? [...prev, corretor.id] : prev
      );
    } else {
      router.push(`/admin/corretores/${corretor.id}`);
    }
  };

  const handleCompare = async () => {
    if (selectedIds.length < 2) return;
    setLoadingCompare(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      const results = await Promise.all(
        selectedIds.map(async (id) => {
          const res = await fetch(`/api/admin/corretores/${id}/stats?${params}`);
          const data = res.ok ? await res.json() : {};
          return [id, data] as [string, CorretorStats];
        })
      );
      setCompareStats(Object.fromEntries(results));
      setShowCompareResult(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCompare(false);
    }
  };

  const exitCompare = () => {
    setCompareMode(false);
    setSelectedIds([]);
    setCompareStats({});
    setShowCompareResult(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
              <RiUserStarLine className="w-5 h-5 text-blue-500" />
            </div>
            Equipe
          </h1>
          <p className="text-neutral-500 mt-1 text-sm">Gestão e performance da equipe de corretores</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { compareMode ? exitCompare() : setCompareMode(true); }}
            className={`flex items-center gap-2 h-10 px-4 rounded-xl font-medium text-sm transition-colors border ${compareMode ? "bg-purple-500 text-white border-purple-500" : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-purple-400"}`}
          >
            <RiScales3Line className="w-4 h-4" />
            {compareMode ? "Sair do Comparar" : "Comparar"}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-blue-500 text-white font-medium text-sm hover:bg-blue-600 transition-colors"
          >
            <RiAddLine className="w-4 h-4" />
            Novo Corretor
          </button>
        </div>
      </div>

      {/* Compare banner */}
      {compareMode && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-500/10 rounded-xl border border-purple-200 dark:border-purple-500/30">
          <p className="text-sm text-purple-700 dark:text-purple-300">
            Selecione 2 a 4 corretores para comparar.
            <strong className="ml-1">{selectedIds.length} selecionado(s)</strong>
          </p>
          <button
            onClick={handleCompare}
            disabled={selectedIds.length < 2 || loadingCompare}
            className="flex items-center gap-2 h-8 px-4 rounded-lg bg-purple-500 text-white text-sm font-medium hover:bg-purple-600 disabled:opacity-40 transition-colors"
          >
            {loadingCompare ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiBarChartLine className="w-4 h-4" />}
            Ver Comparação
          </button>
        </motion.div>
      )}

      {/* Stats mini */}
      <div className="flex items-center gap-3">
        {stats.map(s => (
          <div key={s.label} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
            <div className={`w-7 h-7 rounded-lg ${s.bg} flex items-center justify-center`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div>
              <span className="text-base font-bold text-neutral-900 dark:text-white">{s.value}</span>
              <span className="text-xs text-neutral-500 ml-1">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar corretor..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
            {(["all", "active", "inactive"] as const).map((status) => (
              <button key={status} onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === status ? "bg-white dark:bg-neutral-700 text-blue-500 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}>
                {status === "all" ? "Todos" : status === "active" ? "Ativos" : "Inativos"}
              </button>
            ))}
          </div>

          {/* Period shortcuts */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
            {PERIODS.map((p) => {
              const from = new Date(Date.now() - p.days * 86400_000).toISOString().split("T")[0];
              const active = startDate === from && endDate === today;
              return (
                <button key={p.label} onClick={() => applyPeriod(p.days)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${active ? "bg-white dark:bg-neutral-700 text-blue-500 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}>
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Custom date */}
          <button onClick={() => setShowDateFilter(!showDateFilter)}
            className={`flex items-center gap-1.5 h-9 px-3 rounded-xl text-sm font-medium transition-colors border ${(showDateFilter || startDate) ? "bg-blue-500 text-white border-blue-500" : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-700"}`}>
            <RiFilterLine className="w-4 h-4" />
            {startDate ? `${startDate.slice(5)} – ${endDate?.slice(5) || "hoje"}` : "Período"}
          </button>

          {(startDate || endDate) && (
            <button onClick={clearDates} className="h-9 w-9 flex items-center justify-center rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 border border-transparent">
              <RiCloseLine className="w-4 h-4" />
            </button>
          )}

          {/* View toggle */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
            <button onClick={() => setView("grid")}
              className={`p-2 rounded-lg transition-colors ${view === "grid" ? "bg-white dark:bg-neutral-700 text-blue-500 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}>
              <RiLayoutGridLine className="w-4 h-4" />
            </button>
            <button onClick={() => setView("list")}
              className={`p-2 rounded-lg transition-colors ${view === "list" ? "bg-white dark:bg-neutral-700 text-blue-500 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}>
              <RiListCheck className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Custom date inputs */}
      {showDateFilter && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
          className="flex items-center gap-3 p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <label className="text-sm text-neutral-500">De:</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="h-9 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-neutral-500">Até:</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="h-9 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm" />
          </div>
        </motion.div>
      )}

      {/* Compare Result */}
      <AnimatePresence>
        {showCompareResult && Object.keys(compareStats).length >= 2 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-white dark:bg-neutral-900 rounded-2xl border border-purple-200 dark:border-purple-500/30 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 bg-purple-50 dark:bg-purple-500/10 border-b border-purple-200 dark:border-purple-500/20">
              <h3 className="font-semibold text-purple-800 dark:text-purple-300 flex items-center gap-2">
                <RiBarChartLine className="w-4 h-4" />
                Comparativo de Corretores
                {(startDate || endDate) && (
                  <span className="text-xs font-normal text-purple-600">
                    ({startDate || "início"} → {endDate || "hoje"})
                  </span>
                )}
              </h3>
              <button onClick={() => setShowCompareResult(false)} className="p-1.5 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-500/20 text-purple-500">
                <RiCloseLine className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-100 dark:border-neutral-800">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase">Métrica</th>
                    {selectedIds.map((sid) => {
                      const c = corretores.find(c => c.id === sid);
                      return (
                        <th key={sid} className="text-center px-4 py-3 text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase min-w-[120px]">
                          {c?.name.split(" ")[0] || "—"}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {COMPARE_METRICS.map((metric) => {
                    const values = selectedIds.map(sid => (compareStats[sid] as any)?.[metric.key] ?? 0);
                    const maxVal = Math.max(...values, 1);
                    return (
                      <tr key={metric.key} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <metric.icon className={`w-4 h-4 ${metric.color}`} />
                            <span className="text-sm text-neutral-700 dark:text-neutral-300">{metric.label}</span>
                          </div>
                        </td>
                        {selectedIds.map((sid, i) => {
                          const val = values[i];
                          const isTop = val === maxVal && maxVal > 0;
                          return (
                            <td key={sid} className="px-4 py-3 text-center">
                              <span className={`text-lg font-bold ${isTop ? "text-blue-500" : "text-neutral-700 dark:text-neutral-300"}`}>
                                {val}
                              </span>
                              {isTop && <span className="ml-1 text-[10px] text-amber-500">★</span>}
                              <div className="mt-1 h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-400 rounded-full" style={{ width: `${(val / maxVal) * 100}%` }} />
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredCorretores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
            <RiUserStarLine className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Nenhum corretor encontrado</h3>
          <p className="text-neutral-500 mb-4">{search ? "Tente uma busca diferente" : "Adicione seu primeiro corretor"}</p>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600">
            <RiAddLine className="w-4 h-4" /> Novo Corretor
          </button>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filteredCorretores.map((corretor, index) => {
            const isSelected = selectedIds.includes(corretor.id);
            const initials = corretor.name.split(" ").map(n => n[0]).slice(0, 2).join("");
            return (
              <motion.div key={corretor.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => handleCorretorClick(corretor)}
                className={`bg-white dark:bg-neutral-900 rounded-xl border p-3 cursor-pointer transition-all group ${
                  isSelected
                    ? "border-purple-500 ring-2 ring-purple-500/30 shadow-lg"
                    : "border-neutral-200 dark:border-neutral-800 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/50"
                }`}>
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                    <RiCheckDoubleLine className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                        {corretor.avatar ? <img src={corretor.avatar} alt="" className="w-full h-full object-cover" /> : initials}
                      </div>
                      <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full ${getRankingBadge(corretor.ranking)} flex items-center justify-center text-[10px] font-bold`}>
                        {corretor.ranking}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-neutral-900 dark:text-white truncate group-hover:text-blue-500 transition-colors">
                        {corretor.name.split(" ")[0]}
                      </h3>
                      <p className="text-[10px] text-neutral-500 truncate">{corretor.creci}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="text-center">
                      <p className="font-bold text-neutral-900 dark:text-white">{corretor.totalSales || 0}</p>
                      <p className="text-neutral-400">vendas</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-blue-500">{corretor.leadsActive}</p>
                      <p className="text-neutral-400">leads</p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <RiStarFill className="w-3 h-3 text-amber-400" />
                      <span className="font-bold text-neutral-900 dark:text-white">{corretor.rating || 0}</span>
                    </div>
                  </div>
                  <div className={`mt-2 h-1 rounded-full ${corretor.isActive ? "bg-green-500" : "bg-neutral-300 dark:bg-neutral-700"}`} />
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <div className="hidden lg:grid grid-cols-[1fr_100px_80px_80px_80px_100px_40px] gap-2 px-5 py-3 bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800">
            {["Corretor", "CRECI", "Ranking", "Vendas", "Leads", "Status", ""].map(h => (
              <span key={h} className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">{h}</span>
            ))}
          </div>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {filteredCorretores.map((corretor) => {
              const isSelected = selectedIds.includes(corretor.id);
              const initials = corretor.name.split(" ").map(n => n[0]).slice(0, 2).join("");
              return (
                <div key={corretor.id}
                  onClick={() => handleCorretorClick(corretor)}
                  className={`flex flex-col lg:grid lg:grid-cols-[1fr_100px_80px_80px_80px_100px_40px] lg:items-center gap-2 px-5 py-3 cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-purple-50 dark:bg-purple-500/10 border-l-2 border-l-purple-500"
                      : "hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
                      {corretor.avatar ? <img src={corretor.avatar} alt="" className="w-full h-full object-cover" /> : initials}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-neutral-900 dark:text-white text-sm truncate">{corretor.name}</p>
                      <p className="text-xs text-neutral-500 truncate">{corretor.email}</p>
                    </div>
                  </div>
                  <span className="text-sm text-neutral-500">{corretor.creci || "—"}</span>
                  <span className={`inline-flex w-7 h-7 rounded-full ${getRankingBadge(corretor.ranking)} items-center justify-center font-bold text-xs`}>
                    {corretor.ranking}
                  </span>
                  <span className="text-sm font-semibold text-neutral-900 dark:text-white">{corretor.totalSales || 0}</span>
                  <span className="text-sm font-semibold text-blue-500">{corretor.leadsActive}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${corretor.isActive ? "bg-green-100 dark:bg-green-500/20 text-green-600" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"}`}>
                    {corretor.isActive ? "Ativo" : "Inativo"}
                  </span>
                  <RiArrowRightSLine className="w-4 h-4 text-neutral-400" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <AddCorretorModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={fetchCorretores} />
    </div>
  );
}
