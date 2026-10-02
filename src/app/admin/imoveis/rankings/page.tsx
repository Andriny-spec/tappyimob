"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  RiTrophyLine,
  RiEyeLine,
  RiFileList3Line,
  RiUserHeartLine,
  RiCalendarCheckLine,
  RiLoader4Line,
  RiMedalLine,
  RiMedal2Line,
  RiAwardLine,
  RiArrowRightLine,
  RiHome4Line,
  RiMapPinLine,
  RiMoneyDollarCircleLine,
  RiFireLine,
  RiStarLine,
  RiHeartLine,
  RiBarChartBoxLine,
} from "react-icons/ri";

interface PropertyRanking {
  id: string;
  code: string;
  title: string;
  thumbnail: string | null;
  neighborhood: string;
  city: string;
  price: number;
  status: string;
  views?: number;
  portalViews?: number;
  totalViews?: number;
  clicks?: number;
  favorites?: number;
  proposalsCount?: number;
  leadCount?: number;
  visitCount?: number;
  inPersonVisits?: number;
}

interface BrokerRanking {
  userId: string;
  name: string;
  avatar: string | null;
  role: string;
  count: number;
}

interface RankingsData {
  rankings: {
    mostViewedSite: PropertyRanking[];
    mostViewedPortals: PropertyRanking[];
    mostProposals: PropertyRanking[];
    leadOriginsRanking: PropertyRanking[];
    visitsRanking: PropertyRanking[];
    brokersRanking: BrokerRanking[];
  };
  stats: {
    totalViewsSite: number;
    totalViewsPortals: number;
    totalProposals: number;
    totalLeadOrigins: number;
    totalVisitRecords: number;
  };
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
};

const getMedalIcon = (position: number) => {
  switch (position) {
    case 0:
      return <RiTrophyLine className="w-5 h-5 text-yellow-500" />;
    case 1:
      return <RiMedalLine className="w-5 h-5 text-gray-400" />;
    case 2:
      return <RiMedal2Line className="w-5 h-5 text-amber-600" />;
    default:
      return <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-neutral-500">{position + 1}º</span>;
  }
};

const getMedalBg = (position: number) => {
  switch (position) {
    case 0:
      return "bg-gradient-to-r from-emerald-500/20 to-emerald-500/5 border-yellow-500/30";
    case 1:
      return "bg-gradient-to-r from-gray-400/20 to-gray-400/5 border-gray-400/30";
    case 2:
      return "bg-gradient-to-r from-emerald-600/20 to-emerald-600/5 border-amber-600/30";
    default:
      return "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700";
  }
};

