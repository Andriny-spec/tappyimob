"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiSearchLine,
  RiFilter3Line,
  RiLoader4Line,
  RiAddLine,
  RiRefreshLine,
  RiUploadCloud2Line,
  RiMapPinLine,
  RiPhoneLine,
  RiEyeLine,
  RiEditLine,
  RiUser3Line,
  RiHome4Line,
  RiFileList3Line,
  RiFlag2Line,
  RiTimeLine,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiCheckLine,
  RiCloseLine,
  RiImageLine,
  RiRadarLine,
  RiDatabase2Line,
  RiDeleteBinLine,
  RiBuilding4Line,
} from "react-icons/ri";
import Link from "next/link";

// ==================== INTERFACES ====================
interface CondoOption {
  id: string;
  name: string;
  condoType: string;
  neighborhood: string | null;
  city: string | null;
}

interface RadarItem {
  id: string;
  titulo: string | null;
  descricao: string | null;
  condominio: string | null;
  condominiumId: string | null;
  condoType: string | null;
  torre: string | null;
  apartamento: string | null;
  origem: string;
  origemUrl: string | null;
  address: string | null;
  number: string | null;
  neighborhood: string | null;
  city: string | null;
  reference: string | null;
  images: string[];
  tipoImovel: string | null;
  precoEstimado: number | null;
  areaEstimada: number | null;
  status: string;
  priority: string;
  createdById: string;
  createdByName: string | null;
  assignedToId: string | null;
  assignedToName: string | null;
  contactAttempts: number;
  createdAt: string;
}

interface IptuItem {
  id: string;
  condominio: string | null;
  inscricaoImobiliaria: string | null;
  contribuinte: string | null;
  compromissario: string | null;
  coproprietario: string | null;
  loteamento: string | null;
  address: string;
  number: string | null;
  apto: string | null;
  andar: string | null;
  complement: string | null;
  neighborhood: string;
  quadra: string | null;
  lote: string | null;
  matricula: string | null;
  cpfCnpj: string | null;
  enderecoEntrega: string | null;
  numeroEntrega: string | null;
  city: string;
  state: string | null;
  zipCode: string | null;
  areaTerreno: number | null;
  areaConstruida: number | null;
  tipoImovel: string | null;
  phones: string[];
  matchStatus: string;
  captacaoStatus: string;
  propertyId: string | null;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
};

const statusColors: Record<string, { bg: string; text: string }> = {
  PENDENTE: { bg: "bg-amber-100 dark:bg-amber-500/20", text: "text-amber-700 dark:text-amber-400" },
  EM_CAPTACAO: { bg: "bg-blue-100 dark:bg-blue-500/20", text: "text-blue-700 dark:text-blue-400" },
  CAPTADO: { bg: "bg-green-100 dark:bg-green-500/20", text: "text-green-700 dark:text-green-400" },
  VENDIDO: { bg: "bg-purple-100 dark:bg-purple-500/20", text: "text-purple-700 dark:text-purple-400" },
  DESCARTADO: { bg: "bg-neutral-100 dark:bg-neutral-500/20", text: "text-neutral-700 dark:text-neutral-400" },
  DISPONIVEL: { bg: "bg-emerald-100 dark:bg-emerald-500/20", text: "text-emerald-700 dark:text-emerald-400" },
  VINCULADO: { bg: "bg-purple-100 dark:bg-purple-500/20", text: "text-purple-700 dark:text-purple-400" },
  SEM_MATCH: { bg: "bg-orange-100 dark:bg-orange-500/20", text: "text-orange-700 dark:text-orange-400" },
};

const statusLabels: Record<string, string> = {
  PENDENTE: "Pendente",
  EM_CAPTACAO: "Em captação",
  CAPTADO: "Captado",
  VENDIDO: "Vendido",
  DESCARTADO: "Descartado",
};

const tipologiaLabels: Record<string, string> = {
  Casa: "🏠 Casa",
  Apartamento: "🏢 Apto",
  Terreno: "📐 Terreno",
  Comercial: "🏪 Comercial",
};

const priorityColors: Record<string, { bg: string; text: string }> = {
  BAIXA: { bg: "bg-neutral-100", text: "text-neutral-600" },
  NORMAL: { bg: "bg-blue-100", text: "text-blue-600" },
  ALTA: { bg: "bg-orange-100", text: "text-orange-600" },
  URGENTE: { bg: "bg-red-100", text: "text-red-600" },
};

const origemLabels: Record<string, string> = {
  PLACA: "📍 Placa",
  ANUNCIO: "📰 Anúncio",
  INDICACAO: "👥 Indicação",
  OUTRO: "📌 Outro",
};

