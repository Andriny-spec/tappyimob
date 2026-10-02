"use client";

import { useEffect, useRef, useState } from "react";

// Só monta o conteúdo real (e só então o navegador busca as imagens dentro dele)
// quando a seção chega perto da viewport. minHeight deve refletir a altura real
// do conteúdo pra não causar CLS quando ele entra.
export function DeferredMount({
  minHeight,
  children,
}: {
  minHeight: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={visible ? undefined : { minHeight }}>
      {visible ? children : null}
    </div>
  );
}
