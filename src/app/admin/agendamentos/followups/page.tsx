"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiPhoneLine,
  RiCalendarLine,
  RiTimeLine,
  RiUserLine,
  RiCheckLine,
  RiCloseLine,
  RiMailLine,
  RiWhatsappLine,
  RiMessage2Line,
  RiAlarmLine,
  RiLoader4Line,
  RiInboxLine,
} from "react-icons/ri";

interface FollowUpData {
  id: string;
  type: string;
  status: string;
  scheduledFor: string;
  sentAt: string | null;
  completedAt: string | null;
  message: string | null;
  channel: string | null;
  leadId: string;
  visitId: string | null;
  assignedToId: string | null;
  lead: { id: string; name: string; phone: string | null; email: string | null } | null;
}

const typeConfig: Record<string, { label: string; cor: string; lightBg: string; text: string }> = {
  POST_VISIT_24H: { label: "Pós-Visita 24h", cor: "bg-blue-500", lightBg: "bg-blue-100 dark:bg-blue-500/20", text: "text-blue-600" },
  NO_CONTACT_48H: { label: "Sem Contato 48h", cor: "bg-amber-500", lightBg: "bg-amber-100 dark:bg-amber-500/20", text: "text-amber-600" },
  PROPOSAL_PENDING: { label: "Proposta Pendente", cor: "bg-green-500", lightBg: "bg-green-100 dark:bg-green-500/20", text: "text-green-600" },
  REACTIVATION: { label: "Reativação", cor: "bg-purple-500", lightBg: "bg-purple-100 dark:bg-purple-500/20", text: "text-purple-600" },
};

