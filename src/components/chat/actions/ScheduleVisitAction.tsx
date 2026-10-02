"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  RiCalendarEventLine,
  RiArrowLeftSLine,
  RiTimeLine,
  RiMapPinLine,
  RiHome4Line,
  RiCheckLine,
  RiLoader4Line,
  RiExternalLinkLine,
} from "react-icons/ri";

interface ScheduleVisitActionProps {
  chatId: string;
  chatName: string;
  onBack: () => void;
  onSuccess?: () => void;
}

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
}

export function ScheduleVisitAction({ chatId, chatName, onBack, onSuccess }: ScheduleVisitActionProps) {
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [formData, setFormData] = useState({
    title: `Visita - ${chatName}`,
    date: "",
    time: "",
    propertyId: "",
    address: "",
    notes: "",
    type: "VISITA",
  });

  useEffect(() => {
    // Buscar imóveis disponíveis
    const fetchProperties = async () => {
      try {
        const res = await fetch("/api/admin/imoveis?status=DISPONIVEL&limit=20");
        if (res.ok) {
          const data = await res.json();
          setProperties(data.imoveis || []);
        }
      } catch (error) {
        console.error("Erro ao buscar imóveis:", error);
      }
    };
    fetchProperties();
  }, []);

  const handleSubmit = async () => {
    if (!formData.date || !formData.time || !formData.title) {
      alert("Preencha data, hora e título");
      return;
    }

    setLoading(true);
    try {
      const scheduledAt = new Date(`${formData.date}T${formData.time}`);
      
      const response = await fetch("/api/admin/agenda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          scheduledAt: scheduledAt.toISOString(),
          type: formData.type,
          propertyId: formData.propertyId || null,
          address: formData.address || null,
          notes: formData.notes || null,
          whatsappChatId: chatId,
          contactName: chatName,
        }),
      });

      if (response.ok) {
        alert("✅ Visita agendada com sucesso!");
        onSuccess?.();
        onBack();
      } else {
        const error = await response.json();
        alert(`❌ Erro: ${error.message || "Erro ao agendar"}`);
      }
    } catch (error) {
      console.error("Erro ao agendar:", error);
      alert("❌ Erro ao agendar visita");
    } finally {
      setLoading(false);
    }
  };

  const openAgenda = () => {
    window.open("/admin/agenda", "_blank");
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
        <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
          <RiCalendarEventLine className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Agendar Visita</h4>
          <p className="text-[10px] text-neutral-500">{chatName}</p>
        </div>
        <button
          onClick={openAgenda}
          className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          title="Abrir Agenda"
        >
          <RiExternalLinkLine className="w-4 h-4 text-neutral-500" />
        </button>
      </div>

      {/* Form */}
      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
        {/* Título */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Título *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Data e Hora */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              <RiCalendarEventLine className="w-3.5 h-3.5 inline mr-1" />
              Data *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              <RiTimeLine className="w-3.5 h-3.5 inline mr-1" />
              Hora *
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Tipo</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "VISITA", label: "Visita" },
              { value: "REUNIAO", label: "Reunião" },
              { value: "LIGACAO", label: "Ligação" },
            ].map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setFormData({ ...formData, type: t.value })}
                className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                  formData.type === t.value
                    ? "bg-indigo-100 dark:bg-indigo-900/30 border-indigo-500 text-indigo-700 dark:text-indigo-400"
                    : "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Imóvel */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            <RiHome4Line className="w-3.5 h-3.5 inline mr-1" />
            Imóvel
          </label>
          <select
            value={formData.propertyId}
            onChange={(e) => {
              const prop = properties.find(p => p.id === e.target.value);
              setFormData({ 
                ...formData, 
                propertyId: e.target.value,
                address: prop?.address || formData.address
              });
            }}
            className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">Selecione um imóvel (opcional)</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} - {p.address}
              </option>
            ))}
          </select>
        </div>

        {/* Endereço */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            <RiMapPinLine className="w-3.5 h-3.5 inline mr-1" />
            Endereço
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Endereço da visita..."
            className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Observações */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Observações</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Informações adicionais..."
            rows={2}
            className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
          />
        </div>
      </div>

      {/* Preview */}
      {formData.date && formData.time && (
        <div className="p-3 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20 border border-indigo-200 dark:border-indigo-800/50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <RiCalendarEventLine className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">{formData.title}</span>
          </div>
          <div className="text-xs text-indigo-600 dark:text-indigo-400">
            {new Date(`${formData.date}T${formData.time}`).toLocaleString("pt-BR", {
              dateStyle: "full",
              timeStyle: "short",
            })}
          </div>
        </div>
      )}

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
          className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold hover:shadow-lg hover:shadow-indigo-400/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <RiLoader4Line className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <RiCheckLine className="w-4 h-4" />
              Agendar
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
