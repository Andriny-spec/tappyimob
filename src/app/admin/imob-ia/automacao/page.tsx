"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiRobot2Line,
  RiAddLine,
  RiPlayCircleLine,
  RiPauseCircleLine,
  RiEditLine,
  RiDeleteBinLine,
  RiMoreLine,
  RiArrowLeftLine,
  RiSearchLine,
  RiFlashlightLine,
  RiWhatsappLine,
  RiMailLine,
  RiPhoneLine,
  RiCalendarLine,
  RiUserAddLine,
  RiTimeLine,
  RiFilter3Line,
  RiCheckboxLine,
  RiMessage2Line,
  RiImageLine,
  RiVolumeUpLine,
  RiFileTextLine,
  RiTeamLine,
  RiHome4Line,
  RiMoneyDollarCircleLine,
  RiMapPinLine,
  RiStarLine,
  RiSparklingLine,
  RiMagicLine,
  RiBrainLine,
  RiTranslate2,
  RiSettings4Line,
  RiCloseLine,
  RiDragMove2Line,
  RiZoomInLine,
  RiZoomOutLine,
  RiFocusLine,
  RiSave3Line,
  RiArrowRightSLine,
  RiArrowDownSLine,
  RiGitBranchLine,
  RiLoopLeftLine,
  RiAlertLine,
  RiEyeLine,
  RiNodeTree,
  RiLink,
  RiArrowRightLine,
} from "react-icons/ri";

// ==================== TIPOS ====================
interface Automacao {
  id: string;
  nome: string;
  descricao: string;
  status: "ativa" | "pausada" | "rascunho";
  gatilho: string;
  acoes: number;
  execucoes: number;
  ultimaExecucao?: string;
  criadaEm: string;
}

interface NodeData {
  id: string;
  tipo: "gatilho" | "condicao" | "acao" | "ia";
  categoria: string;
  nome: string;
  icone: React.ComponentType<{ className?: string }>;
  cor: string;
  config?: Record<string, string | number | boolean>;
  posicao: { x: number; y: number };
  conexoes: string[];
}

interface CategoriaItem {
  id: string;
  nome: string;
  descricao: string;
  icone: React.ComponentType<{ className?: string }>;
  cor: string;
  tipo: "gatilho" | "condicao" | "acao" | "ia";
}

// ==================== DADOS MOCK ====================
const automacoes: Automacao[] = [
  { id: "1", nome: "Boas-vindas Lead", descricao: "Envia mensagem de boas-vindas quando um novo lead é criado", status: "ativa", gatilho: "Novo Lead", acoes: 4, execucoes: 1234, ultimaExecucao: "2024-01-25T10:30:00", criadaEm: "2024-01-01" },
  { id: "2", nome: "Follow-up Visita", descricao: "Envia follow-up automático após visita realizada", status: "ativa", gatilho: "Visita Concluída", acoes: 3, execucoes: 567, ultimaExecucao: "2024-01-25T09:15:00", criadaEm: "2024-01-05" },
  { id: "3", nome: "Qualificação IA", descricao: "Qualifica leads automaticamente usando IA", status: "ativa", gatilho: "Novo Lead", acoes: 5, execucoes: 890, ultimaExecucao: "2024-01-25T10:00:00", criadaEm: "2024-01-10" },
  { id: "4", nome: "Lembrete de Visita", descricao: "Envia lembrete 24h antes da visita agendada", status: "pausada", gatilho: "Visita Agendada", acoes: 2, execucoes: 234, ultimaExecucao: "2024-01-20T08:00:00", criadaEm: "2024-01-08" },
  { id: "5", nome: "Reativação de Leads", descricao: "Reativa leads inativos há mais de 30 dias", status: "rascunho", gatilho: "Agendado", acoes: 6, execucoes: 0, criadaEm: "2024-01-20" },
];

