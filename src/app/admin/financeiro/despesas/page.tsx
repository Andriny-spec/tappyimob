"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiArrowDownLine,
  RiSearchLine,
  RiAddLine,
  RiDownload2Line,
  RiCheckLine,
  RiTimeLine,
  RiCloseLine,
  RiEyeLine,
  RiEditLine,
  RiDeleteBinLine,
  RiMoneyDollarCircleLine,
  RiUserLine,
  RiBuilding2Line,
  RiMegaphoneLine,
  RiTeamLine,
  RiToolsLine,
  RiGovernmentLine,
  RiPriceTag3Line,
  RiRepeatLine,
} from "react-icons/ri";

// Mock data
const despesas = [
  {
    id: "1",
    descricao: "Folha de Pagamento - Janeiro",
    categoria: "folha_pagamento",
    valor: 45000,
    dataVencimento: "2024-01-30",
    dataPagamento: "2024-01-30",
    status: "pago",
    fornecedor: "Funcionários",
    recorrente: true,
    centroCusto: "Pessoal",
  },
  {
    id: "2",
    descricao: "Marketing Digital - Janeiro",
    categoria: "marketing",
    valor: 8500,
    dataVencimento: "2024-01-25",
    dataPagamento: "2024-01-24",
    status: "pago",
    fornecedor: "Agência XYZ",
    recorrente: true,
    centroCusto: "Marketing",
  },
  {
    id: "3",
    descricao: "Aluguel Escritório - Fevereiro",
    categoria: "infraestrutura",
    valor: 12000,
    dataVencimento: "2024-02-05",
    dataPagamento: null,
    status: "pendente",
    fornecedor: "Imóveis ABC",
    recorrente: true,
    centroCusto: "Infraestrutura",
  },
  {
    id: "4",
    descricao: "Impostos - ISS Janeiro",
    categoria: "impostos",
    valor: 9500,
    dataVencimento: "2024-01-20",
    dataPagamento: "2024-01-20",
    status: "pago",
    fornecedor: "Prefeitura SP",
    recorrente: true,
    centroCusto: "Fiscal",
  },
  {
    id: "5",
    descricao: "Manutenção Equipamentos",
    categoria: "manutencao",
    valor: 3500,
    dataVencimento: "2024-01-28",
    dataPagamento: null,
    status: "pendente",
    fornecedor: "TechSupport",
    recorrente: false,
    centroCusto: "Infraestrutura",
  },
  {
    id: "6",
    descricao: "Energia Elétrica - Janeiro",
    categoria: "infraestrutura",
    valor: 2800,
    dataVencimento: "2024-01-22",
    dataPagamento: null,
    status: "atrasado",
    fornecedor: "Enel",
    recorrente: true,
    centroCusto: "Infraestrutura",
  },
  {
    id: "7",
    descricao: "Google Ads - Janeiro",
    categoria: "marketing",
    valor: 15000,
    dataVencimento: "2024-01-31",
    dataPagamento: "2024-01-29",
    status: "pago",
    fornecedor: "Google",
    recorrente: true,
    centroCusto: "Marketing",
  },
  {
    id: "8",
    descricao: "IPTU Escritório - 2024",
    categoria: "impostos",
    valor: 8000,
    dataVencimento: "2024-02-10",
    dataPagamento: null,
    status: "pendente",
    fornecedor: "Prefeitura SP",
    recorrente: false,
    centroCusto: "Fiscal",
  },
];

const categorias = [
  { id: "folha_pagamento", label: "Folha de Pagamento", cor: "bg-blue-500", icon: RiTeamLine },
  { id: "marketing", label: "Marketing", cor: "bg-purple-500", icon: RiMegaphoneLine },
  { id: "infraestrutura", label: "Infraestrutura", cor: "bg-amber-500", icon: RiBuilding2Line },
  { id: "impostos", label: "Impostos", cor: "bg-red-500", icon: RiGovernmentLine },
  { id: "manutencao", label: "Manutenção", cor: "bg-green-500", icon: RiToolsLine },
  { id: "outros", label: "Outros", cor: "bg-neutral-500", icon: RiPriceTag3Line },
];

