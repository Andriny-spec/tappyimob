"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "@/components/admin/AdminLayoutClient";
import { WahaSessionModal, type WAHASession } from "@/components/admin/WahaSessionModal";
import {
  ConvertToLeadAction,
  ScheduleVisitAction,
  ProposalAction,
  ContractAction,
  AIAnalysisAction,
  NotesAction,
  ChecklistAction,
  BudgetAction,
} from "@/components/chat/actions";
import {
  RiChat1Line,
  RiSearchLine,
  RiStarLine,
  RiStarFill,
  RiArchiveLine,
  RiFileTextLine,
  RiCheckboxLine,
  RiRobot2Line,
  RiMoneyDollarCircleLine,
  RiEditLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiArrowLeftSLine,
  RiSendPlaneLine,
  RiMicLine,
  RiMicFill,
  RiImageLine,
  RiAttachmentLine,
  RiEmotionLine,
  RiSparklingLine,
  RiVolumeUpLine,
  RiTimeLine,
  RiCheckLine,
  RiCheckDoubleLine,
  RiPhoneLine,
  RiVideoChatLine,
  RiMoreLine,
  RiUserLine,
  RiMapPinLine,
  RiMailLine,
  RiTeamLine,
  RiCloseLine,
  RiPlayCircleLine,
  RiPauseCircleLine,
  RiMessage2Line,
  RiThumbUpLine,
  RiReplyLine,
  RiFileCopyLine,
  RiDeleteBinLine,
  RiFlashlightLine,
  RiQrCodeLine,
  RiWifiLine,
  RiWifiOffLine,
  RiRefreshLine,
  RiAddLine,
  RiLoader4Line,
  RiWhatsappLine,
  RiSmartphoneLine,
  RiLinkUnlinkM,
  RiUserAddLine,
  RiCalendarEventLine,
  RiContractLine,
  RiHome4Line,
  RiExternalLinkLine,
} from "react-icons/ri";
import { useChatAoVivo, mesclarChats } from "@/hooks/useChatAoVivo";

// ==================== TIPOS WAHA ====================
// WAHASession vem de @/components/admin/WahaSessionModal (re-exportado de @/lib/waha)

interface WAHAChat {
  id: string;
  name?: string;
  timestamp?: number;
  unreadCount?: number;
  picture?: string | null;
  lastMessage?: {
    id?: string;
    body?: string;
    timestamp?: number;
    from?: string;
    fromMe?: boolean;
  } | null;
}

interface WAHAMessage {
  id: string;
  body: string;
  from: string;
  to: string;
  timestamp: number;
  fromMe: boolean;
  hasMedia?: boolean;
  mediaUrl?: string;
  type?: "text" | "image" | "video" | "audio" | "ptt" | "document" | "sticker" | "location" | "contact" | "poll";
  mimetype?: string;
  filename?: string;
  caption?: string;
  media?: {
    url?: string;
    mimetype?: string;
    filename?: string;
    data?: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    description?: string;
  };
  vcard?: string;
}

// ==================== TIPOS ====================
interface Contato {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  avatar?: string;
  profilePicture?: string;
  status: "online" | "offline" | "digitando";
  tipo: "lead" | "cliente" | "corretor" | "proprietario";
  favorito: boolean;
  arquivado: boolean;
  ultimaMensagem: string;
  ultimaHora: string;
  naoLidas: number;
  corretorResponsavel?: string;
  leadStatus?: "novo" | "qualificado" | "negociando" | "fechado";
  imovelInteresse?: string;
  orcamento?: string;
}

interface Mensagem {
  id: string;
  conteudo: string;
  tipo: "texto" | "audio" | "imagem" | "video" | "documento" | "localizacao" | "contato" | "sticker";
  remetente: "eu" | "contato";
  timestamp: string;
  status: "enviando" | "enviado" | "entregue" | "lido";
  duracao?: string;
  mediaUrl?: string;
  mimetype?: string;
  filename?: string;
  caption?: string;
  hasMedia?: boolean;
  location?: {
    latitude: number;
    longitude: number;
    description?: string;
  };
  vcard?: string;
}

interface Agente {
  id: string;
  nome: string;
  descricao: string;
  cor: string;
}

// ==================== DADOS MOCK ====================
const contatos: Contato[] = [
  { id: "1", nome: "João Silva", telefone: "(11) 99999-1234", email: "joao@email.com", status: "online", tipo: "lead", favorito: true, arquivado: false, ultimaMensagem: "Olá, tenho interesse no apartamento em Moema", ultimaHora: "10:30", naoLidas: 3, corretorResponsavel: "Carlos Oliveira", leadStatus: "qualificado", imovelInteresse: "APT001 - Moema", orcamento: "R$ 500.000 - R$ 800.000" },
  { id: "2", nome: "Maria Santos", telefone: "(11) 98888-5678", status: "digitando", tipo: "cliente", favorito: false, arquivado: false, ultimaMensagem: "Podemos agendar a visita para sábado?", ultimaHora: "10:25", naoLidas: 1, corretorResponsavel: "Ana Lima", leadStatus: "negociando" },
  { id: "3", nome: "Pedro Lima", telefone: "(11) 97777-9012", status: "offline", tipo: "lead", favorito: false, arquivado: false, ultimaMensagem: "Qual o valor da entrada?", ultimaHora: "09:45", naoLidas: 0, corretorResponsavel: "Carlos Oliveira", leadStatus: "novo" },
  { id: "4", nome: "Ana Costa", telefone: "(11) 96666-3456", status: "online", tipo: "proprietario", favorito: true, arquivado: false, ultimaMensagem: "As fotos ficaram ótimas!", ultimaHora: "ontem", naoLidas: 0, corretorResponsavel: "Maria Silva" },
  { id: "5", nome: "Roberto Almeida", telefone: "(11) 95555-7890", status: "offline", tipo: "cliente", favorito: false, arquivado: false, ultimaMensagem: "Fechamos negócio! 🎉", ultimaHora: "ontem", naoLidas: 0, corretorResponsavel: "Ana Lima", leadStatus: "fechado" },
  { id: "6", nome: "Fernanda Lima", telefone: "(11) 94444-2345", status: "offline", tipo: "lead", favorito: false, arquivado: true, ultimaMensagem: "Vou pensar e retorno", ultimaHora: "há 3 dias", naoLidas: 0, corretorResponsavel: "Carlos Oliveira", leadStatus: "qualificado" },
];

const mensagensIniciais: Mensagem[] = [
  { id: "1", conteudo: "Olá! Vi o anúncio do apartamento em Moema e tenho interesse.", tipo: "texto", remetente: "contato", timestamp: "10:15", status: "lido" },
  { id: "2", conteudo: "Olá João! Que bom receber seu contato. O apartamento está disponível sim! São 3 quartos, 120m², com 2 vagas de garagem.", tipo: "texto", remetente: "eu", timestamp: "10:18", status: "lido" },
  { id: "3", conteudo: "Qual o valor e as condições de pagamento?", tipo: "texto", remetente: "contato", timestamp: "10:20", status: "lido" },
  { id: "4", conteudo: "O valor é R$ 750.000. Aceitamos financiamento e podemos negociar a entrada. Gostaria de agendar uma visita?", tipo: "texto", remetente: "eu", timestamp: "10:22", status: "lido" },
  { id: "5", conteudo: "", tipo: "audio", remetente: "contato", timestamp: "10:25", status: "lido", duracao: "0:32" },
  { id: "6", conteudo: "Perfeito! Tenho disponibilidade no sábado pela manhã. Funciona para você?", tipo: "texto", remetente: "eu", timestamp: "10:28", status: "entregue" },
  { id: "7", conteudo: "Olá, tenho interesse no apartamento em Moema", tipo: "texto", remetente: "contato", timestamp: "10:30", status: "lido" },
];

