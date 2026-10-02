"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  RiFileTextLine,
  RiSearchLine,
  RiAddLine,
  RiFilter3Line,
  RiDownload2Line,
  RiEyeLine,
  RiEditLine,
  RiDeleteBinLine,
  RiCheckLine,
  RiTimeLine,
  RiCloseLine,
  RiSendPlaneLine,
  RiFileList3Line,
  RiMoneyDollarCircleLine,
  RiHome4Line,
  RiExchangeLine,
  RiPrinterLine,
  RiCalendarLine,
  RiUserLine,
  RiMoreLine,
  RiArrowRightLine,
  RiFileDownloadLine,
  RiMailLine,
  RiLoader4Line,
} from "react-icons/ri";
import { NovoContratoModal } from "@/components/admin/contratos/modals/NovoContratoModal";

interface Contrato {
  id: string;
  codigo: string;
  type: string;
  category: string;
  name: string;
  status: string;
  valor: number;
  createdAt: string;
  signedAt: string | null;
  compradorNome: string | null;
  vendedorNome: string | null;
  locatarioNome: string | null;
  locadorNome: string | null;
  parte1Nome: string | null;
  parte2Nome: string | null;
  property: { id: string; code: string; title: string } | null;
  corretor: { id: string; name: string } | null;
  lead: { id: string; name: string } | null;
}

interface Totals {
  total: number;
  rascunho: number;
  enviado: number;
  assinado: number;
  cancelado: number;
  valorTotal: number;
}

