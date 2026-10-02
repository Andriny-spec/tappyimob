"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCloseLine,
  RiSparklingLine,
  RiAddLine,
  RiDeleteBinLine,
  RiTimeLine,
  RiArrowRightLine,
  RiNotification3Line,
  RiPriceTag3Line,
  RiUserLine,
  RiRobot2Line,
} from "react-icons/ri";
import { KanbanColumn, AutomationRule, LeadStatus, leadStatusLabels } from "@/types/lead";

interface AutomationModalProps {
  column: KanbanColumn | null;
  columns: KanbanColumn[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (columnId: string, enabled: boolean, rules: AutomationRule[]) => void;
}

const triggerOptions = [
  { value: "days_without_contact", label: "Dias sem contato", icon: RiTimeLine },
  { value: "score_above", label: "Score IA acima de", icon: RiSparklingLine },
  { value: "score_below", label: "Score IA abaixo de", icon: RiSparklingLine },
  { value: "ai_detected", label: "IA detectou fechamento", icon: RiRobot2Line },
];

const actionOptions = [
  { value: "move_to", label: "Mover para coluna", icon: RiArrowRightLine },
  { value: "notify", label: "Enviar notificação", icon: RiNotification3Line },
  { value: "tag", label: "Adicionar tag", icon: RiPriceTag3Line },
  { value: "assign", label: "Atribuir corretor", icon: RiUserLine },
];

export function AutomationModal({
  column,
  columns,
  isOpen,
  onClose,
  onSave,
}: AutomationModalProps) {
  const [enabled, setEnabled] = useState(column?.automationEnabled || false);
  const [rules, setRules] = useState<AutomationRule[]>(column?.automationRules || []);

  const addRule = () => {
    const newRule: AutomationRule = {
      id: `rule-${Date.now()}`,
      trigger: "days_without_contact",
      value: 3,
      action: "move_to",
      targetColumn: columns[0]?.status,
    };
    setRules([...rules, newRule]);
  };

  const updateRule = (index: number, updates: Partial<AutomationRule>) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], ...updates };
    setRules(newRules);
  };

  const deleteRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (column) {
      onSave(column.id, enabled, rules);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && column && (
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
            <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-2xl p-6 pointer-events-auto max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <RiSparklingLine className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                      Automação da Coluna
                    </h2>
                    <p className="text-sm text-neutral-500">{column.title}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>

              {/* Enable toggle */}
              <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl mb-6">
                <div className="flex items-center gap-3">
                  <RiRobot2Line className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">
                      Automação com IA
                    </p>
                    <p className="text-sm text-neutral-500">
                      Use DeepSeek AI para automatizar movimentação de leads
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500"></div>
                </label>
              </div>

              {/* Rules */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-neutral-900 dark:text-white">
                    Regras de Automação
                  </h3>
                  <button
                    onClick={addRule}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors"
                  >
                    <RiAddLine className="w-4 h-4" />
                    Adicionar Regra
                  </button>
                </div>

                {rules.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500">
                    <RiSparklingLine className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhuma regra configurada</p>
                    <p className="text-sm">Adicione regras para automatizar esta coluna</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {rules.map((rule, index) => (
                      <motion.div
                        key={rule.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            {/* Trigger */}
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-neutral-500 w-16">Quando</span>
                              <select
                                value={rule.trigger}
                                onChange={(e) =>
                                  updateRule(index, { trigger: e.target.value as any })
                                }
                                className="flex-1 h-10 px-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                              >
                                {triggerOptions.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                              {(rule.trigger === "days_without_contact" ||
                                rule.trigger === "score_above" ||
                                rule.trigger === "score_below") && (
                                <input
                                  type="number"
                                  value={rule.value as number}
                                  onChange={(e) =>
                                    updateRule(index, { value: parseInt(e.target.value) })
                                  }
                                  className="w-20 h-10 px-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                />
                              )}
                            </div>

                            {/* Action */}
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-neutral-500 w-16">Então</span>
                              <select
                                value={rule.action}
                                onChange={(e) =>
                                  updateRule(index, { action: e.target.value as any })
                                }
                                className="flex-1 h-10 px-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                              >
                                {actionOptions.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                              {rule.action === "move_to" && (
                                <select
                                  value={rule.targetColumn}
                                  onChange={(e) =>
                                    updateRule(index, {
                                      targetColumn: e.target.value as LeadStatus,
                                    })
                                  }
                                  className="w-36 h-10 px-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                >
                                  {columns.map((col) => (
                                    <option key={col.id} value={col.status}>
                                      {col.title}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => deleteRule(index)}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-neutral-400 hover:text-red-500 transition-colors"
                          >
                            <RiDeleteBinLine className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Info */}
              <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl mb-6">
                <div className="flex items-start gap-3">
                  <RiRobot2Line className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-neutral-900 dark:text-white mb-1">
                      Integração DeepSeek AI
                    </p>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      A IA analisa mensagens, comportamento e histórico do lead para identificar 
                      automaticamente quando ele está pronto para fechar, permitindo mover cards 
                      entre colunas de forma inteligente.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 h-12 px-6 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:opacity-90 transition-opacity"
                >
                  <RiSparklingLine className="w-5 h-5" />
                  Salvar Automação
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
