"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCloseLine,
  RiDeleteBinLine,
  RiAlertLine,
  RiLoader4Line,
} from "react-icons/ri";
import { Property } from "@/types/property";

interface PropertyDeleteModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

export function PropertyDeleteModal({ property, isOpen, onClose, onConfirm }: PropertyDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!property) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(property.id);
      onClose();
    } catch (error) {
      console.error("Error deleting property:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none"
          >
            <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-md p-6 pointer-events-auto">
              {/* Icon */}
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center">
                <RiAlertLine className="w-8 h-8 text-red-500" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white text-center mb-2">
                Excluir Imóvel
              </h3>

              {/* Description */}
              <p className="text-neutral-600 dark:text-neutral-400 text-center mb-2">
                Você está prestes a excluir o imóvel:
              </p>

              <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl mb-4">
                <p className="font-semibold text-neutral-900 dark:text-white text-center">
                  {property.code} - {property.title}
                </p>
                <p className="text-sm text-neutral-500 text-center mt-1">
                  {property.neighborhood}, {property.city}
                </p>
              </div>

              <p className="text-sm text-red-500 text-center mb-6">
                Esta ação não pode ser desfeita. Todos os dados relacionados serão perdidos.
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isDeleting}
                  className="flex-1 h-12 px-6 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 h-12 px-6 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <RiLoader4Line className="w-5 h-5 animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <RiDeleteBinLine className="w-5 h-5" />
                      Excluir
                    </>
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
