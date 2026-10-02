"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiAddLine,
  RiDeleteBinLine,
  RiEditLine,
  RiSaveLine,
  RiCloseLine,
  RiUserLine,
  RiPriceTagLine,
  RiFlowChart,
  RiTimeLine,
  RiAlertLine,
  RiRefreshLine,
  RiPlayLine,
  RiPauseLine,
  RiSettings4Line,
  RiDragMove2Line,
  RiCheckLine,
  RiLoader4Line,
  RiTeamLine,
  RiShieldUserLine,
  RiRobotLine,
  RiFileCopyLine,
  RiUserSearchLine,
} from "react-icons/ri";

type Tab = "tags" | "filas" | "automacoes" | "duplicados" | "manutencao";

export default function LeadsConfigPage() {
  const [activeTab, setActiveTab] = useState<Tab>("tags");
  const [isLoading, setIsLoading] = useState(false);

  const tabs = [
    { id: "tags" as Tab, label: "Tags", icon: RiPriceTagLine, description: "Gerenciar tags de leads" },
    { id: "filas" as Tab, label: "Filas de Atendimento", icon: RiTeamLine, description: "Configurar rodízio de corretores" },
    { id: "automacoes" as Tab, label: "Automações", icon: RiRobotLine, description: "Regras automáticas de leads" },
    { id: "duplicados" as Tab, label: "Duplicados", icon: RiFileCopyLine, description: "Gerenciar leads duplicados" },
    { id: "manutencao" as Tab, label: "Manutenção", icon: RiSettings4Line, description: "Ferramentas de manutenção" },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/clientes/leads"
          className="p-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          <RiArrowLeftLine className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Configurações de Leads</h1>
          <p className="text-sm text-neutral-500">Tags, filas, automações e duplicados</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 border border-neutral-200 dark:border-neutral-700"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {activeTab === "tags" && <TagsSection />}
          {activeTab === "filas" && <FilasSection />}
          {activeTab === "automacoes" && <AutomacoesSection />}
          {activeTab === "duplicados" && <DuplicadosSection />}
          {activeTab === "manutencao" && <ManutencaoSection />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ============================================
// SEÇÃO: TAGS
// ============================================
function TagsSection() {
  const [tags, setTags] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTag, setEditingTag] = useState<any>(null);
  const [form, setForm] = useState({ name: "", color: "#6B7280", description: "" });

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const res = await fetch("/api/admin/leads/tags");
      if (res.ok) {
        const data = await res.json();
        setTags(data.tags || []);
      }
    } catch (error) {
      console.error("Erro ao buscar tags:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const method = editingTag ? "PUT" : "POST";
      const body = editingTag ? { id: editingTag.id, ...form } : form;

      const res = await fetch("/api/admin/leads/tags", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        fetchTags();
        setShowModal(false);
        setEditingTag(null);
        setForm({ name: "", color: "#6B7280", description: "" });
      }
    } catch (error) {
      console.error("Erro ao salvar tag:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar esta tag?")) return;

    try {
      const res = await fetch(`/api/admin/leads/tags?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchTags();
      }
    } catch (error) {
      console.error("Erro ao deletar tag:", error);
    }
  };

  const colors = [
    "#EF4444", "#25D366", "#F59E0B", "#84CC16", "#22C55E",
    "#14B8A6", "#06B6D4", "#3B82F6", "#6366F1", "#8B5CF6",
    "#A855F7", "#D946EF", "#EC4899", "#F43F5E", "#6B7280",
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RiLoader4Line className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Tags de Leads</h2>
          <p className="text-sm text-neutral-500">Crie tags personalizadas para categorizar seus leads</p>
        </div>
        <button
          onClick={() => {
            setEditingTag(null);
            setForm({ name: "", color: "#6B7280", description: "" });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <RiAddLine className="w-4 h-4" />
          Nova Tag
        </button>
      </div>

      {/* Lista de Tags */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: tag.color }}
              >
                <RiPriceTagLine className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-neutral-900 dark:text-white truncate">{tag.name}</p>
                <p className="text-xs text-neutral-500">{tag.usageCount} leads</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditingTag(tag);
                    setForm({ name: tag.name, color: tag.color, description: tag.description || "" });
                    setShowModal(true);
                  }}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  <RiEditLine className="w-4 h-4 text-neutral-500" />
                </button>
                {!tag.isSystem && (
                  <button
                    onClick={() => handleDelete(tag.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    <RiDeleteBinLine className="w-4 h-4 text-red-500" />
                  </button>
                )}
              </div>
            </div>
            {tag.description && (
              <p className="text-xs text-neutral-500 mt-2 line-clamp-2">{tag.description}</p>
            )}
          </div>
        ))}

        {tags.length === 0 && (
          <div className="col-span-full text-center py-12 text-neutral-500">
            Nenhuma tag criada. Clique em "Nova Tag" para começar.
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">{editingTag ? "Editar Tag" : "Nova Tag"}</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Nome da Tag
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Sem Produto, VIP, Urgente..."
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Cor
                </label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setForm({ ...form, color })}
                      className={`w-8 h-8 rounded-lg transition-transform ${
                        form.color === color ? "ring-2 ring-offset-2 ring-neutral-900 scale-110" : ""
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Descrição (opcional)
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Descrição da tag..."
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 min-h-[80px]"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!form.name}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg disabled:opacity-50"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// SEÇÃO: FILAS DE ATENDIMENTO
// ============================================
function FilasSection() {
  const [queues, setQueues] = useState<any[]>([]);
  const [corretores, setCorretores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQueue, setEditingQueue] = useState<any>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    rotationType: "ROUND_ROBIN",
    responseTimeMinutes: "",
    memberIds: [] as string[],
    delayRules: {
      warningMinutes: "",
      reassignMinutes: "",
      pauseAfterDelays: "",
      notifyManagerMinutes: "",
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [queuesRes, corretoresRes] = await Promise.all([
        fetch("/api/admin/leads/queue"),
        fetch("/api/admin/corretores"),
      ]);

      if (queuesRes.ok) {
        const data = await queuesRes.json();
        setQueues(data.queues || []);
      }

      if (corretoresRes.ok) {
        const data = await corretoresRes.json();
        setCorretores(Array.isArray(data) ? data : data.corretores || data.users || []);
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const method = editingQueue ? "PUT" : "POST";
      const dr = form.delayRules;
      const hasDelayRules = dr.warningMinutes || dr.reassignMinutes || dr.pauseAfterDelays || dr.notifyManagerMinutes;
      const delayRulesPayload = hasDelayRules
        ? {
            ...(dr.warningMinutes ? { warningMinutes: parseInt(dr.warningMinutes) } : {}),
            ...(dr.reassignMinutes ? { reassignMinutes: parseInt(dr.reassignMinutes) } : {}),
            ...(dr.pauseAfterDelays ? { pauseAfterDelays: parseInt(dr.pauseAfterDelays) } : {}),
            ...(dr.notifyManagerMinutes ? { notifyManagerMinutes: parseInt(dr.notifyManagerMinutes) } : {}),
          }
        : null;
      const payload = { ...form, delayRules: delayRulesPayload };
      const body = editingQueue ? { id: editingQueue.id, ...payload } : payload;

      const res = await fetch("/api/admin/leads/queue", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        fetchData();
        setShowModal(false);
        setEditingQueue(null);
        setForm({ name: "", description: "", rotationType: "ROUND_ROBIN", responseTimeMinutes: "", memberIds: [], delayRules: { warningMinutes: "", reassignMinutes: "", pauseAfterDelays: "", notifyManagerMinutes: "" } });
      }
    } catch (error) {
      console.error("Erro ao salvar fila:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar esta fila?")) return;

    try {
      const res = await fetch(`/api/admin/leads/queue?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Erro ao deletar fila:", error);
    }
  };

  const handleToggle = async (queue: any) => {
    try {
      const res = await fetch("/api/admin/leads/queue", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: queue.id, isActive: !queue.isActive }),
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Erro ao alterar status da fila:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RiLoader4Line className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Filas de Atendimento</h2>
          <p className="text-sm text-neutral-500">Configure o rodízio automático de leads entre corretores</p>
        </div>
        <button
          onClick={() => {
            setEditingQueue(null);
            setForm({ name: "", description: "", rotationType: "ROUND_ROBIN", responseTimeMinutes: "", memberIds: [], delayRules: { warningMinutes: "", reassignMinutes: "", pauseAfterDelays: "", notifyManagerMinutes: "" } });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <RiAddLine className="w-4 h-4" />
          Nova Fila
        </button>
      </div>

      {/* Lista de Filas */}
      <div className="space-y-4">
        {queues.map((queue) => (
          <div
            key={queue.id}
            className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                  <RiTeamLine className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white">{queue.name}</h3>
                  <p className="text-xs text-neutral-500">
                    {queue.rotationType === "ROUND_ROBIN" && "Round Robin"}
                    {queue.rotationType === "WEIGHTED" && "Ponderado"}
                    {queue.rotationType === "MANUAL" && "Manual"}
                    {queue.responseTimeMinutes && ` • Timer: ${queue.responseTimeMinutes}min`}
                    {queue.delayRules && " • SLA ativo"}
                    {" • "}
                    {queue.members?.length || 0} corretores
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(queue)}
                  title={queue.isActive ? "Pausar fila" : "Ativar fila"}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    queue.isActive
                      ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-500/30"
                      : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600"
                  }`}
                >
                  {queue.isActive
                    ? <><RiPauseLine className="w-3 h-3" /> Ativa</>
                    : <><RiPlayLine className="w-3 h-3" /> Inativa</>}
                </button>
                <button
                  onClick={() => {
                    setEditingQueue(queue);
                    const dr = queue.delayRules as any;
                    setForm({
                      name: queue.name,
                      description: queue.description || "",
                      rotationType: queue.rotationType,
                      responseTimeMinutes: queue.responseTimeMinutes?.toString() || "",
                      memberIds: queue.members?.map((m: any) => m.userId) || [],
                      delayRules: {
                        warningMinutes: dr?.warningMinutes?.toString() || "",
                        reassignMinutes: dr?.reassignMinutes?.toString() || "",
                        pauseAfterDelays: dr?.pauseAfterDelays?.toString() || "",
                        notifyManagerMinutes: dr?.notifyManagerMinutes?.toString() || "",
                      },
                    });
                    setShowModal(true);
                  }}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  <RiEditLine className="w-4 h-4 text-neutral-500" />
                </button>
                <button
                  onClick={() => handleDelete(queue.id)}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <RiDeleteBinLine className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>

            {/* Membros da fila */}
            {queue.members && queue.members.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-700">
                {queue.members.map((member: any) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-700 rounded-full"
                  >
                    {member.user?.avatar ? (
                      <img src={member.user.avatar} alt="" className="w-5 h-5 rounded-full" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-neutral-300 flex items-center justify-center">
                        <RiUserLine className="w-3 h-3 text-neutral-500" />
                      </div>
                    )}
                    <span className="text-xs font-medium">{member.user?.name}</span>
                    {member.isPaused && (
                      <RiPauseLine className="w-3 h-3 text-amber-500" title="Pausado" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {queues.length === 0 && (
          <div className="text-center py-12 text-neutral-500 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
            Nenhuma fila criada. Clique em "Nova Fila" para começar.
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">{editingQueue ? "Editar Fila" : "Nova Fila"}</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome da Fila</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Fila Principal, Alto Padrão..."
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Rodízio</label>
                <select
                  value={form.rotationType}
                  onChange={(e) => setForm({ ...form, rotationType: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                >
                  <option value="ROUND_ROBIN">Round Robin (alternado)</option>
                  <option value="WEIGHTED">Ponderado (por peso)</option>
                  <option value="MANUAL">Manual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Corretores na Fila</label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-neutral-200 dark:border-neutral-700 rounded-lg p-2">
                  {corretores.map((corretor) => (
                    <label
                      key={corretor.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={form.memberIds.includes(corretor.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setForm({ ...form, memberIds: [...form.memberIds, corretor.id] });
                          } else {
                            setForm({ ...form, memberIds: form.memberIds.filter((id) => id !== corretor.id) });
                          }
                        }}
                        className="w-4 h-4 rounded border-neutral-300"
                      />
                      <span className="text-sm">{corretor.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Timer de Atendimento (minutos)</label>
                <input
                  type="number"
                  value={form.responseTimeMinutes}
                  onChange={(e) => setForm({ ...form, responseTimeMinutes: e.target.value })}
                  placeholder="Deixe vazio para sem limite"
                  min="1"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                />
                <p className="text-xs text-neutral-400 mt-1">Tempo que o corretor tem para aceitar o lead. Vazio = aceite automático.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descrição (opcional)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Descrição da fila..."
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 min-h-[60px]"
                />
              </div>

              {/* Regras de Atraso (SLA) */}
              <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
                <h4 className="text-sm font-semibold mb-1">Regras de Atraso (SLA)</h4>
                <p className="text-xs text-neutral-400 mb-3">Ações automáticas quando o corretor não contata o lead a tempo.</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Aviso após (min)</label>
                    <input
                      type="number"
                      value={form.delayRules.warningMinutes}
                      onChange={(e) => setForm({ ...form, delayRules: { ...form.delayRules, warningMinutes: e.target.value } })}
                      placeholder="Ex: 30"
                      min="1"
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Reatribuir após (min)</label>
                    <input
                      type="number"
                      value={form.delayRules.reassignMinutes}
                      onChange={(e) => setForm({ ...form, delayRules: { ...form.delayRules, reassignMinutes: e.target.value } })}
                      placeholder="Ex: 60"
                      min="1"
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Pausar após N atrasos</label>
                    <input
                      type="number"
                      value={form.delayRules.pauseAfterDelays}
                      onChange={(e) => setForm({ ...form, delayRules: { ...form.delayRules, pauseAfterDelays: e.target.value } })}
                      placeholder="Ex: 3"
                      min="1"
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Notificar gestor (min)</label>
                    <input
                      type="number"
                      value={form.delayRules.notifyManagerMinutes}
                      onChange={(e) => setForm({ ...form, delayRules: { ...form.delayRules, notifyManagerMinutes: e.target.value } })}
                      placeholder="Ex: 45"
                      min="1"
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!form.name}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg disabled:opacity-50"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// SEÇÃO: AUTOMAÇÕES
// ============================================
const TRIGGER_LABELS: Record<string, string> = {
  TIME_IN_STATUS: "Tempo em status",
  NO_CONTACT: "Sem contato",
  VISIT_COMPLETED: "Visita realizada",
  FUNNEL_NO_PROGRESS: "Funil: Sem progresso",
  FUNNEL_NO_VISIT: "Funil: Sem visita",
  FUNNEL_NO_CONTACT: "Funil: Sem contato na etapa",
  FUNNEL_AUTO_PROGRESS: "Funil: Progressão automática",
};
const ACTION_LABELS: Record<string, string> = {
  CHANGE_STATUS: "Mudar status",
  MOVE_COLUMN: "Mover no funil",
  CREATE_FOLLOW_UP: "Criar follow-up",
  SEND_NOTIFICATION: "Notificar corretor",
  BAN_LEAD: "Banir/Negativar",
};
const STATUS_OPTIONS = [
  { value: "NOVO", label: "Novo" },
  { value: "CONTATADO", label: "Contatado" },
  { value: "QUALIFICADO", label: "Qualificado" },
  { value: "NEGOCIANDO", label: "Negociando" },
  { value: "FECHADO", label: "Fechado" },
  { value: "ARQUIVADO", label: "Arquivado" },
];
const EVENT_OPTIONS = [
  { value: "visit_completed", label: "Visita realizada" },
  { value: "visit_scheduled", label: "Visita agendada" },
  { value: "proposal_sent", label: "Proposta enviada" },
  { value: "property_sent", label: "Imóvel enviado" },
  { value: "contact_made", label: "Contato feito" },
];

const defaultForm = {
  name: "",
  description: "",
  triggerType: "FUNNEL_NO_PROGRESS",
  triggerConfig: { fromStatus: "QUALIFICADO", days: 20, requireNoActivity: true } as any,
  actionType: "MOVE_COLUMN",
  actionConfig: { toStatus: "CONTATADO" } as any,
  isActive: true,
};

function AutomacoesSection() {
  const [automations, setAutomations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<any>(null);
  const [form, setForm] = useState({ ...defaultForm });
  const [columns, setColumns] = useState<any[]>([]);

  useEffect(() => {
    fetchAutomations();
    fetchColumns();
  }, []);

  const fetchAutomations = async () => {
    try {
      const res = await fetch("/api/admin/leads/automations");
      if (res.ok) {
        const data = await res.json();
        setAutomations(data.automations || []);
      }
    } catch (error) {
      console.error("Erro ao buscar automações:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchColumns = async () => {
    try {
      const res = await fetch("/api/admin/leads/columns");
      if (res.ok) {
        const data = await res.json();
        setColumns(data.columns || []);
      }
    } catch {}
  };

  const handleSave = async () => {
    try {
      const method = editingAutomation ? "PUT" : "POST";
      const body = editingAutomation ? { id: editingAutomation.id, ...form } : form;

      const res = await fetch("/api/admin/leads/automations", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        fetchAutomations();
        setShowModal(false);
        setEditingAutomation(null);
      }
    } catch (error) {
      console.error("Erro ao salvar automação:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta automação?")) return;
    try {
      await fetch(`/api/admin/leads/automations?id=${id}`, { method: "DELETE" });
      fetchAutomations();
    } catch (error) {
      console.error("Erro ao excluir:", error);
    }
  };

  const handleExecute = async () => {
    if (!confirm("Executar todas as automações agora?")) return;
    try {
      const res = await fetch("/api/admin/leads/automations/execute", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        alert(`Executado! ${data.executed} ações realizadas.`);
        fetchAutomations();
      }
    } catch (error) {
      console.error("Erro ao executar automações:", error);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await fetch("/api/admin/leads/automations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive }),
      });
      fetchAutomations();
    } catch (error) {
      console.error("Erro ao toggle automação:", error);
    }
  };

  const describeTrigger = (a: any) => {
    const tc = a.triggerConfig as any;
    switch (a.triggerType) {
      case "TIME_IN_STATUS": return `${tc?.hours || 48}h em "${tc?.status}"`;
      case "NO_CONTACT": return `Sem contato por ${tc?.hours || 48}h`;
      case "VISIT_COMPLETED": return `Visita realizada (${tc?.hoursAfter || 24}h)`;
      case "FUNNEL_NO_PROGRESS": return `${tc?.days || 20}d sem progresso em "${tc?.fromStatus}"`;
      case "FUNNEL_NO_VISIT": return `${tc?.days || 15}d sem visita em "${tc?.fromStatus}"`;
      case "FUNNEL_NO_CONTACT": return `${tc?.days || 10}d sem contato em "${tc?.fromStatus}"`;
      case "FUNNEL_AUTO_PROGRESS": return `Evento "${tc?.requiredEvent}" em "${tc?.fromStatus}"`;
      default: return a.triggerType;
    }
  };

  const describeAction = (a: any) => {
    const ac = a.actionConfig as any;
    switch (a.actionType) {
      case "CHANGE_STATUS": return `Status → ${ac?.newStatus}`;
      case "MOVE_COLUMN": return `Mover → ${ac?.toStatus}`;
      case "CREATE_FOLLOW_UP": return "Criar follow-up";
      case "SEND_NOTIFICATION": return "Notificar corretor";
      case "BAN_LEAD": return "Banir lead";
      default: return a.actionType;
    }
  };

  const isFunnelTrigger = (t: string) => t.startsWith("FUNNEL_");

  // Prazos de follow-up configuráveis
  const [followUpDays, setFollowUpDays] = useState({ QUENTE: 2, MORNO: 5, FRIO: 15 });
  const [savingFollowUp, setSavingFollowUp] = useState(false);

  useEffect(() => {
    const fetchFollowUpDays = async () => {
      try {
        const res = await fetch("/api/admin/config?key=followup_days");
        if (res.ok) {
          const data = await res.json();
          if (data.value) setFollowUpDays({ QUENTE: data.value.QUENTE ?? 2, MORNO: data.value.MORNO ?? 5, FRIO: data.value.FRIO ?? 15 });
        }
      } catch {}
    };
    fetchFollowUpDays();
  }, []);

  const handleSaveFollowUpDays = async () => {
    setSavingFollowUp(true);
    try {
      await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "followup_days", value: followUpDays }),
      });
    } catch (error) {
      console.error("Erro ao salvar prazos:", error);
    } finally {
      setSavingFollowUp(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RiLoader4Line className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Prazos de Follow-up */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-5">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">Prazos de Follow-up</h2>
        <p className="text-sm text-neutral-500 mb-4">Define quantos dias sem contato consideram o lead como &quot;Atrasado&quot; por temperatura</p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { key: "QUENTE" as const, label: "🔥 Quente", color: "border-red-300 focus:ring-red-500" },
            { key: "MORNO" as const, label: "🌡️ Morno", color: "border-amber-300 focus:ring-amber-500" },
            { key: "FRIO" as const, label: "❄️ Frio", color: "border-blue-300 focus:ring-blue-500" },
          ].map((t) => (
            <div key={t.key}>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 block">{t.label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={followUpDays[t.key]}
                  onChange={(e) => setFollowUpDays({ ...followUpDays, [t.key]: parseInt(e.target.value) || 1 })}
                  className={`w-20 px-3 py-2 rounded-lg border ${t.color} bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white text-center font-semibold focus:outline-none focus:ring-2`}
                />
                <span className="text-sm text-neutral-500">dias</span>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={handleSaveFollowUpDays}
          disabled={savingFollowUp}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 text-sm font-medium"
        >
          <RiSaveLine className="w-4 h-4" />
          {savingFollowUp ? "Salvando..." : "Salvar Prazos"}
        </button>
      </div>

      {/* Header Automações */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Automações de Funil</h2>
          <p className="text-sm text-neutral-500">Regras automáticas de progressão e regressão no funil de vendas</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExecute}
            className="flex items-center gap-2 px-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700"
          >
            <RiPlayLine className="w-4 h-4" />
            Executar Agora
          </button>
          <button
            onClick={() => {
              setEditingAutomation(null);
              setForm({ ...defaultForm });
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            <RiAddLine className="w-4 h-4" />
            Nova Automação
          </button>
        </div>
      </div>

      {/* Lista de Automações */}
      <div className="space-y-3">
        {automations.map((automation) => (
          <div
            key={automation.id}
            className={`bg-white dark:bg-neutral-800 rounded-xl border p-4 ${
              automation.isActive
                ? "border-neutral-200 dark:border-neutral-700"
                : "border-neutral-100 dark:border-neutral-800 opacity-60"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isFunnelTrigger(automation.triggerType)
                    ? automation.isActive ? "bg-purple-100 dark:bg-purple-500/20" : "bg-neutral-100 dark:bg-neutral-700"
                    : automation.isActive ? "bg-green-100 dark:bg-green-500/20" : "bg-neutral-100 dark:bg-neutral-700"
                }`}>
                  {isFunnelTrigger(automation.triggerType) ? (
                    <RiFlowChart className={`w-5 h-5 ${automation.isActive ? "text-purple-600" : "text-neutral-500"}`} />
                  ) : (
                    <RiRobotLine className={`w-5 h-5 ${automation.isActive ? "text-green-600" : "text-neutral-500"}`} />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white">{automation.name}</h3>
                  <p className="text-xs text-neutral-500">
                    {describeTrigger(automation)} {" → "} {describeAction(automation)}
                  </p>
                  {automation.description && (
                    <p className="text-xs text-neutral-400 mt-0.5">{automation.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500">
                  {automation.executionCount} execuções
                </span>
                <button
                  onClick={() => handleToggle(automation.id, !automation.isActive)}
                  className={`p-2 rounded-lg ${
                    automation.isActive
                      ? "text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10"
                      : "text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  }`}
                  title={automation.isActive ? "Desativar" : "Ativar"}
                >
                  {automation.isActive ? <RiPlayLine className="w-4 h-4" /> : <RiPauseLine className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    setEditingAutomation(automation);
                    setForm({
                      name: automation.name,
                      description: automation.description || "",
                      triggerType: automation.triggerType,
                      triggerConfig: automation.triggerConfig || {},
                      actionType: automation.actionType,
                      actionConfig: automation.actionConfig || {},
                      isActive: automation.isActive,
                    });
                    setShowModal(true);
                  }}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  <RiEditLine className="w-4 h-4 text-neutral-500" />
                </button>
                <button
                  onClick={() => handleDelete(automation.id)}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <RiDeleteBinLine className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {automations.length === 0 && (
          <div className="text-center py-12 text-neutral-500 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <RiRobotLine className="w-10 h-10 mx-auto mb-2 text-neutral-300" />
            Nenhuma automação criada. Clique em "Nova Automação" para começar.
          </div>
        )}
      </div>

      {/* Modal de criação/edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingAutomation ? "Editar Automação" : "Nova Automação"}
            </h3>
            
            <div className="space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Regredir leads sem visita há 20 dias"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium mb-1">Descrição (opcional)</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Descrição curta da automação"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                />
              </div>

              {/* Trigger */}
              <div className="border-t pt-4 border-neutral-200 dark:border-neutral-700">
                <label className="block text-sm font-semibold mb-2">Quando (Trigger)</label>
                <select
                  value={form.triggerType}
                  onChange={(e) => {
                    const t = e.target.value;
                    let tc: any = {};
                    if (t === "TIME_IN_STATUS") tc = { status: "NOVO", hours: 48 };
                    else if (t === "NO_CONTACT") tc = { hours: 48 };
                    else if (t === "VISIT_COMPLETED") tc = { hoursAfter: 24 };
                    else if (t === "FUNNEL_NO_PROGRESS") tc = { fromStatus: "QUALIFICADO", days: 20, requireNoActivity: true };
                    else if (t === "FUNNEL_NO_VISIT") tc = { fromStatus: "QUALIFICADO", days: 15 };
                    else if (t === "FUNNEL_NO_CONTACT") tc = { fromStatus: "CONTATADO", days: 10 };
                    else if (t === "FUNNEL_AUTO_PROGRESS") tc = { fromStatus: "CONTATADO", requiredEvent: "visit_completed", withinDays: 7 };
                    setForm({ ...form, triggerType: t, triggerConfig: tc });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                >
                  <optgroup label="Geral">
                    <option value="TIME_IN_STATUS">Tempo em status</option>
                    <option value="NO_CONTACT">Sem contato</option>
                    <option value="VISIT_COMPLETED">Visita realizada</option>
                  </optgroup>
                  <optgroup label="Automação de Funil">
                    <option value="FUNNEL_NO_PROGRESS">Sem progresso (regredir)</option>
                    <option value="FUNNEL_NO_VISIT">Sem visita agendada</option>
                    <option value="FUNNEL_NO_CONTACT">Sem contato na etapa</option>
                    <option value="FUNNEL_AUTO_PROGRESS">Progressão automática</option>
                  </optgroup>
                </select>

                {/* Campos dinâmicos do trigger */}
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {(form.triggerType === "TIME_IN_STATUS") && (
                    <>
                      <div>
                        <label className="block text-xs font-medium mb-1">Status</label>
                        <select
                          value={form.triggerConfig.status || "NOVO"}
                          onChange={(e) => setForm({ ...form, triggerConfig: { ...form.triggerConfig, status: e.target.value } })}
                          className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                        >
                          {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Horas</label>
                        <input type="number" min="1" value={form.triggerConfig.hours || 48}
                          onChange={(e) => setForm({ ...form, triggerConfig: { ...form.triggerConfig, hours: parseInt(e.target.value) || 48 } })}
                          className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                        />
                      </div>
                    </>
                  )}

                  {form.triggerType === "NO_CONTACT" && (
                    <div>
                      <label className="block text-xs font-medium mb-1">Horas sem contato</label>
                      <input type="number" min="1" value={form.triggerConfig.hours || 48}
                        onChange={(e) => setForm({ ...form, triggerConfig: { ...form.triggerConfig, hours: parseInt(e.target.value) || 48 } })}
                        className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                      />
                    </div>
                  )}

                  {form.triggerType === "VISIT_COMPLETED" && (
                    <div>
                      <label className="block text-xs font-medium mb-1">Horas após visita</label>
                      <input type="number" min="1" value={form.triggerConfig.hoursAfter || 24}
                        onChange={(e) => setForm({ ...form, triggerConfig: { ...form.triggerConfig, hoursAfter: parseInt(e.target.value) || 24 } })}
                        className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                      />
                    </div>
                  )}

                  {(form.triggerType === "FUNNEL_NO_PROGRESS" || form.triggerType === "FUNNEL_NO_VISIT" || form.triggerType === "FUNNEL_NO_CONTACT") && (
                    <>
                      <div>
                        <label className="block text-xs font-medium mb-1">Etapa de origem</label>
                        <select
                          value={form.triggerConfig.fromStatus || "QUALIFICADO"}
                          onChange={(e) => setForm({ ...form, triggerConfig: { ...form.triggerConfig, fromStatus: e.target.value } })}
                          className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                        >
                          {columns.length > 0
                            ? columns.map((c) => <option key={c.id} value={c.status}>{c.title}</option>)
                            : STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)
                          }
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Dias</label>
                        <input type="number" min="1" value={form.triggerConfig.days || 20}
                          onChange={(e) => setForm({ ...form, triggerConfig: { ...form.triggerConfig, days: parseInt(e.target.value) || 20 } })}
                          className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                        />
                      </div>
                    </>
                  )}

                  {form.triggerType === "FUNNEL_NO_PROGRESS" && (
                    <div className="col-span-2 flex items-center gap-2">
                      <input type="checkbox" id="reqNoActivity" checked={form.triggerConfig.requireNoActivity || false}
                        onChange={(e) => setForm({ ...form, triggerConfig: { ...form.triggerConfig, requireNoActivity: e.target.checked } })}
                        className="rounded border-neutral-300"
                      />
                      <label htmlFor="reqNoActivity" className="text-xs text-neutral-600 dark:text-neutral-400">
                        Exigir que não haja nenhuma atividade recente (visita, proposta, envio)
                      </label>
                    </div>
                  )}

                  {form.triggerType === "FUNNEL_AUTO_PROGRESS" && (
                    <>
                      <div>
                        <label className="block text-xs font-medium mb-1">Etapa de origem</label>
                        <select
                          value={form.triggerConfig.fromStatus || "CONTATADO"}
                          onChange={(e) => setForm({ ...form, triggerConfig: { ...form.triggerConfig, fromStatus: e.target.value } })}
                          className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                        >
                          {columns.length > 0
                            ? columns.map((c) => <option key={c.id} value={c.status}>{c.title}</option>)
                            : STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)
                          }
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Evento requerido</label>
                        <select
                          value={form.triggerConfig.requiredEvent || "visit_completed"}
                          onChange={(e) => setForm({ ...form, triggerConfig: { ...form.triggerConfig, requiredEvent: e.target.value } })}
                          className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                        >
                          {EVENT_OPTIONS.map((ev) => <option key={ev.value} value={ev.value}>{ev.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Nos últimos X dias</label>
                        <input type="number" min="1" value={form.triggerConfig.withinDays || 7}
                          onChange={(e) => setForm({ ...form, triggerConfig: { ...form.triggerConfig, withinDays: parseInt(e.target.value) || 7 } })}
                          className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="border-t pt-4 border-neutral-200 dark:border-neutral-700">
                <label className="block text-sm font-semibold mb-2">Ação</label>
                <select
                  value={form.actionType}
                  onChange={(e) => {
                    const a = e.target.value;
                    let ac: any = {};
                    if (a === "CHANGE_STATUS") ac = { newStatus: "ARQUIVADO" };
                    else if (a === "MOVE_COLUMN") ac = { toStatus: "CONTATADO" };
                    else if (a === "CREATE_FOLLOW_UP") ac = { delayHours: 24, channel: "WHATSAPP" };
                    else if (a === "SEND_NOTIFICATION") ac = { title: "", message: "" };
                    setForm({ ...form, actionType: a, actionConfig: ac });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                >
                  {Object.entries(ACTION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>

                {/* Campos dinâmicos da ação */}
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {form.actionType === "CHANGE_STATUS" && (
                    <div>
                      <label className="block text-xs font-medium mb-1">Novo status</label>
                      <select
                        value={form.actionConfig.newStatus || "ARQUIVADO"}
                        onChange={(e) => setForm({ ...form, actionConfig: { ...form.actionConfig, newStatus: e.target.value } })}
                        className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                  )}

                  {form.actionType === "MOVE_COLUMN" && (
                    <div className="col-span-2">
                      <label className="block text-xs font-medium mb-1">Mover para coluna</label>
                      <select
                        value={form.actionConfig.toStatus || "CONTATADO"}
                        onChange={(e) => setForm({ ...form, actionConfig: { ...form.actionConfig, toStatus: e.target.value } })}
                        className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                      >
                        {columns.length > 0
                          ? columns.map((c) => <option key={c.id} value={c.status}>{c.title} ({c.funnelStage || c.status})</option>)
                          : STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)
                        }
                      </select>
                    </div>
                  )}

                  {form.actionType === "CREATE_FOLLOW_UP" && (
                    <>
                      <div>
                        <label className="block text-xs font-medium mb-1">Atraso (horas)</label>
                        <input type="number" min="1" value={form.actionConfig.delayHours || 24}
                          onChange={(e) => setForm({ ...form, actionConfig: { ...form.actionConfig, delayHours: parseInt(e.target.value) || 24 } })}
                          className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Canal</label>
                        <select
                          value={form.actionConfig.channel || "WHATSAPP"}
                          onChange={(e) => setForm({ ...form, actionConfig: { ...form.actionConfig, channel: e.target.value } })}
                          className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                        >
                          <option value="WHATSAPP">WhatsApp</option>
                          <option value="EMAIL">E-mail</option>
                          <option value="PHONE">Telefone</option>
                        </select>
                      </div>
                    </>
                  )}

                  {form.actionType === "SEND_NOTIFICATION" && (
                    <>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium mb-1">Mensagem</label>
                        <input type="text" value={form.actionConfig.message || ""}
                          onChange={(e) => setForm({ ...form, actionConfig: { ...form.actionConfig, message: e.target.value } })}
                          placeholder="Lead requer atenção..."
                          className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowModal(false); setEditingAutomation(null); }}
                className="flex-1 px-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!form.name}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg disabled:opacity-50 hover:bg-orange-600"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// SEÇÃO: DUPLICADOS
// ============================================
function DuplicadosSection() {
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    fetchDuplicates();
  }, []);

  const fetchDuplicates = async () => {
    try {
      const res = await fetch("/api/admin/leads/duplicates?status=PENDING");
      if (res.ok) {
        const data = await res.json();
        setDuplicates(data.duplicates || []);
      }
    } catch (error) {
      console.error("Erro ao buscar duplicados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const res = await fetch("/api/admin/leads/duplicates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkAll: true }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(`Scan concluído! ${data.found} duplicados encontrados.`);
        fetchDuplicates();
      }
    } catch (error) {
      console.error("Erro ao escanear:", error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleResolve = async (id: string, status: string, mergeToLeadId?: string) => {
    try {
      await fetch("/api/admin/leads/duplicates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, mergeToLeadId }),
      });
      fetchDuplicates();
    } catch (error) {
      console.error("Erro ao resolver:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RiLoader4Line className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Leads Duplicados</h2>
          <p className="text-sm text-neutral-500">Detecte e resolva leads duplicados entre corretores</p>
        </div>
        <button
          onClick={handleScan}
          disabled={isScanning}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
        >
          {isScanning ? (
            <RiLoader4Line className="w-4 h-4 animate-spin" />
          ) : (
            <RiUserSearchLine className="w-4 h-4" />
          )}
          {isScanning ? "Escaneando..." : "Escanear Duplicados"}
        </button>
      </div>

      {/* Lista de Duplicados */}
      <div className="space-y-3">
        {duplicates.map((dup) => (
          <div
            key={dup.id}
            className="bg-white dark:bg-neutral-800 rounded-xl border border-amber-200 dark:border-amber-500/30 p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <RiAlertLine className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                Possível duplicado ({dup.matchType}) - {dup.matchScore}% confiança
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Lead 1 */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                <p className="font-medium">{dup.lead1?.name}</p>
                <p className="text-sm text-neutral-500">{dup.lead1?.phone}</p>
                <p className="text-sm text-neutral-500">{dup.lead1?.email}</p>
                <p className="text-xs text-neutral-400 mt-1">
                  Corretor: {dup.lead1?.corretor?.name || "Sem corretor"}
                </p>
                <button
                  onClick={() => handleResolve(dup.id, "MERGED", dup.leadId1)}
                  className="mt-2 text-xs text-blue-600 hover:underline"
                >
                  Manter este
                </button>
              </div>

              {/* Lead 2 */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                <p className="font-medium">{dup.lead2?.name}</p>
                <p className="text-sm text-neutral-500">{dup.lead2?.phone}</p>
                <p className="text-sm text-neutral-500">{dup.lead2?.email}</p>
                <p className="text-xs text-neutral-400 mt-1">
                  Corretor: {dup.lead2?.corretor?.name || "Sem corretor"}
                </p>
                <button
                  onClick={() => handleResolve(dup.id, "MERGED", dup.leadId2)}
                  className="mt-2 text-xs text-blue-600 hover:underline"
                >
                  Manter este
                </button>
              </div>
            </div>

            <div className="flex gap-2 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-700">
              <button
                onClick={() => handleResolve(dup.id, "DIFFERENT")}
                className="text-xs text-neutral-500 hover:text-neutral-700"
              >
                São pessoas diferentes
              </button>
              <button
                onClick={() => handleResolve(dup.id, "IGNORED")}
                className="text-xs text-neutral-500 hover:text-neutral-700"
              >
                Ignorar
              </button>
            </div>
          </div>
        ))}

        {duplicates.length === 0 && (
          <div className="text-center py-12 text-neutral-500 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <RiCheckLine className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <p>Nenhum duplicado pendente!</p>
            <p className="text-sm">Clique em "Escanear Duplicados" para verificar novamente.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// SEÇÃO: MANUTENÇÃO
// ============================================
function ManutencaoSection() {
  const [backfillLoading, setBackfillLoading] = useState(false);
  const [backfillResult, setBackfillResult] = useState<string | null>(null);

  const handleBackfillNicknames = async () => {
    if (!confirm("Isso vai gerar apelidos para todos os leads que ainda não têm. Continuar?")) return;
    setBackfillLoading(true);
    setBackfillResult(null);
    try {
      const res = await fetch("/api/admin/leads/backfill-nicknames", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setBackfillResult(data.message || `${data.updated} leads atualizados.`);
      } else {
        setBackfillResult("Erro: " + (data.error || "falha no servidor"));
      }
    } catch {
      setBackfillResult("Erro de conexão.");
    } finally {
      setBackfillLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
        <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">Apelidos Automáticos (Retroativo)</h3>
        <p className="text-sm text-neutral-500 mb-4">
          Gera apelido automático (primeiro nome) para todos os leads que ainda não têm apelido cadastrado.
        </p>
        <button
          onClick={handleBackfillNicknames}
          disabled={backfillLoading}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors text-sm font-medium"
        >
          {backfillLoading ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiUserSearchLine className="w-4 h-4" />}
          {backfillLoading ? "Processando..." : "Gerar Apelidos"}
        </button>
        {backfillResult && (
          <p className="mt-3 text-sm text-green-600 dark:text-green-400">{backfillResult}</p>
        )}
      </div>
    </div>
  );
}
