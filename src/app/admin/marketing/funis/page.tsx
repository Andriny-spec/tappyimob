"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiFlowChart,
  RiAddLine,
  RiArrowRightLine,
  RiArrowDownLine,
  RiUserAddLine,
  RiMailLine,
  RiPhoneLine,
  RiCalendarCheckLine,
  RiFileTextLine,
  RiCheckDoubleLine,
  RiEditLine,
  RiDeleteBinLine,
  RiMoreLine,
  RiCloseLine,
  RiDragMove2Line,
  RiPlayCircleLine,
  RiPauseCircleLine,
  RiSettings4Line,
  RiLineChartLine,
  RiTimeLine,
  RiPercentLine,
} from "react-icons/ri";

// ==================== TIPOS ====================
interface EtapaFunil {
  id: string;
  nome: string;
  descricao: string;
  tipo: "entrada" | "email" | "whatsapp" | "espera" | "tarefa" | "condicao" | "saida";
  configuracao?: Record<string, string | number | boolean>;
  proximaEtapa?: string;
}

interface Funil {
  id: string;
  nome: string;
  descricao: string;
  tipo: "captacao" | "nutrição" | "vendas" | "pos_venda";
  status: "ativo" | "pausado" | "rascunho";
  etapas: EtapaFunil[];
  leadsAtivos: number;
  conversoes: number;
  taxaConversao: number;
  criadoEm: string;
}

// ==================== DADOS MOCK ====================
const funis: Funil[] = [
  {
    id: "1",
    nome: "Captação de Leads Site",
    descricao: "Funil para novos leads vindos do site",
    tipo: "captacao",
    status: "ativo",
    etapas: [
      { id: "e1", nome: "Novo Lead", descricao: "Lead entra no funil", tipo: "entrada" },
      { id: "e2", nome: "E-mail Boas-vindas", descricao: "Enviar e-mail de boas-vindas", tipo: "email" },
      { id: "e3", nome: "Aguardar 24h", descricao: "Esperar resposta", tipo: "espera" },
      { id: "e4", nome: "WhatsApp Follow-up", descricao: "Enviar mensagem no WhatsApp", tipo: "whatsapp" },
      { id: "e5", nome: "Agendar Ligação", descricao: "Criar tarefa de ligação", tipo: "tarefa" },
      { id: "e6", nome: "Lead Qualificado", descricao: "Saída para vendas", tipo: "saida" },
    ],
    leadsAtivos: 234,
    conversoes: 89,
    taxaConversao: 38,
    criadoEm: "2024-01-01",
  },
  {
    id: "2",
    nome: "Nutrição de Leads",
    descricao: "Engajar leads não prontos para compra",
    tipo: "nutrição",
    status: "ativo",
    etapas: [
      { id: "e1", nome: "Lead Frio", descricao: "Lead entra no funil", tipo: "entrada" },
      { id: "e2", nome: "Newsletter Semanal", descricao: "Adicionar à newsletter", tipo: "email" },
      { id: "e3", nome: "Aguardar 7 dias", descricao: "Esperar engajamento", tipo: "espera" },
      { id: "e4", nome: "Avaliar Interesse", descricao: "Verificar se abriu e-mails", tipo: "condicao" },
      { id: "e5", nome: "Lead Aquecido", descricao: "Saída para captação", tipo: "saida" },
    ],
    leadsAtivos: 567,
    conversoes: 123,
    taxaConversao: 22,
    criadoEm: "2024-01-10",
  },
  {
    id: "3",
    nome: "Funil de Vendas",
    descricao: "Processo de venda de imóveis",
    tipo: "vendas",
    status: "ativo",
    etapas: [
      { id: "e1", nome: "Lead Qualificado", descricao: "Lead pronto para venda", tipo: "entrada" },
      { id: "e2", nome: "Agendar Visita", descricao: "Criar agendamento", tipo: "tarefa" },
      { id: "e3", nome: "Visita Realizada", descricao: "Confirmar visita", tipo: "condicao" },
      { id: "e4", nome: "Enviar Proposta", descricao: "Preparar proposta", tipo: "tarefa" },
      { id: "e5", nome: "Venda Fechada", descricao: "Negócio concluído", tipo: "saida" },
    ],
    leadsAtivos: 89,
    conversoes: 34,
    taxaConversao: 38,
    criadoEm: "2024-01-05",
  },
  {
    id: "4",
    nome: "Pós-Venda",
    descricao: "Acompanhamento após fechamento",
    tipo: "pos_venda",
    status: "pausado",
    etapas: [
      { id: "e1", nome: "Venda Concluída", descricao: "Cliente novo", tipo: "entrada" },
      { id: "e2", nome: "E-mail Agradecimento", descricao: "Enviar agradecimento", tipo: "email" },
      { id: "e3", nome: "Aguardar 30 dias", descricao: "Período de adaptação", tipo: "espera" },
      { id: "e4", nome: "Pesquisa Satisfação", descricao: "Enviar NPS", tipo: "email" },
      { id: "e5", nome: "Pedir Indicações", descricao: "Solicitar referências", tipo: "whatsapp" },
    ],
    leadsAtivos: 45,
    conversoes: 12,
    taxaConversao: 27,
    criadoEm: "2024-01-15",
  },
];

