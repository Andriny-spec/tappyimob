"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  RiAddLine,
  RiSearchLine,
  RiFilterLine,
  RiDeleteBinLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiHandCoinLine,
} from "react-icons/ri";
import { AddProposalModal } from "@/components/admin/kanban/modals/AddProposalModal";

interface ProposalRow {
  id: string;
  clientName: string;
  proposedValue: number;
  status: string;
  createdAt: string;
  purpose?: string | null;
  property: { id: string; code: string; title: string } | null;
  corretor: { id: string; name: string; avatar?: string | null } | null;
}

interface CorretorOption {
  id: string;
  name: string;
}

const STATUS_OPTIONS = [
  { value: "PENDENTE", label: "Pendente" },
  { value: "EM_NEGOCIACAO", label: "Em Andamento" },
  { value: "ACEITA", label: "Aceita" },
  { value: "CONTRA_PROPOSTA", label: "Contraproposta" },
  { value: "RECUSADA", label: "Recusada" },
  { value: "DESISTENCIA", label: "Desistência" },
];

const statusColor = (status: string) => {
  const colors: Record<string, string> = {
    PENDENTE: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
    EM_NEGOCIACAO: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400",
    APROVADA: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
    RECUSADA: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
    ACEITA: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
    CONTRA_PROPOSTA: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
    DESISTENCIA: "bg-neutral-100 text-neutral-700 dark:bg-neutral-500/20 dark:text-neutral-400",
  };
  return colors[status] || colors.PENDENTE;
};

const formatCurrency = (v: number) => (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const formatDate = (d: string) => new Date(d).toLocaleDateString("pt-BR");

interface LeadsProposalsViewProps {
  isAdmin: boolean;
  currentUserId?: string;
}

export function LeadsProposalsView({ isAdmin, currentUserId }: LeadsProposalsViewProps) {
  const [proposals, setProposals] = useState<ProposalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [corretores, setCorretores] = useState<CorretorOption[]>([]);
  const [filters, setFilters] = useState({ status: "", corretorId: "", createdFrom: "", createdTo: "" });
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 0 });
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/admin/corretores")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setCorretores(data.corretores || data || []); })
      .catch(() => {});
  }, []);

  const fetchProposals = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, page: String(pagination.page), limit: String(pagination.limit) });
      if (filters.status) params.set("status", filters.status);
      if (filters.corretorId) params.set("corretorId", filters.corretorId);
      if (filters.createdFrom) params.set("createdFrom", filters.createdFrom);
      if (filters.createdTo) params.set("createdTo", filters.createdTo);
      const res = await fetch(`/api/admin/leads/proposals?${params}`);
      if (res.ok) {
        const data = await res.json();
        setProposals(data.proposals || []);
        setStatusCounts(data.statusCounts || {});
        setPagination((prev) => ({ ...prev, total: data.total || 0, totalPages: data.pages || 0 }));
      }
    } catch (error) {
      console.error("Erro ao carregar propostas:", error);
    } finally {
      setLoading(false);
    }
  }, [search, filters, pagination.page, pagination.limit]);

  useEffect(() => { fetchProposals(); }, [fetchProposals]);

  useEffect(() => { setPagination((prev) => ({ ...prev, page: 1 })); }, [search, filters]);

  const handleUpdateStatus = async (proposal: ProposalRow, newStatus: string) => {
    if (!proposal.property) return;
    try {
      const res = await fetch(`/api/admin/properties/${proposal.property.id}/proposals/${proposal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchProposals();
    } catch (error) {
      console.error("Erro ao atualizar status da proposta:", error);
    }
  };

  const handleDelete = async (proposal: ProposalRow) => {
    if (!proposal.property) return;
    if (!confirm(`Excluir a proposta de "${proposal.clientName}"? Esta ação não pode ser desfeita.`)) return;
    try {
      const res = await fetch(`/api/admin/properties/${proposal.property.id}/proposals/${proposal.id}`, { method: "DELETE" });
      if (res.ok) fetchProposals();
      else alert("Erro ao excluir proposta.");
    } catch (error) {
      console.error("Erro ao excluir proposta:", error);
    }
  };

  const totalValue = proposals.reduce((sum, p) => sum + (p.proposedValue || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 relative min-w-[220px]">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por cliente ou imóvel..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${
              showFilters ? "bg-orange-500 text-white" : "text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700"
            }`}
          >
            <RiFilterLine className="w-4 h-4" />
            Filtros
            {Object.values(filters).some((v) => v) && <span className="w-2 h-2 rounded-full bg-orange-300" />}
          </button>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25"
        >
          <RiAddLine className="w-4 h-4" />
          Nova Proposta
        </button>
      </div>

      {showFilters && (
        <div className="p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm"
              >
                <option value="">Todos</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            {isAdmin && (
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Corretor</label>
                <select
                  value={filters.corretorId}
                  onChange={(e) => setFilters({ ...filters, corretorId: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm"
                >
                  <option value="">Todos</option>
                  {corretores.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Período de</label>
              <input
                type="date"
                value={filters.createdFrom}
                onChange={(e) => setFilters({ ...filters, createdFrom: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Período até</label>
              <input
                type="date"
                value={filters.createdTo}
                onChange={(e) => setFilters({ ...filters, createdTo: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setFilters({ status: "", corretorId: "", createdFrom: "", createdTo: "" })}
              className="text-sm text-orange-500 hover:text-orange-600 font-medium"
            >
              Limpar filtros
            </button>
          </div>
        </div>
      )}

      {/* Resumo do período filtrado */}
      <div className="flex items-center gap-4 flex-wrap text-sm">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg">
          <RiHandCoinLine className="w-4 h-4 text-orange-500" />
          <span className="text-neutral-500">{pagination.total} proposta{pagination.total !== 1 ? "s" : ""}</span>
        </div>
        <div className="px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg">
          <span className="text-neutral-500">Valor total na página: </span>
          <span className="font-semibold text-green-600">{formatCurrency(totalValue)}</span>
        </div>
        {STATUS_OPTIONS.filter((s) => statusCounts[s.value]).map((s) => (
          <span key={s.value} className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(s.value)}`}>
            {s.label}: {statusCounts[s.value]}
          </span>
        ))}
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : proposals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <RiHandCoinLine className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mb-4" />
            <p className="text-neutral-500">Nenhuma proposta encontrada</p>
            <button onClick={() => setShowModal(true)} className="mt-4 text-orange-500 hover:text-orange-600 font-medium text-sm">
              + Cadastrar primeira proposta
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700 text-left text-xs text-neutral-500">
                  <th className="px-4 py-3 font-medium">Imóvel</th>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Corretor</th>
                  <th className="px-4 py-3 font-medium">Valor</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((p) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-neutral-900 dark:text-white">{p.property?.code || "-"}</span>
                      <p className="text-xs text-neutral-500 truncate max-w-[220px]">{p.property?.title}</p>
                    </td>
                    <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">{p.clientName}</td>
                    <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">{p.corretor?.name || "-"}</td>
                    <td className="px-4 py-3 font-semibold text-green-600">{formatCurrency(p.proposedValue)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={p.status}
                        onChange={(e) => handleUpdateStatus(p, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusColor(p.status)}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-neutral-500">{formatDate(p.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(p)}
                          className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <RiDeleteBinLine className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginação */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-neutral-500">
            Página {pagination.page} de {pagination.totalPages} — {pagination.total} propostas
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RiArrowLeftSLine className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RiArrowRightSLine className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <AddProposalModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSaved={fetchProposals}
        isAdmin={isAdmin}
        currentUserId={currentUserId}
      />
    </div>
  );
}
