"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiPercentLine,
  RiSearchLine,
  RiDownload2Line,
  RiCheckLine,
  RiTimeLine,
  RiEyeLine,
  RiMoneyDollarCircleLine,
  RiUserStarLine,
  RiHome4Line,
  RiCalendarLine,
  RiFileTextLine,
  RiTrophyLine,
  RiMedalLine,
  RiFilterLine,
} from "react-icons/ri";

// Mock data
const comissoes = [
  {
    id: "1",
    corretor: { nome: "Carlos Oliveira", avatar: null, ranking: 1 },
    tipo: "venda",
    imovel: "Apartamento 3 quartos - Vila Mariana",
    codigoImovel: "IMB00045",
    valorVenda: 850000,
    percentual: 3,
    valorComissao: 25500,
    status: "pago",
    dataVenda: "2024-01-15",
    dataPagamento: "2024-01-25",
    contrato: "CTR-2024-0045",
  },
  {
    id: "2",
    corretor: { nome: "Maria Silva", avatar: null, ranking: 2 },
    tipo: "venda",
    imovel: "Cobertura Duplex - Jardins",
    codigoImovel: "IMB00012",
    valorVenda: 2500000,
    percentual: 3,
    valorComissao: 75000,
    status: "pendente",
    dataVenda: "2024-01-20",
    dataPagamento: null,
    contrato: "CTR-2024-0046",
  },
  {
    id: "3",
    corretor: { nome: "Fernanda Lima", avatar: null, ranking: 3 },
    tipo: "locacao",
    imovel: "Casa em Condomínio - Sua Cidade",
    codigoImovel: "IMB00078",
    valorVenda: 8500,
    percentual: 100,
    valorComissao: 8500,
    status: "pago",
    dataVenda: "2024-01-18",
    dataPagamento: "2024-01-22",
    contrato: "LOC-2024-0033",
  },
  {
    id: "4",
    corretor: { nome: "Carlos Oliveira", avatar: null, ranking: 1 },
    tipo: "venda",
    imovel: "Terreno 1000m² - Morumbi",
    codigoImovel: "IMB00034",
    valorVenda: 3200000,
    percentual: 3,
    valorComissao: 96000,
    status: "pago",
    dataVenda: "2024-01-10",
    dataPagamento: "2024-01-15",
    contrato: "CTR-2024-0044",
  },
  {
    id: "5",
    corretor: { nome: "Ana Santos", avatar: null, ranking: 4 },
    tipo: "locacao",
    imovel: "Sala Comercial - Paulista",
    codigoImovel: "IMB00089",
    valorVenda: 12000,
    percentual: 100,
    valorComissao: 12000,
    status: "processando",
    dataVenda: "2024-01-22",
    dataPagamento: null,
    contrato: "LOC-2024-0034",
  },
];

const corretoresResumo = [
  { nome: "Carlos Oliveira", total: 121500, vendas: 2, ranking: 1 },
  { nome: "Maria Silva", total: 75000, vendas: 1, ranking: 2 },
  { nome: "Fernanda Lima", total: 8500, vendas: 1, ranking: 3 },
  { nome: "Ana Santos", total: 12000, vendas: 1, ranking: 4 },
];