// ==================== CONFIGURAÇÕES ====================
const tipoFunilConfig = {
  captacao: { label: "Captação", cor: "bg-blue-500", lightBg: "bg-blue-100 dark:bg-blue-500/20" },
  nutrição: { label: "Nutrição", cor: "bg-purple-500", lightBg: "bg-purple-100 dark:bg-purple-500/20" },
  vendas: { label: "Vendas", cor: "bg-green-500", lightBg: "bg-green-100 dark:bg-green-500/20" },
  pos_venda: { label: "Pós-Venda", cor: "bg-amber-500", lightBg: "bg-amber-100 dark:bg-amber-500/20" },
};

const tipoEtapaConfig = {
  entrada: { label: "Entrada", icon: RiUserAddLine, cor: "bg-blue-500" },
  email: { label: "E-mail", icon: RiMailLine, cor: "bg-purple-500" },
  whatsapp: { label: "WhatsApp", icon: RiPhoneLine, cor: "bg-green-500" },
  espera: { label: "Espera", icon: RiTimeLine, cor: "bg-amber-500" },
  tarefa: { label: "Tarefa", icon: RiCalendarCheckLine, cor: "bg-orange-500" },
  condicao: { label: "Condição", icon: RiFlowChart, cor: "bg-pink-500" },
  saida: { label: "Saída", icon: RiCheckDoubleLine, cor: "bg-emerald-500" },
};

// ==================== COMPONENTES ====================

// Etapa do Funil
function EtapaCard({ etapa, isLast }: { etapa: EtapaFunil; isLast: boolean }) {
  const config = tipoEtapaConfig[etapa.tipo];
  const Icon = config.icon;

  return (
    <div className="flex items-center">
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={`w-16 h-16 rounded-2xl ${config.cor} flex items-center justify-center shadow-lg cursor-pointer relative group`}
      >
        <Icon className="w-7 h-7 text-white" />
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs bg-neutral-900 text-white px-2 py-1 rounded">{etapa.nome}</span>
        </div>
      </motion.div>
      {!isLast && (
        <div className="w-12 h-0.5 bg-neutral-200 dark:bg-neutral-700 relative">
          <RiArrowRightLine className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        </div>
      )}
    </div>
  );
}

