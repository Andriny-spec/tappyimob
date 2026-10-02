"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  RiTimeLine,
  RiArrowLeftLine,
  RiSearchLine,
  RiPhoneLine,
  RiMailLine,
  RiWhatsappLine,
  RiHome4Line,
  RiFileTextLine,
  RiMoneyDollarCircleLine,
  RiCheckLine,
  RiCloseLine,
  RiUserLine,
  RiArrowRightLine,
  RiUserAddLine,
  RiInboxArchiveLine,
  RiLoader4Line,
  RiRefreshLine,
  RiFilterLine,
  RiEyeLine,
} from "react-icons/ri";
import { LeadDetailModal } from "@/components/admin/kanban/modals/LeadDetailModal";

interface TimelineEvent {
  id: string;
  type: string;
  description: string;
  date: string;
  lead: { id: string; name: string; phone?: string; email?: string; source?: string } | null;
  metadata?: any;
}

const eventTypeConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  status_change: { icon: RiArrowRightLine, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  call: { icon: RiPhoneLine, color: "text-green-500", bgColor: "bg-green-500/10" },
  email: { icon: RiMailLine, color: "text-purple-500", bgColor: "bg-purple-500/10" },
  whatsapp: { icon: RiWhatsappLine, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
  visit: { icon: RiHome4Line, color: "text-orange-500", bgColor: "bg-orange-500/10" },
  note: { icon: RiFileTextLine, color: "text-neutral-500", bgColor: "bg-neutral-500/10" },
  proposal: { icon: RiMoneyDollarCircleLine, color: "text-amber-500", bgColor: "bg-amber-500/10" },
  new_lead: { icon: RiUserLine, color: "text-cyan-500", bgColor: "bg-cyan-500/10" },
  contract: { icon: RiCheckLine, color: "text-green-500", bgColor: "bg-green-500/10" },
  lost: { icon: RiCloseLine, color: "text-red-500", bgColor: "bg-red-500/10" },
  created: { icon: RiUserAddLine, color: "text-cyan-500", bgColor: "bg-cyan-500/10" },
  archived: { icon: RiInboxArchiveLine, color: "text-neutral-500", bgColor: "bg-neutral-500/10" },
  unarchived: { icon: RiRefreshLine, color: "text-green-500", bgColor: "bg-green-500/10" },
};

const filterOptions = [
  { value: "all", label: "Todos" },
  { value: "status_change", label: "Mudanças de status" },
  { value: "created", label: "Novos leads" },
  { value: "note", label: "Observações" },
  { value: "archived", label: "Arquivados" },
  { value: "call", label: "Ligações" },
  { value: "email", label: "E-mails" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "visit", label: "Visitas" },
  { value: "proposal", label: "Propostas" },
  { value: "contract", label: "Contratos" },
];

export default function HistoricoPage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [filter, setFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [corretorFilter, setCorretorFilter] = useState("");
  const [brokers, setBrokers] = useState<{id: string; name: string}[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<any>(null);

  // Fetch brokers for filter
  useEffect(() => {
    fetch("/api/admin/brokers").then(r => r.ok ? r.json() : null).then(d => {
      if (d?.brokers) setBrokers(d.brokers);
    }).catch(() => {});
  }, []);

  // Fetch lead detail when selected
  useEffect(() => {
    if (!selectedLeadId) { setSelectedLead(null); return; }
    fetch(`/api/admin/leads/${selectedLeadId}`).then(r => r.ok ? r.json() : null).then(d => {
      if (d) setSelectedLead(d);
    }).catch(() => {});
  }, [selectedLeadId]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch real data from API
  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", "200");
      if (searchDebounced) params.set("search", searchDebounced);
      if (filter !== "all") params.set("type", filter);
      if (corretorFilter) params.set("corretorId", corretorFilter);

      const res = await fetch(`/api/admin/leads/activities?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        let timeline: TimelineEvent[] = data.timeline || [];
        
        // Filter by date range client-side
        if (dateRange.start) {
          const from = new Date(dateRange.start);
          timeline = timeline.filter((e: TimelineEvent) => new Date(e.date) >= from);
        }
        if (dateRange.end) {
          const to = new Date(dateRange.end);
          to.setHours(23, 59, 59, 999);
          timeline = timeline.filter((e: TimelineEvent) => new Date(e.date) <= to);
        }

        setEvents(timeline);
      }
    } catch (error) {
      console.error("Erro ao buscar atividades:", error);
    } finally {
      setLoading(false);
    }
  }, [searchDebounced, filter, dateRange.start, dateRange.end, corretorFilter]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const filteredEvents = events;

  const formatDate = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return `Hoje, ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
    }
    if (d.toDateString() === yesterday.toDateString()) {
      return `Ontem, ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
    }
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const groupEventsByDate = (evts: TimelineEvent[]) => {
    const groups: Record<string, TimelineEvent[]> = {};
    evts.forEach((event) => {
      const date = new Date(event.date).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(event);
    });
    return groups;
  };

  const groupedEvents = groupEventsByDate(filteredEvents);

  const formatGroupDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hoje";
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return "Ontem";
    }
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    });
  };

  // Stats
  const stats = {
    total: events.length,
    statusChanges: events.filter((e: TimelineEvent) => e.type === "status_change").length,
    notes: events.filter((e: TimelineEvent) => e.type === "note").length,
    newLeads: events.filter((e: TimelineEvent) => e.type === "created").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/clientes"
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
          >
            <RiArrowLeftLine className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                <RiTimeLine className="w-5 h-5 text-green-500" />
              </div>
              Histórico de Atividades
            </h1>
            <p className="text-neutral-500 mt-1">
              Acompanhe todas as interações com seus clientes
            </p>
          </div>
        </div>

        <button
          onClick={fetchActivities}
          className="flex items-center gap-2 h-10 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        >
          <RiRefreshLine className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <p className="text-3xl font-bold text-neutral-900 dark:text-white">{stats.total}</p>
          <p className="text-sm text-neutral-500">Total de atividades</p>
        </div>
        <div className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <p className="text-3xl font-bold text-blue-500">{stats.statusChanges}</p>
          <p className="text-sm text-neutral-500">Mudanças de status</p>
        </div>
        <div className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <p className="text-3xl font-bold text-neutral-500">{stats.notes}</p>
          <p className="text-sm text-neutral-500">Observações</p>
        </div>
        <div className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <p className="text-3xl font-bold text-cyan-500">{stats.newLeads}</p>
          <p className="text-sm text-neutral-500">Novos leads</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por lead ou atividade..."
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-12 px-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
        >
          {filterOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={corretorFilter}
          onChange={(e) => setCorretorFilter(e.target.value)}
          className="h-12 px-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
        >
          <option value="">Todos os corretores</option>
          {brokers.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="h-12 px-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
          />
          <span className="text-neutral-500">até</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="h-12 px-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RiLoader4Line className="w-8 h-8 text-green-500 animate-spin" />
          </div>
        ) : Object.keys(groupedEvents).length === 0 ? (
          <div className="text-center py-12">
            <RiTimeLine className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
              Nenhuma atividade encontrada
            </h3>
            <p className="text-neutral-500">
              Tente ajustar os filtros de busca
            </p>
          </div>
        ) : (
          Object.entries(groupedEvents).map(([date, dayEvents]) => (
            <div key={date}>
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">
                {formatGroupDate(date)}
              </h3>

              <div className="space-y-4">
                {dayEvents.map((event: TimelineEvent, i: number) => {
                  const config = eventTypeConfig[event.type];
                  const Icon = config?.icon || RiTimeLine;

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex gap-4"
                    >
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-xl ${config?.bgColor || "bg-neutral-500/10"} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${config?.color || "text-neutral-500"}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-white">
                              {event.description}
                            </p>
                            {event.lead && (
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-neutral-500">
                                  {event.lead.name}
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-neutral-500 whitespace-nowrap">
                            {formatDate(event.date)}
                          </span>
                        </div>

                        {/* Metadata details */}
                        {event.metadata && typeof event.metadata === "object" && event.metadata.content && (
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 line-clamp-2">
                            {event.metadata.content}
                          </p>
                        )}

                        {/* Actions */}
                        {event.lead && (
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                            <button
                              onClick={() => setSelectedLeadId(event.lead!.id)}
                              className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium"
                            >
                              <RiEyeLine className="w-4 h-4" />
                              Ver lead
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          isOpen={!!selectedLead}
          onClose={() => { setSelectedLeadId(null); setSelectedLead(null); }}
          isAdmin={true}
        />
      )}
    </div>
  );
}