function RankingCard({
  title,
  icon,
  color,
  properties,
  metricKey,
  metricLabel,
}: {
  title: string;
  icon: React.ReactNode;
  color: string;
  properties: PropertyRanking[];
  metricKey: keyof PropertyRanking;
  metricLabel: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
    >
      <div className={`p-4 border-b border-neutral-200 dark:border-neutral-800 ${color}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-white">{title}</h3>
            <p className="text-xs text-white/70">{metricLabel}</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
        {properties.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">
            <RiBarChartBoxLine className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhum dado disponível</p>
          </div>
        ) : (
          properties.map((property, index) => (
            <Link
              key={property.id}
              href={`/admin/imoveis/${property.id}`}
              className={`flex items-center gap-3 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors border-l-4 ${getMedalBg(index)}`}
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                {getMedalIcon(index)}
              </div>

              <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-700 flex-shrink-0">
                {property.thumbnail ? (
                  <Image
                    src={property.thumbnail}
                    alt={property.title}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <RiHome4Line className="w-5 h-5 text-neutral-400" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                  {property.code} - {property.title}
                </p>
                <p className="text-xs text-neutral-500 truncate">
                  {property.neighborhood}, {property.city}
                </p>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-lg font-bold text-neutral-900 dark:text-white">
                  {(property[metricKey] as number)?.toLocaleString("pt-BR") || 0}
                </p>
                <p className="text-[10px] text-neutral-500 uppercase">{metricLabel}</p>
              </div>
            </Link>
          ))
        )}
      </div>

      {properties.length > 0 && (
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
          <Link
            href="/admin/imoveis"
            className="text-xs text-[#0B2545] dark:text-sky-400 hover:underline flex items-center justify-center gap-1"
          >
            Ver todos os imóveis
            <RiArrowRightLine className="w-3 h-3" />
          </Link>
        </div>
      )}
    </motion.div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-4 rounded-2xl ${color} text-white`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-white/70 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold mt-1">{value.toLocaleString("pt-BR")}</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

export default function RankingsPage() {
  const [data, setData] = useState<RankingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [category, setCategory] = useState("all");
  const [city, setCity] = useState("all");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    const fetchRankings = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({ limit: "10" });
        if (dateFrom) params.append("dateFrom", dateFrom);
        if (dateTo) params.append("dateTo", dateTo);
        if (category !== "all") params.append("category", category);
        if (city !== "all") params.append("city", city);
        if (status !== "all") params.append("status", status);
        
        const response = await fetch(`/api/admin/rankings?${params.toString()}`);
        const result = await response.json();
        if (response.ok) {
          setData(result);
        }
      } catch (error) {
        console.error("Erro ao buscar rankings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRankings();
  }, [dateFrom, dateTo, category, city, status]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RiLoader4Line className="w-8 h-8 animate-spin text-[#0B2545]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
              <RiTrophyLine className="w-7 h-7 text-yellow-500" />
              Rankings de Imóveis
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Acompanhe a performance dos imóveis
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 space-y-3">
          {/* Atalhos de período */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Hoje", days: 0 },
              { label: "7 dias", days: 7 },
              { label: "30 dias", days: 30 },
              { label: "60 dias", days: 60 },
              { label: "90 dias", days: 90 },
            ].map((shortcut) => {
              const from = new Date();
              if (shortcut.days > 0) from.setDate(from.getDate() - shortcut.days);
              const fromStr = from.toISOString().split("T")[0];
              const toStr = new Date().toISOString().split("T")[0];
              const isActive = dateFrom === fromStr && dateTo === toStr;
              return (
                <button
                  key={shortcut.days}
                  onClick={() => {
                    if (isActive) {
                      setDateFrom("");
                      setDateTo("");
                    } else {
                      setDateFrom(fromStr);
                      setDateTo(toStr);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#0B2545] text-white"
                      : "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                  }`}
                >
                  {shortcut.label}
                </button>
              );
            })}
            {!dateFrom && !dateTo && (
              <span className="px-3 py-1.5 text-sm text-neutral-400">Todo o período</span>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {/* Data De */}
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">📅 Data De</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
              />
            </div>
            
            {/* Data Até */}
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">📅 Data Até</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
              />
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">🏷️ Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
              >
                <option value="all">Todas</option>
                <option value="VENDA">Venda</option>
                <option value="LOCACAO">Locação</option>
                <option value="VENDA_LOCACAO">Venda + Locação</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">📊 Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
              >
                <option value="all">Todos</option>
                <option value="DISPONIVEL">Disponível</option>
                <option value="VENDIDO">Vendido</option>
                <option value="ALUGADO">Alugado</option>
                <option value="RESERVADO">Reservado</option>
              </select>
            </div>

            {/* Limpar Filtros */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                  setCategory("all");
                  setCity("all");
                  setStatus("all");
                }}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                🔄 Limpar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Views Site"
            value={data.stats.totalViewsSite}
            icon={<RiEyeLine className="w-6 h-6" />}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatCard
            title="Views Portais"
            value={data.stats.totalViewsPortals}
            icon={<RiEyeLine className="w-6 h-6" />}
            color="bg-gradient-to-br from-cyan-500 to-cyan-600"
          />
          <StatCard
            title="Total de Propostas"
            value={data.stats.totalProposals}
            icon={<RiFileList3Line className="w-6 h-6" />}
            color="bg-gradient-to-br from-green-500 to-green-600"
          />
          <StatCard
            title="Leads de Origem"
            value={data.stats.totalLeadOrigins}
            icon={<RiUserHeartLine className="w-6 h-6" />}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
          />
          <StatCard
            title="Visitas Agendadas"
            value={data.stats.totalVisitRecords}
            icon={<RiCalendarCheckLine className="w-6 h-6" />}
            color="bg-gradient-to-br from-orange-500 to-orange-600"
          />
        </div>
      )}

      {/* Rankings Grid */}
      {data && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Mais Vistos no Site */}
          <RankingCard
            title="Mais Vistos no Site"
            icon={<RiEyeLine className="w-5 h-5 text-white" />}
            color="bg-gradient-to-r from-blue-500 to-blue-600"
            properties={data.rankings.mostViewedSite}
            metricKey="views"
            metricLabel="Views Site"
          />

          {/* Mais Vistos nos Portais */}
          <RankingCard
            title="Mais Vistos nos Portais"
            icon={<RiEyeLine className="w-5 h-5 text-white" />}
            color="bg-gradient-to-r from-cyan-500 to-cyan-600"
            properties={data.rankings.mostViewedPortals}
            metricKey="portalViews"
            metricLabel="Views Portais"
          />

          {/* Mais Propostas */}
          <RankingCard
            title="Mais Propostas Recebidas"
            icon={<RiFileList3Line className="w-5 h-5 text-white" />}
            color="bg-gradient-to-r from-green-500 to-green-600"
            properties={data.rankings.mostProposals}
            metricKey="proposalsCount"
            metricLabel="Propostas"
          />

          {/* Maior Origem de 1º Contato */}
          <RankingCard
            title="Maior Origem de 1º Contato"
            icon={<RiUserHeartLine className="w-5 h-5 text-white" />}
            color="bg-gradient-to-r from-purple-500 to-purple-600"
            properties={data.rankings.leadOriginsRanking}
            metricKey="leadCount"
            metricLabel="Leads"
          />

          {/* Mais Visitas Presenciais */}
          <RankingCard
            title="Mais Visitas Agendadas"
            icon={<RiCalendarCheckLine className="w-5 h-5 text-white" />}
            color="bg-gradient-to-r from-orange-500 to-orange-600"
            properties={data.rankings.visitsRanking}
            metricKey="visitCount"
            metricLabel="Visitas"
          />

          {/* Ranking Corretores por Cadastros */}
          {data.rankings.brokersRanking?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden"
            >
              <div className="p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <RiBarChartBoxLine className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white font-semibold">Captações por Corretor</h3>
              </div>
              <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
                {data.rankings.brokersRanking.map((broker, idx) => (
                  <div key={broker.userId} className="flex items-center gap-3 p-3">
                    <div className="flex-shrink-0 w-6 text-center">{getMedalIcon(idx)}</div>
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {broker.avatar ? (
                        <img src={broker.avatar} alt={broker.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{broker.name[0]}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{broker.name}</p>
                      <p className="text-xs text-neutral-500">{broker.role}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold text-emerald-600">{broker.count}</p>
                      <p className="text-[10px] text-neutral-500 uppercase">Cadastros</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Top 3 Destaque */}
      {data && data.rankings.mostViewedSite.length >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#0B2545] to-[#2d3a6a] rounded-2xl p-6 text-white"
        >
          <div className="flex items-center gap-3 mb-6">
            <RiFireLine className="w-6 h-6 text-orange-400" />
            <h3 className="text-lg font-bold">Top 3 Imóveis em Destaque</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {data.rankings.mostViewedSite.slice(0, 3).map((property: PropertyRanking, index: number) => (
              <Link
                key={property.id}
                href={`/admin/imoveis/${property.id}`}
                className="bg-white/10 rounded-xl p-4 hover:bg-white/20 transition-colors group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-amber-600"
                  }`}>
                    {getMedalIcon(index)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{property.code}</p>
                    <p className="text-xs text-white/60 truncate">{property.neighborhood}</p>
                  </div>
                </div>

                <div className="aspect-video rounded-lg overflow-hidden bg-black/20 mb-3">
                  {property.thumbnail ? (
                    <Image
                      src={property.thumbnail}
                      alt={property.title}
                      width={300}
                      height={200}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <RiHome4Line className="w-8 h-8 text-white/30" />
                    </div>
                  )}
                </div>

                <p className="text-sm font-medium truncate mb-1">{property.title}</p>
                <p className="text-lg font-bold text-green-400">
                  {formatCurrency(property.price)}
                </p>

                <div className="flex items-center gap-4 mt-3 text-xs text-white/60">
                  <span className="flex items-center gap-1">
                    <RiEyeLine className="w-3 h-3" />
                    {property.views?.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <RiHeartLine className="w-3 h-3" />
                    {property.favorites || 0}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
