"use client";

import { memo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  RiSparklingFill,
  RiLightbulbLine,
  RiLineChartLine,
  RiAlertLine,
  RiCheckLine,
  RiArrowRightLine,
  RiRefreshLine,
} from "react-icons/ri";
import { cn } from "@/lib/utils";

interface Insight {
  id: string;
  type: "tip" | "alert" | "success" | "trend";
  title: string;
  description: string;
  action?: string;
  actionHref?: string;
  priority: "high" | "medium" | "low";
}

interface AIInsightsProps {
  data: {
    kpis: {
      imoveis: { ativos: number; semFoto: number; exclusivos: number };
      leads: { doMes: number; taxaConversao: number };
      visitas: { pendentes: number; hoje: number };
    };
  };
  className?: string;
}

const insightIcons = {
  tip: RiLightbulbLine,
  alert: RiAlertLine,
  success: RiCheckLine,
  trend: RiLineChartLine,
};

const insightColors = {
  tip: "from-blue-500 to-indigo-500",
  alert: "from-emerald-500 to-orange-500",
  success: "from-green-500 to-emerald-500",
  trend: "from-purple-500 to-pink-500",
};

const AIInsights = memo(function AIInsights({ data, className }: AIInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isGenerating, setIsGenerating] = useState(true);
  const [currentInsight, setCurrentInsight] = useState(0);

  useEffect(() => {
    generateInsights();
  }, [data]);

  const generateInsights = () => {
    setIsGenerating(true);
    
    // Simular delay de IA
    setTimeout(() => {
      const generatedInsights: Insight[] = [];

      // Insight sobre imóveis sem foto
      if (data.kpis.imoveis.semFoto > 0) {
        generatedInsights.push({
          id: "sem-foto",
          type: "alert",
          title: `${data.kpis.imoveis.semFoto} imóveis sem foto`,
          description: "Imóveis com fotos recebem 3x mais visualizações. Agende sessões de fotos para aumentar o engajamento.",
          action: "Agendar fotos",
          actionHref: "/admin/fotografo/sessoes",
          priority: "high",
        });
      }

      // Insight sobre taxa de conversão
      if (data.kpis.leads.taxaConversao < 20) {
        generatedInsights.push({
          id: "conversao",
          type: "tip",
          title: "Taxa de conversão abaixo do ideal",
          description: `Sua taxa atual é ${data.kpis.leads.taxaConversao}%. O ideal é acima de 20%. Considere agilizar o follow-up com leads quentes.`,
          action: "Ver leads quentes",
          actionHref: "/admin/clientes/leads?temperature=QUENTE",
          priority: "high",
        });
      } else {
        generatedInsights.push({
          id: "conversao-ok",
          type: "success",
          title: "Excelente taxa de conversão!",
          description: `${data.kpis.leads.taxaConversao}% dos leads estão sendo convertidos. Continue com o bom trabalho!`,
          priority: "low",
        });
      }

      // Insight sobre visitas pendentes
      if (data.kpis.visitas.pendentes > 5) {
        generatedInsights.push({
          id: "visitas-pendentes",
          type: "alert",
          title: `${data.kpis.visitas.pendentes} visitas aguardando confirmação`,
          description: "Confirme as visitas pendentes para melhorar a experiência do cliente e reduzir no-shows.",
          action: "Confirmar visitas",
          actionHref: "/admin/agenda",
          priority: "medium",
        });
      }

      // Insight sobre leads do mês
      if (data.kpis.leads.doMes > 0) {
        generatedInsights.push({
          id: "leads-mes",
          type: "trend",
          title: `${data.kpis.leads.doMes} novos leads este mês`,
          description: "Acompanhe o funil de vendas para maximizar as conversões. Leads quentes devem ser contactados em até 5 minutos.",
          action: "Ver funil",
          actionHref: "/admin/clientes/leads",
          priority: "medium",
        });
      }

      // Insight sobre exclusivos
      if (data.kpis.imoveis.exclusivos > 0) {
        generatedInsights.push({
          id: "exclusivos",
          type: "success",
          title: `${data.kpis.imoveis.exclusivos} imóveis exclusivos`,
          description: "Imóveis exclusivos têm maior margem de comissão. Destaque-os na vitrine principal do site.",
          action: "Gerenciar destaques",
          actionHref: "/admin/imoveis?isExclusive=true",
          priority: "low",
        });
      }

      // Insight sobre visitas de hoje
      if (data.kpis.visitas.hoje > 0) {
        generatedInsights.push({
          id: "visitas-hoje",
          type: "tip",
          title: `${data.kpis.visitas.hoje} visitas agendadas para hoje`,
          description: "Prepare-se! Verifique os detalhes de cada visita e confirme com os clientes.",
          action: "Ver agenda",
          actionHref: "/admin/agenda",
          priority: "high",
        });
      }

      setInsights(generatedInsights.sort((a, b) => {
        const priority = { high: 0, medium: 1, low: 2 };
        return priority[a.priority] - priority[b.priority];
      }));
      setIsGenerating(false);
    }, 800);
  };

  const nextInsight = () => {
    setCurrentInsight((prev) => (prev + 1) % insights.length);
  };

  const prevInsight = () => {
    setCurrentInsight((prev) => (prev - 1 + insights.length) % insights.length);
  };

  if (isGenerating) {
    return (
      <div className={cn("p-6 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-800 text-white", className)}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <RiSparklingFill className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold">Imob IA</h3>
            <p className="text-sm text-neutral-400">Analisando seus dados...</p>
          </div>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-2 flex-1 bg-neutral-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-violet-500 to-purple-500"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.8, delay: i * 0.2, ease: "easeInOut" }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className={cn("p-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white", className)}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <RiCheckLine className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">Tudo certo!</h3>
            <p className="text-sm text-white/80">Nenhuma ação urgente identificada.</p>
          </div>
        </div>
      </div>
    );
  }

  const insight = insights[currentInsight];
  const Icon = insightIcons[insight.type];

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white",
      className
    )}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')]" />
      </div>

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <RiSparklingFill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                Imob IA
                <span className="px-2 py-0.5 text-xs bg-violet-500/20 text-violet-300 rounded-full">Beta</span>
              </h3>
              <p className="text-xs text-neutral-400">{insights.length} insights gerados</p>
            </div>
          </div>
          <button
            onClick={generateInsights}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Atualizar insights"
          >
            <RiRefreshLine className="w-4 h-4" />
          </button>
        </div>

        {/* Insight Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0",
                insightColors[insight.type]
              )}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">{insight.title}</h4>
                <p className="text-sm text-neutral-300 leading-relaxed">{insight.description}</p>
              </div>
            </div>

            {insight.action && insight.actionHref && (
              <a
                href={insight.actionHref}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors"
              >
                {insight.action}
                <RiArrowRightLine className="w-4 h-4" />
              </a>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Dots */}
        {insights.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-white/10">
            {insights.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentInsight(idx)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  idx === currentInsight 
                    ? "w-6 bg-violet-500" 
                    : "bg-white/30 hover:bg-white/50"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default AIInsights;
