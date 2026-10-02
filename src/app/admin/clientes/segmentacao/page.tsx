"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  RiFilterLine,
  RiArrowLeftLine,
  RiAddLine,
  RiSearchLine,
  RiEditLine,
  RiDeleteBinLine,
  RiPlayLine,
  RiPauseLine,
  RiUserLine,
  RiMoneyDollarCircleLine,
  RiMapPinLine,
  RiHome4Line,
  RiTimeLine,
  RiSparklingLine,
  RiCheckLine,
  RiCloseLine,
  RiMoreLine,
} from "react-icons/ri";

// Mock segments - Faixas de valor para remarketing
const mockSegments = [
  {
    id: "1",
    name: "Faixa até R$ 300k",
    description: "Leads interessados em imóveis até R$ 300.000",
    color: "#22c55e",
    icon: "money",
    criteria: [
      { field: "budget", operator: "<=", value: 300000 },
    ],
    clientCount: 156,
    active: true,
    automations: ["remarketing_meta", "email_semanal"],
    priceRange: { min: 0, max: 300000 },
  },
  {
    id: "2",
    name: "Faixa R$ 300k - R$ 500k",
    description: "Leads interessados em imóveis de R$ 300.000 a R$ 500.000",
    color: "#3b82f6",
    icon: "money",
    criteria: [
      { field: "budget", operator: ">=", value: 300000 },
      { field: "budget", operator: "<=", value: 500000 },
    ],
    clientCount: 98,
    active: true,
    automations: ["remarketing_meta", "email_semanal"],
    priceRange: { min: 300000, max: 500000 },
  },
  {
    id: "3",
    name: "Faixa R$ 500k - R$ 800k",
    description: "Leads interessados em imóveis de R$ 500.000 a R$ 800.000",
    color: "#8b5cf6",
    icon: "money",
    criteria: [
      { field: "budget", operator: ">=", value: 500000 },
      { field: "budget", operator: "<=", value: 800000 },
    ],
    clientCount: 67,
    active: true,
    automations: ["remarketing_meta"],
    priceRange: { min: 500000, max: 800000 },
  },
  {
    id: "4",
    name: "Faixa R$ 800k - R$ 1.2M",
    description: "Leads interessados em imóveis de R$ 800.000 a R$ 1.200.000",
    color: "#f59e0b",
    icon: "money",
    criteria: [
      { field: "budget", operator: ">=", value: 800000 },
      { field: "budget", operator: "<=", value: 1200000 },
    ],
    clientCount: 34,
    active: true,
    automations: ["remarketing_meta", "atendimento_vip"],
    priceRange: { min: 800000, max: 1200000 },
  },
  {
    id: "5",
    name: "Faixa acima de R$ 1.2M",
    description: "Leads interessados em imóveis acima de R$ 1.200.000",
    color: "#ec4899",
    icon: "money",
    criteria: [
      { field: "budget", operator: ">=", value: 1200000 },
    ],
    clientCount: 23,
    active: true,
    automations: ["remarketing_meta", "atendimento_vip", "corretor_senior"],
    priceRange: { min: 1200000, max: null },
  },
  {
    id: "6",
    name: "Investidores",
    description: "Leads com interesse em investimento imobiliário",
    color: "#6366f1",
    icon: "star",
    criteria: [
      { field: "ticket", operator: "=", value: "INVESTIMENTO" },
    ],
    clientCount: 45,
    active: true,
    automations: ["newsletter_investidor", "alerta_oportunidade"],
  },
  {
    id: "7",
    name: "Locação",
    description: "Leads interessados em locação",
    color: "#14b8a6",
    icon: "home",
    criteria: [
      { field: "ticket", operator: "=", value: "LOCACAO" },
    ],
    clientCount: 89,
    active: true,
    automations: ["remarketing_locacao"],
  },
  {
    id: "8",
    name: "Leads Quentes",
    description: "Leads com temperatura quente - prioridade máxima",
    color: "#ef4444",
    icon: "time",
    criteria: [
      { field: "temperature", operator: "=", value: "QUENTE" },
    ],
    clientCount: 28,
    active: true,
    automations: ["alerta_corretor", "prioridade_atendimento"],
  },
  {
    id: "9",
    name: "Leads Frios - Reengajamento",
    description: "Leads sem interação nos últimos 30 dias",
    color: "#64748b",
    icon: "time",
    criteria: [
      { field: "last_contact", operator: ">", value: 30 },
    ],
    clientCount: 156,
    active: true,
    automations: ["campanha_reengajamento"],
  },
];

const criteriaFields = [
  { value: "budget", label: "Orçamento" },
  { value: "ticket", label: "Finalidade (Compra/Locação)" },
  { value: "temperature", label: "Temperatura" },
  { value: "tags", label: "Tags" },
  { value: "source", label: "Origem" },
  { value: "status", label: "Status" },
  { value: "ai_score", label: "Score IA" },
  { value: "last_contact", label: "Dias sem contato" },
  { value: "interest_region", label: "Região de interesse" },
  { value: "property_type", label: "Tipo de imóvel" },
];

