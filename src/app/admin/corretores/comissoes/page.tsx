"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiPercentLine,
  RiSearchLine,
  RiCalendarLine,
  RiDownload2Line,
  RiMoneyDollarCircleLine,
  RiCheckLine,
  RiTimeLine,
  RiCloseLine,
  RiFilter3Line,
  RiArrowUpLine,
  RiArrowDownLine,
  RiWallet3Line,
  RiExchangeLine,
  RiLoader4Line,
} from "react-icons/ri";
import { AddComissaoModal } from "@/components/admin/corretores/modals/AddComissaoModal";

interface Comissao {
  id: string;
  valorVenda: number;
  percentual: number;
  valorComissao: number;
  status: string;
  imovelCodigo: string;
  imovelTitulo: string;
  dataPagamento: string | null;
  createdAt: string;
  corretor: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

interface Totals {
  pago: number;
  pendente: number;
  processando: number;
  cancelado: number;
}

export default function ComissoesPage() {
  const [comissoes, setComissoes] = useState<Comissao[]>([]);
  const [totals, setTotals] = useState<Totals>({ pago: 0, pendente: 0, processando: 0, cancelado: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "PAGO" | "PENDENTE" | "PROCESSANDO" | "CANCELADO">("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchComissoes();
  }, [statusFilter, dateRange]);

  const fetchComissoes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (dateRange.from) params.append("dateFrom", dateRange.from);
      if (dateRange.to) params.append("dateTo", dateRange.to);

      const res = await fetch(`/api/admin/corretores/comissoes?${params}`);
      if (res.ok) {
        const data = await res.json();
        setComissoes(data.comissoes || []);
        setTotals(data.totals || { pago: 0, pendente: 0, processando: 0, cancelado: 0 });
      }
    } catch (error) {
      console.error("Erro ao buscar comissões:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/corretores/comissoes?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: newStatus,
          dataPagamento: newStatus === "PAGO" ? new Date().toISOString() : null
        }),
      });
      if (res.ok) {
        fetchComissoes();
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const stats = [
    { label: "Total Pago", value: formatCurrencyShort(totals.pago), change: "+12%", icon: RiCheckLine, color: "text-green-500", bg: "bg-green-100 dark:bg-green-500/20" },
    { label: "Pendente", value: formatCurrencyShort(totals.pendente), change: `${comissoes.filter(c => c.status === "PENDENTE").length} pagamentos`, icon: RiTimeLine, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-500/20" },
    { label: "Processando", value: formatCurrencyShort(totals.processando), change: `${comissoes.filter(c => c.status === "PROCESSANDO").length} pagamentos`, icon: RiExchangeLine, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-500/20" },
    { label: "Taxa Média", value: comissoes.length > 0 ? `${(comissoes.reduce((acc, c) => acc + c.percentual, 0) / comissoes.length).toFixed(1)}%` : "0%", change: "do valor", icon: RiPercentLine, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-500/20" },
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
    }).format(value);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; bg: string; text: string }> = {
      PAGO: { label: "Pago", bg: "bg-green-100 dark:bg-green-500/20", text: "text-green-600 dark:text-green-400" },
      PENDENTE: { label: "Pendente", bg: "bg-amber-100 dark:bg-amber-500/20", text: "text-amber-600 dark:text-amber-400" },
      PROCESSANDO: { label: "Processando", bg: "bg-blue-100 dark:bg-blue-500/20", text: "text-blue-600 dark:text-blue-400" },
      CANCELADO: { label: "Cancelado", bg: "bg-red-100 dark:bg-red-500/20", text: "text-red-600 dark:text-red-400" },
    };
    return configs[status] || configs.PENDENTE;
  };

  const filteredComissoes = comissoes.filter((c) => {
    const matchSearch =
      c.corretor.name.toLowerCase().includes(search.toLowerCase()) ||
      c.imovelTitulo.toLowerCase().includes(search.toLowerCase()) ||
      c.imovelCodigo.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalFiltered = filteredComissoes.reduce((acc, c) => acc + c.valorComissao, 0);

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
              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                <RiPercentLine className="w-5 h-5 text-green-500" />
              </div>
              Comissões
            </h1>
            <p className="text-neutral-500 mt-1">
              Gerencie as comissões dos corretores
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 h-10 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800">
            <RiDownload2Line className="w-4 h-4" />
            Exportar
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600"
          >
            <RiMoneyDollarCircleLine className="w-4 h-4" />
            Nova Comissão
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
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className="text-xs text-neutral-500">{stat.change}</span>
            </div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-3">{stat.value}</p>
            <p className="text-sm text-neutral-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por corretor, imóvel ou código..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="h-10 px-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white"
            />
            <span className="text-neutral-400">até</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="h-10 px-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-10 px-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white"
          >
            <option value="all">Todos os status</option>
            <option value="PAGO">Pago</option>
            <option value="PENDENTE">Pendente</option>
            <option value="PROCESSANDO">Processando</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-500/10 rounded-xl border border-green-200 dark:border-green-500/20">
        <div className="flex items-center gap-3">
          <RiWallet3Line className="w-5 h-5 text-green-500" />
          <span className="text-neutral-700 dark:text-neutral-300">
            Total filtrado: <strong className="text-green-600 dark:text-green-400">{formatCurrency(totalFiltered)}</strong>
          </span>
        </div>
        <span className="text-sm text-neutral-500">
          {filteredComissoes.length} comissões
        </span>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
                <th className="text-left p-4 text-sm font-semibold text-neutral-500">Corretor</th>
                <th className="text-left p-4 text-sm font-semibold text-neutral-500">Imóvel</th>
                <th className="text-right p-4 text-sm font-semibold text-neutral-500">Valor Venda</th>
                <th className="text-center p-4 text-sm font-semibold text-neutral-500">%</th>
                <th className="text-right p-4 text-sm font-semibold text-neutral-500">Comissão</th>
                <th className="text-center p-4 text-sm font-semibold text-neutral-500">Data Pgto</th>
                <th className="text-center p-4 text-sm font-semibold text-neutral-500">Status</th>
                <th className="text-center p-4 text-sm font-semibold text-neutral-500">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredComissoes.map((comissao, index) => {
                const statusConfig = getStatusConfig(comissao.status);
                return (
                  <motion.tr
                    key={comissao.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  >
                    <td className="p-4">
                      <p className="font-medium text-neutral-900 dark:text-white">{comissao.corretor.name}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-neutral-900 dark:text-white">{comissao.imovelTitulo}</p>
                      <p className="text-xs text-neutral-500">{comissao.imovelCodigo}</p>
                    </td>
                    <td className="p-4 text-right font-medium text-neutral-900 dark:text-white">
                      {formatCurrency(comissao.valorVenda)}
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-1 rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-sm font-medium">
                        {comissao.percentual}%
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-green-500">
                      {formatCurrency(comissao.valorComissao)}
                    </td>
                    <td className="p-4 text-center text-sm text-neutral-600 dark:text-neutral-400">
                      {formatDate(comissao.dataPagamento)}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        {comissao.status === "PENDENTE" && (
                          <button 
                            onClick={() => handleUpdateStatus(comissao.id, "PAGO")}
                            className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-medium hover:bg-green-600"
                          >
                            Pagar
                          </button>
                        )}
                        {comissao.status === "PROCESSANDO" && (
                          <button 
                            onClick={() => handleUpdateStatus(comissao.id, "PAGO")}
                            className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600"
                          >
                            Confirmar
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AddComissaoModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
