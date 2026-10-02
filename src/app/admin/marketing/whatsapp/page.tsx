"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiWhatsappLine,
  RiAddLine,
  RiSendPlaneLine,
  RiTimeLine,
  RiCheckDoubleLine,
  RiEyeLine,
  RiUserLine,
  RiEditLine,
  RiDeleteBinLine,
  RiFileCopyLine,
  RiMoreLine,
  RiCloseLine,
  RiArrowUpSLine,
  RiArrowDownSLine,
  RiImageLine,
  RiVideoLine,
  RiFileTextLine,
  RiMessage2Line,
  RiGroupLine,
  RiRobot2Line,
  RiPlayCircleLine,
  RiPauseCircleLine,
  RiTestTubeLine,
} from "react-icons/ri";

// ==================== TIPOS ====================
interface MensagemWhatsApp {
  id: string;
  nome: string;
  tipo: "texto" | "imagem" | "video" | "documento" | "lista" | "botoes";
  template: boolean;
  status: "aprovado" | "pendente" | "rejeitado";
  conteudo: string;
  mediaUrl?: string;
  botoes?: string[];
  categoria: "marketing" | "transacional" | "utilidade";
  enviados: number;
  entregues: number;
  lidos: number;
  cliques: number;
  taxaEntrega: number;
  taxaLeitura: number;
}

interface Disparo {
  id: string;
  nome: string;
  mensagem: MensagemWhatsApp;
  lista: string;
  destinatarios: number;
  enviados: number;
  entregues: number;
  lidos: number;
  status: "enviado" | "agendado" | "em_andamento" | "rascunho";
  dataEnvio?: string;
  dataAgendamento?: string;
}

// ==================== DADOS MOCK ====================
const mensagens: MensagemWhatsApp[] = [
  { id: "1", nome: "Boas-vindas Lead", tipo: "texto", template: true, status: "aprovado", conteudo: "Olá {{nome}}! Seja bem-vindo à Tappy Imob. Encontramos imóveis perfeitos para você!", categoria: "transacional", enviados: 1250, entregues: 1230, lidos: 980, cliques: 456, taxaEntrega: 98.4, taxaLeitura: 79.7 },
  { id: "2", nome: "Novo Imóvel Disponível", tipo: "imagem", template: true, status: "aprovado", conteudo: "🏠 Novo imóvel em {{bairro}}! Confira:", mediaUrl: "/imovel.jpg", categoria: "marketing", enviados: 3200, entregues: 3150, lidos: 2100, cliques: 890, taxaEntrega: 98.4, taxaLeitura: 66.7 },
  { id: "3", nome: "Confirmação de Visita", tipo: "botoes", template: true, status: "aprovado", conteudo: "Sua visita está confirmada para {{data}} às {{hora}}.", botoes: ["Confirmar", "Reagendar", "Cancelar"], categoria: "transacional", enviados: 890, entregues: 885, lidos: 870, cliques: 750, taxaEntrega: 99.4, taxaLeitura: 98.3 },
  { id: "4", nome: "Lista de Imóveis", tipo: "lista", template: true, status: "pendente", conteudo: "Selecionamos imóveis para você:", categoria: "marketing", enviados: 0, entregues: 0, lidos: 0, cliques: 0, taxaEntrega: 0, taxaLeitura: 0 },
  { id: "5", nome: "Vídeo Tour Virtual", tipo: "video", template: true, status: "aprovado", conteudo: "🎥 Tour virtual do apartamento em Moema!", mediaUrl: "/tour.mp4", categoria: "marketing", enviados: 560, entregues: 545, lidos: 420, cliques: 310, taxaEntrega: 97.3, taxaLeitura: 77.1 },
];

const disparos: Disparo[] = [
  { id: "1", nome: "Campanha Lançamento Jardins", mensagem: mensagens[1], lista: "Interessados em Apartamentos", destinatarios: 1500, enviados: 1480, entregues: 1450, lidos: 980, status: "enviado", dataEnvio: "2024-01-24T10:00:00" },
  { id: "2", nome: "Confirmações da Semana", mensagem: mensagens[2], lista: "Visitas Agendadas", destinatarios: 45, enviados: 45, entregues: 45, lidos: 44, status: "enviado", dataEnvio: "2024-01-25T08:00:00" },
  { id: "3", nome: "Newsletter WhatsApp", mensagem: mensagens[0], lista: "Base Completa", destinatarios: 5200, enviados: 0, entregues: 0, lidos: 0, status: "agendado", dataAgendamento: "2024-01-26T10:00:00" },
  { id: "4", nome: "Tour Virtual Moema", mensagem: mensagens[4], lista: "Interessados Moema", destinatarios: 320, enviados: 120, entregues: 118, lidos: 45, status: "em_andamento" },
];

