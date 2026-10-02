"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  RiUploadCloud2Line,
  RiFileExcel2Line,
  RiDeleteBinLine,
  RiCheckLine,
  RiCloseLine,
  RiArrowRightLine,
  RiArrowLeftLine,
  RiUserSearchLine,
  RiRefreshLine,
  RiErrorWarningLine,
  RiCheckboxCircleLine,
  RiFileListLine,
  RiDownload2Line,
  RiMapPinLine,
} from "react-icons/ri";

interface SheetInfo {
  name: string;
  headers: string[];
  rowCount: number;
  mapping: Record<string, string>;
  preview: Record<string, unknown>[];
  destination: string;
  enabled: boolean;
}

interface ImportRecord {
  id: string;
  fileName: string;
  totalRows: number;
  importedCount: number;
  skippedCount: number;
  errors: Array<{ row: number; error: string }> | null;
  destination: string;
  sheetName: string | null;
  columnMapping: Record<string, string> | null;
  createdAt: string;
  user: { id: string; name: string; avatar: string | null };
  corretor: { id: string; name: string; avatar: string | null } | null;
}

interface Corretor {
  id: string;
  name: string;
  avatar: string | null;
}

const FIELD_LABELS: Record<string, string> = {
  name: "Nome",
  email: "E-mail",
  phone: "Telefone",
  cpf: "CPF",
  birthDate: "Data de Nascimento",
  propertyCode: "Imóvel de Entrada",
  type: "Tipo",
  subType: "Sub Tipo",
  ticket: "Finalidade",
  source: "Mídia/Origem",
  hasPermuta: "Permuta",
  permutaPropertyCode: "Código Permuta",
  permutaType: "Tipo Permuta",
  permutaLocation: "Local Permuta",
  permutaValue: "Valor Permuta",
  permutaDescription: "Descrição Permuta",
  ticketLocacao: "Ticket Locação",
  ticketVenda: "Ticket Venda",
  rentalGuarantees: "Garantias",
  searchFurnished: "Mobiliário",
  searchBedrooms: "Dormitórios",
  condominiumsOfInterest: "Condomínios",
  observations: "Observações",
  groupColumn: "Coluna/Agrupar",
  temperature: "Temperatura",
  corretorName: "Corretor",
  createdAt: "Criado em",
  updatedAt: "Atualizado em",
  action: "Ação",
  "": "(Ignorar)",
};

