"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiFileChartLine,
  RiDownload2Line,
  RiCalendarLine,
  RiPieChartLine,
  RiBarChartGroupedLine,
  RiLineChartLine,
  RiMoneyDollarCircleLine,
  RiPercentLine,
  RiUserLine,
  RiHome4Line,
  RiFileTextLine,
  RiMailLine,
  RiPrinterLine,
  RiRefreshLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiWalletLine,
  RiExchangeLine,
  RiTimeLine,
} from "react-icons/ri";

const tiposRelatorio = [
  {
    id: "fluxo_caixa",
    nome: "Fluxo de Caixa",
    descricao: "Entradas e saídas com projeções",
    icon: RiExchangeLine,
    cor: "blue",
    formato: ["PDF", "Excel"],
  },
  {
    id: "dre",
    nome: "DRE - Demonstrativo",
    descricao: "Demonstrativo de Resultados",
    icon: RiFileChartLine,
    cor: "green",
    formato: ["PDF", "Excel"],
  },
  {
    id: "receitas_periodo",
    nome: "Receitas por Período",
    descricao: "Análise detalhada de receitas",
    icon: RiArrowUpLine,
    cor: "emerald",
    formato: ["PDF", "Excel", "CSV"],
  },
  {
    id: "despesas_periodo",
    nome: "Despesas por Período",
    descricao: "Análise detalhada de despesas",
    icon: RiArrowDownLine,
    cor: "red",
    formato: ["PDF", "Excel", "CSV"],
  },
  {
    id: "comissoes_corretor",
    nome: "Comissões por Corretor",
    descricao: "Performance e comissões por corretor",
    icon: RiPercentLine,
    cor: "purple",
    formato: ["PDF", "Excel"],
  },
  {
    id: "vendas_imoveis",
    nome: "Vendas por Imóvel",
    descricao: "Relatório de vendas e locações",
    icon: RiHome4Line,
    cor: "amber",
    formato: ["PDF", "Excel"],
  },
  {
    id: "inadimplencia",
    nome: "Inadimplência",
    descricao: "Pagamentos em atraso",
    icon: RiTimeLine,
    cor: "rose",
    formato: ["PDF", "Excel"],
  },
  {
    id: "balanco",
    nome: "Balanço Patrimonial",
    descricao: "Visão geral do patrimônio",
    icon: RiWalletLine,
    cor: "indigo",
    formato: ["PDF"],
  },
];

const relatoriosRecentes = [
  { id: "1", nome: "Fluxo de Caixa - Janeiro 2024", tipo: "fluxo_caixa", data: "2024-01-25", formato: "PDF" },
  { id: "2", nome: "DRE - 4º Trimestre 2023", tipo: "dre", data: "2024-01-20", formato: "Excel" },
  { id: "3", nome: "Comissões - Janeiro 2024", tipo: "comissoes_corretor", data: "2024-01-22", formato: "PDF" },
  { id: "4", nome: "Despesas - Janeiro 2024", tipo: "despesas_periodo", data: "2024-01-21", formato: "CSV" },
];

const colorClasses: Record<string, { bg: string; text: string; lightBg: string }> = {
  blue: { bg: "bg-blue-500", text: "text-blue-500", lightBg: "bg-blue-100 dark:bg-blue-500/20" },
  green: { bg: "bg-green-500", text: "text-green-500", lightBg: "bg-green-100 dark:bg-green-500/20" },
  emerald: { bg: "bg-emerald-500", text: "text-emerald-500", lightBg: "bg-emerald-100 dark:bg-emerald-500/20" },
  red: { bg: "bg-red-500", text: "text-red-500", lightBg: "bg-red-100 dark:bg-red-500/20" },
  purple: { bg: "bg-purple-500", text: "text-purple-500", lightBg: "bg-purple-100 dark:bg-purple-500/20" },
  amber: { bg: "bg-amber-500", text: "text-amber-500", lightBg: "bg-amber-100 dark:bg-amber-500/20" },
  rose: { bg: "bg-rose-500", text: "text-rose-500", lightBg: "bg-rose-100 dark:bg-rose-500/20" },
  indigo: { bg: "bg-indigo-500", text: "text-indigo-500", lightBg: "bg-indigo-100 dark:bg-indigo-500/20" },
};

