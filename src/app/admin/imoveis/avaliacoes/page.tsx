"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiPriceTag3Line,
  RiSearchLine,
  RiAddLine,
  RiLoader4Line,
  RiHome4Line,
  RiMapPinLine,
  RiCalendarLine,
  RiUserLine,
  RiMoneyDollarCircleLine,
  RiMoreLine,
  RiEditLine,
  RiDeleteBinLine,
  RiEyeLine,
  RiFileTextLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiCloseLine,
  RiCheckLine,
} from "react-icons/ri";
import { EvaluationFormModal } from "@/components/admin/evaluations/EvaluationFormModal";

interface Evaluation {
  id: string;
  value: number;
  notes: string | null;
  evaluator: string;
  date: string;
  property: {
    id: string;
    code: string;
    title: string;
    address: string;
    neighborhood: string;
    city: string;
    price: number;
    thumbnail: string | null;
  };
  createdAt: string;
}


export default function AvaliacoesPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [selectedEval, setSelectedEval] = useState<Evaluation | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);

  // Fetch evaluations
  const fetchEvaluations = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      
      const response = await fetch(`/api/evaluations?${params.toString()}`);
      const data = await response.json();
      if (response.ok) {
        setEvaluations(data.evaluations);
      }
    } catch (error) {
      console.error("Error fetching evaluations:", error);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchEvaluations();
  }, [fetchEvaluations]);

  const filteredEvaluations = evaluations.filter((evaluation) =>
    evaluation.property.title.toLowerCase().includes(search.toLowerCase()) ||
    evaluation.property.code.toLowerCase().includes(search.toLowerCase()) ||
    evaluation.evaluator.toLowerCase().includes(search.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  const getPriceDifference = (evaluated: number, listed: number) => {
    const diff = evaluated - listed;
    const percentage = ((diff / listed) * 100).toFixed(1);
    return { diff, percentage };
  };

  const stats = {
    total: evaluations.length,
    avgDiff: evaluations.reduce((acc, e) => {
      const { diff } = getPriceDifference(e.value, e.property.price);
      return acc + diff;
    }, 0) / evaluations.length,
    abovePrice: evaluations.filter((e) => e.value > e.property.price).length,
    belowPrice: evaluations.filter((e) => e.value < e.property.price).length,
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta avaliação?")) return;
    
    try {
      const response = await fetch(`/api/evaluations/${id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        fetchEvaluations();
      } else {
        const data = await response.json();
        alert(data.error || "Erro ao excluir avaliação");
      }
    } catch (error) {
      console.error("Error deleting evaluation:", error);
    }
    setShowMenu(null);
  };

  const handleView = (evaluation: Evaluation) => {
    setSelectedEval(evaluation);
    setShowModal(true);
    setShowMenu(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
              <RiPriceTag3Line className="w-5 h-5 text-purple-500" />
            </div>
            Avaliações de Imóveis
          </h1>
          <p className="text-neutral-500 mt-1">
            Histórico de avaliações e laudos
          </p>
        </div>

        <button 
          onClick={() => setShowFormModal(true)}
          className="flex items-center gap-2 h-12 px-5 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600 transition-colors"
        >
          <RiAddLine className="w-5 h-5" />
          <span>Nova Avaliação</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
              <RiFileTextLine className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.total}</p>
              <p className="text-sm text-neutral-500">Total</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
              <RiArrowUpLine className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.abovePrice}</p>
              <p className="text-sm text-neutral-500">Acima do anúncio</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
              <RiArrowDownLine className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.belowPrice}</p>
              <p className="text-sm text-neutral-500">Abaixo do anúncio</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
              <RiMoneyDollarCircleLine className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {stats.avgDiff >= 0 ? "+" : ""}{formatPrice(stats.avgDiff)}
              </p>
              <p className="text-sm text-neutral-500">Média de diferença</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search */}
      <div className="relative">
        <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por imóvel, código ou avaliador..."
          className="w-full h-12 pl-12 pr-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
        />
      </div>

      {/* Evaluations List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <RiLoader4Line className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      ) : filteredEvaluations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
            <RiPriceTag3Line className="w-10 h-10 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
            Nenhuma avaliação encontrada
          </h3>
          <p className="text-neutral-500 max-w-md">
            {search ? "Tente ajustar sua busca." : "Nenhuma avaliação cadastrada."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvaluations.map((evaluation, i) => {
            const { diff, percentage } = getPriceDifference(evaluation.value, evaluation.property.price);
            const isPositive = diff >= 0;

            return (
              <motion.div
                key={evaluation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-purple-300 dark:hover:border-purple-500/50 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Property Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
                      {evaluation.property.thumbnail ? (
                        <img
                          src={evaluation.property.thumbnail}
                          alt={evaluation.property.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <RiHome4Line className="w-8 h-8 text-neutral-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                          {evaluation.property.code}
                        </span>
                      </div>
                      <h3 className="font-semibold text-neutral-900 dark:text-white truncate">
                        {evaluation.property.title}
                      </h3>
                      <p className="text-sm text-neutral-500 flex items-center gap-1">
                        <RiMapPinLine className="w-4 h-4" />
                        {evaluation.property.neighborhood}, {evaluation.property.city}
                      </p>
                    </div>
                  </div>

                  {/* Prices */}
                  <div className="flex items-center gap-6 lg:gap-8">
                    <div className="text-center">
                      <p className="text-sm text-neutral-500">Anunciado</p>
                      <p className="font-semibold text-neutral-900 dark:text-white">
                        {formatPrice(evaluation.property.price)}
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-neutral-500">Avaliado</p>
                      <p className="font-semibold text-purple-500">
                        {formatPrice(evaluation.value)}
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-neutral-500">Diferença</p>
                      <p className={`font-semibold flex items-center gap-1 ${
                        isPositive ? "text-green-500" : "text-red-500"
                      }`}>
                        {isPositive ? <RiArrowUpLine /> : <RiArrowDownLine />}
                        {percentage}%
                      </p>
                    </div>
                  </div>

                  {/* Evaluator & Date */}
                  <div className="flex items-center gap-4 min-w-[180px]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {evaluation.evaluator.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-neutral-900 dark:text-white truncate">
                        {evaluation.evaluator}
                      </p>
                      <p className="text-sm text-neutral-500 flex items-center gap-1">
                        <RiCalendarLine className="w-3 h-3" />
                        {formatDate(evaluation.date)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(showMenu === evaluation.id ? null : evaluation.id)}
                      className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                    >
                      <RiMoreLine className="w-5 h-5" />
                    </button>

                    <AnimatePresence>
                      {showMenu === evaluation.id && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowMenu(null)}
                          />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 z-50 overflow-hidden"
                          >
                            <button
                              onClick={() => handleView(evaluation)}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                            >
                              <RiEyeLine className="w-4 h-4" />
                              Ver Detalhes
                            </button>
                            <button className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                              <RiEditLine className="w-4 h-4" />
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(evaluation.id)}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500"
                            >
                              <RiDeleteBinLine className="w-4 h-4" />
                              Excluir
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {evaluation.notes && (
                  <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                      {evaluation.notes}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* View Modal */}
      <AnimatePresence>
        {showModal && selectedEval && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none"
            >
              <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-2xl p-6 pointer-events-auto max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                    Detalhes da Avaliação
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                  >
                    <RiCloseLine className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Property */}
                  <div className="flex items-center gap-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-neutral-200 dark:bg-neutral-700 flex-shrink-0">
                      {selectedEval.property.thumbnail ? (
                        <img
                          src={selectedEval.property.thumbnail}
                          alt={selectedEval.property.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <RiHome4Line className="w-8 h-8 text-neutral-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">{selectedEval.property.code}</p>
                      <h3 className="font-semibold text-neutral-900 dark:text-white">
                        {selectedEval.property.title}
                      </h3>
                      <p className="text-sm text-neutral-500">
                        {selectedEval.property.address}, {selectedEval.property.neighborhood}
                      </p>
                    </div>
                  </div>

                  {/* Prices Comparison */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-center">
                      <p className="text-sm text-neutral-500 mb-1">Anunciado</p>
                      <p className="text-xl font-bold text-neutral-900 dark:text-white">
                        {formatPrice(selectedEval.property.price)}
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-500/10 rounded-xl text-center">
                      <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Avaliado</p>
                      <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                        {formatPrice(selectedEval.value)}
                      </p>
                    </div>
                    <div className={`p-4 rounded-xl text-center ${
                      selectedEval.value >= selectedEval.property.price
                        ? "bg-green-50 dark:bg-green-500/10"
                        : "bg-red-50 dark:bg-red-500/10"
                    }`}>
                      <p className={`text-sm mb-1 ${
                        selectedEval.value >= selectedEval.property.price
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}>Diferença</p>
                      <p className={`text-xl font-bold ${
                        selectedEval.value >= selectedEval.property.price
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}>
                        {formatPrice(selectedEval.value - selectedEval.property.price)}
                      </p>
                    </div>
                  </div>

                  {/* Evaluator */}
                  <div className="flex items-center gap-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-lg font-semibold">
                      {selectedEval.evaluator.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-white">
                        {selectedEval.evaluator}
                      </p>
                      <p className="text-sm text-neutral-500">
                        Avaliado em {formatDate(selectedEval.date)}
                      </p>
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedEval.notes && (
                    <div>
                      <h4 className="font-medium text-neutral-900 dark:text-white mb-2">
                        Observações
                      </h4>
                      <p className="text-neutral-600 dark:text-neutral-400 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                        {selectedEval.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Form Modal */}
      <EvaluationFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSave={fetchEvaluations}
      />
    </div>
  );
}