const stats = [
  { label: "Total Comissões", value: "R$ 217K", icon: RiPercentLine, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-500/20" },
  { label: "Pagas", value: "R$ 130K", icon: RiCheckLine, color: "text-green-500", bg: "bg-green-100 dark:bg-green-500/20" },
  { label: "Pendentes", value: "R$ 87K", icon: RiTimeLine, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-500/20" },
  { label: "Corretores Ativos", value: "8", icon: RiUserStarLine, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-500/20" },
];

export default function ComissoesFinanceiroPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pago" | "pendente" | "processando">("all");
  const [tipoFilter, setTipoFilter] = useState<"all" | "venda" | "locacao">("all");

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
    const configs: Record<string, { label: string; bg: string; text: string }> = {
      pago: { label: "Pago", bg: "bg-green-100 dark:bg-green-500/20", text: "text-green-600 dark:text-green-400" },
      pendente: { label: "Pendente", bg: "bg-amber-100 dark:bg-amber-500/20", text: "text-amber-600 dark:text-amber-400" },
      processando: { label: "Processando", bg: "bg-blue-100 dark:bg-blue-500/20", text: "text-blue-600 dark:text-blue-400" },
    };
    return configs[status] || configs.pendente;
  };

  const getRankingBadge = (ranking: number) => {
    if (ranking === 1) return { bg: "bg-amber-500", icon: RiTrophyLine };
    if (ranking === 2) return { bg: "bg-neutral-400", icon: RiMedalLine };
    if (ranking === 3) return { bg: "bg-amber-700", icon: RiMedalLine };
    return { bg: "bg-neutral-200 dark:bg-neutral-700", icon: null };
  };

  const filteredComissoes = comissoes.filter((c) => {
    const matchSearch =
      c.corretor.nome.toLowerCase().includes(search.toLowerCase()) ||
      c.imovel.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    const matchTipo = tipoFilter === "all" || c.tipo === tipoFilter;
    return matchSearch && matchStatus && matchTipo;
  });

  const totalFiltrado = filteredComissoes.reduce((acc, c) => acc + c.valorComissao, 0);

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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                <RiPercentLine className="w-5 h-5 text-white" />
              </div>
              Comissões
            </h1>
            <p className="text-neutral-500 mt-1">
              Gestão de comissões dos corretores
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 h-10 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800">
            <RiDownload2Line className="w-4 h-4" />
            Exportar
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

      {/* Ranking Corretores */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <RiTrophyLine className="w-5 h-5 text-amber-500" />
            Ranking de Comissões - Este Mês
          </h3>
          <Link href="/admin/corretores/ranking" className="text-sm text-purple-500 hover:underline">
            Ver ranking completo
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {corretoresResumo.map((corretor, index) => {
            const rankBadge = getRankingBadge(corretor.ranking);
            const RankIcon = rankBadge.icon;

            return (
              <motion.div
                key={corretor.nome}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 + index * 0.05 }}
                className={`p-4 rounded-xl border ${
                  corretor.ranking === 1
                    ? "bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-500/10 dark:to-emerald-500/5 border-amber-200 dark:border-amber-500/30"
                    : "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full ${rankBadge.bg} flex items-center justify-center text-white font-bold`}>
                    {RankIcon ? <RankIcon className="w-5 h-5" /> : corretor.ranking}
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-white">{corretor.nome}</p>
                    <p className="text-xs text-neutral-500">{corretor.vendas} transações</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(corretor.total)}
                </p>
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
            placeholder="Buscar por corretor ou imóvel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
        </div>
        <select
          value={tipoFilter}
          onChange={(e) => setTipoFilter(e.target.value as any)}
          className="h-10 px-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm font-medium"
        >
          <option value="all">Todos os tipos</option>
          <option value="venda">Venda</option>
          <option value="locacao">Locação</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="h-10 px-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm font-medium"
        >
          <option value="all">Todos os status</option>
          <option value="pago">Pago</option>
          <option value="pendente">Pendente</option>
          <option value="processando">Processando</option>
        </select>
      </div>

      {/* Summary */}
      <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-500/10 dark:to-violet-500/10 rounded-2xl border border-purple-200 dark:border-purple-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RiMoneyDollarCircleLine className="w-6 h-6 text-purple-600" />
            <div>
              <p className="text-sm text-purple-700 dark:text-purple-400">Total filtrado ({filteredComissoes.length} comissões)</p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{formatCurrency(totalFiltrado)}</p>
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
                <th className="text-left p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Corretor</th>
                <th className="text-left p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Imóvel</th>
                <th className="text-left p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Tipo</th>
                <th className="text-left p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Valor Base</th>
                <th className="text-left p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Comissão</th>
                <th className="text-left p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Status</th>
                <th className="text-right p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredComissoes.map((comissao, index) => {
                const statusConfig = getStatusConfig(comissao.status);
                const rankBadge = getRankingBadge(comissao.corretor.ranking);

                return (
                  <motion.tr
                    key={comissao.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${rankBadge.bg} flex items-center justify-center text-white font-bold text-sm`}>
                          {comissao.corretor.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-white">{comissao.corretor.nome}</p>
                          <p className="text-xs text-neutral-500">#{comissao.corretor.ranking} no ranking</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-sm text-neutral-900 dark:text-white">{comissao.imovel}</p>
                        <p className="text-xs text-neutral-500 flex items-center gap-1">
                          <RiFileTextLine className="w-3 h-3" />
                          {comissao.contrato}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                        comissao.tipo === "venda"
                          ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400"
                          : "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                      }`}>
                        {comissao.tipo === "venda" ? "Venda" : "Locação"}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-neutral-900 dark:text-white">
                        {formatCurrency(comissao.valorVenda)}
                      </p>
                      <p className="text-xs text-neutral-500">{comissao.percentual}%</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-purple-600 dark:text-purple-400">
                        {formatCurrency(comissao.valorComissao)}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        {comissao.status === "pendente" && (
                          <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 hover:text-green-500" title="Pagar">
                            <RiCheckLine className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 hover:text-blue-500" title="Visualizar">
                          <RiEyeLine className="w-4 h-4" />
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
