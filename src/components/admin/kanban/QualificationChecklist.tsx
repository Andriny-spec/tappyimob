"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCheckLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiFireLine,
  RiTimeLine,
  RiAlertLine,
  RiSparklingLine,
  RiBuilding2Line,
  RiAddLine,
  RiCloseLine,
  RiSearchLine,
} from "react-icons/ri";

// Estrutura de qualificação baseada no documento
export const qualificationBlocks = [
  {
    id: "A",
    name: "Gatilho & Timing",
    objective: "Urgência / prazo de compra",
    weight: 3,
    questions: [
      {
        id: "A1",
        question: "Gatilho de compra ativo",
        options: [
          { points: 2, label: "Sim", description: "Tem gatilho claro" },
          { points: 1, label: "Parcial", description: "Gatilho parcial" },
          { points: 0, label: "Não", description: "Não existe gatilho" },
        ],
      },
      {
        id: "A2",
        question: "Evento externo com data",
        options: [
          { points: 2, label: "Sim", description: "Data definida" },
          { points: 1, label: "Parcial", description: "Data aproximada" },
          { points: 0, label: "Não existe", description: "Sem evento" },
        ],
      },
      {
        id: "A3",
        question: "Horizonte declarado de compra",
        options: [
          { points: 2, label: "Até 30 dias", description: "Urgente" },
          { points: 1, label: "30-90 dias", description: "Pode permanecer" },
          { points: 0, label: "Indefinido", description: "Sem prazo" },
        ],
      },
      {
        id: "A4",
        question: "Situação atual de moradia",
        options: [
          { points: 2, label: "Precisa sair", description: "Urgência real" },
          { points: 1, label: "Pode permanecer", description: "Flexível" },
          { points: 0, label: "Provisória", description: "Sem urgência" },
        ],
      },
      {
        id: "A5",
        question: "Custo percebido de esperar",
        options: [
          { points: 2, label: "Esperar piora", description: "Alto custo" },
          { points: 1, label: "Neutro", description: "Indiferente" },
          { points: 0, label: "Confortável", description: "Sem custo" },
        ],
      },
      {
        id: "A6",
        question: "Histórico recente de postergação",
        options: [
          { points: 2, label: "Não postergou", description: "Decisivo" },
          { points: 1, label: "Já adiou", description: "Recorrente" },
          { points: 0, label: "Recorrente", description: "Sempre adia" },
        ],
      },
      {
        id: "A7",
        question: "Reação à escassez real",
        options: [
          { points: 2, label: "Acelera", description: "Age rápido" },
          { points: 1, label: "Mantém", description: "Indiferente" },
          { points: 0, label: "Paralisa", description: "Trava" },
        ],
      },
      {
        id: "A8",
        question: "Compromisso prático assumido",
        options: [
          { points: 2, label: "Financiamento/docs", description: "Ação concreta" },
          { points: 1, label: "Verbal", description: "Só palavras" },
          { points: 0, label: "Nenhum", description: "Sem compromisso" },
        ],
      },
      {
        id: "A9",
        question: "Quantidade de visitas no ciclo atual",
        options: [
          { points: 2, label: "3-5 visitas", description: "Engajado" },
          { points: 1, label: "1-2 visitas", description: "Iniciando" },
          { points: 0, label: "6+ visitas", description: "Indeciso" },
        ],
      },
    ],
  },
  {
    id: "B",
    name: "Estrutura Financeira",
    objective: "Capacidade real de compra",
    weight: 3,
    questions: [
      {
        id: "B10",
        question: "Estrutura financeira",
        options: [
          { points: 2, label: "Validada", description: "Comprovada" },
          { points: 1, label: "Em validação", description: "Aguardando" },
          { points: 0, label: "Não validada", description: "Sem comprovação" },
        ],
      },
      {
        id: "B11",
        question: "Origem do recurso",
        options: [
          { points: 2, label: "Disponível", description: "Pronto" },
          { points: 1, label: "Parcial", description: "Parte disponível" },
          { points: 0, label: "Depende de evento", description: "Incerto" },
        ],
      },
      {
        id: "B12",
        question: "Dependência de venda de outro imóvel",
        options: [
          { points: 2, label: "Não depende", description: "Independente" },
          { points: 1, label: "Sim (andamento forte)", description: "Em progresso" },
          { points: 0, label: "Sim (parado)", description: "Bloqueado" },
        ],
      },
      {
        id: "B13",
        question: "Capacidade de renda / taxa",
        options: [
          { points: 2, label: "Habilitado", description: "Aprovado" },
          { points: 1, label: "Condicional", description: "Ajustável" },
          { points: 0, label: "Inabilitado", description: "Não aprovado" },
        ],
      },
      {
        id: "B14",
        question: "Compatibilidade orçamento × padrão",
        options: [
          { points: 2, label: "Compatível", description: "Alinhado" },
          { points: 1, label: "Ajustável", description: "Negociável" },
          { points: 0, label: "Incompatível", description: "Desalinhado" },
        ],
      },
    ],
  },
  {
    id: "C",
    name: "Maturidade da Decisão",
    objective: "Afunilamento (exclusão)",
    weight: 2,
    questions: [
      {
        id: "C15",
        question: "Nível de exclusão de opções",
        options: [
          { points: 2, label: "Já descartou a maioria", description: "Focado" },
          { points: 1, label: "Ainda testando", description: "Explorando" },
          { points: 0, label: "Não descarta", description: "Indeciso" },
        ],
      },
      {
        id: "C16",
        question: "Fadiga mental da decisão",
        options: [
          { points: 2, label: "Escolhendo entre poucos", description: "Afunilado" },
          { points: 1, label: "Comparando vários", description: "Entendendo o mercado" },
          { points: 0, label: "Sem fadiga", description: "Início" },
        ],
      },
      {
        id: "C17",
        question: "Redução ativa da busca",
        options: [
          { points: 2, label: "Busca claramente reduzida", description: "Decidindo" },
          { points: 1, label: "Busca em redução", description: "Afunilando" },
          { points: 0, label: "Busca ativa e ampla", description: "Explorando" },
        ],
      },
    ],
  },
  {
    id: "D",
    name: "Comportamento & Engajamento",
    objective: "Ritmo e consistência",
    weight: 2,
    questions: [
      {
        id: "D18",
        question: "Tempo de resposta",
        options: [
          { points: 2, label: "Horas", description: "Rápido" },
          { points: 1, label: "1-2 dias", description: "Normal" },
          { points: 0, label: "3+ dias", description: "Lento" },
        ],
      },
      {
        id: "D19",
        question: "Condução da agenda",
        options: [
          { points: 2, label: "Proativa", description: "Ele agenda" },
          { points: 1, label: "Ajusta", description: "Flexível" },
          { points: 0, label: "Evita", description: "Foge" },
        ],
      },
      {
        id: "D20",
        question: "Profundidade das perguntas",
        options: [
          { points: 2, label: "Negociação/documentos", description: "Técnicas" },
          { points: 1, label: "Técnicas", description: "Detalhadas" },
          { points: 0, label: "Superficiais", description: "Básicas" },
        ],
      },
      {
        id: "D21",
        question: "Postura após visita",
        options: [
          { points: 2, label: "Retorno rápido", description: "Engajado" },
          { points: 1, label: "Retorna com atraso", description: "Interessado" },
          { points: 0, label: "Não retorna", description: "Desinteressado" },
        ],
      },
    ],
  },
  {
    id: "E",
    name: "Fricção & Risco",
    objective: "Travas e dispersão",
    weight: 1,
    questions: [
      {
        id: "E22",
        question: "Objeção principal hoje",
        options: [
          { points: 2, label: "Nenhuma", description: "Sem objeção" },
          { points: 1, label: "Contornável", description: "Tratável" },
          { points: 0, label: "Travante", description: "Bloqueadora" },
        ],
      },
      {
        id: "E23",
        question: "Quantidade de corretores envolvidos",
        options: [
          { points: 2, label: "1", description: "Exclusivo" },
          { points: 1, label: "2-3", description: "Poucos" },
          { points: 0, label: "4+", description: "Disperso" },
        ],
      },
      {
        id: "E24",
        question: "Risco de turismo de mercado",
        options: [
          { points: 2, label: "Baixo", description: "Focado" },
          { points: 1, label: "Médio", description: "Explorando" },
          { points: 0, label: "Alto", description: "Só passeando" },
        ],
      },
      {
        id: "E25",
        question: "Abertura para proposta",
        options: [
          { points: 2, label: "Aberto agora", description: "Pronto" },
          { points: 1, label: "Após mais visitas", description: "Quase" },
          { points: 0, label: "Não aberto", description: "Fechado" },
        ],
      },
    ],
  },
];

