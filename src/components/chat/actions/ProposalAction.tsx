"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  RiFileTextLine,
  RiArrowLeftSLine,
  RiHome4Line,
  RiMoneyDollarCircleLine,
  RiPercentLine,
  RiCalendarLine,
  RiCheckLine,
  RiLoader4Line,
  RiSparklingLine,
  RiDownload2Line,
  RiMailSendLine,
} from "react-icons/ri";

interface ProposalActionProps {
  chatId: string;
  chatName: string;
  onBack: () => void;
  onSuccess?: () => void;
}

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  type: string;
}

export function ProposalAction({ chatId, chatName, onBack, onSuccess }: ProposalActionProps) {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [generatedText, setGeneratedText] = useState("");
  const [formData, setFormData] = useState({
    propertyId: "",
    proposedValue: "",
    downPayment: "",
    financingValue: "",
    paymentConditions: "",
    validity: "15",
    observations: "",
  });

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch("/api/admin/imoveis?status=DISPONIVEL&limit=30");
        if (res.ok) {
          const data = await res.json();
          setProperties(data.imoveis || []);
        }
      } catch (error) {
        console.error("Erro ao buscar imóveis:", error);
      }
    };
    fetchProperties();
  }, []);

  const selectedProperty = properties.find(p => p.id === formData.propertyId);

  const generateWithAI = async () => {
    if (!selectedProperty) {
      alert("Selecione um imóvel primeiro");
      return;
    }

    setGenerating(true);
    try {
      // Simular geração com IA (integrar com Grok/GPT/DeepSeek)
      const proposalText = `
PROPOSTA COMERCIAL

Prezado(a) ${chatName},

Conforme nossa conversa, segue proposta para o imóvel:

📍 ${selectedProperty.title}
📌 ${selectedProperty.address}

💰 CONDIÇÕES FINANCEIRAS:
• Valor do Imóvel: ${selectedProperty.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
${formData.proposedValue ? `• Valor Proposto: R$ ${parseFloat(formData.proposedValue).toLocaleString("pt-BR")}` : ""}
${formData.downPayment ? `• Entrada: R$ ${parseFloat(formData.downPayment).toLocaleString("pt-BR")}` : ""}
${formData.financingValue ? `• Financiamento: R$ ${parseFloat(formData.financingValue).toLocaleString("pt-BR")}` : ""}
${formData.paymentConditions ? `• Condições: ${formData.paymentConditions}` : ""}

📅 Validade: ${formData.validity} dias

Esta proposta está sujeita à análise e aprovação do proprietário.

Aguardo seu retorno!

Atenciosamente,
Tappy Imob
      `.trim();

      setGeneratedText(proposalText);
    } catch (error) {
      console.error("Erro ao gerar proposta:", error);
      alert("❌ Erro ao gerar proposta com IA");
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.propertyId || !formData.proposedValue) {
      alert("Selecione um imóvel e informe o valor proposto");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: formData.propertyId,
          proposedValue: parseFloat(formData.proposedValue),
          downPayment: formData.downPayment ? parseFloat(formData.downPayment) : null,
          financingValue: formData.financingValue ? parseFloat(formData.financingValue) : null,
          paymentConditions: formData.paymentConditions || null,
          validity: parseInt(formData.validity),
          observations: formData.observations || null,
          generatedText: generatedText || null,
          whatsappChatId: chatId,
          contactName: chatName,
          status: "PENDING",
        }),
      });

      if (response.ok) {
        alert("✅ Proposta criada com sucesso!");
        onSuccess?.();
        onBack();
      } else {
        const error = await response.json();
        alert(`❌ Erro: ${error.message || "Erro ao criar proposta"}`);
      }
    } catch (error) {
      console.error("Erro ao criar proposta:", error);
      alert("❌ Erro ao criar proposta");
    } finally {
      setLoading(false);
    }
  };

  const sendToWhatsApp = () => {
    if (!generatedText) {
      alert("Gere a proposta primeiro");
      return;
    }
    // Copiar para clipboard e notificar
    navigator.clipboard.writeText(generatedText);
    alert("✅ Proposta copiada! Cole no chat para enviar.");
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
        <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
          <RiFileTextLine className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Proposta Comercial</h4>
          <p className="text-[10px] text-neutral-500">{chatName}</p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
        {/* Imóvel */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            <RiHome4Line className="w-3.5 h-3.5 inline mr-1" />
            Imóvel *
          </label>
          <select
            value={formData.propertyId}
            onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
            className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="">Selecione um imóvel</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} - {p.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </option>
            ))}
          </select>
        </div>

        {/* Valores */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              <RiMoneyDollarCircleLine className="w-3.5 h-3.5 inline mr-1" />
              Valor Proposto *
            </label>
            <input
              type="number"
              value={formData.proposedValue}
              onChange={(e) => setFormData({ ...formData, proposedValue: e.target.value })}
              placeholder="0,00"
              className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Entrada
            </label>
            <input
              type="number"
              value={formData.downPayment}
              onChange={(e) => setFormData({ ...formData, downPayment: e.target.value })}
              placeholder="0,00"
              className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Financiamento e Validade */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Financiamento
            </label>
            <input
              type="number"
              value={formData.financingValue}
              onChange={(e) => setFormData({ ...formData, financingValue: e.target.value })}
              placeholder="0,00"
              className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              <RiCalendarLine className="w-3.5 h-3.5 inline mr-1" />
              Validade
            </label>
            <select
              value={formData.validity}
              onChange={(e) => setFormData({ ...formData, validity: e.target.value })}
              className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="7">7 dias</option>
              <option value="15">15 dias</option>
              <option value="30">30 dias</option>
              <option value="60">60 dias</option>
            </select>
          </div>
        </div>

        {/* Condições */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Condições de Pagamento
          </label>
          <input
            type="text"
            value={formData.paymentConditions}
            onChange={(e) => setFormData({ ...formData, paymentConditions: e.target.value })}
            placeholder="Ex: 30% entrada + financiamento CEF"
            className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Gerar com IA */}
      <button
        onClick={generateWithAI}
        disabled={generating || !formData.propertyId}
        className="w-full px-3 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold hover:shadow-lg hover:shadow-purple-400/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {generating ? (
          <RiLoader4Line className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <RiSparklingLine className="w-4 h-4" />
            Gerar Proposta com IA
          </>
        )}
      </button>

      {/* Preview da Proposta */}
      {generatedText && (
        <div className="p-3 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Proposta Gerada</span>
            <div className="flex gap-1">
              <button
                onClick={sendToWhatsApp}
                className="p-1 hover:bg-emerald-200 dark:hover:bg-emerald-900/30 rounded"
                title="Copiar e enviar"
              >
                <RiMailSendLine className="w-3.5 h-3.5 text-emerald-600" />
              </button>
              <button
                onClick={() => {/* TODO: Gerar PDF */}}
                className="p-1 hover:bg-emerald-200 dark:hover:bg-emerald-900/30 rounded"
                title="Baixar PDF"
              >
                <RiDownload2Line className="w-3.5 h-3.5 text-emerald-600" />
              </button>
            </div>
          </div>
          <pre className="text-[10px] text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap max-h-32 overflow-y-auto">
            {generatedText}
          </pre>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
        <button
          onClick={onBack}
          className="flex-1 px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 text-white text-xs font-semibold hover:shadow-lg hover:shadow-emerald-400/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <RiLoader4Line className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <RiCheckLine className="w-4 h-4" />
              Salvar Proposta
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
