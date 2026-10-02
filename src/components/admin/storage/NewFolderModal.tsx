"use client";

import { motion, AnimatePresence } from "framer-motion";

interface NewFolderModalProps {
  isOpen: boolean;
  folderName: string;
  setFolderName: (name: string) => void;
  onClose: () => void;
  onCreate: () => void;
}

export function NewFolderModal({ isOpen, folderName, setFolderName, onClose, onCreate }: NewFolderModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-md p-6"
          >
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Nova Pasta</h3>
            <input
              type="text"
              placeholder="Nome da pasta"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onCreate()}
              className="w-full px-4 py-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 border-0 focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={onClose} className="px-4 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
                Cancelar
              </button>
              <button
                onClick={onCreate}
                disabled={!folderName.trim()}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
              >
                Criar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
