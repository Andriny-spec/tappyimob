"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import * as XLSX from "xlsx";
import { handleDatePaste } from "@/lib/date-paste";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiUserLine,
  RiBuilding2Line,
  RiBankLine,
  RiPencilRulerLine,
  RiBuilding4Line,
  RiMegaphoneLine,
  RiAddLine,
  RiSearchLine,
  RiFilterLine,
  RiDownloadLine,
  RiPhoneLine,
  RiMailLine,
  RiWhatsappLine,
  RiEyeLine,
  RiEditLine,
  RiDeleteBinLine,
  RiCheckLine,
  RiCloseLine,
  RiTimeLine,
  RiMoneyDollarCircleLine,
  RiFileList3Line,
  RiCalendarLine,
  RiMedalLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiUploadCloud2Line,
  RiFileExcel2Line,
  RiArrowRightLine,
  RiArrowLeftLine,
  RiAlertLine,
  RiLoader4Line,
  RiMapPinLine,
  RiGlobalLine,
} from "react-icons/ri";

// Tipos
type PartnerType = "CORRETOR" | "IMOBILIARIA" | "CORRESPONDENTE_BANCARIO" | "ARQUITETO" | "CONSTRUTORA";

interface Partner {
  id: string;
  type: PartnerType;
  name: string;
  email?: string;
  phone?: string;
  creci?: string;
  creciStatus: string;
  partnershipFormat: string;
  partnershipTermStatus: string;
  isActive: boolean;
  totalVGV: number;
  totalVisits: number;
  totalProposals: number;
  totalContracts: number;
  lastEmailContact?: string;
  lastWhatsappContact?: string;
  tags: string[];
  agency?: {
    id: string;
    companyName: string;
    tradeName?: string;
  };
  _count?: {
    visits: number;
    proposals: number;
    contracts: number;
  };
}

interface Agency {
  id: string;
  companyName: string;
  tradeName?: string;
  cnpj?: string;
  creciJuridico?: string;
  creciStatus: string;
  phone?: string;
  email?: string;
  contactName?: string;
  contactPhone?: string;
  isActive: boolean;
  totalVGV: number;
  _count?: {
    partners: number;
    visits: number;
    proposals: number;
  };
}

interface TabDef {
  id: string;
  label: string;
  icon: typeof RiUserLine;
  type: PartnerType;
  tag?: string;
}

const tabs: TabDef[] = [
  { id: "corretor", label: "Corretores", icon: RiUserLine, type: "CORRETOR" },
  { id: "imobiliaria", label: "Imobiliárias", icon: RiBuilding2Line, type: "IMOBILIARIA" },
  { id: "correspondente", label: "Correspondentes", icon: RiBankLine, type: "CORRESPONDENTE_BANCARIO" },
  { id: "arquiteto", label: "Arquitetos", icon: RiPencilRulerLine, type: "ARQUITETO" },
  { id: "construtora", label: "Construtoras", icon: RiBuilding4Line, type: "CONSTRUTORA" },
  { id: "summit", label: "Parcerias Summit", icon: RiMegaphoneLine, type: "CORRETOR", tag: "PARCERIAS_SUMMIT" },
  { id: "site", label: "Cadastros pelo Site", icon: RiGlobalLine, type: "CORRETOR", tag: "CADASTRO_SITE" },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
  }).format(value);
};

const formatDate = (date: string | null | undefined) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
};

