"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCheckLine,
  RiTimeLine,
  RiUserLine,
  RiArrowGoBackLine,
  RiLoader4Line,
  RiCameraLine,
  RiHome4Line,
  RiPriceTag3Line,
  RiShieldCheckLine,
  RiSettings4Line,
  RiAddLine,
  RiCloseLine,
  RiEditLine,
} from "react-icons/ri";

interface TimelineStep {
  id: string;
  step: string;
  title: string;
  description?: string;
  status: "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDO";
  order: number;
  completedAt?: string;
  completedBy?: string;
  completedById?: string;
  completedByUser?: { id: string; name: string; avatar?: string };
  assignedToId?: string;
  assignedTo?: { id: string; name: string; avatar?: string };
  assignedToName?: string;
  notes?: string;
}

interface User {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

interface PropertyTimelineProps {
  propertyId: string;
  currentUser?: User;
  brokers?: User[];
}

const stepIcons: Record<string, React.ReactNode> = {
  fotos: <RiCameraLine className="w-5 h-5" />,
  placa: <RiPriceTag3Line className="w-5 h-5" />,
  reavaliacao: <RiEditLine className="w-5 h-5" />,
  exclusividade: <RiShieldCheckLine className="w-5 h-5" />,
  gestao_exclusividade: <RiSettings4Line className="w-5 h-5" />,
};

export function PropertyTimeline({ propertyId, currentUser, brokers = [] }: PropertyTimelineProps) {
  const [timeline, setTimeline] = useState<TimelineStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showNotes, setShowNotes] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [showAssign, setShowAssign] = useState<string | null>(null);
  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [editCompletedById, setEditCompletedById] = useState<string>("");
  const [editNotes, setEditNotes] = useState<string>("");

  const isAdmin = currentUser?.role === "ADMIN";

  useEffect(() => {
    fetchTimeline();
  }, [propertyId]);

