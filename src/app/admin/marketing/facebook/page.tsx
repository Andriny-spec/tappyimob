"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RiFacebookCircleLine, RiInformationLine, RiArrowRightLine } from "react-icons/ri";
import { ChannelPage } from "@/components/admin/marketing/ChannelPage";

export default function MarketingFacebookPage() {
  const [pixelId, setPixelId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/marketing/tracking-config")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => { if (json?.config?.metaPixelId) setPixelId(json.config.metaPixelId); })
      .catch(() => {});
  }, []);

  return (
    <ChannelPage
      channel="facebook"
      icon={RiFacebookCircleLine}
      title="Facebook"
      subtitle="Leads vindos do Facebook (orgânico, grupos e Meta Ads)"
      color="blue"
      headerColor="blue"
      barColor="#1877F2"
    >
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
          <RiInformationLine className="w-5 h-5 text-blue-500" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">Meta Pixel</h3>
          <p className="text-sm text-neutral-500 mb-3">
            Pixel atual instalado no site: <strong className="text-neutral-700 dark:text-neutral-300">{pixelId || "carregando..."}</strong>.
            É esse ID que o Gerenciador de Anúncios do Facebook usa pra medir conversão.
          </p>
          <Link href="/admin/marketing/configuracoes" className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700">
            Editar Pixel <RiArrowRightLine className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </ChannelPage>
  );
}
