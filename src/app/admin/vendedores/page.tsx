"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  RiUser3Line,
  RiLoader4Line,
  RiSearchLine,
  RiHome4Line,
  RiMoneyDollarCircleLine,
  RiPhoneLine,
  RiMailLine,
  RiArrowRightLine,
  RiArrowLeftLine,
  RiFilterLine,
  RiRefreshLine,
  RiAddLine,
  RiEyeLine,
  RiEditLine,
  RiCheckLine,
  RiCloseLine,
} from "react-icons/ri";

interface PropertyOwner {
  id: string;
  name: string;
  email: string | null;
  phones: string[];
  cpf: string | null;
  profile: string;
  createdAt: string;
  _count: { properties: number };
  properties: {
    id: string;
    code: string;
    title: string;
    price: number;
    status: string;
    category: string;
    thumbnail: string | null;
    address: string;
    neighborhood: string;
    city: string;
  }[];
  patrimony: {
    totalValue: number;
    totalProperties: number;
    activeProperties: number;
    soldProperties: number;
  };
}

interface Stats {
  totalOwners: number;
  ownersWithMultiple: number;
  totalPatrimony: number;
  avgPropertiesPerOwner: number;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
};

const statusColors: Record<string, string> = {
  DISPONIVEL: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  VENDIDO: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  ALUGADO: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
  SUSPENSO: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  INATIVO: "bg-neutral-100 text-neutral-700 dark:bg-neutral-500/20 dark:text-neutral-400",
};

export default function VendedoresPage() {
  const [owners, setOwners] = useState<PropertyOwner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [search, setSearch] = useState("");
  const [minProperties, setMinProperties] = useState(1);
  const [sortBy, setSortBy] = useState("properties");
  const [expandedOwner, setExpandedOwner] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOwners();
  }, [search, minProperties, sortBy, page]);

  const fetchOwners = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "30",
        sortBy,
        minProperties: String(minProperties),
      });
      if (search) params.set("search", search);

      const res = await fetch(`/api/admin/property-owners?${params}`);
      if (res.ok) {
        const data = await res.json();
        setOwners(data.owners || []);
        setStats(data.stats || null);
        setTotalPages(data.pages || 1);
      }
    } catch (error) {
      console.error("Erro ao buscar vendedores:", error);
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
              <RiUser3Line className="w-7 h-7 text-emerald-500" />
              Gestão de Vendedores
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Proprietários agrupados por patrimônio
            </p>
          </div>
        </div>

        <button
          onClick={fetchOwners}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
        >
          <RiRefreshLine className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <p className="text-3xl font-bold text-neutral-900 dark:text-white">{stats.totalOwners}</p>
            <p className="text-xs text-neutral-500">Total de Vendedores</p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30">
            <p className="text-3xl font-bold text-emerald-600">{stats.ownersWithMultiple}</p>
            <p className="text-xs text-emerald-600">Com 2+ Imóveis</p>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <p className="text-3xl font-bold text-neutral-900 dark:text-white">{stats.avgPropertiesPerOwner}</p>
            <p className="text-xs text-neutral-500">Média de Imóveis/Vendedor</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30">
            <p className="text-2xl font-bold text-amber-600">{formatCurrency(stats.totalPatrimony)}</p>
            <p className="text-xs text-amber-600">Patrimônio Total</p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou CPF..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={minProperties}
            onChange={(e) => { setMinProperties(Number(e.target.value)); setPage(1); }}
            className="px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm"
          >
            <option value={1}>1+ imóveis</option>
            <option value={2}>2+ imóveis</option>
            <option value={3}>3+ imóveis</option>
            <option value={5}>5+ imóveis</option>
            <option value={10}>10+ imóveis</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm"
          >
            <option value="properties">Mais imóveis</option>
            <option value="name">Nome A-Z</option>
            <option value="createdAt">Mais recentes</option>
          </select>
        </div>
      </div>

      {/* Lista de Vendedores */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <RiLoader4Line className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : owners.length === 0 ? (
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-12 text-center">
          <RiUser3Line className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
            Nenhum vendedor encontrado
          </h3>
          <p className="text-sm text-neutral-500">
            Ajuste os filtros ou cadastre novos vendedores
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {owners.map((owner) => (
            <motion.div
              key={owner.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden"
            >
              {/* Header do Vendedor */}
              <button
                onClick={() => setExpandedOwner(expandedOwner === owner.id ? null : owner.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-emerald-600">
                      {owner.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-neutral-900 dark:text-white">{owner.name}</p>
                    <div className="flex items-center gap-3 text-sm text-neutral-500">
                      {owner.phones[0] && (
                        <span className="flex items-center gap-1">
                          <RiPhoneLine className="w-3 h-3" />
                          {formatPhone(owner.phones[0])}
                        </span>
                      )}
                      {owner.email && (
                        <span className="flex items-center gap-1">
                          <RiMailLine className="w-3 h-3" />
                          {owner.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Patrimônio */}
                  <div className="text-right hidden sm:block">
                    <p className="text-lg font-bold text-amber-600">
                      {formatCurrency(owner.patrimony.totalValue)}
                    </p>
                    <p className="text-xs text-neutral-500">Patrimônio</p>
                  </div>

                  {/* Contadores */}
                  <div className="flex items-center gap-3">
                    <div className="text-center px-3 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                      <p className="text-lg font-bold text-emerald-600">{owner.patrimony.totalProperties}</p>
                      <p className="text-[10px] text-emerald-600">Imóveis</p>
                    </div>
                    <div className="text-center px-3 py-1 rounded-lg bg-green-100 dark:bg-green-500/20">
                      <p className="text-lg font-bold text-green-600">{owner.patrimony.activeProperties}</p>
                      <p className="text-[10px] text-green-600">Ativos</p>
                    </div>
                    <div className="text-center px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-500/20">
                      <p className="text-lg font-bold text-blue-600">{owner.patrimony.soldProperties}</p>
                      <p className="text-[10px] text-blue-600">Vendidos</p>
                    </div>
                  </div>

                  <RiArrowRightLine className={`w-5 h-5 text-neutral-400 transition-transform ${
                    expandedOwner === owner.id ? "rotate-90" : ""
                  }`} />
                </div>
              </button>

              {/* Lista de Imóveis do Vendedor */}
              <AnimatePresence>
                {expandedOwner === owner.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-neutral-200 dark:border-neutral-700"
                  >
                    <div className="p-4">
                      <h4 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-3 flex items-center gap-2">
                        <RiHome4Line className="w-4 h-4" />
                        Imóveis do Vendedor
                      </h4>
                      <div className="grid gap-3">
                        {owner.properties.map((property) => (
                          <div
                            key={property.id}
                            className="flex items-center gap-4 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600"
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
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 bg-neutral-200 dark:bg-neutral-600 rounded text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                  {property.code}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-xs ${statusColors[property.status] || "bg-neutral-100 text-neutral-700"}`}>
                                  {property.status}
                                </span>
                              </div>
                              <p className="font-medium text-neutral-900 dark:text-white truncate text-sm">
                                {property.title}
                              </p>
                              <p className="text-xs text-neutral-500 truncate">
                                {property.address}, {property.neighborhood} - {property.city}
                              </p>
                            </div>

                            {/* Preço e Ações */}
                            <div className="text-right">
                              <p className="font-bold text-emerald-600">{formatCurrency(property.price)}</p>
                              <Link
                                href={`/admin/imoveis/${property.id}`}
                                className="text-xs text-blue-500 hover:underline"
                              >
                                Ver imóvel →
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
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
    </div>
  );
}