// ==================== COMPONENTE PRINCIPAL ====================
export default function CaptacaoPage() {
  const [activeTab, setActiveTab] = useState<"radar" | "iptu">("radar");
  const [radarItems, setRadarItems] = useState<RadarItem[]>([]);
  const [iptuItems, setIptuItems] = useState<IptuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [radarStats, setRadarStats] = useState<any>(null);
  const [iptuStats, setIptuStats] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tipologiaFilter, setTipologiaFilter] = useState("");
  const [bairroFilter, setBairroFilter] = useState("");
  const [origemFilter, setOrigemFilter] = useState("");
  const [condominiumFilter, setCondominiumFilter] = useState("");
  const [condominiumIdFilter, setCondominiumIdFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // IPTU: ordenação (Excel-like) + filtros multi-seleção
  const [iptuSort, setIptuSort] = useState<{ by: string; dir: "asc" | "desc" }>({ by: "createdAt", dir: "desc" });
  // Filtros tipo Excel por coluna: { campo: [valores] }
  const [iptuColFilters, setIptuColFilters] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (activeTab === "radar") {
      fetchRadar();
    } else {
      fetchIptu();
    }
  }, [activeTab, search, statusFilter, tipologiaFilter, bairroFilter, origemFilter, condominiumIdFilter, page, iptuSort, iptuColFilters]);

  const fetchRadar = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (tipologiaFilter) params.set("tipoImovel", tipologiaFilter);
      if (bairroFilter) params.set("neighborhood", bairroFilter);
      if (origemFilter) params.set("origem", origemFilter);
      if (condominiumIdFilter) params.set("condominiumId", condominiumIdFilter);

      const res = await fetch(`/api/admin/captacao/radar?${params}`);
      if (res.ok) {
        const data = await res.json();
        setRadarItems(data.items || []);
        setRadarStats(data.stats);
        setTotalPages(data.pages || 1);
      }
    } catch (error) {
      console.error("Erro ao buscar radar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchIptu = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "50" });
      if (search) params.set("search", search);
      if (statusFilter) params.set("captacaoStatus", statusFilter);
      params.set("sortBy", iptuSort.by);
      params.set("sortDir", iptuSort.dir);
      for (const [field, vals] of Object.entries(iptuColFilters)) {
        if (vals && vals.length) params.set(`cf_${field}`, vals.join("|"));
      }

      const res = await fetch(`/api/admin/captacao/iptu?${params}`);
      if (res.ok) {
        const data = await res.json();
        setIptuItems(data.items || []);
        setIptuStats(data.stats);
        setTotalPages(data.pages || 1);
      }
    } catch (error) {
      console.error("Erro ao buscar IPTU:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            <RiArrowLeftLine className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
              <RiFlag2Line className="w-7 h-7 text-orange-500" />
              Captação
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Imóveis no radar e base IPTU para captação
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "radar" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
            >
              <RiAddLine className="w-4 h-4" />
              Novo Radar
            </button>
          )}
          {activeTab === "iptu" && (
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
            >
              <RiUploadCloud2Line className="w-4 h-4" />
              Importar Dados
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-700">
        <button
          onClick={() => { setActiveTab("radar"); setPage(1); setStatusFilter(""); }}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            activeTab === "radar"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-neutral-500 hover:text-neutral-700"
          }`}
        >
          <RiRadarLine className="w-5 h-5" />
          Radar de Captação
          {radarStats && (
            <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-500/20 text-orange-600 rounded-full text-xs">
              {radarStats.total}
            </span>
          )}
        </button>
        <button
          onClick={() => { setActiveTab("iptu"); setPage(1); setStatusFilter(""); }}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            activeTab === "iptu"
              ? "border-purple-500 text-purple-600"
              : "border-transparent text-neutral-500 hover:text-neutral-700"
          }`}
        >
          <RiDatabase2Line className="w-5 h-5" />
          Base IPTU
          {iptuStats && (
            <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-500/20 text-purple-600 rounded-full text-xs">
              {iptuStats.total}
            </span>
          )}
        </button>
      </div>

      {/* Status Tabs no topo - Radar */}
      {activeTab === "radar" && radarStats && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => { setStatusFilter(""); setPage(1); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all font-medium text-sm ${
              statusFilter === ""
                ? "border-neutral-900 dark:border-white bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400"
            }`}
          >
            Todos
            <span className="px-1.5 py-0.5 rounded-md bg-white/20 dark:bg-neutral-900/20 text-xs">{radarStats.total}</span>
          </button>
          {[
            { value: "EM_CAPTACAO", label: "Em captação", count: radarStats.emCaptacao, active: "border-blue-500 bg-blue-500 text-white", hover: "hover:border-blue-300" },
            { value: "CAPTADO", label: "Captado", count: radarStats.captado, active: "border-green-500 bg-green-500 text-white", hover: "hover:border-green-300" },
            { value: "VENDIDO", label: "Vendido", count: radarStats.vendido || 0, active: "border-purple-500 bg-purple-500 text-white", hover: "hover:border-purple-300" },
            { value: "PENDENTE", label: "Pendente", count: radarStats.pendente, active: "border-amber-500 bg-amber-500 text-white", hover: "hover:border-amber-300" },
            { value: "DESCARTADO", label: "Descartado", count: radarStats.descartado, active: "border-neutral-500 bg-neutral-500 text-white", hover: "hover:border-neutral-400" },
          ].map((s) => (
            <button
              key={s.value}
              onClick={() => { setStatusFilter(statusFilter === s.value ? "" : s.value); setPage(1); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all font-medium text-sm ${
                statusFilter === s.value
                  ? s.active
                  : `border-neutral-200 dark:border-neutral-700 ${s.hover} ${statusColors[s.value]?.text}`
              }`}
            >
              {s.label}
              <span className={`px-1.5 py-0.5 rounded-md text-xs ${
                statusFilter === s.value ? "bg-white/20" : `${statusColors[s.value]?.bg}`
              }`}>{s.count}</span>
            </button>
          ))}
        </div>
      )}

      {activeTab === "iptu" && iptuStats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{iptuStats.total}</p>
            <p className="text-xs text-neutral-500">Total</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30">
            <p className="text-2xl font-bold text-purple-600">{iptuStats.vinculados}</p>
            <p className="text-xs text-purple-600">Vinculados</p>
          </div>
          <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30">
            <p className="text-2xl font-bold text-orange-600">{iptuStats.semMatch}</p>
            <p className="text-xs text-orange-600">Sem Match</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30">
            <p className="text-2xl font-bold text-emerald-600">{iptuStats.disponiveis}</p>
            <p className="text-xs text-emerald-600">Disponíveis</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30">
            <p className="text-2xl font-bold text-blue-600">{iptuStats.enriquecidos}</p>
            <p className="text-xs text-blue-600">Com Telefone</p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder={activeTab === "radar" ? "Buscar por endereço, bairro, condomínio..." : "Buscar por endereço, contribuinte, inscrição..."}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {activeTab === "iptu" && (
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
            >
              <option value="">Todos os status</option>
              <option value="DISPONIVEL">Disponíveis</option>
              <option value="EM_CONTATO">Em Contato</option>
              <option value="CAPTADO">Captados</option>
              <option value="DESCARTADO">Descartados</option>
            </select>
          )}

          {activeTab === "radar" && (
            <>
              <select
                value={tipologiaFilter}
                onChange={(e) => { setTipologiaFilter(e.target.value); setPage(1); }}
                className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
              >
                <option value="">Tipologia</option>
                <option value="Casa">🏠 Casa</option>
                <option value="Apartamento">🏢 Apto</option>
                <option value="Terreno">📐 Terreno</option>
                <option value="Comercial">🏪 Comercial</option>
              </select>
              <select
                value={origemFilter}
                onChange={(e) => { setOrigemFilter(e.target.value); setPage(1); }}
                className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
              >
                <option value="">Origem</option>
                <option value="PLACA">📍 Placa</option>
                <option value="ANUNCIO">📰 Anúncio</option>
                <option value="INDICACAO">👥 Indicação</option>
                <option value="OUTRO">📌 Outro</option>
              </select>
              <input
                type="text"
                placeholder="Bairro..."
                value={bairroFilter}
                onChange={(e) => { setBairroFilter(e.target.value); setPage(1); }}
                className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white sm:max-w-[160px]"
              />
            </>
          )}

          <button
            onClick={() => activeTab === "radar" ? fetchRadar() : fetchIptu()}
            className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            <RiRefreshLine className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <RiLoader4Line className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : activeTab === "radar" ? (
        <RadarList items={radarItems} onRefresh={fetchRadar} />
      ) : (
        <IptuList
          items={iptuItems}
          onRefresh={fetchIptu}
          sort={iptuSort}
          onSort={(by) => setIptuSort((prev) => ({ by, dir: prev.by === by && prev.dir === "asc" ? "desc" : "asc" }))}
          colFilters={iptuColFilters}
          onColFilter={(field, vals) => { setIptuColFilters((prev) => ({ ...prev, [field]: vals })); setPage(1); }}
          onClearFilters={() => { setIptuColFilters({}); setPage(1); }}
        />
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 disabled:opacity-50"
          >
            <RiArrowLeftLine className="w-5 h-5" />
          </button>
          <span className="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 disabled:opacity-50"
          >
            <RiArrowRightLine className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Modal Criar Radar */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateRadarModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => { setShowCreateModal(false); fetchRadar(); }}
          />
        )}
      </AnimatePresence>

      {/* Modal Importar Dados */}
      <AnimatePresence>
        {showImportModal && (
          <ImportDataModal
            onClose={() => setShowImportModal(false)}
            onSuccess={() => { setShowImportModal(false); fetchIptu(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ==================== LISTA RADAR ====================
function RadarList({ items, onRefresh }: { items: RadarItem[]; onRefresh: () => void }) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (itemId: string, newStatus: string) => {
    setUpdatingId(itemId);
    try {
      const res = await fetch(`/api/admin/captacao/radar/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, assignToMe: true }),
      });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-12 text-center">
        <RiRadarLine className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
          Nenhum imóvel no radar
        </h3>
        <p className="text-sm text-neutral-500">
          Clique em &quot;Novo Radar&quot; para adicionar um imóvel para captação
        </p>
      </div>
    );
  }

  const statusButtons = [
    { value: "EM_CAPTACAO", label: "Em captação", color: "blue" },
    { value: "CAPTADO", label: "Captado", color: "green" },
    { value: "VENDIDO", label: "Vendido", color: "purple" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden hover:shadow-lg transition-shadow"
        >
          {/* Status buttons no topo */}
          <div className="px-3 pt-3 pb-2 flex items-center gap-1.5 border-b border-neutral-100 dark:border-neutral-700/50">
            {statusButtons.map((sb) => {
              const isActive = item.status === sb.value;
              const isUpdating = updatingId === item.id;
              return (
                <button
                  key={sb.value}
                  disabled={isUpdating}
                  onClick={() => {
                    if (isActive) {
                      handleStatusChange(item.id, "PENDENTE");
                    } else {
                      handleStatusChange(item.id, sb.value);
                    }
                  }}
                  className={`flex-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all border ${
                    isActive
                      ? sb.color === "blue"
                        ? "bg-blue-500 text-white border-blue-500"
                        : sb.color === "green"
                        ? "bg-green-500 text-white border-green-500"
                        : "bg-purple-500 text-white border-purple-500"
                      : "border-neutral-200 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-500"
                  } ${isUpdating ? "opacity-50 cursor-wait" : ""}`}
                >
                  {sb.label}
                </button>
              );
            })}
          </div>

          {/* Corretor vinculado */}
          {item.assignedToName && (
            <div className="px-3 py-1.5 bg-blue-50 dark:bg-blue-500/5 border-b border-blue-100 dark:border-blue-500/20 flex items-center gap-1.5">
              <RiUser3Line className="w-3 h-3 text-blue-500" />
              <span className="text-[11px] text-blue-600 dark:text-blue-400">
                Corretor: <span className="font-semibold">{item.assignedToName}</span>
              </span>
            </div>
          )}

          {/* PENDENTE badge se nenhum status selecionado */}
          {item.status === "PENDENTE" && !item.assignedToName && (
            <div className="px-3 py-1.5 bg-amber-50 dark:bg-amber-500/5 border-b border-amber-100 dark:border-amber-500/20 flex items-center gap-1.5">
              <RiTimeLine className="w-3 h-3 text-amber-500" />
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                Pendente — clique acima para iniciar captação
              </span>
            </div>
          )}

          {/* Imagem */}
          <div className="h-36 bg-neutral-100 dark:bg-neutral-700 relative">
            {item.images.length > 0 ? (
              <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <RiImageLine className="w-10 h-10 text-neutral-300" />
              </div>
            )}
            {/* Badges */}
            <div className="absolute top-2 left-2 flex gap-1">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[item.priority]?.bg} ${priorityColors[item.priority]?.text}`}>
                {item.priority}
              </span>
            </div>
            <div className="absolute top-2 right-2">
              <span className="px-2 py-0.5 bg-black/50 text-white rounded text-xs">
                {origemLabels[item.origem] || item.origem}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="p-3">
            {/* Condomínio */}
            {item.condominio && (
              <p className="text-xs font-semibold text-[#0B2545] dark:text-blue-400 uppercase tracking-wide mb-0.5">
                {item.condominio}
              </p>
            )}

            <h3 className="font-semibold text-neutral-900 dark:text-white truncate text-sm">
              {item.titulo || "Imóvel sem título"}
            </h3>

            {/* Valor */}
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {item.precoEstimado ? formatCurrency(item.precoEstimado) : "Valor não informado"}
            </p>
            
            {(item.address || item.neighborhood) && (
              <p className="text-xs text-neutral-500 flex items-center gap-1 mt-1">
                <RiMapPinLine className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">
                  {[item.address, item.number, item.neighborhood].filter(Boolean).join(", ")}
                </span>
              </p>
            )}

            {/* Tipologia + Torre/Apto */}
            {(item.tipoImovel || item.torre) && (
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                {item.tipoImovel && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">
                    {tipologiaLabels[item.tipoImovel] || item.tipoImovel}
                  </span>
                )}
                {item.torre && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    Torre {item.torre}
                  </span>
                )}
                {item.apartamento && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    Apto {item.apartamento}
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-neutral-100 dark:border-neutral-700">
              <div className="text-[11px] text-neutral-400">
                Por: {item.createdByName || "Desconhecido"}
              </div>
              <div className="flex items-center gap-1">
                {item.contactAttempts > 0 && (
                  <span className="text-[11px] text-neutral-400 mr-1">
                    {item.contactAttempts}x
                  </span>
                )}
                <button className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500">
                  <RiEyeLine className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ==================== LISTA IPTU ====================
// Cabeçalho de coluna com ordenação (Excel-like).
// Dropdown de filtro por coluna (Excel autofilter): busca + checklist de valores
// distintos carregados sob demanda da API (distinctCol).
function ColumnFilter({ field, label, selected, onChange, colFilters }: { field: string; label: string; selected: string[]; onChange: (v: string[]) => void; colFilters: Record<string, string[]> }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [opts, setOpts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<string[]>(selected);

  // Filtros das OUTRAS colunas (cascata estilo Excel) — string estável p/ dependência.
  const otherFiltersKey = Object.entries(colFilters)
    .filter(([k, v]) => k !== field && v && v.length)
    .map(([k, v]) => `${k}=${[...v].sort().join("|")}`)
    .sort()
    .join("&");

  useEffect(() => {
    if (!open) return;
    setDraft(selected);
    setLoading(true);
    const t = setTimeout(() => {
      const params = new URLSearchParams({ distinctCol: field, q });
      for (const [k, v] of Object.entries(colFilters)) {
        if (k !== field && v && v.length) params.set(`cf_${k}`, v.join("|"));
      }
      fetch(`/api/admin/captacao/iptu?${params.toString()}`)
        .then((r) => (r.ok ? r.json() : { values: [] }))
        .then((d) => setOpts((d.values || []).map((v: any) => String(v))))
        .catch(() => setOpts([]))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, q, field, otherFiltersKey]);

  const toggle = (v: string) => setDraft((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]));
  const active = selected.length > 0;

  return (
    <span className="relative inline-flex">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        title={`Filtrar ${label}`}
        className={`p-0.5 rounded relative ${active ? "text-[#0B2545] dark:text-sky-400" : "text-neutral-400 hover:text-neutral-700"}`}
      >
        <RiFilter3Line className="w-3.5 h-3.5" />
        {active && <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-[#0B2545] rounded-full" />}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute z-30 top-6 left-0 w-60 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl p-2 font-normal normal-case text-neutral-700 dark:text-neutral-200">
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`Filtrar ${label}...`}
              className="w-full mb-2 px-2 py-1.5 text-xs rounded border border-neutral-200 dark:border-neutral-700 bg-transparent"
            />
            <div className="max-h-56 overflow-auto">
              {loading ? (
                <p className="text-xs text-neutral-400 p-2 flex items-center gap-1"><RiLoader4Line className="w-3 h-3 animate-spin" /> Carregando…</p>
              ) : opts.length === 0 ? (
                <p className="text-xs text-neutral-400 p-2">Nenhum valor</p>
              ) : (
                opts.map((o) => (
                  <label key={o} className="flex items-center gap-2 px-1 py-1 text-xs cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded">
                    <input type="checkbox" checked={draft.includes(o)} onChange={() => toggle(o)} className="rounded" />
                    <span className="truncate">{o}</span>
                  </label>
                ))
              )}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-700">
              <button onClick={() => { onChange([]); setOpen(false); }} className="text-xs text-red-500 hover:underline">Limpar</button>
              <button onClick={() => { onChange(draft); setOpen(false); }} className="text-xs px-3 py-1 rounded-lg bg-[#0B2545] text-white font-medium">Aplicar{draft.length ? ` (${draft.length})` : ""}</button>
            </div>
          </div>
        </>
      )}
    </span>
  );
}

// Cabeçalho de coluna: título ordenável (clique) + ícone de filtro.
function HeaderCell({ col, sort, onSort, colFilters, onColFilter }: { col: { key: string; label: string }; sort: { by: string; dir: "asc" | "desc" }; onSort: (c: string) => void; colFilters: Record<string, string[]>; onColFilter: (field: string, vals: string[]) => void }) {
  const active = sort.by === col.key;
  return (
    <th className="px-3 py-3 text-left font-medium text-neutral-500 whitespace-nowrap">
      <div className="flex items-center gap-1">
        <button onClick={() => onSort(col.key)} className="inline-flex items-center gap-1 hover:text-neutral-800 dark:hover:text-neutral-200">
          {col.label}
          <span className="text-[10px] opacity-70">{active ? (sort.dir === "asc" ? "▲" : "▼") : "↕"}</span>
        </button>
        <ColumnFilter field={col.key} label={col.label} selected={colFilters[col.key] || []} onChange={(v) => onColFilter(col.key, v)} colFilters={colFilters} />
      </div>
    </th>
  );
}

// Colunas da tabela — fiéis às colunas do documento de IPTU (mesma ordem/nome).
const IPTU_TABLE_COLS: { key: string; label: string; num?: boolean }[] = [
  { key: "condominio", label: "Condomínio" },
  { key: "inscricaoImobiliaria", label: "Inscrição Cadastral" },
  { key: "contribuinte", label: "Nome do Proprietário" },
  { key: "compromissario", label: "Nome do Compromissário" },
  { key: "loteamento", label: "Nome Loteamento" },
  { key: "address", label: "Nome Logradouro" },
  { key: "number", label: "Número" },
  { key: "apto", label: "Apto" },
  { key: "complement", label: "Complemento" },
  { key: "neighborhood", label: "Nome do Bairro" },
  { key: "quadra", label: "Quadra Loteamento" },
  { key: "lote", label: "Lote Loteamento" },
  { key: "areaTerreno", label: "Área Terreno", num: true },
  { key: "areaConstruida", label: "Área Construída", num: true },
  { key: "coproprietario", label: "Nome co-proprietário" },
  { key: "matricula", label: "Matrícula" },
  { key: "cpfCnpj", label: "CNPJ/CPF" },
  { key: "enderecoEntrega", label: "Endereço de entrega" },
  { key: "numeroEntrega", label: "Nº de Entrega" },
];

interface IptuListProps {
  items: IptuItem[];
  onRefresh: () => void;
  sort: { by: string; dir: "asc" | "desc" };
  onSort: (col: string) => void;
  colFilters: Record<string, string[]>;
  onColFilter: (field: string, vals: string[]) => void;
  onClearFilters: () => void;
}

function IptuList({ items, onRefresh, sort, onSort, colFilters, onColFilter, onClearFilters }: IptuListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteMode, setDeleteMode] = useState<"selected" | "all">("selected");
  const [editItem, setEditItem] = useState<IptuItem | null>(null);
  const activeFilterFields = Object.entries(colFilters).filter(([, v]) => v && v.length).map(([k]) => k);
  const anyFilter = activeFilterFields.length > 0;

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map(i => i.id)));
    }
  };

  const handleBatchDelete = async () => {
    setIsDeleting(true);
    try {
      const body = deleteMode === "all"
        ? { deleteAll: true }
        : { ids: Array.from(selectedIds) };

      const res = await fetch("/api/admin/captacao/iptu", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        alert(`${data.deleted} registro(s) excluído(s) com sucesso.`);
        setSelectedIds(new Set());
        onRefresh();
      } else {
        alert("Erro ao excluir registros.");
      }
    } catch (e) {
      console.error("Erro ao excluir IPTU:", e);
      alert("Erro ao excluir registros.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Resumo dos filtros ativos (cada coluna tem seu próprio filtro no cabeçalho) */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
        <RiFilter3Line className="w-3.5 h-3.5" />
        {anyFilter ? (
          <>
            <span>Filtros ativos:</span>
            {activeFilterFields.map((f) => {
              const col = IPTU_TABLE_COLS.find((c) => c.key === f);
              return (
                <span key={f} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0B2545]/10 text-[#0B2545] dark:text-sky-400">
                  {col?.label || f} ({colFilters[f].length})
                  <button onClick={() => onColFilter(f, [])} className="hover:text-red-500">×</button>
                </span>
              );
            })}
            <button onClick={onClearFilters} className="text-red-500 hover:underline ml-1">Limpar tudo</button>
          </>
        ) : (
          <span>Clique no ícone de filtro de cada coluna para filtrar (igual Excel). Clique no título para ordenar.</span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-12 text-center">
          <RiDatabase2Line className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
            {anyFilter ? "Nenhum registro com esses filtros" : "Base IPTU vazia"}
          </h3>
          <p className="text-sm text-neutral-500">
            {anyFilter ? "Ajuste ou limpe os filtros." : "Importe a base do IPTU para começar a captar"}
          </p>
        </div>
      ) : (
    <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      {/* Barra de ações em lote */}
      {selectedIds.size > 0 && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-500/10 border-b border-red-200 dark:border-red-500/20 flex items-center justify-between">
          <span className="text-sm text-red-700 dark:text-red-400 font-medium">
            {selectedIds.size} registro(s) selecionado(s)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setDeleteMode("selected"); setShowDeleteConfirm(true); }}
              className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <RiDeleteBinLine className="w-3.5 h-3.5" />
              Excluir selecionados
            </button>
            <button
              onClick={() => { setDeleteMode("all"); setShowDeleteConfirm(true); }}
              className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <RiDeleteBinLine className="w-3.5 h-3.5" />
              Excluir TODA a base
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1.5 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg text-xs font-medium transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Modal de confirmação */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-red-600 mb-2">Confirmar exclusão</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              {deleteMode === "all"
                ? "Tem certeza que deseja excluir TODOS os registros da base IPTU? Esta ação não pode ser desfeita."
                : `Tem certeza que deseja excluir ${selectedIds.size} registro(s)? Esta ação não pode ser desfeita.`}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleBatchDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiDeleteBinLine className="w-4 h-4" />}
                {isDeleting ? "Excluindo..." : "Confirmar exclusão"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-900">
            <tr>
              <th className="px-3 py-3 text-center w-10">
                <input
                  type="checkbox"
                  checked={selectedIds.size === items.length && items.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-neutral-300 text-red-500 focus:ring-red-500"
                />
              </th>
              {IPTU_TABLE_COLS.map((c) => (
                <HeaderCell key={c.key} col={c} sort={sort} onSort={onSort} colFilters={colFilters} onColFilter={onColFilter} />
              ))}
              <th className="px-3 py-3 text-center font-medium text-neutral-500">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
            {items.map((item) => (
              <tr key={item.id} className={`hover:bg-neutral-50 dark:hover:bg-neutral-700/50 ${selectedIds.has(item.id) ? "bg-red-50/50 dark:bg-red-500/5" : ""}`}>
                <td className="px-3 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    className="w-4 h-4 rounded border-neutral-300 text-red-500 focus:ring-red-500"
                  />
                </td>
                {IPTU_TABLE_COLS.map((c) => {
                  const v = (item as any)[c.key];
                  const display = v === null || v === undefined || v === "" ? "-" : c.num ? `${v}${c.key.startsWith("area") ? " m²" : ""}` : String(v);
                  return (
                    <td key={c.key} className="px-3 py-3 text-neutral-700 dark:text-neutral-300 whitespace-nowrap">{display}</td>
                  );
                })}
                <td className="px-3 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    {item.propertyId && (
                      <Link
                        href={`/admin/imoveis/${item.propertyId}`}
                        className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-600 text-blue-500"
                        title="Ver imóvel"
                      >
                        <RiHome4Line className="w-4 h-4" />
                      </Link>
                    )}
                    <button onClick={() => setEditItem(item)} title="Editar dados" className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-600 text-neutral-500">
                      <RiEditLine className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
      )}

      {editItem && (
        <EditIptuModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onSaved={() => { setEditItem(null); onRefresh(); }}
        />
      )}
    </div>
  );
}

// ==================== MODAL EDITAR IPTU ====================
function EditIptuModal({ item, onClose, onSaved }: { item: IptuItem; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<Record<string, any>>({ ...item });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const val = (k: string) => (form[k] ?? "") as string;

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const data: Record<string, any> = {};
      [...IPTU_FIELDS].forEach((f) => { data[f.key] = form[f.key] ?? null; });
      const res = await fetch("/api/admin/captacao/iptu", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, data }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Erro ao salvar"); return; }
      onSaved();
    } catch {
      setError("Falha de conexão.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl w-full max-w-3xl max-h-[88vh] overflow-hidden flex flex-col">
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <RiEditLine className="w-5 h-5 text-purple-500" /> Editar registro IPTU
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">{item.address}, {item.number || "S/N"} — {item.neighborhood}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500">
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
          {IPTU_FIELDS.map((f) => (
            <div key={f.key} className={f.key === "address" ? "sm:col-span-2" : ""}>
              <label className="block text-xs font-medium text-neutral-500 mb-1">{f.label}</label>
              <input
                value={val(f.key)}
                onChange={(e) => set(f.key, e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#0B2545] outline-none"
              />
            </div>
          ))}
        </div>

        {error && <p className="px-5 text-sm text-red-500">{error}</p>}

        <div className="p-5 border-t border-neutral-200 dark:border-neutral-700 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-700 text-sm font-medium">Cancelar</button>
          <button onClick={save} disabled={saving} className="px-4 py-2 rounded-lg bg-[#0B2545] text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-60">
            {saving ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiCheckLine className="w-4 h-4" />}
            Salvar alterações
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ==================== MODAL CRIAR RADAR ====================
function CreateRadarModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    condominio: "",
    condominiumId: "",
    condoType: "",
    torre: "",
    apartamento: "",
    origem: "PLACA",
    origemUrl: "",
    address: "",
    number: "",
    neighborhood: "",
    city: "Santana de Parnaíba",
    reference: "",
    tipoImovel: "",
    precoEstimado: "",
    priority: "NORMAL",
    images: [] as string[],
  });

  // Busca de condomínios
  const [condoSearch, setCondoSearch] = useState("");
  const [condoOptions, setCondoOptions] = useState<CondoOption[]>([]);
  const [showCondoDropdown, setShowCondoDropdown] = useState(false);
  const [isSearchingCondo, setIsSearchingCondo] = useState(false);

  useEffect(() => {
    if (condoSearch.length < 2) {
      setCondoOptions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingCondo(true);
      try {
        const res = await fetch(`/api/condominiums?search=${encodeURIComponent(condoSearch)}`);
        if (res.ok) {
          const data = await res.json();
          setCondoOptions((data.condominiums || []).map((c: any) => ({
            id: c.id,
            name: c.name,
            condoType: c.condoType,
            neighborhood: c.neighborhood,
            city: c.city,
          })));
          setShowCondoDropdown(true);
        }
      } catch (err) {
        console.error("Erro ao buscar condomínios:", err);
      } finally {
        setIsSearchingCondo(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [condoSearch]);

  const selectCondo = (condo: CondoOption) => {
    setFormData(prev => ({
      ...prev,
      condominio: condo.name,
      condominiumId: condo.id,
      condoType: condo.condoType,
      neighborhood: condo.neighborhood || prev.neighborhood,
      city: condo.city || prev.city,
      // Limpar campos condicionais ao trocar
      torre: "",
      apartamento: "",
    }));
    setCondoSearch(condo.name);
    setShowCondoDropdown(false);
  };

  const clearCondo = () => {
    setFormData(prev => ({
      ...prev,
      condominio: "",
      condominiumId: "",
      condoType: "",
      torre: "",
      apartamento: "",
    }));
    setCondoSearch("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/captacao/radar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          precoEstimado: formData.precoEstimado ? parseFloat(formData.precoEstimado) : null,
          images: formData.images,
        }),
      });

      if (res.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error("Erro ao criar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
          <h3 className="font-semibold text-lg text-neutral-900 dark:text-white flex items-center gap-2">
            <RiRadarLine className="w-5 h-5 text-orange-500" />
            Novo Imóvel no Radar
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700">
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto max-h-[70vh] space-y-4">
          {/* 1. Condomínio (busca autocomplete) */}
          <div className="relative">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              <RiBuilding4Line className="inline w-4 h-4 mr-1" />
              Condomínio
            </label>
            {formData.condominiumId ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-blue-300 dark:border-blue-500/50 bg-blue-50 dark:bg-blue-500/10">
                <RiBuilding4Line className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-400 truncate">{formData.condominio}</p>
                  <p className="text-xs text-blue-500">
                    {formData.condoType === "VERTICAL" ? "Vertical (Apartamentos)" : formData.condoType === "HORIZONTAL" ? "Horizontal (Casas/Terrenos)" : "Misto"}
                  </p>
                </div>
                <button type="button" onClick={clearCondo} className="p-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-500">
                  <RiCloseLine className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  value={condoSearch}
                  onChange={(e) => setCondoSearch(e.target.value)}
                  onFocus={() => condoOptions.length > 0 && setShowCondoDropdown(true)}
                  placeholder="Buscar condomínio cadastrado..."
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 pr-8"
                />
                {isSearchingCondo && (
                  <RiLoader4Line className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-neutral-400" />
                )}
                {showCondoDropdown && condoOptions.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {condoOptions.map((condo) => (
                      <button
                        key={condo.id}
                        type="button"
                        onClick={() => selectCondo(condo)}
                        className="w-full text-left px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors first:rounded-t-xl last:rounded-b-xl"
                      >
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">{condo.name}</p>
                        <p className="text-xs text-neutral-500">
                          {condo.condoType === "VERTICAL" ? "Vertical" : condo.condoType === "HORIZONTAL" ? "Horizontal" : "Misto"}
                          {condo.neighborhood ? ` • ${condo.neighborhood}` : ""}
                          {condo.city ? ` - ${condo.city}` : ""}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tipologia */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Tipologia
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: "Casa", icon: "🏠" },
                { value: "Apartamento", icon: "🏢" },
                { value: "Terreno", icon: "📐" },
                { value: "Comercial", icon: "🏪" },
              ].map((tipo) => (
                <button
                  key={tipo.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, tipoImovel: tipo.value })}
                  className={`p-2 rounded-xl border-2 text-center text-sm transition-all ${
                    formData.tipoImovel === tipo.value
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 font-medium"
                      : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  <span className="text-lg block mb-0.5">{tipo.icon}</span>
                  {tipo.value}
                </button>
              ))}
            </div>
          </div>

          {/* Campos condicionais: Vertical → torre/apto */}
          {formData.condoType === "VERTICAL" && (
            <div className="grid grid-cols-2 gap-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30">
              <div>
                <label className="block text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">Torre</label>
                <input
                  type="text"
                  value={formData.torre}
                  onChange={(e) => setFormData({ ...formData, torre: e.target.value })}
                  placeholder="Ex: A, B, 1..."
                  className="w-full px-3 py-2 rounded-xl border border-blue-200 dark:border-blue-500/30 bg-white dark:bg-neutral-900 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">Apartamento</label>
                <input
                  type="text"
                  value={formData.apartamento}
                  onChange={(e) => setFormData({ ...formData, apartamento: e.target.value })}
                  placeholder="Ex: 101, 202..."
                  className="w-full px-3 py-2 rounded-xl border border-blue-200 dark:border-blue-500/30 bg-white dark:bg-neutral-900 text-sm"
                />
              </div>
            </div>
          )}

          {/* 2. Valor + Título */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Valor Estimado (R$)
              </label>
              <input
                type="text"
                value={formData.precoEstimado}
                onChange={(e) => setFormData({ ...formData, precoEstimado: e.target.value.replace(/[^\d.,]/g, "") })}
                placeholder="Ex: 1500000"
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Título / Identificação
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ex: Casa com placa na Av. Principal"
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
              />
            </div>
          </div>

          {/* 3. Prioridade + Origem */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Prioridade
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
              >
                <option value="BAIXA">Baixa</option>
                <option value="NORMAL">Normal</option>
                <option value="ALTA">Alta</option>
                <option value="URGENTE">🔥 Urgente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Origem da informação
              </label>
              <select
                value={formData.origem}
                onChange={(e) => setFormData({ ...formData, origem: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
              >
                <option value="PLACA">📍 Placa na rua</option>
                <option value="ANUNCIO">📰 Anúncio online</option>
                <option value="INDICACAO">👥 Indicação</option>
                <option value="OUTRO">📌 Outro</option>
              </select>
            </div>
          </div>

          {/* 4. Endereço / Nº - só exibe se NÃO for condomínio VERTICAL */}
          {formData.condoType !== "VERTICAL" && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Rua, Avenida..."
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Nº
                  </label>
                  <input
                    type="text"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    placeholder="123"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Bairro
                  </label>
                  <input
                    type="text"
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    placeholder="Bairro"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                  />
                </div>
              </div>
            </>
          )}

          {/* 5. Link */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Link (anúncio, referência, etc.)
            </label>
            <input
              type="url"
              value={formData.origemUrl}
              onChange={(e) => setFormData({ ...formData, origemUrl: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
            />
          </div>

          {/* 6. Anexar Foto */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Anexar Foto
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-500/5 transition-colors">
                <RiImageLine className="w-5 h-5 text-neutral-400" />
                <span className="text-sm text-neutral-500">
                  {formData.images.length > 0 ? `${formData.images.length} foto(s) anexada(s)` : "Clique para selecionar"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      const base64 = reader.result as string;
                      setFormData(prev => ({ ...prev, images: [...prev.images, base64] }));
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
            </div>
            {formData.images.length > 0 && (
              <div className="flex gap-2 mt-2 overflow-x-auto">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                      className="absolute top-0 right-0 p-0.5 bg-red-500 text-white rounded-bl-lg"
                    >
                      <RiCloseLine className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>


          {/* 8. Observações */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Observações
            </label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Informações adicionais sobre o imóvel..."
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 resize-none"
            />
          </div>
        </form>

        <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiCheckLine className="w-4 h-4" />}
            Salvar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ==================== MODAL IMPORTAR DADOS ====================
const IPTU_FIELDS = [
  { key: "condominio", label: "Condomínio" },
  { key: "inscricaoImobiliaria", label: "Inscrição Cadastral" },
  { key: "contribuinte", label: "Nome do Proprietário" },
  { key: "compromissario", label: "Nome do Compromissário" },
  { key: "loteamento", label: "Nome Loteamento" },
  { key: "address", label: "Nome Logradouro" },
  { key: "number", label: "Número" },
  { key: "apto", label: "Apto" },
  { key: "andar", label: "Andar" },
  { key: "complement", label: "Complemento" },
  { key: "neighborhood", label: "Nome do Bairro" },
  { key: "quadra", label: "Quadra Loteamento" },
  { key: "lote", label: "Lote Loteamento" },
  { key: "coproprietario", label: "Nome co-proprietário" },
  { key: "matricula", label: "Matrícula" },
  { key: "cpfCnpj", label: "CNPJ/CPF" },
  { key: "enderecoEntrega", label: "Endereço de entrega" },
  { key: "numeroEntrega", label: "Nº de Entrega" },
  { key: "areaTerreno", label: "Área Terreno" },
  { key: "areaConstruida", label: "Área Construída" },
  // extras opcionais (não obrigatórios na planilha)
  { key: "zipCode", label: "CEP" },
  { key: "tipoImovel", label: "Tipo do Imóvel" },
  { key: "usoImovel", label: "Uso do Imóvel" },
  { key: "anoConstricao", label: "Ano de Construção" },
] as const;

function autoDetectField(header: string): string {
  const h = header.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  // Matrícula (ANTES de inscrição — campos distintos)
  if (h.includes("matricula") || h === "matr" || h === "matr.") return "matricula";
  // Inscrição cadastral / imobiliária
  if (h.includes("inscricao") || h.includes("inscri") || (h.includes("cadastr") && (h.includes("imobili") || h.includes("cadastral"))) || h.includes("sql")) return "inscricaoImobiliaria";
  // Condomínio
  if (h.includes("condominio") || h === "cond" || h === "cond.") return "condominio";
  // Co-proprietário (ANTES de proprietário)
  if (h.includes("co-prop") || h.includes("coprop") || h.includes("co prop")) return "coproprietario";
  // Compromissário
  if (h.includes("compromissar") || h.includes("compromiss")) return "compromissario";
  // Proprietário / Contribuinte
  if (h.includes("contribuinte") || h.includes("proprietario") || h.includes("nome do prop") || h.includes("nome prop") || h.includes("titular")) return "contribuinte";
  // CPF/CNPJ
  if (h.includes("cpf") || h.includes("cnpj") || h.includes("documento") || h.includes("doc.")) return "cpfCnpj";
  // Loteamento (nome)
  if (h === "nome loteamento" || h === "loteamento" || (h.includes("loteamento") && !h.includes("quadra") && !h.startsWith("lote"))) return "loteamento";
  // Quadra
  if (h.includes("quadra") || h === "qd" || h === "qd.") return "quadra";
  // Lote (do loteamento)
  if (h === "lote loteamento" || h === "lote" || h === "lt" || h === "lt." || (h.includes("lote") && h.includes("loteamento"))) return "lote";
  // Área do terreno (antes de área genérica)
  if ((h.includes("area") || h.includes("metr") || h.includes("m2") || h.includes("m²")) && h.includes("terreno")) return "areaTerreno";
  // Área construída (antes de área genérica)
  if ((h.includes("area") || h.includes("metr") || h.includes("m2") || h.includes("m²")) && (h.includes("constru") || h.includes("edific") || h.includes("predio"))) return "areaConstruida";
  // Endereço/Nº de entrega (ANTES de logradouro/número genéricos)
  if (h.includes("entrega") && (h.includes("endereco") || h.includes("logr") || h.includes("rua"))) return "enderecoEntrega";
  // Qualquer outro header com "entrega" (ex.: "Nº de Entrega", "No Entrega") = número de entrega
  if (h.includes("entrega")) return "numeroEntrega";
  // Logradouro / Endereço
  if (h.includes("logradouro") || h.includes("logr.") || h.includes("endereco") || h === "address" || h === "rua" || h === "via") return "address";
  // Apto
  if (h === "apto" || h === "apt" || h === "apartamento" || h.includes("apto") || h.includes("apartament")) return "apto";
  // Andar / pavimento
  if (h === "andar" || h.includes("andar") || h === "pavimento" || h.includes("pavto")) return "andar";
  // Número (excluindo inscrição/entrega)
  if ((h.includes("numero") || h === "n" || h === "num" || h === "num." || h === "nro" || h === "nro." || h === "no" || h === "number" || h === "n.") && !h.includes("inscri") && !h.includes("cadastro") && !h.includes("entrega")) return "number";
  // Complemento
  if (h.includes("complement") || h.includes("compl") || h.includes("bloco") || h.includes("unidade")) return "complement";
  // Bairro
  if (h.includes("bairro") || h === "neighborhood" || h.includes("setor") || h.includes("distrito") || h.includes("regiao")) return "neighborhood";
  // CEP
  if (h.includes("cep") || h.includes("zip") || h.includes("codigo postal") || h.includes("cod. postal")) return "zipCode";
  // Tipo de imóvel
  if ((h.includes("tipo") && (h.includes("imov") || h.includes("edif") || h.includes("constru") || h.includes("predial"))) || h === "tipo" || h === "categoria") return "tipoImovel";
  // Uso do imóvel
  if ((h.includes("uso") && (h.includes("imov") || h.includes("solo"))) || h === "uso" || h.includes("finalidade") || h.includes("destinacao")) return "usoImovel";
  // Ano de construção
  if (h.includes("ano") && (h.includes("constru") || h.includes("edific") || h.includes("obra"))) return "anoConstricao";
  if (h === "ano") return "anoConstricao";
  // Área genérica (fallback)
  if (h === "area" || h === "area total" || h === "area (m2)") return "areaTerreno";

  return ""; // não mapeado
}

function ImportDataModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1=upload, 2=mapping, 3=processing
  const [selectedCity, setSelectedCity] = useState("Santana de Parnaíba");
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, created: 0, updated: 0, matched: 0 });
  const [error, setError] = useState("");

  // Parsed data
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<number, string>>({});

  const cities = [
    { value: "Santana de Parnaíba", label: "Santana de Parnaíba", status: "ativo" },
    { value: "Barueri", label: "Barueri", status: "em breve" },
    { value: "Sua Cidade", label: "Sua Cidade", status: "em breve" },
    { value: "Carapicuíba", label: "Carapicuíba", status: "em breve" },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".csv") && !selectedFile.name.endsWith(".xlsx") && !selectedFile.name.endsWith(".xls")) {
        setError("Formato inválido. Use arquivos CSV ou Excel (.xlsx, .xls)");
        return;
      }
      setFile(selectedFile);
      setError("");
    }
  };

  const parseFileToRaw = async (f: File): Promise<{ headers: string[]; rows: string[][] }> => {
    const isExcel = f.name.endsWith(".xlsx") || f.name.endsWith(".xls");

    if (isExcel) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const allRows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
            if (allRows.length < 2) { resolve({ headers: [], rows: [] }); return; }
            const headers = allRows[0].map((h: any) => String(h).trim());
            const rows = allRows.slice(1).filter((r) => r.some((v: any) => String(v).trim()));
            resolve({ headers, rows: rows.map((r) => r.map((v: any) => String(v))) });
          } catch (err) { reject(err); }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(f);
      });
    } else {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          const lines = text.split("\n").filter((l) => l.trim());
          if (lines.length < 2) { resolve({ headers: [], rows: [] }); return; }
          const firstLine = lines[0];
          const sep = firstLine.includes(";") ? ";" : firstLine.includes("\t") ? "\t" : ",";
          const headers = firstLine.split(sep).map((h) => h.trim());
          const rows = lines.slice(1).map((l) => l.split(sep).map((v) => v.trim()));
          resolve({ headers, rows });
        };
        reader.onerror = reject;
        reader.readAsText(f, "utf-8");
      });
    }
  };

  const handleAdvance = async () => {
    if (!file) { setError("Selecione um arquivo para importar"); return; }
    setIsParsing(true);
    setError("");
    try {
      const { headers, rows } = await parseFileToRaw(file);
      if (rows.length === 0) { setError("Nenhum registro encontrado no arquivo"); setIsParsing(false); return; }
      setRawHeaders(headers);
      setRawRows(rows);
      // Auto-detect mapping
      const mapping: Record<number, string> = {};
      headers.forEach((h, i) => { mapping[i] = autoDetectField(h); });
      setColumnMapping(mapping);
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Erro ao ler arquivo");
    } finally {
      setIsParsing(false);
    }
  };

  const mappedCount = Object.values(columnMapping).filter((v) => v).length;
  const unmappedCount = rawHeaders.length - mappedCount;

  const buildItems = (): any[] => {
    return rawRows
      .map((row) => {
        const item: any = {};
        rawHeaders.forEach((_, colIdx) => {
          const field = columnMapping[colIdx];
          const value = (row[colIdx] || "").trim();
          if (!field || !value) return;
          if (field === "areaTerreno" || field === "areaConstruida") {
            item[field] = parseFloat(value.replace(",", ".")) || null;
          } else if (field === "anoConstricao") {
            item[field] = parseInt(value) || null;
          } else {
            item[field] = value;
          }
        });
        item.city = selectedCity;
        item.state = "SP";
        return item;
      })
      .filter((item) => item.inscricaoImobiliaria || item.address);
  };

  const handleImport = async () => {
    setIsProcessing(true);
    setError("");
    setStep(3);

    try {
      const items = buildItems();
      if (items.length === 0) { setError("Nenhum registro válido após mapeamento"); setIsProcessing(false); setStep(2); return; }

      setProgress({ current: 0, total: items.length, created: 0, updated: 0, matched: 0 });

      const batchSize = 500;
      let totalCreated = 0, totalUpdated = 0, totalMatched = 0, failedBatches = 0;

      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        try {
          const res = await fetch("/api/admin/captacao/iptu", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: batch }),
          });
          if (!res.ok) { failedBatches++; }
          else {
            const data = await res.json();
            totalCreated += data.created || 0;
            totalUpdated += data.updated || 0;
            totalMatched += data.matched || 0;
          }
        } catch {
          // lote falhou (rede/timeout) — continua os demais em vez de abortar tudo
          failedBatches++;
        }
        setProgress({ current: Math.min(i + batchSize, items.length), total: items.length, created: totalCreated, updated: totalUpdated, matched: totalMatched });
      }

      if (failedBatches > 0) {
        setError(`Importação concluída com ${failedBatches} lote(s) com falha. ${totalCreated} criados, ${totalUpdated} atualizados. Você pode reimportar para completar os que faltaram.`);
        setIsProcessing(false);
        return;
      }
      setTimeout(() => { onSuccess(); }, 1500);
    } catch (err: any) {
      setError(err.message || "Erro ao importar dados");
      setIsProcessing(false);
    }
  };

  // Preview rows (first 5)
  const previewRows = rawRows.slice(0, 5);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`bg-white dark:bg-neutral-800 rounded-2xl shadow-xl w-full overflow-hidden ${step === 2 ? "max-w-4xl" : "max-w-lg"}`}
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <RiUploadCloud2Line className="w-6 h-6 text-purple-500" />
              Importar Dados IPTU
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              {step === 1 && "Etapa 1/3 — Selecione cidade e arquivo"}
              {step === 2 && "Etapa 2/3 — Mapeie as colunas do arquivo"}
              {step === 3 && "Etapa 3/3 — Processando importação"}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 disabled:opacity-50"
          >
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicators */}
        <div className="px-6 pt-4 flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${s <= step ? "bg-purple-500" : "bg-neutral-200 dark:bg-neutral-700"}`} />
          ))}
        </div>

        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
          {/* ===== STEP 1: Upload ===== */}
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Cidade</label>
                <div className="grid grid-cols-2 gap-2">
                  {cities.map((city) => (
                    <button
                      key={city.value}
                      type="button"
                      disabled={city.status === "em breve"}
                      onClick={() => setSelectedCity(city.value)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        selectedCity === city.value
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-500/10"
                          : city.status === "em breve"
                          ? "border-neutral-200 dark:border-neutral-700 opacity-50 cursor-not-allowed"
                          : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                      }`}
                    >
                      <p className="font-medium text-sm">{city.label}</p>
                      <p className={`text-xs ${city.status === "ativo" ? "text-green-600" : "text-neutral-400"}`}>
                        {city.status === "ativo" ? "✓ Disponível" : "Em breve"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Arquivo de Dados</label>
                <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                  file ? "border-purple-300 bg-purple-50 dark:bg-purple-500/10" : "border-neutral-300 dark:border-neutral-600 hover:border-purple-300"
                }`}>
                  {file ? (
                    <div>
                      <RiFileList3Line className="w-10 h-10 text-purple-500 mx-auto mb-2" />
                      <p className="font-medium text-neutral-900 dark:text-white">{file.name}</p>
                      <p className="text-sm text-neutral-500">{(file.size / 1024).toFixed(1)} KB</p>
                      <button onClick={() => setFile(null)} className="mt-2 text-sm text-red-500 hover:underline">Remover arquivo</button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <RiUploadCloud2Line className="w-10 h-10 text-neutral-400 mx-auto mb-2" />
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Clique para selecionar ou arraste o arquivo</p>
                      <p className="text-xs text-neutral-400 mt-1">CSV, Excel (.xlsx, .xls)</p>
                      <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-700/50 text-sm text-neutral-600 dark:text-neutral-400">
                <p className="font-medium mb-1">Formato esperado:</p>
                <p>O arquivo deve conter colunas como: inscrição imobiliária, contribuinte, endereço, número, bairro, área do terreno, área construída, etc. Na próxima etapa você poderá revisar e ajustar o mapeamento.</p>
              </div>
            </>
          )}

          {/* ===== STEP 2: Mapping ===== */}
          {step === 2 && (
            <>
              {/* Stats */}
              <div className="flex items-center gap-4 text-sm">
                <span className="px-3 py-1 rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-medium">
                  {rawRows.length} registros
                </span>
                <span className="px-3 py-1 rounded-lg bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 font-medium">
                  {mappedCount} colunas mapeadas
                </span>
                {unmappedCount > 0 && (
                  <span className="px-3 py-1 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-medium">
                    {unmappedCount} sem mapeamento
                  </span>
                )}
              </div>

              {/* Column mapping */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Mapeamento de Colunas</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {rawHeaders.map((header, idx) => (
                    <div key={idx} className={`flex items-center gap-2 p-2.5 rounded-lg border transition-colors ${
                      columnMapping[idx] ? "border-green-200 dark:border-green-500/30 bg-green-50/50 dark:bg-green-500/5" : "border-neutral-200 dark:border-neutral-700"
                    }`}>
                      <span className="text-xs font-mono text-neutral-500 min-w-[20px]">{idx + 1}</span>
                      <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate flex-1" title={header}>{header}</span>
                      <select
                        value={columnMapping[idx] || ""}
                        onChange={(e) => setColumnMapping({ ...columnMapping, [idx]: e.target.value })}
                        className={`text-xs px-2 py-1.5 rounded-lg border bg-white dark:bg-neutral-900 min-w-[160px] ${
                          columnMapping[idx]
                            ? "border-green-300 dark:border-green-500/40 text-green-700 dark:text-green-400"
                            : "border-neutral-200 dark:border-neutral-700 text-neutral-500"
                        }`}
                      >
                        <option value="">— Ignorar —</option>
                        {IPTU_FIELDS.map((f) => (
                          <option key={f.key} value={f.key}>{f.label}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data preview */}
              {previewRows.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Preview (primeiros {previewRows.length} registros)</label>
                  <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
                    <table className="text-xs w-full">
                      <thead>
                        <tr className="bg-neutral-100 dark:bg-neutral-700/50">
                          {rawHeaders.map((h, i) => (
                            <th key={i} className="px-3 py-2 text-left font-medium text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                              <div>{h}</div>
                              {columnMapping[i] && (
                                <div className="text-[10px] text-green-600 dark:text-green-400 font-normal mt-0.5">
                                  → {IPTU_FIELDS.find((f) => f.key === columnMapping[i])?.label}
                                </div>
                              )}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((row, ri) => (
                          <tr key={ri} className="border-t border-neutral-100 dark:border-neutral-700/50">
                            {rawHeaders.map((_, ci) => (
                              <td key={ci} className={`px-3 py-1.5 whitespace-nowrap max-w-[200px] truncate ${
                                columnMapping[ci] ? "text-neutral-800 dark:text-neutral-200" : "text-neutral-400"
                              }`}>
                                {row[ci] || "—"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ===== STEP 3: Processing ===== */}
          {step === 3 && (
            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-700 dark:text-purple-400">Processando...</span>
                <span className="text-sm text-purple-600">{progress.current} / {progress.total}</span>
              </div>
              <div className="h-2 bg-purple-200 dark:bg-purple-500/30 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }} />
              </div>
              <div className="flex gap-4 mt-3 text-xs">
                <span className="text-green-600">✓ {progress.created} criados</span>
                <span className="text-blue-600">↻ {progress.updated} atualizados</span>
                <span className="text-purple-600">🔗 {progress.matched} vinculados</span>
              </div>
            </div>
          )}

          {/* Erro */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 text-sm">{error}</div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 flex justify-between gap-3">
          <div>
            {step === 2 && (
              <button onClick={() => setStep(1)} className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-sm">
                <RiArrowLeftLine className="w-4 h-4 inline mr-1" />Voltar
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50 text-sm"
            >
              {isProcessing ? "Processando..." : "Cancelar"}
            </button>

            {step === 1 && (
              <button
                onClick={handleAdvance}
                disabled={!file || isParsing}
                className="px-6 py-2 rounded-xl bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50 flex items-center gap-2 text-sm"
              >
                {isParsing ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiArrowRightLine className="w-4 h-4" />}
                Avançar
              </button>
            )}

            {step === 2 && (
              <button
                onClick={handleImport}
                disabled={mappedCount === 0}
                className="px-6 py-2 rounded-xl bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50 flex items-center gap-2 text-sm"
              >
                <RiUploadCloud2Line className="w-4 h-4" />
                Importar {rawRows.length} registros
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
