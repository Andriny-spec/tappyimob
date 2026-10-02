"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiAddLine,
  RiSearchLine,
  RiLoader4Line,
  RiPhoneLine,
  RiMailLine,
  RiUserLine,
  RiSendPlaneLine,
  RiTeamLine,
  RiTimeLine,
  RiCheckLine,
  RiCloseLine,
  RiFireLine,
  RiTempColdLine,
  RiSunLine,
  RiEditLine,
  RiRefreshLine,
  RiWhatsappLine,
  RiArrowRightLine,
  RiShieldUserLine,
  RiFilterLine,
  RiLayoutGridLine,
  RiListCheck,
  RiDeleteBinLine,
  RiArrowDownSLine,
  RiCheckboxLine,
  RiCheckboxBlankLine,
  RiChat1Line,
  RiSettings4Line,
  RiDragMove2Line,
  RiPauseLine,
  RiPlayLine,
  RiAlarmWarningLine,
  RiFlashlightLine,
  RiUserAddLine,
  RiArrowUpSLine,
} from "react-icons/ri";
import { KanbanBoard } from "@/components/admin/kanban/KanbanBoard";

interface Lead {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  source?: string;
  ticket?: string;
  budget?: number;
  budgetMin?: number;
  budgetMax?: number;
  temperature?: string;
  status: string;
  createdAt: string;
  corretor?: { id: string; name: string; avatar?: string };
}

interface Queue {
  id: string;
  name: string;
  isActive: boolean;
  rotationType: string;
  members: any[];
}

interface Corretor {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
}

const sourceLabels: Record<string, string> = {
  SITE: "Site",
  WHATSAPP: "WhatsApp",
  TELEFONE: "Telefone",
  PRESENCIAL: "Presencial",
  INDICACAO: "Indicação",
  PORTAL: "Portal",
  REDE_SOCIAL: "Rede Social",
  EMAIL: "Email",
  AVALIACAO: "📋 Avaliação Imóvel",
  CAPTACAO: "🏠 Captação Imóvel",
  OUTRO: "Outro",
};

const temperatureConfig: Record<string, { label: string; color: string; icon: any }> = {
  QUENTE: { label: "Quente", color: "bg-red-500", icon: RiFireLine },
  MORNO: { label: "Morno", color: "bg-amber-500", icon: RiSunLine },
  FRIO: { label: "Frio", color: "bg-blue-500", icon: RiTempColdLine },
};

