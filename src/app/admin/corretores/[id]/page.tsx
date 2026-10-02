"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiUserStarLine,
  RiPhoneLine,
  RiMailLine,
  RiMapPinLine,
  RiHome4Line,
  RiTeamLine,
  RiCalendarLine,
  RiMoneyDollarCircleLine,
  RiBarChartLine,
  RiLoader4Line,
  RiEditLine,
  RiFilterLine,
  RiCloseLine,
  RiCheckLine,
  RiTimeLine,
  RiArchiveLine,
  RiFileList3Line,
  RiTrophyLine,
  RiArrowUpLine,
  RiArrowDownLine,
} from "react-icons/ri";

interface Corretor {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  creci: string | null;
  region: string | null;
  role: string;
  bio: string | null;
  isActive: boolean;
  rating: number | null;
  totalSales: number | null;
  totalValue: number | null;
  conversionRate: number | null;
  createdAt: string;
  _count: { leads: number; comissoes: number; properties: number };
}

interface Stats {
  leadsTotal: number;
  leadsLimbo: number;
  leadsAcervo: number;
  leadsByStatus: Record<string, number>;
  propertiesCount: number;
  propertiesCountMes: number;
  propertiesCountAnual: number;
  visitsCompleted: number;
  comissoesCount: number;
  negociosAndamento: number;
  activityLogsCount: number;
  meta: {
    id: string;
    periodo: string;
    metaVendas: number;
    metaValor: number;
    metaLeads: number;
    vendasRealizadas: number;
    valorRealizado: number;
    leadsConvertidos: number;
    bonus: number;
    status: string;
  } | null;
}

const FUNNEL_GROUPS = [
  { label: "Entrada", statuses: ["NOVO", "TRIAGEM", "CONTATADO"], color: "bg-blue-500" },
  { label: "Qualificado", statuses: ["QUALIFICADO"], color: "bg-cyan-500" },
  { label: "Visita", statuses: ["VISITA_FRIA", "VISITA_MORNA", "VISITA_QUENTE"], color: "bg-amber-500" },
  { label: "Proposta", statuses: ["PROPOSTA", "NEGOCIANDO"], color: "bg-orange-500" },
  { label: "Fechado", statuses: ["FECHADO"], color: "bg-emerald-500" },
];

const STATUS_LABELS: Record<string, string> = {
  NOVO: "Novo", CONTATADO: "Contatado", QUALIFICADO: "Qualificado",
  NEGOCIANDO: "Negociando", FECHADO: "Fechado", PERDIDO: "Perdido",
  ARQUIVADO: "Arquivado", TRIAGEM: "Triagem", VISITA_FRIA: "Visita Fria",
  VISITA_MORNA: "Visita Morna", VISITA_QUENTE: "Visita Quente",
  PROPOSTA: "Proposta", SEM_INTERACAO: "Sem Interação",
  RETORNO: "Retorno", EM_ESPERA: "Em Espera",
};

const PERIODS = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "12m", days: 365 },
];

