"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCloseLine,
  RiMoneyDollarCircleLine,
  RiLoader4Line,
  RiUserLine,
  RiHome4Line,
  RiPercentLine,
} from "react-icons/ri";

interface Corretor {
  id: string;
  name: string;
}

interface AddComissaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddComissaoModal({ isOpen, onClose, onSuccess }: AddComissaoModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  
  const [formData, setFormData] = useState({
    corretorId: "",
    imovelCodigo: "",
    imovelTitulo: "",
    valorVenda: "",
    percentual: "3",
  });

  const valorComissao = formData.valorVenda && formData.percentual
    ? (parseFloat(formData.valorVenda) * parseFloat(formData.percentual)) / 100
    : 0;

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
      const res = await fetch("/api/admin/corretores/comissoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          corretorId: formData.corretorId,
          imovelCodigo: formData.imovelCodigo,
          imovelTitulo: formData.imovelTitulo,
          valorVenda: parseFloat(formData.valorVenda),
          percentual: parseFloat(formData.percentual),
        }),
      });

      if (!res.ok) throw new Error("Erro ao criar comissão");

      setFormData({
        corretorId: "",
        imovelCodigo: "",
        imovelTitulo: "",
        valorVenda: "",
        percentual: "3",
      });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro ao criar comissão");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

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
                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                    <RiMoneyDollarCircleLine className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                      Nova Comissão
                    </h2>
                    <p className="text-sm text-neutral-500">Registrar comissão de venda</p>
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
                {/* Corretor */}
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
                      className="w-full h-10 pl-10 pr-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 appearance-none"
                    >
                      <option value="">Selecione o corretor</option>
                      {corretores.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Imóvel */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Código *
                    </label>
                    <input
                      type="text"
                      name="imovelCodigo"
                      value={formData.imovelCodigo}
                      onChange={handleChange}
                      required
                      placeholder="IMB00001"
                      className="w-full h-10 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Título do Imóvel *
                    </label>
                    <div className="relative">
                      <RiHome4Line className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        type="text"
                        name="imovelTitulo"
                        value={formData.imovelTitulo}
                        onChange={handleChange}
                        required
                        placeholder="Apartamento 3 quartos"
                        className="w-full h-10 pl-10 pr-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Valor e Percentual */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Valor da Venda *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">R$</span>
                      <input
                        type="number"
                        name="valorVenda"
                        value={formData.valorVenda}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                        placeholder="0,00"
                        className="w-full h-10 pl-10 pr-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Percentual *
                    </label>
                    <div className="relative">
                      <RiPercentLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        type="number"
                        name="percentual"
                        value={formData.percentual}
                        onChange={handleChange}
                        required
                        min="0"
                        max="100"
                        step="0.1"
                        className="w-full h-10 pl-10 pr-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Preview da comissão */}
                {valorComissao > 0 && (
                  <div className="p-4 bg-green-50 dark:bg-green-500/10 rounded-xl border border-green-200 dark:border-green-500/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-700 dark:text-green-400">Valor da Comissão</span>
                      <span className="text-xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(valorComissao)}
                      </span>
                    </div>
                  </div>
                )}

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
                    className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <RiLoader4Line className="w-5 h-5 animate-spin" />
                    ) : (
                      "Registrar"
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