const DESTINATION_LABELS: Record<string, { label: string; color: string }> = {
  LEADS: { label: "Kanban (Leads)", color: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" },
  ACERVO: { label: "Acervo", color: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" },
  LIMBO: { label: "Limbo", color: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400" },
};

export default function ImportacoesPage() {
  // === State ===
  const [step, setStep] = useState<"upload" | "config" | "importing" | "result">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [sheets, setSheets] = useState<SheetInfo[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>("");
  const [importing, setImporting] = useState(false);
  const [corretorId, setCorretorId] = useState<string>("");
  const [batchResults, setBatchResults] = useState<Array<{
    sheetName: string;
    destination: string;
    importedCount: number;
    skippedCount: number;
    totalRows: number;
    errors: Array<{ row: number; error: string }>;
  }> | null>(null);
  const [corretorSearch, setCorretorSearch] = useState("");
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [showCorretorList, setShowCorretorList] = useState(false);
  const [selectedCorretor, setSelectedCorretor] = useState<Corretor | null>(null);
  const [importResult, setImportResult] = useState<{
    importedCount: number;
    skippedCount: number;
    totalRows: number;
    errors: Array<{ row: number; error: string }>;
  } | null>(null);

  // Histórico
  const [imports, setImports] = useState<ImportRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const corretorRef = useRef<HTMLDivElement>(null);

  // === Fetch histórico ===
  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/admin/leads/imports");
      const data = await res.json();
      setImports(data.imports || []);
    } catch {
      console.error("Erro ao buscar histórico");
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // === Buscar corretores ===
  useEffect(() => {
    if (corretorSearch.length < 2) {
      setCorretores([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/corretores?search=${encodeURIComponent(corretorSearch)}`);
        const data = await res.json();
        setCorretores(Array.isArray(data) ? data : data.corretores || []);
      } catch {
        setCorretores([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [corretorSearch]);

  // Fechar dropdown corretor ao clicar fora
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (corretorRef.current && !corretorRef.current.contains(e.target as Node)) {
        setShowCorretorList(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Auto-detectar destino pela nome da aba
  const detectDestination = (sheetName: string): string => {
    const lower = sheetName.toLowerCase();
    if (lower.includes("acervo")) return "ACERVO";
    if (lower.includes("limbo")) return "LIMBO";
    return "LEADS";
  };

  // === Upload e preview ===
  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("action", "preview");

    try {
      const res = await fetch("/api/admin/leads/import", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Erro ao ler arquivo");
      const data = await res.json();
      const enriched: SheetInfo[] = (data.sheets || []).map((s: any) => ({
        ...s,
        destination: detectDestination(s.name),
        enabled: true,
      }));
      setSheets(enriched);
      if (enriched.length > 0) {
        setActiveSheet(enriched[0].name);
      }
      setStep("config");
    } catch (err) {
      alert("Erro ao ler o arquivo. Verifique se é um Excel válido.");
    }
  };

  // Toggle habilitar/desabilitar aba
  const toggleSheetEnabled = (name: string) => {
    setSheets((prev: SheetInfo[]) => prev.map((s: SheetInfo) => s.name === name ? { ...s, enabled: !s.enabled } : s));
  };

  // Mudar destino de uma aba específica
  const setSheetDestination = (name: string, dest: string) => {
    setSheets((prev: SheetInfo[]) => prev.map((s: SheetInfo) => s.name === name ? { ...s, destination: dest } : s));
  };

  // Atualizar mapping de uma aba específica
  const updateSheetMapping = (sheetName: string, header: string, value: string) => {
    setSheets((prev: SheetInfo[]) => prev.map((s: SheetInfo) =>
      s.name === sheetName ? { ...s, mapping: { ...s.mapping, [header]: value } } : s
    ));
  };

  // === Executar importação batch ===
  const handleImport = async () => {
    if (!file) return;
    const sheetsToImport = sheets.filter((s: SheetInfo) => s.enabled);
    if (sheetsToImport.length === 0) return;

    setImporting(true);
    setStep("importing");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("action", "import-batch");
      formData.append("sheetsConfig", JSON.stringify(
        sheetsToImport.map((s: SheetInfo) => ({
          sheetName: s.name,
          destination: s.destination,
          mapping: s.mapping,
        }))
      ));
      if (corretorId) formData.append("corretorId", corretorId);

      const res = await fetch("/api/admin/leads/import", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erro na importação");

      setBatchResults(data.results || []);
      setImportResult({
        importedCount: data.totalImported || 0,
        skippedCount: data.totalSkipped || 0,
        totalRows: data.totalRows || 0,
        errors: (data.results || []).flatMap((r: any) => (r.errors || []).map((e: any) => ({ ...e, sheet: r.sheetName }))),
      });
      setStep("result");
      fetchHistory();
    } catch (err: any) {
      alert(err.message || "Erro ao importar");
      setStep("config");
    } finally {
      setImporting(false);
    }
  };

  // === Deletar importação do histórico ===
  const handleDeleteImport = async (id: string) => {
    if (!confirm("Excluir este registro de importação?")) return;
    try {
      await fetch(`/api/admin/leads/imports?id=${id}`, { method: "DELETE" });
      fetchHistory();
    } catch {
      alert("Erro ao excluir");
    }
  };

  // === Reset ===
  const handleReset = () => {
    setStep("upload");
    setFile(null);
    setSheets([]);
    setActiveSheet("");
    setCorretorId("");
    setCorretorSearch("");
    setSelectedCorretor(null);
    setImportResult(null);
    setBatchResults(null);
  };

  const currentSheet = sheets.find((s: SheetInfo) => s.name === activeSheet);
  const enabledSheets = sheets.filter((s: SheetInfo) => s.enabled);
  const totalEnabledRows = enabledSheets.reduce((sum: number, s: SheetInfo) => sum + s.rowCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
            <RiFileExcel2Line className="w-7 h-7 text-green-600" />
            Importação de Clientes
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Importe leads de planilhas Excel (.xlsx, .xls, .csv)
          </p>
        </div>
        {step !== "upload" && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-sm font-medium"
          >
            <RiRefreshLine className="w-4 h-4" />
            Nova Importação
          </button>
        )}
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
        {[
          { key: "upload", label: "1. Upload", icon: RiUploadCloud2Line },
          { key: "config", label: "2. Configurar", icon: RiMapPinLine },
          { key: "importing", label: "3. Importando", icon: RiRefreshLine },
          { key: "result", label: "4. Resultado", icon: RiCheckboxCircleLine },
        ].map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            {i > 0 && <div className="w-8 h-px bg-neutral-300 dark:bg-neutral-700" />}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                step === s.key
                  ? "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400"
                  : ["upload", "config", "importing", "result"].indexOf(step) > ["upload", "config", "importing", "result"].indexOf(s.key)
                  ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                  : "text-neutral-400"
              }`}
            >
              <s.icon className="w-4 h-4" />
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === "upload" && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-8">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
            }}
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-blue-500", "bg-blue-50", "dark:bg-blue-500/10"); }}
            onDragLeave={(e) => { e.currentTarget.classList.remove("border-blue-500", "bg-blue-50", "dark:bg-blue-500/10"); }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove("border-blue-500", "bg-blue-50", "dark:bg-blue-500/10");
              if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
            }}
            className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl p-12 text-center cursor-pointer hover:border-blue-500 transition-all"
          >
            <RiUploadCloud2Line className="w-16 h-16 mx-auto text-neutral-400 mb-4" />
            <p className="text-lg font-medium text-neutral-700 dark:text-neutral-300">
              Arraste o arquivo aqui ou clique para selecionar
            </p>
            <p className="text-sm text-neutral-500 mt-2">
              Formatos aceitos: .xlsx, .xls, .csv — Múltiplas abas suportadas
            </p>
          </div>
        </div>
      )}

      {/* Step 2: Config */}
      {step === "config" && sheets.length > 0 && (
        <div className="space-y-4">
          {/* Abas com checkbox + destino individual */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <RiFileExcel2Line className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-neutral-900 dark:text-white">{file?.name}</p>
                <p className="text-xs text-neutral-500">{sheets.length} aba(s) — {enabledSheets.length} selecionada(s) ({totalEnabledRows} linhas)</p>
              </div>
            </div>
            <div className="space-y-3">
              {sheets.map((sheet) => (
                <div
                  key={sheet.name}
                  className={`rounded-xl border p-4 transition-all ${
                    sheet.enabled
                      ? "border-blue-300 dark:border-blue-500/40 bg-blue-50/50 dark:bg-blue-500/5"
                      : "border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sheet.enabled}
                          onChange={() => toggleSheetEnabled(sheet.name)}
                          className="w-4 h-4 rounded border-neutral-300 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="font-semibold text-sm text-neutral-900 dark:text-white truncate">{sheet.name}</span>
                      </label>
                      <span className="text-xs text-neutral-500 flex-shrink-0">{sheet.rowCount} linhas</span>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      {Object.entries(DESTINATION_LABELS).map(([key, { label, color }]) => (
                        <button
                          key={key}
                          onClick={() => setSheetDestination(sheet.name, key)}
                          disabled={!sheet.enabled}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                            sheet.destination === key
                              ? `${color} border-current`
                              : "border-transparent bg-neutral-100 dark:bg-neutral-800 text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                          } ${!sheet.enabled ? "cursor-not-allowed" : ""}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setActiveSheet(sheet.name === activeSheet ? "" : sheet.name)}
                      className="text-xs text-blue-500 hover:text-blue-600 font-medium flex-shrink-0"
                    >
                      {sheet.name === activeSheet ? "Fechar" : "Detalhes"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Corretor */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Atribuir ao Corretor (todas as abas)</h3>
            <div ref={corretorRef} className="relative">
              <div className="flex items-center gap-2">
                <RiUserSearchLine className="w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  value={selectedCorretor ? selectedCorretor.name : corretorSearch}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setCorretorSearch(e.target.value);
                    setSelectedCorretor(null);
                    setCorretorId("");
                    setShowCorretorList(true);
                  }}
                  onFocus={() => setShowCorretorList(true)}
                  placeholder="Buscar corretor por nome..."
                  className="flex-1 px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 border-0 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {selectedCorretor && (
                  <button
                    onClick={() => { setSelectedCorretor(null); setCorretorId(""); setCorretorSearch(""); }}
                    className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  >
                    <RiCloseLine className="w-4 h-4" />
                  </button>
                )}
              </div>
              {showCorretorList && corretores.length > 0 && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                  {corretores.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCorretor(c);
                        setCorretorId(c.id);
                        setCorretorSearch("");
                        setShowCorretorList(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
                    >
                      <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-600">
                        {c.name.charAt(0)}
                      </div>
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {!selectedCorretor && (
              <p className="text-xs text-neutral-400 mt-2">Opcional — se não selecionar, os leads ficam sem corretor atribuído</p>
            )}
          </div>

          {/* Mapeamento de Colunas (aba ativa) */}
          {currentSheet && (
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">Mapeamento — {currentSheet.name}</h3>
              <p className="text-xs text-neutral-500 mb-4">Verifique se o mapeamento automático está correto. Ajuste se necessário.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {currentSheet.headers.map((header: string) => (
                  <div key={header} className="flex items-center gap-2">
                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 w-32 truncate flex-shrink-0" title={header}>
                      {header}
                    </span>
                    <RiArrowRightLine className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                    <select
                      value={currentSheet.mapping[header] || ""}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateSheetMapping(currentSheet.name, header, e.target.value)}
                      className={`flex-1 px-2 py-1.5 rounded-lg text-xs border ${
                        currentSheet.mapping[header]
                          ? "bg-green-50 dark:bg-green-500/10 border-green-300 dark:border-green-500/30 text-green-800 dark:text-green-400"
                          : "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-500"
                      }`}
                    >
                      <option value="">(Ignorar)</option>
                      {Object.entries(FIELD_LABELS).filter(([k]) => k !== "").map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Preview */}
              <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <h4 className="text-xs font-medium text-neutral-500 mb-2">Preview (primeiras 3 linhas)</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-neutral-200 dark:border-neutral-700">
                        {currentSheet.headers.slice(0, 10).map((h: string) => (
                          <th key={h} className="text-left py-2 px-3 font-medium text-neutral-500 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentSheet.preview.map((row: Record<string, unknown>, i: number) => (
                        <tr key={i} className="border-b border-neutral-100 dark:border-neutral-800">
                          {currentSheet.headers.slice(0, 10).map((h: string) => (
                            <td key={h} className="py-2 px-3 text-neutral-700 dark:text-neutral-300 max-w-[200px] truncate">
                              {row[h] != null ? String(row[h]).substring(0, 60) : <span className="text-neutral-400">—</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Botão Importar */}
          <div className="flex justify-end gap-3">
            <button
              onClick={handleReset}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleImport}
              disabled={enabledSheets.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RiDownload2Line className="w-4 h-4" />
              Importar {enabledSheets.length} aba(s) — {totalEnabledRows} leads
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Importing */}
      {step === "importing" && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-6" />
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Importando leads...</h3>
          <p className="text-neutral-500">
            Processando {enabledSheets.length} aba(s) — isso pode levar alguns minutos
          </p>
        </div>
      )}

      {/* Step 4: Result */}
      {step === "result" && importResult && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                <RiCheckboxCircleLine className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Importação Concluída!</h3>
                <p className="text-sm text-neutral-500">
                  {batchResults ? `${batchResults.length} aba(s) importada(s)` : "Importação finalizada"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 dark:bg-green-500/10 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-green-600">{importResult.importedCount}</p>
                <p className="text-xs text-green-600/80 font-medium mt-1">Importados</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-500/10 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-orange-600">{importResult.skippedCount}</p>
                <p className="text-xs text-orange-600/80 font-medium mt-1">Pulados</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">{importResult.totalRows}</p>
                <p className="text-xs text-blue-600/80 font-medium mt-1">Total no Arquivo</p>
              </div>
            </div>

            {/* Detalhes por aba */}
            {batchResults && batchResults.length > 0 && (
              <div className="space-y-2 mb-6">
                <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Detalhes por aba:</h4>
                {batchResults.map((r: { sheetName: string; destination: string; importedCount: number; skippedCount: number; totalRows: number }) => (
                  <div key={r.sheetName} className="flex items-center justify-between px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-900 dark:text-white">{r.sheetName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${DESTINATION_LABELS[r.destination]?.color || "bg-neutral-100 text-neutral-600"}`}>
                        {DESTINATION_LABELS[r.destination]?.label || r.destination}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-green-600 font-semibold">{r.importedCount} importados</span>
                      {r.skippedCount > 0 && <span className="text-orange-500">{r.skippedCount} pulados</span>}
                      <span className="text-neutral-400">/ {r.totalRows} total</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {importResult.errors.length > 0 && (
              <div className="bg-red-50 dark:bg-red-500/10 rounded-xl p-4 max-h-48 overflow-y-auto">
                <p className="text-sm font-semibold text-red-600 mb-2 flex items-center gap-1">
                  <RiErrorWarningLine className="w-4 h-4" />
                  {importResult.errors.length} aviso(s):
                </p>
                <div className="space-y-1">
                  {importResult.errors.map((err: { row: number; error: string; sheet?: string }, i: number) => (
                    <p key={i} className="text-xs text-red-600/80">
                      {err.sheet ? `[${err.sheet}] ` : ""}Linha {err.row}: {err.error}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Histórico de Importações */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
            <RiFileListLine className="w-5 h-5 text-neutral-400" />
            Histórico de Importações
          </h3>
          <button onClick={fetchHistory} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <RiRefreshLine className="w-4 h-4 text-neutral-500" />
          </button>
        </div>

        {loadingHistory ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
          </div>
        ) : imports.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 text-sm">
            Nenhuma importação realizada ainda
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700 text-xs text-neutral-500 uppercase">
                  <th className="text-left py-3 px-4 font-medium">Arquivo</th>
                  <th className="text-left py-3 px-4 font-medium">Aba</th>
                  <th className="text-left py-3 px-4 font-medium">Destino</th>
                  <th className="text-center py-3 px-4 font-medium">Importados</th>
                  <th className="text-center py-3 px-4 font-medium">Pulados</th>
                  <th className="text-left py-3 px-4 font-medium">Corretor</th>
                  <th className="text-left py-3 px-4 font-medium">Data</th>
                  <th className="text-right py-3 px-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {imports.map((imp) => (
                  <tr key={imp.id} className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <RiFileExcel2Line className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="font-medium text-neutral-900 dark:text-white truncate max-w-[200px]">{imp.fileName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">{imp.sheetName || "—"}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${DESTINATION_LABELS[imp.destination]?.color || "bg-neutral-100 text-neutral-600"}`}>
                        {DESTINATION_LABELS[imp.destination]?.label || imp.destination}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-green-600 font-semibold">{imp.importedCount}</span>
                      <span className="text-neutral-400">/{imp.totalRows}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {imp.skippedCount > 0 ? (
                        <span className="text-orange-500 font-medium">{imp.skippedCount}</span>
                      ) : (
                        <span className="text-neutral-400">0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">
                      {imp.corretor?.name || <span className="text-neutral-400 italic">Sem corretor</span>}
                    </td>
                    <td className="py-3 px-4 text-neutral-500 text-xs">
                      {new Date(imp.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteImport(imp.id)}
                        className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 text-red-400 hover:text-red-500 transition-colors"
                        title="Excluir registro"
                      >
                        <RiDeleteBinLine className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
