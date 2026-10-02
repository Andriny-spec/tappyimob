"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  RiSearchLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiFilterLine,
  RiCloseLine,
  RiPhoneLine,
  RiMailLine,
  RiWhatsappLine,
  RiCalendarLine,
  RiUserLine,
  RiHome4Line,
  RiTimeLine,
  RiStarLine,
  RiLoader4Line,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCheckboxCircleLine,
  RiCheckboxBlankCircleLine,
  RiMoreLine,
  RiEyeLine,
  RiEditLine,
  RiDeleteBinLine,
  RiDownload2Line,
  RiAlertLine,
  RiCheckLine,
} from "react-icons/ri";
import { Lead, leadTicketLabels, leadSourceLabels, leadTemperatureColors, leadTemperatureLabels, leadTicketColors } from "@/types/lead";
import { useFollowUpDays } from "@/hooks/useFollowUpDays";
import { LeadDetailModal } from "./modals/LeadDetailModal";
import type { KanbanFilters } from "./KanbanBoard";

interface KanbanColumnInfo {
  id: string;
  title: string;
  status: string;
  color: string;
}

type SortField = "name" | "status" | "source" | "createdAt" | "lastContact" | "corretor" | "ticket" | "ticketValue" | "updatedAt";
type SortOrder = "asc" | "desc";

interface CorretorOption {
  id: string;
  name: string;
}

interface FilterOptions {
  search: string;
  status: string[];
  source: string[];
  dateFrom: string;
  dateTo: string;
  corretorId: string;
  hasProperty: boolean | null;
}