const agentes: Agente[] = [
  { id: "1", nome: "Atendimento Geral", descricao: "Responde perguntas básicas", cor: "bg-blue-500" },
  { id: "2", nome: "Qualificação", descricao: "Qualifica leads automaticamente", cor: "bg-purple-500" },
  { id: "3", nome: "Agendamento", descricao: "Agenda visitas e reuniões", cor: "bg-green-500" },
  { id: "4", nome: "Negociação", descricao: "Auxilia em propostas", cor: "bg-amber-500" },
];

const respostasRapidas = [
  "Olá! Como posso ajudá-lo?",
  "Vou verificar e já retorno.",
  "Podemos agendar uma visita?",
  "O imóvel está disponível!",
  "Qual seu orçamento?",
  "Obrigado pelo contato!",
];

// ==================== CONFIGURAÇÕES ====================
const tipoConfig = {
  lead: { label: "Lead", cor: "bg-blue-500", text: "text-blue-600" },
  cliente: { label: "Cliente", cor: "bg-green-500", text: "text-green-600" },
  corretor: { label: "Corretor", cor: "bg-purple-500", text: "text-purple-600" },
  proprietario: { label: "Proprietário", cor: "bg-amber-500", text: "text-amber-600" },
};

const leadStatusConfig = {
  novo: { label: "Novo", cor: "bg-blue-100 text-blue-600" },
  qualificado: { label: "Qualificado", cor: "bg-purple-100 text-purple-600" },
  negociando: { label: "Negociando", cor: "bg-amber-100 text-amber-600" },
  fechado: { label: "Fechado", cor: "bg-green-100 text-green-600" },
};

// ==================== COMPONENTES ====================

