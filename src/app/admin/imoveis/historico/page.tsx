"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  RiHistoryLine,
  RiAddCircleLine,
  RiEditLine,
  RiDeleteBinLine,
  RiSearchLine,
  RiFilterLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiBuilding2Line,
  RiUserLine,
  RiTimeLine,
  RiExternalLinkLine,
  RiCloseLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiPhoneLine,
  RiEyeLine,
} from "react-icons/ri";
import Link from "next/link";
import Image from "next/image";

interface ActivityLog {
  id: string;
  action: string;
  description: string | null;
  propertyId: string | null;
  propertyCode: string;
  propertyTitle: string | null;
  userId: string | null;
  userName: string;
  userRole: string | null;
  metadata: any;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
    role: string;
  } | null;
  property: {
    id: string;
    code: string;
    title: string;
    thumbnail: string | null;
    status: string;
    propertyOwner?: {
      id: string;
      name: string;
      phones: string[];
      email: string | null;
    } | null;
  } | null;
}

const actionConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  CREATED: {
    label: "Criado",
    icon: RiAddCircleLine,
    color: "text-green-600",
    bg: "bg-green-100 dark:bg-green-500/20",
  },
  UPDATED: {
    label: "Editado",
    icon: RiEditLine,
    color: "text-blue-600",
    bg: "bg-blue-100 dark:bg-blue-500/20",
  },
  DELETED: {
    label: "Excluído",
    icon: RiDeleteBinLine,
    color: "text-red-600",
    bg: "bg-red-100 dark:bg-red-500/20",
  },
  VIEWED: {
    label: "Acessado",
    icon: RiEyeLine,
    color: "text-purple-600",
    bg: "bg-purple-100 dark:bg-purple-500/20",
  },
};

const roleLabels: Record<string, string> = {
  ADMIN: "Admin",
  CORRETOR: "Corretor",
  CLIENTE: "Cliente",
};

const fieldLabels: Record<string, string> = {
  price: "Preço",
  rentPrice: "Aluguel",
  status: "Status",
  title: "Título",
  description: "Descrição",
  category: "Finalidade",
  type: "Tipo",
  condition: "Condição",
  bedrooms: "Quartos",
  bathrooms: "Banheiros",
  suites: "Suítes",
  parkingSpaces: "Vagas",
  area: "Área",
  address: "Endereço",
  neighborhood: "Bairro",
  city: "Cidade",
  isFeatured: "Destaque",
  isExclusive: "Exclusivo",
  soldBy: "Vendido por",
  soldAt: "Data de venda",
  soldPrice: "Preço de venda",
  condoFee: "Condomínio",
  iptu: "IPTU",
};

