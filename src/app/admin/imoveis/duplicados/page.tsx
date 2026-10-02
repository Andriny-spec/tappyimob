"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  RiAlertLine,
  RiLoader4Line,
  RiHome4Line,
  RiMapPinLine,
  RiEyeLine,
  RiArrowRightLine,
  RiRefreshLine,
  RiCheckLine,
  RiHistoryLine,
  RiUser3Line,
  RiTimeLine,
  RiArrowLeftLine,
} from "react-icons/ri";

interface DuplicateProperty {
  id: string;
  code: string;
  title: string;
  address: string;
  number: string | null;
  neighborhood: string;
  city: string;
  status: string;
  price: number;
  thumbnail: string | null;
  type: string;
  category: string;
  createdAt: string;
  hasActiveStatus: boolean;
  hasSuffix?: boolean;
  propertyOwner?: { id: string; name: string } | null;
  owner?: { id: string; name: string } | null;
}

interface DuplicateGroup {
  address: string;
  count: number;
  properties: DuplicateProperty[];
  hasMultipleActive: boolean;
}

interface CodeDuplicateGroup {
  baseCode: string;
  count: number;
  properties: DuplicateProperty[];
  hasMultipleActive: boolean;
}

interface OwnerHistoryEntry {
  id: string;
  type: string;
  name: string;
  phone?: string;
  email?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
  createdAt: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
};

