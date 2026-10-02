"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiGlobalLine,
  RiRefreshLine,
  RiCheckLine,
  RiTimeLine,
  RiSettings4Line,
  RiExternalLinkLine,
  RiHome4Line,
  RiEyeLine,
  RiLineChartLine,
  RiDownloadLine,
  RiFileCopyLine,
  RiStarLine,
  RiLoader4Line,
} from "react-icons/ri";

type PortalStat = {
  id: string;
  nome: string;
  grupo: string | null;
  imoveisPublicados: number;
  destaques: number;
  visualizacoes: number;
};

type StatsData = {
  stats: {
    portaisAtivos: number;
    totalPublicados: number;
    totalViews: number;
    totalImoveisDisponiveis: number;
  };
  portais: PortalStat[];
};

const PORTAL_META: Record<string, { logo: string; color: string; url: string; feedFormat: string }> = {
  zap: { logo: "🏠", color: "from-orange-500 to-red-500", url: "https://www.zapimoveis.com.br", feedFormat: "xml" },
  vivareal: { logo: "🏡", color: "from-purple-500 to-pink-500", url: "https://www.vivareal.com.br", feedFormat: "xml" },
  olx: { logo: "📦", color: "from-purple-600 to-blue-600", url: "https://www.olx.com.br", feedFormat: "json" },
  imovelweb: { logo: "🌐", color: "from-blue-500 to-blue-600", url: "https://www.imovelweb.com.br", feedFormat: "xml" },
  chavesnamao: { logo: "🔑", color: "from-emerald-500 to-emerald-600", url: "https://www.chavesnamao.com.br", feedFormat: "xml" },
  trovit: { logo: "�", color: "from-green-500 to-green-600", url: "https://www.trovit.com.br", feedFormat: "xml" },
  "123i": { logo: "🔢", color: "from-cyan-500 to-cyan-600", url: "https://www.123i.com.br", feedFormat: "xml" },
  casaminheira: { logo: "🏡", color: "from-red-500 to-red-600", url: "https://www.casaminheira.com.br", feedFormat: "xml" },
  lugarcerto: { logo: "📍", color: "from-indigo-500 to-indigo-600", url: "https://www.lugarcerto.com.br", feedFormat: "xml" },
};

