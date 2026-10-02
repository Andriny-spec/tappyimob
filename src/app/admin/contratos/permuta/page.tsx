"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiExchangeLine,
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
  RiMoreLine,
  RiUserLine,
  RiMoneyDollarCircleLine,
  RiPrinterLine,
  RiCalendarLine,
  RiFileTextLine,
  RiHome4Line,
  RiArrowLeftRightLine,
} from "react-icons/ri";
import { ContratoPermutaModal } from "@/components/admin/contratos/modals/ContratoPermutaModal";

// Mock data
const contratosPermuta = [
  {
    id: "1",
    codigo: "PRM-2024-0012",
    parte1: {
      nome: "Roberto Almeida",
      cpf: "123.456.789-00",
      imovel: "Terreno 500m² - Morumbi",
      codigoImovel: "IMB00078",
      valorAvaliado: 1200000,
    },
    parte2: {
      nome: "Empresa XYZ Ltda",
      cpf: "12.345.678/0001-90",
      imovel: "Apartamento 4 quartos - Itaim",
      codigoImovel: "IMB00045",
      valorAvaliado: 980000,
    },
    torna: 220000,
    tornaPagador: "parte2",
    status: "rascunho",
    dataEmissao: "2024-01-22",
    dataAssinatura: null,
    corretor: "Maria Silva",
  },
  {
    id: "2",
    codigo: "PRM-2024-0011",
    parte1: {
      nome: "Carlos Santos",
      cpf: "987.654.321-00",
      imovel: "Casa 250m² - Alto da Boa Vista",
      codigoImovel: "IMB00034",
      valorAvaliado: 1500000,
    },
    parte2: {
      nome: "Ana Costa",
      cpf: "456.789.123-00",
      imovel: "2 Apartamentos - Moema",
      codigoImovel: "IMB00067, IMB00068",
      valorAvaliado: 1500000,
    },
    torna: 0,
    tornaPagador: null,
    status: "assinado",
    dataEmissao: "2024-01-15",
    dataAssinatura: "2024-01-20",
    corretor: "Carlos Oliveira",
  },
  {
    id: "3",
    codigo: "PRM-2024-0010",
    parte1: {
      nome: "Construtora ABC",
      cpf: "98.765.432/0001-10",
      imovel: "Lote comercial - Berrini",
      codigoImovel: "IMB00089",
      valorAvaliado: 3500000,
    },
    parte2: {
      nome: "Investidor XPTO",
      cpf: "11.222.333/0001-44",
      imovel: "Galpão Industrial - Guarulhos",
      codigoImovel: "IMB00090",
      valorAvaliado: 2800000,
    },
    torna: 700000,
    tornaPagador: "parte2",
    status: "enviado",
    dataEmissao: "2024-01-10",
    dataAssinatura: null,
    corretor: "Fernanda Lima",
  },
  {
    id: "4",
    codigo: "PRM-2023-0045",
    parte1: {
      nome: "João Ferreira",
      cpf: "321.654.987-00",
      imovel: "Apartamento 2 quartos - Pinheiros",
      codigoImovel: "IMB00023",
      valorAvaliado: 650000,
    },
    parte2: {
      nome: "Maria Oliveira",
      cpf: "654.321.987-00",
      imovel: "Casa térrea - Butantã",
      codigoImovel: "IMB00056",
      valorAvaliado: 580000,
    },
    torna: 70000,
    tornaPagador: "parte2",
    status: "cancelado",
    dataEmissao: "2023-12-20",
    dataAssinatura: null,
    corretor: "Ana Santos",
  },
];

