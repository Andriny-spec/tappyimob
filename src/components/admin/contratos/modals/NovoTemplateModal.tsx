"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCloseLine,
  RiFileList3Line,
  RiLoader4Line,
  RiAddLine,
  RiDeleteBinLine,
  RiMoneyDollarCircleLine,
  RiHome4Line,
  RiExchangeLine,
} from "react-icons/ri";

interface NovoTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NovoTemplateModal({ isOpen, onClose, onSuccess }: NovoTemplateModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    nome: "",
    tipo: "venda",
    descricao: "",
    variaveis: [""],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVariavelChange = (index: number, value: string) => {
    const newVariaveis = [...formData.variaveis];
    newVariaveis[index] = value;
    setFormData((prev) => ({ ...prev, variaveis: newVariaveis }));
  };

  const addVariavel = () => {
    setFormData((prev) => ({ ...prev, variaveis: [...prev.variaveis, ""] }));
  };

  const removeVariavel = (index: number) => {
    const newVariaveis = formData.variaveis.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, variaveis: newVariaveis }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onSuccess?.();
      onClose();
      resetForm();
    } catch (err: any) {
      setError(err.message || "Erro ao criar template");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      tipo: "venda",
      descricao: "",
      variaveis: [""],
    });
  };

  const getTipoConfig = (tipo: string) => {
    const configs: Record<string, { label: string; icon: React.ElementType; color: string }> = {
      venda: { label: "Venda", icon: RiMoneyDollarCircleLine, color: "text-green-500" },
      locacao: { label: "Locação", icon: RiHome4Line, color: "text-blue-500" },
      permuta: { label: "Permuta", icon: RiExchangeLine, color: "text-purple-500" },
    };
    return configs[tipo];
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
            <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-lg p-6 pointer-events-auto max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                    <RiFileList3Line className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                      Novo Template
                    </h2>
                    <p className="text-sm text-neutral-500">Criar modelo de contrato</p>
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
                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Nome do Template *
                  </label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                    placeholder="Ex: Contrato de Compra e Venda - Padrão"
                    className="w-full h-10 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Tipo de Contrato *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {["venda", "locacao", "permuta"].map((tipo) => {
                      const config = getTipoConfig(tipo);
                      const Icon = config.icon;
                      return (
                        <button
                          key={tipo}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, tipo }))}
                          className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                            formData.tipo === tipo
                              ? "border-amber-500 bg-amber-50 dark:bg-amber-500/10"
                              : "border-neutral-200 dark:border-neutral-700 hover:border-amber-300"
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${config.color}`} />
                          <span className="text-sm font-medium text-neutral-900 dark:text-white">{config.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Descrição
                  </label>
                  <textarea
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Descreva quando usar este template..."
                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
                  />
                </div>

                {/* Variáveis */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Variáveis do Template
                    </label>
                    <button
                      type="button"
                      onClick={addVariavel}
                      className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
                    >
                      <RiAddLine className="w-4 h-4" /> Adicionar
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.variaveis.map((variavel, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex-1 relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">{`{{`}</span>
                          <input
                            type="text"
                            value={variavel}
                            onChange={(e) => handleVariavelChange(index, e.target.value)}
                            placeholder="nome_variavel"
                            className="w-full h-10 pl-8 pr-8 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">{`}}`}</span>
                        </div>
                        {formData.variaveis.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeVariavel(index)}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-neutral-400 hover:text-red-500"
                          >
                            <RiDeleteBinLine className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-neutral-500">
                    Use nomes em snake_case. Ex: comprador_nome, valor_venda, data_assinatura
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
                    className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <RiLoader4Line className="w-5 h-5 animate-spin" />
                    ) : (
                      "Criar Template"
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