// ==================== CONFIGURAÇÕES ====================
const tipoMsgConfig = {
  texto: { label: "Texto", icon: RiMessage2Line, cor: "bg-blue-500" },
  imagem: { label: "Imagem", icon: RiImageLine, cor: "bg-green-500" },
  video: { label: "Vídeo", icon: RiVideoLine, cor: "bg-purple-500" },
  documento: { label: "Documento", icon: RiFileTextLine, cor: "bg-amber-500" },
  lista: { label: "Lista", icon: RiGroupLine, cor: "bg-pink-500" },
  botoes: { label: "Botões", icon: RiRobot2Line, cor: "bg-indigo-500" },
};

const statusMsgConfig = {
  aprovado: { label: "Aprovado", cor: "text-green-600", bg: "bg-green-100 dark:bg-green-500/20" },
  pendente: { label: "Pendente", cor: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-500/20" },
  rejeitado: { label: "Rejeitado", cor: "text-red-600", bg: "bg-red-100 dark:bg-red-500/20" },
};

const statusDisparoConfig = {
  enviado: { label: "Enviado", icon: RiCheckDoubleLine, cor: "text-green-600", bg: "bg-green-100 dark:bg-green-500/20" },
  agendado: { label: "Agendado", icon: RiTimeLine, cor: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-500/20" },
  em_andamento: { label: "Em Andamento", icon: RiPlayCircleLine, cor: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-500/20" },
  rascunho: { label: "Rascunho", icon: RiEditLine, cor: "text-neutral-600", bg: "bg-neutral-100 dark:bg-neutral-500/20" },
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

// Mensagem Card
function MensagemCard({ mensagem, onClick }: { mensagem: MensagemWhatsApp; onClick: () => void }) {
  const tipo = tipoMsgConfig[mensagem.tipo];
  const status = statusMsgConfig[mensagem.status];
  const TipoIcon = tipo.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl ${tipo.cor} flex items-center justify-center flex-shrink-0`}>
          <TipoIcon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-neutral-900 dark:text-white truncate">{mensagem.nome}</h4>
            {mensagem.template && (
              <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-500/20 text-green-600 text-[10px] font-medium rounded">
                Template
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-500 line-clamp-2">{mensagem.conteudo}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className={`text-xs font-medium ${status.cor}`}>{status.label}</span>
            {mensagem.enviados > 0 && (
              <span className="text-xs text-neutral-400">{mensagem.enviados.toLocaleString()} envios</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Disparo Card
function DisparoCard({ disparo }: { disparo: Disparo }) {
  const statusConfig = statusDisparoConfig[disparo.status];
  const StatusIcon = statusConfig.icon;
  const progresso = disparo.status === "em_andamento" ? (disparo.enviados / disparo.destinatarios) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-neutral-900 dark:text-white">{disparo.nome}</h3>
            <p className="text-sm text-neutral-500">{disparo.lista}</p>
          </div>
          <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.cor}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {statusConfig.label}
          </span>
        </div>

        {/* Progress bar para em andamento */}
        {disparo.status === "em_andamento" && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-neutral-500">Progresso</span>
              <span className="font-medium text-neutral-900 dark:text-white">{disparo.enviados} / {disparo.destinatarios}</span>
            </div>
            <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progresso}%` }}
                className="h-full bg-green-500 rounded-full"
              />
            </div>
          </div>
        )}

        {/* Métricas */}
        {disparo.status === "enviado" && (
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="text-center p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <p className="text-lg font-bold text-neutral-900 dark:text-white">{disparo.entregues}</p>
              <p className="text-xs text-neutral-500">Entregues</p>
            </div>
            <div className="text-center p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <p className="text-lg font-bold text-green-600">{disparo.lidos}</p>
              <p className="text-xs text-neutral-500">Lidos</p>
            </div>
            <div className="text-center p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <p className="text-lg font-bold text-blue-600">{Math.round((disparo.lidos / disparo.entregues) * 100)}%</p>
              <p className="text-xs text-neutral-500">Taxa</p>
            </div>
          </div>
        )}

        {/* Data */}
        <div className="flex items-center justify-between text-sm text-neutral-500">
          {disparo.dataEnvio && (
            <span>Enviado em {new Date(disparo.dataEnvio).toLocaleDateString("pt-BR")}</span>
          )}
          {disparo.dataAgendamento && (
            <span className="text-amber-600">Agendado para {new Date(disparo.dataAgendamento).toLocaleDateString("pt-BR")}</span>
          )}
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600">
              <RiEyeLine className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600">
              <RiMoreLine className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ==================== PÁGINA PRINCIPAL ====================
export default function WhatsAppMarketingPage() {
  const [activeTab, setActiveTab] = useState<"disparos" | "mensagens">("disparos");
  const [selectedMensagem, setSelectedMensagem] = useState<MensagemWhatsApp | null>(null);

  const totalEnviados = disparos.reduce((acc, d) => acc + d.enviados, 0);
  const totalLidos = disparos.reduce((acc, d) => acc + d.lidos, 0);
  const taxaMedia = totalEnviados > 0 ? Math.round((totalLidos / totalEnviados) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <RiWhatsappLine className="w-5 h-5 text-white" />
            </div>
            WhatsApp Marketing
          </h1>
          <p className="text-neutral-500 mt-1">Campanhas e mensagens em massa</p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 h-10 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800">
            <RiTestTubeLine className="w-4 h-4" />
            Testar
          </button>
          <button className="flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium hover:opacity-90">
            <RiAddLine className="w-4 h-4" />
            Novo Disparo
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Mensagens Enviadas" value={totalEnviados.toLocaleString()} icon={RiSendPlaneLine} cor="bg-green-500" trend={18} />
        <StatCard label="Taxa de Leitura" value={`${taxaMedia}%`} icon={RiEyeLine} cor="bg-blue-500" trend={5} />
        <StatCard label="Templates Aprovados" value={String(mensagens.filter(m => m.status === "aprovado").length)} icon={RiCheckDoubleLine} cor="bg-purple-500" />
        <StatCard label="Disparos Ativos" value={String(disparos.filter(d => d.status !== "rascunho").length)} icon={RiWhatsappLine} cor="bg-emerald-500" trend={12} />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800">
        <button
          onClick={() => setActiveTab("disparos")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "disparos"
              ? "border-green-500 text-green-600"
              : "border-transparent text-neutral-500 hover:text-neutral-700"
          }`}
        >
          Disparos
        </button>
        <button
          onClick={() => setActiveTab("mensagens")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "mensagens"
              ? "border-green-500 text-green-600"
              : "border-transparent text-neutral-500 hover:text-neutral-700"
          }`}
        >
          Templates de Mensagem
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === "disparos" ? (
          <motion.div
            key="disparos"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
          >
            {disparos.map((disparo, index) => (
              <motion.div key={disparo.id} transition={{ delay: index * 0.05 }}>
                <DisparoCard disparo={disparo} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="mensagens"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {mensagens.map((mensagem, index) => (
              <motion.div key={mensagem.id} transition={{ delay: index * 0.05 }}>
                <MensagemCard mensagem={mensagem} onClick={() => setSelectedMensagem(mensagem)} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Mensagem */}
      <AnimatePresence>
        {selectedMensagem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedMensagem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-md overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    {(() => { const Icon = tipoMsgConfig[selectedMensagem.tipo].icon; return <Icon className="w-5 h-5 text-white" />; })()}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{selectedMensagem.nome}</h3>
                    <p className="text-white/80 text-sm">{tipoMsgConfig[selectedMensagem.tipo].label}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedMensagem(null)} className="p-2 rounded-lg hover:bg-white/20 text-white">
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                {/* Preview WhatsApp style */}
                <div className="bg-[#E5DDD5] dark:bg-neutral-800 rounded-xl p-4 mb-4">
                  <div className="bg-white dark:bg-neutral-700 rounded-lg p-3 shadow max-w-[80%]">
                    <p className="text-sm text-neutral-900 dark:text-white">{selectedMensagem.conteudo}</p>
                    {selectedMensagem.botoes && (
                      <div className="mt-2 space-y-1">
                        {selectedMensagem.botoes.map((btn, i) => (
                          <button key={i} className="w-full py-1.5 text-sm text-blue-500 border-t border-neutral-200 dark:border-neutral-600">
                            {btn}
                          </button>
                        ))}
                      </div>
                    )}
                    <p className="text-[10px] text-neutral-400 text-right mt-1">12:00 ✓✓</p>
                  </div>
                </div>

                {/* Métricas */}
                {selectedMensagem.enviados > 0 && (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-center">
                      <p className="text-lg font-bold text-neutral-900 dark:text-white">{selectedMensagem.taxaEntrega}%</p>
                      <p className="text-xs text-neutral-500">Taxa Entrega</p>
                    </div>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-center">
                      <p className="text-lg font-bold text-green-600">{selectedMensagem.taxaLeitura}%</p>
                      <p className="text-xs text-neutral-500">Taxa Leitura</p>
                    </div>
                  </div>
                )}

                {/* Ações */}
                <div className="flex items-center gap-2">
                  <button className="flex-1 h-10 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 flex items-center justify-center gap-2">
                    <RiSendPlaneLine className="w-4 h-4" />
                    Usar Template
                  </button>
                  <button className="h-10 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800">
                    <RiEditLine className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
