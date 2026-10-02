"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * Tela de carregamento da TappyImob.
 *
 * - `modo="abertura"`: cobre a página ao abrir e sai sozinha (~1,4 s).
 * - `modo="entrando"`: fica até a próxima página assumir (depois do login).
 *
 * A saída é feita por CSS (animation-fill-mode), não por JavaScript: se a aba
 * abrir em segundo plano ou o JS atrasar, a tela some do mesmo jeito e nunca
 * fica presa por cima do site. O estado só remove o nó do DOM depois.
 */
export function TappyLoader({
  modo = "abertura",
  mensagem,
}: {
  modo?: "abertura" | "entrando";
  mensagem?: string;
}) {
  const [montado, setMontado] = useState(true);

  useEffect(() => {
    if (modo !== "abertura") return;
    // Garantia extra: remove do DOM mesmo se o animationend não disparar
    const t = window.setTimeout(() => setMontado(false), 2600);
    return () => window.clearTimeout(t);
  }, [modo]);

  if (!montado) return null;

  return (
    <div
      className={`saas-loader ${modo === "abertura" ? "saas-loader-auto" : "saas-loader-hold"}`}
      role="status"
      aria-live="polite"
      aria-label={mensagem || "Carregando"}
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget && modo === "abertura") setMontado(false);
      }}
    >
      <div className="saas-loader-glow" aria-hidden="true" />
      <div className="saas-loader-center">
        <div className="saas-loader-mark" aria-hidden="true">
          <span className="saas-loader-ring ring-a" />
          <span className="saas-loader-ring ring-b" />
          <span className="saas-loader-ring ring-c" />
          <div className="saas-loader-symbol">
            <Image src="/saas/tappy-symbol.png" alt="" width={96} height={96} priority />
          </div>
        </div>
        <Image src="/logo.png" alt="TappyImob" width={1200} height={263} className="saas-loader-word" priority />
        <div className="saas-loader-bar" aria-hidden="true">
          <i />
        </div>
        <span className="saas-loader-text">{mensagem || "Conectando possibilidades"}</span>
      </div>
    </div>
  );
}
