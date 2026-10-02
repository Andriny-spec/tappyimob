"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCloseLine,
  RiFilterLine,
  RiRestartLine,
  RiSearchLine,
  RiMegaphoneLine,
  RiUserLine,
  RiPhoneLine,
  RiMoneyDollarCircleLine,
  RiHome4Line,
  RiCalendarLine,
  RiFireLine,
  RiPriceTag3Line,
  RiTimeLine,
  RiAlertLine,
  RiSave3Line,
  RiBookmarkLine,
  RiDeleteBinLine,
  RiArrowDownSLine,
} from "react-icons/ri";

import {
  leadStatusLabels,
  leadSourceLabels,
  leadProfileLabels,
  leadTicketLabels,
  leadTemperatureLabels,
  leadTemperatureColors,
  tagColors,
} from "@/types/lead";
import type { KanbanFilters } from "./KanbanBoard";

interface DynamicTag {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface KanbanColumnInfo {
  id: string;
  title: string;
  status: string;
  color: string;
}

interface Corretor {
  id: string;
  name: string;
  avatar: string | null;
}

interface SavedFilter {
  id: string;
  name: string;
  filters: KanbanFilters;
}

interface AdvancedFiltersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: KanbanFilters;
  onFiltersChange: (filters: KanbanFilters) => void;
  isAdmin?: boolean;
}

const emptyFilters: KanbanFilters = {
  search: "",
  name: "",
  phone: "",
  temperature: [],
  status: [],
  sources: [],
  tags: [],
  profiles: [],
  tickets: [],
  corretor: "",
  hasProperty: null,
  hasCorretor: null,
  hasPermuta: null,
  hasDirectInstallment: null,
  hasVisit: null,
  hasProposal: null,
  typologies: [],
  ticketMin: 0,
  ticketMax: 0,
  condominiums: [],
  propertyCode: "",
  campanha: "",
  dateFrom: "",
  dateTo: "",
  overdue: null,
};

const fallbackTags = Object.keys(tagColors);

