"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiUserLine,
  RiPhoneLine,
  RiStarLine,
  RiHandCoinLine,
  RiCheckDoubleLine,
  RiCloseLine,
  RiArrowRightLine,
  RiPercentLine,
  RiTimeLine,
  RiTrophyLine,
  RiWhatsappLine,
  RiMailLine,
  RiFireLine,
  RiTempColdLine,
  RiArrowLeftLine,
  RiLoader4Line,
  RiEyeLine,
  RiSearchLine,
  RiFilter3Line,
} from "react-icons/ri";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  temperature: string;
  budget?: number;
  minBudget?: number;
  maxBudget?: number;
  createdAt: string;
  lastContact?: string;
  profile?: string;
}

interface KanbanColumnData {
  id: string;
  title: string;
  status: string;
  color: string;
  funnelStage: string | null;
}

interface FunnelStage {
  id: string;
  name: string;
  key: string;
  count: number;
  value: number;
  color: string;
  gradient: string;
  icon: React.ReactNode;
  conversionRate?: number;
  avgDays?: number;
  statuses: string[];
}

interface LeadsFunnelProps {
  stats: {
    total: number;
    NOVO: number;
    CONTATADO: number;
    QUALIFICADO: number;
    NEGOCIANDO: number;
    FECHADO: number;
    PERDIDO: number;
  };
  onOpenLeadDetail?: (lead: Lead) => void;
  corretorId?: string;
}

// Definição das etapas do funil
const FUNNEL_STAGES_CONFIG = [
  { key: "TRIAGEM", name: "Triagem de Demanda", color: "#3B82F6", gradient: "from-blue-500 to-blue-600", icon: <RiSearchLine className="w-5 h-5" />, avgDays: 2 },
  { key: "QUALIFICACAO", name: "Qualificação", color: "#8B5CF6", gradient: "from-purple-500 to-purple-600", icon: <RiStarLine className="w-5 h-5" />, avgDays: 5 },
  { key: "DESENVOLVIMENTO", name: "Desenvolvimento", color: "#F59E0B", gradient: "from-emerald-500 to-emerald-600", icon: <RiFilter3Line className="w-5 h-5" />, avgDays: 10 },
  { key: "NEGOCIACAO", name: "Em negociação", color: "#10B981", gradient: "from-emerald-500 to-emerald-600", icon: <RiHandCoinLine className="w-5 h-5" />, avgDays: 14 },
  { key: "EFETIVADOS", name: "Efetivados", color: "#22C55E", gradient: "from-green-500 to-green-600", icon: <RiCheckDoubleLine className="w-5 h-5" />, avgDays: 0 },
];

