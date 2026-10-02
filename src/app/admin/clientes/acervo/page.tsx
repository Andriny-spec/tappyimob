"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiArchiveLine,
  RiRefreshLine,
  RiSearchLine,
  RiCloseLine,
  RiArrowLeftLine,
  RiLoader4Line,
  RiEditLine,
  RiSaveLine,
  RiAddLine,
  RiDeleteBinLine,
  RiFilterLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiWhatsappLine,
} from "react-icons/ri";
import Link from "next/link";
import { leadSourceLabels, leadProfileLabels, leadProfileColors } from "@/types/lead";
import { LeadDetailModal } from "@/components/admin/kanban/modals/LeadDetailModal";
import { ScheduleModal } from "@/components/admin/kanban/modals/ScheduleModal";

interface AcervoLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  temperature: "QUENTE" | "MORNO" | "FRIO";
  ticket: "COMPRA" | "LOCACAO" | "AMBOS" | "INVESTIMENTO" | "PERMUTA" | "LANCAMENTO" | "OUTRO";
  profile?: "COMPRADOR" | "INVESTIDOR" | "CONSTRUTOR";
  source?: string;
  archivedAt: string;
  archivedReason?: string;
  archivedCategory?: string;
  previousStatus?: string;
  budget?: number;
  tags?: string[];
  lastContact?: string;
  updatedAt?: string;
  property?: {
    code: string;
    price: number;
  };
  corretor?: {
    id: string;
    name: string;
  };
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getDaysSince = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
};

