"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCloseLine,
  RiRefreshLine,
  RiUserLine,
  RiArrowRightLine,
} from "react-icons/ri";
import { Lead, LeadStatus, leadStatusLabels, leadStatusColors } from "@/types/lead";

interface UnarchiveLeadModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onUnarchive: (leadId: string, newStatus: LeadStatus, corretorId: string | null) => Promise<void>;
  corretores: { id: string; name: string; avatar: string | null }[];
}

export default function UnarchiveLeadModal({
  lead,
  isOpen,
  onClose,
  onUnarchive,
  corretores,
}: UnarchiveLeadModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus>("NOVO");
  const [selectedCorretor, setSelectedCorretor] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (lead?.previousStatus && lead.previousStatus !== "ARQUIVADO") {
      setSelectedStatus(lead.previousStatus);
    }
    if (lead?.corretorId) {
      setSelectedCorretor(lead.corretorId);
    }
  }, [lead]);

  if (!lead) return null;

  const handleUnarchive = async () => {
    setIsSubmitting(true);
    try {
      await onUnarchive(lead.id, selectedStatus, selectedCorretor);
      onClose();
    } catch (error) {
      console.error("Erro ao repescar lead:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableStatuses: LeadStatus[] = ["NOVO", "CONTATADO", "QUALIFICADO", "NEGOCIANDO"];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-800 flex items-center justify-center">
                    <RiRefreshLine className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                      Repescar Lead
                    </h2>
                    <p className="text-sm text-neutral-500">{lead.name}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Archive Info */}
                {lead.archivedReason && (
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                    <p className="text-xs text-neutral-500 mb-1">Motivo do arquivamento:</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">
                      {lead.archivedReason}
                    </p>
                    {lead.archivedAt && (
                      <p className="text-xs text-neutral-400 mt-2">
                        Arquivado em: {new Date(lead.archivedAt).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>
                )}

                {/* Status Selection */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    Para qual etapa deseja mover?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableStatuses.map((status) => (
                      <button
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          selectedStatus === status
                            ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                            : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: leadStatusColors[status] }}
                          />
                          <span className="text-sm font-medium text-neutral-900 dark:text-white">
                            {leadStatusLabels[status]}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Corretor Selection */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    <RiUserLine className="inline w-4 h-4 mr-1" />
                    Atribuir a qual corretor?
                  </label>
                  <select
                    value={selectedCorretor || ""}
                    onChange={(e) => setSelectedCorretor(e.target.value || null)}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  >
                    <option value="">Sem corretor atribuído</option>
                    {corretores.map((corretor) => (
                      <option key={corretor.id} value={corretor.id}>
                        {corretor.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Preview */}
                <div className="flex items-center justify-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                  <div className="text-center">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mx-auto mb-1">
                      <span className="text-xs">📦</span>
                    </div>
                    <span className="text-xs text-neutral-500">Arquivo</span>
                  </div>
                  <RiArrowRightLine className="w-5 h-5 text-green-500" />
                  <div className="text-center">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1"
                      style={{ backgroundColor: leadStatusColors[selectedStatus] + "30" }}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: leadStatusColors[selectedStatus] }}
                      />
                    </div>
                    <span className="text-xs text-neutral-500">{leadStatusLabels[selectedStatus]}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUnarchive}
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Repescando...
                    </>
                  ) : (
                    <>
                      <RiRefreshLine className="w-4 h-4" />
                      Repescar Lead
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