// Avatar com status e foto de perfil
function Avatar({ nome, status, size = "md", profilePicture }: { nome: string; status?: string; size?: "sm" | "md" | "lg"; profilePicture?: string }) {
  const sizeClasses = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base" };
  const statusSizeClasses = { sm: "w-2.5 h-2.5", md: "w-3 h-3", lg: "w-3.5 h-3.5" };
  const iniciais = nome.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="relative">
      {profilePicture ? (
        <img 
          src={profilePicture} 
          alt={nome}
          className={`${sizeClasses[size]} rounded-full object-cover`}
          onError={(e) => {
            // Fallback para iniciais se a imagem falhar
            e.currentTarget.style.display = "none";
            e.currentTarget.nextElementSibling?.classList.remove("hidden");
          }}
        />
      ) : null}
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold ${profilePicture ? "hidden" : ""}`}>
        {iniciais}
      </div>
      {status && (
        <span className={`absolute bottom-0 right-0 ${statusSizeClasses[size]} rounded-full border-2 border-white dark:border-neutral-900 ${
          status === "online" ? "bg-green-500" : status === "digitando" ? "bg-blue-500 animate-pulse" : "bg-neutral-400"
        }`} />
      )}
    </div>
  );
}

// Tipo de ação ativa
type ActionType = "lead" | "schedule" | "proposal" | "contract" | "analysis" | "agent" | "notes" | "checklist" | "budget" | null;

// Card de Contato na Sidebar com ícones expansivos
function ContatoCard({ 
  contato, 
  isSelected, 
  onClick,
  onAction 
}: { 
  contato: Contato; 
  isSelected: boolean; 
  onClick: () => void;
  onAction?: (action: ActionType, contato: Contato) => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const tipo = tipoConfig[contato.tipo];

  const actions = [
    { key: "lead" as ActionType, icon: RiUserAddLine, label: "Lead", color: "text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10" },
    { key: "schedule" as ActionType, icon: RiCalendarEventLine, label: "Agendar", color: "text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10" },
    { key: "budget" as ActionType, icon: RiMoneyDollarCircleLine, label: "Orçamento", color: "text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10" },
    { key: "notes" as ActionType, icon: RiEditLine, label: "Notas", color: "text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-500/10" },
    { key: "checklist" as ActionType, icon: RiCheckboxLine, label: "Checklist", color: "text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-500/10" },
  ];

  return (
    <motion.div
      layout
      className={`mx-2 mb-2 rounded-xl border transition-all ${
        isSelected 
          ? "bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/30 shadow-sm" 
          : "bg-white dark:bg-neutral-800/50 border-neutral-100 dark:border-neutral-800 hover:border-neutral-200 dark:hover:border-neutral-700 hover:shadow-sm"
      }`}
    >
      {/* Main Card */}
      <div className="p-3 cursor-pointer" onClick={onClick}>
        <div className="flex items-center gap-3">
          {/* Avatar clicável para expandir ações - maior e centralizado */}
          <div 
            className="relative flex-shrink-0"
            onClick={(e) => { e.stopPropagation(); setShowActions(!showActions); }}
          >
            <Avatar nome={contato.nome} status={contato.status} size="lg" profilePicture={contato.profilePicture} />
            {/* Indicador de clique */}
            <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center transition-transform ${showActions ? "scale-100" : "scale-0"}`}>
              <RiArrowUpSLine className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-900 dark:text-white truncate">{contato.nome}</span>
                {contato.favorito && <RiStarFill className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
              </div>
              <span className="text-xs text-neutral-500 flex-shrink-0">{contato.ultimaHora}</span>
            </div>
            
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${tipo.cor} text-white`}>{tipo.label}</span>
            </div>
            
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-neutral-500 truncate flex-1">
                {contato.status === "digitando" ? (
                  <span className="text-blue-500 italic">digitando...</span>
                ) : (
                  contato.ultimaMensagem
                )}
              </p>
              {contato.naoLidas > 0 && (
                <span className="ml-2 w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-semibold flex-shrink-0">
                  {contato.naoLidas}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ações Expansivas (aparecem ao clicar no avatar) */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-2 border-t border-neutral-100 dark:border-neutral-700 bg-gradient-to-b from-neutral-50/50 to-white dark:from-neutral-800/30 dark:to-neutral-900/50 rounded-b-xl">
              {/* Ícones de ação em linha */}
              <div className="flex items-center justify-between gap-1 mb-2">
                {actions.map((action) => (
                  <button
                    key={action.key}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onAction?.(action.key, contato);
                      setShowActions(false);
                    }}
                    className={`flex-1 p-2 rounded-lg ${action.color} transition-colors flex flex-col items-center gap-1`}
                    title={action.label}
                  >
                    <action.icon className="w-4 h-4" />
                    <span className="text-[9px] font-medium text-neutral-600 dark:text-neutral-400 truncate w-full text-center">
                      {action.label.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
              
              {/* Ações secundárias - IA e Documentos */}
              <div className="flex items-center gap-1 pt-2 border-t border-neutral-100 dark:border-neutral-700">
                <button
                  onClick={(e) => { e.stopPropagation(); onAction?.("proposal", contato); setShowActions(false); }}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                  title="Proposta"
                >
                  <RiFileTextLine className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onAction?.("contract", contato); setShowActions(false); }}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                  title="Contrato"
                >
                  <RiContractLine className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onAction?.("analysis", contato); setShowActions(false); }}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/10"
                  title="Análise IA"
                >
                  <RiSparklingLine className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); }}
                  className={`p-1.5 rounded-lg ${contato.favorito ? "text-amber-500" : "text-neutral-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10"}`}
                  title="Favoritar"
                >
                  {contato.favorito ? <RiStarFill className="w-4 h-4" /> : <RiStarLine className="w-4 h-4" />}
                </button>
                <button onClick={(e) => { e.stopPropagation(); }} className="p-1.5 rounded-lg text-neutral-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10" title="Arquivar">
                  <RiArchiveLine className="w-4 h-4" />
                </button>
                <div className="flex-1" />
                <button
                  onClick={(e) => { e.stopPropagation(); setShowActions(false); }}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  <RiCloseLine className="w-4 h-4" />
                </button>
              </div>

              {/* Info adicional */}
              {(contato.imovelInteresse || contato.orcamento) && (
                <div className="mt-2 space-y-1">
                  {contato.imovelInteresse && (
                    <div className="flex items-center gap-2 p-1.5 rounded-lg bg-white dark:bg-neutral-800 text-xs">
                      <RiMapPinLine className="w-3.5 h-3.5 text-neutral-400" />
                      <span className="text-neutral-600 dark:text-neutral-400 truncate">{contato.imovelInteresse}</span>
                    </div>
                  )}
                  {contato.orcamento && (
                    <div className="flex items-center gap-2 p-1.5 rounded-lg bg-white dark:bg-neutral-800 text-xs">
                      <RiMoneyDollarCircleLine className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-neutral-600 dark:text-neutral-400">{contato.orcamento}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Header do Chat com ações IA
function ChatHeader({ 
  contato, 
  onAction 
}: { 
  contato: Contato;
  onAction?: (action: ActionType) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const tipo = tipoConfig[contato.tipo];
  const leadStatus = contato.leadStatus ? leadStatusConfig[contato.leadStatus] : null;

  const headerActions = [
    { key: "lead" as ActionType, icon: RiUserAddLine, label: "Lead", color: "text-blue-500" },
    { key: "schedule" as ActionType, icon: RiCalendarEventLine, label: "Agendar", color: "text-indigo-500" },
    { key: "proposal" as ActionType, icon: RiFileTextLine, label: "Proposta", color: "text-emerald-500" },
    { key: "contract" as ActionType, icon: RiContractLine, label: "Contrato", color: "text-amber-500" },
    { key: "budget" as ActionType, icon: RiMoneyDollarCircleLine, label: "Orçamento", color: "text-green-500" },
    { key: "notes" as ActionType, icon: RiEditLine, label: "Notas", color: "text-yellow-500" },
    { key: "checklist" as ActionType, icon: RiCheckboxLine, label: "Checklist", color: "text-teal-500" },
    { key: "analysis" as ActionType, icon: RiSparklingLine, label: "IA", color: "text-purple-500" },
  ];

  return (
    <div className="min-h-14 md:h-16 px-2 md:px-4 py-2 md:py-0 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-white dark:bg-neutral-900 gap-2">
      <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-shrink">
        <Avatar nome={contato.nome} status={contato.status} size="lg" profilePicture={contato.profilePicture} />
        <div className="min-w-0">
          <div className="flex items-center gap-1 md:gap-2 flex-wrap">
            <h2 className="font-bold text-sm md:text-base text-neutral-900 dark:text-white truncate">{contato.nome}</h2>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${tipo.cor} text-white flex-shrink-0`}>{tipo.label}</span>
            {leadStatus && (
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${leadStatus.cor} flex-shrink-0`}>{leadStatus.label}</span>
            )}
          </div>
          <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-neutral-500">
            <span className="flex items-center gap-1 truncate">
              <RiPhoneLine className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
              <span className="truncate">{contato.telefone}</span>
            </span>
            <span className={`flex-shrink-0 ${contato.status === "online" ? "text-green-500" : contato.status === "digitando" ? "text-blue-500" : ""}`}>
              {contato.status === "online" ? "Online" : contato.status === "digitando" ? "Digitando..." : "Offline"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto flex-shrink-0 scrollbar-hide">
        {/* Ações IA - scroll horizontal no mobile */}
        <div className="hidden md:flex items-center gap-1 border-r border-neutral-200 dark:border-neutral-700 pr-2 mr-2">
          {headerActions.map((action) => (
            <button
              key={action.key}
              onClick={() => onAction?.(action.key)}
              className={`p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 ${action.color} transition-colors`}
              title={action.label}
            >
              <action.icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        {/* Ações padrão */}
        <button className="p-1.5 md:p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 flex-shrink-0" title="Ligar">
          <RiPhoneLine className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        <button className="hidden md:flex p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500" title="Vídeo">
          <RiVideoChatLine className="w-5 h-5" />
        </button>
        <button className="hidden md:flex p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500" title="Buscar">
          <RiSearchLine className="w-5 h-5" />
        </button>
        
        {/* Menu dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
          >
            <RiMoreLine className="w-5 h-5" />
          </button>
          
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 py-1 z-50"
              >
                <button 
                  onClick={() => { window.open("/admin/agenda", "_blank"); setShowMenu(false); }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2"
                >
                  <RiCalendarEventLine className="w-4 h-4 text-indigo-500" />
                  Ver Agenda
                </button>
                <button 
                  onClick={() => { window.open("/admin/clientes/leads", "_blank"); setShowMenu(false); }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2"
                >
                  <RiUserLine className="w-4 h-4 text-blue-500" />
                  Ver Kanban
                </button>
                <hr className="my-1 border-neutral-200 dark:border-neutral-700" />
                <button className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2 text-red-500">
                  <RiArchiveLine className="w-4 h-4" />
                  Arquivar Chat
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Mensagem Individual com suporte a mídia
function MensagemBubble({ mensagem }: { mensagem: Mensagem }) {
  const isMe = mensagem.remetente === "eu";

  // Renderizar conteúdo baseado no tipo
  const renderContent = () => {
    // Imagem
    if (mensagem.tipo === "imagem" && mensagem.mediaUrl) {
      return (
        <div className="max-w-[280px]">
          <img 
            src={mensagem.mediaUrl} 
            alt="Imagem" 
            className="rounded-xl max-w-full cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(mensagem.mediaUrl, "_blank")}
          />
          {mensagem.caption && (
            <p className={`mt-2 text-sm ${isMe ? "text-white" : "text-neutral-900 dark:text-white"}`}>
              {mensagem.caption}
            </p>
          )}
        </div>
      );
    }

    // Vídeo
    if (mensagem.tipo === "video" && mensagem.mediaUrl) {
      return (
        <div className="max-w-[280px]">
          <video 
            src={mensagem.mediaUrl} 
            controls 
            className="rounded-xl max-w-full"
          />
          {mensagem.caption && (
            <p className={`mt-2 text-sm ${isMe ? "text-white" : "text-neutral-900 dark:text-white"}`}>
              {mensagem.caption}
            </p>
          )}
        </div>
      );
    }

    // Áudio (incluindo PTT - Push to Talk do WhatsApp)
    if (mensagem.tipo === "audio" && mensagem.mediaUrl) {
      return (
        <div className="flex items-center gap-3 min-w-[200px] max-w-[280px]">
          <audio 
            src={mensagem.mediaUrl} 
            controls 
            className="w-full h-10"
            controlsList="nodownload"
            preload="metadata"
          >
            {/* Fallback para diferentes formatos */}
            <source src={mensagem.mediaUrl} type="audio/ogg" />
            <source src={mensagem.mediaUrl} type="audio/mpeg" />
            <source src={mensagem.mediaUrl} type="audio/mp4" />
            Seu navegador não suporta áudio.
          </audio>
        </div>
      );
    }

    // Documento
    if (mensagem.tipo === "documento" && mensagem.mediaUrl) {
      return (
        <a 
          href={mensagem.mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-3 p-3 rounded-xl ${
            isMe ? "bg-white/10 hover:bg-white/20" : "bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200"
          }`}
        >
          <RiFileTextLine className={`w-8 h-8 ${isMe ? "text-white" : "text-neutral-500"}`} />
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${isMe ? "text-white" : "text-neutral-900 dark:text-white"}`}>
              {mensagem.filename || "Documento"}
            </p>
            <p className={`text-xs ${isMe ? "text-white/60" : "text-neutral-500"}`}>
              Clique para abrir
            </p>
          </div>
        </a>
      );
    }

    // Localização
    if (mensagem.tipo === "localizacao" && mensagem.location) {
      const { latitude, longitude, description } = mensagem.location;
      const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
      return (
        <a 
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-3 p-3 rounded-xl ${
            isMe ? "bg-white/10 hover:bg-white/20" : "bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200"
          }`}
        >
          <RiMapPinLine className={`w-6 h-6 ${isMe ? "text-white" : "text-red-500"}`} />
          <div>
            <p className={`text-sm font-medium ${isMe ? "text-white" : "text-neutral-900 dark:text-white"}`}>
              Localização
            </p>
            {description && (
              <p className={`text-xs ${isMe ? "text-white/60" : "text-neutral-500"}`}>{description}</p>
            )}
          </div>
        </a>
      );
    }

    // Sticker
    if (mensagem.tipo === "sticker" && mensagem.mediaUrl) {
      return (
        <img src={mensagem.mediaUrl} alt="Sticker" className="w-32 h-32 object-contain" />
      );
    }

    // Texto padrão
    return (
      <p className="text-sm whitespace-pre-wrap">{mensagem.conteudo}</p>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isMe ? "justify-end" : "justify-start"} group`}
    >
      <div className={`max-w-[70%] ${isMe ? "order-1" : ""}`}>
        <div className={`rounded-2xl px-4 py-2 ${
          isMe 
            ? "bg-orange-500 text-white rounded-br-md" 
            : "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-bl-md shadow-sm"
        }`}>
          {renderContent()}
        </div>
        
        <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : ""}`}>
          <span className="text-[10px] text-neutral-400">{mensagem.timestamp}</span>
          {isMe && (
            <span className="text-neutral-400">
              {mensagem.status === "enviando" && <RiTimeLine className="w-3 h-3" />}
              {mensagem.status === "enviado" && <RiCheckLine className="w-3 h-3" />}
              {mensagem.status === "entregue" && <RiCheckDoubleLine className="w-3 h-3" />}
              {mensagem.status === "lido" && <RiCheckDoubleLine className="w-3 h-3 text-blue-500" />}
            </span>
          )}
        </div>
      </div>

      {/* Message Actions on Hover */}
      <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? "order-0 mr-2" : "ml-2"}`}>
        <button 
          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400 hover:text-blue-500"
          title="Responder"
        >
          <RiReplyLine className="w-4 h-4" />
        </button>
        <button 
          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400 hover:text-amber-500"
          title="Favoritar"
        >
          <RiStarLine className="w-4 h-4" />
        </button>
        <button 
          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400 hover:text-green-500"
          title="Copiar"
          onClick={() => navigator.clipboard.writeText(mensagem.conteudo)}
        >
          <RiFileCopyLine className="w-4 h-4" />
        </button>
        {isMe && (
          <>
            <button 
              className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400 hover:text-orange-500"
              title="Editar"
            >
              <RiEditLine className="w-4 h-4" />
            </button>
            <button 
              className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400 hover:text-red-500"
              title="Apagar"
            >
              <RiDeleteBinLine className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

// Footer do Chat (Input) com IA
function ChatFooter({ onSend }: { onSend: (msg: string) => void }) {
  const [message, setMessage] = useState("");
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showAgentes, setShowAgentes] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedAgente, setSelectedAgente] = useState<Agente | null>(null);
  const [selectedAIModel, setSelectedAIModel] = useState<"grok" | "gpt" | "deepseek">("deepseek");
  const [aiPrompt, setAiPrompt] = useState("");
  const [generatingAI, setGeneratingAI] = useState(false);

  const aiModels = [
    { key: "grok" as const, name: "Grok", desc: "xAI - Rápido", color: "bg-blue-500" },
    { key: "gpt" as const, name: "GPT-4", desc: "OpenAI - Preciso", color: "bg-green-500" },
    { key: "deepseek" as const, name: "DeepSeek", desc: "Econômico", color: "bg-purple-500" },
  ];

  const aiTemplates = [
    { label: "Apresentar imóvel", prompt: "Crie uma mensagem apresentando um imóvel de forma atrativa e profissional" },
    { label: "Responder dúvida", prompt: "Responda de forma educada e profissional a dúvida do cliente sobre" },
    { label: "Agendar visita", prompt: "Sugira horários para agendar uma visita ao imóvel de interesse" },
    { label: "Negociar valor", prompt: "Crie uma resposta para negociação de valor de forma profissional" },
    { label: "Follow-up", prompt: "Crie uma mensagem de follow-up amigável para retomar contato" },
    { label: "Agradecer", prompt: "Agradeça o cliente pelo interesse e reforce disponibilidade" },
  ];

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) return;
    
    setGeneratingAI(true);
    try {
      // TODO: Integrar com APIs reais (Grok, GPT, DeepSeek)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulação de resposta
      const responses: Record<string, string> = {
        "Apresentar imóvel": `Olá! 🏠

