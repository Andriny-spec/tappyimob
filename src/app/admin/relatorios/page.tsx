"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  RiTimeLine,
  RiUserStarLine,
  RiHome4Line,
  RiCameraLine,
  RiRefreshLine,
  RiArrowUpSLine,
  RiArrowDownSLine,
  RiLoader4Line,
  RiTeamLine,
  RiFilter3Line,
  RiFlag2Line,
  RiLightbulbLine,
  RiBarChartLine,
  RiPieChartLine,
  RiArrowRightLine,
  RiCalendarLine,
} from "react-icons/ri";

interface InsightsData {
  periodo: number;
  atendimento: {
    tempoMedioMinutos: number;
    tempoMedioFormatado: string;
    totalLeads: number;
    leadsAtendidos: number;
    taxaAtendimento: number;
  };
  funil: {
    mediaPorEtapa: { etapa: string; tempoMedioHoras: number; quantidade: number }[];
    temposPorCorretor: { nome: string; tempoMedio: number; leads: number }[];
  };
  fotos: {
    total: number;
    concluidas: number;
    pendentes: number;
    taxaConclusao: number;
  };
  imoveis: {
    total: number;
    atualizados: number;
    semAtualizacao: number;
    taxaAtualizacao: number;
  };
  clientes: {
    totalLeads: number;
    convertidos: number;
    taxaConversao: number;
    porStatus: { status: string; quantidade: number }[];
    porOrigem: { origem: string; quantidade: number }[];
    performanceCorretores: { corretorId: string; nome: string; leads: number }[];
  };
  captacao: {
    radarTotal: number;
    radarCaptados: number;
    taxaCaptacao: number;
    iptuTotal: number;
    iptuVinculados: number;
  } | null;
}

const statusLabels: Record<string, string> = {
  NOVO: "Novo",
  CONTATO: "Em Contato",
  QUALIFICADO: "Qualificado",
  VISITA: "Visita Agendada",
  PROPOSTA: "Proposta",
  NEGOCIACAO: "Negociação",
  CONVERTIDO: "Convertido",
  FECHADO: "Fechado",
  PERDIDO: "Perdido",
  INATIVO: "Inativo",
};

const statusColors: Record<string, string> = {
  NOVO: "bg-blue-500",
  CONTATO: "bg-cyan-500",
  QUALIFICADO: "bg-indigo-500",
  VISITA: "bg-purple-500",
  PROPOSTA: "bg-amber-500",
  NEGOCIACAO: "bg-orange-500",
  CONVERTIDO: "bg-green-500",
  FECHADO: "bg-emerald-500",
  PERDIDO: "bg-red-500",
  INATIVO: "bg-neutral-400",
};

