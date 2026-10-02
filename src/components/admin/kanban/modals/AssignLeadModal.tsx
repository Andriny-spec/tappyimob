"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCloseLine,
  RiUserLine,
  RiSearchLine,
  RiCheckLine,
  RiLoader4Line,
  RiRefreshLine,
  RiShuffleLine,
} from "react-icons/ri";
import { Lead } from "@/types/lead";

interface Corretor {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  leadsCount: number;
  region?: string;
}

interface AssignLeadModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onAssign: (leadId: string, corretorId: string) => Promise<void>;
}

export function AssignLeadModal({
  lead,
  isOpen,
  onClose,
  onAssign,
}: AssignLeadModalProps) {
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCorretor, setSelectedCorretor] = useState<string | null>(null);

  // Buscar corretores
  const fetchCorretores = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/corretores?active=true");
      if (res.ok) {
        const data = await res.json();
        setCorretores(data.corretores || []);
      }
    } catch (error) {
      console.error("Erro ao buscar corretores:", error);
      // Mock data para demonstração
      setCorretores([
        { id: "1", name: "Maria Silva", email: "maria@tappyimob.com.br", avatar: null, leadsCount: 12, region: "Zona Sul" },
        { id: "2", name: "João Santos", email: "joao@tappyimob.com.br", avatar: null, leadsCount: 8, region: "Zona Norte" },
        { id: "3", name: "Ana Costa", email: "ana@tappyimob.com.br", avatar: null, leadsCount: 15, region: "Centro" },
        { id: "4", name: "Carlos Oliveira", email: "carlos@tappyimob.com.br", avatar: null, leadsCount: 5, region: "Zona Oeste" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCorretores();
      setSelectedCorretor(lead?.corretorId || null);
    }
  }, [isOpen, lead]);

  const handleAssign = async () => {
    if (!lead || !selectedCorretor) return;
    
    setIsAssigning(true);
    try {
      await onAssign(lead.id, selectedCorretor);
      onClose();
    } catch (error) {
      console.error("Erro ao atribuir lead:", error);
    } finally {
      setIsAssigning(false);
    }
  };

  // Rodízio automático - seleciona o corretor com menos leads
  const handleAutoAssign = () => {
    const sorted = [...corretores].sort((a, b) => a.leadsCount - b.leadsCount);
    if (sorted.length > 0) {
      setSelectedCorretor(sorted[0].id);
    }
  };

  const filteredCorretores = corretores.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  if (!lead) return null;

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

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-800">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                    Atribuir Lead
                  </h2>
                  <p className="text-sm text-neutral-500 mt-0.5">
                    {lead.name}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5">
                {/* Search and Auto-assign */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="relative flex-1">
                    <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar corretor..."
                      className="w-full h-10 pl-10 pr-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-0 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                  <button
                    onClick={handleAutoAssign}
                    className="flex items-center gap-2 h-10 px-4 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-500/30 transition-colors"
                    title="Atribuir ao corretor com menos leads"
                  >
                    <RiShuffleLine className="w-4 h-4" />
                    Rodízio
                  </button>
                </div>

                {/* Corretores List */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RiLoader4Line className="w-6 h-6 text-orange-500 animate-spin" />
                    </div>
                  ) : filteredCorretores.length === 0 ? (
                    <div className="text-center py-8 text-neutral-500">
                      Nenhum corretor encontrado
                    </div>
                  ) : (
                    filteredCorretores.map((corretor) => (
                      <button
                        key={corretor.id}
                        onClick={() => setSelectedCorretor(corretor.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                          selectedCorretor === corretor.id
                            ? "bg-orange-100 dark:bg-orange-500/20 border-2 border-orange-500"
                            : "bg-neutral-50 dark:bg-neutral-800 border-2 border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {corretor.avatar ? (
                            <img src={corretor.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            corretor.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-neutral-900 dark:text-white text-sm">
                            {corretor.name}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {corretor.region} • {corretor.leadsCount} leads ativos
                          </p>
                        </div>
                        {selectedCorretor === corretor.id && (
                          <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                            <RiCheckLine className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </button>
                    ))
                  )}
                </div>

                {/* Info */}
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    O corretor selecionado receberá uma notificação e o lead aparecerá em seu painel.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAssign}
                  disabled={!selectedCorretor || isAssigning}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAssigning ? (
                    <RiLoader4Line className="w-4 h-4 animate-spin" />
                  ) : (
                    <RiUserLine className="w-4 h-4" />
                  )}
                  Atribuir
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
