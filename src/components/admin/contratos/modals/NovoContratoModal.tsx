"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCloseLine,
  RiFileTextLine,
  RiMoneyDollarCircleLine,
  RiHome4Line,
  RiExchangeLine,
  RiArrowRightLine,
} from "react-icons/ri";
import { useRouter } from "next/navigation";

interface NovoContratoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const tiposContrato = [
  {
    id: "venda",
    nome: "Compra e Venda",
    descricao: "Contrato para venda de imóveis residenciais ou comerciais",
    icon: RiMoneyDollarCircleLine,
    color: "green",
    href: "/admin/contratos/vendas",
  },
  {
    id: "locacao",
    nome: "Locação",
    descricao: "Contrato de aluguel residencial ou comercial",
    icon: RiHome4Line,
    color: "blue",
    href: "/admin/contratos/locacoes",
  },
  {
    id: "permuta",
    nome: "Permuta",
    descricao: "Contrato de troca de imóveis entre partes",
    icon: RiExchangeLine,
    color: "purple",
    href: "/admin/contratos/permuta",
  },
];

const colorClasses: Record<string, { bg: string; text: string; hover: string }> = {
  green: { bg: "bg-green-100 dark:bg-green-500/20", text: "text-green-500", hover: "hover:border-green-300 dark:hover:border-green-600" },
  blue: { bg: "bg-blue-100 dark:bg-blue-500/20", text: "text-blue-500", hover: "hover:border-blue-300 dark:hover:border-blue-600" },
  purple: { bg: "bg-purple-100 dark:bg-purple-500/20", text: "text-purple-500", hover: "hover:border-purple-300 dark:hover:border-purple-600" },
};

export function NovoContratoModal({ isOpen, onClose }: NovoContratoModalProps) {
  const router = useRouter();
  const [selectedTipo, setSelectedTipo] = useState<string | null>(null);

  const handleSelect = (tipo: typeof tiposContrato[0]) => {
    setSelectedTipo(tipo.id);
    setTimeout(() => {
      onClose();
      router.push(`${tipo.href}?novo=true`);
    }, 200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none"
          >
            <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-lg p-6 pointer-events-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                    <RiFileTextLine className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                      Novo Contrato
                    </h2>
                    <p className="text-sm text-neutral-500">Selecione o tipo de contrato</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>

              {/* Tipos de Contrato */}
              <div className="space-y-3">
                {tiposContrato.map((tipo) => {
                  const colors = colorClasses[tipo.color];
                  const Icon = tipo.icon;

                  return (
                    <motion.button
                      key={tipo.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelect(tipo)}
                      className={`w-full p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 ${colors.hover} transition-all flex items-center gap-4 text-left group ${
                        selectedTipo === tipo.id ? "ring-2 ring-blue-500 border-blue-500" : ""
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${colors.text}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-900 dark:text-white">
                          {tipo.nome}
                        </h3>
                        <p className="text-sm text-neutral-500">{tipo.descricao}</p>
                      </div>
                      <RiArrowRightLine className="w-5 h-5 text-neutral-400 group-hover:text-neutral-600 group-hover:translate-x-1 transition-all" />
                    </motion.button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  onClick={onClose}
                  className="w-full h-10 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
