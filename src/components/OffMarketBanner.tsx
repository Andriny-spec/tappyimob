"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { RiEyeOffLine, RiArrowRightLine, RiCloseLine, RiLoader4Line, RiArrowUpSLine } from "react-icons/ri";

interface OffMarketBannerProps {
  position?: "top" | "bottom";
  className?: string;
}

export function OffMarketBanner({ position = "top", className = "" }: OffMarketBannerProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nome: "", email: "", telefone: "", tipo: "", detalhes: "" });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tipo) {
      setErro("Selecione se você é Cliente ou Corretor Parceiro");
      return;
    }
    setErro("");
    setEnviando(true);
    try {
      const tipoLabel = formData.tipo === "corretor" ? "Corretor Parceiro" : "Cliente";
      const message = [
        `Solicitou acesso a imóveis Off Market — tipo: ${tipoLabel}`,
        formData.detalhes ? `Detalhes da busca: ${formData.detalhes}` : null,
      ].filter(Boolean).join("\n");

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.nome,
          email: formData.email || undefined,
          phone: formData.telefone,
          source: "OFF_MARKET",
          message,
          tags: ["OFF_MARKET", formData.tipo === "corretor" ? "OFF_MARKET_CORRETOR" : "OFF_MARKET_CLIENTE"],
        }),
      });
      if (res.ok) {
        router.push("/off-market");
      } else {
        setErro("Erro ao enviar solicitação. Tente novamente.");
      }
    } catch {
      setErro("Erro ao enviar solicitação. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className={className}>
      {/* Banner strip */}
      <motion.div
        initial={{ opacity: 0, y: position === "top" ? -10 : 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setShowForm((v) => !v)}
        className={`relative overflow-hidden cursor-pointer bg-gradient-to-r from-[#1EBE5A] to-[#15803D] p-2 sm:p-2.5 group hover:shadow-lg transition-all ${showForm ? "rounded-t-lg" : "rounded-lg"}`}
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative flex items-center gap-3">
          <div className="hidden sm:flex w-8 h-8 rounded-lg bg-white/10 items-center justify-center flex-shrink-0">
            <RiEyeOffLine className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-[11px] sm:text-xs mb-0">
              Imóveis Off Market 🔐
            </h3>
            <p className="text-white/70 text-[10px] sm:text-[11px] leading-tight">
              Acesse nossa listagem de imóveis restritos ao mercado aberto
            </p>
          </div>
          <div className="hidden sm:flex items-center justify-center w-6 h-6 rounded-full bg-white text-[#1EBE5A] group-hover:scale-110 transition-transform">
            <motion.div animate={{ rotate: showForm ? 180 : 0 }} transition={{ duration: 0.2 }}>
              {showForm ? <RiArrowUpSLine className="w-3 h-3" /> : <RiArrowRightLine className="w-3 h-3" />}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Inline form expansion */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden rounded-b-lg border border-t-0 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg"
          >
            <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-snug max-w-sm">
                    Algumas propriedades nunca são anunciadas. Chegam antes — e saem antes. Quem tem acesso, decide primeiro.
                  </p>
                  <button
                    onClick={() => setShowForm(false)}
                    className="ml-3 flex-shrink-0 w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  >
                    <RiCloseLine className="w-4 h-4" />
                  </button>
                </div>

                {erro && (
                  <div className="mb-3 p-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400">
                    {erro}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">Nome *</label>
                      <input
                        type="text"
                        required
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:ring-2 focus:ring-[#1EBE5A] outline-none"
                        placeholder="Seu nome"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">Telefone *</label>
                      <input
                        type="tel"
                        required
                        value={formData.telefone}
                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:ring-2 focus:ring-[#1EBE5A] outline-none"
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">E-mail</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:ring-2 focus:ring-[#1EBE5A] outline-none"
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">Detalhes da busca</label>
                    <textarea
                      rows={2}
                      value={formData.detalhes}
                      onChange={(e) => setFormData({ ...formData, detalhes: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:ring-2 focus:ring-[#1EBE5A] outline-none resize-none"
                      placeholder="Faixa de valor, localização, tipo de imóvel..."
                    />
                  </div>

                  <div className="flex items-center gap-5 pt-1 flex-wrap">
                    <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider flex-shrink-0">Você é *</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="tipo"
                        value="cliente"
                        required
                        checked={formData.tipo === "cliente"}
                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                        className="accent-[#1EBE5A]"
                      />
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">Cliente</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="tipo"
                        value="corretor"
                        required
                        checked={formData.tipo === "corretor"}
                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                        className="accent-[#1EBE5A]"
                      />
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">Corretor Parceiro</span>
                    </label>

                    <button
                      type="submit"
                      disabled={enviando}
                      className="ml-auto px-5 py-2 bg-[#1EBE5A] text-white text-sm font-bold rounded-xl hover:bg-[#15803D] transition-colors disabled:opacity-60 flex items-center gap-2"
                    >
                      {enviando ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiEyeOffLine className="w-4 h-4" />}
                      {enviando ? "Enviando..." : "Solicitar acesso"}
                    </button>
                  </div>
                  <p className="text-[10px] text-neutral-400">* Campos obrigatórios</p>
                </form>
              </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
