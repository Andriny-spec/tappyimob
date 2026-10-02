"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  RiLayoutGridLine,
  RiTableLine,
  RiFilterLine,
  RiSearchLine,
  RiAddLine,
  RiDownload2Line,
  RiSparklingLine,
  RiArrowLeftLine,
  RiRefreshLine,
  RiSettings4Line,
  RiFilter3Line,
  RiPieChartLine,
  RiAlertLine,
  RiFlowChart,
  RiDeleteBinLine,
  RiAddCircleLine,
  RiSearchLine as RiSearch2Line,
  RiStarLine,
  RiHandCoinLine,
  RiCheckDoubleLine,
  RiCheckboxMultipleLine,
  RiCheckboxLine,
  RiCloseCircleLine,
  RiLoader4Line,
  RiTimeLine,
  RiShieldUserLine,
  RiSortAsc,
  RiSortDesc,
  RiFileCopy2Line,
} from "react-icons/ri";
import { KanbanBoard, KanbanFilters } from "@/components/admin/kanban/KanbanBoard";
import { LeadsFunnel } from "@/components/admin/kanban/LeadsFunnel";
import { LeadsCharts } from "@/components/admin/kanban/LeadsCharts";
import { LeadsTable } from "@/components/admin/kanban/LeadsTable";
import { LeadsProposalsView } from "@/components/admin/kanban/LeadsProposalsView";
import { AdvancedFiltersPanel } from "@/components/admin/kanban/AdvancedFiltersPanel";
import { SettingsModal, KanbanSettings, defaultSettings, loadSavedSettings } from "@/components/admin/kanban/modals/SettingsModal";
import { AIGlobalModal } from "@/components/admin/kanban/modals/AIGlobalModal";
import { LeadDetailModal } from "@/components/admin/kanban/modals/LeadDetailModal";
import { AddLeadModal } from "@/components/admin/kanban/modals/AddLeadModal";
import { Lead } from "@/types/lead";
import { useSidebar } from "@/components/admin/AdminLayoutClient";
import { useAuth } from "@/providers/auth-provider";

