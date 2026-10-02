"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiFocus3Line,
  RiAddLine,
  RiCalendarLine,
  RiTrophyLine,
  RiFireLine,
  RiMedalLine,
  RiLineChartLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiEditLine,
  RiDeleteBinLine,
  RiArrowUpLine,
  RiStarLine,
  RiLoader4Line,
} from "react-icons/ri";
import { AddMetaModal } from "@/components/admin/corretores/modals/AddMetaModal";

interface Meta {
  id: string;
  periodo: string;
  metaVendas: number;
  metaValor: number;
  metaLeads: number;
  vendasRealizadas: number;
  valorRealizado: number;
  leadsConvertidos: number;
  bonus: number;
  status: string;
  corretor: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

export default function MetasPage() {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodoFilter, setPeriodoFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchMetas();
  }, [periodoFilter]);

  const fetchMetas = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (periodoFilter) params.append("periodo", periodoFilter);

      const res = await fetch(`/api/admin/corretores/metas?${params}`);
      if (res.ok) {
        const data = await res.json();
        setMetas(data || []);
      }
    } catch (error) {
      console.error("Erro ao buscar metas:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: "Metas Ativas", value: metas.length.toString(), icon: RiFocus3Line, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-500/20" },
    { label: "Atingidas", value: metas.filter(m => m.status === "ATINGIDA").length.toString(), icon: RiCheckboxCircleLine, color: "text-green-500", bg: "bg-green-100 dark:bg-green-500/20" },
    { label: "Superadas", value: metas.filter(m => m.status === "SUPERADA").length.toString(), icon: RiTrophyLine, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-500/20" },
    { label: "Total em Bônus", value: formatCurrencyShort(metas.reduce((acc, m) => acc + m.bonus, 0)), icon: RiMedalLine, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-500/20" },
  ];

  function formatCurrencyShort(value: number) {
    if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(1)}K`;
    return `R$ ${value.toFixed(0)}`;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  const getProgressPercent = (atual: number, meta: number) => {
    return Math.min(100, Math.round((atual / meta) * 100));
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; bg: string; text: string; icon: React.ElementType }> = {
      EM_ANDAMENTO: { label: "Em Andamento", bg: "bg-blue-100 dark:bg-blue-500/20", text: "text-blue-600 dark:text-blue-400", icon: RiTimeLine },
      ATINGIDA: { label: "Atingida", bg: "bg-green-100 dark:bg-green-500/20", text: "text-green-600 dark:text-green-400", icon: RiCheckboxCircleLine },
      SUPERADA: { label: "Superada", bg: "bg-amber-100 dark:bg-amber-500/20", text: "text-amber-600 dark:text-amber-400", icon: RiTrophyLine },
      NAO_ATINGIDA: { label: "Não Atingida", bg: "bg-red-100 dark:bg-red-500/20", text: "text-red-600 dark:text-red-400", icon: RiFireLine },
    };
    return configs[status] || configs.EM_ANDAMENTO;
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 100) return "bg-green-500";
    if (percent >= 70) return "bg-blue-500";
    if (percent >= 40) return "bg-amber-500";
    return "bg-red-500";
  };

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
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                <RiFocus3Line className="w-5 h-5 text-blue-500" />
              </div>
              Metas
            </h1>
            <p className="text-neutral-500 mt-1">
              Acompanhe e defina metas para sua equipe
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={periodoFilter}
            onChange={(e) => setPeriodoFilter(e.target.value)}
            className="h-10 px-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-900 dark:text-white"
          >
            <option>Janeiro 2024</option>
            <option>Fevereiro 2024</option>
            <option>Março 2024</option>
            <option>Q1 2024</option>
          </select>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600"
          >
            <RiAddLine className="w-4 h-4" />
            Definir Meta
          </button>
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

      {/* Metas Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {metas.map((meta, index) => {
          const statusConfig = getStatusConfig(meta.status);
          const vendasPercent = getProgressPercent(meta.vendasRealizadas, meta.metaVendas);
          const valorPercent = getProgressPercent(meta.valorRealizado, meta.metaValor);
          const leadsPercent = getProgressPercent(meta.leadsConvertidos, meta.metaLeads);

          return (
            <motion.div
              key={meta.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                      <span className="text-sm font-bold text-neutral-600 dark:text-neutral-400">
                        {meta.corretor.name.split(" ").map((n: string) => n[0]).join("")}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-white">{meta.corretor.name}</h3>
                      <p className="text-sm text-neutral-500">{meta.periodo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                      <statusConfig.icon className="w-3 h-3" />
                      {statusConfig.label}
                    </span>
                    <button className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400">
                      <RiEditLine className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="p-4 space-y-4">
                {/* Vendas */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-neutral-500">Vendas</span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">
                      {meta.vendasRealizadas}/{meta.metaVendas}
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${vendasPercent}%` }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className={`h-full rounded-full ${getProgressColor(vendasPercent)}`}
                    />
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">{vendasPercent}% da meta</p>
                </div>

                {/* Valor */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-neutral-500">Valor</span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">
                      {formatCurrency(meta.valorRealizado)} / {formatCurrency(meta.metaValor)}
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${valorPercent}%` }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                      className={`h-full rounded-full ${getProgressColor(valorPercent)}`}
                    />
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">{valorPercent}% da meta</p>
                </div>

                {/* Leads */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-neutral-500">Leads Convertidos</span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">
                      {meta.leadsConvertidos}/{meta.metaLeads}
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${leadsPercent}%` }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      className={`h-full rounded-full ${getProgressColor(leadsPercent)}`}
                    />
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">{leadsPercent}% da meta</p>
                </div>
              </div>

              {/* Footer */}
              {meta.bonus > 0 && (
                <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border-t border-amber-100 dark:border-amber-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RiStarLine className="w-5 h-5 text-amber-500" />
                      <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                        Bônus estimado
                      </span>
                    </div>
                    <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                      {formatCurrency(meta.bonus)}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Modal */}
      <AddMetaModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
