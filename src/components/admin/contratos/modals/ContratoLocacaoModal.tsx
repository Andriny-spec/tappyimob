"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCloseLine,
  RiHome4Line,
  RiLoader4Line,
  RiUserLine,
  RiMoneyDollarCircleLine,
  RiCalendarLine,
  RiShieldLine,
  RiSearchLine,
} from "react-icons/ri";

interface ContratoLocacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ContratoLocacaoModal({ isOpen, onClose, onSuccess }: ContratoLocacaoModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    // Locatário
    locatarioNome: "",
    locatarioCpf: "",
    locatarioEmail: "",
    locatarioTelefone: "",
    // Locador
    locadorNome: "",
    locadorCpf: "",
    locadorEmail: "",
    locadorTelefone: "",
    // Imóvel
    imovelCodigo: "",
    imovelEndereco: "",
    tipoImovel: "residencial",
    // Valores
    valorAluguel: "",
    valorCondominio: "",
    valorIptu: "",
    diaVencimento: "5",
    // Garantia
    tipoGarantia: "seguro_fianca",
    valorGarantia: "",
    // Vigência
    dataInicio: "",
    prazoMeses: "12",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      locatarioNome: "",
      locatarioCpf: "",
      locatarioEmail: "",
      locatarioTelefone: "",
      locadorNome: "",
      locadorCpf: "",
      locadorEmail: "",
      locadorTelefone: "",
      imovelCodigo: "",
      imovelEndereco: "",
      tipoImovel: "residencial",
      valorAluguel: "",
      valorCondominio: "",
      valorIptu: "",
      diaVencimento: "5",
      tipoGarantia: "seguro_fianca",
      valorGarantia: "",
      dataInicio: "",
      prazoMeses: "12",
    });
    setStep(1);
  };

  const valorTotal = 
    (parseFloat(formData.valorAluguel) || 0) + 
    (parseFloat(formData.valorCondominio) || 0) + 
    (parseFloat(formData.valorIptu) || 0);

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
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                    <RiHome4Line className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                      Novo Contrato de Locação
                    </h2>
                    <p className="text-sm text-neutral-500">Passo {step} de 4</p>
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
                {[1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className={`flex-1 h-1.5 rounded-full transition-colors ${
                      s <= step ? "bg-blue-500" : "bg-neutral-200 dark:bg-neutral-700"
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
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                        <RiUserLine className="w-4 h-4" /> Locatário (Inquilino)
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Nome *</label>
                          <input type="text" name="locatarioNome" value={formData.locatarioNome} onChange={handleChange} required className="w-full h-10 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">CPF/CNPJ *</label>
                          <input type="text" name="locatarioCpf" value={formData.locatarioCpf} onChange={handleChange} required className="w-full h-10 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">E-mail</label>
                          <input type="email" name="locatarioEmail" value={formData.locatarioEmail} onChange={handleChange} className="w-full h-10 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Telefone</label>
                          <input type="tel" name="locatarioTelefone" value={formData.locatarioTelefone} onChange={handleChange} className="w-full h-10 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                        <RiUserLine className="w-4 h-4" /> Locador (Proprietário)
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Nome *</label>
                          <input type="text" name="locadorNome" value={formData.locadorNome} onChange={handleChange} required className="w-full h-10 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">CPF/CNPJ *</label>
                          <input type="text" name="locadorCpf" value={formData.locadorCpf} onChange={handleChange} required className="w-full h-10 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">E-mail</label>
                          <input type="email" name="locadorEmail" value={formData.locadorEmail} onChange={handleChange} className="w-full h-10 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Telefone</label>
                          <input type="tel" name="locadorTelefone" value={formData.locadorTelefone} onChange={handleChange} className="w-full h-10 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Código *</label>
                        <div className="relative">
                          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                          <input type="text" name="imovelCodigo" value={formData.imovelCodigo} onChange={handleChange} required placeholder="IMB00001" className="w-full h-10 pl-10 pr-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Tipo *</label>
                        <select name="tipoImovel" value={formData.tipoImovel} onChange={handleChange} className="w-full h-10 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                          <option value="residencial">Residencial</option>
                          <option value="comercial">Comercial</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Endereço Completo *</label>
                      <input type="text" name="imovelEndereco" value={formData.imovelEndereco} onChange={handleChange} required className="w-full h-10 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                    </div>
                  </div>
                )}

                {/* Step 3: Valores */}
                {step === 3 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                      <RiMoneyDollarCircleLine className="w-4 h-4" /> Valores Mensais
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Aluguel *</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">R$</span>
                          <input type="number" name="valorAluguel" value={formData.valorAluguel} onChange={handleChange} required min="0" className="w-full h-10 pl-10 pr-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Condomínio</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">R$</span>
                          <input type="number" name="valorCondominio" value={formData.valorCondominio} onChange={handleChange} min="0" className="w-full h-10 pl-10 pr-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">IPTU (mensal)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">R$</span>
                          <input type="number" name="valorIptu" value={formData.valorIptu} onChange={handleChange} min="0" className="w-full h-10 pl-10 pr-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Dia de Vencimento</label>
                        <select name="diaVencimento" value={formData.diaVencimento} onChange={handleChange} className="w-full h-10 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                          {[1, 5, 10, 15, 20, 25].map((d) => (
                            <option key={d} value={d}>Dia {d}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {valorTotal > 0 && (
                      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-500/20">
                        <div className="flex justify-between items-center">
                          <span className="text-blue-700 dark:text-blue-400">Total Mensal:</span>
                          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(valorTotal)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4: Garantia e Vigência */}
                {step === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                        <RiShieldLine className="w-4 h-4" /> Garantia
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Tipo de Garantia *</label>
                          <select name="tipoGarantia" value={formData.tipoGarantia} onChange={handleChange} className="w-full h-10 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                            <option value="seguro_fianca">Seguro Fiança</option>
                            <option value="caucao">Depósito Caução</option>
                            <option value="fiador">Fiador</option>
                            <option value="capitalizacao">Título de Capitalização</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Valor da Garantia</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">R$</span>
                            <input type="number" name="valorGarantia" value={formData.valorGarantia} onChange={handleChange} min="0" className="w-full h-10 pl-10 pr-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                        <RiCalendarLine className="w-4 h-4" /> Vigência
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Data de Início *</label>
                          <input type="date" name="dataInicio" value={formData.dataInicio} onChange={handleChange} required className="w-full h-10 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Prazo (meses) *</label>
                          <select name="prazoMeses" value={formData.prazoMeses} onChange={handleChange} className="w-full h-10 px-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                            <option value="12">12 meses</option>
                            <option value="24">24 meses</option>
                            <option value="30">30 meses</option>
                            <option value="36">36 meses</option>
                          </select>
                        </div>
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
                  {step < 4 ? (
                    <button type="button" onClick={() => setStep(step + 1)} className="flex-1 h-10 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600">
                      Próximo
                    </button>
                  ) : (
                    <button type="submit" disabled={isSubmitting} className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 disabled:opacity-50">
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
