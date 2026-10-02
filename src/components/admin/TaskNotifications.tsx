"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  RiCalendarLine,
  RiAlarmWarningLine,
  RiCheckLine,
  RiTimeLine,
  RiPhoneLine,
  RiMapPinLine,
  RiTeamLine,
  RiLoader4Line,
  RiCloseLine,
  RiHome4Line,
  RiEyeLine,
  RiUserLine,
  RiWhatsappLine,
} from "react-icons/ri";

interface Task {
  id: string;
  title: string;
  type: string;
  priority: string;
  status: string;
  dueDate: string;
  dueTime?: string;
  property?: {
    id: string;
    code: string;
    title: string;
  };
}

interface OverdueVisit {
  id: string;
  date: string;
  time: string | null;
  status: string;
  lead?: { id: string; name: string } | null;
  visitorName?: string | null;
  properties: { property: { id: string; code: string; title: string } }[];
}

interface OverdueLead {
  id: string;
  name: string;
  phone?: string;
  temperature: string;
  lastContact: string | null;
  createdAt: string;
  daysSinceContact: number;
}

const taskTypeIcons: Record<string, any> = {
  LIGACAO: RiPhoneLine,
  VISITA: RiMapPinLine,
  REUNIAO: RiTeamLine,
  default: RiCalendarLine,
};

