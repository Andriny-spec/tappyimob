"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  RiArrowLeftLine,
  RiGlobalLine,
  RiSearchLine,
  RiCheckLine,
  RiCheckboxMultipleLine,
  RiCheckboxBlankLine,
  RiCheckboxLine,
  RiLoader4Line,
  RiFilterLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiStarLine,
  RiHome4Line,
} from "react-icons/ri";

type Property = {
  id: string;
  code: string;
  title: string;
  type: string;
  category: string;
  price: number;
  rentPrice: number | null;
  neighborhood: string;
  city: string;
  state: string;
  thumbnail: string | null;
  activePortals: string[];
  portalPositions: Record<string, string> | null;
  bedrooms: number;
  area: number;
  condominium: { name: string } | null;
};

const PORTAIS = [
  { id: "zap", nome: "ZAP+", desc: "ZAP + VivaReal + OLX" },
  { id: "imovelweb", nome: "Imóvel Web", desc: "" },
  { id: "chavesnamao", nome: "Chaves na Mão", desc: "" },
  { id: "trovit", nome: "Trovit", desc: "" },
  { id: "123i", nome: "123i", desc: "" },
  { id: "casaminheira", nome: "Casa Mineira", desc: "" },
  { id: "lugarcerto", nome: "Lugar Certo", desc: "" },
];

const TIPOS = [
  { value: "", label: "Todos os tipos" },
  { value: "APARTAMENTO", label: "Apartamento" },
  { value: "CASA", label: "Casa" },
  { value: "TERRENO", label: "Terreno" },
  { value: "COMERCIAL", label: "Comercial" },
  { value: "COBERTURA", label: "Cobertura" },
  { value: "SOBRADO", label: "Sobrado" },
  { value: "KITNET", label: "Kitnet" },
  { value: "LOFT", label: "Loft" },
  { value: "FLAT", label: "Flat" },
];