// Gatilhos disponíveis
const gatilhos: CategoriaItem[] = [
  { id: "g1", nome: "Novo Lead", descricao: "Quando um novo lead é criado", icone: RiUserAddLine, cor: "bg-blue-500", tipo: "gatilho" },
  { id: "g2", nome: "Mensagem Recebida", descricao: "Quando recebe mensagem no WhatsApp", icone: RiWhatsappLine, cor: "bg-green-500", tipo: "gatilho" },
  { id: "g3", nome: "Visita Agendada", descricao: "Quando uma visita é agendada", icone: RiCalendarLine, cor: "bg-purple-500", tipo: "gatilho" },
  { id: "g4", nome: "Visita Concluída", descricao: "Quando uma visita é realizada", icone: RiCheckboxLine, cor: "bg-emerald-500", tipo: "gatilho" },
  { id: "g5", nome: "Proposta Enviada", descricao: "Quando uma proposta é enviada", icone: RiFileTextLine, cor: "bg-amber-500", tipo: "gatilho" },
  { id: "g6", nome: "Status Alterado", descricao: "Quando o status do lead muda", icone: RiLoopLeftLine, cor: "bg-pink-500", tipo: "gatilho" },
  { id: "g7", nome: "Agendado", descricao: "Executa em horário específico", icone: RiTimeLine, cor: "bg-indigo-500", tipo: "gatilho" },
  { id: "g8", nome: "Imóvel Favoritado", descricao: "Quando cliente favorita imóvel", icone: RiStarLine, cor: "bg-yellow-500", tipo: "gatilho" },
];

// Condições disponíveis
const condicoes: CategoriaItem[] = [
  { id: "c1", nome: "Se Lead Qualificado", descricao: "Verifica se o lead está qualificado", icone: RiFilter3Line, cor: "bg-violet-500", tipo: "condicao" },
  { id: "c2", nome: "Se Orçamento >=", descricao: "Verifica orçamento mínimo", icone: RiMoneyDollarCircleLine, cor: "bg-green-500", tipo: "condicao" },
  { id: "c3", nome: "Se Região =", descricao: "Verifica região de interesse", icone: RiMapPinLine, cor: "bg-blue-500", tipo: "condicao" },
  { id: "c4", nome: "Se Tipo Imóvel =", descricao: "Verifica tipo de imóvel", icone: RiHome4Line, cor: "bg-orange-500", tipo: "condicao" },
  { id: "c5", nome: "Se Horário Entre", descricao: "Verifica horário comercial", icone: RiTimeLine, cor: "bg-indigo-500", tipo: "condicao" },
  { id: "c6", nome: "Se Já Respondeu", descricao: "Verifica se cliente respondeu", icone: RiMessage2Line, cor: "bg-cyan-500", tipo: "condicao" },
  { id: "c7", nome: "Se Corretor Atribuído", descricao: "Verifica se tem corretor", icone: RiTeamLine, cor: "bg-purple-500", tipo: "condicao" },
  { id: "c8", nome: "Se Pontuação >=", descricao: "Verifica score do lead", icone: RiStarLine, cor: "bg-amber-500", tipo: "condicao" },
];

