"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCloseLine,
  RiInboxArchiveLine,
  RiArrowDownSLine,
} from "react-icons/ri";
import { Lead } from "@/types/lead";

interface ArchiveLeadModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onArchive: (leadId: string, reason: string, category: string) => Promise<void>;
  isAdmin?: boolean;
}

const defaultArchiveReasons = [
  "Sem perfil financeiro",
  "Sem interação",
  "Comprou (concorrente)",
  "Alugou (concorrente)",
  "Efetivado Compra (Tappy)",
  "Efetivado Aluguel (Tappy)",
  "Contato inválido",
  "Sem interesse atual",
  "Outro",
];

const archiveDestinations = [
  { id: "limbo", label: "Limbo", description: "Leads descartados/perdidos", color: "bg-red-50 text-red-700 border-red-200" },
  { id: "acervo", label: "Acervo", description: "Relacionamento de longo prazo", color: "bg-blue-50 text-blue-700 border-blue-200" },
];

const defaultLimboCategories = [
  { id: "perdido", label: "Perdido", color: "bg-red-100 text-red-700" },
  { id: "nurturing", label: "Nurturing", color: "bg-blue-100 text-blue-700" },
  { id: "reativar", label: "Reativar depois", color: "bg-amber-100 text-amber-700" },
  { id: "sem_perfil", label: "Sem perfil", color: "bg-neutral-100 text-neutral-700" },
];

const defaultAcervoCategories = [
  { id: "efetivados", label: "Efetivados", color: "bg-green-100 text-green-700" },
  { id: "investidores", label: "Investidores", color: "bg-purple-100 text-purple-700" },
  { id: "sem_interacao", label: "Sem interação", color: "bg-neutral-100 text-neutral-700" },
];