const channelConfig: Record<string, { label: string; icon: typeof RiPhoneLine; cor: string; bg: string }> = {
  CALL: { label: "Telefone", icon: RiPhoneLine, cor: "text-green-500", bg: "bg-green-100 dark:bg-green-500/20" },
  WHATSAPP: { label: "WhatsApp", icon: RiWhatsappLine, cor: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-500/20" },
  EMAIL: { label: "E-mail", icon: RiMailLine, cor: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-500/20" },
  SMS: { label: "SMS", icon: RiMessage2Line, cor: "text-violet-500", bg: "bg-violet-100 dark:bg-violet-500/20" },
};

const statusFilterConfig: Record<string, { label: string; cor: string; text: string }> = {
  PENDING: { label: "Pendente", cor: "bg-amber-100 dark:bg-amber-500/20", text: "text-amber-600" },
  SENT: { label: "Enviado", cor: "bg-blue-100 dark:bg-blue-500/20", text: "text-blue-600" },
  COMPLETED: { label: "Concluído", cor: "bg-green-100 dark:bg-green-500/20", text: "text-green-600" },
  CANCELLED: { label: "Cancelado", cor: "bg-red-100 dark:bg-red-500/20", text: "text-red-600" },
};

export default function FollowupsPage() {
  const [followups, setFollowups] = useState<FollowUpData[]>([]);
  const [stats, setStats] = useState({ pending: 0, sent: 0, completed: 0, cancelled: 0, total: 0 });
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");
  const [selectedFollowup, setSelectedFollowup] = useState<FollowUpData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFollowups();
  }, [statusFilter]);

  const loadFollowups = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/followups?status=${statusFilter}`);
      if (res.ok) {
        const data = await res.json();
        setFollowups(data.followups || []);
        setStats(data.stats || { pending: 0, sent: 0, completed: 0, cancelled: 0, total: 0 });
      }
    } catch (error) {
      console.error("Erro ao carregar follow-ups:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAs = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/followups", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        loadFollowups();
        setSelectedFollowup(null);
      }
    } catch (error) {
      console.error("Erro ao atualizar follow-up:", error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    if (date.toDateString() === hoje.toDateString()) return "Hoje";
    if (date.toDateString() === amanha.toDateString()) return "Amanhã";
    return date.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  const getTypeConfig = (type: string) => {
    return typeConfig[type] || { label: type, cor: "bg-neutral-500", lightBg: "bg-neutral-100 dark:bg-neutral-800", text: "text-neutral-600" };
  };

  const statCards = [
    { label: "Pendentes", value: stats.pending, cor: "text-orange-500", icon: RiAlarmLine },
    { label: "Enviados", value: stats.sent, cor: "text-blue-500", icon: RiMessage2Line },
    { label: "Concluídos", value: stats.completed, cor: "text-green-500", icon: RiCheckLine },
    { label: "Total", value: stats.total, cor: "text-neutral-500", icon: RiCalendarLine },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/agendamentos" className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500">
            <RiArrowLeftLine className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-orange-500 flex items-center justify-center">
                <RiPhoneLine className="w-5 h-5 text-white" />
              </div>
              Follow-ups
            </h1>
            <p className="text-neutral-500 mt-1">Acompanhamento de leads automático</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${stat.cor}`} />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${stat.cor}`}>{stat.value}</p>
                  <p className="text-sm text-neutral-500">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {["all", "PENDING", "SENT", "COMPLETED", "CANCELLED"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              statusFilter === status
                ? "bg-amber-500 text-white"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            }`}
          >
            {status === "all" ? "Todos" : statusFilterConfig[status]?.label || status}
          </button>
        ))}
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <RiLoader4Line className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : followups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
          <RiInboxLine className="w-16 h-16 mb-4" />
          <p className="text-lg font-medium">Nenhum follow-up encontrado</p>
          <p className="text-sm">Não há follow-ups com o filtro selecionado</p>
        </div>
      ) : (
        <div className="space-y-2">
          {followups.map((followup, index) => {
            const typeConf = getTypeConfig(followup.type);
            const channelConf = followup.channel ? channelConfig[followup.channel] : null;
            const statusConf = statusFilterConfig[followup.status];

            return (
              <motion.div
                key={followup.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 border-l-4 overflow-hidden hover:shadow-md transition-all cursor-pointer"
                style={{ borderLeftColor: typeConf.cor.replace("bg-", "").includes("blue") ? "#3b82f6" : typeConf.cor.replace("bg-", "").includes("green") ? "#22c55e" : typeConf.cor.replace("bg-", "").includes("amber") ? "#f59e0b" : "#a855f7" }}
                onClick={() => setSelectedFollowup(followup)}
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  {/* Lead Name */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <RiUserLine className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                    <span className="font-semibold text-neutral-900 dark:text-white truncate">
                      {followup.lead?.name || "Lead desconhecido"}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${typeConf.lightBg} ${typeConf.text} flex-shrink-0`}>
                      {typeConf.label}
                    </span>
                    {statusConf && (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusConf.cor} ${statusConf.text} flex-shrink-0`}>
                        {statusConf.label}
                      </span>
                    )}
                  </div>

                  {/* Message preview */}
                  {followup.message && (
                    <p className="text-sm text-neutral-500 truncate hidden md:block max-w-[200px]">{followup.message}</p>
                  )}

                  {/* Data/Hora */}
                  <div className="flex items-center gap-1 text-xs text-neutral-500 flex-shrink-0">
                    <RiCalendarLine className="w-3.5 h-3.5" />
                    <span>{formatDate(followup.scheduledFor)} {formatTime(followup.scheduledFor)}</span>
                  </div>

                  {/* Channel */}
                  {channelConf && (
                    <div className={`w-8 h-8 rounded-lg ${channelConf.bg} flex items-center justify-center flex-shrink-0`}>
                      <channelConf.icon className={`w-4 h-4 ${channelConf.cor}`} />
                    </div>
                  )}

                  {/* Quick actions */}
                  {followup.status === "PENDING" && (
                    <button
                      onClick={(e) => { e.stopPropagation(); markAs(followup.id, "COMPLETED"); }}
                      className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-500/20 text-neutral-400 hover:text-green-600 transition-colors flex-shrink-0"
                      title="Marcar como concluído"
                    >
                      <RiCheckLine className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal de Detalhes */}
      <AnimatePresence>
        {selectedFollowup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedFollowup(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`${getTypeConfig(selectedFollowup.type).cor} p-4 flex items-center justify-between`}>
                <div>
                  <p className="text-white/80 text-sm">{getTypeConfig(selectedFollowup.type).label}</p>
                  <h3 className="text-xl font-bold text-white">{selectedFollowup.lead?.name || "Lead"}</h3>
                </div>
                <button onClick={() => setSelectedFollowup(null)} className="p-2 rounded-lg hover:bg-white/20 text-white">
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {selectedFollowup.message && (
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                    <p className="font-medium text-neutral-900 dark:text-white">{selectedFollowup.message}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Agendado para</p>
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {formatDate(selectedFollowup.scheduledFor)} {formatTime(selectedFollowup.scheduledFor)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Canal</p>
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {selectedFollowup.channel ? (channelConfig[selectedFollowup.channel]?.label || selectedFollowup.channel) : "Não definido"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {selectedFollowup.lead?.phone && (
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Telefone</p>
                      <p className="font-medium text-neutral-900 dark:text-white">{selectedFollowup.lead.phone}</p>
                    </div>
                  )}
                  {selectedFollowup.lead?.email && (
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">E-mail</p>
                      <p className="font-medium text-neutral-900 dark:text-white text-sm">{selectedFollowup.lead.email}</p>
                    </div>
                  )}
                </div>

                {/* Ações Rápidas */}
                {selectedFollowup.lead?.phone && (
                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                    <a href={`tel:${selectedFollowup.lead.phone}`} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-green-50 dark:bg-green-500/10 text-green-600 hover:bg-green-100 dark:hover:bg-green-500/20">
                      <RiPhoneLine className="w-5 h-5" />
                      <span className="text-xs font-medium">Ligar</span>
                    </a>
                    <a href={`https://wa.me/${selectedFollowup.lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-500/20">
                      <RiWhatsappLine className="w-5 h-5" />
                      <span className="text-xs font-medium">WhatsApp</span>
                    </a>
                    {selectedFollowup.lead?.email && (
                      <a href={`mailto:${selectedFollowup.lead.email}`} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-500/20">
                        <RiMailLine className="w-5 h-5" />
                        <span className="text-xs font-medium">E-mail</span>
                      </a>
                    )}
                  </div>
                )}

                {selectedFollowup.status === "PENDING" && (
                  <button
                    onClick={() => markAs(selectedFollowup.id, "COMPLETED")}
                    className="w-full h-10 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 flex items-center justify-center gap-2"
                  >
                    <RiCheckLine className="w-4 h-4" />
                    Marcar como Concluído
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
