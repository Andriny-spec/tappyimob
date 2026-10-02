"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiDragMoveLine,
  RiSettings4Line,
  RiTimeLine,
  RiMailLine,
  RiWhatsappLine,
  RiRobot2Line,
  RiUserLine,
  RiArrowRightLine,
  RiCheckLine,
  RiCloseLine,
  RiAlertLine,
  RiRefreshLine,
} from "react-icons/ri";

interface FunnelStage {
  id: string;
  name: string;
  description?: string;
  color: string;
  order: number;
  daysToStagnate?: number;
  autoMoveAfterDays?: number;
  autoMoveToStageId?: string;
  _count?: { partners: number };
  partners?: any[];
}

interface Funnel {
  id: string;
  name: string;
  description?: string;
  partnerTypes: string[];
  isDefault: boolean;
  isActive: boolean;
  stages: FunnelStage[];
  automations: any[];
}

const partnerTypeLabels: Record<string, string> = {
  CORRETOR: "Corretores",
  IMOBILIARIA: "Imobiliárias",
  CORRESPONDENTE_BANCARIO: "Correspondentes",
  ARQUITETO: "Arquitetos",
  CONSTRUTORA: "Construtoras",
};

const defaultStages = [
  { name: "Primeiro Contato", color: "#3b82f6", daysToStagnate: 7 },
  { name: "Qualificação", color: "#f59e0b", daysToStagnate: 14 },
  { name: "Negociação", color: "#8b5cf6", daysToStagnate: 30 },
  { name: "Ativo", color: "#22c55e" },
  { name: "Premium", color: "#ec4899" },
  { name: "Inativo", color: "#6b7280" },
];

