"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  RiArrowLeftLine, RiUploadCloud2Line, RiDownloadLine,
  RiDeleteBinLine, RiToggleLine, RiToggleFill, RiLoader4Line,
  RiFileWord2Line, RiCheckLine, RiAlertLine, RiInformationLine,
  RiEyeLine, RiAttachment2,
} from "react-icons/ri";

const TIPOS = [
  { value: "PADRAO", label: "Padrão (à vista)" },
  { value: "FINANCIAMENTO_QUITADO", label: "Financiamento — quitado na mesa" },
  { value: "FINANCIAMENTO_INTERVENIENTE", label: "Financiamento — interveniente quitante" },
  { value: "PARCELAMENTO_AF", label: "Parcelamento c/ alienação fiduciária" },
  { value: "PARCELAMENTO_SIMPLES", label: "Parcelamento simples" },
  { value: "CESSAO_PLANTA", label: "Cessão de direitos (planta)" },
  { value: "CESSAO_PRONTA", label: "Cessão de direitos (pronta)" },
  { value: "PERMUTA_IMOVEL", label: "Permuta — imóvel" },
  { value: "PERMUTA_VEICULO", label: "Permuta — veículo" },
  { value: "PERMUTA_TORNA", label: "Permuta com torna" },
];

const VARIAVEIS = [
  { grupo: "Vendedor", vars: ["vendedor_nome", "vendedor_cpf", "vendedor_nascimento", "vendedor_estado_civil", "vendedor_regime", "vendedor_conjuge", "vendedor_profissao", "vendedor_endereco"] },
  { grupo: "Comprador", vars: ["comprador_nome", "comprador_cpf", "comprador_nascimento", "comprador_estado_civil", "comprador_regime", "comprador_conjuge", "comprador_profissao", "comprador_endereco"] },
  { grupo: "Imóvel", vars: ["imovel_endereco", "imovel_matricula", "imovel_cri", "imovel_inscricao_fiscal", "imovel_condominio"] },
  { grupo: "Financeiro", vars: ["valor_total", "valor_extenso", "comissao_valor", "comissao_percentual", "comissao_responsavel_pagamento", "valor_liquido_vendedor", "data_posse"] },
  { grupo: "Pagamento", vars: ["sinal_valor", "sinal_data", "saldo_valor", "saldo_condicao"] },
  { grupo: "Corretores", vars: ["corretor_captador_pgto_tabela"] },
  { grupo: "Cláusulas condicionais", vars: ["clausula_outorga", "clausula_laudemio", "clausula_mobiliario"] },
  { grupo: "Financiamento (quando aplicável)", vars: ["banco_financiador", "valor_financiado", "banco_credor", "saldo_devedor"] },
  { grupo: "Cessão (quando aplicável)", vars: ["incorporadora", "contrato_original", "valor_pago_cedente", "saldo_incorporadora"] },
  { grupo: "Permuta (quando aplicável)", vars: ["permuta_imovel_endereco", "permuta_imovel_matricula", "permuta_valor_atribuido", "veiculo_descricao", "veiculo_placa", "torna_valor"] },
];

interface Template {
  id: string;
  tipoOperacao: string;
  docxUrl: string;
  docxKey: string;
  ativo: boolean;
  uploadedByNome?: string;
  updatedAt: string;
  aiInstrucao?: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [showVars, setShowVars] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Base de conhecimento geral da IA
  const [baseConhecimento, setBaseConhecimento] = useState("");
  const [savingBase, setSavingBase] = useState(false);
  const [baseUpdatedAt, setBaseUpdatedAt] = useState<string | null>(null);

  // Documentos de referência anexados à base de conhecimento
  const [referencias, setReferencias] = useState<Array<{ id: string; fileName: string; size?: number | null; url: string; uploadedByNome?: string | null; createdAt: string }>>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const refDocInput = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchTemplates = async () => {
    const res = await fetch("/api/admin/negocio/templates");
    const data = await res.json();
    setTemplates(data.templates || []);
    setLoading(false);
  };

