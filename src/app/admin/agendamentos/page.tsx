"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  RiCalendarLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiAddLine,
  RiHome4Line,
  RiTeamLine,
  RiPhoneLine,
  RiTimeLine,
  RiMapPinLine,
  RiUserLine,
  RiCheckLine,
  RiCloseLine,
  RiDraggable,
  RiCalendar2Line,
  RiListCheck2,
  RiGridLine,
  RiLoader4Line,
  RiFileTextLine,
  RiShakeHandsLine,
  RiKeyLine,
  RiSearchEyeLine,
  RiMoreLine,
  RiCameraLine,
  RiRefreshLine,
  RiVipCrownLine,
  RiAlertLine,
  RiExternalLinkLine,
  RiCheckDoubleLine,
} from "react-icons/ri";

interface TaskFromAPI {
  id: string;
  title: string;
  description?: string;
  type: string;
  priority: string;
  status: string;
  dueDate: string;
  dueTime?: string;
  property?: {
    id: string;
    code: string;
    title: string;
    thumbnail?: string;
  };
  lead?: {
    id: string;
    name: string;
    phone?: string;
  };
  assignedTo: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  completedAt?: string;
}

const taskTypeConfig: Record<string, { label: string; cor: string; lightBg: string; text: string; icon: any }> = {
  LIGACAO: { label: "Ligação", cor: "bg-amber-500", lightBg: "bg-amber-100 dark:bg-amber-500/20", text: "text-amber-600", icon: RiPhoneLine },
  VISITA: { label: "Visita/Fotos", cor: "bg-purple-500", lightBg: "bg-purple-100 dark:bg-purple-500/20", text: "text-purple-600", icon: RiCameraLine },
  REUNIAO: { label: "Reunião", cor: "bg-blue-500", lightBg: "bg-blue-100 dark:bg-blue-500/20", text: "text-blue-600", icon: RiCalendarLine },
  FOLLOW_UP: { label: "Acompanhamento", cor: "bg-cyan-500", lightBg: "bg-cyan-100 dark:bg-cyan-500/20", text: "text-cyan-600", icon: RiRefreshLine },
  DOCUMENTACAO: { label: "Documentação", cor: "bg-indigo-500", lightBg: "bg-indigo-100 dark:bg-indigo-500/20", text: "text-indigo-600", icon: RiFileTextLine },
  NEGOCIACAO: { label: "Negociação", cor: "bg-green-500", lightBg: "bg-green-100 dark:bg-green-500/20", text: "text-green-600", icon: RiShakeHandsLine },
  CONTRATO: { label: "Contrato", cor: "bg-orange-500", lightBg: "bg-orange-100 dark:bg-orange-500/20", text: "text-orange-600", icon: RiVipCrownLine },
  VISTORIA: { label: "Vistoria", cor: "bg-teal-500", lightBg: "bg-teal-100 dark:bg-teal-500/20", text: "text-teal-600", icon: RiSearchEyeLine },
  ENTREGA_CHAVES: { label: "Entrega de Chaves", cor: "bg-emerald-500", lightBg: "bg-emerald-100 dark:bg-emerald-500/20", text: "text-emerald-600", icon: RiKeyLine },
  OUTRO: { label: "Outro", cor: "bg-neutral-500", lightBg: "bg-neutral-100 dark:bg-neutral-500/20", text: "text-neutral-600", icon: RiMoreLine },
};

