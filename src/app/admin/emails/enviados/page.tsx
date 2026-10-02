"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiMailSendLine,
  RiMailSendFill,
  RiSearchLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiCloseCircleLine,
  RiMailLine,
  RiCloseLine,
  RiRefreshLine,
  RiCalendarLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiSpamLine,
  RiInboxLine,
  RiInformationLine,
  RiLoader4Line,
} from "react-icons/ri";

// ============================================================
// TYPES
// ============================================================
interface LogEntry {
  id: string;
  from: string;
  to: string;
  subject: string;
  status: "delivered" | "deferred" | "bounced" | "rejected";
  date: string;
  size: number;
  message_id: string;
  relay: string;
  delay: string;
  dsn: string;
  raw: string;
}

// ============================================================
// HELPERS
// ============================================================
function mapMailcowLog(log: any, index: number): LogEntry {
  // Mailcow postfix logs have varying structure
  const message = log.message || "";
  const time = log.time ? new Date(log.time * 1000).toISOString() : new Date().toISOString();

  // Parse status from message
  let status: LogEntry["status"] = "delivered";
  if (/status=deferred/i.test(message)) status = "deferred";
  else if (/status=bounced/i.test(message) || /bounce/i.test(message)) status = "bounced";
  else if (/reject|rejected/i.test(message)) status = "rejected";
  else if (/status=sent/i.test(message)) status = "delivered";

  // Parse from/to from message
  const fromMatch = message.match(/from=<([^>]*)>/);
  const toMatch = message.match(/to=<([^>]*)>/);
  const sizeMatch = message.match(/size=(\d+)/);
  const relayMatch = message.match(/relay=([^,]*)/);
  const delayMatch = message.match(/delay=([^,]*)/);
  const dsnMatch = message.match(/dsn=([^,]*)/);

  return {
    id: log.queue_id || `log-${index}`,
    from: fromMatch?.[1] || log.sender || "",
    to: toMatch?.[1] || log.rcpt || "",
    subject: log.subject || "",
    status,
    date: time,
    size: sizeMatch ? parseInt(sizeMatch[1]) : (log.size || 0),
    message_id: log.msgid || log.message_id || "",
    relay: relayMatch?.[1]?.trim() || "",
    delay: delayMatch?.[1]?.trim() || "",
    dsn: dsnMatch?.[1]?.trim() || "",
    raw: message,
  };
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Agora";
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d atrás`;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function formatFullDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatSize(bytes: number): string {
  if (bytes <= 0) return "-";
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}

function getStatusInfo(status: LogEntry["status"]) {
  const map = {
    delivered: { label: "Entregue", icon: RiCheckboxCircleLine, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
    deferred: { label: "Pendente", icon: RiTimeLine, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
    rejected: { label: "Rejeitado", icon: RiCloseCircleLine, color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10" },
    bounced: { label: "Bounce", icon: RiSpamLine, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-500/10" },
  };
  return map[status] || map.delivered;
}

// ============================================================
// COMPONENTS
// ============================================================

function StatsBar({ logs }: { logs: LogEntry[] }) {
  const delivered = logs.filter((e) => e.status === "delivered").length;
  const deferred = logs.filter((e) => e.status === "deferred").length;
  const failed = logs.filter((e) => e.status === "rejected" || e.status === "bounced").length;
  const total = logs.length;
  const deliveryRate = total > 0 ? Math.round((delivered / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {[
        { label: "Total de Logs", value: total, icon: RiMailSendLine, color: "text-[#0B2545]", bg: "bg-[#0B2545]/10 dark:bg-[#0B2545]/20" },
        { label: "Entregues", value: delivered, icon: RiCheckboxCircleLine, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
        { label: "Pendentes", value: deferred, icon: RiTimeLine, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10" },
        { label: "Falhas + Bounce", value: failed, icon: RiCloseCircleLine, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-500/10" },
        { label: "Taxa de Entrega", value: `${deliveryRate}%`, icon: RiInboxLine, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-500/10" },
      ].map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
            </div>
          </div>
          <p className="text-xl font-bold text-neutral-900 dark:text-white">{stat.value}</p>
          <p className="text-[11px] text-neutral-500 mt-0.5">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}

function LogRow({
  log,
  onView,
}: {
  log: LogEntry;
  onView: (l: LogEntry) => void;
}) {
  const statusInfo = getStatusInfo(log.status);
  const StatusIcon = statusInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={() => onView(log)}
      className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
    >
      {/* Status Icon + From */}
      <div className="flex items-center gap-3 lg:w-[260px] flex-shrink-0">
        <div className={`w-9 h-9 rounded-full ${statusInfo.bg} flex items-center justify-center flex-shrink-0`}>
          <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
            {log.from || "(sem remetente)"}
          </p>
          <p className="text-[11px] text-neutral-400 truncate">
            → {log.to || "(sem destinatário)"}
          </p>
        </div>
      </div>

      {/* Subject / Message */}
      <div className="min-w-0 flex-1 ml-12 lg:ml-0">
        <p className="text-sm text-neutral-900 dark:text-white truncate font-medium">
          {log.subject || log.id}
        </p>
        <p className="text-xs text-neutral-400 truncate mt-0.5">
          {log.relay ? `relay: ${log.relay}` : log.raw?.substring(0, 80)}
        </p>
      </div>

      {/* Status + Date + Size */}
      <div className="flex items-center gap-3 ml-12 lg:ml-0 flex-shrink-0">
        <div className={`flex items-center gap-1 ${statusInfo.color}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          <span className="text-[10px] font-medium">{statusInfo.label}</span>
        </div>
        <span className="text-xs text-neutral-400 min-w-[60px] text-right">{formatDate(log.date)}</span>
        <span className="text-[10px] text-neutral-300 min-w-[50px] text-right">{formatSize(log.size)}</span>
      </div>
    </motion.div>
  );
}

