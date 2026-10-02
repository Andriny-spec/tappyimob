"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiMoneyDollarCircleLine,
  RiDownload2Line,
  RiCalendarLine,
  RiArrowUpSLine,
  RiArrowDownSLine,
  RiHome4Line,
  RiBuilding2Line,
  RiMapPinLine,
  RiUserLine,
  RiLineChartLine,
  RiBarChartGroupedLine,
  RiFilter3Line,
} from "react-icons/ri";

const resumoVendas = {
  totalVendas: 2456000,
  totalLocacoes: 485000,
  ticketMedio: 53000,
  quantidadeVendas: 45,
  quantidadeLocacoes: 32,
  variacaoVendas: 12.5,
  variacaoLocacoes: 8.3,
};

const vendasPorRegiao = [
  { regiao: "Zona Sul", vendas: 18, valor: 1250000, percentual: 51 },
  { regiao: "Zona Oeste", vendas: 12, valor: 680000, percentual: 28 },
  { regiao: "Centro", vendas: 8, valor: 356000, percentual: 14 },
  { regiao: "Zona Norte", vendas: 4, valor: 120000, percentual: 5 },
  { regiao: "Zona Leste", vendas: 3, valor: 50000, percentual: 2 },
];

const vendasPorTipo = [
  { tipo: "Apartamento", vendas: 25, valor: 1350000, icone: "🏢" },
  { tipo: "Casa", vendas: 12, valor: 780000, icone: "🏠" },
  { tipo: "Comercial", vendas: 5, valor: 256000, icone: "🏪" },
  { tipo: "Terreno", vendas: 3, valor: 70000, icone: "📍" },
];

const topVendas = [
  { id: "1", imovel: "Cobertura Duplex - Jardins", valor: 2500000, corretor: "Carlos Oliveira", data: "2024-01-20", tipo: "venda" },
  { id: "2", imovel: "Apartamento 4 quartos - Moema", valor: 1850000, corretor: "Maria Silva", data: "2024-01-18", tipo: "venda" },
  { id: "3", imovel: "Casa em Condomínio - Sua Cidade", valor: 1200000, corretor: "Fernanda Lima", data: "2024-01-15", tipo: "venda" },
  { id: "4", imovel: "Terreno 2000m² - Morumbi", valor: 980000, corretor: "Carlos Oliveira", data: "2024-01-12", tipo: "venda" },
  { id: "5", imovel: "Sala Comercial - Paulista", valor: 45000, corretor: "Ana Santos", data: "2024-01-22", tipo: "locacao" },
];

const evolucaoMensal = [
  { mes: "Jan", vendas: 1850000, locacoes: 320000 },
  { mes: "Fev", vendas: 1650000, locacoes: 285000 },
  { mes: "Mar", vendas: 2100000, locacoes: 410000 },
  { mes: "Abr", vendas: 1920000, locacoes: 365000 },
  { mes: "Mai", vendas: 2250000, locacoes: 420000 },
  { mes: "Jun", vendas: 2456000, locacoes: 485000 },
];