  const fetchTimeline = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/timeline`);
      if (res.ok) {
        const data = await res.json();
        setTimeline(data);
      } else {
        setError("Erro ao carregar timeline");
      }
    } catch (err) {
      console.error("Erro ao buscar timeline:", err);
      setError("Erro de conexão ao carregar timeline");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (stepId: string) => {
    setActionLoading(stepId);
    try {
      const res = await fetch(`/api/properties/${propertyId}/timeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timelineId: stepId,
          action: "complete",
          notes: notes || null,
        }),
      });

      if (res.ok) {
        await fetchTimeline();
        setShowNotes(null);
        setNotes("");
      }
    } catch (error) {
      console.error("Erro ao completar etapa:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUndo = async (stepId: string) => {
    if (!confirm("Tem certeza que deseja desfazer esta etapa?")) return;
    
    setActionLoading(stepId);
    try {
      const res = await fetch(`/api/properties/${propertyId}/timeline`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timelineId: stepId,
          action: "undo",
        }),
      });

      if (res.ok) {
        await fetchTimeline();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao desfazer etapa");
      }
    } catch (error) {
      console.error("Erro ao desfazer etapa:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAssign = async (stepId: string, userId: string) => {
    setActionLoading(stepId);
    try {
      const res = await fetch(`/api/properties/${propertyId}/timeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timelineId: stepId,
          action: "assign",
          assignedToId: userId,
        }),
      });

      if (res.ok) {
        await fetchTimeline();
        setShowAssign(null);
      }
    } catch (error) {
      console.error("Erro ao atribuir corretor:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = async (stepId: string) => {
    setActionLoading(stepId);
    try {
      const body: any = { timelineId: stepId, action: "edit" };
      if (editCompletedById) body.completedById = editCompletedById;
      if (editNotes !== undefined) body.notes = editNotes;

      const res = await fetch(`/api/properties/${propertyId}/timeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await fetchTimeline();
        setEditingStep(null);
        setEditCompletedById("");
        setEditNotes("");
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao editar etapa");
      }
    } catch (error) {
      console.error("Erro ao editar etapa:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const startEditing = (step: TimelineStep) => {
    setEditingStep(step.id);
    setEditCompletedById(step.completedById || "");
    setEditNotes(step.notes || "");
  };

  const canUndo = (step: TimelineStep) => {
    if (step.status !== "CONCLUIDO") return false;
    if (isAdmin) return true;
    if (step.completedById === currentUser?.id) return true;
    return false;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONCLUIDO":
        return "bg-green-500";
      case "EM_ANDAMENTO":
        return "bg-blue-500";
      default:
        return "bg-neutral-300 dark:bg-neutral-600";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "CONCLUIDO":
        return "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-800";
      case "EM_ANDAMENTO":
        return "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-800";
      default:
        return "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RiLoader4Line className="w-6 h-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3">
        <p className="text-sm text-red-500">{error}</p>
        <button onClick={fetchTimeline} className="px-4 py-2 text-sm font-medium text-white bg-[#0B2545] rounded-lg hover:bg-[#162d4a] transition-colors">Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <RiTimeLine className="w-5 h-5 text-[#0B2545]" />
          Timeline do Imóvel
        </h3>
        <div className="text-sm text-neutral-500">
          {timeline.filter(s => s.status === "CONCLUIDO").length} de {timeline.length} etapas
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-green-500 to-green-400"
          initial={{ width: 0 }}
          animate={{ 
            width: `${(timeline.filter(s => s.status === "CONCLUIDO").length / timeline.length) * 100}%` 
          }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Timeline steps */}
      <div className="space-y-3">
        {timeline.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`relative p-4 rounded-xl border transition-all ${getStatusBg(step.status)}`}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={`p-2.5 rounded-xl text-white ${getStatusColor(step.status)}`}>
                {step.status === "CONCLUIDO" ? (
                  <RiCheckLine className="w-5 h-5" />
                ) : (
                  stepIcons[step.step] || <RiTimeLine className="w-5 h-5" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{step.title}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    step.status === "CONCLUIDO" 
                      ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                      : step.status === "EM_ANDAMENTO"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                      : "bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400"
                  }`}>
                    {step.status === "CONCLUIDO" ? "Concluído" : step.status === "EM_ANDAMENTO" ? "Em andamento" : "Pendente"}
                  </span>
                </div>

                {step.description && (
                  <p className="text-sm text-neutral-500 mb-2">{step.description}</p>
                )}

                {/* Completed info */}
                {step.status === "CONCLUIDO" && step.completedBy && (
                  <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 mb-2">
                    <RiUserLine className="w-3.5 h-3.5" />
                    <span>
                      Executado por <strong>{step.completedBy}</strong>
                      {step.completedAt && (
                        <> em {new Date(step.completedAt).toLocaleDateString("pt-BR", { 
                          day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" 
                        })}</>
                      )}
                    </span>
                  </div>
                )}

                {/* Assigned to */}
                {step.assignedTo && step.status !== "CONCLUIDO" && (
                  <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 mb-2">
                    <RiUserLine className="w-3.5 h-3.5" />
                    <span>Atribuído a <strong>{step.assignedTo.name}</strong></span>
                  </div>
                )}

                {/* Notes */}
                {step.notes && (
                  <div className="p-2 bg-white/50 dark:bg-neutral-900/50 rounded-lg text-xs text-neutral-600 dark:text-neutral-400 mt-2">
                    📝 {step.notes}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {step.status === "PENDENTE" && (
                  <>
                    {/* Atribuir corretor */}
                    <button
                      onClick={() => setShowAssign(showAssign === step.id ? null : step.id)}
                      className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500"
                      title="Atribuir corretor"
                    >
                      <RiUserLine className="w-4 h-4" />
                    </button>
                    {/* Marcar como concluído */}
                    <button
                      onClick={() => setShowNotes(showNotes === step.id ? null : step.id)}
                      disabled={actionLoading === step.id}
                      className="p-2 rounded-lg bg-green-100 hover:bg-green-200 dark:bg-green-500/20 dark:hover:bg-green-500/30 text-green-600"
                      title="Marcar como concluído"
                    >
                      {actionLoading === step.id ? (
                        <RiLoader4Line className="w-4 h-4 animate-spin" />
                      ) : (
                        <RiCheckLine className="w-4 h-4" />
                      )}
                    </button>
                  </>
                )}

                {step.status === "EM_ANDAMENTO" && (
                  <button
                    onClick={() => setShowNotes(showNotes === step.id ? null : step.id)}
                    disabled={actionLoading === step.id}
                    className="p-2 rounded-lg bg-green-100 hover:bg-green-200 dark:bg-green-500/20 dark:hover:bg-green-500/30 text-green-600"
                    title="Marcar como concluído"
                  >
                    {actionLoading === step.id ? (
                      <RiLoader4Line className="w-4 h-4 animate-spin" />
                    ) : (
                      <RiCheckLine className="w-4 h-4" />
                    )}
                  </button>
                )}

                {canUndo(step) && isAdmin && (
                  <button
                    onClick={() => startEditing(step)}
                    disabled={actionLoading === step.id}
                    className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-500"
                    title="Editar etapa"
                  >
                    <RiEditLine className="w-4 h-4" />
                  </button>
                )}
                {canUndo(step) && (
                  <button
                    onClick={() => handleUndo(step.id)}
                    disabled={actionLoading === step.id}
                    className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500"
                    title="Desfazer (apenas você ou ADMIN)"
                  >
                    {actionLoading === step.id ? (
                      <RiLoader4Line className="w-4 h-4 animate-spin" />
                    ) : (
                      <RiArrowGoBackLine className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Notes input */}
            <AnimatePresence>
              {showNotes === step.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700"
                >
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Adicionar observação (opcional)..."
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg resize-none"
                    rows={2}
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => { setShowNotes(null); setNotes(""); }}
                      className="px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-700"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleComplete(step.id)}
                      disabled={actionLoading === step.id}
                      className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1"
                    >
                      {actionLoading === step.id ? (
                        <RiLoader4Line className="w-3 h-3 animate-spin" />
                      ) : (
                        <RiCheckLine className="w-3 h-3" />
                      )}
                      Confirmar Conclusão
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Edit completed step */}
            <AnimatePresence>
              {editingStep === step.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700"
                >
                  <p className="text-xs font-medium text-neutral-500 mb-2">Editar etapa concluída:</p>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-neutral-400 mb-0.5 block">Executado por</label>
                      <select
                        value={editCompletedById}
                        onChange={(e) => setEditCompletedById(e.target.value)}
                        className="w-full h-8 px-2 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg"
                      >
                        <option value="">Manter atual</option>
                        {brokers.map((b) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                        {currentUser && !brokers.find(b => b.id === currentUser.id) && (
                          <option value={currentUser.id}>{currentUser.name}</option>
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 mb-0.5 block">Observação</label>
                      <textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="Observação..."
                        className="w-full px-2 py-1.5 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg resize-none"
                        rows={2}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => { setEditingStep(null); setEditCompletedById(""); setEditNotes(""); }}
                        className="px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-700"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleEdit(step.id)}
                        disabled={actionLoading === step.id}
                        className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
                      >
                        {actionLoading === step.id ? (
                          <RiLoader4Line className="w-3 h-3 animate-spin" />
                        ) : (
                          <RiEditLine className="w-3 h-3" />
                        )}
                        Salvar
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Assign broker dropdown */}
            <AnimatePresence>
              {showAssign === step.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700"
                >
                  <p className="text-xs text-neutral-500 mb-2">Atribuir corretor responsável:</p>
                  <div className="flex flex-wrap gap-2">
                    {brokers.map((broker) => (
                      <button
                        key={broker.id}
                        onClick={() => handleAssign(step.id, broker.id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-blue-500 text-sm"
                      >
                        <div className="w-6 h-6 rounded-full bg-[#0B2545] flex items-center justify-center text-white text-xs">
                          {broker.name?.charAt(0)}
                        </div>
                        {broker.name}
                      </button>
                    ))}
                    {brokers.length === 0 && (
                      <p className="text-xs text-neutral-400">Nenhum corretor disponível</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
