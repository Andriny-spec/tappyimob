"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCloseLine,
  RiSettings4Line,
  RiDraggable,
  RiEyeLine,
  RiEyeOffLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiLayoutGridLine,
  RiListCheck,
  RiCheckLine,
} from "react-icons/ri";
import { LeadStatus, leadStatusLabels, leadStatusColors } from "@/types/lead";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (settings: KanbanSettings) => void;
  currentSettings: KanbanSettings;
}

export interface KanbanSettings {
  visibleColumns: LeadStatus[];
  columnOrder: LeadStatus[];
  cardSize: "compact" | "normal" | "expanded";
  sortBy: "created" | "updated" | "score" | "probability" | "name";
  sortOrder: "asc" | "desc";
  showEmptyColumns: boolean;
  showColumnTotals: boolean;
  showLeadScore: boolean;
  showLeadProbability: boolean;
  showLeadProperty: boolean;
  showLeadCorretor: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
}

export const defaultSettings: KanbanSettings = {
  visibleColumns: ["NOVO", "CONTATADO", "QUALIFICADO", "NEGOCIANDO", "FECHADO"],
  columnOrder: ["NOVO", "CONTATADO", "QUALIFICADO", "NEGOCIANDO", "FECHADO"],
  cardSize: "normal",
  sortBy: "created",
  sortOrder: "desc",
  showEmptyColumns: true,
  showColumnTotals: true,
  showLeadScore: true,
  showLeadProbability: true,
  showLeadProperty: true,
  showLeadCorretor: true,
  autoRefresh: false,
  refreshInterval: 30,
};

const allStatuses: LeadStatus[] = ["NOVO", "CONTATADO", "QUALIFICADO", "NEGOCIANDO", "FECHADO"];

const SETTINGS_STORAGE_KEY = "kanban_settings";

export function loadSavedSettings(): KanbanSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultSettings, ...parsed };
    }
  } catch {}
  return defaultSettings;
}

export function SettingsModal({
  isOpen,
  onClose,
  onApply,
  currentSettings,
}: SettingsModalProps) {
  const [settings, setSettings] = useState<KanbanSettings>(currentSettings);

  useEffect(() => {
    if (isOpen) setSettings(currentSettings);
  }, [isOpen, currentSettings]);

  const handleApply = () => {
    onApply(settings);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {}
    onClose();
  };

  const toggleColumn = (status: LeadStatus) => {
    setSettings((prev) => ({
      ...prev,
      visibleColumns: prev.visibleColumns.includes(status)
        ? prev.visibleColumns.filter((s) => s !== status)
        : [...prev.visibleColumns, status],
    }));
  };

  const moveColumn = (status: LeadStatus, direction: "up" | "down") => {
    const index = settings.columnOrder.indexOf(status);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === settings.columnOrder.length - 1)
    ) {
      return;
    }

    const newOrder = [...settings.columnOrder];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
    setSettings({ ...settings, columnOrder: newOrder });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none"
          >
            <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-lg p-6 pointer-events-auto max-h-[85vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                    <RiSettings4Line className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                  </div>
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                    Configurações do Kanban
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto space-y-6">
                {/* Colunas visíveis */}
                <div>
                  <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                    Colunas Visíveis
                  </h3>
                  <div className="space-y-2">
                    {settings.columnOrder.map((status, index) => (
                      <div
                        key={status}
                        className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl"
                      >
                        <RiDraggable className="w-4 h-4 text-neutral-400" />
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: leadStatusColors[status] }}
                        />
                        <span className="flex-1 text-sm font-medium text-neutral-900 dark:text-white">
                          {leadStatusLabels[status]}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveColumn(status, "up")}
                            disabled={index === 0}
                            className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 disabled:opacity-30"
                          >
                            <RiArrowUpLine className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => moveColumn(status, "down")}
                            disabled={index === settings.columnOrder.length - 1}
                            className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 disabled:opacity-30"
                          >
                            <RiArrowDownLine className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleColumn(status)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              settings.visibleColumns.includes(status)
                                ? "bg-green-100 dark:bg-green-500/20 text-green-500"
                                : "bg-neutral-200 dark:bg-neutral-700 text-neutral-400"
                            }`}
                          >
                            {settings.visibleColumns.includes(status) ? (
                              <RiEyeLine className="w-4 h-4" />
                            ) : (
                              <RiEyeOffLine className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tamanho do card */}
                <div>
                  <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                    Tamanho dos Cards
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "compact", label: "Compacto" },
                      { value: "normal", label: "Normal" },
                      { value: "expanded", label: "Expandido" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() =>
                          setSettings({ ...settings, cardSize: opt.value as any })
                        }
                        className={`p-3 rounded-xl text-sm font-medium transition-all ${
                          settings.cardSize === opt.value
                            ? "bg-orange-500 text-white"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ordenação */}
                <div>
                  <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                    Ordenar Leads Por
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={settings.sortBy}
                      onChange={(e) =>
                        setSettings({ ...settings, sortBy: e.target.value as any })
                      }
                      className="h-10 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white"
                    >
                      <option value="created">Data de criação</option>
                      <option value="updated">Última atualização</option>
                      <option value="score">Score IA</option>
                      <option value="probability">Probabilidade</option>
                      <option value="name">Nome</option>
                    </select>
                    <select
                      value={settings.sortOrder}
                      onChange={(e) =>
                        setSettings({ ...settings, sortOrder: e.target.value as any })
                      }
                      className="h-10 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white"
                    >
                      <option value="desc">Mais recentes primeiro</option>
                      <option value="asc">Mais antigos primeiro</option>
                    </select>
                  </div>
                </div>

                {/* Opções de exibição */}
                <div>
                  <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                    Exibir nos Cards
                  </h3>
                  <div className="space-y-2">
                    {[
                      { key: "showLeadScore", label: "Score IA" },
                      { key: "showLeadProbability", label: "Probabilidade" },
                      { key: "showLeadProperty", label: "Imóvel de interesse" },
                      { key: "showLeadCorretor", label: "Corretor responsável" },
                      { key: "showColumnTotals", label: "Totais das colunas" },
                      { key: "showEmptyColumns", label: "Colunas vazias" },
                    ].map((opt) => (
                      <label
                        key={opt.key}
                        className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700"
                      >
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">
                          {opt.label}
                        </span>
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={settings[opt.key as keyof KanbanSettings] as boolean}
                            onChange={(e) =>
                              setSettings({ ...settings, [opt.key]: e.target.checked })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-10 h-6 bg-neutral-200 dark:bg-neutral-700 rounded-full peer peer-checked:bg-orange-500 transition-colors" />
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Auto refresh */}
                <div>
                  <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                    Atualização Automática
                  </h3>
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                    <label className="flex items-center gap-3 flex-1 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={settings.autoRefresh}
                          onChange={(e) =>
                            setSettings({ ...settings, autoRefresh: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-10 h-6 bg-neutral-200 dark:bg-neutral-700 rounded-full peer peer-checked:bg-green-500 transition-colors" />
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                      </div>
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">
                        Atualizar a cada
                      </span>
                    </label>
                    <select
                      value={settings.refreshInterval}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          refreshInterval: parseInt(e.target.value),
                        })
                      }
                      disabled={!settings.autoRefresh}
                      className="h-9 px-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white disabled:opacity-50"
                    >
                      <option value="15">15s</option>
                      <option value="30">30s</option>
                      <option value="60">1 min</option>
                      <option value="300">5 min</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 pt-6 mt-4 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  onClick={onClose}
                  className="flex-1 h-12 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleApply}
                  className="flex-1 h-12 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600"
                >
                  Salvar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
