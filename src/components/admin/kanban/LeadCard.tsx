"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiWhatsappLine,
  RiHome4Line,
  RiFireLine,
  RiTimeLine,
  RiAlertLine,
  RiDraggable,
  RiMoreLine,
  RiArchiveLine,
  RiRefreshLine,
  RiUser3Line,
  RiMoneyDollarCircleLine,
  RiTempColdLine,
  RiUserStarLine,
  RiBuilding2Line,
  RiCheckboxCircleLine,
  RiCalendarLine,
  RiArrowRightSLine,
} from "react-icons/ri";
import { 
  Lead, 
  leadTicketLabels, 
  leadTicketColors,
  leadTemperatureColors,
  leadTemperatureLabels,
  followUpDaysByTemperature,
  leadSourceCategoryColors,
  getSourceCategory,
  leadSourceLabels,
} from "@/types/lead";

// Função para gerar cor de avatar baseada no nome
const getAvatarColor = (name: string) => {
  const colors = [
    "bg-orange-500", "bg-blue-500", "bg-green-500", "bg-purple-500",
    "bg-pink-500", "bg-indigo-500", "bg-teal-500", "bg-amber-500"
  ];
  const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

// Função para obter iniciais do nome
const getInitials = (name: string) => {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

interface ColumnOption {
  id: string;
  title: string;
  status: string;
  color: string;
}

interface LeadCardProps {
  lead: Lead;
  onOpenNotes: (lead: Lead) => void;
  onOpenTags: (lead: Lead) => void;
  onOpenSchedule: (lead: Lead) => void;
  onOpenBudget: (lead: Lead) => void;
  onOpenContract: (lead: Lead) => void;
  onOpenAIAnalysis: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  onOpenDetail: (lead: Lead) => void;
  onOpenQualification?: (lead: Lead) => void;
  isDragging?: boolean;
  highlightAttention?: boolean;
  isArchiveColumn?: boolean;
  isAdmin?: boolean;
  onArchive?: (lead: Lead) => void;
  onUnarchive?: (lead: Lead) => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (leadId: string) => void;
  availableColumns?: ColumnOption[];
  onMoveToColumn?: (leadId: string, column: ColumnOption) => void;
}

export function LeadCard({
  lead,
  onOpenNotes,
  onOpenTags,
  onOpenSchedule,
  onOpenBudget,
  onOpenContract,
  onOpenAIAnalysis,
  onEdit,
  onOpenDetail,
  onOpenQualification,
  isDragging,
  highlightAttention = false,
  isArchiveColumn = false,
  isAdmin = true,
  onArchive,
  onUnarchive,
  selectionMode = false,
  isSelected = false,
  onToggleSelection,
  availableColumns = [],
  onMoveToColumn,
}: LeadCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  // Calcular dias desde último contato
  const getDaysSinceLastContact = () => {
    if (!lead.lastContact) return null;
    const lastContact = new Date(lead.lastContact);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastContact.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Verificar se está atrasado no follow-up
  const isOverdue = () => {
    const daysSince = getDaysSinceLastContact();
    if (daysSince === null) return false;
    const maxDays = followUpDaysByTemperature[lead.temperature || "MORNO"];
    return daysSince > maxDays;
  };

  // Formatar data do último FUP
  const formatLastContact = () => {
    if (!lead.lastContact) return "Sem contato";
    const date = new Date(lead.lastContact);
    const days = getDaysSinceLastContact();
    if (days === 0) return "Hoje";
    if (days === 1) return "Ontem";
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };

  // Formatar preço com números redondos (arredonda para milhar)
  const formatPrice = (price: number) => {
    const rounded = price >= 1000 ? Math.round(price / 1000) * 1000 : Math.round(price);
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(rounded);
  };

  const overdue = isOverdue();
  const daysSince = getDaysSinceLastContact();

  // Cor da categoria de origem
  const sourceCategory = getSourceCategory(lead.source);
  const sourceCatColor = leadSourceCategoryColors[sourceCategory];

  // Verificar se deve piscar (highlightAttention + overdue)
  const shouldPulse = highlightAttention && overdue;

  // Estados para expandir detalhes
  const [showTemp, setShowTemp] = useState(false);
  const [showCorretor, setShowCorretor] = useState(false);

  // Fechar todos os expandidos
  const closeAll = () => {
    setShowTemp(false);
    setShowCorretor(false);
    setShowMoveMenu(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 5 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: shouldPulse ? [1, 1.03, 1] : 1,
        boxShadow: shouldPulse 
          ? ["0 0 0 0 rgba(239, 68, 68, 0)", "0 0 0 8px rgba(239, 68, 68, 0.3)", "0 0 0 0 rgba(239, 68, 68, 0)"]
          : "none",
      }}
      transition={shouldPulse ? { duration: 1.5, repeat: Infinity } : undefined}
      exit={{ opacity: 0, y: -5 }}
      whileHover={{ y: -1 }}
      onClick={() => {
        if (selectionMode && onToggleSelection) {
          onToggleSelection(lead.id);
        } else {
          onOpenDetail(lead);
        }
      }}
      style={{ borderLeftColor: sourceCatColor?.color || "transparent", borderLeftWidth: "3px" }}
      className={`group relative rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden ${
        isDragging ? "shadow-lg ring-2 ring-orange-500 rotate-1 cursor-grabbing" : ""
      } ${selectionMode && isSelected ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30" : ""} ${shouldPulse ? "ring-2 ring-red-500 bg-red-200 dark:bg-red-900/60" : overdue ? "bg-red-100 dark:bg-red-900/40 ring-1 ring-red-400" : "bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700"}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Barra de temperatura no topo */}
      <div 
        className="h-1 w-full"
        style={{ backgroundColor: leadTemperatureColors[lead.temperature || "MORNO"] }}
      />

      {/* Checkbox de seleção */}
      {selectionMode && (
        <div className="absolute top-2 left-2 z-10">
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
            isSelected 
              ? "bg-blue-500 border-blue-500 text-white" 
              : "bg-white dark:bg-neutral-700 border-neutral-300 dark:border-neutral-500"
          }`}>
            {isSelected && (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
      )}

      <div className="p-2">
        {/* Header: Avatar + Nome + Último contato */}
        <div className="flex items-center gap-1.5 mb-1">
          {/* Avatar */}
          <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[9px] font-bold ${getAvatarColor(lead.name)}`}>
            {getInitials(lead.name)}
          </div>

          {/* Nome */}
          <h4 className="font-semibold text-neutral-900 dark:text-white text-[11px] truncate flex-1">
            {(lead as any).nickname || lead.name}
          </h4>

          {/* Último contato inline */}
          <span className={`text-[9px] flex-shrink-0 ${overdue ? "text-red-500 font-medium" : "text-neutral-400"}`}>
            {formatLastContact()}
          </span>

          {/* Alerta de atraso */}
          {overdue && (
            <div 
              className="w-4 h-4 rounded-full flex items-center justify-center bg-red-100 dark:bg-red-500/20 flex-shrink-0"
              title={`${daysSince} dias sem contato`}
            >
              <RiAlertLine className="w-2.5 h-2.5 text-red-500" />
            </div>
          )}
        </div>
        
        {/* Linha de ações: WhatsApp + Finalidade */}
        <div className="flex items-center gap-1.5">
          {/* WhatsApp */}
          <a
            href={`https://wa.me/55${lead.phone?.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-6 h-6 rounded-md bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors"
          >
            <RiWhatsappLine className="w-3.5 h-3.5" />
          </a>

          {/* Finalidade (Compra/Aluguel/Ambos) */}
          {lead.ticket === "AMBOS" ? (
            <>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-white" style={{ backgroundColor: leadTicketColors.COMPRA }}>
                Compra
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-white" style={{ backgroundColor: leadTicketColors.LOCACAO }}>
                Locação
              </span>
            </>
          ) : (
            <span 
              className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-white"
              style={{ backgroundColor: leadTicketColors[lead.ticket || "COMPRA"] }}
            >
              {leadTicketLabels[lead.ticket || "COMPRA"]}
            </span>
          )}

          {/* Tarja Visita Agendada */}
          {lead.tags?.includes("VISITA_AGENDADA") && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-500 text-white flex items-center gap-0.5">
              <RiCalendarLine className="w-3 h-3" />
              Visita
            </span>
          )}

          {/* Tarja Corretor Parceiro */}
          {lead.tags?.includes("CORRETOR_PARCEIRO") && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500 text-white flex items-center gap-0.5">
              <RiUserStarLine className="w-3 h-3" />
              Parceiro
            </span>
          )}

          {/* Tarja Avaliação/Venda de Imóvel */}
          {(lead.tags?.includes("AVALIACAO_IMOVEL") || lead.tags?.includes("VENDA_IMOVEL")) && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500 text-white flex items-center gap-0.5">
              <RiHome4Line className="w-3 h-3" />
              {lead.tags?.includes("AVALIACAO_IMOVEL") ? "Avaliação" : "Venda"}
            </span>
          )}

          {/* Tarja Permuta */}
          {(lead as any).hasPermuta && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-pink-500 text-white">
              ⇄ Permuta
            </span>
          )}

          <div className="flex-1" />

          {/* Atalho mover coluna - apenas quando há colunas disponíveis */}
          {onMoveToColumn && availableColumns.length > 0 && (
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); closeAll(); setShowMoveMenu(!showMoveMenu); }}
                className="w-6 h-6 rounded-md flex items-center justify-center text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                title="Mover para coluna"
              >
                <RiArrowRightSLine className="w-3.5 h-3.5" />
              </button>
              <AnimatePresence>
                {showMoveMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 4 }}
                    transition={{ duration: 0.1 }}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-8 z-50 min-w-[160px] max-h-[240px] overflow-y-auto bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700"
                  >
                    <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-700">
                      <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">Mover para</p>
                    </div>
                    {availableColumns
                      .filter((col) => col.status !== lead.status)
                      .map((col) => (
                        <button
                          key={col.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onMoveToColumn!(lead.id, col);
                            setShowMoveMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors text-left"
                        >
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: col.color }} />
                          <span className="text-[11px] text-neutral-700 dark:text-neutral-200 truncate">{col.title}</span>
                        </button>
                      ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Ícone Temperatura - clicável */}
          <button
            onClick={(e) => { e.stopPropagation(); closeAll(); setShowTemp(!showTemp); }}
            className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
              lead.temperature === "QUENTE"
                ? "bg-red-100 dark:bg-red-500/20 ring-1 ring-red-400 dark:ring-red-500/50"
                : showTemp ? 'bg-neutral-100 dark:bg-neutral-700' : 'hover:bg-neutral-100 dark:hover:bg-neutral-700'
            }`}
            style={{ color: leadTemperatureColors[lead.temperature || "MORNO"] }}
            title="Temperatura"
          >
            <RiFireLine className={`${lead.temperature === "QUENTE" ? "w-4 h-4 animate-pulse" : "w-3.5 h-3.5"}`} />
          </button>

          {/* Ícone Corretor - clicável (oculto para corretor) */}
          {isAdmin && lead.corretor && (
            <button
              onClick={(e) => { e.stopPropagation(); closeAll(); setShowCorretor(!showCorretor); }}
              className={`w-6 h-6 rounded-md flex items-center justify-center text-blue-500 transition-colors ${showCorretor ? 'bg-blue-50 dark:bg-blue-500/10' : 'hover:bg-blue-50 dark:hover:bg-blue-500/10'}`}
              title="Corretor"
            >
              <RiUserStarLine className="w-3.5 h-3.5" />
            </button>
          )}

        </div>

        {/* Ticket Médio - faixa de valor ocupando toda a largura */}
        {(lead.minBudget || lead.maxBudget || lead.budget) && (
          <div className="mt-1.5 px-2 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
            <div className="flex items-center justify-center gap-1 text-[11px]">
              <RiMoneyDollarCircleLine className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                {lead.minBudget && lead.maxBudget 
                  ? `${formatPrice(lead.minBudget)} - ${formatPrice(lead.maxBudget)}`
                  : formatPrice(lead.budget || lead.minBudget || lead.maxBudget || 0)
                }
              </span>
            </div>
          </div>
        )}

        {/* Corretor vinculado - visível apenas no admin, sempre inline */}
        {isAdmin && lead.corretor && (
          <div className="mt-1.5 flex items-center gap-1 px-1">
            <RiUserStarLine className="w-3 h-3 text-blue-400 flex-shrink-0" />
            <span className="text-[10px] text-blue-500 dark:text-blue-400 truncate">{lead.corretor.name}</span>
          </div>
        )}

        {/* Área expansível - Temperatura */}
        <AnimatePresence>
          {showTemp && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div 
                className="mt-2 px-2 py-1.5 rounded-lg text-[11px] font-medium text-white flex items-center gap-1.5"
                style={{ backgroundColor: leadTemperatureColors[lead.temperature || "MORNO"] }}
              >
                <RiFireLine className="w-3.5 h-3.5" />
                {leadTemperatureLabels?.[lead.temperature || "MORNO"] || lead.temperature || "Morno"}
              </div>
            </motion.div>
          )}
        </AnimatePresence>


        {/* Área expansível - Corretor */}
        <AnimatePresence>
          {isAdmin && showCorretor && lead.corretor && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg px-2 py-1.5 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                  {lead.corretor.name?.substring(0, 2).toUpperCase() || "CR"}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-neutral-500">Corretor</span>
                  <p className="text-blue-600 dark:text-blue-400 font-medium text-[11px] truncate">
                    {lead.corretor.name}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Coluna de arquivo: mostrar botão de repescar */}
      {isArchiveColumn && onUnarchive && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUnarchive(lead);
          }}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-medium hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors border-t border-neutral-100 dark:border-neutral-700"
        >
          <RiRefreshLine className="w-3 h-3" />
          Repescar
        </button>
      )}
    </motion.div>
  );
}
