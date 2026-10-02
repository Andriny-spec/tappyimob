"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  RiGlobalLine,
  RiCheckLine,
  RiCloseLine,
  RiRefreshLine,
  RiSettings4Line,
  RiArrowRightLine,
  RiTimeLine,
  RiAlertLine,
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiInformationLine,
  RiBuilding2Line,
  RiExternalLinkLine,
  RiAddLine,
  RiHistoryLine,
  RiFileCopyLine,
  RiLink,
  RiToggleLine,
  RiToggleFill,
  RiMoreLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
} from "react-icons/ri";

// Portais disponíveis - Top portais do Brasil
const availablePortals = [
  {
    id: "grupozap",
    name: "Grupo ZAP+",
    description: "ZAP Imóveis + Viva Real + OLX",
    color: "#6B2D8B",
    bgGradient: "from-purple-600 to-purple-800",
    formats: ["XML", "API"],
    status: "active",
    isGroup: true,
    subPortals: ["ZAP Imóveis", "Viva Real", "OLX"],
  },
  {
    id: "imovelweb",
    name: "Imóvel Web",
    description: "Portal com grande alcance nacional",
    color: "#FF6600",
    bgGradient: "from-orange-500 to-orange-700",
    formats: ["XML", "API"],
    status: "active",
  },
  {
    id: "orulo",
    name: "Órulo",
    description: "Marketplace de lançamentos imobiliários",
    color: "#00C2B2",
    bgGradient: "from-teal-500 to-teal-700",
    formats: ["API"],
    status: "active",
  },
  {
    id: "123i",
    name: "123i",
    description: "Portal imobiliário com IA",
    color: "#2563EB",
    bgGradient: "from-blue-500 to-blue-700",
    formats: ["XML"],
    status: "active",
  },
  {
    id: "chavesnamao",
    name: "Chaves na Mão",
    description: "Portal focado em imóveis novos",
    color: "#E31C25",
    bgGradient: "from-red-500 to-red-700",
    formats: ["XML"],
    status: "active",
  },
  {
    id: "trovit",
    name: "Trovit",
    description: "Agregador internacional de imóveis",
    color: "#00B4D8",
    bgGradient: "from-cyan-500 to-cyan-700",
    formats: ["XML"],
    status: "active",
  },
  {
    id: "imocasa",
    name: "Imocasa",
    description: "Portal regional com bom alcance",
    color: "#10B981",
    bgGradient: "from-emerald-500 to-emerald-700",
    formats: ["XML"],
    status: "active",
  },
  {
    id: "casamineira",
    name: "Casa Mineira",
    description: "Maior portal de MG",
    color: "#DC2626",
    bgGradient: "from-red-600 to-red-800",
    formats: ["XML"],
    status: "active",
  },
  {
    id: "lugarcerto",
    name: "Lugar Certo",
    description: "Portal do Estadão",
    color: "#1E40AF",
    bgGradient: "from-blue-700 to-blue-900",
    formats: ["XML"],
    status: "active",
  },
  {
    id: "mercadolivre",
    name: "Mercado Livre",
    description: "Marketplace com seção de imóveis",
    color: "#FFE600",
    bgGradient: "from-emerald-400 to-emerald-600",
    formats: ["API"],
    status: "coming_soon",
  },
  {
    id: "facebook",
    name: "Facebook Marketplace",
    description: "Marketplace do Facebook",
    color: "#1877F2",
    bgGradient: "from-blue-500 to-blue-700",
    formats: ["API"],
    status: "coming_soon",
  },
  {
    id: "google",
    name: "Google Meu Negócio",
    description: "Listagem no Google",
    color: "#4285F4",
    bgGradient: "from-blue-400 to-blue-600",
    formats: ["API"],
    status: "coming_soon",
  },
];

// Status de integração
type IntegrationStatus = "connected" | "disconnected" | "syncing" | "error" | "paused";

interface PortalIntegration {
  portalId: string;
  status: IntegrationStatus;
  lastSync: string | null;
  nextSync: string | null;
  totalProperties: number;
  syncedProperties: number;
  errors: number;
  xmlUrl?: string;
  autoSync: boolean;
  syncInterval: number;
}

