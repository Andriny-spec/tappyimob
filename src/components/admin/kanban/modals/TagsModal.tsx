"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCloseLine,
  RiPriceTag3Line,
  RiCheckLine,
  RiLoader4Line,
} from "react-icons/ri";
import { Lead, tagColors } from "@/types/lead";

interface TagsModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (leadId: string, tags: string[]) => void;
}

// Fallback tags caso a API não retorne nada
const fallbackTags = [
  { id: "urgente", label: "Urgente", color: tagColors.urgente },
  { id: "vip", label: "VIP", color: tagColors.vip },
  { id: "investidor", label: "Investidor", color: tagColors.investidor },
  { id: "primeira_compra", label: "Primeira Compra", color: tagColors.primeira_compra },
  { id: "financiamento", label: "Financiamento", color: tagColors.financiamento },
  { id: "permuta", label: "Permuta", color: tagColors.permuta },
  { id: "retorno", label: "Retorno", color: tagColors.retorno },
  { id: "sem_produto", label: "Sem Produto", color: "#6b7280" },
  { id: "negativado", label: "Negativado", color: "#000000" },
];

export function TagsModal({ lead, isOpen, onClose, onSave }: TagsModalProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>(lead?.tags || []);
  const [isSaving, setIsSaving] = useState(false);
  const [serverTags, setServerTags] = useState<{ id: string; label: string; color: string }[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);

  // Carregar tags configuradas do servidor
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await fetch("/api/admin/leads/tags");
        if (res.ok) {
          const data = await res.json();
          const tags = (data.tags || []).map((t: any) => ({ id: t.name?.toLowerCase().replace(/\s+/g, "_") || t.id, label: t.name, color: t.color }));
          setServerTags(tags.length > 0 ? tags : fallbackTags);
        } else {
          setServerTags(fallbackTags);
        }
      } catch {
        setServerTags(fallbackTags);
      } finally {
        setLoadingTags(false);
      }
    };
    if (isOpen) fetchTags();
  }, [isOpen]);

  // Atualizar selectedTags quando o lead mudar
  useEffect(() => {
    if (lead) {
      setSelectedTags(lead.tags || []);
    }
  }, [lead]);

  const allTags = serverTags;

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((t) => t !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSave = async () => {
    if (!lead) return;
    setIsSaving(true);
    try {
      await onSave(lead.id, selectedTags);
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && lead && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-[60] pointer-events-none"
          >
            <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-sm p-6 pointer-events-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-500/20 flex items-center justify-center">
                    <RiPriceTag3Line className="w-5 h-5 text-pink-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                      Tags
                    </h2>
                    <p className="text-sm text-neutral-500">{lead.name}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>

              {/* Tags grid — apenas tags configuradas no servidor */}
              {loadingTags ? (
                <div className="flex items-center justify-center py-8">
                  <RiLoader4Line className="w-6 h-6 text-pink-500 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 mb-4 max-h-64 overflow-y-auto">
                  {allTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => toggleTag(tag.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                          isSelected
                            ? "border-current"
                            : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                        }`}
                        style={{
                          borderColor: isSelected ? tag.color : undefined,
                          backgroundColor: isSelected ? tag.color + "15" : undefined,
                        }}
                      >
                        <span
                          className="text-sm font-medium truncate"
                          style={{ color: isSelected ? tag.color : undefined }}
                        >
                          {tag.label}
                        </span>
                        {isSelected && (
                          <RiCheckLine
                            className="w-4 h-4 flex-shrink-0"
                            style={{ color: tag.color }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              <p className="text-xs text-neutral-400 text-center mb-2">
                Gerencie tags em <span className="font-medium">Gestão → Tags</span>
              </p>

              {/* Selected count */}
              <p className="text-sm text-neutral-500 text-center mb-4">
                {selectedTags.length} tag(s) selecionada(s)
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 h-10 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-pink-500 text-white font-medium hover:bg-pink-600 transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <RiLoader4Line className="w-5 h-5 animate-spin" />
                  ) : (
                    "Salvar"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
