"use client";

import { motion, AnimatePresence } from "framer-motion";
import { RiCloseLine } from "react-icons/ri";
import { Lead } from "@/types/lead";
import { QualificationChecklist } from "../QualificationChecklist";

interface QualificationModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onLeadUpdate?: (updatedLead: Lead) => void;
}

export function QualificationModal({
  lead,
  isOpen,
  onClose,
  onLeadUpdate,
}: QualificationModalProps) {
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
            className="bg-white dark:bg-neutral-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Checklist de Qualificação
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

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <QualificationChecklist
                leadId={lead.id}
                initialAnswers={(lead as any).qualificationAnswers || {}}
                onAnswersChange={(answers, score) => {
                  if (onLeadUpdate) {
                    onLeadUpdate({
                      ...lead,
                      qualificationAnswers: answers,
                      qualificationScore: score,
                    } as Lead);
                  }
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