export default function SDRPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [queues, setQueues] = useState<Queue[]>([]);
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUnassigned, setFilterUnassigned] = useState(true);
  const [view, setView] = useState<"list" | "kanban">("kanban");
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [qualifyModal, setQualifyModal] = useState<{ open: boolean; lead: Lead | null }>({ open: false, lead: null });
  const [assignModal, setAssignModal] = useState<{ open: boolean; lead: Lead | null }>({ open: false, lead: null });
  const [isSaving, setIsSaving] = useState(false);
  const [totalLeads, setTotalLeads] = useState(0);
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advFilters, setAdvFilters] = useState({
    temperature: "" as string,
    source: "" as string,
    ticket: "" as string,
    corretorId: "" as string,
  });
  const [showQueuesSection, setShowQueuesSection] = useState(false);
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [editingQueue, setEditingQueue] = useState<Queue | null>(null);
  const [queueForm, setQueueForm] = useState({
    name: "",
    description: "",
    rotationType: "ROUND_ROBIN",
    responseTimeMinutes: "",
    memberIds: [] as string[],
    delayRules: { warningMinutes: 5, reassignMinutes: 10 },
  });
  const [savingQueue, setSavingQueue] = useState(false);

  // Form para novo lead
  const [newLeadForm, setNewLeadForm] = useState({
    name: "",
    phone: "",
    email: "",
    source: "PRESENCIAL",
    ticket: "",
    budget: "",
    temperature: "MORNO",
    notes: "",
  });

  // Form para qualificação
  const [qualifyForm, setQualifyForm] = useState({
    name: "",
    phone: "",
    email: "",
    ticket: "",
    budget: "",
    temperature: "MORNO",
    notes: "",
  });

  // Form para atribuição
  const [assignForm, setAssignForm] = useState({
    mode: "queue" as "queue" | "manual",
    queueId: "",
    corretorId: "",
  });

  const fetchData = useCallback(async () => {
    try {
      const [leadsRes, queuesRes, corretoresRes] = await Promise.all([
        fetch(`/api/admin/sdr/leads?status=NOVO&unassigned=${filterUnassigned}`),
        fetch("/api/admin/leads/queue"),
        fetch("/api/admin/corretores"),
      ]);

      if (leadsRes.ok) {
        const data = await leadsRes.json();
        setLeads(data.leads || []);
        setTotalLeads(data.total || 0);
      }

      if (queuesRes.ok) {
        const data = await queuesRes.json();
        setQueues((data.queues || []).filter((q: Queue) => q.isActive));
      }

      if (corretoresRes.ok) {
        const data = await corretoresRes.json();
        setCorretores(Array.isArray(data) ? data : data.corretores || []);
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  }, [filterUnassigned]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredLeads = leads.filter((lead) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesSearch = lead.name?.toLowerCase().includes(term) ||
        lead.phone?.toLowerCase().includes(term) ||
        lead.email?.toLowerCase().includes(term);
      if (!matchesSearch) return false;
    }
    if (advFilters.temperature && lead.temperature !== advFilters.temperature) return false;
    if (advFilters.source && lead.source !== advFilters.source) return false;
    if (advFilters.ticket && lead.ticket !== advFilters.ticket) return false;
    if (advFilters.corretorId && lead.corretor?.id !== advFilters.corretorId) return false;
    return true;
  });

  const activeAdvFiltersCount = Object.values(advFilters).filter(Boolean).length;

  const handleCreateLead = async () => {
    if (!newLeadForm.name) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/sdr/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLeadForm),
      });

      if (res.ok) {
        setShowNewLeadModal(false);
        setNewLeadForm({ name: "", phone: "", email: "", source: "PRESENCIAL", ticket: "", budget: "", temperature: "MORNO", notes: "" });
        fetchData();
      }
    } catch (error) {
      console.error("Erro ao criar lead:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleQualify = async () => {
    if (!qualifyModal.lead) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/sdr/leads/qualify", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: qualifyModal.lead.id,
          ...qualifyForm,
        }),
      });

      if (res.ok) {
        setQualifyModal({ open: false, lead: null });
        fetchData();
      }
    } catch (error) {
      console.error("Erro ao qualificar:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedLeads.size === 0) return;
    if (!confirm(`Excluir ${selectedLeads.size} lead(s) selecionado(s)?`)) return;
    setIsDeleting(true);
    try {
      const res = await fetch("/api/admin/sdr/leads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadIds: Array.from(selectedLeads) }),
      });
      if (res.ok) {
        setSelectedLeads(new Set());
        fetchData();
      }
    } catch (error) {
      console.error("Erro ao excluir leads:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const openQueueModal = (queue?: Queue) => {
    if (queue) {
      setEditingQueue(queue);
      setQueueForm({
        name: queue.name,
        description: (queue as any).description || "",
        rotationType: queue.rotationType || "ROUND_ROBIN",
        responseTimeMinutes: (queue as any).responseTimeMinutes?.toString() || "",
        memberIds: queue.members?.map((m: any) => m.user?.id || m.userId) || [],
        delayRules: (queue as any).delayRules || { warningMinutes: 5, reassignMinutes: 10 },
      });
    } else {
      setEditingQueue(null);
      setQueueForm({ name: "", description: "", rotationType: "ROUND_ROBIN", responseTimeMinutes: "", memberIds: [], delayRules: { warningMinutes: 5, reassignMinutes: 10 } });
    }
    setShowQueueModal(true);
  };

  const handleSaveQueue = async () => {
    if (!queueForm.name) return;
    setSavingQueue(true);
    try {
      const payload = {
        ...(editingQueue ? { id: editingQueue.id } : {}),
        name: queueForm.name,
        description: queueForm.description || null,
        rotationType: queueForm.rotationType,
        responseTimeMinutes: queueForm.responseTimeMinutes ? parseInt(queueForm.responseTimeMinutes) : null,
        memberIds: queueForm.memberIds,
        delayRules: queueForm.delayRules,
      };
      const res = await fetch("/api/admin/leads/queue", {
        method: editingQueue ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setShowQueueModal(false);
        fetchData();
      }
    } catch (error) {
      console.error("Erro ao salvar fila:", error);
    } finally {
      setSavingQueue(false);
    }
  };

  const handleDeleteQueue = async (queueId: string) => {
    if (!confirm("Excluir esta fila?")) return;
    try {
      const res = await fetch(`/api/admin/leads/queue?id=${queueId}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Erro ao excluir fila:", error);
    }
  };

  const handleToggleQueue = async (queue: Queue) => {
    try {
      await fetch("/api/admin/leads/queue", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: queue.id, isActive: !queue.isActive }),
      });
      fetchData();
    } catch (error) {
      console.error("Erro ao alternar fila:", error);
    }
  };

  const handleAutoAssign = async (leadId: string) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/sdr/auto-assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.assigned) {
          alert(`Lead atribuído para ${data.assignedTo?.name || "corretor"} (${data.queueName || "rodízio"})`);
        } else {
          alert(data.message || "Nenhum corretor disponível no momento");
        }
        fetchData();
      }
    } catch (error) {
      console.error("Erro ao auto-atribuir:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkAutoAssign = async () => {
    if (selectedLeads.size === 0) return;
    if (!confirm(`Distribuir ${selectedLeads.size} lead(s) automaticamente pelo rodízio?`)) return;
    setIsSaving(true);
    let assigned = 0;
    for (const leadId of selectedLeads) {
      try {
        const res = await fetch("/api/admin/sdr/auto-assign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leadId }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.assigned) assigned++;
        }
      } catch {}
    }
    alert(`${assigned} de ${selectedLeads.size} leads distribuídos com sucesso`);
    setSelectedLeads(new Set());
    fetchData();
    setIsSaving(false);
  };

  const toggleSelectLead = (leadId: string) => {
    setSelectedLeads((prev) => {
      const next = new Set(prev);
      if (next.has(leadId)) next.delete(leadId);
      else next.add(leadId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map((l) => l.id)));
    }
  };

  const handleAssign = async () => {
    if (!assignModal.lead) return;
    setIsSaving(true);
    try {
      const body: any = { leadId: assignModal.lead.id };

      if (assignForm.mode === "queue") {
        body.assignToQueue = true;
        if (assignForm.queueId) body.queueId = assignForm.queueId;
      } else {
        body.assignToCorretorId = assignForm.corretorId;
      }

      const res = await fetch("/api/admin/sdr/leads/qualify", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.assigned) {
          alert(`Lead atribuído para ${data.assignedTo?.name || "corretor"}`);
        } else {
          alert("Não foi possível atribuir (nenhuma fila/corretor disponível)");
        }
        setAssignModal({ open: false, lead: null });
        fetchData();
      }
    } catch (error) {
      console.error("Erro ao atribuir:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const getTimeSince = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/clientes/leads"
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
          >
            <RiArrowLeftLine className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <RiShieldUserLine className="w-7 h-7 text-orange-500" />
              Recepção SDR
            </h1>
            <p className="text-sm text-neutral-500">
              Recepcione, qualifique e distribua leads para os corretores
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
            <button
              onClick={() => setView("kanban")}
              title="Kanban"
              className={`p-2 rounded-lg transition-colors ${
                view === "kanban"
                  ? "bg-white dark:bg-neutral-700 text-orange-500 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              <RiLayoutGridLine className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("list")}
              title="Lista"
              className={`p-2 rounded-lg transition-colors ${
                view === "list"
                  ? "bg-white dark:bg-neutral-700 text-orange-500 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              <RiListCheck className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => { setLoading(true); fetchData(); }}
            className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
          >
            <RiRefreshLine className="w-5 h-5 text-neutral-500" />
          </button>
          <button
            onClick={() => setShowNewLeadModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium"
          >
            <RiAddLine className="w-5 h-5" />
            Novo Lead
          </button>
        </div>
      </div>

      {/* Busca + Filtros */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setFilterUnassigned(!filterUnassigned)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            filterUnassigned
              ? "bg-orange-500 text-white"
              : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700"
          }`}
        >
          <RiFilterLine className="w-4 h-4" />
          {filterUnassigned ? "Apenas sem corretor" : "Todos os novos"}
        </button>
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            showAdvancedFilters || activeAdvFiltersCount > 0
              ? "bg-[#0A1E3D] text-white"
              : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700"
          }`}
        >
          <RiFilterLine className="w-4 h-4" />
          Filtros
          {activeAdvFiltersCount > 0 && (
            <span className="w-5 h-5 flex items-center justify-center bg-white text-[#0A1E3D] rounded-full text-[10px] font-bold">
              {activeAdvFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Filtros Avançados */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Temperatura</label>
                  <select
                    value={advFilters.temperature}
                    onChange={(e) => setAdvFilters(prev => ({ ...prev, temperature: e.target.value }))}
                    className="w-full h-9 px-3 text-sm rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700"
                  >
                    <option value="">Todas</option>
                    <option value="QUENTE">🔥 Quente</option>
                    <option value="MORNO">☀️ Morno</option>
                    <option value="FRIO">❄️ Frio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Origem</label>
                  <select
                    value={advFilters.source}
                    onChange={(e) => setAdvFilters(prev => ({ ...prev, source: e.target.value }))}
                    className="w-full h-9 px-3 text-sm rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700"
                  >
                    <option value="">Todas</option>
                    {Object.entries(sourceLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Finalidade</label>
                  <select
                    value={advFilters.ticket}
                    onChange={(e) => setAdvFilters(prev => ({ ...prev, ticket: e.target.value }))}
                    className="w-full h-9 px-3 text-sm rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700"
                  >
                    <option value="">Todas</option>
                    <option value="COMPRA">Compra</option>
                    <option value="LOCACAO">Locação</option>
                    <option value="AMBOS">Ambos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Corretor</label>
                  <select
                    value={advFilters.corretorId}
                    onChange={(e) => setAdvFilters(prev => ({ ...prev, corretorId: e.target.value }))}
                    className="w-full h-9 px-3 text-sm rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700"
                  >
                    <option value="">Todos</option>
                    {corretores.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              {activeAdvFiltersCount > 0 && (
                <button
                  onClick={() => setAdvFilters({ temperature: "", source: "", ticket: "", corretorId: "" })}
                  className="mt-3 text-xs text-red-500 hover:text-red-600 font-medium"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-3">
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">{totalLeads}</div>
          <div className="text-xs text-neutral-500">Na fila</div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-3">
          <div className="text-2xl font-bold text-red-500">{leads.filter(l => l.temperature === "QUENTE").length}</div>
          <div className="text-xs text-neutral-500">Quentes</div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-3">
          <div className="text-2xl font-bold text-green-500">{queues.length}</div>
          <div className="text-xs text-neutral-500">Filas ativas</div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-3">
          <div className="text-2xl font-bold text-blue-500">{corretores.filter(c => (c as any).isActive !== false).length}</div>
          <div className="text-xs text-neutral-500">Corretores</div>
        </div>
      </div>

      {/* Seção: Gestão de Filas */}
      <div className="mb-6">
        <button
          onClick={() => setShowQueuesSection(!showQueuesSection)}
          className="flex items-center gap-2 w-full px-4 py-3 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-750 transition-colors"
        >
          <RiSettings4Line className="w-5 h-5 text-orange-500" />
          <span className="font-semibold text-sm text-neutral-900 dark:text-white">Filas de Atendimento</span>
          <span className="ml-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 text-[10px] font-bold">{queues.length} ativas</span>
          <div className="flex-1" />
          {showQueuesSection ? <RiArrowUpSLine className="w-5 h-5 text-neutral-400" /> : <RiArrowDownSLine className="w-5 h-5 text-neutral-400" />}
        </button>

        <AnimatePresence>
          {showQueuesSection && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-2 space-y-3">
                {/* Botão criar fila */}
                <div className="flex justify-end">
                  <button
                    onClick={() => openQueueModal()}
                    className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <RiAddLine className="w-4 h-4" /> Nova Fila
                  </button>
                </div>

                {queues.length === 0 ? (
                  <div className="text-center py-8 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
                    <RiTeamLine className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                    <p className="text-sm text-neutral-500">Nenhuma fila criada</p>
                    <p className="text-xs text-neutral-400 mt-1">Crie uma fila para distribuir leads automaticamente</p>
                  </div>
                ) : (
                  queues.map((queue) => (
                    <div key={queue.id} className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-3 h-3 rounded-full ${queue.isActive ? "bg-green-500" : "bg-neutral-300"}`} />
                        <h4 className="font-semibold text-sm text-neutral-900 dark:text-white flex-1">{queue.name}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                          {queue.rotationType === "ROUND_ROBIN" ? "Rodízio" : queue.rotationType === "WEIGHTED" ? "Ponderado" : "Manual"}
                        </span>
                        {(queue as any).responseTimeMinutes && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
                            <RiAlarmWarningLine className="w-3 h-3" />
                            {(queue as any).responseTimeMinutes}min
                          </span>
                        )}
                        <div className="flex gap-1">
                          <button onClick={() => handleToggleQueue(queue)} className={`p-1.5 rounded-lg text-xs ${queue.isActive ? "bg-green-50 dark:bg-green-500/10 text-green-600" : "bg-neutral-100 dark:bg-neutral-700 text-neutral-400"}`} title={queue.isActive ? "Pausar fila" : "Ativar fila"}>
                            {queue.isActive ? <RiPauseLine className="w-3.5 h-3.5" /> : <RiPlayLine className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => openQueueModal(queue)} className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 text-xs" title="Editar fila">
                            <RiEditLine className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteQueue(queue.id)} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 text-xs" title="Excluir fila">
                            <RiDeleteBinLine className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Membros da fila */}
                      <div className="flex flex-wrap gap-2">
                        {queue.members?.length === 0 ? (
                          <p className="text-xs text-neutral-400 italic">Nenhum corretor vinculado</p>
                        ) : (
                          queue.members?.map((member: any, idx: number) => (
                            <div key={member.id || idx} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                              member.isPaused 
                                ? "bg-neutral-100 dark:bg-neutral-700 text-neutral-400 line-through" 
                                : "bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400"
                            }`}>
                              <span className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-bold">
                                {idx + 1}
                              </span>
                              {member.user?.name || "Corretor"}
                              {member.weight > 1 && <span className="text-[9px] text-orange-400">×{member.weight}</span>}
                            </div>
                          ))
                        )}
                      </div>

                      {/* Stats da fila */}
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-700/50 text-[11px] text-neutral-400">
                        <span>{queue.members?.length || 0} corretores</span>
                        <span>{(queue as any)._count?.assignments || 0} atribuições</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toolbar de ações em massa */}
      {selectedLeads.size > 0 && view === "list" && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-500/10 rounded-xl border border-orange-200 dark:border-orange-500/30">
          <RiFlashlightLine className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-medium text-orange-700 dark:text-orange-400">{selectedLeads.size} selecionado(s)</span>
          <div className="flex-1" />
          <button
            onClick={handleBulkAutoAssign}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            {isSaving ? <RiLoader4Line className="w-3.5 h-3.5 animate-spin" /> : <RiFlashlightLine className="w-3.5 h-3.5" />}
            Distribuir por Rodízio
          </button>
        </div>
      )}

      {/* Kanban View */}
      {view === "kanban" && (
        <div className="min-h-[600px]">
          <KanbanBoard
            isAdmin={true}
            scope="SDR"
            filters={{ hasCorretor: false, search: searchTerm || undefined }}
          />
        </div>
      )}

      {/* Lista de Leads */}
      {view === "list" && (loading ? (
        <div className="flex items-center justify-center py-20">
          <RiLoader4Line className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <RiShieldUserLine className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
            Nenhum lead aguardando
          </h3>
          <p className="text-neutral-500">
            Leads novos sem corretor aparecerão aqui para distribuição
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Toolbar de seleção */}
          <div className="flex items-center justify-between bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 px-4 py-2.5">
            <div className="flex items-center gap-3">
              <button onClick={toggleSelectAll} className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                {selectedLeads.size === filteredLeads.length && filteredLeads.length > 0 ? (
                  <RiCheckboxLine className="w-5 h-5 text-orange-500" />
                ) : (
                  <RiCheckboxBlankLine className="w-5 h-5" />
                )}
                {selectedLeads.size > 0 ? `${selectedLeads.size} selecionado(s)` : "Selecionar todos"}
              </button>
            </div>
            {selectedLeads.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors disabled:opacity-50"
              >
                {isDeleting ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiDeleteBinLine className="w-4 h-4" />}
                Excluir ({selectedLeads.size})
              </button>
            )}
          </div>

          <AnimatePresence>
            {filteredLeads.map((lead) => {
              const tempConfig = temperatureConfig[lead.temperature || "MORNO"];
              const TempIcon = tempConfig?.icon || RiSunLine;
              const isExpanded = expandedLeadId === lead.id;
              const isSelected = selectedLeads.has(lead.id);

              return (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`bg-white dark:bg-neutral-800 rounded-xl border transition-all ${
                    isSelected
                      ? "border-orange-300 dark:border-orange-500/50 ring-1 ring-orange-200 dark:ring-orange-500/20"
                      : "border-neutral-200 dark:border-neutral-700 hover:shadow-md"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4 p-4">
                    {/* Checkbox */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSelectLead(lead.id); }}
                      className="shrink-0 self-start md:self-center"
                    >
                      {isSelected ? (
                        <RiCheckboxLine className="w-5 h-5 text-orange-500" />
                      ) : (
                        <RiCheckboxBlankLine className="w-5 h-5 text-neutral-300 dark:text-neutral-600 hover:text-neutral-500" />
                      )}
                    </button>

                    {/* Lead info */}
                    <div className="flex-1 flex items-start gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${
                        lead.temperature === "QUENTE" ? "bg-red-500" : lead.temperature === "FRIO" ? "bg-blue-500" : "bg-amber-500"
                      }`}>
                        {lead.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setExpandedLeadId(isExpanded ? null : lead.id)}
                            className="font-semibold text-neutral-900 dark:text-white truncate hover:text-orange-600 dark:hover:text-orange-400 transition-colors text-left"
                          >
                            {lead.name}
                          </button>
                          <RiArrowDownSLine className={`w-4 h-4 text-neutral-400 transition-transform shrink-0 ${isExpanded ? "rotate-180" : ""}`} />
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-white shrink-0 ${tempConfig?.color || "bg-amber-500"}`}>
                            <TempIcon className="w-3 h-3" />
                            {tempConfig?.label || "Morno"}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-neutral-500">
                          {lead.phone && (
                            <span className="flex items-center gap-1">
                              <RiPhoneLine className="w-3.5 h-3.5" />
                              {lead.phone}
                            </span>
                          )}
                          {lead.email && (
                            <span className="flex items-center gap-1">
                              <RiMailLine className="w-3.5 h-3.5" />
                              {lead.email}
                            </span>
                          )}
                          {lead.source && (
                            <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-700 rounded text-xs">
                              {sourceLabels[lead.source] || lead.source}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-xs">
                            <RiTimeLine className="w-3 h-3" />
                            {getTimeSince(lead.createdAt)}
                          </span>
                        </div>
                        {lead.corretor && (
                          <div className="mt-1 flex items-center gap-1 text-xs text-green-600">
                            <RiCheckLine className="w-3 h-3" />
                            Atribuído: {lead.corretor.name}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setQualifyForm({
                            name: lead.name || "",
                            phone: lead.phone || "",
                            email: lead.email || "",
                            ticket: lead.ticket || "",
                            budget: lead.budget?.toString() || "",
                            temperature: lead.temperature || "MORNO",
                            notes: "",
                          });
                          setQualifyModal({ open: true, lead });
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                      >
                        <RiEditLine className="w-4 h-4" />
                        Qualificar
                      </button>
                      <button
                        onClick={() => handleAutoAssign(lead.id)}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-orange-50 dark:bg-orange-500/10 text-orange-600 text-sm font-medium hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors disabled:opacity-50"
                        title="Distribuir automaticamente pelo rodízio"
                      >
                        <RiFlashlightLine className="w-4 h-4" />
                        Rodízio
                      </button>
                      <button
                        onClick={() => {
                          setAssignForm({ mode: "queue", queueId: queues[0]?.id || "", corretorId: "" });
                          setAssignModal({ open: true, lead });
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-500/10 text-green-600 text-sm font-medium hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors"
                      >
                        <RiSendPlaneLine className="w-4 h-4" />
                        Repassar
                      </button>
                      {lead.phone && (
                        <a
                          href={`https://wa.me/55${lead.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
                        >
                          <RiWhatsappLine className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Detalhes expandidos */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-0 border-t border-neutral-100 dark:border-neutral-700/50 mt-0">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3">
                            <div>
                              <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider mb-1">Finalidade</p>
                              <p className="text-sm text-neutral-700 dark:text-neutral-300">{lead.ticket || "Não informado"}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider mb-1">Budget</p>
                              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                                {lead.budget ? `R$ ${lead.budget.toLocaleString("pt-BR")}` : "Não informado"}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider mb-1">Criado em</p>
                              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                                {new Date(lead.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </div>
                          {(lead as any).notes?.length > 0 && (
                            <div className="mt-3">
                              <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <RiChat1Line className="w-3 h-3" />
                                Observações
                              </p>
                              <div className="space-y-1.5">
                                {(lead as any).notes.map((note: any) => (
                                  <div key={note.id} className="text-xs text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900 rounded-lg px-3 py-2">
                                    {note.content}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ))}

      {/* Modal: Novo Lead */}
      <AnimatePresence>
        {showNewLeadModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setShowNewLeadModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
                  <h3 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                    <RiAddLine className="w-5 h-5 text-orange-500" />
                    Novo Lead (Recepção)
                  </h3>
                  <button onClick={() => setShowNewLeadModal(false)} className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400">
                    <RiCloseLine className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Nome *</label>
                    <input type="text" value={newLeadForm.name} onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })} placeholder="Nome do cliente" className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1">Telefone</label>
                      <input type="text" value={newLeadForm.phone} onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })} placeholder="(99) 99999-9999" className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1">Email</label>
                      <input type="email" value={newLeadForm.email} onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })} placeholder="email@..." className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1">Origem</label>
                      <select value={newLeadForm.source} onChange={(e) => setNewLeadForm({ ...newLeadForm, source: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm">
                        {Object.entries(sourceLabels).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1">Finalidade</label>
                      <select value={newLeadForm.ticket} onChange={(e) => setNewLeadForm({ ...newLeadForm, ticket: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm">
                        <option value="">Selecionar...</option>
                        <option value="COMPRA">Compra</option>
                        <option value="LOCACAO">Locação</option>
                        <option value="AMBOS">Ambos</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1">Budget</label>
                      <input type="text" value={newLeadForm.budget} onChange={(e) => setNewLeadForm({ ...newLeadForm, budget: e.target.value })} placeholder="R$ 0" className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1">Temperatura</label>
                      <div className="flex gap-1.5">
                        {(["QUENTE", "MORNO", "FRIO"] as const).map((t) => (
                          <button key={t} onClick={() => setNewLeadForm({ ...newLeadForm, temperature: t })} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${newLeadForm.temperature === t ? `${temperatureConfig[t].color} text-white` : "bg-neutral-100 dark:bg-neutral-700 text-neutral-500"}`}>
                            {temperatureConfig[t].label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Observações</label>
                    <textarea value={newLeadForm.notes} onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })} placeholder="Anotações do atendimento..." className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm min-h-[60px]" />
                  </div>
                </div>
                <div className="flex gap-2 px-5 py-4 border-t border-neutral-200 dark:border-neutral-800">
                  <button onClick={() => setShowNewLeadModal(false)} className="flex-1 px-4 py-2 text-sm rounded-lg text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">Cancelar</button>
                  <button onClick={handleCreateLead} disabled={!newLeadForm.name || isSaving} className="flex-1 px-4 py-2 text-sm rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5">
                    {isSaving ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <><RiAddLine className="w-4 h-4" />Criar Lead</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal: Qualificar Lead */}
      <AnimatePresence>
        {qualifyModal.open && qualifyModal.lead && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setQualifyModal({ open: false, lead: null })} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
                  <h3 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                    <RiEditLine className="w-5 h-5 text-blue-500" />
                    Qualificar Lead
                  </h3>
                  <button onClick={() => setQualifyModal({ open: false, lead: null })} className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400">
                    <RiCloseLine className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Nome</label>
                    <input type="text" value={qualifyForm.name} onChange={(e) => setQualifyForm({ ...qualifyForm, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1">Telefone</label>
                      <input type="text" value={qualifyForm.phone} onChange={(e) => setQualifyForm({ ...qualifyForm, phone: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1">Email</label>
                      <input type="email" value={qualifyForm.email} onChange={(e) => setQualifyForm({ ...qualifyForm, email: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1">Finalidade</label>
                      <select value={qualifyForm.ticket} onChange={(e) => setQualifyForm({ ...qualifyForm, ticket: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm">
                        <option value="">Selecionar...</option>
                        <option value="COMPRA">Compra</option>
                        <option value="LOCACAO">Locação</option>
                        <option value="AMBOS">Ambos</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1">Budget</label>
                      <input type="text" value={qualifyForm.budget} onChange={(e) => setQualifyForm({ ...qualifyForm, budget: e.target.value })} placeholder="R$ 0" className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Temperatura</label>
                    <div className="flex gap-1.5">
                      {(["QUENTE", "MORNO", "FRIO"] as const).map((t) => (
                        <button key={t} onClick={() => setQualifyForm({ ...qualifyForm, temperature: t })} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${qualifyForm.temperature === t ? `${temperatureConfig[t].color} text-white` : "bg-neutral-100 dark:bg-neutral-700 text-neutral-500"}`}>
                          {temperatureConfig[t].label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Observações do SDR</label>
                    <textarea value={qualifyForm.notes} onChange={(e) => setQualifyForm({ ...qualifyForm, notes: e.target.value })} placeholder="Informações coletadas..." className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm min-h-[60px]" />
                  </div>
                </div>
                <div className="flex gap-2 px-5 py-4 border-t border-neutral-200 dark:border-neutral-800">
                  <button onClick={() => setQualifyModal({ open: false, lead: null })} className="flex-1 px-4 py-2 text-sm rounded-lg text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">Cancelar</button>
                  <button onClick={handleQualify} disabled={isSaving} className="flex-1 px-4 py-2 text-sm rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5">
                    {isSaving ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <><RiCheckLine className="w-4 h-4" />Salvar</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal: Criar/Editar Fila */}
      <AnimatePresence>
        {showQueueModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setShowQueueModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
                  <h3 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                    <RiSettings4Line className="w-5 h-5 text-orange-500" />
                    {editingQueue ? "Editar Fila" : "Nova Fila de Atendimento"}
                  </h3>
                  <button onClick={() => setShowQueueModal(false)} className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400">
                    <RiCloseLine className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Nome da Fila *</label>
                    <input type="text" value={queueForm.name} onChange={(e) => setQueueForm({ ...queueForm, name: e.target.value })} placeholder="Ex: Fila Principal, Fila Alto Padrão..." className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Descrição</label>
                    <input type="text" value={queueForm.description} onChange={(e) => setQueueForm({ ...queueForm, description: e.target.value })} placeholder="Descrição opcional..." className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1">Tipo de Rodízio</label>
                      <select value={queueForm.rotationType} onChange={(e) => setQueueForm({ ...queueForm, rotationType: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm">
                        <option value="ROUND_ROBIN">Rodízio (Round Robin)</option>
                        <option value="WEIGHTED">Ponderado (por peso)</option>
                        <option value="MANUAL">Manual</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1">Tempo limite (min)</label>
                      <input type="number" value={queueForm.responseTimeMinutes} onChange={(e) => setQueueForm({ ...queueForm, responseTimeMinutes: e.target.value })} placeholder="Ex: 10 (vazio = sem limite)" className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm" />
                    </div>
                  </div>

                  {queueForm.responseTimeMinutes && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-neutral-500 mb-1">Alerta antes de expirar (min)</label>
                        <input type="number" value={queueForm.delayRules.warningMinutes} onChange={(e) => setQueueForm({ ...queueForm, delayRules: { ...queueForm.delayRules, warningMinutes: parseInt(e.target.value) || 5 } })} className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-neutral-500 mb-1">Reatribuir após (min)</label>
                        <input type="number" value={queueForm.delayRules.reassignMinutes} onChange={(e) => setQueueForm({ ...queueForm, delayRules: { ...queueForm.delayRules, reassignMinutes: parseInt(e.target.value) || 10 } })} className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm" />
                      </div>
                    </div>
                  )}

                  {/* Seleção de corretores */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-2">Corretores na Fila</label>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {corretores.map((c) => {
                        const isInQueue = queueForm.memberIds.includes(c.id);
                        const order = queueForm.memberIds.indexOf(c.id);
                        return (
                          <button
                            key={c.id}
                            onClick={() => {
                              if (isInQueue) {
                                setQueueForm({ ...queueForm, memberIds: queueForm.memberIds.filter(id => id !== c.id) });
                              } else {
                                setQueueForm({ ...queueForm, memberIds: [...queueForm.memberIds, c.id] });
                              }
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                              isInQueue
                                ? "bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-500/30"
                                : "bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
                            }`}
                          >
                            {isInQueue ? (
                              <span className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">{order + 1}</span>
                            ) : (
                              <span className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center flex-shrink-0">
                                <RiUserAddLine className="w-3 h-3 text-neutral-400" />
                              </span>
                            )}
                            <span className="flex-1 text-left">{c.name}</span>
                            {isInQueue && <RiCheckLine className="w-4 h-4 text-orange-500 flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                    {queueForm.memberIds.length > 0 && (
                      <p className="text-[10px] text-neutral-400 mt-2">{queueForm.memberIds.length} corretor(es) selecionado(s) — a ordem define a prioridade no rodízio</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 px-5 py-4 border-t border-neutral-200 dark:border-neutral-800">
                  <button onClick={() => setShowQueueModal(false)} className="flex-1 px-4 py-2 text-sm rounded-lg text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">Cancelar</button>
                  <button onClick={handleSaveQueue} disabled={!queueForm.name || savingQueue} className="flex-1 px-4 py-2 text-sm rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5">
                    {savingQueue ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <><RiCheckLine className="w-4 h-4" />{editingQueue ? "Salvar" : "Criar Fila"}</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal: Repassar Lead */}
      <AnimatePresence>
        {assignModal.open && assignModal.lead && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setAssignModal({ open: false, lead: null })} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-sm">
                <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
                  <h3 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                    <RiSendPlaneLine className="w-5 h-5 text-green-500" />
                    Repassar Lead
                  </h3>
                  <button onClick={() => setAssignModal({ open: false, lead: null })} className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400">
                    <RiCloseLine className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Repassando <span className="font-semibold text-neutral-900 dark:text-white">{assignModal.lead.name}</span>
                  </p>

                  {/* Modo de atribuição */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAssignForm({ ...assignForm, mode: "queue" })}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        assignForm.mode === "queue" ? "bg-green-500 text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                      }`}
                    >
                      <RiTeamLine className="w-4 h-4" />
                      Rodízio
                    </button>
                    <button
                      onClick={() => setAssignForm({ ...assignForm, mode: "manual" })}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        assignForm.mode === "manual" ? "bg-blue-500 text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                      }`}
                    >
                      <RiUserLine className="w-4 h-4" />
                      Manual
                    </button>
                  </div>

                  {assignForm.mode === "queue" ? (
                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1">Fila</label>
                      <select
                        value={assignForm.queueId}
                        onChange={(e) => setAssignForm({ ...assignForm, queueId: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                      >
                        <option value="">Fila padrão (primeira ativa)</option>
                        {queues.map((q) => (
                          <option key={q.id} value={q.id}>{q.name} ({q.members?.length || 0} corretores)</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1">Corretor</label>
                      <select
                        value={assignForm.corretorId}
                        onChange={(e) => setAssignForm({ ...assignForm, corretorId: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
                      >
                        <option value="">Selecionar corretor...</option>
                        {corretores.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 px-5 py-4 border-t border-neutral-200 dark:border-neutral-800">
                  <button onClick={() => setAssignModal({ open: false, lead: null })} className="flex-1 px-4 py-2 text-sm rounded-lg text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">Cancelar</button>
                  <button
                    onClick={handleAssign}
                    disabled={isSaving || (assignForm.mode === "manual" && !assignForm.corretorId)}
                    className="flex-1 px-4 py-2 text-sm rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
                  >
                    {isSaving ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <><RiArrowRightLine className="w-4 h-4" />Repassar</>}
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