Tenho uma excelente oportunidade para você! 

📍 Apartamento em localização privilegiada
✨ 3 quartos (1 suíte)
📐 120m² de área útil
🚗 2 vagas de garagem
🏊 Lazer completo

O imóvel está em perfeito estado e pronto para morar. Posso enviar mais fotos e agendar uma visita?

Aguardo seu retorno! 😊`,
        "Agendar visita": `Ótimo! Fico feliz com seu interesse! 📅

Tenho os seguintes horários disponíveis para visita:

🗓️ Sábado (14/12): 10h ou 14h
🗓️ Domingo (15/12): 11h ou 15h
🗓️ Segunda (16/12): 9h, 14h ou 17h

Qual horário funciona melhor para você?`,
        "Follow-up": `Olá! Tudo bem? 😊

Passando para saber se você teve a oportunidade de pensar sobre o imóvel que conversamos.

Caso tenha alguma dúvida ou queira agendar uma nova visita, estou à disposição!

Abraços! 🏠`,
      };

      const template = aiTemplates.find(t => aiPrompt.includes(t.label));
      const generatedMessage = template ? responses[template.label] || `Mensagem gerada com ${selectedAIModel.toUpperCase()}:\n\n${aiPrompt}` : `Resposta gerada:\n\n${aiPrompt}`;
      
      setMessage(generatedMessage);
      setShowAIPanel(false);
      setAiPrompt("");
    } catch (error) {
      console.error("Erro ao gerar com IA:", error);
    } finally {
      setGeneratingAI(false);
    }
  };

  return (
    <div className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
      {/* Quick Actions Bar */}
      <div className="px-2 md:px-4 py-2 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-1 md:gap-2 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => { setShowQuickReplies(!showQuickReplies); setShowAIPanel(false); setShowAgentes(false); }}
          className={`flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1.5 rounded-lg text-xs md:text-sm transition-colors whitespace-nowrap flex-shrink-0 ${showQuickReplies ? "bg-orange-100 dark:bg-orange-500/20 text-orange-600" : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"}`}
        >
          <RiFlashlightLine className="w-3.5 h-3.5 md:w-4 md:h-4" />
          <span className="hidden sm:inline">Respostas Rápidas</span>
          <span className="sm:hidden">Rápidas</span>
        </button>
        <button 
          onClick={() => { setShowAIPanel(!showAIPanel); setShowQuickReplies(false); setShowAgentes(false); }}
          className={`flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1.5 rounded-lg text-xs md:text-sm transition-colors whitespace-nowrap flex-shrink-0 ${showAIPanel ? "bg-purple-100 dark:bg-purple-500/20 text-purple-600" : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"}`}
        >
          <RiSparklingLine className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-500" />
          <span className="hidden sm:inline">Gerar com IA</span>
          <span className="sm:hidden">IA</span>
        </button>
        <button className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
          <RiVolumeUpLine className="w-4 h-4 text-blue-500" />
          <span>Áudio IA</span>
        </button>
        <div className="flex-1" />
        <button
          onClick={() => { setShowAgentes(!showAgentes); setShowQuickReplies(false); setShowAIPanel(false); }}
          className={`flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1.5 rounded-lg text-xs md:text-sm transition-colors whitespace-nowrap flex-shrink-0 ${selectedAgente ? `${selectedAgente.cor} text-white` : showAgentes ? "bg-purple-100 dark:bg-purple-500/20 text-purple-600" : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"}`}
        >
          <RiRobot2Line className="w-3.5 h-3.5 md:w-4 md:h-4" />
          <span className="hidden sm:inline">{selectedAgente ? selectedAgente.nome : "Agente IA"}</span>
          <span className="sm:hidden">Agente</span>
          <RiArrowDownSLine className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </button>
      </div>

      {/* Painel de Geração IA */}
      <AnimatePresence>
        {showAIPanel && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-neutral-100 dark:border-neutral-800"
          >
            <div className="p-3 space-y-3">
              {/* Seletor de Modelo */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-neutral-500">Modelo:</span>
                {aiModels.map((model) => (
                  <button
                    key={model.key}
                    onClick={() => setSelectedAIModel(model.key)}
                    className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                      selectedAIModel === model.key
                        ? `${model.color} text-white`
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                    }`}
                  >
                    {model.name}
                  </button>
                ))}
              </div>

              {/* Templates */}
              <div className="flex flex-wrap gap-2">
                {aiTemplates.map((template, i) => (
                  <button
                    key={i}
                    onClick={() => setAiPrompt(template.prompt)}
                    className={`px-2 py-1 rounded-full text-xs transition-colors ${
                      aiPrompt === template.prompt
                        ? "bg-purple-500 text-white"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-purple-100 dark:hover:bg-purple-500/20"
                    }`}
                  >
                    {template.label}
                  </button>
                ))}
              </div>

              {/* Input de Prompt */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Descreva o que deseja gerar..."
                  className="flex-1 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  onKeyDown={(e) => e.key === "Enter" && generateWithAI()}
                />
                <button
                  onClick={generateWithAI}
                  disabled={generatingAI || !aiPrompt.trim()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {generatingAI ? (
                    <RiLoader4Line className="w-4 h-4 animate-spin" />
                  ) : (
                    <RiSparklingLine className="w-4 h-4" />
                  )}
                  Gerar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Replies Panel */}
      <AnimatePresence>
        {showQuickReplies && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-neutral-100 dark:border-neutral-800"
          >
            <div className="p-3 flex flex-wrap gap-2">
              {respostasRapidas.map((resposta, index) => (
                <button
                  key={index}
                  onClick={() => { setMessage(resposta); setShowQuickReplies(false); }}
                  className="px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-orange-100 dark:hover:bg-orange-500/20 hover:text-orange-600 transition-colors"
                >
                  {resposta}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Agentes Panel */}
      <AnimatePresence>
        {showAgentes && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-neutral-100 dark:border-neutral-800"
          >
            <div className="p-3 grid grid-cols-2 gap-2">
              {agentes.map((agente) => (
                <button
                  key={agente.id}
                  onClick={() => { setSelectedAgente(selectedAgente?.id === agente.id ? null : agente); setShowAgentes(false); }}
                  className={`p-3 rounded-xl text-left transition-colors ${selectedAgente?.id === agente.id ? `${agente.cor} text-white` : "bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700"}`}
                >
                  <div className="flex items-center gap-2">
                    <RiRobot2Line className="w-5 h-5" />
                    <span className="font-medium text-sm">{agente.nome}</span>
                  </div>
                  <p className={`text-xs mt-1 ${selectedAgente?.id === agente.id ? "text-white/80" : "text-neutral-500"}`}>{agente.descricao}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="p-2 md:p-4 flex items-end gap-2 md:gap-3">
        <div className="hidden sm:flex items-center gap-1">
          <button className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500">
            <RiEmotionLine className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500">
            <RiAttachmentLine className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500">
            <RiImageLine className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile: apenas botão de anexo */}
        <button className="sm:hidden p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 flex-shrink-0">
          <RiAttachmentLine className="w-5 h-5" />
        </button>

        <div className="flex-1 relative min-w-0">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Digite uma mensagem..."
            rows={1}
            className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border-0 resize-none text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
            style={{ minHeight: "40px", maxHeight: "120px" }}
          />
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {message.trim() ? (
            <button
              onClick={handleSend}
              className="p-2.5 md:p-3 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-colors"
            >
              <RiSendPlaneLine className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`p-2.5 md:p-3 rounded-xl transition-colors ${isRecording ? "bg-red-500 text-white animate-pulse" : "bg-orange-500 text-white hover:bg-orange-600"}`}
            >
              {isRecording ? <RiMicFill className="w-5 h-5" /> : <RiMicLine className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== PÁGINA PRINCIPAL ====================
export default function ChatPage() {
  // Forçar sidebar recolhida na página de chat
  const { setIsCollapsed } = useSidebar();
  
  useEffect(() => {
    setIsCollapsed(true);
    // Restaurar ao sair da página
    return () => setIsCollapsed(false);
  }, [setIsCollapsed]);

  // WAHA State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [sessions, setSessions] = useState<WAHASession[]>([]);
  const [wahaChats, setWahaChats] = useState<WAHAChat[]>([]);
  const [isLoadingWaha, setIsLoadingWaha] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showSessionMenu, setShowSessionMenu] = useState(false);
  
  // Paginação de chats
  const CHATS_PER_PAGE = 30;
  const [chatsOffset, setChatsOffset] = useState(0);
  const [hasMoreChats, setHasMoreChats] = useState(true);
  const [isLoadingMoreChats, setIsLoadingMoreChats] = useState(false);
  const chatsListRef = useRef<HTMLDivElement>(null);

  // Chat State (mantendo compatibilidade com mock)
  const [contatoSelecionado, setContatoSelecionado] = useState<Contato | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Estado para ações (painel lateral)
  const [activeAction, setActiveAction] = useState<ActionType>(null);
  const [actionContato, setActionContato] = useState<Contato | null>(null);

  // Handler para ações do card
  const handleCardAction = (action: ActionType, contato: Contato) => {
    setActiveAction(action);
    setActionContato(contato);
    setContatoSelecionado(contato);
  };

  // Fechar painel de ação
  const closeActionPanel = () => {
    setActiveAction(null);
    setActionContato(null);
  };

  // Verificar sessões WAHA ao carregar
  const checkWahaSessions = useCallback(async () => {
    setIsLoadingWaha(true);
    try {
      const res = await fetch("/api/admin/waha/sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
        
        // Verificar se há sessão WORKING
        const workingSession = data.find((s: WAHASession) => s.status === "WORKING");
        if (workingSession) {
          setActiveSession(workingSession.name);
          setIsAuthenticated(true);
          // Carregar chats
          loadChats(workingSession.name);
        } else {
          setShowQRModal(true);
        }
      } else {
        setShowQRModal(true);
      }
    } catch (error) {
      console.error("Erro ao verificar sessões WAHA:", error);
      setShowQRModal(true);
    } finally {
      setIsLoadingWaha(false);
    }
  }, []);

  // Carregar chats da sessão (overview já inclui picture) - com paginação
  const loadChats = async (sessionId: string, reset = true) => {
    try {
      const offset = reset ? 0 : chatsOffset;
      const res = await fetch(`/api/admin/waha/sessions/${sessionId}/chats?limit=${CHATS_PER_PAGE}&offset=${offset}`);
      if (res.ok) {
        const chats = await res.json();
        if (reset) {
          setWahaChats(chats);
          setChatsOffset(CHATS_PER_PAGE);
        } else {
          setWahaChats(prev => [...prev, ...chats]);
          setChatsOffset(prev => prev + CHATS_PER_PAGE);
        }
        // Se retornou menos que o limite, não há mais chats
        setHasMoreChats(chats.length >= CHATS_PER_PAGE);
      }
    } catch (error) {
      console.error("Erro ao carregar chats:", error);
    }
  };

  // Carregar mais chats (infinite scroll)
  const loadMoreChats = async () => {
    if (!activeSession || isLoadingMoreChats || !hasMoreChats) return;
    
    setIsLoadingMoreChats(true);
    try {
      await loadChats(activeSession, false);
    } finally {
      setIsLoadingMoreChats(false);
    }
  };

  // Infinite scroll handler
  const handleChatsScroll = useCallback(() => {
    if (!chatsListRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = chatsListRef.current;
    // Carregar mais quando estiver a 100px do final
    if (scrollHeight - scrollTop - clientHeight < 100) {
      loadMoreChats();
    }
  }, [activeSession, isLoadingMoreChats, hasMoreChats, chatsOffset]);

  // Determinar tipo de mensagem baseado nos dados WAHA
  const getMessageType = (msg: WAHAMessage): Mensagem["tipo"] => {
    // Verificar tipo explícito primeiro
    if (msg.type) {
      switch (msg.type) {
        case "image": return "imagem";
        case "video": return "video";
        case "audio":
        case "ptt": return "audio";
        case "document": return "documento";
        case "location": return "localizacao";
        case "contact": return "contato";
        case "sticker": return "sticker";
      }
    }
    
    // Fallback: verificar mimetype
    if (msg.mimetype) {
      if (msg.mimetype.startsWith("image/")) return "imagem";
      if (msg.mimetype.startsWith("video/")) return "video";
      if (msg.mimetype.startsWith("audio/") || msg.mimetype.includes("ogg")) return "audio";
      if (msg.mimetype.includes("pdf") || msg.mimetype.includes("document")) return "documento";
    }
    
    // Fallback: verificar hasMedia
    if (msg.hasMedia && msg.mediaUrl) {
      const url = msg.mediaUrl.toLowerCase();
      if (url.match(/\.(jpg|jpeg|png|gif|webp)$/)) return "imagem";
      if (url.match(/\.(mp4|webm|mov)$/)) return "video";
      if (url.match(/\.(mp3|ogg|wav|opus)$/)) return "audio";
      if (url.match(/\.(pdf|doc|docx|xls|xlsx)$/)) return "documento";
    }
    
    return "texto";
  };

  // WAHA → formato da tela. Usado na carga da conversa e nas mensagens que
  // chegam depois (useChatAoVivo).
  const converterMensagem = (msg: WAHAMessage): Mensagem => {
    const tipo = getMessageType(msg);
    return {
      id: msg.id,
      conteudo: msg.body || msg.caption || "",
      tipo,
      remetente: msg.fromMe ? "eu" as const : "contato" as const,
      timestamp: new Date(msg.timestamp * 1000).toLocaleTimeString("pt-BR", { 
        hour: "2-digit", 
        minute: "2-digit" 
      }),
      status: "lido" as const,
      mediaUrl: msg.mediaUrl || msg.media?.url,
      mimetype: msg.mimetype || msg.media?.mimetype,
      filename: msg.filename || msg.media?.filename,
      caption: msg.caption,
      hasMedia: msg.hasMedia,
      location: msg.location,
      vcard: msg.vcard,
    };
  };

  // Carregar mensagens de um chat
  const loadMessages = async (chatId: string) => {
    if (!activeSession) return;
    
    setLoadingMessages(true);
    try {
      const res = await fetch(
        `/api/admin/waha/sessions/${activeSession}/chats/${encodeURIComponent(chatId)}/messages?limit=30&downloadMedia=true`
      );
      if (res.ok) {
        const wahaMessages: WAHAMessage[] = await res.json();
        
        // Converter mensagens WAHA para formato interno
        const convertedMessages: Mensagem[] = wahaMessages
          .sort((a, b) => a.timestamp - b.timestamp) // Ordenar por timestamp crescente
          .map(converterMensagem);
        
        setMensagens(convertedMessages);
      }
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
      setMensagens([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Mensagens e conversas novas sem recarregar a página (ver useChatAoVivo)
  const mensagensRef = useRef<Mensagem[]>([]);
  mensagensRef.current = mensagens;
  const { acordar } = useChatAoVivo<WAHAMessage, WAHAChat>({
    base: "/api/admin/waha/sessions",
    sessao: isAuthenticated ? activeSession : null,
    chatId: contatoSelecionado?.id ?? null,
    pronto: !loadingMessages,
    chatsPorPagina: CHATS_PER_PAGE,
    idsConhecidos: () => new Set(mensagensRef.current.map((m) => m.id)),
    aoNovasMensagens: (novas) => {
      setMensagens((prev) => {
        // A mensagem que EU enviei já está na tela com id provisório; quando
        // ela volta do WhatsApp com o id real, a provisória sai.
        let lista = prev;
        for (const n of novas) {
          if (!n.fromMe) continue;
          const i = lista.findIndex((m) => String(m.id).startsWith("tmp-") && m.conteudo === (n.body || ""));
          if (i >= 0) lista = lista.filter((_, j) => j !== i);
        }
        return [...lista, ...novas.map(converterMensagem)];
      });
    },
    aoAtualizarChats: (pagina) => setWahaChats((prev) => mesclarChats(prev, pagina)),
  });

  // Handler para selecionar contato e carregar mensagens
  const handleSelectContato = (contato: Contato) => {
    setContatoSelecionado(contato);
    
    // Se autenticado no WAHA, carregar mensagens reais
    if (isAuthenticated && activeSession) {
      loadMessages(contato.id);
    } else {
      // Usar mensagens mock
      setMensagens(mensagensIniciais);
    }
  };

  useEffect(() => {
    checkWahaSessions();
  }, [checkWahaSessions]);

  const handleSessionConnected = (sessionId: string) => {
    setActiveSession(sessionId);
    setIsAuthenticated(true);
    setShowQRModal(false);
    loadChats(sessionId);
  };

  // Desconectar sessão WAHA (logout)
  const handleDisconnectSession = async () => {
    if (!activeSession) return;
    
    setShowSessionMenu(false);
    
    const confirmed = window.confirm(
      `Deseja realmente desconectar a sessão "${activeSession}"?\n\nVocê precisará escanear o QR Code novamente para reconectar.`
    );
    
    if (!confirmed) return;

    // Limpar estado imediatamente para UX responsiva
    const resetState = () => {
      setIsAuthenticated(false);
      setActiveSession(null);
      setWahaChats([]);
      setMensagens([]);
      setContatoSelecionado(null);
      setChatsOffset(0);
      setHasMoreChats(true);
    };
    
    try {
      const res = await fetch(`/api/admin/waha/sessions/${activeSession}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
      
      if (!res.ok) {
        await fetch(`/api/admin/waha/sessions/${activeSession}`, { method: "DELETE" }).catch(() => {});
      }
    } catch (error) {
      console.error("Erro ao desconectar sessão:", error);
    }

    // Sempre resetar e mostrar modal, mesmo se a API falhar
    resetState();
    const freshSessions = await fetch("/api/admin/waha/sessions").then(r => r.ok ? r.json() : []).catch(() => []);
    setSessions(freshSessions);
    setShowQRModal(true);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  const handleSendMessage = async (conteudo: string) => {
    const novaMensagem: Mensagem = {
      id: `tmp-${Date.now()}`,
      conteudo,
      tipo: "texto",
      remetente: "eu",
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      status: "enviando",
    };
    setMensagens(prev => [...prev, novaMensagem]);
    
    // Se tiver sessão ativa, enviar via WAHA
    if (activeSession && contatoSelecionado) {
      try {
        await fetch(`/api/admin/waha/sessions/${activeSession}/chats/${contatoSelecionado.id}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: conteudo }),
        });
        setMensagens(prev => prev.map(m => m.id === novaMensagem.id ? { ...m, status: "enviado" } : m));
        acordar();
      } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
      }
    } else {
      // Simula status de envio (mock)
      setTimeout(() => {
        setMensagens(prev => prev.map(m => m.id === novaMensagem.id ? { ...m, status: "enviado" } : m));
      }, 500);
    }
    
    setTimeout(() => {
      setMensagens(prev => prev.map(m => m.id === novaMensagem.id ? { ...m, status: "entregue" } : m));
    }, 1000);
  };

  // Converter chats WAHA para formato de contatos (se autenticado)
  const contatosFiltrados = isAuthenticated && wahaChats.length > 0
    ? wahaChats
        .filter(chat => {
          const chatId = typeof chat.id === "string" ? chat.id : "";
          const name = chat.name || chatId.split("@")[0];
          return name.toLowerCase().includes(searchTerm.toLowerCase());
        })
        .map(chat => ({
          id: typeof chat.id === "string" ? chat.id : "",
          nome: chat.name || (typeof chat.id === "string" ? chat.id.split("@")[0] : ""),
          telefone: typeof chat.id === "string" ? chat.id.split("@")[0] : "",
          profilePicture: chat.picture || undefined,
          status: "offline" as const,
          tipo: "lead" as const,
          favorito: false,
          arquivado: false,
          ultimaMensagem: chat.lastMessage?.body || "",
          ultimaHora: chat.timestamp ? new Date(chat.timestamp * 1000).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "",
          naoLidas: chat.unreadCount || 0,
        }))
    : contatos.filter(c => {
        const matchSearch = c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || c.telefone.includes(searchTerm);
        const matchTipo = filtroTipo === "all" || c.tipo === filtroTipo;
        return matchSearch && matchTipo && !c.arquivado;
      });

  return (
    <>
      {/* QR Code Modal */}
      <WahaSessionModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        sessions={sessions}
        onSessionConnected={handleSessionConnected}
        onRefreshSessions={checkWahaSessions}
        isLoading={isLoadingWaha}
      />

      <div className={`h-[calc(100vh-4rem)] flex rounded-none md:rounded-2xl overflow-hidden border-0 md:border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 relative ${!isAuthenticated ? "pointer-events-none" : ""}`}>
        {/* Blur overlay quando não autenticado */}
        {!isAuthenticated && (
          <div className="absolute inset-0 z-40 backdrop-blur-md bg-white/50 dark:bg-neutral-900/50 flex items-center justify-center p-4">
            <div className="text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
                <RiWhatsappLine className="w-8 h-8 md:w-10 md:h-10 text-orange-500" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-neutral-900 dark:text-white mb-2">WhatsApp Desconectado</h3>
              <p className="text-sm md:text-base text-neutral-500 mb-4">Conecte seu WhatsApp para usar o chat</p>
              <button
                onClick={() => setShowQRModal(true)}
                className="px-4 py-2 md:px-6 md:py-3 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors pointer-events-auto text-sm md:text-base"
              >
                Conectar WhatsApp
              </button>
            </div>
          </div>
        )}

        {/* Sidebar de Contatos - esconde no mobile quando tem chat selecionado */}
        <div className={`${contatoSelecionado ? 'hidden md:flex' : 'flex'} w-full md:w-96 border-r-0 md:border-r border-neutral-200 dark:border-neutral-800 flex-col bg-white dark:bg-neutral-900`}>
          {/* Header */}
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <RiChat1Line className="w-6 h-6 text-orange-500" />
                Chat ao Vivo
              </h1>
              <div className="flex items-center gap-2 relative">
                {isAuthenticated ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowSessionMenu(!showSessionMenu)}
                      className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 text-xs font-medium flex items-center gap-1 hover:bg-green-200 dark:hover:bg-green-500/30 transition-colors cursor-pointer"
                    >
                      <RiWifiLine className="w-3 h-3" />
                      Conectado
                      <RiArrowDownSLine className="w-3 h-3" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {showSessionMenu && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -5 }}
                          className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 py-2 z-50"
                        >
                          {/* Sessão Atual */}
                          <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-700">
                            <p className="text-xs text-neutral-500 mb-1">Sessão ativa</p>
                            <p className="text-sm font-medium text-neutral-900 dark:text-white flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-green-500" />
                              {activeSession || "default"}
                            </p>
                          </div>
                          
                          {/* Opções */}
                          <div className="py-1">
                            <button
                              onClick={() => {
                                setShowSessionMenu(false);
                                setShowQRModal(true);
                              }}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2 text-neutral-700 dark:text-neutral-300"
                            >
                              <RiAddLine className="w-4 h-4 text-blue-500" />
                              Adicionar nova sessão
                            </button>
                            <button
                              onClick={() => {
                                setShowSessionMenu(false);
                                checkWahaSessions();
                              }}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2 text-neutral-700 dark:text-neutral-300"
                            >
                              <RiRefreshLine className="w-4 h-4 text-green-500" />
                              Atualizar chats
                            </button>
                          </div>
                          
                          {/* Desconectar */}
                          <div className="border-t border-neutral-100 dark:border-neutral-700 pt-1">
                            <button
                              onClick={handleDisconnectSession}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 text-red-600"
                            >
                              <RiLinkUnlinkM className="w-4 h-4" />
                              Desconectar WhatsApp
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowQRModal(true)}
                    className="px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 text-xs font-medium flex items-center gap-1 hover:bg-orange-200 transition-colors"
                  >
                    <RiQrCodeLine className="w-3 h-3" />
                    Conectar
                  </button>
                )}
              </div>
            </div>

          {/* Search */}
          <div className="relative">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar conversas..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-0 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-1 mt-3 overflow-x-auto">
            {["all", "lead", "cliente", "proprietario"].map(tipo => (
              <button
                key={tipo}
                onClick={() => setFiltroTipo(tipo)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  filtroTipo === tipo ? "bg-orange-500 text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                }`}
              >
                {tipo === "all" ? "Todos" : tipoConfig[tipo as keyof typeof tipoConfig].label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Contatos com Infinite Scroll */}
        <div 
          ref={chatsListRef}
          onScroll={handleChatsScroll}
          className="flex-1 overflow-y-auto pt-2"
        >
          {contatosFiltrados.map(contato => (
            <ContatoCard
              key={contato.id}
              contato={contato}
              isSelected={contatoSelecionado?.id === contato.id}
              onClick={() => handleSelectContato(contato)}
              onAction={handleCardAction}
            />
          ))}
          
          {/* Loading indicator para infinite scroll */}
          {isLoadingMoreChats && (
            <div className="flex items-center justify-center py-4">
              <RiLoader4Line className="w-5 h-5 text-orange-500 animate-spin" />
              <span className="ml-2 text-sm text-neutral-500">Carregando mais...</span>
            </div>
          )}
          
          {/* Indicador de fim da lista */}
          {!hasMoreChats && wahaChats.length > 0 && isAuthenticated && (
            <div className="text-center py-4 text-xs text-neutral-400">
              Todos os chats carregados
            </div>
          )}
        </div>
      </div>

      {/* Área do Chat - mostra no mobile quando tem chat selecionado */}
      <div className={`${contatoSelecionado ? 'flex' : 'hidden md:flex'} flex-1 flex-col relative`}>
        {contatoSelecionado ? (
          <>
            {/* Header com botão voltar no mobile */}
            <div className="flex items-center bg-white dark:bg-neutral-900">
              <button
                onClick={() => setContatoSelecionado(null)}
                className="md:hidden p-2 ml-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 flex-shrink-0"
              >
                <RiArrowLeftSLine className="w-5 h-5" />
              </button>
              <div className="flex-1 min-w-0">
                <ChatHeader 
                  contato={contatoSelecionado} 
                  onAction={(action) => {
                    setActiveAction(action);
                    setActionContato(contatoSelecionado);
                  }}
                />
              </div>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-3 md:space-y-4 bg-[#f0f2f5] dark:bg-neutral-950">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <RiLoader4Line className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-neutral-500">Carregando mensagens...</p>
                  </div>
                </div>
              ) : mensagens.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-neutral-400">
                    <RiMessage2Line className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma mensagem ainda</p>
                    <p className="text-sm">Envie uma mensagem para iniciar a conversa</p>
                  </div>
                </div>
              ) : (
                mensagens.map(mensagem => (
                  <MensagemBubble key={mensagem.id} mensagem={mensagem} />
                ))
              )}
              <div ref={messagesEndRef} />

              {/* Painel Lateral de Ações */}
              <AnimatePresence>
                {activeAction && actionContato && (
                  <motion.div
                    initial={{ opacity: 0, x: 300 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 300 }}
                    className="fixed right-4 top-24 bottom-24 w-80 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 z-50 overflow-hidden flex flex-col"
                  >
                    <div className="p-4 overflow-y-auto flex-1">
                      {activeAction === "lead" && (
                        <ConvertToLeadAction
                          chatId={actionContato.id}
                          chatName={actionContato.nome}
                          chatPhone={actionContato.telefone}
                          onBack={closeActionPanel}
                        />
                      )}
                      {activeAction === "schedule" && (
                        <ScheduleVisitAction
                          chatId={actionContato.id}
                          chatName={actionContato.nome}
                          onBack={closeActionPanel}
                        />
                      )}
                      {activeAction === "proposal" && (
                        <ProposalAction
                          chatId={actionContato.id}
                          chatName={actionContato.nome}
                          onBack={closeActionPanel}
                        />
                      )}
                      {activeAction === "contract" && (
                        <ContractAction
                          chatId={actionContato.id}
                          chatName={actionContato.nome}
                          onBack={closeActionPanel}
                        />
                      )}
                      {activeAction === "analysis" && (
                        <AIAnalysisAction
                          chatId={actionContato.id}
                          chatName={actionContato.nome}
                          messages={mensagens.map(m => ({ content: m.conteudo, isMe: m.remetente === "eu" }))}
                          onBack={closeActionPanel}
                        />
                      )}
                      {activeAction === "notes" && (
                        <NotesAction
                          chatId={actionContato.id}
                          chatName={actionContato.nome}
                          onBack={closeActionPanel}
                        />
                      )}
                      {activeAction === "checklist" && (
                        <ChecklistAction
                          chatId={actionContato.id}
                          chatName={actionContato.nome}
                          onBack={closeActionPanel}
                        />
                      )}
                      {activeAction === "budget" && (
                        <BudgetAction
                          chatId={actionContato.id}
                          chatName={actionContato.nome}
                          onBack={closeActionPanel}
                        />
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <ChatFooter onSend={handleSendMessage} />
          </>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center text-neutral-400">
            <div className="text-center">
              <RiChat1Line className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Selecione uma conversa para começar</p>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
