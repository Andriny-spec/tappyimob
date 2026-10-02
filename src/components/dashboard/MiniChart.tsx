"use client";

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface MiniChartProps {
  data: DataPoint[];
  type: "bar" | "pie" | "donut" | "horizontal";
  title?: string;
  className?: string;
  showLabels?: boolean;
  showValues?: boolean;
  animated?: boolean;
  height?: number;
  colors?: string[];
}

const defaultColors = [
  "from-orange-500 to-emerald-500",
  "from-blue-500 to-indigo-500",
  "from-green-500 to-emerald-500",
  "from-purple-500 to-pink-500",
  "from-red-500 to-rose-500",
  "from-cyan-500 to-teal-500",
  "from-emerald-500 to-emerald-400",
  "from-indigo-500 to-violet-500",
];

const solidColors = [
  "#25D366", // orange
  "#3b82f6", // blue
  "#22c55e", // green
  "#a855f7", // purple
  "#ef4444", // red
  "#06b6d4", // cyan
  "#eab308", // yellow
  "#6366f1", // indigo
];

const MiniChart = memo(function MiniChart({
  data,
  type,
  title,
  className,
  showLabels = true,
  showValues = true,
  animated = true,
  height = 120,
  colors = defaultColors,
}: MiniChartProps) {
  const total = useMemo(() => data.reduce((acc, d) => acc + d.value, 0), [data]);
  const maxValue = useMemo(() => Math.max(...data.map(d => d.value)), [data]);

  if (type === "bar") {
    return (
      <div className={cn("space-y-2", className)}>
        {title && <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{title}</h4>}
        <div className="space-y-3" style={{ minHeight: height }}>
          {data.map((item, idx) => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-600 dark:text-neutral-400 truncate max-w-[60%]">{item.label}</span>
                {showValues && (
                  <span className="font-semibold text-neutral-900 dark:text-white">{item.value.toLocaleString()}</span>
                )}
              </div>
              <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <motion.div
                  initial={animated ? { width: 0 } : false}
                  animate={{ width: `${(item.value / maxValue) * 100}%` }}
                  transition={{ delay: idx * 0.1, duration: 0.5, ease: "easeOut" }}
                  className={cn("h-full rounded-full bg-gradient-to-r", colors[idx % colors.length])}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "horizontal") {
    return (
      <div className={cn("space-y-3", className)}>
        {title && <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{title}</h4>}
        <div className="flex items-center gap-1 h-8 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
          {data.map((item, idx) => {
            const percentage = (item.value / total) * 100;
            return (
              <motion.div
                key={item.label}
                initial={animated ? { width: 0 } : false}
                animate={{ width: `${percentage}%` }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className={cn(
                  "h-full bg-gradient-to-r flex items-center justify-center",
                  colors[idx % colors.length]
                )}
                title={`${item.label}: ${item.value}`}
              >
                {percentage > 10 && (
                  <span className="text-xs font-bold text-white">{Math.round(percentage)}%</span>
                )}
              </motion.div>
            );
          })}
        </div>
        {showLabels && (
          <div className="flex flex-wrap gap-3">
            {data.map((item, idx) => (
              <div key={item.label} className="flex items-center gap-1.5 text-xs">
                <div className={cn("w-2.5 h-2.5 rounded-full bg-gradient-to-r", colors[idx % colors.length])} />
                <span className="text-neutral-600 dark:text-neutral-400">{item.label}</span>
                <span className="font-semibold text-neutral-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (type === "pie" || type === "donut") {
    const size = height;
    const strokeWidth = type === "donut" ? 20 : size / 2;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    
    let currentOffset = 0;

    return (
      <div className={cn("flex items-center gap-4", className)}>
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90">
            {data.map((item, idx) => {
              const percentage = item.value / total;
              const strokeDasharray = circumference * percentage;
              const strokeDashoffset = -currentOffset;
              currentOffset += strokeDasharray;

              return (
                <motion.circle
                  key={item.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={solidColors[idx % solidColors.length]}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${strokeDasharray} ${circumference}`}
                  strokeDashoffset={strokeDashoffset}
                  initial={animated ? { strokeDasharray: `0 ${circumference}` } : false}
                  animate={{ strokeDasharray: `${strokeDasharray} ${circumference}` }}
                  transition={{ delay: idx * 0.1, duration: 0.8, ease: "easeOut" }}
                />
              );
            })}
          </svg>
          {type === "donut" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{total}</p>
                <p className="text-xs text-neutral-500">total</p>
              </div>
            </div>
          )}
        </div>
        {showLabels && (
          <div className="flex-1 space-y-2">
            {data.map((item, idx) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: solidColors[idx % solidColors.length] }}
                  />
                  <span className="text-neutral-600 dark:text-neutral-400">{item.label}</span>
                </div>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {item.value} <span className="text-xs text-neutral-400">({Math.round((item.value / total) * 100)}%)</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
});

export default MiniChart;
