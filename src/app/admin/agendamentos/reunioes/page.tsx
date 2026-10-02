"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiTeamLine,
  RiCalendarLine,
  RiInboxLine,
} from "react-icons/ri";

export default function ReunioesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/agendamentos" className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500">
            <RiArrowLeftLine className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                <RiTeamLine className="w-5 h-5 text-white" />
              </div>
              Reuniões
            </h1>
            <p className="text-neutral-500 mt-1">Gerencie suas reuniões e compromissos</p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-neutral-400"
      >
        <div className="w-20 h-20 rounded-2xl bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center mb-6">
          <RiCalendarLine className="w-10 h-10 text-purple-400" />
        </div>
        <p className="text-lg font-medium text-neutral-600 dark:text-neutral-300">Nenhuma reunião agendada</p>
        <p className="text-sm text-neutral-500 mt-1 text-center max-w-md">
          O módulo de reuniões está em desenvolvimento. Em breve você poderá agendar e gerenciar reuniões diretamente por aqui.
        </p>
      </motion.div>
    </div>
  );
}
