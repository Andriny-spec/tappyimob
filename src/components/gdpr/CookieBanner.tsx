"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiCake2Line, RiSettings4Line, RiCloseLine, RiCheckLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const cookieTypes = [
  {
    id: "essential",
    name: "Essenciais",
    description: "Necessários para o funcionamento do site. Não podem ser desativados.",
    required: true,
    enabled: true,
  },
  {
    id: "analytics",
    name: "Analíticos",
    description: "Nos ajudam a entender como você usa o site para melhorar sua experiência.",
    required: false,
    enabled: true,
  },
  {
    id: "marketing",
    name: "Marketing",
    description: "Usados para mostrar anúncios relevantes baseados nos seus interesses.",
    required: false,
    enabled: false,
  },
  {
    id: "functional",
    name: "Funcionais",
    description: "Permitem funcionalidades extras como chat ao vivo e vídeos incorporados.",
    required: false,
    enabled: true,
  },
];

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [cookies, setCookies] = useState(cookieTypes);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setTimeout(() => setIsVisible(true), 1500);
    }
  }, []);

  const handleAcceptAll = () => {
    const updatedCookies = cookies.map((c) => ({ ...c, enabled: true }));
    setCookies(updatedCookies);
    localStorage.setItem("cookie-consent", JSON.stringify(updatedCookies));
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    const updatedCookies = cookies.map((c) => ({
      ...c,
      enabled: c.required ? true : false,
    }));
    setCookies(updatedCookies);
    localStorage.setItem("cookie-consent", JSON.stringify(updatedCookies));
    setIsVisible(false);
  };

  const handleSaveSettings = () => {
    localStorage.setItem("cookie-consent", JSON.stringify(cookies));
    setIsVisible(false);
    setShowSettings(false);
  };

  const toggleCookie = (id: string) => {
    setCookies((prev) =>
      prev.map((c) =>
        c.id === id && !c.required ? { ...c, enabled: !c.enabled } : c
      )
    );
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Main Banner */}
          {!showSettings && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-50"
            >
              <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                {/* Gradient top border */}
                <div className="h-1 bg-[#0B2545]" />

                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#0B2545]/10 dark:bg-[#0B2545]/30 flex items-center justify-center">
                      <RiCake2Line className="w-6 h-6 text-[#0B2545] dark:text-sky-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">
                        Nós usamos cookies 🍪
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                        Utilizamos cookies para melhorar sua experiência, analisar o tráfego e personalizar conteúdo.{" "}
                        <Link
                          href="/cookies"
                          className="text-[#0B2545] dark:text-sky-400 hover:underline"
                        >
                          Saiba mais
                        </Link>
                      </p>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={handleAcceptAll}
                          size="sm"
                          className="flex-1 sm:flex-none bg-[#0B2545] hover:bg-[#081733] text-white"
                        >
                          Aceitar todos
                        </Button>
                        <Button
                          onClick={handleRejectAll}
                          variant="outline"
                          size="sm"
                          className="flex-1 sm:flex-none"
                        >
                          Rejeitar
                        </Button>
                        <Button
                          onClick={() => setShowSettings(true)}
                          variant="ghost"
                          size="sm"
                          className="flex-1 sm:flex-none"
                        >
                          <RiSettings4Line className="w-4 h-4 mr-1" />
                          Configurar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Settings Panel */}
          {showSettings && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                onClick={() => setShowSettings(false)}
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:max-w-lg z-50"
              >
                <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden max-h-[80vh] overflow-y-auto">
                  {/* Header */}
                  <div className="sticky top-0 flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#0B2545]/10 dark:bg-[#0B2545]/30 flex items-center justify-center">
                        <RiSettings4Line className="w-5 h-5 text-[#0B2545] dark:text-sky-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900 dark:text-white">
                          Configurar cookies
                        </h3>
                        <p className="text-xs text-neutral-500">
                          Personalize suas preferências
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <RiCloseLine className="w-5 h-5 text-neutral-500" />
                    </button>
                  </div>

                  {/* Cookie options */}
                  <div className="p-4 space-y-3">
                    {cookies.map((cookie) => (
                      <motion.div
                        key={cookie.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 rounded-xl border transition-colors ${
                          cookie.enabled
                            ? "border-[#0B2545]/30 dark:border-sky-500/30 bg-[#0B2545]/5 dark:bg-sky-500/5"
                            : "border-neutral-200 dark:border-neutral-800"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-neutral-900 dark:text-white">
                                {cookie.name}
                              </span>
                              {cookie.required && (
                                <span className="text-[10px] font-semibold text-[#0B2545] dark:text-sky-400 bg-[#0B2545]/10 dark:bg-sky-500/20 px-1.5 py-0.5 rounded-full">
                                  Obrigatório
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                              {cookie.description}
                            </p>
                          </div>
                          <button
                            onClick={() => toggleCookie(cookie.id)}
                            disabled={cookie.required}
                            className={`relative w-12 h-7 rounded-full transition-colors ${
                              cookie.enabled
                                ? "bg-[#0B2545]"
                                : "bg-neutral-200 dark:bg-neutral-700"
                            } ${cookie.required ? "opacity-60 cursor-not-allowed" : ""}`}
                          >
                            <motion.div
                              animate={{ x: cookie.enabled ? 22 : 2 }}
                              transition={{ type: "spring", damping: 20, stiffness: 300 }}
                              className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center"
                            >
                              {cookie.enabled && (
                                <RiCheckLine className="w-3 h-3 text-[#0B2545]" />
                              )}
                            </motion.div>
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="sticky bottom-0 flex gap-3 p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                    <Button
                      onClick={handleRejectAll}
                      variant="outline"
                      className="flex-1"
                    >
                      Rejeitar opcionais
                    </Button>
                    <Button
                      onClick={handleSaveSettings}
                      className="flex-1 bg-[#0B2545] hover:bg-[#081733] text-white"
                    >
                      Salvar preferências
                    </Button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
