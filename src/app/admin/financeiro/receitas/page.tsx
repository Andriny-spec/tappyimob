"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiArrowUpLine,
  RiSearchLine,
  RiAddLine,
  RiDownload2Line,
  RiCalendarLine,
  RiCheckLine,
  RiTimeLine,
  RiCloseLine,
  RiFilter3Line,
  RiEyeLine,
  RiEditLine,
  RiDeleteBinLine,
  RiMoneyDollarCircleLine,
  RiHome4Line,
  RiPercentLine,
  RiUserLine,
  RiFileTextLine,
  RiRefreshLine,
} from "react-icons/ri";

// Mock data
const receitas = [
  {
    id: "1",
    descricao: "Comissão - Venda Apartamento Vila Mariana",
    categoria: "comissao_venda",
    valor: 25500,
    dataVencimento: "2024-01-25",
    dataPagamento: "2024-01-25",
    status: "pago",
    cliente: "João Silva",
    imovel: "Apt 3 quartos - Vila Mariana",
    formaPagamento: "Transferência",
    contrato: "CTR-2024-0045",
  },
  {
    id: "2",
    descricao: "Comissão - Locação Moema",
    categoria: "comissao_locacao",
    valor: 3500,
    dataVencimento: "2024-01-28",
    dataPagamento: null,
    status: "pendente",
    cliente: "Ana Costa",
    imovel: "Apt 2 quartos - Moema",
    formaPagamento: "PIX",
    contrato: "CTR-2024-0046",
  },
  {
    id: "3",
    descricao: "Comissão - Venda Cobertura Jardins",
    categoria: "comissao_venda",
    valor: 75000,
    dataVencimento: "2024-01-20",
    dataPagamento: "2024-01-22",
    status: "pago",
    cliente: "Empresa ABC",
    imovel: "Cobertura Duplex - Jardins",
    formaPagamento: "Transferência",
    contrato: "CTR-2024-0044",
  },
  {
    id: "4",
    descricao: "Taxa de Administração - Janeiro",
    categoria: "taxa_admin",
    valor: 12000,
    dataVencimento: "2024-01-31",
    dataPagamento: null,
    status: "pendente",
    cliente: "Diversos",
    imovel: null,
    formaPagamento: "Boleto",
    contrato: null,
  },
  {
    id: "5",
    descricao: "Comissão - Venda Terreno Morumbi",
    categoria: "comissao_venda",
    valor: 96000,
    dataVencimento: "2024-01-15",
    dataPagamento: "2024-01-15",
    status: "pago",
    cliente: "Construtora XYZ",
    imovel: "Terreno 1000m² - Morumbi",
    formaPagamento: "Transferência",
    contrato: "CTR-2024-0043",
  },
  {
    id: "6",
    descricao: "Comissão - Locação Sala Comercial",
    categoria: "comissao_locacao",
    valor: 8500,
    dataVencimento: "2024-01-30",
    dataPagamento: null,
    status: "atrasado",
    cliente: "Startup Tech",
    imovel: "Sala Comercial - Paulista",
    formaPagamento: "PIX",
    contrato: "CTR-2024-0048",
  },
];

const categorias = [
  { id: "comissao_venda", label: "Comissão de Venda", cor: "bg-green-500" },
  { id: "comissao_locacao", label: "Comissão de Locação", cor: "bg-blue-500" },
  { id: "taxa_admin", label: "Taxa de Administração", cor: "bg-purple-500" },
  { id: "outros", label: "Outros", cor: "bg-neutral-500" },
];

const stats = [
  { label: "Total Recebido", value: "R$ 485K", icon: RiCheckLine, color: "text-green-500", bg: "bg-green-100 dark:bg-green-500/20" },
  { label: "A Receber", value: "R$ 125K", icon: RiTimeLine, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-500/20" },
  { label: "Em Atraso", value: "R$ 8.5K", icon: RiCloseLine, color: "text-red-500", bg: "bg-red-100 dark:bg-red-500/20" },
  { label: "Este Mês", value: "+12.5%", icon: RiArrowUpLine, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-500/20" },
];

export default function ReceitasPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pago" | "pendente" | "atrasado">("all");
  const [categoriaFilter, setCategoriaFilter] = useState<string>("all");
  const [showNovoModal, setShowNovoModal] = useState(false);

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
    return categorias.find(c => c.id === categoriaId) || categorias[3];
  };

  const filteredReceitas = receitas.filter((r) => {
    const matchSearch =
      r.descricao.toLowerCase().includes(search.toLowerCase()) ||
      r.cliente.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const matchCategoria = categoriaFilter === "all" || r.categoria === categoriaFilter;
    return matchSearch && matchStatus && matchCategoria;
  });

  const totalFiltrado = filteredReceitas.reduce((acc, r) => acc + r.valor, 0);

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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <RiArrowUpLine className="w-5 h-5 text-white" />
              </div>
              Receitas
            </h1>
            <p className="text-neutral-500 mt-1">
              Controle de entradas e recebimentos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 h-10 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800">
            <RiDownload2Line className="w-4 h-4" />
            Exportar
          </button>
          <button 
            onClick={() => setShowNovoModal(true)}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600"
          >
            <RiAddLine className="w-4 h-4" />
            Nova Receita
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

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por descrição ou cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
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
      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10 rounded-2xl border border-green-200 dark:border-green-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RiMoneyDollarCircleLine className="w-6 h-6 text-green-600" />
            <div>
              <p className="text-sm text-green-700 dark:text-green-400">Total filtrado ({filteredReceitas.length} receitas)</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{formatCurrency(totalFiltrado)}</p>
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
              {filteredReceitas.map((receita, index) => {
                const statusConfig = getStatusConfig(receita.status);
                const categoriaConfig = getCategoriaConfig(receita.categoria);
                const StatusIcon = statusConfig.icon;

                return (
                  <motion.tr
                    key={receita.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  >
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">{receita.descricao}</p>
                        <div className="flex items-center gap-2 text-sm text-neutral-500 mt-1">
                          <RiUserLine className="w-3.5 h-3.5" />
                          {receita.cliente}
                          {receita.contrato && (
                            <>
                              <span className="mx-1">•</span>
                              <RiFileTextLine className="w-3.5 h-3.5" />
                              {receita.contrato}
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium`}>
                        <span className={`w-2 h-2 rounded-full ${categoriaConfig.cor}`}></span>
                        {categoriaConfig.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-green-600 dark:text-green-400">{formatCurrency(receita.valor)}</p>
                      <p className="text-xs text-neutral-500">{receita.formaPagamento}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-neutral-900 dark:text-white">{formatDate(receita.dataVencimento)}</p>
                      {receita.dataPagamento && (
                        <p className="text-xs text-green-600">Pago: {formatDate(receita.dataPagamento)}</p>
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
                        {receita.status !== "pago" && (
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