export default function HistoricoPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [corretorFilter, setCorretorFilter] = useState("");
  const [corretores, setCorretores] = useState<{ id: string; name: string; role: string }[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(pagination.page));
      params.set("limit", String(pagination.limit));
      if (search) params.set("search", search);
      if (actionFilter) params.set("action", actionFilter);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      if (corretorFilter) params.set("corretorId", corretorFilter);

      const res = await fetch(`/api/admin/property-logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        if (data.corretores) setCorretores(data.corretores);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar logs:", error);
    } finally {
      setLoading(false);
    }
  }, [search, actionFilter, dateFrom, dateTo, corretorFilter, pagination.page, pagination.limit]);

  useEffect(() => {
    const timer = setTimeout(() => fetchLogs(), 300);
    return () => clearTimeout(timer);
  }, [fetchLogs]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Agora";
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;

    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: diffDays > 365 ? "numeric" : undefined,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFullDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Agrupar logs por dia
  const groupedLogs = logs.reduce((groups: Record<string, ActivityLog[]>, log) => {
    const date = new Date(log.createdAt).toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(log);
    return groups;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <RiHistoryLine className="w-7 h-7 text-orange-500" />
            Histórico de Imóveis
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            {pagination.total} registros de atividade
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            placeholder="Buscar por código, título do imóvel ou nome do usuário..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          />
        </div>
        <div className="flex gap-2">
          {/* Action filter chips */}
          <button
            onClick={() => { setActionFilter(""); setPagination((p) => ({ ...p, page: 1 })); }}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
              !actionFilter
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => { setActionFilter("CREATED"); setPagination((p) => ({ ...p, page: 1 })); }}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
              actionFilter === "CREATED"
                ? "bg-green-600 text-white"
                : "bg-white dark:bg-neutral-800 text-green-600 border border-neutral-200 dark:border-neutral-700"
            }`}
          >
            Criados
          </button>
          <button
            onClick={() => { setActionFilter("UPDATED"); setPagination((p) => ({ ...p, page: 1 })); }}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
              actionFilter === "UPDATED"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-neutral-800 text-blue-600 border border-neutral-200 dark:border-neutral-700"
            }`}
          >
            Editados
          </button>
          <button
            onClick={() => { setActionFilter("DELETED"); setPagination((p) => ({ ...p, page: 1 })); }}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
              actionFilter === "DELETED"
                ? "bg-red-600 text-white"
                : "bg-white dark:bg-neutral-800 text-red-600 border border-neutral-200 dark:border-neutral-700"
            }`}
          >
            Excluídos
          </button>
          <button
            onClick={() => { setActionFilter("VIEWED"); setPagination((p) => ({ ...p, page: 1 })); }}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
              actionFilter === "VIEWED"
                ? "bg-purple-600 text-white"
                : "bg-white dark:bg-neutral-800 text-purple-600 border border-neutral-200 dark:border-neutral-700"
            }`}
          >
            Acessados
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-2 text-xs font-medium bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 rounded-lg"
          >
            <RiFilterLine className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Date filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="flex gap-3 items-center bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700"
        >
          <span className="text-xs text-neutral-500 font-medium">Período:</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPagination((p) => ({ ...p, page: 1 })); }}
            className="px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm"
          />
          <span className="text-xs text-neutral-400">até</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPagination((p) => ({ ...p, page: 1 })); }}
            className="px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm"
          />
          <span className="text-xs text-neutral-500 font-medium ml-2">Corretor:</span>
          <select
            value={corretorFilter}
            onChange={(e) => { setCorretorFilter(e.target.value); setPagination((p) => ({ ...p, page: 1 })); }}
            className="px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm min-w-[160px]"
          >
            <option value="">Todos</option>
            {corretores.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.role === "ADMIN" ? "Admin" : "Corretor"})</option>
            ))}
          </select>
          {(dateFrom || dateTo || corretorFilter) && (
            <button
              onClick={() => { setDateFrom(""); setDateTo(""); setCorretorFilter(""); setPagination((p) => ({ ...p, page: 1 })); }}
              className="px-2 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
            >
              <RiCloseLine className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}

      {/* Timeline */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-20">
          <RiHistoryLine className="w-16 h-16 mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Nenhum registro encontrado</h3>
          <p className="text-sm text-neutral-500 mt-1">
            {search || actionFilter ? "Tente ajustar os filtros" : "O histórico será preenchido conforme imóveis forem adicionados, editados ou excluídos."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedLogs).map(([date, dayLogs]) => (
            <div key={date}>
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 sticky top-0 bg-neutral-50 dark:bg-neutral-950 py-1 z-10">
                {date}
              </h3>
              <div className="space-y-2">
                {dayLogs.map((log, i) => {
                  const config = actionConfig[log.action] || actionConfig.UPDATED;
                  const Icon = config.icon;

                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-start gap-3 p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-orange-200 dark:hover:border-orange-500/30 transition-colors group"
                    >
                      {/* Action Icon */}
                      <div className={`w-9 h-9 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-4 h-4 ${config.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${config.bg} ${config.color}`}>
                            {config.label}
                          </span>
                          <span className="text-xs text-neutral-500">{formatDate(log.createdAt)}</span>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          {/* Property thumbnail */}
                          {log.property?.thumbnail && (
                            <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
                              <Image
                                src={log.property.thumbnail}
                                alt=""
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                              {log.property ? (
                                <Link href={`/admin/imoveis/${log.property.id}`} className="hover:text-orange-500 transition-colors">
                                  {log.propertyCode} - {log.propertyTitle || log.property.title}
                                </Link>
                              ) : (
                                <span className="text-neutral-400">
                                  {log.propertyCode} {log.propertyTitle ? `- ${log.propertyTitle}` : "(imóvel removido)"}
                                </span>
                              )}
                            </p>
                            {log.description && (
                              <p className="text-xs text-neutral-500 mt-0.5 truncate">{log.description}</p>
                            )}
                            {log.property?.propertyOwner && (
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-neutral-400">Proprietário: {log.property.propertyOwner.name}</span>
                                {log.property.propertyOwner.phones?.[0] && (
                                  <a
                                    href={`tel:${log.property.propertyOwner.phones[0]}`}
                                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <RiPhoneLine className="w-2.5 h-2.5" />
                                    {log.property.propertyOwner.phones[0]}
                                  </a>
                                )}
                                {log.property.propertyOwner.phones?.[1] && (
                                  <a
                                    href={`tel:${log.property.propertyOwner.phones[1]}`}
                                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <RiPhoneLine className="w-2.5 h-2.5" />
                                    {log.property.propertyOwner.phones[1]}
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Expandable changes detail */}
                        {log.metadata?.changes?.length > 0 && (
                          <button
                            onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                            className="flex items-center gap-1 mt-1.5 text-[10px] text-blue-500 hover:text-blue-600 font-medium"
                          >
                            {expandedLog === log.id ? <RiArrowUpSLine className="w-3 h-3" /> : <RiArrowDownSLine className="w-3 h-3" />}
                            {log.metadata.changes.length} campo{log.metadata.changes.length > 1 ? "s" : ""} alterado{log.metadata.changes.length > 1 ? "s" : ""}
                          </button>
                        )}
                        {expandedLog === log.id && log.metadata?.changes && (
                          <div className="mt-2 space-y-1 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-2">
                            {log.metadata.changes.map((change: any, ci: number) => (
                              <div key={ci} className="flex items-center gap-2 text-[11px]">
                                <span className="font-medium text-neutral-600 dark:text-neutral-400 min-w-[80px]">
                                  {fieldLabels[change.field] || change.field}
                                </span>
                                <span className="text-red-400 line-through max-w-[120px] truncate" title={change.old || "(vazio)"}>
                                  {change.old || "(vazio)"}
                                </span>
                                <span className="text-neutral-400">→</span>
                                <span className="text-green-600 dark:text-green-400 font-medium max-w-[120px] truncate" title={change.new || "(vazio)"}>
                                  {change.new || "(vazio)"}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* User */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                            {log.userName}
                          </p>
                          <p className="text-[10px] text-neutral-400">
                            {roleLabels[log.userRole || ""] || log.userRole}
                          </p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {log.user?.avatar ? (
                            <Image src={log.user.avatar} alt="" width={32} height={32} className="w-full h-full object-cover" />
                          ) : (
                            <RiUserLine className="w-4 h-4 text-neutral-500" />
                          )}
                        </div>
                      </div>

                      {/* Link to property */}
                      {log.property && (
                        <Link
                          href={`/admin/imoveis/${log.property.id}`}
                          className="hidden group-hover:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-500/10 text-neutral-400 hover:text-orange-500 transition-colors flex-shrink-0"
                        >
                          <RiExternalLinkLine className="w-4 h-4" />
                        </Link>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-xs text-neutral-500">
            Mostrando {(pagination.page - 1) * pagination.limit + 1} a{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
              disabled={pagination.page <= 1}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <RiArrowLeftSLine className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const startPage = Math.max(1, pagination.page - 2);
              const pageNum = startPage + i;
              if (pageNum > pagination.totalPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPagination((p) => ({ ...p, page: pageNum }))}
                  className={`w-8 h-8 rounded-lg text-xs font-medium ${
                    pageNum === pagination.page
                      ? "bg-orange-500 text-white"
                      : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <RiArrowRightSLine className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
