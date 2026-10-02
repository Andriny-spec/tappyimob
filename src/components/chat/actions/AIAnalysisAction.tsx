"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  RiRobot2Line,
  RiArrowLeftSLine,
  RiSparklingLine,
  RiLoader4Line,
  RiFileCopyLine,
  RiCheckLine,
  RiUserLine,
  RiHome4Line,
  RiMoneyDollarCircleLine,
  RiFireLine,
  RiLightbulbLine,
} from "react-icons/ri";

interface AIAnalysisActionProps {
  chatId: string;
  chatName: string;
  messages: Array<{ content: string; isMe: boolean }>;
  onBack: () => void;
  onInsertMessage?: (message: string) => void;
}

const analysisTypes = [
  { value: "perfil", label: "Perfil do Cliente", icon: RiUserLine, color: "from-blue-500 to-cyan-500" },
  { value: "interesse", label: "Interesse em Imóveis", icon: RiHome4Line, color: "from-green-500 to-emerald-500" },
  { value: "orcamento", label: "Análise de Orçamento", icon: RiMoneyDollarCircleLine, color: "from-emerald-500 to-orange-500" },
  { value: "temperatura", label: "Temperatura do Lead", icon: RiFireLine, color: "from-red-500 to-pink-500" },
  { value: "sugestao", label: "Sugestão de Resposta", icon: RiLightbulbLine, color: "from-purple-500 to-violet-500" },
];

const aiModels = [
  { value: "grok", label: "Grok (xAI)", description: "Rápido e criativo" },
  { value: "gpt4", label: "GPT-4 (OpenAI)", description: "Mais preciso" },
  { value: "deepseek", label: "DeepSeek", description: "Custo-benefício" },
];

