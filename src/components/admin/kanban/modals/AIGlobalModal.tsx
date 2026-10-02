"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCloseLine,
  RiSparklingLine,
  RiLoader4Line,
  RiCheckLine,
  RiRobot2Line,
  RiLightbulbLine,
  RiUserStarLine,
  RiBarChartLine,
  RiMailLine,
  RiTimeLine,
  RiAlertLine,
  RiArrowRightLine,
  RiPlayLine,
  RiFileTextLine,
} from "react-icons/ri";

interface AIGlobalModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadCount: number;
}

interface AIAction {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  loading?: boolean;
  completed?: boolean;
}

export function AIGlobalModal({ isOpen, onClose, leadCount }: AIGlobalModalProps) {
  const [actions, setActions] = useState<AIAction[]>([
    {
      id: "analyze",
      title: "Analisar Todos os Leads",
      description: "Atualiza o score e probabilidade de todos os leads usando IA",
      icon: RiSparklingLine,
      color: "purple",
    },
    {
      id: "suggestions",
      title: "Gerar Sugestões de Ação",
      description: "Identifica os melhores próximos passos para cada lead",
      icon: RiLightbulbLine,
      color: "amber",
    },
    {
      id: "qualify",
      title: "Qualificar em Massa",
      description: "Qualifica automaticamente leads baseado em critérios BANT",
      icon: RiUserStarLine,
      color: "blue",
    },
    {
      id: "followup",
      title: "Detectar Follow-ups",
      description: "Identifica leads que precisam de follow-up urgente",
      icon: RiTimeLine,
      color: "orange",
    },
    {
      id: "closing",
      title: "Detectar Fechamentos",
      description: "Identifica leads prontos para fechamento",
      icon: RiCheckLine,
      color: "green",
    },
    {
      id: "report",
      title: "Gerar Relatório",
      description: "Cria um relatório completo de performance dos leads",
      icon: RiBarChartLine,
      color: "cyan",
    },
  ]);

  const [results, setResults] = useState<{
    show: boolean;
    title: string;
    items: { text: string; type: "success" | "warning" | "info" }[];
  } | null>(null);

  const runAction = async (actionId: string) => {
    setActions((prev) =>
      prev.map((a) => (a.id === actionId ? { ...a, loading: true } : a))
    );

    // Simulate AI processing
    await new Promise((r) => setTimeout(r, 2000));

    setActions((prev) =>
      prev.map((a) =>
        a.id === actionId ? { ...a, loading: false, completed: true } : a
      )
    );

    // Show mock results
    const mockResults: Record<string, typeof results> = {
      analyze: {
        show: true,
        title: "Análise Concluída",
        items: [
          { text: `${leadCount} leads analisados`, type: "success" },
          { text: "15 leads com score atualizado", type: "info" },
          { text: "8 leads subiram de probabilidade", type: "success" },
          { text: "3 leads precisam de atenção", type: "warning" },
        ],
      },
      suggestions: {
        show: true,
        title: "Sugestões Geradas",
        items: [
          { text: "12 leads precisam de ligação", type: "info" },
          { text: "5 leads prontos para proposta", type: "success" },
          { text: "8 leads precisam de mais informações", type: "warning" },
          { text: "3 leads podem ser descartados", type: "warning" },
        ],
      },
      qualify: {
        show: true,
        title: "Qualificação Concluída",
        items: [
          { text: "18 leads qualificados automaticamente", type: "success" },
          { text: "7 leads movidos para 'Qualificado'", type: "info" },
          { text: "4 leads precisam de revisão manual", type: "warning" },
        ],
      },
      followup: {
        show: true,
        title: "Follow-ups Detectados",
        items: [
          { text: "11 leads sem contato há 3+ dias", type: "warning" },
          { text: "5 leads com follow-up vencido", type: "warning" },
          { text: "Notificações enviadas aos corretores", type: "success" },
        ],
      },
      closing: {
        show: true,
        title: "Fechamentos Detectados",
        items: [
          { text: "6 leads prontos para fechamento", type: "success" },
          { text: "Probabilidade média: 87%", type: "info" },
          { text: "Valor potencial: R$ 2.3M", type: "success" },
        ],
      },
      report: {
        show: true,
        title: "Relatório Gerado",
        items: [
          { text: "Relatório salvo em PDF", type: "success" },
          { text: "Enviado por e-mail", type: "info" },
          { text: "Disponível no painel de relatórios", type: "info" },
        ],
      },
    };

    setResults(mockResults[actionId] || null);
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; hover: string }> = {
      purple: {
        bg: "bg-purple-100 dark:bg-purple-500/20",
        text: "text-purple-500",
        hover: "hover:bg-purple-50 dark:hover:bg-purple-500/10",
      },
      amber: {
        bg: "bg-amber-100 dark:bg-amber-500/20",
        text: "text-amber-500",
        hover: "hover:bg-amber-50 dark:hover:bg-amber-500/10",
      },
      blue: {
        bg: "bg-blue-100 dark:bg-blue-500/20",
        text: "text-blue-500",
        hover: "hover:bg-blue-50 dark:hover:bg-blue-500/10",
      },
      orange: {
        bg: "bg-orange-100 dark:bg-orange-500/20",
        text: "text-orange-500",
        hover: "hover:bg-orange-50 dark:hover:bg-orange-500/10",
      },
      green: {
        bg: "bg-green-100 dark:bg-green-500/20",
        text: "text-green-500",
        hover: "hover:bg-green-50 dark:hover:bg-green-500/10",
      },
      cyan: {
        bg: "bg-cyan-100 dark:bg-cyan-500/20",
        text: "text-cyan-500",
        hover: "hover:bg-cyan-50 dark:hover:bg-cyan-500/10",
      },
    };
    return colors[color] || colors.purple;
  };

  const handleClose = () => {
    setResults(null);
    setActions((prev) => prev.map((a) => ({ ...a, completed: false })));
    onClose();
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
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none"
          >
            <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-2xl p-6 pointer-events-auto max-h-[85vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <RiRobot2Line className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                      Central de IA
                    </h2>
                    <p className="text-sm text-neutral-500">
                      {leadCount} leads disponíveis para análise
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                >
                  <RiCloseLine className="w-6 h-6" />
                </button>
              </div>

              {/* Results */}
              <AnimatePresence>
                {results && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <RiCheckLine className="w-5 h-5 text-green-500" />
                      <h3 className="font-semibold text-neutral-900 dark:text-white">
                        {results.title}
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {results.items.map((item, i) => (
                        <div
                          key={i}
                          className={`flex items-center gap-2 text-sm ${
                            item.type === "success"
                              ? "text-green-600 dark:text-green-400"
                              : item.type === "warning"
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-neutral-600 dark:text-neutral-400"
                          }`}
                        >
                          {item.type === "success" ? (
                            <RiCheckLine className="w-4 h-4" />
                          ) : item.type === "warning" ? (
                            <RiAlertLine className="w-4 h-4" />
                          ) : (
                            <RiArrowRightLine className="w-4 h-4" />
                          )}
                          {item.text}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions Grid */}
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {actions.map((action) => {
                    const colors = getColorClasses(action.color);
                    return (
                      <motion.button
                        key={action.id}
                        onClick={() => !action.loading && runAction(action.id)}
                        disabled={action.loading}
                        className={`p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-left transition-all ${colors.hover} ${
                          action.completed
                            ? "border-green-300 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10"
                            : ""
                        } disabled:opacity-50`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}
                          >
                            {action.loading ? (
                              <RiLoader4Line className={`w-5 h-5 ${colors.text} animate-spin`} />
                            ) : action.completed ? (
                              <RiCheckLine className="w-5 h-5 text-green-500" />
                            ) : (
                              <action.icon className={`w-5 h-5 ${colors.text}`} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-neutral-900 dark:text-white text-sm">
                              {action.title}
                            </h4>
                            <p className="text-xs text-neutral-500 mt-0.5">
                              {action.description}
                            </p>
                          </div>
                          {!action.loading && !action.completed && (
                            <RiPlayLine className={`w-5 h-5 ${colors.text}`} />
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Info */}
              <div className="mt-6 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <RiSparklingLine className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Powered by <strong className="text-purple-500">DeepSeek AI</strong>
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      A IA analisa padrões de comportamento, histórico de interações e dados
                      de mercado para gerar insights precisos sobre seus leads.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 pt-6 mt-4 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  onClick={handleClose}
                  className="flex-1 h-12 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  Fechar
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:opacity-90">
                  <RiSparklingLine className="w-5 h-5" />
                  Executar Todas
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
