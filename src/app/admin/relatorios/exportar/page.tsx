"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiDownload2Line,
  RiFileExcel2Line,
  RiFilePdf2Line,
  RiFileTextLine,
  RiCalendarLine,
  RiCheckLine,
  RiLoader4Line,
  RiMailLine,
  RiTimeLine,
  RiHistoryLine,
  RiDeleteBinLine,
  RiRefreshLine,
  RiFileChartLine,
  RiUserLine,
  RiHome4Line,
  RiMoneyDollarCircleLine,
  RiPercentLine,
} from "react-icons/ri";

const tiposRelatorio = [
  { id: "vendas", nome: "Relatório de Vendas", descricao: "Vendas, locações e valores", icon: RiMoneyDollarCircleLine, cor: "green" },
  { id: "leads", nome: "Relatório de Leads", descricao: "Leads, origem e conversão", icon: RiUserLine, cor: "blue" },
  { id: "imoveis", nome: "Relatório de Imóveis", descricao: "Estoque, status e categorias", icon: RiHome4Line, cor: "orange" },
  { id: "financeiro", nome: "Relatório Financeiro", descricao: "Receitas, despesas e comissões", icon: RiFileChartLine, cor: "purple" },
  { id: "performance", nome: "Performance Corretores", descricao: "Ranking e métricas individuais", icon: RiPercentLine, cor: "pink" },
];