export default function PortaisPage() {
  const [integrations, setIntegrations] = useState<PortalIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPortal, setSelectedPortal] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [syncingPortal, setSyncingPortal] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyPortal, setHistoryPortal] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Mapeamento de portal ID → parâmetro do feed
  const portalFeedParam: Record<string, string> = {
    grupozap: "zap",
    imovelweb: "imovelweb",
    chavesnamao: "chavesnamao",
    orulo: "orulo",
  };

  // Buscar dados reais de integrações via API de stats
  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        const res = await fetch("/api/integrations/portals/stats");
        if (!res.ok) throw new Error("Erro ao buscar stats");
        const data = await res.json();
        const totalAvailable = data.stats?.totalImoveisDisponiveis || 0;
        
        // Portais padrão sempre visíveis
        const defaultPortals = ["grupozap", "imovelweb", "chavesnamao"];
        const baseUrl = window.location.origin;
        
        const activeIntegrations: PortalIntegration[] = defaultPortals.map(portalId => {
          const feedParam = portalFeedParam[portalId] || portalId;
          const feedUrl = `${baseUrl}/api/integrations/portals?portal=${feedParam}`;
          
          return {
            portalId,
            status: "connected" as IntegrationStatus,
            lastSync: new Date().toISOString(),
            nextSync: null,
            totalProperties: totalAvailable,
            syncedProperties: totalAvailable,
            errors: 0,
            xmlUrl: feedUrl,
            autoSync: true,
            syncInterval: 24,
          };
        });
        
        setIntegrations(activeIntegrations);
      } catch (error) {
        console.error("Erro ao buscar integrações:", error);
        setIntegrations([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchIntegrations();
  }, []);

  const getPortalById = (id: string) => availablePortals.find((p) => p.id === id);
  const getIntegrationByPortalId = (id: string) => integrations.find((i) => i.portalId === id);

  const handleSync = async (portalId: string) => {
    setSyncingPortal(portalId);
    setTimeout(() => {
      setIntegrations((prev) =>
        prev.map((i) =>
          i.portalId === portalId
            ? {
                ...i,
                status: "connected",
                lastSync: new Date().toISOString(),
                nextSync: new Date(Date.now() + i.syncInterval * 60 * 60 * 1000).toISOString(),
                errors: 0,
              }
            : i
        )
      );
      setSyncingPortal(null);
    }, 2500);
  };

  const handleCopyUrl = (url: string, portalId: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(portalId);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const formatTimeAgo = (date: string | null) => {
    if (!date) return "-";
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) return `${Math.floor(hours / 24)}d atrás`;
    if (hours > 0) return `${hours}h atrás`;
    return `${minutes}min atrás`;
  };

  const connectedIntegrations = integrations.filter((i) => i.status !== "disconnected");
  const totalSynced = integrations.reduce((acc, i) => acc + i.syncedProperties, 0);
  const totalErrors = integrations.reduce((acc, i) => acc + i.errors, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B2545] flex items-center justify-center">
              <RiGlobalLine className="w-5 h-5 text-white" />
            </div>
            Portais Imobiliários
          </h1>
          <p className="text-neutral-500 mt-1">
            Integre e exporte seus imóveis para os principais portais do Brasil
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedPortal(null);
            setShowConfigModal(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all font-medium"
        >
          <RiAddLine className="w-5 h-5" />
          Conectar Portal
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-500 text-sm">Portais Ativos</p>
              <p className="text-3xl font-bold mt-1 text-[#0B2545] dark:text-white">{connectedIntegrations.length}</p>
            </div>
            <div className="w-12 h-12 bg-[#0B2545]/10 dark:bg-[#0B2545]/30 rounded-xl flex items-center justify-center">
              <RiCheckboxCircleLine className="w-6 h-6 text-[#0B2545] dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-500 text-sm">Imóveis Exportados</p>
              <p className="text-3xl font-bold mt-1 text-[#0B2545] dark:text-white">{totalSynced}</p>
            </div>
            <div className="w-12 h-12 bg-[#0B2545]/10 dark:bg-[#0B2545]/30 rounded-xl flex items-center justify-center">
              <RiBuilding2Line className="w-6 h-6 text-[#0B2545] dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-500 text-sm">Sincronização</p>
              <p className="text-3xl font-bold mt-1 text-[#0B2545] dark:text-white">6h</p>
            </div>
            <div className="w-12 h-12 bg-[#0B2545]/10 dark:bg-[#0B2545]/30 rounded-xl flex items-center justify-center">
              <RiRefreshLine className="w-6 h-6 text-[#0B2545] dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-500 text-sm">Erros</p>
              <p className="text-3xl font-bold mt-1 text-red-500">{totalErrors}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 rounded-xl flex items-center justify-center">
              <RiErrorWarningLine className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Integrações Ativas */}
      {connectedIntegrations.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Integrações Ativas
            </h2>
            <button
              onClick={() => integrations.forEach((i) => handleSync(i.portalId))}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <RiRefreshLine className="w-4 h-4" />
              Sincronizar Todos
            </button>
          </div>

          <div className="space-y-2">
            {integrations.map((integration) => {
              const portal = getPortalById(integration.portalId);
              if (!portal) return null;
              const isSyncing = syncingPortal === integration.portalId;

              return (
                <motion.div
                  key={integration.portalId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center p-4 gap-4">
                    {/* Logo */}
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${portal.bgGradient} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                    >
                      {portal.name.charAt(0)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-neutral-900 dark:text-white">
                          {portal.name}
                        </h3>
                        {portal.isGroup && (
                          <span className="px-2 py-0.5 text-[10px] font-medium bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 rounded-full">
                            3 em 1
                          </span>
                        )}
                        {integration.status === "connected" && (
                          <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 rounded-full">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            Ativo
                          </span>
                        )}
                        {integration.status === "error" && (
                          <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 rounded-full">
                            <RiAlertLine className="w-3 h-3" />
                            Erro
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-500 mt-0.5">{portal.description}</p>
                    </div>

                    {/* Stats */}
                    <div className="hidden md:flex items-center gap-6 text-center">
                      <div>
                        <p className="text-xs text-neutral-500">Sincronizados</p>
                        <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                          {integration.syncedProperties}
                          <span className="text-sm text-neutral-400">/{integration.totalProperties}</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">Última Sync</p>
                        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          {formatTimeAgo(integration.lastSync)}
                        </p>
                      </div>
                      {integration.errors > 0 && (
                        <div>
                          <p className="text-xs text-neutral-500">Erros</p>
                          <p className="text-lg font-semibold text-red-500">{integration.errors}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSync(integration.portalId)}
                        disabled={isSyncing}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          isSyncing
                            ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                            : "bg-orange-500 text-white hover:bg-orange-600"
                        }`}
                      >
                        <RiRefreshLine className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
                        {isSyncing ? "Sincronizando..." : "Sync"}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPortal(integration.portalId);
                          setShowConfigModal(true);
                        }}
                        className="p-2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                      >
                        <RiSettings4Line className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* XML URL Bar */}
                  {integration.xmlUrl && (
                    <div className="px-4 pb-4">
                      <div className="flex items-center gap-2 p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                        <RiLink className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                        <code className="flex-1 text-xs text-neutral-600 dark:text-neutral-400 truncate">
                          {integration.xmlUrl}
                        </code>
                        <button
                          onClick={() => handleCopyUrl(integration.xmlUrl!, integration.portalId)}
                          className={`p-1.5 rounded transition-colors ${
                            copiedUrl === integration.portalId
                              ? "bg-green-100 text-green-600"
                              : "hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500"
                          }`}
                        >
                          {copiedUrl === integration.portalId ? (
                            <RiCheckLine className="w-4 h-4" />
                          ) : (
                            <RiFileCopyLine className="w-4 h-4" />
                          )}
                        </button>
                        <a
                          href={integration.xmlUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 rounded transition-colors"
                        >
                          <RiExternalLinkLine className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Portais Disponíveis */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
          Portais Disponíveis
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {availablePortals
              .filter((p) => !integrations.find((i) => i.portalId === p.id))
              .map((portal) => (
                <motion.div
                  key={portal.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  className={`relative p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer transition-all hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-500/50 ${
                    portal.status === "coming_soon" ? "opacity-60" : ""
                  }`}
                  onClick={() => {
                    if (portal.status === "active") {
                      setSelectedPortal(portal.id);
                      setShowConfigModal(true);
                    }
                  }}
                >
                  {portal.status === "coming_soon" && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-medium bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 rounded-full">
                      Em breve
                    </div>
                  )}

                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${portal.bgGradient} flex items-center justify-center text-white font-bold shadow-lg mb-3`}
                  >
                    {portal.name.charAt(0)}
                  </div>

                  <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">
                    {portal.name}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{portal.description}</p>

                  <div className="flex items-center gap-1 mt-3">
                    {portal.formats.map((format) => (
                      <span
                        key={format}
                        className="px-1.5 py-0.5 text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-500 rounded"
                      >
                        {format}
                      </span>
                    ))}
                  </div>

                  {portal.status === "active" && (
                    <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                      <span className="text-xs text-orange-500 font-medium flex items-center gap-1">
                        <RiAddLine className="w-3 h-3" />
                        Conectar
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
          </div>
        )}
      </div>

      {/* Config Modal */}
      <AnimatePresence>
        {showConfigModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => {
                setShowConfigModal(false);
                setSelectedPortal(null);
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {selectedPortal && (
                        <div
                          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${
                            getPortalById(selectedPortal)?.bgGradient
                          } flex items-center justify-center text-white font-bold shadow-lg`}
                        >
                          {getPortalById(selectedPortal)?.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                          {selectedPortal
                            ? `Configurar ${getPortalById(selectedPortal)?.name}`
                            : "Conectar Portal"}
                        </h2>
                        {selectedPortal && (
                          <p className="text-sm text-neutral-500">
                            {getPortalById(selectedPortal)?.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowConfigModal(false);
                        setSelectedPortal(null);
                      }}
                      className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                    >
                      <RiCloseLine className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                  {!selectedPortal ? (
                    <div className="grid grid-cols-2 gap-3">
                      {availablePortals
                        .filter((p) => p.status === "active" && !integrations.find((i) => i.portalId === p.id))
                        .map((portal) => (
                          <button
                            key={portal.id}
                            onClick={() => setSelectedPortal(portal.id)}
                            className="flex items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors text-left"
                          >
                            <div
                              className={`w-10 h-10 rounded-lg bg-gradient-to-br ${portal.bgGradient} flex items-center justify-center text-white font-bold shadow`}
                            >
                              {portal.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-neutral-900 dark:text-white text-sm truncate">
                                {portal.name}
                              </p>
                              <p className="text-xs text-neutral-500 truncate">{portal.description}</p>
                            </div>
                          </button>
                        ))}
                    </div>
                  ) : (
                    <>
                      {/* Formato */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Formato de Exportação
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <label className="flex items-center gap-3 p-3 border-2 border-orange-500 bg-orange-50 dark:bg-orange-500/10 rounded-xl cursor-pointer">
                            <input type="radio" name="format" value="xml" defaultChecked className="hidden" />
                            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white">
                              <RiFileCopyLine className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium text-neutral-900 dark:text-white text-sm">XML Feed</p>
                              <p className="text-xs text-neutral-500">Automático</p>
                            </div>
                          </label>
                          <label className="flex items-center gap-3 p-3 border border-neutral-200 dark:border-neutral-700 rounded-xl cursor-pointer hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors">
                            <input type="radio" name="format" value="api" className="hidden" />
                            <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-neutral-500">
                              <RiLink className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium text-neutral-900 dark:text-white text-sm">API</p>
                              <p className="text-xs text-neutral-500">Integração direta</p>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Intervalo */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Intervalo de Sincronização
                        </label>
                        <select className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm">
                          <option value="1">A cada 1 hora</option>
                          <option value="3">A cada 3 horas</option>
                          <option value="6">A cada 6 horas (recomendado)</option>
                          <option value="12">A cada 12 horas</option>
                          <option value="24">A cada 24 horas</option>
                        </select>
                      </div>

                      {/* Filtros */}
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Filtros de Exportação
                        </label>
                        <div className="space-y-2">
                          {[
                            { id: "active", label: "Apenas imóveis ativos", checked: true },
                            { id: "photos", label: "Apenas imóveis com fotos", checked: true },
                            { id: "fake", label: "Usar endereço fake para portais", checked: false },
                            { id: "price", label: "Apenas imóveis com preço", checked: true },
                          ].map((filter) => (
                            <label
                              key={filter.id}
                              className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                            >
                              <span className="text-sm text-neutral-700 dark:text-neutral-300">
                                {filter.label}
                              </span>
                              <input
                                type="checkbox"
                                defaultChecked={filter.checked}
                                className="w-4 h-4 text-orange-500 rounded border-neutral-300 focus:ring-orange-500"
                              />
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-500/30">
                        <div className="flex items-start gap-3">
                          <RiInformationLine className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                              Como funciona?
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                              Após conectar, você receberá uma URL de XML que deve ser cadastrada no painel do
                              portal. A sincronização é automática e os imóveis serão atualizados conforme o
                              intervalo configurado.
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Footer */}
                {selectedPortal && (
                  <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
                    <button
                      onClick={() => setSelectedPortal(null)}
                      className="flex-1 px-4 py-2.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors font-medium"
                    >
                      Voltar
                    </button>
                    <button
                      onClick={() => {
                        const feedParam = portalFeedParam[selectedPortal] || selectedPortal;
                        const baseUrl = window.location.origin;
                        const totalProps = integrations[0]?.totalProperties || 0;
                        setIntegrations((prev) => [
                          ...prev,
                          {
                            portalId: selectedPortal,
                            status: "connected",
                            lastSync: new Date().toISOString(),
                            nextSync: null,
                            totalProperties: totalProps,
                            syncedProperties: totalProps,
                            errors: 0,
                            xmlUrl: `${baseUrl}/api/integrations/portals?portal=${feedParam}`,
                            autoSync: true,
                            syncInterval: 24,
                          },
                        ]);
                        setShowConfigModal(false);
                        setSelectedPortal(null);
                      }}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all font-medium"
                    >
                      Conectar Portal
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
