"use client";

import { memo, ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { IconType } from "react-icons";
import { RiArrowRightLine } from "react-icons/ri";
import { cn } from "@/lib/utils";

interface DashboardSectionProps {
  title: string;
  subtitle?: string;
  icon?: IconType;
  iconGradient?: string;
  href?: string;
  hrefLabel?: string;
  children: ReactNode;
  className?: string;
  delay?: number;
  noPadding?: boolean;
  actions?: ReactNode;
}

const DashboardSection = memo(function DashboardSection({
  title,
  subtitle,
  icon: Icon,
  iconGradient = "from-orange-500 to-emerald-500",
  href,
  hrefLabel = "Ver todos",
  children,
  className,
  delay = 0,
  noPadding = false,
  actions,
}: DashboardSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className={cn(
        "bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={cn(
              "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center",
              iconGradient
            )}>
              <Icon className="w-5 h-5 text-white" />
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">{title}</h2>
            {subtitle && <p className="text-sm text-neutral-500">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {href && (
            <Link
              href={href}
              className="flex items-center gap-1 text-sm font-medium text-orange-500 hover:text-orange-600 px-3 py-1.5 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors"
            >
              {hrefLabel}
              <RiArrowRightLine className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className={cn(!noPadding && "p-5")}>
        {children}
      </div>
    </motion.div>
  );
});

export default DashboardSection;
