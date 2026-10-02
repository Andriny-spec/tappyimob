"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  RiUserStarLine,
  RiArrowLeftLine,
  RiSearchLine,
  RiFilterLine,
  RiSparklingLine,
  RiCheckLine,
  RiCloseLine,
  RiPhoneLine,
  RiMailLine,
  RiWhatsappLine,
  RiHome4Line,
  RiMoneyDollarCircleLine,
  RiTimeLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiLoader4Line,
  RiRefreshLine,
  RiThumbUpLine,
  RiThumbDownLine,
} from "react-icons/ri";

// Mock leads to qualify
const leadsToQualify = [
  {
    id: "1",
    name: "Roberto Mendes",
    email: "roberto@email.com",
    phone: "(11) 99888-7777",
    message: "Procuro apartamento de 3 quartos no Morumbi, orçamento de até 800k. Tenho aprovação de financiamento.",
    source: "Site",
    createdAt: "2024-12-01T10:00:00Z",
    score: 85,
    property: {
      id: "1",
      code: "IMB00001",
      title: "Apartamento 3 quartos",
      price: 750000,
    },
    signals: [
      { type: "positive", text: "Financiamento aprovado" },
      { type: "positive", text: "Orçamento compatível" },
      { type: "positive", text: "Especificou região" },
    ],
  },
  {
    id: "2",
    name: "Claudia Ferreira",
    email: "claudia@email.com",
    phone: "(11) 97666-5555",
    message: "Olhando opções de casas em condomínio. Ainda estou no início da pesquisa.",
    source: "WhatsApp",
    createdAt: "2024-12-01T14:00:00Z",
    score: 45,
    property: null,
    signals: [
      { type: "negative", text: "Início de pesquisa" },
      { type: "neutral", text: "Sem orçamento definido" },
    ],
  },
  {
    id: "3",
    name: "Marcos Almeida",
    email: "marcos@empresa.com",
    phone: "(11) 98555-4444",
    message: "Investidor, procuro imóveis com rentabilidade acima de 6% ao ano. Orçamento de 1.5M a 2M.",
    source: "Indicação",
    createdAt: "2024-12-01T16:00:00Z",
    score: 92,
    property: null,
    signals: [
      { type: "positive", text: "Investidor" },
      { type: "positive", text: "Orçamento alto definido" },
      { type: "positive", text: "Critérios claros" },
    ],
  },
  {
    id: "4",
    name: "Patricia Lima",
    email: "patricia@email.com",
    phone: "(11) 96444-3333",
    message: "Vi um anúncio no Instagram. Poderia me passar mais informações?",
    source: "Redes Sociais",
    createdAt: "2024-12-02T09:00:00Z",
    score: 35,
    property: {
      id: "2",
      code: "IMB00002",
      title: "Cobertura Duplex",
      price: 1800000,
    },
    signals: [
      { type: "negative", text: "Mensagem genérica" },
      { type: "neutral", text: "Sem urgência definida" },
    ],
  },
];

const qualificationCriteria = [
  { id: "budget", label: "Orçamento definido", weight: 25 },
  { id: "financing", label: "Financiamento aprovado", weight: 20 },
  { id: "timeline", label: "Prazo definido", weight: 20 },
  { id: "decision", label: "Decisor único", weight: 15 },
  { id: "specifics", label: "Requisitos claros", weight: 20 },
];

