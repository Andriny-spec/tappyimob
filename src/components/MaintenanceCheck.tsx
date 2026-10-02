"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

// Rotas que NUNCA são afetadas pela manutenção
const EXCLUDED_PATHS = [
  "/admin",
  "/manutencao",
  "/api",
  "/_next",
  "/favicon",
];

export function MaintenanceCheck({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const hasChecked = useRef(false);

  useEffect(() => {
    // Não verifica em rotas excluídas (admin, api, etc)
    const isExcluded = EXCLUDED_PATHS.some((path) => pathname.startsWith(path));
    if (isExcluded) {
      setChecked(true);
      return;
    }

    // Só verifica uma vez
    if (hasChecked.current) {
      setChecked(true);
      return;
    }

    // Verifica status de manutenção
    fetch("/api/maintenance/status")
      .then((res) => res.json())
      .then((data) => {
        hasChecked.current = true;
        if (data.isActive) {
          window.location.href = "/manutencao";
        } else {
          setChecked(true);
        }
      })
      .catch(() => {
        hasChecked.current = true;
        setChecked(true);
      });
  }, [pathname, router]);

  // Se ainda não verificou, não renderiza (evita flash)
  if (!checked) {
    return null;
  }

  return <>{children}</>;
}
