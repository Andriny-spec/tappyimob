"use client";

import { useState, useEffect, useCallback } from "react";
import {
  RiTimeLine,
  RiCheckLine,
  RiCloseLine,
  RiPhoneLine,
  RiMailLine,
  RiFireLine,
  RiLoader4Line,
  RiAlarmWarningLine,
} from "react-icons/ri";

interface PendingAssignment {
  id: string;
  status: string;
  assignedAt: string;
  expiresAt: string | null;
  queue: { id: string; name: string; responseTimeMinutes: number | null };
  lead: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    source?: string;
    temperature?: string;
    createdAt: string;
  } | null;
}

const PendingAssignments = () => {
  const [assignments, setAssignments] = useState<PendingAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/leads/queue/assignments?status=PENDING");
      if (res.ok) {
        const data = await res.json();
        setAssignments(data);
      }
    } catch (error) {
      console.error("Erro ao buscar pendentes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
    const interval = setInterval(fetchPending, 30000);
    return () => clearInterval(interval);
  }, [fetchPending]);

  const handleAction = async (assignmentId: string, action: "accept" | "reject") => {
    setActionLoading(assignmentId);
    try {
      const res = await fetch(`/api/admin/leads/queue/assignments/${assignmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
      }
    } catch (error) {
      console.error("Erro ao processar:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const getTimeRemaining = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return "Expirado";
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  if (loading) return null;
  if (assignments.length === 0) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <RiAlarmWarningLine className="w-5 h-5 text-amber-600" />
        <h3 className="font-semibold text-amber-800 dark:text-amber-400">
          Leads Aguardando Aceite ({assignments.length})
        </h3>
      </div>

      <div className="space-y-3">
        {assignments.map((assignment) => (
          <PendingCard
            key={assignment.id}
            assignment={assignment}
            actionLoading={actionLoading}
            onAction={handleAction}
            getTimeRemaining={getTimeRemaining}
          />
        ))}
      </div>
    </div>
  );
};

const PendingCard = ({
  assignment,
  actionLoading,
  onAction,
  getTimeRemaining,
}: {
  assignment: PendingAssignment;
  actionLoading: string | null;
  onAction: (id: string, action: "accept" | "reject") => void;
  getTimeRemaining: (expiresAt: string | null) => string | null;
}) => {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(assignment.expiresAt));

  useEffect(() => {
    if (!assignment.expiresAt) return;
    const interval = setInterval(() => {
      setTimeLeft(getTimeRemaining(assignment.expiresAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [assignment.expiresAt, getTimeRemaining]);

  const lead = assignment.lead;
  const isExpired = timeLeft === "Expirado";
  const isProcessing = actionLoading === assignment.id;

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-3">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-neutral-900 dark:text-white">
              {lead?.name || "Lead sem nome"}
            </span>
            {lead?.temperature === "HOT" && <RiFireLine className="w-4 h-4 text-red-500" />}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
            {lead?.phone && (
              <span className="flex items-center gap-1">
                <RiPhoneLine className="w-3 h-3" /> {lead.phone}
              </span>
            )}
            {lead?.email && (
              <span className="flex items-center gap-1">
                <RiMailLine className="w-3 h-3" /> {lead.email}
              </span>
            )}
            <span>Fila: {assignment.queue.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {timeLeft && (
            <span
              className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                isExpired
                  ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
              }`}
            >
              <RiTimeLine className="w-3 h-3" />
              {timeLeft}
            </span>
          )}

          <button
            onClick={() => onAction(assignment.id, "reject")}
            disabled={isProcessing}
            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 transition-colors disabled:opacity-50"
            title="Rejeitar"
          >
            {isProcessing ? (
              <RiLoader4Line className="w-4 h-4 animate-spin" />
            ) : (
              <RiCloseLine className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() => onAction(assignment.id, "accept")}
            disabled={isProcessing || isExpired}
            className="p-2 rounded-lg bg-green-50 hover:bg-green-100 dark:bg-green-500/10 dark:hover:bg-green-500/20 text-green-600 transition-colors disabled:opacity-50"
            title="Aceitar"
          >
            {isProcessing ? (
              <RiLoader4Line className="w-4 h-4 animate-spin" />
            ) : (
              <RiCheckLine className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingAssignments;
