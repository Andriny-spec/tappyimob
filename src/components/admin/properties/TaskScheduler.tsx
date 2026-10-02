"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCalendarLine,
  RiAddLine,
  RiCloseLine,
  RiCheckLine,
  RiTimeLine,
  RiPhoneLine,
  RiMapPinLine,
  RiTeamLine,
  RiFileTextLine,
  RiShakeHandsLine,
  RiKeyLine,
  RiSearchEyeLine,
  RiMoreLine,
  RiLoader4Line,
  RiDeleteBinLine,
  RiEditLine,
  RiAlarmWarningLine,
  RiCheckDoubleLine,
  RiCameraLine,
  RiRefreshLine,
  RiVipCrownLine,
} from "react-icons/ri";

interface Task {
  id: string;
  title: string;
  description?: string;
  type: string;
  priority: string;
  status: string;
  dueDate: string;
  dueTime?: string;
  reminderDate?: string;
  assignedTo: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdBy: {
    id: string;
    name: string;
  };
  completedAt?: string;
}

interface TaskSchedulerProps {
  propertyId: string;
  propertyCode: string;
}

const taskTypeLabels: Record<string, { label: string; icon: any; color: string }> = {
  LIGACAO: { label: "Ligação", icon: RiPhoneLine, color: "text-amber-500" },
  VISITA: { label: "Visita/Fotos", icon: RiCameraLine, color: "text-purple-500" },
  REUNIAO: { label: "Reunião", icon: RiCalendarLine, color: "text-blue-500" },
  FOLLOW_UP: { label: "Acompanhamento", icon: RiRefreshLine, color: "text-cyan-500" },
  DOCUMENTACAO: { label: "Documentação", icon: RiFileTextLine, color: "text-indigo-500" },
  NEGOCIACAO: { label: "Negociação/Proposta", icon: RiShakeHandsLine, color: "text-green-500" },
  CONTRATO: { label: "Contrato", icon: RiVipCrownLine, color: "text-orange-500" },
  VISTORIA: { label: "Vistoria", icon: RiSearchEyeLine, color: "text-teal-500" },
  ENTREGA_CHAVES: { label: "Entrega de Chaves", icon: RiKeyLine, color: "text-emerald-500" },
  OUTRO: { label: "Outro", icon: RiMoreLine, color: "text-neutral-500" },
};

const priorityLabels: Record<string, { label: string; color: string; bg: string }> = {
  BAIXA: { label: "Baixa", color: "text-neutral-600", bg: "bg-neutral-100" },
  MEDIA: { label: "Média", color: "text-blue-600", bg: "bg-blue-100" },
  ALTA: { label: "Alta", color: "text-orange-600", bg: "bg-orange-100" },
  URGENTE: { label: "Urgente", color: "text-red-600", bg: "bg-red-100" },
};

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  PENDENTE: { label: "Pendente", color: "text-amber-600", bg: "bg-amber-100" },
  EM_ANDAMENTO: { label: "Em Andamento", color: "text-blue-600", bg: "bg-blue-100" },
  CONCLUIDA: { label: "Concluída", color: "text-green-600", bg: "bg-green-100" },
  CANCELADA: { label: "Cancelada", color: "text-neutral-600", bg: "bg-neutral-100" },
};

