"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiFileList3Line,
  RiSearchLine,
  RiAddLine,
  RiDownload2Line,
  RiEyeLine,
  RiEditLine,
  RiDeleteBinLine,
  RiFileCopyLine,
  RiMoreLine,
  RiMoneyDollarCircleLine,
  RiHome4Line,
  RiExchangeLine,
  RiFileTextLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiStarLine,
  RiStarFill,
} from "react-icons/ri";
import { NovoTemplateModal } from "@/components/admin/contratos/modals/NovoTemplateModal";

// Mock data
const templates = [
  {
    id: "1",
    nome: "Contrato de Compra e Venda - Padrão",
    tipo: "venda",
    descricao: "Modelo padrão para contratos de compra e venda de imóveis residenciais e comerciais",
    versao: "2.4",
    ultimaAtualizacao: "2024-01-15",
    usado: 145,
    favorito: true,
    variaveis: ["comprador_nome", "vendedor_nome", "imovel_endereco", "valor_venda", "forma_pagamento"],
  },
  {
    id: "2",
    nome: "Contrato de Locação Residencial",
    tipo: "locacao",
    descricao: "Modelo para contratos de aluguel de imóveis residenciais com todas as cláusulas obrigatórias",
    versao: "3.1",
    ultimaAtualizacao: "2024-01-20",
    usado: 89,
    favorito: true,
    variaveis: ["locatario_nome", "locador_nome", "imovel_endereco", "valor_aluguel", "prazo_meses", "garantia"],
  },
  {
    id: "3",
    nome: "Contrato de Locação Comercial",
    tipo: "locacao",
    descricao: "Modelo específico para locação de imóveis comerciais, com cláusulas de ponto comercial",
    versao: "2.0",
    ultimaAtualizacao: "2024-01-10",
    usado: 34,
    favorito: false,
    variaveis: ["locatario_nome", "locador_nome", "imovel_endereco", "valor_aluguel", "prazo_meses", "atividade"],
  },
  {
    id: "4",
    nome: "Contrato de Permuta",
    tipo: "permuta",
    descricao: "Modelo para contratos de troca de imóveis, com ou sem torna",
    versao: "1.5",
    ultimaAtualizacao: "2023-12-15",
    usado: 22,
    favorito: false,
    variaveis: ["parte1_nome", "parte2_nome", "imovel1", "imovel2", "valor_torna"],
  },
  {
    id: "5",
    nome: "Contrato de Compra e Venda - Financiamento",
    tipo: "venda",
    descricao: "Modelo específico para vendas com financiamento bancário, incluindo cláusulas de garantia",
    versao: "2.2",
    ultimaAtualizacao: "2024-01-18",
    usado: 67,
    favorito: true,
    variaveis: ["comprador_nome", "vendedor_nome", "imovel_endereco", "valor_venda", "banco", "valor_financiado"],
  },
  {
    id: "6",
    nome: "Proposta de Compra",
    tipo: "venda",
    descricao: "Modelo de proposta de compra para apresentar ao vendedor",
    versao: "1.8",
    ultimaAtualizacao: "2024-01-05",
    usado: 234,
    favorito: true,
    variaveis: ["proponente_nome", "imovel_endereco", "valor_proposta", "validade"],
  },
  {
    id: "7",
    nome: "Termo de Vistoria",
    tipo: "locacao",
    descricao: "Termo de vistoria de entrada e saída para contratos de locação",
    versao: "1.3",
    ultimaAtualizacao: "2023-11-20",
    usado: 178,
    favorito: false,
    variaveis: ["imovel_endereco", "data_vistoria", "tipo_vistoria"],
  },
  {
    id: "8",
    nome: "Distrato de Locação",
    tipo: "locacao",
    descricao: "Modelo para encerramento antecipado de contratos de locação",
    versao: "1.2",
    ultimaAtualizacao: "2023-10-10",
    usado: 45,
    favorito: false,
    variaveis: ["locatario_nome", "locador_nome", "data_encerramento", "multa"],
  },
];

