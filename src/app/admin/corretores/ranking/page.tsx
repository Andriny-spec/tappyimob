"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiTrophyLine,
  RiMedalLine,
  RiStarFill,
  RiArrowUpLine,
  RiArrowDownLine,
  RiSubtractLine,
  RiFireLine,
  RiLineChartLine,
  RiCalendarLine,
  RiHome4Line,
  RiMoneyDollarCircleLine,
  RiGroupLine,
  RiAwardLine,
  RiLoader4Line,
} from "react-icons/ri";

interface RankingItem {
  id: string;
  position: number;
  previousPosition: number;
  name: string;
  avatar: string | null;
  vendas: number;
  valorTotal: number;
  comissao: number;
  conversao: number;
  pontos: number;
  streak: number;
  badges: string[];
}

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState("30d");
  const [metrica, setMetrica] = useState<"pontos" | "vendas" | "valor">("pontos");

  useEffect(() => {
    fetchRanking();
  }, [periodo]);

  const fetchRanking = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/corretores/ranking?periodo=${periodo}`);
      if (res.ok) {
        const data = await res.json();
        setRanking(data || []);
      }
    } catch (error) {
      console.error("Erro ao buscar ranking:", error);
    } finally {
      setLoading(false);
    }
  };

  function formatCurrencyShort(value: number) {
    if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(1)}K`;
    return `R$ ${value.toFixed(0)}`;
  }

  const stats = [
    { label: "Vendas Totais", value: ranking.reduce((acc, r) => acc + r.vendas, 0).toString(), icon: RiHome4Line, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-500/20" },
    { label: "Valor Total", value: formatCurrencyShort(ranking.reduce((acc, r) => acc + r.valorTotal, 0)), icon: RiMoneyDollarCircleLine, color: "text-green-500", bg: "bg-green-100 dark:bg-green-500/20" },
    { label: "Corretores Ativos", value: ranking.length.toString(), icon: RiGroupLine, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-500/20" },
    { label: "Conversão Média", value: ranking.length > 0 ? `${Math.round(ranking.reduce((acc, r) => acc + r.conversao, 0) / ranking.length)}%` : "0%", icon: RiLineChartLine, color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-500/20" },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  const getPositionChange = (current: number, previous: number) => {
    const diff = previous - current;
    if (diff > 0) return { icon: RiArrowUpLine, color: "text-green-500", label: `+${diff}` };
    if (diff < 0) return { icon: RiArrowDownLine, color: "text-red-500", label: `${diff}` };
    return { icon: RiSubtractLine, color: "text-neutral-400", label: "=" };
  };

  const getPodiumColor = (position: number) => {
    if (position === 1) return "from-emerald-400 to-emerald-600";
    if (position === 2) return "from-neutral-300 to-neutral-500";
    if (position === 3) return "from-emerald-600 to-emerald-800";
    return "from-neutral-200 to-neutral-400";
  };

  const getPodiumHeight = (position: number) => {
    if (position === 1) return "h-32";
    if (position === 2) return "h-24";
    if (position === 3) return "h-20";
    return "h-16";
  };

  const top3 = ranking.slice(0, 3);
  const restOfRanking = ranking.slice(3);

  // Reorder for podium display (2nd, 1st, 3rd)
  const podiumOrder = [top3[1], top3[0], top3[2]];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/corretores"
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
          >
            <RiArrowLeftLine className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                <RiTrophyLine className="w-5 h-5 text-amber-500" />
              </div>
              Ranking
            </h1>
            <p className="text-neutral-500 mt-1">
              Classificação dos corretores por performance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
            {([
              { value: "7d", label: "7 dias" },
              { value: "30d", label: "30 dias" },
              { value: "60d", label: "60 dias" },
              { value: "90d", label: "90 dias" },
            ] as const).map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriodo(p.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  periodo === p.value
                    ? "bg-white dark:bg-neutral-700 text-amber-500 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <select
            value={metrica}
            onChange={(e) => setMetrica(e.target.value as any)}
            className="h-10 px-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-900 dark:text-white"
          >
            <option value="pontos">Por Pontos</option>
            <option value="vendas">Por Vendas</option>
            <option value="valor">Por Valor</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-neutral-500">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Podium */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-500/10 dark:to-neutral-900 rounded-2xl border border-amber-200 dark:border-amber-500/20 p-8"
      >
        <div className="flex items-end justify-center gap-4">
          {podiumOrder.map((corretor, index) => {
            if (!corretor) return null;
            const position = corretor.position;
            const change = getPositionChange(corretor.position, corretor.previousPosition);

            return (
              <motion.div
                key={corretor.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex flex-col items-center"
              >
                {/* Avatar */}
                <div className="relative mb-3">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-b ${getPodiumColor(position)} flex items-center justify-center border-4 border-white dark:border-neutral-800 shadow-lg`}>
                    <span className="text-xl font-bold text-white">
                      {corretor.name.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                  {position === 1 && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <RiTrophyLine className="w-6 h-6 text-amber-500" />
                    </div>
                  )}
                  {corretor.streak > 0 && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center border-2 border-white">
                      <RiFireLine className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Name and stats */}
                <p className="font-semibold text-neutral-900 dark:text-white text-center mb-1">
                  {corretor.name}
                </p>
                <p className="text-2xl font-bold text-amber-500 mb-1">{corretor.pontos.toLocaleString()}</p>
                <p className="text-xs text-neutral-500">pontos</p>

                {/* Position change */}
                <div className={`flex items-center gap-1 mt-2 ${change.color}`}>
                  <change.icon className="w-4 h-4" />
                  <span className="text-xs font-medium">{change.label}</span>
                </div>

                {/* Podium */}
                <div className={`mt-4 w-24 ${getPodiumHeight(position)} bg-gradient-to-b ${getPodiumColor(position)} rounded-t-xl flex items-center justify-center shadow-lg`}>
                  <span className="text-3xl font-bold text-white">{position}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Rest of ranking */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="font-semibold text-neutral-900 dark:text-white">Classificação Completa</h2>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {restOfRanking.map((corretor, index) => {
            const change = getPositionChange(corretor.position, corretor.previousPosition);

            return (
              <motion.div
                key={corretor.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="flex items-center gap-4 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
              >
                {/* Position */}
                <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-neutral-600 dark:text-neutral-400">
                  {corretor.position}
                </div>

                {/* Change indicator */}
                <div className={`flex items-center ${change.color}`}>
                  <change.icon className="w-4 h-4" />
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                  <span className="text-sm font-bold text-neutral-600 dark:text-neutral-400">
                    {corretor.name.split(" ").map(n => n[0]).join("")}
                  </span>
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-900 dark:text-white">{corretor.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {corretor.badges.map((badge) => (
                      <span
                        key={badge}
                        className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="hidden lg:flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-lg font-bold text-neutral-900 dark:text-white">{corretor.vendas}</p>
                    <p className="text-xs text-neutral-500">vendas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-500">{formatCurrency(corretor.valorTotal)}</p>
                    <p className="text-xs text-neutral-500">valor total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-purple-500">{corretor.conversao}%</p>
                    <p className="text-xs text-neutral-500">conversão</p>
                  </div>
                </div>

                {/* Points */}
                <div className="text-right">
                  <p className="text-xl font-bold text-amber-500">{corretor.pontos.toLocaleString()}</p>
                  <p className="text-xs text-neutral-500">pontos</p>
                </div>

                {/* Streak */}
                {corretor.streak > 0 && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-500/20 rounded-full">
                    <RiFireLine className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                      {corretor.streak}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
        <div className="flex items-center gap-2">
          <RiFireLine className="w-4 h-4 text-orange-500" />
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Streak: meses consecutivos batendo meta</span>
        </div>
        <div className="flex items-center gap-2">
          <RiArrowUpLine className="w-4 h-4 text-green-500" />
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Subiu no ranking</span>
        </div>
        <div className="flex items-center gap-2">
          <RiArrowDownLine className="w-4 h-4 text-red-500" />
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Desceu no ranking</span>
        </div>
      </div>
    </div>
  );
}
