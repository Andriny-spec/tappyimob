"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  RiUserLine,
  RiTeamLine,
  RiUserStarLine,
  RiUserFollowLine,
  RiUserUnfollowLine,
  RiBarChartLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiArrowRightLine,
  RiSearchLine,
  RiFilterLine,
  RiDownload2Line,
  RiAddLine,
  RiSparklingLine,
  RiLayoutGridLine,
  RiTableLine,
  RiPhoneLine,
  RiMailLine,
  RiMoreLine,
  RiCheckLine,
  RiTimeLine,
  RiLoader4Line,
} from "react-icons/ri";

// Quick actions
const quickActions = [
  {
    title: "Kanban de Leads",
    description: "Gerencie leads no quadro visual",
    icon: RiLayoutGridLine,
    href: "/admin/clientes/leads",
    color: "orange",
  },
  {
    title: "Qualificação",
    description: "Qualifique seus leads",
    icon: RiUserStarLine,
    href: "/admin/clientes/qualificacao",
    color: "purple",
  },
  {
    title: "Segmentação",
    description: "Segmente sua base de clientes",
    icon: RiFilterLine,
    href: "/admin/clientes/segmentacao",
    color: "blue",
  },
  {
    title: "Histórico",
    description: "Veja o histórico completo",
    icon: RiTimeLine,
    href: "/admin/clientes/historico",
    color: "green",
  },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  NOVO: { label: "Novo", color: "text-blue-500", bg: "bg-blue-500/10" },
  CONTATADO: { label: "Contatado", color: "text-cyan-500", bg: "bg-cyan-500/10" },
  QUALIFICADO: { label: "Qualificado", color: "text-amber-500", bg: "bg-amber-500/10" },
  EM_NEGOCIACAO: { label: "Negociando", color: "text-purple-500", bg: "bg-purple-500/10" },
  NEGOCIANDO: { label: "Negociando", color: "text-purple-500", bg: "bg-purple-500/10" },
  FECHADO: { label: "Fechado", color: "text-green-500", bg: "bg-green-500/10" },
  PERDIDO: { label: "Perdido", color: "text-red-500", bg: "bg-red-500/10" },
  ARQUIVADO: { label: "Arquivado", color: "text-neutral-500", bg: "bg-neutral-500/10" },
};

const sourceLabels: Record<string, string> = {
  SITE: "Site",
  WHATSAPP: "WhatsApp",
  TELEFONE: "Telefone",
  INDICACAO: "Indicação",
  PORTAIS: "Portais",
  REDE_SOCIAL: "Rede Social",
  EMAIL: "Email",
  PRESENCIAL: "Presencial",
  OUTRO: "Outro",
};

interface LeadClient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: string;
  source?: string;
  budget?: number;
  lastContact?: string;
  createdAt: string;
}