export default function ContratosPage() {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [totals, setTotals] = useState<Totals>({ total: 0, rascunho: 0, enviado: 0, assinado: 0, cancelado: 0, valorTotal: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "RASCUNHO" | "ENVIADO" | "ASSINADO" | "CANCELADO">("all");
  const [tipoFilter, setTipoFilter] = useState<"all" | "VENDA" | "LOCACAO" | "PERMUTA">("all");
  const [showNovoModal, setShowNovoModal] = useState(false);

  useEffect(() => {
    fetchContratos();
  }, [statusFilter, tipoFilter]);

  const fetchContratos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (tipoFilter !== "all") params.append("category", tipoFilter);
      if (search) params.append("search", search);

      const res = await fetch(`/api/admin/contratos?${params}`);
      if (res.ok) {
        const data = await res.json();
        setContratos(data.contratos || []);
        setTotals(data.totals || { total: 0, rascunho: 0, enviado: 0, assinado: 0, cancelado: 0, valorTotal: 0 });
      }
    } catch (error) {
      console.error("Erro ao buscar contratos:", error);
    } finally {
      setLoading(false);
    }
  };

  function formatCurrencyShort(value: number) {
    if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(1)}K`;
    return `R$ ${value.toFixed(0)}`;
  }

  const stats = [
    { label: "Total de Contratos", value: totals.total.toString(), icon: RiFileTextLine, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-500/20" },
    { label: "Assinados", value: totals.assinado.toString(), icon: RiCheckLine, color: "text-green-500", bg: "bg-green-100 dark:bg-green-500/20" },
    { label: "Aguardando", value: (totals.rascunho + totals.enviado).toString(), icon: RiTimeLine, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-500/20" },
    { label: "Valor Total", value: formatCurrencyShort(totals.valorTotal), icon: RiMoneyDollarCircleLine, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-500/20" },
  ];

  const quickLinks = [
    { label: "Vendas", href: "/admin/contratos/vendas", icon: RiMoneyDollarCircleLine, color: "text-green-500", bg: "bg-green-100 dark:bg-green-500/20", count: contratos.filter(c => c.category === "VENDA").length },
    { label: "Locações", href: "/admin/contratos/locacoes", icon: RiHome4Line, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-500/20", count: contratos.filter(c => c.category === "LOCACAO").length },
    { label: "Permutas", href: "/admin/contratos/permuta", icon: RiExchangeLine, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-500/20", count: contratos.filter(c => c.category === "PERMUTA").length },
    { label: "Templates", href: "/admin/contratos/templates", icon: RiFileList3Line, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-500/20", count: 0 },
  ];

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
      RASCUNHO: { label: "Rascunho", bg: "bg-neutral-100 dark:bg-neutral-700", text: "text-neutral-600 dark:text-neutral-400", icon: RiEditLine },
      ENVIADO: { label: "Enviado", bg: "bg-amber-100 dark:bg-amber-500/20", text: "text-amber-600 dark:text-amber-400", icon: RiSendPlaneLine },
      ASSINADO: { label: "Assinado", bg: "bg-green-100 dark:bg-green-500/20", text: "text-green-600 dark:text-green-400", icon: RiCheckLine },
      CANCELADO: { label: "Cancelado", bg: "bg-red-100 dark:bg-red-500/20", text: "text-red-600 dark:text-red-400", icon: RiCloseLine },
    };
    return configs[status] || configs.RASCUNHO;
  };

  const getTipoConfig = (tipo: string) => {
    const configs: Record<string, { label: string; bg: string; text: string; icon: React.ElementType }> = {
      VENDA: { label: "Venda", bg: "bg-green-100 dark:bg-green-500/20", text: "text-green-600 dark:text-green-400", icon: RiMoneyDollarCircleLine },
      LOCACAO: { label: "Locação", bg: "bg-blue-100 dark:bg-blue-500/20", text: "text-blue-600 dark:text-blue-400", icon: RiHome4Line },
      PERMUTA: { label: "Permuta", bg: "bg-purple-100 dark:bg-purple-500/20", text: "text-purple-600 dark:text-purple-400", icon: RiExchangeLine },
    };
    return configs[tipo] || configs.VENDA;
  };

  const filteredContratos = contratos.filter((c) => {
    const matchSearch =
      c.codigo.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.property?.title || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    const matchTipo = tipoFilter === "all" || c.category === tipoFilter;
    return matchSearch && matchStatus && matchTipo;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
              <RiFileTextLine className="w-5 h-5 text-blue-500" />
            </div>
            Contratos
          </h1>
          <p className="text-neutral-500 mt-1">
            Gerencie todos os contratos imobiliários
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 h-10 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800">
            <RiDownload2Line className="w-4 h-4" />
            Exportar
          </button>
          <button 
            onClick={() => setShowNovoModal(true)}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600"
          >
            <RiAddLine className="w-4 h-4" />
            Novo Contrato
          </button>
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
                  <div className={`w-10 h-10 rounded-xl ${link.bg} flex items-center justify-center`}>
                    <link.icon className={`w-5 h-5 ${link.color}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-white">{link.label}</p>
                    <p className="text-sm text-neutral-500">{link.count} contratos</p>
                  </div>
                </div>
                <RiArrowRightLine className="w-5 h-5 text-neutral-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>
          </Link>
        ))}
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

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por código, título ou imóvel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
          <option value="permuta">Permuta</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="h-10 px-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm font-medium"
        >
          <option value="all">Todos os status</option>
          <option value="rascunho">Rascunho</option>
          <option value="enviado">Enviado</option>
          <option value="assinado">Assinado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      {/* Contracts Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <th className="text-left p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Contrato</th>
                <th className="text-left p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Tipo</th>
                <th className="text-left p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Imóvel</th>
                <th className="text-left p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Valor</th>
                <th className="text-left p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Status</th>
                <th className="text-left p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Data</th>
                <th className="text-right p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredContratos.map((contrato, index) => {
                const statusConfig = getStatusConfig(contrato.status);
                const tipoConfig = getTipoConfig(contrato.category);
                const StatusIcon = statusConfig.icon;
                const TipoIcon = tipoConfig.icon;
                
                // Determinar partes do contrato
                const parte1 = contrato.compradorNome || contrato.locatarioNome || contrato.parte1Nome || "-";
                const parte2 = contrato.vendedorNome || contrato.locadorNome || contrato.parte2Nome || "-";

                return (
                  <motion.tr
                    key={contrato.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  >
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">{contrato.codigo}</p>
                        <p className="text-sm text-neutral-500">{contrato.name}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${tipoConfig.bg} ${tipoConfig.text}`}>
                        <TipoIcon className="w-3.5 h-3.5" />
                        {tipoConfig.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-sm text-neutral-900 dark:text-white">{contrato.property?.title || "-"}</p>
                        <p className="text-xs text-neutral-500">{contrato.property?.code || "-"}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-neutral-900 dark:text-white">
                        {formatCurrency(contrato.valor)}
                        {contrato.category === "LOCACAO" && <span className="text-xs font-normal text-neutral-500">/mês</span>}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <p className="text-neutral-900 dark:text-white">{formatDate(contrato.createdAt)}</p>
                        {contrato.signedAt && (
                          <p className="text-xs text-green-600">Assinado: {formatDate(contrato.signedAt)}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 hover:text-blue-500" title="Visualizar">
                          <RiEyeLine className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 hover:text-amber-500" title="Download">
                          <RiFileDownloadLine className="w-4 h-4" />
                        </button>
                        {contrato.status === "RASCUNHO" && (
                          <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 hover:text-green-500" title="Enviar">
                            <RiMailLine className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 hover:text-neutral-700" title="Mais opções">
                          <RiMoreLine className="w-4 h-4" />
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

      {/* Modal */}
      <NovoContratoModal
        isOpen={showNovoModal}
        onClose={() => setShowNovoModal(false)}
      />
    </div>
  );
}
