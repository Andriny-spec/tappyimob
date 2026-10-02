"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  RiCheckboxLine,
  RiCheckboxFill,
  RiArrowLeftSLine,
  RiAddLine,
  RiDeleteBinLine,
  RiLoader4Line,
} from "react-icons/ri";

interface ChecklistActionProps {
  chatId: string;
  chatName: string;
  onBack: () => void;
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export function ChecklistAction({ chatId, chatName, onBack }: ChecklistActionProps) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItem, setNewItem] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [chatId]);

  const fetchItems = async () => {
    try {
      const response = await fetch(`/api/admin/chats/${chatId}/checklist`);
      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error("Erro ao buscar checklist:", error);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/chats/${chatId}/checklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newItem }),
      });

      if (response.ok) {
        const data = await response.json();
        setItems([...items, data.item]);
        setNewItem("");
      }
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/admin/checklist/${itemId}/toggle`, {
        method: "PUT",
      });

      if (response.ok) {
        setItems(items.map((item) => (item.id === itemId ? { ...item, completed: !item.completed } : item)));
      }
    } catch (error) {
      console.error("Erro ao alternar item:", error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/admin/checklist/${itemId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setItems(items.filter((item) => item.id !== itemId));
      }
    } catch (error) {
      console.error("Erro ao excluir item:", error);
    }
  };

  const completedCount = items.filter((i) => i.completed).length;
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full flex flex-col gap-3"
    >
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-neutral-200 dark:border-neutral-700">
        <button
          onClick={onBack}
          className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
        >
          <RiArrowLeftSLine className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
        </button>
        <div className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-900/30">
          <RiCheckboxLine className="w-4 h-4 text-teal-600 dark:text-teal-400" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Checklist</h4>
          <p className="text-[10px] text-neutral-500">{chatName}</p>
        </div>
      </div>

      {/* Progresso */}
      {items.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500">Progresso</span>
            <span className="font-medium text-teal-600">{completedCount}/{items.length}</span>
          </div>
          <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Novo Item */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Adicionar item..."
          className="flex-1 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
          onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
        />
        <button
          onClick={handleAddItem}
          disabled={loading || !newItem.trim()}
          className="px-3 py-2 rounded-xl bg-teal-500 text-white hover:bg-teal-600 disabled:opacity-50 flex items-center"
        >
          {loading ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiAddLine className="w-4 h-4" />}
        </button>
      </div>

      {/* Lista de Items */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {items.length === 0 ? (
          <div className="text-center py-6 text-neutral-500">
            <RiCheckboxLine className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">Nenhum item ainda</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all group ${
                item.completed
                  ? "bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800/50"
                  : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
              }`}
            >
              <button
                onClick={() => toggleItem(item.id)}
                className={`flex-shrink-0 ${item.completed ? "text-teal-500" : "text-neutral-400"}`}
              >
                {item.completed ? (
                  <RiCheckboxFill className="w-5 h-5" />
                ) : (
                  <RiCheckboxLine className="w-5 h-5" />
                )}
              </button>
              <span
                className={`flex-1 text-sm ${
                  item.completed ? "line-through text-neutral-400" : "text-neutral-700 dark:text-neutral-300"
                }`}
              >
                {item.text}
              </span>
              <button
                onClick={() => handleDeleteItem(item.id)}
                className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all"
              >
                <RiDeleteBinLine className="w-3.5 h-3.5 text-red-500" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Voltar */}
      <button
        onClick={onBack}
        className="w-full px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
      >
        Voltar
      </button>
    </motion.div>
  );
}
