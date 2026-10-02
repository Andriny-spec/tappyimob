"use client";

import React, { useEffect, useState } from "react";
import {
  RiLoader4Line,
  RiCheckLine,
  RiAlertLine,
  RiRefreshLine,
  RiHistoryLine,
  RiCloseLine,
} from "react-icons/ri";

export interface BlastRecipient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status: "pending" | "sent" | "failed";
  error: string | null;
  sentAt: string | null;
}

export interface BlastDetail {
  id: string;
  channel?: "whatsapp" | "email";
  sessionName?: string | null;
  subject?: string | null;
  message: string;
  totalRecipients: number;
  sentCount: number;
  errorCount: number;
  pendingCount: number;
  status: "running" | "completed" | "aborted" | "failed";
  startedAt: string;
  finishedAt: string | null;
  recipients: BlastRecipient[];
}

/**
 * Hook que, dado um `activeBlastId`, faz polling em
 * /api/admin/tappy-summit/whatsapp-blast/[id] e expõe o progresso.
 * Usado tanto pelo disparo de WhatsApp quanto de Email.
 */
export function useBlastProgress(activeBlastId: string | null) {
  const [blastProgress, setBlastProgress] = useState<BlastDetail | null>(null);

  useEffect(() => {
    if (!activeBlastId) {
      setBlastProgress(null);
      return;
    }
    let stop = false;
    const tick = async () => {
      try {
        const res = await fetch(`/api/admin/tappy-summit/whatsapp-blast/${activeBlastId}`);
        if (!res.ok) return;
        const data: BlastDetail = await res.json();
        if (stop) return;
        setBlastProgress(data);
        if (data.status === "running") {
          setTimeout(tick, 2000);
        }
      } catch {
        if (!stop) setTimeout(tick, 3000);
      }
    };
    tick();
    return () => {
      stop = true;
    };
  }, [activeBlastId]);

  return { blastProgress, setBlastProgress };
}

/**
 * Painel com barra de progresso, contadores, lista filtrada de destinatários
 * e botão para reenviar falhados. Compartilhado entre WhatsApp e Email.
 */
