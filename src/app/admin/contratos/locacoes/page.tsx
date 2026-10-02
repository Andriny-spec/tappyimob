"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiHome4Line,
  RiSearchLine,
  RiAddLine,
  RiDownload2Line,
  RiEyeLine,
  RiEditLine,
  RiCheckLine,
  RiTimeLine,
  RiCloseLine,
  RiSendPlaneLine,
  RiFileDownloadLine,
  RiMailLine,
  RiMoreLine,
  RiUserLine,
  RiMoneyDollarCircleLine,
  RiPrinterLine,
  RiCalendarLine,
  RiRepeatLine,
  RiFileTextLine,
  RiAlertLine,
  RiRefreshLine,
  RiLoader4Line,
} from "react-icons/ri";
import { ContratoLocacaoModal } from "@/components/admin/contratos/modals/ContratoLocacaoModal";

interface ContratoLocacao {
  id: string;
  codigo: string;
  name: string;
  status: string;
  valor: number;
  valorAluguel: number | null;
  valorCaucao: number | null;
  duracaoMeses: number | null;
  locatarioNome: string | null;
  locatarioDoc: string | null;
  locadorNome: string | null;
  locadorDoc: string | null;
  createdAt: string;
  signedAt: string | null;
  property: { id: string; code: string; title: string } | null;
  corretor: { id: string; name: string } | null;
}

export default function ContratosLocacaoPage() {
  const [contratos, setContratos] = useState<ContratoLocacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "RASCUNHO" | "ENVIADO" | "ASSINADO" | "CANCELADO">("all");
  const [showNovoModal, setShowNovoModal] = useState(false);

  useEffect(() => {
    fetchContratos();
  }, [statusFilter]);

  const fetchContratos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("category", "LOCACAO");
      if (statusFilter !== "all") params.append("status", statusFilter);

      const res = await fetch(`/api/admin/contratos?${params}`);
      if (res.ok) {
        const data = await res.json();
        setContratos(data.contratos || []);
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
    { label: "Contratos Ativos", value: contratos.filter(c => c.status === "ASSINADO").length.toString(), icon: RiCheckLine, color: "text-green-500", bg: "bg-green-100 dark:bg-green-500/20" },
    { label: "Receita Mensal", value: formatCurrencyShort(contratos.reduce((acc, c) => acc + (c.valorAluguel || 0), 0)), icon: RiMoneyDollarCircleLine, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-500/20" },
    { label: "Aguardando", value: contratos.filter(c => c.status === "ENVIADO" || c.status === "RASCUNHO").length.toString(), icon: RiAlertLine, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-500/20" },
    { label: "Total Contratos", value: contratos.length.toString(), icon: RiRefreshLine, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-500/20" },
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
      ASSINADO: { label: "Ativo", bg: "bg-green-100 dark:bg-green-500/20", text: "text-green-600 dark:text-green-400", icon: RiCheckLine },
      ENVIADO: { label: "Aguardando", bg: "bg-amber-100 dark:bg-amber-500/20", text: "text-amber-600 dark:text-amber-400", icon: RiSendPlaneLine },
      RASCUNHO: { label: "Rascunho", bg: "bg-neutral-100 dark:bg-neutral-700", text: "text-neutral-600 dark:text-neutral-400", icon: RiEditLine },
      CANCELADO: { label: "Cancelado", bg: "bg-red-100 dark:bg-red-500/20", text: "text-red-600 dark:text-red-400", icon: RiCloseLine },
    };
    return configs[status] || configs.RASCUNHO;
  };

  const filteredContratos = contratos.filter((c: ContratoLocacao) => {
    const matchSearch =
      c.codigo.toLowerCase().includes(search.toLowerCase()) ||
      (c.property?.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.locatarioNome || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.locadorNome || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/contratos"
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
          >
            <RiArrowLeftLine className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                <RiHome4Line className="w-5 h-5 text-blue-500" />
              </div>
              Contratos de Locação
            </h1>
            <p className="text-neutral-500 mt-1">
              Contratos de aluguel residencial e comercial
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
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600"
          >
            <RiAddLine className="w-4 h-4" />
            Novo Contrato
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
            placeholder="Buscar por código, imóvel, locatário ou locador..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="h-10 px-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm font-medium"
        >
          <option value="all">Todos os status</option>
          <option value="ASSINADO">Ativo</option>
          <option value="ENVIADO">Aguardando</option>
          <option value="RASCUNHO">Rascunho</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>

      {/* Contracts Cards */}
      <div className="grid gap-4">
        {filteredContratos.map((contrato, index) => {
          const statusConfig = getStatusConfig(contrato.status);
          const StatusIcon = statusConfig.icon;

          return (
            <motion.div
              key={contrato.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white dark:bg-neutral-900 rounded-2xl border overflow-hidden ${
                contrato.status === "vencendo" 
                  ? "border-red-300 dark:border-red-500/30" 
                  : "border-neutral-200 dark:border-neutral-800"
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between p-4 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                    <RiFileTextLine className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-neutral-900 dark:text-white">{contrato.codigo}</h3>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusConfig.label}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-500">{contrato.property?.title || contrato.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 hover:text-blue-500" title="Visualizar">
                    <RiEyeLine className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 hover:text-green-500" title="Download">
                    <RiFileDownloadLine className="w-5 h-5" />
                  </button>
                  {contrato.status === "RASCUNHO" && (
                    <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 hover:text-purple-500" title="Editar">
                      <RiEditLine className="w-5 h-5" />
                    </button>
                  )}
                  <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500">
                    <RiMoreLine className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4">
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Locatário */}
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Locatário</p>
                    <p className="font-medium text-neutral-900 dark:text-white text-sm">{contrato.locatarioNome || "-"}</p>
                    <p className="text-xs text-neutral-500">{contrato.locatarioDoc || "-"}</p>
                  </div>

                  {/* Locador */}
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Locador</p>
                    <p className="font-medium text-neutral-900 dark:text-white text-sm">{contrato.locadorNome || "-"}</p>
                    <p className="text-xs text-neutral-500">{contrato.locadorDoc || "-"}</p>
                  </div>

                  {/* Valores */}
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Valor Mensal</p>
                    <p className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(contrato.valorAluguel || 0)}</p>
                    <p className="text-xs text-neutral-500">Caução: {formatCurrency(contrato.valorCaucao || 0)}</p>
                  </div>

                  {/* Duração */}
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Duração</p>
                    <p className="font-medium text-neutral-900 dark:text-white text-sm">{contrato.duracaoMeses || 12} meses</p>
                    <p className="text-xs text-neutral-500">Emissão: {formatDate(contrato.createdAt)}</p>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Assinatura</p>
                    {contrato.signedAt ? (
                      <p className="text-sm text-green-600">{formatDate(contrato.signedAt)}</p>
                    ) : (
                      <p className="text-sm text-amber-600">Pendente</p>
                    )}
                  </div>
                </div>

                {/* Corretor */}
                {contrato.corretor && (
                  <div className="mt-4 p-3 rounded-xl flex items-center justify-between bg-neutral-50 dark:bg-neutral-800">
                    <div className="flex items-center gap-2">
                      <RiUserLine className="w-4 h-4 text-neutral-500" />
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        Corretor: {contrato.corretor.name}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal */}
      <ContratoLocacaoModal
        isOpen={showNovoModal}
        onClose={() => setShowNovoModal(false)}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
