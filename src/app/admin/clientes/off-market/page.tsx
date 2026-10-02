"use client";

import { useState, useEffect } from "react";
import { RiEyeOffLine, RiSearchLine, RiPhoneLine, RiMailLine, RiWhatsappLine, RiUserLine, RiCalendarLine, RiLoader4Line } from "react-icons/ri";
import { LeadDetailModal } from "@/components/admin/kanban/modals/LeadDetailModal";

interface OffMarketLead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  createdAt: string;
  status: string;
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OffMarketLeadsPage() {
  const [leads, setLeads] = useState<OffMarketLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [loadingLead, setLoadingLead] = useState<string | null>(null);
  const limit = 20;

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ tags: "OFF_MARKET", search, page: String(page), limit: String(limit) });
    fetch(`/api/admin/leads?${params}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        setLeads(d?.leads || []);
        setTotal(d?.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search, page]);

  const openLead = async (id: string) => {
    setLoadingLead(id);
    try {
      const res = await fetch(`/api/admin/leads/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedLead(data.lead || data);
      }
    } catch {}
    setLoadingLead(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <RiEyeOffLine className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Leads Off Market</h1>
          </div>
          <p className="text-sm text-neutral-500">Cadastros do formulário Off Market no site</p>
        </div>
        <span className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {total} cadastros
        </span>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Buscar por nome, email ou telefone..."
          className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <RiEyeOffLine className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mb-3" />
          <p className="text-neutral-500 font-medium">Nenhum cadastro Off Market</p>
          <p className="text-neutral-400 text-sm mt-1">Quando alguém preencher o formulário no site, aparecerá aqui</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-700/50 border-b border-neutral-200 dark:border-neutral-700">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase">Nome</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase">Contato</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase">Interesse / Perfil</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase">Entrada</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center flex-shrink-0">
                        <RiUserLine className="w-4 h-4 text-neutral-500" />
                      </div>
                      <span className="font-medium text-neutral-900 dark:text-white">{lead.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      {lead.email && (
                        <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600">
                          <RiMailLine className="w-3 h-3" />
                          {lead.email}
                        </a>
                      )}
                      {lead.phone && (
                        <a
                          href={`https://wa.me/55${lead.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-green-500 hover:text-green-600"
                        >
                          <RiWhatsappLine className="w-3 h-3" />
                          {lead.phone}
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-xs line-clamp-2">{lead.message || "-"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-xs text-neutral-500 whitespace-nowrap">
                      <RiCalendarLine className="w-3 h-3 shrink-0" />
                      {formatDateTime(lead.createdAt)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 rounded-full">
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openLead(lead.id)}
                      disabled={loadingLead === lead.id}
                      className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 font-medium disabled:opacity-50"
                    >
                      {loadingLead === lead.id ? (
                        <RiLoader4Line className="w-3 h-3 animate-spin" />
                      ) : null}
                      Ver ficha →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-neutral-500">
            {(page - 1) * limit + 1}–{Math.min(page * limit, total)} de {total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * limit >= total}
              className="px-3 py-1.5 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        </div>
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={(updated) => setSelectedLead(updated)}
          isAdmin={true}
          onOpenBudget={() => {}}
          onOpenContract={() => {}}
          onOpenAIAnalysis={() => {}}
        />
      )}
    </div>
  );
}