export function LeadsFunnel({ stats, onOpenLeadDetail, corretorId }: LeadsFunnelProps) {
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<FunnelStage | null>(null);
  const [stageLeads, setStageLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [kanbanColumns, setKanbanColumns] = useState<KanbanColumnData[]>([]);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setAnimationComplete(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Buscar colunas do kanban e leads
  useEffect(() => {
    const fetchData = async () => {
      try {
        const leadsUrl = corretorId ? `/api/admin/leads?corretorId=${corretorId}&limit=9999` : "/api/admin/leads?limit=9999";
        const [colRes, leadsRes] = await Promise.all([
          fetch("/api/admin/leads/columns"),
          fetch(leadsUrl),
        ]);
        if (colRes.ok) {
          const colData = await colRes.json();
          setKanbanColumns(colData.columns || []);
        }
        if (leadsRes.ok) {
          const leadsData = await leadsRes.json();
          // Filtrar apenas leads ativos (excluir ARQUIVADO = Acervo/Limbo)
          const activeLeads = (leadsData.leads || []).filter((l: Lead) => l.status !== "ARQUIVADO");
          setAllLeads(activeLeads);
        }
      } catch (err) {
        console.error("Erro ao carregar dados do funil:", err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [corretorId]);

  // Carregar leads quando selecionar uma etapa (filtra por statuses vinculados)
  useEffect(() => {
    if (selectedStage) {
      setLoadingLeads(true);
      const filtered = allLeads.filter(l => selectedStage.statuses.includes(l.status));
      setStageLeads(filtered);
      setLoadingLeads(false);
    }
  }, [selectedStage, allLeads]);

  const handleStageClick = (stage: FunnelStage) => {
    setSelectedStage(stage);
  };

  const formatCurrencyCompact = (value: number) => {
    if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}mi`;
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}mil`;
    return `R$ ${value}`;
  };

  const getTemperatureIcon = (temp: string) => {
    switch (temp) {
      case "QUENTE": return <RiFireLine className="w-3.5 h-3.5 text-red-500" />;
      case "MORNO": return <RiTempColdLine className="w-3.5 h-3.5 text-amber-500" />;
      default: return <RiTempColdLine className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  const getTemperatureColor = (temp: string) => {
    switch (temp) {
      case "QUENTE": return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400";
      case "MORNO": return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400";
      default: return "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  };

  // Montar stages a partir das colunas kanban vinculadas
  const stages: FunnelStage[] = FUNNEL_STAGES_CONFIG.map((cfg, index) => {
    // Encontrar colunas vinculadas a esta fase
    const linkedColumns = kanbanColumns.filter(c => c.funnelStage === cfg.key);
    const linkedStatuses = linkedColumns.map(c => c.status);
    
    // Contar leads nessas colunas
    const stageLeadsFiltered = allLeads.filter(l => linkedStatuses.includes(l.status));
    const count = stageLeadsFiltered.length;
    // Usar valor médio real do budget dos leads
    const value = stageLeadsFiltered.reduce((sum, l) => {
      if (l.minBudget && l.maxBudget) return sum + (l.minBudget + l.maxBudget) / 2;
      if (l.budget) return sum + l.budget;
      return sum;
    }, 0);
    
    // Calcular conversão para a próxima etapa
    const nextCfg = FUNNEL_STAGES_CONFIG[index + 1];
    let conversionRate: number | undefined;
    if (nextCfg) {
      const nextLinked = kanbanColumns.filter(c => c.funnelStage === nextCfg.key);
      const nextStatuses = nextLinked.map(c => c.status);
      const nextCount = allLeads.filter(l => nextStatuses.includes(l.status)).length;
      conversionRate = count > 0 ? Math.round((nextCount / count) * 100) : 0;
    }
    
    return {
      id: cfg.key.toLowerCase(),
      name: cfg.name,
      key: cfg.key,
      count,
      value,
      color: cfg.color,
      gradient: cfg.gradient,
      icon: cfg.icon,
      conversionRate,
      avgDays: cfg.avgDays,
      statuses: linkedStatuses,
    };
  });

  const maxCount = Math.max(...stages.map(s => s.count), 1);
  const totalValue = stages.reduce((acc, s) => acc + s.value, 0);
  const overallConversion = stats.total > 0 ? Math.round((stats.FECHADO / stats.total) * 100) : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <RiUserLine className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-white/80">Total de Leads</span>
          </div>
          <p className="text-3xl font-bold">{stats.total}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <RiTrophyLine className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-white/80">Taxa de Conversão</span>
          </div>
          <p className="text-3xl font-bold">{overallConversion}%</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <RiTimeLine className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-white/80">Tempo Médio</span>
          </div>
          <p className="text-3xl font-bold">
            {allLeads.length > 0
              ? `${Math.round(allLeads.reduce((sum, l) => {
                  const created = new Date(l.createdAt).getTime();
                  const now = Date.now();
                  return sum + (now - created) / (1000 * 60 * 60 * 24);
                }, 0) / allLeads.length)} dias`
              : "0 dias"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <RiPercentLine className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-white/80">Valor Pipeline</span>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(totalValue)}</p>
        </motion.div>
      </div>

      {/* Funnel Visualization */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6"
      >
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">
          Funil de Conversão
        </h3>

        <div className="relative">
          {/* Funnel Stages */}
          <div className="space-y-3">
            {stages.map((stage, index) => {
              const widthPercent = 100 - (index * 15);
              const isHovered = hoveredStage === stage.id;
              
              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="relative"
                  onMouseEnter={() => setHoveredStage(stage.id)}
                  onMouseLeave={() => setHoveredStage(null)}
                >
                  {/* Stage Bar */}
                  <div
                    className="relative mx-auto transition-all duration-300"
                    style={{ width: `${widthPercent}%` }}
                  >
                    <motion.div
                      className={`relative h-20 rounded-2xl bg-gradient-to-r ${stage.gradient} cursor-pointer overflow-hidden ${selectedStage?.id === stage.id ? "ring-4 ring-white/50 shadow-2xl" : ""}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleStageClick(stage)}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {/* Animated Background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 animate-shimmer" />
                      
                      {/* Content */}
                      <div className="relative h-full flex items-center justify-between px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white">
                            {stage.icon}
                          </div>
                          <div>
                            <p className="text-white font-semibold text-lg">{stage.name}</p>
                            <p className="text-white/70 text-sm">
                              {stage.avgDays ? `~${stage.avgDays} dias em média` : "Concluído"}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-3xl font-bold text-white">{stage.count}</p>
                          <p className="text-white/70 text-sm">{formatCurrency(stage.value)}</p>
                        </div>
                      </div>

                      {/* Progress indicator */}
                      <motion.div
                        className="absolute bottom-0 left-0 h-1 bg-white/30"
                        initial={{ width: 0 }}
                        animate={{ width: `${(stage.count / maxCount) * 100}%` }}
                        transition={{ delay: 1 + index * 0.1, duration: 0.8 }}
                      />
                    </motion.div>

                    {/* Conversion Arrow */}
                    {index < stages.length - 1 && stage.conversionRate !== undefined && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5 + index * 0.1 }}
                        className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10"
                      >
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                          stage.conversionRate >= 50 
                            ? "bg-green-500 text-white" 
                            : stage.conversionRate >= 25 
                              ? "bg-amber-500 text-white"
                              : "bg-red-500 text-white"
                        }`}>
                          <RiArrowRightLine className="w-3 h-3 rotate-90" />
                          {stage.conversionRate}%
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Hover Details */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full ml-4 z-20"
                      >
                        <div className="bg-neutral-900 dark:bg-neutral-800 text-white rounded-xl p-4 shadow-2xl min-w-[200px]">
                          <p className="font-semibold mb-2">{stage.name}</p>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-neutral-400">Leads:</span>
                              <span className="font-medium">{stage.count}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-400">Valor:</span>
                              <span className="font-medium">{formatCurrency(stage.value)}</span>
                            </div>
                            {stage.conversionRate !== undefined && (
                              <div className="flex justify-between">
                                <span className="text-neutral-400">Conversão:</span>
                                <span className="font-medium">{stage.conversionRate}%</span>
                              </div>
                            )}
                            {stage.avgDays !== undefined && stage.avgDays > 0 && (
                              <div className="flex justify-between">
                                <span className="text-neutral-400">Tempo médio:</span>
                                <span className="font-medium">{stage.avgDays} dias</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Lost Leads Indicator */}
          {stats.PERDIDO > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="mt-6 flex items-center justify-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-200 dark:border-red-500/20"
            >
              <RiCloseLine className="w-5 h-5 text-red-500" />
              <span className="text-red-600 dark:text-red-400 font-medium">
                {stats.PERDIDO} leads perdidos
              </span>
              <span className="text-red-500/60 text-sm">
                ({Math.round((stats.PERDIDO / stats.total) * 100)}% do total)
              </span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Stage Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {stages.map((stage, index) => (
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2 + index * 0.1 }}
            className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div 
                className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stage.gradient} flex items-center justify-center text-white`}
              >
                {stage.icon}
              </div>
              <div>
                <p className="font-medium text-neutral-900 dark:text-white text-sm">{stage.name}</p>
                <p className="text-2xl font-bold" style={{ color: stage.color }}>{stage.count}</p>
              </div>
            </div>
            
            {stage.conversionRate !== undefined && (
              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Conversão</span>
                  <span className={`font-bold ${
                    stage.conversionRate >= 50 ? "text-green-500" : 
                    stage.conversionRate >= 25 ? "text-amber-500" : "text-red-500"
                  }`}>
                    {stage.conversionRate}%
                  </span>
                </div>
                <div className="mt-2 h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${stage.gradient}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${stage.conversionRate}%` }}
                    transition={{ delay: 2.5 + index * 0.1, duration: 0.5 }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Slide Panel - Lista de Leads da Etapa Selecionada */}
      <AnimatePresence>
        {selectedStage && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              onClick={() => setSelectedStage(null)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-neutral-900 shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div 
                className={`p-6 bg-gradient-to-r ${selectedStage.gradient} text-white`}
              >
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setSelectedStage(null)}
                    className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                  >
                    <RiArrowLeftLine className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white/80">Etapa do Funil</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                    {selectedStage.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedStage.name}</h2>
                    <p className="text-white/80">
                      {selectedStage.count} leads • {formatCurrency(selectedStage.value)}
                    </p>
                  </div>
                </div>

                {/* Mini Stats */}
                <div className="grid grid-cols-3 gap-3 mt-6">
                  <div className="bg-white/10 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold">{selectedStage.count}</p>
                    <p className="text-xs text-white/70">Leads</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold">{selectedStage.conversionRate || 0}%</p>
                    <p className="text-xs text-white/70">Conversão</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold">{selectedStage.avgDays || 0}d</p>
                    <p className="text-xs text-white/70">Tempo Médio</p>
                  </div>
                </div>
              </div>

              {/* Leads List */}
              <div className="flex-1 overflow-y-auto p-4">
                {loadingLeads ? (
                  <div className="flex items-center justify-center py-12">
                    <RiLoader4Line className="w-8 h-8 animate-spin text-neutral-400" />
                  </div>
                ) : stageLeads.length === 0 ? (
                  <div className="text-center py-12">
                    <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${selectedStage.gradient} flex items-center justify-center text-white mb-4 opacity-50`}>
                      {selectedStage.icon}
                    </div>
                    <p className="text-neutral-500 font-medium">Nenhum lead nesta etapa</p>
                    <p className="text-neutral-400 text-sm mt-1">Os leads aparecerão aqui quando entrarem nesta etapa</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stageLeads.map((lead, index) => (
                      <motion.div
                        key={lead.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group bg-neutral-50 dark:bg-neutral-800 rounded-xl p-4 hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div 
                            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedStage.gradient} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}
                          >
                            {lead.name.charAt(0).toUpperCase()}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-neutral-900 dark:text-white truncate">
                                {lead.name}
                              </h4>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${getTemperatureColor(lead.temperature)}`}>
                                {getTemperatureIcon(lead.temperature)}
                                {lead.temperature === "QUENTE" ? "Quente" : lead.temperature === "MORNO" ? "Morno" : "Frio"}
                              </span>
                            </div>

                            {/* Budget */}
                            {(lead.budget || lead.minBudget || lead.maxBudget) && (
                              <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                                {lead.minBudget && lead.maxBudget 
                                  ? `${formatCurrencyCompact(lead.minBudget)} - ${formatCurrencyCompact(lead.maxBudget)}`
                                  : lead.budget 
                                    ? formatCurrencyCompact(lead.budget)
                                    : ""}
                              </p>
                            )}

                            {/* Contact Info */}
                            <div className="flex items-center gap-3 text-xs text-neutral-500">
                              <span className="flex items-center gap-1">
                                <RiTimeLine className="w-3 h-3" />
                                {formatDate(lead.createdAt)}
                              </span>
                              {lead.lastContact && (
                                <span className="flex items-center gap-1">
                                  Último contato: {formatDate(lead.lastContact)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <a
                              href={`https://wa.me/55${lead.phone?.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                            >
                              <RiWhatsappLine className="w-4 h-4" />
                            </a>
                            <a
                              href={`mailto:${lead.email}`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                            >
                              <RiMailLine className="w-4 h-4" />
                            </a>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onOpenLeadDetail) {
                                  onOpenLeadDetail(lead as any);
                                  setSelectedStage(null);
                                }
                              }}
                              className="p-2 rounded-lg bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors"
                            >
                              <RiEyeLine className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
                <a
                  href={`/admin/clientes/leads?funnelStage=${selectedStage.key}`}
                  className={`w-full py-3 rounded-xl bg-gradient-to-r ${selectedStage.gradient} text-white font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-shadow`}
                >
                  Ver todos os {selectedStage.count} leads
                  <RiArrowRightLine className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
