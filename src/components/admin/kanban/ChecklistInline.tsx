"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiAddLine,
  RiCheckLine,
  RiDeleteBinLine,
  RiLoader4Line,
  RiCheckboxCircleLine,
  RiFileList3Line,
} from "react-icons/ri";

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

interface ChecklistInlineProps {
  leadId: string;
}

export function ChecklistInline({ leadId }: ChecklistInlineProps) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItemText, setNewItemText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Carregar checklist do lead
  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/admin/leads/${leadId}/checklist`)
      .then((res) => res.json())
      .then((data) => setItems(data.items || []))
      .catch((err) => console.error("Erro ao carregar checklist:", err))
      .finally(() => setIsLoading(false));
  }, [leadId]);

  const handleAddItem = async () => {
    if (!newItemText.trim()) return;

    const newItem: ChecklistItem = {
      id: `item-${Date.now()}`,
      text: newItemText.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setItems((prev) => [...prev, newItem]);
    setNewItemText("");

    try {
      await fetch(`/api/admin/leads/${leadId}/checklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item: newItem }),
      });
    } catch (err) {
      console.error("Erro ao salvar item:", err);
    }
  };

  const handleToggleItem = async (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, completed: !i.completed } : i))
    );

    try {
      await fetch(`/api/admin/leads/${leadId}/checklist/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !item.completed }),
      });
    } catch (err) {
      console.error("Erro ao atualizar item:", err);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));

    try {
      await fetch(`/api/admin/leads/${leadId}/checklist/${itemId}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Erro ao deletar item:", err);
    }
  };

  const completedCount = items.filter((i) => i.completed).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
          <RiFileList3Line className="w-4 h-4 text-purple-500" />
          Checklist
        </h3>
        {totalCount > 0 && (
          <span className="text-xs text-neutral-500">
            {completedCount}/{totalCount} ({Math.round(progress)}%)
          </span>
        )}
      </div>

      {/* Barra de progresso */}
      {totalCount > 0 && (
        <div className="h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-green-500 rounded-full"
          />
        </div>
      )}

      {/* Items */}
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <RiLoader4Line className="w-5 h-5 animate-spin text-neutral-400" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-xs text-neutral-500 italic">Nenhum item no checklist</p>
      ) : (
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                  item.completed
                    ? "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30"
                    : "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                }`}
              >
                <button
                  onClick={() => handleToggleItem(item.id)}
                  className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                    item.completed
                      ? "bg-green-500 text-white"
                      : "border-2 border-neutral-300 dark:border-neutral-600 hover:border-green-500"
                  }`}
                >
                  {item.completed && <RiCheckLine className="w-3 h-3" />}
                </button>

                <span
                  className={`flex-1 text-xs ${
                    item.completed
                      ? "text-neutral-500 line-through"
                      : "text-neutral-900 dark:text-white"
                  }`}
                >
                  {item.text}
                </span>

                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="flex-shrink-0 p-1 rounded text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  <RiDeleteBinLine className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Adicionar item */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
          placeholder="Adicionar item..."
          className="flex-1 px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
        />
        <button
          onClick={handleAddItem}
          disabled={!newItemText.trim()}
          className="px-3 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-xs"
        >
          <RiAddLine className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