export function TaskNotifications() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [overdueVisits, setOverdueVisits] = useState<OverdueVisit[]>([]);
  const [overdueLeads, setOverdueLeads] = useState<OverdueLead[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchAll = async () => {
    await Promise.all([fetchPendingTasks(), fetchOverdueVisits(), fetchOverdueLeads()]);
    setIsLoading(false);
  };

  const fetchPendingTasks = async () => {
    try {
      const res = await fetch("/api/admin/tasks?pending=true");
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
        setPendingCount(data.pendingCount || 0);
      }
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
    }
  };

  const fetchOverdueVisits = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch(`/api/admin/scheduled-visits?status=AGENDADA&endDate=${today}`);
      if (res.ok) {
        const data = await res.json();
        const visits = (data.visits || []).filter((v: OverdueVisit) => {
          const visitDate = v.date?.split("T")[0] || "";
          return visitDate < today;
        });
        setOverdueVisits(visits);
      }
    } catch (error) {
      console.error("Erro ao buscar visitas pendentes:", error);
    }
  };

  const fetchOverdueLeads = async () => {
    try {
      const res = await fetch("/api/admin/leads?overdue=true&limit=10&excludeStatus=ARQUIVADO");
      if (res.ok) {
        const data = await res.json();
        const leads = (data.leads || []).map((l: any) => {
          const contactDate = l.lastContact || l.createdAt;
          const daysSince = contactDate ? Math.floor((Date.now() - new Date(contactDate).getTime()) / (1000 * 60 * 60 * 24)) : 999;
          return {
            id: l.id,
            name: l.name || "Sem nome",
            phone: l.phone,
            temperature: l.temperature || "MORNO",
            lastContact: l.lastContact,
            createdAt: l.createdAt,
            daysSinceContact: daysSince,
          };
        });
        setOverdueLeads(leads.slice(0, 5));
      }
    } catch (error) {
      console.error("Erro ao buscar leads atrasados:", error);
    }
  };

  const handleConfirmVisit = async (visitId: string, status: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(`/api/admin/scheduled-visits/${visitId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchOverdueVisits();
    } catch (error) {
      console.error("Erro ao atualizar visita:", error);
    }
  };

  const totalPending = pendingCount + overdueVisits.length + overdueLeads.length;

  const handleComplete = async (taskId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const res = await fetch(`/api/admin/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CONCLUIDA" }),
      });

      if (res.ok) {
        fetchPendingTasks();
      }
    } catch (error) {
      console.error("Erro ao concluir tarefa:", error);
    }
  };

  const isOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Hoje";
    if (date.toDateString() === yesterday.toDateString()) return "Ontem";

    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };

  return (
    <div className="relative">
      {/* Botão */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      >
        <RiCalendarLine className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
        {totalPending > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {totalPending > 9 ? "9+" : totalPending}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center gap-2">
                  <RiCalendarLine className="w-4 h-4 text-[#0A1E3D]" />
                  <span className="font-semibold text-sm text-neutral-900 dark:text-white">
                    Tarefas Pendentes
                  </span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <RiCloseLine className="w-4 h-4 text-neutral-400" />
                </button>
              </div>

              {/* Content */}
              <div className="max-h-80 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RiLoader4Line className="w-5 h-5 text-neutral-400 animate-spin" />
                  </div>
                ) : tasks.length === 0 && overdueVisits.length === 0 && overdueLeads.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <RiCheckLine className="w-10 h-10 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Nenhuma pendência!
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {/* Visitas pendentes (atrasadas) */}
                    {overdueVisits.slice(0, 3).map((visit) => {
                      const visitorName = visit.lead?.name || visit.visitorName || "Visitante";
                      const propertyCodes = visit.properties?.map(p => p.property.code).join(", ") || "";
                      const visitDate = new Date(visit.date);
                      return (
                        <div
                          key={`visit-${visit.id}`}
                          className="px-4 py-3 bg-red-50/50 dark:bg-red-500/5"
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 p-1.5 rounded-lg bg-red-100 text-red-600">
                              <RiEyeLine className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                                Visita pendente — {visitorName}
                              </p>
                              {propertyCodes && (
                                <p className="text-xs text-neutral-500 truncate">
                                  Imóveis: {propertyCodes}
                                </p>
                              )}
                              <div className="flex items-center gap-1 mt-1">
                                <RiAlarmWarningLine className="w-3 h-3 text-red-600" />
                                <span className="text-xs text-red-600 font-medium">
                                  {visitDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                                  {visit.time && ` às ${visit.time}`}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 mt-2">
                                <button
                                  onClick={(e) => handleConfirmVisit(visit.id, "REALIZADA", e)}
                                  className="px-2 py-0.5 text-[10px] font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded transition-colors"
                                >
                                  Realizada
                                </button>
                                <button
                                  onClick={(e) => handleConfirmVisit(visit.id, "NAO_COMPARECEU", e)}
                                  className="px-2 py-0.5 text-[10px] font-medium bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded transition-colors"
                                >
                                  Não compareceu
                                </button>
                                <button
                                  onClick={(e) => handleConfirmVisit(visit.id, "CANCELADA", e)}
                                  className="px-2 py-0.5 text-[10px] font-medium bg-red-100 text-red-600 hover:bg-red-200 rounded transition-colors"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Leads atrasados no follow-up */}
                    {overdueLeads.slice(0, 3).map((lead) => {
                      const tempColors: Record<string, string> = {
                        QUENTE: "text-red-600",
                        MORNO: "text-amber-600",
                        FRIO: "text-blue-600",
                      };
                      const tempLabels: Record<string, string> = {
                        QUENTE: "🔥",
                        MORNO: "🌤",
                        FRIO: "❄️",
                      };
                      return (
                        <Link
                          key={`lead-${lead.id}`}
                          href={`/corretor/clientes/leads`}
                          onClick={() => setIsOpen(false)}
                          className="block px-4 py-3 bg-amber-50/50 dark:bg-amber-500/5 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 p-1.5 rounded-lg bg-amber-100 text-amber-600">
                              <RiUserLine className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                                {tempLabels[lead.temperature] || "🌤"} {lead.name}
                              </p>
                              <p className="text-xs text-neutral-500">
                                Sem contato há {lead.daysSinceContact} dia{lead.daysSinceContact !== 1 ? "s" : ""}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs font-medium ${tempColors[lead.temperature] || "text-amber-600"}`}>
                                  Precisa de follow-up
                                </span>
                                {lead.phone && (
                                  <a
                                    href={`https://wa.me/55${lead.phone.replace(/\D/g, "")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium bg-green-100 text-green-700 hover:bg-green-200 rounded transition-colors"
                                  >
                                    <RiWhatsappLine className="w-3 h-3" />
                                    WhatsApp
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}

                    {/* Tarefas pendentes */}
                    {tasks.slice(0, 5).map((task) => {
                      const Icon = taskTypeIcons[task.type] || taskTypeIcons.default;
                      const overdue = isOverdue(task.dueDate);

                      return (
                        <Link
                          key={task.id}
                          href={task.property ? `/admin/imoveis/${task.property.id}` : "#"}
                          onClick={() => setIsOpen(false)}
                          className="block px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 p-1.5 rounded-lg ${overdue ? "bg-red-100 text-red-600" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                                {task.title}
                              </p>
                              {task.property && (
                                <p className="text-xs text-neutral-500 truncate">
                                  {task.property.code} - {task.property.title}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`flex items-center gap-1 text-xs ${overdue ? "text-red-600 font-medium" : "text-neutral-500"}`}>
                                  {overdue && <RiAlarmWarningLine className="w-3 h-3" />}
                                  <RiTimeLine className="w-3 h-3" />
                                  {formatDate(task.dueDate)}
                                  {task.dueTime && ` às ${task.dueTime}`}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={(e) => handleComplete(task.id, e)}
                              className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 text-neutral-400 hover:text-green-600 transition-colors"
                              title="Marcar como concluída"
                            >
                              <RiCheckLine className="w-4 h-4" />
                            </button>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              {tasks.length > 0 && (
                <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                  <Link
                    href="/admin/tarefas"
                    onClick={() => setIsOpen(false)}
                    className="text-sm text-[#0A1E3D] dark:text-sky-400 hover:underline"
                  >
                    Ver todas as tarefas →
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