export default function AtribuirPortaisPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filtros
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [portalFilter, setPortalFilter] = useState("");
  const [noPortalFilter, setNoPortalFilter] = useState(false);

  // Seleção
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Portais a atribuir
  const [portaisToAssign, setPortaisToAssign] = useState<Set<string>>(new Set());
  const [position, setPosition] = useState<string>("simples");
  const [action, setAction] = useState<"add" | "remove" | "set">("add");

  // Resultado
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "50",
      });
      if (search) params.set("search", search);
      if (typeFilter) params.set("type", typeFilter);
      if (portalFilter) params.set("portal", portalFilter);
      if (noPortalFilter) params.set("noPortal", "true");

      const res = await fetch(`/api/admin/properties/bulk-portals?${params}`);
      if (res.ok) {
        const data = await res.json();
        setProperties(data.properties);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, typeFilter, portalFilter, noPortalFilter]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  useEffect(() => {
    setPage(1);
  }, [search, typeFilter, portalFilter, noPortalFilter]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelected(new Set());
    } else {
      setSelected(new Set(properties.map((p) => p.id)));
    }
    setSelectAll(!selectAll);
  };

  const togglePortal = (id: string) => {
    setPortaisToAssign((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleApply = async () => {
    if (selected.size === 0) {
      setResult({ success: false, message: "Selecione pelo menos um imóvel" });
      return;
    }
    if (portaisToAssign.size === 0) {
      setResult({ success: false, message: "Selecione pelo menos um portal" });
      return;
    }

    setApplying(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/properties/bulk-portals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyIds: Array.from(selected),
          portals: Array.from(portaisToAssign),
          position,
          action,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult({ success: true, message: data.message });
        setSelected(new Set());
        setSelectAll(false);
        fetchProperties();
      } else {
        setResult({ success: false, message: data.error });
      }
    } catch (error) {
      setResult({ success: false, message: "Erro de conexão" });
    } finally {
      setApplying(false);
    }
  };

  const formatPrice = (p: Property) => {
    const val = p.category === "LOCACAO" ? (p.rentPrice || p.price) : p.price;
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/integracoes/portais" className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500">
          <RiArrowLeftLine className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-emerald-500 flex items-center justify-center">
              <RiCheckboxMultipleLine className="w-5 h-5 text-white" />
            </div>
            Atribuir Portais em Massa
          </h1>
          <p className="text-neutral-500 mt-1">Selecione imóveis e atribua aos portais de uma vez</p>
        </div>
      </div>

      {/* Painel de Ação */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5">
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Portais */}
          <div className="flex-1">
            <h3 className="text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-3">Portais</h3>
            <div className="flex flex-wrap gap-2">
              {PORTAIS.map((portal) => (
                <button
                  key={portal.id}
                  onClick={() => togglePortal(portal.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                    portaisToAssign.has(portal.id)
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-orange-300"
                  }`}
                >
                  {portal.nome}
                  {portal.desc && <span className="text-xs opacity-70 ml-1">({portal.desc})</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Posição */}
          <div className="w-40">
            <h3 className="text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-3">Posição</h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setPosition("simples")}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                  position === "simples"
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                }`}
              >
                Simples
              </button>
              <button
                onClick={() => setPosition("destaque")}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all flex items-center gap-1 justify-center ${
                  position === "destaque"
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                }`}
              >
                <RiStarLine className="w-4 h-4" /> Destaque
              </button>
            </div>
          </div>

          {/* Ação */}
          <div className="w-48">
            <h3 className="text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-3">Ação</h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setAction("add")}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                  action === "add"
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                }`}
              >
                + Adicionar portais
              </button>
              <button
                onClick={() => setAction("remove")}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                  action === "remove"
                    ? "bg-red-500 text-white border-red-500"
                    : "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                }`}
              >
                − Remover portais
              </button>
              <button
                onClick={() => setAction("set")}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                  action === "set"
                    ? "bg-purple-500 text-white border-purple-500"
                    : "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                }`}
              >
                = Substituir tudo
              </button>
            </div>
          </div>
        </div>

        {/* Botão aplicar */}
        <div className="mt-4 flex items-center gap-4">
          <button
            onClick={handleApply}
            disabled={applying || selected.size === 0 || portaisToAssign.size === 0}
            className="flex items-center gap-2 h-11 px-6 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {applying ? <RiLoader4Line className="w-5 h-5 animate-spin" /> : <RiCheckLine className="w-5 h-5" />}
            Aplicar em {selected.size} imóve{selected.size === 1 ? "l" : "is"}
          </button>

          {result && (
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`text-sm font-medium ${result.success ? "text-green-600" : "text-red-600"}`}
            >
              {result.message}
            </motion.p>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por código, título, bairro..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
        >
          {TIPOS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        <select
          value={portalFilter}
          onChange={(e) => {
            setPortalFilter(e.target.value);
            if (e.target.value) setNoPortalFilter(false);
          }}
          className="h-10 px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
        >
          <option value="">Todos portais</option>
          {PORTAIS.map((p) => (
            <option key={p.id} value={p.id}>Com {p.nome}</option>
          ))}
        </select>

        <button
          onClick={() => {
            setNoPortalFilter(!noPortalFilter);
            if (!noPortalFilter) setPortalFilter("");
          }}
          className={`h-10 px-4 rounded-xl text-sm font-medium border transition-all ${
            noPortalFilter
              ? "bg-red-100 dark:bg-red-500/20 text-red-600 border-red-200 dark:border-red-500/30"
              : "bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700"
          }`}
        >
          <RiFilterLine className="w-4 h-4 inline mr-1" />
          Sem portal ({noPortalFilter ? "ON" : "OFF"})
        </button>

        <span className="text-sm text-neutral-500 ml-auto">{total} imóveis</span>
      </div>

      {/* Lista */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {/* Header da tabela */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
          <button onClick={handleSelectAll} className="flex-shrink-0">
            {selectAll ? (
              <RiCheckboxLine className="w-5 h-5 text-orange-500" />
            ) : (
              <RiCheckboxBlankLine className="w-5 h-5 text-neutral-400" />
            )}
          </button>
          <span className="text-xs font-bold text-neutral-500 w-20">Cód.</span>
          <span className="text-xs font-bold text-neutral-500 flex-1">Imóvel</span>
          <span className="text-xs font-bold text-neutral-500 w-24 text-right">Preço</span>
          <span className="text-xs font-bold text-neutral-500 w-32 text-center">Portais Ativos</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RiLoader4Line className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
            <RiHome4Line className="w-10 h-10 mb-2" />
            <p>Nenhum imóvel encontrado</p>
          </div>
        ) : (
          properties.map((prop) => {
            const isSelected = selected.has(prop.id);
            return (
              <div
                key={prop.id}
                onClick={() => toggleSelect(prop.id)}
                className={`flex items-center gap-3 px-4 py-3 border-b border-neutral-50 dark:border-neutral-800/50 cursor-pointer transition-colors ${
                  isSelected ? "bg-orange-50 dark:bg-orange-500/10" : "hover:bg-neutral-50 dark:hover:bg-neutral-800/30"
                }`}
              >
                <div className="flex-shrink-0">
                  {isSelected ? (
                    <RiCheckboxLine className="w-5 h-5 text-orange-500" />
                  ) : (
                    <RiCheckboxBlankLine className="w-5 h-5 text-neutral-300" />
                  )}
                </div>

                <span className="text-xs font-mono text-neutral-400 w-20 flex-shrink-0">{prop.code}</span>

                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {prop.thumbnail && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-200">
                      <Image src={prop.thumbnail} alt="" width={40} height={40} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                      {prop.condominium?.name || prop.title}
                    </p>
                    <p className="text-xs text-neutral-400 truncate">
                      {prop.type} · {prop.bedrooms}q · {prop.area}m² · {prop.neighborhood}, {prop.city}
                    </p>
                  </div>
                </div>

                <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300 w-24 text-right flex-shrink-0">
                  {formatPrice(prop)}
                </span>

                <div className="w-32 flex-shrink-0 flex flex-wrap gap-1 justify-center">
                  {prop.activePortals.length === 0 ? (
                    <span className="text-xs text-neutral-300">Nenhum</span>
                  ) : (
                    prop.activePortals.map((p) => (
                      <span key={p} className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-500/20 text-orange-600 text-[10px] font-bold rounded">
                        {p.toUpperCase()}
                      </span>
                    ))
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 disabled:opacity-30"
          >
            <RiArrowLeftSLine className="w-5 h-5" />
          </button>
          <span className="text-sm text-neutral-500">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 disabled:opacity-30"
          >
            <RiArrowRightSLine className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