export default function VendasRelatorioPage() {
  const [periodoInicio, setPeriodoInicio] = useState("2024-01-01");
  const [periodoFim, setPeriodoFim] = useState("2024-01-31");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const formatCompact = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1 }).format(value);
  };

  const maxRegiao = Math.max(...vendasPorRegiao.map(r => r.percentual));
  const maxEvolucao = Math.max(...evolucaoMensal.map(e => e.vendas + e.locacoes));

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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <RiMoneyDollarCircleLine className="w-5 h-5 text-white" />
              </div>
              Relatório de Vendas
            </h1>
            <p className="text-neutral-500 mt-1">Análise detalhada de vendas e locações</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
            <RiCalendarLine className="w-4 h-4 text-neutral-500" />
            <input type="date" value={periodoInicio} onChange={(e) => setPeriodoInicio(e.target.value)} className="bg-transparent text-sm outline-none w-28" />
            <span className="text-neutral-400">até</span>
            <input type="date" value={periodoFim} onChange={(e) => setPeriodoFim(e.target.value)} className="bg-transparent text-sm outline-none w-28" />
          </div>
          <button className="flex items-center gap-2 h-10 px-4 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600">
            <RiDownload2Line className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl text-white">
          <p className="text-sm opacity-80">Total em Vendas</p>
          <p className="text-2xl font-bold mt-1">{formatCompact(resumoVendas.totalVendas)}</p>
          <div className="flex items-center gap-1 mt-2 text-sm">
            <RiArrowUpSLine className="w-4 h-4" />
            <span>{resumoVendas.variacaoVendas}%</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="p-4 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl text-white">
          <p className="text-sm opacity-80">Total em Locações</p>
          <p className="text-2xl font-bold mt-1">{formatCompact(resumoVendas.totalLocacoes)}</p>
          <div className="flex items-center gap-1 mt-2 text-sm">
            <RiArrowUpSLine className="w-4 h-4" />
            <span>{resumoVendas.variacaoLocacoes}%</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <p className="text-sm text-neutral-500">Ticket Médio</p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">{formatCompact(resumoVendas.ticketMedio)}</p>
          <p className="text-xs text-neutral-400 mt-2">por negociação</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <p className="text-sm text-neutral-500">Vendas Fechadas</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{resumoVendas.quantidadeVendas}</p>
          <p className="text-xs text-neutral-400 mt-2">imóveis vendidos</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <p className="text-sm text-neutral-500">Locações</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{resumoVendas.quantidadeLocacoes}</p>
          <p className="text-xs text-neutral-400 mt-2">contratos ativos</p>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução Mensal */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-white">Evolução Mensal</h3>
              <p className="text-sm text-neutral-500">Vendas + Locações</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Vendas</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Locações</span>
            </div>
          </div>

          <div className="flex items-end gap-3 h-40">
            {evolucaoMensal.map((item, index) => (
              <div key={item.mes} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col gap-0.5 h-36">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(item.vendas / maxEvolucao) * 100}%` }}
                    transition={{ delay: 0.3 + index * 0.05, duration: 0.5 }}
                    className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t"
                  />
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(item.locacoes / maxEvolucao) * 100}%` }}
                    transition={{ delay: 0.35 + index * 0.05, duration: 0.5 }}
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-b"
                  />
                </div>
                <span className="text-xs text-neutral-500">{item.mes}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Vendas por Região */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-white">Vendas por Região</h3>
              <p className="text-sm text-neutral-500">Distribuição geográfica</p>
            </div>
            <RiMapPinLine className="w-5 h-5 text-neutral-400" />
          </div>

          <div className="space-y-4">
            {vendasPorRegiao.map((regiao, index) => (
              <motion.div key={regiao.regiao} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + index * 0.05 }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">{regiao.regiao}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-neutral-500">{regiao.vendas} vendas</span>
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">{regiao.percentual}%</span>
                  </div>
                </div>
                <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${regiao.percentual}%` }}
                    transition={{ delay: 0.4 + index * 0.05, duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Vendas por Tipo */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
        <h3 className="font-bold text-neutral-900 dark:text-white mb-4">Vendas por Tipo de Imóvel</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {vendasPorTipo.map((tipo, index) => (
            <motion.div
              key={tipo.tipo}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45 + index * 0.05 }}
              className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl"
            >
              <div className="text-3xl mb-2">{tipo.icone}</div>
              <h4 className="font-semibold text-neutral-900 dark:text-white">{tipo.tipo}</h4>
              <p className="text-2xl font-bold text-green-600 mt-1">{tipo.vendas}</p>
              <p className="text-sm text-neutral-500">{formatCompact(tipo.valor)}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Top Vendas */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="font-bold text-neutral-900 dark:text-white">Maiores Negociações</h3>
          <p className="text-sm text-neutral-500">Top 5 do período</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100 dark:border-neutral-800">
                <th className="text-left p-4 text-xs font-semibold text-neutral-500">Imóvel</th>
                <th className="text-left p-4 text-xs font-semibold text-neutral-500">Valor</th>
                <th className="text-left p-4 text-xs font-semibold text-neutral-500">Corretor</th>
                <th className="text-left p-4 text-xs font-semibold text-neutral-500">Data</th>
                <th className="text-left p-4 text-xs font-semibold text-neutral-500">Tipo</th>
              </tr>
            </thead>
            <tbody>
              {topVendas.map((venda, index) => (
                <motion.tr key={venda.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 + index * 0.03 }} className="border-b border-neutral-50 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="p-4 font-medium text-neutral-900 dark:text-white">{venda.imovel}</td>
                  <td className="p-4 font-bold text-green-600">{formatCurrency(venda.valor)}</td>
                  <td className="p-4 text-neutral-600 dark:text-neutral-400">{venda.corretor}</td>
                  <td className="p-4 text-neutral-500">{new Date(venda.data).toLocaleDateString("pt-BR")}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${venda.tipo === "venda" ? "bg-green-100 dark:bg-green-500/20 text-green-600" : "bg-blue-100 dark:bg-blue-500/20 text-blue-600"}`}>
                      {venda.tipo === "venda" ? "Venda" : "Locação"}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
