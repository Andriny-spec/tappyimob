"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiAddLine,
  RiSettings4Line,
  RiPaletteLine,
  RiCheckLine,
  RiCloseLine,
  RiSparklingLine,
} from "react-icons/ri";
import { KanbanColumn as Column, Lead, FUNNEL_STAGES } from "@/types/lead";
import { LeadCard } from "./LeadCard";

interface KanbanColumnProps {
  column: Column;
  onAddLead: (column: Column) => void;
  onOpenAutomation: (column: Column) => void;
  onOpenColorPicker: (column: Column) => void;
  onUpdateTitle: (columnId: string, title: string) => void;
  onUpdateFunnelStage?: (columnId: string, funnelStage: string | null) => void;
  onDropLead: (leadId: string, targetColumn: Column) => void;
  onOpenNotes: (lead: Lead) => void;
  onOpenTags: (lead: Lead) => void;
  onOpenSchedule: (lead: Lead) => void;
  onOpenBudget: (lead: Lead) => void;
  onOpenContract: (lead: Lead) => void;
  onOpenAIAnalysis: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
  onOpenDetail: (lead: Lead) => void;
  onOpenQualification?: (lead: Lead) => void;
  highlightAttention?: boolean;
  isArchiveColumn?: boolean;
  isAdmin?: boolean;
  onArchiveLead?: (lead: Lead) => void;
  onUnarchiveLead?: (lead: Lead) => void;
  selectionMode?: boolean;
  selectedLeadIds?: Set<string>;
  onToggleLeadSelection?: (leadId: string) => void;
  availableColumns?: { id: string; title: string; status: string; color: string }[];
  onMoveToColumn?: (leadId: string, column: { id: string; title: string; status: string; color: string }) => void;
}