const stats = [
  { label: "Total de Templates", value: "12", icon: RiFileList3Line, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-500/20" },
  { label: "Mais Usado", value: "Proposta", icon: RiStarFill, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-500/20" },
  { label: "Contratos Gerados", value: "814", icon: RiFileTextLine, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-500/20" },
  { label: "Atualizados em 2024", value: "6", icon: RiCheckboxCircleLine, color: "text-green-500", bg: "bg-green-100 dark:bg-green-500/20" },
];

export default function ContratosTemplatesPage() {
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState<"all" | "venda" | "locacao" | "permuta">("all");
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [showNovoModal, setShowNovoModal] = useState(false);

  const getTipoConfig = (tipo: string) => {
    const configs: Record<string, { label: string; bg: string; text: string; icon: React.ElementType }> = {
      venda: { label: "Venda", bg: "bg-green-100 dark:bg-green-500/20", text: "text-green-600 dark:text-green-400", icon: RiMoneyDollarCircleLine },
      locacao: { label: "Locação", bg: "bg-blue-100 dark:bg-blue-500/20", text: "text-blue-600 dark:text-blue-400", icon: RiHome4Line },
      permuta: { label: "Permuta", bg: "bg-purple-100 dark:bg-purple-500/20", text: "text-purple-600 dark:text-purple-400", icon: RiExchangeLine },
    };
    return configs[tipo] || configs.venda;
  };

  const filteredTemplates = templates.filter((t) => {
    const matchSearch =
      t.nome.toLowerCase().includes(search.toLowerCase()) ||
      t.descricao.toLowerCase().includes(search.toLowerCase());
    const matchTipo = tipoFilter === "all" || t.tipo === tipoFilter;
    const matchFavorite = !favoriteOnly || t.favorito;
    return matchSearch && matchTipo && matchFavorite;
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

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
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                <RiFileList3Line className="w-5 h-5 text-amber-500" />
              </div>
              Templates de Contratos
            </h1>
            <p className="text-neutral-500 mt-1">
              Modelos de contratos para reutilização
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 h-10 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800">
            <RiDownload2Line className="w-4 h-4" />
            Importar
          </button>
          <button 
            onClick={() => setShowNovoModal(true)}
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600"
          >
            <RiAddLine className="w-4 h-4" />
            Novo Template
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
            placeholder="Buscar templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
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
        <button
          onClick={() => setFavoriteOnly(!favoriteOnly)}
          className={`flex items-center gap-2 h-10 px-4 rounded-xl border font-medium transition-colors ${
            favoriteOnly
              ? "bg-amber-500 border-amber-500 text-white"
              : "border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
          }`}
        >
          {favoriteOnly ? <RiStarFill className="w-4 h-4" /> : <RiStarLine className="w-4 h-4" />}
          Favoritos
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredTemplates.map((template, index) => {
          const tipoConfig = getTipoConfig(template.tipo);
          const TipoIcon = tipoConfig.icon;

          return (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:border-amber-300 dark:hover:border-amber-600 hover:shadow-lg transition-all group"
            >
              {/* Card Header */}
              <div className="p-4 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${tipoConfig.bg} flex items-center justify-center`}>
                      <TipoIcon className={`w-5 h-5 ${tipoConfig.text}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-white text-sm leading-tight">
                        {template.nome}
                      </h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${tipoConfig.bg} ${tipoConfig.text} mt-1`}>
                        {tipoConfig.label}
                      </span>
                    </div>
                  </div>
                  <button 
                    className={`p-1.5 rounded-lg transition-colors ${
                      template.favorito 
                        ? "text-amber-500" 
                        : "text-neutral-300 dark:text-neutral-600 hover:text-amber-500"
                    }`}
                  >
                    {template.favorito ? <RiStarFill className="w-5 h-5" /> : <RiStarLine className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4">
                <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-4">
                  {template.descricao}
                </p>

                {/* Variables */}
                <div className="mb-4">
                  <p className="text-xs text-neutral-500 mb-2">Variáveis do template:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.variaveis.slice(0, 4).map((v) => (
                      <span key={v} className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-600 dark:text-neutral-400">
                        {`{{${v}}}`}
                      </span>
                    ))}
                    {template.variaveis.length > 4 && (
                      <span className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-600 dark:text-neutral-400">
                        +{template.variaveis.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <RiTimeLine className="w-3.5 h-3.5" />
                    v{template.versao} • {formatDate(template.ultimaAtualizacao)}
                  </span>
                  <span className="flex items-center gap-1">
                    <RiFileTextLine className="w-3.5 h-3.5" />
                    Usado {template.usado}x
                  </span>
                </div>
              </div>

              {/* Card Actions */}
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button className="p-2 rounded-lg hover:bg-white dark:hover:bg-neutral-700 text-neutral-500 hover:text-blue-500" title="Visualizar">
                    <RiEyeLine className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-white dark:hover:bg-neutral-700 text-neutral-500 hover:text-amber-500" title="Editar">
                    <RiEditLine className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-white dark:hover:bg-neutral-700 text-neutral-500 hover:text-green-500" title="Duplicar">
                    <RiFileCopyLine className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-white dark:hover:bg-neutral-700 text-neutral-500 hover:text-red-500" title="Excluir">
                    <RiDeleteBinLine className="w-4 h-4" />
                  </button>
                </div>
                <button className="flex items-center gap-2 h-8 px-3 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600">
                  Usar Template
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal */}
      <NovoTemplateModal
        isOpen={showNovoModal}
        onClose={() => setShowNovoModal(false)}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