export function TaskScheduler({ propertyId, propertyCode }: TaskSchedulerProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [brokers, setBrokers] = useState<{ id: string; name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "FOLLOW_UP",
    priority: "MEDIA",
    dueDate: "",
    dueTime: "",
    assignedToId: "",
  });

  useEffect(() => {
    fetchTasks();
    fetchBrokers();
  }, [propertyId]);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`/api/admin/tasks?propertyId=${propertyId}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBrokers = async () => {
    try {
      const res = await fetch("/api/admin/brokers");
      if (res.ok) {
        const data = await res.json();
        setBrokers(data.brokers || []);
      }
    } catch (error) {
      console.error("Erro ao buscar corretores:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação local
    if (!formData.title?.trim()) {
      alert("Título é obrigatório");
      return;
    }
    if (!formData.dueDate) {
      alert("Data é obrigatória");
      return;
    }
    
    setIsSubmitting(true);

    try {
      const url = editingTask
        ? `/api/admin/tasks/${editingTask.id}`
        : "/api/admin/tasks";
      const method = editingTask ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          propertyId,
        }),
      });

      if (res.ok) {
        fetchTasks();
        closeModal();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao salvar tarefa");
      }
    } catch (error) {
      console.error("Erro ao salvar tarefa:", error);
      alert("Erro ao salvar tarefa. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return;

    try {
      const res = await fetch(`/api/admin/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error);
    }
  };

  const openNewTask = () => {
    setEditingTask(null);
    setFormData({
      title: "",
      description: "",
      type: "FOLLOW_UP",
      priority: "MEDIA",
      dueDate: "",
      dueTime: "",
      assignedToId: "",
    });
    setShowModal(true);
  };

  const openEditTask = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      type: task.type,
      priority: task.priority,
      dueDate: task.dueDate.split("T")[0],
      dueTime: task.dueTime || "",
      assignedToId: task.assignedTo.id,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  const isToday = (dueDate: string) => {
    return new Date(dueDate).toDateString() === new Date().toDateString();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Hoje";
    if (date.toDateString() === tomorrow.toDateString()) return "Amanhã";

    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };

  const pendingTasks = tasks.filter(t => t.status === "PENDENTE" || t.status === "EM_ANDAMENTO");
  const completedTasks = tasks.filter(t => t.status === "CONCLUIDA" || t.status === "CANCELADA");

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center gap-2">
          <RiCalendarLine className="w-5 h-5 text-[#0A1E3D]" />
          <h3 className="font-semibold text-neutral-900 dark:text-white">Tarefas Agendadas</h3>
          {pendingTasks.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
              {pendingTasks.length} pendente{pendingTasks.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <button
          onClick={openNewTask}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-[#0A1E3D] rounded-lg hover:bg-[#1A3560] transition-colors"
        >
          <RiAddLine className="w-4 h-4" />
          Nova Tarefa
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RiLoader4Line className="w-6 h-6 text-neutral-400 animate-spin" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8">
            <RiCalendarLine className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm text-neutral-500">Nenhuma tarefa agendada</p>
            <button
              onClick={openNewTask}
              className="mt-3 text-sm text-[#0A1E3D] hover:underline"
            >
              Criar primeira tarefa
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Tarefas Pendentes */}
            {pendingTasks.length > 0 && (
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase mb-2">Pendentes</p>
                <div className="space-y-2">
                  {pendingTasks.map((task) => {
                    const typeInfo = taskTypeLabels[task.type] || taskTypeLabels.OUTRO;
                    const TypeIcon = typeInfo.icon;
                    const overdue = isOverdue(task.dueDate);
                    const today = isToday(task.dueDate);

                    return (
                      <div
                        key={task.id}
                        className={`p-3 rounded-lg border ${
                          overdue
                            ? "border-red-200 bg-red-50 dark:bg-red-500/10 dark:border-red-500/30"
                            : today
                            ? "border-amber-200 bg-amber-50 dark:bg-amber-500/10 dark:border-amber-500/30"
                            : "border-neutral-200 dark:border-neutral-700"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Checkbox */}
                          <button
                            onClick={() => handleStatusChange(task.id, "CONCLUIDA")}
                            className="mt-0.5 w-5 h-5 rounded border-2 border-neutral-300 hover:border-green-500 hover:bg-green-50 flex items-center justify-center transition-colors"
                          >
                            <RiCheckLine className="w-3 h-3 text-transparent hover:text-green-500" />
                          </button>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <TypeIcon className={`w-4 h-4 ${typeInfo.color}`} />
                              <span className="font-medium text-sm text-neutral-900 dark:text-white truncate">
                                {task.title}
                              </span>
                            </div>

                            {task.description && (
                              <p className="text-xs text-neutral-500 line-clamp-1 mb-1">
                                {task.description}
                              </p>
                            )}

                            <div className="flex items-center gap-3 text-xs">
                              <span className={`flex items-center gap-1 ${overdue ? "text-red-600 font-medium" : today ? "text-amber-600" : "text-neutral-500"}`}>
                                {overdue && <RiAlarmWarningLine className="w-3 h-3" />}
                                <RiTimeLine className="w-3 h-3" />
                                {formatDate(task.dueDate)}
                                {task.dueTime && ` às ${task.dueTime}`}
                              </span>
                              <span className="text-neutral-400">•</span>
                              <span className="text-neutral-500">{task.assignedTo.name}</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditTask(task)}
                              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-600"
                            >
                              <RiEditLine className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(task.id)}
                              className="p-1.5 rounded hover:bg-red-50 text-neutral-400 hover:text-red-500"
                            >
                              <RiDeleteBinLine className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tarefas Concluídas */}
            {completedTasks.length > 0 && (
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase mb-2">Concluídas</p>
                <div className="space-y-2">
                  {completedTasks.slice(0, 3).map((task) => {
                    const typeInfo = taskTypeLabels[task.type] || taskTypeLabels.OUTRO;
                    const TypeIcon = typeInfo.icon;

                    return (
                      <div
                        key={task.id}
                        className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 opacity-60"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 w-5 h-5 rounded bg-green-500 flex items-center justify-center">
                            <RiCheckLine className="w-3 h-3 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <TypeIcon className={`w-4 h-4 ${typeInfo.color}`} />
                              <span className="font-medium text-sm text-neutral-900 dark:text-white line-through">
                                {task.title}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">
                              Concluída em {new Date(task.completedAt!).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-neutral-900 rounded-xl w-full max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
                <h3 className="font-semibold text-neutral-900 dark:text-white">
                  {editingTask ? "Editar Tarefa" : "Nova Tarefa"}
                </h3>
                <button onClick={closeModal} className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {/* Título */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Ligar para proprietário"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A1E3D]/20"
                    required
                  />
                </div>

                {/* Tipo e Prioridade */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Tipo
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A1E3D]/20"
                    >
                      {Object.entries(taskTypeLabels).map(([key, { label }]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Prioridade
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A1E3D]/20"
                    >
                      {Object.entries(priorityLabels).map(([key, { label }]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Data e Hora */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Data *
                    </label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A1E3D]/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Horário
                    </label>
                    <input
                      type="time"
                      value={formData.dueTime}
                      onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A1E3D]/20"
                    />
                  </div>
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detalhes da tarefa..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A1E3D]/20 resize-none"
                  />
                </div>

                {/* Botões */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 rounded-lg bg-[#0A1E3D] text-white font-medium hover:bg-[#1A3560] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <RiLoader4Line className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <RiCheckLine className="w-4 h-4" />
                        {editingTask ? "Salvar" : "Criar Tarefa"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
