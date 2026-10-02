"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  RiAlertLine,
  RiWhatsappLine,
  RiFireLine,
  RiTimeLine,
  RiArrowRightLine,
  RiLoader4Line,
  RiRefreshLine,
  RiUserLine,
} from "react-icons/ri";
import Link from "next/link";

interface Lead {
  id: string;
  name: string;
  phone: string;
  temperature: "QUENTE" | "MORNO" | "FRIO";
  ticket: string;
  lastContact: string | null;
  daysSinceContact: number;
  daysOverdue: number;
  property?: {
    code: string;
    title: string;
  } | null;
}

interface LeadsAttentionRequiredProps {
  corretorId?: string;
  limit?: number;
  showTitle?: boolean;
}

const temperatureColors = {
  QUENTE: "#ef4444",
  MORNO: "#f59e0b",
  FRIO: "#3b82f6",
};

const temperatureLabels = {
  QUENTE: "Quente",
  MORNO: "Morno",
  FRIO: "Frio",
};

// Prazo de follow-up por temperatura (em dias)
const followUpDays = {
  QUENTE: 2,
  MORNO: 5,
  FRIO: 15,
};

export function LeadsAttentionRequired({ 
  corretorId, 
  limit = 5,
  showTitle = true 
}: LeadsAttentionRequiredProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      // Em produção, buscar da API com filtro de leads atrasados
      const params = new URLSearchParams();
      if (corretorId) params.append("corretorId", corretorId);
      params.append("overdue", "true");
      params.append("limit", limit.toString());

      const res = await fetch(`/api/admin/leads?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        
        // Calcular dias desde último contato e se está atrasado
        const processedLeads = data.leads?.map((lead: any) => {
          const lastContact = lead.lastContact ? new Date(lead.lastContact) : null;
          const today = new Date();
          const daysSinceContact = lastContact 
            ? Math.ceil((today.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24))
            : 999;
          
          const maxDays = followUpDays[lead.temperature as keyof typeof followUpDays] || 5;
          const daysOverdue = Math.max(0, daysSinceContact - maxDays);

          return {
            ...lead,
            daysSinceContact,
            daysOverdue,
          };
        }).filter((lead: Lead) => lead.daysOverdue > 0)
          .sort((a: Lead, b: Lead) => b.daysOverdue - a.daysOverdue)
          .slice(0, limit) || [];

        setLeads(processedLeads);
      }
    } catch (error) {
      console.error("Erro ao buscar leads:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [corretorId, limit]);

  // Mock data para demonstração
  useEffect(() => {
    if (leads.length === 0 && !isLoading) {
      setLeads([
        {
          id: "1",
          name: "João Silva",
          phone: "(11) 99999-9999",
          temperature: "QUENTE",
          ticket: "COMPRA",
          lastContact: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          daysSinceContact: 5,
          daysOverdue: 3,
          property: { code: "IMB00001", title: "Apartamento 3 quartos" },
        },
        {
          id: "2",
          name: "Maria Santos",
          phone: "(11) 98888-8888",
          temperature: "QUENTE",
          ticket: "LOCACAO",
          lastContact: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          daysSinceContact: 4,
          daysOverdue: 2,
          property: { code: "IMB00002", title: "Casa 4 quartos" },
        },
        {
          id: "3",
          name: "Carlos Oliveira",
          phone: "(11) 97777-7777",
          temperature: "MORNO",
          ticket: "COMPRA",
          lastContact: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          daysSinceContact: 8,
          daysOverdue: 3,
          property: null,
        },
      ]);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RiLoader4Line className="w-6 h-6 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="bg-green-50 dark:bg-green-500/10 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center mx-auto mb-3">
          <RiTimeLine className="w-6 h-6 text-green-500" />
        </div>
        <h4 className="font-semibold text-green-700 dark:text-green-400 mb-1">
          Tudo em dia!
        </h4>
        <p className="text-sm text-green-600 dark:text-green-500">
          Nenhum lead requer atenção no momento
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
      {showTitle && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
              <RiAlertLine className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">
                Requer Atenção
              </h3>
              <p className="text-xs text-neutral-500">
                {leads.length} lead{leads.length > 1 ? "s" : ""} atrasado{leads.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={fetchLeads}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
          >
            <RiRefreshLine className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
        {leads.map((lead, index) => (
          <motion.div
            key={lead.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-4 px-5 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
              {lead.name.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-neutral-900 dark:text-white text-sm truncate">
                  {lead.name}
                </h4>
                <span
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
                  style={{ backgroundColor: temperatureColors[lead.temperature] }}
                >
                  <RiFireLine className="w-3 h-3" />
                  {temperatureLabels[lead.temperature]}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-neutral-500">
                {lead.property && (
                  <span className="truncate">{lead.property.code}</span>
                )}
                <span className="text-red-500 font-medium">
                  {lead.daysOverdue}d atrasado
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <a
                href={`https://wa.me/55${lead.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors"
              >
                <RiWhatsappLine className="w-4 h-4" />
              </a>
              <Link
                href={`/admin/clientes/leads?id=${lead.id}`}
                className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                <RiArrowRightLine className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Ver todos */}
      <div className="px-5 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
        <Link
          href="/admin/clientes/leads?filter=overdue"
          className="flex items-center justify-center gap-2 text-sm text-orange-500 hover:text-orange-600 font-medium"
        >
          Ver todos os leads atrasados
          <RiArrowRightLine className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
