"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCloseLine,
  RiCalendarLine,
  RiTimeLine,
  RiPhoneLine,
  RiVideoLine,
  RiMapPinLine,
  RiMessageLine,
  RiLoader4Line,
  RiAddLine,
  RiDeleteBinLine,
  RiCheckLine,
  RiGoogleFill,
  RiExternalLinkLine,
} from "react-icons/ri";
import { Lead, LeadSchedule } from "@/types/lead";

interface ScheduleModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (leadId: string, schedule: any) => void;
}

const scheduleTypes = [
  { id: "LIGACAO", label: "Ligação", icon: RiPhoneLine, activeBg: "bg-green-100 dark:bg-green-500/20", activeText: "text-green-500", iconBg: "bg-green-100 dark:bg-green-500/20" },
  { id: "FOLLOWUP", label: "Follow-up", icon: RiMessageLine, activeBg: "bg-purple-100 dark:bg-purple-500/20", activeText: "text-purple-500", iconBg: "bg-purple-100 dark:bg-purple-500/20" },
  { id: "CAPTACAO", label: "Captar", icon: RiMapPinLine, activeBg: "bg-amber-100 dark:bg-amber-500/20", activeText: "text-amber-500", iconBg: "bg-amber-100 dark:bg-amber-500/20" },
  { id: "ENVIAR_OPCOES", label: "Enviar Opções", icon: RiMessageLine, activeBg: "bg-cyan-100 dark:bg-cyan-500/20", activeText: "text-cyan-500", iconBg: "bg-cyan-100 dark:bg-cyan-500/20" },
];