const formatosExportacao = [
  { id: "pdf", nome: "PDF", icone: RiFilePdf2Line, cor: "text-red-500", bg: "bg-red-100 dark:bg-red-500/20", descricao: "Documento formatado" },
  { id: "excel", nome: "Excel", icone: RiFileExcel2Line, cor: "text-green-500", bg: "bg-green-100 dark:bg-green-500/20", descricao: "Planilha editável" },
  { id: "csv", nome: "CSV", icone: RiFileTextLine, cor: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-500/20", descricao: "Dados brutos" },
];

const exportacoesRecentes = [
  { id: "1", nome: "Relatório de Vendas - Janeiro 2024", tipo: "vendas", formato: "PDF", data: "2024-01-25T14:30:00", tamanho: "2.4 MB", status: "concluido" },
  { id: "2", nome: "Leads - Semana 4", tipo: "leads", formato: "Excel", data: "2024-01-24T10:15:00", tamanho: "1.8 MB", status: "concluido" },
  { id: "3", nome: "Performance Equipe - Q4 2023", tipo: "performance", formato: "PDF", data: "2024-01-20T16:45:00", tamanho: "5.2 MB", status: "concluido" },
  { id: "4", nome: "Imóveis Ativos", tipo: "imoveis", formato: "CSV", data: "2024-01-18T09:00:00", tamanho: "890 KB", status: "concluido" },
  { id: "5", nome: "Financeiro Dezembro", tipo: "financeiro", formato: "Excel", data: "2024-01-15T11:30:00", tamanho: "3.1 MB", status: "concluido" },
];

const agendamentos = [
  { id: "1", nome: "Vendas Semanais", tipo: "vendas", formato: "PDF", frequencia: "Toda segunda", email: "gerente@tappyimob.com.br", ativo: true },
  { id: "2", nome: "Leads Diário", tipo: "leads", formato: "Excel", frequencia: "Diariamente às 8h", email: "vendas@tappyimob.com.br", ativo: true },
  { id: "3", nome: "Financeiro Mensal", tipo: "financeiro", formato: "PDF", frequencia: "Dia 1 de cada mês", email: "financeiro@tappyimob.com.br", ativo: false },
];

const colorClasses: Record<string, { bg: string; text: string; lightBg: string }> = {
  green: { bg: "bg-green-500", text: "text-green-500", lightBg: "bg-green-100 dark:bg-green-500/20" },
  blue: { bg: "bg-blue-500", text: "text-blue-500", lightBg: "bg-blue-100 dark:bg-blue-500/20" },
  orange: { bg: "bg-orange-500", text: "text-orange-500", lightBg: "bg-orange-100 dark:bg-orange-500/20" },
  purple: { bg: "bg-purple-500", text: "text-purple-500", lightBg: "bg-purple-100 dark:bg-purple-500/20" },
  pink: { bg: "bg-pink-500", text: "text-pink-500", lightBg: "bg-pink-100 dark:bg-pink-500/20" },
};

export default function ExportarRelatorioPage() {
  const [tipoSelecionado, setTipoSelecionado] = useState<string | null>(null);
  const [formatoSelecionado, setFormatoSelecionado] = useState<string | null>(null);
  const [periodoInicio, setPeriodoInicio] = useState("2024-01-01");
  const [periodoFim, setPeriodoFim] = useState("2024-01-31");
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExport = async () => {
    if (!tipoSelecionado || !formatoSelecionado) return;
    
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsExporting(false);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const getFormatoIcon = (formato: string) => {
    const icons: Record<string, React.ElementType> = { PDF: RiFilePdf2Line, Excel: RiFileExcel2Line, CSV: RiFileTextLine };
    return icons[formato] || RiFileTextLine;
  };

  const getTipoConfig = (tipoId: string) => {
    return tiposRelatorio.find(t => t.id === tipoId) || tiposRelatorio[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/relatorios" className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500">
            <RiArrowLeftLine className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-emerald-500 flex items-center justify-center">
                <RiDownload2Line className="w-5 h-5 text-white" />
              </div>
              Exportar Dados
            </h1>
            <p className="text-neutral-500 mt-1">Baixe relatórios em diferentes formatos</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuração de Exportação */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 space-y-6">
          {/* Tipo de Relatório */}
          <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <h3 className="font-bold text-neutral-900 dark:text-white mb-4">1. Selecione o Relatório</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {tiposRelatorio.map((tipo) => {
                const Icon = tipo.icon;
                const colors = colorClasses[tipo.cor];
                const selected = tipoSelecionado === tipo.id;
                
                return (
                  <button
                    key={tipo.id}
                    onClick={() => setTipoSelecionado(tipo.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selected 
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-500/10" 
                        : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg ${colors.lightBg} flex items-center justify-center mb-2`}>
                      <Icon className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <p className={`font-medium ${selected ? "text-orange-600" : "text-neutral-900 dark:text-white"}`}>{tipo.nome}</p>
                    <p className="text-xs text-neutral-500">{tipo.descricao}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Formato */}
          <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <h3 className="font-bold text-neutral-900 dark:text-white mb-4">2. Escolha o Formato</h3>
            <div className="grid grid-cols-3 gap-3">
              {formatosExportacao.map((formato) => {
                const Icon = formato.icone;
                const selected = formatoSelecionado === formato.id;
                
                return (
                  <button
                    key={formato.id}
                    onClick={() => setFormatoSelecionado(formato.id)}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      selected 
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-500/10" 
                        : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl ${formato.bg} flex items-center justify-center mx-auto mb-2`}>
                      <Icon className={`w-6 h-6 ${formato.cor}`} />
                    </div>
                    <p className={`font-medium ${selected ? "text-orange-600" : "text-neutral-900 dark:text-white"}`}>{formato.nome}</p>
                    <p className="text-xs text-neutral-500">{formato.descricao}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Período */}
          <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <h3 className="font-bold text-neutral-900 dark:text-white mb-4">3. Defina o Período</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm text-neutral-500 mb-1">Data Inicial</label>
                <div className="relative">
                  <RiCalendarLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="date"
                    value={periodoInicio}
                    onChange={(e) => setPeriodoInicio(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm text-neutral-500 mb-1">Data Final</label>
                <div className="relative">
                  <RiCalendarLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="date"
                    value={periodoFim}
                    onChange={(e) => setPeriodoFim(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Botão Exportar */}
          <button
            onClick={handleExport}
            disabled={!tipoSelecionado || !formatoSelecionado || isExporting}
            className={`w-full h-12 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              exportSuccess
                ? "bg-green-500 text-white"
                : !tipoSelecionado || !formatoSelecionado
                ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed"
                : "bg-orange-500 text-white hover:bg-orange-600"
            }`}
          >
            {exportSuccess ? (
              <>
                <RiCheckLine className="w-5 h-5" />
                Exportado com Sucesso!
              </>
            ) : isExporting ? (
              <>
                <RiLoader4Line className="w-5 h-5 animate-spin" />
                Gerando Relatório...
              </>
            ) : (
              <>
                <RiDownload2Line className="w-5 h-5" />
                Exportar Relatório
              </>
            )}
          </button>
        </motion.div>

        {/* Sidebar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
          {/* Agendamentos */}
          <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <RiTimeLine className="w-4 h-4 text-orange-500" />
                Agendamentos
              </h3>
              <button className="text-sm text-orange-500 hover:underline">+ Novo</button>
            </div>
            <div className="space-y-3">
              {agendamentos.map((agendamento) => (
                <div key={agendamento.id} className={`p-3 rounded-xl ${agendamento.ativo ? "bg-neutral-50 dark:bg-neutral-800" : "bg-neutral-50/50 dark:bg-neutral-800/50 opacity-60"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm text-neutral-900 dark:text-white">{agendamento.nome}</p>
                    <span className={`w-2 h-2 rounded-full ${agendamento.ativo ? "bg-green-500" : "bg-neutral-400"}`} />
                  </div>
                  <p className="text-xs text-neutral-500">{agendamento.frequencia}</p>
                  <p className="text-xs text-neutral-400 flex items-center gap-1 mt-1">
                    <RiMailLine className="w-3 h-3" />
                    {agendamento.email}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Exportações Recentes */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RiHistoryLine className="w-5 h-5 text-neutral-400" />
            <h3 className="font-bold text-neutral-900 dark:text-white">Exportações Recentes</h3>
          </div>
        </div>
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {exportacoesRecentes.map((exportacao, index) => {
            const FormatoIcon = getFormatoIcon(exportacao.formato);
            const tipoConfig = getTipoConfig(exportacao.tipo);
            const TipoIcon = tipoConfig.icon;

            return (
              <motion.div
                key={exportacao.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 + index * 0.03 }}
                className="p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl ${colorClasses[tipoConfig.cor].lightBg} flex items-center justify-center`}>
                    <TipoIcon className={`w-5 h-5 ${colorClasses[tipoConfig.cor].text}`} />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">{exportacao.nome}</p>
                    <p className="text-sm text-neutral-500">{formatDate(exportacao.data)} • {exportacao.tamanho}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                    exportacao.formato === "PDF" ? "bg-red-100 dark:bg-red-500/20 text-red-600" :
                    exportacao.formato === "Excel" ? "bg-green-100 dark:bg-green-500/20 text-green-600" :
                    "bg-blue-100 dark:bg-blue-500/20 text-blue-600"
                  }`}>
                    <FormatoIcon className="w-3.5 h-3.5" />
                    {exportacao.formato}
                  </span>
                  <button className="p-2 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-500/20 text-neutral-400 hover:text-orange-600">
                    <RiDownload2Line className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 text-neutral-400 hover:text-red-600">
                    <RiDeleteBinLine className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
