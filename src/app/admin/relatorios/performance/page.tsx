"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiUserStarLine,
  RiDownload2Line,
  RiTrophyLine,
  RiMedalLine,
  RiArrowUpSLine,
  RiArrowDownSLine,
  RiPercentLine,
  RiMoneyDollarCircleLine,
  RiHome4Line,
  RiTimeLine,
  RiStarLine,
  RiUserLine,
  RiLineChartLine,
  RiPhoneLine,
  RiCalendarCheckLine,
} from "react-icons/ri";

const corretores = [
  {
    id: "1",
    nome: "Carlos Oliveira",
    avatar: null,
    vendas: 12,
    locacoes: 8,
    valorTotal: 2850000,
    comissao: 85500,
    leads: 45,
    conversao: 26.7,
    avaliacao: 4.9,
    ranking: 1,
    variacao: 15,
  },
  {
    id: "2",
    nome: "Maria Silva",
    avatar: null,
    vendas: 10,
    locacoes: 6,
    valorTotal: 2150000,
    comissao: 64500,
    leads: 52,
    conversao: 19.2,
    avaliacao: 4.8,
    ranking: 2,
    variacao: 8,
  },
  {
    id: "3",
    nome: "Fernanda Lima",
    avatar: null,
    vendas: 8,
    locacoes: 10,
    valorTotal: 1650000,
    comissao: 49500,
    leads: 38,
    conversao: 21.1,
    avaliacao: 4.7,
    ranking: 3,
    variacao: -3,
  },
  {
    id: "4",
    nome: "Ana Santos",
    avatar: null,
    vendas: 6,
    locacoes: 5,
    valorTotal: 980000,
    comissao: 29400,
    leads: 35,
    conversao: 17.1,
    avaliacao: 4.6,
    ranking: 4,
    variacao: 12,
  },
  {
    id: "5",
    nome: "Roberto Almeida",
    avatar: null,
    vendas: 5,
    locacoes: 4,
    valorTotal: 750000,
    comissao: 22500,
    leads: 28,
    conversao: 17.9,
    avaliacao: 4.5,
    ranking: 5,
    variacao: -8,
  },
  {
    id: "6",
    nome: "Juliana Costa",
    avatar: null,
    vendas: 4,
    locacoes: 3,
    valorTotal: 520000,
    comissao: 15600,
    leads: 22,
    conversao: 18.2,
    avaliacao: 4.4,
    ranking: 6,
    variacao: 5,
  },
];