export function AIAnalysisAction({ chatId, chatName, messages, onBack, onInsertMessage }: AIAnalysisActionProps) {
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState("perfil");
  const [selectedModel, setSelectedModel] = useState("deepseek");
  const [analysis, setAnalysis] = useState("");
  const [copied, setCopied] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    setAnalysis("");

    try {
      // Preparar contexto das mensagens
      const conversationContext = messages
        .slice(-20) // Últimas 20 mensagens
        .map(m => `${m.isMe ? "Corretor" : chatName}: ${m.content}`)
        .join("\n");

      // TODO: Integrar com APIs reais (Grok, GPT-4, DeepSeek)
      // Por enquanto, simulação
      await new Promise(resolve => setTimeout(resolve, 1500));

      let result = "";

      switch (selectedType) {
        case "perfil":
          result = `📊 ANÁLISE DE PERFIL - ${chatName}

🎯 Tipo de Cliente: Potencial Comprador
💼 Perfil Econômico: Classe Média-Alta
🏠 Interesse Principal: Apartamentos de 2-3 quartos
📍 Região Preferida: Zona Sul de São Paulo

📝 Observações:
• Cliente demonstra conhecimento do mercado
• Faz perguntas objetivas sobre financiamento
• Tem urgência moderada na decisão
• Valoriza localização e infraestrutura

💡 Recomendação:
Apresentar imóveis na faixa de R$ 500.000 a R$ 800.000 em bairros como Moema, Vila Mariana ou Saúde.`;
          break;

        case "interesse":
          result = `🏠 ANÁLISE DE INTERESSE - ${chatName}

✅ Características Desejadas:
• 2-3 quartos (mencionado 2x)
• Vaga de garagem (essencial)
• Próximo ao metrô
• Área de lazer completa

❌ Rejeições Identificadas:
• Imóveis muito antigos
• Ruas muito movimentadas
• Sem elevador

📊 Imóveis Recomendados:
1. APT Moema - 3 quartos - R$ 750.000
2. APT Vila Mariana - 2 quartos - R$ 580.000
3. APT Saúde - 3 quartos - R$ 620.000

🎯 Próximo Passo:
Enviar fotos e vídeos dos imóveis recomendados.`;
          break;

        case "orcamento":
          result = `💰 ANÁLISE DE ORÇAMENTO - ${chatName}

📊 Faixa de Preço Identificada:
• Mínimo: R$ 400.000
• Máximo: R$ 800.000
• Ideal: R$ 600.000

💳 Capacidade de Pagamento:
• Entrada estimada: 20-30%
• Renda presumida: R$ 15.000 - R$ 25.000
• Financiamento: Provável aprovação

🏦 Opções de Financiamento:
• CEF: Taxa a partir de 8,99% a.a.
• Itaú: Taxa a partir de 9,49% a.a.
• Bradesco: Taxa a partir de 9,29% a.a.

📝 Simulação (R$ 600.000):
• Entrada: R$ 120.000 (20%)
• Financiamento: R$ 480.000
• Parcela estimada: R$ 4.800/mês (30 anos)`;
          break;

        case "temperatura":
          result = `🔥 ANÁLISE DE TEMPERATURA - ${chatName}

📊 Classificação: 🟡 MORNO (65/100)

📈 Indicadores Positivos:
• Responde rapidamente às mensagens
• Faz perguntas específicas
• Demonstra conhecimento do mercado
• Já visitou imóveis anteriormente

📉 Indicadores de Atenção:
• Ainda comparando opções
• Não definiu prazo para decisão
• Menciona "pensar mais"

⏰ Tempo Estimado para Decisão: 2-4 semanas

💡 Estratégia Recomendada:
1. Agendar visita presencial esta semana
2. Enviar comparativo de imóveis
3. Criar senso de urgência (imóvel disputado)
4. Follow-up em 48h`;
          break;

        case "sugestao":
          result = `💬 SUGESTÃO DE RESPOSTA - ${chatName}

📝 Mensagem Sugerida:

"Olá ${chatName}! 😊

Que bom continuar nossa conversa! Analisei seu perfil e separei 3 imóveis que combinam perfeitamente com o que você busca:

🏠 Opção 1: Apartamento em Moema
• 3 quartos, 120m², 2 vagas
• R$ 750.000 (aceita financiamento)
• A 5 min do metrô

🏠 Opção 2: Apartamento na Vila Mariana  
• 2 quartos, 85m², 1 vaga
• R$ 580.000
• Prédio novo com lazer completo

Posso agendar uma visita para este sábado? Tenho horários às 10h ou 14h. 📅

Aguardo seu retorno!"

---
✨ Dica: Personalize com detalhes específicos da conversa.`;
          break;
      }

      setAnalysis(result);
    } catch (error) {
      console.error("Erro na análise:", error);
      setAnalysis("❌ Erro ao realizar análise. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(analysis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const insertInChat = () => {
    // Extrair apenas a mensagem sugerida se for sugestão de resposta
    if (selectedType === "sugestao" && analysis.includes("📝 Mensagem Sugerida:")) {
      const match = analysis.match(/📝 Mensagem Sugerida:\n\n([\s\S]*?)\n\n---/);
      if (match) {
        onInsertMessage?.(match[1].trim());
        onBack();
        return;
      }
    }
    onInsertMessage?.(analysis);
    onBack();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full flex flex-col gap-3"
    >
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-neutral-200 dark:border-neutral-700">
        <button
          onClick={onBack}
          className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
        >
          <RiArrowLeftSLine className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
        </button>
        <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30">
          <RiRobot2Line className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Análise com IA</h4>
          <p className="text-[10px] text-neutral-500">{chatName}</p>
        </div>
      </div>

      {/* Tipo de Análise */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">Tipo de Análise</label>
        <div className="grid grid-cols-2 gap-2">
          {analysisTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                selectedType === type.value
                  ? `bg-gradient-to-r ${type.color} text-white border-transparent`
                  : "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
              }`}
            >
              <type.icon className="w-4 h-4" />
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Modelo de IA */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">Modelo de IA</label>
        <div className="flex gap-2">
          {aiModels.map((model) => (
            <button
              key={model.value}
              onClick={() => setSelectedModel(model.value)}
              className={`flex-1 px-2 py-1.5 rounded-lg border text-[10px] font-medium transition-all ${
                selectedModel === model.value
                  ? "bg-purple-100 dark:bg-purple-900/30 border-purple-500 text-purple-700 dark:text-purple-400"
                  : "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
              }`}
            >
              {model.label}
            </button>
          ))}
        </div>
      </div>

      {/* Botão Analisar */}
      <button
        onClick={runAnalysis}
        disabled={loading}
        className="w-full px-3 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold hover:shadow-lg hover:shadow-purple-400/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <RiLoader4Line className="w-4 h-4 animate-spin" />
            Analisando...
          </>
        ) : (
          <>
            <RiSparklingLine className="w-4 h-4" />
            Analisar Conversa
          </>
        )}
      </button>

      {/* Resultado */}
      {analysis && (
        <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-purple-700 dark:text-purple-400">Resultado da Análise</span>
            <div className="flex gap-1">
              <button
                onClick={copyToClipboard}
                className="p-1 hover:bg-purple-200 dark:hover:bg-purple-900/30 rounded"
                title="Copiar"
              >
                {copied ? (
                  <RiCheckLine className="w-3.5 h-3.5 text-green-600" />
                ) : (
                  <RiFileCopyLine className="w-3.5 h-3.5 text-purple-600" />
                )}
              </button>
            </div>
          </div>
          <pre className="text-[10px] text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap max-h-48 overflow-y-auto">
            {analysis}
          </pre>
          
          {selectedType === "sugestao" && (
            <button
              onClick={insertInChat}
              className="w-full mt-2 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors"
            >
              Inserir no Chat
            </button>
          )}
        </div>
      )}

      {/* Voltar */}
      <button
        onClick={onBack}
        className="w-full px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
      >
        Voltar
      </button>
    </motion.div>
  );
}
