"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  RiAddLine, RiSearchLine, RiFilter3Line, RiLayoutGridLine,
  RiFileList3Line, RiArrowRightLine, RiLoader4Line, RiAlertLine,
  RiCloseLine, RiCheckLine, RiTimeLine, RiMoneyDollarCircleLine,
  RiDeleteBin6Line, RiArchiveLine, RiMore2Fill, RiArrowUpDownLine,
} from "react-icons/ri";

// Ordem das colunas conforme fluxo solicitado
const FASES_LABELS: Record<string, string> = {
  DADOS_RECEBIDOS: "Dados recebidos",
  EXTRACAO_IA: "Extração IA",
  PENDENTE_DOC: "Pendente Documentação",
  VALIDACAO_INTERNA: "Validação Interna",
  MINUTA_GERADA: "Minuta Gerada",
  REVISAO_JURIDICA: "Revisão Jurídica",
  VALIDACAO_PARTES: "Revisão das Partes",
  PRONTO_ASSINATURA: "Assinatura",
};

const FASES_COLORS: Record<string, string> = {
  DADOS_RECEBIDOS: "bg-blue-100 text-blue-700",
  EXTRACAO_IA: "bg-purple-100 text-purple-700",
  PENDENTE_DOC: "bg-red-100 text-red-700",
  VALIDACAO_INTERNA: "bg-yellow-100 text-yellow-700",
  MINUTA_GERADA: "bg-teal-100 text-teal-700",
  REVISAO_JURIDICA: "bg-orange-100 text-orange-700",
  VALIDACAO_PARTES: "bg-indigo-100 text-indigo-700",
  PRONTO_ASSINATURA: "bg-green-100 text-green-700",
};

const FASES_KANBAN = Object.keys(FASES_LABELS);

// Cor da borda do card por tipo de negócio
const TIPO_CARD: Record<string, { borda: string; chip: string; label: string }> = {
  VENDA: { borda: "border-l-4 border-l-green-500", chip: "bg-green-100 text-green-700", label: "Venda" },
  LOCACAO: { borda: "border-l-4 border-l-orange-500", chip: "bg-orange-100 text-orange-700", label: "Locação" },
};

