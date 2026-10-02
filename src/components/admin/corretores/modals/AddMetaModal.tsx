"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCloseLine,
  RiFocus3Line,
  RiLoader4Line,
  RiUserLine,
  RiCalendarLine,
  RiHome4Line,
  RiMoneyDollarCircleLine,
  RiGroupLine,
  RiGiftLine,
} from "react-icons/ri";

interface Corretor {
  id: string;
  name: string;
}

interface AddMetaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddMetaModal({ isOpen, onClose, onSuccess }: AddMetaModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  
  const [formData, setFormData] = useState({
    corretorId: "",
    periodo: "",
    metaVendas: "",
    metaValor: "",
    metaLeads: "",
    bonus: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchCorretores();
    }
  }, [isOpen]);

  const fetchCorretores = async () => {
    try {
      const res = await fetch("/api/admin/corretores");
      if (res.ok) {
        const data = await res.json();
        setCorretores(data);
      }
    } catch (error) {
      console.error("Erro ao carregar corretores:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/admin/corretores/metas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          corretorId: formData.corretorId,
          periodo: formData.periodo,
          metaVendas: parseInt(formData.metaVendas),
          metaValor: parseFloat(formData.metaValor),
          metaLeads: parseInt(formData.metaLeads),
          bonus: formData.bonus ? parseFloat(formData.bonus) : 0,
        }),
      });

      if (!res.ok) throw new Error("Erro ao criar meta");

      setFormData({
        corretorId: "",
        periodo: "",
        metaVendas: "",
        metaValor: "",
        metaLeads: "",
        bonus: "",
      });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro ao criar meta");
    } finally {
      setIsSubmitting(false);
    }
  };

  const periodos = [
    "Janeiro 2024",
    "Fevereiro 2024",
    "Março 2024",
    "Abril 2024",
    "Maio 2024",
    "Junho 2024",
    "Julho 2024",
    "Agosto 2024",
    "Setembro 2024",
    "Outubro 2024",
    "Novembro 2024",
    "Dezembro 2024",
    "Q1 2024",
    "Q2 2024",
    "Q3 2024",
    "Q4 2024",
  ];

  return (
    <AnimatePresence>
      {isOpen && (
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
            <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-lg p-6 pointer-events-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                    <RiFocus3Line className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                      Definir Meta
                    </h2>
                    <p className="text-sm text-neutral-500">Configure a meta do corretor</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Corretor e Período */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Corretor *
                    </label>
                    <div className="relative">
                      <RiUserLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <select
                        name="corretorId"
                        value={formData.corretorId}
                        onChange={handleChange}
                        required
                        className="w-full h-10 pl-10 pr-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none"
                      >
                        <option value="">Selecione</option>
                        {corretores.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Período *
                    </label>
                    <div className="relative">
                      <RiCalendarLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <select
                        name="periodo"
                        value={formData.periodo}
                        onChange={handleChange}
                        required
                        className="w-full h-10 pl-10 pr-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none"
                      >
                        <option value="">Selecione</option>
                        {periodos.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Metas */}
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl space-y-4">
                  <h3 className="font-medium text-neutral-900 dark:text-white">Metas</h3>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">
                        Vendas
                      </label>
                      <div className="relative">
                        <RiHome4Line className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          type="number"
                          name="metaVendas"
                          value={formData.metaVendas}
                          onChange={handleChange}
                          required
                          min="0"
                          placeholder="5"
                          className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">
                        Valor (R$)
                      </label>
                      <div className="relative">
                        <RiMoneyDollarCircleLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          type="number"
                          name="metaValor"
                          value={formData.metaValor}
                          onChange={handleChange}
                          required
                          min="0"
                          placeholder="1000000"
                          className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">
                        Leads
                      </label>
                      <div className="relative">
                        <RiGroupLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          type="number"
                          name="metaLeads"
                          value={formData.metaLeads}
                          onChange={handleChange}
                          required
                          min="0"
                          placeholder="15"
                          className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bônus */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Bônus por atingir meta
                  </label>
                  <div className="relative">
                    <RiGiftLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="number"
                      name="bonus"
                      value={formData.bonus}
                      onChange={handleChange}
                      min="0"
                      placeholder="5000"
                      className="w-full h-10 pl-10 pr-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">
                    Valor do bônus se a meta for atingida
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 h-10 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <RiLoader4Line className="w-5 h-5 animate-spin" />
                    ) : (
                      "Definir Meta"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
