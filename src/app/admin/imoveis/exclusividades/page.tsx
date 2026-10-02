"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  RiVipCrownLine,
  RiLoader4Line,
  RiHome4Line,
  RiMapPinLine,
  RiCalendarLine,
  RiTimeLine,
  RiAlertLine,
  RiCheckLine,
  RiSearchLine,
  RiFilterLine,
  RiEyeLine,
  RiArrowRightLine,
  RiRefreshLine,
  RiNotification3Line,
} from "react-icons/ri";

interface ExclusiveProperty {
  id: string;
  code: string;
  title: string;
  thumbnail: string | null;
  neighborhood: string;
  city: string;
  price: number;
  status: string;
  isExclusive: boolean;
  exclusivity?: {
    id: string;
    startDate: string | null;
    endDate: string | null;
    captadorName: string | null;
    gestorName: string | null;
    lastFeedbackDate: string | null;
    feedbackIntervalDays: number | null;
  };
  owner?: {
    name: string;
  };
  propertyOwner?: {
    name: string;
  };
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
};

const getDaysRemaining = (endDate: string | null): number | null => {
  if (!endDate) return null;
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const getDaysSinceLastFeedback = (lastFeedbackDate: string | null): number | null => {
  if (!lastFeedbackDate) return null;
  const last = new Date(lastFeedbackDate);
  const now = new Date();
  const diff = now.getTime() - last.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

export default function ExclusividadesPage() {
  const [properties, setProperties] = useState<ExclusiveProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "expiring" | "expired" | "needsFeedback">("all");

  useEffect(() => {
    fetchExclusiveProperties();
  }, []);

  const fetchExclusiveProperties = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/properties/exclusives");
      if (res.ok) {
        const data = await res.json();
        setProperties(data.properties || []);
      }
    } catch (error) {
      console.error("Erro ao buscar imóveis exclusivos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar propriedades
  const filteredProperties = properties.filter((property) => {
    // Filtro de busca
    const searchMatch = !search || 
      property.code.toLowerCase().includes(search.toLowerCase()) ||
      property.title.toLowerCase().includes(search.toLowerCase()) ||
      property.neighborhood.toLowerCase().includes(search.toLowerCase()) ||
      property.city.toLowerCase().includes(search.toLowerCase());

    if (!searchMatch) return false;

    // Filtro de status
    const daysRemaining = getDaysRemaining(property.exclusivity?.endDate || null);
    const daysSinceFeedback = getDaysSinceLastFeedback(property.exclusivity?.lastFeedbackDate || null);
    const feedbackInterval = property.exclusivity?.feedbackIntervalDays || 7;

    switch (filter) {
      case "active":
        return property.isExclusive && (daysRemaining === null || daysRemaining > 7);
      case "expiring":
        return property.isExclusive && daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 7;
      case "expired":
        return property.isExclusive && daysRemaining !== null && daysRemaining <= 0;
      case "needsFeedback":
        return property.isExclusive && daysSinceFeedback !== null && daysSinceFeedback >= feedbackInterval;
      default:
        return true;
    }
  });

  // Estatísticas
  const stats = {
    total: properties.length,
    active: properties.filter(p => p.isExclusive).length,
    expiring: properties.filter(p => {
      const days = getDaysRemaining(p.exclusivity?.endDate || null);
      return p.isExclusive && days !== null && days > 0 && days <= 7;
    }).length,
    expired: properties.filter(p => {
      const days = getDaysRemaining(p.exclusivity?.endDate || null);
      return p.isExclusive && days !== null && days <= 0;
    }).length,
    needsFeedback: properties.filter(p => {
      const days = getDaysSinceLastFeedback(p.exclusivity?.lastFeedbackDate || null);
      const interval = p.exclusivity?.feedbackIntervalDays || 7;
      return p.isExclusive && days !== null && days >= interval;
    }).length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RiLoader4Line className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
            <RiVipCrownLine className="w-7 h-7 text-purple-500" />
            Imóveis Exclusivos
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Gerencie os imóveis com contrato de exclusividade
          </p>
        </div>

        <button
          onClick={fetchExclusiveProperties}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
        >
          <RiRefreshLine className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <button
          onClick={() => setFilter("all")}
          className={`p-4 rounded-xl border transition-all ${
            filter === "all"
              ? "bg-purple-500 text-white border-purple-500"
              : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-purple-300"
          }`}
        >
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className={`text-xs ${filter === "all" ? "text-white/70" : "text-neutral-500"}`}>Total</p>
        </button>

        <button
          onClick={() => setFilter("active")}
          className={`p-4 rounded-xl border transition-all ${
            filter === "active"
              ? "bg-green-500 text-white border-green-500"
              : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-green-300"
          }`}
        >
          <p className="text-2xl font-bold">{stats.active}</p>
          <p className={`text-xs ${filter === "active" ? "text-white/70" : "text-neutral-500"}`}>Ativos</p>
        </button>

        <button
          onClick={() => setFilter("expiring")}
          className={`p-4 rounded-xl border transition-all ${
            filter === "expiring"
              ? "bg-amber-500 text-white border-amber-500"
              : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-amber-300"
          }`}
        >
          <p className="text-2xl font-bold">{stats.expiring}</p>
          <p className={`text-xs ${filter === "expiring" ? "text-white/70" : "text-neutral-500"}`}>Vencendo</p>
        </button>

        <button
          onClick={() => setFilter("expired")}
          className={`p-4 rounded-xl border transition-all ${
            filter === "expired"
              ? "bg-red-500 text-white border-red-500"
              : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-red-300"
          }`}
        >
          <p className="text-2xl font-bold">{stats.expired}</p>
          <p className={`text-xs ${filter === "expired" ? "text-white/70" : "text-neutral-500"}`}>Vencidos</p>
        </button>

        <button
          onClick={() => setFilter("needsFeedback")}
          className={`p-4 rounded-xl border transition-all ${
            filter === "needsFeedback"
              ? "bg-orange-500 text-white border-orange-500"
              : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-orange-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold">{stats.needsFeedback}</p>
            {stats.needsFeedback > 0 && filter !== "needsFeedback" && (
              <RiNotification3Line className="w-4 h-4 text-orange-500 animate-pulse" />
            )}
          </div>
          <p className={`text-xs ${filter === "needsFeedback" ? "text-white/70" : "text-neutral-500"}`}>Sem Feedback</p>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por código, título, bairro ou cidade..."
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Properties List */}
      <div className="space-y-3">
        {filteredProperties.length === 0 ? (
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-12 text-center">
            <RiVipCrownLine className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
              Nenhum imóvel encontrado
            </h3>
            <p className="text-sm text-neutral-500">
              {filter !== "all" 
                ? "Tente alterar o filtro selecionado"
                : "Não há imóveis exclusivos cadastrados"}
            </p>
          </div>
        ) : (
          filteredProperties.map((property) => {
            const daysRemaining = getDaysRemaining(property.exclusivity?.endDate || null);
            const daysSinceFeedback = getDaysSinceLastFeedback(property.exclusivity?.lastFeedbackDate || null);
            const feedbackInterval = property.exclusivity?.feedbackIntervalDays || 7;
            const needsFeedback = daysSinceFeedback !== null && daysSinceFeedback >= feedbackInterval;
            const isExpired = daysRemaining !== null && daysRemaining <= 0;
            const isExpiring = daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 7;

            return (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white dark:bg-neutral-800 rounded-xl border overflow-hidden ${
                  isExpired
                    ? "border-red-300 dark:border-red-500/50"
                    : isExpiring
                    ? "border-amber-300 dark:border-amber-500/50"
                    : needsFeedback
                    ? "border-orange-300 dark:border-orange-500/50"
                    : "border-neutral-200 dark:border-neutral-700"
                }`}
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Thumbnail */}
                  <div className="sm:w-48 h-32 sm:h-auto flex-shrink-0 bg-neutral-100 dark:bg-neutral-700">
                    {property.thumbnail ? (
                      <Image
                        src={property.thumbnail}
                        alt={property.title}
                        width={200}
                        height={150}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <RiHome4Line className="w-10 h-10 text-neutral-300" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 rounded text-xs font-semibold">
                            {property.code}
                          </span>
                          {!property.isExclusive && (
                            <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-700 text-neutral-500 rounded text-xs">
                              Inativo
                            </span>
                          )}
                          {isExpired && (
                            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 rounded text-xs flex items-center gap-1">
                              <RiAlertLine className="w-3 h-3" />
                              Vencido
                            </span>
                          )}
                          {isExpiring && !isExpired && (
                            <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded text-xs flex items-center gap-1">
                              <RiTimeLine className="w-3 h-3" />
                              {daysRemaining}d restantes
                            </span>
                          )}
                          {needsFeedback && (
                            <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 rounded text-xs flex items-center gap-1 animate-pulse">
                              <RiNotification3Line className="w-3 h-3" />
                              Feedback pendente ({daysSinceFeedback}d)
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-neutral-900 dark:text-white truncate">
                          {property.title}
                        </h3>
                        <p className="text-sm text-neutral-500 flex items-center gap-1">
                          <RiMapPinLine className="w-3 h-3" />
                          {property.neighborhood}, {property.city}
                        </p>
                      </div>

                      <p className="text-lg font-bold text-green-600 dark:text-green-400 flex-shrink-0">
                        {formatCurrency(property.price)}
                      </p>
                    </div>

                    {/* Info Row */}
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-neutral-500">
                      {property.exclusivity?.captadorName && (
                        <span className="flex items-center gap-1">
                          👤 Captador: <strong>{property.exclusivity.captadorName}</strong>
                        </span>
                      )}
                      {property.exclusivity?.gestorName && (
                        <span className="flex items-center gap-1">
                          🎯 Gestor: <strong>{property.exclusivity.gestorName}</strong>
                        </span>
                      )}
                      {property.exclusivity?.startDate && (
                        <span className="flex items-center gap-1">
                          <RiCalendarLine className="w-3 h-3" />
                          Início: {new Date(property.exclusivity.startDate).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                      {property.exclusivity?.endDate && (
                        <span className="flex items-center gap-1">
                          <RiTimeLine className="w-3 h-3" />
                          Término: {new Date(property.exclusivity.endDate).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                      {(property.propertyOwner?.name || property.owner?.name) && (
                        <span className="flex items-center gap-1">
                          🏠 Proprietário: <strong>{property.propertyOwner?.name || property.owner?.name}</strong>
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3">
                      <Link
                        href={`/admin/imoveis/${property.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 bg-purple-500 text-white rounded-lg text-xs font-medium hover:bg-purple-600 transition-colors"
                      >
                        <RiEyeLine className="w-3 h-3" />
                        Ver Ficha
                      </Link>
                      {needsFeedback && (
                        <Link
                          href={`/admin/imoveis/${property.id}?tab=exclusividade`}
                          className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600 transition-colors"
                        >
                          <RiNotification3Line className="w-3 h-3" />
                          Enviar Feedback
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
