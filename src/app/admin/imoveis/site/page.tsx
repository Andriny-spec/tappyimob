"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  RiHome4Line,
  RiUserLine,
  RiPhoneLine,
  RiMailLine,
  RiWhatsappLine,
  RiTimeLine,
  RiEyeLine,
  RiLoader4Line,
  RiSearchLine,
  RiFilterLine,
  RiExternalLinkLine,
  RiImageLine,
} from "react-icons/ri";

interface SiteLead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  source: string;
  status: string;
  tags: string[];
  createdAt: string;
  corretor?: { id: string; name: string } | null;
  notes?: { id: string; content: string; pinned: boolean }[];
}

export default function ImoveisSitePage() {
  const [leads, setLeads] = useState<SiteLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState<"all" | "AVALIACAO_IMOVEL" | "VENDA_IMOVEL">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/leads?limit=9999&tags=AVALIACAO_IMOVEL&tags=VENDA_IMOVEL");
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (error) {
      console.error("Erro ao carregar imóveis do site:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const filtered = leads.filter((lead) => {
    if (filterTag !== "all" && !lead.tags.includes(filterTag)) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        lead.name.toLowerCase().includes(s) ||
        lead.email?.toLowerCase().includes(s) ||
        lead.phone?.includes(s) ||
        lead.message?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const getTagLabel = (tags: string[]) => {
    if (tags.includes("AVALIACAO_IMOVEL")) return { label: "Avaliação", color: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400" };
    if (tags.includes("VENDA_IMOVEL")) return { label: "Venda", color: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" };
    return { label: "Site", color: "bg-neutral-100 text-neutral-700" };
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      NOVO: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
      EM_ATENDIMENTO: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
      QUALIFICADO: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
      ARQUIVADO: "bg-neutral-100 text-neutral-500",
      PERDIDO: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
    };
    return colors[status] || "bg-neutral-100 text-neutral-700";
  };

  const extractPhotos = (lead: SiteLead): string[] => {
    const urls: string[] = [];
    (lead.notes || []).forEach((note) => {
      const matches = note.content.match(/https?:\/\/[^\s]+/g);
      if (matches) urls.push(...matches);
    });
    return urls;
  };

  const parseMessageDetails = (message: string | null) => {
    if (!message) return {};
    const details: Record<string, string> = {};
    message.split("\n").forEach((line) => {
      const [key, ...rest] = line.split(": ");
      if (rest.length > 0) {
        details[key.trim()] = rest.join(": ").trim();
      }
    });
    return details;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Imóveis do Site</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Leads recebidos via formulário de venda/avaliação do site
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded-lg font-medium">
            {leads.filter((l) => l.tags.includes("AVALIACAO_IMOVEL")).length} avaliações
          </span>
          <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg font-medium">
            {leads.filter((l) => l.tags.includes("VENDA_IMOVEL")).length} vendas
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, email, telefone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20"
          />
        </div>
        <div className="flex items-center bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-1">
          {([
            { value: "all", label: "Todos" },
            { value: "AVALIACAO_IMOVEL", label: "Avaliação" },
            { value: "VENDA_IMOVEL", label: "Venda" },
          ] as const).map((f) => (
            <button
              key={f.value}
              onClick={() => setFilterTag(f.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                filterTag === f.value
                  ? "bg-[#0B2545] text-white"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RiLoader4Line className="w-8 h-8 animate-spin text-neutral-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-neutral-400">
          <RiHome4Line className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Nenhum imóvel encontrado</p>
          <p className="text-sm mt-1">Leads de venda/avaliação aparecerão aqui</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((lead) => {
            const tag = getTagLabel(lead.tags);
            const photos = extractPhotos(lead);
            const details = parseMessageDetails(lead.message);
            const isExpanded = expandedId === lead.id;

            return (
              <div
                key={lead.id}
                className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
              >
                {/* Main row */}
                <div
                  className="p-4 flex items-center gap-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : lead.id)}
                >
                  <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <RiUserLine className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-900 dark:text-white truncate">{lead.name}</span>
                      <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-medium ${tag.color}`}>
                        {tag.label}
                      </span>
                      <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-medium ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                      {photos.length > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                          <RiImageLine className="w-3 h-3" />
                          {photos.length}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                      {details["Tipo"] && <span>{details["Tipo"]}</span>}
                      {details["Bairro"] && <span>• {details["Bairro"]}</span>}
                      {details["Cidade"] && <span>• {details["Cidade"]}</span>}
                      {details["Valor pretendido"] && <span>• {details["Valor pretendido"]}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {lead.phone && (
                      <a
                        href={`https://wa.me/55${lead.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                      >
                        <RiWhatsappLine className="w-4 h-4" />
                      </a>
                    )}
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                      <RiEyeLine className="w-4 h-4" />
                    </Link>
                    <span className="text-[10px] text-neutral-400 whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                    </span>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-neutral-100 dark:border-neutral-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      {/* Contact info */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-neutral-400 uppercase">Contato</p>
                        {lead.phone && (
                          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                            <RiPhoneLine className="w-4 h-4" />
                            <span>{lead.phone}</span>
                          </div>
                        )}
                        {lead.email && (
                          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                            <RiMailLine className="w-4 h-4" />
                            <span>{lead.email}</span>
                          </div>
                        )}
                        {lead.corretor && (
                          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                            <RiUserLine className="w-4 h-4" />
                            <span>Corretor: {lead.corretor.name}</span>
                          </div>
                        )}
                      </div>

                      {/* Property details */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-neutral-400 uppercase">Detalhes do Imóvel</p>
                        {lead.message && (
                          <pre className="text-xs text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap font-sans leading-relaxed bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg">
                            {lead.message}
                          </pre>
                        )}
                      </div>
                    </div>

                    {/* Photos */}
                    {photos.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-neutral-400 uppercase mb-2">Fotos Enviadas</p>
                        <div className="flex flex-wrap gap-2">
                          {photos.map((url, i) => (
                            <a
                              key={i}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-20 h-20 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 hover:opacity-80 transition-opacity"
                            >
                              <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