export default function RelatoriosPage() {
  const [periodoInicio, setPeriodoInicio] = useState("");
  const [periodoFim, setPeriodoFim] = useState("");
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (reportId: string, formato: string) => {
    setSelectedReport(reportId);
    setIsGenerating(true);
    
    // Simula geração
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsGenerating(false);
    setSelectedReport(null);
    // Aqui abriria o download
  };

  const getRelatorioConfig = (tipoId: string) => {
    return tiposRelatorio.find(r => r.id === tipoId) || tiposRelatorio[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/financeiro"
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
          >
            <RiArrowLeftLine className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <RiFileChartLine className="w-5 h-5 text-white" />
              </div>
              Relatórios Financeiros
            </h1>
            <p className="text-neutral-500 mt-1">
              Gere relatórios detalhados do financeiro
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
            <RiCalendarLine className="w-4 h-4 text-neutral-500" />
            <input
              type="date"
              value={periodoInicio}
              onChange={(e) => setPeriodoInicio(e.target.value)}
              className="bg-transparent text-sm outline-none w-32"
            />
            <span className="text-neutral-400">até</span>
            <input
              type="date"
              value={periodoFim}
              onChange={(e) => setPeriodoFim(e.target.value)}
              className="bg-transparent text-sm outline-none w-32"
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
              <RiFileChartLine className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">12</p>
              <p className="text-sm text-neutral-500">Tipos de Relatórios</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
              <RiDownload2Line className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">156</p>
              <p className="text-sm text-neutral-500">Gerados este mês</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
              <RiRefreshLine className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">8</p>
              <p className="text-sm text-neutral-500">Agendados</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
              <RiMailLine className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">3</p>
              <p className="text-sm text-neutral-500">Envios automáticos</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tipos de Relatório */}
      <div>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Gerar Relatório</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiposRelatorio.map((relatorio, index) => {
            const colors = colorClasses[relatorio.cor];
            const Icon = relatorio.icon;

            return (
              <motion.div
                key={relatorio.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-lg transition-all group"
              >
                <div className="p-4">
                  <div className={`w-12 h-12 rounded-xl ${colors.lightBg} flex items-center justify-center mb-3`}>
                    <Icon className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">{relatorio.nome}</h3>
                  <p className="text-sm text-neutral-500 mb-3">{relatorio.descricao}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {relatorio.formato.map(fmt => (
                      <span key={fmt} className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-full text-xs text-neutral-600 dark:text-neutral-400">
                        {fmt}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-100 dark:border-neutral-800 flex gap-2">
                  {relatorio.formato.slice(0, 2).map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => handleGenerate(relatorio.id, fmt)}
                      disabled={isGenerating && selectedReport === relatorio.id}
                      className={`flex-1 flex items-center justify-center gap-1 h-8 px-3 rounded-lg text-sm font-medium transition-colors ${
                        isGenerating && selectedReport === relatorio.id
                          ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-400"
                          : `${colors.bg} text-white hover:opacity-90`
                      }`}
                    >
                      {isGenerating && selectedReport === relatorio.id ? (
                        <RiRefreshLine className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <RiDownload2Line className="w-4 h-4" />
                          {fmt}
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Relatórios Recentes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
      >
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="font-bold text-neutral-900 dark:text-white">Relatórios Recentes</h3>
          <p className="text-sm text-neutral-500">Últimos relatórios gerados</p>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {relatoriosRecentes.map((relatorio, index) => {
            const config = getRelatorioConfig(relatorio.tipo);
            const colors = colorClasses[config.cor];
            const Icon = config.icon;

            return (
              <motion.div
                key={relatorio.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 + index * 0.05 }}
                className="p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl ${colors.lightBg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">{relatorio.nome}</p>
                    <p className="text-sm text-neutral-500">
                      {new Date(relatorio.data).toLocaleDateString("pt-BR")} • {relatorio.formato}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 hover:text-blue-500">
                    <RiDownload2Line className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 hover:text-amber-500">
                    <RiPrinterLine className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 hover:text-green-500">
                    <RiMailLine className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-200 dark:border-blue-500/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <RiFileChartLine className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-1">Dica: Agendamento de Relatórios</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Você pode agendar relatórios para serem gerados automaticamente e enviados por e-mail. 
              Configure na área de Configurações → Relatórios Automáticos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
