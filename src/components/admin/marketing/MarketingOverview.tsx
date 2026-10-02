"use client";

import Link from "next/link";
import {
  RiUserLine,
  RiEyeLine,
  RiCheckDoubleLine,
  RiBarChartLine,
  RiFacebookCircleLine,
  RiInstagramLine,
  RiGoogleLine,
  RiRadarLine,
  RiSettings4Line,
  RiArrowRightLine,
} from "react-icons/ri";
import { useAuth } from "@/providers/auth-provider";
import { useMarketingStats } from "@/components/admin/marketing/useMarketingStats";
import { PeriodSelector, KpiCard, BarList, DailyBarChart } from "@/components/admin/marketing/MarketingUI";

const quickLinks = [
  { name: "Facebook", href: "/admin/marketing/facebook", icon: RiFacebookCircleLine, color: "text-blue-500 bg-blue-100 dark:bg-blue-500/20" },
  { name: "Instagram", href: "/admin/marketing/instagram", icon: RiInstagramLine, color: "text-pink-500 bg-pink-100 dark:bg-pink-500/20" },
  { name: "Google", href: "/admin/marketing/google", icon: RiGoogleLine, color: "text-red-500 bg-red-100 dark:bg-red-500/20" },
  { name: "Insights", href: "/admin/marketing/insights", icon: RiRadarLine, color: "text-purple-500 bg-purple-100 dark:bg-purple-500/20" },
  { name: "Configurações", href: "/admin/marketing/configuracoes", icon: RiSettings4Line, color: "text-neutral-500 bg-neutral-100 dark:bg-neutral-500/20" },
];

export default function MarketingOverview() {
  const { user } = useAuth();
  const { data, loading, period, setPeriod } = useMarketingStats();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Olá, {user?.name?.split(" ")[0] || "Marketing"} 👋
          </h1>
          <p className="text-sm text-neutral-500 mt-1">Visão geral de marketing — leads, tráfego e canais</p>
        </div>
        <PeriodSelector period={period} onChange={setPeriod} />
      </div>

      {loading || !data ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard icon={RiUserLine} value={data.kpis.totalLeads} label="Leads no período" color="orange" />
            <KpiCard icon={RiEyeLine} value={data.kpis.totalViews} label="Views de imóveis no período" color="blue" />
            <KpiCard icon={RiCheckDoubleLine} value={`${data.kpis.conversionRate}%`} label="Taxa de conversão" color="green" />
            <KpiCard icon={RiBarChartLine} value={data.kpis.totalViewsAllTime} label="Views totais (histórico)" color="purple" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                <RiBarChartLine className="w-5 h-5 text-orange-500" />
                Leads por dia
              </h3>
              <DailyBarChart data={data.leadsByDay} dataKey="total" color="#25D366" />
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-6">Canais Ads/Sociais no período</h3>
              <BarList
                items={[
                  { label: "Facebook", count: data.leadsBySource.filter((s) => data.channelSources.facebook.includes(s.source)).reduce((a, b) => a + b.count, 0) },
                  { label: "Instagram", count: data.leadsBySource.filter((s) => data.channelSources.instagram.includes(s.source)).reduce((a, b) => a + b.count, 0) },
                  { label: "Google", count: data.leadsBySource.filter((s) => data.channelSources.google.includes(s.source)).reduce((a, b) => a + b.count, 0) },
                ]}
                color="#8B5CF6"
              />
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">Acesso rápido</h3>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 hover:border-orange-300 dark:hover:border-orange-500/50 transition-colors group"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${link.color}`}>
                    <link.icon className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white flex items-center justify-between">
                    {link.name}
                    <RiArrowRightLine className="w-3.5 h-3.5 text-neutral-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