interface QualificationChecklistProps {
  leadId: string;
  initialAnswers?: Record<string, number>;
  onAnswersChange?: (answers: Record<string, number>, score: number) => void;
  onTemperatureChange?: (temperature: "QUENTE" | "MORNO" | "FRIO") => void;
}

export function QualificationChecklist({
  leadId,
  initialAnswers = {},
  onAnswersChange,
  onTemperatureChange,
}: QualificationChecklistProps) {
  const [answers, setAnswers] = useState<Record<string, number>>(initialAnswers);
  const [expandedBlocks, setExpandedBlocks] = useState<string[]>(["A"]);
  const [isSaving, setIsSaving] = useState(false);
  const [nextReviewDays, setNextReviewDays] = useState<number | null>(null);
  const [showReviewToast, setShowReviewToast] = useState(false);

  // Calcular scores
  const scores = useMemo(() => {
    const blockScores: Record<string, { score: number; answered: number; total: number }> = {};
    let totalWeightedScore = 0;
    let totalWeight = 0;

    qualificationBlocks.forEach((block) => {
      let blockPoints = 0;
      let answeredCount = 0;

      block.questions.forEach((q) => {
        if (answers[q.id] !== undefined) {
          blockPoints += answers[q.id];
          answeredCount++;
        }
      });

      const maxPoints = block.questions.length * 2;
      const blockScore = answeredCount > 0 ? (blockPoints / (answeredCount * 2)) * 100 : 0;

      blockScores[block.id] = {
        score: Math.round(blockScore),
        answered: answeredCount,
        total: block.questions.length,
      };

      if (answeredCount > 0) {
        totalWeightedScore += blockScore * block.weight;
        totalWeight += block.weight;
      }
    });

    const totalScore = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;
    const totalAnswered = Object.values(answers).length;
    const totalQuestions = qualificationBlocks.reduce((acc, b) => acc + b.questions.length, 0);
    const confidence = Math.round((totalAnswered / totalQuestions) * 100);

    return { blockScores, totalScore, totalAnswered, totalQuestions, confidence };
  }, [answers]);

  // Interpretação do score
  const interpretation = useMemo(() => {
    if (scores.totalScore >= 75) {
      return {
        label: "Potencial Fechador",
        description: "Prioridade alta - Conduzir para proposta",
        color: "text-green-600",
        bgColor: "bg-green-50 dark:bg-green-500/10",
        borderColor: "border-green-200 dark:border-green-500/20",
        icon: RiFireLine,
        temperature: "QUENTE" as const,
      };
    } else if (scores.totalScore >= 60) {
      return {
        label: "Potencial com Risco",
        description: "Nutrição + condução firme",
        color: "text-amber-600",
        bgColor: "bg-amber-50 dark:bg-amber-500/10",
        borderColor: "border-amber-200 dark:border-amber-500/20",
        icon: RiTimeLine,
        temperature: "MORNO" as const,
      };
    } else {
      return {
        label: "Ainda não Fechador",
        description: "Automação / baixa prioridade",
        color: "text-blue-600",
        bgColor: "bg-blue-50 dark:bg-blue-500/10",
        borderColor: "border-blue-200 dark:border-blue-500/20",
        icon: RiAlertLine,
        temperature: "FRIO" as const,
      };
    }
  }, [scores.totalScore]);

  // Urgência baseada no bloco A (Timing)
  const urgency = useMemo(() => {
    const timingScore = scores.blockScores["A"]?.score || 0;
    if (timingScore >= 70) return { label: "0-30 dias", color: "text-red-500" };
    if (timingScore >= 40) return { label: "30-60 dias", color: "text-amber-500" };
    return { label: "60+ dias / Indefinido", color: "text-blue-500" };
  }, [scores.blockScores]);

  // Salvar resposta
  const handleAnswer = async (questionId: string, points: number) => {
    const newAnswers = { ...answers, [questionId]: points };
    setAnswers(newAnswers);

    // Calcular novo score
    let totalWeightedScore = 0;
    let totalWeight = 0;

    qualificationBlocks.forEach((block) => {
      let blockPoints = 0;
      let answeredCount = 0;

      block.questions.forEach((q) => {
        if (newAnswers[q.id] !== undefined) {
          blockPoints += newAnswers[q.id];
          answeredCount++;
        }
      });

      if (answeredCount > 0) {
        const blockScore = (blockPoints / (answeredCount * 2)) * 100;
        totalWeightedScore += blockScore * block.weight;
        totalWeight += block.weight;
      }
    });

    const newTotalScore = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;

    // Callback
    onAnswersChange?.(newAnswers, newTotalScore);

    // Auto-classificar temperatura se score > 75% e timing OK
    if (newTotalScore >= 75 && scores.blockScores["A"]?.score >= 70) {
      onTemperatureChange?.("QUENTE");
    }

    // Salvar no backend
    setIsSaving(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/qualification`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: newAnswers, score: newTotalScore }),
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.reviewDays) {
          setNextReviewDays(data.reviewDays);
          setShowReviewToast(true);
          // Esconder toast após 4 segundos
          setTimeout(() => setShowReviewToast(false), 4000);
        }
      }
    } catch (error) {
      console.error("Erro ao salvar qualificação:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleBlock = (blockId: string) => {
    setExpandedBlocks((prev) =>
      prev.includes(blockId) ? prev.filter((id) => id !== blockId) : [...prev, blockId]
    );
  };

  const Icon = interpretation.icon;
  const [showQualificationForm, setShowQualificationForm] = useState(false);

  return (
    <div className="space-y-4">
      {/* Score Geral - Compacto */}
      <div className={`p-3 rounded-xl border ${interpretation.bgColor} ${interpretation.borderColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg ${interpretation.bgColor} flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${interpretation.color}`} />
            </div>
            <div>
              <p className={`text-sm font-bold ${interpretation.color}`}>{interpretation.label}</p>
              <p className="text-[10px] text-neutral-500">{interpretation.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className={`text-xl font-bold ${interpretation.color}`}>{scores.totalScore}%</p>
              <p className="text-[10px] text-neutral-500">
                {scores.totalAnswered}/{scores.totalQuestions}
              </p>
            </div>
            <button
              onClick={() => setShowQualificationForm(!showQualificationForm)}
              className="p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-neutral-800/50 transition-colors"
            >
              {showQualificationForm ? (
                <RiArrowUpSLine className="w-5 h-5 text-neutral-400" />
              ) : (
                <RiArrowDownSLine className="w-5 h-5 text-neutral-400" />
              )}
            </button>
          </div>
        </div>

        {/* Barra de progresso geral - mais fina */}
        <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden mt-2">
          <motion.div
            className={`h-full rounded-full ${
              scores.totalScore >= 75
                ? "bg-gradient-to-r from-green-400 to-green-600"
                : scores.totalScore >= 60
                ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                : "bg-gradient-to-r from-blue-400 to-blue-600"
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${scores.totalScore}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Métricas rápidas - mais compactas */}
        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="text-center p-1.5 bg-white/50 dark:bg-neutral-800/50 rounded-lg">
            <p className="text-[10px] text-neutral-500">Confiabilidade</p>
            <p className={`text-xs font-bold ${scores.confidence >= 80 ? "text-green-600" : scores.confidence >= 50 ? "text-amber-600" : "text-red-600"}`}>
              {scores.confidence}%
            </p>
          </div>
          <div className="text-center p-1.5 bg-white/50 dark:bg-neutral-800/50 rounded-lg">
            <p className="text-[10px] text-neutral-500">Urgência</p>
            <p className={`text-xs font-bold ${urgency.color}`}>{urgency.label}</p>
          </div>
          <div className="text-center p-1.5 bg-white/50 dark:bg-neutral-800/50 rounded-lg">
            <p className="text-[10px] text-neutral-500">Status</p>
            <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              {isSaving ? "Salvando..." : "Salvo"}
            </p>
          </div>
        </div>
      </div>

      {/* Condomínios movidos para aba Informações */}

      {/* Blocos de Perguntas - Expansível */}
      <AnimatePresence>
        {showQualificationForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
      <div className="space-y-2">
        {qualificationBlocks.map((block) => {
          const blockScore = scores.blockScores[block.id];
          const isExpanded = expandedBlocks.includes(block.id);

          return (
            <div
              key={block.id}
              className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden"
            >
              {/* Header do Bloco */}
              <button
                onClick={() => toggleBlock(block.id)}
                className="w-full flex items-center justify-between p-3 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-bold">
                    {block.id}
                  </span>
                  <div className="text-left">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {block.name}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Peso {block.weight} • {blockScore?.answered || 0}/{blockScore?.total || 0} respondidas
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={`text-sm font-bold ${
                      (blockScore?.score || 0) >= 70 ? "text-green-600" :
                      (blockScore?.score || 0) >= 50 ? "text-amber-600" : "text-neutral-400"
                    }`}>
                      {blockScore?.score || 0}%
                    </p>
                  </div>
                  {isExpanded ? (
                    <RiArrowUpSLine className="w-5 h-5 text-neutral-400" />
                  ) : (
                    <RiArrowDownSLine className="w-5 h-5 text-neutral-400" />
                  )}
                </div>
              </button>

              {/* Perguntas */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 space-y-2">
                      {block.questions.map((question) => (
                        <div
                          key={question.id}
                          className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg"
                        >
                          <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                            <span className="text-neutral-400 mr-1">{question.id}.</span>
                            {question.question}
                          </p>
                          <div className="flex gap-1.5">
                            {question.options.map((option, idx) => {
                              const isSelected = answers[question.id] === option.points;
                              return (
                                <button
                                  key={idx}
                                  onClick={() => handleAnswer(question.id, option.points)}
                                  className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    isSelected
                                      ? option.points === 2
                                        ? "bg-green-500 text-white"
                                        : option.points === 1
                                        ? "bg-amber-500 text-white"
                                        : "bg-red-500 text-white"
                                      : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:border-orange-300 dark:hover:border-orange-500"
                                  }`}
                                  title={option.description}
                                >
                                  {isSelected && <RiCheckLine className="w-3 h-3 inline mr-1" />}
                                  {option.label}
                                  <span className="ml-1 opacity-60">({option.points}pt)</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="p-2 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
        <div className="flex gap-3 text-[10px]">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-green-500" />
            <span className="text-neutral-500">2pt</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-amber-500" />
            <span className="text-neutral-500">1pt</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-red-500" />
            <span className="text-neutral-500">0pt</span>
          </div>
        </div>
      </div>
        </motion.div>
      )}
    </AnimatePresence>

      {/* Toast de Revisão Agendada */}
      <AnimatePresence>
        {showReviewToast && nextReviewDays && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 z-50 p-4 bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 max-w-sm"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <RiTimeLine className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                  📅 Revisão agendada!
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Uma tarefa de revisão foi criada para daqui a <strong>{nextReviewDays} dias</strong>.
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  {nextReviewDays === 7 && "Lead quente - acompanhar de perto!"}
                  {nextReviewDays === 14 && "Lead morno - nutrir e conduzir."}
                  {nextReviewDays === 30 && "Lead frio - verificar mudanças."}
                </p>
              </div>
              <button
                onClick={() => setShowReviewToast(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Componente de Condomínios de Interesse (exportado para uso na aba Informações)
export function CondominiosInteresse({ leadId, initialCondominios }: { leadId: string; initialCondominios: string[] }) {
  const [condominios, setCondominios] = useState<string[]>(initialCondominios || []);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Buscar condomínios/empreendimentos
  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/admin/condominiums?search=${encodeURIComponent(term)}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.condominiums || []);
      }
    } catch (error) {
      console.error("Erro ao buscar condomínios:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Adicionar condomínio
  const addCondominio = async (name: string) => {
    if (condominios.includes(name)) return;
    
    const newCondominios = [...condominios, name];
    setCondominios(newCondominios);
    setSearchTerm("");
    setSearchResults([]);
    setIsAdding(false);

    // Salvar no backend
    setIsSaving(true);
    try {
      await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ condominiumsOfInterest: newCondominios }),
      });
    } catch (error) {
      console.error("Erro ao salvar condomínios:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Remover condomínio
  const removeCondominio = async (name: string) => {
    const newCondominios = condominios.filter(c => c !== name);
    setCondominios(newCondominios);

    // Salvar no backend
    setIsSaving(true);
    try {
      await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ condominiumsOfInterest: newCondominios }),
      });
    } catch (error) {
      console.error("Erro ao salvar condomínios:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-200 dark:border-indigo-500/20">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <RiBuilding2Line className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-medium text-indigo-700 dark:text-indigo-400">
            Condomínios de Interesse
          </span>
          {isSaving && <span className="text-[10px] text-indigo-400">Salvando...</span>}
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-600 font-medium"
        >
          <RiAddLine className="w-3.5 h-3.5" />
          Adicionar
        </button>
      </div>

      {/* Campo de busca */}
      {isAdding && (
        <div className="mb-2 relative">
          <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-neutral-800 rounded-lg border border-indigo-300 dark:border-indigo-600">
            <RiSearchLine className="w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Buscar condomínio ou digitar novo..."
              className="flex-1 text-xs bg-transparent outline-none text-neutral-900 dark:text-white placeholder:text-neutral-400"
              autoFocus
            />
            {searchTerm && (
              <button
                onClick={() => addCondominio(searchTerm)}
                className="text-[10px] px-2 py-0.5 bg-indigo-500 text-white rounded hover:bg-indigo-600"
              >
                + Criar
              </button>
            )}
          </div>

          {/* Resultados da busca */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-lg z-10 max-h-40 overflow-y-auto">
              {searchResults.map((cond: any) => (
                <button
                  key={cond.id || cond.name}
                  onClick={() => addCondominio(cond.name)}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-indigo-50 dark:hover:bg-indigo-500/10 flex items-center gap-2"
                >
                  <RiBuilding2Line className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-neutral-900 dark:text-white">{cond.name}</span>
                  {cond.neighborhood && (
                    <span className="text-neutral-400 text-[10px]">{cond.neighborhood}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lista de condomínios selecionados */}
      <div className="flex flex-wrap gap-1.5">
        {condominios.length === 0 ? (
          <span className="text-[10px] text-indigo-400">Nenhum condomínio selecionado</span>
        ) : (
          condominios.map((cond) => (
            <span
              key={cond}
              className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-lg text-[10px] font-medium"
            >
              <RiBuilding2Line className="w-3 h-3" />
              {cond}
              <button
                onClick={() => removeCondominio(cond)}
                className="ml-0.5 hover:text-red-500"
              >
                <RiCloseLine className="w-3 h-3" />
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  );
}