function ParceriasContent() {
  const searchParams = useSearchParams();
  const tipoParam = searchParams.get("tipo") || "corretor";
  
  const [activeTab, setActiveTab] = useState(tipoParam);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editPartnerData, setEditPartnerData] = useState<any>(null);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    creciStatus: "",
    partnershipFormat: "",
    partnershipTermStatus: "",
    isActive: "",
    createdFrom: "",
    createdTo: "",
    agencyId: "",
    minVisits: "",
    minProposals: "",
    minContracts: "",
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [exporting, setExporting] = useState(false);

  const handleDelete = async (id: string, name: string, isAgency = false) => {
    if (!confirm(`Excluir "${name}"? Esta ação não pode ser desfeita.`)) return;
    try {
      const endpoint = isAgency
        ? `/api/admin/real-estate-agencies/${id}`
        : `/api/admin/business-partners/${id}`;
      const res = await fetch(endpoint, { method: "DELETE" });
      if (res.ok) {
        if (isAgency) setAgencies((prev) => prev.filter((a) => a.id !== id));
        else setPartners((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert("Erro ao excluir cadastro.");
      }
    } catch {
      alert("Erro ao excluir cadastro.");
    }
  };

  // Exporta TODOS os contatos (respeitando os filtros ativos), não só a página atual.
  const handleExport = async () => {
    setExporting(true);
    try {
      // Reaproveita os mesmos filtros do carregamento, mas sem paginação (limit alto).
      const ALL = "100000";
      let url: string;
      if (isAgencyTab) {
        const p = new URLSearchParams({ search, page: "1", limit: ALL });
        if (filters.createdFrom) p.set("createdFrom", filters.createdFrom);
        if (filters.createdTo) p.set("createdTo", filters.createdTo);
        url = `/api/admin/real-estate-agencies?${p}`;
      } else {
        const currentTab = tabs.find((t) => t.id === activeTab);
        const type = currentTab?.type || "CORRETOR";
        const p = new URLSearchParams({ search, page: "1", limit: ALL });
        if (currentTab?.tag) p.set("tag", currentTab.tag);
        else p.set("type", type);
        if (filters.creciStatus) p.set("creciStatus", filters.creciStatus);
        if (filters.partnershipFormat) p.set("partnershipFormat", filters.partnershipFormat);
        if (filters.partnershipTermStatus) p.set("partnershipTermStatus", filters.partnershipTermStatus);
        if (filters.isActive) p.set("isActive", filters.isActive);
        if (filters.createdFrom) p.set("createdFrom", filters.createdFrom);
        if (filters.createdTo) p.set("createdTo", filters.createdTo);
        if (filters.agencyId) p.set("agencyId", filters.agencyId);
        if (filters.minVisits) p.set("minVisits", filters.minVisits);
        if (filters.minProposals) p.set("minProposals", filters.minProposals);
        if (filters.minContracts) p.set("minContracts", filters.minContracts);
        url = `/api/admin/business-partners?${p}`;
      }

      const res = await fetch(url);
      if (!res.ok) { alert("Erro ao exportar. Tente novamente."); return; }
      const json = await res.json();
      const allAgencies: Agency[] = json.agencies || [];
      const allPartners: Partner[] = json.partners || [];

      const data = isAgencyTab
        ? allAgencies.map((a) => ({
            Nome: a.tradeName || a.companyName,
            CNPJ: a.cnpj || "",
            "CRECI Jurídico": a.creciJuridico || "",
            "Status CRECI": a.creciStatus,
            Telefone: a.phone || "",
            Email: a.email || "",
            "Contato Principal": a.contactName || "",
            "VGV Total": a.totalVGV,
            Corretores: a._count?.partners || 0,
            Visitas: a._count?.visits || 0,
            Propostas: a._count?.proposals || 0,
          }))
        : allPartners.map((p) => ({
            Nome: p.name,
            CRECI: p.creci || "",
            "Status CRECI": p.creciStatus,
            Telefone: p.phone || "",
            Email: p.email || "",
            Imobiliária: p.agency?.tradeName || p.agency?.companyName || "",
            "Formato Parceria": p.partnershipFormat || "",
            Contrato: p.partnershipTermStatus || "",
            "VGV Total": p.totalVGV,
            Visitas: p.totalVisits || 0,
            Propostas: p.totalProposals || 0,
            Contratos: p.totalContracts || 0,
          }));

      if (data.length === 0) { alert("Nenhum contato para exportar com os filtros atuais."); return; }

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Parceiros");
      XLSX.writeFile(wb, `parcerias-${activeTab}-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (e) {
      console.error("Erro ao exportar parcerias:", e);
      alert("Erro ao exportar. Tente novamente.");
    } finally {
      setExporting(false);
    }
  };

  // Carregar imobiliárias para o filtro de corretor por imobiliária
  useEffect(() => {
    if (activeTab === "corretor" && agencies.length === 0) {
      fetch("/api/admin/real-estate-agencies?limit=200")
        .then((r) => r.ok ? r.json() : null)
        .then((d) => { if (d?.agencies) setAgencies(d.agencies); })
        .catch(() => {});
    }
  }, [activeTab]);

  // Atualizar tab quando URL mudar
  useEffect(() => {
    setActiveTab(tipoParam);
  }, [tipoParam]);

  // Carregar dados
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === "imobiliaria") {
          const p = new URLSearchParams({ search, page: String(pagination.page), limit: String(pagination.limit) });
          if (filters.createdFrom) p.set("createdFrom", filters.createdFrom);
          if (filters.createdTo) p.set("createdTo", filters.createdTo);
          const res = await fetch(`/api/admin/real-estate-agencies?${p}`);
          if (res.ok) {
            const data = await res.json();
            setAgencies(data.agencies || []);
            setPagination(prev => ({ ...prev, total: data.total || (data.agencies || []).length, totalPages: data.pages || Math.ceil((data.total || (data.agencies || []).length) / prev.limit) }));
          }
        } else {
          const currentTab = tabs.find((t) => t.id === activeTab);
          const type = currentTab?.type || "CORRETOR";
          const p = new URLSearchParams({ search, page: String(pagination.page), limit: String(pagination.limit) });
          // Aba "summit" ignora type e filtra por tag PARCERIAS_SUMMIT
          if (currentTab?.tag) {
            p.set("tag", currentTab.tag);
          } else {
            p.set("type", type);
          }
          if (filters.creciStatus) p.set("creciStatus", filters.creciStatus);
          if (filters.partnershipFormat) p.set("partnershipFormat", filters.partnershipFormat);
          if (filters.partnershipTermStatus) p.set("partnershipTermStatus", filters.partnershipTermStatus);
          if (filters.isActive) p.set("isActive", filters.isActive);
          if (filters.createdFrom) p.set("createdFrom", filters.createdFrom);
          if (filters.createdTo) p.set("createdTo", filters.createdTo);
          if (filters.agencyId) p.set("agencyId", filters.agencyId);
          if (filters.minVisits) p.set("minVisits", filters.minVisits);
          if (filters.minProposals) p.set("minProposals", filters.minProposals);
          if (filters.minContracts) p.set("minContracts", filters.minContracts);
          const res = await fetch(`/api/admin/business-partners?${p}`);
          if (res.ok) {
            const data = await res.json();
            setPartners(data.partners || []);
            setPagination(prev => ({ ...prev, total: data.total || 0, totalPages: data.pages || 0 }));
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab, search, pagination.page, pagination.limit, filters]);

  // Reset page when tab, search or filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [activeTab, search, filters]);

  const currentTab = tabs.find((t) => t.id === activeTab);
  const isAgencyTab = activeTab === "imobiliaria";

  return (
    <div className="p-6 space-y-6">
      {/* Header fixo */}
      <div className="sticky top-0 z-20 bg-neutral-50 dark:bg-neutral-900 -mx-6 px-6 pt-2 pb-4 space-y-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Gestão de Parcerias
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Gerencie corretores, imobiliárias e parceiros de negócios
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/admin/parcerias/imoveis?status=PENDENTE"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#0B2545] to-[#2a4f80] rounded-xl hover:from-[#2a4f80] hover:to-[#34619c] transition-all shadow-lg shadow-[#0B2545]/20"
            >
              <RiBuilding2Line className="w-4 h-4" />
              Cadastros de Imóveis
            </a>
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
            >
              <RiUploadCloud2Line className="w-4 h-4" />
              Importar
            </button>
            <button onClick={handleExport} disabled={exporting} title="Exporta TODOS os contatos (respeitando os filtros)" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors disabled:opacity-60">
              {exporting ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiDownloadLine className="w-4 h-4" />}
              {exporting ? "Exportando..." : "Exportar todos"}
            </button>
            <button
              onClick={() => setShowNewModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25"
            >
              <RiAddLine className="w-4 h-4" />
              Cadastrar {isAgencyTab ? "Imobiliária" : "Parceiro"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                isActive
                  ? "bg-white dark:bg-neutral-700 text-orange-600 shadow-sm"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Buscar ${isAgencyTab ? "imobiliárias" : "parceiros"}...`}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${
              showFilters 
                ? "bg-orange-500 text-white" 
                : "text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700"
            }`}
          >
            <RiFilterLine className="w-4 h-4" />
            Filtros
            {Object.values(filters).some(v => v) && (
              <span className="w-2 h-2 rounded-full bg-orange-300" />
            )}
          </button>
        </div>

        {/* Painel de Filtros */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Status CRECI</label>
                    <select
                      value={filters.creciStatus}
                      onChange={(e) => setFilters({ ...filters, creciStatus: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm"
                    >
                      <option value="">Todos</option>
                      <option value="ATIVO">Ativo</option>
                      <option value="SUSPENSO">Suspenso</option>
                      <option value="INATIVO">Inativo</option>
                    </select>
                  </div>
                  {!isAgencyTab && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-neutral-500 mb-1">Formato Parceria</label>
                        <select
                          value={filters.partnershipFormat}
                          onChange={(e) => setFilters({ ...filters, partnershipFormat: e.target.value })}
                          className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm"
                        >
                          <option value="">Todos</option>
                          <option value="CAPTADOR">Captador</option>
                          <option value="FIFTY_PADRAO">50/50</option>
                          <option value="PARCEIRO_PREMIUM">Premium</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-neutral-500 mb-1">Contrato</label>
                        <select
                          value={filters.partnershipTermStatus}
                          onChange={(e) => setFilters({ ...filters, partnershipTermStatus: e.target.value })}
                          className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm"
                        >
                          <option value="">Todos</option>
                          <option value="ASSINADO">Assinado</option>
                          <option value="ENVIADO">Enviado</option>
                          <option value="PENDENTE">Pendente</option>
                        </select>
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Status</label>
                    <select
                      value={filters.isActive}
                      onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm"
                    >
                      <option value="">Todos</option>
                      <option value="true">Ativos</option>
                      <option value="false">Inativos</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Cadastrado a partir de</label>
                    <input
                      type="date"
                      value={filters.createdFrom}
                      onChange={(e) => setFilters({ ...filters, createdFrom: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Cadastrado até</label>
                    <input
                      type="date"
                      value={filters.createdTo}
                      onChange={(e) => setFilters({ ...filters, createdTo: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Mín. Visitas</label>
                    <input
                      type="number"
                      min="0"
                      value={filters.minVisits}
                      onChange={(e) => setFilters({ ...filters, minVisits: e.target.value })}
                      placeholder="Ex: 5"
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Mín. Propostas</label>
                    <input
                      type="number"
                      min="0"
                      value={filters.minProposals}
                      onChange={(e) => setFilters({ ...filters, minProposals: e.target.value })}
                      placeholder="Ex: 2"
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Mín. Vendas</label>
                    <input
                      type="number"
                      min="0"
                      value={filters.minContracts}
                      onChange={(e) => setFilters({ ...filters, minContracts: e.target.value })}
                      placeholder="Ex: 1"
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm"
                    />
                  </div>
                  {activeTab === "corretor" && agencies.length > 0 && (
                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1">Imobiliária</label>
                      <select
                        value={filters.agencyId}
                        onChange={(e) => setFilters({ ...filters, agencyId: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm"
                      >
                        <option value="">Todas</option>
                        {agencies.map((a) => (
                          <option key={a.id} value={a.id}>{a.tradeName || a.companyName}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => setFilters({ creciStatus: "", partnershipFormat: "", partnershipTermStatus: "", isActive: "", createdFrom: "", createdTo: "", agencyId: "", minVisits: "", minProposals: "", minContracts: "" })}
                    className="text-sm text-orange-500 hover:text-orange-600 font-medium"
                  >
                    Limpar filtros
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : isAgencyTab ? (
        /* Imobiliárias */
        <div className="grid gap-4">
          {agencies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <RiBuilding2Line className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mb-4" />
              <p className="text-neutral-500">Nenhuma imobiliária cadastrada</p>
              <button
                onClick={() => setShowNewModal(true)}
                className="mt-4 text-orange-500 hover:text-orange-600 font-medium text-sm"
              >
                + Cadastrar primeira imobiliária
              </button>
            </div>
          ) : (
            agencies.map((agency) => (
              <motion.div
                key={agency.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-all overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                        {agency.tradeName?.[0] || agency.companyName[0]}
                      </div>
                      <div>
                        <button
                          onClick={() => setExpandedId(expandedId === agency.id ? null : agency.id)}
                          className="font-semibold text-neutral-900 dark:text-white hover:text-orange-500 transition-colors text-left"
                        >
                          {agency.tradeName || agency.companyName}
                        </button>
                        <p className="text-xs text-neutral-500">
                          {agency.cnpj && `CNPJ: ${agency.cnpj}`}
                          {agency.creciJuridico && ` • CRECI: ${agency.creciJuridico}`}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          agency.creciStatus === "ATIVO"
                            ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                        }`}
                      >
                        {agency.creciStatus}
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-lg font-bold text-neutral-900 dark:text-white">
                          {agency._count?.partners || 0}
                        </p>
                        <p className="text-xs text-neutral-500">Corretores</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(agency.totalVGV)}
                        </p>
                        <p className="text-xs text-neutral-500">VGV</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setExpandedId(expandedId === agency.id ? null : agency.id)}
                          className="p-2 text-neutral-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                        >
                          <RiEyeLine className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditPartnerData(agency);
                            setShowNewModal(true);
                          }}
                          className="p-2 text-neutral-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-lg transition-colors"
                        >
                          <RiEditLine className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(agency.id, agency.tradeName || agency.companyName, true)}
                          className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <RiDeleteBinLine className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Ficha Expandida - Imobiliária */}
                <AnimatePresence>
                  {expandedId === agency.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-neutral-200 dark:border-neutral-700"
                    >
                      <div className="p-4 bg-neutral-50 dark:bg-neutral-900 space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-neutral-500 mb-1">Razão Social</p>
                            <p className="text-sm font-medium">{agency.companyName}</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500 mb-1">Nome Fantasia</p>
                            <p className="text-sm font-medium">{agency.tradeName || "-"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500 mb-1">CNPJ</p>
                            <p className="text-sm font-medium">{agency.cnpj || "-"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500 mb-1">CRECI Jurídico</p>
                            <p className="text-sm font-medium">{agency.creciJuridico || "-"}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-neutral-500 mb-1">Telefone</p>
                            <p className="text-sm font-medium">{agency.phone || "-"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500 mb-1">E-mail</p>
                            <p className="text-sm font-medium">{agency.email || "-"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500 mb-1">Nome do Contato</p>
                            <p className="text-sm font-medium">{agency.contactName || "-"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500 mb-1">Tel. do Contato</p>
                            <p className="text-sm font-medium">{agency.contactPhone || "-"}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-neutral-500 mb-1">Total Visitas</p>
                            <p className="text-sm font-medium">{agency._count?.visits || 0}</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500 mb-1">Total Propostas</p>
                            <p className="text-sm font-medium">{agency._count?.proposals || 0}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 dark:bg-green-500/10 rounded-lg hover:bg-green-100 transition-colors">
                            <RiWhatsappLine className="w-4 h-4" />
                            WhatsApp
                          </button>
                          <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-500/10 rounded-lg hover:bg-blue-100 transition-colors">
                            <RiMailLine className="w-4 h-4" />
                            E-mail
                          </button>
                          <button
                            onClick={() => {
                              setEditPartnerData(agency);
                              setShowNewModal(true);
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 dark:bg-orange-500/10 rounded-lg hover:bg-orange-100 transition-colors"
                          >
                            <RiEditLine className="w-4 h-4" />
                            Editar
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>
      ) : (
        /* Parceiros */
        <div className="grid gap-4">
          {partners.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              {currentTab && <currentTab.icon className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mb-4" />}
              <p className="text-neutral-500">Nenhum {currentTab?.label.toLowerCase().slice(0, -1)} cadastrado</p>
              <button
                onClick={() => setShowNewModal(true)}
                className="mt-4 text-orange-500 hover:text-orange-600 font-medium text-sm"
              >
                + Cadastrar primeiro parceiro
              </button>
            </div>
          ) : (
            partners.map((partner) => (
              <motion.div
                key={partner.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-all overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg">
                        {partner.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setExpandedId(expandedId === partner.id ? null : partner.id)}
                            className="font-semibold text-neutral-900 dark:text-white hover:text-orange-500 transition-colors text-left"
                          >
                            {partner.name}
                          </button>
                          {partner.agency && (
                            <span className="px-2 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 rounded">
                              {partner.agency.tradeName || partner.agency.companyName}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-500">
                          {partner.creci && `CRECI: ${partner.creci}`}
                          {partner.phone && ` • ${partner.phone}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            partner.creciStatus === "ATIVO"
                              ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                              : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                          }`}
                        >
                          {partner.creciStatus}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            partner.partnershipFormat === "PARCEIRO_PREMIUM"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400"
                              : partner.partnershipFormat === "FIFTY_PADRAO"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                              : "bg-neutral-100 text-neutral-700 dark:bg-neutral-500/20 dark:text-neutral-400"
                          }`}
                        >
                          {partner.partnershipFormat === "PARCEIRO_PREMIUM"
                            ? "Premium"
                            : partner.partnershipFormat === "FIFTY_PADRAO"
                            ? "50/50"
                            : "Captador"}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            partner.partnershipTermStatus === "ASSINADO"
                              ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                              : partner.partnershipTermStatus === "ENVIADO"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                              : "bg-neutral-100 text-neutral-700 dark:bg-neutral-500/20 dark:text-neutral-400"
                          }`}
                        >
                          {partner.partnershipTermStatus === "ASSINADO"
                            ? "Contrato ✓"
                            : partner.partnershipTermStatus === "ENVIADO"
                            ? "Enviado"
                            : "Sem contrato"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      {/* Métricas */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <p className="font-bold text-green-600">{formatCurrency(partner.totalVGV)}</p>
                          <p className="text-[10px] text-neutral-500">VGV</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-neutral-900 dark:text-white">
                            {partner._count?.visits || partner.totalVisits}
                          </p>
                          <p className="text-[10px] text-neutral-500">Visitas</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-neutral-900 dark:text-white">
                            {partner._count?.proposals || partner.totalProposals}
                          </p>
                          <p className="text-[10px] text-neutral-500">Propostas</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-neutral-900 dark:text-white">
                            {partner._count?.contracts || partner.totalContracts}
                          </p>
                          <p className="text-[10px] text-neutral-500">Contratos</p>
                        </div>
                      </div>
                      {/* Último contato */}
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        {partner.lastWhatsappContact && (
                          <span className="flex items-center gap-1" title="Último WhatsApp">
                            <RiWhatsappLine className="w-3.5 h-3.5 text-green-500" />
                            {formatDate(partner.lastWhatsappContact)}
                          </span>
                        )}
                        {partner.lastEmailContact && (
                          <span className="flex items-center gap-1" title="Último e-mail">
                            <RiMailLine className="w-3.5 h-3.5 text-blue-500" />
                            {formatDate(partner.lastEmailContact)}
                          </span>
                        )}
                      </div>
                      {/* Ações */}
                      <div className="flex items-center gap-1">
                        <button className="p-2 text-neutral-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-lg transition-colors">
                          <RiWhatsappLine className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => setExpandedId(expandedId === partner.id ? null : partner.id)}
                          className="p-2 text-neutral-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                        >
                          <RiEyeLine className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditPartnerData(partner);
                            setShowNewModal(true);
                          }}
                          className="p-2 text-neutral-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-lg transition-colors"
                        >
                          <RiEditLine className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(partner.id, partner.name)}
                          className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <RiDeleteBinLine className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Ficha Expandida - Parceiro */}
                <AnimatePresence>
                  {expandedId === partner.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-neutral-200 dark:border-neutral-700"
                    >
                      <div className="p-4 bg-neutral-50 dark:bg-neutral-900 space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-neutral-500 mb-1">Nome Completo</p>
                            <p className="text-sm font-medium">{partner.name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500 mb-1">CRECI</p>
                            <p className="text-sm font-medium">{partner.creci || "-"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500 mb-1">Telefone</p>
                            <p className="text-sm font-medium">{partner.phone || "-"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500 mb-1">E-mail</p>
                            <p className="text-sm font-medium">{partner.email || "-"}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-neutral-500 mb-1">Formato Parceria</p>
                            <p className="text-sm font-medium">
                              {partner.partnershipFormat === "PARCEIRO_PREMIUM" ? "Premium" : 
                               partner.partnershipFormat === "FIFTY_PADRAO" ? "50/50" : "Captador"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500 mb-1">Status Contrato</p>
                            <p className="text-sm font-medium">
                              {partner.partnershipTermStatus === "ASSINADO" ? "Assinado" : 
                               partner.partnershipTermStatus === "ENVIADO" ? "Enviado" : "Pendente"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500 mb-1">Imobiliária</p>
                            <p className="text-sm font-medium">
                              {partner.agency?.tradeName || partner.agency?.companyName || "Autônomo"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500 mb-1">VGV Total</p>
                            <p className="text-sm font-medium text-green-600">{formatCurrency(partner.totalVGV)}</p>
                          </div>
                        </div>
                        {/* Resumo de atividades */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-xl border border-purple-200 dark:border-purple-500/20">
                            <div className="flex items-center gap-2 mb-1">
                              <RiMapPinLine className="w-4 h-4 text-purple-500" />
                              <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Visitas</span>
                            </div>
                            <p className="text-xl font-bold text-purple-700 dark:text-purple-300">{partner.totalVisits || partner._count?.visits || 0}</p>
                          </div>
                          <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-500/20">
                            <div className="flex items-center gap-2 mb-1">
                              <RiFileList3Line className="w-4 h-4 text-blue-500" />
                              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Propostas</span>
                            </div>
                            <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{partner.totalProposals || partner._count?.proposals || 0}</p>
                          </div>
                          <div className="p-3 bg-green-50 dark:bg-green-500/10 rounded-xl border border-green-200 dark:border-green-500/20">
                            <div className="flex items-center gap-2 mb-1">
                              <RiCheckLine className="w-4 h-4 text-green-500" />
                              <span className="text-xs font-medium text-green-600 dark:text-green-400">Contratos</span>
                            </div>
                            <p className="text-xl font-bold text-green-700 dark:text-green-300">{partner.totalContracts || partner._count?.contracts || 0}</p>
                          </div>
                          <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/20">
                            <div className="flex items-center gap-2 mb-1">
                              <RiMoneyDollarCircleLine className="w-4 h-4 text-emerald-500" />
                              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">VGV</span>
                            </div>
                            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{formatCurrency(partner.totalVGV)}</p>
                          </div>
                        </div>

                        {/* Último contato */}
                        <div className="flex items-center gap-4 text-xs text-neutral-500">
                          {partner.lastWhatsappContact && (
                            <span className="flex items-center gap-1">
                              <RiWhatsappLine className="w-3.5 h-3.5 text-green-500" />
                              Último WhatsApp: {formatDate(partner.lastWhatsappContact)}
                            </span>
                          )}
                          {partner.lastEmailContact && (
                            <span className="flex items-center gap-1">
                              <RiMailLine className="w-3.5 h-3.5 text-blue-500" />
                              Último E-mail: {formatDate(partner.lastEmailContact)}
                            </span>
                          )}
                        </div>

                        {partner.tags && partner.tags.length > 0 && (
                          <div>
                            <p className="text-xs text-neutral-500 mb-2">Tags</p>
                            <div className="flex flex-wrap gap-1">
                              {partner.tags.map((tag) => (
                                <span key={tag} className="px-2 py-1 text-xs bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex gap-2 pt-2">
                          {partner.phone && (
                            <a
                              href={`https://wa.me/55${partner.phone.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 dark:bg-green-500/10 rounded-lg hover:bg-green-100 transition-colors"
                            >
                              <RiWhatsappLine className="w-4 h-4" />
                              WhatsApp
                            </a>
                          )}
                          {partner.email && (
                            <a
                              href={`mailto:${partner.email}`}
                              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-500/10 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              <RiMailLine className="w-4 h-4" />
                              E-mail
                            </a>
                          )}
                          <button
                            onClick={() => setEditPartnerData(partner)}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 dark:bg-orange-500/10 rounded-lg hover:bg-orange-100 transition-colors"
                          >
                            <RiEditLine className="w-4 h-4" />
                            Editar
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <p className="text-sm text-neutral-500">
            Mostrando {(pagination.page - 1) * pagination.limit + 1} a{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de{" "}
            {pagination.total} {isAgencyTab ? "imobiliárias" : "parceiros"}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RiArrowLeftSLine className="w-5 h-5" />
            </button>
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    pagination.page === pageNum
                      ? "bg-orange-500 text-white"
                      : "border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-orange-500"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RiArrowRightSLine className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Modal de Novo Cadastro */}
      <AnimatePresence>
        {showNewModal && (
          <NewPartnerModal
            isAgency={isAgencyTab}
            partnerType={currentTab?.type || "CORRETOR"}
            editData={editPartnerData}
            onClose={() => { setShowNewModal(false); setEditPartnerData(null); }}
            onSave={() => {
              setShowNewModal(false);
              setEditPartnerData(null);
              // Recarregar dados
              setSearch(search + " ");
              setTimeout(() => setSearch(search), 100);
            }}
          />
        )}
      </AnimatePresence>

      {/* Modal de Importação */}
      <AnimatePresence>
        {showImportModal && (
          <ImportPartnersModal
            partnerType={currentTab?.type || "CORRETOR"}
            onClose={() => setShowImportModal(false)}
            onSuccess={() => {
              setShowImportModal(false);
              setSearch(search + " ");
              setTimeout(() => setSearch(search), 100);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// Campos para mapeamento de importação
// ============================================
const PARTNER_FIELDS = [
  { key: "name", label: "Nome", required: true },
  { key: "cpf", label: "CPF" },
  { key: "rg", label: "RG" },
  { key: "creci", label: "CRECI" },
  { key: "email", label: "E-mail" },
  { key: "phone", label: "Telefone" },
  { key: "gender", label: "Sexo" },
  { key: "birthDate", label: "Data de Nascimento" },
  { key: "address", label: "Endereço" },
  { key: "neighborhood", label: "Bairro" },
  { key: "city", label: "Cidade" },
  { key: "state", label: "Estado" },
  { key: "zipCode", label: "CEP" },
  { key: "partnershipFormat", label: "Formato Parceria" },
  { key: "creciStatus", label: "Situação CRECI" },
  { key: "pixKey", label: "Chave PIX" },
  { key: "bankName", label: "Banco" },
  { key: "bankAgency", label: "Agência" },
  { key: "bankAccount", label: "Conta" },
  { key: "tags", label: "Tags" },
];

function autoDetectPartnerField(header: string): string {
  const h = header.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  if (h === "nome" || h === "name" || h === "nome completo" || h === "nome_completo" || h === "full_name" || h === "razao social") return "name";
  if (h === "cpf" || h === "cpf/cnpj" || h === "cpf_cnpj" || h === "documento") return "cpf";
  if (h === "rg" || h === "identidade") return "rg";
  if (h === "creci" || h === "numero creci" || h === "n creci" || h === "creci_number") return "creci";
  if (h === "email" || h === "e-mail" || h === "e_mail" || h === "correio eletronico" || h === "mail") return "email";
  if (h === "telefone" || h === "phone" || h === "celular" || h === "tel" || h === "fone" || h === "whatsapp" || h === "contato") return "phone";
  if (h === "sexo" || h === "genero" || h === "gender") return "gender";
  if (h === "nascimento" || h === "data de nascimento" || h === "data nascimento" || h === "dt nascimento" || h === "birth" || h === "birthdate" || h === "data_nascimento") return "birthDate";
  if (h === "endereco" || h === "logradouro" || h === "rua" || h === "address" || h === "end") return "address";
  if (h === "bairro" || h === "neighborhood") return "neighborhood";
  if (h === "cidade" || h === "city" || h === "municipio") return "city";
  if (h === "estado" || h === "uf" || h === "state") return "state";
  if (h === "cep" || h === "zip" || h === "zipcode" || h === "zip_code" || h === "codigo postal") return "zipCode";
  if (h === "parceria" || h === "formato parceria" || h === "formato_parceria" || h === "partnership") return "partnershipFormat";
  if (h === "situacao creci" || h === "status creci" || h === "creci_status") return "creciStatus";
  if (h === "pix" || h === "chave pix" || h === "pix_key") return "pixKey";
  if (h === "banco" || h === "bank" || h === "nome banco") return "bankName";
  if (h === "agencia" || h === "ag" || h === "bank_agency") return "bankAgency";
  if (h === "conta" || h === "account" || h === "bank_account" || h === "numero conta") return "bankAccount";
  if (h === "tags" || h === "tag" || h === "classificacao") return "tags";
  return "";
}

// ============================================
// Modal de Importação de Parceiros
// ============================================
function ImportPartnersModal({
  partnerType,
  onClose,
  onSuccess,
}: {
  partnerType: PartnerType;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<number, string>>({});
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ created: number; updated: number; skipped: number } | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setError("");
    parseFile(selected);
  };

  const parseFile = (f: File) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        let headers: string[] = [];
        let rows: string[][] = [];

        if (f.name.endsWith(".csv")) {
          const text = data as string;
          const lines = text.split(/\r?\n/).filter((l) => l.trim());
          if (lines.length > 0) {
            headers = lines[0].split(/[;,\t]/).map((h) => h.replace(/"/g, "").trim());
            rows = lines.slice(1).map((line) => line.split(/[;,\t]/).map((v) => v.replace(/"/g, "").trim()));
          }
        } else {
          const wb = XLSX.read(data, { type: "array" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }) as string[][];
          if (jsonData.length > 0) {
            headers = jsonData[0].map((h) => String(h).trim());
            rows = jsonData.slice(1).filter((r) => r.some((v) => String(v).trim()));
          }
        }

        setRawHeaders(headers);
        setRawRows(rows);

        // Auto-detectar mapeamento
        const mapping: Record<number, string> = {};
        headers.forEach((header, index) => {
          const detected = autoDetectPartnerField(header);
          if (detected) mapping[index] = detected;
        });
        setColumnMapping(mapping);

        if (headers.length > 0) setStep(2);
        else setError("Arquivo vazio ou formato inválido");
      } catch (err) {
        setError("Erro ao ler arquivo. Verifique o formato.");
      }
    };
    if (f.name.endsWith(".csv")) {
      reader.readAsText(f, "UTF-8");
    } else {
      reader.readAsArrayBuffer(f);
    }
  };

  const mappedCount = Object.values(columnMapping).filter((v) => v).length;
  const unmappedCount = rawHeaders.length - mappedCount;
  const hasName = Object.values(columnMapping).includes("name");

  const handleImport = async () => {
    if (!hasName) {
      setError("A coluna 'Nome' é obrigatória para importação.");
      return;
    }

    setImporting(true);
    setError("");
    setStep(3);

    try {
      // Mapear dados
      const items = rawRows.map((row) => {
        const item: any = {};
        Object.entries(columnMapping).forEach(([colIndexStr, fieldKey]) => {
          if (!fieldKey) return;
          const colIndex = parseInt(colIndexStr);
          const value = (row[colIndex] || "").toString().trim();
          if (!value) return;
          item[fieldKey] = value;
        });
        return item;
      }).filter((item) => item.name);

      // Enviar em lotes de 50
      const batchSize = 50;
      let totalCreated = 0;
      let totalUpdated = 0;
      let totalSkipped = 0;

      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const res = await fetch("/api/admin/business-partners/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: batch, type: partnerType }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Erro na importação");
        }

        const data = await res.json();
        totalCreated += data.created || 0;
        totalUpdated += data.updated || 0;
        totalSkipped += data.skipped || 0;
        setProgress(Math.round(((i + batch.length) / items.length) * 100));
      }

      setResult({ created: totalCreated, updated: totalUpdated, skipped: totalSkipped });
    } catch (err: any) {
      setError(err.message || "Erro ao importar");
    } finally {
      setImporting(false);
    }
  };

  const partnerTypeLabel = partnerType === "CORRETOR" ? "Corretores" : partnerType === "CORRESPONDENTE_BANCARIO" ? "Correspondentes" : partnerType === "ARQUITETO" ? "Arquitetos" : partnerType === "CONSTRUTORA" ? "Construtoras" : "Parceiros";

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full ${step === 2 ? "md:max-w-4xl" : "md:max-w-lg"} bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 shrink-0">
          <div className="flex items-center gap-3">
            <RiUploadCloud2Line className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Importar {partnerTypeLabel}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg">
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Indicator */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
          {[
            { n: 1, label: "Upload" },
            { n: 2, label: "Mapeamento" },
            { n: 3, label: "Importação" },
          ].map(({ n, label }) => (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= n ? "bg-orange-500 text-white" : "bg-neutral-200 dark:bg-neutral-700 text-neutral-500"
              }`}>
                {step > n ? <RiCheckLine className="w-4 h-4" /> : n}
              </div>
              <span className={`text-xs font-medium ${step >= n ? "text-orange-600" : "text-neutral-400"}`}>{label}</span>
              {n < 3 && <div className={`w-8 h-0.5 ${step > n ? "bg-orange-500" : "bg-neutral-200 dark:bg-neutral-700"}`} />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Upload */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-neutral-500">
                Selecione um arquivo Excel (.xlsx, .xls) ou CSV contendo os dados dos {partnerTypeLabel.toLowerCase()}.
              </p>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl p-8 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-500/5 transition-all"
              >
                <RiFileExcel2Line className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {file ? file.name : "Clique para selecionar arquivo"}
                </p>
                <p className="text-xs text-neutral-400 mt-1">CSV, XLSX ou XLS</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-500/10 p-3 rounded-lg">
                  <RiAlertLine className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">Colunas aceitas:</p>
                <div className="flex flex-wrap gap-1.5">
                  {PARTNER_FIELDS.map((f) => (
                    <span key={f.key} className={`px-2 py-0.5 text-[10px] rounded-full ${f.required ? "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 font-semibold" : "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400"}`}>
                      {f.label}{f.required ? " *" : ""}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Mapeamento */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-500">
                  <strong>{rawRows.length}</strong> registros encontrados. Mapeie as colunas:
                </p>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-green-600 font-medium">{mappedCount} mapeadas</span>
                  {unmappedCount > 0 && <span className="text-amber-600 font-medium">{unmappedCount} sem mapeamento</span>}
                </div>
              </div>

              {!hasName && (
                <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-500/10 p-3 rounded-lg">
                  <RiAlertLine className="w-4 h-4 shrink-0" />
                  A coluna <strong>Nome</strong> é obrigatória. Mapeie pelo menos uma coluna como &quot;Nome&quot;.
                </div>
              )}

              {/* Mapeamento de colunas */}
              <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
                <div className="grid grid-cols-[1fr_auto_1fr] gap-0 bg-neutral-100 dark:bg-neutral-800 px-4 py-2 text-xs font-semibold text-neutral-500">
                  <span>Coluna no arquivo</span>
                  <span className="px-4">→</span>
                  <span>Campo no sistema</span>
                </div>
                <div className="divide-y divide-neutral-100 dark:divide-neutral-800 max-h-[300px] overflow-y-auto">
                  {rawHeaders.map((header, index) => (
                    <div key={index} className="grid grid-cols-[1fr_auto_1fr] gap-0 px-4 py-2.5 items-center hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 truncate">{header}</span>
                        <span className="text-[10px] text-neutral-400">ex: {rawRows[0]?.[index] || "-"}</span>
                      </div>
                      <span className="px-4 text-neutral-300">→</span>
                      <select
                        value={columnMapping[index] || ""}
                        onChange={(e) => {
                          const newMapping = { ...columnMapping };
                          if (e.target.value) newMapping[index] = e.target.value;
                          else delete newMapping[index];
                          setColumnMapping(newMapping);
                        }}
                        className={`w-full px-3 py-1.5 rounded-lg text-sm border ${
                          columnMapping[index]
                            ? "border-green-300 bg-green-50 dark:bg-green-500/10 dark:border-green-500/30 text-green-700 dark:text-green-400"
                            : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600"
                        }`}
                      >
                        <option value="">— Ignorar —</option>
                        {PARTNER_FIELDS.map((f) => (
                          <option key={f.key} value={f.key} disabled={Object.values(columnMapping).includes(f.key) && columnMapping[index] !== f.key}>
                            {f.label}{f.required ? " *" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview */}
              {mappedCount > 0 && (
                <div>
                  <p className="text-xs font-semibold text-neutral-500 mb-2">Preview (primeiros 5 registros):</p>
                  <div className="overflow-x-auto border border-neutral-200 dark:border-neutral-700 rounded-lg">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-neutral-50 dark:bg-neutral-800">
                          {Object.entries(columnMapping)
                            .filter(([, v]) => v)
                            .sort(([a], [b]) => parseInt(a) - parseInt(b))
                            .map(([colIndex, fieldKey]) => (
                              <th key={colIndex} className="px-3 py-2 text-left font-semibold text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                                {PARTNER_FIELDS.find((f) => f.key === fieldKey)?.label || fieldKey}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rawRows.slice(0, 5).map((row, i) => (
                          <tr key={i} className="border-t border-neutral-100 dark:border-neutral-800">
                            {Object.entries(columnMapping)
                              .filter(([, v]) => v)
                              .sort(([a], [b]) => parseInt(a) - parseInt(b))
                              .map(([colIndex]) => (
                                <td key={colIndex} className="px-3 py-2 text-neutral-700 dark:text-neutral-300 whitespace-nowrap max-w-[200px] truncate">
                                  {row[parseInt(colIndex)] || "-"}
                                </td>
                              ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-500/10 p-3 rounded-lg">
                  <RiAlertLine className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Importação */}
          {step === 3 && (
            <div className="space-y-6 text-center py-4">
              {importing ? (
                <>
                  <RiLoader4Line className="w-12 h-12 mx-auto text-orange-500 animate-spin" />
                  <div>
                    <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Importando {partnerTypeLabel.toLowerCase()}...</p>
                    <p className="text-xs text-neutral-400 mt-1">{progress}% concluído</p>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                </>
              ) : result ? (
                <>
                  <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center">
                    <RiCheckLine className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-neutral-900 dark:text-white">Importação concluída!</p>
                    <div className="flex items-center justify-center gap-6 mt-3">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{result.created}</p>
                        <p className="text-xs text-neutral-500">Criados</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{result.updated}</p>
                        <p className="text-xs text-neutral-500">Atualizados</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-neutral-400">{result.skipped}</p>
                        <p className="text-xs text-neutral-500">Ignorados</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : error ? (
                <>
                  <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center">
                    <RiAlertLine className="w-8 h-8 text-red-600" />
                  </div>
                  <p className="text-sm text-red-600">{error}</p>
                </>
              ) : null}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 shrink-0">
          <div>
            {step === 2 && (
              <button
                onClick={() => { setStep(1); setFile(null); setRawHeaders([]); setRawRows([]); setColumnMapping({}); }}
                className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700"
              >
                <RiArrowLeftLine className="w-4 h-4" />
                Voltar
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={result ? onSuccess : onClose}
              className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              {result ? "Fechar" : "Cancelar"}
            </button>
            {step === 2 && (
              <button
                onClick={handleImport}
                disabled={!hasName || importing}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Importar {rawRows.length} registros
                <RiArrowRightLine className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}

// Modal de Novo Parceiro/Imobiliária
function NewPartnerModal({
  isAgency,
  partnerType,
  editData,
  onClose,
  onSave,
}: {
  isAgency: boolean;
  partnerType: PartnerType;
  editData?: any;
  onClose: () => void;
  onSave: () => void;
}) {
  const isEditMode = !!editData;
  const [formData, setFormData] = useState<any>(() => {
    if (editData) {
      return {
        ...editData,
        birthDate: editData.birthDate ? editData.birthDate.split("T")[0] : "",
        isAutonomous: !editData.agencyId,
        agencyId: editData.agencyId || null,
      };
    }
    return {};
  });
  const [saving, setSaving] = useState(false);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loadingAgencies, setLoadingAgencies] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [availableTags, setAvailableTags] = useState<string[]>(() => {
    const defaults = ["VIP", "Indicador", "Top Performer", "Novo", "Inativo", "Problemático", "Potencial"];
    if (editData?.tags?.length) {
      const merged = [...defaults];
      editData.tags.forEach((t: string) => { if (!merged.includes(t)) merged.push(t); });
      return merged;
    }
    return defaults;
  });
  const [availablePartners, setAvailablePartners] = useState<Partner[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(false);

  // Carregar corretores disponíveis para vincular como sócios (imobiliária)
  useEffect(() => {
    if (isAgency) {
      const fetchPartners = async () => {
        setLoadingPartners(true);
        try {
          const res = await fetch("/api/admin/business-partners?type=CORRETOR&limit=100");
          if (res.ok) {
            const data = await res.json();
            setAvailablePartners(data.partners || []);
          }
        } catch (error) {
          console.error("Erro ao carregar corretores:", error);
        } finally {
          setLoadingPartners(false);
        }
      };
      fetchPartners();
    }
  }, [isAgency]);

  // Carregar imobiliárias quando mudar para "Associado"
  useEffect(() => {
    if (!formData.isAutonomous && !isAgency) {
      const fetchAgencies = async () => {
        setLoadingAgencies(true);
        try {
          const res = await fetch("/api/admin/real-estate-agencies?limit=100");
          if (res.ok) {
            const data = await res.json();
            setAgencies(data.agencies || []);
          }
        } catch (error) {
          console.error("Erro ao carregar imobiliárias:", error);
        } finally {
          setLoadingAgencies(false);
        }
      };
      fetchAgencies();
    }
  }, [formData.isAutonomous, isAgency]);

  // Adicionar nova tag
  const handleAddTag = () => {
    if (newTag.trim() && !availableTags.includes(newTag.trim())) {
      setAvailableTags([...availableTags, newTag.trim()]);
    }
    if (newTag.trim()) {
      const currentTags = formData.tags || [];
      if (!currentTags.includes(newTag.trim())) {
        setFormData({ ...formData, tags: [...currentTags, newTag.trim()] });
      }
    }
    setNewTag("");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let endpoint: string;
      let method: string;

      if (isEditMode) {
        endpoint = isAgency
          ? `/api/admin/real-estate-agencies/${editData.id}`
          : `/api/admin/business-partners/${editData.id}`;
        method = "PATCH";
      } else {
        endpoint = isAgency ? "/api/admin/real-estate-agencies" : "/api/admin/business-partners";
        method = "POST";
      }

      // Limpar campos de relação e campos não atualizáveis que não devem ir no PATCH
      const { id: _id, agency, _count, visits, proposals, contracts, activities, notes, createdAt, updatedAt, isAutonomous, partners, totalVGV, totalVisits, totalProposals, totalContracts, lastEmailContact, lastWhatsappContact, lastVisit, ...cleanData } = formData;
      const body = isAgency
        ? cleanData
        : { ...cleanData, type: cleanData.type || partnerType };

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        onSave();
      } else {
        const error = await res.json();
        alert(error.error || "Erro ao salvar");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl z-50 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            {isEditMode ? (isAgency ? "Editar Imobiliária" : "Editar Parceiro") : (isAgency ? "Nova Imobiliária" : "Novo Parceiro")}
          </h2>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg">
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          {isAgency ? (
            /* Formulário de Imobiliária */
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Razão Social *</label>
                  <input
                    type="text"
                    value={formData.companyName || ""}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Nome Fantasia</label>
                  <input
                    type="text"
                    value={formData.tradeName || ""}
                    onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">CNPJ</label>
                  <input
                    type="text"
                    value={formData.cnpj || ""}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">CRECI Jurídico</label>
                  <input
                    type="text"
                    value={formData.creciJuridico || ""}
                    onChange={(e) => setFormData({ ...formData, creciJuridico: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Telefone</label>
                  <input
                    type="text"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Nome do Contato</label>
                  <input
                    type="text"
                    value={formData.contactName || ""}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="Pessoa de contato na imobiliária"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Telefone do Contato</label>
                  <input
                    type="text"
                    value={formData.contactPhone || ""}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="Telefone direto do contato"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Site</label>
                <input
                  type="url"
                  value={formData.website || ""}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.isAdministrator || false}
                    onChange={(e) => setFormData({ ...formData, isAdministrator: e.target.checked })}
                    className="w-4 h-4 rounded border-neutral-300 text-orange-500 focus:ring-orange-500"
                  />
                  É Administradora?
                </label>
              </div>

              {/* Sócios (corretores vinculados) */}
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-2">Sócios (Corretores)</label>
                {loadingPartners ? (
                  <div className="text-sm text-neutral-400">Carregando corretores...</div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(formData.partnerIds || []).map((partnerId: string) => {
                        const partner = availablePartners.find(p => p.id === partnerId);
                        return partner ? (
                          <span key={partnerId} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 rounded text-xs">
                            {partner.name}
                            <button
                              type="button"
                              onClick={() => {
                                const newIds = (formData.partnerIds || []).filter((id: string) => id !== partnerId);
                                setFormData({ ...formData, partnerIds: newIds });
                              }}
                              className="hover:text-red-500"
                            >
                              <RiCloseLine className="w-3 h-3" />
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          const currentIds = formData.partnerIds || [];
                          if (!currentIds.includes(e.target.value)) {
                            setFormData({ ...formData, partnerIds: [...currentIds, e.target.value] });
                          }
                        }
                      }}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm"
                    >
                      <option value="">+ Adicionar sócio</option>
                      {availablePartners
                        .filter(p => !(formData.partnerIds || []).includes(p.id))
                        .map((partner) => (
                          <option key={partner.id} value={partner.id}>
                            {partner.name} {partner.creci ? `(CRECI: ${partner.creci})` : ""}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>
            </>
          ) : partnerType === "CONSTRUTORA" ? (
            /* Formulário de Construtora */
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Nome da Construtora *</label>
                  <input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">CNPJ</label>
                  <input
                    type="text"
                    value={formData.cpf || ""}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Telefone</label>
                  <input
                    type="text"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Site</label>
                  <input
                    type="url"
                    value={formData.website || ""}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
              </div>

              {/* Gestores de Parcerias */}
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-2">Gestores de Parcerias</label>
                <div className="space-y-2">
                  {(formData.contacts || []).map((contact: any, index: number) => (
                    <div key={index} className="flex gap-2 items-start p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Nome"
                          value={contact.name || ""}
                          onChange={(e) => {
                            const newContacts = [...(formData.contacts || [])];
                            newContacts[index] = { ...newContacts[index], name: e.target.value };
                            setFormData({ ...formData, contacts: newContacts });
                          }}
                          className="px-2 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Telefone"
                          value={contact.phone || ""}
                          onChange={(e) => {
                            const newContacts = [...(formData.contacts || [])];
                            newContacts[index] = { ...newContacts[index], phone: e.target.value };
                            setFormData({ ...formData, contacts: newContacts });
                          }}
                          className="px-2 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded text-sm"
                        />
                        <input
                          type="email"
                          placeholder="E-mail"
                          value={contact.email || ""}
                          onChange={(e) => {
                            const newContacts = [...(formData.contacts || [])];
                            newContacts[index] = { ...newContacts[index], email: e.target.value };
                            setFormData({ ...formData, contacts: newContacts });
                          }}
                          className="px-2 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded text-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newContacts = (formData.contacts || []).filter((_: any, i: number) => i !== index);
                          setFormData({ ...formData, contacts: newContacts });
                        }}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded"
                      >
                        <RiDeleteBinLine className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const newContacts = [...(formData.contacts || []), { name: "", phone: "", email: "", role: "GESTOR_PARCERIA" }];
                      setFormData({ ...formData, contacts: newContacts });
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-lg"
                  >
                    <RiAddLine className="w-4 h-4" />
                    Adicionar Gestor de Parceria
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Formulário de Parceiro */
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">CPF</label>
                  <input
                    type="text"
                    value={formData.cpf || ""}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">RG</label>
                  <input
                    type="text"
                    value={formData.rg || ""}
                    onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">CRECI</label>
                  <input
                    type="text"
                    value={formData.creci || ""}
                    onChange={(e) => setFormData({ ...formData, creci: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Situação CRECI</label>
                  <select
                    value={formData.creciStatus || "ATIVO"}
                    onChange={(e) => setFormData({ ...formData, creciStatus: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  >
                    <option value="ATIVO">Ativo</option>
                    <option value="SUSPENSO">Suspenso</option>
                    <option value="INATIVO">Inativo</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Telefone</label>
                  <input
                    type="text"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Sexo</label>
                  <select
                    value={formData.gender || ""}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  >
                    <option value="">Selecione</option>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                    <option value="O">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Data de Nascimento</label>
                  <input
                    type="date"
                    value={formData.birthDate || ""}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    onPaste={(e) => handleDatePaste(e, (val) => setFormData({ ...formData, birthDate: val }))}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Vínculo</label>
                  <select
                    value={formData.isAutonomous === false ? "associado" : "autonomo"}
                    onChange={(e) => {
                      const isAutonomous = e.target.value === "autonomo";
                      setFormData({ 
                        ...formData, 
                        isAutonomous,
                        agencyId: isAutonomous ? null : formData.agencyId 
                      });
                    }}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  >
                    <option value="autonomo">Autônomo</option>
                    <option value="associado">Associado à Imobiliária</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Formato de Parceria</label>
                  <select
                    value={formData.partnershipFormat || "CAPTADOR"}
                    onChange={(e) => setFormData({ ...formData, partnershipFormat: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  >
                    <option value="CAPTADOR">Captador</option>
                    <option value="FIFTY_PADRAO">50/50 Padrão</option>
                    <option value="PARCEIRO_PREMIUM">Parceiro Premium</option>
                  </select>
                </div>
              </div>

              {/* Seletor de Imobiliária - aparece quando "Associado" */}
              {formData.isAutonomous === false && (
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Imobiliária *</label>
                  {loadingAgencies ? (
                    <div className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-400">
                      Carregando imobiliárias...
                    </div>
                  ) : (
                    <select
                      value={formData.agencyId || ""}
                      onChange={(e) => setFormData({ ...formData, agencyId: e.target.value || null })}
                      className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    >
                      <option value="">Selecione uma imobiliária</option>
                      {agencies.map((agency) => (
                        <option key={agency.id} value={agency.id}>
                          {agency.tradeName || agency.companyName} {agency.cnpj ? `(${agency.cnpj})` : ""}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Especialidades</label>
                <div className="flex flex-wrap gap-2">
                  {["Popular", "Médio Padrão", "Locação", "Triple A", "Lançamentos"].map((spec) => (
                    <label
                      key={spec}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                        (formData.specialties || []).includes(spec)
                          ? "bg-orange-500 text-white"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={(formData.specialties || []).includes(spec)}
                        onChange={(e) => {
                          const current = formData.specialties || [];
                          if (e.target.checked) {
                            setFormData({ ...formData, specialties: [...current, spec] });
                          } else {
                            setFormData({ ...formData, specialties: current.filter((s: string) => s !== spec) });
                          }
                        }}
                        className="hidden"
                      />
                      {spec}
                    </label>
                  ))}
                </div>
              </div>

              {/* Tags / Classificações */}
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Tags / Classificações</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {availableTags.map((tag) => {
                    const isSelected = (formData.tags || []).includes(tag);
                    const isDefault = ["VIP", "Indicador", "Top Performer", "Novo", "Inativo", "Problemático", "Potencial"].includes(tag);
                    return (
                      <span
                        key={tag}
                        className={`inline-flex items-center gap-1 rounded-lg text-xs font-medium transition-colors ${
                          isSelected
                            ? "bg-purple-500 text-white"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            const current = formData.tags || [];
                            if (isSelected) {
                              setFormData({ ...formData, tags: current.filter((t: string) => t !== tag) });
                            } else {
                              setFormData({ ...formData, tags: [...current, tag] });
                            }
                          }}
                          className="px-3 py-1.5 cursor-pointer"
                        >
                          {tag}
                        </button>
                        {!isDefault && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAvailableTags(availableTags.filter((t) => t !== tag));
                              setFormData({ ...formData, tags: (formData.tags || []).filter((t: string) => t !== tag) });
                            }}
                            className={`pr-2 py-1.5 hover:text-red-300 transition-colors ${isSelected ? "text-white/70" : "text-neutral-400"}`}
                            title="Remover tag"
                          >
                            <RiCloseLine className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </span>
                    );
                  })}
                </div>
                {/* Criar nova tag */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Criar nova tag..."
                    className="flex-1 px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
                  >
                    <RiAddLine className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 dark:border-neutral-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || (!isAgency && !formData.name) || (isAgency && !formData.companyName)}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Salvando..." : (isEditMode ? "Salvar Alterações" : "Salvar")}
          </button>
        </div>
      </motion.div>
    </>
  );
}

export default function ParceriasPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    }>
      <ParceriasContent />
    </Suspense>
  );
}
