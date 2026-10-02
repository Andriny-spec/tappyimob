"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiSunLine, RiMoonLine, RiComputerLine } from "react-icons/ri";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 animate-pulse" />
    );
  }

  const themes = [
    { value: "light", label: "Claro", icon: RiSunLine },
    { value: "dark", label: "Escuro", icon: RiMoonLine },
    { value: "system", label: "Sistema", icon: RiComputerLine },
  ];

  const currentIcon = resolvedTheme === "dark" ? RiMoonLine : RiSunLine;

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Alternar tema"
        className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-colors overflow-hidden border border-white/20"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={resolvedTheme}
            initial={{ y: -20, opacity: 0, rotate: -90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 20, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            {resolvedTheme === "dark" ? (
              <RiMoonLine className="w-5 h-5" />
            ) : (
              <RiSunLine className="w-5 h-5" />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute right-0 mt-2 w-40 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 z-50 overflow-hidden"
            >
              <div className="p-2">
                {themes.map((t) => (
                  <motion.button
                    key={t.value}
                    whileHover={{ x: 2 }}
                    onClick={() => {
                      setTheme(t.value);
                      setIsOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full p-2.5 rounded-lg text-left transition-colors ${
                      theme === t.value
                        ? "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400"
                        : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <t.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{t.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
