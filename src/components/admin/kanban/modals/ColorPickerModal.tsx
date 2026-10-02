"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiCloseLine, RiCheckLine, RiPaletteLine } from "react-icons/ri";
import { KanbanColumn } from "@/types/lead";

const presetColors = [
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#ef4444", // red
  "#25D366", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#0ea5e9", // sky
  "#6366f1", // indigo
  "#a855f7", // violet
  "#d946ef", // fuchsia
  "#f43f5e", // rose
  "#78716c", // stone
  "#64748b", // slate
  "#71717a", // zinc
];

interface ColorPickerModalProps {
  column: KanbanColumn | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (columnId: string, color: string) => void;
}

export function ColorPickerModal({
  column,
  isOpen,
  onClose,
  onSave,
}: ColorPickerModalProps) {
  const [selectedColor, setSelectedColor] = useState(column?.color || "#3b82f6");
  const [customColor, setCustomColor] = useState(column?.color || "#3b82f6");

  const handleSave = () => {
    if (column) {
      onSave(column.id, selectedColor);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && column && (
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
            <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-sm p-6 pointer-events-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg"
                    style={{ backgroundColor: selectedColor }}
                  />
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                    Cor da Coluna
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-sm text-neutral-500 mb-3">Cores predefinidas</p>
                <div className="grid grid-cols-5 gap-2">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        setCustomColor(color);
                      }}
                      className={`w-10 h-10 rounded-xl transition-all ${
                        selectedColor === color
                          ? "ring-2 ring-offset-2 ring-neutral-900 dark:ring-white dark:ring-offset-neutral-900 scale-110"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {selectedColor === color && (
                        <RiCheckLine className="w-5 h-5 text-white mx-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-neutral-500 mb-3">Cor personalizada</p>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => {
                      setCustomColor(e.target.value);
                      setSelectedColor(e.target.value);
                    }}
                    className="w-12 h-12 rounded-xl border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customColor}
                    onChange={(e) => {
                      setCustomColor(e.target.value);
                      if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                        setSelectedColor(e.target.value);
                      }
                    }}
                    placeholder="#000000"
                    className="flex-1 h-12 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 h-12 px-6 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 h-12 px-6 rounded-xl text-white font-medium transition-colors"
                  style={{ backgroundColor: selectedColor }}
                >
                  <RiPaletteLine className="w-5 h-5" />
                  Aplicar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
