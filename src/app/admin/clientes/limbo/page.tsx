"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiArchiveLine,
  RiRefreshLine,
  RiDeleteBinLine,
  RiSearchLine,
  RiFilterLine,
  RiWhatsappLine,
  RiPhoneLine,
  RiMailLine,
  RiTimeLine,
  RiFireLine,
  RiAlertLine,
  RiCheckLine,
  RiCloseLine,
  RiMoreLine,
  RiArrowLeftLine,
  RiHome4Line,
  RiLoader4Line,
  RiEditLine,
  RiSaveLine,
  RiUploadCloud2Line,
} from "react-icons/ri";
import Link from "next/link";
import { LeadDetailModal } from "@/components/admin/kanban/modals/LeadDetailModal";
import { leadSourceLabels } from "@/types/lead";

// Tipos
interface ArchivedLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  source?: string;
  temperature: "QUENTE" | "MORNO" | "FRIO";
  ticket: "COMPRA" | "LOCACAO" | "AMBOS";
  archivedAt: string;
  archivedReason?: string;
  archivedCategory?: string;
  previousStatus?: string;
  budget?: number;
  property?: {
    code: string;
    price: number;
  };
  corretor?: {
    id: string;
    name: string;
    avatar: string | null;
  };
  notes?: any[];
  lastFollowUp?: string;
  lastContact?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Categorias do Limbo (defaults)
const defaultCategoryConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  perdido: { label: "Perdido", color: "text-red-700", bgColor: "bg-red-100 dark:bg-red-500/20" },
  nurturing: { label: "Nurturing", color: "text-blue-700", bgColor: "bg-blue-100 dark:bg-blue-500/20" },
  reativar: { label: "Reativar", color: "text-amber-700", bgColor: "bg-amber-100 dark:bg-amber-500/20" },
  sem_perfil: { label: "Sem perfil", color: "text-neutral-700", bgColor: "bg-neutral-100 dark:bg-neutral-500/20" },
};

// Cores de temperatura
const temperatureColors = {
  QUENTE: "#ef4444",
  MORNO: "#f59e0b",
  FRIO: "#3b82f6",
};

const temperatureLabels = {
  QUENTE: "Quente",
  MORNO: "Morno",
  FRIO: "Frio",
};

// Cores de ticket
const ticketColors = {
  COMPRA: "#3b82f6",
  LOCACAO: "#10b981",
  AMBOS: "#8b5cf6",
};

const ticketLabels = {
  COMPRA: "Compra",
  LOCACAO: "Locação",
  AMBOS: "Ambos",
};

// Formatar preço
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(price);
};

// Formatar data
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Calcular dias desde arquivamento
const getDaysSinceArchived = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
};