// Ações disponíveis
const acoes: CategoriaItem[] = [
  { id: "a1", nome: "Enviar WhatsApp", descricao: "Envia mensagem de texto", icone: RiWhatsappLine, cor: "bg-green-500", tipo: "acao" },
  { id: "a2", nome: "Enviar Áudio", descricao: "Envia mensagem de áudio", icone: RiVolumeUpLine, cor: "bg-green-600", tipo: "acao" },
  { id: "a3", nome: "Enviar Imagem", descricao: "Envia imagem pelo WhatsApp", icone: RiImageLine, cor: "bg-green-700", tipo: "acao" },
  { id: "a4", nome: "Enviar E-mail", descricao: "Envia e-mail automático", icone: RiMailLine, cor: "bg-blue-500", tipo: "acao" },
  { id: "a5", nome: "Criar Tarefa", descricao: "Cria tarefa para corretor", icone: RiCheckboxLine, cor: "bg-purple-500", tipo: "acao" },
  { id: "a6", nome: "Atribuir Corretor", descricao: "Atribui corretor ao lead", icone: RiTeamLine, cor: "bg-indigo-500", tipo: "acao" },
  { id: "a7", nome: "Alterar Status", descricao: "Muda status do lead", icone: RiLoopLeftLine, cor: "bg-amber-500", tipo: "acao" },
  { id: "a8", nome: "Agendar Visita", descricao: "Agenda visita automaticamente", icone: RiCalendarLine, cor: "bg-pink-500", tipo: "acao" },
  { id: "a9", nome: "Adicionar Tag", descricao: "Adiciona tag ao lead", icone: RiFlashlightLine, cor: "bg-cyan-500", tipo: "acao" },
  { id: "a10", nome: "Aguardar", descricao: "Espera X minutos/horas/dias", icone: RiTimeLine, cor: "bg-neutral-500", tipo: "acao" },
  { id: "a11", nome: "Notificar Equipe", descricao: "Envia notificação interna", icone: RiAlertLine, cor: "bg-red-500", tipo: "acao" },
  { id: "a12", nome: "Webhook", descricao: "Chama URL externa", icone: RiLink, cor: "bg-slate-500", tipo: "acao" },
];

// Ações de IA
const acoesIA: CategoriaItem[] = [
  { id: "ia1", nome: "Gerar Texto IA", descricao: "Gera resposta personalizada com IA", icone: RiSparklingLine, cor: "bg-gradient-to-r from-purple-500 to-pink-500", tipo: "ia" },
  { id: "ia2", nome: "Gerar Imagem IA", descricao: "Gera imagem com IA", icone: RiMagicLine, cor: "bg-gradient-to-r from-blue-500 to-cyan-500", tipo: "ia" },
  { id: "ia3", nome: "Qualificar Lead IA", descricao: "Qualifica lead automaticamente", icone: RiBrainLine, cor: "bg-gradient-to-r from-emerald-500 to-orange-500", tipo: "ia" },
  { id: "ia4", nome: "Classificar Intenção", descricao: "Classifica intenção da mensagem", icone: RiNodeTree, cor: "bg-gradient-to-r from-green-500 to-emerald-500", tipo: "ia" },
  { id: "ia5", nome: "Resumir Conversa", descricao: "Resume conversa com IA", icone: RiFileTextLine, cor: "bg-gradient-to-r from-indigo-500 to-violet-500", tipo: "ia" },
  { id: "ia6", nome: "Traduzir Mensagem", descricao: "Traduz mensagem automaticamente", icone: RiTranslate2, cor: "bg-gradient-to-r from-rose-500 to-pink-500", tipo: "ia" },
  { id: "ia7", nome: "Sugerir Imóveis", descricao: "Sugere imóveis com base no perfil", icone: RiHome4Line, cor: "bg-gradient-to-r from-teal-500 to-cyan-500", tipo: "ia" },
  { id: "ia8", nome: "Análise de Sentimento", descricao: "Analisa sentimento do cliente", icone: RiEyeLine, cor: "bg-gradient-to-r from-fuchsia-500 to-purple-500", tipo: "ia" },
];

// Nodes exemplo para o builder
const nodesExemplo: NodeData[] = [
  { id: "n1", tipo: "gatilho", categoria: "Novo Lead", nome: "Novo Lead", icone: RiUserAddLine, cor: "bg-blue-500", posicao: { x: 100, y: 200 }, conexoes: ["n2"] },
  { id: "n2", tipo: "condicao", categoria: "Se Lead Qualificado", nome: "Se Lead Qualificado", icone: RiFilter3Line, cor: "bg-violet-500", posicao: { x: 350, y: 200 }, conexoes: ["n3", "n4"] },
  { id: "n3", tipo: "ia", categoria: "Gerar Texto IA", nome: "Gerar Texto IA", icone: RiSparklingLine, cor: "bg-purple-500", posicao: { x: 600, y: 100 }, conexoes: ["n5"] },
  { id: "n4", tipo: "acao", categoria: "Criar Tarefa", nome: "Criar Tarefa", icone: RiCheckboxLine, cor: "bg-amber-500", posicao: { x: 600, y: 300 }, conexoes: [] },
  { id: "n5", tipo: "acao", categoria: "Enviar WhatsApp", nome: "Enviar WhatsApp", icone: RiWhatsappLine, cor: "bg-green-500", posicao: { x: 850, y: 100 }, conexoes: [] },
];