export function AdvancedFiltersPanel({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  isAdmin = true,
}: AdvancedFiltersPanelProps) {
  const [local, setLocal] = useState<KanbanFilters>(filters);
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [saveFilterName, setSaveFilterName] = useState("");
  const [showPresets, setShowPresets] = useState(false);
  const presetsRef = useRef<HTMLDivElement>(null);
  const [dynamicTags, setDynamicTags] = useState<DynamicTag[]>([]);
  const [kanbanColumns, setKanbanColumns] = useState<KanbanColumnInfo[]>([]);
  const [availableCondominiums, setAvailableCondominiums] = useState<string[]>([]);
  const [condominiumSearch, setCondominiumSearch] = useState("");
  const [sourceSearch, setSourceSearch] = useState("");
  const [sourceDropdownOpen, setSourceDropdownOpen] = useState(false);
  const sourceRef = useRef<HTMLDivElement>(null);

  // Helpers de formatação
  const formatCurrency = (value: number | undefined): string => {
    if (!value || value === 0) return "";
    return value.toLocaleString("pt-BR");
  };
  const parseCurrency = (str: string): number => {
    return parseInt(str.replace(/\D/g, "")) || 0;
  };
  const formatPhone = (value: string): string => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  useEffect(() => {
    setLocal(filters);
  }, [filters]);

  // Buscar corretores, tags, colunas kanban e condomínios da API
  useEffect(() => {
    fetch("/api/admin/corretores?isActive=true")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCorretores(data.map((c: any) => ({ id: c.id, name: c.name, avatar: c.avatar })));
        }
      })
      .catch(() => {});

    fetch("/api/admin/leads/tags")
      .then((res) => res.json())
      .then((data) => {
        if (data.tags && Array.isArray(data.tags)) {
          setDynamicTags(data.tags);
        }
      })
      .catch(() => {});

    fetch("/api/admin/leads/columns")
      .then((res) => res.json())
      .then((data) => {
        if (data.columns && Array.isArray(data.columns)) {
          setKanbanColumns(data.columns);
        }
      })
      .catch(() => {});

    fetch("/api/admin/leads/condominiums")
      .then((res) => res.json())
      .then((data) => {
        if (data.condominiums && Array.isArray(data.condominiums)) {
          setAvailableCondominiums(data.condominiums);
        }
      })
      .catch(() => {});
  }, []);

  // Carregar filtros salvos do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("tappyimob_saved_lead_filters");
      if (stored) setSavedFilters(JSON.parse(stored));
    } catch {}
  }, []);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (presetsRef.current && !presetsRef.current.contains(e.target as Node)) {
        setShowPresets(false);
      }
      if (sourceRef.current && !sourceRef.current.contains(e.target as Node)) {
        setSourceDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Aplicar automaticamente ao mudar
  const update = (patch: Partial<KanbanFilters>) => {
    const next = { ...local, ...patch };
    setLocal(next);
    onFiltersChange(next);
  };

  const handleSaveFilter = () => {
    if (!saveFilterName.trim()) return;
    const newPreset: SavedFilter = {
      id: `preset-${Date.now()}`,
      name: saveFilterName.trim(),
      filters: { ...local },
    };
    const updated = [...savedFilters, newPreset];
    setSavedFilters(updated);
    localStorage.setItem("tappyimob_saved_lead_filters", JSON.stringify(updated));
    setSaveFilterName("");
    setShowSaveInput(false);
  };

  const handleLoadFilter = (preset: SavedFilter) => {
    setLocal(preset.filters);
    onFiltersChange(preset.filters);
    setShowPresets(false);
  };

  const handleDeleteFilter = (id: string) => {
    const updated = savedFilters.filter((f) => f.id !== id);
    setSavedFilters(updated);
    localStorage.setItem("tappyimob_saved_lead_filters", JSON.stringify(updated));
  };

  const toggleArray = (key: keyof KanbanFilters, value: string) => {
    const arr = (local[key] as string[]) || [];
    const next = arr.includes(value)
      ? arr.filter((v) => v !== value)
      : [...arr, value];
    update({ [key]: next });
  };

  const handleReset = () => {
    setLocal(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const activeCount =
    (local.name ? 1 : 0) +
    (local.phone ? 1 : 0) +
    (local.temperature?.length || 0) +
    (local.status?.length || 0) +
    (local.sources?.length || 0) +
    (local.tags?.length || 0) +
    (local.profiles?.length || 0) +
    (local.tickets?.length || 0) +
    (local.corretor ? 1 : 0) +
    (local.hasProperty !== null && local.hasProperty !== undefined ? 1 : 0) +
    (local.hasCorretor !== null && local.hasCorretor !== undefined ? 1 : 0) +
    (local.hasPermuta !== null && local.hasPermuta !== undefined ? 1 : 0) +
    (local.hasVisit !== null && local.hasVisit !== undefined ? 1 : 0) +
    (local.hasProposal !== null && local.hasProposal !== undefined ? 1 : 0) +
    (local.ticketMin && local.ticketMin > 0 ? 1 : 0) +
    (local.ticketMax && local.ticketMax > 0 ? 1 : 0) +
    (local.condominium ? 1 : 0) +
    (local.condominiums?.length || 0) +
    (local.propertyCode ? 1 : 0) +
    (local.campanha ? 1 : 0) +
    (local.dateFrom ? 1 : 0) +
    (local.dateTo ? 1 : 0) +
    (local.overdue !== null && local.overdue !== undefined ? 1 : 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <RiFilterLine className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                  Filtros Avançados
                </span>
                {activeCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-bold">
                    {activeCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* Presets dropdown */}
                <div className="relative" ref={presetsRef}>
                  <button
                    onClick={() => setShowPresets(!showPresets)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <RiBookmarkLine className="w-3.5 h-3.5" />
                    Favoritos
                    {savedFilters.length > 0 && (
                      <span className="ml-0.5 w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-[10px] font-bold flex items-center justify-center">
                        {savedFilters.length}
                      </span>
                    )}
                    <RiArrowDownSLine className="w-3 h-3" />
                  </button>
                  {showPresets && (
                    <div className="absolute right-0 top-full mt-1 w-64 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-xl z-50 overflow-hidden">
                      <div className="p-2 border-b border-neutral-100 dark:border-neutral-700">
                        <p className="text-xs font-semibold text-neutral-500 px-2 py-1">Filtros salvos</p>
                      </div>
                      {savedFilters.length === 0 ? (
                        <div className="p-3 text-center">
                          <p className="text-xs text-neutral-400 italic">Nenhum filtro salvo</p>
                        </div>
                      ) : (
                        <div className="max-h-48 overflow-y-auto">
                          {savedFilters.map((preset) => (
                            <div
                              key={preset.id}
                              className="flex items-center justify-between px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                            >
                              <button
                                onClick={() => handleLoadFilter(preset)}
                                className="flex-1 text-left text-xs font-medium text-neutral-700 dark:text-neutral-300 truncate"
                              >
                                {preset.name}
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteFilter(preset.id); }}
                                className="p-1 rounded text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                              >
                                <RiDeleteBinLine className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* Save current filter */}
                {activeCount > 0 && !showSaveInput && (
                  <button
                    onClick={() => setShowSaveInput(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors"
                  >
                    <RiSave3Line className="w-3.5 h-3.5" />
                    Salvar
                  </button>
                )}
                {showSaveInput && (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={saveFilterName}
                      onChange={(e) => setSaveFilterName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveFilter()}
                      placeholder="Nome do filtro..."
                      className="h-7 w-32 px-2 rounded-md bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                      autoFocus
                    />
                    <button onClick={handleSaveFilter} className="p-1 rounded text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/10">
                      <RiSave3Line className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => { setShowSaveInput(false); setSaveFilterName(""); }} className="p-1 rounded text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                      <RiCloseLine className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                {activeCount > 0 && (
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <RiRestartLine className="w-3.5 h-3.5" />
                    Limpar
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 transition-colors"
                >
                  <RiCloseLine className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filtros em Grid */}
            <div className="p-5 space-y-5">
              {/* Linha 1: Busca por Nome, Telefone, Corretor */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-neutral-500 mb-1.5 flex items-center gap-1.5">
                    <RiUserLine className="w-3.5 h-3.5" />
                    Nome do Lead
                  </label>
                  <input
                    type="text"
                    value={local.name || ""}
                    onChange={(e) => update({ name: e.target.value })}
                    placeholder="Buscar por nome..."
                    className="w-full h-9 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 mb-1.5 flex items-center gap-1.5">
                    <RiPhoneLine className="w-3.5 h-3.5" />
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={local.phone ? formatPhone(local.phone) : ""}
                    onChange={(e) => update({ phone: e.target.value.replace(/\D/g, "") })}
                    placeholder="(XX) XXXXX-XXXX"
                    maxLength={16}
                    className="w-full h-9 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                  />
                </div>
                {isAdmin && (
                  <div>
                    <label className="text-xs font-medium text-neutral-500 mb-1.5 flex items-center gap-1.5">
                      <RiUserLine className="w-3.5 h-3.5" />
                      Corretor
                    </label>
                    <select
                      value={local.corretor || ""}
                      onChange={(e) => update({ corretor: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 appearance-none"
                      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%239ca3af\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
                    >
                      <option value="">Todos os corretores</option>
                      {corretores.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Linha 2: Temperatura e Finalidade */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-neutral-500 mb-1.5 flex items-center gap-1.5">
                    <RiFireLine className="w-3.5 h-3.5" />
                    Temperatura
                  </label>
                  <div className="flex gap-2">
                    {(Object.entries(leadTemperatureLabels) as [string, string][]).map(
                      ([key, label]) => (
                        <button
                          key={key}
                          onClick={() => toggleArray("temperature", key)}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                            local.temperature?.includes(key)
                              ? "text-white border-transparent shadow-sm"
                              : "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                          }`}
                          style={{
                            backgroundColor: local.temperature?.includes(key)
                              ? leadTemperatureColors[key as keyof typeof leadTemperatureColors]
                              : undefined,
                          }}
                        >
                          {key === "QUENTE" && <RiFireLine className="w-3 h-3" />}
                          {key === "MORNO" && <span>🌡️</span>}
                          {key === "FRIO" && <span>❄️</span>}
                          {label}
                        </button>
                      )
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 mb-1.5 flex items-center gap-1.5">
                    <RiPriceTag3Line className="w-3.5 h-3.5" />
                    Finalidade
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {([
                      { key: "COMPRA", label: "Compra", color: "#3b82f6" },
                      { key: "LOCACAO", label: "Locação", color: "#8b5cf6" },
                      { key: "INVESTIMENTO", label: "Investimento", color: "#f59e0b" },
                      { key: "PERMUTA", label: "Permuta", color: "#ec4899" },
                      { key: "LANCAMENTO", label: "Lançamento", color: "#06b6d4" },
                    ]).map(({ key, label, color }) => (
                      <button
                        key={key}
                        onClick={() => toggleArray("tickets", key)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                          local.tickets?.includes(key)
                            ? "text-white border-transparent"
                            : "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        }`}
                        style={local.tickets?.includes(key) ? { backgroundColor: color } : {}}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Linha 3: Status e Origem */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-neutral-500 mb-1.5 block">
                    Etapa / Coluna
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(kanbanColumns.length > 0
                      ? kanbanColumns.map((col) => ({ key: col.status, label: col.title, color: col.color }))
                      : (Object.entries(leadStatusLabels) as [string, string][]).map(([key, label]) => ({ key, label, color: undefined as string | undefined }))
                    ).map(({ key, label, color }) => (
                      <button
                        key={key}
                        onClick={() => toggleArray("status", key)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          local.status?.includes(key)
                            ? "text-white shadow-sm"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                        }`}
                        style={{
                          backgroundColor: local.status?.includes(key) ? (color || "#25D366") : undefined,
                        }}
                      >
                        {color && (
                          <span
                            className="w-2 h-2 rounded-sm flex-shrink-0"
                            style={{ backgroundColor: color }}
                          />
                        )}
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                {isAdmin && (
                  <div ref={sourceRef}>
                    <label className="text-xs font-medium text-neutral-500 mb-1.5 block">
                      Origem
                    </label>
                    {/* Selected sources */}
                    {(local.sources?.length || 0) > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1.5">
                        {local.sources!.map((s) => (
                          <span
                            key={s}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-medium"
                          >
                            {leadSourceLabels[s] || s}
                            <button
                              onClick={() => {
                                const next = local.sources!.filter((x) => x !== s);
                                update({ sources: next });
                              }}
                              className="hover:text-red-500 transition-colors"
                            >
                              <RiCloseLine className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    {/* Search + dropdown */}
                    <div className="relative">
                      <input
                        type="text"
                        value={sourceSearch}
                        onChange={(e) => { setSourceSearch(e.target.value); setSourceDropdownOpen(true); }}
                        onFocus={() => setSourceDropdownOpen(true)}
                        placeholder="Buscar origem..."
                        className="w-full h-9 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                      />
                      {sourceDropdownOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-xl max-h-48 overflow-y-auto">
                          {(Object.entries(leadSourceLabels) as [string, string][])
                            .filter(
                              ([key, label]) =>
                                (label.toLowerCase().includes(sourceSearch.toLowerCase()) ||
                                 key.toLowerCase().includes(sourceSearch.toLowerCase())) &&
                                !(local.sources || []).includes(key)
                            )
                            .slice(0, 15)
                            .map(([key, label]) => (
                              <button
                                key={key}
                                onClick={() => {
                                  update({ sources: [...(local.sources || []), key] });
                                  setSourceSearch("");
                                  setSourceDropdownOpen(false);
                                }}
                                className="w-full px-3 py-2 text-left text-xs text-neutral-700 dark:text-neutral-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                              >
                                {label}
                              </button>
                            ))}
                          {(Object.entries(leadSourceLabels) as [string, string][]).filter(
                            ([key, label]) =>
                              (label.toLowerCase().includes(sourceSearch.toLowerCase()) ||
                               key.toLowerCase().includes(sourceSearch.toLowerCase())) &&
                              !(local.sources || []).includes(key)
                          ).length === 0 && (
                            <p className="px-3 py-2 text-xs text-neutral-400 italic">Nenhuma origem encontrada</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Linha 4: Perfil e Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-neutral-500 mb-1.5 block">
                    Perfil do Cliente
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(Object.entries(leadProfileLabels) as [string, string][]).map(
                      ([key, label]) => (
                        <button
                          key={key}
                          onClick={() => toggleArray("profiles", key)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                            local.profiles?.includes(key)
                              ? "bg-purple-500 text-white"
                              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                          }`}
                        >
                          {label}
                        </button>
                      )
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 mb-1.5 block">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(dynamicTags.length > 0 ? dynamicTags : fallbackTags.map(t => ({ id: t, name: t, slug: t, color: tagColors[t] || "#6b7280" }))).map((tag) => (
                      <button
                        key={tag.slug}
                        onClick={() => toggleArray("tags", tag.slug)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          local.tags?.includes(tag.slug)
                            ? "text-white"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                        }`}
                        style={{
                          backgroundColor: local.tags?.includes(tag.slug)
                            ? tag.color
                            : undefined,
                        }}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Linha 4b: Tipologias e Condições */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-neutral-500 mb-1.5 flex items-center gap-1.5">
                    <RiHome4Line className="w-3.5 h-3.5" />
                    Tipologias de Busca
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { key: "APARTAMENTO", label: "Apartamento" },
                      { key: "CASA", label: "Casa" },
                      { key: "TERRENO", label: "Terreno" },
                      { key: "COBERTURA", label: "Cobertura" },
                      { key: "FLAT", label: "Flat" },
                      { key: "STUDIO", label: "Studio" },
                      { key: "SOBRADO", label: "Sobrado" },
                      { key: "COMERCIAL", label: "Comercial" },
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => toggleArray("typologies", key)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          local.typologies?.includes(key)
                            ? "bg-indigo-500 text-white"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 mb-1.5 flex items-center gap-1.5">
                    <RiPriceTag3Line className="w-3.5 h-3.5" />
                    Condições de Compra
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => update({ hasDirectInstallment: local.hasDirectInstallment === true ? null : true })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        local.hasDirectInstallment === true
                          ? "bg-blue-500 text-white"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      }`}
                    >
                      Parcelamento direto
                    </button>
                    <button
                      onClick={() => update({ hasPermuta: local.hasPermuta === true ? null : true })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        local.hasPermuta === true
                          ? "bg-pink-500 text-white"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      }`}
                    >
                      Permuta
                    </button>
                  </div>
                </div>
              </div>

              {/* Linha 5: Ticket de Valor, Código Imóvel, Condomínio, Data */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-medium text-neutral-500 mb-1.5 flex items-center gap-1.5">
                    <RiMoneyDollarCircleLine className="w-3.5 h-3.5" />
                    Faixa de Preço
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400">R$</span>
                      <input
                        type="text"
                        value={formatCurrency(local.ticketMin)}
                        onChange={(e) =>
                          update({ ticketMin: parseCurrency(e.target.value) })
                        }
                        placeholder="Mínimo"
                        className="w-full h-9 pl-8 pr-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                      />
                    </div>
                    <span className="text-xs text-neutral-400">até</span>
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400">R$</span>
                      <input
                        type="text"
                        value={formatCurrency(local.ticketMax)}
                        onChange={(e) =>
                          update({ ticketMax: parseCurrency(e.target.value) })
                        }
                        placeholder="Máximo"
                        className="w-full h-9 pl-8 pr-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 mb-1.5 flex items-center gap-1.5">
                    <RiSearchLine className="w-3.5 h-3.5" />
                    Código do Imóvel
                  </label>
                  <input
                    type="text"
                    value={local.propertyCode || ""}
                    onChange={(e) => update({ propertyCode: e.target.value })}
                    placeholder="Ex: AP-001, CS-123..."
                    className="w-full h-9 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 mb-1.5 flex items-center gap-1.5">
                    <RiMegaphoneLine className="w-3.5 h-3.5" />
                    Campanha / Origem
                  </label>
                  <input
                    type="text"
                    value={local.campanha || ""}
                    onChange={(e) => update({ campanha: e.target.value })}
                    placeholder="Ex: google, cpc, black-novembro..."
                    className="w-full h-9 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                  />
                  <p className="mt-1 text-[11px] text-neutral-400">
                    Busca em origem, mídia e nome da campanha ao mesmo tempo.
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 mb-1.5 flex items-center gap-1.5">
                    <RiHome4Line className="w-3.5 h-3.5" />
                    Condomínios / Empreendimentos
                  </label>
                  {/* Selected condominiums */}
                  {(local.condominiums?.length || 0) > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1.5">
                      {local.condominiums!.map((c) => (
                        <span
                          key={c}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 text-xs font-medium"
                        >
                          {c}
                          <button
                            onClick={() => {
                              const next = local.condominiums!.filter((x) => x !== c);
                              update({ condominiums: next });
                            }}
                            className="hover:text-red-500 transition-colors"
                          >
                            <RiCloseLine className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Search + dropdown */}
                  <div className="relative">
                    <input
                      type="text"
                      value={condominiumSearch}
                      onChange={(e) => setCondominiumSearch(e.target.value)}
                      placeholder="Buscar condomínio..."
                      className="w-full h-9 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                    />
                    {condominiumSearch && (
                      <div className="absolute z-50 w-full mt-1 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-xl max-h-40 overflow-y-auto">
                        {availableCondominiums
                          .filter(
                            (c) =>
                              c.toLowerCase().includes(condominiumSearch.toLowerCase()) &&
                              !(local.condominiums || []).includes(c)
                          )
                          .slice(0, 10)
                          .map((c) => (
                            <button
                              key={c}
                              onClick={() => {
                                update({ condominiums: [...(local.condominiums || []), c] });
                                setCondominiumSearch("");
                              }}
                              className="w-full px-3 py-2 text-left text-xs text-neutral-700 dark:text-neutral-300 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors"
                            >
                              {c}
                            </button>
                          ))}
                        {availableCondominiums.filter(
                          (c) =>
                            c.toLowerCase().includes(condominiumSearch.toLowerCase()) &&
                            !(local.condominiums || []).includes(c)
                        ).length === 0 && (
                          <p className="px-3 py-2 text-xs text-neutral-400 italic">Nenhum encontrado</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500 mb-1.5 flex items-center gap-1.5">
                    <RiCalendarLine className="w-3.5 h-3.5" />
                    Data de Criação
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={local.dateFrom || ""}
                      onChange={(e) => update({ dateFrom: e.target.value })}
                      className="flex-1 h-9 px-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                    />
                    <span className="text-xs text-neutral-400">até</span>
                    <input
                      type="date"
                      value={local.dateTo || ""}
                      onChange={(e) => update({ dateTo: e.target.value })}
                      className="flex-1 h-9 px-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Linha 6: Filtros Especiais */}
              <div>
                <label className="text-xs font-medium text-neutral-500 mb-1.5 block">
                  Filtros Especiais
                </label>
                <div className="flex flex-wrap gap-2">
                  {/* Em atraso - destaque para corretor (aparece primeiro) */}
                  {[
                    { value: null, label: "Todos" },
                    { value: true, label: "Em atraso" },
                    { value: false, label: "Em dia" },
                  ].map((opt) => (
                    <button
                      key={`over-${String(opt.value)}`}
                      onClick={() => update({ overdue: opt.value })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                        local.overdue === opt.value
                          ? "bg-red-500 text-white border-red-500"
                          : !isAdmin && opt.value === true
                            ? "bg-red-50 dark:bg-red-500/10 border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20"
                            : "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100"
                      }`}
                    >
                      <RiAlertLine className="w-3 h-3 inline mr-1" />
                      {opt.label}
                    </button>
                  ))}

                  {/* Filtro hasProperty oculto — será substituído por filtro específico de permuta */}

                  {isAdmin && (
                    <>
                      <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700 self-center" />

                      {/* Corretor - admin only */}
                      {[
                        { value: null, label: "Todos corretores", key: "hasCorretor" as const },
                        { value: true, label: "Com corretor", key: "hasCorretor" as const },
                        { value: false, label: "Sem corretor", key: "hasCorretor" as const },
                      ].map((opt) => (
                        <button
                          key={`corr-${String(opt.value)}`}
                          onClick={() => update({ hasCorretor: opt.value })}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                            local.hasCorretor === opt.value
                              ? "bg-blue-500 text-white border-blue-500"
                              : "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100"
                          }`}
                        >
                          <RiUserLine className="w-3 h-3 inline mr-1" />
                          {opt.label}
                        </button>
                      ))}
                    </>
                  )}

                  {/* Filtro hasPermuta oculto — será substituído por filtro específico de permuta */}

                  <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700 self-center" />

                  {/* Visitas */}
                  {[
                    { value: null, label: "Visitas: Todos" },
                    { value: true, label: "Com visitas" },
                    { value: false, label: "Sem visitas" },
                  ].map((opt) => (
                    <button
                      key={`visit-${String(opt.value)}`}
                      onClick={() => update({ hasVisit: opt.value })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                        local.hasVisit === opt.value
                          ? "bg-teal-500 text-white border-teal-500"
                          : "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}

                  <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700 self-center" />

                  {/* Propostas */}
                  {[
                    { value: null, label: "Propostas: Todos" },
                    { value: true, label: "Com propostas" },
                    { value: false, label: "Sem propostas" },
                  ].map((opt) => (
                    <button
                      key={`prop-${String(opt.value)}`}
                      onClick={() => update({ hasProposal: opt.value })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                        local.hasProposal === opt.value
                          ? "bg-indigo-500 text-white border-indigo-500"
                          : "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
