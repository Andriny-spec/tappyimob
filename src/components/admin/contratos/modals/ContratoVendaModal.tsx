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
  RiFileTextLine,
  RiSearchLine,
} from "react-icons/ri";

interface ContratoVendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ContratoVendaModal({ isOpen, onClose, onSuccess }: ContratoVendaModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    // Comprador
    compradorNome: "",
    compradorCpf: "",
    compradorEmail: "",
    compradorTelefone: "",
    // Vendedor
    vendedorNome: "",
    vendedorCpf: "",
    vendedorEmail: "",
    vendedorTelefone: "",
    // Imóvel
    imovelCodigo: "",
    imovelEndereco: "",
    // Valores
    valorVenda: "",
    valorEntrada: "",
    valorFinanciamento: "",
    formaPagamento: "financiamento",
    comissaoPercent: "3",
    // Corretor
    corretorId: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // API call would go here
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
      compradorNome: "",
      compradorCpf: "",
      compradorEmail: "",
      compradorTelefone: "",
      vendedorNome: "",
      vendedorCpf: "",
      vendedorEmail: "",
      vendedorTelefone: "",
      imovelCodigo: "",
      imovelEndereco: "",
      valorVenda: "",
      valorEntrada: "",
      valorFinanciamento: "",
      formaPagamento: "financiamento",
      comissaoPercent: "3",
      corretorId: "",
    });
    setStep(1);
  };

  const valorComissao = formData.valorVenda && formData.comissaoPercent
    ? (parseFloat(formData.valorVenda) * parseFloat(formData.comissaoPercent)) / 100
    : 0;

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
            <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-2xl p-6 pointer-events-auto max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                    <RiMoneyDollarCircleLine className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                      Novo Contrato de Venda
                    </h2>
                    <p className="text-sm text-neutral-500">Passo {step} de 3</p>
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
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`flex-1 h-1.5 rounded-full transition-colors ${
                      s <= step ? "bg-green-500" : "bg-neutral-200 dark:bg-neutral-700"
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
                {/* Step 1: Partes */}
                {step === 1 && (
                  <div className="space-y-6">
                    {/* Comprador */}
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                        <RiUserLine className="w-4 h-4" /> Comprador
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Nome Completo *
                          </label>
                          <input
                            type="text"
                            name="compradorNome"
                            value={formData.compradorNome}
                            onChange={handleChange}
                            required
                            className="w-full h-10 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            CPF/CNPJ *
                          </label>
                          <input
                            type="text"
                            name="compradorCpf"
                            value={formData.compradorCpf}
                            onChange={handleChange}
                            required
                            className="w-full h-10 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            E-mail
                          </label>
                          <input
                            type="email"
                            name="compradorEmail"
                            value={formData.compradorEmail}
                            onChange={handleChange}
                            className="w-full h-10 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Telefone
                          </label>
                          <input
                            type="tel"
                            name="compradorTelefone"
                            value={formData.compradorTelefone}
                            onChange={handleChange}
                            className="w-full h-10 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Vendedor */}
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                        <RiUserLine className="w-4 h-4" /> Vendedor
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Nome Completo *
                          </label>
                          <input
                            type="text"
                            name="vendedorNome"
                            value={formData.vendedorNome}
                            onChange={handleChange}
                            required
                            className="w-full h-10 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            CPF/CNPJ *
                          </label>
                          <input
                            type="text"
                            name="vendedorCpf"
                            value={formData.vendedorCpf}
                            onChange={handleChange}
                            required
                            className="w-full h-10 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            E-mail
                          </label>
                          <input
                            type="email"
                            name="vendedorEmail"
                            value={formData.vendedorEmail}
                            onChange={handleChange}
                            className="w-full h-10 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Telefone
                          </label>
                          <input
                            type="tel"
                            name="vendedorTelefone"
                            value={formData.vendedorTelefone}
                            onChange={handleChange}
                            className="w-full h-10 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Imóvel */}
                {step === 2 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                      <RiHome4Line className="w-4 h-4" /> Dados do Imóvel
                    </h3>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Código do Imóvel *
                        </label>
                        <div className="relative">
                          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                          <input
                            type="text"
                            name="imovelCodigo"
                            value={formData.imovelCodigo}
                            onChange={handleChange}
                            required
                            placeholder="IMB00001"
                            className="w-full h-10 pl-10 pr-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                          />
                        </div>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Endereço Completo *
                        </label>
                        <input
                          type="text"
                          name="imovelEndereco"
                          value={formData.imovelEndereco}
                          onChange={handleChange}
                          required
                          placeholder="Rua, número, bairro, cidade"
                          className="w-full h-10 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Valores */}
                {step === 3 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                      <RiMoneyDollarCircleLine className="w-4 h-4" /> Valores e Pagamento
                    </h3>
                    
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
                            className="w-full h-10 pl-10 pr-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Forma de Pagamento *
                        </label>
                        <select
                          name="formaPagamento"
                          value={formData.formaPagamento}
                          onChange={handleChange}
                          className="w-full h-10 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                        >
                          <option value="avista">À Vista</option>
                          <option value="financiamento">Financiamento Bancário</option>
                          <option value="parcelado">Parcelamento Direto</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Valor de Entrada
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">R$</span>
                          <input
                            type="number"
                            name="valorEntrada"
                            value={formData.valorEntrada}
                            onChange={handleChange}
                            min="0"
                            className="w-full h-10 pl-10 pr-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Comissão (%)
                        </label>
                        <div className="relative">
                          <RiPercentLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                          <input
                            type="number"
                            name="comissaoPercent"
                            value={formData.comissaoPercent}
                            onChange={handleChange}
                            min="0"
                            max="10"
                            step="0.5"
                            className="w-full h-10 pl-10 pr-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Resumo */}
                    {formData.valorVenda && (
                      <div className="mt-4 p-4 bg-green-50 dark:bg-green-500/10 rounded-xl border border-green-200 dark:border-green-500/20">
                        <h4 className="font-medium text-green-800 dark:text-green-400 mb-2">Resumo</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-green-700 dark:text-green-400">Valor da Venda:</span>
                            <span className="font-semibold text-green-800 dark:text-green-300">
                              {formatCurrency(parseFloat(formData.valorVenda) || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-700 dark:text-green-400">Comissão ({formData.comissaoPercent}%):</span>
                            <span className="font-semibold text-green-800 dark:text-green-300">
                              {formatCurrency(valorComissao)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-6 border-t border-neutral-200 dark:border-neutral-800 mt-6">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={() => setStep(step - 1)}
                      className="flex-1 h-10 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    >
                      Voltar
                    </button>
                  )}
                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={() => setStep(step + 1)}
                      className="flex-1 h-10 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600"
                    >
                      Próximo
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <RiLoader4Line className="w-5 h-5 animate-spin" />
                      ) : (
                        "Gerar Contrato"
                      )}
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
