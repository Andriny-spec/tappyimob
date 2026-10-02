"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  UTM_COOKIE,
  UTM_COOKIE_MAX_AGE,
  lerOrigemDaUrl,
  serializarOrigem,
} from "@/lib/utm";

function jaTemCookie(): boolean {
  return document.cookie.split("; ").some((c) => c.startsWith(`${UTM_COOKIE}=`));
}

/** Referência interna não é origem — só polui o relatório. */
function referrerExterno(): string | null {
  const ref = document.referrer;
  if (!ref) return null;
  try {
    if (new URL(ref).hostname === window.location.hostname) return null;
  } catch {
    return null;
  }
  return ref;
}

/**
 * Grava a origem da visita num cookie assim que a pessoa entra no site.
 *
 * Regra de atribuição — **último clique**, que é o padrão do Google Ads e do
 * Meta e o que a equipe comercial espera ("o que trouxe essa pessoa agora"):
 *
 * - chegou com utm_* / gclid / fbclid → sobrescreve, é um novo clique de campanha
 * - não tem campanha e não há cookie → grava a entrada deduzida (busca
 *   orgânica, rede social, direto), para o lead nunca ficar sem origem alguma
 * - não tem campanha e já há cookie → não mexe, senão a navegação interna
 *   apagaria a campanha que trouxe a pessoa
 */
export function UtmTracker() {
  const pathname = usePathname();

  useEffect(() => {
    try {
      const { dados, temCampanha } = lerOrigemDaUrl(
        window.location.search,
        referrerExterno(),
        pathname
      );

      if (!temCampanha && jaTemCookie()) return;

      document.cookie = [
        `${UTM_COOKIE}=${serializarOrigem(dados)}`,
        "path=/",
        `max-age=${UTM_COOKIE_MAX_AGE}`,
        "samesite=lax",
        window.location.protocol === "https:" ? "secure" : "",
      ]
        .filter(Boolean)
        .join("; ");
    } catch {
      // Rastreamento nunca pode quebrar a página para o visitante.
    }
  }, [pathname]);

  return null;
}