const stats = [
  { label: "Total de Permutas", value: "31", icon: RiExchangeLine, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-500/20" },
  { label: "Valor Transacionado", value: "R$ 18.5M", icon: RiMoneyDollarCircleLine, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-500/20" },
  { label: "Com Torna", value: "22", icon: RiArrowLeftRightLine, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-500/20" },
  { label: "Sem Torna", value: "9", icon: RiCheckLine, color: "text-green-500", bg: "bg-green-100 dark:bg-green-500/20" },
];

export default function ContratosPermutaPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "rascunho" | "enviado" | "assinado" | "cancelado">("all");
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
      rascunho: { label: "Rascunho", bg: "bg-neutral-100 dark:bg-neutral-700", text: "text-neutral-600 dark:text-neutral-400", icon: RiEditLine },
      enviado: { label: "Enviado", bg: "bg-amber-100 dark:bg-amber-500/20", text: "text-amber-600 dark:text-amber-400", icon: RiSendPlaneLine },
      assinado: { label: "Assinado", bg: "bg-green-100 dark:bg-green-500/20", text: "text-green-600 dark:text-green-400", icon: RiCheckLine },
      cancelado: { label: "Cancelado", bg: "bg-red-100 dark:bg-red-500/20", text: "text-red-600 dark:text-red-400", icon: RiCloseLine },
    };
    return configs[status] || configs.rascunho;
  };

  const filteredContratos = contratosPermuta.filter((c) => {
    const matchSearch =
      c.codigo.toLowerCase().includes(search.toLowerCase()) ||
      c.parte1.nome.toLowerCase().includes(search.toLowerCase()) ||
      c.parte2.nome.toLowerCase().includes(search.toLowerCase()) ||
      c.parte1.imovel.toLowerCase().includes(search.toLowerCase()) ||
      c.parte2.imovel.toLowerCase().includes(search.toLowerCase());
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
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                <RiExchangeLine className="w-5 h-5 text-purple-500" />
              </div>
              Contratos de Permuta
            </h1>
            <p className="text-neutral-500 mt-1">
              Contratos de troca de imóveis
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
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600"
          >
            <RiAddLine className="w-4 h-4" />
            Nova Permuta
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
            placeholder="Buscar por código, partes ou imóveis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
        </div>
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
              className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between p-4 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                    <RiExchangeLine className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-neutral-900 dark:text-white">{contrato.codigo}</h3>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusConfig.label}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-500">Emitido em {formatDate(contrato.dataEmissao)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 hover:text-blue-500" title="Visualizar">
                    <RiEyeLine className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 hover:text-green-500" title="Download">
                    <RiFileDownloadLine className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 hover:text-amber-500" title="Imprimir">
                    <RiPrinterLine className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500">
                    <RiMoreLine className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Card Body - Permuta Visual */}
              <div className="p-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
                  {/* Parte 1 */}
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <RiUserLine className="w-4 h-4 text-neutral-500" />
                      <span className="text-xs font-medium text-neutral-500">PARTE 1</span>
                    </div>
                    <p className="font-medium text-neutral-900 dark:text-white">{contrato.parte1.nome}</p>
                    <p className="text-xs text-neutral-500 mb-2">{contrato.parte1.cpf}</p>
                    <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
                      <div className="flex items-start gap-2">
                        <RiHome4Line className="w-4 h-4 text-neutral-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">{contrato.parte1.imovel}</p>
                          <p className="text-xs text-neutral-500">{contrato.parte1.codigoImovel}</p>
                        </div>
                      </div>
                      <p className="mt-2 text-lg font-bold text-purple-600 dark:text-purple-400">
                        {formatCurrency(contrato.parte1.valorAvaliado)}
                      </p>
                    </div>
                  </div>

                  {/* Exchange Icon */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                      <RiArrowLeftRightLine className="w-8 h-8 text-purple-500" />
                    </div>
                    {contrato.torna > 0 && (
                      <div className="mt-3 text-center">
                        <p className="text-xs text-neutral-500">Torna</p>
                        <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                          {formatCurrency(contrato.torna)}
                        </p>
                        <p className="text-xs text-neutral-500">
                          Paga por {contrato.tornaPagador === "parte1" ? contrato.parte1.nome : contrato.parte2.nome}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Parte 2 */}
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <RiUserLine className="w-4 h-4 text-neutral-500" />
                      <span className="text-xs font-medium text-neutral-500">PARTE 2</span>
                    </div>
                    <p className="font-medium text-neutral-900 dark:text-white">{contrato.parte2.nome}</p>
                    <p className="text-xs text-neutral-500 mb-2">{contrato.parte2.cpf}</p>
                    <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
                      <div className="flex items-start gap-2">
                        <RiHome4Line className="w-4 h-4 text-neutral-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">{contrato.parte2.imovel}</p>
                          <p className="text-xs text-neutral-500">{contrato.parte2.codigoImovel}</p>
                        </div>
                      </div>
                      <p className="mt-2 text-lg font-bold text-purple-600 dark:text-purple-400">
                        {formatCurrency(contrato.parte2.valorAvaliado)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-neutral-500">
                    <span>Corretor: {contrato.corretor}</span>
                    {contrato.dataAssinatura && (
                      <span className="text-green-600">Assinado em {formatDate(contrato.dataAssinatura)}</span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-neutral-500">Valor total da operação</p>
                    <p className="text-lg font-bold text-neutral-900 dark:text-white">
                      {formatCurrency(contrato.parte1.valorAvaliado + contrato.parte2.valorAvaliado)}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal */}
      <ContratoPermutaModal
        isOpen={showNovoModal}
        onClose={() => setShowNovoModal(false)}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
