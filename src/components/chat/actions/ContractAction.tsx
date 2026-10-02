"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  RiContractLine,
  RiArrowLeftSLine,
  RiHome4Line,
  RiUserLine,
  RiCalendarLine,
  RiCheckLine,
  RiLoader4Line,
  RiSparklingLine,
  RiDownload2Line,
  RiFilePdf2Line,
  RiPrinterLine,
} from "react-icons/ri";

interface ContractActionProps {
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

const contractTypes = [
  { value: "COMPRA_VENDA", label: "Compra e Venda" },
  { value: "LOCACAO", label: "Locação" },
  { value: "PROMESSA", label: "Promessa de Compra" },
  { value: "PERMUTA", label: "Permuta" },
];

export function ContractAction({ chatId, chatName, onBack, onSuccess }: ContractActionProps) {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [generatedContract, setGeneratedContract] = useState("");
  const [formData, setFormData] = useState({
    propertyId: "",
    contractType: "COMPRA_VENDA",
    buyerName: chatName,
    buyerCpf: "",
    buyerRg: "",
    buyerAddress: "",
    value: "",
    downPayment: "",
    installments: "1",
    startDate: new Date().toISOString().split("T")[0],
    observations: "",
  });

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch("/api/admin/imoveis?limit=30");
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
    if (!selectedProperty || !formData.buyerName) {
      alert("Selecione um imóvel e preencha o nome do comprador");
      return;
    }

    setGenerating(true);
    try {
      // TODO: Integrar com Grok/GPT/DeepSeek para gerar contrato real
      const contractText = `
═══════════════════════════════════════════════════════════════
                    CONTRATO DE ${formData.contractType === "LOCACAO" ? "LOCAÇÃO" : "COMPRA E VENDA"}
═══════════════════════════════════════════════════════════════

IDENTIFICAÇÃO DAS PARTES

VENDEDOR/LOCADOR:
Tappy Imob Ltda.
CNPJ: XX.XXX.XXX/0001-XX
Endereço: Rua Exemplo, 123 - São Paulo/SP

COMPRADOR/LOCATÁRIO:
Nome: ${formData.buyerName}
${formData.buyerCpf ? `CPF: ${formData.buyerCpf}` : "CPF: ___.___.___-__"}
${formData.buyerRg ? `RG: ${formData.buyerRg}` : "RG: ______________"}
${formData.buyerAddress ? `Endereço: ${formData.buyerAddress}` : "Endereço: ______________________________"}

───────────────────────────────────────────────────────────────
                        DO IMÓVEL
───────────────────────────────────────────────────────────────

Imóvel: ${selectedProperty.title}
Endereço: ${selectedProperty.address}
Matrícula: ____________

───────────────────────────────────────────────────────────────
                    CONDIÇÕES FINANCEIRAS
───────────────────────────────────────────────────────────────

Valor Total: ${formData.value ? `R$ ${parseFloat(formData.value).toLocaleString("pt-BR")}` : selectedProperty.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
${formData.downPayment ? `Entrada: R$ ${parseFloat(formData.downPayment).toLocaleString("pt-BR")}` : ""}
${parseInt(formData.installments) > 1 ? `Parcelas: ${formData.installments}x` : "Pagamento à vista"}
Data de Início: ${new Date(formData.startDate).toLocaleDateString("pt-BR")}

───────────────────────────────────────────────────────────────
                      CLÁUSULAS GERAIS
───────────────────────────────────────────────────────────────

1. O presente contrato tem por objeto a ${formData.contractType === "LOCACAO" ? "locação" : "compra e venda"} do imóvel acima descrito.

2. O COMPRADOR/LOCATÁRIO declara ter visitado o imóvel e estar de acordo com seu estado de conservação.

3. As despesas com escritura, registro e ITBI correrão por conta do COMPRADOR.

4. Este contrato é celebrado em caráter irrevogável e irretratável.

${formData.observations ? `\nOBSERVAÇÕES:\n${formData.observations}` : ""}

───────────────────────────────────────────────────────────────

São Paulo, ${new Date().toLocaleDateString("pt-BR")}


_____________________________          _____________________________
        VENDEDOR/LOCADOR                     COMPRADOR/LOCATÁRIO


_____________________________          _____________________________
        TESTEMUNHA 1                          TESTEMUNHA 2

═══════════════════════════════════════════════════════════════
      `.trim();

      setGeneratedContract(contractText);
    } catch (error) {
      console.error("Erro ao gerar contrato:", error);
      alert("❌ Erro ao gerar contrato com IA");
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.propertyId || !formData.buyerName) {
      alert("Selecione um imóvel e preencha o nome do comprador");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: formData.propertyId,
          contractType: formData.contractType,
          buyerName: formData.buyerName,
          buyerCpf: formData.buyerCpf || null,
          buyerRg: formData.buyerRg || null,
          buyerAddress: formData.buyerAddress || null,
          value: formData.value ? parseFloat(formData.value) : selectedProperty?.price,
          downPayment: formData.downPayment ? parseFloat(formData.downPayment) : null,
          installments: parseInt(formData.installments),
          startDate: formData.startDate,
          observations: formData.observations || null,
          generatedText: generatedContract || null,
          whatsappChatId: chatId,
          status: "DRAFT",
        }),
      });

      if (response.ok) {
        alert("✅ Contrato criado com sucesso!");
        onSuccess?.();
        onBack();
      } else {
        const error = await response.json();
        alert(`❌ Erro: ${error.message || "Erro ao criar contrato"}`);
      }
    } catch (error) {
      console.error("Erro ao criar contrato:", error);
      alert("❌ Erro ao criar contrato");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!generatedContract) {
      alert("Gere o contrato primeiro");
      return;
    }
    // TODO: Implementar geração de PDF real
    const blob = new Blob([generatedContract], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contrato_${chatName.replace(/\s/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
        <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
          <RiContractLine className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Gerar Contrato</h4>
          <p className="text-[10px] text-neutral-500">{chatName}</p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
        {/* Tipo de Contrato */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Tipo de Contrato</label>
          <div className="grid grid-cols-2 gap-2">
            {contractTypes.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setFormData({ ...formData, contractType: t.value })}
                className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                  formData.contractType === t.value
                    ? "bg-amber-100 dark:bg-amber-900/30 border-amber-500 text-amber-700 dark:text-amber-400"
                    : "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Imóvel */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            <RiHome4Line className="w-3.5 h-3.5 inline mr-1" />
            Imóvel *
          </label>
          <select
            value={formData.propertyId}
            onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
            className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            <option value="">Selecione um imóvel</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} - {p.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </option>
            ))}
          </select>
        </div>

        {/* Dados do Comprador */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              <RiUserLine className="w-3.5 h-3.5 inline mr-1" />
              Nome *
            </label>
            <input
              type="text"
              value={formData.buyerName}
              onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
              className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">CPF</label>
            <input
              type="text"
              value={formData.buyerCpf}
              onChange={(e) => setFormData({ ...formData, buyerCpf: e.target.value })}
              placeholder="000.000.000-00"
              className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Valor e Entrada */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Valor</label>
            <input
              type="number"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder={selectedProperty?.price.toString() || "0,00"}
              className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Entrada</label>
            <input
              type="number"
              value={formData.downPayment}
              onChange={(e) => setFormData({ ...formData, downPayment: e.target.value })}
              placeholder="0,00"
              className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
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
            Gerar Contrato com IA
          </>
        )}
      </button>

      {/* Preview do Contrato */}
      {generatedContract && (
        <div className="p-3 bg-gradient-to-br from-emerald-50 to-orange-50 dark:from-emerald-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Contrato Gerado</span>
            <div className="flex gap-1">
              <button
                onClick={downloadPDF}
                className="p-1 hover:bg-amber-200 dark:hover:bg-amber-900/30 rounded"
                title="Baixar"
              >
                <RiDownload2Line className="w-3.5 h-3.5 text-amber-600" />
              </button>
              <button
                onClick={() => window.print()}
                className="p-1 hover:bg-amber-200 dark:hover:bg-amber-900/30 rounded"
                title="Imprimir"
              >
                <RiPrinterLine className="w-3.5 h-3.5 text-amber-600" />
              </button>
            </div>
          </div>
          <pre className="text-[9px] text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap max-h-28 overflow-y-auto font-mono">
            {generatedContract}
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
          className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-orange-600 text-white text-xs font-semibold hover:shadow-lg hover:shadow-amber-400/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <RiLoader4Line className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <RiCheckLine className="w-4 h-4" />
              Salvar Contrato
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
