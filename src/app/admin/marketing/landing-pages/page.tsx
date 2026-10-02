"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiPagesLine,
  RiAddLine,
  RiEyeLine,
  RiEditLine,
  RiDeleteBinLine,
  RiFileCopyLine,
  RiMoreLine,
  RiCloseLine,
  RiArrowUpSLine,
  RiArrowDownSLine,
  RiExternalLinkLine,
  RiLineChartLine,
  RiUserLine,
  RiPercentLine,
  RiCheckLine,
  RiDraftLine,
  RiSettings4Line,
  RiCodeSSlashLine,
  RiSmartphoneLine,
  RiComputerLine,
  RiPaletteLine,
  RiLayoutLine,
  RiShareLine,
  RiQrCodeLine,
} from "react-icons/ri";

// ==================== TIPOS ====================
interface LandingPage {
  id: string;
  nome: string;
  slug: string;
  tipo: "imovel" | "empreendimento" | "captacao" | "institucional";
  status: "publicada" | "rascunho" | "arquivada";
  template: string;
  thumbnail?: string;
  visitas: number;
  conversoes: number;
  taxaConversao: number;
  criadaEm: string;
  atualizadaEm: string;
  imovelId?: string;
}

interface TemplateLP {
  id: string;
  nome: string;
  categoria: string;
  thumbnail: string;
  usado: number;
  popular: boolean;
}

// ==================== DADOS MOCK ====================
const landingPages: LandingPage[] = [
  { id: "1", nome: "Lançamento Jardins Premium", slug: "jardins-premium", tipo: "empreendimento", status: "publicada", template: "Lançamento Moderno", visitas: 4560, conversoes: 234, taxaConversao: 5.1, criadaEm: "2024-01-10", atualizadaEm: "2024-01-24" },
  { id: "2", nome: "Cobertura Duplex Moema", slug: "cobertura-moema", tipo: "imovel", status: "publicada", template: "Imóvel Premium", visitas: 1890, conversoes: 89, taxaConversao: 4.7, criadaEm: "2024-01-15", atualizadaEm: "2024-01-23", imovelId: "COB012" },
  { id: "3", nome: "Captação de Leads", slug: "quero-comprar", tipo: "captacao", status: "publicada", template: "Formulário Simples", visitas: 8920, conversoes: 567, taxaConversao: 6.4, criadaEm: "2024-01-01", atualizadaEm: "2024-01-25" },
  { id: "4", nome: "Apartamentos Zona Sul", slug: "zona-sul", tipo: "empreendimento", status: "publicada", template: "Galeria Imóveis", visitas: 3450, conversoes: 156, taxaConversao: 4.5, criadaEm: "2024-01-08", atualizadaEm: "2024-01-22" },
  { id: "5", nome: "Casa Sua Cidade", slug: "casa-sua-cidade", tipo: "imovel", status: "rascunho", template: "Imóvel Premium", visitas: 0, conversoes: 0, taxaConversao: 0, criadaEm: "2024-01-20", atualizadaEm: "2024-01-20", imovelId: "CAS045" },
  { id: "6", nome: "Sobre a Tappy Imob", slug: "sobre", tipo: "institucional", status: "publicada", template: "Institucional", visitas: 2340, conversoes: 45, taxaConversao: 1.9, criadaEm: "2023-12-01", atualizadaEm: "2024-01-15" },
];

const templatesLP: TemplateLP[] = [
  { id: "1", nome: "Lançamento Moderno", categoria: "Empreendimento", thumbnail: "🏗️", usado: 12, popular: true },
  { id: "2", nome: "Imóvel Premium", categoria: "Imóvel", thumbnail: "🏠", usado: 45, popular: true },
  { id: "3", nome: "Formulário Simples", categoria: "Captação", thumbnail: "📝", usado: 23, popular: false },
  { id: "4", nome: "Galeria Imóveis", categoria: "Empreendimento", thumbnail: "🖼️", usado: 18, popular: true },
  { id: "5", nome: "Institucional", categoria: "Institucional", thumbnail: "🏢", usado: 5, popular: false },
  { id: "6", nome: "Tour Virtual", categoria: "Imóvel", thumbnail: "🎥", usado: 8, popular: false },
];

// ==================== CONFIGURAÇÕES ====================
const tipoConfig = {
  imovel: { label: "Imóvel", cor: "bg-blue-500", lightBg: "bg-blue-100 dark:bg-blue-500/20", text: "text-blue-600" },
  empreendimento: { label: "Empreendimento", cor: "bg-purple-500", lightBg: "bg-purple-100 dark:bg-purple-500/20", text: "text-purple-600" },
  captacao: { label: "Captação", cor: "bg-green-500", lightBg: "bg-green-100 dark:bg-green-500/20", text: "text-green-600" },
  institucional: { label: "Institucional", cor: "bg-amber-500", lightBg: "bg-amber-100 dark:bg-amber-500/20", text: "text-amber-600" },
};

