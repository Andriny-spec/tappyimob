"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  RiWallet3Line,
  RiArrowUpLine,
  RiArrowDownLine,
  RiExchangeDollarLine,
  RiFileChartLine,
  RiArrowRightLine,
  RiCalendarLine,
  RiLineChartLine,
  RiPieChartLine,
  RiBarChartGroupedLine,
  RiMoneyDollarCircleLine,
  RiPercentLine,
  RiTimeLine,
  RiBankLine,
  RiArrowUpCircleLine,
  RiArrowDownCircleLine,
  RiCheckboxCircleLine,
  RiAlertLine,
  RiArrowUpSLine,
  RiArrowDownSLine,
} from "react-icons/ri";

// Mock data
const resumoFinanceiro = {
  saldoAtual: 2450000,
  receitasMes: 485000,
  despesasMes: 128500,
  lucroMes: 356500,
  receitasPendentes: 125000,
  despesasPendentes: 45000,
  comissoesPendentes: 89000,
  variacaoReceitas: 12.5,
  variacaoDespesas: -5.2,
  variacaoLucro: 18.3,
};

const fluxoCaixa = [
  { mes: "Jan", receitas: 420000, despesas: 135000 },
  { mes: "Fev", receitas: 380000, despesas: 120000 },
  { mes: "Mar", receitas: 455000, despesas: 145000 },
  { mes: "Abr", receitas: 510000, despesas: 155000 },
  { mes: "Mai", receitas: 485000, despesas: 128500 },
  { mes: "Jun", receitas: 520000, despesas: 140000 },
];

const transacoesRecentes = [
  { id: "1", tipo: "receita", descricao: "Comissão - Venda Apt Vila Mariana", valor: 25500, data: "2024-01-25", status: "confirmado" },
  { id: "2", tipo: "despesa", descricao: "Marketing Digital - Janeiro", valor: 8500, data: "2024-01-24", status: "confirmado" },
  { id: "3", tipo: "receita", descricao: "Comissão - Locação Moema", valor: 3500, data: "2024-01-23", status: "pendente" },
  { id: "4", tipo: "despesa", descricao: "Aluguel Escritório", valor: 12000, data: "2024-01-22", status: "confirmado" },
  { id: "5", tipo: "receita", descricao: "Comissão - Venda Terreno", valor: 96000, data: "2024-01-20", status: "confirmado" },
  { id: "6", tipo: "despesa", descricao: "Folha de Pagamento", valor: 45000, data: "2024-01-20", status: "confirmado" },
];

const categoriasDespesas = [
  { nome: "Folha de Pagamento", valor: 45000, percentual: 35, cor: "bg-blue-500" },
  { nome: "Marketing", valor: 25000, percentual: 19, cor: "bg-purple-500" },
  { nome: "Aluguel/Infraestrutura", valor: 22000, percentual: 17, cor: "bg-amber-500" },
  { nome: "Impostos", valor: 18500, percentual: 14, cor: "bg-red-500" },
  { nome: "Outros", valor: 18000, percentual: 14, cor: "bg-neutral-500" },
];

