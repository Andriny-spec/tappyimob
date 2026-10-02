"use client";

import { useState, useEffect } from "react";
import { followUpDaysByTemperature, LeadTemperature } from "@/types/lead";

// Hook para buscar os prazos de follow-up configuráveis
// Fallback para os valores padrão em types/lead.ts
export function useFollowUpDays() {
  const [days, setDays] = useState<Record<LeadTemperature, number>>(followUpDaysByTemperature);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/admin/config?key=followup_days");
        if (res.ok) {
          const data = await res.json();
          if (data.value && typeof data.value === "object") {
            setDays({
              QUENTE: data.value.QUENTE ?? followUpDaysByTemperature.QUENTE,
              MORNO: data.value.MORNO ?? followUpDaysByTemperature.MORNO,
              FRIO: data.value.FRIO ?? followUpDaysByTemperature.FRIO,
            });
          }
        }
      } catch {
        // fallback to defaults
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  return { days, loading };
}
