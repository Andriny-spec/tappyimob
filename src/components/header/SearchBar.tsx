"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiSearchLine, RiCloseLine, RiCommandLine } from "react-icons/ri";

const recentSearches = [
  "Apartamento 3 quartos Zona Sul",
  "Casa com piscina",
  "Terreno comercial",
  "Cobertura duplex",
];

const suggestions = [
  { type: "Imóvel", text: "Apartamentos à venda", count: 234 },
  { type: "Cliente", text: "Maria Silva", count: null },
  { type: "Imóvel", text: "Casas para alugar", count: 89 },
];

export function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        setQuery("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* Search trigger button */}
      <motion.button
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className="hidden md:flex items-center gap-3 h-10 px-4 rounded-full bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 min-w-[280px] border border-neutral-200 dark:border-neutral-700"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <RiSearchLine className="w-4 h-4" />
        <span className="text-sm">Buscar imóveis, clientes...</span>
        <div className="ml-auto flex items-center gap-1 text-xs bg-white dark:bg-neutral-700 rounded-md px-1.5 py-0.5 shadow-sm">
          <RiCommandLine className="w-3 h-3" />
          <span>K</span>
        </div>
      </motion.button>

      {/* Mobile search button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        aria-label="Buscar imóveis"
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <RiSearchLine className="w-5 h-5" />
      </motion.button>

      {/* Search modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => {
                setIsOpen(false);
                setQuery("");
              }}
            />

            {/* Search panel */}
            <motion.div
              ref={containerRef}
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-[10%] left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 z-50 overflow-hidden"
            >
              {/* Search input */}
              <div className="flex items-center gap-3 p-4 border-b border-neutral-200 dark:border-neutral-800">
                <RiSearchLine className="w-5 h-5 text-neutral-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar imóveis, clientes, contratos..."
                  className="flex-1 bg-transparent text-lg outline-none placeholder:text-neutral-400"
                />
                {query && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={() => setQuery("")}
                    className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <RiCloseLine className="w-5 h-5 text-neutral-400" />
                  </motion.button>
                )}
                <div className="text-xs text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md">
                  ESC
                </div>
              </div>

              {/* Search results */}
              <div className="max-h-[400px] overflow-y-auto">
                {/* Recent searches */}
                {!query && (
                  <div className="p-4">
                    <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                      Buscas recentes
                    </h3>
                    <div className="space-y-1">
                      {recentSearches.map((search, i) => (
                        <motion.button
                          key={search}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left transition-colors"
                          onClick={() => setQuery(search)}
                        >
                          <RiSearchLine className="w-4 h-4 text-neutral-400" />
                          <span className="text-sm text-neutral-600 dark:text-neutral-300">{search}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {query && (
                  <div className="p-4">
                    <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                      Sugestões
                    </h3>
                    <div className="space-y-1">
                      {suggestions.map((item, i) => (
                        <motion.button
                          key={item.text}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-500/10 text-left transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-orange-500 bg-orange-100 dark:bg-orange-500/20 px-2 py-0.5 rounded-full">
                              {item.type}
                            </span>
                            <span className="text-sm text-neutral-700 dark:text-neutral-200 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                              {item.text}
                            </span>
                          </div>
                          {item.count && (
                            <span className="text-xs text-neutral-400">{item.count} resultados</span>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
                <div className="flex items-center gap-4 text-xs text-neutral-400">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white dark:bg-neutral-700 rounded shadow-sm">↵</kbd>
                    <span>selecionar</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white dark:bg-neutral-700 rounded shadow-sm">↑↓</kbd>
                    <span>navegar</span>
                  </span>
                </div>
                <span className="text-xs text-neutral-400">
                  Powered by <span className="text-orange-500 font-medium">tappyimob</span>
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
