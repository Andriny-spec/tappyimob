"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  RiCloseLine,
  RiFileList3Line,
  RiArrowRightLine,
  RiTimeLine,
} from "react-icons/ri";

interface PendingProposal {
  id: string;
  propertyId: string;
  status: string;
  proposedValue: number;
  updatedAt: string;
  property?: { code: string; title: string };
}

export function ProposalReminderPopup() {
  const [proposals, setProposals] = useState<PendingProposal[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Verificar se já foi dispensado nesta sessão
    const dismissedAt = sessionStorage.getItem("proposal_reminder_dismissed");
    if (dismissedAt) {
      // Reaparecer após 2 horas mesmo que tenha sido dispensado
      const elapsed = Date.now() - parseInt(dismissedAt);
      const twoHours = 2 * 60 * 60 * 1000;
      if (elapsed < twoHours) return;
      sessionStorage.removeItem("proposal_reminder_dismissed");
    }

    fetchPendingProposals();
  }, []);

  const fetchPendingProposals = async () => {
    try {
      const res = await fetch("/api/admin/proposals/pending");
      if (res.ok) {
        const data = await res.json();
        if (data.proposals?.length > 0) {
          setProposals(data.proposals);
          setIsOpen(true);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar propostas pendentes:", error);
    }
  };

  const handleDismiss = () => {
    setIsOpen(false);
    sessionStorage.setItem("proposal_reminder_dismissed", String(Date.now()));
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const getDaysSinceUpdate = (updatedAt: string) => {
    const diff = Date.now() - new Date(updatedAt).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDENTE: "Pendente",
      EM_NEGOCIACAO: "Em Negociação",
      CONTRA_PROPOSTA: "Contra-proposta",
      ACEITA: "Aceita",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDENTE: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
      EM_NEGOCIACAO: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
      CONTRA_PROPOSTA: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
      ACEITA: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
    };
    return colors[status] || "bg-neutral-100 text-neutral-700";
  };

  if (!isOpen || proposals.length === 0) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleDismiss}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl mx-4 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-rose-500 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <RiFileList3Line className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">Propostas Ativas</h2>
                  <p className="text-sm text-white/80">
                    {proposals.length} proposta{proposals.length > 1 ? "s" : ""} aguardando atualização
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Proposals List */}
          <div className="p-4 max-h-[400px] overflow-y-auto space-y-2">
            {proposals.map((proposal) => {
              const daysSince = getDaysSinceUpdate(proposal.updatedAt);
              return (
                <Link
                  key={proposal.id}
                  href={`/corretor/imoveis/${proposal.propertyId}?tab=propostas`}
                  onClick={handleDismiss}
                  className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                        {proposal.property?.code || "Imóvel"}
                      </span>
                      <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-medium ${getStatusColor(proposal.status)}`}>
                        {getStatusLabel(proposal.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-neutral-500">
                      <span className="font-medium">{formatCurrency(proposal.proposedValue)}</span>
                      {daysSince > 0 && (
                        <span className={`flex items-center gap-1 ${daysSince >= 3 ? "text-red-500 font-medium" : ""}`}>
                          <RiTimeLine className="w-3 h-3" />
                          {daysSince}d sem atualização
                        </span>
                      )}
                    </div>
                  </div>
                  <RiArrowRightLine className="w-4 h-4 text-neutral-400 group-hover:text-orange-500 transition-colors" />
                </Link>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
            <button
              onClick={handleDismiss}
              className="w-full px-4 py-2.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl text-sm font-medium transition-colors"
            >
              Lembrar mais tarde
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
