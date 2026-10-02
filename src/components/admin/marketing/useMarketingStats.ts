"use client";

import { useState, useEffect } from "react";

export interface MarketingStats {
  period: string;
  kpis: {
    totalLeads: number;
    totalViews: number;
    totalViewsAllTime: number;
    conversionRate: number;
    fechados: number;
  };
  leadsBySource: { source: string; label: string; count: number; percent: number }[];
  leadsByStatus: { status: string; label: string; count: number }[];
  leadsByDay: { date: string; day: string; total: number; facebook: number; instagram: number; google: number }[];
  topCondominiums: { name: string; count: number }[];
  topTypologies: { name: string; count: number }[];
  temperatureData: { name: string; count: number }[];
  profileData: { name: string; count: number }[];
  channelSources: Record<string, string[]>;
}

export function useMarketingStats(initialPeriod: "7d" | "30d" | "90d" = "30d") {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">(initialPeriod);
  const [data, setData] = useState<MarketingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/marketing/stats?period=${period}`);
        const json = res.ok ? await res.json() : null;
        if (!cancelled && json) setData(json);
      } catch (err) {
        console.error("Erro ao buscar estatísticas de marketing:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchStats();
    return () => { cancelled = true; };
  }, [period]);

  return { data, loading, period, setPeriod };
}
