"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  RiPlugLine,
  RiGlobalLine,
  RiWhatsappLine,
  RiWebhookLine,
  RiCodeSSlashLine,
  RiArrowRightLine,
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiTimeLine,
  RiRefreshLine,
  RiExternalLinkLine,
  RiShieldCheckLine,
  RiFlashlightLine,
  RiLineChartLine,
  RiSettings4Line,
} from "react-icons/ri";

const integracoes = [
  {
    id: "portais",
    nome: "Portais Imobiliários",
    descricao: "ZAP, VivaReal, OLX, Imovelweb e mais 15 portais",
    icon: RiGlobalLine,
    href: "/admin/integracoes/portais",
    status: "ativo",
    stats: { ativos: 8, imoveis: 156, atualizacoes: "5 min" },
    cor: "orange",
  },
  {
    id: "whatsapp",
    nome: "WhatsApp Business",
    descricao: "Atendimento automatizado e notificações em tempo real",
    icon: RiWhatsappLine,
    href: "/admin/integracoes/whatsapp",
    status: "ativo",
    stats: { mensagens: "2.4K", conversas: 89, taxa: "98%" },
    cor: "green",
  },
  {
    id: "webhooks",
    nome: "Webhooks",
    descricao: "Receba eventos em tempo real em sua aplicação",
    icon: RiWebhookLine,
    href: "/admin/integracoes/webhooks",
    status: "parcial",
    stats: { endpoints: 5, eventos: "12K", uptime: "99.9%" },
    cor: "purple",
  },
  {
    id: "api",
    nome: "API REST",
    descricao: "Acesso programático completo aos dados do sistema",
    icon: RiCodeSSlashLine,
    href: "/admin/integracoes/api",
    status: "ativo",
    stats: { requisicoes: "45K", endpoints: 28, versao: "v2" },
    cor: "blue",
  },
];

const estatisticasGerais = [
  { label: "Integrações Ativas", value: "12", icon: RiCheckboxCircleLine, cor: "text-green-500", bg: "bg-green-100 dark:bg-green-500/20" },
  { label: "Requisições/Mês", value: "128K", icon: RiLineChartLine, cor: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-500/20" },
  { label: "Uptime Médio", value: "99.8%", icon: RiFlashlightLine, cor: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-500/20" },
  { label: "Última Sync", value: "2 min", icon: RiRefreshLine, cor: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-500/20" },
];

const atividadeRecente = [
  { tipo: "sync", mensagem: "Sincronização ZAP Imóveis concluída", tempo: "há 2 min", status: "sucesso" },
  { tipo: "webhook", mensagem: "Webhook lead.created enviado", tempo: "há 5 min", status: "sucesso" },
  { tipo: "api", mensagem: "API Request GET /properties", tempo: "há 8 min", status: "sucesso" },
  { tipo: "whatsapp", mensagem: "Mensagem automática enviada", tempo: "há 12 min", status: "sucesso" },
  { tipo: "sync", mensagem: "Sincronização VivaReal concluída", tempo: "há 15 min", status: "sucesso" },
  { tipo: "webhook", mensagem: "Webhook property.updated falhou", tempo: "há 20 min", status: "erro" },
];

const colorClasses: Record<string, { bg: string; text: string; lightBg: string; gradient: string }> = {
  orange: { bg: "bg-orange-500", text: "text-orange-500", lightBg: "bg-orange-100 dark:bg-orange-500/20", gradient: "from-orange-500 to-emerald-500" },
  green: { bg: "bg-green-500", text: "text-green-500", lightBg: "bg-green-100 dark:bg-green-500/20", gradient: "from-green-500 to-emerald-500" },
  purple: { bg: "bg-purple-500", text: "text-purple-500", lightBg: "bg-purple-100 dark:bg-purple-500/20", gradient: "from-purple-500 to-violet-500" },
  blue: { bg: "bg-blue-500", text: "text-blue-500", lightBg: "bg-blue-100 dark:bg-blue-500/20", gradient: "from-blue-500 to-indigo-500" },
};

export default function IntegracoesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-emerald-500 flex items-center justify-center">
              <RiPlugLine className="w-5 h-5 text-white" />
            </div>
            Integrações
          </h1>
          <p className="text-neutral-500 mt-1">
            Conecte seu sistema com ferramentas externas
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 h-10 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800">
            <RiRefreshLine className="w-4 h-4" />
            Sincronizar Tudo
          </button>
          <button className="flex items-center gap-2 h-10 px-4 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600">
            <RiSettings4Line className="w-4 h-4" />
            Configurações
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {estatisticasGerais.map((stat, index) => (
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

      {/* Integrações Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {integracoes.map((integracao, index) => {
          const colors = colorClasses[integracao.cor];
          const Icon = integracao.icon;

          return (
            <Link key={integracao.id} href={integracao.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:shadow-xl hover:border-orange-300 dark:hover:border-orange-500/50 transition-all group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-neutral-900 dark:text-white group-hover:text-orange-500 transition-colors">
                        {integracao.nome}
                      </h3>
                      <p className="text-sm text-neutral-500">{integracao.descricao}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {integracao.status === "ativo" ? (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Ativo
                      </span>
                    ) : integracao.status === "parcial" ? (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Parcial
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        Inativo
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                  {Object.entries(integracao.stats).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <p className={`text-lg font-bold ${colors.text}`}>{value}</p>
                      <p className="text-xs text-neutral-500 capitalize">{key}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                  <span className="text-sm text-neutral-500">Última atualização: há 5 min</span>
                  <div className="flex items-center gap-1 text-orange-500 text-sm font-medium group-hover:translate-x-1 transition-transform">
                    Configurar <RiArrowRightLine className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Atividade Recente */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
      >
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-neutral-900 dark:text-white">Atividade em Tempo Real</h3>
            <p className="text-sm text-neutral-500">Últimos eventos das integrações</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-neutral-500">Ao vivo</span>
          </div>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {atividadeRecente.map((atividade, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.03 }}
              className="p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  atividade.tipo === "sync" ? "bg-orange-100 dark:bg-orange-500/20" :
                  atividade.tipo === "webhook" ? "bg-purple-100 dark:bg-purple-500/20" :
                  atividade.tipo === "api" ? "bg-blue-100 dark:bg-blue-500/20" :
                  "bg-green-100 dark:bg-green-500/20"
                }`}>
                  {atividade.tipo === "sync" && <RiRefreshLine className="w-4 h-4 text-orange-500" />}
                  {atividade.tipo === "webhook" && <RiWebhookLine className="w-4 h-4 text-purple-500" />}
                  {atividade.tipo === "api" && <RiCodeSSlashLine className="w-4 h-4 text-blue-500" />}
                  {atividade.tipo === "whatsapp" && <RiWhatsappLine className="w-4 h-4 text-green-500" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">{atividade.mensagem}</p>
                  <p className="text-xs text-neutral-500">{atividade.tempo}</p>
                </div>
              </div>
              <span className={`w-2 h-2 rounded-full ${atividade.status === "sucesso" ? "bg-green-500" : "bg-red-500"}`} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-4 bg-gradient-to-r from-orange-50 to-emerald-50 dark:from-orange-500/10 dark:to-emerald-500/10 rounded-2xl border border-orange-200 dark:border-orange-500/20"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center flex-shrink-0">
            <RiShieldCheckLine className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h4 className="font-semibold text-orange-800 dark:text-orange-400 mb-1">Conexões Seguras</h4>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              Todas as integrações utilizam criptografia SSL/TLS e autenticação OAuth 2.0. Seus dados estão protegidos.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
