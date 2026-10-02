"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RiCheckLine, RiCloseLine } from "react-icons/ri";

export function CondominioModal({
  isOpen,
  onClose,
  condominios,
  setCondominios,
  condominioOptions,
  tipoSelecionado,
}: {
  isOpen: boolean;
  onClose: () => void;
  condominios: string[];
  setCondominios: React.Dispatch<React.SetStateAction<string[]>>;
  condominioOptions: { value: string; label: string; condoType?: string; condoCategory?: string }[];
  tipoSelecionado?: string;
}) {
  const [search, setSearch] = useState("");

  const toggleCondominio = (value: string) => {
    if (condominios.includes(value)) {
      setCondominios(condominios.filter((c) => c !== value));
    } else {
      setCondominios([...condominios, value]);
    }
  };

  // Filtrar por tipo selecionado: apto→VERTICAL, casa→HORIZONTAL+VILLAGIO, terreno→HORIZONTAL+VILLAGIO, comercial→COMERCIAL
  const filteredByType = condominioOptions.filter((opt) => {
    if (!tipoSelecionado) return true;
    if (tipoSelecionado === "apartamento") return opt.condoType === "VERTICAL";
    if (tipoSelecionado === "casa") return opt.condoType === "HORIZONTAL" || opt.condoType === "VILLAGIO";
    if (tipoSelecionado === "terreno") return opt.condoType === "HORIZONTAL" || opt.condoType === "VILLAGIO";
    if (tipoSelecionado === "comercial") return opt.condoCategory === "COMERCIAL";
    return true;
  });

  const normalize = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filtered = filteredByType
    .filter((opt) => normalize(opt.label).includes(normalize(search)))
    .sort((a, b) => a.label.trim().localeCompare(b.label.trim(), "pt-BR", { numeric: true, sensitivity: "base" }));

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl z-50 overflow-hidden mx-4"
          >
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Selecionar Condomínios</h3>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>
            <div className="px-4 pt-4">
              <input
                type="text"
                placeholder="Buscar condomínio..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545]/50"
              />
            </div>
            <div className="p-4 max-h-[50vh] overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-center text-neutral-400 py-4 text-sm">Nenhum condomínio encontrado</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1">
                  {filtered.map((option) => {
                    const isSelected = condominios.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        onClick={() => toggleCondominio(option.value)}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left"
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelected
                            ? "bg-[#0B2545] border-[#0B2545]"
                            : "border-neutral-300 dark:border-neutral-600"
                        }`}>
                          {isSelected && <RiCheckLine className="w-3 h-3 text-white" />}
                        </div>
                        <span className={`text-sm truncate ${isSelected ? "font-medium text-[#0B2545] dark:text-sky-400" : "text-neutral-700 dark:text-neutral-300"}`}>
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              {condominios.length > 0 && (
                <span className="text-xs text-neutral-500">{condominios.length} selecionado{condominios.length > 1 ? "s" : ""}</span>
              )}
              <button
                onClick={onClose}
                className="ml-auto py-3 px-8 bg-[#0B2545] text-white font-semibold rounded-xl hover:bg-[#081733] transition-colors"
              >
                Aplicar Filtro
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
