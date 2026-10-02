"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiAddLine,
  RiCalendarLine,
  RiTimeLine,
  RiUserLine,
  RiCloseLine,
  RiCheckLine,
  RiLock2Line,
  RiEditLine,
  RiDeleteBinLine,
  RiLoader4Line,
} from "react-icons/ri";

interface Slot {
  id: string;
  photographerId: string;
  photographer: { id: string; name: string; avatar?: string };
  date: string;
  startTime: string;
  endTime: string;
  slotType: string;
  notes?: string;
}

interface Photographer {
  id: string;
  name: string;
  avatar?: string;
}

const slotTypeConfig: Record<string, { label: string; color: string; bg: string }> = {
  DISPONIVEL: { label: "Disponível", color: "text-green-600", bg: "bg-green-100 dark:bg-green-500/20" },
  EDICAO: { label: "Edição", color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-500/20" },
  BLOQUEADO: { label: "Bloqueado", color: "text-red-600", bg: "bg-red-100 dark:bg-red-500/20" },
  RESERVADO: { label: "Reservado", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-500/20" },
};

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

const horarios = [
  "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
];

export default function AgendaFotografosPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [selectedPhotographer, setSelectedPhotographer] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showNewSlotModal, setShowNewSlotModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  // Calcular semana atual
  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      return date;
    });
  };

  const weekDays = getWeekDays();

  useEffect(() => {
    loadPhotographers();
  }, []);

  useEffect(() => {
    loadSlots();
  }, [currentDate, selectedPhotographer]);

  const loadPhotographers = async () => {
    try {
      // Buscar usuários com role FOTOGRAFO
      const res = await fetch("/api/admin/users?role=FOTOGRAFO");
      if (res.ok) {
        const data = await res.json();
        setPhotographers(data.users || []);
      }
    } catch (error) {
      console.error("Erro ao carregar fotógrafos:", error);
    }
  };

  const loadSlots = async () => {
    try {
      const startDate = weekDays[0].toISOString().split("T")[0];
      const endDate = weekDays[6].toISOString().split("T")[0];
      
      const params = new URLSearchParams({
        startDate,
        endDate,
      });
      
      if (selectedPhotographer) {
        params.append("photographerId", selectedPhotographer);
      }
      
      const res = await fetch(`/api/admin/photo-sessions/slots?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSlots(data.slots || []);
      }
    } catch (error) {
      console.error("Erro ao carregar slots:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm("Deseja remover este horário?")) return;
    
    try {
      const res = await fetch(`/api/admin/photo-sessions/slots?id=${slotId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadSlots();
        setSelectedSlot(null);
      }
    } catch (error) {
      console.error("Erro ao remover slot:", error);
    }
  };

  const prevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const getSlotsForDayAndTime = (date: Date, time: string) => {
    const dateStr = date.toISOString().split("T")[0];
    return slots.filter(slot => {
      const slotDateStr = new Date(slot.date).toISOString().split("T")[0];
      return slotDateStr === dateStr && slot.startTime <= time && slot.endTime > time;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/agendamentos/fotos"
            className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <RiArrowLeftLine className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Gerenciar Agenda
            </h1>
            <p className="text-neutral-500">
              Configure disponibilidade e bloqueie horários
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowNewSlotModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600 transition-colors"
        >
          <RiAddLine className="w-5 h-5" />
          Novo Horário
        </button>
      </div>

      {/* Filtros e Navegação */}
      <div className="flex items-center justify-between bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-4">
          {/* Seletor de Fotógrafo */}
          <select
            value={selectedPhotographer}
            onChange={(e) => setSelectedPhotographer(e.target.value)}
            className="px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm"
          >
            <option value="">Todos os fotógrafos</option>
            {photographers.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Navegação de Semana */}
        <div className="flex items-center gap-3">
          <button
            onClick={prevWeek}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <RiArrowLeftSLine className="w-5 h-5" />
          </button>
          <div className="text-center min-w-[200px]">
            <p className="font-semibold">
              {weekDays[0].getDate()} - {weekDays[6].getDate()} de {meses[weekDays[0].getMonth()]}
            </p>
            <p className="text-xs text-neutral-500">{weekDays[0].getFullYear()}</p>
          </div>
          <button
            onClick={nextWeek}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <RiArrowRightSLine className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700"
          >
            Hoje
          </button>
        </div>
      </div>

      {/* Grade de Horários */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RiLoader4Line className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800">
                  <th className="p-3 w-20 text-left text-xs font-medium text-neutral-500 uppercase">
                    Horário
                  </th>
                  {weekDays.map((day, idx) => (
                    <th
                      key={idx}
                      className={`p-3 text-center min-w-[120px] ${
                        isToday(day) ? "bg-purple-50 dark:bg-purple-500/10" : ""
                      }`}
                    >
                      <p className="text-xs text-neutral-500">{diasSemana[day.getDay()]}</p>
                      <p className={`text-lg font-bold ${
                        isToday(day) ? "text-purple-600" : "text-neutral-900 dark:text-white"
                      }`}>
                        {day.getDate()}
                      </p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {horarios.map((hora) => (
                  <tr key={hora} className="border-b border-neutral-100 dark:border-neutral-800/50">
                    <td className="p-2 text-xs font-medium text-neutral-500 align-top">
                      {hora}
                    </td>
                    {weekDays.map((day, dayIdx) => {
                      const daySlots = getSlotsForDayAndTime(day, hora);
                      return (
                        <td
                          key={dayIdx}
                          className={`p-1 align-top min-h-[60px] ${
                            isToday(day) ? "bg-purple-50/50 dark:bg-purple-500/5" : ""
                          }`}
                        >
                          <div className="space-y-1">
                            {daySlots.map((slot) => {
                              const config = slotTypeConfig[slot.slotType] || slotTypeConfig.DISPONIVEL;
                              return (
                                <button
                                  key={slot.id}
                                  onClick={() => setSelectedSlot(slot)}
                                  className={`w-full p-2 rounded-lg text-left text-xs ${config.bg} ${config.color} hover:ring-2 ring-offset-1 ring-current transition-all`}
                                >
                                  <div className="flex items-center gap-1">
                                    {slot.slotType === "BLOQUEADO" && <RiLock2Line className="w-3 h-3" />}
                                    <span className="font-medium truncate">
                                      {slot.photographer?.name?.split(" ")[0] || "Fotógrafo"}
                                    </span>
                                  </div>
                                  <p className="text-[10px] opacity-75">
                                    {slot.startTime} - {slot.endTime}
                                  </p>
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-4 justify-center">
        {Object.entries(slotTypeConfig).map(([key, config]) => (
          <div key={key} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${config.bg}`} />
            <span className="text-xs text-neutral-500">{config.label}</span>
          </div>
        ))}
      </div>

      {/* Modal de Detalhes do Slot */}
      <AnimatePresence>
        {selectedSlot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedSlot(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Detalhes do Horário</h3>
                <button
                  onClick={() => setSelectedSlot(null)}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <RiUserLine className="w-5 h-5 text-neutral-400" />
                  <span>{selectedSlot.photographer?.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <RiCalendarLine className="w-5 h-5 text-neutral-400" />
                  <span>{new Date(selectedSlot.date).toLocaleDateString("pt-BR")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <RiTimeLine className="w-5 h-5 text-neutral-400" />
                  <span>{selectedSlot.startTime} - {selectedSlot.endTime}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${slotTypeConfig[selectedSlot.slotType]?.bg} ${slotTypeConfig[selectedSlot.slotType]?.color}`}>
                    {slotTypeConfig[selectedSlot.slotType]?.label}
                  </span>
                </div>
                {selectedSlot.notes && (
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <p className="text-sm">{selectedSlot.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => handleDeleteSlot(selectedSlot.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-500/10"
                >
                  <RiDeleteBinLine className="w-4 h-4" />
                  Remover
                </button>
                <button
                  onClick={() => setSelectedSlot(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Novo Slot */}
      <AnimatePresence>
        {showNewSlotModal && (
          <NewSlotModal
            photographers={photographers}
            onClose={() => setShowNewSlotModal(false)}
            onSuccess={() => {
              setShowNewSlotModal(false);
              loadSlots();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function NewSlotModal({ photographers, onClose, onSuccess }: { photographers: Photographer[]; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    photographerId: "",
    date: "",
    startTime: "09:00",
    endTime: "12:00",
    slotType: "DISPONIVEL",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.photographerId || !form.date || !form.startTime || !form.endTime) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/photo-sessions/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error("Erro ao criar slot:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">Novo Horário na Agenda</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Fotógrafo */}
          <div>
            <label className="block text-sm font-medium mb-2">Fotógrafo *</label>
            <select
              value={form.photographerId}
              onChange={(e) => setForm({ ...form, photographerId: e.target.value })}
              className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
            >
              <option value="">Selecione...</option>
              {photographers.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Data */}
          <div>
            <label className="block text-sm font-medium mb-2">Data *</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
            />
          </div>

          {/* Horários */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Início *</label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Fim *</label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
              />
            </div>
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium mb-2">Tipo de Horário</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(slotTypeConfig).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setForm({ ...form, slotType: key })}
                  className={`p-3 rounded-xl border transition-all text-sm font-medium ${
                    form.slotType === key
                      ? `${config.bg} ${config.color} border-current`
                      : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                  }`}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium mb-2">Observações</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Ex: Compromisso pessoal, trabalho externo..."
              rows={2}
              className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSubmit}
            disabled={saving || !form.photographerId || !form.date}
            className="flex-1 h-11 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? <RiLoader4Line className="w-5 h-5 animate-spin" /> : <RiCheckLine className="w-5 h-5" />}
            Salvar
          </button>
          <button
            onClick={onClose}
            className="px-6 h-11 rounded-xl border border-neutral-200 dark:border-neutral-700 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            Cancelar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
