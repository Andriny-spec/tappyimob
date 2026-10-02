"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCalendarLine,
  RiTimeLine,
  RiMapPinLine,
  RiUserLine,
  RiPhoneLine,
  RiMailLine,
  RiWhatsappLine,
  RiCheckLine,
  RiCloseLine,
  RiMoreLine,
  RiAddLine,
  RiSearchLine,
  RiFilterLine,
  RiRefreshLine,
  RiLoader4Line,
  RiHome4Line,
  RiCalendarCheckLine,
  RiCalendarCloseLine,
  RiCalendarTodoLine,
  RiMoneyDollarCircleLine,
  RiBuildingLine,
  RiEditLine,
  RiDeleteBinLine,
  RiSaveLine,
  RiArrowUpLine,
  RiArrowDownLine,
} from "react-icons/ri";
import { ScheduleVisitModal } from "@/components/admin/ScheduleVisitModal";

// Types
interface Visit {
  id: string;
  date: string;
  time: string | null;
  endTime: string | null;
  status: string;
  notes: string | null;
  internalNotes: string | null;
  lead: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  } | null;
  visitorName: string | null;
  visitorEmail: string | null;
  visitorPhone: string | null;
  cancelReason: string | null;
  cancelNotes: string | null;
  corretor: {
    id: string;
    name: string;
    email: string;
  } | null;
  properties: {
    liked?: boolean | null;
    feedback?: string | null;
    property: {
      id: string;
      code: string;
      title: string;
      address: string;
      neighborhood: string;
      city: string;
      thumbnail: string | null;
    };
  }[];
  createdAt: string;
}

