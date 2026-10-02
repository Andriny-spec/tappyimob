"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiTeamLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiLoader4Line,
  RiUserLine,
  RiTimeLine,
  RiCheckLine,
  RiPauseLine,
  RiFlowChart,
  RiEyeLine,
  RiEyeOffLine,
  RiArrowRightSLine,
} from "react-icons/ri";
import Link from "next/link";

interface QueueMember {
  id: string;
  weight: number;
  isActive: boolean;
  isPaused: boolean;
  leadsToday: number;
  leadsThisWeek: number;
  totalLeads: number;
  lastLeadAt: string | null;
  turnOrder: number;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
}

interface Queue {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  rotationType: string;
  responseTimeMinutes: number | null;
  members: QueueMember[];
  _count: { assignments: number };
}

const STORAGE_KEY = "tappyimob_queue_overview_visible";

const QueueOverview = () => {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored !== "false";
    }
    return true;
  });
  const [expandedQueue, setExpandedQueue] = useState<string | null>(null);

  useEffect(() => {
    fetchQueues();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(visible));
  }, [visible]);

  const fetchQueues = async () => {
    try {
      const res = await fetch("/api/admin/leads/queue");
      if (res.ok) {
        const data = await res.json();
        setQueues(data.queues || []);
      }
    } catch (error) {
      console.error("Erro ao buscar filas:", error);
    } finally {
      setLoading(false);
    }
  };

  const activeQueues = queues.filter((q) => q.isActive);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <RiLoader4Line className="w-5 h-5 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (activeQueues.length === 0) return null;

  const getNextInLine = (queue: Queue): QueueMember | null => {
    const activeMembers = queue.members
      .filter((m) => m.isActive && !m.isPaused)
      .sort((a, b) => a.turnOrder - b.turnOrder);
    return activeMembers.length > 0 ? activeMembers[0] : null;
  };

  const getRotationLabel = (type: string) => {
    switch (type) {
      case "ROUND_ROBIN": return "Rodízio";
      case "WEIGHTED": return "Ponderado";
      case "MANUAL": return "Manual";
      default: return type;
    }
  };

  const formatLastLead = (dateStr: string | null) => {
    if (!dateStr) return "Nunca";
    const date = new Date(dateStr);
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Agora";
    if (mins < 60) return `${mins}min atrás`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  };

  return (
    <div>
      {/* Toggle Button */}
      <button
        onClick={() => setVisible(!visible)}
        className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 mb-2 transition-colors"
      >
        {visible ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
        {visible ? "Ocultar filas" : "Mostrar filas de atendimento"}
        <span className="bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-bold px-1.5 py-0.5 rounded-full">
          {activeQueues.length}
        </span>
      </button>

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {activeQueues.map((queue) => {
                const nextMember = getNextInLine(queue);
                const activeMembers = queue.members.filter((m) => m.isActive && !m.isPaused);
                const pausedMembers = queue.members.filter((m) => m.isPaused);
                const isExpanded = expandedQueue === queue.id;

                return (
                  <motion.div
                    key={queue.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="p-4 border-b border-neutral-100 dark:border-neutral-800">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-emerald-500 flex items-center justify-center">
                            <RiFlowChart className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">{queue.name}</h3>
                            <span className="text-xs text-neutral-500">{getRotationLabel(queue.rotationType)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-neutral-500">{activeMembers.length} ativos</span>
                          {pausedMembers.length > 0 && (
                            <span className="text-xs text-yellow-500" title="Pausados">
                              • {pausedMembers.length} <RiPauseLine className="w-3 h-3 inline" />
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Next in line highlight */}
                      {nextMember ? (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-orange-50 to-emerald-50 dark:from-orange-500/10 dark:to-emerald-500/10 border border-orange-200/50 dark:border-orange-500/20">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {nextMember.user.name?.charAt(0) || "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <RiArrowRightSLine className="w-4 h-4 text-orange-500 shrink-0" />
                              <p className="font-semibold text-neutral-900 dark:text-white text-sm truncate">
                                {nextMember.user.name}
                              </p>
                            </div>
                            <p className="text-xs text-neutral-500 mt-0.5">
                              Próximo da vez • {nextMember.leadsToday} hoje • {nextMember.totalLeads} total
                            </p>
                          </div>
                          {queue.responseTimeMinutes && (
                            <div className="text-right shrink-0">
                              <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                                <RiTimeLine className="w-3 h-3" />
                                {queue.responseTimeMinutes}min
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-center">
                          <p className="text-xs text-neutral-500">Sem membros ativos na fila</p>
                        </div>
                      )}
                    </div>

                    {/* Expand/Collapse */}
                    <button
                      onClick={() => setExpandedQueue(isExpanded ? null : queue.id)}
                      className="w-full px-4 py-2 flex items-center justify-between text-xs text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <span>{isExpanded ? "Ocultar membros" : `Ver todos (${queue.members.length})`}</span>
                      {isExpanded ? <RiArrowUpLine className="w-3 h-3" /> : <RiArrowDownLine className="w-3 h-3" />}
                    </button>

                    {/* Members list */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          className="overflow-hidden border-t border-neutral-100 dark:border-neutral-800"
                        >
                          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {queue.members
                              .sort((a, b) => a.turnOrder - b.turnOrder)
                              .map((member, idx) => {
                                const isNext = nextMember?.id === member.id;
                                return (
                                  <div
                                    key={member.id}
                                    className={`px-4 py-2.5 flex items-center gap-3 ${
                                      isNext ? "bg-orange-50/50 dark:bg-orange-500/5" : ""
                                    } ${member.isPaused ? "opacity-50" : ""}`}
                                  >
                                    <span className="text-xs text-neutral-400 w-5 text-center font-mono">
                                      {idx + 1}
                                    </span>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 ${
                                      isNext
                                        ? "bg-gradient-to-br from-orange-400 to-orange-600"
                                        : member.isPaused
                                        ? "bg-neutral-300 dark:bg-neutral-600"
                                        : "bg-gradient-to-br from-neutral-400 to-neutral-500"
                                    }`}>
                                      {member.user.name?.charAt(0) || "?"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                                        {member.user.name}
                                        {isNext && (
                                          <span className="ml-1.5 text-xs text-orange-500 font-normal">← próximo</span>
                                        )}
                                        {member.isPaused && (
                                          <span className="ml-1.5 text-xs text-yellow-500 font-normal">pausado</span>
                                        )}
                                      </p>
                                      <p className="text-xs text-neutral-500">
                                        {member.leadsToday} hoje • {member.leadsThisWeek} semana • {formatLastLead(member.lastLeadAt)}
                                      </p>
                                    </div>
                                    {member.weight > 1 && (
                                      <span className="text-xs bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-bold">
                                        {member.weight}x
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Footer stats */}
                    <div className="px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800/50 flex items-center justify-between">
                      <span className="text-xs text-neutral-500">
                        {queue._count.assignments} atribuições
                      </span>
                      <Link
                        href="/admin/clientes/leads/configuracoes"
                        className="text-xs text-orange-500 hover:text-orange-600 font-medium"
                      >
                        Configurar →
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QueueOverview;