function LogDetailModal({
  log,
  onClose,
}: {
  log: LogEntry | null;
  onClose: () => void;
}) {
  if (!log) return null;
  const statusInfo = getStatusInfo(log.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-neutral-100 dark:border-neutral-800">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white pr-8">
              {log.subject || `Log ${log.id}`}
            </h2>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <div className={`flex items-center gap-1 ${statusInfo.color}`}>
                <StatusIcon className="w-4 h-4" />
                <span className="text-xs font-medium">{statusInfo.label}</span>
              </div>
              <span className="text-xs text-neutral-400">{formatFullDate(log.date)}</span>
              {log.size > 0 && (
                <span className="text-xs text-neutral-400">{formatSize(log.size)}</span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex-shrink-0">
            <RiCloseLine className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Meta */}
        <div className="px-5 py-3 bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-100 dark:border-neutral-800 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-500 w-16">De:</span>
            <span className="text-xs text-neutral-900 dark:text-white font-medium">{log.from || "-"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-500 w-16">Para:</span>
            <span className="text-xs text-neutral-700 dark:text-neutral-300">{log.to || "-"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-500 w-16">Queue ID:</span>
            <span className="text-xs text-neutral-500 font-mono">{log.id}</span>
          </div>
          {log.message_id && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-500 w-16">Msg ID:</span>
              <span className="text-xs text-neutral-500 font-mono truncate">{log.message_id}</span>
            </div>
          )}
          {log.relay && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-500 w-16">Relay:</span>
              <span className="text-xs text-neutral-500">{log.relay}</span>
            </div>
          )}
          {log.delay && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-500 w-16">Delay:</span>
              <span className="text-xs text-neutral-500">{log.delay}</span>
            </div>
          )}
          {log.dsn && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-500 w-16">DSN:</span>
              <span className="text-xs text-neutral-500">{log.dsn}</span>
            </div>
          )}
        </div>

        {/* Raw log */}
        <div className="flex-1 overflow-y-auto p-5">
          <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Log Completo</p>
          <pre className="text-xs text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800 rounded-xl p-4 whitespace-pre-wrap break-all font-mono leading-relaxed">
            {log.raw || "Sem dados adicionais"}
          </pre>
        </div>
      </motion.div>
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function EmailsEnviadosPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 20;

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/email/logs?count=200");
      if (!res.ok) throw new Error("Erro ao carregar logs");
      const data = await res.json();
      const mapped = (data.logs || [])
        .map((log: any, i: number) => mapMailcowLog(log, i))
        .filter((l: LogEntry) => l.from || l.to);
      setLogs(mapped);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao carregar logs de email");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filtered = useMemo(() => {
    let list = [...logs];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.from.toLowerCase().includes(q) ||
          e.to.toLowerCase().includes(q) ||
          e.subject.toLowerCase().includes(q) ||
          e.id.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      list = list.filter((e) => e.status === statusFilter);
    }

    list.sort((a, b) => {
      const cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [logs, search, statusFilter, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <RiMailSendFill className="w-7 h-7 text-[#0B2545]" />
            Emails Enviados
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Logs do Postfix — histórico de envio em tempo real
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors disabled:opacity-50"
        >
          <RiRefreshLine className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </div>

      {/* Stats */}
      <StatsBar logs={logs} />

      {/* Filters */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar por remetente, destinatário ou queue ID..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/30"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/30"
          >
            <option value="all">Todos os Status</option>
            <option value="delivered">Entregues</option>
            <option value="deferred">Pendentes</option>
            <option value="rejected">Rejeitados</option>
            <option value="bounced">Bounce</option>
          </select>

          <button
            onClick={() => setSortDir(sortDir === "desc" ? "asc" : "desc")}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
          >
            <RiCalendarLine className="w-4 h-4" />
            {sortDir === "desc" ? "Mais recentes" : "Mais antigos"}
            {sortDir === "desc" ? <RiArrowDownLine className="w-3 h-3" /> : <RiArrowUpLine className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && logs.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <RiLoader4Line className="w-8 h-8 animate-spin text-[#0B2545]" />
          <span className="ml-3 text-sm text-neutral-500">Carregando logs do Postfix...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 dark:bg-red-500/10 rounded-xl p-4 border border-red-200 dark:border-red-500/20">
          <RiInformationLine className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-300">Erro de conexão</p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
              {error}. Verifique as configurações do Mailcow nas{" "}
              <a href="/admin/emails/configuracoes" className="underline font-medium">Configurações</a>.
            </p>
          </div>
        </div>
      )}

      {/* Log List */}
      {!loading && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {paginated.length === 0 ? (
              <div className="text-center py-16">
                <RiMailSendLine className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-700 mb-3" />
                <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-1">
                  {logs.length === 0 ? "Nenhum log encontrado" : "Nenhum resultado para os filtros"}
                </h3>
                <p className="text-xs text-neutral-500">
                  {logs.length === 0 ? "O Mailcow ainda não possui registros de envio" : "Tente ajustar os filtros de busca"}
                </p>
              </div>
            ) : (
              paginated.map((log) => (
                <LogRow key={`${log.id}-${log.date}`} log={log} onView={setSelectedLog} />
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-neutral-100 dark:border-neutral-800">
              <p className="text-xs text-neutral-500">
                Mostrando {(page - 1) * perPage + 1}-{Math.min(page * perPage, filtered.length)} de {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30"
                >
                  <RiArrowLeftSLine className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let p: number;
                  if (totalPages <= 7) {
                    p = i + 1;
                  } else if (page <= 4) {
                    p = i + 1;
                  } else if (page >= totalPages - 3) {
                    p = totalPages - 6 + i;
                  } else {
                    p = page - 3 + i;
                  }
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                        p === page
                          ? "bg-[#0B2545] text-white"
                          : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30"
                >
                  <RiArrowRightSLine className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedLog && (
          <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