export default function ClientesPage() {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<LeadClient[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    ativos: 0,
    fechados: 0,
    perdidos: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/leads?limit=500");
        if (res.ok) {
          const data = await res.json();
          const leads: LeadClient[] = data.leads || [];

          // Calcular stats reais
          const activeStatuses = ["NOVO", "CONTATADO", "QUALIFICADO", "EM_NEGOCIACAO", "NEGOCIANDO"];
          const ativos = leads.filter(l => activeStatuses.includes(l.status)).length;
          const fechados = leads.filter(l => l.status === "FECHADO").length;
          const perdidos = leads.filter(l => l.status === "PERDIDO" || l.status === "ARQUIVADO").length;

          setStats({ total: leads.length, ativos, fechados, perdidos });

          // Ordenar por mais recente e pegar top 10
          const sorted = [...leads].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setClients(sorted.slice(0, 10));
        }
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      notation: "compact",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatRelativeDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Ontem";
    if (diffDays < 7) return `${diffDays} dias`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} sem`;
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };

  const filteredClients = clients.filter(c => {
    if (!search) return true;
    const s = search.toLowerCase();
    return c.name?.toLowerCase().includes(s) || c.email?.toLowerCase().includes(s) || c.phone?.includes(s);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
              <RiUserLine className="w-5 h-5 text-orange-500" />
            </div>
            Clientes
          </h1>
          <p className="text-neutral-500 mt-1">
            Gerencie seus clientes e leads
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 h-10 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
            <RiDownload2Line className="w-4 h-4" />
            Exportar
          </button>
          <Link
            href="/admin/clientes/leads"
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors"
          >
            <RiAddLine className="w-4 h-4" />
            Novo Lead
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total de Clientes", value: stats.total, icon: RiTeamLine, color: "blue" },
          { title: "Leads Ativos", value: stats.ativos, icon: RiUserStarLine, color: "orange" },
          { title: "Conversões", value: stats.fechados, icon: RiUserFollowLine, color: "green" },
          { title: "Perdidos", value: stats.perdidos, icon: RiUserUnfollowLine, color: "red" },
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${
                stat.color === "blue" ? "bg-blue-100 dark:bg-blue-500/20" :
                stat.color === "orange" ? "bg-orange-100 dark:bg-orange-500/20" :
                stat.color === "green" ? "bg-green-100 dark:bg-green-500/20" :
                "bg-red-100 dark:bg-red-500/20"
              } flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${
                  stat.color === "blue" ? "text-blue-500" :
                  stat.color === "orange" ? "text-orange-500" :
                  stat.color === "green" ? "text-green-500" :
                  "text-red-500"
                }`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
              {loading ? "..." : stat.value}
            </p>
            <p className="text-sm text-neutral-500">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, i) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
          >
            <Link
              href={action.href}
              className="group block p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-orange-300 dark:hover:border-orange-500/50 transition-all hover:shadow-lg"
            >
              <div className={`w-12 h-12 rounded-xl bg-${action.color}-100 dark:bg-${action.color}-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <action.icon className={`w-6 h-6 text-${action.color}-500`} />
              </div>
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-1 group-hover:text-orange-500 transition-colors">
                {action.title}
              </h3>
              <p className="text-sm text-neutral-500">{action.description}</p>
              <div className="flex items-center gap-1 mt-3 text-orange-500 text-sm font-medium">
                Acessar
                <RiArrowRightLine className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* AI Insights - dados reais */}
      {!loading && stats.total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <RiSparklingLine className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                Resumo
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <RiCheckLine className="w-4 h-4 text-green-500" />
                  <span className="text-neutral-600 dark:text-neutral-400">
                    <strong className="text-neutral-900 dark:text-white">{stats.fechados} lead{stats.fechados !== 1 ? 's' : ''}</strong> convertido{stats.fechados !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <RiTimeLine className="w-4 h-4 text-amber-500" />
                  <span className="text-neutral-600 dark:text-neutral-400">
                    <strong className="text-neutral-900 dark:text-white">{stats.ativos} lead{stats.ativos !== 1 ? 's' : ''}</strong> ativos no funil
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <RiBarChartLine className="w-4 h-4 text-blue-500" />
                  <span className="text-neutral-600 dark:text-neutral-400">
                    Taxa de conversão <strong className="text-neutral-900 dark:text-white">{stats.total > 0 ? Math.round((stats.fechados / stats.total) * 100) : 0}%</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent Clients */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h2 className="font-semibold text-neutral-900 dark:text-white">
              Clientes Recentes
            </h2>

            <div className="flex items-center gap-3">
              <div className="relative flex-1 lg:w-64">
                <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar cliente..."
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "table"
                      ? "bg-white dark:bg-neutral-700 text-orange-500 shadow-sm"
                      : "text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  <RiTableLine className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-neutral-700 text-orange-500 shadow-sm"
                      : "text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  <RiLayoutGridLine className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RiLoader4Line className="w-6 h-6 text-orange-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* Table View */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 dark:bg-neutral-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Contato
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Origem
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Último Contato
                    </th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {filteredClients.map((client) => (
                    <tr
                      key={client.id}
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold">
                            {client.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-white">
                              {client.name}
                            </p>
                            <p className="text-sm text-neutral-500">{client.email || "-"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {client.phone && (
                            <a
                              href={`tel:${client.phone}`}
                              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                            >
                              <RiPhoneLine className="w-4 h-4" />
                            </a>
                          )}
                          {client.email && (
                            <a
                              href={`mailto:${client.email}`}
                              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                            >
                              <RiMailLine className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            statusConfig[client.status]?.bg || "bg-neutral-100"
                          } ${statusConfig[client.status]?.color || "text-neutral-500"}`}
                        >
                          {statusConfig[client.status]?.label || client.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                        {sourceLabels[client.source || ""] || client.source || "-"}
                      </td>
                      <td className="px-4 py-4 font-medium text-neutral-900 dark:text-white">
                        {client.budget ? formatPrice(client.budget) : "-"}
                      </td>
                      <td className="px-4 py-4 text-sm text-neutral-500">
                        {client.lastContact ? formatRelativeDate(client.lastContact) : formatRelativeDate(client.createdAt)}
                      </td>
                      <td className="px-4 py-4">
                        <Link
                          href="/admin/clientes/leads"
                          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                        >
                          <RiMoreLine className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {filteredClients.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                        Nenhum cliente encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
          <Link
            href="/admin/clientes/leads"
            className="flex items-center justify-center gap-2 text-orange-500 font-medium hover:text-orange-600 transition-colors"
          >
            Ver todos os clientes
            <RiArrowRightLine className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