export function KanbanColumn({
  column,
  onAddLead,
  onOpenAutomation,
  onOpenColorPicker,
  onUpdateTitle,
  onUpdateFunnelStage,
  onDropLead,
  onOpenNotes,
  onOpenTags,
  onOpenSchedule,
  onOpenBudget,
  onOpenContract,
  onOpenAIAnalysis,
  onEditLead,
  onOpenDetail,
  onOpenQualification,
  highlightAttention = false,
  isArchiveColumn = false,
  isAdmin = false,
  onArchiveLead,
  onUnarchiveLead,
  selectionMode = false,
  selectedLeadIds,
  onToggleLeadSelection,
  availableColumns = [],
  onMoveToColumn,
}: KanbanColumnProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(column.title);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync title when column prop changes (e.g. after loading from DB)
  useEffect(() => {
    setTitle(column.title);
  }, [column.title]);

  const handleTitleDoubleClick = () => {
    if (!isAdmin) return;
    setIsEditingTitle(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleTitleSave = () => {
    if (title.trim()) {
      onUpdateTitle(column.id, title.trim());
    } else {
      setTitle(column.title);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleSave();
    } else if (e.key === "Escape") {
      setTitle(column.title);
      setIsEditingTitle(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    // Só aceitar drag de leads (cards), não de colunas
    const types = e.dataTransfer.types;
    if (types.includes("columnid") && !types.includes("leadid")) return;
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    // Se for drag de coluna, deixar o evento subir para o handler do parent (KanbanBoard)
    const types = e.dataTransfer.types;
    if (types.includes("columnid") && !types.includes("leadid")) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const leadId = e.dataTransfer.getData("leadId");
    if (leadId) {
      onDropLead(leadId, column);
    }
  };

  const totalValue = column.leads.reduce((sum, lead) => sum + (lead.budget || 0), 0);

  const formatValue = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  return (
    <div
      className={`flex flex-col w-52 min-w-52 bg-neutral-100 dark:bg-neutral-900 rounded-2xl transition-all ${
        isDragOver ? "ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-500/10" : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div
        className="p-2.5 rounded-t-2xl"
        style={{ backgroundColor: column.color + "20" }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {/* Color indicator */}
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: column.color }}
            />

            {/* Title (editable on double click) */}
            {isEditingTitle ? (
              <div className="flex items-center gap-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={handleTitleKeyDown}
                  className="w-32 h-7 px-2 text-sm font-semibold bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  onClick={handleTitleSave}
                  className="p-1 rounded-lg bg-green-500 text-white hover:bg-green-600"
                >
                  <RiCheckLine className="w-3 h-3" />
                </button>
                <button
                  onClick={() => {
                    setTitle(column.title);
                    setIsEditingTitle(false);
                  }}
                  className="p-1 rounded-lg bg-neutral-300 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-400"
                >
                  <RiCloseLine className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <h3
                className={`text-sm font-semibold text-neutral-900 dark:text-white transition-colors ${isAdmin ? "cursor-pointer hover:text-orange-500" : ""}`}
                onDoubleClick={handleTitleDoubleClick}
                title={isAdmin ? "Clique 2x para editar" : column.title}
              >
                {column.title}
              </h3>
            )}

            {/* Lead count */}
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              {column.leads.length}
            </span>

            {/* Automation indicator */}
            {column.automationEnabled && (
              <div
                className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center"
                title="Automação ativa"
              >
                <RiSparklingLine className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {isAdmin && (
              <>
                <button
                  onClick={() => onOpenColorPicker(column)}
                  className="p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-neutral-800/50 text-neutral-600 dark:text-neutral-400 transition-colors"
                  title="Cor da coluna"
                >
                  <RiPaletteLine className="w-4 h-4" />
                </button>
                {/* Automação IA - OCULTO temporariamente (IA não funcional)
                <button
                  onClick={() => onOpenAutomation(column)}
                  className="p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-neutral-800/50 text-neutral-600 dark:text-neutral-400 transition-colors"
                  title="Configurar automação"
                >
                  <RiSettings4Line className="w-4 h-4" />
                </button>
                */}
              </>
            )}
            <button
              onClick={() => onAddLead(column)}
              className="p-1.5 rounded-lg bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400 transition-colors shadow-sm"
              title="Adicionar lead"
            >
              <RiAddLine className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Total value */}
        {totalValue > 0 && (
          <div className="text-xs text-neutral-600 dark:text-neutral-400">
            Total: <span className="font-semibold text-neutral-900 dark:text-white">{formatValue(totalValue)}</span>
          </div>
        )}

        {/* Funnel Stage Selector */}
        {isAdmin && onUpdateFunnelStage && (
          <div className="mt-1.5">
            <select
              value={column.funnelStage || ""}
              onChange={(e) => onUpdateFunnelStage(column.id, e.target.value || null)}
              className="w-full h-7 px-2 rounded-lg bg-white/60 dark:bg-neutral-800/60 border border-neutral-200/50 dark:border-neutral-700/50 text-[11px] text-neutral-600 dark:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-orange-500/30 appearance-none cursor-pointer"
              title="Fase do Funil de Vendas"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'10\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%239ca3af\' stroke-width=\'2\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center' }}
            >
              <option value="">Sem fase do funil</option>
              {FUNNEL_STAGES.map((stage) => (
                <option key={stage.key} value={stage.key}>
                  {stage.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Cards container */}
      <div className="flex-1 p-1.5 space-y-1.5 overflow-y-auto max-h-[calc(100vh-280px)] scrollbar-thin">
        <AnimatePresence initial={false}>
          {column.leads.map((lead) => (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              draggable
              onDragStart={(e: any) => {
                e.stopPropagation();
                e.dataTransfer.setData("leadId", lead.id);
              }}
            >
              <LeadCard
                lead={lead}
                onOpenNotes={onOpenNotes}
                onOpenTags={onOpenTags}
                onOpenSchedule={onOpenSchedule}
                onOpenBudget={onOpenBudget}
                onOpenContract={onOpenContract}
                onOpenAIAnalysis={onOpenAIAnalysis}
                onEdit={onEditLead}
                onOpenDetail={onOpenDetail}
                onOpenQualification={onOpenQualification}
                highlightAttention={highlightAttention}
                isArchiveColumn={isArchiveColumn}
                isAdmin={isAdmin}
                onArchive={onArchiveLead}
                onUnarchive={onUnarchiveLead}
                selectionMode={selectionMode}
                isSelected={selectedLeadIds?.has(lead.id) || false}
                onToggleSelection={onToggleLeadSelection}
                availableColumns={availableColumns}
                onMoveToColumn={onMoveToColumn}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {column.leads.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <button
              onClick={() => onAddLead(column)}
              className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center mb-3 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
            >
              <RiAddLine className="w-6 h-6 text-neutral-400" />
            </button>
            <p className="text-sm text-neutral-500">Nenhum lead</p>
            <button
              onClick={() => onAddLead(column)}
              className="mt-2 text-sm text-orange-500 hover:text-orange-600 font-medium"
            >
              Adicionar lead
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
