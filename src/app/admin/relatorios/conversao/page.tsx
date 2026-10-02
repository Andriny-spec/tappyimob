"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiPercentLine,
  RiDownload2Line,
  RiCalendarLine,
  RiArrowRightSLine,
  RiUserAddLine,
  RiPhoneLine,
  RiCalendarCheckLine,
  RiFileTextLine,
  RiCheckDoubleLine,
  RiArrowUpSLine,
  RiArrowDownSLine,
  RiTimeLine,
  RiLineChartLine,
} from "react-icons/ri";

const funilEtapas = [
  { id: "leads", nome: "Leads", quantidade: 1250, cor: "bg-blue-500", icone: RiUserAddLine },
  { id: "contato", nome: "Primeiro Contato", quantidade: 890, cor: "bg-indigo-500", icone: RiPhoneLine },
  { id: "visita", nome: "Visita Agendada", quantidade: 456, cor: "bg-purple-500", icone: RiCalendarCheckLine },
  { id: "proposta", nome: "Proposta Enviada", quantidade: 234, cor: "bg-amber-500", icone: RiFileTextLine },
  { id: "fechamento", nome: "Fechamento", quantidade: 89, cor: "bg-green-500", icone: RiCheckDoubleLine },
];

const conversoesPorEtapa = [
  { de: "Leads", para: "Primeiro Contato", taxa: 71.2, meta: 75, status: "abaixo" },
  { de: "Primeiro Contato", para: "Visita Agendada", taxa: 51.2, meta: 50, status: "acima" },
  { de: "Visita Agendada", para: "Proposta Enviada", taxa: 51.3, meta: 45, status: "acima" },
  { de: "Proposta Enviada", para: "Fechamento", taxa: 38.0, meta: 40, status: "abaixo" },
];

const metricas = [
  { label: "Taxa de Conversão Total", value: "7.12%", variacao: 1.2, meta: "8%" },
  { label: "Tempo Médio de Conversão", value: "18 dias", variacao: -2, meta: "15 dias" },
  { label: "Leads Qualificados", value: "456", variacao: 15.3, meta: "500" },
  { label: "Valor Médio do Pipeline", value: "R$ 45M", variacao: 8.5, meta: "R$ 50M" },
];

const evolucaoConversao = [
  { mes: "Jan", taxa: 5.8 },
  { mes: "Fev", taxa: 6.2 },
  { mes: "Mar", taxa: 5.5 },
  { mes: "Abr", taxa: 6.8 },
  { mes: "Mai", taxa: 7.0 },
  { mes: "Jun", taxa: 7.12 },
];

const fontesLead = [
  { fonte: "Site Próprio", leads: 450, conversao: 8.2, percentual: 36 },
  { fonte: "Portais Imobiliários", leads: 380, conversao: 6.5, percentual: 30 },
  { fonte: "Indicações", leads: 220, conversao: 12.3, percentual: 18 },
  { fonte: "Redes Sociais", leads: 120, conversao: 4.8, percentual: 10 },
  { fonte: "Outros", leads: 80, conversao: 3.2, percentual: 6 },
];

