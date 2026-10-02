"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiRefreshLine,
  RiBarChartLine,
  RiLoader4Line,
  RiEyeLine,
  RiUserLine,
  RiBuilding2Line,
  RiPhoneLine,
  RiWhatsappLine,
  RiMailLine,
  RiCalendarLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiGlobalLine,
  RiTimeLine,
  RiPercentLine,
} from "react-icons/ri";

interface PartnerStats {
  id: string;
  name: string;
  slug: string;
  primaryColor: string;
  pageViews: number;
  uniqueVisitors: number;
  leadsGenerated: number;
  whatsappClicks: number;
  phoneClicks: number;
  scheduledVisits: number;
  conversionRate: number;
  trend: number;
}

export default function RelatoriosPage() {
  const [partners, setPartners] = useState<PartnerStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState("30");
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/partners");
      if (res.ok) {
        const data = await res.json();
        
        // Simular dados de analytics (em produção viria da API)
        const partnersWithStats: PartnerStats[] = (data.partners || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          primaryColor: p.primaryColor,
          pageViews: Math.floor(Math.random() * 10000) + 500,
          uniqueVisitors: Math.floor(Math.random() * 5000) + 200,
          leadsGenerated: Math.floor(Math.random() * 100) + 5,
          whatsappClicks: Math.floor(Math.random() * 200) + 20,
          phoneClicks: Math.floor(Math.random() * 100) + 10,
          scheduledVisits: Math.floor(Math.random() * 30) + 2,
          conversionRate: Math.random() * 5 + 0.5,
          trend: Math.random() * 40 - 20,
        }));

        setPartners(partnersWithStats);
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPartnerDetail = async (partnerId: string) => {
    setSelectedPartner(partnerId);
    try {
      const res = await fetch(`/api/admin/partners/${partnerId}/analytics?period=${period}`);
      if (res.ok) {
        const data = await res.json();
        setDetailData(data);
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes:", error);
    }
  };

  // Calcular totais
  const totals = partners.reduce(
    (acc, p) => ({
      pageViews: acc.pageViews + p.pageViews,
      uniqueVisitors: acc.uniqueVisitors + p.uniqueVisitors,
      leadsGenerated: acc.leadsGenerated + p.leadsGenerated,
      whatsappClicks: acc.whatsappClicks + p.whatsappClicks,
      phoneClicks: acc.phoneClicks + p.phoneClicks,
      scheduledVisits: acc.scheduledVisits + p.scheduledVisits,
    }),
    { pageViews: 0, uniqueVisitors: 0, leadsGenerated: 0, whatsappClicks: 0, phoneClicks: 0, scheduledVisits: 0 }
  );

  const StatCard = ({ icon: Icon, label, value, color, subvalue }: any) => (
    <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-neutral-500">{label}</p>
          <p className="text-xl font-bold text-neutral-900 dark:text-white">{value.toLocaleString()}</p>
          {subvalue && <p className="text-xs text-neutral-400">{subvalue}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <RiArrowLeftLine className="w-5 h-5 text-neutral-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                <RiBarChartLine className="w-5 h-5 text-green-600" />
              </div>
              Relatórios
            </h1>
            <p className="text-neutral-500 mt-1">
              Métricas de desempenho dos parceiros
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="h-10 px-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="365">Último ano</option>
          </select>

          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            <RiRefreshLine className="w-4 h-4 text-neutral-500" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <RiLoader4Line className="w-8 h-8 text-green-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats Gerais */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <StatCard
              icon={RiEyeLine}
              label="Visualizações"
              value={totals.pageViews}
              color="bg-blue-100 dark:bg-blue-500/20 text-blue-600"
            />
            <StatCard
              icon={RiUserLine}
              label="Visitantes"
              value={totals.uniqueVisitors}
              color="bg-purple-100 dark:bg-purple-500/20 text-purple-600"
            />
            <StatCard
              icon={RiBuilding2Line}
              label="Leads"
              value={totals.leadsGenerated}
              color="bg-green-100 dark:bg-green-500/20 text-green-600"
            />
            <StatCard
              icon={RiWhatsappLine}
              label="WhatsApp"
              value={totals.whatsappClicks}
              color="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600"
            />
            <StatCard
              icon={RiPhoneLine}
              label="Ligações"
              value={totals.phoneClicks}
              color="bg-amber-100 dark:bg-amber-500/20 text-amber-600"
            />
            <StatCard
              icon={RiCalendarLine}
              label="Visitas"
              value={totals.scheduledVisits}
              color="bg-pink-100 dark:bg-pink-500/20 text-pink-600"
            />
          </div>

          {/* Tabela de Performance */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Performance por Parceiro
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                    <th className="text-left p-4 text-sm font-medium text-neutral-500">Parceiro</th>
                    <th className="text-right p-4 text-sm font-medium text-neutral-500">Visualizações</th>
                    <th className="text-right p-4 text-sm font-medium text-neutral-500">Visitantes</th>
                    <th className="text-right p-4 text-sm font-medium text-neutral-500">Leads</th>
                    <th className="text-right p-4 text-sm font-medium text-neutral-500">WhatsApp</th>
                    <th className="text-right p-4 text-sm font-medium text-neutral-500">Conversão</th>
                    <th className="text-right p-4 text-sm font-medium text-neutral-500">Tendência</th>
                  </tr>
                </thead>
                <tbody>
                  {partners.map((partner, index) => (
                    <motion.tr
                      key={partner.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-neutral-100 dark:border-neutral-700 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 cursor-pointer"
                      onClick={() => fetchPartnerDetail(partner.id)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                            style={{ backgroundColor: partner.primaryColor }}
                          >
                            {partner.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-white">{partner.name}</p>
                            <p className="text-xs text-neutral-500">{partner.slug}.tappyimob.com.br</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-medium text-neutral-900 dark:text-white">
                          {partner.pageViews.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-medium text-neutral-900 dark:text-white">
                          {partner.uniqueVisitors.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-medium text-green-600">
                          {partner.leadsGenerated}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-medium text-emerald-600">
                          {partner.whatsappClicks}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-medium text-blue-600">
                          {partner.conversionRate.toFixed(2)}%
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          partner.trend >= 0
                            ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                        }`}>
                          {partner.trend >= 0 ? (
                            <RiArrowUpLine className="w-3 h-3" />
                          ) : (
                            <RiArrowDownLine className="w-3 h-3" />
                          )}
                          {Math.abs(partner.trend).toFixed(1)}%
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {partners.length === 0 && (
              <div className="p-12 text-center text-neutral-500">
                Nenhum parceiro com dados no período selecionado
              </div>
            )}
          </div>

          {/* Insights */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
              <RiEyeLine className="w-8 h-8 mb-3 opacity-80" />
              <p className="text-2xl font-bold">{(totals.pageViews / partners.length || 0).toFixed(0)}</p>
              <p className="text-sm opacity-80">Média de visualizações por parceiro</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
              <RiPercentLine className="w-8 h-8 mb-3 opacity-80" />
              <p className="text-2xl font-bold">
                {totals.uniqueVisitors > 0
                  ? ((totals.leadsGenerated / totals.uniqueVisitors) * 100).toFixed(2)
                  : 0}%
              </p>
              <p className="text-sm opacity-80">Taxa de conversão geral</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
              <RiTimeLine className="w-8 h-8 mb-3 opacity-80" />
              <p className="text-2xl font-bold">{partners.length}</p>
              <p className="text-sm opacity-80">Parceiros ativos no período</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