const operators = [
  { value: "=", label: "Igual a" },
  { value: "!=", label: "Diferente de" },
  { value: ">", label: "Maior que" },
  { value: ">=", label: "Maior ou igual" },
  { value: "<", label: "Menor que" },
  { value: "<=", label: "Menor ou igual" },
  { value: "contains", label: "Contém" },
];

const iconMap: Record<string, React.ElementType> = {
  money: RiMoneyDollarCircleLine,
  home: RiHome4Line,
  map: RiMapPinLine,
  time: RiTimeLine,
  star: RiSparklingLine,
  user: RiUserLine,
};

export default function SegmentacaoPage() {
  const [segments, setSegments] = useState(mockSegments);
  const [showModal, setShowModal] = useState(false);
  const [editingSegment, setEditingSegment] = useState<typeof mockSegments[0] | null>(null);
  const [search, setSearch] = useState("");

  const toggleSegment = (id: string) => {
    setSegments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  const deleteSegment = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este segmento?")) {
      setSegments((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const filteredSegments = segments.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  );

  const totalClients = segments.reduce((acc, s) => acc + s.clientCount, 0);
  const activeSegments = segments.filter((s) => s.active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/clientes"
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
          >
            <RiArrowLeftLine className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                <RiFilterLine className="w-5 h-5 text-blue-500" />
              </div>
              Segmentação
            </h1>
            <p className="text-neutral-500 mt-1">
              Crie segmentos inteligentes para suas campanhas
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 h-10 px-4 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
        >
          <RiAddLine className="w-4 h-4" />
          Novo Segmento
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <p className="text-3xl font-bold text-neutral-900 dark:text-white">
            {segments.length}
          </p>
          <p className="text-sm text-neutral-500">Total de segmentos</p>
        </div>
        <div className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <p className="text-3xl font-bold text-green-500">{activeSegments}</p>
          <p className="text-sm text-neutral-500">Ativos</p>
        </div>
        <div className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <p className="text-3xl font-bold text-blue-500">{totalClients}</p>
          <p className="text-sm text-neutral-500">Clientes segmentados</p>
        </div>
        <div className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <p className="text-3xl font-bold text-purple-500">
            {segments.reduce((acc, s) => acc + s.automations.length, 0)}
          </p>
          <p className="text-sm text-neutral-500">Automações ativas</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar segmentos..."
          className="w-full h-12 pl-12 pr-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>

      {/* Segments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnimatePresence>
          {filteredSegments.map((segment, i) => {
            const Icon = iconMap[segment.icon] || RiFilterLine;
            return (
              <motion.div
                key={segment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: i * 0.05 }}
                className={`p-5 bg-white dark:bg-neutral-900 rounded-2xl border transition-all ${
                  segment.active
                    ? "border-neutral-200 dark:border-neutral-800"
                    : "border-neutral-200 dark:border-neutral-800 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: segment.color + "20" }}
                    >
                      <Icon className="w-6 h-6" style={{ color: segment.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-white">
                        {segment.name}
                      </h3>
                      <p className="text-sm text-neutral-500">
                        {segment.clientCount} clientes
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSegment(segment.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        segment.active
                          ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 hover:text-neutral-600"
                      }`}
                      title={segment.active ? "Pausar" : "Ativar"}
                    >
                      {segment.active ? (
                        <RiPauseLine className="w-4 h-4" />
                      ) : (
                        <RiPlayLine className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setEditingSegment(segment);
                        setShowModal(true);
                      }}
                      className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                    >
                      <RiEditLine className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteSegment(segment.id)}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-neutral-500 hover:text-red-500"
                    >
                      <RiDeleteBinLine className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  {segment.description}
                </p>

                {/* Criteria Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {segment.criteria.map((c, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-600 dark:text-neutral-400"
                    >
                      {criteriaFields.find((f) => f.value === c.field)?.label}{" "}
                      {operators.find((o) => o.value === c.operator)?.label}{" "}
                      {typeof c.value === "number"
                        ? c.value.toLocaleString("pt-BR")
                        : c.value}
                    </span>
                  ))}
                </div>

                {/* Automations */}
                {segment.automations.length > 0 && (
                  <div className="flex items-center gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                    <RiSparklingLine className="w-4 h-4 text-purple-500" />
                    <span className="text-xs text-neutral-500">
                      {segment.automations.length} automação(ões) ativa(s)
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* AI Suggestion */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <RiSparklingLine className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
              Sugestão da IA
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
              Baseado nos dados dos seus leads, a IA identificou um novo segmento potencial:
              <strong className="text-neutral-900 dark:text-white"> "Compradores de Alto Ticket Região Sul"</strong> - 
              34 clientes com orçamento acima de R$ 800k interessados em bairros nobres da zona sul.
            </p>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium hover:opacity-90 transition-opacity">
                Criar Segmento
              </button>
              <button className="px-4 py-2 rounded-xl text-purple-500 text-sm font-medium hover:bg-purple-500/10 transition-colors">
                Ignorar
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
