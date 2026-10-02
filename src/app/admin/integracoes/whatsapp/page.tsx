"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiWhatsappLine,
  RiCheckLine,
  RiTimeLine,
  RiSettings4Line,
  RiMessage2Line,
  RiUserLine,
  RiRobot2Line,
  RiLineChartLine,
  RiQrCodeLine,
  RiSmartphoneLine,
  RiSendPlaneLine,
  RiDeleteBinLine,
  RiEditLine,
  RiAddLine,
  RiPlayCircleLine,
  RiPauseCircleLine,
  RiTestTubeLine,
} from "react-icons/ri";

const estatisticas = {
  mensagensEnviadas: 2456,
  mensagensRecebidas: 1823,
  conversasAtivas: 89,
  tempoResposta: "2 min",
  taxaResposta: 98,
  leadsGerados: 156,
};

const automacoes = [
  {
    id: "1",
    nome: "Boas-vindas Lead",
    gatilho: "Novo lead cadastrado",
    mensagem: "Olá {{nome}}! Obrigado pelo interesse...",
    status: "ativo",
    envios: 456,
    taxa: 98,
  },
  {
    id: "2",
    nome: "Confirmação Visita",
    gatilho: "Visita agendada",
    mensagem: "Sua visita está confirmada para {{data}}...",
    status: "ativo",
    envios: 234,
    taxa: 100,
  },
  {
    id: "3",
    nome: "Lembrete Visita",
    gatilho: "24h antes da visita",
    mensagem: "Lembrete: Amanhã você tem uma visita...",
    status: "ativo",
    envios: 189,
    taxa: 97,
  },
  {
    id: "4",
    nome: "Follow-up Proposta",
    gatilho: "48h após proposta",
    mensagem: "Olá {{nome}}, gostaria de saber se...",
    status: "pausado",
    envios: 78,
    taxa: 85,
  },
  {
    id: "5",
    nome: "Aniversário Cliente",
    gatilho: "Data de aniversário",
    mensagem: "Feliz aniversário, {{nome}}! 🎉...",
    status: "ativo",
    envios: 45,
    taxa: 100,
  },
];

const templates = [
  { id: "1", nome: "Apresentação Imóvel", categoria: "vendas", usado: 234 },
  { id: "2", nome: "Proposta Aceita", categoria: "contratos", usado: 89 },
  { id: "3", nome: "Documentação Pendente", categoria: "contratos", usado: 156 },
  { id: "4", nome: "Novo Imóvel Disponível", categoria: "marketing", usado: 312 },
];

const conversasRecentes = [
  { id: "1", nome: "João Silva", mensagem: "Gostaria de saber mais sobre o apartamento", tempo: "há 5 min", naoLido: true },
  { id: "2", nome: "Maria Santos", mensagem: "Podemos remarcar a visita?", tempo: "há 15 min", naoLido: true },
  { id: "3", nome: "Pedro Lima", mensagem: "Obrigado, vou analisar a proposta", tempo: "há 1 hora", naoLido: false },
  { id: "4", nome: "Ana Costa", mensagem: "Qual o valor do condomínio?", tempo: "há 2 horas", naoLido: false },
];

