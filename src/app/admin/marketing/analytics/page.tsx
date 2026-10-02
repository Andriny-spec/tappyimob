"use client";

import {
  RiLineChartLine,
  RiUserLine,
  RiEyeLine,
  RiCheckDoubleLine,
  RiBarChartLine,
} from "react-icons/ri";
import { useMarketingStats } from "@/components/admin/marketing/useMarketingStats";
import { PeriodSelector, KpiCard, BarList, DailyBarChart, PageHeader } from "@/components/admin/marketing/MarketingUI";

export default function MarketingAnalyticsPage() {
  const { data, loading, period, setPeriod } = useMarketingStats();

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        icon={RiLineChartLine}
        title="Analytics"
        subtitle="Tráfego e conversão do site — leads, visualizações de imóveis e origem"
        right={<PeriodSelector period={period} onChange={setPeriod} />}
      />

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
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-6">Leads por origem</h3>
              <BarList items={data.leadsBySource.slice(0, 8).map((s) => ({ label: s.label, count: s.count }))} color="#0B2545" />
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-6">Funil (status dos leads)</h3>
              <BarList items={data.leadsByStatus.map((s) => ({ label: s.label, count: s.count }))} color="#25D366" />
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">Canais Ads/Sociais no período</h3>
              <p className="text-xs text-neutral-400 mb-4">Facebook, Instagram e Google combinados — veja o detalhe em cada aba do menu</p>
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

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 text-sm text-amber-800 dark:text-amber-300">
            <strong>Nota:</strong> os números acima vêm dos leads cadastrados no CRM e das visualizações de imóveis
            individuais. Tráfego bruto de página (visitas na home, em <code>/imoveis</code> sem gerar lead, etc.)
            ainda não é rastreado internamente — hoje esse dado só existe no Google Analytics/Meta Pixel
            configurados em <a href="/admin/marketing/configuracoes" className="underline">Configurações</a>.
          </div>
        </>
      )}
    </div>
  );
}
