"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  RiUserAddLine,
  RiArrowLeftSLine,
  RiFireLine,
  RiTempColdLine,
  RiSunLine,
  RiHome4Line,
  RiMoneyDollarCircleLine,
  RiMapPinLine,
  RiCheckLine,
  RiLoader4Line,
} from "react-icons/ri";

interface ConvertToLeadActionProps {
  chatId: string;
  chatName: string;
  chatPhone: string;
  onBack: () => void;
  onSuccess?: () => void;
}

const temperaturas = [
  { value: "HOT", label: "Quente", icon: RiFireLine, color: "text-red-500 bg-red-50 border-red-200" },
  { value: "WARM", label: "Morno", icon: RiSunLine, color: "text-amber-500 bg-amber-50 border-amber-200" },
  { value: "COLD", label: "Frio", icon: RiTempColdLine, color: "text-blue-500 bg-blue-50 border-blue-200" },
];

const tickets = [
  { value: "COMPRA", label: "Compra" },
  { value: "LOCACAO", label: "Locação" },
  { value: "INVESTIMENTO", label: "Investimento" },
  { value: "PERMUTA", label: "Permuta" },
];

const faixasPreco = [
  { value: "ate300k", label: "Até R$ 300.000" },
  { value: "300k-500k", label: "R$ 300.000 - R$ 500.000" },
  { value: "500k-800k", label: "R$ 500.000 - R$ 800.000" },
  { value: "800k-1.2m", label: "R$ 800.000 - R$ 1.200.000" },
  { value: "acima1.2m", label: "Acima de R$ 1.200.000" },
];

export function ConvertToLeadAction({ chatId, chatName, chatPhone, onBack, onSuccess }: ConvertToLeadActionProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: chatName,
    phone: chatPhone,
    email: "",
    temperature: "WARM",
    ticket: "COMPRA",
    priceRange: "300k-500k",
    region: "",
    notes: "",
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone) {
      alert("Nome e telefone são obrigatórios");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email || null,
          temperature: formData.temperature,
          ticket: formData.ticket,
          priceRange: formData.priceRange,
          region: formData.region || null,
          notes: formData.notes || null,
          source: "WHATSAPP",
          status: "NOVO",
          whatsappChatId: chatId,
        }),
      });

      if (response.ok) {
        alert("✅ Lead criado com sucesso! Acesse o Kanban para visualizar.");
        onSuccess?.();
        onBack();
      } else {
        const error = await response.json();
        alert(`❌ Erro: ${error.message || "Erro ao criar lead"}`);
      }
    } catch (error) {
      console.error("Erro ao criar lead:", error);
      alert("❌ Erro ao criar lead");
    } finally {
      setLoading(false);
    }
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
        <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
          <RiUserAddLine className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Converter em Lead</h4>
          <p className="text-[10px] text-neutral-500">{chatName}</p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {/* Nome e Telefone */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Nome *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Telefone *</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@exemplo.com"
            className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
          />
        </div>

        {/* Temperatura */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Temperatura</label>
          <div className="grid grid-cols-3 gap-2">
            {temperaturas.map((temp) => (
              <button
                key={temp.value}
                type="button"
                onClick={() => setFormData({ ...formData, temperature: temp.value })}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                  formData.temperature === temp.value
                    ? temp.color + " border-2"
                    : "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                }`}
              >
                <temp.icon className="w-4 h-4" />
                {temp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ticket */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Interesse</label>
          <div className="grid grid-cols-2 gap-2">
            {tickets.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setFormData({ ...formData, ticket: t.value })}
                className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                  formData.ticket === t.value
                    ? "bg-orange-100 dark:bg-orange-900/30 border-orange-500 text-orange-700 dark:text-orange-400"
                    : "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Faixa de Preço */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            <RiMoneyDollarCircleLine className="w-3.5 h-3.5 inline mr-1" />
            Faixa de Preço
          </label>
          <select
            value={formData.priceRange}
            onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
            className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
          >
            {faixasPreco.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        {/* Região */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            <RiMapPinLine className="w-3.5 h-3.5 inline mr-1" />
            Região de Interesse
          </label>
          <input
            type="text"
            value={formData.region}
            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            placeholder="Ex: Zona Sul, Moema, Pinheiros..."
            className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
          />
        </div>

        {/* Observações */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Observações</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Informações adicionais sobre o lead..."
            rows={2}
            className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
        <button
          onClick={onBack}
          className="flex-1 px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-emerald-500 text-white text-xs font-semibold hover:shadow-lg hover:shadow-orange-400/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <RiLoader4Line className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <RiCheckLine className="w-4 h-4" />
              Criar Lead
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