export default function WhatsAppPage() {
  const [conectado, setConectado] = useState(false);
  const [loading, setLoading] = useState(true);
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Verificar conexão ao carregar
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const res = await fetch("/api/integrations/whatsapp");
        const data = await res.json();
        setConectado(data.connected);
      } catch {
        setConectado(false);
      }
      setLoading(false);
    };
    checkConnection();
  }, []);

  // Enviar mensagem de teste
  const handleTestMessage = async () => {
    if (!testPhone || !testMessage) return;
    setSending(true);
    try {
      const res = await fetch("/api/integrations/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: testPhone, message: testMessage }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Mensagem enviada com sucesso!");
        setTestPhone("");
        setTestMessage("");
      } else {
        alert("Erro: " + (data.error || "Falha ao enviar"));
      }
    } catch (error) {
      alert("Erro ao enviar mensagem");
    }
    setSending(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/integracoes" className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500">
            <RiArrowLeftLine className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <RiWhatsappLine className="w-5 h-5 text-white" />
              </div>
              WhatsApp Business
            </h1>
            <p className="text-neutral-500 mt-1">Atendimento automatizado e notificações</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {conectado ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-100 dark:bg-green-500/20">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">Conectado</span>
            </div>
          ) : (
            <button className="flex items-center gap-2 h-10 px-4 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600">
              <RiQrCodeLine className="w-4 h-4" />
              Conectar WhatsApp
            </button>
          )}
          <button className="flex items-center gap-2 h-10 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800">
            <RiSettings4Line className="w-4 h-4" />
            Configurações
          </button>
        </div>
      </div>

      {/* Status e Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
        >
          <div className="flex items-center gap-2 mb-2">
            <RiSendPlaneLine className="w-4 h-4 text-green-500" />
            <span className="text-sm text-neutral-500">Enviadas</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">{estatisticas.mensagensEnviadas}</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
        >
          <div className="flex items-center gap-2 mb-2">
            <RiMessage2Line className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-neutral-500">Recebidas</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">{estatisticas.mensagensRecebidas}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
        >
          <div className="flex items-center gap-2 mb-2">
            <RiUserLine className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-neutral-500">Conversas</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">{estatisticas.conversasAtivas}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
        >
          <div className="flex items-center gap-2 mb-2">
            <RiTimeLine className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-neutral-500">Tempo Resp.</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">{estatisticas.tempoResposta}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
        >
          <div className="flex items-center gap-2 mb-2">
            <RiCheckLine className="w-4 h-4 text-green-500" />
            <span className="text-sm text-neutral-500">Taxa Resp.</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">{estatisticas.taxaResposta}%</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
        >
          <div className="flex items-center gap-2 mb-2">
            <RiLineChartLine className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-neutral-500">Leads</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">{estatisticas.leadsGerados}</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Automações */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
        >
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RiRobot2Line className="w-5 h-5 text-green-500" />
              <div>
                <h3 className="font-bold text-neutral-900 dark:text-white">Automações</h3>
                <p className="text-sm text-neutral-500">Mensagens automáticas por gatilhos</p>
              </div>
            </div>
            <button className="flex items-center gap-2 h-9 px-4 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600">
              <RiAddLine className="w-4 h-4" />
              Nova Automação
            </button>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {automacoes.map((automacao, index) => (
              <motion.div
                key={automacao.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 + index * 0.03 }}
                className="p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    automacao.status === "ativo" 
                      ? "bg-green-100 dark:bg-green-500/20" 
                      : "bg-neutral-100 dark:bg-neutral-800"
                  }`}>
                    <RiRobot2Line className={`w-5 h-5 ${
                      automacao.status === "ativo" ? "text-green-500" : "text-neutral-400"
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-neutral-900 dark:text-white">{automacao.nome}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        automacao.status === "ativo"
                          ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                      }`}>
                        {automacao.status === "ativo" ? "Ativo" : "Pausado"}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-500">{automacao.gatilho}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">{automacao.envios} envios</p>
                    <p className="text-xs text-neutral-500">{automacao.taxa}% entrega</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  {automacao.status === "ativo" ? (
                    <button className="p-2 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/20 text-neutral-400 hover:text-amber-600">
                      <RiPauseCircleLine className="w-4 h-4" />
                    </button>
                  ) : (
                    <button className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-500/20 text-neutral-400 hover:text-green-600">
                      <RiPlayCircleLine className="w-4 h-4" />
                    </button>
                  )}
                  <button className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 text-neutral-400 hover:text-blue-600">
                    <RiEditLine className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-600">
                    <RiTestTubeLine className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Conversas Recentes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
        >
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
            <h3 className="font-bold text-neutral-900 dark:text-white">Conversas Recentes</h3>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {conversasRecentes.map((conversa, index) => (
              <motion.div
                key={conversa.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.03 }}
                className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold">
                      {conversa.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    {conversa.naoLido && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-neutral-900" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-neutral-900 dark:text-white truncate">{conversa.nome}</p>
                      <span className="text-xs text-neutral-500 flex-shrink-0">{conversa.tempo}</span>
                    </div>
                    <p className="text-sm text-neutral-500 truncate">{conversa.mensagem}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="p-4 border-t border-neutral-100 dark:border-neutral-800">
            <button className="w-full h-10 rounded-xl border border-green-200 dark:border-green-500/30 text-green-600 dark:text-green-400 font-medium hover:bg-green-50 dark:hover:bg-green-500/10">
              Ver Todas Conversas
            </button>
          </div>
        </motion.div>
      </div>

      {/* Templates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
      >
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-neutral-900 dark:text-white">Templates de Mensagem</h3>
            <p className="text-sm text-neutral-500">Modelos pré-aprovados para envio em massa</p>
          </div>
          <button className="flex items-center gap-2 h-9 px-4 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600">
            <RiAddLine className="w-4 h-4" />
            Novo Template
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-green-600 dark:text-green-400 uppercase">{template.categoria}</span>
                <RiMessage2Line className="w-4 h-4 text-neutral-400 group-hover:text-green-500" />
              </div>
              <h4 className="font-medium text-neutral-900 dark:text-white mb-2">{template.nome}</h4>
              <p className="text-sm text-neutral-500">Usado {template.usado}x</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