function formatCurrency(value: number) {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}K`;
  return `R$ ${value.toLocaleString("pt-BR")}`;
}

function pct(done: number, target: number) {
  if (!target) return 0;
  return Math.min(Math.round((done / target) * 100), 100);
}

export default function CorretorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [corretor, setCorretor] = useState<Corretor | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [metaEdit, setMetaEdit] = useState(false);
  const [metaForm, setMetaForm] = useState({
    metaValor: "", valorRealizado: "",
    metaComissao: "", comissaoRealizada: "",
    metaVendas: "",
  });
  const [savingMeta, setSavingMeta] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const p = new URLSearchParams();
      if (startDate) p.set("startDate", startDate);
      if (endDate) p.set("endDate", endDate);
      const res = await fetch(`/api/admin/corretores/${id}/stats?${p}`);
      if (res.ok) setStats(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setStatsLoading(false);
    }
  }, [id, startDate, endDate]);

  useEffect(() => {
    const fetchCorretor = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/corretores/${id}`);
        if (res.ok) setCorretor(await res.json());
        else router.push("/admin/corretores");
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCorretor();
  }, [id, router]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (stats?.meta) {
      setMetaForm({
        metaValor: stats.meta.metaValor?.toString() || "",
        valorRealizado: stats.meta.valorRealizado?.toString() || "",
        metaComissao: (stats.meta as any).metaComissao?.toString() || "",
        comissaoRealizada: (stats.meta as any).comissaoRealizada?.toString() || "",
        metaVendas: stats.meta.metaVendas?.toString() || "",
      });
    }
  }, [stats?.meta]);

  const applyPeriod = (days: number) => {
    const from = new Date(Date.now() - days * 86400_000).toISOString().split("T")[0];
    setStartDate(from);
    setEndDate(today);
  };

  const clearDates = () => { setStartDate(""); setEndDate(""); };

  const handleSaveMeta = async () => {
    if (!corretor) return;
    setSavingMeta(true);
    try {
      const year = new Date().getFullYear();
      const parseMoney = (v: string) => parseFloat(v.replace(/\D/g, "")) / 100 || parseFloat(v.replace(",", ".")) || 0;
      await fetch("/api/admin/corretores/metas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          corretorId: corretor.id,
          periodo: `${year}`,
          metaValor: parseMoney(metaForm.metaValor),
          metaComissao: parseMoney(metaForm.metaComissao),
          comissaoRealizada: parseMoney(metaForm.comissaoRealizada),
          metaVendas: parseInt(metaForm.metaVendas) || 0,
          metaLeads: stats?.meta?.metaLeads || 0,
          valorRealizado: parseMoney(metaForm.valorRealizado),
        }),
      });
      await fetchStats();
      setMetaEdit(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingMeta(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RiLoader4Line className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!corretor) return null;

  const initials = corretor.name.split(" ").map((n) => n[0]).slice(0, 2).join("");
  const meta = stats?.meta;
  const vgvPct = pct(meta?.valorRealizado || 0, meta?.metaValor || 0);
  const captPct = pct(stats?.propertiesCount || 0, meta?.metaVendas || 0);

  const funel = FUNNEL_GROUPS.map((g) => ({
    ...g,
    count: g.statuses.reduce((sum, s) => sum + (stats?.leadsByStatus?.[s] || 0), 0),
  }));
  const funelTotal = funel.reduce((sum, g) => sum + g.count, 0) || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
        >
          <RiArrowLeftLine className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {corretor.avatar ? (
                <img src={corretor.avatar} alt="" className="w-full h-full object-cover rounded-xl" />
              ) : initials}
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-900 dark:text-white">{corretor.name}</h1>
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                {corretor.creci && <span>CRECI {corretor.creci}</span>}
                {corretor.region && <><span>·</span><span>{corretor.region}</span></>}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${corretor.isActive ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"}`}>
                  {corretor.isActive ? "Ativo" : "Inativo"}
                </span>
              </div>
            </div>
          </div>
        </div>
        <Link href={`/admin/corretores`} className="text-sm text-neutral-500 hover:text-blue-500 transition-colors">
          Voltar à equipe
        </Link>
      </div>

      {/* Date Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1">
          {PERIODS.map((p) => {
            const from = new Date(Date.now() - p.days * 86400_000).toISOString().split("T")[0];
            const active = startDate === from && endDate === today;
            return (
              <button key={p.label} onClick={() => applyPeriod(p.days)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${active ? "bg-white dark:bg-neutral-700 text-blue-500 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}>
                {p.label}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setShowDateFilter(!showDateFilter)}
          className={`flex items-center gap-1.5 h-9 px-3 rounded-xl text-sm font-medium transition-colors border ${showDateFilter || startDate ? "bg-blue-500 text-white border-blue-500" : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"}`}
        >
          <RiFilterLine className="w-4 h-4" />
          {startDate ? `${startDate} → ${endDate || "hoje"}` : "Período"}
        </button>
        {(startDate || endDate) && (
          <button onClick={clearDates} className="h-9 px-3 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 border border-transparent transition-colors">
            <RiCloseLine className="w-4 h-4" />
          </button>
        )}
      </div>

      {showDateFilter && (
        <div className="flex items-center gap-3 p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <label className="text-sm text-neutral-500 whitespace-nowrap">De:</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="h-9 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-neutral-500 whitespace-nowrap">Até:</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="h-9 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm" />
          </div>
        </div>
      )}

      {/* Meta Anual Panel */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
            <RiTrophyLine className="w-4 h-4 text-amber-500" />
            Meta Anual {new Date().getFullYear()}
          </h2>
          <button onClick={() => setMetaEdit(!metaEdit)}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
            <RiEditLine className="w-3.5 h-3.5" />
            {metaEdit ? "Cancelar" : "Editar"}
          </button>
        </div>

        {metaEdit ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* VGV */}
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Meta VGV — Definida (R$)</label>
                <input type="text" value={metaForm.metaValor} onChange={(e) => setMetaForm(f => ({ ...f, metaValor: e.target.value }))}
                  placeholder="Ex: R$ 10.000.000"
                  className="w-full h-10 px-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Meta VGV — Executada (R$)</label>
                <input type="text" value={metaForm.valorRealizado} onChange={(e) => setMetaForm(f => ({ ...f, valorRealizado: e.target.value }))}
                  placeholder="Ex: R$ 5.000.000"
                  className="w-full h-10 px-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              {/* Comissão Líquida */}
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Meta Comissão Líquida — Definida (R$)</label>
                <input type="text" value={metaForm.metaComissao} onChange={(e) => setMetaForm(f => ({ ...f, metaComissao: e.target.value }))}
                  placeholder="Ex: R$ 600.000"
                  className="w-full h-10 px-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Meta Comissão Líquida — Executada (R$)</label>
                <input type="text" value={metaForm.comissaoRealizada} onChange={(e) => setMetaForm(f => ({ ...f, comissaoRealizada: e.target.value }))}
                  placeholder="Ex: R$ 300.000"
                  className="w-full h-10 px-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              {/* Captações */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-neutral-500 mb-1">Meta Captações — Definida (unidades)</label>
                <input type="number" value={metaForm.metaVendas} onChange={(e) => setMetaForm(f => ({ ...f, metaVendas: e.target.value }))}
                  placeholder="Ex: 20"
                  className="w-full h-10 px-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                <p className="text-[10px] text-neutral-400 mt-1">Executado é calculado automaticamente pelos imóveis captados</p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setMetaEdit(false)} className="h-9 px-4 rounded-xl text-sm border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50">Cancelar</button>
              <button onClick={handleSaveMeta} disabled={savingMeta}
                className="h-9 px-5 rounded-xl text-sm bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2">
                {savingMeta ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiCheckLine className="w-4 h-4" />}
                Salvar
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {/* Meta VGV */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Meta VGV</p>
              <div className="flex items-end gap-1.5">
                <span className="text-xl font-bold text-neutral-900 dark:text-white">
                  {meta?.valorRealizado ? formatCurrency(meta.valorRealizado) : "—"}
                </span>
                {meta?.metaValor ? <span className="text-xs text-neutral-400 mb-0.5">/ {formatCurrency(meta.metaValor)}</span> : null}
              </div>
              {meta?.metaValor ? (
                <div className="space-y-1">
                  <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${vgvPct}%` }} />
                  </div>
                  <p className="text-[10px] text-neutral-500">{vgvPct}% · Def: {formatCurrency(meta.metaValor)} · Exec: {formatCurrency(meta.valorRealizado)}</p>
                </div>
              ) : <p className="text-xs text-neutral-400">Meta não definida</p>}
            </div>

            {/* Meta Comissão Líquida */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Meta Comissão Líquida</p>
              <div className="flex items-end gap-1.5">
                <span className="text-xl font-bold text-emerald-600">
                  {(meta as any)?.comissaoRealizada ? formatCurrency((meta as any).comissaoRealizada) : "—"}
                </span>
                {(meta as any)?.metaComissao ? <span className="text-xs text-neutral-400 mb-0.5">/ {formatCurrency((meta as any).metaComissao)}</span> : null}
              </div>
              {(meta as any)?.metaComissao ? (
                <div className="space-y-1">
                  <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${pct((meta as any).comissaoRealizada || 0, (meta as any).metaComissao)}%` }} />
                  </div>
                  <p className="text-[10px] text-neutral-500">
                    {pct((meta as any).comissaoRealizada || 0, (meta as any).metaComissao)}% · Def: {formatCurrency((meta as any).metaComissao)} · Exec: {formatCurrency((meta as any).comissaoRealizada || 0)}
                  </p>
                </div>
              ) : <p className="text-xs text-neutral-400">Meta não definida</p>}
            </div>

            {/* Meta Captações */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Meta Captações</p>
              <div className="flex items-end gap-1.5">
                <span className="text-xl font-bold text-neutral-900 dark:text-white">
                  {statsLoading ? "…" : (stats?.propertiesCountMes ?? stats?.propertiesCount ?? "—")}
                </span>
                {meta?.metaVendas ? <span className="text-xs text-neutral-400 mb-0.5">/ {meta.metaVendas}</span> : null}
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] text-neutral-500">Mês: <strong>{stats?.propertiesCountMes ?? 0}</strong> · Ano: <strong>{stats?.propertiesCountAnual ?? 0}</strong></p>
                {meta?.metaVendas ? (
                  <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${captPct}%` }} />
                  </div>
                ) : <p className="text-xs text-neutral-400">Meta não definida</p>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="flex items-center justify-center py-10">
          <RiLoader4Line className="w-6 h-6 text-blue-500 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Leads Totais */}
            <Link href={`/admin/clientes/leads?corretorId=${id}`}
              className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                  <RiTeamLine className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats?.leadsTotal ?? 0}</p>
                  <p className="text-xs text-neutral-500">Leads Totais</p>
                </div>
              </div>
              {/* Funnel mini */}
              <div className="flex gap-0.5 h-1.5 rounded-full overflow-hidden">
                {funel.map((g) => (
                  g.count > 0 && (
                    <div key={g.label} className={`${g.color} transition-all`}
                      style={{ width: `${(g.count / funelTotal) * 100}%` }} title={`${g.label}: ${g.count}`} />
                  )
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {funel.filter(g => g.count > 0).map((g) => (
                  <span key={g.label} className="text-[10px] text-neutral-500">{g.label}: <strong>{g.count}</strong></span>
                ))}
              </div>
            </Link>

            {/* Leads Limbo */}
            <div className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                  <RiTimeLine className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">{stats?.leadsLimbo ?? 0}</p>
                  <p className="text-xs text-neutral-500">Leads Limbo</p>
                </div>
              </div>
              <p className="mt-2 text-[10px] text-neutral-400">Sem interação · Em espera · Retorno</p>
            </div>

            {/* Leads Acervo */}
            <div className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                  <RiArchiveLine className="w-5 h-5 text-neutral-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-600 dark:text-neutral-400">{stats?.leadsAcervo ?? 0}</p>
                  <p className="text-xs text-neutral-500">Leads Acervo</p>
                </div>
              </div>
              <p className="mt-2 text-[10px] text-neutral-400">Arquivados · Perdidos</p>
            </div>

            {/* Imóveis Cadastrados */}
            <div className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
                  <RiHome4Line className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats?.propertiesCount ?? 0}</p>
                  <p className="text-xs text-neutral-500">Imóveis Captados</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Visitas */}
            <div className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                  <RiCalendarLine className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats?.visitsCompleted ?? 0}</p>
                  <p className="text-xs text-neutral-500">Visitas Concluídas</p>
                </div>
              </div>
            </div>

            {/* Propostas */}
            <div className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                  <RiMoneyDollarCircleLine className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats?.comissoesCount ?? 0}</p>
                  <p className="text-xs text-neutral-500">Propostas</p>
                </div>
              </div>
            </div>

            {/* Negócios em andamento */}
            <Link href={`/admin/negocio?corretorId=${id}`}
              className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-blue-200 dark:border-blue-500/30 hover:border-blue-400 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                  <RiFileList3Line className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats?.negociosAndamento ?? 0}</p>
                  <p className="text-xs text-neutral-500">Negócios em andamento</p>
                </div>
              </div>
              <p className="mt-1 text-[10px] text-blue-400">Contratos jurídicos ativos</p>
            </Link>
          </div>

          {/* Funil detalhado */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5">
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
              <RiBarChartLine className="w-4 h-4 text-blue-500" />
              Funil de Leads
            </h3>
            <div className="space-y-2">
              {Object.entries(stats?.leadsByStatus || {})
                .filter(([, count]) => count > 0)
                .sort((a, b) => b[1] - a[1])
                .map(([status, count]) => {
                  const max = Math.max(...Object.values(stats?.leadsByStatus || {}));
                  const widthPct = max ? Math.round((count / max) * 100) : 0;
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <span className="text-xs text-neutral-500 w-28 text-right flex-shrink-0">
                        {STATUS_LABELS[status] || status}
                      </span>
                      <div className="flex-1 h-5 bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden">
                        <div className="h-full bg-blue-500/80 rounded-lg transition-all flex items-center pl-2"
                          style={{ width: `${Math.max(widthPct, 4)}%` }}>
                          <span className="text-[10px] text-white font-bold">{count}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Contato */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5">
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-3 text-sm">Informações</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                <RiMailLine className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                <span className="truncate">{corretor.email}</span>
              </div>
              {corretor.phone && (
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <RiPhoneLine className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                  <span>{corretor.phone}</span>
                </div>
              )}
              {corretor.region && (
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <RiMapPinLine className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                  <span>{corretor.region}</span>
                </div>
              )}
            </div>
            {corretor.bio && (
              <p className="mt-3 text-sm text-neutral-500 italic">{corretor.bio}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
