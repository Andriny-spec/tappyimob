"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  RiMegaphoneLine,
  RiAddLine,
  RiPlayCircleLine,
  RiPauseCircleLine,
  RiStopCircleLine,
  RiEditLine,
  RiDeleteBinLine,
  RiEyeLine,
  RiLineChartLine,
  RiUserLine,
  RiMailLine,
  RiWhatsappLine,
  RiInstagramLine,
  RiFacebookLine,
  RiGoogleLine,
  RiCalendarLine,
  RiMoneyDollarCircleLine,
  RiPercentLine,
  RiArrowUpSLine,
  RiArrowDownSLine,
  RiFilter3Line,
  RiMoreLine,
  RiCloseLine,
  RiCheckLine,
  RiTimeLine,
} from "react-icons/ri";

// ==================== TIPOS ====================
interface Campanha {
  id: string;
  nome: string;
  tipo: "email" | "whatsapp" | "instagram" | "facebook" | "google";
  status: "ativa" | "pausada" | "encerrada" | "rascunho";
  objetivo: string;
  orcamento: number;
  gastos: number;
  alcance: number;
  cliques: number;
  conversoes: number;
  ctr: number;
  cpc: number;
  dataInicio: string;
  dataFim?: string;
}

// ==================== DADOS MOCK ====================
const campanhas: Campanha[] = [
  { id: "1", nome: "Lançamento Jardins Premium", tipo: "instagram", status: "ativa", objetivo: "Gerar leads para novo empreendimento", orcamento: 5000, gastos: 2340, alcance: 45000, cliques: 1250, conversoes: 89, ctr: 2.8, cpc: 1.87, dataInicio: "2024-01-15" },
  { id: "2", nome: "Remarketing Visitantes", tipo: "facebook", status: "ativa", objetivo: "Reconverter visitantes do site", orcamento: 3000, gastos: 1890, alcance: 28000, cliques: 890, conversoes: 45, ctr: 3.2, cpc: 2.12, dataInicio: "2024-01-10" },
  { id: "3", nome: "Newsletter Semanal", tipo: "email", status: "ativa", objetivo: "Engajar base de leads", orcamento: 500, gastos: 120, alcance: 12500, cliques: 2100, conversoes: 156, ctr: 16.8, cpc: 0.06, dataInicio: "2024-01-01" },
  { id: "4", nome: "Promoção Fim de Ano", tipo: "whatsapp", status: "encerrada", objetivo: "Vendas diretas", orcamento: 2000, gastos: 2000, alcance: 8500, cliques: 1800, conversoes: 234, ctr: 21.2, cpc: 1.11, dataInicio: "2023-12-15", dataFim: "2023-12-31" },
  { id: "5", nome: "Google Ads - Moema", tipo: "google", status: "pausada", objetivo: "Captar interessados na região", orcamento: 4000, gastos: 1200, alcance: 15000, cliques: 520, conversoes: 28, ctr: 3.5, cpc: 2.31, dataInicio: "2024-01-05" },
  { id: "6", nome: "Stories Interativos", tipo: "instagram", status: "rascunho", objetivo: "Aumentar engajamento", orcamento: 1500, gastos: 0, alcance: 0, cliques: 0, conversoes: 0, ctr: 0, cpc: 0, dataInicio: "2024-02-01" },
];

