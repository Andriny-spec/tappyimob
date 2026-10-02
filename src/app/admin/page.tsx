"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/providers/auth-provider";
import {
  RiBuilding2Line,
  RiUserLine,
  RiFileList3Line,
  RiMoneyDollarCircleLine,
  RiCalendarCheckLine,
  RiWhatsappLine,
  RiMapPinLine,
  RiArrowRightLine,
  RiFireLine,
  RiTrophyLine,
  RiLineChartLine,
  RiCalendarLine,
  RiSparklingLine,
  RiLoader4Line,
  RiRefreshLine,
  RiImageLine,
  RiStarLine,
  RiEyeLine,
  RiHome4Line,
  RiPieChartLine,
  RiTimeLine,
  RiHandHeartLine,
  RiTeamLine,
} from "react-icons/ri";
import Link from "next/link";
import { KPICard, MiniChart, DashboardSection, LeadCard, AIInsights } from "@/components/dashboard";
import PendingAssignments from "@/components/admin/PendingAssignments";
import QueueOverview from "@/components/admin/QueueOverview";
import BirthdayPanel from "@/components/admin/BirthdayPanel";
import MarketingOverview from "@/components/admin/marketing/MarketingOverview";

interface DashboardData {
  kpis: {
    imoveis: {
      total: number;
      ativos: number;
      vendidos: number;
      alugados: number;
      novosNoMes: number;
      change: number;
      semFoto: number;
      exclusivos: number;
      comPlaca: number;
      valorCarteira: number;
    };
    leads: {
      total: number;
      doMes: number;
      change: number;
      convertidos: number;
      taxaConversao: number;
    };
    visitas: {
      hoje: number;
      pendentes: number;
      doMes: number;
    };
    contratos: {
      ativos: number;
      doMes: number;
      valorTotal: number;
    };
    corretores: {
      total: number;
      ativos: number;
    };
    clientes: {
      total: number;
      novosNoMes: number;
    };
    condominios: number;
    parcerias: {
      total: number;
      ativos: number;
      novosNoMes: number;
      change: number;
      porTipo: Array<{ tipo: string; quantidade: number }>;
    };
  };
  charts: {
    imoveisPorTipo: Array<{ tipo: string; quantidade: number }>;
    imoveisPorStatus: Array<{ status: string; quantidade: number }>;
    imoveisPorCategoria: Array<{ categoria: string; quantidade: number }>;
    leadsPorTemperatura: Array<{ temperatura: string; quantidade: number }>;
    leadsPorOrigem: Array<{ origem: string; quantidade: number }>;
    topBairros: Array<{ bairro: string; quantidade: number }>;
    topCidades: Array<{ cidade: string; quantidade: number }>;
    faixaPrecos: Array<{ faixa: string; quantidade: number }>;
  };
  lists: {
    leadsRecentes: Array<{
      id: string;
      name: string;
      email?: string;
      phone?: string;
      temperature?: string;
      source?: string;
      status?: string;
      message?: string;
      createdAt: string;
    }>;
    proximasVisitas: Array<{
      id: string;
      title: string;
      date: string;
      status: string;
      leadName?: string;
      leadPhone?: string;
      corretorName?: string;
      property?: { code: string; title: string; address: string };
    }>;
    rankingCorretores: Array<{
      id: string;
      name: string;
      avatar?: string;
      position: number;
      points: number;
      vendas: number;
      leads: number;
    }>;
    topParceiros: Array<{
      id: string;
      name: string;
      type: string;
      avatar?: string;
      totalVGV: number;
      totalVisits: number;
      totalProposals: number;
      totalContracts: number;
      creci?: string;
      agency?: string;
      position: number;
    }>;
  };
  meta: {
    generatedAt: string;
  };
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showPlateList, setShowPlateList] = useState(false);
  const [plateProperties, setPlateProperties] = useState<any[]>([]);
  const [loadingPlates, setLoadingPlates] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/dashboard");
      if (!res.ok) throw new Error("Erro ao carregar dashboard");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(String(err));
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPlateProperties = useCallback(async () => {
    if (plateProperties.length > 0) return;
    setLoadingPlates(true);
    try {
      const res = await fetch("/api/properties?hasPlate=true&limit=100&status=DISPONIVEL");
      if (res.ok) {
        const json = await res.json();
        setPlateProperties(json.properties || []);
      }
    } catch (err) {
      console.error("Erro ao buscar imóveis com placa:", err);
    } finally {
      setLoadingPlates(false);
    }
  }, [plateProperties.length]);

  const handleTogglePlateList = () => {
    const next = !showPlateList;
    setShowPlateList(next);
    if (next) fetchPlateProperties();
  };

  useEffect(() => {
    if (user?.role === "MARKETING") return;
    fetchDashboard();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, [fetchDashboard, user?.role]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `R$ ${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}K`;
    return `R$ ${value.toFixed(0)}`;
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  if (user?.role === "MARKETING") {
    return <MarketingOverview />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <RiLoader4Line className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-neutral-500">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "Erro ao carregar"}</p>
          <button onClick={fetchDashboard} className="px-4 py-2 bg-orange-500 text-white rounded-lg">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const { kpis, charts, lists } = data;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-6 lg:p-8" style={{ background: "linear-gradient(to bottom right, #25D366, #1DA851, #25D366)" }}
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bTAtMThjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bTE4IDBjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <RiSparklingLine className="w-5 h-5 text-white/80" />
              <span className="text-white/80 text-sm font-medium">
                {currentTime.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">
              {getGreeting()}, {user?.name?.split(" ")[0] || "Admin"}! 👋
            </h1>
            <p className="text-white/80">
              Aqui está o resumo do seu negócio hoje
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboard}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white text-sm font-medium transition-colors backdrop-blur-sm"
            >
              <RiRefreshLine className="w-4 h-4" />
              Atualizar
            </button>
            <Link
              href="/admin/relatorios"
              className="flex items-center gap-2 px-4 py-2 bg-white text-orange-600 rounded-xl text-sm font-medium hover:bg-white/90 transition-colors"
            >
              <RiLineChartLine className="w-4 h-4" />
              Ver Relatórios
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Leads pendentes de aceite */}
      <PendingAssignments />

      {/* Filas de atendimento */}
      <QueueOverview />

      {/* Aniversariantes da semana */}
      <BirthdayPanel />

      {/* KPIs Grid - 4 principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <KPICard
          title="Imóveis Ativos"
          value={kpis.imoveis.ativos}
          subtitle={`${kpis.imoveis.novosNoMes} novos este mês`}
          change={kpis.imoveis.change}
          icon={RiBuilding2Line}
          gradient="from-orange-500 to-emerald-500"
          href="/admin/imoveis"
          delay={0.1}
        />
        <KPICard
          title="Leads do Mês"
          value={kpis.leads.doMes}
          subtitle={`${kpis.leads.taxaConversao}% taxa de conversão`}
          change={kpis.leads.change}
          icon={RiUserLine}
          gradient="from-blue-500 to-indigo-500"
          href="/admin/clientes/leads"
          delay={0.2}
        />
        <KPICard
          title="Contratos Ativos"
          value={kpis.contratos.ativos}
          subtitle={`${kpis.contratos.doMes} novos este mês`}
          icon={RiFileList3Line}
          gradient="from-green-500 to-emerald-500"
          href="/admin/contratos"
          delay={0.3}
        />
        <KPICard
          title="Valor em Carteira"
          value={formatCurrency(kpis.imoveis.valorCarteira)}
          subtitle={`${kpis.imoveis.exclusivos} exclusivos`}
          icon={RiMoneyDollarCircleLine}
          gradient="from-purple-500 to-pink-500"
          href="/admin/financeiro"
          delay={0.4}
        />
      </div>

      {/* Secondary KPIs - Métricas Adicionais */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: "Visitas Hoje", value: kpis.visitas.hoje, icon: RiCalendarCheckLine, color: "text-green-500", href: "/admin/agenda" },
          { label: "Visitas Pendentes", value: kpis.visitas.pendentes, icon: RiCalendarLine, color: "text-yellow-500", href: "/admin/agenda" },
          { label: "Sem Foto", value: kpis.imoveis.semFoto, icon: RiImageLine, color: "text-red-500", href: "/admin/imoveis?semFoto=true" },
          { label: "Exclusivos", value: kpis.imoveis.exclusivos, icon: RiStarLine, color: "text-amber-500", href: "/admin/imoveis?exclusivo=true" },
          { label: "Vendidos", value: kpis.imoveis.vendidos, icon: RiHome4Line, color: "text-emerald-500", href: "/admin/imoveis?status=VENDIDO" },
          { label: "Condomínios", value: kpis.condominios, icon: RiBuilding2Line, color: "text-indigo-500", href: "/admin/imoveis/condominios" },
        ].map((item, idx) => (
          <Link key={item.label} href={item.href}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + idx * 0.05 }}
              className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <item.icon className={`w-5 h-5 ${item.color} mb-2`} />
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{item.value}</p>
              <p className="text-xs text-neutral-500">{item.label}</p>
            </motion.div>
          </Link>
        ))}
        {/* Com Placa - Expansível */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          onClick={handleTogglePlateList}
          className={`bg-white dark:bg-neutral-900 rounded-xl p-4 border cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all ${
            showPlateList
              ? "border-blue-400 dark:border-blue-500 ring-2 ring-blue-500/20"
              : "border-neutral-200 dark:border-neutral-800 hover:border-blue-300 dark:hover:border-blue-700"
          }`}
        >
          <RiMapPinLine className={`w-5 h-5 text-blue-500 mb-2`} />
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">{kpis.imoveis.comPlaca}</p>
          <p className="text-xs text-neutral-500">Com Placa {showPlateList ? "▲" : "▼"}</p>
        </motion.div>
      </div>

      {/* Lista expansível de imóveis com placa */}
      <AnimatePresence>
        {showPlateList && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-blue-200 dark:border-blue-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                  <RiMapPinLine className="w-4 h-4 text-blue-500" />
                  Imóveis com Placa ({kpis.imoveis.comPlaca})
                </h3>
                <Link
                  href="/admin/imoveis?hasPlate=true"
                  className="text-xs text-blue-500 hover:underline"
                >
                  Ver todos →
                </Link>
              </div>
              {loadingPlates ? (
                <div className="flex items-center justify-center py-6">
                  <RiLoader4Line className="w-5 h-5 animate-spin text-blue-500" />
                </div>
              ) : plateProperties.length === 0 ? (
                <p className="text-sm text-neutral-500 text-center py-4">Nenhum imóvel com placa</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 max-h-[400px] overflow-y-auto">
                  {plateProperties.map((prop: any) => (
                    <Link
                      key={prop.id}
                      href={`/admin/imoveis/${prop.id}`}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors border border-neutral-100 dark:border-neutral-800"
                    >
                      <div className="w-10 h-10 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex-shrink-0 overflow-hidden">
                        {prop.thumbnail ? (
                          <img src={prop.thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <RiHome4Line className="w-4 h-4 text-neutral-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                          {prop.code} — {prop.title || prop.address}
                        </p>
                        <p className="text-[10px] text-neutral-500 truncate">
                          {prop.neighborhood}, {prop.city}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Insights */}
      <AIInsights data={data} className="lg:col-span-3" />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leads Recentes */}
        <DashboardSection
          title="Leads Recentes"
          subtitle="Últimos leads capturados"
          icon={RiFireLine}
          iconGradient="from-blue-500 to-indigo-500"
          href="/admin/clientes/leads"
          className="lg:col-span-2"
          delay={0.6}
          noPadding
        >
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {lists.leadsRecentes.length > 0 ? (
              lists.leadsRecentes.map((lead, idx) => (
                <LeadCard key={lead.id} lead={lead} index={idx} />
              ))
            ) : (
              <div className="p-8 text-center text-neutral-500">
                <RiUserLine className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Nenhum lead recente</p>
              </div>
            )}
          </div>
        </DashboardSection>

        {/* Coluna Direita */}
        <div className="space-y-6">
          {/* Próximas Visitas */}
          <DashboardSection
            title="Próximas Visitas"
            subtitle="Agendamentos do dia"
            icon={RiCalendarCheckLine}
            iconGradient="from-green-500 to-emerald-500"
            href="/admin/agenda"
            hrefLabel="Ver agenda"
            delay={0.7}
          >
            {lists.proximasVisitas.length > 0 ? (
              <div className="space-y-3">
                {lists.proximasVisitas.map((visit) => (
                  <div
                    key={visit.id}
                    className="p-4 rounded-xl bg-gradient-to-br from-neutral-50 to-neutral-100/50 dark:from-neutral-800/50 dark:to-neutral-800/30 border border-neutral-100 dark:border-neutral-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                        visit.status === "CONFIRMADO"
                          ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400"
                      }`}>
                        {visit.status === "CONFIRMADO" ? "Confirmada" : "Pendente"}
                      </span>
                      <span className="text-xs font-bold text-orange-500 flex items-center gap-1">
                        <RiTimeLine className="w-3 h-3" />
                        {new Date(visit.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" })}
                      </span>
                    </div>
                    <h3 className="font-semibold text-neutral-900 dark:text-white mb-1 truncate">
                      {visit.leadName || visit.title}
                    </h3>
                    {visit.corretorName && (
                      <p className="text-xs text-neutral-500 flex items-center gap-1 mb-1">
                        <RiUserLine className="w-3.5 h-3.5" />
                        {visit.corretorName}
                      </p>
                    )}
                    {visit.property && (
                      <>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate mb-1">
                          {visit.property.title}
                        </p>
                        <p className="text-xs text-neutral-500 flex items-center gap-1">
                          <RiMapPinLine className="w-3.5 h-3.5" />
                          {visit.property.address}
                        </p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-neutral-500">
                <RiCalendarLine className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhuma visita agendada</p>
              </div>
            )}
          </DashboardSection>

          {/* Top Corretores */}
          <DashboardSection
            title="Top Corretores"
            subtitle="Ranking do mês"
            icon={RiTrophyLine}
            iconGradient="from-emerald-500 to-orange-500"
            href="/admin/corretores/ranking"
            hrefLabel="Ver ranking"
            delay={0.8}
          >
            {lists.rankingCorretores.length > 0 ? (
              <div className="space-y-3">
                {lists.rankingCorretores.map((corretor, idx) => (
                  <motion.div
                    key={corretor.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + idx * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      idx === 0 ? "bg-gradient-to-br from-emerald-400 to-emerald-500 text-white" :
                      idx === 1 ? "bg-gradient-to-br from-neutral-300 to-neutral-400 text-white" :
                      "bg-gradient-to-br from-emerald-600 to-emerald-700 text-white"
                    }`}>
                      {idx + 1}º
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold">
                      {corretor.name?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-neutral-900 dark:text-white truncate">{corretor.name}</p>
                      <p className="text-xs text-neutral-500">{corretor.vendas} vendas • {corretor.leads} leads</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-500">{corretor.points}</p>
                      <p className="text-xs text-neutral-500">pontos</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-neutral-500">
                <RiTrophyLine className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhum corretor no ranking</p>
              </div>
            )}
          </DashboardSection>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Imóveis por Status */}
        <DashboardSection
          title="Imóveis por Status"
          icon={RiPieChartLine}
          iconGradient="from-violet-500 to-purple-500"
          delay={0.9}
        >
          <MiniChart
            type="donut"
            data={charts.imoveisPorStatus.map(i => ({
              label: i.status === "DISPONIVEL" ? "Disponível" : 
                     i.status === "VENDIDO" ? "Vendido" :
                     i.status === "ALUGADO" ? "Alugado" :
                     i.status === "INATIVO" ? "Inativo" : i.status,
              value: i.quantidade,
            }))}
            height={140}
          />
        </DashboardSection>

        {/* Leads por Temperatura */}
        <DashboardSection
          title="Leads por Temperatura"
          icon={RiFireLine}
          iconGradient="from-red-500 to-orange-500"
          delay={1.0}
        >
          <MiniChart
            type="horizontal"
            data={charts.leadsPorTemperatura.map(l => ({
              label: l.temperatura === "QUENTE" ? "Quente" : 
                     l.temperatura === "MORNO" ? "Morno" : "Frio",
              value: l.quantidade,
            }))}
            colors={["from-red-500 to-orange-500", "from-emerald-500 to-emerald-500", "from-blue-500 to-cyan-500"]}
          />
        </DashboardSection>

        {/* Top Bairros */}
        <DashboardSection
          title="Top Bairros"
          icon={RiMapPinLine}
          iconGradient="from-cyan-500 to-teal-500"
          delay={1.1}
        >
          <MiniChart
            type="bar"
            data={charts.topBairros.slice(0, 5).map(b => ({
              label: b.bairro || "Sem bairro",
              value: b.quantidade,
            }))}
            height={180}
          />
        </DashboardSection>
      </div>

      {/* Parcerias Section */}
      {kpis.parcerias && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* KPI Parcerias */}
          <KPICard
            title="Parceiros Ativos"
            value={kpis.parcerias.ativos}
            subtitle={`${kpis.parcerias.novosNoMes} novos este mês`}
            change={kpis.parcerias.change}
            icon={RiHandHeartLine}
            gradient="from-rose-500 to-pink-500"
            href="/admin/parcerias"
            delay={1.15}
          />

          {/* Parceiros por Tipo */}
          <DashboardSection
            title="Parceiros por Tipo"
            icon={RiTeamLine}
            iconGradient="from-rose-500 to-pink-500"
            href="/admin/parcerias"
            delay={1.2}
          >
            {kpis.parcerias.porTipo.length > 0 ? (
              <div className="space-y-3">
                {kpis.parcerias.porTipo.map((item) => {
                  const maxVal = Math.max(...kpis.parcerias.porTipo.map(p => p.quantidade), 1);
                  const label = item.tipo === "CORRETOR" ? "Corretores" :
                    item.tipo === "CORRESPONDENTE_BANCARIO" ? "Correspondentes" :
                    item.tipo === "ARQUITETO" ? "Arquitetos" :
                    item.tipo === "CONSTRUTORA" ? "Construtoras" : item.tipo;
                  return (
                    <div key={item.tipo}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-neutral-600 dark:text-neutral-400">{label}</span>
                        <span className="font-bold text-neutral-900 dark:text-white">{item.quantidade}</span>
                      </div>
                      <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.quantidade / maxVal) * 100}%` }}
                          transition={{ delay: 1.3, duration: 0.5 }}
                          className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-neutral-500">
                <RiHandHeartLine className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhum parceiro cadastrado</p>
              </div>
            )}
          </DashboardSection>

          {/* Top Parceiros */}
          <DashboardSection
            title="Top Parceiros"
            subtitle="Maior VGV"
            icon={RiHandHeartLine}
            iconGradient="from-rose-500 to-pink-500"
            href="/admin/parcerias"
            hrefLabel="Ver todos"
            delay={1.25}
          >
            {lists.topParceiros && lists.topParceiros.length > 0 ? (
              <div className="space-y-3">
                {lists.topParceiros.map((parceiro, idx) => (
                  <motion.div
                    key={parceiro.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.3 + idx * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      idx === 0 ? "bg-gradient-to-br from-emerald-400 to-emerald-500 text-white" :
                      idx === 1 ? "bg-gradient-to-br from-neutral-300 to-neutral-400 text-white" :
                      "bg-gradient-to-br from-emerald-600 to-emerald-700 text-white"
                    }`}>
                      {idx + 1}º
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center text-white font-bold text-sm">
                      {parceiro.name?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-neutral-900 dark:text-white truncate text-sm">{parceiro.name}</p>
                      <p className="text-xs text-neutral-500">
                        {parceiro.type === "CORRETOR" ? "Corretor" :
                         parceiro.type === "CORRESPONDENTE_BANCARIO" ? "Correspondente" :
                         parceiro.type === "ARQUITETO" ? "Arquiteto" :
                         parceiro.type === "CONSTRUTORA" ? "Construtora" : parceiro.type}
                        {parceiro.agency ? ` • ${parceiro.agency}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-rose-500 text-sm">
                        {parceiro.totalVGV > 0 ? `R$ ${(parceiro.totalVGV / 1000000).toFixed(1)}M` : "—"}
                      </p>
                      <p className="text-[10px] text-neutral-500">{parceiro.totalVisits} visitas</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-neutral-500">
                <RiHandHeartLine className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhum parceiro no ranking</p>
              </div>
            )}
          </DashboardSection>
        </div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: "Novo Imóvel", icon: RiBuilding2Line, href: "/admin/imoveis/novo", gradient: "from-orange-500 to-emerald-500" },
          { label: "Novo Lead", icon: RiUserLine, href: "/admin/clientes/leads", gradient: "from-blue-500 to-indigo-500" },
          { label: "Agendar Visita", icon: RiCalendarCheckLine, href: "/admin/agenda", gradient: "from-green-500 to-emerald-500" },
          { label: "Chat WhatsApp", icon: RiWhatsappLine, href: "/admin/imob-ia/chat", gradient: "from-green-600 to-green-500" },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="group relative overflow-hidden p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3 shadow-lg`}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <p className="font-semibold text-neutral-900 dark:text-white">{action.label}</p>
            <RiArrowRightLine className="absolute bottom-5 right-5 w-5 h-5 text-neutral-300 dark:text-neutral-600 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