const statusConfig = {
  publicada: { label: "Publicada", icon: RiCheckLine, cor: "text-green-600", bg: "bg-green-100 dark:bg-green-500/20" },
  rascunho: { label: "Rascunho", icon: RiDraftLine, cor: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-500/20" },
  arquivada: { label: "Arquivada", icon: RiCloseLine, cor: "text-neutral-600", bg: "bg-neutral-100 dark:bg-neutral-500/20" },
};

// ==================== COMPONENTES ====================

// Stat Card
function StatCard({ label, value, icon: Icon, cor, trend }: { label: string; value: string; icon: React.ElementType; cor: string; trend?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`w-10 h-10 rounded-xl ${cor} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center text-xs font-medium ${trend >= 0 ? "text-green-500" : "text-red-500"}`}>
            {trend >= 0 ? <RiArrowUpSLine className="w-4 h-4" /> : <RiArrowDownSLine className="w-4 h-4" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-neutral-900 dark:text-white">{value}</p>
      <p className="text-sm text-neutral-500">{label}</p>
    </motion.div>
  );
}

// Landing Page Card
function LPCard({ lp, onClick }: { lp: LandingPage; onClick: () => void }) {
  const tipo = tipoConfig[lp.tipo];
  const status = statusConfig[lp.status];
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
    >
      {/* Preview */}
      <div className={`h-32 ${tipo.cor} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-28 bg-white/20 rounded-lg backdrop-blur-sm flex items-center justify-center">
            <RiPagesLine className="w-12 h-12 text-white/50" />
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-white/90 dark:bg-neutral-900/90 ${status.cor}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {status.label}
          </span>
        </div>

        {/* Preview Button on Hover */}
        {lp.status === "publicada" && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <a
              href={`https://tappyimob.com.br/${lp.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="p-3 bg-white rounded-xl text-neutral-700 hover:bg-neutral-100"
            >
              <RiExternalLinkLine className="w-5 h-5" />
            </a>
            <button className="p-3 bg-white rounded-xl text-neutral-700 hover:bg-neutral-100" onClick={e => e.stopPropagation()}>
              <RiEyeLine className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tipo.lightBg} ${tipo.text}`}>
            {tipo.label}
          </span>
        </div>
        
        <h3 className="font-bold text-neutral-900 dark:text-white mb-1">{lp.nome}</h3>
        <p className="text-sm text-neutral-500 mb-3">/{lp.slug}</p>

        {/* Métricas */}
        {lp.status === "publicada" && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <p className="text-lg font-bold text-neutral-900 dark:text-white">{(lp.visitas / 1000).toFixed(1)}K</p>
              <p className="text-[10px] text-neutral-500">Visitas</p>
            </div>
            <div className="text-center p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <p className="text-lg font-bold text-green-600">{lp.conversoes}</p>
              <p className="text-[10px] text-neutral-500">Leads</p>
            </div>
            <div className="text-center p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <p className="text-lg font-bold text-purple-600">{lp.taxaConversao}%</p>
              <p className="text-[10px] text-neutral-500">Taxa</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-neutral-500">
          <span>Atualizada {new Date(lp.atualizadaEm).toLocaleDateString("pt-BR")}</span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-blue-600" onClick={e => e.stopPropagation()}>
              <RiEditLine className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-green-600" onClick={e => e.stopPropagation()}>
              <RiFileCopyLine className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400" onClick={e => e.stopPropagation()}>
              <RiMoreLine className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Template Card
function TemplateCard({ template }: { template: TemplateLP }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors relative"
    >
      {template.popular && (
        <span className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-medium rounded-full">
          Popular
        </span>
      )}
      <div className="text-4xl mb-3">{template.thumbnail}</div>
      <h4 className="font-medium text-neutral-900 dark:text-white">{template.nome}</h4>
      <p className="text-sm text-neutral-500">{template.categoria}</p>
      <p className="text-xs text-neutral-400 mt-2">Usado {template.usado}x</p>
    </motion.div>
  );
}

// Modal de Detalhes
function LPModal({ lp, onClose }: { lp: LandingPage; onClose: () => void }) {
  const tipo = tipoConfig[lp.tipo];
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

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
        className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-3xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`${tipo.cor} p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">{tipo.label}</p>
              <h2 className="text-xl font-bold text-white">{lp.nome}</h2>
              <p className="text-white/80">tappyimob.com.br/{lp.slug}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/20 text-white">
              <RiCloseLine className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Device Toggle */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <button
              onClick={() => setDevice("desktop")}
              className={`p-2 rounded-lg ${device === "desktop" ? "bg-neutral-200 dark:bg-neutral-700" : ""}`}
            >
              <RiComputerLine className="w-5 h-5" />
            </button>
            <button
              onClick={() => setDevice("mobile")}
              className={`p-2 rounded-lg ${device === "mobile" ? "bg-neutral-200 dark:bg-neutral-700" : ""}`}
            >
              <RiSmartphoneLine className="w-5 h-5" />
            </button>
          </div>

          {/* Preview */}
          <div className={`mx-auto bg-neutral-100 dark:bg-neutral-800 rounded-xl overflow-hidden transition-all ${
            device === "desktop" ? "w-full h-64" : "w-48 h-80"
          }`}>
            <div className="w-full h-full flex items-center justify-center text-neutral-400">
              <RiPagesLine className="w-16 h-16" />
            </div>
          </div>

          {/* Métricas */}
          {lp.status === "publicada" && (
            <div className="grid grid-cols-4 gap-4 mt-6">
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-center">
                <RiEyeLine className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <p className="text-xl font-bold text-neutral-900 dark:text-white">{lp.visitas.toLocaleString()}</p>
                <p className="text-xs text-neutral-500">Visitas</p>
              </div>
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-center">
                <RiUserLine className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <p className="text-xl font-bold text-neutral-900 dark:text-white">{lp.conversoes}</p>
                <p className="text-xs text-neutral-500">Conversões</p>
              </div>
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-center">
                <RiPercentLine className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                <p className="text-xl font-bold text-neutral-900 dark:text-white">{lp.taxaConversao}%</p>
                <p className="text-xs text-neutral-500">Taxa</p>
              </div>
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-center">
                <RiLineChartLine className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <p className="text-xl font-bold text-neutral-900 dark:text-white">{Math.round(lp.visitas / 30)}</p>
                <p className="text-xs text-neutral-500">Visitas/dia</p>
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex items-center gap-3 mt-6">
            <button className="flex-1 h-11 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium hover:opacity-90 flex items-center justify-center gap-2">
              <RiEditLine className="w-5 h-5" />
              Editar Página
            </button>
            <button className="h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center gap-2">
              <RiShareLine className="w-5 h-5" />
              Compartilhar
            </button>
            <button className="h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800">
              <RiQrCodeLine className="w-5 h-5" />
            </button>
            <button className="h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800">
              <RiSettings4Line className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ==================== PÁGINA PRINCIPAL ====================
export default function LandingPagesPage() {
  const [tipoFilter, setTipoFilter] = useState<string>("all");
  const [selectedLP, setSelectedLP] = useState<LandingPage | null>(null);

  const filteredLPs = landingPages.filter(lp => tipoFilter === "all" || lp.tipo === tipoFilter);

  const totalVisitas = landingPages.reduce((acc, lp) => acc + lp.visitas, 0);
  const totalConversoes = landingPages.reduce((acc, lp) => acc + lp.conversoes, 0);
  const taxaMedia = totalVisitas > 0 ? ((totalConversoes / totalVisitas) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <RiPagesLine className="w-5 h-5 text-white" />
            </div>
            Landing Pages
          </h1>
          <p className="text-neutral-500 mt-1">Crie páginas de alta conversão</p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 h-10 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800">
            <RiLayoutLine className="w-4 h-4" />
            Templates
          </button>
          <button className="flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium hover:opacity-90">
            <RiAddLine className="w-4 h-4" />
            Nova Página
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Páginas Ativas" value={String(landingPages.filter(lp => lp.status === "publicada").length)} icon={RiPagesLine} cor="bg-indigo-500" />
        <StatCard label="Visitas Totais" value={`${(totalVisitas / 1000).toFixed(1)}K`} icon={RiEyeLine} cor="bg-blue-500" trend={23} />
        <StatCard label="Leads Gerados" value={String(totalConversoes)} icon={RiUserLine} cor="bg-green-500" trend={15} />
        <StatCard label="Taxa Média" value={`${taxaMedia}%`} icon={RiPercentLine} cor="bg-purple-500" trend={8} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-2">
            {["all", "empreendimento", "imovel", "captacao", "institucional"].map(t => (
              <button
                key={t}
                onClick={() => setTipoFilter(t)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  tipoFilter === t ? "bg-indigo-500 text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                }`}
              >
                {t === "all" ? "Todas" : tipoConfig[t as keyof typeof tipoConfig].label}
              </button>
            ))}
          </div>

          {/* LPs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLPs.map((lp, index) => (
              <motion.div key={lp.id} transition={{ delay: index * 0.05 }}>
                <LPCard lp={lp} onClick={() => setSelectedLP(lp)} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Templates Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 h-fit"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-neutral-900 dark:text-white">Templates</h3>
            <button className="text-sm text-indigo-500 hover:underline">Ver todos</button>
          </div>
          <div className="space-y-3">
            {templatesLP.map(template => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedLP && (
          <LPModal lp={selectedLP} onClose={() => setSelectedLP(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