const quickLinks = [
  { label: "Receitas", href: "/admin/financeiro/receitas", icon: RiArrowUpCircleLine, color: "text-green-500", bg: "bg-green-100 dark:bg-green-500/20", value: "R$ 485K" },
  { label: "Despesas", href: "/admin/financeiro/despesas", icon: RiArrowDownCircleLine, color: "text-red-500", bg: "bg-red-100 dark:bg-red-500/20", value: "R$ 128K" },
  { label: "Comissões", href: "/admin/financeiro/comissoes", icon: RiPercentLine, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-500/20", value: "R$ 89K" },
  { label: "Relatórios", href: "/admin/financeiro/relatorios", icon: RiFileChartLine, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-500/20", value: "12 tipos" },
];

export default function FinanceiroPage() {
  const [periodo, setPeriodo] = useState("mes");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatCompact = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  const maxFluxo = Math.max(...fluxoCaixa.map(f => Math.max(f.receitas, f.despesas)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <RiWallet3Line className="w-5 h-5 text-white" />
            </div>
            Financeiro
          </h1>
          <p className="text-neutral-500 mt-1">
            Gestão financeira completa da imobiliária
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1">
            {["semana", "mes", "ano"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  periodo === p
                    ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((link, index) => (
          <Link key={link.label} href={link.href}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl ${link.bg} flex items-center justify-center`}>
                    <link.icon className={`w-6 h-6 ${link.color}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-white">{link.label}</p>
                    <p className="text-lg font-bold text-neutral-700 dark:text-neutral-300">{link.value}</p>
                  </div>
                </div>
                <RiArrowRightLine className="w-5 h-5 text-neutral-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Saldo Atual */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white"
        >
          <div className="flex items-center gap-2 mb-2">
            <RiBankLine className="w-5 h-5 opacity-80" />
            <span className="text-sm opacity-80">Saldo em Conta</span>
          </div>
          <p className="text-3xl font-bold">{formatCompact(resumoFinanceiro.saldoAtual)}</p>
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex items-center justify-between text-sm">
              <span className="opacity-80">Atualizado agora</span>
              <span className="flex items-center gap-1">
                <RiCheckboxCircleLine className="w-4 h-4" /> Sincronizado
              </span>
            </div>
          </div>
        </motion.div>

        {/* Receitas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                <RiArrowUpLine className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-sm text-neutral-500">Receitas</span>
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${resumoFinanceiro.variacaoReceitas >= 0 ? "text-green-500" : "text-red-500"}`}>
              {resumoFinanceiro.variacaoReceitas >= 0 ? <RiArrowUpSLine /> : <RiArrowDownSLine />}
              {Math.abs(resumoFinanceiro.variacaoReceitas)}%
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">{formatCompact(resumoFinanceiro.receitasMes)}</p>
          <p className="text-sm text-neutral-500 mt-1">
            <span className="text-amber-500">{formatCompact(resumoFinanceiro.receitasPendentes)}</span> pendentes
          </p>
        </motion.div>

        {/* Despesas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                <RiArrowDownLine className="w-5 h-5 text-red-500" />
              </div>
              <span className="text-sm text-neutral-500">Despesas</span>
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${resumoFinanceiro.variacaoDespesas <= 0 ? "text-green-500" : "text-red-500"}`}>
              {resumoFinanceiro.variacaoDespesas <= 0 ? <RiArrowDownSLine /> : <RiArrowUpSLine />}
              {Math.abs(resumoFinanceiro.variacaoDespesas)}%
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">{formatCompact(resumoFinanceiro.despesasMes)}</p>
          <p className="text-sm text-neutral-500 mt-1">
            <span className="text-amber-500">{formatCompact(resumoFinanceiro.despesasPendentes)}</span> pendentes
          </p>
        </motion.div>

        {/* Lucro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <RiLineChartLine className="w-5 h-5 opacity-80" />
              <span className="text-sm opacity-80">Lucro Líquido</span>
            </div>
            <div className="flex items-center gap-1 text-sm font-medium">
              <RiArrowUpSLine />
              {resumoFinanceiro.variacaoLucro}%
            </div>
          </div>
          <p className="text-2xl font-bold">{formatCompact(resumoFinanceiro.lucroMes)}</p>
          <div className="mt-2">
            <div className="flex items-center justify-between text-sm opacity-80">
              <span>Margem de lucro</span>
              <span className="font-semibold">{Math.round((resumoFinanceiro.lucroMes / resumoFinanceiro.receitasMes) * 100)}%</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fluxo de Caixa */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2 p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-white">Fluxo de Caixa</h3>
              <p className="text-sm text-neutral-500">Receitas vs Despesas</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                Receitas
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                Despesas
              </span>
            </div>
          </div>

          <div className="flex items-end gap-4 h-48">
            {fluxoCaixa.map((item, index) => (
              <div key={item.mes} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex gap-1 items-end h-40">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(item.receitas / maxFluxo) * 100}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="flex-1 bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg"
                  />
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(item.despesas / maxFluxo) * 100}%` }}
                    transition={{ delay: index * 0.1 + 0.05, duration: 0.5 }}
                    className="flex-1 bg-gradient-to-t from-red-500 to-red-400 rounded-t-lg"
                  />
                </div>
                <span className="text-xs text-neutral-500">{item.mes}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Categorias de Despesas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-white">Despesas por Categoria</h3>
              <p className="text-sm text-neutral-500">Distribuição mensal</p>
            </div>
            <RiPieChartLine className="w-5 h-5 text-neutral-400" />
          </div>

          <div className="space-y-4">
            {categoriasDespesas.map((cat, index) => (
              <motion.div
                key={cat.nome}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">{cat.nome}</span>
                  <span className="text-sm font-semibold text-neutral-900 dark:text-white">{cat.percentual}%</span>
                </div>
                <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.percentual}%` }}
                    transition={{ delay: 0.4 + index * 0.05, duration: 0.5 }}
                    className={`h-full ${cat.cor} rounded-full`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Transações Recentes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
      >
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-neutral-900 dark:text-white">Transações Recentes</h3>
            <p className="text-sm text-neutral-500">Últimas movimentações financeiras</p>
          </div>
          <Link href="/admin/financeiro/receitas" className="text-sm text-blue-500 hover:underline">
            Ver todas
          </Link>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {transacoesRecentes.map((transacao, index) => (
            <motion.div
              key={transacao.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              className="p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  transacao.tipo === "receita" 
                    ? "bg-green-100 dark:bg-green-500/20" 
                    : "bg-red-100 dark:bg-red-500/20"
                }`}>
                  {transacao.tipo === "receita" ? (
                    <RiArrowUpLine className="w-5 h-5 text-green-500" />
                  ) : (
                    <RiArrowDownLine className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white">{transacao.descricao}</p>
                  <p className="text-sm text-neutral-500">{new Date(transacao.data).toLocaleDateString("pt-BR")}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${transacao.tipo === "receita" ? "text-green-600" : "text-red-600"}`}>
                  {transacao.tipo === "receita" ? "+" : "-"}{formatCurrency(transacao.valor)}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  transacao.status === "confirmado"
                    ? "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400"
                    : "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
                }`}>
                  {transacao.status === "confirmado" ? "Confirmado" : "Pendente"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