export function BlastProgressPanel({
  blast,
  channel,
  onResendFailed,
  resending,
}: {
  blast: BlastDetail;
  channel: "whatsapp" | "email";
  onResendFailed?: () => void;
  resending?: boolean;
}) {
  const [filter, setFilter] = useState<"all" | "sent" | "failed" | "pending">("all");
  const done = blast.sentCount + blast.errorCount;
  const pct = Math.round((done / Math.max(blast.totalRecipients, 1)) * 100);

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {blast.status === "running" ? (
              <RiLoader4Line className="w-5 h-5 text-green-600 animate-spin" />
            ) : blast.status === "completed" ? (
              <RiCheckLine className="w-5 h-5 text-emerald-600" />
            ) : (
              <RiAlertLine className="w-5 h-5 text-red-600" />
            )}
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              {blast.status === "running" ? "Disparando..." :
               blast.status === "completed" ? "Disparo concluído" :
               blast.status === "aborted" ? "Disparo abortado" :
               "Disparo com erro"}
            </h3>
          </div>
          <span className="text-xs text-neutral-500">{done}/{blast.totalRecipients}</span>
        </div>

        <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden mb-3">
          <div className="h-full bg-green-500 transition-all" style={{ width: `${pct}%` }} />
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{blast.sentCount}</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-500 uppercase">Enviados</p>
          </div>
          <div className="p-2 rounded-lg bg-red-50 dark:bg-red-500/10">
            <p className="text-lg font-bold text-red-700 dark:text-red-400">{blast.errorCount}</p>
            <p className="text-[10px] text-red-600 dark:text-red-500 uppercase">Falhados</p>
          </div>
          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10">
            <p className="text-lg font-bold text-amber-700 dark:text-amber-400">{blast.pendingCount}</p>
            <p className="text-[10px] text-amber-600 dark:text-amber-500 uppercase">Pendentes</p>
          </div>
          <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800">
            <p className="text-lg font-bold text-neutral-700 dark:text-neutral-300">{blast.totalRecipients}</p>
            <p className="text-[10px] text-neutral-500 uppercase">Total</p>
          </div>
        </div>

        {blast.status !== "running" && blast.errorCount > 0 && onResendFailed && (
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onResendFailed}
              disabled={resending}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {resending ? <RiLoader4Line className="w-3.5 h-3.5 animate-spin" /> : <RiRefreshLine className="w-3.5 h-3.5" />}
              Reenviar {blast.errorCount} falhado{blast.errorCount > 1 ? "s" : ""}
            </button>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {[
            { key: "all", label: `Todos (${blast.recipients.length})` },
            { key: "sent", label: `Enviados (${blast.sentCount})` },
            { key: "failed", label: `Falhados (${blast.errorCount})` },
            { key: "pending", label: `Pendentes (${blast.pendingCount})` },
          ].map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key as any)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                filter === f.key
                  ? "bg-[#0B2545] text-white"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800 rounded-lg border border-neutral-100 dark:border-neutral-800">
          {blast.recipients
            .filter((r) => filter === "all" || r.status === filter)
            .map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-2.5 text-xs">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    r.status === "sent" ? "bg-emerald-500" :
                    r.status === "failed" ? "bg-red-500" :
                    "bg-amber-400 animate-pulse"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-900 dark:text-white truncate">{r.name}</p>
                  <p className="text-[10px] text-neutral-500 truncate">
                    {channel === "email" ? r.email || r.phone : r.phone}
                  </p>
                  {r.error && (
                    <p className="text-[10px] text-red-500 mt-0.5 truncate" title={r.error}>
                      {r.error}
                    </p>
                  )}
                </div>
                <span
                  className={`shrink-0 text-[10px] font-semibold uppercase ${
                    r.status === "sent" ? "text-emerald-600" :
                    r.status === "failed" ? "text-red-600" :
                    "text-amber-600"
                  }`}
                >
                  {r.status === "sent" ? "Enviado" : r.status === "failed" ? "Falhou" : "Pendente"}
                </span>
              </div>
            ))}
          {blast.recipients.filter((r) => filter === "all" || r.status === filter).length === 0 && (
            <div className="p-6 text-center text-xs text-neutral-400">Nenhum destinatário neste filtro</div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Modal listando os últimos 30 disparos do canal. Ao clicar em um item,
 * invoca `onOpenDetail(blastId)` para que o pai exiba o progresso daquele.
 */
export function BlastHistoryModal({
  channel,
  onClose,
  onOpenDetail,
}: {
  channel: "whatsapp" | "email";
  onClose: () => void;
  onOpenDetail: (blastId: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tappy-summit/whatsapp-blast/history?channel=${channel}`);
      const data = await res.json();
      if (res.ok) setHistory(data.blasts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <RiHistoryLine className="w-5 h-5 text-neutral-600" />
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
              Histórico de disparos {channel === "email" ? "(Email)" : "(WhatsApp)"}
            </h3>
            <button
              onClick={load}
              className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
              title="Atualizar"
            >
              <RiRefreshLine className={`w-4 h-4 text-neutral-500 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <RiCloseLine className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {loading && history.length === 0 ? (
            <div className="py-12 text-center text-sm text-neutral-400">
              <RiLoader4Line className="w-6 h-6 animate-spin mx-auto mb-2" />
              Carregando...
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center text-sm text-neutral-400">Nenhum disparo registrado ainda.</div>
          ) : (
            history.map((b) => {
              const done = b.sentCount + b.errorCount;
              const pct = Math.round((done / Math.max(b.totalRecipients, 1)) * 100);
              const statusLabel =
                b.status === "running" ? "Em andamento" :
                b.status === "completed" ? "Concluído" :
                b.status === "aborted" ? "Abortado" : "Com erro";
              const statusColor =
                b.status === "running" ? "text-green-600 bg-green-50" :
                b.status === "completed" ? "text-emerald-700 bg-emerald-50" :
                "text-red-700 bg-red-50";
              const preview = b.subject || b.message || "";
              return (
                <button
                  key={b.id}
                  onClick={() => onOpenDetail(b.id)}
                  className="w-full text-left p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-[#0B2545] hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>
                          {statusLabel}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {new Date(b.createdAt).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {b.createdByName && (
                          <span className="text-xs text-neutral-400">por {b.createdByName}</span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                        {preview.slice(0, 120)}
                        {preview.length > 120 ? "..." : ""}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                        {b.sentCount}/{b.totalRecipients}
                      </p>
                      {b.errorCount > 0 && (
                        <p className="text-xs text-red-500">{b.errorCount} falhados</p>
                      )}
                    </div>
                  </div>
                  <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${pct}%` }} />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
