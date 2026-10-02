"use client";

import { RiMegaphoneLine } from "react-icons/ri";
import { rotuloOrigem } from "@/lib/utm";

type LeadComOrigem = {
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;
  gclid?: string | null;
  fbclid?: string | null;
  landingPage?: string | null;
};

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-neutral-500 shrink-0">{rotulo}</span>
      <span className="font-medium text-neutral-700 dark:text-neutral-300 text-right break-all">
        {valor}
      </span>
    </div>
  );
}

/**
 * Bloco de origem de campanha dentro do "Caminho do cliente".
 *
 * Só aparece para leads capturados depois da entrada do rastreamento — os
 * antigos não têm esses dados e mostrar tudo vazio só ocuparia espaço.
 */
export function OrigemCampanha({ lead }: { lead: LeadComOrigem }) {
  const temAlgo =
    lead.utmSource ||
    lead.utmCampaign ||
    lead.utmMedium ||
    lead.gclid ||
    lead.fbclid;

  if (!temAlgo) return null;

  const pago = lead.utmMedium === "cpc" || Boolean(lead.gclid);

  return (
    <div className="mt-2 pt-2 border-t border-sky-200/70 dark:border-sky-500/20">
      <p className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold uppercase tracking-wide mb-1.5 flex items-center gap-1">
        <RiMegaphoneLine className="w-3 h-3" /> Campanha
        {pago && (
          <span className="ml-1 px-1.5 py-px rounded bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 font-semibold normal-case tracking-normal">
            anúncio pago
          </span>
        )}
      </p>

      <div className="space-y-1 text-xs">
        <Linha rotulo="Origem / Mídia" valor={rotuloOrigem(lead)} />
        {lead.utmCampaign && <Linha rotulo="Campanha" valor={lead.utmCampaign} />}
        {lead.utmContent && <Linha rotulo="Conteúdo" valor={lead.utmContent} />}
        {lead.utmTerm && <Linha rotulo="Termo" valor={lead.utmTerm} />}
        {lead.landingPage && (
          <Linha rotulo="Página de entrada" valor={lead.landingPage} />
        )}
      </div>
    </div>
  );
}