export default function ConversaoRelatorioPage() {
  const [periodo, setPeriodo] = useState("mes");

  const taxaTotal = ((funilEtapas[funilEtapas.length - 1].quantidade / funilEtapas[0].quantidade) * 100).toFixed(2);
  const maxEvolucao = Math.max(...evolucaoConversao.map(e => e.taxa));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/relatorios" className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500">
            <RiArrowLeftLine className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <RiPercentLine className="w-5 h-5 text-white" />
              </div>
              Funil de Conversão
            </h1>
            <p className="text-neutral-500 mt-1">Acompanhe a jornada do lead até o fechamento</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1">
            {["semana", "mes", "trimestre"].map((p) => (
              <button key={p} onClick={() => setPeriodo(p)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${periodo === p ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm" : "text-neutral-600 dark:text-neutral-400"}`}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 h-10 px-4 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600">
            <RiDownload2Line className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricas.map((metrica, index) => (
          <motion.div key={metrica.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-neutral-500">{metrica.label}</span>
              <span className={`flex items-center text-xs font-medium ${metrica.variacao >= 0 ? "text-green-500" : "text-red-500"}`}>
                {metrica.variacao >= 0 ? <RiArrowUpSLine className="w-4 h-4" /> : <RiArrowDownSLine className="w-4 h-4" />}
                {Math.abs(metrica.variacao)}%
              </span>
            </div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{metrica.value}</p>
            <p className="text-xs text-neutral-400 mt-1">Meta: {metrica.meta}</p>
          </motion.div>
        ))}
      </div>

      {/* Funil Visual */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-neutral-900 dark:text-white">Funil de Vendas</h3>
            <p className="text-sm text-neutral-500">Taxa total de conversão: <span className="font-bold text-blue-600">{taxaTotal}%</span></p>
          </div>
        </div>

        <div className="relative">
          {/* Funnel Steps */}
          <div className="flex items-center justify-between gap-2">
            {funilEtapas.map((etapa, index) => {
              const Icon = etapa.icone;
              const widthPercent = 100 - (index * 15);
              const prevQuantidade = index > 0 ? funilEtapas[index - 1].quantidade : etapa.quantidade;
              const conversao = index > 0 ? ((etapa.quantidade / prevQuantidade) * 100).toFixed(1) : "100";

              return (
                <motion.div
                  key={etapa.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 + index * 0.1 }}
                  className="flex-1 text-center"
                >
                  <div className={`${etapa.cor} rounded-xl p-4 text-white mb-2`} style={{ opacity: 1 - (index * 0.15) }}>
                    <Icon className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{etapa.quantidade}</p>
                    <p className="text-xs opacity-80">{etapa.nome}</p>
                  </div>
                  {index > 0 && (
                    <div className="text-xs text-neutral-500">
                      <span className="font-medium text-neutral-900 dark:text-white">{conversao}%</span> conversão
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Arrows between steps */}
          <div className="absolute top-1/2 left-0 right-0 flex justify-around -translate-y-1/2 pointer-events-none">
            {[1, 2, 3, 4].map((i) => (
              <RiArrowRightSLine key={i} className="w-6 h-6 text-neutral-300 dark:text-neutral-700" />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversão por Etapa */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <h3 className="font-bold text-neutral-900 dark:text-white mb-4">Taxa de Conversão por Etapa</h3>
          <div className="space-y-4">
            {conversoesPorEtapa.map((conv, index) => (
              <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + index * 0.05 }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">{conv.de} → {conv.para}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${conv.status === "acima" ? "text-green-600" : "text-amber-600"}`}>{conv.taxa}%</span>
                    <span className="text-xs text-neutral-400">(meta: {conv.meta}%)</span>
                  </div>
                </div>
                <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden relative">
                  <div className="absolute h-full bg-neutral-300 dark:bg-neutral-700 rounded-full" style={{ width: `${conv.meta}%` }} />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${conv.taxa}%` }}
                    transition={{ delay: 0.45 + index * 0.05, duration: 0.5 }}
                    className={`absolute h-full rounded-full ${conv.status === "acima" ? "bg-green-500" : "bg-amber-500"}`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Evolução da Taxa */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-white">Evolução da Conversão</h3>
              <p className="text-sm text-neutral-500">Últimos 6 meses</p>
            </div>
            <RiLineChartLine className="w-5 h-5 text-neutral-400" />
          </div>

          <div className="flex items-end gap-4 h-40">
            {evolucaoConversao.map((item, index) => (
              <div key={item.mes} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(item.taxa / maxEvolucao) * 100}%` }}
                  transition={{ delay: 0.45 + index * 0.05, duration: 0.5 }}
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg relative group"
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900 text-white text-xs px-2 py-1 rounded">
                    {item.taxa}%
                  </div>
                </motion.div>
                <span className="text-xs text-neutral-500">{item.mes}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Fontes de Lead */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="font-bold text-neutral-900 dark:text-white">Conversão por Fonte de Lead</h3>
          <p className="text-sm text-neutral-500">Análise de performance por origem</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100 dark:border-neutral-800">
                <th className="text-left p-4 text-xs font-semibold text-neutral-500">Fonte</th>
                <th className="text-left p-4 text-xs font-semibold text-neutral-500">Leads</th>
                <th className="text-left p-4 text-xs font-semibold text-neutral-500">Taxa Conversão</th>
                <th className="text-left p-4 text-xs font-semibold text-neutral-500">% do Total</th>
                <th className="text-left p-4 text-xs font-semibold text-neutral-500">Performance</th>
              </tr>
            </thead>
            <tbody>
              {fontesLead.map((fonte, index) => (
                <motion.tr key={fonte.fonte} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 + index * 0.03 }} className="border-b border-neutral-50 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="p-4 font-medium text-neutral-900 dark:text-white">{fonte.fonte}</td>
                  <td className="p-4 text-neutral-600 dark:text-neutral-400">{fonte.leads}</td>
                  <td className="p-4 font-bold text-blue-600">{fonte.conversao}%</td>
                  <td className="p-4 text-neutral-500">{fonte.percentual}%</td>
                  <td className="p-4">
                    <div className="w-24 h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${fonte.conversao >= 8 ? "bg-green-500" : fonte.conversao >= 5 ? "bg-blue-500" : "bg-amber-500"}`} style={{ width: `${(fonte.conversao / 15) * 100}%` }} />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