const stats = [
  { label: "Total Pago", value: "R$ 128K", icon: RiCheckLine, color: "text-green-500", bg: "bg-green-100 dark:bg-green-500/20" },
  { label: "A Pagar", value: "R$ 45K", icon: RiTimeLine, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-500/20" },
  { label: "Em Atraso", value: "R$ 2.8K", icon: RiCloseLine, color: "text-red-500", bg: "bg-red-100 dark:bg-red-500/20" },
  { label: "Economia", value: "-5.2%", icon: RiArrowDownLine, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-500/20" },
];

export default function DespesasPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pago" | "pendente" | "atrasado">("all");
  const [categoriaFilter, setCategoriaFilter] = useState<string>("all");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; bg: string; text: string; icon: React.ElementType }> = {
      pago: { label: "Pago", bg: "bg-green-100 dark:bg-green-500/20", text: "text-green-600 dark:text-green-400", icon: RiCheckLine },
      pendente: { label: "Pendente", bg: "bg-amber-100 dark:bg-amber-500/20", text: "text-amber-600 dark:text-amber-400", icon: RiTimeLine },
      atrasado: { label: "Atrasado", bg: "bg-red-100 dark:bg-red-500/20", text: "text-red-600 dark:text-red-400", icon: RiCloseLine },
    };
    return configs[status] || configs.pendente;
  };

  const getCategoriaConfig = (categoriaId: string) => {
    return categorias.find(c => c.id === categoriaId) || categorias[5];
  };

  const filteredDespesas = despesas.filter((d) => {
    const matchSearch =
      d.descricao.toLowerCase().includes(search.toLowerCase()) ||
      d.fornecedor.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    const matchCategoria = categoriaFilter === "all" || d.categoria === categoriaFilter;
    return matchSearch && matchStatus && matchCategoria;
  });

  const totalFiltrado = filteredDespesas.reduce((acc, d) => acc + d.valor, 0);

  // Agrupa por categoria para o gráfico
  const despesasPorCategoria = categorias.map(cat => ({
    ...cat,
    total: despesas.filter(d => d.categoria === cat.id).reduce((acc, d) => acc + d.valor, 0)
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  const maxCategoria = Math.max(...despesasPorCategoria.map(c => c.total));

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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
                <RiArrowDownLine className="w-5 h-5 text-white" />
              </div>
              Despesas
            </h1>
            <p className="text-neutral-500 mt-1">
              Controle de saídas e pagamentos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 h-10 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800">
            <RiDownload2Line className="w-4 h-4" />
            Exportar
          </button>
          <button className="flex items-center gap-2 h-10 px-4 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600">
            <RiAddLine className="w-4 h-4" />
            Nova Despesa
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

      {/* Categorias Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
      >
        <h3 className="font-bold text-neutral-900 dark:text-white mb-4">Despesas por Categoria</h3>
        <div className="space-y-4">
          {despesasPorCategoria.map((cat, index) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + index * 0.05 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-neutral-500" />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">{cat.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {formatCurrency(cat.total)}
                  </span>
                </div>
                <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(cat.total / maxCategoria) * 100}%` }}
                    transition={{ delay: 0.3 + index * 0.05, duration: 0.5 }}
                    className={`h-full ${cat.cor} rounded-full`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por descrição ou fornecedor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
        </div>
        <select
          value={categoriaFilter}
          onChange={(e) => setCategoriaFilter(e.target.value)}
          className="h-10 px-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm font-medium"
        >
          <option value="all">Todas as categorias</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="h-10 px-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm font-medium"
        >
          <option value="all">Todos os status</option>
          <option value="pago">Pago</option>
          <option value="pendente">Pendente</option>
          <option value="atrasado">Atrasado</option>
        </select>
      </div>

      {/* Summary Card */}
      <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-500/10 dark:to-rose-500/10 rounded-2xl border border-red-200 dark:border-red-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RiMoneyDollarCircleLine className="w-6 h-6 text-red-600" />
            <div>
              <p className="text-sm text-red-700 dark:text-red-400">Total filtrado ({filteredDespesas.length} despesas)</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-400">{formatCurrency(totalFiltrado)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <th className="text-left p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Descrição</th>
                <th className="text-left p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Categoria</th>
                <th className="text-left p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Valor</th>
                <th className="text-left p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Vencimento</th>
                <th className="text-left p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Status</th>
                <th className="text-right p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredDespesas.map((despesa, index) => {
                const statusConfig = getStatusConfig(despesa.status);
                const categoriaConfig = getCategoriaConfig(despesa.categoria);
                const StatusIcon = statusConfig.icon;
                const CatIcon = categoriaConfig.icon;

                return (
                  <motion.tr
                    key={despesa.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  >
                    <td className="p-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-neutral-900 dark:text-white">{despesa.descricao}</p>
                          {despesa.recorrente && (
                            <RiRepeatLine className="w-4 h-4 text-blue-500" title="Recorrente" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-neutral-500 mt-1">
                          <RiUserLine className="w-3.5 h-3.5" />
                          {despesa.fornecedor}
                          <span className="mx-1">•</span>
                          {despesa.centroCusto}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium">
                        <CatIcon className={`w-4 h-4`} />
                        {categoriaConfig.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-red-600 dark:text-red-400">{formatCurrency(despesa.valor)}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-neutral-900 dark:text-white">{formatDate(despesa.dataVencimento)}</p>
                      {despesa.dataPagamento && (
                        <p className="text-xs text-green-600">Pago: {formatDate(despesa.dataPagamento)}</p>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        {despesa.status !== "pago" && (
                          <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 hover:text-green-500" title="Confirmar Pagamento">
                            <RiCheckLine className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 hover:text-blue-500" title="Visualizar">
                          <RiEyeLine className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 hover:text-amber-500" title="Editar">
                          <RiEditLine className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 hover:text-red-500" title="Excluir">
                          <RiDeleteBinLine className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
