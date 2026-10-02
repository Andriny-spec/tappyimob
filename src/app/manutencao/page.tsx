"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RiToolsLine, RiTimeLine, RiHome4Line } from "react-icons/ri";

export default function MaintenancePage() {
  const [message, setMessage] = useState("Estamos realizando melhorias para você. Voltamos em breve!");
  const [scheduledEnd, setScheduledEnd] = useState<string | null>(null);
  const [dots, setDots] = useState("");

  useEffect(() => {
    // Buscar dados de manutenção
    fetch("/api/maintenance/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.message) setMessage(data.message);
        if (data.scheduledEnd) setScheduledEnd(data.scheduledEnd);
      });

    // Animação dos pontinhos
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B2545] via-[#163A6B] to-[#0B2545] flex items-center justify-center p-4 overflow-hidden relative">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Círculos flutuantes */}
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-white/5"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: "-10%", left: "-10%" }}
        />
        <motion.div
          className="absolute w-64 h-64 rounded-full bg-white/5"
          animate={{
            x: [0, -80, 0],
            y: [0, 80, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          style={{ bottom: "-5%", right: "-5%" }}
        />
        <motion.div
          className="absolute w-48 h-48 rounded-full bg-[#25D366]/20"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: "40%", right: "20%" }}
        />

        {/* Grid de fundo */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
      </div>

      {/* Conteúdo principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center max-w-lg"
      >
        {/* Ícone animado */}
        <motion.div
          className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm mb-8"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <RiToolsLine className="w-16 h-16 text-white" />
          </motion.div>
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
              <RiHome4Line className="w-6 h-6 text-[#0B2545]" />
            </div>
            <span className="text-2xl font-bold text-white">
              Tappy<span className="text-[#25D366]"> Imóvel</span>
            </span>
          </div>
        </motion.div>

        {/* Título */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-3xl sm:text-4xl font-bold text-white mb-4"
        >
          Site em Manutenção{dots}
        </motion.h1>

        {/* Mensagem */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg text-white/80 mb-8 leading-relaxed"
        >
          {message}
        </motion.p>

        {/* Previsão de retorno */}
        {scheduledEnd && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm text-white/90"
          >
            <RiTimeLine className="w-5 h-5" />
            <span>Previsão de retorno: {formatDate(scheduledEnd)}</span>
          </motion.div>
        )}

        {/* Animação de loading */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-12 flex justify-center gap-2"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-[#25D366]"
              animate={{ y: [0, -15, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>

        {/* Contato */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-white/60 text-sm"
        >
          Dúvidas? Entre em contato:{" "}
          <a
            href="mailto:contato@tappyimob.com.br"
            className="text-[#25D366] hover:text-[#d88a6a] transition-colors"
          >
            contato@tappyimob.com.br
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}
