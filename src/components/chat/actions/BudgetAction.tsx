"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  RiMoneyDollarCircleLine,
  RiArrowLeftSLine,
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiLoader4Line,
  RiSendPlaneLine,
} from "react-icons/ri";

interface BudgetActionProps {
  chatId: string;
  chatName: string;
  onBack: () => void;
  onSendMessage?: (message: string) => void;
}

interface Budget {
  id: string;
  value: number;
  description: string;
  validUntil: string;
  status: "pending" | "sent" | "accepted" | "rejected";
  createdAt: string;
}

export function BudgetAction({ chatId, chatName, onBack, onSendMessage }: BudgetActionProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    value: "",
    description: "",
    validDays: "7",
  });

  useEffect(() => {
    fetchBudgets();
  }, [chatId]);

  const fetchBudgets = async () => {
    try {
      const response = await fetch(`/api/admin/chats/${chatId}/budgets`);
      if (response.ok) {
        const data = await response.json();
        setBudgets(data.budgets || []);
      }
    } catch (error) {
      console.error("Erro ao buscar orçamentos:", error);
    }
  };

  const handleAddBudget = async () => {
    if (!formData.value || !formData.description) return;

    setLoading(true);
    try {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + parseInt(formData.validDays));

      const response = await fetch(`/api/admin/chats/${chatId}/budgets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          value: parseFloat(formData.value.replace(/\D/g, "")) / 100,
          description: formData.description,
          validUntil: validUntil.toISOString(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setBudgets([data.budget, ...budgets]);
        setFormData({ value: "", description: "", validDays: "7" });
        setShowForm(false);
      }
    } catch (error) {
      console.error("Erro ao criar orçamento:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendBudget = (budget: Budget) => {
    const message = `💰 *ORÇAMENTO*\n\n📋 ${budget.description}\n💵 Valor: ${formatCurrency(budget.value)}\n📅 Válido até: ${new Date(budget.validUntil).toLocaleDateString("pt-BR")}\n\n_Aguardo seu retorno!_`;
    onSendMessage?.(message);
    onBack();
  };

  const handleDeleteBudget = async (budgetId: string) => {
    if (!confirm("Excluir este orçamento?")) return;

    try {
      const response = await fetch(`/api/admin/budgets/${budgetId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setBudgets(budgets.filter((b) => b.id !== budgetId));
      }
    } catch (error) {
      console.error("Erro ao excluir orçamento:", error);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    const formatted = (parseInt(value || "0") / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    setFormData({ ...formData, value: formatted });
  };

  const statusConfig = {
    pending: { label: "Pendente", color: "bg-yellow-100 text-yellow-700" },
    sent: { label: "Enviado", color: "bg-blue-100 text-blue-700" },
    accepted: { label: "Aceito", color: "bg-green-100 text-green-700" },
    rejected: { label: "Rejeitado", color: "bg-red-100 text-red-700" },
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full flex flex-col gap-3"
    >
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-neutral-200 dark:border-neutral-700">
        <button
          onClick={onBack}
          className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
        >
          <RiArrowLeftSLine className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
        </button>
        <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30">
          <RiMoneyDollarCircleLine className="w-4 h-4 text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Orçamentos</h4>
          <p className="text-[10px] text-neutral-500">{chatName}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="p-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600"
        >
          <RiAddLine className="w-4 h-4" />
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl space-y-3">
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Valor</label>
            <input
              type="text"
              value={formData.value}
              onChange={handleValueChange}
              placeholder="R$ 0,00"
              className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o orçamento..."
              rows={2}
              className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Validade</label>
            <select
              value={formData.validDays}
              onChange={(e) => setFormData({ ...formData, validDays: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
            >
              <option value="3">3 dias</option>
              <option value="7">7 dias</option>
              <option value="15">15 dias</option>
              <option value="30">30 dias</option>
            </select>
          </div>
          <button
            onClick={handleAddBudget}
            disabled={loading || !formData.value || !formData.description}
            className="w-full px-3 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : "Criar Orçamento"}
          </button>
        </div>
      )}

      {/* Lista de Orçamentos */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {budgets.length === 0 ? (
          <div className="text-center py-6 text-neutral-500">
            <RiMoneyDollarCircleLine className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">Nenhum orçamento ainda</p>
          </div>
        ) : (
          budgets.map((budget) => (
            <div
              key={budget.id}
              className="p-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(budget.value)}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusConfig[budget.status].color}`}>
                      {statusConfig[budget.status].label}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">{budget.description}</p>
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Válido até: {new Date(budget.validUntil).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleSendBudget(budget)}
                    className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
                    title="Enviar no chat"
                  >
                    <RiSendPlaneLine className="w-3.5 h-3.5 text-green-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteBudget(budget.id)}
                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                    title="Excluir"
                  >
                    <RiDeleteBinLine className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Voltar */}
      <button
        onClick={onBack}
        className="w-full px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
      >
        Voltar
      </button>
    </motion.div>
  );
}
