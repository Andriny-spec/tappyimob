"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  RiToolsLine,
  RiTimeLine,
  RiCheckLine,
  RiCloseLine,
  RiAlertLine,
  RiLoader4Line,
  RiExternalLinkLine,
} from "react-icons/ri";
import Link from "next/link";

interface MaintenanceData {
  id: string;
  isActive: boolean;
  message: string;
  scheduledEnd: string | null;
}

export default function MaintenancePage() {
  const [maintenance, setMaintenance] = useState<MaintenanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [scheduledEnd, setScheduledEnd] = useState("");

  useEffect(() => {
    loadMaintenance();
  }, []);

  const loadMaintenance = async () => {
    try {
      const res = await fetch("/api/admin/maintenance");
      const data = await res.json();
      setMaintenance(data);
      setMessage(data.message || "");
      if (data.scheduledEnd) {
        const date = new Date(data.scheduledEnd);
        setScheduledEnd(date.toISOString().slice(0, 16));
      }
    } catch (error) {
      console.error("Erro ao carregar:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMaintenance = async () => {
    if (!maintenance) return;
    
    setSaving(true);
    try {
      const res = await fetch("/api/admin/maintenance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive: !maintenance.isActive,
          message,
          scheduledEnd: scheduledEnd || null,
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setMaintenance(data);
      }
    } catch (error) {
      console.error("Erro ao atualizar:", error);
    } finally {
      setSaving(false);
    }
  };

  const saveSettings = async () => {
    if (!maintenance) return;
    
    setSaving(true);
    try {
      const res = await fetch("/api/admin/maintenance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive: maintenance.isActive,
          message,
          scheduledEnd: scheduledEnd || null,
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setMaintenance(data);
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RiLoader4Line className="w-8 h-8 text-[#0B2545] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <RiToolsLine className="w-5 h-5 text-orange-500" />
          </div>
          Modo Manutenção
        </h1>
        <p className="text-neutral-500 mt-2">
          Ative o modo manutenção para exibir uma página de aviso aos visitantes enquanto você realiza atualizações no site.
        </p>
      </div>

      {/* Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-6 mb-6 ${
          maintenance?.isActive
            ? "bg-gradient-to-r from-orange-500 to-red-500"
            : "bg-gradient-to-r from-emerald-500 to-teal-500"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center">
              {maintenance?.isActive ? (
                <RiAlertLine className="w-8 h-8 text-white" />
              ) : (
                <RiCheckLine className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {maintenance?.isActive ? "Site em Manutenção" : "Site Online"}
              </h2>
              <p className="text-white/80 text-sm">
                {maintenance?.isActive
                  ? "Os visitantes estão vendo a página de manutenção"
                  : "O site está funcionando normalmente"}
              </p>
            </div>
          </div>

          <button
            onClick={toggleMaintenance}
            disabled={saving}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              maintenance?.isActive
                ? "bg-white text-red-500 hover:bg-white/90"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            {saving ? (
              <RiLoader4Line className="w-5 h-5 animate-spin" />
            ) : maintenance?.isActive ? (
              <span className="flex items-center gap-2">
                <RiCheckLine className="w-5 h-5" />
                Desativar Manutenção
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <RiToolsLine className="w-5 h-5" />
                Ativar Manutenção
              </span>
            )}
          </button>
        </div>
      </motion.div>

      {/* Preview Link */}
      {maintenance?.isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 p-4 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RiAlertLine className="w-5 h-5 text-orange-500" />
              <span className="text-orange-700 dark:text-orange-400 font-medium">
                Modo manutenção ativo - visitantes verão a página de manutenção
              </span>
            </div>
            <Link
              href="/manutencao"
              target="_blank"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              <RiExternalLinkLine className="w-4 h-4" />
              Ver página
            </Link>
          </div>
        </motion.div>
      )}

      {/* Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6"
      >
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">
          Configurações
        </h3>

        <div className="space-y-6">
          {/* Mensagem */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Mensagem para os visitantes
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#0B2545] focus:border-transparent transition-all resize-none"
              placeholder="Ex: Estamos realizando melhorias para você. Voltamos em breve!"
            />
          </div>

          {/* Data prevista */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              <div className="flex items-center gap-2">
                <RiTimeLine className="w-4 h-4" />
                Previsão de retorno (opcional)
              </div>
            </label>
            <input
              type="datetime-local"
              value={scheduledEnd}
              onChange={(e) => setScheduledEnd(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#0B2545] focus:border-transparent transition-all"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Se definido, será exibido na página de manutenção
            </p>
          </div>

          {/* Salvar */}
          <div className="flex justify-end pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0B2545] text-white font-medium hover:bg-[#15293f] transition-colors disabled:opacity-50"
            >
              {saving ? (
                <RiLoader4Line className="w-4 h-4 animate-spin" />
              ) : (
                <RiCheckLine className="w-4 h-4" />
              )}
              Salvar Configurações
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
