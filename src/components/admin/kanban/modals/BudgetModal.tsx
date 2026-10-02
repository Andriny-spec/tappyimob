"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCloseLine,
  RiMoneyDollarCircleLine,
  RiLoader4Line,
  RiArrowUpLine,
  RiArrowDownLine,
  RiHome4Line,
  RiCalculatorLine,
  RiBankLine,
} from "react-icons/ri";
import { Lead } from "@/types/lead";

interface BudgetModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (leadId: string, budget: any) => void;
}

export function BudgetModal({ lead, isOpen, onClose, onSave }: BudgetModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    minBudget: lead?.budget ? Math.round(lead.budget * 0.8) : 0,
    maxBudget: lead?.budget || 0,
    hasFinancing: false,
    financingApproved: false,
    approvedAmount: 0,
    downPayment: 0,
    preferredPayment: "vista" as "vista" | "financiamento" | "parcelado",
  });

  const handleSave = async () => {
    if (!lead) return;
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    onSave(lead.id, formData);
    setIsSaving(false);
    onClose();
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const budgetRange = formData.maxBudget - formData.minBudget;
  const financingPercentage = formData.maxBudget > 0 
    ? Math.round((formData.approvedAmount / formData.maxBudget) * 100) 
    : 0;

  return (
    <AnimatePresence>
      {isOpen && lead && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-[60] pointer-events-none"
          >
            <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-md p-6 pointer-events-auto max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                    <RiMoneyDollarCircleLine className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                      Orçamento
                    </h2>
                    <p className="text-sm text-neutral-500">{lead.name}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>

              {/* Current budget display */}
              {lead.budget && lead.budget > 0 && (
                <div className="p-4 bg-green-50 dark:bg-green-500/10 rounded-xl mb-6">
                  <p className="text-sm text-neutral-500 mb-1">Orçamento atual</p>
                  <p className="text-2xl font-bold text-green-500">
                    {formatPrice(lead.budget)}
                  </p>
                </div>
              )}

              {/* Property of interest */}
              {lead.property && (
                <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl mb-6">
                  <RiHome4Line className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {lead.property.code}
                    </p>
                    <p className="text-sm text-orange-500 font-semibold">
                      {formatPrice(lead.property.price)}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* Budget range */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Faixa de Orçamento
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Mínimo</p>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">R$</span>
                        <input
                          type="number"
                          value={formData.minBudget}
                          onChange={(e) => handleInputChange("minBudget", parseInt(e.target.value) || 0)}
                          className="w-full h-10 pl-10 pr-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Máximo</p>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">R$</span>
                        <input
                          type="number"
                          value={formData.maxBudget}
                          onChange={(e) => handleInputChange("maxBudget", parseInt(e.target.value) || 0)}
                          className="w-full h-10 pl-10 pr-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment preference */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Forma de Pagamento
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "vista", label: "À Vista" },
                      { id: "financiamento", label: "Financiamento" },
                      { id: "parcelado", label: "Parcelado" },
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleInputChange("preferredPayment", option.id)}
                        className={`h-10 rounded-lg text-sm font-medium transition-all ${
                          formData.preferredPayment === option.id
                            ? "bg-green-500 text-white"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Financing section */}
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RiBankLine className="w-5 h-5 text-blue-500" />
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">
                        Financiamento
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.hasFinancing}
                        onChange={(e) => handleInputChange("hasFinancing", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-neutral-200 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>

                  {formData.hasFinancing && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-3 pt-3 border-t border-neutral-200 dark:border-neutral-700"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-500">Aprovado?</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.financingApproved}
                            onChange={(e) => handleInputChange("financingApproved", e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-neutral-200 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                      </div>

                      {formData.financingApproved && (
                        <>
                          <div>
                            <p className="text-xs text-neutral-500 mb-1">Valor aprovado</p>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">R$</span>
                              <input
                                type="number"
                                value={formData.approvedAmount}
                                onChange={(e) => handleInputChange("approvedAmount", parseInt(e.target.value) || 0)}
                                className="w-full h-10 pl-10 pr-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                              />
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-neutral-500 mb-1">Entrada</p>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">R$</span>
                              <input
                                type="number"
                                value={formData.downPayment}
                                onChange={(e) => handleInputChange("downPayment", parseInt(e.target.value) || 0)}
                                className="w-full h-10 pl-10 pr-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Summary */}
                {formData.maxBudget > 0 && (
                  <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <RiCalculatorLine className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">
                        Resumo
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Faixa de orçamento:</span>
                        <span className="font-medium text-neutral-900 dark:text-white">
                          {formatPrice(formData.minBudget)} - {formatPrice(formData.maxBudget)}
                        </span>
                      </div>
                      {formData.hasFinancing && formData.financingApproved && (
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Financiamento aprovado:</span>
                          <span className="font-medium text-green-500">
                            {formatPrice(formData.approvedAmount)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  onClick={onClose}
                  className="flex-1 h-10 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <RiLoader4Line className="w-5 h-5 animate-spin" />
                  ) : (
                    "Salvar"
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