const getAvatarColor = (name: string) => {
  const colors = [
    "bg-orange-500", "bg-blue-500", "bg-green-500", "bg-purple-500",
    "bg-pink-500", "bg-indigo-500", "bg-teal-500", "bg-amber-500"
  ];
  const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

const getInitials = (name: string) => {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
};

export default function AcervoPage() {
  const [leads, setLeads] = useState<AcervoLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "name" | "oldest_contact" | "ticket_label" | "budget" | "corretor" | "category">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleColumnSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder(field === "name" ? "asc" : "desc");
    }
  };

  // Filtros avançados
  const [showFilters, setShowFilters] = useState(false);
  const [filterTemperature, setFilterTemperature] = useState<string[]>([]);
  const [filterTicket, setFilterTicket] = useState<string[]>([]);
  const [filterSource, setFilterSource] = useState<string[]>([]);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [filterCorretor, setFilterCorretor] = useState<string>("");
  const [filterProfiles, setFilterProfiles] = useState<string[]>([]);
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterHasPermuta, setFilterHasPermuta] = useState<boolean | null>(null);
  const [filterHasVisit, setFilterHasVisit] = useState<boolean | null>(null);
  const [filterHasProposal, setFilterHasProposal] = useState<boolean | null>(null);
  const [filterTicketMin, setFilterTicketMin] = useState<number>(0);
  const [filterTicketMax, setFilterTicketMax] = useState<number>(0);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableCorretores, setAvailableCorretores] = useState<{ id: string; name: string }[]>([]);

  const toggleFilter = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  const activeFiltersCount = filterTemperature.length + filterTicket.length + filterSource.length + filterTags.length + filterProfiles.length + (filterCorretor ? 1 : 0) + (filterDateFrom ? 1 : 0) + (filterDateTo ? 1 : 0) + (filterHasPermuta !== null ? 1 : 0) + (filterHasVisit !== null ? 1 : 0) + (filterHasProposal !== null ? 1 : 0) + (filterTicketMin > 0 ? 1 : 0) + (filterTicketMax > 0 ? 1 : 0);

  const clearAllFilters = () => {
    setFilterTemperature([]);
    setFilterTicket([]);
    setFilterSource([]);
    setFilterTags([]);
    setFilterCorretor("");
    setFilterProfiles([]);
    setFilterDateFrom("");
    setFilterDateTo("");
    setFilterHasPermuta(null);
    setFilterHasVisit(null);
    setFilterHasProposal(null);
    setFilterTicketMin(0);
    setFilterTicketMax(0);
  };

  // Categorias editáveis (igual ao Limbo)
  const defaultCategoryConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    efetivados: { label: "Efetivados", color: "text-green-700", bgColor: "bg-green-100 dark:bg-green-500/20" },
    investidores: { label: "Investidores", color: "text-purple-700", bgColor: "bg-purple-100 dark:bg-purple-500/20" },
    sem_interacao: { label: "Sem interação", color: "text-neutral-700", bgColor: "bg-neutral-100 dark:bg-neutral-500/20" },
  };

  const [categoryLabels, setCategoryLabels] = useState<Record<string, string>>({});
  const [customCategories, setCustomCategories] = useState<Record<string, { label: string; color: string; bgColor: string }>>({});
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isSavingLabel, setIsSavingLabel] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Cores para categorias customizadas
  const customColors = [
    { color: "text-teal-700", bgColor: "bg-teal-100 dark:bg-teal-500/20" },
    { color: "text-pink-700", bgColor: "bg-pink-100 dark:bg-pink-500/20" },
    { color: "text-amber-700", bgColor: "bg-amber-100 dark:bg-amber-500/20" },
    { color: "text-indigo-700", bgColor: "bg-indigo-100 dark:bg-indigo-500/20" },
    { color: "text-rose-700", bgColor: "bg-rose-100 dark:bg-rose-500/20" },
  ];

  // Merge default + custom
  const allCategoryConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    ...Object.fromEntries(
      Object.entries(defaultCategoryConfig).map(([key, config]) => [
        key,
        { ...config, label: categoryLabels[key] || config.label },
      ])
    ),
    ...Object.fromEntries(
      Object.entries(customCategories).map(([key, config]) => [
        key,
        { ...config, label: categoryLabels[key] || config.label },
      ])
    ),
  };
  
  // Modal de detalhes do lead (padrão Kanban)
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetailLead, setSelectedDetailLead] = useState<AcervoLead | null>(null);

  // Modal de agendamento (tarefa) — Bug #38
  const [scheduleModal, setScheduleModal] = useState<{ open: boolean; lead: AcervoLead | null }>({ open: false, lead: null });

  // Modal de repescagem
  const [unarchiveModal, setUnarchiveModal] = useState<{ open: boolean; lead: AcervoLead | null }>({ open: false, lead: null });
  const [selectedStatus, setSelectedStatus] = useState("NOVO");
  const [isUnarchiving, setIsUnarchiving] = useState(false);

  // Colunas dinâmicas do Kanban
  const [kanbanColumns, setKanbanColumns] = useState<Array<{ id: string; title: string; color?: string }>>([]);

  const defaultStatusOptions = [
    { value: "NOVO", label: "Novos", color: "bg-orange-500" },
    { value: "CONTATADO", label: "Contatados", color: "bg-green-500" },
    { value: "QUALIFICADO", label: "Qualificados", color: "bg-purple-500" },
    { value: "EM_NEGOCIACAO", label: "Em Negociação", color: "bg-blue-500" },
  ];

  // Buscar colunas dinâmicas do Kanban
  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const res = await fetch("/api/admin/leads/columns");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setKanbanColumns(data.map((col: any) => ({ id: col.id, title: col.title, color: col.color })));
          }
        }
      } catch (err) {
        // fallback to defaults
      }
    };
    fetchColumns();
  }, []);

  const statusOptions = kanbanColumns.length > 0
    ? kanbanColumns.map(col => ({ value: col.id, label: col.title, color: col.color ? `bg-[${col.color}]` : "bg-orange-500" }))
    : defaultStatusOptions;

  // Carregar labels customizados e categorias extras
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const [labelsRes, customRes] = await Promise.all([
          fetch("/api/admin/config?key=acervo_category_labels"),
          fetch("/api/admin/config?key=acervo_custom_categories"),
        ]);
        if (labelsRes.ok) {
          const data = await labelsRes.json();
          if (data.value) setCategoryLabels(data.value as Record<string, string>);
        }
        if (customRes.ok) {
          const data = await customRes.json();
          if (data.value) setCustomCategories(data.value as Record<string, { label: string; color: string; bgColor: string }>);
        }
      } catch (error) {
        console.error("Erro ao carregar config do acervo:", error);
      }
    };
    fetchConfig();
  }, []);

  // Salvar nome customizado da categoria
  const handleSaveCategoryLabel = async (categoryKey: string) => {
    if (!editValue.trim()) return;
    setIsSavingLabel(true);
    try {
      const newLabels = { ...categoryLabels, [categoryKey]: editValue.trim() };
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "acervo_category_labels", value: newLabels }),
      });
      if (res.ok) {
        setCategoryLabels(newLabels);
        setEditingCategory(null);
        setEditValue("");
      }
    } catch (error) {
      console.error("Erro ao salvar label:", error);
    } finally {
      setIsSavingLabel(false);
    }
  };

  // Adicionar nova categoria
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    const key = newCategoryName.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    if (allCategoryConfig[key]) return; // Já existe
    const colorIdx = Object.keys(customCategories).length % customColors.length;
    const newCat = { label: newCategoryName.trim(), ...customColors[colorIdx] };
    const updated = { ...customCategories, [key]: newCat };
    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "acervo_custom_categories", value: updated }),
      });
      if (res.ok) {
        setCustomCategories(updated);
        setNewCategoryName("");
        setShowAddCategory(false);
      }
    } catch (error) {
      console.error("Erro ao adicionar categoria:", error);
    }
  };

  // Remover categoria customizada
  const handleRemoveCategory = async (key: string) => {
    if (!confirm(`Remover a aba "${allCategoryConfig[key]?.label}"?`)) return;
    const updated = { ...customCategories };
    delete updated[key];
    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "acervo_custom_categories", value: updated }),
      });
      if (res.ok) {
        setCustomCategories(updated);
        if (filterCategory === key) setFilterCategory("all");
      }
    } catch (error) {
      console.error("Erro ao remover categoria:", error);
    }
  };

  // Carregar leads arquivados + dados auxiliares
  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/leads?status=ARQUIVADO&limit=9999");
        if (res.ok) {
          const data = await res.json();
          const allLeads: AcervoLead[] = data.leads || data || [];
          // Acervo = leads arquivados que NÃO estão em categoria de Limbo.
          // Leads sem archivedCategory também entram no Acervo (não são do Limbo).
          const limboCategories = ["perdido", "nurturing", "reativar", "sem_perfil"];
          const acervoLeads = allLeads.filter(
            (l) => !l.archivedCategory || !limboCategories.includes(l.archivedCategory)
          );
          setLeads(acervoLeads);

          // Extrair tags únicas dos leads
          const tagsSet = new Set<string>();
          acervoLeads.forEach(l => l.tags?.forEach(t => tagsSet.add(t)));
          setAvailableTags(Array.from(tagsSet).sort());

          // Extrair corretores únicos
          const corretoresMap = new Map<string, string>();
          acervoLeads.forEach(l => {
            if (l.corretor) corretoresMap.set(l.corretor.id, l.corretor.name);
          });
          setAvailableCorretores(Array.from(corretoresMap.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name)));
        }
      } catch (error) {
        console.error("Erro ao carregar acervo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  // Ticket labels
  const ticketLabels: Record<string, string> = {
    COMPRA: "Compra",
    LOCACAO: "Locação",
    AMBOS: "Ambos",
  };

  // Filtrar e ordenar
  const filteredLeads = leads
    .filter((lead) => {
      const matchSearch =
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone?.includes(searchTerm);
      const matchCategory = filterCategory === "all" || lead.archivedCategory === filterCategory;
      const matchTemp = filterTemperature.length === 0 || filterTemperature.includes(lead.temperature);
      const matchTicket = filterTicket.length === 0 || filterTicket.includes(lead.ticket);
      const matchSource = filterSource.length === 0 || filterSource.includes(lead.source || "");
      const matchTags = filterTags.length === 0 || filterTags.some(t => lead.tags?.includes(t));
      const matchCorretor = !filterCorretor || lead.corretor?.id === filterCorretor;
      const matchProfile = filterProfiles.length === 0 || filterProfiles.includes(lead.profile || "COMPRADOR");
      const matchDateFrom = !filterDateFrom || (lead.archivedAt && lead.archivedAt.split("T")[0] >= filterDateFrom);
      const matchDateTo = !filterDateTo || (lead.archivedAt && lead.archivedAt.split("T")[0] <= filterDateTo);
      const matchPermuta = filterHasPermuta === null || (filterHasPermuta ? (lead as any).hasPermuta === true : (lead as any).hasPermuta !== true);
      const matchVisit = filterHasVisit === null || (filterHasVisit ? ((lead as any).linkedPropertiesCount?.visitados || 0) > 0 || ((lead as any).scheduledVisitsCount || 0) > 0 : ((lead as any).linkedPropertiesCount?.visitados || 0) === 0 && ((lead as any).scheduledVisitsCount || 0) === 0);
      const matchProposal = filterHasProposal === null || (filterHasProposal ? ((lead as any).linkedPropertiesCount?.propostas || 0) > 0 : ((lead as any).linkedPropertiesCount?.propostas || 0) === 0);
      const matchTicketMin = !filterTicketMin || filterTicketMin <= 0 || ((lead as any).maxBudget || 0) >= filterTicketMin;
      const matchTicketMax = !filterTicketMax || filterTicketMax <= 0 || ((lead as any).minBudget || Infinity) <= filterTicketMax;
      return matchSearch && matchCategory && matchTemp && matchTicket && matchSource && matchTags && matchCorretor && matchProfile && matchDateFrom && matchDateTo && matchPermuta && matchVisit && matchProposal && matchTicketMin && matchTicketMax;
    })
    .sort((a, b) => {
      const dir = sortOrder === "asc" ? 1 : -1;
      switch (sortBy) {
        case "date":
          return dir * (new Date(a.archivedAt || 0).getTime() - new Date(b.archivedAt || 0).getTime());
        case "name":
          return dir * a.name.localeCompare(b.name);
        case "oldest_contact": {
          const aDate = a.lastContact ? new Date(a.lastContact).getTime() : 0;
          const bDate = b.lastContact ? new Date(b.lastContact).getTime() : 0;
          return dir * (aDate - bDate);
        }
        case "ticket_label":
          return dir * ((a.ticket || "").localeCompare(b.ticket || ""));
        case "budget":
          return dir * ((a.budget || 0) - (b.budget || 0));
        case "corretor":
          return dir * ((a.corretor?.name || "").localeCompare(b.corretor?.name || ""));
        case "category":
          return dir * ((a.archivedCategory || "").localeCompare(b.archivedCategory || ""));
        default:
          return 0;
      }
    });

  // Repescar lead
  const handleUnarchive = async () => {
    if (!unarchiveModal.lead) return;
    setIsUnarchiving(true);
    try {
      const res = await fetch(`/api/admin/leads/${unarchiveModal.lead.id}/unarchive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newStatus: selectedStatus }),
      });
      if (res.ok) {
        setLeads(leads.filter((l) => l.id !== unarchiveModal.lead!.id));
        setUnarchiveModal({ open: false, lead: null });
      }
    } catch (error) {
      console.error("Erro ao repescar lead:", error);
    } finally {
      setIsUnarchiving(false);
    }
  };

  // Deletar todos os leads do acervo
  const handleDeleteAll = async () => {
    const count = filteredLeads.length;
    if (!confirm(`Tem certeza que deseja EXCLUIR PERMANENTEMENTE todos os ${count} leads do acervo? Esta ação não pode ser desfeita!`)) return;
    if (!confirm(`ÚLTIMA CONFIRMAÇÃO: Deletar ${count} leads permanentemente?`)) return;
    
    try {
      const ids = filteredLeads.map(l => l.id);
      const res = await fetch("/api/admin/leads/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (res.ok) {
        const data = await res.json();
        alert(`${data.deleted} leads deletados com sucesso`);
        setLeads(prev => prev.filter(l => !ids.includes(l.id)));
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao deletar");
      }
    } catch (error) {
      console.error("Erro ao deletar leads:", error);
    }
  };

  // Deletar lead individual
  const handleDeleteLead = async (leadId: string) => {
    if (!confirm("Tem certeza que deseja excluir este lead permanentemente?")) return;
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, { method: "DELETE" });
      if (res.ok) {
        setLeads(prev => prev.filter(l => l.id !== leadId));
      }
    } catch (error) {
      console.error("Erro ao deletar lead:", error);
    }
  };

  // Mover lead para outra aba/categoria
  const handleMoveCategory = async (leadId: string, newCategory: string) => {
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archivedCategory: newCategory }),
      });
      if (res.ok) {
        setLeads((prev: AcervoLead[]) =>
          prev.map((l: AcervoLead) => l.id === leadId ? { ...l, archivedCategory: newCategory } : l)
        );
      }
    } catch (error) {
      console.error("Erro ao mover lead:", error);
    }
  };

  // Toggle seleção individual
  const toggleSelect = (leadId: string) => {
    setSelectedLeads((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    );
  };

  // Selecionar/deselecionar todos
  const toggleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map((l) => l.id));
    }
  };

  // Repescar múltiplos (envia para NOVO por padrão)
  const handleBulkUnarchive = async () => {
    for (const leadId of selectedLeads) {
      try {
        await fetch(`/api/admin/leads/${leadId}/unarchive`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newStatus: "NOVO" }),
        });
        setLeads((prev) => prev.filter((l) => l.id !== leadId));
      } catch (error) {
        console.error("Erro ao repescar lead:", error);
      }
    }
    setSelectedLeads([]);
  };

  // Deletar leads selecionados
  const handleBulkDelete = async () => {
    if (!confirm(`Tem certeza que deseja EXCLUIR PERMANENTEMENTE ${selectedLeads.length} leads? Esta ação não pode ser desfeita!`)) return;
    try {
      const res = await fetch("/api/admin/leads/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedLeads }),
      });
      if (res.ok) {
        const data = await res.json();
        alert(`${data.deleted} leads deletados com sucesso`);
        setLeads((prev) => prev.filter((l) => !selectedLeads.includes(l.id)));
        setSelectedLeads([]);
      }
    } catch (error) {
      console.error("Erro ao deletar leads:", error);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/clientes/leads"
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
          >
            <RiArrowLeftLine className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <RiArchiveLine className="w-7 h-7 text-blue-500" />
              Acervo de Clientes
            </h1>
            <p className="text-sm text-neutral-500">
              Clientes de relacionamento de longo prazo e follow up
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Ações em massa */}
          {selectedLeads.length > 0 && (
            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-500/10 px-4 py-2 rounded-xl">
              <span className="text-sm font-medium text-blue-600">
                {selectedLeads.length} selecionado(s)
              </span>
              <button
                onClick={handleBulkUnarchive}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors"
              >
                <RiRefreshLine className="w-4 h-4" />
                Repescar
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
              >
                <RiDeleteBinLine className="w-4 h-4" />
                Deletar
              </button>
              <button
                onClick={() => setSelectedLeads([])}
                className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600"
              >
                <RiCloseLine className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Deletar todos */}
          {leads.length > 0 && selectedLeads.length === 0 && (
            <button
              onClick={handleDeleteAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors border border-red-200 dark:border-red-500/30"
            >
              <RiDeleteBinLine className="w-4 h-4" />
              Deletar Todos ({leads.length})
            </button>
          )}
        </div>
      </div>

      {/* Busca + Filtros */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Busca */}
          <div className="relative flex-1">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Botão Filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              activeFiltersCount > 0
                ? "border-orange-300 bg-orange-50 dark:bg-orange-500/10 text-orange-600"
                : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700"
            }`}
          >
            <RiFilterLine className="w-4 h-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-orange-500 text-white text-xs">
                {activeFiltersCount}
              </span>
            )}
            {showFilters ? <RiArrowUpSLine className="w-4 h-4" /> : <RiArrowDownSLine className="w-4 h-4" />}
          </button>

          {/* Ordenação */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Mais recentes</option>
            <option value="name">Nome A-Z</option>
            <option value="oldest_contact">Contato mais antigo</option>
          </select>
        </div>

        {/* Painel de filtros avançados */}
        {showFilters && (
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Filtros Avançados</h3>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-red-500 hover:text-red-600 font-medium"
                >
                  Limpar todos
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Temperatura */}
              <div>
                <label className="text-xs font-medium text-neutral-500 mb-2 block">Temperatura</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { value: "QUENTE", label: "Quente", color: "bg-red-500" },
                    { value: "MORNO", label: "Morno", color: "bg-amber-500" },
                    { value: "FRIO", label: "Frio", color: "bg-blue-500" },
                  ].map((t) => (
                    <button
                      key={t.value}
                      onClick={() => toggleFilter(filterTemperature, t.value, setFilterTemperature)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        filterTemperature.includes(t.value)
                          ? `${t.color} text-white`
                          : "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${t.color}`} />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Finalidade */}
              <div>
                <label className="text-xs font-medium text-neutral-500 mb-2 block">Finalidade</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { value: "COMPRA", label: "Compra" },
                    { value: "LOCACAO", label: "Locação" },
                    { value: "AMBOS", label: "Ambos" },
                    { value: "INVESTIMENTO", label: "Investimento" },
                    { value: "PERMUTA", label: "Permuta" },
                    { value: "LANCAMENTO", label: "Lançamento" },
                  ].map((t) => (
                    <button
                      key={t.value}
                      onClick={() => toggleFilter(filterTicket, t.value, setFilterTicket)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        filterTicket.includes(t.value)
                          ? "bg-blue-500 text-white"
                          : "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Perfil */}
              <div>
                <label className="text-xs font-medium text-neutral-500 mb-2 block">Perfil</label>
                <div className="flex flex-wrap gap-1.5">
                  {(["COMPRADOR", "INVESTIDOR", "CONSTRUTOR"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => toggleFilter(filterProfiles, p, setFilterProfiles)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        filterProfiles.includes(p)
                          ? "text-white"
                          : "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                      }`}
                      style={filterProfiles.includes(p) ? { backgroundColor: leadProfileColors[p] } : {}}
                    >
                      {leadProfileLabels[p]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Corretor */}
              <div>
                <label className="text-xs font-medium text-neutral-500 mb-2 block">Corretor</label>
                <select
                  value={filterCorretor}
                  onChange={(e) => setFilterCorretor(e.target.value)}
                  className="w-full h-8 px-2 rounded-lg text-xs bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Todos os corretores</option>
                  {availableCorretores.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Origem */}
              <div>
                <label className="text-xs font-medium text-neutral-500 mb-2 block">Origem</label>
                <select
                  value={filterSource[0] || ""}
                  onChange={(e) => setFilterSource(e.target.value ? [e.target.value] : [])}
                  className="w-full h-8 px-2 rounded-lg text-xs bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Todas as origens</option>
                  {Object.entries(leadSourceLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Condições */}
              <div>
                <label className="text-xs font-medium text-neutral-500 mb-2 block">Condições</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { value: "permuta", label: "Permuta", state: filterHasPermuta, setter: setFilterHasPermuta },
                    { value: "visita", label: "Com visitas", state: filterHasVisit, setter: setFilterHasVisit },
                    { value: "proposta", label: "Com propostas", state: filterHasProposal, setter: setFilterHasProposal },
                  ].map((f) => (
                    <button
                      key={f.value}
                      onClick={() => f.setter(f.state === true ? null : true)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        f.state === true
                          ? "bg-teal-500 text-white"
                          : "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ticket de Valor */}
              <div>
                <label className="text-xs font-medium text-neutral-500 mb-2 block">Ticket (R$)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={filterTicketMin || ""}
                    onChange={(e) => setFilterTicketMin(parseInt(e.target.value) || 0)}
                    placeholder="Mín"
                    className="w-24 h-8 px-2 rounded-lg text-xs bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-neutral-900 dark:text-white"
                  />
                  <span className="text-xs text-neutral-400">até</span>
                  <input
                    type="number"
                    value={filterTicketMax || ""}
                    onChange={(e) => setFilterTicketMax(parseInt(e.target.value) || 0)}
                    placeholder="Máx"
                    className="w-24 h-8 px-2 rounded-lg text-xs bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Período de Arquivamento */}
              <div className="md:col-span-2 lg:col-span-3">
                <label className="text-xs font-medium text-neutral-500 mb-2 block">Período de Arquivamento</label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                    className="h-8 px-2 rounded-lg text-xs bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <span className="text-xs text-neutral-400">até</span>
                  <input
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                    className="h-8 px-2 rounded-lg text-xs bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  {(filterDateFrom || filterDateTo) && (
                    <button
                      onClick={() => { setFilterDateFrom(""); setFilterDateTo(""); }}
                      className="text-xs text-red-500 hover:text-red-600 font-medium"
                    >
                      Limpar
                    </button>
                  )}
                </div>
              </div>

              {/* Tags */}
              {availableTags.length > 0 && (
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-neutral-500 mb-2 block">Tags</label>
                  <div className="flex flex-wrap gap-1.5">
                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleFilter(filterTags, tag, setFilterTags)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          filterTags.includes(tag)
                            ? "bg-purple-500 text-white"
                            : "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tabs de Categoria (editáveis) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterCategory("all")}
          className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
            filterCategory === "all"
              ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
          }`}
        >
          Todos ({leads.length})
        </button>
        {Object.entries(allCategoryConfig).map(([key, config]) => {
          const count = leads.filter(l => l.archivedCategory === key).length;
          const isCustom = key in customCategories;
          return (
            <div key={key} className="flex items-center gap-1">
              {editingCategory === key ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveCategoryLabel(key);
                      if (e.key === "Escape") { setEditingCategory(null); setEditValue(""); }
                    }}
                    className="w-28 px-2 py-1.5 rounded-lg text-sm border border-blue-300 dark:border-blue-500/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveCategoryLabel(key)}
                    disabled={isSavingLabel}
                    className="p-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
                  >
                    <RiSaveLine className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => { setEditingCategory(null); setEditValue(""); }}
                    className="p-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-700 text-neutral-500 hover:bg-neutral-300"
                  >
                    <RiCloseLine className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setFilterCategory(key)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                    filterCategory === key
                      ? `${config.bgColor} ${config.color}`
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  }`}
                >
                  {config.label} ({count})
                </button>
              )}
              {editingCategory !== key && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingCategory(key);
                    setEditValue(config.label);
                  }}
                  className="p-1 rounded-lg text-neutral-400 hover:text-blue-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  title="Renomear aba"
                >
                  <RiEditLine className="w-3.5 h-3.5" />
                </button>
              )}
              {isCustom && editingCategory !== key && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveCategory(key);
                  }}
                  className="p-1 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  title="Remover aba"
                >
                  <RiDeleteBinLine className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        {/* Botão adicionar categoria */}
        {showAddCategory ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddCategory();
                if (e.key === "Escape") { setShowAddCategory(false); setNewCategoryName(""); }
              }}
              placeholder="Nome da aba..."
              className="w-32 px-2 py-1.5 rounded-lg text-sm border border-blue-300 dark:border-blue-500/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={handleAddCategory}
              className="p-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
            >
              <RiSaveLine className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => { setShowAddCategory(false); setNewCategoryName(""); }}
              className="p-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-700 text-neutral-500 hover:bg-neutral-300"
            >
              <RiCloseLine className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAddCategory(true)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-blue-500 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors whitespace-nowrap"
          >
            <RiAddLine className="w-4 h-4" />
            Nova aba
          </button>
        )}
      </div>

      {/* Stats resumidos */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl p-3 border border-neutral-200 dark:border-neutral-700 inline-flex items-center gap-2">
        <span className="text-xl font-bold text-neutral-900 dark:text-white">{filteredLeads.length}</span>
        <span className="text-sm text-neutral-500">cliente(s) no acervo</span>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RiLoader4Line className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="text-center py-20">
          <RiArchiveLine className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
            Nenhum cliente no acervo
          </h3>
          <p className="text-neutral-500">
            Clientes arquivados para follow up aparecerão aqui
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          {/* Header da tabela */}
          <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-500">
            <div className="col-span-1 flex items-center">
              <input
                type="checkbox"
                checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-neutral-300 text-blue-500 focus:ring-blue-500"
              />
            </div>
            <button onClick={() => handleColumnSort("name")} className="col-span-2 flex items-center gap-1 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors text-left">
              Nome {sortBy === "name" && (sortOrder === "asc" ? <RiArrowUpSLine className="w-4 h-4" /> : <RiArrowDownSLine className="w-4 h-4" />)}
            </button>
            <button onClick={() => handleColumnSort("ticket_label")} className="col-span-1 flex items-center gap-1 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors text-left">
              Finalidade {sortBy === "ticket_label" && (sortOrder === "asc" ? <RiArrowUpSLine className="w-4 h-4" /> : <RiArrowDownSLine className="w-4 h-4" />)}
            </button>
            <button onClick={() => handleColumnSort("budget")} className="col-span-1 flex items-center gap-1 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors text-left">
              Ticket {sortBy === "budget" && (sortOrder === "asc" ? <RiArrowUpSLine className="w-4 h-4" /> : <RiArrowDownSLine className="w-4 h-4" />)}
            </button>
            <button onClick={() => handleColumnSort("oldest_contact")} className="col-span-2 flex items-center gap-1 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors text-left">
              Último contato {sortBy === "oldest_contact" && (sortOrder === "asc" ? <RiArrowUpSLine className="w-4 h-4" /> : <RiArrowDownSLine className="w-4 h-4" />)}
            </button>
            <button onClick={() => handleColumnSort("corretor")} className="col-span-1 flex items-center gap-1 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors text-left">
              Corretor {sortBy === "corretor" && (sortOrder === "asc" ? <RiArrowUpSLine className="w-4 h-4" /> : <RiArrowDownSLine className="w-4 h-4" />)}
            </button>
            <button onClick={() => handleColumnSort("category")} className="col-span-2 flex items-center gap-1 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors text-left">
              Aba {sortBy === "category" && (sortOrder === "asc" ? <RiArrowUpSLine className="w-4 h-4" /> : <RiArrowDownSLine className="w-4 h-4" />)}
            </button>
            <div className="col-span-2 text-right">Ações</div>
          </div>

          {/* Linhas */}
          <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
            <AnimatePresence>
              {filteredLeads.map((lead) => {
                const lastContactDate = lead.lastContact || lead.updatedAt || lead.archivedAt;
                const daysSinceContact = lastContactDate ? getDaysSince(lastContactDate) : null;

                return (
                  <motion.div
                    key={lead.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                  >
                    {/* Checkbox */}
                    <div className="hidden md:flex col-span-1 items-center">
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => toggleSelect(lead.id)}
                        className="w-4 h-4 rounded border-neutral-300 text-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    {/* Nome + WhatsApp */}
                    <div className="col-span-2 flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold ${getAvatarColor(lead.name)}`}>
                        {getInitials(lead.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => { setSelectedDetailLead(lead); setShowDetailModal(true); }}
                            className="font-medium text-sm text-neutral-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate block text-left"
                          >
                            {lead.name}
                          </button>
                          {lead.phone && (
                            <a
                              href={`https://wa.me/55${lead.phone.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex-shrink-0 w-6 h-6 rounded-md bg-green-50 dark:bg-green-500/10 text-green-600 flex items-center justify-center hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors"
                              title="WhatsApp"
                            >
                              <RiWhatsappLine className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        <div className="text-xs text-neutral-400 truncate">{lead.archivedReason || "Follow up"}</div>
                      </div>
                    </div>

                    {/* Finalidade */}
                    <div className="col-span-1 flex items-center">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 w-fit">
                        {ticketLabels[lead.ticket] || lead.ticket || "—"}
                      </span>
                    </div>

                    {/* Ticket (valor) */}
                    <div className="col-span-1 flex items-center">
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">
                        {lead.budget ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(lead.budget) : "—"}
                      </span>
                    </div>

                    {/* Último contato */}
                    <div className="col-span-2 flex flex-col justify-center">
                      {lastContactDate ? (
                        <>
                          <div className="text-xs text-neutral-700 dark:text-neutral-300">{formatDate(lastContactDate)}</div>
                          {daysSinceContact !== null && (
                            <div className={`text-[10px] ${daysSinceContact > 30 ? "text-red-500 font-semibold" : "text-neutral-400"}`}>
                              {daysSinceContact}d atrás
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-neutral-400">—</span>
                      )}
                    </div>

                    {/* Corretor */}
                    <div className="col-span-1 flex items-center">
                      {lead.corretor ? (
                        <div className="flex items-center gap-1.5" title={lead.corretor.name}>
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                            {lead.corretor.name?.charAt(0) || "C"}
                          </div>
                          <span className="text-xs text-neutral-600 dark:text-neutral-400 truncate">{lead.corretor.name?.split(" ")[0]}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400">—</span>
                      )}
                    </div>

                    {/* Aba / Categoria */}
                    <div className="col-span-2 flex items-center">
                      <select
                        value={lead.archivedCategory || ""}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleMoveCategory(lead.id, e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full text-xs px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
                      >
                        <option value="">Sem aba</option>
                        {Object.entries(allCategoryConfig).map(([key, config]) => (
                          <option key={key} value={key}>{config.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Ações */}
                    <div className="col-span-2 flex items-center justify-end gap-1.5">
                      <button
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          setSelectedStatus(lead.previousStatus || "NOVO");
                          setUnarchiveModal({ open: true, lead });
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-50 dark:bg-green-500/10 text-green-600 text-xs font-medium hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors"
                      >
                        <RiRefreshLine className="w-3.5 h-3.5" />
                        Repescar
                      </button>
                      <button
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleDeleteLead(lead.id);
                        }}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        title="Excluir permanentemente"
                      >
                        <RiDeleteBinLine className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Modal de Detalhes do Lead (padrão Kanban) */}
      <LeadDetailModal
        lead={selectedDetailLead as any}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedDetailLead(null);
        }}
        onOpenNotes={() => {}}
        onOpenTags={() => {}}
        onOpenSchedule={(lead) => setScheduleModal({ open: true, lead: selectedDetailLead })}
        onOpenBudget={() => {}}
        onOpenContract={() => {}}
        onOpenAIAnalysis={() => {}}
        isAdmin={true}
        onLeadUpdate={(updated: any) => {
          setLeads(prev => prev.map(l => l.id === updated.id ? { ...l, ...updated } : l));
        }}
      />

      {/* Modal de Agendamento — Bug #38 */}
      {scheduleModal.open && scheduleModal.lead && (
        <ScheduleModal
          lead={scheduleModal.lead as any}
          isOpen={scheduleModal.open}
          onClose={() => setScheduleModal({ open: false, lead: null })}
        />
      )}

      {/* Modal de Repescagem */}
      <AnimatePresence>
        {unarchiveModal.open && unarchiveModal.lead && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setUnarchiveModal({ open: false, lead: null })}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <RiRefreshLine className="w-5 h-5 text-green-500" />
                    <span className="font-semibold text-neutral-900 dark:text-white text-sm">
                      Repescar Cliente
                    </span>
                  </div>
                  <button
                    onClick={() => setUnarchiveModal({ open: false, lead: null })}
                    className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
                  >
                    <RiCloseLine className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 space-y-4">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Repescando <span className="font-semibold text-neutral-900 dark:text-white">{unarchiveModal.lead.name}</span>
                  </p>

                  <div>
                    <p className="text-xs text-neutral-500 mb-2">Para qual coluna?</p>
                    <div className="grid grid-cols-2 gap-2">
                      {statusOptions.map((status) => (
                        <button
                          key={status.value}
                          onClick={() => setSelectedStatus(status.value)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            selectedStatus === status.value
                              ? `${status.color} text-white`
                              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${status.color}`} />
                          {status.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
                  <button
                    onClick={() => setUnarchiveModal({ open: false, lead: null })}
                    className="flex-1 px-3 py-2 text-sm rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleUnarchive}
                    disabled={isUnarchiving}
                    className="flex-1 px-3 py-2 text-sm rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
                  >
                    {isUnarchiving ? (
                      <RiLoader4Line className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <RiRefreshLine className="w-4 h-4" />
                        Repescar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