const statusLabels: Record<string, { label: string; color: string }> = {
  DISPONIVEL: { label: "Disponível", color: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" },
  VENDIDO: { label: "Vendido", color: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" },
  ALUGADO: { label: "Alugado", color: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400" },
  SUSPENSO: { label: "Suspenso", color: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" },
  INATIVO: { label: "Indisponível", color: "bg-neutral-100 text-neutral-700 dark:bg-neutral-500/20 dark:text-neutral-400" },
};

export default function DuplicadosPage() {
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [codeDuplicates, setCodeDuplicates] = useState<CodeDuplicateGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ totalGroups: 0, totalProperties: 0, groupsWithMultipleActive: 0 });
  const [codeStats, setCodeStats] = useState({ totalGroups: 0, totalProperties: 0, groupsWithMultipleActive: 0 });
  const [onlyActive, setOnlyActive] = useState(false);
  const [activeTab, setActiveTab] = useState<"code" | "address">("code");
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [ownerHistory, setOwnerHistory] = useState<OwnerHistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchDuplicates();
  }, [onlyActive]);

  const fetchDuplicates = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/properties/duplicates?onlyActive=${onlyActive}`);
      if (res.ok) {
        const data = await res.json();
        setDuplicates(data.duplicates || []);
        setCodeDuplicates(data.codeDuplicates || []);
        setStats(data.stats || { totalGroups: 0, totalProperties: 0, groupsWithMultipleActive: 0 });
        setCodeStats(data.codeStats || { totalGroups: 0, totalProperties: 0, groupsWithMultipleActive: 0 });
      }
    } catch (error) {
      console.error("Erro ao buscar duplicados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOwnerHistory = async (propertyId: string) => {
    setLoadingHistory(true);
    setSelectedProperty(propertyId);
    try {
      const res = await fetch(`/api/admin/properties/${propertyId}/owner-history`);
      if (res.ok) {
        const data = await res.json();
        setOwnerHistory(data.history || []);
      }
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      setOwnerHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RiLoader4Line className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/imoveis"
            className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            <RiArrowLeftLine className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
              <RiAlertLine className="w-7 h-7 text-red-500" />
              Imóveis Duplicados
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Imóveis com mesmo endereço que podem estar duplicados
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyActive}
              onChange={(e) => setOnlyActive(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-300"
            />
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Apenas ativos</span>
          </label>
          <button
            onClick={fetchDuplicates}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
          >
            <RiRefreshLine className="w-4 h-4" />
            Atualizar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl w-fit">
        <button
          onClick={() => { setActiveTab("code"); setExpandedGroup(null); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === "code"
              ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
              : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          }`}
        >
          🏷️ Por Código (-2)
          {codeStats.totalGroups > 0 && (
            <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-500/20 text-red-600 text-xs rounded-full">{codeStats.totalGroups}</span>
          )}
        </button>
        <button
          onClick={() => { setActiveTab("address"); setExpandedGroup(null); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === "address"
              ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
              : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          }`}
        >
          📍 Por Endereço
          {stats.totalGroups > 0 && (
            <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-500/20 text-amber-600 text-xs rounded-full">{stats.totalGroups}</span>
          )}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <p className="text-3xl font-bold text-neutral-900 dark:text-white">
            {activeTab === "code" ? codeStats.totalGroups : stats.totalGroups}
          </p>
          <p className="text-xs text-neutral-500">
            {activeTab === "code" ? "Códigos Duplicados" : "Grupos com Duplicidade"}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <p className="text-3xl font-bold text-neutral-900 dark:text-white">
            {activeTab === "code" ? codeStats.totalProperties : stats.totalProperties}
          </p>
          <p className="text-xs text-neutral-500">Imóveis Envolvidos</p>
        </div>
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30">
          <p className="text-3xl font-bold text-red-600">
            {activeTab === "code" ? codeStats.groupsWithMultipleActive : stats.groupsWithMultipleActive}
          </p>
          <p className="text-xs text-red-600">⚠️ Com Múltiplos Ativos</p>
        </div>
      </div>

      {/* Lista de Duplicados por CÓDIGO */}
      {activeTab === "code" && (
        <div className="space-y-4">
          {codeDuplicates.length === 0 ? (
            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-12 text-center">
              <RiCheckLine className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
                Nenhum código duplicado encontrado
              </h3>
              <p className="text-sm text-neutral-500">
                Não há imóveis com códigos terminando em -2, -3, etc.
              </p>
            </div>
          ) : (
            codeDuplicates.map((group) => (
              <motion.div
                key={group.baseCode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white dark:bg-neutral-800 rounded-xl border overflow-hidden ${
                  group.hasMultipleActive
                    ? "border-red-300 dark:border-red-500/50"
                    : "border-neutral-200 dark:border-neutral-700"
                }`}
              >
                <button
                  onClick={() => setExpandedGroup(expandedGroup === group.baseCode ? null : group.baseCode)}
                  className="w-full p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      group.hasMultipleActive 
                        ? "bg-red-100 dark:bg-red-500/20 text-red-600" 
                        : "bg-orange-100 dark:bg-orange-500/20 text-orange-600"
                    }`}>
                      <RiAlertLine className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-neutral-900 dark:text-white text-lg">{group.baseCode}</span>
                        {group.properties.filter(p => p.hasSuffix).map(p => (
                          <span key={p.code} className="px-2 py-0.5 bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 rounded text-xs font-mono font-semibold">
                            {p.code}
                          </span>
                        ))}
                        {group.hasMultipleActive && (
                          <span className="px-2 py-0.5 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 rounded text-xs flex items-center gap-1">
                            <RiAlertLine className="w-3 h-3" />
                            Múltiplos Ativos
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-500">
                        {group.count} imóveis • {group.properties[0]?.neighborhood}, {group.properties[0]?.city}
                      </p>
                    </div>
                  </div>
                  <RiArrowRightLine className={`w-5 h-5 text-neutral-400 transition-transform ${
                    expandedGroup === group.baseCode ? "rotate-90" : ""
                  }`} />
                </button>

                <AnimatePresence>
                  {expandedGroup === group.baseCode && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-neutral-200 dark:border-neutral-700"
                    >
                      <div className="p-4 space-y-3">
                        {group.properties.map((property) => (
                          <div
                            key={property.id}
                            className={`flex flex-col sm:flex-row sm:items-center gap-4 p-3 rounded-xl border ${
                              property.hasSuffix
                                ? "bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/30"
                                : property.hasActiveStatus && group.hasMultipleActive
                                  ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30"
                                  : "bg-neutral-50 dark:bg-neutral-700/50 border-neutral-200 dark:border-neutral-600"
                            }`}
                          >
                            <div className="w-16 h-16 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex-shrink-0 overflow-hidden">
                              {property.thumbnail ? (
                                <img src={property.thumbnail} alt={property.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <RiHome4Line className="w-6 h-6 text-neutral-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                                  property.hasSuffix
                                    ? "bg-orange-200 dark:bg-orange-600/30 text-orange-800 dark:text-orange-300"
                                    : "bg-neutral-200 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-300"
                                }`}>
                                  {property.code}
                                  {property.hasSuffix && " ← duplicado"}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-xs ${statusLabels[property.status]?.color || "bg-neutral-100 text-neutral-700"}`}>
                                  {statusLabels[property.status]?.label || property.status}
                                </span>
                              </div>
                              <p className="font-medium text-neutral-900 dark:text-white truncate">{property.title}</p>
                              <div className="flex items-center gap-4 text-sm text-neutral-500 mt-1">
                                <span>{formatCurrency(property.price)}</span>
                                {property.owner && (
                                  <span className="flex items-center gap-1">
                                    <RiUser3Line className="w-3 h-3" />
                                    {property.owner.name}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <RiTimeLine className="w-3 h-3" />
                                  {new Date(property.createdAt).toLocaleDateString("pt-BR")}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/admin/imoveis/${property.id}`}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-neutral-100 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-500 transition-colors"
                              >
                                <RiEyeLine className="w-4 h-4" />
                                Ver
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Lista de Duplicados por ENDEREÇO */}
      {activeTab === "address" && <div className="space-y-4">
        {duplicates.length === 0 ? (
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-12 text-center">
            <RiCheckLine className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
              Nenhuma duplicidade encontrada
            </h3>
            <p className="text-sm text-neutral-500">
              Todos os imóveis possuem endereços únicos
            </p>
          </div>
        ) : (
          duplicates.map((group) => (
            <motion.div
              key={group.address}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white dark:bg-neutral-800 rounded-xl border overflow-hidden ${
                group.hasMultipleActive
                  ? "border-red-300 dark:border-red-500/50"
                  : "border-neutral-200 dark:border-neutral-700"
              }`}
            >
              {/* Header do Grupo */}
              <button
                onClick={() => setExpandedGroup(expandedGroup === group.address ? null : group.address)}
                className="w-full p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    group.hasMultipleActive 
                      ? "bg-red-100 dark:bg-red-500/20 text-red-600" 
                      : "bg-amber-100 dark:bg-amber-500/20 text-amber-600"
                  }`}>
                    <RiMapPinLine className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-neutral-900 dark:text-white">
                        {group.properties[0].address}, {group.properties[0].number || "S/N"}
                      </p>
                      {group.hasMultipleActive && (
                        <span className="px-2 py-0.5 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 rounded text-xs flex items-center gap-1">
                          <RiAlertLine className="w-3 h-3" />
                          Múltiplos Ativos
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-500">
                      {group.properties[0].neighborhood}, {group.properties[0].city} • <strong>{group.count} imóveis</strong>
                    </p>
                  </div>
                </div>
                <RiArrowRightLine className={`w-5 h-5 text-neutral-400 transition-transform ${
                  expandedGroup === group.address ? "rotate-90" : ""
                }`} />
              </button>

              {/* Lista de Imóveis do Grupo */}
              <AnimatePresence>
                {expandedGroup === group.address && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-neutral-200 dark:border-neutral-700"
                  >
                    <div className="p-4 space-y-3">
                      {group.properties.map((property) => (
                        <div
                          key={property.id}
                          className={`flex flex-col sm:flex-row sm:items-center gap-4 p-3 rounded-xl border ${
                            property.hasActiveStatus && group.hasMultipleActive
                              ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30"
                              : "bg-neutral-50 dark:bg-neutral-700/50 border-neutral-200 dark:border-neutral-600"
                          }`}
                        >
                          {/* Thumbnail */}
                          <div className="w-16 h-16 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex-shrink-0 overflow-hidden">
                            {property.thumbnail ? (
                              <img
                                src={property.thumbnail}
                                alt={property.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <RiHome4Line className="w-6 h-6 text-neutral-400" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="px-2 py-0.5 bg-neutral-200 dark:bg-neutral-600 rounded text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                {property.code}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-xs ${statusLabels[property.status]?.color || "bg-neutral-100 text-neutral-700"}`}>
                                {statusLabels[property.status]?.label || property.status}
                              </span>
                            </div>
                            <p className="font-medium text-neutral-900 dark:text-white truncate">
                              {property.title}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-neutral-500 mt-1">
                              <span>{formatCurrency(property.price)}</span>
                              {property.owner && (
                                <span className="flex items-center gap-1">
                                  <RiUser3Line className="w-3 h-3" />
                                  {property.owner.name}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <RiTimeLine className="w-3 h-3" />
                                {new Date(property.createdAt).toLocaleDateString("pt-BR")}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => fetchOwnerHistory(property.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-500/30 transition-colors"
                            >
                              <RiHistoryLine className="w-4 h-4" />
                              Timeline
                            </button>
                            <Link
                              href={`/admin/imoveis/${property.id}`}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-neutral-100 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-500 transition-colors"
                            >
                              <RiEyeLine className="w-4 h-4" />
                              Ver
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>}

      {/* Modal de Timeline de Proprietários */}
      <AnimatePresence>
        {selectedProperty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedProperty(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden"
            >
              <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                <h3 className="font-semibold text-lg text-neutral-900 dark:text-white flex items-center gap-2">
                  <RiHistoryLine className="w-5 h-5 text-purple-500" />
                  Timeline de Proprietários
                </h3>
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 overflow-y-auto max-h-[60vh]">
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-8">
                    <RiLoader4Line className="w-6 h-6 animate-spin text-purple-500" />
                  </div>
                ) : ownerHistory.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500">
                    <RiUser3Line className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                    <p>Nenhum histórico de proprietários registrado</p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-purple-200 dark:bg-purple-800" />

                    {/* Timeline Items */}
                    <div className="space-y-4">
                      {ownerHistory.map((entry, index) => (
                        <div key={entry.id} className="relative pl-10">
                          {/* Timeline Dot */}
                          <div className={`absolute left-2 w-5 h-5 rounded-full border-2 ${
                            entry.type === "ATUAL"
                              ? "bg-green-500 border-green-300"
                              : entry.type === "PREFEITURA"
                              ? "bg-blue-500 border-blue-300"
                              : "bg-neutral-400 border-neutral-300"
                          }`} />

                          <div className="bg-neutral-50 dark:bg-neutral-700/50 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                entry.type === "ATUAL"
                                  ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                                  : entry.type === "PREFEITURA"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                                  : "bg-neutral-200 text-neutral-700 dark:bg-neutral-600 dark:text-neutral-300"
                              }`}>
                                {entry.type === "ATUAL" ? "Proprietário Atual" : entry.type === "PREFEITURA" ? "Prefeitura" : "Proprietário Anterior"}
                              </span>
                            </div>
                            <p className="font-semibold text-neutral-900 dark:text-white">{entry.name}</p>
                            {(entry.phone || entry.email) && (
                              <p className="text-sm text-neutral-500 mt-1">
                                {entry.phone && <span>{entry.phone}</span>}
                                {entry.phone && entry.email && <span> • </span>}
                                {entry.email && <span>{entry.email}</span>}
                              </p>
                            )}
                            {(entry.startDate || entry.endDate) && (
                              <p className="text-xs text-neutral-400 mt-2 flex items-center gap-1">
                                <RiTimeLine className="w-3 h-3" />
                                {entry.startDate && new Date(entry.startDate).toLocaleDateString("pt-BR")}
                                {entry.startDate && entry.endDate && " — "}
                                {entry.endDate && new Date(entry.endDate).toLocaleDateString("pt-BR")}
                              </p>
                            )}
                            {entry.notes && (
                              <p className="text-sm text-neutral-500 mt-2 italic">
                                {entry.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