export function ScheduleModal({ lead, isOpen, onClose }: ScheduleModalProps) {
  const [schedules, setSchedules] = useState<LeadSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "LIGACAO",
    date: "",
    time: "",
    notes: "",
    syncGoogleCalendar: false,
  });
  const [googleConnected, setGoogleConnected] = useState<boolean | null>(null);

  // Verificar conexão com Google Calendar (opcional)
  useEffect(() => {
    const checkGoogleConnection = async () => {
      try {
        const res = await fetch("/api/admin/google/calendar");
        const data = await res.json();
        setGoogleConnected(data.connected === true);
      } catch {
        setGoogleConnected(false);
      }
    };
    if (isOpen) {
      checkGoogleConnection();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && lead) {
      fetchSchedules();
    }
  }, [isOpen, lead?.id]);

  const fetchSchedules = async () => {
    if (!lead) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}/schedules`);
      if (res.ok) {
        const data = await res.json();
        setSchedules(data);
      }
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSchedule = async () => {
    if (!formData.date || !formData.time || !lead) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}/schedules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const schedule = await res.json();
        setSchedules([...schedules, schedule]);
        setFormData({ type: "LIGACAO", date: "", time: "", notes: "", syncGoogleCalendar: false });
        setShowForm(false);
      }
    } catch (error) {
      console.error("Erro ao adicionar agendamento:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!lead) return;
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}/schedules?scheduleId=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSchedules(schedules.filter((s) => s.id !== id));
      }
    } catch (error) {
      console.error("Erro ao excluir agendamento:", error);
    }
  };

  const handleCompleteSchedule = async (id: string) => {
    if (!lead) return;
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}/schedules?scheduleId=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      });
      if (res.ok) {
        setSchedules(schedules.map((s) => s.id === id ? { ...s, completed: true } : s));
      }
    } catch (error) {
      console.error("Erro ao completar agendamento:", error);
    }
  };

  const formatDate = (date: string) => {
    // Use T12:00:00 to avoid timezone shifting the date to previous day
    const safeDate = date.length === 10 ? `${date}T12:00:00` : date.replace("T00:00:00.000Z", "T12:00:00");
    return new Date(safeDate).toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  };

  const minDate = new Date().toISOString().split("T")[0];

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
            <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-md p-6 pointer-events-auto max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                    <RiCalendarLine className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                      Agenda
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

              {/* Next follow-up info */}
              {lead.nextFollowUp && (
                <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-500/10 rounded-xl mb-4">
                  <RiTimeLine className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      Próximo follow-up
                    </p>
                    <p className="text-xs text-orange-500">
                      {new Date(lead.nextFollowUp).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
              )}

              {/* Add button */}
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center justify-center gap-2 w-full h-10 mb-4 rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:border-blue-300 hover:text-blue-500 transition-colors"
                >
                  <RiAddLine className="w-5 h-5" />
                  Agendar
                </button>
              )}

              {/* Add form */}
              <AnimatePresence>
                {showForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl space-y-3"
                  >
                    {/* Type selection */}
                    <div className="grid grid-cols-4 gap-2">
                      {scheduleTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() =>
                            setFormData({ ...formData, type: type.id as any })
                          }
                          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                            formData.type === type.id
                              ? `${type.activeBg} ${type.activeText}`
                              : "bg-white dark:bg-neutral-900 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                          }`}
                        >
                          <type.icon className="w-5 h-5" />
                          <span className="text-xs">{type.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Date and time */}
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        min={minDate}
                        className="h-10 px-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                      <input
                        type="time"
                        value={formData.time}
                        onChange={(e) =>
                          setFormData({ ...formData, time: e.target.value })
                        }
                        className="h-10 px-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>

                    {/* Notes */}
                    <input
                      type="text"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      placeholder="Observações (opcional)"
                      className="w-full h-10 px-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />

                    {/* Google Calendar sync (opcional) */}
                    {googleConnected && (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
                        <div className="flex items-center gap-2">
                          <RiGoogleFill className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-neutral-700 dark:text-neutral-300">
                            Sincronizar com Google Agenda
                          </span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.syncGoogleCalendar}
                            onChange={(e) => setFormData({ ...formData, syncGoogleCalendar: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-neutral-600 peer-checked:bg-blue-500"></div>
                        </label>
                      </div>
                    )}

                    {/* Form actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowForm(false)}
                        className="flex-1 h-9 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-500 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleAddSchedule}
                        disabled={!formData.date || !formData.time}
                        className="flex-1 h-9 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
                      >
                        Adicionar
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Schedules list */}
              <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <RiLoader4Line className="w-8 h-8 mx-auto text-blue-500 animate-spin" />
                  </div>
                ) : schedules.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500">
                    <RiCalendarLine className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum agendamento</p>
                  </div>
                ) : (
                  schedules.map((schedule) => {
                    const typeConfig = scheduleTypes.find(
                      (t) => t.id === schedule.type
                    );
                    const Icon = typeConfig?.icon || RiCalendarLine;

                    return (
                      <motion.div
                        key={schedule.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-center gap-3 p-3 rounded-xl group ${
                          schedule.completed 
                            ? "bg-green-50 dark:bg-green-500/10" 
                            : "bg-neutral-50 dark:bg-neutral-800"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-lg ${typeConfig?.iconBg} flex items-center justify-center`}
                        >
                          {schedule.completed ? (
                            <RiCheckLine className="w-5 h-5 text-green-500" />
                          ) : (
                            <Icon className={`w-5 h-5 ${typeConfig?.activeText}`} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${schedule.completed ? "text-green-600 line-through" : "text-neutral-900 dark:text-white"}`}>
                            {typeConfig?.label}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {formatDate(schedule.date)} às {schedule.time}
                          </p>
                          {schedule.notes && (
                            <p className="text-xs text-neutral-400 truncate">
                              {schedule.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {!schedule.completed && (
                            <button
                              onClick={() => handleCompleteSchedule(schedule.id)}
                              className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-green-50 dark:hover:bg-green-500/10 text-neutral-400 hover:text-green-500 transition-all"
                              title="Marcar como concluído"
                            >
                              <RiCheckLine className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteSchedule(schedule.id)}
                            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-500/10 text-neutral-400 hover:text-red-500 transition-all"
                          >
                            <RiDeleteBinLine className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  onClick={onClose}
                  className="w-full h-10 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
