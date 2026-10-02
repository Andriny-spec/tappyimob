"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  RiCloseLine,
  RiAlertLine,
  RiHome4Line,
  RiCalendarLine,
  RiArrowRightLine,
} from "react-icons/ri";

interface PendingFeedback {
  visitId: string;
  visitDate: string;
  propertyId: string;
  propertyCode: string;
  propertyTitle: string;
  visitorName: string;
}

export function PendingFeedbackBanner() {
  const [items, setItems] = useState<PendingFeedback[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchPendingFeedback();
  }, []);

  const fetchPendingFeedback = async () => {
    try {
      const res = await fetch("/api/admin/scheduled-visits/pending-feedback");
      if (res.ok) {
        const data = await res.json();
        if (data.items?.length > 0) {
          setItems(data.items);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar feedbacks pendentes:", error);
    }
  };

  if (dismissed || items.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mx-4 mt-4 p-4 bg-gradient-to-r from-emerald-50 to-orange-50 dark:from-emerald-500/10 dark:to-orange-500/10 rounded-xl border border-amber-200 dark:border-amber-500/30"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <RiAlertLine className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-semibold text-amber-800 dark:text-amber-400 text-sm">
                {items.length} visita{items.length > 1 ? "s" : ""} sem feedback
              </h4>
              <button
                onClick={() => setDismissed(true)}
                className="p-1 hover:bg-amber-200/50 dark:hover:bg-amber-500/20 rounded-lg transition-colors flex-shrink-0"
              >
                <RiCloseLine className="w-4 h-4 text-amber-600" />
              </button>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-300/70 mt-0.5 mb-2">
              Registre o feedback dos imóveis visitados
            </p>
            <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
              {items.slice(0, 5).map((item) => (
                <Link
                  key={`${item.visitId}-${item.propertyId}`}
                  href={`/corretor/imoveis/${item.propertyId}`}
                  className="flex items-center gap-2 p-2 bg-white/60 dark:bg-neutral-800/60 rounded-lg hover:bg-white dark:hover:bg-neutral-800 transition-colors group"
                >
                  <RiHome4Line className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">
                    {item.propertyCode}
                  </span>
                  <span className="text-[10px] text-neutral-500 flex items-center gap-1 flex-shrink-0">
                    <RiCalendarLine className="w-3 h-3" />
                    {new Date(item.visitDate + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                  </span>
                  <RiArrowRightLine className="w-3 h-3 text-neutral-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </Link>
              ))}
            </div>
            {items.length > 5 && (
              <Link
                href="/corretor/imoveis/visitas"
                className="text-xs text-amber-700 dark:text-amber-400 hover:underline mt-2 inline-block"
              >
                Ver todas as {items.length} pendências →
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