export default function ArchiveLeadModal({
  lead,
  isOpen,
  onClose,
  onArchive,
  isAdmin = true,
}: ArchiveLeadModalProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("perdido");
  const [selectedDestination, setSelectedDestination] = useState("limbo");
  const [customReason, setCustomReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic reasons/categories from config
  const [archiveReasons, setArchiveReasons] = useState<string[]>(defaultArchiveReasons);
  const [limboCategories, setLimboCategories] = useState(defaultLimboCategories);
  const [acervoCategories, setAcervoCategories] = useState(defaultAcervoCategories);

  useEffect(() => {
    if (!isOpen) return;
    const fetchConfig = async () => {
      try {
        const [reasonsRes, limboCatRes, acervoCatRes, acervoCustomRes, acervoLabelsRes] = await Promise.all([
          fetch("/api/admin/config?key=archive_reasons"),
          fetch("/api/admin/config?key=archive_limbo_categories"),
          fetch("/api/admin/config?key=archive_acervo_categories"),
          fetch("/api/admin/config?key=acervo_custom_categories"),
          fetch("/api/admin/config?key=acervo_category_labels"),
        ]);
        if (reasonsRes.ok) {
          const data = await reasonsRes.json();
          if (data.value && Array.isArray(data.value) && data.value.length > 0) {
            setArchiveReasons(data.value);
          }
        }
        if (limboCatRes.ok) {
          const data = await limboCatRes.json();
          if (data.value && Array.isArray(data.value) && data.value.length > 0) {
            setLimboCategories(data.value);
          }
        }
        // Merge acervo categories: explicit config > default + custom tabs
        let finalAcervoCats = [...defaultAcervoCategories];
        if (acervoCatRes.ok) {
          const data = await acervoCatRes.json();
          if (data.value && Array.isArray(data.value) && data.value.length > 0) {
            finalAcervoCats = data.value;
          }
        }
        // Add custom categories from acervo page
        if (acervoCustomRes.ok) {
          const data = await acervoCustomRes.json();
          if (data.value && typeof data.value === "object") {
            const existingIds = new Set(finalAcervoCats.map((c: any) => c.id));
            Object.entries(data.value).forEach(([key, config]: [string, any]) => {
              if (!existingIds.has(key)) {
                finalAcervoCats.push({ id: key, label: config.label, color: config.bgColor ? `${config.bgColor} ${config.color}` : "bg-neutral-100 text-neutral-700" });
              }
            });
          }
        }
        // Apply custom labels
        if (acervoLabelsRes.ok) {
          const data = await acervoLabelsRes.json();
          if (data.value && typeof data.value === "object") {
            finalAcervoCats = finalAcervoCats.map((cat: any) => ({
              ...cat,
              label: data.value[cat.id] || cat.label,
            }));
          }
        }
        setAcervoCategories(finalAcervoCats);
      } catch (err) {
        // fallback to defaults
      }
    };
    fetchConfig();
  }, [isOpen]);

  if (!lead) return null;

  const handleArchive = async () => {
    const reason = selectedReason === "Outro" ? customReason : selectedReason;
    if (!reason.trim()) {
      alert("Selecione um motivo");
      return;
    }

    setIsSubmitting(true);
    try {
      await onArchive(lead.id, reason, selectedCategory);
      onClose();
      setSelectedReason("");
      setSelectedCategory("perdido");
      setCustomReason("");
    } catch (error) {
      console.error("Erro ao arquivar lead:", error);
    } finally {
      setIsSubmitting(false);
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          {/* Modal Compacto */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-xs overflow-hidden">
              {/* Header Compacto */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <RiInboxArchiveLine className="w-5 h-5 text-neutral-500" />
                  <span className="font-semibold text-neutral-900 dark:text-white text-sm">
                    Arquivar Cliente
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
                >
                  <RiCloseLine className="w-4 h-4" />
                </button>
              </div>

              {/* Content Compacto */}
              <div className="p-4 space-y-3">
                <p className="text-xs text-neutral-500">
                  Lead: <span className="font-medium text-neutral-700 dark:text-neutral-300">{lead.name}</span>
                </p>

                {/* Select de Motivo */}
                <div className="relative">
                  <select
                    value={selectedReason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  >
                    <option value="">Selecione o motivo...</option>
                    {archiveReasons.map((reason) => (
                      <option key={reason} value={reason}>{reason}</option>
                    ))}
                  </select>
                  <RiArrowDownSLine className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                </div>

                {/* Campo Outro */}
                {selectedReason === "Outro" && (
                  <input
                    type="text"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Descreva o motivo..."
                    className="w-full px-3 py-2 text-sm rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                )}

                {/* Destino e Categoria */}
                <div>
                  <p className="text-xs text-neutral-500 mb-2">Destino:</p>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {archiveDestinations.map((dest) => (
                      <button
                        key={dest.id}
                        type="button"
                        onClick={() => {
                          setSelectedDestination(dest.id);
                          setSelectedCategory(dest.id === "acervo" ? (acervoCategories[0]?.id || "efetivados") : "perdido");
                        }}
                        className={`p-2 rounded-lg text-xs font-medium border transition-all text-center ${
                          selectedDestination === dest.id
                            ? `${dest.color} ring-2 ring-offset-1 ring-neutral-400`
                            : "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100"
                        }`}
                      >
                        <div className="font-semibold">{dest.label}</div>
                        <div className="text-[10px] mt-0.5 opacity-70">{dest.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-neutral-500 mb-2">Categoria:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedDestination === "acervo" ? acervoCategories : limboCategories).map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all ${
                          selectedCategory === cat.id
                            ? `${cat.color} ring-2 ring-offset-1 ring-neutral-400`
                            : "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Compacto */}
              <div className="flex items-center gap-2 px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
                <button
                  onClick={onClose}
                  className="flex-1 px-3 py-2 text-sm rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleArchive}
                  disabled={isSubmitting || !selectedReason || (selectedReason === "Outro" && !customReason.trim())}
                  className="flex-1 px-3 py-2 text-sm rounded-lg bg-neutral-700 text-white font-medium hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <RiInboxArchiveLine className="w-4 h-4" />
                      Arquivar
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