// ==================== COMPONENTES ====================

// Card de Automação
function AutomacaoCard({ automacao, onClick }: { automacao: Automacao; onClick: () => void }) {
  const statusConfig = {
    ativa: { label: "Ativa", cor: "bg-green-100 dark:bg-green-500/20 text-green-600", icon: RiPlayCircleLine },
    pausada: { label: "Pausada", cor: "bg-amber-100 dark:bg-amber-500/20 text-amber-600", icon: RiPauseCircleLine },
    rascunho: { label: "Rascunho", cor: "bg-neutral-100 dark:bg-neutral-500/20 text-neutral-600", icon: RiEditLine },
  };
  const status = statusConfig[automacao.status];
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-emerald-500 flex items-center justify-center">
            <RiRobot2Line className="w-6 h-6 text-white" />
          </div>
          <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.cor}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {status.label}
          </span>
        </div>

        <h3 className="font-bold text-neutral-900 dark:text-white mb-1">{automacao.nome}</h3>
        <p className="text-sm text-neutral-500 mb-4 line-clamp-2">{automacao.descricao}</p>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-neutral-500">
            <RiFlashlightLine className="w-4 h-4 text-orange-500" />
            <span>{automacao.gatilho}</span>
          </div>
          <div className="flex items-center gap-1 text-neutral-500">
            <RiNodeTree className="w-4 h-4" />
            <span>{automacao.acoes} ações</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <span className="text-xs text-neutral-400">
            {automacao.execucoes.toLocaleString()} execuções
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={e => e.stopPropagation()} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400">
              <RiEditLine className="w-4 h-4" />
            </button>
            <button onClick={e => e.stopPropagation()} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400">
              <RiMoreLine className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Item da Sidebar (Gatilho/Condição/Ação)