// Funil Card
function FunilCard({ funil, onClick }: { funil: Funil; onClick: () => void }) {
  const tipoConfig = tipoFunilConfig[funil.tipo];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-xl transition-all cursor-pointer"
    >
      {/* Header */}
      <div className={`${tipoConfig.cor} p-4`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/80 text-sm">{tipoFunilConfig[funil.tipo].label}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            funil.status === "ativo" ? "bg-green-500/20 text-green-100" :
            funil.status === "pausado" ? "bg-amber-500/20 text-amber-100" :
            "bg-white/20 text-white"
          }`}>
            {funil.status === "ativo" ? "Ativo" : funil.status === "pausado" ? "Pausado" : "Rascunho"}
          </span>
        </div>
        <h3 className="text-lg font-bold text-white">{funil.nome}</h3>
      </div>

      {/* Etapas Preview */}
      <div className="p-4 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center justify-center overflow-x-auto pb-4">
          {funil.etapas.map((etapa, index) => (
            <EtapaCard key={etapa.id} etapa={etapa} isLast={index === funil.etapas.length - 1} />
          ))}
        </div>
        <p className="text-xs text-center text-neutral-500">{funil.etapas.length} etapas</p>
      </div>

      {/* Métricas */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-xl font-bold text-neutral-900 dark:text-white">{funil.leadsAtivos}</p>
            <p className="text-xs text-neutral-500">Leads Ativos</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-green-600">{funil.conversoes}</p>
            <p className="text-xs text-neutral-500">Conversões</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-purple-600">{funil.taxaConversao}%</p>
            <p className="text-xs text-neutral-500">Taxa</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Modal Visual do Funil
function FunilModal({ funil, onClose }: { funil: Funil; onClose: () => void }) {
  const tipoConfig = tipoFunilConfig[funil.tipo];

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
        className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`${tipoConfig.cor} p-6 flex items-center justify-between`}>
          <div>
            <p className="text-white/80 text-sm">{tipoFunilConfig[funil.tipo].label}</p>
            <h2 className="text-xl font-bold text-white">{funil.nome}</h2>
            <p className="text-white/80 mt-1">{funil.descricao}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/20 text-white">
            <RiCloseLine className="w-6 h-6" />
          </button>
        </div>

        {/* Funil Visual */}
        <div className="p-6 overflow-x-auto">
          <div className="flex items-center justify-center gap-2 min-w-max">
            {funil.etapas.map((etapa, index) => {
              const config = tipoEtapaConfig[etapa.tipo];
              const Icon = config.icon;

              return (
                <div key={etapa.id} className="flex items-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex flex-col items-center"
                  >
                    <div className={`w-20 h-20 rounded-2xl ${config.cor} flex items-center justify-center shadow-lg mb-2`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-center max-w-[100px]">
                      <p className="font-medium text-neutral-900 dark:text-white text-sm">{etapa.nome}</p>
                      <p className="text-xs text-neutral-500 line-clamp-2">{etapa.descricao}</p>
                    </div>
                  </motion.div>
                  {index < funil.etapas.length - 1 && (
                    <div className="w-16 flex items-center justify-center">
                      <div className="w-full h-1 bg-neutral-200 dark:bg-neutral-700 rounded relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ delay: index * 0.1 + 0.2, duration: 0.3 }}
                          className={`h-full ${config.cor} rounded`}
                        />
                        <RiArrowRightLine className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-5 h-5 text-neutral-400" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Métricas */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-center">
              <RiUserAddLine className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-neutral-900 dark:text-white">{funil.leadsAtivos}</p>
              <p className="text-xs text-neutral-500">Leads Ativos</p>
            </div>
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-center">
              <RiCheckDoubleLine className="w-5 h-5 text-green-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-neutral-900 dark:text-white">{funil.conversoes}</p>
              <p className="text-xs text-neutral-500">Conversões</p>
            </div>
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-center">
              <RiPercentLine className="w-5 h-5 text-purple-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-neutral-900 dark:text-white">{funil.taxaConversao}%</p>
              <p className="text-xs text-neutral-500">Taxa Conversão</p>
            </div>
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-center">
              <RiFlowChart className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-neutral-900 dark:text-white">{funil.etapas.length}</p>
              <p className="text-xs text-neutral-500">Etapas</p>
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-3">
            <button className="flex-1 h-11 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium hover:opacity-90 flex items-center justify-center gap-2">
              <RiEditLine className="w-5 h-5" />
              Editar Funil
            </button>
            <button className="h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center gap-2">
              <RiLineChartLine className="w-5 h-5" />
              Ver Métricas
            </button>
            <button className="h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-amber-500">
              <RiSettings4Line className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ==================== PÁGINA PRINCIPAL ====================
export default function FunisPage() {
  const [selectedFunil, setSelectedFunil] = useState<Funil | null>(null);
  const [tipoFilter, setTipoFilter] = useState<string>("all");

  const filteredFunis = funis.filter(f => tipoFilter === "all" || f.tipo === tipoFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
              <RiFlowChart className="w-5 h-5 text-white" />
            </div>
            Funis de Marketing
          </h1>
          <p className="text-neutral-500 mt-1">Automatize a jornada dos seus leads</p>
        </div>

        <button className="flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white font-medium hover:opacity-90">
          <RiAddLine className="w-4 h-4" />
          Novo Funil
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {["all", "captacao", "nutrição", "vendas", "pos_venda"].map(tipo => (
          <button
            key={tipo}
            onClick={() => setTipoFilter(tipo)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tipoFilter === tipo ? "bg-purple-500 text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
            }`}
          >
            {tipo === "all" ? "Todos" : tipoFunilConfig[tipo as keyof typeof tipoFunilConfig].label}
          </button>
        ))}
      </div>

      {/* Funis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredFunis.map((funil, index) => (
          <motion.div key={funil.id} transition={{ delay: index * 0.1 }}>
            <FunilCard funil={funil} onClick={() => setSelectedFunil(funil)} />
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedFunil && (
          <FunilModal funil={selectedFunil} onClose={() => setSelectedFunil(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
