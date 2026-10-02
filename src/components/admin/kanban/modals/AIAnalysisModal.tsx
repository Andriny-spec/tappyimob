"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCloseLine,
  RiSparklingLine,
  RiLoader4Line,
  RiCheckLine,
  RiAlertLine,
  RiLightbulbLine,
  RiThumbUpLine,
  RiThumbDownLine,
  RiRefreshLine,
  RiBarChartLine,
  RiTimeLine,
  RiMoneyDollarCircleLine,
  RiHome4Line,
  RiUserLine,
} from "react-icons/ri";
import { Lead } from "@/types/lead";

interface AIAnalysisModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
}

interface AIAnalysis {
  score: number;
  probability: number;
  insights: string[];
  recommendations: string[];
  strengths: string[];
  risks: string[];
  nextSteps: string[];
  estimatedCloseDate: string | null;
  sentiment: "positive" | "neutral" | "negative";
}

export function AIAnalysisModal({
  lead,
  isOpen,
  onClose,
}: AIAnalysisModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);

  useEffect(() => {
    if (isOpen && lead) {
      generateAnalysis();
    }
  }, [isOpen, lead]);

  const generateAnalysis = async () => {
    setIsLoading(true);
    
    // Simulating AI analysis - in production, call DeepSeek API
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Mock analysis based on lead data
    const mockAnalysis: AIAnalysis = {
      score: lead?.score || Math.floor(Math.random() * 40) + 60,
      probability: lead?.probability || Math.floor(Math.random() * 30) + 50,
      insights: [
        "Lead demonstra alto interesse em imóveis na região dos Jardins",
        "Histórico de interações indica perfil de comprador decidido",
        "Faixa de orçamento compatível com imóveis disponíveis",
        "Tempo médio de resposta às mensagens: 2 horas",
      ],
      recommendations: [
        "Agendar visita presencial nos próximos 3 dias",
        "Apresentar opções de financiamento disponíveis",
        "Enviar comparativo de imóveis similares",
        "Oferecer simulação de custos de mudança",
      ],
      strengths: [
        "Orçamento pré-aprovado",
        "Decisor único na compra",
        "Prazo definido para mudança",
      ],
      risks: [
        "Avaliando propostas de outras imobiliárias",
        "Pode haver dependência de venda de imóvel atual",
      ],
      nextSteps: [
        "Ligar amanhã às 10h para confirmar interesse",
        "Preparar proposta personalizada",
        "Verificar disponibilidade do imóvel para visita",
      ],
      estimatedCloseDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      sentiment: lead?.probability && lead.probability > 60 ? "positive" : "neutral",
    };
    
    setAnalysis(mockAnalysis);
    setIsLoading(false);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-500 bg-green-500/10";
      case "negative":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-yellow-500 bg-yellow-500/10";
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return RiThumbUpLine;
      case "negative":
        return RiThumbDownLine;
      default:
        return RiBarChartLine;
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Indefinido";
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
    });
  };

  return (
    <AnimatePresence>
      {isOpen && lead && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-[60] pointer-events-none"
          >
            <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-2xl p-6 pointer-events-auto max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <RiSparklingLine className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                      Análise IA
                    </h2>
                    <p className="text-sm text-neutral-500">{lead.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={generateAnalysis}
                    disabled={isLoading}
                    className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 disabled:opacity-50"
                  >
                    <RiRefreshLine className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                  >
                    <RiCloseLine className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4 animate-pulse">
                    <RiSparklingLine className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-neutral-500 animate-pulse">
                    Analisando lead com IA...
                  </p>
                </div>
              ) : analysis ? (
                <div className="space-y-6">
                  {/* Score Cards */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl">
                      <p className="text-sm text-neutral-500 mb-1">Score IA</p>
                      <p className="text-3xl font-bold text-purple-500">{analysis.score}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl">
                      <p className="text-sm text-neutral-500 mb-1">Probabilidade</p>
                      <p className="text-3xl font-bold text-green-500">{analysis.probability}%</p>
                    </div>
                    <div className={`p-4 rounded-xl ${getSentimentColor(analysis.sentiment)}`}>
                      <p className="text-sm opacity-70 mb-1">Sentimento</p>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const Icon = getSentimentIcon(analysis.sentiment);
                          return <Icon className="w-6 h-6" />;
                        })()}
                        <span className="text-lg font-bold capitalize">
                          {analysis.sentiment === "positive" ? "Positivo" : 
                           analysis.sentiment === "negative" ? "Negativo" : "Neutro"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Estimated Close */}
                  <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-500/10 rounded-xl">
                    <RiTimeLine className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-sm text-neutral-500">Previsão de fechamento</p>
                      <p className="font-semibold text-neutral-900 dark:text-white">
                        {formatDate(analysis.estimatedCloseDate)}
                      </p>
                    </div>
                  </div>

                  {/* Insights */}
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white mb-3">
                      <RiLightbulbLine className="w-4 h-4 text-yellow-500" />
                      Insights
                    </h3>
                    <ul className="space-y-2">
                      {analysis.insights.map((insight, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0" />
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Strengths & Risks */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-green-500 mb-3">
                        <RiThumbUpLine className="w-4 h-4" />
                        Pontos Fortes
                      </h3>
                      <ul className="space-y-2">
                        {analysis.strengths.map((item, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400"
                          >
                            <RiCheckLine className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-red-500 mb-3">
                        <RiAlertLine className="w-4 h-4" />
                        Riscos
                      </h3>
                      <ul className="space-y-2">
                        {analysis.risks.map((item, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400"
                          >
                            <RiAlertLine className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-purple-500 mb-3">
                      <RiSparklingLine className="w-4 h-4" />
                      Recomendações da IA
                    </h3>
                    <div className="space-y-2">
                      {analysis.recommendations.map((rec, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-500/10 rounded-lg"
                        >
                          <span className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs font-bold flex items-center justify-center">
                            {i + 1}
                          </span>
                          <span className="text-sm text-neutral-700 dark:text-neutral-300">
                            {rec}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Next Steps */}
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-blue-500 mb-3">
                      <RiTimeLine className="w-4 h-4" />
                      Próximos Passos
                    </h3>
                    <div className="space-y-2">
                      {analysis.nextSteps.map((step, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg"
                        >
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-neutral-300 text-blue-500 focus:ring-blue-500"
                          />
                          <span className="text-sm text-neutral-700 dark:text-neutral-300">
                            {step}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Footer */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  onClick={onClose}
                  className="flex-1 h-12 px-6 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Fechar
                </button>
                <button
                  className="flex-1 flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:opacity-90 transition-opacity"
                >
                  <RiSparklingLine className="w-5 h-5" />
                  Aplicar Sugestões
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
