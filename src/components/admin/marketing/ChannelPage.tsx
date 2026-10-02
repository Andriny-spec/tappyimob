"use client";

import { RiUserLine, RiCheckDoubleLine, RiBarChartLine } from "react-icons/ri";
import { useMarketingStats } from "@/components/admin/marketing/useMarketingStats";
import { PeriodSelector, KpiCard, BarList, DailyBarChart, PageHeader } from "@/components/admin/marketing/MarketingUI";

interface ChannelPageProps {
  channel: "facebook" | "instagram" | "google";
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  color: "blue" | "pink" | "orange" | "purple";
  headerColor: "blue" | "pink" | "orange" | "purple";
  barColor: string;
  children?: React.ReactNode;
}

export function ChannelPage({ channel, icon, title, subtitle, color, headerColor, barColor, children }: ChannelPageProps) {
  const { data, loading, period, setPeriod } = useMarketingStats();

  const channelSources = data?.channelSources[channel] || [];
  const channelLeads = data?.leadsBySource.filter((s) => channelSources.includes(s.source)) || [];
  const totalChannelLeads = channelLeads.reduce((a, b) => a + b.count, 0);
  const totalLeads = data?.kpis.totalLeads || 0;
  const share = totalLeads > 0 ? Math.round((totalChannelLeads / totalLeads) * 100) : 0;

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        icon={icon}
        title={title}
        subtitle={subtitle}
        color={headerColor}
        right={<PeriodSelector period={period} onChange={setPeriod} />}
      />

      {loading || !data ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <KpiCard icon={RiUserLine} value={totalChannelLeads} label="Leads no período" color={color} />
            <KpiCard icon={RiBarChartLine} value={`${share}%`} label="Fatia do total de leads" color={color} />
            <KpiCard icon={RiCheckDoubleLine} value={data.kpis.conversionRate + "%"} label="Conversão geral (todos os canais)" color={color} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-6">Leads por dia</h3>
              <DailyBarChart data={data.leadsByDay} dataKey={channel} color={barColor} />
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-6">Detalhe por origem</h3>
              <BarList items={channelLeads.map((s) => ({ label: s.label, count: s.count }))} color={barColor} />
            </div>
          </div>

          {children}
        </>
      )}
    </div>
  );
}