function formatCurrency(v?: number | null) {
  if (!v) return "—";
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `R$ ${(v / 1_000).toFixed(0)}k`;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function formatCurrencyFull(v?: number | null) {
  if (!v) return "R$ 0";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

interface Negocio {
  id: string;
  codigo: string;
  fase: string;
  tipoOperacao: string;
  tipoNegocio?: string;
  imovelCondominio?: string;
  imovelEndereco?: string;
  valorTotal?: number;
  comissaoValor?: number;
  corretor: { id: string; name: string };
  pendencias: { id: string; bloqueante: boolean }[];
  _count: { partes: number; documentos: number };
  createdAt: string;
}

type SortKey = "recentes" | "antigos" | "valor_desc" | "valor_asc" | "corretor";

export default function NegociosPage() {
  const router = useRouter();
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [metricas, setMetricas] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"kanban" | "lista">("kanban");
  const [filtroFase, setFiltroFase] = useState("");
  const [filtroCorretor, setFiltroCorretor] = useState("");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("recentes");
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverFase, setDragOverFase] = useState<string | null>(null);

  // Move um negócio para outra fase (drag-and-drop manual)
  const moverParaFase = async (negocioId: string, novaFase: string) => {
    const atual = negocios.find((n) => n.id === negocioId);
    if (!atual || atual.fase === novaFase) return;
    // Atualização otimista
    setNegocios((prev) => prev.map((n) => n.id === negocioId ? { ...n, fase: novaFase } : n));
    try {
      const res = await fetch(`/api/admin/negocio/${negocioId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fase: novaFase }),
      });
      if (!res.ok) {
        // Reverte em caso de erro
        setNegocios((prev) => prev.map((n) => n.id === negocioId ? { ...n, fase: atual.fase } : n));
      }
    } catch {
      setNegocios((prev) => prev.map((n) => n.id === negocioId ? { ...n, fase: atual.fase } : n));
    }
  };

  const fetchNegocios = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "200" });
      if (filtroFase) params.set("fase", filtroFase);
      if (filtroCorretor) params.set("corretorId", filtroCorretor);
      const res = await fetch(`/api/admin/negocio?${params}`);
      const data = await res.json();
      setNegocios(data.negocios || []);
      setMetricas(data.metricas || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNegocios(); }, [filtroFase, filtroCorretor]);

  const arquivarNegocio = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Arquivar este negócio? Ele sai do painel mas o histórico é mantido.")) return;
    const res = await fetch(`/api/admin/negocio/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ arquivado: true }),
    });
    if (res.ok) setNegocios((prev) => prev.filter((n) => n.id !== id));
  };

  const excluirNegocio = async (id: string, codigo: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Excluir permanentemente o negócio ${codigo}? Esta ação não pode ser desfeita.`)) return;
    const res = await fetch(`/api/admin/negocio/${id}`, { method: "DELETE" });
    if (res.ok) setNegocios((prev) => prev.filter((n) => n.id !== id));
    else alert("Erro ao excluir negócio");
  };

  const filtrados = negocios.filter((n) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      n.codigo.toLowerCase().includes(q) ||
      n.imovelCondominio?.toLowerCase().includes(q) ||
      n.imovelEndereco?.toLowerCase().includes(q) ||
      n.corretor?.name?.toLowerCase().includes(q)
    );
  });

  const ordenados = [...filtrados].sort((a, b) => {
    switch (sortKey) {
      case "antigos": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "valor_desc": return (b.valorTotal || 0) - (a.valorTotal || 0);
      case "valor_asc": return (a.valorTotal || 0) - (b.valorTotal || 0);
      case "corretor": return (a.corretor?.name || "").localeCompare(b.corretor?.name || "", "pt-BR");
      case "recentes":
      default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const negociosPorFase: Record<string, Negocio[]> = {};
  FASES_KANBAN.forEach((f) => { negociosPorFase[f] = ordenados.filter((n) => n.fase === f); });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Negócios</h1>
          <p className="text-sm text-gray-500 mt-0.5">Sistema Jurídico Tappy</p>
        </div>
        <Link href="/admin/negocio/novo"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700">
          <RiAddLine className="w-4 h-4" />
          Novo negócio
        </Link>
      </div>

      {/* Métricas */}
      {metricas && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Negócios ativos", value: metricas.negociosAtivos || 0, sub: "Em andamento", icon: RiFileList3Line, color: "text-blue-600" },
            { label: "VGV em andamento", value: formatCurrency(metricas.vgvEmAndamento), sub: "Valor total", icon: RiMoneyDollarCircleLine, color: "text-green-600" },
            { label: "Comissão total", value: formatCurrency(metricas.comissaoTotal), sub: "Todos os corretores", icon: RiMoneyDollarCircleLine, color: "text-purple-600" },
            { label: "Pendentes", value: filtrados.filter((n) => n.pendencias?.some((p) => p.bloqueante)).length, sub: "Com bloqueante", icon: RiAlertLine, color: "text-orange-600" },
          ].map((m) => (
            <div key={m.label} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-gray-500">{m.label}</p>
                <m.icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <p className="text-xl font-bold text-gray-900">{m.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{m.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Buscar por código, imóvel, corretor..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={filtroFase} onChange={(e) => setFiltroFase(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none bg-white">
          <option value="">Todas as fases</option>
          {Object.entries(FASES_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        {/* Ordenação (principal na visão lista) */}
        <div className="relative">
          <RiArrowUpDownLine className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none bg-white">
            <option value="recentes">Mais recentes</option>
            <option value="antigos">Mais antigos</option>
            <option value="valor_desc">Maior valor</option>
            <option value="valor_asc">Menor valor</option>
            <option value="corretor">Corretor (A–Z)</option>
          </select>
        </div>
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
          <button onClick={() => setViewMode("kanban")}
            className={`px-3 py-2 text-sm transition-colors ${viewMode === "kanban" ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50"}`}>
            <RiLayoutGridLine className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode("lista")}
            className={`px-3 py-2 text-sm border-l border-gray-200 transition-colors ${viewMode === "lista" ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50"}`}>
            <RiFileList3Line className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <RiLoader4Line className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <RiFileList3Line className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Nenhum negócio encontrado</p>
        </div>
      ) : viewMode === "kanban" ? (
        // KANBAN VIEW
        <div className="flex gap-4 overflow-x-auto pb-4">
          {FASES_KANBAN.map((fase) => {
            const cards = negociosPorFase[fase];
            const isDragOver = dragOverFase === fase;
            return (
              <div
                key={fase}
                className="flex-shrink-0 w-64"
                onDragOver={(e) => { e.preventDefault(); setDragOverFase(fase); }}
                onDragLeave={() => setDragOverFase((f) => (f === fase ? null : f))}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData("negocioId") || dragId;
                  if (id) moverParaFase(id, fase);
                  setDragId(null);
                  setDragOverFase(null);
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${FASES_COLORS[fase]}`}>
                    {FASES_LABELS[fase]}
                  </span>
                  <span className="text-xs text-gray-400">{cards.length}</span>
                </div>
                <div className={`space-y-3 rounded-xl transition-colors ${isDragOver ? "bg-blue-50 ring-2 ring-blue-300 ring-dashed p-2" : ""}`}>
                  {cards.map((n) => (
                    <div
                      key={n.id}
                      draggable
                      onDragStart={(e) => { e.dataTransfer.setData("negocioId", n.id); setDragId(n.id); }}
                      onDragEnd={() => { setDragId(null); setDragOverFase(null); }}
                      className={dragId === n.id ? "opacity-40" : ""}
                    >
                      <NegocioCard negocio={n} onClick={() => router.push(`/admin/negocio/${n.id}`)}
                        onArquivar={arquivarNegocio} onExcluir={excluirNegocio} />
                    </div>
                  ))}
                  {cards.length === 0 && (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl h-20 flex items-center justify-center">
                      <p className="text-xs text-gray-300">{isDragOver ? "Solte aqui" : "Vazio"}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // LISTA VIEW
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_90px_120px_120px_100px_70px_70px] gap-4 px-4 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <span>Negócio</span>
            <span>Tipo</span>
            <span>Fase</span>
            <span>VGV</span>
            <span>Corretor</span>
            <span>Pend.</span>
            <span className="text-right">Ações</span>
          </div>
          <div className="divide-y divide-gray-100">
            {ordenados.map((n) => {
              const tipo = TIPO_CARD[n.tipoNegocio || "VENDA"] || TIPO_CARD.VENDA;
              return (
              <div key={n.id} onClick={() => router.push(`/admin/negocio/${n.id}`)}
                className={`grid grid-cols-[1fr_90px_120px_120px_100px_70px_70px] gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer items-center ${tipo.borda}`}>
                <div>
                  <p className="text-sm font-medium text-gray-900">{n.codigo}</p>
                  <p className="text-xs text-gray-500 truncate">{n.imovelCondominio || n.imovelEndereco || "Sem endereço"}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium w-fit ${tipo.chip}`}>{tipo.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium w-fit ${FASES_COLORS[n.fase]}`}>
                  {FASES_LABELS[n.fase]}
                </span>
                <span className="text-sm font-medium text-gray-700">{formatCurrency(n.valorTotal)}</span>
                <span className="text-xs text-gray-600 truncate">{n.corretor?.name}</span>
                <div className="flex items-center gap-1">
                  {n.pendencias?.filter((p) => p.bloqueante).length > 0 ? (
                    <span className="flex items-center gap-1 text-xs text-red-600">
                      <RiAlertLine className="w-3 h-3" />
                      {n.pendencias.filter((p) => p.bloqueante).length}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </div>
                <div className="flex items-center justify-end gap-1">
                  <button onClick={(e) => arquivarNegocio(n.id, e)} title="Arquivar"
                    className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                    <RiArchiveLine className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={(e) => excluirNegocio(n.id, n.codigo, e)} title="Excluir"
                    className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600">
                    <RiDeleteBin6Line className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function NegocioCard({ negocio, onClick, onArquivar, onExcluir }: {
  negocio: Negocio; onClick: () => void;
  onArquivar: (id: string, e: React.MouseEvent) => void;
  onExcluir: (id: string, codigo: string, e: React.MouseEvent) => void;
}) {
  const bloqueantes = negocio.pendencias?.filter((p) => p.bloqueante).length || 0;
  const tipo = TIPO_CARD[negocio.tipoNegocio || "VENDA"] || TIPO_CARD.VENDA;
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div onClick={onClick}
      className={`relative bg-white border border-gray-200 rounded-xl p-3 cursor-pointer hover:shadow-md transition-shadow hover:border-blue-200 ${tipo.borda}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-semibold text-gray-700">{negocio.codigo}</p>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${tipo.chip}`}>{tipo.label}</span>
        </div>
        <div className="flex items-center gap-1">
          {bloqueantes > 0 && (
            <span className="flex items-center gap-1 text-xs text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">
              <RiAlertLine className="w-3 h-3" />{bloqueantes}
            </span>
          )}
          <button onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
            className="p-0.5 rounded hover:bg-gray-100 text-gray-400">
            <RiMore2Fill className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
          <div className="absolute right-2 top-8 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-36">
            <button onClick={(e) => { setMenuOpen(false); onArquivar(negocio.id, e); }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
              <RiArchiveLine className="w-3.5 h-3.5" /> Arquivar
            </button>
            <button onClick={(e) => { setMenuOpen(false); onExcluir(negocio.id, negocio.codigo, e); }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50">
              <RiDeleteBin6Line className="w-3.5 h-3.5" /> Excluir
            </button>
          </div>
        </>
      )}
      <p className="text-xs text-gray-500 truncate mb-2">
        {negocio.imovelCondominio || negocio.imovelEndereco || "Sem endereço"}
      </p>
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-gray-900">{formatCurrency(negocio.valorTotal)}</p>
        <p className="text-xs text-gray-400">{negocio.corretor?.name?.split(" ")[0]}</p>
      </div>
    </div>
  );
}