export default function PortaisPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncingPortal, setSyncingPortal] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/integrations/portals/stats");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error("Erro ao buscar stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleDownloadFeed = async (portalId: string) => {
    setSyncingPortal(portalId);
    try {
      const response = await fetch(`/api/integrations/portals?portal=${portalId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        const ext = PORTAL_META[portalId]?.feedFormat === "json" ? "json" : "xml";
        a.href = url;
        a.download = `imoveis_${portalId}.${ext}`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Erro ao exportar:", error);
    }
    setSyncingPortal(null);
  };

  const handleCopyFeedUrl = (portalId: string) => {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/api/integrations/portals?portal=${portalId}`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(portalId);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const formatViews = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return String(n);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RiLoader4Line className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const stats = data?.stats;
  const portais = data?.portais || [];

  const statsCards = [
    { label: "Portais com Imóveis", value: String(stats?.portaisAtivos || 0), icon: RiGlobalLine, cor: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-500/20" },
    { label: "Imóveis nos Portais", value: String(stats?.totalPublicados || 0), icon: RiHome4Line, cor: "text-green-500", bg: "bg-green-100 dark:bg-green-500/20" },
    { label: "Views nos Portais", value: formatViews(stats?.totalViews || 0), icon: RiEyeLine, cor: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-500/20" },
    { label: "Total Disponíveis", value: String(stats?.totalImoveisDisponiveis || 0), icon: RiLineChartLine, cor: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-500/20" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/integracoes" className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500">
            <RiArrowLeftLine className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-emerald-500 flex items-center justify-center">
                <RiGlobalLine className="w-5 h-5 text-white" />
              </div>
              Portais Imobiliários
            </h1>
            <p className="text-neutral-500 mt-1">Gerencie os feeds de exportação para portais</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/integracoes/portais/atribuir"
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600"
          >
            <RiCheckLine className="w-4 h-4" />
            Atribuir em Massa
          </Link>
          <button
            onClick={fetchStats}
            className="flex items-center gap-2 h-10 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            <RiRefreshLine className="w-4 h-4" />
            Atualizar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.cor}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-neutral-500">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Portais Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {portais.map((portal, index) => {
          const meta = PORTAL_META[portal.id] || { logo: "🌐", color: "from-gray-500 to-gray-600", url: "#", feedFormat: "xml" };
          const isSyncing = syncingPortal === portal.id;
          const hasProperties = portal.imoveisPublicados > 0;

          return (
            <motion.div
              key={portal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.03 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
            >
              {/* Portal Header */}
              <div className="p-4 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-2xl">
                    {meta.logo}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-neutral-900 dark:text-white">{portal.nome}</h3>
                      {hasProperties && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-500/20 text-green-600">
                          <RiCheckLine className="w-3 h-3" />
                          Ativo
                        </span>
                      )}
                    </div>
                    {portal.grupo && (
                      <p className="text-xs text-neutral-400">{portal.grupo}</p>
                    )}
                  </div>
                </div>
                <a
                  href={meta.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-orange-500"
                >
                  <RiExternalLinkLine className="w-5 h-5" />
                </a>
              </div>

              {/* Stats */}
              <div className="p-4 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className={`text-xl font-bold ${hasProperties ? "text-green-600" : "text-neutral-300"}`}>{portal.imoveisPublicados}</p>
                  <p className="text-xs text-neutral-500">Publicados</p>
                </div>
                <div className="text-center">
                  <p className={`text-xl font-bold ${portal.destaques > 0 ? "text-amber-500" : "text-neutral-300"}`}>{portal.destaques}</p>
                  <p className="text-xs text-neutral-500 flex items-center justify-center gap-1">
                    <RiStarLine className="w-3 h-3" /> Destaques
                  </p>
                </div>
                <div className="text-center">
                  <p className={`text-xl font-bold ${portal.visualizacoes > 0 ? "text-blue-600" : "text-neutral-300"}`}>{formatViews(portal.visualizacoes)}</p>
                  <p className="text-xs text-neutral-500">Views</p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-neutral-400">
                  <RiTimeLine className="w-3.5 h-3.5" />
                  Feed: {meta.feedFormat.toUpperCase()}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopyFeedUrl(portal.id)}
                    className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-600"
                    title="Copiar URL do feed"
                  >
                    {copiedUrl === portal.id ? (
                      <RiCheckLine className="w-4 h-4 text-green-500" />
                    ) : (
                      <RiFileCopyLine className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDownloadFeed(portal.id)}
                    disabled={isSyncing || !hasProperties}
                    className="p-2 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-500/20 text-neutral-400 hover:text-orange-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Baixar feed"
                  >
                    {isSyncing ? (
                      <RiRefreshLine className="w-4 h-4 animate-spin" />
                    ) : (
                      <RiDownloadLine className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => window.open(`/api/integrations/portals?portal=${portal.id}`, "_blank")}
                    disabled={!hasProperties}
                    className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 text-neutral-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Visualizar feed"
                  >
                    <RiSettings4Line className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Feed URLs Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-6 bg-gradient-to-r from-orange-50 to-emerald-50 dark:from-orange-500/10 dark:to-emerald-500/10 rounded-2xl border border-orange-200 dark:border-orange-500/20"
      >
        <h3 className="font-bold text-orange-800 dark:text-orange-400 mb-2">URLs dos Feeds para cadastro nos Portais</h3>
        <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
          Use estas URLs para cadastrar o feed no painel de cada portal. Os feeds são atualizados automaticamente.
        </p>
        <div className="space-y-2 text-xs font-mono">
          {portais.filter(p => p.imoveisPublicados > 0).map(p => (
            <div key={p.id} className="flex items-center gap-2 bg-white/60 dark:bg-neutral-900/60 px-3 py-2 rounded-lg">
              <span className="font-bold text-neutral-600 dark:text-neutral-300 w-24 flex-shrink-0">{p.nome}:</span>
              <span className="text-neutral-500 truncate">{window.location.origin}/api/integrations/portals?portal={p.id}</span>
              <button
                onClick={() => handleCopyFeedUrl(p.id)}
                className="flex-shrink-0 p-1 rounded hover:bg-orange-200 dark:hover:bg-orange-500/30"
              >
                {copiedUrl === p.id ? <RiCheckLine className="w-3.5 h-3.5 text-green-500" /> : <RiFileCopyLine className="w-3.5 h-3.5 text-orange-500" />}
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