export default function VisitasPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "AGENDADA" | "CONFIRMADA" | "REALIZADA" | "CANCELADA">("all");
  const [search, setSearch] = useState("");
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDateFilters, setShowDateFilters] = useState(false);
  const [corretorFilter, setCorretorFilter] = useState("");
  const [condominiumFilter, setCondominiumFilter] = useState("");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [brokers, setBrokers] = useState<{id: string; name: string}[]>([]);
  const [condominiums, setCondominiums] = useState<{id: string; name: string}[]>([]);
  const [editVisit, setEditVisit] = useState<Visit | null>(null);
  const [cancelVisit, setCancelVisit] = useState<Visit | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })();

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [brokersRes, condoRes] = await Promise.all([
          fetch("/api/admin/brokers"),
          fetch("/api/condominiums"),
        ]);
        if (brokersRes.ok) {
          const data = await brokersRes.json();
          setBrokers(data.brokers || []);
        }
        if (condoRes.ok) {
          const data = await condoRes.json();
          setCondominiums(data.condominiums || []);
        }
      } catch (error) {
        console.error("Erro ao carregar opções de filtro:", error);
      }
    };
    fetchOptions();
  }, []);

  const fetchVisits = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("status", filter);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (corretorFilter) params.set("corretorId", corretorFilter);
      if (condominiumFilter) params.set("condominiumId", condominiumFilter);
      if (propertyTypeFilter) params.set("propertyType", propertyTypeFilter);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      params.set("limit", "500");

      const response = await fetch(`/api/admin/scheduled-visits?${params.toString()}`);
      const data = await response.json();
      if (response.ok) {
        setVisits(data.visits || []);
        setTotalCount(data.pagination?.total ?? (data.visits?.length ?? 0));
      }
    } catch (error) {
      console.error("Erro ao buscar visitas:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filter, startDate, endDate, corretorFilter, condominiumFilter, propertyTypeFilter, minPrice, maxPrice]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  const getVisitorName = (visit: Visit) => {
    return visit.lead?.name || visit.visitorName || "Visitante";
  };

  const getVisitorEmail = (visit: Visit) => {
    return visit.lead?.email || visit.visitorEmail || "";
  };

  const getVisitorPhone = (visit: Visit) => {
    return visit.lead?.phone || visit.visitorPhone || "";
  };

  const getFirstProperty = (visit: Visit) => {
    return visit.properties?.[0]?.property || null;
  };

  const filteredVisits = visits.filter((visit) => {
    if (!search) return true;
    const visitorName = getVisitorName(visit);
    const firstProp = getFirstProperty(visit);
    const matchesSearch =
      (firstProp?.title?.toLowerCase().includes(search.toLowerCase()) || false) ||
      (firstProp?.code?.toLowerCase().includes(search.toLowerCase()) || false) ||
      visitorName.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const sortedVisits = [...filteredVisits].sort((a, b) => {
    const da = (a.date?.split("T")[0] || "") + (a.time || "00:00");
    const db = (b.date?.split("T")[0] || "") + (b.time || "00:00");
    return sortOrder === "asc" ? da.localeCompare(db) : db.localeCompare(da);
  });

  const statusMap: Record<string, string> = {
    AGENDADA: "Agendada",
    CONFIRMADA: "Confirmada",
    REALIZADA: "Realizada",
    CANCELADA: "Cancelada",
    REAGENDADA: "Reagendada",
    NAO_COMPARECEU: "Não Compareceu",
  };

  const statusColors: Record<string, string> = {
    AGENDADA: "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
    CONFIRMADA: "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400",
    REALIZADA: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    CANCELADA: "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400",
    REAGENDADA: "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400",
    NAO_COMPARECEU: "bg-neutral-100 dark:bg-neutral-500/20 text-neutral-600 dark:text-neutral-400",
  };

  const stats = {
    total: totalCount,
    pending: visits.filter((v) => v.status === "AGENDADA").length,
    confirmed: visits.filter((v) => v.status === "CONFIRMADA").length,
    today: visits.filter((v) => v.date?.split("T")[0] === today).length,
  };

  const handleConfirm = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/scheduled-visits/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CONFIRMADA" }),
      });
      if (response.ok) fetchVisits();
    } catch (error) {
      console.error("Erro ao confirmar visita:", error);
    }
    setShowMenu(null);
  };

  const handleCancel = (visit: Visit) => {
    setCancelVisit(visit);
    setShowMenu(null);
  };

  const handleCancelConfirm = async (id: string, cancelReason: string, cancelNotes: string) => {
    try {
      const response = await fetch(`/api/admin/scheduled-visits/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELADA", cancelReason, cancelNotes: cancelNotes || null }),
      });
      if (response.ok) {
        setCancelVisit(null);
        fetchVisits();
      }
    } catch (error) {
      console.error("Erro ao cancelar visita:", error);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/scheduled-visits/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REALIZADA" }),
      });
      if (response.ok) fetchVisits();
    } catch (error) {
      console.error("Erro ao finalizar visita:", error);
    }
    setShowMenu(null);
  };

  const formatDate = (dateStr: string) => {
    const parts = dateStr.split("T")[0].split("-");
    const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return date.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  };

  const getDateStr = (dateStr: string) => dateStr?.split("T")[0] || "";
  const isToday = (dateStr: string) => getDateStr(dateStr) === today;
  const isPast = (dateStr: string) => getDateStr(dateStr) < today;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
              <RiCalendarLine className="w-5 h-5 text-blue-500" />
            </div>
            Visitas Agendadas
          </h1>
          <p className="text-neutral-500 mt-1">
            Gerencie as visitas aos imóveis
          </p>
        </div>

        <button 
          onClick={() => setShowFormModal(true)}
          className="flex items-center gap-2 h-12 px-5 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
        >
          <RiAddLine className="w-5 h-5" />
          <span>Agendar Visita</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <RiCalendarLine className="w-5 h-5 text-neutral-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.total}</p>
              <p className="text-sm text-neutral-500">Total</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-500/20 flex items-center justify-center">
              <RiCalendarTodoLine className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.pending}</p>
              <p className="text-sm text-neutral-500">Pendentes</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
              <RiCalendarCheckLine className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.confirmed}</p>
              <p className="text-sm text-neutral-500">Confirmadas</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
              <RiTimeLine className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.today}</p>
              <p className="text-sm text-neutral-500">Hoje</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por imóvel, código ou cliente..."
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {([
            { value: "all", label: "Todas" },
            { value: "AGENDADA", label: "Agendadas" },
            { value: "CONFIRMADA", label: "Confirmadas" },
            { value: "REALIZADA", label: "Realizadas" },
            { value: "CANCELADA", label: "Canceladas" },
          ] as const).map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === f.value
                  ? "bg-blue-500 text-white"
                  : "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-blue-500"
              }`}
            >
              {f.label}
            </button>
          ))}
          <button
            onClick={() => setShowDateFilters(!showDateFilters)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
              startDate || endDate
                ? "bg-blue-500 text-white"
                : "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-blue-500"
            }`}
          >
            <RiFilterLine className="w-4 h-4" />
            Período
            {(startDate || endDate) && (
              <span className="w-2 h-2 rounded-full bg-white/80" />
            )}
          </button>
          <button
            onClick={() => setSortOrder(s => s === "asc" ? "desc" : "asc")}
            title={sortOrder === "asc" ? "Mais recentes primeiro" : "Mais antigas primeiro"}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-blue-500"
          >
            {sortOrder === "asc" ? <RiArrowUpLine className="w-4 h-4" /> : <RiArrowDownLine className="w-4 h-4" />}
            {sortOrder === "asc" ? "Mais antigas" : "Mais recentes"}
          </button>
        </div>
      </div>

      {/* Date Range Filters */}
      <AnimatePresence>
        {showDateFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-4">
              {/* Período */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
                  {[
                    { days: 7, label: "7d" },
                    { days: 30, label: "30d" },
                    { days: 60, label: "60d" },
                    { days: 90, label: "90d" },
                  ].map((p) => {
                    const from = new Date(Date.now() - p.days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
                    const isActive = startDate === from && endDate === today;
                    return (
                      <button
                        key={p.days}
                        onClick={() => { setStartDate(from); setEndDate(today); }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-white dark:bg-neutral-700 text-blue-500 shadow-sm"
                            : "text-neutral-500 hover:text-neutral-700"
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
                <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700" />
                <div className="flex items-center gap-2">
                  <label className="text-sm text-neutral-500 whitespace-nowrap">De:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-10 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-neutral-500 whitespace-nowrap">Até:</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-10 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
                  />
                </div>
              </div>

              {/* Filtros adicionais */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Corretor */}
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">
                    <RiUserLine className="inline w-3 h-3 mr-1" />
                    Corretor
                  </label>
                  <select
                    value={corretorFilter}
                    onChange={(e) => setCorretorFilter(e.target.value)}
                    className="w-full h-10 px-3 text-sm rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Todos</option>
                    {brokers.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                {/* Condomínio */}
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">
                    <RiBuildingLine className="inline w-3 h-3 mr-1" />
                    Condomínio
                  </label>
                  <select
                    value={condominiumFilter}
                    onChange={(e) => setCondominiumFilter(e.target.value)}
                    className="w-full h-10 px-3 text-sm rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Todos</option>
                    {condominiums.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Tipologia */}
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">
                    <RiHome4Line className="inline w-3 h-3 mr-1" />
                    Tipologia
                  </label>
                  <select
                    value={propertyTypeFilter}
                    onChange={(e) => setPropertyTypeFilter(e.target.value)}
                    className="w-full h-10 px-3 text-sm rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Todos</option>
                    <option value="CASA">Casa</option>
                    <option value="APARTAMENTO">Apartamento</option>
                    <option value="TERRENO">Terreno</option>
                    <option value="COMERCIAL">Comercial</option>
                    <option value="COBERTURA">Cobertura</option>
                    <option value="SOBRADO">Sobrado</option>
                  </select>
                </div>

                {/* Range de Valor */}
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">
                    <RiMoneyDollarCircleLine className="inline w-3 h-3 mr-1" />
                    Valor (R$)
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value.replace(/\D/g, ""))}
                      placeholder="Mín"
                      className="w-1/2 h-10 px-2 text-sm rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <input
                      type="text"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value.replace(/\D/g, ""))}
                      placeholder="Máx"
                      className="w-1/2 h-10 px-2 text-sm rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Limpar filtros */}
              {(startDate || endDate || corretorFilter || condominiumFilter || propertyTypeFilter || minPrice || maxPrice) && (
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setStartDate(""); setEndDate("");
                      setCorretorFilter(""); setCondominiumFilter("");
                      setPropertyTypeFilter(""); setMinPrice(""); setMaxPrice("");
                    }}
                    className="h-8 px-3 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center gap-1"
                  >
                    <RiCloseLine className="w-4 h-4" />
                    Limpar filtros
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visits List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <RiLoader4Line className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : filteredVisits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
            <RiCalendarLine className="w-10 h-10 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
            Nenhuma visita encontrada
          </h3>
          <p className="text-neutral-500 max-w-md">
            {search ? "Tente ajustar sua busca." : "Nenhuma visita agendada no momento."}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          {/* Table header */}
          <div className="hidden lg:grid grid-cols-[130px_90px_1fr_180px_140px_120px_auto] gap-2 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Data</span>
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Horário</span>
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Imóvel</span>
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Cliente</span>
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Corretor</span>
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Status</span>
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide text-right">Ações</span>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {sortedVisits.map((visit) => {
              const firstProp = getFirstProperty(visit);
              return (
                <div
                  key={visit.id}
                  className={`transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40 ${
                    visit.status === "CANCELADA" ? "opacity-55" : ""
                  } ${isToday(visit.date) ? "border-l-2 border-l-blue-500" : ""}`}
                >
                  {/* Main row */}
                  <div className="flex flex-col lg:grid lg:grid-cols-[130px_90px_1fr_180px_140px_120px_auto] lg:items-center gap-2 lg:gap-2 px-4 py-3">
                    {/* Data */}
                    <div>
                      {isToday(visit.date) && (
                        <span className="block text-[10px] font-bold text-blue-500 uppercase leading-tight">Hoje</span>
                      )}
                      <span className={`text-sm font-medium ${
                        isPast(visit.date) && visit.status !== "REALIZADA" && visit.status !== "CANCELADA"
                          ? "text-red-500"
                          : "text-neutral-900 dark:text-white"
                      }`}>
                        {formatDate(visit.date)}
                      </span>
                    </div>

                    {/* Horário */}
                    <div>
                      <span className="text-sm text-neutral-900 dark:text-white">{visit.time || "—"}</span>
                      {visit.endTime && <span className="text-xs text-neutral-400"> – {visit.endTime}</span>}
                    </div>

                    {/* Imóvel */}
                    <div className="min-w-0">
                      {visit.properties.length === 0 ? (
                        <span className="text-sm text-neutral-400">Sem imóvel</span>
                      ) : (
                        visit.properties.slice(0, 2).map((vp) => (
                          <div key={vp.property.id} className="flex items-center gap-1.5 truncate">
                            <span className="text-xs font-mono text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded flex-shrink-0">
                              {vp.property.code}
                            </span>
                            <span className="text-sm text-neutral-700 dark:text-neutral-300 truncate">{vp.property.title}</span>
                          </div>
                        ))
                      )}
                      {visit.properties.length > 2 && (
                        <span className="text-xs text-neutral-400">+{visit.properties.length - 2} imóvel(is)</span>
                      )}
                    </div>

                    {/* Cliente */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                        {getVisitorName(visit).charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-neutral-900 dark:text-white truncate leading-tight">
                          {getVisitorName(visit)}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {getVisitorPhone(visit) && (
                            <a
                              href={`https://wa.me/${getVisitorPhone(visit)!.replace(/\D/g, "")}`}
                              target="_blank"
                              className="text-green-500 hover:text-green-600"
                            >
                              <RiWhatsappLine className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {getVisitorEmail(visit) && (
                            <a
                              href={`mailto:${getVisitorEmail(visit)}`}
                              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                            >
                              <RiMailLine className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Corretor */}
                    <div>
                      <span className="text-sm text-neutral-600 dark:text-neutral-400 truncate block">
                        {visit.corretor?.name || "—"}
                      </span>
                    </div>

                    {/* Status */}
                    <div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-lg ${statusColors[visit.status] || "bg-neutral-100 text-neutral-600"}`}>
                        {statusMap[visit.status] || visit.status}
                      </span>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-1 justify-end flex-shrink-0">
                      {visit.status !== "CANCELADA" && visit.status !== "REALIZADA" && (
                        <button
                          onClick={() => setEditVisit(visit)}
                          title="Editar"
                          className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 transition-colors"
                        >
                          <RiEditLine className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {visit.status === "AGENDADA" && (
                        <button
                          onClick={() => handleConfirm(visit.id)}
                          title="Confirmar"
                          className="p-1.5 rounded-lg bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-500/20 border border-green-200 dark:border-green-500/30 transition-colors"
                        >
                          <RiCheckLine className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {(visit.status === "AGENDADA" || visit.status === "CONFIRMADA") && (
                        <button
                          onClick={() => handleComplete(visit.id)}
                          title="Marcar como realizada"
                          className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 transition-colors"
                        >
                          <RiCalendarCheckLine className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {visit.status !== "CANCELADA" && visit.status !== "REALIZADA" && (
                        <button
                          onClick={() => handleCancel(visit)}
                          title="Cancelar"
                          className="p-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/30 transition-colors"
                        >
                          <RiCloseLine className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expandable extras: cancel reason, notes, feedback */}
                  {(visit.status === "CANCELADA" && visit.cancelReason) || visit.notes || visit.properties.some(vp => vp.feedback || vp.liked !== null) ? (
                    <div className="px-4 pb-3 space-y-2">
                      {visit.status === "CANCELADA" && visit.cancelReason && (
                        <div className="p-2 bg-red-50 dark:bg-red-500/10 rounded-lg border border-red-200 dark:border-red-500/20">
                          <p className="text-xs font-medium text-red-700 dark:text-red-400">
                            Cancelamento: {CANCEL_REASONS.find(r => r.value === visit.cancelReason)?.label || visit.cancelReason}
                            {visit.cancelNotes && ` — ${visit.cancelNotes}`}
                          </p>
                        </div>
                      )}
                      {visit.notes && (
                        <p className="text-xs text-neutral-500">
                          <span className="font-medium text-neutral-700 dark:text-neutral-300">Obs:</span> {visit.notes}
                        </p>
                      )}
                      {visit.properties.some(vp => vp.feedback || vp.liked !== null) && (
                        <div className="flex flex-wrap gap-2">
                          {visit.properties.filter(vp => vp.feedback || vp.liked !== null).map((vp) => (
                            <div key={vp.property.id} className="flex items-center gap-1.5 text-xs bg-neutral-50 dark:bg-neutral-800 px-2 py-1 rounded-lg">
                              <span className="font-mono text-neutral-500">{vp.property.code}</span>
                              {vp.liked === true && <span className="text-green-600">👍</span>}
                              {vp.liked === false && <span className="text-red-500">👎</span>}
                              {vp.feedback && <span className="text-neutral-600 dark:text-neutral-400">{vp.feedback}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Footer count */}
          <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
            <p className="text-xs text-neutral-500">
              Exibindo {sortedVisits.length} de {totalCount} visitas
            </p>
          </div>
        </div>
      )}

      {/* Schedule Visit Modal */}
      <ScheduleVisitModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSuccess={fetchVisits}
        context="property"
      />

      {/* Edit Visit Modal */}
      <AnimatePresence>
        {editVisit && (
          <EditVisitModal
            visit={editVisit}
            onClose={() => setEditVisit(null)}
            onSaved={() => { setEditVisit(null); fetchVisits(); }}
          />
        )}
      </AnimatePresence>

      {/* Cancel Visit Modal */}
      <AnimatePresence>
        {cancelVisit && (
          <CancelVisitModal
            visit={cancelVisit}
            onClose={() => setCancelVisit(null)}
            onConfirm={handleCancelConfirm}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── EditVisitModal ──────────────────────────────────────────────
function EditVisitModal({ visit, onClose, onSaved }: { visit: Visit; onClose: () => void; onSaved: () => void }) {
  const [date, setDate] = useState(visit.date?.split("T")[0] || "");
  const [time, setTime] = useState(visit.time || "");
  const [endTime, setEndTime] = useState(visit.endTime || "");
  const [notes, setNotes] = useState(visit.notes || "");
  const [internalNotes, setInternalNotes] = useState(visit.internalNotes || "");
  const [properties, setProperties] = useState(visit.properties.map((vp) => vp.property));
  const [propertySearch, setPropertySearch] = useState("");
  const [propertyResults, setPropertyResults] = useState<any[]>([]);
  const [searchingProps, setSearchingProps] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Search properties
  useEffect(() => {
    if (!propertySearch || propertySearch.length < 2) {
      setPropertyResults([]);
      return;
    }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setSearchingProps(true);
      try {
        const res = await fetch(`/api/properties?search=${encodeURIComponent(propertySearch)}&limit=10`);
        if (res.ok) {
          const data = await res.json();
          const existingIds = new Set(properties.map((p) => p.id));
          setPropertyResults((data.properties || []).filter((p: any) => !existingIds.has(p.id)));
        }
      } catch {}
      setSearchingProps(false);
    }, 300);
  }, [propertySearch, properties]);

  const addProperty = (prop: any) => {
    setProperties((prev) => [...prev, { id: prop.id, code: prop.code, title: prop.title, address: prop.address || "", neighborhood: prop.neighborhood || "", city: prop.city || "", thumbnail: prop.thumbnail || null }]);
    setPropertySearch("");
    setPropertyResults([]);
  };

  const removeProperty = (propId: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== propId));
  };

  const handleSave = async () => {
    if (!date || !time) { setError("Data e horário são obrigatórios"); return; }
    if (properties.length === 0) { setError("Selecione pelo menos um imóvel"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/scheduled-visits/${visit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          time,
          endTime: endTime || null,
          notes,
          internalNotes,
          propertyIds: properties.map((p) => p.id),
        }),
      });
      if (res.ok) {
        onSaved();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Erro ao salvar");
      }
    } catch {
      setError("Erro ao salvar visita");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <RiEditLine className="w-5 h-5 text-blue-500" />
            Editar Visita
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <RiCloseLine className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Cliente da visita */}
          <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-500/20">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {(visit.lead?.name || visit.visitorName || "V").charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm text-neutral-900 dark:text-white truncate">
                {visit.lead?.name || visit.visitorName || "Visitante"}
              </p>
              <p className="text-xs text-neutral-500 truncate">
                {visit.lead?.phone || visit.visitorPhone || visit.lead?.email || visit.visitorEmail || ""}
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-200 dark:border-red-500/20">
              {error}
            </div>
          )}

          {/* Data e Horário */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Data</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full h-10 px-3 text-sm rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Início</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                className="w-full h-10 px-3 text-sm rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Fim</label>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                className="w-full h-10 px-3 text-sm rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
          </div>

          {/* Imóveis */}
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">
              Imóveis ({properties.length})
            </label>
            <div className="space-y-2">
              {properties.map((prop) => (
                <div key={prop.id} className="flex items-center gap-2 p-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-700 flex-shrink-0">
                    {prop.thumbnail ? (
                      <img src={prop.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><RiHome4Line className="w-4 h-4 text-neutral-400" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{prop.code} - {prop.title}</p>
                    <p className="text-xs text-neutral-500 truncate">{prop.neighborhood}, {prop.city}</p>
                  </div>
                  <button onClick={() => removeProperty(prop.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500">
                    <RiDeleteBinLine className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Search to add */}
              <div className="relative">
                <div className="relative">
                  <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    value={propertySearch}
                    onChange={(e) => setPropertySearch(e.target.value)}
                    placeholder="Buscar imóvel para adicionar..."
                    className="w-full h-10 pl-9 pr-3 text-sm rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                {propertyResults.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-lg max-h-40 overflow-y-auto">
                    {propertyResults.map((prop: any) => (
                      <button
                        key={prop.id}
                        onClick={() => addProperty(prop)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700 border-b last:border-0 border-neutral-100 dark:border-neutral-700"
                      >
                        <span className="text-xs font-mono text-neutral-500">{prop.code}</span>
                        <span className="text-sm text-neutral-900 dark:text-white truncate">{prop.title}</span>
                      </button>
                    ))}
                  </div>
                )}
                {searchingProps && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <RiLoader4Line className="w-4 h-4 text-blue-500 animate-spin" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Observações</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
              placeholder="Observações visíveis para o cliente"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Notas internas</label>
            <textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
              placeholder="Notas internas (não visíveis para o cliente)"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-neutral-200 dark:border-neutral-800">
          <button onClick={onClose} className="h-10 px-4 text-sm font-medium rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-10 px-5 text-sm font-medium rounded-xl bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {saving ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiSaveLine className="w-4 h-4" />}
            Salvar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── CancelVisitModal ──────────────────────────────────────────────
const CANCEL_REASONS = [
  { value: "CLIENTE_DESISTIU", label: "Cliente desistiu" },
  { value: "PROPRIETARIO_CANCELOU", label: "Proprietário cancelou" },
  { value: "IMOVEL_VENDIDO", label: "Imóvel vendido/alugado" },
  { value: "MUDANCA_DATA", label: "Mudança de data" },
  { value: "OUTRO", label: "Outro motivo" },
];

function CancelVisitModal({
  visit,
  onClose,
  onConfirm,
}: {
  visit: Visit;
  onClose: () => void;
  onConfirm: (id: string, cancelReason: string, cancelNotes: string) => Promise<void>;
}) {
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const clientName = visit.lead?.name || visit.visitorName || "Visitante";
  const visitDate = new Date(visit.date);

  const handleSubmit = async () => {
    if (!reason) return;
    setSaving(true);
    try {
      await onConfirm(visit.id, reason, notes);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-800 bg-red-50 dark:bg-red-500/10">
          <h2 className="text-lg font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
            <RiCalendarCloseLine className="w-5 h-5" />
            Cancelar Visita
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20">
            <RiCloseLine className="w-5 h-5 text-red-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Visit info */}
          <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {clientName.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm text-neutral-900 dark:text-white truncate">{clientName}</p>
              <p className="text-xs text-neutral-500">
                {visitDate.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short", timeZone: "UTC" })}
                {visit.time && ` às ${visit.time}`}
                {" · "}
                {visit.properties.map((vp) => vp.property.code).join(", ")}
              </p>
            </div>
          </div>

          {/* Motivo do cancelamento */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Motivo do cancelamento <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {CANCEL_REASONS.map((r) => (
                <label
                  key={r.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    reason === r.value
                      ? "border-red-500 bg-red-50 dark:bg-red-500/10 dark:border-red-500/50"
                      : "border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  }`}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-4 h-4 text-red-500 border-neutral-300 focus:ring-red-500"
                  />
                  <span className="text-sm text-neutral-900 dark:text-white">{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Observações adicionais */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Observações adicionais
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Detalhes sobre o cancelamento..."
              className="w-full px-3 py-2 text-sm rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/30 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-neutral-200 dark:border-neutral-800">
          <button onClick={onClose} className="h-10 px-4 text-sm font-medium rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            Voltar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason || saving}
            className="h-10 px-5 text-sm font-medium rounded-xl bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {saving ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiCloseLine className="w-4 h-4" />}
            Confirmar Cancelamento
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
