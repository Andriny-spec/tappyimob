"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCloseLine,
  RiFilterLine,
  RiRestartLine,
  RiSearchLine,
  RiUserLine,
  RiPriceTag3Line,
  RiCalendarLine,
  RiSparklingLine,
  RiHome4Line,
  RiPhoneLine,
  RiMoneyDollarCircleLine,
  RiFireLine,
} from "react-icons/ri";
import { leadStatusLabels, leadSourceLabels, tagColors, leadProfileLabels, leadTicketLabels, leadTemperatureLabels, leadTemperatureColors } from "@/types/lead";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  currentFilters: FilterState;
}

export interface FilterState {
  search: string;
  name: string;
  phone: string;
  ticketMin: number;
  ticketMax: number;
  condominium: string; // Condomínio de interesse
  profiles: string[]; // Perfis do lead
  tickets: string[]; // Finalidades
  hasPermuta: boolean | null;
  status: string[];
  sources: string[];
  tags: string[];
  temperatures: string[];
  scoreMin: number;
  scoreMax: number;
  probabilityMin: number;
  probabilityMax: number;
  hasProperty: boolean | null;
  hasCorretor: boolean | null;
  dateFrom: string;
  dateTo: string;
}

export const defaultFilters: FilterState = {
  search: "",
  name: "",
  phone: "",
  ticketMin: 0,
  ticketMax: 0,
  condominium: "",
  profiles: [],
  tickets: [],
  hasPermuta: null,
  status: [],
  sources: [],
  tags: [],
  temperatures: [],
  scoreMin: 0,
  scoreMax: 100,
  probabilityMin: 0,
  probabilityMax: 100,
  hasProperty: null,
  hasCorretor: null,
  dateFrom: "",
  dateTo: "",
};

const availableTags = Object.keys(tagColors);