export default function PartnerFunnelPage() {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFunnel, setSelectedFunnel] = useState<Funnel | null>(null);
  const [showNewFunnelModal, setShowNewFunnelModal] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);
  const [editingStage, setEditingStage] = useState<FunnelStage | null>(null);
  const [showAutomationModal, setShowAutomationModal] = useState(false);

  useEffect(() => {
    fetchFunnels();
  }, []);

  const fetchFunnels = async () => {
    try {
      const res = await fetch("/api/admin/partner-funnels");
      if (res.ok) {
        const data = await res.json();
        setFunnels(data.funnels || []);
        if (data.funnels?.length > 0 && !selectedFunnel) {
          setSelectedFunnel(data.funnels[0]);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar funis:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFunnel = async (data: any) => {
    try {
      const res = await fetch("/api/admin/partner-funnels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const funnel = await res.json();
        setFunnels([...funnels, funnel]);
        setSelectedFunnel(funnel);
        setShowNewFunnelModal(false);
      }
    } catch (error) {
      console.error("Erro ao criar funil:", error);
    }
  };

  const handleDeleteFunnel = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este funil?")) return;
    try {
      const res = await fetch(`/api/admin/partner-funnels/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setFunnels(funnels.filter((f) => f.id !== id));
        if (selectedFunnel?.id === id) {
          setSelectedFunnel(funnels[0] || null);
        }
      }
    } catch (error) {
      console.error("Erro ao excluir funil:", error);
    }
  };

  const handleCreateStage = async (data: any) => {
    if (!selectedFunnel) return;
    try {
      const res = await fetch(`/api/admin/partner-funnels/${selectedFunnel.id}/stages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        fetchFunnels();
        setShowStageModal(false);
      }
    } catch (error) {
      console.error("Erro ao criar etapa:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Funil de Jornada dos Parceiros
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Configure etapas e automações para gerenciar o relacionamento com parceiros
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAutomationModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20 rounded-xl transition-colors"
          >
            <RiRobot2Line className="w-4 h-4" />
            Automações
          </button>
          <button
            onClick={() => setShowNewFunnelModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25"
          >
            <RiAddLine className="w-4 h-4" />
            Novo Funil
          </button>
        </div>
      </div>

      {/* Funis disponíveis */}
      {funnels.length > 0 && (
        <div className="flex items-center gap-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl overflow-x-auto">
          {funnels.map((funnel) => (
            <button
              key={funnel.id}
              onClick={() => setSelectedFunnel(funnel)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                selectedFunnel?.id === funnel.id
                  ? "bg-white dark:bg-neutral-700 text-orange-600 shadow-sm"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              {funnel.name}
              {funnel.isDefault && (
                <span className="px-1.5 py-0.5 text-[10px] bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 rounded">
                  Padrão
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Funil Selecionado */}
      {selectedFunnel ? (
        <div className="space-y-6">
          {/* Info do Funil */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {selectedFunnel.name}
              </h2>
              <p className="text-sm text-neutral-500">
                {selectedFunnel.partnerTypes.map((t) => partnerTypeLabels[t]).join(", ")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-neutral-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors">
                <RiEditLine className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDeleteFunnel(selectedFunnel.id)}
                className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <RiDeleteBinLine className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Etapas do Funil (Kanban Style) */}
          <div className="flex gap-4 overflow-x-auto pb-4">
            {selectedFunnel.stages
              .sort((a, b) => a.order - b.order)
              .map((stage, idx) => (
                <div
                  key={stage.id}
                  className="flex-shrink-0 w-72 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden"
                >
                  {/* Header da Etapa */}
                  <div
                    className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700"
                    style={{ borderTopColor: stage.color, borderTopWidth: 3 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: stage.color }}
                        />
                        <h3 className="font-semibold text-neutral-900 dark:text-white">
                          {stage.name}
                        </h3>
                      </div>
                      <span className="px-2 py-0.5 text-xs font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded">
                        {stage._count?.partners || 0}
                      </span>
                    </div>
                    {stage.daysToStagnate && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                        <RiAlertLine className="w-3 h-3" />
                        Estagnado após {stage.daysToStagnate} dias
                      </p>
                    )}
                  </div>

                  {/* Configurações da Etapa */}
                  <div className="p-3 space-y-2">
                    <button
                      onClick={() => {
                        setEditingStage(stage);
                        setShowStageModal(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                    >
                      <RiSettings4Line className="w-4 h-4" />
                      Configurar etapa
                    </button>
                    {stage.autoMoveAfterDays && (
                      <div className="flex items-center gap-2 px-3 py-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                        <RiTimeLine className="w-4 h-4" />
                        Mover após {stage.autoMoveAfterDays} dias
                      </div>
                    )}
                  </div>

                  {/* Parceiros nesta etapa (preview) */}
                  <div className="px-3 pb-3">
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {stage.partners?.slice(0, 3).map((partner: any) => (
                        <div
                          key={partner.id}
                          className="flex items-center gap-2 p-2 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                            {partner.name[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-neutral-900 dark:text-white truncate">
                              {partner.name}
                            </p>
                            <p className="text-[10px] text-neutral-500 truncate">
                              {partner.email}
                            </p>
                          </div>
                        </div>
                      ))}
                      {(stage._count?.partners || 0) > 3 && (
                        <p className="text-xs text-neutral-400 text-center py-1">
                          +{(stage._count?.partners || 0) - 3} parceiros
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

            {/* Botão Adicionar Etapa */}
            <button
              onClick={() => {
                setEditingStage(null);
                setShowStageModal(true);
              }}
              className="flex-shrink-0 w-72 h-48 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl text-neutral-400 hover:text-orange-500 hover:border-orange-500 transition-colors"
            >
              <RiAddLine className="w-8 h-8" />
              <span className="text-sm font-medium">Adicionar Etapa</span>
            </button>
          </div>

          {/* Automações Configuradas */}
          <div className="p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                <RiRobot2Line className="w-4 h-4 text-purple-500" />
                Automações Ativas
              </h3>
              <button
                onClick={() => setShowAutomationModal(true)}
                className="text-xs text-purple-500 hover:text-purple-600 font-medium"
              >
                + Adicionar
              </button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedFunnel.automations?.length > 0 ? (
                selectedFunnel.automations.map((automation: any) => (
                  <div
                    key={automation.id}
                    className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-lg border border-purple-200 dark:border-purple-500/20"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-700 dark:text-purple-400">
                          {automation.name}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          {automation.triggerType === "DAYS_WITHOUT_EMAIL" && "Dias sem e-mail"}
                          {automation.triggerType === "DAYS_WITHOUT_WHATSAPP" && "Dias sem WhatsApp"}
                          {automation.triggerType === "DAYS_IN_STAGE" && "Dias no estágio"}
                          {automation.triggerType === "BIRTHDAY" && "Aniversário"}
                        </p>
                      </div>
                      <span
                        className={`px-1.5 py-0.5 text-[10px] rounded ${
                          automation.isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                            : "bg-neutral-100 text-neutral-500"
                        }`}
                      >
                        {automation.isActive ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral-400 col-span-full">
                  Nenhuma automação configurada.{" "}
                  <button
                    onClick={() => setShowAutomationModal(true)}
                    className="text-purple-500 hover:underline"
                  >
                    Criar primeira automação
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <RiRefreshLine className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mb-4" />
          <p className="text-neutral-500 mb-4">Nenhum funil configurado</p>
          <button
            onClick={() => setShowNewFunnelModal(true)}
            className="text-orange-500 hover:text-orange-600 font-medium"
          >
            + Criar primeiro funil
          </button>
        </div>
      )}

      {/* Modal Novo Funil */}
      <AnimatePresence>
        {showNewFunnelModal && (
          <NewFunnelModal
            onClose={() => setShowNewFunnelModal(false)}
            onSave={handleCreateFunnel}
          />
        )}
      </AnimatePresence>

      {/* Modal Etapa */}
      <AnimatePresence>
        {showStageModal && selectedFunnel && (
          <StageModal
            stage={editingStage}
            stages={selectedFunnel.stages}
            onClose={() => {
              setShowStageModal(false);
              setEditingStage(null);
            }}
            onSave={handleCreateStage}
          />
        )}
      </AnimatePresence>

      {/* Modal Automações */}
      <AnimatePresence>
        {showAutomationModal && selectedFunnel && (
          <AutomationModal
            funnelId={selectedFunnel.id}
            stages={selectedFunnel.stages}
            onClose={() => setShowAutomationModal(false)}
            onSave={() => {
              fetchFunnels();
              setShowAutomationModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Modal Novo Funil
function NewFunnelModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const [name, setName] = useState("");
  const [partnerTypes, setPartnerTypes] = useState<string[]>(["CORRETOR"]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl z-50"
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Novo Funil de Parceiros
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Nome do Funil</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Funil de Corretores"
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-2">Tipos de Parceiro</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(partnerTypeLabels).map(([value, label]) => (
                  <label
                    key={value}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                      partnerTypes.includes(value)
                        ? "bg-orange-500 text-white"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={partnerTypes.includes(value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPartnerTypes([...partnerTypes, value]);
                        } else {
                          setPartnerTypes(partnerTypes.filter((t) => t !== value));
                        }
                      }}
                      className="hidden"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={() => onSave({ name, partnerTypes })}
              disabled={!name || partnerTypes.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg disabled:opacity-50"
            >
              Criar Funil
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// Modal Etapa
function StageModal({
  stage,
  stages,
  onClose,
  onSave,
}: {
  stage: FunnelStage | null;
  stages: FunnelStage[];
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const [name, setName] = useState(stage?.name || "");
  const [color, setColor] = useState(stage?.color || "#6b7280");
  const [daysToStagnate, setDaysToStagnate] = useState(stage?.daysToStagnate?.toString() || "");
  const [autoMoveAfterDays, setAutoMoveAfterDays] = useState(stage?.autoMoveAfterDays?.toString() || "");
  const [autoMoveToStageId, setAutoMoveToStageId] = useState(stage?.autoMoveToStageId || "");

  const colors = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#6b7280"];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl z-50"
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            {stage ? "Editar Etapa" : "Nova Etapa"}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Nome da Etapa</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Qualificação"
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-2">Cor</label>
              <div className="flex gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-lg transition-transform ${
                      color === c ? "ring-2 ring-offset-2 ring-orange-500 scale-110" : ""
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">
                Dias para considerar estagnado (alerta)
              </label>
              <input
                type="number"
                value={daysToStagnate}
                onChange={(e) => setDaysToStagnate(e.target.value)}
                placeholder="Ex: 7"
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">
                Mover automaticamente após X dias
              </label>
              <input
                type="number"
                value={autoMoveAfterDays}
                onChange={(e) => setAutoMoveAfterDays(e.target.value)}
                placeholder="Deixe vazio para desativar"
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
            {autoMoveAfterDays && (
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">
                  Mover para qual etapa?
                </label>
                <select
                  value={autoMoveToStageId}
                  onChange={(e) => setAutoMoveToStageId(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                  <option value="">Selecione</option>
                  {stages
                    .filter((s) => s.id !== stage?.id)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={() =>
                onSave({
                  name,
                  color,
                  daysToStagnate: daysToStagnate ? parseInt(daysToStagnate) : null,
                  autoMoveAfterDays: autoMoveAfterDays ? parseInt(autoMoveAfterDays) : null,
                  autoMoveToStageId: autoMoveToStageId || null,
                })
              }
              disabled={!name}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg disabled:opacity-50"
            >
              Salvar
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// Modal Automações
function AutomationModal({
  funnelId,
  stages,
  onClose,
  onSave,
}: {
  funnelId: string;
  stages: FunnelStage[];
  onClose: () => void;
  onSave: () => void;
}) {
  const [name, setName] = useState("");
  const [triggerType, setTriggerType] = useState("DAYS_WITHOUT_EMAIL");
  const [triggerDays, setTriggerDays] = useState("7");
  const [actionType, setActionType] = useState("NOTIFY");
  const [saving, setSaving] = useState(false);

  const triggerTypes = [
    { value: "DAYS_WITHOUT_EMAIL", label: "X dias sem e-mail" },
    { value: "DAYS_WITHOUT_WHATSAPP", label: "X dias sem WhatsApp" },
    { value: "DAYS_IN_STAGE", label: "X dias no estágio" },
    { value: "BIRTHDAY", label: "Aniversário do parceiro" },
  ];

  const actionTypes = [
    { value: "NOTIFY", label: "Notificar equipe" },
    { value: "SEND_EMAIL", label: "Enviar e-mail" },
    { value: "SEND_WHATSAPP", label: "Enviar WhatsApp" },
    { value: "CREATE_TASK", label: "Criar tarefa" },
    { value: "MOVE_STAGE", label: "Mover de etapa" },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/partner-funnels/${funnelId}/automations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          triggerType,
          triggerConfig: { days: parseInt(triggerDays) },
          actionType,
          actionConfig: {},
        }),
      });
      if (res.ok) {
        onSave();
      }
    } catch (error) {
      console.error("Erro ao criar automação:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl z-50"
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
            <RiRobot2Line className="w-5 h-5 text-purple-500" />
            Nova Automação
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Nome da Automação</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Alerta 7 dias sem contato"
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Gatilho</label>
              <select
                value={triggerType}
                onChange={(e) => setTriggerType(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                {triggerTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            {triggerType !== "BIRTHDAY" && (
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Dias</label>
                <input
                  type="number"
                  value={triggerDays}
                  onChange={(e) => setTriggerDays(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Ação</label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                {actionTypes.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!name || saving}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-500 hover:bg-purple-600 rounded-lg disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Criar Automação"}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
