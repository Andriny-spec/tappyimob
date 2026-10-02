"use client";

import { motion } from "framer-motion";

export function PeriodSelector({
  period,
  onChange,
}: {
  period: "7d" | "30d" | "90d";
  onChange: (p: "7d" | "30d" | "90d") => void;
}) {
  return (
    <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
      {(["7d", "30d", "90d"] as const).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            period === p
              ? "bg-white dark:bg-neutral-700 text-orange-500 shadow-sm"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          {p === "7d" ? "7 dias" : p === "30d" ? "30 dias" : "90 dias"}
        </button>
      ))}
    </div>
  );
}

export function KpiCard({
  icon: Icon,
  value,
  label,
  color = "orange",
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
  color?: "orange" | "blue" | "green" | "purple" | "pink";
}) {
  const colorMap: Record<string, string> = {
    orange: "bg-orange-100 dark:bg-orange-500/20 text-orange-500",
    blue: "bg-blue-100 dark:bg-blue-500/20 text-blue-500",
    green: "bg-green-100 dark:bg-green-500/20 text-green-500",
    purple: "bg-purple-100 dark:bg-purple-500/20 text-purple-500",
    pink: "bg-pink-100 dark:bg-pink-500/20 text-pink-500",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorMap[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-3xl font-bold text-neutral-900 dark:text-white">{value}</p>
      <p className="text-sm text-neutral-500 mt-1">{label}</p>
    </motion.div>
  );
}

export function BarList({ items, color = "#25D366" }: { items: { label: string; count: number }[]; color?: string }) {
  const max = Math.max(...items.map((i) => i.count), 1);
  if (items.length === 0) {
    return <p className="text-sm text-neutral-400 py-6 text-center">Sem dados no período</p>;
  }
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-neutral-600 dark:text-neutral-400 truncate max-w-[70%]">{item.label}</span>
            <span className="text-sm font-semibold text-neutral-900 dark:text-white">{item.count}</span>
          </div>
          <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: color }}
              initial={{ width: 0 }}
              animate={{ width: `${(item.count / max) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DailyBarChart({
  data,
  dataKey,
  color = "#25D366",
}: {
  data: ({ day: string; date: string } & Record<string, unknown>)[];
  dataKey: string;
  color?: string;
}) {
  const max = Math.max(...data.map((d) => Number(d[dataKey]) || 0), 1);
  return (
    <div className="flex items-end justify-between gap-1 h-40">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
          <span className="text-[10px] text-neutral-500">{Number(d[dataKey]) || 0}</span>
          <motion.div
            className="w-full rounded-t-md"
            style={{ backgroundColor: color, minHeight: 2 }}
            initial={{ height: 0 }}
            animate={{ height: `${((Number(d[dataKey]) || 0) / max) * 100}%` }}
            transition={{ duration: 0.4, delay: i * 0.01 }}
          />
          {data.length <= 31 && <span className="text-[9px] text-neutral-400 truncate">{d.day}</span>}
        </div>
      ))}
    </div>
  );
}

export function PageHeader({
  icon: Icon,
  title,
  subtitle,
  color = "orange",
  right,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  color?: "orange" | "blue" | "pink" | "purple";
  right?: React.ReactNode;
}) {
  const colorMap: Record<string, string> = {
    orange: "bg-orange-100 dark:bg-orange-500/20 text-orange-500",
    blue: "bg-blue-100 dark:bg-blue-500/20 text-blue-500",
    pink: "bg-pink-100 dark:bg-pink-500/20 text-pink-500",
    purple: "bg-purple-100 dark:bg-purple-500/20 text-purple-500",
  };
  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
          {title}
        </h1>
        <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>
      </div>
      {right}
    </div>
  );
}