export default function RelatoriosPage() {
  const [periodo, setPeriodo] = useState("30");
  const [data, setData] = useState<InsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, [periodo]);

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/relatorios/insights?periodo=${periodo}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error("Erro ao buscar insights:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RiLoader4Line className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
            <RiBarChartLine className="w-7 h-7 text-orange-500" />
            Relatórios e Insights
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Métricas de atendimento, funil, fotos e captação
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm"
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="60">Últimos 60 dias</option>
            <option value="90">Últimos 90 dias</option>
          </select>
          <button
            onClick={fetchInsights}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
          >
            <RiRefreshLine className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </button>
        </div>
      </div>

      {data && (
        <>
          {/* KPIs Principais */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tempo de Atendimento */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white"
            >
              <div className="flex items-center gap-2 mb-2">
                <RiTimeLine className="w-5 h-5 opacity-80" />
                <span className="text-sm opacity-80">Tempo Médio Atendimento</span>
              </div>
              <p className="text-3xl font-bold">{data.atendimento.tempoMedioFormatado}</p>
              <p className="text-xs opacity-70 mt-1">
                {data.atendimento.leadsAtendidos} de {data.atendimento.totalLeads} leads atendidos ({Math.round(data.atendimento.taxaAtendimento)}%)
              </p>
            </motion.div>

            {/* Taxa de Conversão */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white"
            >
              <div className="flex items-center gap-2 mb-2">
                <RiFilter3Line className="w-5 h-5 opacity-80" />
                <span className="text-sm opacity-80">Taxa de Conversão</span>
              </div>
              <p className="text-3xl font-bold">{data.clientes.taxaConversao}%</p>
              <p className="text-xs opacity-70 mt-1">
                {data.clientes.convertidos} convertidos de {data.clientes.totalLeads} leads
              </p>
            </motion.div>

            {/* Fotos Concluídas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 text-white"
            >
              <div className="flex items-center gap-2 mb-2">
                <RiCameraLine className="w-5 h-5 opacity-80" />
                <span className="text-sm opacity-80">Fotos Concluídas</span>
              </div>
              <p className="text-3xl font-bold">{data.fotos.concluidas}</p>
              <p className="text-xs opacity-70 mt-1">
                {data.fotos.pendentes} pendentes • {Math.round(data.fotos.taxaConclusao)}% conclusão
              </p>
            </motion.div>

            {/* Imóveis Atualizados */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-orange-600 text-white"
            >
              <div className="flex items-center gap-2 mb-2">
                <RiHome4Line className="w-5 h-5 opacity-80" />
                <span className="text-sm opacity-80">Imóveis Atualizados</span>
              </div>
              <p className="text-3xl font-bold">{data.imoveis.atualizados}</p>
              <p className="text-xs opacity-70 mt-1">
                ⚠️ {data.imoveis.semAtualizacao} sem atualização há 30+ dias
              </p>
            </motion.div>
          </div>

          {/* Grid de Seções */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Funil por Etapa */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6"
            >
              <h2 className="font-semibold text-lg text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                <RiFilter3Line className="w-5 h-5 text-blue-500" />
                Tempo Médio por Etapa do Funil
              </h2>
              
              {data.funil.mediaPorEtapa.length > 0 ? (
                <div className="space-y-3">
                  {data.funil.mediaPorEtapa.map((etapa, index) => {
                    const maxHoras = Math.max(...data.funil.mediaPorEtapa.map(e => e.tempoMedioHoras));
                    const percentual = maxHoras > 0 ? (etapa.tempoMedioHoras / maxHoras) * 100 : 0;
                    
                    return (
                      <div key={etapa.etapa} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-700 dark:text-neutral-300">
                            {statusLabels[etapa.etapa] || etapa.etapa}
                          </span>
                          <span className="font-medium text-neutral-900 dark:text-white">
                            {etapa.tempoMedioHoras < 24 
                              ? `${Math.round(etapa.tempoMedioHoras)}h` 
                              : `${Math.round(etapa.tempoMedioHoras / 24)}d`}
                            <span className="text-xs text-neutral-400 ml-1">({etapa.quantidade})</span>
                          </span>
                        </div>
                        <div className="h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${statusColors[etapa.etapa] || "bg-blue-500"}`}
                            style={{ width: `${percentual}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-neutral-500 text-sm">Sem dados de funil no período</p>
              )}
            </motion.div>

            {/* Performance por Corretor */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6"
            >
              <h2 className="font-semibold text-lg text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                <RiTeamLine className="w-5 h-5 text-purple-500" />
                Performance por Corretor
              </h2>
              
              {data.clientes.performanceCorretores.length > 0 ? (
                <div className="space-y-3">
                  {data.clientes.performanceCorretores.slice(0, 8).map((corretor, index) => {
                    const maxLeads = Math.max(...data.clientes.performanceCorretores.map(c => c.leads));
                    const percentual = maxLeads > 0 ? (corretor.leads / maxLeads) * 100 : 0;
                    
                    return (
                      <div key={corretor.corretorId} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? "bg-amber-500 text-white" :
                          index === 1 ? "bg-neutral-400 text-white" :
                          index === 2 ? "bg-amber-700 text-white" :
                          "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 truncate">
                              {corretor.nome}
                            </span>
                            <span className="text-sm font-bold text-neutral-900 dark:text-white">
                              {corretor.leads} leads
                            </span>
                          </div>
                          <div className="h-1.5 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-500 rounded-full"
                              style={{ width: `${percentual}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-neutral-500 text-sm">Sem dados de corretores no período</p>
              )}
            </motion.div>

            {/* Leads por Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6"
            >
              <h2 className="font-semibold text-lg text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                <RiPieChartLine className="w-5 h-5 text-green-500" />
                Distribuição de Leads por Status
              </h2>
              
              {data.clientes.porStatus.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {data.clientes.porStatus.map((item) => (
                    <div
                      key={item.status}
                      className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-700/50"
                    >
                      <div className={`w-3 h-3 rounded-full ${statusColors[item.status] || "bg-neutral-400"}`} />
                      <span className="text-sm text-neutral-600 dark:text-neutral-400 flex-1 truncate">
                        {statusLabels[item.status] || item.status}
                      </span>
                      <span className="text-sm font-bold text-neutral-900 dark:text-white">
                        {item.quantidade}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500 text-sm">Sem dados de leads no período</p>
              )}
            </motion.div>

            {/* Leads por Origem */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6"
            >
              <h2 className="font-semibold text-lg text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                <RiLightbulbLine className="w-5 h-5 text-amber-500" />
                Origem dos Leads
              </h2>
              
              {data.clientes.porOrigem.length > 0 ? (
                <div className="space-y-3">
                  {data.clientes.porOrigem.slice(0, 6).map((item) => {
                    const maxOrigem = Math.max(...data.clientes.porOrigem.map(o => o.quantidade));
                    const percentual = maxOrigem > 0 ? (item.quantidade / maxOrigem) * 100 : 0;
                    
                    return (
                      <div key={item.origem} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-700 dark:text-neutral-300">
                            {item.origem}
                          </span>
                          <span className="font-medium text-neutral-900 dark:text-white">
                            {item.quantidade}
                          </span>
                        </div>
                        <div className="h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${percentual}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-neutral-500 text-sm">Sem dados de origem no período</p>
              )}
            </motion.div>
          </div>

          {/* Captação */}
          {data.captacao && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6"
            >
              <h2 className="font-semibold text-lg text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                <RiFlag2Line className="w-5 h-5 text-orange-500" />
                Insights de Captação
              </h2>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30">
                  <p className="text-2xl font-bold text-orange-600">{data.captacao.radarTotal}</p>
                  <p className="text-xs text-orange-600">Imóveis no Radar</p>
                </div>
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30">
                  <p className="text-2xl font-bold text-green-600">{data.captacao.radarCaptados}</p>
                  <p className="text-xs text-green-600">Captados com Sucesso</p>
                </div>
                <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30">
                  <p className="text-2xl font-bold text-purple-600">{data.captacao.iptuTotal}</p>
                  <p className="text-xs text-purple-600">Base IPTU</p>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30">
                  <p className="text-2xl font-bold text-blue-600">{data.captacao.iptuVinculados}</p>
                  <p className="text-xs text-blue-600">IPTU Vinculados</p>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>💡 Insight:</strong> Taxa de captação de {Math.round(data.captacao.taxaCaptacao)}%. 
                  {data.captacao.taxaCaptacao < 20 
                    ? " Considere revisar a abordagem ou priorizar imóveis de maior interesse."
                    : data.captacao.taxaCaptacao < 40
                    ? " Bom desempenho! Continue mantendo contato regular com os proprietários."
                    : " Excelente taxa de captação! A equipe está performando muito bem."
                  }
                </p>
              </div>
            </motion.div>
          )}

          {/* Links Rápidos */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/clientes/leads"
              className="p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-blue-500 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                    <RiUserStarLine className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">Gestão de Leads</p>
                    <p className="text-xs text-neutral-500">Ver todos os leads</p>
                  </div>
                </div>
                <RiArrowRightLine className="w-5 h-5 text-neutral-400 group-hover:text-blue-500 transition-colors" />
              </div>
            </Link>

            <Link
              href="/admin/agendamentos/fotos"
              className="p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-purple-500 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                    <RiCameraLine className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">Agendamento Fotos</p>
                    <p className="text-xs text-neutral-500">Produção fotográfica</p>
                  </div>
                </div>
                <RiArrowRightLine className="w-5 h-5 text-neutral-400 group-hover:text-purple-500 transition-colors" />
              </div>
            </Link>

            <Link
              href="/admin/captacao"
              className="p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-orange-500 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
                    <RiFlag2Line className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">Captação</p>
                    <p className="text-xs text-neutral-500">Radar e Base IPTU</p>
                  </div>
                </div>
                <RiArrowRightLine className="w-5 h-5 text-neutral-400 group-hover:text-orange-500 transition-colors" />
              </div>
            </Link>

            <Link
              href="/admin/vendedores"
              className="p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-emerald-500 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                    <RiTeamLine className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">Vendedores</p>
                    <p className="text-xs text-neutral-500">Patrimônio por vendedor</p>
                  </div>
                </div>
                <RiArrowRightLine className="w-5 h-5 text-neutral-400 group-hover:text-emerald-500 transition-colors" />
              </div>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