const priorityLabels: Record<string, { label: string; color: string }> = {
  BAIXA: { label: "Baixa", color: "text-neutral-500" },
  MEDIA: { label: "Média", color: "text-blue-500" },
  ALTA: { label: "Alta", color: "text-orange-500" },
  URGENTE: { label: "Urgente", color: "text-red-500" },
};

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  PENDENTE: { label: "Pendente", color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-500/20" },
  EM_ANDAMENTO: { label: "Em Andamento", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-500/20" },
  CONCLUIDA: { label: "Concluída", color: "text-green-600", bg: "bg-green-100 dark:bg-green-500/20" },
  CANCELADA: { label: "Cancelada", color: "text-neutral-500", bg: "bg-neutral-100 dark:bg-neutral-500/20" },
};

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export default function AgendamentosPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<TaskFromAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draggedTask, setDraggedTask] = useState<TaskFromAPI | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"mes" | "semana">("mes");
  const [selectedTask, setSelectedTask] = useState<TaskFromAPI | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = new Date(year, month - 1, 1).toISOString();
      const endDate = new Date(year, month + 2, 0).toISOString();

      // Buscar tarefas, visitas e follow-ups em paralelo
      const [tasksRes, visitsRes, followupsRes] = await Promise.all([
        fetch(`/api/admin/tasks?startDate=${startDate}&endDate=${endDate}`),
        fetch(`/api/admin/scheduled-visits?startDate=${startDate}&endDate=${endDate}&limit=200`),
        fetch(`/api/admin/followups?status=all`),
      ]);

      let allTasks: TaskFromAPI[] = [];
      let pending = 0;

      if (tasksRes.ok) {
        const data = await tasksRes.json();
        allTasks = data.tasks || [];
        pending = data.pendingCount || 0;
      }

      // Converter visitas agendadas para o formato de TaskFromAPI
      if (visitsRes.ok) {
        const visitsData = await visitsRes.json();
        const visits = visitsData.visits || [];
        const visitTasks: TaskFromAPI[] = visits.map((v: any) => {
          const firstProp = v.properties?.[0]?.property;
          const visitorName = v.lead?.name || v.visitorName || "Visitante";
          return {
            id: `visit-${v.id}`,
            title: `Visita: ${visitorName}`,
            description: v.notes || undefined,
            type: "VISITA",
            priority: "MEDIA",
            status: v.status === "REALIZADA" ? "CONCLUIDA" : v.status === "CANCELADA" ? "CANCELADA" : "PENDENTE",
            dueDate: v.date,
            dueTime: v.time || undefined,
            property: firstProp ? { id: firstProp.id, code: firstProp.code, title: firstProp.title, thumbnail: firstProp.thumbnail } : undefined,
            lead: v.lead ? { id: v.lead.id, name: v.lead.name, phone: v.lead.phone } : undefined,
            assignedTo: v.corretor || { id: "", name: "Sem corretor" },
            createdBy: v.createdBy || { id: "", name: "" },
          };
        });
        allTasks = [...allTasks, ...visitTasks];
      }

      // Converter follow-ups para o formato de TaskFromAPI
      if (followupsRes.ok) {
        const fupData = await followupsRes.json();
        const fups = fupData.followups || [];
        const fupTasks: TaskFromAPI[] = fups.map((f: any) => ({
          id: `fup-${f.id}`,
          title: `FUP: ${f.lead?.name || "Lead"}`,
          description: f.message || undefined,
          type: "FOLLOW_UP",
          priority: "MEDIA",
          status: f.status === "COMPLETED" ? "CONCLUIDA" : f.status === "CANCELLED" ? "CANCELADA" : "PENDENTE",
          dueDate: f.scheduledFor,
          lead: f.lead ? { id: f.lead.id, name: f.lead.name, phone: f.lead.phone } : undefined,
          assignedTo: { id: f.assignedToId || "", name: f.assignedToName || "Sistema" },
          createdBy: { id: "", name: "Sistema" },
        }));
        allTasks = [...allTasks, ...fupTasks];
      }

      setTasks(allTasks);
      setPendingCount(pending);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-gerar tarefas de previsão de obra ao carregar a página (1x por sessão)
  useEffect(() => {
    const autoGen = async () => {
      try {
        await fetch("/api/admin/tasks/auto-generate", { method: "POST" });
      } catch {}
    };
    autoGen();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [currentDate.getMonth(), currentDate.getFullYear()]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days: { date: Date; isCurrentMonth: boolean }[] = [];
    
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month - 1, prevMonthLastDay - i), isCurrentMonth: false });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    
    return days;
  };

  const formatDateKey = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const getTasksForDate = (date: Date) => {
    const dateKey = formatDateKey(date);
    return tasks.filter(t => {
      const taskDate = new Date(t.dueDate);
      const taskKey = formatDateKey(taskDate);
      return taskKey === dateKey;
    });
  };

  const handleDragStart = (e: React.DragEvent, task: TaskFromAPI) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", task.id);
  };

  const handleDragOver = (e: React.DragEvent, dateKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverDate(dateKey);
  };

  const handleDragLeave = () => {
    setDragOverDate(null);
  };

  const handleDrop = async (e: React.DragEvent, dateKey: string) => {
    e.preventDefault();
    if (draggedTask) {
      // Atualizar localmente imediatamente
      setTasks(prev => prev.map(t => 
        t.id === draggedTask.id ? { ...t, dueDate: new Date(dateKey + "T12:00:00").toISOString() } : t
      ));
      // Persistir no backend
      try {
        await fetch(`/api/admin/tasks/${draggedTask.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dueDate: dateKey }),
        });
      } catch (error) {
        console.error("Erro ao reagendar tarefa:", error);
        fetchTasks(); // Reverter em caso de erro
      }
    }
    setDraggedTask(null);
    setDragOverDate(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverDate(null);
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
        setSelectedTask(null);
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const days = getDaysInMonth(currentDate);
  const today = formatDateKey(new Date());

  // Stats reais
  const todayTasks = tasks.filter(t => formatDateKey(new Date(t.dueDate)) === today && t.status !== "CANCELADA");
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekTasks = tasks.filter(t => {
    const d = new Date(t.dueDate);
    return d >= weekStart && d <= weekEnd && t.status !== "CANCELADA";
  });

  const stats = [
    { label: "Hoje", value: todayTasks.length, cor: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-500/20" },
    { label: "Esta Semana", value: weekTasks.length, cor: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-500/20" },
    { label: "Pendentes", value: pendingCount, cor: "text-red-500", bg: "bg-red-100 dark:bg-red-500/20" },
    { label: "Concluídas", value: tasks.filter(t => t.status === "CONCLUIDA").length, cor: "text-green-500", bg: "bg-green-100 dark:bg-green-500/20" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-emerald-500 flex items-center justify-center">
              <RiCalendarLine className="w-5 h-5 text-white" />
            </div>
            Agendamentos
          </h1>
          <p className="text-neutral-500 mt-1">
            Tarefas do imóvel vinculadas ao calendário — arraste para reagendar
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode("mes")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "mes" ? "bg-white dark:bg-neutral-700 text-orange-500 shadow-sm" : "text-neutral-500"}`}
            >
              <RiGridLine className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("semana")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "semana" ? "bg-white dark:bg-neutral-700 text-orange-500 shadow-sm" : "text-neutral-500"}`}
            >
              <RiListCheck2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <span className={`text-lg font-bold ${stat.cor}`}>{stat.value}</span>
              </div>
              <span className="text-sm text-neutral-500">{stat.label}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/admin/agendamentos/visitas" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-500/30 transition-colors">
          <RiHome4Line className="w-4 h-4" />
          <span className="text-sm font-medium">Visitas</span>
        </Link>
        <Link href="/admin/agendamentos/reunioes" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-500/30 transition-colors">
          <RiTeamLine className="w-4 h-4" />
          <span className="text-sm font-medium">Reuniões</span>
        </Link>
        <Link href="/admin/agendamentos/followups" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-500/30 transition-colors">
          <RiPhoneLine className="w-4 h-4" />
          <span className="text-sm font-medium">Follow-ups</span>
        </Link>
        <Link href="/admin/agendamentos/fotos" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 hover:bg-teal-200 dark:hover:bg-teal-500/30 transition-colors">
          <RiCameraLine className="w-4 h-4" />
          <span className="text-sm font-medium">Fotos</span>
        </Link>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <RiLoader4Line className="w-6 h-6 animate-spin text-orange-500" />
        </div>
      )}

      {/* Calendar View */}
      {viewMode === "mes" ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
        >
          {/* Calendar Header */}
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500">
                <RiArrowLeftSLine className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white min-w-[200px] text-center">
                {meses[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500">
                <RiArrowRightSLine className="w-5 h-5" />
              </button>
            </div>
            <button onClick={goToToday} className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800">
              Hoje
            </button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 border-b border-neutral-200 dark:border-neutral-800">
            {diasSemana.map(dia => (
              <div key={dia} className="p-3 text-center text-sm font-semibold text-neutral-500">
                {dia}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              const dateKey = formatDateKey(day.date);
              const dayTasks = getTasksForDate(day.date);
              const isToday = dateKey === today;
              const isDragOver = dragOverDate === dateKey;
              const activeTasks = dayTasks.filter(t => t.status !== "CANCELADA");

              return (
                <div
                  key={index}
                  className={`min-h-[120px] border-b border-r border-neutral-100 dark:border-neutral-800 p-1 transition-colors ${
                    !day.isCurrentMonth ? "bg-neutral-50 dark:bg-neutral-800/50" : ""
                  } ${isDragOver ? "bg-orange-50 dark:bg-orange-500/10 ring-2 ring-inset ring-orange-500" : ""}`}
                  onDragOver={(e) => handleDragOver(e, dateKey)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, dateKey)}
                >
                  <div className={`text-right p-1 ${!day.isCurrentMonth ? "text-neutral-400" : "text-neutral-700 dark:text-neutral-300"}`}>
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm ${
                      isToday ? "bg-orange-500 text-white font-bold" : ""
                    }`}>
                      {day.date.getDate()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {activeTasks.slice(0, 3).map(task => {
                      const config = taskTypeConfig[task.type] || taskTypeConfig.OUTRO;
                      const Icon = config.icon;
                      const isDone = task.status === "CONCLUIDA";
                      
                      return (
                        <div
                          key={task.id}
                          draggable={!isDone}
                          onDragStart={(e) => handleDragStart(e, task)}
                          onDragEnd={handleDragEnd}
                          onClick={() => setSelectedTask(task)}
                          className={`${isDone ? "bg-neutral-300 dark:bg-neutral-600" : config.cor} text-white text-xs px-2 py-1 rounded-lg ${isDone ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"} flex items-center gap-1 truncate group hover:ring-2 hover:ring-white/50 ${isDone ? "opacity-60 line-through" : ""}`}
                        >
                          {!isDone && <RiDraggable className="w-3 h-3 opacity-50 group-hover:opacity-100 flex-shrink-0" />}
                          {isDone ? <RiCheckDoubleLine className="w-3 h-3 flex-shrink-0" /> : <Icon className="w-3 h-3 flex-shrink-0" />}
                          <span className="truncate">{task.dueTime || ""} {task.title}</span>
                        </div>
                      );
                    })}
                    {activeTasks.length > 3 && (
                      <div className="text-xs text-neutral-500 px-2">
                        +{activeTasks.length - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      ) : (
        /* Week/List View */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {tasks
            .filter(t => t.status !== "CANCELADA")
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .map(task => {
              const config = taskTypeConfig[task.type] || taskTypeConfig.OUTRO;
              const Icon = config.icon;
              const statusInfo = statusLabels[task.status] || statusLabels.PENDENTE;
              const prioInfo = priorityLabels[task.priority] || priorityLabels.MEDIA;
              const isPast = new Date(task.dueDate) < new Date() && task.status !== "CONCLUIDA";

              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`p-4 bg-white dark:bg-neutral-900 rounded-xl border cursor-pointer hover:shadow-md transition-all ${
                    isPast ? "border-red-200 dark:border-red-500/30" : "border-neutral-200 dark:border-neutral-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${config.lightBg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${config.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium truncate ${task.status === "CONCLUIDA" ? "line-through text-neutral-400" : ""}`}>{task.title}</p>
                        {isPast && <RiAlertLine className="w-4 h-4 text-red-500 flex-shrink-0" />}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-neutral-500 mt-0.5">
                        <span>{new Date(task.dueDate).toLocaleDateString("pt-BR")} {task.dueTime || ""}</span>
                        <span className={prioInfo.color}>{prioInfo.label}</span>
                        {task.property && <span className="truncate">#{task.property.code}</span>}
                        <span>{task.assignedTo.name}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-medium ${statusInfo.bg} ${statusInfo.color} flex-shrink-0`}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
              );
            })}
          {tasks.filter(t => t.status !== "CANCELADA").length === 0 && !isLoading && (
            <div className="text-center py-12 text-neutral-500">
              <RiCalendarLine className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
              <p className="font-medium">Nenhuma tarefa neste período</p>
              <p className="text-sm mt-1">As tarefas criadas na timeline dos imóveis aparecerão aqui</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        {Object.entries(taskTypeConfig).slice(0, 6).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <div key={key} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${config.cor}`} />
              <Icon className={`w-3.5 h-3.5 ${config.text}`} />
              <span className="text-xs text-neutral-500">{config.label}</span>
            </div>
          );
        })}
      </div>

      {/* Task Details Modal */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedTask(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              {(() => {
                const config = taskTypeConfig[selectedTask.type] || taskTypeConfig.OUTRO;
                const Icon = config.icon;
                const statusInfo = statusLabels[selectedTask.status] || statusLabels.PENDENTE;
                const prioInfo = priorityLabels[selectedTask.priority] || priorityLabels.MEDIA;

                return (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${config.lightBg} flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${config.text}`} />
                        </div>
                        <div>
                          <h3 className="font-bold text-neutral-900 dark:text-white">{selectedTask.title}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${config.lightBg} ${config.text}`}>
                              {config.label}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => setSelectedTask(null)} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
                        <RiCloseLine className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {selectedTask.description && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">{selectedTask.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-sm">
                        <RiCalendar2Line className="w-4 h-4 text-neutral-400" />
                        <span className="text-neutral-600 dark:text-neutral-400">
                          {new Date(selectedTask.dueDate).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
                          {selectedTask.dueTime ? ` às ${selectedTask.dueTime}` : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <RiUserLine className="w-4 h-4 text-neutral-400" />
                        <span className="text-neutral-600 dark:text-neutral-400">
                          Responsável: {selectedTask.assignedTo.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <RiAlertLine className={`w-4 h-4 ${prioInfo.color}`} />
                        <span className={prioInfo.color}>Prioridade: {prioInfo.label}</span>
                      </div>
                      {selectedTask.property && (
                        <Link
                          href={`/admin/imoveis/${selectedTask.property.id}`}
                          className="flex items-center gap-3 text-sm text-orange-600 hover:underline"
                          onClick={e => e.stopPropagation()}
                        >
                          <RiExternalLinkLine className="w-4 h-4" />
                          <span>#{selectedTask.property.code} — {selectedTask.property.title}</span>
                        </Link>
                      )}
                      {selectedTask.lead && (
                        <div className="flex items-center gap-3 text-sm">
                          <RiUserLine className="w-4 h-4 text-neutral-400" />
                          <span className="text-neutral-600 dark:text-neutral-400">
                            Lead: {selectedTask.lead.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Ações de status */}
                    {selectedTask.status !== "CONCLUIDA" && selectedTask.status !== "CANCELADA" && (
                      <div className="flex items-center gap-2 mt-6">
                        <button
                          onClick={() => handleStatusChange(selectedTask.id, "CONCLUIDA")}
                          className="flex-1 h-10 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 flex items-center justify-center gap-2"
                        >
                          <RiCheckLine className="w-4 h-4" />
                          Concluir
                        </button>
                        {selectedTask.status === "PENDENTE" && (
                          <button
                            onClick={() => handleStatusChange(selectedTask.id, "EM_ANDAMENTO")}
                            className="flex-1 h-10 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 flex items-center justify-center gap-2"
                          >
                            <RiTimeLine className="w-4 h-4" />
                            Iniciar
                          </button>
                        )}
                        <button
                          onClick={() => handleStatusChange(selectedTask.id, "CANCELADA")}
                          className="h-10 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-500 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800"
                        >
                          <RiCloseLine className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {selectedTask.status === "CONCLUIDA" && (
                      <div className="mt-6 p-3 bg-green-50 dark:bg-green-500/10 rounded-xl text-center">
                        <p className="text-sm text-green-700 dark:text-green-400 flex items-center justify-center gap-2">
                          <RiCheckDoubleLine className="w-4 h-4" />
                          Tarefa concluída
                          {selectedTask.completedAt && ` em ${new Date(selectedTask.completedAt).toLocaleDateString("pt-BR")}`}
                        </p>
                      </div>
                    )}
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
