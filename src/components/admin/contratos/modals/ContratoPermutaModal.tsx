"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCloseLine,
  RiExchangeLine,
  RiLoader4Line,
  RiUserLine,
  RiHome4Line,
  RiMoneyDollarCircleLine,
  RiArrowLeftRightLine,
} from "react-icons/ri";

interface ContratoPermutaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ContratoPermutaModal({ isOpen, onClose, onSuccess }: ContratoPermutaModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    // Parte 1
    parte1Nome: "",
    parte1Cpf: "",
    parte1Email: "",
    parte1Imovel: "",
    parte1ImovelCodigo: "",
    parte1ValorAvaliado: "",
    // Parte 2
    parte2Nome: "",
    parte2Cpf: "",
    parte2Email: "",
    parte2Imovel: "",
    parte2ImovelCodigo: "",
    parte2ValorAvaliado: "",
    // Torna
    temTorna: false,
    tornaPagador: "parte2",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value 
    }));
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
      setError(err.message || "Erro ao criar contrato");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      parte1Nome: "",
      parte1Cpf: "",
      parte1Email: "",
      parte1Imovel: "",
      parte1ImovelCodigo: "",
      parte1ValorAvaliado: "",
      parte2Nome: "",
      parte2Cpf: "",
      parte2Email: "",
      parte2Imovel: "",
      parte2ImovelCodigo: "",
      parte2ValorAvaliado: "",
      temTorna: false,
      tornaPagador: "parte2",
    });
    setStep(1);
  };

  const valorTorna = Math.abs(
    (parseFloat(formData.parte1ValorAvaliado) || 0) - 
    (parseFloat(formData.parte2ValorAvaliado) || 0)
  );

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
            <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-3xl p-6 pointer-events-auto max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                    <RiExchangeLine className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                      Novo Contrato de Permuta
                    </h2>
                    <p className="text-sm text-neutral-500">Passo {step} de 2</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="flex gap-2 mb-6">
                {[1, 2].map((s) => (
                  <div
                    key={s}
                    className={`flex-1 h-1.5 rounded-full transition-colors ${
                      s <= step ? "bg-purple-500" : "bg-neutral-200 dark:bg-neutral-700"
                    }`}
                  />
                ))}
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Step 1: Partes e Imóveis */}
                {step === 1 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Parte 1 */}
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                      <h3 className="font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                        <RiUserLine className="w-4 h-4" /> Parte 1
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-1">Nome *</label>
                          <input type="text" name="parte1Nome" value={formData.parte1Nome} onChange={handleChange} required className="w-full h-10 px-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                        </div>
                        <div>
                          <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-1">CPF/CNPJ *</label>
                          <input type="text" name="parte1Cpf" value={formData.parte1Cpf} onChange={handleChange} required className="w-full h-10 px-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                        </div>
                        <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700">
                          <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-1 flex items-center gap-1">
                            <RiHome4Line className="w-3.5 h-3.5" /> Imóvel Oferecido *
                          </label>
                          <input type="text" name="parte1Imovel" value={formData.parte1Imovel} onChange={handleChange} required placeholder="Descrição do imóvel" className="w-full h-10 px-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                        </div>
                        <div>
                          <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-1">Código do Imóvel</label>
                          <input type="text" name="parte1ImovelCodigo" value={formData.parte1ImovelCodigo} onChange={handleChange} placeholder="IMB00001" className="w-full h-10 px-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                        </div>
                        <div>
                          <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-1">Valor Avaliado *</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">R$</span>
                            <input type="number" name="parte1ValorAvaliado" value={formData.parte1ValorAvaliado} onChange={handleChange} required min="0" className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Parte 2 */}
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                      <h3 className="font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                        <RiUserLine className="w-4 h-4" /> Parte 2
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-1">Nome *</label>
                          <input type="text" name="parte2Nome" value={formData.parte2Nome} onChange={handleChange} required className="w-full h-10 px-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                        </div>
                        <div>
                          <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-1">CPF/CNPJ *</label>
                          <input type="text" name="parte2Cpf" value={formData.parte2Cpf} onChange={handleChange} required className="w-full h-10 px-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                        </div>
                        <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700">
                          <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-1 flex items-center gap-1">
                            <RiHome4Line className="w-3.5 h-3.5" /> Imóvel Oferecido *
                          </label>
                          <input type="text" name="parte2Imovel" value={formData.parte2Imovel} onChange={handleChange} required placeholder="Descrição do imóvel" className="w-full h-10 px-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                        </div>
                        <div>
                          <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-1">Código do Imóvel</label>
                          <input type="text" name="parte2ImovelCodigo" value={formData.parte2ImovelCodigo} onChange={handleChange} placeholder="IMB00002" className="w-full h-10 px-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                        </div>
                        <div>
                          <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-1">Valor Avaliado *</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">R$</span>
                            <input type="number" name="parte2ValorAvaliado" value={formData.parte2ValorAvaliado} onChange={handleChange} required min="0" className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Torna e Resumo */}
                {step === 2 && (
                  <div className="space-y-6">
                    {/* Visual de Permuta */}
                    <div className="grid grid-cols-3 gap-4 items-center">
                      <div className="p-4 bg-purple-50 dark:bg-purple-500/10 rounded-xl text-center">
                        <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Parte 1</p>
                        <p className="font-semibold text-neutral-900 dark:text-white">{formData.parte1Nome || "-"}</p>
                        <p className="text-lg font-bold text-purple-600 mt-2">
                          {formatCurrency(parseFloat(formData.parte1ValorAvaliado) || 0)}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                          <RiArrowLeftRightLine className="w-8 h-8 text-purple-500" />
                        </div>
                      </div>

                      <div className="p-4 bg-purple-50 dark:bg-purple-500/10 rounded-xl text-center">
                        <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Parte 2</p>
                        <p className="font-semibold text-neutral-900 dark:text-white">{formData.parte2Nome || "-"}</p>
                        <p className="text-lg font-bold text-purple-600 mt-2">
                          {formatCurrency(parseFloat(formData.parte2ValorAvaliado) || 0)}
                        </p>
                      </div>
                    </div>

                    {/* Torna */}
                    {valorTorna > 0 && (
                      <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/20">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <RiMoneyDollarCircleLine className="w-5 h-5 text-amber-600" />
                            <span className="font-semibold text-amber-800 dark:text-amber-400">Torna (Diferença)</span>
                          </div>
                          <span className="text-xl font-bold text-amber-600">{formatCurrency(valorTorna)}</span>
                        </div>
                        <div>
                          <label className="block text-sm text-amber-700 dark:text-amber-400 mb-2">Quem paga a torna?</label>
                          <select
                            name="tornaPagador"
                            value={formData.tornaPagador}
                            onChange={handleChange}
                            className="w-full h-10 px-4 rounded-xl bg-white dark:bg-neutral-900 border border-amber-200 dark:border-amber-500/30 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                          >
                            <option value="parte1">{formData.parte1Nome || "Parte 1"}</option>
                            <option value="parte2">{formData.parte2Nome || "Parte 2"}</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {valorTorna === 0 && formData.parte1ValorAvaliado && formData.parte2ValorAvaliado && (
                      <div className="p-4 bg-green-50 dark:bg-green-500/10 rounded-xl border border-green-200 dark:border-green-500/20 text-center">
                        <p className="text-green-700 dark:text-green-400 font-medium">
                          ✓ Permuta sem torna - Valores iguais
                        </p>
                      </div>
                    )}

                    {/* Resumo */}
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                      <h4 className="font-semibold text-neutral-900 dark:text-white mb-3">Resumo da Operação</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-neutral-600 dark:text-neutral-400">Valor Total Transacionado:</span>
                          <span className="font-semibold text-neutral-900 dark:text-white">
                            {formatCurrency(
                              (parseFloat(formData.parte1ValorAvaliado) || 0) + 
                              (parseFloat(formData.parte2ValorAvaliado) || 0)
                            )}
                          </span>
                        </div>
                        {valorTorna > 0 && (
                          <div className="flex justify-between">
                            <span className="text-neutral-600 dark:text-neutral-400">Torna a ser paga:</span>
                            <span className="font-semibold text-amber-600">{formatCurrency(valorTorna)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-6 border-t border-neutral-200 dark:border-neutral-800 mt-6">
                  {step > 1 && (
                    <button type="button" onClick={() => setStep(step - 1)} className="flex-1 h-10 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800">
                      Voltar
                    </button>
                  )}
                  {step < 2 ? (
                    <button type="button" onClick={() => setStep(step + 1)} className="flex-1 h-10 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600">
                      Próximo
                    </button>
                  ) : (
                    <button type="submit" disabled={isSubmitting} className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600 disabled:opacity-50">
                      {isSubmitting ? <RiLoader4Line className="w-5 h-5 animate-spin" /> : "Gerar Contrato"}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
