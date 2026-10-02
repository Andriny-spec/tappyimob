"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { IconType } from "react-icons";
import { RiArrowUpLine, RiArrowDownLine, RiArrowRightLine } from "react-icons/ri";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  icon: IconType;
  gradient: string;
  href?: string;
  trend?: "up" | "down" | "neutral";
  sparkline?: number[];
  delay?: number;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const KPICard = memo(function KPICard({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
  gradient,
  href,
  trend,
  sparkline = [40, 65, 45, 80, 55, 70, 90],
  delay = 0,
  size = "md",
  loading = false,
}: KPICardProps) {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className={cn(
        "group relative overflow-hidden bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800",
        "hover:shadow-xl hover:shadow-neutral-200/50 dark:hover:shadow-neutral-900/50",
        "hover:-translate-y-1 transition-all duration-300",
        size === "sm" && "p-4",
        size === "md" && "p-6",
        size === "lg" && "p-8"
      )}
    >
      {/* Gradient Background on Hover */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300",
          gradient
        )} 
      />
      
      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-neutral-900/80 flex items-center justify-center z-20">
          <div className="w-8 h-8 border-3 border-neutral-200 border-t-orange-500 rounded-full animate-spin" />
        </div>
      )}
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div 
            className={cn(
              "rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg",
              gradient,
              size === "sm" && "w-10 h-10",
              size === "md" && "w-14 h-14",
              size === "lg" && "w-16 h-16"
            )}
          >
            <Icon className={cn(
              "text-white",
              size === "sm" && "w-5 h-5",
              size === "md" && "w-7 h-7",
              size === "lg" && "w-8 h-8"
            )} />
          </div>
          
          {typeof change === "number" && (
            <motion.span 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: delay + 0.2 }}
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full",
                change >= 0
                  ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
              )}
            >
              {change >= 0 ? (
                <RiArrowUpLine className="w-3 h-3" />
              ) : (
                <RiArrowDownLine className="w-3 h-3" />
              )}
              {change >= 0 ? "+" : ""}{change}%
            </motion.span>
          )}
        </div>
        
        <div>
          <motion.h3 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.1 }}
            className={cn(
              "font-bold text-neutral-900 dark:text-white mb-1 tracking-tight",
              size === "sm" && "text-2xl",
              size === "md" && "text-3xl lg:text-4xl",
              size === "lg" && "text-4xl lg:text-5xl"
            )}
          >
            {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
          </motion.h3>
          <p className={cn(
            "text-neutral-500 font-medium",
            size === "sm" && "text-xs",
            size === "md" && "text-sm",
            size === "lg" && "text-base"
          )}>
            {title}
          </p>
          {subtitle && (
            <p className="text-xs text-neutral-400 mt-1">{subtitle}</p>
          )}
        </div>
        
        {/* Sparkline */}
        {sparkline.length > 0 && (
          <div className={cn(
            "flex items-end gap-1",
            size === "sm" && "mt-3 h-6",
            size === "md" && "mt-4 h-8",
            size === "lg" && "mt-5 h-10"
          )}>
            {sparkline.map((h, idx) => (
              <motion.div
                key={idx}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: delay + 0.3 + idx * 0.05, duration: 0.3 }}
                className={cn(
                  "flex-1 rounded-sm bg-gradient-to-t opacity-20 group-hover:opacity-40 transition-opacity origin-bottom",
                  gradient
                )}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        )}
        
        {/* Arrow indicator for links */}
        {href && (
          <RiArrowRightLine 
            className="absolute bottom-4 right-4 w-5 h-5 text-neutral-300 dark:text-neutral-600 
                       group-hover:text-orange-500 group-hover:translate-x-1 transition-all" 
          />
        )}
      </div>
    </motion.div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }

  return content;
});

export default KPICard;