const metricas = [
  { label: "Corretores Ativos", value: "12", icon: RiUserLine, cor: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-500/20" },
  { label: "Vendas do Mês", value: "45", icon: RiHome4Line, cor: "text-green-500", bg: "bg-green-100 dark:bg-green-500/20" },
  { label: "Média Conversão", value: "18.5%", icon: RiPercentLine, cor: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-500/20" },
  { label: "Comissões Pagas", value: "R$ 267K", icon: RiMoneyDollarCircleLine, cor: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-500/20" },
];

const atividadesEquipe = [
  { atividade: "Ligações Realizadas", total: 1250, media: 104, meta: 100, icon: RiPhoneLine },
  { atividade: "Visitas Agendadas", total: 456, media: 38, meta: 35, icon: RiCalendarCheckLine },
  { atividade: "Propostas Enviadas", total: 234, media: 19, meta: 20, icon: RiMoneyDollarCircleLine },
  { atividade: "Tempo Médio Resposta", total: "2h", media: null, meta: "3h", icon: RiTimeLine },
];

export default function PerformanceRelatorioPage() {
  const [periodo, setPeriodo] = useState("mes");
  const [ordenacao, setOrdenacao] = useState("ranking");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const formatCompact = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1 }).format(value);
  };

  const getRankingBadge = (ranking: number) => {
    if (ranking === 1) return { bg: "bg-gradient-to-br from-emerald-400 to-emerald-500", icon: RiTrophyLine };
    if (ranking === 2) return { bg: "bg-gradient-to-br from-neutral-300 to-neutral-400", icon: RiMedalLine };
    if (ranking === 3) return { bg: "bg-gradient-to-br from-emerald-600 to-emerald-700", icon: RiMedalLine };
    return { bg: "bg-neutral-200 dark:bg-neutral-700", icon: null };
  };

  const sortedCorretores = [...corretores].sort((a, b) => {
    if (ordenacao === "ranking") return a.ranking - b.ranking;
    if (ordenacao === "vendas") return b.vendas - a.vendas;
    if (ordenacao === "valor") return b.valorTotal - a.valorTotal;
    if (ordenacao === "conversao") return b.conversao - a.conversao;
    return 0;
  });

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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                <RiUserStarLine className="w-5 h-5 text-white" />
              </div>
              Performance da Equipe
            </h1>
            <p className="text-neutral-500 mt-1">Métricas e ranking dos corretores</p>
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
          <button className="flex items-center gap-2 h-10 px-4 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600">
            <RiDownload2Line className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricas.map((metrica, index) => (
          <motion.div key={metrica.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${metrica.bg} flex items-center justify-center`}>
                <metrica.icon className={`w-5 h-5 ${metrica.cor}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{metrica.value}</p>
                <p className="text-sm text-neutral-500">{metrica.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Top 3 Podium */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-500/10 dark:to-violet-500/10 rounded-2xl border border-purple-200 dark:border-purple-500/20">
        <h3 className="font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
          <RiTrophyLine className="w-5 h-5 text-amber-500" />
          Top 3 Corretores do Mês
        </h3>
        <div className="flex items-end justify-center gap-4">
          {/* 2º Lugar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-neutral-300 to-neutral-400 flex items-center justify-center text-white text-2xl font-bold mb-2">
              {corretores[1].nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div className="bg-neutral-300 h-24 w-24 rounded-t-lg flex flex-col items-center justify-center text-neutral-700">
              <RiMedalLine className="w-6 h-6 mb-1" />
              <span className="text-2xl font-bold">2º</span>
            </div>
            <p className="mt-2 font-medium text-neutral-900 dark:text-white">{corretores[1].nome}</p>
            <p className="text-sm text-neutral-500">{formatCompact(corretores[1].valorTotal)}</p>
          </motion.div>

          {/* 1º Lugar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center text-white text-3xl font-bold mb-2 ring-4 ring-amber-200 dark:ring-amber-500/30">
              {corretores[0].nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div className="bg-gradient-to-t from-emerald-400 to-emerald-500 h-32 w-28 rounded-t-lg flex flex-col items-center justify-center text-white">
              <RiTrophyLine className="w-8 h-8 mb-1" />
              <span className="text-3xl font-bold">1º</span>
            </div>
            <p className="mt-2 font-semibold text-neutral-900 dark:text-white">{corretores[0].nome}</p>
            <p className="text-sm text-amber-600 font-medium">{formatCompact(corretores[0].valorTotal)}</p>
          </motion.div>

          {/* 3º Lugar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center text-white text-2xl font-bold mb-2">
              {corretores[2].nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div className="bg-amber-700 h-20 w-24 rounded-t-lg flex flex-col items-center justify-center text-white">
              <RiMedalLine className="w-6 h-6 mb-1" />
              <span className="text-2xl font-bold">3º</span>
            </div>
            <p className="mt-2 font-medium text-neutral-900 dark:text-white">{corretores[2].nome}</p>
            <p className="text-sm text-neutral-500">{formatCompact(corretores[2].valorTotal)}</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Atividades da Equipe */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
        <h3 className="font-bold text-neutral-900 dark:text-white mb-4">Atividades da Equipe</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {atividadesEquipe.map((atividade, index) => {
            const Icon = atividade.icon;
            const atingiuMeta = atividade.media ? atividade.media >= Number(atividade.meta) : true;
            return (
              <motion.div key={atividade.atividade} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.45 + index * 0.05 }} className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-neutral-500">{atividade.atividade}</span>
                </div>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{atividade.total}</p>
                {atividade.media && (
                  <p className={`text-sm ${atingiuMeta ? "text-green-600" : "text-amber-600"}`}>
                    Média: {atividade.media}/corretor (meta: {atividade.meta})
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Ranking Completo */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <h3 className="font-bold text-neutral-900 dark:text-white">Ranking Completo</h3>
          <select value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)} className="h-9 px-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 border-0 text-sm font-medium">
            <option value="ranking">Por Ranking</option>
            <option value="vendas">Por Vendas</option>
            <option value="valor">Por Valor</option>
            <option value="conversao">Por Conversão</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100 dark:border-neutral-800">
                <th className="text-left p-4 text-xs font-semibold text-neutral-500">#</th>
                <th className="text-left p-4 text-xs font-semibold text-neutral-500">Corretor</th>
                <th className="text-left p-4 text-xs font-semibold text-neutral-500">Vendas</th>
                <th className="text-left p-4 text-xs font-semibold text-neutral-500">Locações</th>
                <th className="text-left p-4 text-xs font-semibold text-neutral-500">Valor Total</th>
                <th className="text-left p-4 text-xs font-semibold text-neutral-500">Conversão</th>
                <th className="text-left p-4 text-xs font-semibold text-neutral-500">Avaliação</th>
                <th className="text-left p-4 text-xs font-semibold text-neutral-500">Variação</th>
              </tr>
            </thead>
            <tbody>
              {sortedCorretores.map((corretor, index) => {
                const rankBadge = getRankingBadge(corretor.ranking);
                return (
                  <motion.tr key={corretor.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 + index * 0.03 }} className="border-b border-neutral-50 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="p-4">
                      <div className={`w-8 h-8 rounded-full ${rankBadge.bg} flex items-center justify-center text-white font-bold text-sm`}>
                        {rankBadge.icon ? <rankBadge.icon className="w-4 h-4" /> : corretor.ranking}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {corretor.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-white">{corretor.nome}</p>
                          <p className="text-xs text-neutral-500">{corretor.leads} leads</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-green-600">{corretor.vendas}</td>
                    <td className="p-4 font-medium text-blue-600">{corretor.locacoes}</td>
                    <td className="p-4 font-bold text-neutral-900 dark:text-white">{formatCompact(corretor.valorTotal)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${corretor.conversao >= 20 ? "bg-green-100 dark:bg-green-500/20 text-green-600" : "bg-amber-100 dark:bg-amber-500/20 text-amber-600"}`}>
                        {corretor.conversao}%
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <RiStarLine className="w-4 h-4 text-amber-500" />
                        <span className="font-medium text-neutral-900 dark:text-white">{corretor.avaliacao}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`flex items-center text-sm font-medium ${corretor.variacao >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {corretor.variacao >= 0 ? <RiArrowUpSLine className="w-4 h-4" /> : <RiArrowDownSLine className="w-4 h-4" />}
                        {Math.abs(corretor.variacao)}%
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
