"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiWebhookLine,
  RiAddLine,
  RiCheckLine,
  RiCloseLine,
  RiTimeLine,
  RiSettings4Line,
  RiDeleteBinLine,
  RiEditLine,
  RiRefreshLine,
  RiPlayCircleLine,
  RiPauseCircleLine,
  RiFileCopyLine,
  RiEyeLine,
  RiCodeSSlashLine,
  RiAlertLine,
  RiLineChartLine,
  RiFlashlightLine,
  RiHistoryLine,
} from "react-icons/ri";

const webhooks = [
  {
    id: "1",
    nome: "CRM Integration",
    url: "https://api.meucrm.com/webhooks/tappyimob",
    eventos: ["lead.created", "lead.updated", "lead.converted"],
    status: "ativo",
    ultimaChamada: "2024-01-25T14:30:00",
    sucessos: 1245,
    falhas: 3,
    latenciaMedia: 120,
  },
  {
    id: "2",
    nome: "Sistema Financeiro",
    url: "https://financeiro.empresa.com/hooks",
    eventos: ["payment.received", "commission.created"],
    status: "ativo",
    ultimaChamada: "2024-01-25T14:25:00",
    sucessos: 567,
    falhas: 0,
    latenciaMedia: 89,
  },
  {
    id: "3",
    nome: "Marketing Automation",
    url: "https://marketing.plataforma.io/webhook",
    eventos: ["lead.created", "visit.scheduled", "property.viewed"],
    status: "ativo",
    ultimaChamada: "2024-01-25T14:28:00",
    sucessos: 2341,
    falhas: 12,
    latenciaMedia: 156,
  },
  {
    id: "4",
    nome: "Notificações Slack",
    url: "https://hooks.slack.com/services/XXX/YYY/ZZZ",
    eventos: ["deal.closed", "contract.signed"],
    status: "pausado",
    ultimaChamada: "2024-01-20T10:00:00",
    sucessos: 89,
    falhas: 2,
    latenciaMedia: 45,
  },
  {
    id: "5",
    nome: "Analytics Externo",
    url: "https://analytics.bi.com/ingest",
    eventos: ["property.created", "property.updated", "property.sold"],
    status: "erro",
    ultimaChamada: "2024-01-24T18:00:00",
    sucessos: 456,
    falhas: 45,
    latenciaMedia: 890,
    erro: "Timeout - Endpoint não responde",
  },
];

const eventosDisponiveis = [
  { grupo: "Leads", eventos: ["lead.created", "lead.updated", "lead.converted", "lead.deleted"] },
  { grupo: "Imóveis", eventos: ["property.created", "property.updated", "property.sold", "property.rented"] },
  { grupo: "Contratos", eventos: ["contract.created", "contract.signed", "contract.expired"] },
  { grupo: "Financeiro", eventos: ["payment.received", "payment.pending", "commission.created"] },
  { grupo: "Visitas", eventos: ["visit.scheduled", "visit.completed", "visit.canceled"] },
];

const logsRecentes = [
  { id: "1", webhook: "CRM Integration", evento: "lead.created", status: "sucesso", tempo: "120ms", data: "há 2 min" },
  { id: "2", webhook: "Marketing Automation", evento: "property.viewed", status: "sucesso", tempo: "145ms", data: "há 5 min" },
  { id: "3", webhook: "Sistema Financeiro", evento: "payment.received", status: "sucesso", tempo: "89ms", data: "há 8 min" },
  { id: "4", webhook: "Analytics Externo", evento: "property.updated", status: "falha", tempo: "5000ms", data: "há 12 min" },
  { id: "5", webhook: "CRM Integration", evento: "lead.updated", status: "sucesso", tempo: "98ms", data: "há 15 min" },
];