export default function QualificacaoPage() {
  const [leads, setLeads] = useState(leadsToQualify);
  const [selectedLead, setSelectedLead] = useState<typeof leadsToQualify[0] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [criteria, setCriteria] = useState<Record<string, boolean>>({});

  const handleQualify = async (leadId: string) => {
    setIsAnalyzing(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
    setSelectedLead(null);
    setIsAnalyzing(false);
    setCriteria({});
  };

  const handleDiscard = (leadId: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
    setSelectedLead(null);
    setCriteria({});
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500 bg-green-500/10";
    if (score >= 60) return "text-amber-500 bg-amber-500/10";
    if (score >= 40) return "text-orange-500 bg-orange-500/10";
    return "text-red-500 bg-red-500/10";
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      notation: "compact",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const calculateScore = () => {
    return qualificationCriteria.reduce((acc, c) => {
      return acc + (criteria[c.id] ? c.weight : 0);
    }, 0);
  };

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
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                <RiUserStarLine className="w-5 h-5 text-purple-500" />
              </div>
              Qualificação de Leads
            </h1>
            <p className="text-neutral-500 mt-1">
              Qualifique leads usando IA e critérios BANT
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-500 text-sm font-medium">
            {leads.length} leads pendentes
          </span>
          <button className="flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:opacity-90 transition-opacity">
            <RiSparklingLine className="w-4 h-4" />
            Qualificar com IA
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Pendentes", value: leads.length, color: "amber" },
          { label: "Alta probabilidade", value: leads.filter((l) => l.score >= 80).length, color: "green" },
          { label: "Média probabilidade", value: leads.filter((l) => l.score >= 50 && l.score < 80).length, color: "blue" },
          { label: "Baixa probabilidade", value: leads.filter((l) => l.score < 50).length, color: "red" },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800`}
          >
            <p className={`text-3xl font-bold text-${stat.color}-500`}>{stat.value}</p>
            <p className="text-sm text-neutral-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads List */}
        <div className="space-y-4">
          <h2 className="font-semibold text-neutral-900 dark:text-white">
            Leads para Qualificar
          </h2>

          {leads.length === 0 ? (
            <div className="p-8 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-center">
              <RiCheckLine className="w-12 h-12 mx-auto text-green-500 mb-4" />
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                Todos os leads qualificados!
              </h3>
              <p className="text-neutral-500">
                Não há leads pendentes de qualificação
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {leads.map((lead) => (
                <motion.div
                  key={lead.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  onClick={() => setSelectedLead(lead)}
                  className={`p-4 bg-white dark:bg-neutral-900 rounded-2xl border transition-all cursor-pointer ${
                    selectedLead?.id === lead.id
                      ? "border-purple-500 ring-2 ring-purple-500/20"
                      : "border-neutral-200 dark:border-neutral-800 hover:border-purple-300 dark:hover:border-purple-500/50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {lead.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900 dark:text-white">
                          {lead.name}
                        </h3>
                        <p className="text-sm text-neutral-500">{lead.source}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(lead.score)}`}>
                      {lead.score}%
                    </div>
                  </div>

                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-2">
                    "{lead.message}"
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {lead.signals.map((signal, i) => (
                      <span
                        key={i}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          signal.type === "positive"
                            ? "bg-green-500/10 text-green-500"
                            : signal.type === "negative"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                        }`}
                      >
                        {signal.type === "positive" ? (
                          <RiThumbUpLine className="w-3 h-3" />
                        ) : signal.type === "negative" ? (
                          <RiThumbDownLine className="w-3 h-3" />
                        ) : null}
                        {signal.text}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Qualification Panel */}
        <div className="lg:sticky lg:top-4 h-fit">
          <AnimatePresence mode="wait">
            {selectedLead ? (
              <motion.div
                key={selectedLead.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-semibold text-neutral-900 dark:text-white">
                    Qualificar Lead
                  </h2>
                  <button
                    onClick={() => setSelectedLead(null)}
                    className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                  >
                    <RiCloseLine className="w-5 h-5" />
                  </button>
                </div>

                {/* Lead Details */}
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      {selectedLead.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-white">
                        {selectedLead.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <RiTimeLine className="w-4 h-4" />
                        {formatDate(selectedLead.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <a
                      href={`tel:${selectedLead.phone}`}
                      className="flex items-center gap-1 text-neutral-500 hover:text-neutral-700"
                    >
                      <RiPhoneLine className="w-4 h-4" />
                      {selectedLead.phone}
                    </a>
                    <a
                      href={`https://wa.me/${selectedLead.phone.replace(/\D/g, "")}`}
                      className="text-green-500 hover:text-green-600"
                    >
                      <RiWhatsappLine className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Property Interest */}
                {selectedLead.property && (
                  <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-500/10 rounded-xl mb-6">
                    <RiHome4Line className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">
                        {selectedLead.property.code}
                      </p>
                      <p className="text-sm text-orange-500 font-semibold">
                        {formatPrice(selectedLead.property.price)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Message */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Mensagem
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    "{selectedLead.message}"
                  </p>
                </div>

                {/* Qualification Criteria */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    Critérios de Qualificação (BANT)
                  </h4>
                  <div className="space-y-2">
                    {qualificationCriteria.map((c) => (
                      <label
                        key={c.id}
                        className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={criteria[c.id] || false}
                            onChange={(e) =>
                              setCriteria((prev) => ({
                                ...prev,
                                [c.id]: e.target.checked,
                              }))
                            }
                            className="w-4 h-4 rounded border-neutral-300 text-purple-500 focus:ring-purple-500"
                          />
                          <span className="text-sm text-neutral-700 dark:text-neutral-300">
                            {c.label}
                          </span>
                        </div>
                        <span className="text-xs text-neutral-500">+{c.weight}%</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Score Preview */}
                <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      Score calculado
                    </span>
                    <span className="text-2xl font-bold text-purple-500">
                      {calculateScore()}%
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${calculateScore()}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDiscard(selectedLead.id)}
                    className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl border border-red-200 dark:border-red-500/30 text-red-500 font-medium hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <RiCloseLine className="w-5 h-5" />
                    Descartar
                  </button>
                  <button
                    onClick={() => handleQualify(selectedLead.id)}
                    disabled={isAnalyzing}
                    className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <>
                        <RiLoader4Line className="w-5 h-5 animate-spin" />
                        Qualificando...
                      </>
                    ) : (
                      <>
                        <RiCheckLine className="w-5 h-5" />
                        Qualificar
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-center"
              >
                <RiUserStarLine className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
                <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                  Selecione um Lead
                </h3>
                <p className="text-neutral-500">
                  Clique em um lead para iniciar a qualificação
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
