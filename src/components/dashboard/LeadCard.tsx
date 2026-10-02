"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  RiWhatsappLine, 
  RiMailLine, 
  RiPhoneLine, 
  RiChat3Line,
  RiTimeLine,
  RiExternalLinkLine,
  RiFireLine,
} from "react-icons/ri";
import { cn } from "@/lib/utils";

interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  temperature?: string;
  source?: string;
  status?: string;
  message?: string;
  createdAt: string;
}

interface LeadCardProps {
  lead: Lead;
  index?: number;
  compact?: boolean;
}

const sourceIcons: Record<string, typeof RiWhatsappLine> = {
  whatsapp: RiWhatsappLine,
  site: RiMailLine,
  ligação: RiPhoneLine,
  telefone: RiPhoneLine,
};

const temperatureConfig: Record<string, { gradient: string; bg: string; text: string }> = {
  QUENTE: { 
    gradient: "from-red-500 to-orange-500", 
    bg: "bg-red-100 dark:bg-red-500/20", 
    text: "text-red-700 dark:text-red-400" 
  },
  MORNO: { 
    gradient: "from-emerald-500 to-emerald-500", 
    bg: "bg-yellow-100 dark:bg-yellow-500/20", 
    text: "text-yellow-700 dark:text-yellow-400" 
  },
  FRIO: { 
    gradient: "from-blue-500 to-cyan-500", 
    bg: "bg-blue-100 dark:bg-blue-500/20", 
    text: "text-blue-700 dark:text-blue-400" 
  },
};

const LeadCard = memo(function LeadCard({ lead, index = 0, compact = false }: LeadCardProps) {
  const SourceIcon = sourceIcons[lead.source?.toLowerCase() || ""] || RiChat3Line;
  const temp = temperatureConfig[lead.temperature?.toUpperCase() || "FRIO"] || temperatureConfig.FRIO;
  
  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return "Agora";
    if (hours < 24) return `${hours}h atrás`;
    if (hours < 48) return "Ontem";
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
      >
        <div className={cn(
          "w-9 h-9 rounded-lg bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm flex-shrink-0",
          temp.gradient
        )}>
          {lead.name?.charAt(0) || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-neutral-900 dark:text-white truncate text-sm">{lead.name}</p>
          <p className="text-xs text-neutral-500 truncate">{lead.message || "Sem interesse definido"}</p>
        </div>
        <span className="text-xs text-neutral-400">{formatDate(lead.createdAt)}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors border-b border-neutral-100 dark:border-neutral-800 last:border-0"
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          "w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg",
          temp.gradient
        )}>
          {lead.name?.charAt(0) || "?"}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-semibold text-neutral-900 dark:text-white truncate">{lead.name}</h3>
            <span className={cn("px-2.5 py-1 text-xs font-bold rounded-full flex items-center gap-1", temp.bg, temp.text)}>
              {lead.temperature === "QUENTE" && <RiFireLine className="w-3 h-3" />}
              {lead.temperature || "Frio"}
            </span>
          </div>
          
          <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate mb-2">
            {lead.message || "Interesse não informado"}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-neutral-500">
            <span className="flex items-center gap-1.5 px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
              <SourceIcon className="w-3.5 h-3.5" />
              {lead.source || "Site"}
            </span>
            <span className="flex items-center gap-1">
              <RiTimeLine className="w-3.5 h-3.5" />
              {formatDate(lead.createdAt)}
            </span>
            {lead.phone && (
              <a 
                href={`https://wa.me/55${lead.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-green-600 hover:text-green-700"
              >
                <RiWhatsappLine className="w-3.5 h-3.5" />
                WhatsApp
              </a>
            )}
          </div>
        </div>
        
        <Link 
          href={`/admin/clientes/leads?lead=${lead.id}`}
          className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400 hover:text-orange-500 transition-colors"
        >
          <RiExternalLinkLine className="w-5 h-5" />
        </Link>
      </div>
    </motion.div>
  );
});

export default LeadCard;
