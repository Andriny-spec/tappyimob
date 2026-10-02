"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiAddLine,
  RiCalendarLine,
  RiTimeLine,
  RiMapPinLine,
  RiUserLine,
  RiCloseLine,
  RiMoreLine,
  RiHome4Line,
  RiPhoneLine,
  RiVideoLine,
  RiCheckLine,
  RiFilterLine,
  RiCameraLine,
  RiDeleteBinLine,
  RiImageLine,
} from "react-icons/ri";

// Tipos
interface Event {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: "visita" | "reuniao" | "ligacao" | "followup" | "outro" | "tarefa";
  color: string;
  client?: string;
  property?: string;
  location?: string;
  notes?: string;
  corretor?: string;
  corretorId?: string;
  source?: "visit" | "task";
}

// Cores por tipo de evento
const eventColors: Record<string, { bg: string; text: string; border: string }> = {
  visita: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-600 dark:text-blue-400", border: "border-l-blue-500" },
  reuniao: { bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-600 dark:text-purple-400", border: "border-l-purple-500" },
  ligacao: { bg: "bg-green-50 dark:bg-green-900/20", text: "text-green-600 dark:text-green-400", border: "border-l-green-500" },
  followup: { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-600 dark:text-amber-400", border: "border-l-amber-500" },
  outro: { bg: "bg-neutral-50 dark:bg-neutral-800", text: "text-neutral-600 dark:text-neutral-400", border: "border-l-neutral-400" },
};

const eventColors_tarefa = { bg: "bg-rose-50 dark:bg-rose-900/20", text: "text-rose-600 dark:text-rose-400", border: "border-l-rose-500" };

const eventIcons: Record<string, React.ReactNode> = {
  visita: <RiHome4Line className="w-3.5 h-3.5" />,
  reuniao: <RiVideoLine className="w-3.5 h-3.5" />,
  ligacao: <RiPhoneLine className="w-3.5 h-3.5" />,
  followup: <RiUserLine className="w-3.5 h-3.5" />,
  outro: <RiCalendarLine className="w-3.5 h-3.5" />,
  tarefa: <RiCheckLine className="w-3.5 h-3.5" />,
};

// Helpers
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
const formatDate = (date: Date) => date.toISOString().split("T")[0];

const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const weekDaysFull = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("week");
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [draggedEvent, setDraggedEvent] = useState<Event | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [brokers, setBrokers] = useState<{id: string; name: string}[]>([]);
  const [filterCorretor, setFilterCorretor] = useState<string>("all");
  const [loadingEvents, setLoadingEvents] = useState(true);
  
  // Estado do novo evento
  const [newEvent, setNewEvent] = useState({
    title: "",
    type: "visita" as Event["type"],
    date: formatDate(new Date()),
    startTime: "09:00",
    endTime: "10:00",
    client: "",
    property: "",
    location: "",
    notes: "",
    photos: [] as string[],
  });
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Reset novo evento
  const resetNewEvent = () => {
    setNewEvent({
      title: "",
      type: "visita",
      date: formatDate(new Date()),
      startTime: "09:00",
      endTime: "10:00",
      client: "",
      property: "",
      location: "",
      notes: "",
      photos: [],
    });
  };

  // Fetch brokers list
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/brokers");
        if (res.ok) {
          const data = await res.json();
          setBrokers(data.brokers || []);
        }
      } catch {}
    })();
  }, []);

  // Fetch real visits + tasks
  const fetchEvents = useCallback(async () => {
    setLoadingEvents(true);
    try {
      const [visitsRes, tasksRes] = await Promise.all([
        fetch("/api/admin/scheduled-visits?limit=500"),
        fetch("/api/admin/tasks"),
      ]);

      const mapped: Event[] = [];

      if (visitsRes.ok) {
        const vData = await visitsRes.json();
        (vData.visits || []).forEach((v: any) => {
          const dateStr = v.date ? new Date(v.date).toISOString().split("T")[0] : "";
          const propNames = (v.properties || []).map((p: any) => p.property?.code || p.property?.title || "").filter(Boolean).join(", ");
          mapped.push({
            id: `visit-${v.id}`,
            title: v.lead?.name ? `Visita - ${v.lead.name}` : "Visita agendada",
            date: dateStr,
            startTime: v.time || v.startTime || "09:00",
            endTime: v.endTime || (() => { const h = parseInt((v.time || v.startTime || "09:00").split(":")[0]); return `${(h + 1).toString().padStart(2, "0")}:00`; })(),
            type: "visita",
            color: "blue",
            client: v.lead?.name || v.visitorName || undefined,
            property: propNames || undefined,
            location: (v.properties || [])[0]?.property?.address || undefined,
            corretor: v.corretor?.name,
            corretorId: v.corretorId,
            source: "visit",
          });
        });
      }

      if (tasksRes.ok) {
        const tData = await tasksRes.json();
        (tData.tasks || []).forEach((t: any) => {
          const dateStr = t.dueDate ? new Date(t.dueDate).toISOString().split("T")[0] : "";
          mapped.push({
            id: `task-${t.id}`,
            title: t.title,
            date: dateStr,
            startTime: t.dueTime || "09:00",
            endTime: t.dueTime ? (() => { const h = parseInt(t.dueTime.split(":")[0]); return `${(h + 1).toString().padStart(2, "0")}:00`; })() : "10:00",
            type: "tarefa",
            color: "rose",
            client: t.lead?.name || undefined,
            property: t.property?.code || t.property?.title || undefined,
            notes: t.description || undefined,
            corretor: t.assignedTo?.name,
            corretorId: t.assignedToId,
            source: "task",
          });
        });
      }

      setEvents(mapped);
    } catch (error) {
      console.error("Erro ao carregar agenda:", error);
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Criar evento
  const handleCreateEvent = () => {
    if (!newEvent.title.trim()) {
      alert("Informe o título do evento");
      return;
    }
    
    const event: Event = {
      id: Date.now().toString(),
      title: newEvent.title,
      type: newEvent.type,
      date: newEvent.date,
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      color: newEvent.type,
      client: newEvent.client || undefined,
      property: newEvent.property || undefined,
      location: newEvent.location || undefined,
      notes: newEvent.notes || undefined,
    };
    
    setEvents(prev => [...prev, event]);
    setShowNewEvent(false);
    resetNewEvent();
  };

  // Upload de fotos
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setNewEvent(prev => ({
            ...prev,
            photos: [...prev.photos, ev.target!.result as string]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setNewEvent(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navegação
  const goToToday = () => setCurrentDate(new Date());
  const goToPrev = () => {
    if (view === "month") setCurrentDate(new Date(year, month - 1, 1));
    else if (view === "week") setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
    else setCurrentDate(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000));
  };
  const goToNext = () => {
    if (view === "month") setCurrentDate(new Date(year, month + 1, 1));
    else if (view === "week") setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
    else setCurrentDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000));
  };

  // Obter semana atual
  const getWeekDays = () => {
    const start = new Date(currentDate);
    const day = start.getDay();
    start.setDate(start.getDate() - day);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  // Horas do dia
  const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7h às 20h

  // Filtrar eventos por tipo e corretor
  const filteredEvents = events.filter(e => {
    if (filterType !== "all" && e.type !== filterType) return false;
    if (filterCorretor !== "all" && e.corretorId !== filterCorretor) return false;
    return true;
  });

  // Eventos do dia
  const getEventsForDate = (date: string) => filteredEvents.filter(e => e.date === date);

  // Drag and Drop
  const handleDragStart = (event: Event) => setDraggedEvent(event);
  const handleDragEnd = () => setDraggedEvent(null);
  const handleDrop = (date: string, hour?: number) => {
    if (!draggedEvent) return;
    setEvents(prev => prev.map(e => {
      if (e.id === draggedEvent.id) {
        const newEvent = { ...e, date };
        if (hour !== undefined) {
          const duration = parseInt(e.endTime.split(":")[0]) - parseInt(e.startTime.split(":")[0]);
          newEvent.startTime = `${hour.toString().padStart(2, "0")}:00`;
          newEvent.endTime = `${(hour + duration).toString().padStart(2, "0")}:00`;
        }
        return newEvent;
      }
      return e;
    }));
    setDraggedEvent(null);
  };

  // Título do período
  const getPeriodTitle = () => {
    if (view === "month") return `${monthNames[month]} ${year}`;
    if (view === "week") {
      const weekDaysArr = getWeekDays();
      const start = weekDaysArr[0];
      const end = weekDaysArr[6];
      if (start.getMonth() === end.getMonth()) {
        return `${start.getDate()} - ${end.getDate()} de ${monthNames[start.getMonth()]} ${year}`;
      }
      return `${start.getDate()} ${monthNames[start.getMonth()].slice(0, 3)} - ${end.getDate()} ${monthNames[end.getMonth()].slice(0, 3)} ${year}`;
    }
    return `${currentDate.getDate()} de ${monthNames[month]} ${year}`;
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Agenda</h1>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm font-medium text-[#0B2545] bg-[#0B2545]/5 hover:bg-[#0B2545]/10 rounded-lg transition-colors"
          >
            Hoje
          </button>
          <div className="flex items-center gap-1">
            <button onClick={goToPrev} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
              <RiArrowLeftSLine className="w-5 h-5" />
            </button>
            <button onClick={goToNext} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
              <RiArrowRightSLine className="w-5 h-5" />
            </button>
          </div>
          <span className="text-lg font-medium text-neutral-700 dark:text-neutral-300">{getPeriodTitle()}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Filtros */}
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                filterType !== "all" || filterCorretor !== "all"
                  ? "border-[#0B2545] bg-[#0B2545]/5 text-[#0B2545]"
                  : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
              }`}
            >
              <RiFilterLine className="w-4 h-4" />
              <span className="text-sm">Filtros</span>
              {(filterType !== "all" || filterCorretor !== "all") && (
                <span className="w-2 h-2 rounded-full bg-[#0B2545]" />
              )}
            </button>
            
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-2 z-50"
                >
                  <p className="px-3 py-1 text-[10px] font-semibold text-neutral-400 uppercase">Tipo</p>
                  {[
                    { value: "all", label: "Todos" },
                    { value: "visita", label: "Visitas" },
                    { value: "tarefa", label: "Tarefas" },
                    { value: "reuniao", label: "Reuniões" },
                    { value: "ligacao", label: "Ligações" },
                    { value: "followup", label: "Follow-ups" },
                  ].map(f => (
                    <button
                      key={f.value}
                      onClick={() => { setFilterType(f.value); }}
                      className={`w-full px-3 py-2 text-left text-sm rounded-lg flex items-center gap-2 ${
                        filterType === f.value ? "bg-[#0B2545]/10 text-[#0B2545]" : "hover:bg-neutral-100 dark:hover:bg-neutral-700"
                      }`}
                    >
                      {filterType === f.value && <RiCheckLine className="w-4 h-4" />}
                      {f.label}
                    </button>
                  ))}
                  <div className="border-t border-neutral-100 dark:border-neutral-700 my-1" />
                  <p className="px-3 py-1 text-[10px] font-semibold text-neutral-400 uppercase">Corretor</p>
                  <button
                    onClick={() => setFilterCorretor("all")}
                    className={`w-full px-3 py-2 text-left text-sm rounded-lg flex items-center gap-2 ${
                      filterCorretor === "all" ? "bg-[#0B2545]/10 text-[#0B2545]" : "hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    }`}
                  >
                    {filterCorretor === "all" && <RiCheckLine className="w-4 h-4" />}
                    Todos os corretores
                  </button>
                  {brokers.map(b => (
                    <button
                      key={b.id}
                      onClick={() => setFilterCorretor(b.id)}
                      className={`w-full px-3 py-2 text-left text-sm rounded-lg flex items-center gap-2 truncate ${
                        filterCorretor === b.id ? "bg-[#0B2545]/10 text-[#0B2545]" : "hover:bg-neutral-100 dark:hover:bg-neutral-700"
                      }`}
                    >
                      {filterCorretor === b.id && <RiCheckLine className="w-4 h-4" />}
                      {b.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
            {(["day", "week", "month"] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  view === v
                    ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                {v === "day" ? "Dia" : v === "week" ? "Semana" : "Mês"}
              </button>
            ))}
          </div>

          {/* Novo Evento */}
          <button
            onClick={() => setShowNewEvent(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0B2545] text-white rounded-lg hover:bg-[#1A3560] transition-colors"
          >
            <RiAddLine className="w-4 h-4" />
            <span className="text-sm font-medium">Novo</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        {/* Week View */}
        {view === "week" && (
          <div className="h-full flex flex-col">
            {/* Header com dias */}
            <div className="grid grid-cols-8 border-b border-neutral-200 dark:border-neutral-700">
              <div className="p-3 text-center text-xs text-neutral-400 border-r border-neutral-100 dark:border-neutral-700" />
              {getWeekDays().map((day, i) => {
                const isToday = formatDate(day) === formatDate(new Date());
                return (
                  <div
                    key={i}
                    className={`p-3 text-center border-r border-neutral-100 dark:border-neutral-700 last:border-r-0 ${
                      isToday ? "bg-[#0B2545]/5" : ""
                    }`}
                  >
                    <p className="text-xs text-neutral-400 uppercase">{weekDays[day.getDay()]}</p>
                    <p className={`text-lg font-semibold mt-0.5 ${
                      isToday ? "text-[#0B2545] dark:text-white" : "text-neutral-700 dark:text-neutral-300"
                    }`}>
                      {day.getDate()}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Grid de horas */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-8">
                {/* Coluna de horas */}
                <div className="border-r border-neutral-100 dark:border-neutral-700">
                  {hours.map(hour => (
                    <div key={hour} className="h-16 px-2 py-1 text-right">
                      <span className="text-xs text-neutral-400">{hour}:00</span>
                    </div>
                  ))}
                </div>

                {/* Colunas dos dias */}
                {getWeekDays().map((day, dayIndex) => {
                  const dateStr = formatDate(day);
                  const dayEvents = getEventsForDate(dateStr);
                  const isToday = dateStr === formatDate(new Date());

                  return (
                    <div
                      key={dayIndex}
                      className={`relative border-r border-neutral-100 dark:border-neutral-700 last:border-r-0 ${
                        isToday ? "bg-[#0B2545]/[0.02]" : ""
                      }`}
                      onDragOver={e => e.preventDefault()}
                      onDrop={() => handleDrop(dateStr)}
                    >
                      {/* Linhas de hora */}
                      {hours.map(hour => (
                        <div
                          key={hour}
                          className="h-16 border-b border-neutral-50 dark:border-neutral-700/50 hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors cursor-pointer"
                          onDragOver={e => e.preventDefault()}
                          onDrop={() => handleDrop(dateStr, hour)}
                          onClick={() => setShowNewEvent(true)}
                        />
                      ))}

                      {/* Eventos */}
                      {dayEvents.map(event => {
                        const startHour = parseInt(event.startTime.split(":")[0]);
                        const endHour = parseInt(event.endTime.split(":")[0]);
                        const top = (startHour - 7) * 64;
                        const height = (endHour - startHour) * 64 - 4;
                        const colors = eventColors[event.type] || eventColors_tarefa;

                        return (
                          <motion.div
                            key={event.id}
                            draggable
                            onDragStart={() => handleDragStart(event)}
                            onDragEnd={handleDragEnd}
                            onClick={() => setSelectedEvent(event)}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`absolute left-1 right-1 rounded-lg border-l-4 px-2 py-1.5 cursor-grab active:cursor-grabbing overflow-hidden ${colors.bg} ${colors.border} ${colors.text} hover:shadow-md transition-shadow`}
                            style={{ top: `${top}px`, height: `${height}px` }}
                          >
                            <div className="flex items-center gap-1.5">
                              {eventIcons[event.type]}
                              <span className="text-xs font-medium truncate">{event.title}</span>
                            </div>
                            {height > 40 && (
                              <p className="text-[10px] opacity-70 mt-0.5">{event.startTime} - {event.endTime}</p>
                            )}
                            {height > 60 && event.client && (
                              <p className="text-[10px] opacity-60 mt-0.5 truncate">{event.client}</p>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Month View */}
        {view === "month" && (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="grid grid-cols-7 border-b border-neutral-200 dark:border-neutral-700">
              {weekDays.map(day => (
                <div key={day} className="p-3 text-center text-xs font-medium text-neutral-400 uppercase">
                  {day}
                </div>
              ))}
            </div>

            {/* Dias */}
            <div className="flex-1 grid grid-cols-7 grid-rows-6">
              {(() => {
                const daysInMonth = getDaysInMonth(year, month);
                const firstDay = getFirstDayOfMonth(year, month);
                const prevMonthDays = getDaysInMonth(year, month - 1);
                const cells = [];

                // Dias do mês anterior
                for (let i = firstDay - 1; i >= 0; i--) {
                  const day = prevMonthDays - i;
                  cells.push(
                    <div key={`prev-${i}`} className="p-2 border-b border-r border-neutral-100 dark:border-neutral-700/50 bg-neutral-50/50 dark:bg-neutral-800/50">
                      <span className="text-sm text-neutral-300 dark:text-neutral-600">{day}</span>
                    </div>
                  );
                }

                // Dias do mês atual
                for (let day = 1; day <= daysInMonth; day++) {
                  const dateStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
                  const dayEvents = getEventsForDate(dateStr);
                  const isToday = dateStr === formatDate(new Date());

                  cells.push(
                    <div
                      key={day}
                      className={`p-2 border-b border-r border-neutral-100 dark:border-neutral-700/50 min-h-[100px] hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors cursor-pointer ${
                        isToday ? "bg-[#0B2545]/5" : ""
                      }`}
                      onDragOver={e => e.preventDefault()}
                      onDrop={() => handleDrop(dateStr)}
                    >
                      <span className={`text-sm font-medium ${
                        isToday
                          ? "w-7 h-7 flex items-center justify-center rounded-full bg-[#0B2545] text-white"
                          : "text-neutral-700 dark:text-neutral-300"
                      }`}>
                        {day}
                      </span>
                      <div className="mt-1 space-y-1">
                        {dayEvents.slice(0, 3).map(event => {
                          const colors = eventColors[event.type] || eventColors_tarefa;
                          return (
                            <div
                              key={event.id}
                              draggable
                              onDragStart={() => handleDragStart(event)}
                              onDragEnd={handleDragEnd}
                              onClick={e => { e.stopPropagation(); setSelectedEvent(event); }}
                              className={`text-[10px] px-1.5 py-0.5 rounded truncate cursor-grab ${colors.bg} ${colors.text}`}
                            >
                              {event.title}
                            </div>
                          );
                        })}
                        {dayEvents.length > 3 && (
                          <p className="text-[10px] text-neutral-400 px-1">+{dayEvents.length - 3} mais</p>
                        )}
                      </div>
                    </div>
                  );
                }

                // Dias do próximo mês
                const remaining = 42 - cells.length;
                for (let i = 1; i <= remaining; i++) {
                  cells.push(
                    <div key={`next-${i}`} className="p-2 border-b border-r border-neutral-100 dark:border-neutral-700/50 bg-neutral-50/50 dark:bg-neutral-800/50">
                      <span className="text-sm text-neutral-300 dark:text-neutral-600">{i}</span>
                    </div>
                  );
                }

                return cells;
              })()}
            </div>
          </div>
        )}

        {/* Day View */}
        {view === "day" && (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 text-center">
              <p className="text-sm text-neutral-400">{weekDaysFull[currentDate.getDay()]}</p>
              <p className="text-3xl font-semibold text-neutral-900 dark:text-white">{currentDate.getDate()}</p>
            </div>

            {/* Grid de horas */}
            <div className="flex-1 overflow-y-auto">
              <div className="relative">
                {hours.map(hour => {
                  const dateStr = formatDate(currentDate);
                  const hourEvents = getEventsForDate(dateStr).filter(e => parseInt(e.startTime.split(":")[0]) === hour);

                  return (
                    <div
                      key={hour}
                      className="flex border-b border-neutral-100 dark:border-neutral-700/50 h-20"
                      onDragOver={e => e.preventDefault()}
                      onDrop={() => handleDrop(dateStr, hour)}
                    >
                      <div className="w-20 px-3 py-2 text-right border-r border-neutral-100 dark:border-neutral-700">
                        <span className="text-sm text-neutral-400">{hour}:00</span>
                      </div>
                      <div className="flex-1 p-1 hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors relative">
                        {hourEvents.map(event => {
                          const colors = eventColors[event.type] || eventColors_tarefa;
                          return (
                            <motion.div
                              key={event.id}
                              draggable
                              onDragStart={() => handleDragStart(event)}
                              onDragEnd={handleDragEnd}
                              onClick={() => setSelectedEvent(event)}
                              className={`absolute inset-1 rounded-lg border-l-4 px-3 py-2 cursor-grab ${colors.bg} ${colors.border} ${colors.text}`}
                            >
                              <div className="flex items-center gap-2">
                                {eventIcons[event.type]}
                                <span className="font-medium">{event.title}</span>
                              </div>
                              <p className="text-sm opacity-70 mt-1">{event.startTime} - {event.endTime}</p>
                              {event.client && <p className="text-sm opacity-60">{event.client}</p>}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Evento */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
            >
              <div className={`p-4 ${(eventColors[selectedEvent.type] || eventColors_tarefa).bg}`}>
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-2 ${(eventColors[selectedEvent.type] || eventColors_tarefa).text}`}>
                    {eventIcons[selectedEvent.type]}
                    <span className="text-sm font-medium capitalize">{selectedEvent.type}</span>
                  </div>
                  <button onClick={() => setSelectedEvent(null)} className="p-1 hover:bg-black/10 rounded-lg">
                    <RiCloseLine className="w-5 h-5" />
                  </button>
                </div>
                <h3 className="text-xl font-semibold mt-2 text-neutral-900 dark:text-white">{selectedEvent.title}</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400">
                  <RiTimeLine className="w-5 h-5" />
                  <span>{selectedEvent.startTime} - {selectedEvent.endTime}</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400">
                  <RiCalendarLine className="w-5 h-5" />
                  <span>{new Date(selectedEvent.date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</span>
                </div>
                {selectedEvent.client && (
                  <div className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400">
                    <RiUserLine className="w-5 h-5" />
                    <span>{selectedEvent.client}</span>
                  </div>
                )}
                {selectedEvent.property && (
                  <div className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400">
                    <RiHome4Line className="w-5 h-5" />
                    <span>{selectedEvent.property}</span>
                  </div>
                )}
                {selectedEvent.corretor && (
                  <div className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400">
                    <RiUserLine className="w-5 h-5" />
                    <span>Corretor: {selectedEvent.corretor}</span>
                  </div>
                )}
                {selectedEvent.notes && (
                  <div className="mt-2 p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg text-sm text-neutral-600 dark:text-neutral-400">
                    {selectedEvent.notes}
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 flex gap-2">
                <button className="flex-1 px-4 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors">
                  Editar
                </button>
                <button className="flex-1 px-4 py-2 bg-[#0B2545] text-white rounded-lg hover:bg-[#1A3560] transition-colors">
                  Concluir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Novo Evento */}
      <AnimatePresence>
        {showNewEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => { setShowNewEvent(false); resetNewEvent(); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white dark:bg-neutral-800 p-6 pb-4 border-b border-neutral-100 dark:border-neutral-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Novo Evento</h3>
                  <button onClick={() => { setShowNewEvent(false); resetNewEvent(); }} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg">
                    <RiCloseLine className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Título */}
                <div>
                  <label className="block text-sm font-medium mb-2">Título *</label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Nome do evento"
                    className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20"
                  />
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo</label>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(eventColors) as Event["type"][]).map((type) => {
                      const colors = eventColors[type];
                      const isSelected = newEvent.type === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setNewEvent({ ...newEvent, type })}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm capitalize border-2 transition-all ${
                            isSelected
                              ? `${colors.bg} ${colors.text} border-current`
                              : "border-transparent bg-neutral-100 dark:bg-neutral-700 text-neutral-500 hover:bg-neutral-200"
                          }`}
                        >
                          {eventIcons[type]}
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Data e Horário */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Data</label>
                    <input
                      type="date"
                      value={newEvent.date}
                      onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Horário</label>
                    <div className="flex gap-2 items-center">
                      <input 
                        type="time" 
                        value={newEvent.startTime}
                        onChange={e => setNewEvent({ ...newEvent, startTime: e.target.value })}
                        className="flex-1 px-3 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl" 
                      />
                      <span className="text-neutral-400">-</span>
                      <input 
                        type="time" 
                        value={newEvent.endTime}
                        onChange={e => setNewEvent({ ...newEvent, endTime: e.target.value })}
                        className="flex-1 px-3 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl" 
                      />
                    </div>
                  </div>
                </div>

                {/* Cliente e Imóvel */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Cliente</label>
                    <input
                      type="text"
                      value={newEvent.client}
                      onChange={e => setNewEvent({ ...newEvent, client: e.target.value })}
                      placeholder="Nome do cliente"
                      className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Imóvel</label>
                    <input
                      type="text"
                      value={newEvent.property}
                      onChange={e => setNewEvent({ ...newEvent, property: e.target.value })}
                      placeholder="Código ou nome"
                      className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                    />
                  </div>
                </div>

                {/* Local */}
                <div>
                  <label className="block text-sm font-medium mb-2">Local</label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="Endereço ou link da reunião"
                    className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl"
                  />
                </div>

                {/* Observações */}
                <div>
                  <label className="block text-sm font-medium mb-2">Observações</label>
                  <textarea
                    value={newEvent.notes}
                    onChange={e => setNewEvent({ ...newEvent, notes: e.target.value })}
                    placeholder="Anotações sobre o evento..."
                    rows={2}
                    className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl resize-none"
                  />
                </div>

                {/* Fotos */}
                <div>
                  <label className="block text-sm font-medium mb-2">Fotos</label>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  
                  {/* Preview das fotos */}
                  {newEvent.photos.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {newEvent.photos.map((photo, index) => (
                        <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden group">
                          <img src={photo} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                          >
                            <RiDeleteBinLine className="w-5 h-5 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl text-neutral-500 hover:border-[#0B2545] hover:text-[#0B2545] transition-colors"
                  >
                    <RiCameraLine className="w-5 h-5" />
                    <span className="text-sm">Adicionar fotos</span>
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white dark:bg-neutral-800 p-6 pt-4 border-t border-neutral-100 dark:border-neutral-700 flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowNewEvent(false); resetNewEvent(); }}
                  className="flex-1 px-4 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  onClick={handleCreateEvent}
                  className="flex-1 px-4 py-2.5 bg-[#0B2545] text-white rounded-xl hover:bg-[#1A3560] transition-colors font-medium"
                >
                  Criar Evento
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