export function FilterModal({
  isOpen,
  onClose,
  onApply,
  currentFilters,
}: FilterModalProps) {
  const [filters, setFilters] = useState<FilterState>(currentFilters);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters(defaultFilters);
  };

  const toggleArrayFilter = (
    key: "status" | "sources" | "tags" | "profiles" | "tickets" | "temperatures",
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  };

  const activeFiltersCount =
    (filters.name ? 1 : 0) +
    (filters.phone ? 1 : 0) +
    (filters.ticketMin > 0 || filters.ticketMax > 0 ? 1 : 0) +
    (filters.condominium ? 1 : 0) +
    filters.profiles.length +
    filters.tickets.length +
    (filters.hasPermuta !== null ? 1 : 0) +
    filters.status.length +
    filters.sources.length +
    filters.tags.length +
    filters.temperatures.length +
    (filters.scoreMin > 0 || filters.scoreMax < 100 ? 1 : 0) +
    (filters.probabilityMin > 0 || filters.probabilityMax < 100 ? 1 : 0) +
    (filters.hasProperty !== null ? 1 : 0) +
    (filters.hasCorretor !== null ? 1 : 0) +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0);

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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 m-auto w-full max-w-lg max-h-[85vh] bg-white dark:bg-neutral-900 shadow-2xl z-50 flex flex-col rounded-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
                  <RiFilterLine className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                    Filtros
                  </h2>
                  {activeFiltersCount > 0 && (
                    <p className="text-sm text-orange-500">
                      {activeFiltersCount} filtro(s) ativo(s)
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm"
                >
                  <RiRestartLine className="w-4 h-4" />
                  Limpar
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Busca por Nome */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                  <RiUserLine className="w-4 h-4 text-blue-500" />
                  Nome do Lead
                </h3>
                <input
                  type="text"
                  value={filters.name}
                  onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                  placeholder="Buscar por nome..."
                  className="w-full h-10 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500"
                />
              </div>

              {/* Busca por Telefone */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                  <RiPhoneLine className="w-4 h-4 text-green-500" />
                  Telefone
                </h3>
                <input
                  type="text"
                  value={filters.phone}
                  onChange={(e) => setFilters({ ...filters, phone: e.target.value })}
                  placeholder="Buscar por telefone..."
                  className="w-full h-10 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500"
                />
              </div>

              {/* Ticket de Valor */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                  <RiMoneyDollarCircleLine className="w-4 h-4 text-emerald-500" />
                  Ticket de Valor (R$)
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-neutral-500 mb-1 block">Mínimo</label>
                    <input
                      type="number"
                      min="0"
                      value={filters.ticketMin || ""}
                      onChange={(e) =>
                        setFilters({ ...filters, ticketMin: parseInt(e.target.value) || 0 })
                      }
                      placeholder="0"
                      className="w-full h-10 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-500 mb-1 block">Máximo</label>
                    <input
                      type="number"
                      min="0"
                      value={filters.ticketMax || ""}
                      onChange={(e) =>
                        setFilters({ ...filters, ticketMax: parseInt(e.target.value) || 0 })
                      }
                      placeholder="Sem limite"
                      className="w-full h-10 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white"
                    />
                  </div>
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  Filtra leads que buscam imóveis nessa faixa de preço
                </p>
              </div>

              {/* Condomínio de Interesse */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                  <RiHome4Line className="w-4 h-4 text-orange-500" />
                  Condomínio / Empreendimento
                </h3>
                <input
                  type="text"
                  value={filters.condominium}
                  onChange={(e) => setFilters({ ...filters, condominium: e.target.value })}
                  placeholder="Ex: Alpha 12, Jardins, Morumbi..."
                  className="w-full h-10 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500"
                />
                <p className="text-xs text-neutral-500 mt-2">
                  Filtra leads interessados neste condomínio/região
                </p>
              </div>

              {/* Perfil do Lead */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                  <RiUserLine className="w-4 h-4 text-purple-500" />
                  Perfil do Cliente
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(leadProfileLabels).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => toggleArrayFilter("profiles", key)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        filters.profiles.includes(key)
                          ? "bg-purple-500 text-white"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Finalidade */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                  <RiPriceTag3Line className="w-4 h-4 text-blue-500" />
                  Finalidade
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(leadTicketLabels).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => toggleArrayFilter("tickets", key)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        filters.tickets.includes(key)
                          ? "bg-blue-500 text-white"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Permuta */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                  <RiHome4Line className="w-4 h-4 text-pink-500" />
                  Possui Permuta
                </h3>
                <div className="flex gap-2">
                  {[
                    { value: null, label: "Todos" },
                    { value: true, label: "Com permuta" },
                    { value: false, label: "Sem permuta" },
                  ].map((opt) => (
                    <button
                      key={String(opt.value)}
                      onClick={() => setFilters({ ...filters, hasPermuta: opt.value })}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        filters.hasPermuta === opt.value
                          ? "bg-pink-500 text-white"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                  Status
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(leadStatusLabels).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => toggleArrayFilter("status", key)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        filters.status.includes(key)
                          ? "bg-orange-500 text-white"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Origem */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                  Origem
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(leadSourceLabels).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => toggleArrayFilter("sources", key)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        filters.sources.includes(key)
                          ? "bg-blue-500 text-white"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleArrayFilter("tags", tag)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        filters.tags.includes(tag)
                          ? "text-white"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      }`}
                      style={{
                        backgroundColor: filters.tags.includes(tag)
                          ? tagColors[tag as keyof typeof tagColors]
                          : undefined,
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Temperatura */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                  <RiFireLine className="w-4 h-4 text-red-500" />
                  Temperatura
                </h3>
                <div className="flex gap-2">
                  {(["QUENTE", "MORNO", "FRIO"] as const).map((temp) => (
                    <button
                      key={temp}
                      onClick={() => toggleArrayFilter("temperatures", temp)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        filters.temperatures.includes(temp)
                          ? "text-white"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      }`}
                      style={{
                        backgroundColor: filters.temperatures.includes(temp)
                          ? leadTemperatureColors[temp]
                          : undefined,
                      }}
                    >
                      {temp === "QUENTE" && <RiFireLine className="w-3.5 h-3.5" />}
                      {temp === "MORNO" && <span>🌡️</span>}
                      {temp === "FRIO" && <span>❄️</span>}
                      {leadTemperatureLabels[temp]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Score IA */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                  <RiSparklingLine className="w-4 h-4 text-purple-500" />
                  Score IA
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-neutral-500 mb-1 block">Mínimo</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={filters.scoreMin}
                      onChange={(e) =>
                        setFilters({ ...filters, scoreMin: parseInt(e.target.value) || 0 })
                      }
                      className="w-full h-10 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-500 mb-1 block">Máximo</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={filters.scoreMax}
                      onChange={(e) =>
                        setFilters({ ...filters, scoreMax: parseInt(e.target.value) || 100 })
                      }
                      className="w-full h-10 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Probabilidade */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                  Probabilidade de Fechamento
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-neutral-500 mb-1 block">Mínimo %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={filters.probabilityMin}
                      onChange={(e) =>
                        setFilters({ ...filters, probabilityMin: parseInt(e.target.value) || 0 })
                      }
                      className="w-full h-10 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-500 mb-1 block">Máximo %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={filters.probabilityMax}
                      onChange={(e) =>
                        setFilters({ ...filters, probabilityMax: parseInt(e.target.value) || 100 })
                      }
                      className="w-full h-10 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Imóvel de interesse */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                  <RiHome4Line className="w-4 h-4 text-orange-500" />
                  Imóvel de Interesse
                </h3>
                <div className="flex gap-2">
                  {[
                    { value: null, label: "Todos" },
                    { value: true, label: "Com imóvel" },
                    { value: false, label: "Sem imóvel" },
                  ].map((opt) => (
                    <button
                      key={String(opt.value)}
                      onClick={() => setFilters({ ...filters, hasProperty: opt.value })}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        filters.hasProperty === opt.value
                          ? "bg-orange-500 text-white"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Corretor */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                  <RiUserLine className="w-4 h-4 text-blue-500" />
                  Corretor Responsável
                </h3>
                <div className="flex gap-2">
                  {[
                    { value: null, label: "Todos" },
                    { value: true, label: "Com corretor" },
                    { value: false, label: "Sem corretor" },
                  ].map((opt) => (
                    <button
                      key={String(opt.value)}
                      onClick={() => setFilters({ ...filters, hasCorretor: opt.value })}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        filters.hasCorretor === opt.value
                          ? "bg-blue-500 text-white"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data de criação */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                  <RiCalendarLine className="w-4 h-4 text-green-500" />
                  Data de Criação
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-neutral-500 mb-1 block">De</label>
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-500 mb-1 block">Até</label>
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
              <div className="flex gap-3">
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
                  Aplicar Filtros
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
