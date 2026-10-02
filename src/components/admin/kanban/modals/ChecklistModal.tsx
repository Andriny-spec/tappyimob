"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  RiCloseLine, 
  RiAddLine, 
  RiCheckLine, 
  RiDeleteBinLine,
  RiLoader4Line,
  RiCheckboxCircleLine,
  RiCheckboxBlankCircleLine,
} from "react-icons/ri";
import { Lead } from "@/types/lead";

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

interface ChecklistModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onLeadUpdate?: (updatedLead: Lead) => void;
}

export function ChecklistModal({
  lead,
  isOpen,
  onClose,
  onLeadUpdate,
}: ChecklistModalProps) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItemText, setNewItemText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Carregar checklist do lead
  useEffect(() => {
    if (lead && isOpen) {
      setIsLoading(true);
      fetch(`/api/admin/leads/${lead.id}/checklist`)
        .then(res => res.json())
        .then(data => {
          setItems(data.items || []);
        })
        .catch(err => {
          console.error("Erro ao carregar checklist:", err);
          // Fallback para dados locais se existirem
          setItems((lead as any).checklistItems || []);
        })
        .finally(() => setIsLoading(false));
    }
  }, [lead, isOpen]);

  // Adicionar novo item
  const handleAddItem = async () => {
    if (!newItemText.trim() || !lead) return;

    const newItem: ChecklistItem = {
      id: `item-${Date.now()}`,
      text: newItemText.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setItems(prev => [...prev, newItem]);
    setNewItemText("");

    // Salvar no backend
    try {
      await fetch(`/api/admin/leads/${lead.id}/checklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item: newItem }),
      });
    } catch (err) {
      console.error("Erro ao salvar item:", err);
    }
  };

  // Toggle item completado
  const handleToggleItem = async (itemId: string) => {
    if (!lead) return;

    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    ));

    // Salvar no backend
    try {
      await fetch(`/api/admin/leads/${lead.id}/checklist/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !items.find(i => i.id === itemId)?.completed }),
      });
    } catch (err) {
      console.error("Erro ao atualizar item:", err);
    }
  };

  // Deletar item
  const handleDeleteItem = async (itemId: string) => {
    if (!lead) return;

    setItems(prev => prev.filter(item => item.id !== itemId));

    // Deletar no backend
    try {
      await fetch(`/api/admin/leads/${lead.id}/checklist/${itemId}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Erro ao deletar item:", err);
    }
  };

  // Contar itens completados
  const completedCount = items.filter(i => i.completed).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (!lead) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-neutral-800 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                    Checklist
                  </h2>
                  <p className="text-sm text-neutral-500">{lead.name}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>

              {/* Barra de progresso */}
              {totalCount > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-neutral-500">Progresso</span>
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">
                      {completedCount}/{totalCount} ({Math.round(progress)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-green-500 rounded-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RiLoader4Line className="w-6 h-6 animate-spin text-neutral-400" />
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">
                  <RiCheckboxCircleLine className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>Nenhum item no checklist</p>
                  <p className="text-sm">Adicione itens abaixo</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        item.completed
                          ? "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30"
                          : "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700"
                      }`}
                    >
                      <button
                        onClick={() => handleToggleItem(item.id)}
                        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                          item.completed
                            ? "bg-green-500 text-white"
                            : "border-2 border-neutral-300 dark:border-neutral-600 hover:border-green-500"
                        }`}
                      >
                        {item.completed && <RiCheckLine className="w-4 h-4" />}
                      </button>

                      <span
                        className={`flex-1 text-sm ${
                          item.completed
                            ? "text-neutral-500 line-through"
                            : "text-neutral-900 dark:text-white"
                        }`}
                      >
                        {item.text}
                      </span>

                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="flex-shrink-0 p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <RiDeleteBinLine className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer - Adicionar item */}
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                  placeholder="Adicionar item..."
                  className="flex-1 px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={handleAddItem}
                  disabled={!newItemText.trim()}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <RiAddLine className="w-4 h-4" />
                  Adicionar
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
