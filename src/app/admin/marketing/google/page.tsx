"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RiGoogleLine, RiInformationLine, RiArrowRightLine } from "react-icons/ri";
import { ChannelPage } from "@/components/admin/marketing/ChannelPage";

export default function MarketingGooglePage() {
  const [ga4Id, setGa4Id] = useState<string | null>(null);
  const [adsId, setAdsId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/marketing/tracking-config")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json?.config?.ga4Id) setGa4Id(json.config.ga4Id);
        setAdsId(json?.config?.googleAdsId || "");
      })
      .catch(() => {});
  }, []);

  return (
    <ChannelPage
      channel="google"
      icon={RiGoogleLine}
      title="Google"
      subtitle="Leads vindos do Google (orgânico e Google Ads)"
      color="orange"
      headerColor="orange"
      barColor="#EA4335"
    >
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center flex-shrink-0">
          <RiInformationLine className="w-5 h-5 text-orange-500" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">Google Analytics &amp; Ads</h3>
          <p className="text-sm text-neutral-500 mb-1">
            GA4 atual: <strong className="text-neutral-700 dark:text-neutral-300">{ga4Id || "carregando..."}</strong>
          </p>
          <p className="text-sm text-neutral-500 mb-3">
            ID de conversão do Google Ads:{" "}
            <strong className="text-neutral-700 dark:text-neutral-300">{adsId || "não configurado ainda"}</strong>
          </p>
          <Link href="/admin/marketing/configuracoes" className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700">
            Editar IDs <RiArrowRightLine className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </ChannelPage>
  );
}