function SidebarItem({ item, onDragStart }: { item: CategoriaItem; onDragStart: (item: CategoriaItem) => void }) {
  const Icon = item.icone;

  return (
    <motion.div
      draggable
      onDragStart={() => onDragStart(item)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 cursor-grab active:cursor-grabbing hover:border-orange-300 dark:hover:border-orange-500/50 transition-colors"
    >
      <div className={`w-9 h-9 rounded-lg ${item.cor} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{item.nome}</p>
        <p className="text-xs text-neutral-500 truncate">{item.descricao}</p>
      </div>
      <RiDragMove2Line className="w-4 h-4 text-neutral-400 flex-shrink-0" />
    </motion.div>
  );
}

// Node no Board
function BoardNode({ node, isSelected, onClick, onDrag }: { node: NodeData; isSelected: boolean; onClick: () => void; onDrag: (id: string, pos: { x: number; y: number }) => void }) {
  const Icon = node.icone;
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    if (nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect();
      onDrag(node.id, { x: e.clientX - rect.width / 2, y: e.clientY - rect.height / 2 });
    }
  };

  return (
    <motion.div
      ref={nodeRef}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      drag
      dragMomentum={false}
      onDrag={(e, info) => onDrag(node.id, { x: node.posicao.x + info.delta.x, y: node.posicao.y + info.delta.y })}
      onClick={onClick}
      style={{ position: "absolute", left: node.posicao.x, top: node.posicao.y }}
      className={`cursor-pointer ${isSelected ? "z-20" : "z-10"}`}
    >
      <div className={`w-48 bg-white dark:bg-neutral-900 rounded-2xl border-2 ${isSelected ? "border-orange-500 shadow-lg shadow-orange-500/20" : "border-neutral-200 dark:border-neutral-700"} overflow-hidden`}>
        {/* Header */}
        <div className={`${node.cor} px-3 py-2 flex items-center gap-2`}>
          <Icon className="w-4 h-4 text-white" />
          <span className="text-xs font-medium text-white uppercase">{node.tipo}</span>
        </div>
        
        {/* Body */}
        <div className="p-3">
          <p className="font-medium text-sm text-neutral-900 dark:text-white">{node.nome}</p>
          {node.config && (
            <p className="text-xs text-neutral-500 mt-1">Configurado ✓</p>
          )}
        </div>

        {/* Connection Points */}
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-neutral-300 dark:bg-neutral-600 border-2 border-white dark:border-neutral-900" />
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-orange-500 border-2 border-white dark:border-neutral-900" />
      </div>
    </motion.div>
  );
}

// Conexão entre Nodes
function NodeConnection({ from, to }: { from: { x: number; y: number }; to: { x: number; y: number } }) {
  const startX = from.x + 192; // largura do node
  const startY = from.y + 40; // metade da altura
  const endX = to.x;
  const endY = to.y + 40;
  
  const midX = (startX + endX) / 2;
  const path = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
      <path d={path} fill="none" stroke="#25D366" strokeWidth="2" strokeDasharray="5,5" />
      <circle cx={endX} cy={endY} r="4" fill="#25D366" />
    </svg>
  );
}

// Painel de Configuração do Node
function NodeConfigPanel({ node, onClose, onSave }: { node: NodeData | null; onClose: () => void; onSave: (config: Record<string, string>) => void }) {
  const [config, setConfig] = useState<Record<string, string>>({});

  if (!node) return null;

  const Icon = node.icone;

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 z-30 flex flex-col"
    >
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${node.cor} flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-neutral-900 dark:text-white">{node.nome}</h3>
            <p className="text-xs text-neutral-500 capitalize">{node.tipo}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <RiCloseLine className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Configurações específicas por tipo */}
        {node.tipo === "gatilho" && (
          <>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Quando executar</label>
              <select className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-0 text-sm">
                <option>Imediatamente</option>
                <option>Após 5 minutos</option>
                <option>Após 1 hora</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Filtrar por origem</label>
              <select className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-0 text-sm">
                <option>Todas as origens</option>
                <option>Site</option>
                <option>WhatsApp</option>
                <option>Portais</option>
              </select>
            </div>
          </>
        )}

        {node.tipo === "condicao" && (
          <>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Operador</label>
              <select className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-0 text-sm">
                <option>É igual a</option>
                <option>Não é igual a</option>
                <option>Contém</option>
                <option>Maior que</option>
                <option>Menor que</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Valor</label>
              <input type="text" placeholder="Digite o valor..." className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-0 text-sm" />
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl">
              <p className="text-xs text-amber-700 dark:text-amber-400">
                <strong>Sim:</strong> Continua para o próximo nó conectado acima<br />
                <strong>Não:</strong> Segue para o nó conectado abaixo
              </p>
            </div>
          </>
        )}

        {node.tipo === "acao" && node.categoria.includes("WhatsApp") && (
          <>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Template de Mensagem</label>
              <select className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-0 text-sm">
                <option>Boas-vindas</option>
                <option>Follow-up Visita</option>
                <option>Confirmação</option>
                <option>Personalizado...</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Mensagem</label>
              <textarea rows={4} placeholder="Digite a mensagem..." className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-0 text-sm resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Variáveis disponíveis</label>
              <div className="flex flex-wrap gap-1">
                {["{{nome}}", "{{telefone}}", "{{imovel}}", "{{corretor}}"].map(v => (
                  <span key={v} className="px-2 py-1 bg-orange-100 dark:bg-orange-500/20 text-orange-600 text-xs rounded-lg cursor-pointer hover:bg-orange-200">{v}</span>
                ))}
              </div>
            </div>
          </>
        )}

        {node.tipo === "ia" && (
          <>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Modelo de IA</label>
              <select className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-0 text-sm">
                <option>GPT-4o (Recomendado)</option>
                <option>GPT-4o Mini (Rápido)</option>
                <option>Claude 3.5 Sonnet</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Prompt do Sistema</label>
              <textarea rows={4} placeholder="Defina o comportamento da IA..." className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-0 text-sm resize-none" defaultValue="Você é um assistente imobiliário profissional. Responda de forma cordial e objetiva." />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Contexto adicional</label>
              <div className="space-y-2">
                {["Histórico do lead", "Imóveis favoritos", "Última conversa"].map(ctx => (
                  <label key={ctx} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded text-orange-500" />
                    <span className="text-neutral-600 dark:text-neutral-400">{ctx}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
        <button onClick={() => onSave(config)} className="w-full h-10 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 flex items-center justify-center gap-2">
          <RiSave3Line className="w-4 h-4" />
          Salvar Configuração
        </button>
      </div>
    </motion.div>
  );
}

// ==================== PÁGINA PRINCIPAL ====================
export default function AutomacaoPage() {
  const [view, setView] = useState<"lista" | "builder">("lista");
  const [automacaoSelecionada, setAutomacaoSelecionada] = useState<Automacao | null>(null);
  const [nodes, setNodes] = useState<NodeData[]>(nodesExemplo);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [zoom, setZoom] = useState(1);
  const [sidebarTab, setSidebarTab] = useState<"gatilhos" | "condicoes" | "acoes" | "ia">("gatilhos");
  const [searchSidebar, setSearchSidebar] = useState("");
  const boardRef = useRef<HTMLDivElement>(null);

  const handleOpenBuilder = (automacao: Automacao) => {
    setAutomacaoSelecionada(automacao);
    setView("builder");
  };

  const handleDragStart = (item: CategoriaItem) => {
    // Ao arrastar da sidebar para o board, cria um novo node
  };

  const handleNodeDrag = (id: string, pos: { x: number; y: number }) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, posicao: pos } : n));
  };

  const handleAddNode = (item: CategoriaItem) => {
    const newNode: NodeData = {
      id: `n${Date.now()}`,
      tipo: item.tipo,
      categoria: item.nome,
      nome: item.nome,
      icone: item.icone,
      cor: item.cor,
      posicao: { x: 400, y: 200 },
      conexoes: [],
    };
    setNodes([...nodes, newNode]);
  };

  const getSidebarItems = () => {
    let items: CategoriaItem[] = [];
    switch (sidebarTab) {
      case "gatilhos": items = gatilhos; break;
      case "condicoes": items = condicoes; break;
      case "acoes": items = acoes; break;
      case "ia": items = acoesIA; break;
    }
    if (searchSidebar) {
      items = items.filter(i => i.nome.toLowerCase().includes(searchSidebar.toLowerCase()));
    }
    return items;
  };

  // Lista de Automações
  if (view === "lista") {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-emerald-500 flex items-center justify-center">
                <RiRobot2Line className="w-5 h-5 text-white" />
              </div>
              Automações
            </h1>
            <p className="text-neutral-500 mt-1">Automatize seu CRM + WhatsApp com IA</p>
          </div>

          <button
            onClick={() => { setAutomacaoSelecionada(null); setNodes([]); setView("builder"); }}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-emerald-500 text-white font-medium hover:opacity-90"
          >
            <RiAddLine className="w-4 h-4" />
            Nova Automação
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Automações Ativas", value: automacoes.filter(a => a.status === "ativa").length, cor: "bg-green-500" },
            { label: "Execuções Hoje", value: "1.2K", cor: "bg-blue-500" },
            { label: "Taxa de Sucesso", value: "98%", cor: "bg-purple-500" },
            { label: "Leads Impactados", value: "456", cor: "bg-orange-500" },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <div className={`w-10 h-10 rounded-xl ${stat.cor} flex items-center justify-center text-white font-bold mb-2`}>
                {typeof stat.value === "number" ? stat.value : stat.value}
              </div>
              <p className="text-sm text-neutral-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Grid de Automações */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {automacoes.map((automacao, i) => (
            <motion.div key={automacao.id} transition={{ delay: i * 0.05 }}>
              <AutomacaoCard automacao={automacao} onClick={() => handleOpenBuilder(automacao)} />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Builder de Automação
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header do Builder */}
      <div className="h-14 px-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => setView("lista")} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <RiArrowLeftLine className="w-5 h-5" />
          </button>
          <div>
            <input
              type="text"
              defaultValue={automacaoSelecionada?.nome || "Nova Automação"}
              className="font-bold text-lg bg-transparent border-0 focus:outline-none focus:ring-0 text-neutral-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-l-lg">
              <RiZoomOutLine className="w-4 h-4" />
            </button>
            <span className="px-2 text-sm">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(Math.min(1.5, zoom + 0.1))} className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-r-lg">
              <RiZoomInLine className="w-4 h-4" />
            </button>
          </div>
          <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <RiFocusLine className="w-5 h-5" />
          </button>
          <button className="flex items-center gap-2 h-9 px-4 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600">
            <RiSave3Line className="w-4 h-4" />
            Salvar
          </button>
        </div>
      </div>

      {/* Main Builder Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar de Componentes */}
        <div className="w-72 bg-neutral-50 dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 flex flex-col flex-shrink-0">
          {/* Tabs */}
          <div className="p-2 border-b border-neutral-200 dark:border-neutral-800">
            <div className="grid grid-cols-4 gap-1">
              {[
                { key: "gatilhos", icon: RiFlashlightLine, label: "Gatilhos" },
                { key: "condicoes", icon: RiGitBranchLine, label: "Condições" },
                { key: "acoes", icon: RiPlayCircleLine, label: "Ações" },
                { key: "ia", icon: RiSparklingLine, label: "IA" },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setSidebarTab(tab.key as typeof sidebarTab)}
                  className={`p-2 rounded-lg text-center transition-colors ${
                    sidebarTab === tab.key
                      ? "bg-orange-500 text-white"
                      : "hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                  }`}
                  title={tab.label}
                >
                  <tab.icon className="w-5 h-5 mx-auto" />
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-neutral-200 dark:border-neutral-800">
            <div className="relative">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchSidebar}
                onChange={e => setSearchSidebar(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
              />
            </div>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {getSidebarItems().map(item => (
              <div key={item.id} onClick={() => handleAddNode(item)}>
                <SidebarItem item={item} onDragStart={handleDragStart} />
              </div>
            ))}
          </div>
        </div>

        {/* Board */}
        <div
          ref={boardRef}
          className="flex-1 bg-[#f8f9fa] dark:bg-neutral-950 relative overflow-auto"
          style={{
            backgroundImage: "radial-gradient(circle, #ddd 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        >
          <div style={{ transform: `scale(${zoom})`, transformOrigin: "0 0", minWidth: "2000px", minHeight: "1500px", position: "relative" }}>
            {/* Conexões */}
            {nodes.map(node =>
              node.conexoes.map(targetId => {
                const target = nodes.find(n => n.id === targetId);
                if (!target) return null;
                return <NodeConnection key={`${node.id}-${targetId}`} from={node.posicao} to={target.posicao} />;
              })
            )}

            {/* Nodes */}
            {nodes.map(node => (
              <BoardNode
                key={node.id}
                node={node}
                isSelected={selectedNode?.id === node.id}
                onClick={() => setSelectedNode(node)}
                onDrag={handleNodeDrag}
              />
            ))}

            {/* Empty State */}
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-neutral-400">
                  <RiNodeTree className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Arraste um gatilho para começar</p>
                  <p className="text-sm">Selecione um gatilho na sidebar e arraste para o board</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Config Panel */}
        <AnimatePresence>
          {selectedNode && (
            <NodeConfigPanel
              node={selectedNode}
              onClose={() => setSelectedNode(null)}
              onSave={(config) => {
                setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, config } : n));
                setSelectedNode(null);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
