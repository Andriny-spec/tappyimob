"use client";

import { RiRadarLine, RiBuilding2Line, RiLayoutGridLine, RiFireLine, RiStarLine } from "react-icons/ri";
import { useMarketingStats } from "@/components/admin/marketing/useMarketingStats";
import { PeriodSelector, BarList, PageHeader } from "@/components/admin/marketing/MarketingUI";

const PROFILE_LABELS: Record<string, string> = {
  COMPRADOR: "Comprador", LOCATARIO: "Locatário", INVESTIDOR: "Investidor",
  PROPRIETARIO: "Proprietário", "NÃO INFORMADO": "Não informado",
};

const TEMP_LABELS: Record<string, string> = { QUENTE: "Quente", MORNO: "Morno", FRIO: "Frio" };

export default function MarketingInsightsPage() {
  const { data, loading, period, setPeriod } = useMarketingStats();

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        icon={RiRadarLine}
        title="Insights"
        subtitle="O que o público está buscando — condomínios, tipologias e perfil dos leads"
        color="purple"
        right={<PeriodSelector period={period} onChange={setPeriod} />}
      />

      {loading || !data ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
              <RiBuilding2Line className="w-5 h-5 text-blue-500" />
              Top Condomínios de interesse
            </h3>
            <BarList items={data.topCondominiums.map((c) => ({ label: c.name, count: c.count }))} color="#3B82F6" />
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
              <RiLayoutGridLine className="w-5 h-5 text-purple-500" />
              Tipologias mais buscadas
            </h3>
            <BarList items={data.topTypologies.map((t) => ({ label: t.name, count: t.count }))} color="#8B5CF6" />
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
              <RiFireLine className="w-5 h-5 text-orange-500" />
              Temperatura dos leads
            </h3>
            <BarList items={data.temperatureData.map((t) => ({ label: TEMP_LABELS[t.name] || t.name, count: t.count }))} color="#25D366" />
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
              <RiStarLine className="w-5 h-5 text-amber-500" />
              Perfil / Finalidade
            </h3>
            <BarList items={data.profileData.map((p) => ({ label: PROFILE_LABELS[p.name] || p.name, count: p.count }))} color="#F59E0B" />
          </div>
        </div>
      )}
    </div>
  );
}
