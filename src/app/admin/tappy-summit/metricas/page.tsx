"use client";

import { useEffect, useMemo, useState } from "react";
import {
  RiBarChart2Line,
  RiEyeLine,
  RiCalendarTodoLine,
  RiCursorLine,
  RiWhatsappLine,
  RiInstagramLine,
  RiHome4Line,
  RiTeamLine,
  RiCompass3Line,
  RiRefreshLine,
} from "react-icons/ri";

interface Analytics {
  days: number;
  total: number;
  byType: Record<string, number>;
  todayPageviews: number;
  topProperties: { target: string | null; count: number }[];
  topTeam: { target: string | null; count: number }[];
  topNav: { target: string | null; count: number }[];
  topUtm: { source: string | null; count: number }[];
  timeline: { day: string; total: number }[];
}

interface Property {
  id: string;
  name: string;
  referenceCode: string | null;
}
interface Member {
  id: string;
  name: string;
}

const NAV_LABELS: Record<string, string> = {
  hero: "Início",
  meta: "Meta",
  ranking: "Ranking",
  imoveis: "Prêmios / Imóveis",
};

export default function MetricasPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [properties, setProperties] = useState<Property[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [a, p, t] = await Promise.all([
        fetch(`/api/admin/campanha-summit/analytics?days=${days}`).then((r) =>
          r.json()
        ),
        fetch("/api/admin/campanha-summit/properties").then((r) => r.json()),
        fetch("/api/admin/campanha-summit/team").then((r) => r.json()),
      ]);
      setData(a);
      setProperties(p.properties || []);
      setMembers(t.members || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [days]);

  const propertyLabel = (target: string | null) => {
    if (!target) return "—";
    const p = properties.find(
      (p) => p.referenceCode === target || p.name === target
    );
    return p ? `${p.name}${p.referenceCode ? ` · ${p.referenceCode}` : ""}` : target;
  };
  const memberLabel = (target: string | null) => {
    if (!target) return "—";
    const m = members.find((m) => m.name === target);
    return m ? m.name : target;
  };

  const maxTimeline = useMemo(() => {
    if (!data?.timeline?.length) return 1;
    return Math.max(...data.timeline.map((t) => t.total), 1);
  }, [data]);

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div className="flex items-start sm:items-center flex-col sm:flex-row gap-3 sm:gap-4 justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
            <RiBarChart2Line className="w-7 h-7 text-orange-500" /> Métricas da
            LP
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Acessos e cliques na landing page{" "}
            <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-xs">
              /campanha-summit
            </code>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
          >
            <option value={7}>Últimos 7 dias</option>
            <option value={30}>Últimos 30 dias</option>
            <option value={60}>Últimos 60 dias</option>
            <option value={90}>Últimos 90 dias</option>
            <option value={365}>Último ano</option>
          </select>
          <button
            onClick={fetchAll}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium hover:opacity-90"
          >
            <RiRefreshLine className="w-4 h-4" /> Atualizar
          </button>
        </div>
      </div>

      {loading || !data ? (
        <div className="text-center py-20 text-neutral-500">Carregando...</div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard
              icon={RiEyeLine}
              label="Acessos"
              value={data.byType.pageview || 0}
              color="blue"
            />
            <StatCard
              icon={RiCalendarTodoLine}
              label="Acessos Hoje"
              value={data.todayPageviews}
              color="emerald"
            />
            <StatCard
              icon={RiCursorLine}
              label="Cliques CTA"
              value={data.byType.click_cta || 0}
              color="orange"
            />
            <StatCard
              icon={RiWhatsappLine}
              label="Cliques WhatsApp"
              value={data.byType.click_whatsapp || 0}
              color="green"
            />
            <StatCard
              icon={RiInstagramLine}
              label="Cliques Instagram"
              value={data.byType.click_instagram || 0}
              color="pink"
            />
            <StatCard
              icon={RiHome4Line}
              label="Cliques em Imóveis"
              value={data.byType.click_property || 0}
              color="purple"
            />
          </div>

          {/* Timeline */}
          <Card title="Acessos por dia" icon={RiBarChart2Line}>
            {data.timeline.length === 0 ? (
              <EmptyState text="Sem acessos no período." />
            ) : (
              <div className="flex items-end gap-1 h-40 px-2">
                {data.timeline.map((t) => {
                  const h = Math.max((t.total / maxTimeline) * 100, 4);
                  const dayLabel = new Date(t.day).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                  });
                  return (
                    <div
                      key={t.day}
                      className="flex-1 flex flex-col items-center justify-end gap-1 group"
                    >
                      <span className="text-[9px] text-neutral-400 opacity-0 group-hover:opacity-100 transition">
                        {t.total}
                      </span>
                      <div
                        className="w-full bg-gradient-to-t from-orange-500 to-emerald-300 rounded-t"
                        style={{ height: `${h}%` }}
                        title={`${dayLabel} — ${t.total} acessos`}
                      />
                      <span className="text-[8px] text-neutral-400 -rotate-45 origin-top-left mt-2 whitespace-nowrap">
                        {dayLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Imóveis */}
            <Card title="Top Imóveis Clicados" icon={RiHome4Line}>
              {data.topProperties.length === 0 ? (
                <EmptyState text="Nenhum clique em imóveis ainda." />
              ) : (
                <RankList
                  items={data.topProperties.map((p) => ({
                    label: propertyLabel(p.target),
                    value: p.count,
                  }))}
                />
              )}
            </Card>

            {/* Equipe */}
            <Card title="Top WhatsApp da Equipe" icon={RiTeamLine}>
              {data.topTeam.length === 0 ? (
                <EmptyState text="Nenhum clique em membros ainda." />
              ) : (
                <RankList
                  items={data.topTeam.map((p) => ({
                    label: memberLabel(p.target),
                    value: p.count,
                  }))}
                />
              )}
            </Card>

            {/* Nav */}
            <Card title="Navegação (Footer Bar)" icon={RiCompass3Line}>
              {data.topNav.length === 0 ? (
                <EmptyState text="Sem cliques de navegação." />
              ) : (
                <RankList
                  items={data.topNav.map((p) => ({
                    label: NAV_LABELS[p.target || ""] || p.target || "—",
                    value: p.count,
                  }))}
                />
              )}
            </Card>

            {/* UTMs */}
            <Card title="Top Origens (UTM Source)" icon={RiBarChart2Line}>
              {data.topUtm.length === 0 ? (
                <EmptyState text="Sem origens UTM registradas." />
              ) : (
                <RankList
                  items={data.topUtm.map((p) => ({
                    label: p.source || "—",
                    value: p.count,
                  }))}
                />
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

const COLORS: Record<string, string> = {
  blue: "from-blue-500/10 to-blue-500/5 text-blue-600 dark:text-blue-400 border-blue-500/20",
  emerald:
    "from-emerald-500/10 to-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  orange:
    "from-orange-500/10 to-orange-500/5 text-orange-600 dark:text-orange-400 border-orange-500/20",
  green:
    "from-green-500/10 to-green-500/5 text-green-600 dark:text-green-400 border-green-500/20",
  pink: "from-pink-500/10 to-pink-500/5 text-pink-600 dark:text-pink-400 border-pink-500/20",
  purple:
    "from-purple-500/10 to-purple-500/5 text-purple-600 dark:text-purple-400 border-purple-500/20",
};

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: keyof typeof COLORS;
}) {
  return (
    <div
      className={`rounded-2xl border bg-gradient-to-br p-4 ${COLORS[color]}`}
    >
      <div className="flex items-center justify-between mb-3">
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-extrabold text-neutral-900 dark:text-white">
        {value.toLocaleString("pt-BR")}
      </div>
      <div className="text-xs text-neutral-500 mt-0.5">{label}</div>
    </div>
  );
}

function Card({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-orange-500" />
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function RankList({ items }: { items: { label: string; value: number }[] }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="space-y-2">
      {items.map((it, i) => (
        <li key={i} className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-neutral-400 w-5">
            #{i + 1}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-sm text-neutral-800 dark:text-neutral-200 truncate">
                {it.label}
              </span>
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                {it.value}
              </span>
            </div>
            <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-emerald-400"
                style={{ width: `${(it.value / max) * 100}%` }}
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-8 text-neutral-400 text-sm">{text}</div>
  );
}