const defaultFilters: FilterOptions = {
  search: "",
  status: [],
  source: [],
  dateFrom: "",
  dateTo: "",
  corretorId: "",
  hasProperty: null,
};

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  NOVO: { label: "Novo", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-500/20" },
  CONTATADO: { label: "Contatado", color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-500/20" },
  QUALIFICADO: { label: "Qualificado", color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-500/20" },
  NEGOCIANDO: { label: "Negociando", color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-500/20" },
  FECHADO: { label: "Fechado", color: "text-green-600", bg: "bg-green-100 dark:bg-green-500/20" },
  PERDIDO: { label: "Perdido", color: "text-neutral-600", bg: "bg-neutral-100 dark:bg-neutral-500/20" },
};

const sourceLabels = leadSourceLabels;

interface LeadsTableProps {
  externalFilters?: KanbanFilters;
  isAdmin?: boolean;
  corretorId?: string;
}

export function LeadsTable({ externalFilters, isAdmin = false, corretorId }: LeadsTableProps) {
  const { days: followUpDays } = useFollowUpDays();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [detailModal, setDetailModal] = useState<{ open: boolean; lead: Lead | null }>({
    open: false,
    lead: null,
  });
  const [kanbanColumns, setKanbanColumns] = useState<KanbanColumnInfo[]>([]);
  const [corretoresList, setCorretoresList] = useState<CorretorOption[]>([]);
  const [limit, setLimit] = useState(25);
  const [sourceSearch, setSourceSearch] = useState("");
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);

  // Reset page when external filters change
  useEffect(() => {
    setPage(1);
  }, [externalFilters]);

  // Fetch kanban columns and corretores
  useEffect(() => {
    fetch("/api/admin/leads/columns")
      .then(res => res.json())
      .then(data => setKanbanColumns(data.columns || []))
      .catch(() => {});
    fetch("/api/admin/corretores")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCorretoresList(data.map((c: any) => ({ id: c.id, name: c.name })));
        }
      })
      .catch(() => {});
  }, []);

  // Helper: get column color by lead status
  const getColumnColor = (status: string) => {
    const col = kanbanColumns.find(c => c.status === status);
    return col?.color || "#6b7280";
  };

  const getColumnTitle = (status: string) => {
    const col = kanbanColumns.find(c => c.status === status);
    return col?.title || status;
  };

  // Helper: check if lead is overdue based on dynamic follow-up days
  const isLeadOverdue = (lead: Lead) => {
    if (lead.status === "FECHADO" || lead.status === "PERDIDO" || lead.status === "ARQUIVADO") return false;
    const contactDate = lead.lastContact || lead.createdAt;
    if (!contactDate) return true;
    const diffDays = Math.ceil((Date.now() - new Date(contactDate).getTime()) / (1000 * 60 * 60 * 24));
    const temp = ((lead as any).temperature || "MORNO") as "QUENTE" | "MORNO" | "FRIO";
    const maxDays = followUpDays[temp];
    return diffDays > maxDays;
  };

  // Fetch leads
  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", page.toString());
        params.set("limit", limit.toString());
        
        // Internal search
        if (filters.search) params.set("search", filters.search);
        // External search (from AdvancedFiltersPanel)
        if (!filters.search && externalFilters?.search) params.set("search", externalFilters.search);

        // Corretor filter
        if (!isAdmin && corretorId) {
          params.set("corretorId", corretorId);
        } else if (filters.corretorId) {
          if (filters.corretorId === "__none__") {
            params.set("hasCorretor", "false");
          } else {
            params.set("corretorId", filters.corretorId);
          }
        } else if (externalFilters?.corretor) {
          // External corretor name filter → server-side
          params.set("corretorName", externalFilters.corretor);
        }

        // External hasCorretor
        if (externalFilters?.hasCorretor === true) params.set("hasCorretor", "true");
        if (externalFilters?.hasCorretor === false) params.set("hasCorretor", "false");

        // Status filters (internal)
        filters.status.forEach(s => params.append("statusIn", s));
        // Status filters (external, merge)
        if (externalFilters?.status && externalFilters.status.length > 0 && filters.status.length === 0) {
          externalFilters.status.forEach(s => params.append("statusIn", s));
        }

        // Source filters (external)
        if (externalFilters?.sources && externalFilters.sources.length > 0) {
          externalFilters.sources.forEach(s => params.append("sourceIn", s));
        }

        // Temperature filters (external)
        if (externalFilters?.temperature && externalFilters.temperature.length > 0) {
          externalFilters.temperature.forEach(t => params.append("temperatureIn", t));
        }

        // Excluir ARQUIVADO no servidor para paginação correta
        if (filters.status.length === 0 && (!externalFilters?.status || externalFilters.status.length === 0)) {
          params.append("excludeStatus", "ARQUIVADO");
        }

        // Tags (external)
        if (externalFilters?.tags && externalFilters.tags.length > 0) {
          externalFilters.tags.forEach(t => params.append("tags", t));
        }

        // Overdue (external)
        if (externalFilters?.overdue === true) params.set("overdue", "true");

        // Date range (external)
        if (externalFilters?.dateFrom) params.set("dateFrom", externalFilters.dateFrom);
        if (externalFilters?.dateTo) params.set("dateTo", externalFilters.dateTo);

        const res = await fetch(`/api/admin/leads?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setLeads(data.leads || []);
          setTotalPages(data.pagination?.totalPages || 1);
          setTotal(data.pagination?.total || 0);
        }
      } catch (error) {
        console.error("Erro ao buscar leads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [page, limit, filters.search, filters.status, filters.corretorId, externalFilters]);

  // Sort leads
  const sortedLeads = useMemo(() => {
    return [...leads].sort((a, b) => {
      let aVal: any, bVal: any;

      switch (sortField) {
        case "name":
          aVal = a.name?.toLowerCase() || "";
          bVal = b.name?.toLowerCase() || "";
          break;
        case "status":
          aVal = a.status;
          bVal = b.status;
          break;
        case "source":
          aVal = a.source || "";
          bVal = b.source || "";
          break;
        case "ticket":
          aVal = (a as any).ticket || "";
          bVal = (b as any).ticket || "";
          break;
        case "ticketValue":
          // Valor do ticket em R$ — usa budget; cai para max/minBudget
          aVal = (a as any).budget ?? (a as any).maxBudget ?? (a as any).minBudget ?? 0;
          bVal = (b as any).budget ?? (b as any).maxBudget ?? (b as any).minBudget ?? 0;
          break;
        case "createdAt":
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        case "lastContact":
          aVal = a.lastContact ? new Date(a.lastContact).getTime() : 0;
          bVal = b.lastContact ? new Date(b.lastContact).getTime() : 0;
          break;
        case "corretor":
          aVal = a.corretor?.name?.toLowerCase() || "";
          bVal = b.corretor?.name?.toLowerCase() || "";
          break;
        case "updatedAt":
          aVal = new Date((a as any).updatedAt || a.createdAt).getTime();
          bVal = new Date((b as any).updatedAt || b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [leads, sortField, sortOrder]);

  // Filter leads locally (internal + external filters)
  const filteredLeads = useMemo(() => {
    return sortedLeads.filter(lead => {
      // Source filter (internal)
      if (filters.source.length > 0 && !filters.source.includes(lead.source || "")) {
        return false;
      }
      // Date filter (internal)
      if (filters.dateFrom) {
        const leadDate = new Date(lead.createdAt);
        const fromDate = new Date(filters.dateFrom);
        if (leadDate < fromDate) return false;
      }
      if (filters.dateTo) {
        const leadDate = new Date(lead.createdAt);
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59);
        if (leadDate > toDate) return false;
      }
      // Corretor filter by ID
      if (filters.corretorId === "__none__" && lead.corretorId) return false;
      if (filters.corretorId && filters.corretorId !== "__none__" && lead.corretorId !== filters.corretorId) return false;
      // Has property filter (internal)
      if (filters.hasProperty === true && !lead.propertyId) return false;
      if (filters.hasProperty === false && lead.propertyId) return false;

      // ===== External (advanced panel) filters =====
      if (externalFilters) {
        const ef = externalFilters;
        // Search
        if (ef.search) {
          const s = ef.search.toLowerCase();
          if (!(lead.name?.toLowerCase().includes(s) || lead.email?.toLowerCase().includes(s) || lead.phone?.includes(s))) return false;
        }
        // Name
        if (ef.name && !lead.name?.toLowerCase().includes(ef.name.toLowerCase())) return false;
        // Phone
        if (ef.phone && !lead.phone?.includes(ef.phone)) return false;
        // Temperature
        if (ef.temperature && ef.temperature.length > 0 && !ef.temperature.includes(lead.temperature || "MORNO")) return false;
        // Status
        if (ef.status && ef.status.length > 0 && !ef.status.includes(lead.status)) return false;
        // Sources
        if (ef.sources && ef.sources.length > 0 && !ef.sources.includes(lead.source || "")) return false;
        // Tags
        if (ef.tags && ef.tags.length > 0) {
          if (!lead.tags?.some((t: any) => ef.tags!.includes(typeof t === "string" ? t : t.name))) return false;
        }
        // Profiles
        if (ef.profiles && ef.profiles.length > 0 && !ef.profiles.includes((lead as any).profile || "")) return false;
        // Tickets (finalidade)
        if (ef.tickets && ef.tickets.length > 0 && !ef.tickets.includes((lead as any).ticket || "")) return false;
        // Corretor name
        if (ef.corretor && !lead.corretor?.name?.toLowerCase().includes(ef.corretor.toLowerCase())) return false;
        // Has property (external)
        if (ef.hasProperty === true && !lead.property) return false;
        if (ef.hasProperty === false && lead.property) return false;
        // Has corretor (external)
        if (ef.hasCorretor === true && !lead.corretorId) return false;
        if (ef.hasCorretor === false && lead.corretorId) return false;
        // Permuta
        if (ef.hasPermuta === true && !(lead as any).hasPermuta) return false;
        if (ef.hasPermuta === false && (lead as any).hasPermuta) return false;
        // Ticket value
        if (ef.ticketMin && ef.ticketMin > 0 && (lead.maxBudget || 0) < ef.ticketMin) return false;
        if (ef.ticketMax && ef.ticketMax > 0 && (lead.minBudget || Infinity) > ef.ticketMax) return false;
        // Condominium (texto legado)
        if (ef.condominium) {
          const cond = ef.condominium.toLowerCase();
          if (!(lead as any).condominiumsOfInterest?.some((c: any) => (typeof c === "string" ? c : c.name || "").toLowerCase().includes(cond))) return false;
        }
        // Condominiums (multi-select, match ANY)
        if (ef.condominiums && ef.condominiums.length > 0) {
          const condSet = ef.condominiums.map((c: string) => c.toLowerCase());
          const leadConds = (lead as any).condominiumsOfInterest || [];
          const hasMatch = leadConds.some((c: any) => {
            const val = (typeof c === "string" ? c : c.name || "").toLowerCase();
            return condSet.some((cs: string) => val.includes(cs));
          });
          if (!hasMatch) return false;
        }
        // Date from (external)
        if (ef.dateFrom && new Date(lead.createdAt) < new Date(ef.dateFrom)) return false;
        // Date to (external)
        if (ef.dateTo && new Date(lead.createdAt) > new Date(ef.dateTo + "T23:59:59")) return false;
        // Overdue
        if (ef.overdue === true) {
          const contactDate = lead.lastContact || (lead as any).lastContactAt || lead.createdAt;
          if (contactDate && (Date.now() - new Date(contactDate).getTime()) / (1000 * 60 * 60) <= 48) return false;
        } else if (ef.overdue === false) {
          const contactDate = lead.lastContact || (lead as any).lastContactAt || lead.createdAt;
          if (!contactDate || (Date.now() - new Date(contactDate).getTime()) / (1000 * 60 * 60) > 48) return false;
        }
      }
      
      return true;
    });
  }, [sortedLeads, filters.source, filters.dateFrom, filters.dateTo, filters.corretorId, filters.hasProperty, externalFilters]);

  // Export CSV (admin only)
  const [exporting, setExporting] = useState(false);
  const handleExportCSV = async () => {
    if (!isAdmin || exporting) return;
    setExporting(true);
    try {
      // Buscar observações de todos os leads filtrados
      const leadIds = filteredLeads.map((l) => l.id);
      let notesMap: Record<string, string> = {};
      if (leadIds.length > 0) {
        try {
          const res = await fetch("/api/admin/leads/export-notes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ leadIds }),
          });
          if (res.ok) {
            const data = await res.json();
            notesMap = data.notesMap || {};
          }
        } catch {}
      }

      const rows = filteredLeads.map((lead) => ({
        Nome: lead.name || "",
        Email: lead.email || "",
        Telefone: lead.phone || "",
        CPF: (lead as any).cpf || "",
        Status: lead.status || "",
        Origem: sourceLabels[lead.source || ""] || lead.source || "",
        Finalidade: (lead as any).ticket || "",
        Temperatura: (lead as any).temperature || "",
        Corretor: lead.corretor?.name || "",
        "Observações": (notesMap[lead.id] || "").replace(/"/g, "'"),
        "Criado em": lead.createdAt ? new Date(lead.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "",
        "Atualizado em": (lead as any).updatedAt ? new Date((lead as any).updatedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "",
      }));
      const headers = Object.keys(rows[0] || {});
      const csv = [
        headers.join(";"),
        ...rows.map((r) => headers.map((h) => `"${(r as any)[h] || ""}"`).join(";")),
      ].join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const toggleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map(l => l.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedLeads(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const handleBulkDelete = async () => {
    if (selectedLeads.length === 0) return;
    if (!confirm(`Tem certeza que deseja EXCLUIR PERMANENTEMENTE ${selectedLeads.length} lead(s)? Esta ação NÃO pode ser desfeita!`)) return;
    setBulkLoading(true);
    try {
      const res = await fetch("/api/admin/leads/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedLeads }),
      });
      if (res.ok) {
        const data = await res.json();
        alert(`${data.deleted} lead(s) excluído(s) com sucesso`);
        setSelectedLeads([]);
        // Re-fetch leads
        setPage(1);
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao excluir leads");
      }
    } catch (error) {
      console.error("Erro ao excluir leads:", error);
      alert("Erro ao excluir leads");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkMove = async (targetStatus: string) => {
    if (selectedLeads.length === 0) return;
    setBulkLoading(true);
    try {
      const res = await fetch("/api/admin/leads/bulk-move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedLeads, status: targetStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        alert(`${data.moved || selectedLeads.length} lead(s) movido(s) com sucesso`);
        setSelectedLeads([]);
        setShowMoveMenu(false);
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao mover leads");
      }
    } catch (error) {
      console.error("Erro ao mover leads:", error);
      alert("Erro ao mover leads");
    } finally {
      setBulkLoading(false);
    }
  };

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatPhone = (phone: string | null | undefined) => {
    if (!phone) return "-";
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? (
      <RiArrowUpLine className="w-3 h-3" />
    ) : (
      <RiArrowDownLine className="w-3 h-3" />
    );
  };

  const sourceOptions = useMemo(() => [
    { group: "Portais Imobiliários", items: [
      { value: "IMOVELWEB", label: "Imóvel Web" }, { value: "ZAP_IMOVEIS", label: "ZAP Imóveis" },
      { value: "OLX", label: "OLX" }, { value: "CHAVES_NA_MAO", label: "Chaves na Mão" },
      { value: "MERCADO_LIVRE", label: "Mercado Livre" }, { value: "VIVA_REAL", label: "Viva Real" },
      { value: "ATTRIA", label: "Attria" }, { value: "PORTAIS", label: "Portais (outros)" },
    ]},
    { group: "Redes Sociais", items: [
      { value: "INSTAGRAM_TAPPY_ORGANICO", label: "Instagram Tappy (Orgânico)" },
      { value: "INSTAGRAM_TAPPY_ADS", label: "Instagram Tappy (Ads)" },
      { value: "INSTAGRAM_PESSOAL_ORGANICO", label: "Instagram Pessoal (Orgânico)" },
      { value: "INSTAGRAM_PESSOAL_ADS", label: "Instagram Pessoal (Ads)" },
      { value: "FACEBOOK_GROUPS", label: "Facebook Groups" },
      { value: "INSTAGRAM", label: "Instagram" }, { value: "FACEBOOK", label: "Facebook" },
      { value: "TIKTOK", label: "TikTok" }, { value: "YOUTUBE", label: "YouTube" },
      { value: "REDES_SOCIAIS", label: "Redes Sociais (outros)" },
    ]},
    { group: "Mídia Paga", items: [
      { value: "GOOGLE_ADS", label: "Google Ads" }, { value: "GOOGLE", label: "Google" },
      { value: "META_ADS", label: "Meta Ads" },
    ]},
    { group: "Canais Diretos", items: [
      { value: "SITE", label: "Site" }, { value: "WHATSAPP", label: "WhatsApp" },
      { value: "EMAIL", label: "E-mail" }, { value: "TELEFONE", label: "Telefone" },
      { value: "PRESENCIAL", label: "Presencial" }, { value: "INDICACAO", label: "Indicação" },
      { value: "PARCERIA_CORRETOR", label: "Parceria Corretor" },
    ]},
    { group: "Offline", items: [
      { value: "PLACA", label: "Placa" }, { value: "OPEN_HOUSE", label: "Open House" },
      { value: "PLANTAO", label: "Plantão" }, { value: "EVENTO", label: "Evento" },
    ]},
    { group: "Outros", items: [{ value: "OUTROS", label: "Outros" }] },
  ], []);

  const filteredSourceOptions = useMemo(() => {
    if (!sourceSearch) return sourceOptions;
    const s = sourceSearch.toLowerCase();
    return sourceOptions
      .map(g => ({ ...g, items: g.items.filter(i => i.label.toLowerCase().includes(s)) }))
      .filter(g => g.items.length > 0);
  }, [sourceOptions, sourceSearch]);

  const selectedSourceLabel = useMemo(() => {
    if (filters.source.length === 0) return "";
    for (const g of sourceOptions) {
      const found = g.items.find(i => i.value === filters.source[0]);
      if (found) return found.label;
    }
    return filters.source[0];
  }, [filters.source, sourceOptions]);

  const activeFiltersCount = 
    filters.status.length +
    filters.source.length +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0) +
    (filters.corretorId ? 1 : 0) +
    (filters.hasProperty !== null ? 1 : 0);

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Buscar por nome, email ou telefone..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          {/* Quick filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status filter */}
            <select
              value={filters.status[0] || ""}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                status: e.target.value ? [e.target.value] : [] 
              }))}
              className="h-10 px-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="">Todos os status</option>
              {kanbanColumns.length > 0
                ? kanbanColumns.map((col) => (
                    <option key={col.id} value={col.status}>{col.title}</option>
                  ))
                : Object.entries(statusLabels).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))
              }
            </select>

            {/* Source filter — searchable combobox */}
            <div className="relative">
              <button
                type="button"
                onClick={() => { setShowSourceDropdown(!showSourceDropdown); setSourceSearch(""); }}
                className={`h-10 px-3 pr-8 rounded-xl border text-sm text-left min-w-[160px] max-w-[220px] truncate focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
                  filters.source.length > 0
                    ? "bg-orange-50 dark:bg-orange-500/10 border-orange-300 text-orange-700 dark:text-orange-400"
                    : "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400"
                }`}
              >
                {filters.source.length > 1
                  ? `${filters.source.length} origens`
                  : selectedSourceLabel || "Todas as origens"}
                {filters.source.length > 0 && (
                  <span
                    onClick={(e) => { e.stopPropagation(); setFilters(prev => ({ ...prev, source: [] })); setShowSourceDropdown(false); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-600 flex items-center justify-center hover:bg-neutral-300 dark:hover:bg-neutral-500"
                  >
                    <RiCloseLine className="w-3 h-3" />
                  </span>
                )}
              </button>
              {showSourceDropdown && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowSourceDropdown(false)} />
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl z-40 overflow-hidden">
                    <div className="p-2 border-b border-neutral-100 dark:border-neutral-800">
                      <input
                        type="text"
                        value={sourceSearch}
                        onChange={(e) => setSourceSearch(e.target.value)}
                        placeholder="Buscar origem..."
                        autoFocus
                        className="w-full h-8 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto scrollbar-thin">
                      <button
                        type="button"
                        onClick={() => { setFilters(prev => ({ ...prev, source: [] })); setShowSourceDropdown(false); }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 ${filters.source.length === 0 ? "text-orange-600 font-medium" : "text-neutral-600 dark:text-neutral-400"}`}
                      >
                        Todas as origens
                      </button>
                      {filteredSourceOptions.map((group) => (
                        <div key={group.group}>
                          <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 bg-neutral-50 dark:bg-neutral-800/50">
                            {group.group}
                          </div>
                          {group.items.map((item) => {
                            const isSelected = filters.source.includes(item.value);
                            return (
                              <button
                                key={item.value}
                                type="button"
                                onClick={() => {
                                  setFilters(prev => ({
                                    ...prev,
                                    source: isSelected
                                      ? prev.source.filter(s => s !== item.value)
                                      : [...prev.source, item.value],
                                  }));
                                }}
                                className={`w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 ${isSelected ? "text-orange-600 font-medium bg-orange-50 dark:bg-orange-500/10" : "text-neutral-700 dark:text-neutral-300"}`}
                              >
                                <span className={`w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center ${isSelected ? "bg-orange-500 border-orange-500" : "border-neutral-300 dark:border-neutral-600"}`}>
                                  {isSelected && <span className="w-2 h-2 bg-white rounded-sm block" />}
                                </span>
                                {item.label}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                      {filteredSourceOptions.length === 0 && (
                        <div className="px-3 py-4 text-sm text-neutral-400 text-center">Nenhuma origem encontrada</div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Advanced filters toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 h-10 px-4 rounded-xl border transition-colors ${
                activeFiltersCount > 0
                  ? "border-orange-300 bg-orange-50 dark:bg-orange-500/10 text-orange-600"
                  : "border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              }`}
            >
              <RiFilterLine className="w-4 h-4" />
              <span className="text-sm">Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 h-10 px-3 text-sm text-neutral-500 hover:text-neutral-700"
              >
                <RiCloseLine className="w-4 h-4" />
                Limpar
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {selectedLeads.length > 0 && (
              <>
                <span className="text-sm text-orange-500 font-medium">
                  {selectedLeads.length} selecionado(s)
                </span>
                {/* Mover em massa */}
                <div className="relative">
                  <button
                    onClick={() => setShowMoveMenu(!showMoveMenu)}
                    disabled={bulkLoading}
                    className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors border border-blue-200 dark:border-blue-500/30"
                  >
                    <RiArrowRightSLine className="w-4 h-4" />
                    Mover
                  </button>
                  {showMoveMenu && (
                    <div className="absolute right-0 top-full mt-1 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-lg z-50 py-1 min-w-[180px]">
                      {kanbanColumns.map((col) => (
                        <button
                          key={col.id}
                          onClick={() => handleBulkMove(col.status)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center gap-2"
                        >
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                          {col.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Excluir em massa */}
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkLoading}
                  className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors border border-red-200 dark:border-red-500/30"
                >
                  <RiDeleteBinLine className="w-4 h-4" />
                  Excluir
                </button>
                <button
                  onClick={() => setSelectedLeads([])}
                  className="h-9 px-2 rounded-lg text-neutral-400 hover:text-neutral-600 transition-colors"
                  title="Limpar seleção"
                >
                  <RiCloseLine className="w-4 h-4" />
                </button>
              </>
            )}
            {isAdmin && (
              <button
                onClick={handleExportCSV}
                disabled={exporting}
                className="flex items-center gap-2 h-10 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {exporting ? (
                  <div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <RiDownload2Line className="w-4 h-4" />
                )}
                {exporting ? "Exportando..." : "Exportar"}
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-6 pt-4 mt-4 border-t border-neutral-200 dark:border-neutral-800">
                {/* Grupo: Período */}
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Período</span>
                  <div className="flex items-center gap-2">
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">De</label>
                      <input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                        className="w-full h-9 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">Até</label>
                      <input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                        className="w-full h-9 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Grupo: Responsável */}
                {isAdmin && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Responsável</span>
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">Corretor</label>
                      <select
                        value={filters.corretorId}
                        onChange={(e) => setFilters(prev => ({ ...prev, corretorId: e.target.value }))}
                        className="w-full h-9 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      >
                        <option value="">Todos</option>
                        <option value="__none__">Sem corretor</option>
                        {corretoresList.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Grupo: Propriedade */}
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Propriedade</span>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Imóvel vinculado</label>
                    <select
                      value={filters.hasProperty === null ? "" : filters.hasProperty.toString()}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        hasProperty: e.target.value === "" ? null : e.target.value === "true" 
                      }))}
                      className="w-full h-9 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    >
                      <option value="">Todos</option>
                      <option value="true">Com imóvel</option>
                      <option value="false">Sem imóvel</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-neutral-50 dark:bg-neutral-800/50">
              <th className="w-12 px-4 py-3">
                <button onClick={toggleSelectAll} className="text-neutral-400 hover:text-neutral-600">
                  {selectedLeads.length === filteredLeads.length && filteredLeads.length > 0 ? (
                    <RiCheckboxCircleLine className="w-5 h-5 text-orange-500" />
                  ) : (
                    <RiCheckboxBlankCircleLine className="w-5 h-5" />
                  )}
                </button>
              </th>
              <th 
                onClick={() => handleSort("name")}
                className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider cursor-pointer hover:text-neutral-700"
              >
                <div className="flex items-center gap-1">
                  Cliente
                  <SortIcon field="name" />
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-500 uppercase tracking-wider w-8">
                🔥
              </th>
              <th 
                onClick={() => handleSort("status")}
                className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider cursor-pointer hover:text-neutral-700"
              >
                <div className="flex items-center gap-1">
                  Etapa
                  <SortIcon field="status" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Prazo
              </th>
              <th 
                onClick={() => handleSort("ticket")}
                className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider cursor-pointer hover:text-neutral-700"
              >
                <div className="flex items-center gap-1">
                  Finalidade
                  <SortIcon field="ticket" />
                </div>
              </th>
              <th
                onClick={() => handleSort("ticketValue")}
                className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider cursor-pointer hover:text-neutral-700"
                title="Ordenar por valor (menor/maior)"
              >
                <div className="flex items-center gap-1">
                  Ticket
                  <SortIcon field="ticketValue" />
                </div>
              </th>
              <th 
                onClick={() => handleSort("lastContact")}
                className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider cursor-pointer hover:text-neutral-700"
              >
                <div className="flex items-center gap-1">
                  Último Contato
                  <SortIcon field="lastContact" />
                </div>
              </th>
              {isAdmin && (
                <th 
                  onClick={() => handleSort("corretor")}
                  className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider cursor-pointer hover:text-neutral-700"
                >
                  <div className="flex items-center gap-1">
                    Corretor
                    <SortIcon field="corretor" />
                  </div>
                </th>
              )}
              <th 
                onClick={() => handleSort("createdAt")}
                className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider cursor-pointer hover:text-neutral-700"
              >
                <div className="flex items-center gap-1">
                  Criado em
                  <SortIcon field="createdAt" />
                </div>
              </th>
              <th className="w-24 px-4 py-3 text-center text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {loading ? (
              <tr>
                <td colSpan={12} className="px-4 py-12 text-center">
                  <RiLoader4Line className="w-8 h-8 mx-auto text-orange-500 animate-spin" />
                  <p className="mt-2 text-sm text-neutral-500">Carregando leads...</p>
                </td>
              </tr>
            ) : filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-4 py-12 text-center">
                  <RiUserLine className="w-12 h-12 mx-auto text-neutral-300" />
                  <p className="mt-2 text-neutral-500">Nenhum lead encontrado</p>
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => {
                const isSelected = selectedLeads.includes(lead.id);
                const overdue = isLeadOverdue(lead);
                const colColor = getColumnColor(lead.status);
                const colTitle = getColumnTitle(lead.status);
                const ticketLabel = (lead as any).ticket ? (leadTicketLabels as any)[(lead as any).ticket] || (lead as any).ticket : "-";

                return (
                  <tr 
                    key={lead.id}
                    className={`hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors ${
                      isSelected ? "bg-orange-50 dark:bg-orange-500/10" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <button onClick={() => toggleSelect(lead.id)} className="text-neutral-400 hover:text-neutral-600">
                        {isSelected ? (
                          <RiCheckboxCircleLine className="w-5 h-5 text-orange-500" />
                        ) : (
                          <RiCheckboxBlankCircleLine className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-medium text-sm">
                          {lead.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <button
                            onClick={() => setDetailModal({ open: true, lead })}
                            className="font-medium text-neutral-900 dark:text-white text-sm hover:text-orange-500 dark:hover:text-orange-400 transition-colors text-left"
                          >
                            {isAdmin
                              ? (lead.name || "Sem nome")
                              : ((lead as any).nickname || lead.name?.split(" ")[0] || "Sem nome")}
                          </button>
                        </div>
                      </div>
                    </td>
                    {/* Temperatura */}
                    <td className="px-4 py-3 text-center">
                      <div
                        className="w-5 h-5 rounded-full mx-auto flex items-center justify-center"
                        style={{ backgroundColor: (leadTemperatureColors as any)[(lead as any).temperature || "MORNO"] + "30" }}
                        title={(leadTemperatureLabels as any)[(lead as any).temperature || "MORNO"] || "Morno"}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: (leadTemperatureColors as any)[(lead as any).temperature || "MORNO"] }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-sm flex-shrink-0"
                          style={{ backgroundColor: colColor }}
                          title={colTitle}
                        />
                        <span className="text-sm text-neutral-700 dark:text-neutral-300 font-medium">
                          {colTitle}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {overdue ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400">
                          <RiAlertLine className="w-3 h-3" />
                          Atrasado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400">
                          <RiCheckLine className="w-3 h-3" />
                          Em dia
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {(lead as any).ticket === "AMBOS" ? (
                        <div className="flex gap-1">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-white" style={{ backgroundColor: leadTicketColors?.COMPRA || "#3b82f6" }}>C</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-white" style={{ backgroundColor: leadTicketColors?.LOCACAO || "#f59e0b" }}>L</span>
                        </div>
                      ) : (
                        <span 
                          className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-white"
                          style={{ backgroundColor: (leadTicketColors as any)[(lead as any).ticket || "COMPRA"] || "#3b82f6" }}
                        >
                          {ticketLabel}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        {(() => {
                          const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);
                          const min = (lead as any).minBudget;
                          const max = (lead as any).maxBudget;
                          const budget = (lead as any).budget;
                          // Faixa min–max quando houver; senão o valor único (budget)
                          if (min || max) {
                            return `${min ? fmt(min) : ""}${min && max ? " – " : ""}${max ? fmt(max) : ""}`;
                          }
                          return budget ? fmt(budget) : "-";
                        })()}
                      </span>
                    </td>
                    {/* Último Contato */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-neutral-500">
                        {lead.lastContact
                          ? new Date(lead.lastContact).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
                          : lead.createdAt
                            ? new Date(lead.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
                            : "-"}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        {lead.corretor ? (
                          <div className="flex items-center gap-2">
                            {lead.corretor.avatar ? (
                              <Image
                                src={lead.corretor.avatar}
                                alt={lead.corretor.name}
                                width={24}
                                height={24}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                                <RiUserLine className="w-3 h-3 text-neutral-500" />
                              </div>
                            )}
                            <span className="text-sm text-neutral-600 dark:text-neutral-400">
                              {lead.corretor.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-neutral-400">-</span>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <span className="text-sm text-neutral-500">
                        {formatDate(lead.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => setDetailModal({ open: true, lead })}
                          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 transition-colors"
                          title="Ver detalhes"
                        >
                          <RiEyeLine className="w-4 h-4" />
                        </button>
                        {lead.phone && (
                          <a
                            href={`https://wa.me/55${lead.phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-500/10 text-green-500 hover:text-green-600 transition-colors"
                            title="WhatsApp"
                          >
                            <RiWhatsappLine className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm text-neutral-500">
            Mostrando <strong>{filteredLeads.length}</strong> de <strong>{total}</strong> leads
          </p>
          {selectedLeads.length > 0 && (
            <span className="text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 px-2 py-0.5 rounded-full">
              {selectedLeads.length} selecionado(s)
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-neutral-500">Por página:</span>
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              className="h-8 px-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              {[10, 25, 50, 100].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <RiArrowLeftSLine className="w-4 h-4" />
            </button>
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <RiArrowRightSLine className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Lead Detail Modal */}
      <LeadDetailModal
        lead={detailModal.lead}
        isOpen={detailModal.open}
        onClose={() => setDetailModal({ open: false, lead: null })}
        onOpenNotes={() => {}}
        onOpenTags={() => {}}
        onOpenSchedule={() => {}}
        onOpenBudget={() => {}}
        onOpenContract={() => {}}
        onOpenAIAnalysis={() => {}}
      />
    </div>
  );
}
