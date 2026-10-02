"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  RiUserLine,
  RiPhoneLine,
  RiStarLine,
  RiHandCoinLine,
  RiCheckDoubleLine,
  RiCloseLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiCalendarLine,
  RiLineChartLine,
  RiPieChartLine,
  RiBarChartLine,
  RiTimeLine,
  RiFireLine,
  RiTrophyLine,
  RiHome4Line,
  RiEyeLine,
  RiExchangeLine,
  RiBuilding2Line,
  RiLayoutGridLine,
} from "react-icons/ri";

interface LeadsChartsProps {
  stats: {
    total: number;
    NOVO: number;
    CONTATADO: number;
    QUALIFICADO: number;
    NEGOCIANDO: number;
    FECHADO: number;
    PERDIDO: number;
  };
  corretorId?: string;
  onFilterApply?: (filters: { status?: string; source?: string; temperature?: string }) => void;
  onViewProposals?: () => void;
}

export function LeadsCharts({ stats, corretorId, onFilterApply, onViewProposals }: LeadsChartsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const [animationComplete, setAnimationComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => setAnimationComplete(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ period: selectedPeriod });
        if (corretorId) params.set("corretorId", corretorId);
        const res = await fetch(`/api/admin/leads/analytics?${params}`);
        if (res.ok) {
          const data = await res.json();
          setAnalytics(data);
        }
      } catch (error) {
        console.error("Erro ao buscar analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [selectedPeriod, corretorId]);

  const weeklyData = analytics?.weeklyData || [];
  const sourceData = analytics?.sourceData || [];
  const monthlyTrend = analytics?.monthlyTrend || [];
  const kpis = analytics?.kpis || { total: stats.total, conversionRate: 0, avgDays: 0, negociando: stats.NEGOCIANDO, growthPercent: 0, leadsWithVisit: 0, leadsWithLinkedProperties: 0, permutaCount: 0 };
  const topCondominiums = analytics?.topCondominiums || [];
  const topTypologies = analytics?.topTypologies || [];
  const profileData = analytics?.profileData || [];
  const temperatureData = analytics?.temperatureData || [];
  const proposalsStats = analytics?.proposalsStats || { total: 0, byStatus: {} };

  const maxMonthlyLeads = Math.max(...monthlyTrend.map((m: any) => m.leads), 1);
  const maxWeeklyNovos = Math.max(...weeklyData.map((d: any) => d.novos), 1);

  // Bug #50: Usar statusCounts da API quando disponível (evita divergência)
  const sc = analytics?.statusCounts || {};
  const statusDistribution = [
    { status: "Novos", count: sc.NOVO ?? stats.NOVO, color: "#3B82F6", icon: <RiUserLine /> },
    { status: "Contatados", count: sc.CONTATADO ?? stats.CONTATADO, color: "#8B5CF6", icon: <RiPhoneLine /> },
    { status: "Qualificados", count: sc.QUALIFICADO ?? stats.QUALIFICADO, color: "#F59E0B", icon: <RiStarLine /> },
    { status: "Negociando", count: sc.NEGOCIANDO ?? stats.NEGOCIANDO, color: "#10B981", icon: <RiHandCoinLine /> },
    { status: "Fechados", count: sc.FECHADO ?? stats.FECHADO, color: "#22C55E", icon: <RiCheckDoubleLine /> },
    { status: "Perdidos", count: sc.PERDIDO ?? stats.PERDIDO, color: "#EF4444", icon: <RiCloseLine /> },
  ];

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
          <RiLineChartLine className="w-5 h-5 text-orange-500" />
          Analytics de Leads
        </h3>
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
          {(["7d", "30d", "90d"] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedPeriod === period
                  ? "bg-white dark:bg-neutral-700 text-orange-500 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {period === "7d" ? "7 dias" : period === "30d" ? "30 dias" : "90 dias"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
              <RiUserLine className="w-6 h-6 text-blue-500" />
            </div>
            {kpis.growthPercent !== 0 && (
              <div className={`flex items-center gap-1 ${kpis.growthPercent > 0 ? "text-green-500" : "text-red-500"} text-sm font-medium`}>
                {kpis.growthPercent > 0 ? <RiArrowUpLine className="w-4 h-4" /> : <RiArrowDownLine className="w-4 h-4" />}
                {kpis.growthPercent > 0 ? "+" : ""}{kpis.growthPercent}%
              </div>
            )}
          </div>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white">{kpis.total}</p>
          <p className="text-sm text-neutral-500 mt-1">Total de Leads</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
              <RiCheckDoubleLine className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white">
            {kpis.conversionRate}%
          </p>
          <p className="text-sm text-neutral-500 mt-1">Taxa de Conversão</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
              <RiTimeLine className="w-6 h-6 text-amber-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white">{kpis.avgDays > 0 ? `${kpis.avgDays} dias` : "-"}</p>
          <p className="text-sm text-neutral-500 mt-1">Tempo Médio</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
              <RiFireLine className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white">{kpis.negociando}</p>
          <p className="text-sm text-neutral-500 mt-1">Em Negociação</p>
        </motion.div>
      </div>

      {/* Insights Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-500/20 flex items-center justify-center">
              <RiEyeLine className="w-6 h-6 text-teal-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white">{kpis.leadsWithVisit}</p>
          <p className="text-sm text-neutral-500 mt-1">Com Visitas</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
              <RiHome4Line className="w-6 h-6 text-indigo-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white">{kpis.leadsWithLinkedProperties}</p>
          <p className="text-sm text-neutral-500 mt-1">Com Imóveis</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-500/20 flex items-center justify-center">
              <RiExchangeLine className="w-6 h-6 text-pink-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white">{kpis.permutaCount}</p>
          <p className="text-sm text-neutral-500 mt-1">Com Permuta</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
              <RiFireLine className="w-6 h-6 text-orange-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white">
            {temperatureData.find((t: any) => t.name === "QUENTE")?.count || 0}
          </p>
          <p className="text-sm text-neutral-500 mt-1">Leads Quentes</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          onClick={onViewProposals}
          className={`bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 ${onViewProposals ? "cursor-pointer hover:border-orange-300 dark:hover:border-orange-500/40 transition-colors" : ""}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center">
              <RiHandCoinLine className="w-6 h-6 text-rose-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white">{proposalsStats.total}</p>
          <p className="text-sm text-neutral-500 mt-1">Propostas no Período</p>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Weekly Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <RiBarChartLine className="w-5 h-5 text-blue-500" />
              Leads por Dia
            </h4>
            <span className="text-xs text-neutral-500">Última semana</span>
          </div>
          
          <div className="flex items-end justify-between gap-2 h-48">
            {weeklyData.map((day: any, index: number) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center gap-1">
                  {/* Convertidos */}
                  <motion.div
                    className="w-full bg-green-500 rounded-t-lg"
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.convertidos / maxWeeklyNovos) * 100}%` }}
                    transition={{ delay: 0.5 + index * 0.05, duration: 0.5 }}
                    style={{ minHeight: day.convertidos > 0 ? 8 : 0 }}
                  />
                  {/* Novos */}
                  <motion.div
                    className="w-full bg-blue-500 rounded-t-lg"
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.novos / maxWeeklyNovos) * 100}%` }}
                    transition={{ delay: 0.5 + index * 0.05, duration: 0.5 }}
                    style={{ minHeight: 8 }}
                  />
                </div>
                <span className="text-xs text-neutral-500">{day.day}</span>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-xs text-neutral-500">Novos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span className="text-xs text-neutral-500">Convertidos</span>
            </div>
          </div>
        </motion.div>

        {/* Donut Chart - Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <RiPieChartLine className="w-5 h-5 text-purple-500" />
              Distribuição por Status
            </h4>
          </div>
          
          <div className="flex items-center gap-8">
            {/* Donut Chart */}
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {(() => {
                  let cumulativePercent = 0;
                  return statusDistribution.map((item, index) => {
                    const percent = stats.total > 0 ? (item.count / stats.total) * 100 : 0;
                    const strokeDasharray = `${percent} ${100 - percent}`;
                    const strokeDashoffset = -cumulativePercent;
                    cumulativePercent += percent;
                    
                    return (
                      <motion.circle
                        key={item.status}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={item.color}
                        strokeWidth="20"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        pathLength="100"
                      />
                    );
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.total}</span>
                <span className="text-xs text-neutral-500">Total</span>
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex-1 space-y-2">
              {statusDistribution.map((item) => (
                <div
                  key={item.status}
                  onClick={() => onFilterApply?.({ status: item.status.toUpperCase() })}
                  className={`flex items-center justify-between rounded-lg px-2 py-1 -mx-2 transition-colors ${onFilterApply ? "cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">{item.status}</span>
                  </div>
                  <span className="text-sm font-semibold text-neutral-900 dark:text-white">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Line Chart - Monthly Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <RiLineChartLine className="w-5 h-5 text-green-500" />
              Tendência Mensal
            </h4>
          </div>
          
          <div className="relative h-48">
            {monthlyTrend.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-neutral-400">Sem dados no período</div>
            ) : (
              <>
                {/* Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="border-t border-neutral-100 dark:border-neutral-800" />
                  ))}
                </div>
                
                {/* Chart */}
                <svg viewBox={`0 0 ${(monthlyTrend.length - 1) * 60} 150`} className="w-full h-full" preserveAspectRatio="none">
                  {/* Area */}
                  <motion.path
                    d={`M 0 ${150 - (monthlyTrend[0].leads / maxMonthlyLeads) * 130} ${monthlyTrend.map((m: any, i: number) => `L ${i * 60} ${150 - (m.leads / maxMonthlyLeads) * 130}`).join(' ')} L ${(monthlyTrend.length - 1) * 60} 150 L 0 150 Z`}
                    fill="url(#gradient)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    transition={{ delay: 0.8 }}
                  />
                  
                  {/* Line */}
                  <motion.path
                    d={`M 0 ${150 - (monthlyTrend[0].leads / maxMonthlyLeads) * 130} ${monthlyTrend.map((m: any, i: number) => `L ${i * 60} ${150 - (m.leads / maxMonthlyLeads) * 130}`).join(' ')}`}
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.7, duration: 1 }}
                  />
                  
                  {/* Points */}
                  {monthlyTrend.map((m: any, i: number) => (
                    <motion.circle
                      key={m.month}
                      cx={i * 60}
                      cy={150 - (m.leads / maxMonthlyLeads) * 130}
                      r="5"
                      fill="#3B82F6"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.9 + i * 0.1 }}
                    />
                  ))}
                  
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
                  {monthlyTrend.map((m: any) => (
                    <span key={m.month} className="text-xs text-neutral-500">{m.month}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Source Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <RiBarChartLine className="w-5 h-5 text-amber-500" />
              Origem dos Leads
            </h4>
          </div>
          
          <div className="space-y-4">
            {sourceData.map((source: any, index: number) => (
              <div key={source.source}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">{source.source}</span>
                  <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {source.count} ({source.percent}%)
                  </span>
                </div>
                <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: source.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${source.percent}%` }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Insights Grid - Condomínios, Tipologias, Finalidade */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Condomínios */}
        {topCondominiums.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6"
          >
            <h4 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2 mb-4">
              <RiBuilding2Line className="w-5 h-5 text-blue-500" />
              Top Condomínios
            </h4>
            <div className="space-y-3">
              {topCondominiums.slice(0, 8).map((c: any, i: number) => {
                const maxCount = topCondominiums[0]?.count || 1;
                return (
                  <div key={c.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-neutral-600 dark:text-neutral-400 truncate max-w-[70%]">{c.name}</span>
                      <span className="text-xs font-semibold text-neutral-900 dark:text-white">{c.count}</span>
                    </div>
                    <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-blue-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${(c.count / maxCount) * 100}%` }}
                        transition={{ delay: 0.9 + i * 0.05, duration: 0.4 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Tipologias */}
        {topTypologies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
            className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6"
          >
            <h4 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2 mb-4">
              <RiLayoutGridLine className="w-5 h-5 text-purple-500" />
              Tipologias Buscadas
            </h4>
            <div className="space-y-3">
              {topTypologies.slice(0, 8).map((t: any, i: number) => {
                const maxCount = topTypologies[0]?.count || 1;
                return (
                  <div key={t.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-neutral-600 dark:text-neutral-400">{t.name}</span>
                      <span className="text-xs font-semibold text-neutral-900 dark:text-white">{t.count}</span>
                    </div>
                    <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${(t.count / maxCount) * 100}%` }}
                        transition={{ delay: 0.9 + i * 0.05, duration: 0.4 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Finalidade / Perfil */}
        {profileData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6"
          >
            <h4 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2 mb-4">
              <RiStarLine className="w-5 h-5 text-amber-500" />
              Finalidade
            </h4>
            <div className="space-y-3">
              {profileData.map((p: any, i: number) => {
                const profileLabels: Record<string, string> = {
                  COMPRADOR: "Comprador",
                  LOCATARIO: "Locatário",
                  INVESTIDOR: "Investidor",
                  PROPRIETARIO: "Proprietário",
                  "NÃO INFORMADO": "Não informado",
                };
                const profileColors: Record<string, string> = {
                  COMPRADOR: "#3B82F6",
                  LOCATARIO: "#8B5CF6",
                  INVESTIDOR: "#F59E0B",
                  PROPRIETARIO: "#10B981",
                  "NÃO INFORMADO": "#6B7280",
                };
                const maxCount = profileData[0]?.count || 1;
                return (
                  <div key={p.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-neutral-600 dark:text-neutral-400">{profileLabels[p.name] || p.name}</span>
                      <span className="text-xs font-semibold text-neutral-900 dark:text-white">{p.count}</span>
                    </div>
                    <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: profileColors[p.name] || "#6B7280" }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(p.count / maxCount) * 100}%` }}
                        transition={{ delay: 0.9 + i * 0.05, duration: 0.4 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Top Corretores */}
      {analytics?.topCorretores?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <RiTrophyLine className="w-5 h-5 text-amber-500" />
              Top Corretores
            </h4>
            <span className="text-xs text-neutral-500">No período</span>
          </div>
          <div className="space-y-3">
            {analytics.topCorretores.map((corretor: any, i: number) => (
              <div key={corretor.name} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  i === 0 ? "bg-amber-100 text-amber-600 dark:bg-amber-500/20" :
                  i === 1 ? "bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300" :
                  "bg-orange-100 text-orange-600 dark:bg-orange-500/20"
                }`}>
                  {i + 1}
                </span>
                <span className="flex-1 text-sm font-medium text-neutral-900 dark:text-white truncate">{corretor.name}</span>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-neutral-500">{corretor.leads} leads</span>
                  <span className="font-semibold text-green-500">{corretor.conversao} conv.</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