const stats = [
  { label: "Webhooks Ativos", value: "5", icon: RiWebhookLine, cor: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-500/20" },
  { label: "Eventos/Mês", value: "12.4K", icon: RiLineChartLine, cor: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-500/20" },
  { label: "Taxa Sucesso", value: "99.2%", icon: RiCheckLine, cor: "text-green-500", bg: "bg-green-100 dark:bg-green-500/20" },
  { label: "Latência Média", value: "125ms", icon: RiFlashlightLine, cor: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-500/20" },
];

export default function WebhooksPage() {
  const [showSecret, setShowSecret] = useState(false);
  const signingSecret = "whsec_abcd1234567890xyz";

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR") + " " + date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; cor: string; bg: string; icon: React.ElementType }> = {
      ativo: { label: "Ativo", cor: "text-green-600", bg: "bg-green-100 dark:bg-green-500/20", icon: RiCheckLine },
      pausado: { label: "Pausado", cor: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-500/20", icon: RiPauseCircleLine },
      erro: { label: "Erro", cor: "text-red-600", bg: "bg-red-100 dark:bg-red-500/20", icon: RiAlertLine },
    };
    return configs[status] || configs.pausado;
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                <RiWebhookLine className="w-5 h-5 text-white" />
              </div>
              Webhooks
            </h1>
            <p className="text-neutral-500 mt-1">Receba eventos em tempo real na sua aplicação</p>
          </div>
        </div>

        <button className="flex items-center gap-2 h-10 px-4 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600">
          <RiAddLine className="w-4 h-4" />
          Novo Webhook
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.cor}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-neutral-500">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Signing Secret */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="p-4 bg-purple-50 dark:bg-purple-500/10 rounded-2xl border border-purple-200 dark:border-purple-500/20"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RiCodeSSlashLine className="w-5 h-5 text-purple-500" />
            <div>
              <p className="font-medium text-purple-800 dark:text-purple-400">Signing Secret</p>
              <p className="text-sm text-purple-600 dark:text-purple-300">Use para verificar a autenticidade dos webhooks</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <code className="px-3 py-1.5 bg-white dark:bg-neutral-900 rounded-lg text-sm font-mono text-purple-600">
              {showSecret ? signingSecret : "••••••••••••••••••••"}
            </code>
            <button
              onClick={() => setShowSecret(!showSecret)}
              className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-500/20 text-purple-500"
            >
              <RiEyeLine className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-500/20 text-purple-500">
              <RiFileCopyLine className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Webhooks List */}
      <div className="space-y-4">
        {webhooks.map((webhook, index) => {
          const statusConfig = getStatusConfig(webhook.status);
          const StatusIcon = statusConfig.icon;
          const taxaSucesso = Math.round((webhook.sucessos / (webhook.sucessos + webhook.falhas)) * 100);

          return (
            <motion.div
              key={webhook.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className={`bg-white dark:bg-neutral-900 rounded-2xl border overflow-hidden ${
                webhook.status === "erro" ? "border-red-200 dark:border-red-500/30" : "border-neutral-200 dark:border-neutral-800"
              }`}
            >
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${statusConfig.bg} flex items-center justify-center`}>
                    <RiWebhookLine className={`w-6 h-6 ${statusConfig.cor}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-neutral-900 dark:text-white">{webhook.nome}</h3>
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.cor}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-500 font-mono">{webhook.url}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-lg font-bold text-neutral-900 dark:text-white">{taxaSucesso}%</p>
                    <p className="text-xs text-neutral-500">Taxa de Sucesso</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-neutral-900 dark:text-white">{webhook.latenciaMedia}ms</p>
                    <p className="text-xs text-neutral-500">Latência</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {webhook.status === "ativo" ? (
                      <button className="p-2 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/20 text-neutral-400 hover:text-amber-600" title="Pausar">
                        <RiPauseCircleLine className="w-5 h-5" />
                      </button>
                    ) : webhook.status !== "erro" ? (
                      <button className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-500/20 text-neutral-400 hover:text-green-600" title="Ativar">
                        <RiPlayCircleLine className="w-5 h-5" />
                      </button>
                    ) : null}
                    <button className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 text-neutral-400 hover:text-blue-600" title="Testar">
                      <RiRefreshLine className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600" title="Editar">
                      <RiEditLine className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 text-neutral-400 hover:text-red-600" title="Excluir">
                      <RiDeleteBinLine className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Erro Alert */}
              {webhook.status === "erro" && webhook.erro && (
                <div className="px-4 py-2 bg-red-50 dark:bg-red-500/10 border-t border-red-100 dark:border-red-500/20">
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                    <RiAlertLine className="w-4 h-4" />
                    {webhook.erro}
                  </p>
                </div>
              )}

              {/* Eventos */}
              <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-neutral-500">Eventos:</span>
                  {webhook.eventos.map(evento => (
                    <span key={evento} className="px-2 py-0.5 bg-white dark:bg-neutral-800 rounded text-xs font-mono text-purple-600">
                      {evento}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-neutral-500">
                  Última chamada: {formatDate(webhook.ultimaChamada)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Logs Recentes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
      >
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RiHistoryLine className="w-5 h-5 text-purple-500" />
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-white">Logs Recentes</h3>
              <p className="text-sm text-neutral-500">Últimas chamadas de webhook</p>
            </div>
          </div>
          <button className="text-sm text-purple-500 hover:underline">Ver todos os logs</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100 dark:border-neutral-800">
                <th className="text-left p-4 text-xs font-semibold text-neutral-500">Webhook</th>
                <th className="text-left p-4 text-xs font-semibold text-neutral-500">Evento</th>
                <th className="text-left p-4 text-xs font-semibold text-neutral-500">Status</th>
                <th className="text-left p-4 text-xs font-semibold text-neutral-500">Tempo</th>
                <th className="text-left p-4 text-xs font-semibold text-neutral-500">Data</th>
              </tr>
            </thead>
            <tbody>
              {logsRecentes.map((log, index) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.55 + index * 0.03 }}
                  className="border-b border-neutral-50 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                >
                  <td className="p-4 text-sm font-medium text-neutral-900 dark:text-white">{log.webhook}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-500/20 rounded text-xs font-mono text-purple-600">
                      {log.evento}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`flex items-center gap-1 ${log.status === "sucesso" ? "text-green-600" : "text-red-600"}`}>
                      {log.status === "sucesso" ? <RiCheckLine className="w-4 h-4" /> : <RiCloseLine className="w-4 h-4" />}
                      <span className="text-sm capitalize">{log.status}</span>
                    </span>
                  </td>
                  <td className="p-4 text-sm text-neutral-500 font-mono">{log.tempo}</td>
                  <td className="p-4 text-sm text-neutral-500">{log.data}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