export default function LeadsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const { setIsCollapsed } = useSidebar();
  
  // Recolher sidebar ao carregar a página
  useEffect(() => {
    setIsCollapsed(true);
  }, [setIsCollapsed]);
  const [view, setView] = useState<"kanban" | "funnel" | "charts" | "table" | "proposals">("kanban");
  const [search, setSearch] = useState("");
  
  // Stats state - dynamic based on kanban columns
  const [stats, setStats] = useState<{ total: number; columns: Array<{ status: string; label: string; count: number; color: string; funnelStage?: string | null }>; ticketAvg?: number; ticketTotal?: number }>({
    total: 0,
    columns: [],
  });

  // Seleção múltipla
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [allLeadIds, setAllLeadIds] = useState<string[]>([]);
  
  // Modal states
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  
  // Settings states
  const [kanbanFilters, setKanbanFilters] = useState<KanbanFilters>({});
  const [settings, setSettings] = useState<KanbanSettings>(() => loadSavedSettings());
  
  // Leads que requerem atenção
  const [attentionCount, setAttentionCount] = useState(0);
  
  // Estado para modal de detalhes do lead (usado pelo funil)
  const [funnelDetailModal, setFunnelDetailModal] = useState<{ open: boolean; lead: Lead | null }>({
    open: false,
    lead: null,
  });
  const [highlightAttention, setHighlightAttention] = useState(false);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);

  // Aniversariantes da semana
  const [birthdays, setBirthdays] = useState<{ today: any[]; week: any[] }>({ today: [], week: [] });
  const [showBirthdays, setShowBirthdays] = useState(true);

  // Fila SDR - leads aguardando distribuição
  const [queuePending, setQueuePending] = useState(0);
  const [showQueueBanner, setShowQueueBanner] = useState(true);

  useEffect(() => {
    fetch("/api/admin/leads/birthdays")
      .then(res => res.json())
      .then(data => setBirthdays({ today: data.today || [], week: data.week || [] }))
      .catch(() => {});
    fetch("/api/admin/sdr/leads?status=NOVO&unassigned=true")
      .then(res => res.json())
      .then(data => setQueuePending(data.total || 0))
      .catch(() => {});
  }, []);

  // Export
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const fetchLeadsForExport = async () => {
    const params = new URLSearchParams({ limit: "9999" });
    if ((kanbanFilters as any).corretor) params.set("corretorId", (kanbanFilters as any).corretor);
    if (kanbanFilters.dateFrom) params.set("dateFrom", kanbanFilters.dateFrom);
    if (kanbanFilters.dateTo) params.set("dateTo", kanbanFilters.dateTo);
    if (kanbanFilters.campanha) params.set("utm", kanbanFilters.campanha);
    const res = await fetch(`/api/admin/leads?${params}`);
    const data = await res.json();
    return data.leads || data || [];
  };

  const buildExportRows = (leads: any[]) => {
    const headers = [
      "Nome", "Apelido", "Telefone", "Email", "Status", "Finalidade", "Temperatura", "Origem",
      // Origem de campanha — é o que permite cruzar o lead com o investimento
      // em anúncio na hora de montar relatório.
      "UTM Source", "UTM Medium", "UTM Campaign", "UTM Term", "UTM Content", "Página de Entrada",
      "Ticket R$", "Corretor", "Último Contato", "Criado em",
    ];
    const rows = leads.map((l: any) => [
      l.name || "",
      l.nickname || "",
      l.phone || "",
      l.email || "",
      l.status || "",
      l.ticket || "",
      l.temperature || "",
      l.source || "",
      l.utmSource || "",
      l.utmMedium || "",
      l.utmCampaign || "",
      l.utmTerm || "",
      l.utmContent || "",
      l.landingPage || "",
      // `budget` é onde a importação e o resumo do topo guardam o ticket;
      // minBudget fica só como reserva para cadastros antigos.
      (l.budget ?? l.minBudget) ? `${l.budget ?? l.minBudget}` : "",
      l.corretor?.name || "",
      l.lastContact ? new Date(l.lastContact).toLocaleDateString("pt-BR") : "",
      l.createdAt ? new Date(l.createdAt).toLocaleDateString("pt-BR") : "",
    ]);
    return { headers, rows };
  };

  const handleExportCSV = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setShowExportMenu(false);
    try {
      const leads = await fetchLeadsForExport();
      const { headers, rows } = buildExportRows(leads);
      const csv = [headers, ...rows].map((r: string[]) => r.map((v: string) => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro ao exportar leads:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportXLS = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setShowExportMenu(false);
    try {
      const XLSX = await import("xlsx");
      const leads = await fetchLeadsForExport();
      const { headers, rows } = buildExportRows(leads);
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Leads");
      XLSX.writeFile(wb, `leads-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      console.error("Erro ao exportar leads:", err);
    } finally {
      setIsExporting(false);
    }
  };

  // Scan de duplicados
  const [isScanning, setIsScanning] = useState(false);
  const [duplicateCount, setDuplicateCount] = useState<number | null>(null);

  const handleScanDuplicates = async () => {
    setIsScanning(true);
    try {
      const res = await fetch("/api/admin/leads/duplicates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkAll: true }),
      });
      if (res.ok) {
        const data = await res.json();
        setDuplicateCount(data.found || 0);
        if (data.found > 0) {
          if (confirm(`${data.found} duplicado(s) encontrado(s)! Deseja ir para a página de resolução?`)) {
            window.location.href = "/admin/clientes/leads/configuracoes#duplicados";
          }
        } else {
          alert("Nenhum duplicado encontrado!");
        }
      }
    } catch (error) {
      console.error("Erro ao escanear duplicados:", error);
    } finally {
      setIsScanning(false);
    }
  };

  // Modal excluir por corretor
  const [showDeleteByCorretor, setShowDeleteByCorretor] = useState(false);
  const [corretoresList, setCorretoresList] = useState<{ id: string; name: string; leadsCount: number }[]>([]);
  const [deletingCorretor, setDeletingCorretor] = useState(false);

  // Legacy stats object for LeadsFunnel/LeadsCharts compatibility
  const legacyStats = {
    total: stats.total,
    NOVO: stats.columns.find(c => c.status === "NOVO")?.count || 0,
    CONTATADO: stats.columns.find(c => c.status === "CONTATADO")?.count || 0,
    QUALIFICADO: stats.columns.find(c => c.status === "QUALIFICADO")?.count || 0,
    NEGOCIANDO: stats.columns.find(c => c.status === "NEGOCIANDO")?.count || 0,
    FECHADO: stats.columns.find(c => c.status === "FECHADO")?.count || 0,
    PERDIDO: stats.columns.find(c => c.status === "PERDIDO")?.count || 0,
  };

  // Buscar corretores quando modal abre
  useEffect(() => {
    if (!showDeleteByCorretor) return;
    const fetchCorretores = async () => {
      try {
        const [corretoresRes, leadsRes] = await Promise.all([
          fetch("/api/admin/corretores"),
          fetch("/api/admin/leads?limit=9999"),
        ]);
        if (corretoresRes.ok && leadsRes.ok) {
          const cData = await corretoresRes.json();
          const lData = await leadsRes.json();
          const leads = lData.leads || [];
          const corretores = (cData.corretores || cData || []).map((c: any) => ({
            id: c.id,
            name: c.name,
            leadsCount: leads.filter((l: any) => l.corretorId === c.id).length,
          }));
          setCorretoresList(corretores.filter((c: any) => c.leadsCount > 0));
        }
      } catch (err) {
        console.error("Erro ao buscar corretores:", err);
      }
    };
    fetchCorretores();
  }, [showDeleteByCorretor]);

  const handleDeleteByCorretor = async (corretorId: string, corretorName: string, count: number) => {
    if (!confirm(`Tem certeza que deseja EXCLUIR PERMANENTEMENTE todos os ${count} leads da(o) ${corretorName}? Esta ação NÃO pode ser desfeita!`)) return;
    setDeletingCorretor(true);
    try {
      // Buscar IDs dos leads deste corretor
      const res = await fetch(`/api/admin/leads?corretorId=${corretorId}&limit=9999`);
      if (!res.ok) throw new Error("Erro ao buscar leads");
      const data = await res.json();
      const ids = (data.leads || []).map((l: any) => l.id);
      if (ids.length === 0) {
        alert("Nenhum lead encontrado para este corretor");
        return;
      }
      const delRes = await fetch("/api/admin/leads/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (delRes.ok) {
        const delData = await delRes.json();
        alert(`${delData.deleted} leads da(o) ${corretorName} excluídos com sucesso`);
        setShowDeleteByCorretor(false);
        window.location.reload();
      } else {
        const delData = await delRes.json();
        alert(delData.error || "Erro ao excluir");
      }
    } catch (error) {
      console.error("Erro ao excluir leads por corretor:", error);
      alert("Erro ao excluir leads");
    } finally {
      setDeletingCorretor(false);
    }
  };

  // Buscar estatísticas dos leads baseado nas colunas dinâmicas do Kanban
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const params = new URLSearchParams({ limit: "9999" });
        // o select de corretor guarda o NOME, então vai como corretorName —
        // mandar um nome dentro de corretorId zerava todos os contadores
        if ((kanbanFilters as any).corretor) params.set("corretorName", (kanbanFilters as any).corretor);
        if (kanbanFilters.dateFrom) params.set("dateFrom", kanbanFilters.dateFrom);
        if (kanbanFilters.dateTo) params.set("dateTo", kanbanFilters.dateTo);
        // temperatureIn aceita múltiplos valores (a API usa getAll)
        if (kanbanFilters.temperature?.length) {
          kanbanFilters.temperature.forEach((t) => params.append("temperatureIn", t));
        }
        // sourceIn aceita múltiplos valores
        if (kanbanFilters.sources?.length) {
          kanbanFilters.sources.forEach((s) => params.append("sourceIn", s));
        }
        // API usa 'search', não 'name'
        if (kanbanFilters.name) params.set("search", kanbanFilters.name);
        if (kanbanFilters.campanha) params.set("utm", kanbanFilters.campanha);

        // Endpoint LEVE: groupBy/aggregate no banco (não baixa todos os leads)
        const [statsRes, colsRes] = await Promise.all([
          fetch(`/api/admin/leads/stats?${params}`),
          fetch("/api/admin/leads/columns"),
        ]);

        if (statsRes.ok) {
          const data = await statsRes.json();
          const counts: Record<string, number> = data.counts || {};

          // Pegar colunas dinâmicas
          let dynamicColumns: Array<{ status: string; label: string; count: number; color: string }> = [];
          if (colsRes.ok) {
            const colData = await colsRes.json();
            const cols = colData.columns || [];
            dynamicColumns = cols.map((col: any) => ({
              status: col.status,
              label: col.title,
              count: counts[col.status] || 0,
              color: col.color || "#6b7280",
              funnelStage: col.funnelStage || null,
            }));
          }

          setAllLeadIds(Array.isArray(data.ids) ? data.ids : []);
          setStats({
            total: data.total || 0,
            columns: dynamicColumns,
            ticketAvg: data.ticketAvg || 0,
            ticketTotal: data.ticketTotal || 0,
          });
        }
      } catch (error) {
        console.error("Erro ao buscar stats:", error);
      }
    };

    fetchStats();
  }, [kanbanFilters]);
  
  // Count active filters
  const activeFiltersCount =
    (kanbanFilters.name ? 1 : 0) +
    (kanbanFilters.phone ? 1 : 0) +
    (kanbanFilters.temperature?.length || 0) +
    (kanbanFilters.status?.length || 0) +
    (kanbanFilters.sources?.length || 0) +
    (kanbanFilters.tags?.length || 0) +
    (kanbanFilters.profiles?.length || 0) +
    (kanbanFilters.tickets?.length || 0) +
    (kanbanFilters.corretor ? 1 : 0) +
    (kanbanFilters.hasProperty !== null && kanbanFilters.hasProperty !== undefined ? 1 : 0) +
    (kanbanFilters.hasCorretor !== null && kanbanFilters.hasCorretor !== undefined ? 1 : 0) +
    (kanbanFilters.hasPermuta !== null && kanbanFilters.hasPermuta !== undefined ? 1 : 0) +
    (kanbanFilters.ticketMin && kanbanFilters.ticketMin > 0 ? 1 : 0) +
    (kanbanFilters.ticketMax && kanbanFilters.ticketMax > 0 ? 1 : 0) +
    (kanbanFilters.condominium ? 1 : 0) +
    (kanbanFilters.propertyCode ? 1 : 0) +
    (kanbanFilters.dateFrom ? 1 : 0) +
    (kanbanFilters.dateTo ? 1 : 0) +
    (kanbanFilters.overdue !== null && kanbanFilters.overdue !== undefined ? 1 : 0);

  const handleRefresh = () => {
    window.location.reload();
  };

  // Adicionar nova coluna ao kanban
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [newColumnStatus, setNewColumnStatus] = useState("");
  const [newColumnColor, setNewColumnColor] = useState("#6B7280");
  const [usedStatuses, setUsedStatuses] = useState<string[]>([]);

  // Todos os status possíveis com labels
  const allStatuses = [
    { value: "NOVO", label: "Novo" },
    { value: "CONTATADO", label: "Contatado" },
    { value: "QUALIFICADO", label: "Qualificado" },
    { value: "NEGOCIANDO", label: "Negociando" },
    { value: "FECHADO", label: "Fechado" },
    { value: "TRIAGEM", label: "Triagem" },
    { value: "VISITA_FRIA", label: "Visita Fria" },
    { value: "VISITA_MORNA", label: "Visita Morna" },
    { value: "VISITA_QUENTE", label: "Visita Quente" },
    { value: "PROPOSTA", label: "Proposta" },
    { value: "SEM_INTERACAO", label: "Sem Interação" },
    { value: "RETORNO", label: "Retorno" },
    { value: "EM_ESPERA", label: "Em Espera" },
  ];

  // Buscar status já usados quando modal abre
  useEffect(() => {
    if (!showAddColumn) return;
    fetch("/api/admin/leads/columns")
      .then((r) => r.json())
      .then((data) => {
        const used = (data.columns || []).map((c: any) => c.status);
        setUsedStatuses(used);
        const firstAvailable = allStatuses.find((s) => !used.includes(s.value));
        setNewColumnStatus(firstAvailable?.value || "");
      })
      .catch(() => {});
  }, [showAddColumn]);

  const handleAddColumn = async () => {
    if (!newColumnTitle.trim()) return;
    try {
      const res = await fetch("/api/admin/leads/columns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newColumnTitle.trim(),
          status: newColumnStatus,
          color: newColumnColor,
        }),
      });
      if (res.ok) {
        setShowAddColumn(false);
        setNewColumnTitle("");
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao criar coluna");
      }
    } catch (error) {
      console.error("Erro ao criar coluna:", error);
    }
  };

  // Deletar todos os leads
  const handleDeleteAll = async () => {
    if (!confirm(`Tem certeza que deseja EXCLUIR PERMANENTEMENTE todos os ${stats.total} leads? Esta ação NÃO pode ser desfeita!`)) return;
    if (!confirm(`ÚLTIMA CONFIRMAÇÃO: Deletar ${stats.total} leads permanentemente?`)) return;
    
    try {
      const res = await fetch("/api/admin/leads/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      if (res.ok) {
        const data = await res.json();
        alert(`${data.deleted} leads deletados com sucesso`);
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao deletar");
      }
    } catch (error) {
      console.error("Erro ao deletar leads:", error);
    }
  };

  // Deletar leads selecionados
  const handleDeleteSelected = async () => {
    const count = selectedLeadIds.size;
    if (count === 0) return;
    if (!confirm(`Tem certeza que deseja EXCLUIR PERMANENTEMENTE ${count} lead(s) selecionado(s)? Esta ação NÃO pode ser desfeita!`)) return;
    
    try {
      const res = await fetch("/api/admin/leads/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedLeadIds) }),
      });
      if (res.ok) {
        const data = await res.json();
        alert(`${data.deleted} leads deletados com sucesso`);
        setSelectionMode(false);
        setSelectedLeadIds(new Set());
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao deletar");
      }
    } catch (error) {
      console.error("Erro ao deletar leads selecionados:", error);
    }
  };

  const toggleSelectAll = () => {
    if (selectedLeadIds.size === allLeadIds.length) {
      setSelectedLeadIds(new Set());
    } else {
      setSelectedLeadIds(new Set(allLeadIds));
    }
  };

  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeadIds(prev => {
      const next = new Set(prev);
      if (next.has(leadId)) next.delete(leadId);
      else next.add(leadId);
      return next;
    });
  };

  // Função para destacar leads que requerem atenção
  const handleAttentionClick = () => {
    // Muda para view kanban se não estiver
    if (view !== "kanban") {
      setView("kanban");
    }
    // Ativa o destaque
    setHighlightAttention(true);
    
    // Scroll para o topo do kanban e piscar o botão
    setTimeout(() => {
      const kanbanElement = document.querySelector('[data-kanban-board]');
      if (kanbanElement) {
        kanbanElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
    
    // Remove o destaque após 5 segundos
    setTimeout(() => setHighlightAttention(false), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Aniversariantes da Semana */}
      {showBirthdays && birthdays.week.length > 0 && (
        <div className="p-3 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-500/10 dark:to-purple-500/10 rounded-xl border border-pink-200 dark:border-pink-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase flex items-center gap-1.5">
              🎂 Aniversariantes da Semana ({birthdays.week.length})
              {birthdays.today.length > 0 && (
                <span className="px-1.5 py-0.5 bg-pink-500 text-white rounded-full text-[10px]">
                  {birthdays.today.length} hoje!
                </span>
              )}
            </span>
            <button onClick={() => setShowBirthdays(false)} className="text-xs text-neutral-400 hover:text-neutral-600">✕</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {birthdays.week.map((b: any) => (
              <div key={b.id} className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:ring-2 hover:ring-orange-300 transition-all ${b.isToday ? "bg-pink-100 dark:bg-pink-500/20 ring-2 ring-pink-400" : "bg-white/60 dark:bg-neutral-800/60"}`}>
                <span className="text-lg">{b.isToday ? "🎉" : "🎂"}</span>
                <button
                  onClick={() => {
                    // Abrir ficha do lead no kanban
                    const kanbanBoard = document.querySelector('[data-kanban-board]');
                    if (kanbanBoard) {
                      const event = new CustomEvent('openLeadDetail', { detail: { leadId: b.id } });
                      kanbanBoard.dispatchEvent(event);
                    }
                  }}
                  className="text-left"
                >
                  <p className="text-xs font-semibold text-neutral-900 dark:text-white hover:text-orange-600 transition-colors">{b.nickname || b.name?.split(" ")[0]}</p>
                  <p className="text-[10px] text-neutral-500">
                    {b.isToday ? "Hoje!" : `em ${b.daysUntil} dia(s)`}
                    {b.age ? ` · ${b.age} anos` : ""}
                  </p>
                </button>
                {b.phone && (
                  <a
                    href={`https://wa.me/55${b.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${b.nickname || b.name?.split(" ")[0]}! 🎂🎉\n\nParabéns pelo seu aniversário! Desejo que esse novo ciclo seja repleto de conquistas e realizações!\n\nUm grande abraço! 🥂`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="ml-1 p-1.5 rounded-lg bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-500/30 transition-colors"
                    title="Enviar parabéns pelo WhatsApp"
                  >
                    💬
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fila SDR - Leads aguardando (apenas admins) */}
      {isAdmin && showQueueBanner && queuePending > 0 && (
        <div className="p-3 bg-gradient-to-r from-orange-50 to-emerald-50 dark:from-orange-500/10 dark:to-emerald-500/10 rounded-xl border border-orange-200 dark:border-orange-500/20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center flex-shrink-0">
            <RiTimeLine className="w-5 h-5 text-orange-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">
              {queuePending} lead{queuePending > 1 ? "s" : ""} aguardando na fila
            </p>
            <p className="text-[11px] text-orange-600/70 dark:text-orange-400/60">
              Leads novos sem corretor — distribua pelo rodízio na SDR
            </p>
          </div>
          <Link
            href="/admin/sdr"
            className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 text-white text-xs font-medium rounded-lg hover:bg-orange-600 transition-colors flex-shrink-0"
          >
            <RiShieldUserLine className="w-3.5 h-3.5" />
            Ir para SDR
          </Link>
          <button onClick={() => setShowQueueBanner(false)} className="text-xs text-neutral-400 hover:text-neutral-600 flex-shrink-0">✕</button>
        </div>
      )}

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
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
                <RiLayoutGridLine className="w-5 h-5 text-orange-500" />
              </div>
              Kanban de Leads
            </h1>
            <p className="text-neutral-500 mt-1">
              Arraste e solte para mover leads entre colunas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
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
              onClick={() => setView("funnel")}
              title="Funil de Vendas"
              className={`p-2 rounded-lg transition-colors ${
                view === "funnel"
                  ? "bg-white dark:bg-neutral-700 text-orange-500 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              <RiFilter3Line className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("charts")}
              title="Gráficos"
              className={`p-2 rounded-lg transition-colors ${
                view === "charts"
                  ? "bg-white dark:bg-neutral-700 text-orange-500 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              <RiPieChartLine className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("table")}
              title="Tabela"
              className={`p-2 rounded-lg transition-colors ${
                view === "table"
                  ? "bg-white dark:bg-neutral-700 text-orange-500 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              <RiTableLine className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("proposals")}
              title="Propostas"
              className={`p-2 rounded-lg transition-colors ${
                view === "proposals"
                  ? "bg-white dark:bg-neutral-700 text-orange-500 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              <RiHandCoinLine className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div className="relative w-64 hidden lg:block">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setKanbanFilters(prev => ({ ...prev, search: e.target.value }));
              }}
              placeholder="Buscar lead..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          {/* Actions */}
          {attentionCount > 0 && (
            <motion.button
              onClick={handleAttentionClick}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`relative p-2.5 rounded-xl border transition-colors ${
                highlightAttention
                  ? "border-red-500 bg-red-500 text-white animate-pulse"
                  : "border-red-300 dark:border-red-500/50 bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20"
              }`}
              title={`${attentionCount} lead(s) requerem atenção`}
            >
              <RiAlertLine className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                {attentionCount}
              </span>
            </motion.button>
          )}
          <button 
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className={`relative p-2.5 rounded-xl border transition-colors ${
              showFiltersPanel || activeFiltersCount > 0 
                ? "border-orange-300 dark:border-orange-500/50 bg-orange-50 dark:bg-orange-500/10 text-orange-500"
                : "border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            }`}
            title="Filtros Avançados"
          >
            <RiFilterLine className="w-4 h-4" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setKanbanFilters(prev => ({ ...prev, sortOrder: prev.sortOrder === "oldest" ? "newest" : "oldest" }))}
            className={`p-2.5 rounded-xl border transition-colors ${
              kanbanFilters.sortOrder === "oldest"
                ? "border-orange-300 dark:border-orange-500/50 bg-orange-50 dark:bg-orange-500/10 text-orange-500"
                : "border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            }`}
            title={kanbanFilters.sortOrder === "oldest" ? "Mais antigos primeiro" : "Mais novos primeiro"}
          >
            {kanbanFilters.sortOrder === "oldest" ? <RiSortAsc className="w-4 h-4" /> : <RiSortDesc className="w-4 h-4" />}
          </button>
          <button 
            onClick={handleRefresh}
            className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <RiRefreshLine className="w-4 h-4" />
          </button>
          {/* Export - apenas ADMIN */}
          {isAdmin && (
            <div className="relative">
              <button
                onClick={() => setShowExportMenu((v) => !v)}
                disabled={isExporting}
                className="flex items-center gap-1.5 h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-sm font-medium disabled:opacity-50"
                title="Exportar leads"
              >
                {isExporting ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiDownload2Line className="w-4 h-4" />}
                <span className="hidden xl:inline">{isExporting ? "Exportando..." : "Exportar"}</span>
              </button>
              {showExportMenu && (
                <div className="absolute right-0 top-12 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl min-w-[140px] overflow-hidden">
                  <button
                    onClick={handleExportCSV}
                    className="w-full text-left px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center gap-2"
                  >
                    <RiDownload2Line className="w-4 h-4" /> Exportar CSV
                  </button>
                  <button
                    onClick={handleExportXLS}
                    className="w-full text-left px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center gap-2"
                  >
                    <RiDownload2Line className="w-4 h-4" /> Exportar XLS
                  </button>
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => setShowAddLeadModal(true)}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors"
          >
            <RiAddLine className="w-4 h-4" />
            <span className="hidden xl:inline">Novo Lead</span>
          </button>
          {/* Botão de configurações oculto — já se pode ordenar manualmente */}
          <Link
            href="/admin/clientes/leads/configuracoes"
            className="flex items-center gap-2 h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-sm font-medium"
            title="Tags, Filas, Automações e Duplicados"
          >
            <RiFlowChart className="w-4 h-4" />
            <span className="hidden xl:inline">Gestão</span>
          </Link>
          {/* Nova Coluna - apenas ADMIN */}
          {isAdmin && <button
            onClick={() => setShowAddColumn(true)}
            className="flex items-center gap-1.5 h-10 px-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors border border-blue-200 dark:border-blue-500/30"
            title="Adicionar nova coluna ao kanban"
          >
            <RiAddCircleLine className="w-4 h-4" />
            <span className="hidden xl:inline">Nova Coluna</span>
          </button>}
          {stats.total > 0 && !selectionMode && (
            <>
              {/* Excluir por Corretor - apenas ADMIN */}
              {isAdmin && <button
                onClick={() => setShowDeleteByCorretor(true)}
                className="flex items-center gap-1.5 h-10 px-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors border border-red-200 dark:border-red-500/30"
                title="Excluir todos os leads de um corretor"
              >
                <RiDeleteBinLine className="w-4 h-4" />
                <span className="hidden xl:inline">Excluir por Corretor</span>
              </button>}
              <button
                onClick={() => { setSelectionMode(true); setSelectedLeadIds(new Set()); }}
                className="flex items-center gap-1.5 h-10 px-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors border border-neutral-200 dark:border-neutral-700"
                title="Ativar modo de seleção para deletar leads"
              >
                <RiCheckboxMultipleLine className="w-4 h-4" />
                <span className="hidden xl:inline">Selecionar</span>
              </button>
            </>
          )}
          {selectionMode && (
            <>
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-1.5 h-10 px-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors border border-blue-200 dark:border-blue-500/30"
                title={selectedLeadIds.size === allLeadIds.length ? "Desmarcar todos" : "Selecionar todos"}
              >
                <RiCheckboxLine className="w-4 h-4" />
                <span className="hidden xl:inline">
                  {selectedLeadIds.size === allLeadIds.length ? "Desmarcar Todos" : `Selecionar Todos (${allLeadIds.length})`}
                </span>
              </button>
              {selectedLeadIds.size > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-1.5 h-10 px-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors border border-red-200 dark:border-red-500/30"
                  title="Deletar leads selecionados"
                >
                  <RiDeleteBinLine className="w-4 h-4" />
                  <span className="hidden xl:inline">Deletar ({selectedLeadIds.size})</span>
                </button>
              )}
              <button
                onClick={() => { setSelectionMode(false); setSelectedLeadIds(new Set()); }}
                className="flex items-center gap-1.5 h-10 px-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-500 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors border border-neutral-200 dark:border-neutral-700"
                title="Cancelar seleção"
              >
                <RiCloseCircleLine className="w-4 h-4" />
                <span className="hidden xl:inline">Cancelar</span>
              </button>
            </>
          )}
          {/* Botão IA temporariamente oculto
          <button 
            onClick={() => setShowAIModal(true)}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:opacity-90 transition-opacity"
          >
            <RiSparklingLine className="w-4 h-4" />
            IA
          </button>
          */}
        </div>
      </div>

      {/* AI Bar 
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <RiSparklingLine className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-900 dark:text-white">
              Automação IA ativa em <strong>2 colunas</strong>
            </p>
            <p className="text-xs text-neutral-500">
              DeepSeek analisa comportamento e move leads automaticamente
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
            Online
          </span>
          <button className="text-sm text-purple-500 font-medium hover:text-purple-600">
            Configurar
          </button>
        </div>
      </motion.div>*/}

      {/* Painel de Filtros Avançados - Expandível */}
      <AdvancedFiltersPanel
        isOpen={showFiltersPanel}
        onClose={() => setShowFiltersPanel(false)}
        filters={kanbanFilters}
        onFiltersChange={setKanbanFilters}
      />

      {/* Stats Bar - Grouped by funnel stage with counters */}
      {(view === "kanban" || view === "table") && stats.columns.length > 0 && (() => {
        const funnelStageNames: Record<string, string> = {
          TRIAGEM: "Triagem",
          QUALIFICACAO: "Qualificação",
          DESENVOLVIMENTO: "Desenvolvimento",
          NEGOCIACAO: "Negociação",
          EFETIVADOS: "Efetivados",
        };
        const funnelStageIcons: Record<string, React.ReactNode> = {
          TRIAGEM: <RiSearch2Line className="w-3.5 h-3.5" />,
          QUALIFICACAO: <RiStarLine className="w-3.5 h-3.5" />,
          DESENVOLVIMENTO: <RiFilter3Line className="w-3.5 h-3.5" />,
          NEGOCIACAO: <RiHandCoinLine className="w-3.5 h-3.5" />,
          EFETIVADOS: <RiCheckDoubleLine className="w-3.5 h-3.5" />,
        };
        const funnelStageColors: Record<string, string> = {
          TRIAGEM: "#6366f1",
          QUALIFICACAO: "#f59e0b",
          DESENVOLVIMENTO: "#3b82f6",
          NEGOCIACAO: "#8b5cf6",
          EFETIVADOS: "#22c55e",
        };
        // Group columns by funnel stage
        const grouped = stats.columns.reduce((acc, col) => {
          const stage = col.funnelStage || "SEM_FASE";
          if (!acc[stage]) acc[stage] = [];
          acc[stage].push(col);
          return acc;
        }, {} as Record<string, typeof stats.columns>);
        // Order: defined funnel stages first, then ungrouped
        const orderedStages = ["TRIAGEM", "QUALIFICACAO", "DESENVOLVIMENTO", "NEGOCIACAO", "EFETIVADOS"].filter(s => grouped[s]);
        if (grouped["SEM_FASE"]) orderedStages.push("SEM_FASE");

        return (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {/* Total */}
            <div className="flex items-center gap-3 p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 min-w-[100px]">
              <div className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.total}</div>
              <div className="text-xs text-neutral-500">Total<br />Leads</div>
            </div>
            {/* Ticket médio */}
            {!!stats.ticketAvg && stats.ticketAvg > 0 && (
              <div className="flex flex-col justify-center p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 min-w-[120px]">
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0, notation: "compact" }).format(stats.ticketAvg)}
                </div>
                <div className="text-xs text-neutral-500">Ticket médio</div>
              </div>
            )}
            {orderedStages.map((stage) => {
              const cols = grouped[stage];
              const stageTotal = cols.reduce((sum, c) => sum + c.count, 0);
              const stageName = funnelStageNames[stage] || "";
              const stageIcon = funnelStageIcons[stage];
              const stageColor = funnelStageColors[stage] || "#6b7280";
              const isFunnel = stage !== "SEM_FASE";

              if (!isFunnel) {
                // Render ungrouped columns individually
                return cols.map((col) => (
                  <div
                    key={col.status}
                    className="flex items-center gap-2 p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 min-w-[100px]"
                  >
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: col.color }} />
                    <div className="text-xl font-bold text-neutral-900 dark:text-white">{col.count}</div>
                    <div className="text-xs text-neutral-500 truncate">{col.label}</div>
                  </div>
                ));
              }

              return (
                <div
                  key={stage}
                  className="flex flex-col p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 min-w-[130px]"
                >
                  {/* Funnel stage header */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: stageColor }}>
                      {stageIcon}
                    </div>
                    <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{stageName}</span>
                    <span className="ml-auto text-lg font-bold text-neutral-900 dark:text-white">{stageTotal}</span>
                  </div>
                  {/* Individual columns */}
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                    {cols.map((col) => (
                      <div key={col.status} className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: col.color }} />
                        <span className="text-[11px] text-neutral-500 truncate">{col.label}</span>
                        <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">{col.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Content Area */}
      {view === "kanban" && (
        <motion.div
          key="kanban"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-[600px]"
        >
          <KanbanBoard highlightAttention={highlightAttention} isAdmin={true} filters={kanbanFilters} selectionMode={selectionMode} selectedLeadIds={selectedLeadIds} onToggleLeadSelection={toggleLeadSelection} onAttentionCount={setAttentionCount} />
        </motion.div>
      )}

      {view === "funnel" && (
        <motion.div
          key="funnel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <LeadsFunnel 
            stats={legacyStats} 
            onOpenLeadDetail={(lead) => setFunnelDetailModal({ open: true, lead: lead as Lead })}
          />
        </motion.div>
      )}

      {view === "charts" && (
        <motion.div
          key="charts"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <LeadsCharts
            stats={legacyStats}
            corretorId={!isAdmin ? user?.id : undefined}
            onFilterApply={(filters) => {
              if (filters.status) {
                setKanbanFilters(prev => ({ ...prev, status: [filters.status as string] }));
              }
              setView("kanban");
            }}
            onViewProposals={() => setView("proposals")}
          />
        </motion.div>
      )}

      {view === "table" && (
        <motion.div
          key="table"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <LeadsTable externalFilters={kanbanFilters} isAdmin={true} />
        </motion.div>
      )}

      {view === "proposals" && (
        <motion.div
          key="proposals"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <LeadsProposalsView isAdmin={isAdmin} currentUserId={user?.id} />
        </motion.div>
      )}

      {/* Modals */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onApply={setSettings}
        currentSettings={settings}
      />

      <AIGlobalModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        leadCount={legacyStats.total}
      />

      {/* Modal de detalhes do lead (usado pelo funil) */}
      <LeadDetailModal
        lead={funnelDetailModal.lead}
        isOpen={funnelDetailModal.open}
        onClose={() => setFunnelDetailModal({ open: false, lead: null })}
        onOpenNotes={() => {}}
        onOpenTags={() => {}}
        onOpenSchedule={() => {}}
        onOpenBudget={() => {}}
        onOpenContract={() => {}}
        onOpenAIAnalysis={() => {}}
      />

      {/* Modal Nova Coluna */}
      {showAddColumn && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setShowAddColumn(false)}>
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-md shadow-xl border border-neutral-200 dark:border-neutral-800" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Nova Coluna do Kanban</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Nome da Coluna</label>
                <input
                  type="text"
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  placeholder="Ex: Visita Morna, Sem Interação..."
                  className="w-full h-10 px-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Status dos leads nesta coluna</label>
                <select
                  value={newColumnStatus}
                  onChange={(e) => setNewColumnStatus(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  {allStatuses.filter((s) => !usedStatuses.includes(s.value)).map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                  {allStatuses.filter((s) => !usedStatuses.includes(s.value)).length === 0 && (
                    <option value="" disabled>Todos os status já estão em uso</option>
                  )}
                </select>
                {allStatuses.filter((s) => !usedStatuses.includes(s.value)).length === 0 && (
                  <p className="text-xs text-red-500 mt-1">Não há status disponíveis. Exclua uma coluna antes de criar outra.</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Cor</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newColumnColor}
                    onChange={(e) => setNewColumnColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 cursor-pointer"
                  />
                  <span className="text-sm text-neutral-500">{newColumnColor}</span>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowAddColumn(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddColumn}
                  disabled={!newColumnTitle.trim() || !newColumnStatus}
                  className="px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Criar Coluna
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Excluir por Corretor */}
      <AnimatePresence>
        {showDeleteByCorretor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => !deletingCorretor && setShowDeleteByCorretor(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 w-full max-w-md max-h-[80vh] overflow-hidden"
            >
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <RiDeleteBinLine className="w-5 h-5 text-red-500" />
                  Excluir Leads por Corretor
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Selecione o corretor para excluir TODOS os leads vinculados
                </p>
              </div>
              <div className="p-4 overflow-y-auto max-h-[50vh] space-y-2">
                {corretoresList.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500">
                    <RiLoader4Line className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Carregando corretores...
                  </div>
                ) : (
                  corretoresList.map((c) => (
                    <button
                      key={c.id}
                      disabled={deletingCorretor}
                      onClick={() => handleDeleteByCorretor(c.id, c.name, c.leadsCount)}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-300 dark:hover:border-red-500/30 transition-colors group disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-sm font-bold text-neutral-600 dark:text-neutral-400">
                          {c.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-neutral-900 dark:text-white">{c.name}</div>
                          <div className="text-xs text-neutral-500">{c.leadsCount} lead{c.leadsCount > 1 ? "s" : ""}</div>
                        </div>
                      </div>
                      <div className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-sm font-medium">
                        <RiDeleteBinLine className="w-4 h-4" />
                        Excluir
                      </div>
                    </button>
                  ))
                )}
              </div>
              <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
                <button
                  onClick={() => setShowDeleteByCorretor(false)}
                  disabled={deletingCorretor}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Novo Lead */}
      <AddLeadModal
        isOpen={showAddLeadModal}
        onClose={() => setShowAddLeadModal(false)}
        onSave={async (data) => {
          const res = await fetch("/api/admin/leads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...data,
              source: data.source || "SITE",
            }),
          });
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || "Erro ao criar lead");
          }
          setShowAddLeadModal(false);
          window.location.reload();
        }}
      />

      {/* Barra flutuante de seleção */}
      {selectionMode && selectedLeadIds.size > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-3 bg-neutral-900 dark:bg-neutral-800 text-white rounded-2xl shadow-2xl border border-neutral-700"
        >
          <span className="text-sm font-medium">
            {selectedLeadIds.size} lead{selectedLeadIds.size > 1 ? "s" : ""} selecionado{selectedLeadIds.size > 1 ? "s" : ""}
          </span>
          <div className="w-px h-5 bg-neutral-600" />
          <button
            onClick={toggleSelectAll}
            className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            {selectedLeadIds.size === allLeadIds.length ? "Desmarcar todos" : "Selecionar todos"}
          </button>
          <button
            onClick={handleDeleteSelected}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
          >
            <RiDeleteBinLine className="w-4 h-4" />
            Deletar selecionados
          </button>
          <button
            onClick={() => { setSelectionMode(false); setSelectedLeadIds(new Set()); }}
            className="p-1.5 rounded-lg hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
            title="Cancelar"
          >
            <RiCloseCircleLine className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