// Gerar cor do avatar
const getAvatarColor = (name: string) => {
  const colors = [
    "bg-orange-500", "bg-blue-500", "bg-green-500", "bg-purple-500",
    "bg-pink-500", "bg-indigo-500", "bg-teal-500", "bg-amber-500"
  ];
  const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

// Gerar iniciais
const getInitials = (name: string) => {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
};

export default function LimboPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [leads, setLeads] = useState<ArchivedLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Proteger página - apenas ADMIN
  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.push("/admin/clientes/acervo");
    }
  }, [user, router]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [filterTemperature, setFilterTemperature] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "name" | "temperature">("date");

  // Estado para nomes customizados das categorias
  const [categoryLabels, setCategoryLabels] = useState<Record<string, string>>({});
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isSavingLabel, setIsSavingLabel] = useState(false);

  // Obter config das categorias com nomes customizados
  const categoryConfig: Record<string, { label: string; color: string; bgColor: string }> = Object.fromEntries(
    Object.entries(defaultCategoryConfig).map(([key, config]) => [
      key,
      { ...config, label: categoryLabels[key] || config.label },
    ])
  );
  
  // Modal de detalhes do lead
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<ArchivedLead | null>(null);

  // Modal de repescagem
  const [unarchiveModal, setUnarchiveModal] = useState<{ open: boolean; lead: ArchivedLead | null }>({ open: false, lead: null });
  const [selectedStatus, setSelectedStatus] = useState("NOVO");
  const [unarchiveDestino, setUnarchiveDestino] = useState<"kanban" | "acervo">("kanban");
  const [isUnarchiving, setIsUnarchiving] = useState(false);

  // Status disponíveis para repescagem (baseado nas colunas do Kanban)
  const statusOptions = [
    { value: "NOVO", label: "Novos", color: "bg-orange-500" },
    { value: "CONTATADO", label: "Contatados", color: "bg-green-500" },
    { value: "QUALIFICADO", label: "Qualificados", color: "bg-purple-500" },
    { value: "EM_NEGOCIACAO", label: "Em Negociação", color: "bg-blue-500" },
  ];

  // Carregar nomes customizados das categorias
  useEffect(() => {
    const fetchCategoryLabels = async () => {
      try {
        const res = await fetch("/api/admin/config?key=limbo_category_labels");
        if (res.ok) {
          const data = await res.json();
          if (data.value) {
            setCategoryLabels(data.value as Record<string, string>);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar labels das categorias:", error);
      }
    };
    fetchCategoryLabels();
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
        body: JSON.stringify({ key: "limbo_category_labels", value: newLabels }),
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

  // Carregar leads arquivados
  useEffect(() => {
    const fetchArchivedLeads = async () => {
      setLoading(true);
      try {
        const [resArq, resPerd] = await Promise.all([
          fetch("/api/admin/leads?status=ARQUIVADO&limit=9999"),
          fetch("/api/admin/leads?status=PERDIDO&limit=9999"),
        ]);
        const allLeads: ArchivedLead[] = [];
        if (resArq.ok) {
          const data = await resArq.json();
          const arqLeads: ArchivedLead[] = data.leads || data || [];
          const limboCategories = ["perdido", "nurturing", "reativar", "sem_perfil"];
          allLeads.push(...arqLeads.filter((l) => l.archivedCategory && limboCategories.includes(l.archivedCategory)));
        }
        if (resPerd.ok) {
          const data = await resPerd.json();
          // Leads PERDIDO sempre vão para o Limbo
          allLeads.push(...(data.leads || data || []));
        }
        setLeads(allLeads);
      } catch (error) {
        console.error("Erro ao carregar leads arquivados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArchivedLeads();
  }, []);

  // Filtrar leads
  const filteredLeads = leads
    .filter((lead) => {
      const matchSearch = 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone?.includes(searchTerm);
      const matchTemperature = filterTemperature === "all" || lead.temperature === filterTemperature;
      const matchCategory = filterCategory === "all" || lead.archivedCategory === filterCategory;
      return matchSearch && matchTemperature && matchCategory;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.archivedAt || 0).getTime() - new Date(a.archivedAt || 0).getTime();
      }
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

  // Abrir modal de repescagem
  const openUnarchiveModal = (lead: ArchivedLead) => {
    setSelectedStatus(lead.previousStatus || "NOVO");
    setUnarchiveModal({ open: true, lead });
  };

  // Repescar lead com status selecionado
  const handleUnarchive = async () => {
    if (!unarchiveModal.lead) return;
    
    setIsUnarchiving(true);
    try {
      let res;
      if (unarchiveDestino === "acervo") {
        // Enviar para Acervo: arquivar com categoria default do acervo ("sem_interacao")
        res = await fetch(`/api/admin/leads/${unarchiveModal.lead.id}/archive`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: "Repescado do Limbo para Acervo", category: "sem_interacao" }),
        });
      } else {
        res = await fetch(`/api/admin/leads/${unarchiveModal.lead.id}/unarchive`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newStatus: selectedStatus }),
        });
      }
      if (res.ok) {
        setLeads(leads.filter((l) => l.id !== unarchiveModal.lead!.id));
        setSelectedLeads(selectedLeads.filter((id) => id !== unarchiveModal.lead!.id));
        setUnarchiveModal({ open: false, lead: null });
      }
    } catch (error) {
      console.error("Erro ao repescar lead:", error);
    } finally {
      setIsUnarchiving(false);
    }
  };

  // Mover múltiplos pro Acervo (corrige leads importados/arquivados errado)
  const handleBulkMoveToAcervo = async () => {
    if (!confirm(`Mover ${selectedLeads.length} lead(s) do Limbo para o Acervo?`)) return;
    let moved = 0;
    for (const leadId of selectedLeads) {
      try {
        const res = await fetch(`/api/admin/leads/${leadId}/archive`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reason: "Movido do Limbo para o Acervo",
            category: "sem_interacao",
          }),
        });
        if (res.ok) {
          moved++;
          setLeads((prev) => prev.filter((l) => l.id !== leadId));
        }
      } catch (error) {
        console.error("Erro ao mover lead:", error);
      }
    }
    setSelectedLeads([]);
    alert(`${moved} lead(s) movido(s) para o Acervo`);
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

  // Deletar lead permanentemente
  const handleDelete = async (leadId: string) => {
    if (!confirm("Tem certeza que deseja excluir este lead permanentemente?")) return;
    
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setLeads(leads.filter((l) => l.id !== leadId));
        setSelectedLeads(selectedLeads.filter((id) => id !== leadId));
      }
    } catch (error) {
      console.error("Erro ao deletar lead:", error);
    }
  };

  // Deletar todos os leads do limbo (ARQUIVADOS)
  const handleDeleteAll = async () => {
    const count = filteredLeads.length;
    if (!confirm(`Tem certeza que deseja EXCLUIR PERMANENTEMENTE todos os ${count} leads do limbo? Esta ação não pode ser desfeita!`)) return;
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
        setSelectedLeads([]);
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao deletar");
      }
    } catch (error) {
      console.error("Erro ao deletar leads:", error);
    }
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
        setLeads(prev => prev.filter(l => !selectedLeads.includes(l.id)));
        setSelectedLeads([]);
      }
    } catch (error) {
      console.error("Erro ao deletar leads:", error);
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
        setLeads((prev) =>
          prev.map((l) => l.id === leadId ? { ...l, archivedCategory: newCategory } : l)
        );
      }
    } catch (error) {
      console.error("Erro ao mover lead:", error);
    }
  };

  // Toggle seleção
  const toggleSelect = (leadId: string) => {
    setSelectedLeads((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    );
  };

  // Selecionar todos
  const toggleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map((l) => l.id));
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
              <RiArchiveLine className="w-7 h-7 text-neutral-400" />
              Limbo
            </h1>
            <p className="text-sm text-neutral-500">
              Leads arquivados que podem ser repescados
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Upload de clientes */}
          <Link
            href="/admin/clientes/importacoes"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 text-sm font-medium hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors border border-orange-200 dark:border-orange-500/30"
          >
            <RiUploadCloud2Line className="w-4 h-4" />
            Upload de Clientes
          </Link>
          {/* Ações em massa */}
          {selectedLeads.length > 0 && (
            <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-500/10 px-4 py-2 rounded-xl">
              <span className="text-sm font-medium text-orange-600">
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
                onClick={handleBulkMoveToAcervo}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
                title="Mover leads selecionados para o Acervo"
              >
                <RiArchiveLine className="w-4 h-4" />
                Mover pro Acervo
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
                className="p-1.5 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-500/20 text-orange-600"
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

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Busca */}
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Filtro de temperatura */}
        <select
          value={filterTemperature}
          onChange={(e) => setFilterTemperature(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">Todas temperaturas</option>
          <option value="QUENTE">🔥 Quente</option>
          <option value="MORNO">🌡️ Morno</option>
          <option value="FRIO">❄️ Frio</option>
        </select>

        {/* Ordenação */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-orange-500"
        >
          <option value="date">Mais recentes</option>
          <option value="name">Nome A-Z</option>
        </select>
      </div>

      {/* Tabs de Categoria */}
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
        {Object.entries(categoryConfig).map(([key, config]) => {
          const count = leads.filter(l => l.archivedCategory === key).length;
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
                    className="w-28 px-2 py-1.5 rounded-lg text-sm border border-orange-300 dark:border-orange-500/50 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
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
              {user?.role === "ADMIN" && editingCategory !== key && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingCategory(key);
                    setEditValue(config.label);
                  }}
                  className="p-1 rounded-lg text-neutral-400 hover:text-orange-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  title="Renomear aba"
                >
                  <RiEditLine className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats por Temperatura */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-3 border border-neutral-200 dark:border-neutral-700">
          <div className="text-xl font-bold text-neutral-900 dark:text-white">{filteredLeads.length}</div>
          <div className="text-xs text-neutral-500">Filtrados</div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-3 border border-neutral-200 dark:border-neutral-700">
          <div className="text-xl font-bold text-red-500">{filteredLeads.filter(l => l.temperature === "QUENTE").length}</div>
          <div className="text-xs text-neutral-500">🔥 Quentes</div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-3 border border-neutral-200 dark:border-neutral-700">
          <div className="text-xl font-bold text-amber-500">{filteredLeads.filter(l => l.temperature === "MORNO").length}</div>
          <div className="text-xs text-neutral-500">🌡️ Mornos</div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-3 border border-neutral-200 dark:border-neutral-700">
          <div className="text-xl font-bold text-blue-500">{filteredLeads.filter(l => l.temperature === "FRIO").length}</div>
          <div className="text-xs text-neutral-500">❄️ Frios</div>
        </div>
      </div>

      {/* Lista de Leads */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RiLoader4Line className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="text-center py-20">
          <RiArchiveLine className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
            Nenhum lead no limbo
          </h3>
          <p className="text-neutral-500">
            Leads arquivados aparecerão aqui
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
                className="w-4 h-4 rounded border-neutral-300 text-orange-500 focus:ring-orange-500"
              />
            </div>
            <div className="col-span-3">Nome</div>
            <div className="col-span-1">Finalidade</div>
            <div className="col-span-2">Ticket</div>
            <div className="col-span-2">Último contato</div>
            <div className="col-span-1">Corretor</div>
            <div className="col-span-2 text-right">Ações</div>
          </div>

          {/* Linhas */}
          <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
            <AnimatePresence>
              {filteredLeads.map((lead) => {
                const lastContactDate = lead.lastContact || lead.updatedAt || lead.archivedAt;
                
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
                        className="w-4 h-4 rounded border-neutral-300 text-orange-500 focus:ring-orange-500"
                      />
                    </div>

                    {/* Nome + WhatsApp + Mover aba */}
                    <div className="col-span-3 flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold ${getAvatarColor(lead.name)}`}>
                        {getInitials(lead.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => { setSelectedLead(lead); setShowDetailModal(true); }}
                            className="font-medium text-sm text-neutral-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 transition-colors text-left truncate"
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
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {lead.archivedCategory && categoryConfig[lead.archivedCategory] ? (
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${categoryConfig[lead.archivedCategory].bgColor} ${categoryConfig[lead.archivedCategory].color}`}>
                              {categoryConfig[lead.archivedCategory].label}
                            </span>
                          ) : (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-500">Sem aba</span>
                          )}
                          <select
                            value=""
                            onChange={(e) => { if (e.target.value) handleMoveCategory(lead.id, e.target.value); }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-6 h-5 rounded bg-neutral-100 dark:bg-neutral-700 text-neutral-400 text-[10px] cursor-pointer appearance-none text-center hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                            title="Mover para outra aba"
                          >
                            <option value="">↔</option>
                            {Object.entries(categoryConfig)
                              .filter(([key]) => key !== lead.archivedCategory)
                              .map(([key, config]) => (
                                <option key={key} value={key}>{config.label}</option>
                              ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Finalidade */}
                    <div className="col-span-1 flex items-center">
                      <span
                        className="px-2 py-0.5 rounded text-[11px] font-semibold text-white"
                        style={{ backgroundColor: ticketColors[lead.ticket || "COMPRA"] }}
                      >
                        {ticketLabels[lead.ticket || "COMPRA"]}
                      </span>
                    </div>

                    {/* Ticket (Budget) */}
                    <div className="col-span-2 flex items-center">
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">
                        {lead.budget ? formatPrice(lead.budget) : "-"}
                      </span>
                    </div>

                    {/* Último contato */}
                    <div className="col-span-2 flex flex-col justify-center">
                      <div className="text-sm text-neutral-900 dark:text-white">
                        {lastContactDate ? formatDate(lastContactDate) : "-"}
                      </div>
                      {lastContactDate && (
                        <div className="text-xs text-neutral-500">
                          {getDaysSinceArchived(lastContactDate)} dias atrás
                        </div>
                      )}
                    </div>

                    {/* Corretor Vinculado */}
                    <div className="col-span-1 flex items-center">
                      {lead.corretor ? (
                        <div className="flex items-center gap-1.5" title={lead.corretor.name}>
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                            {lead.corretor.name?.charAt(0) || "C"}
                          </div>
                          <span className="text-xs text-neutral-600 dark:text-neutral-400 truncate">{lead.corretor.name?.split(" ")[0]}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400">-</span>
                      )}
                    </div>

                    {/* Ações: Repescar / Excluir */}
                    <div className="col-span-2 flex items-center justify-end gap-1.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); openUnarchiveModal(lead); }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-50 dark:bg-green-500/10 text-green-600 text-xs font-medium hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors"
                      >
                        <RiRefreshLine className="w-3.5 h-3.5" />
                        Repescar
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(lead.id); }}
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

      {/* Modal de Detalhes do Lead */}
      <LeadDetailModal
        lead={selectedLead as any}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedLead(null);
        }}
        onOpenNotes={() => {}}
        onOpenTags={() => {}}
        onOpenSchedule={() => {}}
        onOpenBudget={() => {}}
        onOpenContract={() => {}}
        onOpenAIAnalysis={() => {}}
        isAdmin={true}
        onLeadUpdate={(updated: any) => {
          setLeads(prev => prev.map(l => l.id === updated.id ? { ...l, ...updated } : l));
        }}
      />

      {/* Modal de Repescagem */}
      <AnimatePresence>
        {unarchiveModal.open && unarchiveModal.lead && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setUnarchiveModal({ open: false, lead: null })}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <RiRefreshLine className="w-5 h-5 text-green-500" />
                    <span className="font-semibold text-neutral-900 dark:text-white text-sm">
                      Repescar Lead
                    </span>
                  </div>
                  <button
                    onClick={() => setUnarchiveModal({ open: false, lead: null })}
                    className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
                  >
                    <RiCloseLine className="w-4 h-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Repescando <span className="font-semibold text-neutral-900 dark:text-white">{unarchiveModal.lead.name}</span>
                  </p>

                  {/* Seleção de Destino */}
                  <div>
                    <p className="text-xs text-neutral-500 mb-2">Destino?</p>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <button
                        onClick={() => setUnarchiveDestino("kanban")}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          unarchiveDestino === "kanban"
                            ? "bg-orange-500 text-white"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                        }`}
                      >
                        Kanban (Leads)
                      </button>
                      <button
                        onClick={() => setUnarchiveDestino("acervo")}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          unarchiveDestino === "acervo"
                            ? "bg-blue-500 text-white"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                        }`}
                      >
                        Acervo
                      </button>
                    </div>
                  </div>

                {/* Seleção de Coluna (apenas para Kanban) */}
                  {unarchiveDestino === "kanban" && <div>
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
                  </div>}
                </div>

                {/* Footer */}
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