// ==================== CONFIGURAÇÕES ====================
const tipoConfig = {
  email: { label: "E-mail", icon: RiMailLine, cor: "text-blue-500", bg: "bg-blue-500", lightBg: "bg-blue-100 dark:bg-blue-500/20" },
  whatsapp: { label: "WhatsApp", icon: RiWhatsappLine, cor: "text-green-500", bg: "bg-green-500", lightBg: "bg-green-100 dark:bg-green-500/20" },
  instagram: { label: "Instagram", icon: RiInstagramLine, cor: "text-pink-500", bg: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500", lightBg: "bg-pink-100 dark:bg-pink-500/20" },
  facebook: { label: "Facebook", icon: RiFacebookLine, cor: "text-blue-600", bg: "bg-blue-600", lightBg: "bg-blue-100 dark:bg-blue-600/20" },
  google: { label: "Google Ads", icon: RiGoogleLine, cor: "text-red-500", bg: "bg-red-500", lightBg: "bg-red-100 dark:bg-red-500/20" },
};

const statusConfig = {
  ativa: { label: "Ativa", cor: "text-green-600", bg: "bg-green-100 dark:bg-green-500/20", icon: RiPlayCircleLine },
  pausada: { label: "Pausada", cor: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-500/20", icon: RiPauseCircleLine },
  encerrada: { label: "Encerrada", cor: "text-neutral-600", bg: "bg-neutral-100 dark:bg-neutral-500/20", icon: RiStopCircleLine },
  rascunho: { label: "Rascunho", cor: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-500/20", icon: RiEditLine },
};

// ==================== COMPONENTES ====================

// Stats Card
function StatCard({ label, value, icon: Icon, cor, variacao }: { label: string; value: string; icon: React.ElementType; cor: string; variacao?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-neutral-500">{label}</span>
        {variacao !== undefined && (
          <span className={`flex items-center text-xs font-medium ${variacao >= 0 ? "text-green-500" : "text-red-500"}`}>
            {variacao >= 0 ? <RiArrowUpSLine className="w-4 h-4" /> : <RiArrowDownSLine className="w-4 h-4" />}
            {Math.abs(variacao)}%
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${cor} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <p className="text-2xl font-bold text-neutral-900 dark:text-white">{value}</p>
      </div>
    </motion.div>
  );
}

// Campanha Card
function CampanhaCard({ campanha, onClick }: { campanha: Campanha; onClick: () => void }) {
  const tipo = tipoConfig[campanha.tipo];
  const status = statusConfig[campanha.status];
  const TipoIcon = tipo.icon;
  const StatusIcon = status.icon;
  const progressoOrcamento = (campanha.gastos / campanha.orcamento) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className={`${tipo.bg} p-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <TipoIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white">{campanha.nome}</h3>
            <p className="text-sm text-white/80">{tipo.label}</p>
          </div>
        </div>
        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {status.label}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-sm text-neutral-500 mb-4 line-clamp-2">{campanha.objetivo}</p>

        {/* Métricas Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
            <p className="text-lg font-bold text-neutral-900 dark:text-white">{(campanha.alcance / 1000).toFixed(1)}K</p>
            <p className="text-xs text-neutral-500">Alcance</p>
          </div>
          <div className="text-center p-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
            <p className="text-lg font-bold text-neutral-900 dark:text-white">{campanha.ctr}%</p>
            <p className="text-xs text-neutral-500">CTR</p>
          </div>
          <div className="text-center p-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
            <p className="text-lg font-bold text-green-600">{campanha.conversoes}</p>
            <p className="text-xs text-neutral-500">Conversões</p>
          </div>
        </div>

        {/* Orçamento Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-neutral-500">Orçamento</span>
            <span className="font-medium text-neutral-900 dark:text-white">
              R$ {campanha.gastos.toLocaleString()} / R$ {campanha.orcamento.toLocaleString()}
            </span>
          </div>
          <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progressoOrcamento, 100)}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full rounded-full ${progressoOrcamento > 90 ? "bg-red-500" : progressoOrcamento > 70 ? "bg-amber-500" : "bg-green-500"}`}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-500 flex items-center gap-1">
            <RiCalendarLine className="w-4 h-4" />
            {new Date(campanha.dataInicio).toLocaleDateString("pt-BR")}
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {campanha.status === "ativa" ? (
              <button className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/20 text-neutral-400 hover:text-amber-600">
                <RiPauseCircleLine className="w-4 h-4" />
              </button>
            ) : campanha.status === "pausada" ? (
              <button className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-500/20 text-neutral-400 hover:text-green-600">
                <RiPlayCircleLine className="w-4 h-4" />
              </button>
            ) : null}
            <button className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 text-neutral-400 hover:text-blue-600">
              <RiEditLine className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400">
              <RiMoreLine className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Modal de Detalhes
function CampanhaModal({ campanha, onClose }: { campanha: Campanha; onClose: () => void }) {
  const tipo = tipoConfig[campanha.tipo];
  const status = statusConfig[campanha.status];
  const TipoIcon = tipo.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`${tipo.bg} p-6 flex items-center justify-between`}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <TipoIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{campanha.nome}</h2>
              <p className="text-white/80">{tipo.label} • {status.label}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/20 text-white">
            <RiCloseLine className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">{campanha.objetivo}</p>

          {/* Métricas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-center">
              <RiEyeLine className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-neutral-900 dark:text-white">{campanha.alcance.toLocaleString()}</p>
              <p className="text-xs text-neutral-500">Alcance</p>
            </div>
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-center">
              <RiLineChartLine className="w-5 h-5 text-green-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-neutral-900 dark:text-white">{campanha.cliques.toLocaleString()}</p>
              <p className="text-xs text-neutral-500">Cliques</p>
            </div>
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-center">
              <RiUserLine className="w-5 h-5 text-purple-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-neutral-900 dark:text-white">{campanha.conversoes}</p>
              <p className="text-xs text-neutral-500">Conversões</p>
            </div>
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-center">
              <RiPercentLine className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-neutral-900 dark:text-white">{campanha.ctr}%</p>
              <p className="text-xs text-neutral-500">CTR</p>
            </div>
          </div>

          {/* Financeiro */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-xl">
              <p className="text-sm text-neutral-500 mb-1">Orçamento Total</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">R$ {campanha.orcamento.toLocaleString()}</p>
            </div>
            <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-xl">
              <p className="text-sm text-neutral-500 mb-1">Gasto Atual</p>
              <p className="text-2xl font-bold text-green-600">R$ {campanha.gastos.toLocaleString()}</p>
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-3">
            {campanha.status === "ativa" && (
              <button className="flex-1 h-11 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 flex items-center justify-center gap-2">
                <RiPauseCircleLine className="w-5 h-5" />
                Pausar Campanha
              </button>
            )}
            {campanha.status === "pausada" && (
              <button className="flex-1 h-11 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 flex items-center justify-center gap-2">
                <RiPlayCircleLine className="w-5 h-5" />
                Retomar Campanha
              </button>
            )}
            <button className="flex-1 h-11 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center justify-center gap-2">
              <RiEditLine className="w-5 h-5" />
              Editar
            </button>
            <button className="h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-red-500 hover:border-red-500">
              <RiDeleteBinLine className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ==================== PÁGINA PRINCIPAL ====================
export default function CampanhasPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tipoFilter, setTipoFilter] = useState<string>("all");
  const [selectedCampanha, setSelectedCampanha] = useState<Campanha | null>(null);

  const filteredCampanhas = campanhas.filter(c => {
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    const matchTipo = tipoFilter === "all" || c.tipo === tipoFilter;
    return matchStatus && matchTipo;
  });

  const totalAlcance = campanhas.reduce((acc, c) => acc + c.alcance, 0);
  const totalConversoes = campanhas.reduce((acc, c) => acc + c.conversoes, 0);
  const totalGastos = campanhas.reduce((acc, c) => acc + c.gastos, 0);
  const campanhasAtivas = campanhas.filter(c => c.status === "ativa").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <RiMegaphoneLine className="w-5 h-5 text-white" />
            </div>
            Campanhas
          </h1>
          <p className="text-neutral-500 mt-1">Gerencie suas campanhas de marketing</p>
        </div>

        <button className="flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium hover:opacity-90">
          <RiAddLine className="w-4 h-4" />
          Nova Campanha
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Campanhas Ativas" value={String(campanhasAtivas)} icon={RiPlayCircleLine} cor="bg-green-500" variacao={15} />
        <StatCard label="Alcance Total" value={`${(totalAlcance / 1000).toFixed(0)}K`} icon={RiEyeLine} cor="bg-blue-500" variacao={23} />
        <StatCard label="Conversões" value={String(totalConversoes)} icon={RiUserLine} cor="bg-purple-500" variacao={8} />
        <StatCard label="Investimento" value={`R$ ${(totalGastos / 1000).toFixed(1)}K`} icon={RiMoneyDollarCircleLine} cor="bg-amber-500" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <RiFilter3Line className="w-4 h-4 text-neutral-400" />
          <span className="text-sm text-neutral-500">Status:</span>
          {["all", "ativa", "pausada", "encerrada", "rascunho"].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === s ? "bg-pink-500 text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
              }`}
            >
              {s === "all" ? "Todos" : statusConfig[s as keyof typeof statusConfig].label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-500">Canal:</span>
          {["all", "instagram", "facebook", "google", "email", "whatsapp"].map(t => (
            <button
              key={t}
              onClick={() => setTipoFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tipoFilter === t ? "bg-pink-500 text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
              }`}
            >
              {t === "all" ? "Todos" : tipoConfig[t as keyof typeof tipoConfig].label}
            </button>
          ))}
        </div>
      </div>

      {/* Campanhas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCampanhas.map((campanha, index) => (
          <motion.div key={campanha.id} transition={{ delay: index * 0.05 }}>
            <CampanhaCard campanha={campanha} onClick={() => setSelectedCampanha(campanha)} />
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedCampanha && (
          <CampanhaModal campanha={selectedCampanha} onClose={() => setSelectedCampanha(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