  const fetchBaseConhecimento = async () => {
    const res = await fetch("/api/admin/negocio/ia-config");
    if (res.ok) {
      const data = await res.json();
      setBaseConhecimento(data.baseConhecimento || "");
      setBaseUpdatedAt(data.updatedAt || null);
    }
  };

  const salvarBaseConhecimento = async () => {
    setSavingBase(true);
    try {
      const res = await fetch("/api/admin/negocio/ia-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseConhecimento }),
      });
      if (res.ok) {
        const data = await res.json();
        setBaseUpdatedAt(data.updatedAt);
        showToast("Base de conhecimento salva — a IA já vai usar nas próximas análises de documentos");
      } else {
        showToast("Erro ao salvar", "error");
      }
    } finally {
      setSavingBase(false);
    }
  };

  const fetchReferencias = async () => {
    const res = await fetch("/api/admin/negocio/ia-config/docs");
    if (res.ok) {
      const data = await res.json();
      setReferencias(data.referencias || []);
    }
  };

  const handleUploadReferencias = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingDoc(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/negocio/ia-config/docs", { method: "POST", body: fd });
        if (res.ok) {
          const data = await res.json();
          if (data.referencia) setReferencias((prev) => [data.referencia, ...prev]);
        } else {
          const d = await res.json().catch(() => ({}));
          showToast(d.error || `Erro ao anexar ${file.name}`, "error");
        }
      }
    } finally {
      setUploadingDoc(false);
      if (refDocInput.current) refDocInput.current.value = "";
    }
  };

  const removerReferencia = async (id: string) => {
    if (!confirm("Remover este documento de referência?")) return;
    const res = await fetch(`/api/admin/negocio/ia-config/docs/${id}`, { method: "DELETE" });
    if (res.ok) setReferencias((prev) => prev.filter((r) => r.id !== id));
  };

  useEffect(() => { fetchTemplates(); fetchBaseConhecimento(); fetchReferencias(); }, []);

  const getTemplate = (tipo: string) => templates.find((t) => t.tipoOperacao === tipo);

  const handleUpload = async (tipo: string, file: File) => {
    if (!file) return;
    if (!file.name.endsWith(".docx")) {
      showToast("Apenas arquivos .docx são aceitos", "error");
      return;
    }
    setUploading(tipo);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("tipoOperacao", tipo);
      const res = await fetch("/api/admin/negocio/templates", { method: "POST", body: fd });
      if (!res.ok) {
        const d = await res.json();
        showToast(d.error || "Erro ao enviar", "error");
        return;
      }
      showToast("Template enviado com sucesso!");
      await fetchTemplates();
    } finally {
      setUploading(null);
      if (inputRefs.current[tipo]) inputRefs.current[tipo]!.value = "";
    }
  };

  const toggleAtivo = async (t: Template) => {
    await fetch(`/api/admin/negocio/templates/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo: !t.ativo }),
    });
    await fetchTemplates();
  };

  const salvarInstrucao = async (t: Template, instrucao: string) => {
    await fetch(`/api/admin/negocio/templates/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aiInstrucao: instrucao }),
    });
  };

  const handleDelete = async (t: Template) => {
    if (!confirm(`Remover template de "${TIPOS.find((x) => x.value === t.tipoOperacao)?.label}"?`)) return;
    await fetch(`/api/admin/negocio/templates/${t.id}`, { method: "DELETE" });
    showToast("Template removido");
    await fetchTemplates();
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/negocio" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <RiArrowLeftLine className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Templates de minuta</h1>
            <p className="text-sm text-gray-500 mt-0.5">Um template .docx por tipo de operação</p>
          </div>
        </div>
        <button
          onClick={() => setShowVars(!showVars)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50">
          <RiInformationLine className="w-4 h-4" />
          Variáveis disponíveis
        </button>
      </div>

      {/* Base de conhecimento geral da IA */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🧠</span>
          <h2 className="text-sm font-semibold text-purple-900">Base de conhecimento da IA (geral)</h2>
        </div>
        <p className="text-xs text-purple-700 mb-3">
          Instruções, referências e diretrizes que a IA usa em <strong>todos os negócios</strong> ao analisar e extrair os dados dos documentos.
          Para macetes específicos de um tipo de operação, use o campo de cada template abaixo (a IA aplica nos negócios daquele tipo).
          Para um negócio específico, use a caixa de anotações dentro do negócio.
        </p>
        <textarea
          value={baseConhecimento}
          onChange={(e) => setBaseConhecimento(e.target.value)}
          rows={6}
          placeholder={"Ex.: Em Sua Cidade, sempre verificar laudêmio SPU.\nPadrão da imobiliária: comissão de 6% salvo indicação em contrário.\nCláusulas obrigatórias: foro da comarca de Barueri/SP.\nReferências de redação, glossário de termos, modelos de cláusulas..."}
          className="w-full px-3 py-2.5 text-sm border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none bg-white/80 text-gray-700 placeholder:text-gray-400"
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-[10px] text-purple-500">
            {baseUpdatedAt ? `Atualizado em ${new Date(baseUpdatedAt).toLocaleString("pt-BR")}` : "Ainda não configurado"}
          </p>
          <button
            onClick={salvarBaseConhecimento}
            disabled={savingBase}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 disabled:opacity-40">
            {savingBase ? <RiLoader4Line className="w-3.5 h-3.5 animate-spin" /> : <span>💾</span>}
            Salvar base de conhecimento
          </button>
        </div>

        {/* Documentos de referência (contratos-modelo, exemplos de formatos) */}
        <div className="mt-4 pt-4 border-t border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <RiAttachment2 className="w-4 h-4 text-purple-700" />
              <h3 className="text-xs font-semibold text-purple-900">Documentos de referência</h3>
            </div>
            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-purple-300 text-purple-700 text-xs font-medium rounded-lg cursor-pointer hover:bg-purple-50">
              {uploadingDoc ? <RiLoader4Line className="w-3.5 h-3.5 animate-spin" /> : <RiUploadCloud2Line className="w-3.5 h-3.5" />}
              Anexar documentos
              <input
                ref={refDocInput}
                type="file"
                multiple
                accept=".pdf,.docx,.doc,image/*"
                className="hidden"
                disabled={uploadingDoc}
                onChange={(e) => handleUploadReferencias(e.target.files)}
              />
            </label>
          </div>
          <p className="text-[11px] text-purple-600 mb-3">
            Anexe contratos-modelo, exemplos de formatos ou manuais. A partir deles, escreva os macetes na base acima. (PDF, DOCX ou imagem · até 25MB cada)
          </p>

          {referencias.length === 0 ? (
            <p className="text-[11px] text-purple-400 italic">Nenhum documento anexado ainda.</p>
          ) : (
            <div className="space-y-1.5">
              {referencias.map((doc) => (
                <div key={doc.id} className="flex items-center gap-2 bg-white/80 border border-purple-100 rounded-lg px-3 py-2">
                  <RiFileWord2Line className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-gray-700 hover:text-purple-700 truncate block">
                      {doc.fileName}
                    </a>
                    <p className="text-[10px] text-gray-400">
                      {doc.size ? `${(doc.size / 1024).toFixed(0)} KB` : ""}
                      {doc.uploadedByNome ? ` · ${doc.uploadedByNome}` : ""}
                    </p>
                  </div>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50" title="Abrir">
                    <RiDownloadLine className="w-3.5 h-3.5" />
                  </a>
                  <button onClick={() => removerReferencia(doc.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50" title="Remover">
                    <RiDeleteBinLine className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Variables panel */}
      {showVars && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <RiInformationLine className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-blue-900">Como usar</h2>
          </div>
          <p className="text-xs text-blue-700 mb-4">
            No arquivo .docx, use <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono">{"{{nome_da_variavel}}"}</code> onde deseja substituição.
            Variáveis vazias são substituídas por string vazia. Campos não preenchidos ficam em <strong>[PENDENTE — ...]</strong>.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {VARIAVEIS.map((g) => (
              <div key={g.grupo}>
                <p className="text-xs font-semibold text-blue-800 mb-1.5">{g.grupo}</p>
                <div className="space-y-0.5">
                  {g.vars.map((v) => (
                    <code key={v} className="block text-xs font-mono text-blue-700 bg-white/70 px-2 py-0.5 rounded">
                      {`{{${v}}}`}
                    </code>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How-to tip */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <RiAlertLine className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-amber-800">
          <strong>Dica:</strong> crie o template no Word usando <code className="bg-amber-100 px-1 rounded font-mono">{"{{variavel}}"}</code> como marcadores.
          Salve como <strong>.docx</strong> (não .doc nem .odt). O sistema substituirá automaticamente todas as variáveis na geração da minuta.
        </div>
      </div>

      {/* Templates grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <RiLoader4Line className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {TIPOS.map((tipo) => {
            const tmpl = getTemplate(tipo.value);
            const isUploading = uploading === tipo.value;
            return (
              <div key={tipo.value}
                className={`bg-white border rounded-xl p-4 transition-all
                  ${tmpl && tmpl.ativo ? "border-green-200" : tmpl ? "border-gray-200 opacity-70" : "border-dashed border-gray-300"}`}>
              <div className="flex items-center gap-4">

                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                  ${tmpl ? "bg-blue-50" : "bg-gray-50"}`}>
                  <RiFileWord2Line className={`w-5 h-5 ${tmpl ? "text-blue-600" : "text-gray-400"}`} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{tipo.label}</p>
                  {tmpl ? (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Atualizado em {new Date(tmpl.updatedAt).toLocaleDateString("pt-BR")}
                      {tmpl.uploadedByNome ? ` por ${tmpl.uploadedByNome}` : ""}
                      {!tmpl.ativo && <span className="ml-2 text-orange-500 font-medium">— desativado</span>}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-0.5">Nenhum template cadastrado</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {tmpl && (
                    <>
                      <a href={tmpl.docxUrl} target="_blank" rel="noopener noreferrer"
                        className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Baixar template atual">
                        <RiDownloadLine className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => toggleAtivo(tmpl)}
                        className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                        title={tmpl.ativo ? "Desativar" : "Ativar"}>
                        {tmpl.ativo
                          ? <RiToggleFill className="w-5 h-5 text-green-500" />
                          : <RiToggleLine className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => handleDelete(tmpl)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Remover template">
                        <RiDeleteBinLine className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {/* Upload button */}
                  <label className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg cursor-pointer transition-colors
                    ${tmpl ? "text-gray-600 border border-gray-200 hover:bg-gray-50" : "text-white bg-blue-600 hover:bg-blue-700"}`}>
                    {isUploading ? (
                      <RiLoader4Line className="w-3.5 h-3.5 animate-spin" />
                    ) : tmpl ? (
                      <RiUploadCloud2Line className="w-3.5 h-3.5" />
                    ) : (
                      <RiUploadCloud2Line className="w-3.5 h-3.5" />
                    )}
                    {tmpl ? "Substituir" : "Enviar .docx"}
                    <input
                      type="file"
                      accept=".docx"
                      className="hidden"
                      disabled={isUploading}
                      ref={(el) => { inputRefs.current[tipo.value] = el; }}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUpload(tipo.value, f);
                      }}
                    />
                  </label>
                </div>
              </div>{/* end flex */}

              {/* Campo de instrução para IA */}
              {tmpl && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    💡 Macetes para a IA neste tipo de operação
                  </label>
                  <textarea
                    defaultValue={tmpl.aiInstrucao || ""}
                    rows={2}
                    placeholder="Ex.: Neste formato, conferir saldo devedor e banco credor na matrícula. Verificar laudêmio SPU em Sua Cidade..."
                    onBlur={(e) => salvarInstrucao(tmpl, e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-700 placeholder:text-gray-400"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Salvo ao sair do campo • a IA usa ao analisar os documentos de negócios deste tipo</p>
                </div>
              )}
              </div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {!loading && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <RiCheckLine className="w-4 h-4 text-green-500" />
            <span className="text-gray-600">{templates.filter((t) => t.ativo).length} ativos</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">{TIPOS.length - templates.length} sem template</span>
          </div>
          {templates.filter((t) => !t.ativo).length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-orange-500">{templates.filter((t) => !t.ativo).length} desativados</span>
            </div>
          )}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl text-sm font-medium shadow-lg transition-all z-50
          ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
