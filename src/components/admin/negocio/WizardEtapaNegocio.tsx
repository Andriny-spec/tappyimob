"use client";

import { useState, useEffect } from "react";
import { RiAddLine, RiDeleteBinLine, RiAlertLine, RiSearchLine, RiUserLine, RiLoader4Line } from "react-icons/ri";
import { useWizard, Parcela, CorretorEnvolvido, TipoOperacao, TipoNegocio } from "./WizardContext";

const TIPOS_OPERACAO: { value: TipoOperacao; label: string }[] = [
  { value: "PADRAO", label: "Padrão (à vista entre particulares)" },
  { value: "FINANCIAMENTO_QUITADO", label: "Financiamento bancário — imóvel quitado" },
  { value: "FINANCIAMENTO_INTERVENIENTE", label: "Financiamento bancário — com interveniente quitante" },
  { value: "PARCELAMENTO_AF", label: "Parcelamento direto com alienação fiduciária" },
  { value: "PARCELAMENTO_SIMPLES", label: "Parcelamento direto sem garantia real" },
  { value: "CESSAO_PLANTA", label: "Cessão de direitos — planta ou em construção" },
  { value: "CESSAO_PRONTA", label: "Cessão de direitos — unidade pronta não escriturada" },
  { value: "PERMUTA_IMOVEL", label: "Permuta — imóvel por imóvel" },
  { value: "PERMUTA_VEICULO", label: "Permuta — imóvel por veículo" },
  { value: "PERMUTA_TORNA", label: "Permuta com torna" },
];

const MARCOS_PAGAMENTO = [
  { value: "ato", label: "Ato (escritura)" },
  { value: "30_dias", label: "30 dias após o ato" },
  { value: "60_dias", label: "60 dias após o ato" },
  { value: "90_dias", label: "90 dias após o ato" },
  { value: "intermediaria", label: "Na intermediária" },
  { value: "entrada_data", label: "Na data de entrada" },
  { value: "quitacao", label: "Na quitação integral" },
  { value: "custom", label: "Outra condição..." },
];

const BANCOS_BR = [
  "Banco do Brasil", "Caixa Econômica Federal", "Bradesco", "Itaú Unibanco",
  "Santander", "Nubank", "Banco Inter", "C6 Bank", "BTG Pactual",
  "Banco Safra", "Sicoob", "Sicredi", "BRB", "Banrisul", "ABC Brasil",
  "Votorantim", "Banco Pan", "Daycoval", "Outra instituição",
];

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function maskCurrency(v: string): number {
  const digits = v.replace(/\D/g, "");
  if (!digits) return 0;
  return parseInt(digits) / 100;
}

function CurrencyInput({ value, onChange, placeholder, className }: {
  value: number | undefined; onChange: (v: number) => void; placeholder?: string; className?: string;
}) {
  const [raw, setRaw] = useState(value ? formatCurrency(value) : "");
  useEffect(() => { setRaw(value ? formatCurrency(value) : ""); }, [value]);
  return (
    <input
      type="text"
      value={raw}
      onChange={(e) => {
        const v = maskCurrency(e.target.value);
        setRaw(v > 0 ? formatCurrency(v) : e.target.value);
        onChange(v);
      }}
      placeholder={placeholder || "R$ 0,00"}
      className={className || "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"}
    />
  );
}

interface Props { erroFluxo: string | null; }

export function WizardEtapaNegocio({ erroFluxo }: Props) {
  const { state, dispatch } = useWizard();
  const { negocio } = state;
  const [corretorSearch, setCorretorSearch] = useState<Record<string, string>>({});
  const [corretorResults, setCorretorResults] = useState<Record<string, any[]>>({});
  const [corretorLoading, setCorretorLoading] = useState<Record<string, boolean>>({});

  const upd = (key: keyof typeof negocio, value: any) =>
    dispatch({ type: "UPDATE_NEGOCIO", payload: { [key]: value } });

  const comissaoValor = negocio.valorTotal && negocio.comissaoPercentual
    ? (negocio.valorTotal * negocio.comissaoPercentual) / 100 : 0;
  const somaParcelas = negocio.parcelas.reduce((a, p) => a + (p.valor || 0), 0);
  const faltam = (negocio.valorTotal || 0) - somaParcelas;
  const fluxoFecha = negocio.valorTotal ? Math.abs(faltam) < 0.01 : true;
  const somaComissoes = negocio.corretores.reduce((a, c) => a + (c.percentual || 0), 0);
  const comissoesFecham = negocio.corretores.length === 0 || Math.abs(somaComissoes - 100) < 0.01;

  const addParcela = () => {
    const nova: Parcela = { id: `p${Date.now()}`, tipo: "SINAL", valor: 0 };
    dispatch({ type: "SET_PARCELAS", payload: [...negocio.parcelas, nova] });
  };
  const updParcela = (id: string, data: Partial<Parcela>) =>
    dispatch({ type: "SET_PARCELAS", payload: negocio.parcelas.map((p) => p.id === id ? { ...p, ...data } : p) });
  const delParcela = (id: string) =>
    dispatch({ type: "SET_PARCELAS", payload: negocio.parcelas.filter((p) => p.id !== id) });

  const addCorretor = () => {
    const novo: CorretorEnvolvido = { id: `c${Date.now()}`, nome: "", percentual: 0, formaPagamento: "ATRELADA" };
    dispatch({ type: "SET_CORRETORES", payload: [...negocio.corretores, novo] });
  };
  const updCorretor = (id: string, data: Partial<CorretorEnvolvido>) =>
    dispatch({ type: "SET_CORRETORES", payload: negocio.corretores.map((c) => c.id === id ? { ...c, ...data } : c) });
  const delCorretor = (id: string) =>
    dispatch({ type: "SET_CORRETORES", payload: negocio.corretores.filter((c) => c.id !== id) });

  const searchCorretor = async (cId: string, q: string) => {
    setCorretorSearch((p) => ({ ...p, [cId]: q }));
    if (q.length < 2) { setCorretorResults((p) => ({ ...p, [cId]: [] })); return; }
    setCorretorLoading((p) => ({ ...p, [cId]: true }));
    try {
      const res = await fetch(`/api/admin/users?role=CORRETOR&search=${encodeURIComponent(q)}&limit=8`);
      const data = await res.json();
      const usuarios = (data.users || data || []) as any[];
      // Também buscar parceiros
      const resP = await fetch(`/api/admin/partners?search=${encodeURIComponent(q)}&limit=8`);
      const dataP = await resP.json();
      const parceiros = (dataP.partners || []).map((p: any) => ({ id: p.id, name: p.name, creci: p.creci, empresa: p.companyName, isParceiro: true }));
      setCorretorResults((prev) => ({ ...prev, [cId]: [...usuarios, ...parceiros] }));
    } catch { setCorretorResults((p) => ({ ...p, [cId]: [] })); }
    finally { setCorretorLoading((p) => ({ ...p, [cId]: false })); }
  };

  const selectCorretor = (cId: string, user: any) => {
    updCorretor(cId, { userId: user.id, nome: user.name, creci: user.creci || "", empresa: user.empresa || user.company || "" });
    setCorretorSearch((p) => ({ ...p, [cId]: "" }));
    setCorretorResults((p) => ({ ...p, [cId]: [] }));
  };

  const isCessao = negocio.tipoOperacao.startsWith("CESSAO");
  const isFinanciamento = negocio.tipoOperacao.startsWith("FINANCIAMENTO");
  const isParcelamento = negocio.tipoOperacao.startsWith("PARCELAMENTO");
  const isPermuta = negocio.tipoOperacao.startsWith("PERMUTA");

  return (
    <div className="pb-24 space-y-6">
      <h2 className="text-base font-semibold text-gray-800">Negócio e dados financeiros</h2>

      {/* VENDA ou LOCAÇÃO */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">Tipo de negócio</label>
        <div className="flex gap-3">
          {([{ v: "VENDA", l: "Venda" }, { v: "LOCACAO", l: "Locação / Aluguel" }] as { v: TipoNegocio; l: string }[]).map(({ v, l }) => (
            <button key={v} onClick={() => upd("tipoNegocio", v)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors ${
                negocio.tipoNegocio === v ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
              {v === "VENDA" ? "🏠" : "🔑"} {l}
            </button>
          ))}
        </div>
      </div>

      {/* Tipo de operação */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de operação</label>
        <select value={negocio.tipoOperacao} onChange={(e) => upd("tipoOperacao", e.target.value as TipoOperacao)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          {TIPOS_OPERACAO.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      {/* Permuta */}
      {isPermuta && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Bem permutado</span>
            <button onClick={() => upd("permutaAtiva", !negocio.permutaAtiva)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${negocio.permutaAtiva ? "bg-blue-600" : "bg-gray-300"}`}>
              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${negocio.permutaAtiva ? "translate-x-5" : "translate-x-1"}`} />
            </button>
          </div>
          {negocio.permutaAtiva && (
            <div className="space-y-3 pt-2 border-t border-gray-200">
              {negocio.tipoOperacao === "PERMUTA_VEICULO" ? (
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-medium text-gray-600 mb-1">Descrição</label>
                    <input type="text" value={(negocio.permutaDados as any)?.descricao || ""} onChange={(e) => upd("permutaDados", { ...negocio.permutaDados, descricao: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none" /></div>
                  <div><label className="block text-xs font-medium text-gray-600 mb-1">Placa</label>
                    <input type="text" value={(negocio.permutaDados as any)?.placa || ""} onChange={(e) => upd("permutaDados", { ...negocio.permutaDados, placa: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none" /></div>
                  <div><label className="block text-xs font-medium text-gray-600 mb-1">Valor atribuído</label>
                    <CurrencyInput value={(negocio.permutaDados as any)?.valor} onChange={(v) => upd("permutaDados", { ...negocio.permutaDados, valor: v })} /></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2"><label className="block text-xs font-medium text-gray-600 mb-1">Endereço do imóvel</label>
                    <input type="text" value={(negocio.permutaDados as any)?.endereco || ""} onChange={(e) => upd("permutaDados", { ...negocio.permutaDados, endereco: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none" /></div>
                  <div><label className="block text-xs font-medium text-gray-600 mb-1">Matrícula</label>
                    <input type="text" value={(negocio.permutaDados as any)?.matricula || ""} onChange={(e) => upd("permutaDados", { ...negocio.permutaDados, matricula: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none" /></div>
                  <div><label className="block text-xs font-medium text-gray-600 mb-1">Valor atribuído</label>
                    <CurrencyInput value={(negocio.permutaDados as any)?.valor} onChange={(v) => upd("permutaDados", { ...negocio.permutaDados, valor: v })} /></div>
                  {negocio.tipoOperacao === "PERMUTA_TORNA" && (
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Valor da torna</label>
                      <CurrencyInput value={(negocio.permutaDados as any)?.torna} onChange={(v) => upd("permutaDados", { ...negocio.permutaDados, torna: v })} /></div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Valor total */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          {negocio.tipoNegocio === "LOCACAO" ? "Valor do aluguel (R$/mês) *" : "Valor total da venda (R$) *"}
        </label>
        <CurrencyInput value={negocio.valorTotal} onChange={(v) => upd("valorTotal", v)} />
      </div>

      {/* Comissão */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Comissão total (%)</label>
          <input type="number" value={negocio.comissaoPercentual || ""} step="0.1"
            onChange={(e) => upd("comissaoPercentual", parseFloat(e.target.value) || 0)}
            placeholder="6" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Valor (calculado)</label>
          <input type="text" readOnly value={comissaoValor ? formatCurrency(comissaoValor) : "—"}
            className="w-full px-3 py-2 text-sm border border-gray-100 rounded-lg bg-gray-50 text-gray-500" />
        </div>
      </div>

      {/* Quem paga */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">Quem paga a comissão</label>
        <div className="flex gap-3">
          {["VENDEDOR", "COMPRADOR", "DIVIDIDO"].map((op) => (
            <button key={op} onClick={() => upd("comissaoResponsavel", op as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                negocio.comissaoResponsavel === op ? "bg-blue-50 border-blue-500 text-blue-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
              <div className={`w-3 h-3 rounded-full border-2 ${negocio.comissaoResponsavel === op ? "bg-blue-500 border-blue-500" : "border-gray-400"}`} />
              {op.charAt(0) + op.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        {negocio.comissaoResponsavel === "DIVIDIDO" && (
          <div className="grid grid-cols-2 gap-4 mt-3 pl-4 border-l-2 border-blue-200">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">% do vendedor</label>
              <input type="number" value={negocio.comissaoVendedorPct || ""} step="0.1"
                onChange={(e) => upd("comissaoVendedorPct", parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">% do comprador</label>
              <input type="number" value={negocio.comissaoCompradorPct || ""} step="0.1"
                onChange={(e) => upd("comissaoCompradorPct", parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none" />
            </div>
            {(negocio.comissaoVendedorPct || 0) + (negocio.comissaoCompradorPct || 0) !== 100 && (
              <p className="col-span-2 text-xs text-red-500">
                A soma deve ser 100% (atual: {((negocio.comissaoVendedorPct || 0) + (negocio.comissaoCompradorPct || 0)).toFixed(1)}%)
              </p>
            )}
          </div>
        )}
      </div>

      {/* Fluxo de pagamento */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-600">
            Fluxo de pagamento <span className="text-red-500">• Bloqueante se não fechar</span>
          </label>
          <button onClick={addParcela} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
            <RiAddLine className="w-3.5 h-3.5" /> Adicionar parcela
          </button>
        </div>

        <div className="border border-gray-200 rounded-xl overflow-hidden">
          {negocio.parcelas.length === 0 ? (
            <div className="text-center py-6 text-sm text-gray-400">Nenhuma parcela adicionada</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {negocio.parcelas.map((parcela) => (
                <div key={parcela.id} className="px-4 py-3 space-y-2">
                  <div className="grid grid-cols-[140px_1fr_auto] gap-3 items-center">
                    <select value={parcela.tipo} onChange={(e) => updParcela(parcela.id, { tipo: e.target.value as any })}
                      className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none bg-white">
                      <option value="SINAL">Sinal</option>
                      <option value="INTERMEDIARIA">Intermediária</option>
                      <option value="SALDO">Saldo/ato</option>
                    </select>
                    <CurrencyInput
                      value={parcela.valor || undefined}
                      onChange={(v) => updParcela(parcela.id, { valor: v })}
                      className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none w-full"
                    />
                    <button onClick={() => delParcela(parcela.id)} className="text-gray-300 hover:text-red-400">
                      <RiDeleteBinLine className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Condição da parcela com marcos pré-definidos */}
                  <div className="pl-1">
                    <label className="block text-[10px] font-medium text-gray-500 mb-1">Data ou condição</label>
                    <div className="flex gap-2 flex-wrap">
                      {MARCOS_PAGAMENTO.map((m) => (
                        <button key={m.value}
                          onClick={() => updParcela(parcela.id, {
                            condicao: m.value === "custom" ? "" : m.label,
                            condicaoTipo: m.value === "custom" ? "texto" : "marco",
                          })}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                            parcela.condicao === m.label || (m.value === "custom" && parcela.condicaoTipo === "texto")
                              ? "bg-blue-600 border-blue-600 text-white"
                              : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                          {m.label}
                        </button>
                      ))}
                    </div>
                    {(parcela.condicaoTipo === "texto" || (!parcela.condicaoTipo && parcela.condicao && !MARCOS_PAGAMENTO.some(m => m.label === parcela.condicao))) && (
                      <input type="text" value={parcela.condicao || ""}
                        onChange={(e) => updParcela(parcela.id, { condicao: e.target.value, condicaoTipo: "texto" })}
                        placeholder="Descreva a condição..."
                        className="mt-1.5 w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className={`px-4 py-3 border-t text-xs space-y-1 ${!fluxoFecha && negocio.parcelas.length > 0 ? "bg-red-50" : "bg-gray-50"}`}>
            <div className="flex justify-between">
              <span className="text-gray-500">Distribuído:</span>
              <span className="font-medium">{formatCurrency(somaParcelas)}</span>
            </div>
            {negocio.valorTotal && !fluxoFecha && (
              <div className="flex justify-between">
                <span className="text-red-500 font-medium">Faltam:</span>
                <span className="text-red-500 font-medium">{formatCurrency(Math.abs(faltam))}</span>
              </div>
            )}
            {negocio.valorTotal && (
              <div className="flex justify-between font-semibold">
                <span>Total esperado:</span>
                <span>{formatCurrency(negocio.valorTotal)}</span>
              </div>
            )}
          </div>
        </div>
        {erroFluxo && (
          <div className="mt-2 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <RiAlertLine className="w-4 h-4 flex-shrink-0" />
            {erroFluxo}
          </div>
        )}
      </div>

      {/* Corretores */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-600">
            Corretores envolvidos
            {!comissoesFecham && <span className="ml-1 text-orange-500">• Soma deve ser 100%</span>}
          </label>
          <button onClick={addCorretor} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
            <RiAddLine className="w-3.5 h-3.5" /> Adicionar corretor
          </button>
        </div>
        <div className="space-y-3">
          {negocio.corretores.map((c) => (
            <div key={c.id} className="border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-[1fr_160px_auto] gap-3 items-start">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nome do corretor</label>
                  {/* Busca no banco */}
                  <div className="relative">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <RiSearchLine className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input type="text"
                          value={corretorSearch[c.id] !== undefined ? corretorSearch[c.id] : c.nome}
                          onChange={(e) => searchCorretor(c.id, e.target.value)}
                          onFocus={() => setCorretorSearch((p) => ({ ...p, [c.id]: "" }))}
                          placeholder="Buscar corretor ou inserir manualmente"
                          className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        {corretorLoading[c.id] && <RiLoader4Line className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 animate-spin" />}
                      </div>
                    </div>
                    {/* Resultados da busca */}
                    {(corretorResults[c.id] || []).length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {corretorResults[c.id].map((u: any) => (
                          <button key={u.id} type="button"
                            onMouseDown={() => selectCorretor(c.id, u)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-0">
                            <div className="text-xs font-medium text-gray-800">{u.name}</div>
                            <div className="text-[10px] text-gray-400">{u.creci || "Sem CRECI"} {u.isParceiro ? "· Parceiro" : "· Tappy"}</div>
                          </button>
                        ))}
                      </div>
                    )}
                    {/* Campo manual se não buscou */}
                    {corretorSearch[c.id] === undefined && !c.userId && (
                      <input type="text" value={c.nome}
                        onChange={(e) => updCorretor(c.id, { nome: e.target.value })}
                        placeholder="ou digitar manualmente"
                        className="mt-1.5 w-full px-2 py-1.5 text-xs border border-dashed border-gray-300 rounded-lg focus:outline-none" />
                    )}
                    {c.userId && (
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] text-green-600">
                        <RiUserLine className="w-3 h-3" />
                        Vinculado ao cadastro do sistema
                        <button onClick={() => updCorretor(c.id, { userId: undefined })} className="text-gray-400 hover:text-red-400 ml-1">×</button>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">% desta comissão</label>
                  <input type="number" value={c.percentual || ""} step="0.5"
                    onChange={(e) => updCorretor(c.id, { percentual: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none" />
                </div>
                <button onClick={() => delCorretor(c.id)} className="mt-5 text-gray-300 hover:text-red-400">
                  <RiDeleteBinLine className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">CRECI</label>
                  <input type="text" value={c.creci || ""} onChange={(e) => updCorretor(c.id, { creci: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Empresa</label>
                  <input type="text" value={c.empresa || ""} onChange={(e) => updCorretor(c.id, { empresa: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Forma de pagamento da comissão</label>
                <div className="flex gap-2">
                  <button onClick={() => updCorretor(c.id, { formaPagamento: "ATRELADA" })}
                    className={`flex-1 py-1.5 text-xs rounded-lg border font-medium ${c.formaPagamento === "ATRELADA" ? "bg-blue-50 border-blue-400 text-blue-700" : "border-gray-200 text-gray-500"}`}>
                    Atrelada ao fluxo
                  </button>
                  <button onClick={() => updCorretor(c.id, { formaPagamento: "DATA_ESPECIFICA" })}
                    className={`flex-1 py-1.5 text-xs rounded-lg border font-medium ${c.formaPagamento === "DATA_ESPECIFICA" ? "bg-blue-50 border-blue-400 text-blue-700" : "border-gray-200 text-gray-500"}`}>
                    Data específica
                  </button>
                </div>
                {c.formaPagamento === "ATRELADA" && negocio.parcelas.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {negocio.parcelas.map((p) => (
                      <label key={p.id} className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                        <input type="checkbox" checked={(c.parcelasVinculadas || []).includes(p.id)}
                          onChange={(e) => {
                            const atual = c.parcelasVinculadas || [];
                            updCorretor(c.id, { parcelasVinculadas: e.target.checked ? [...atual, p.id] : atual.filter((x) => x !== p.id) });
                          }} className="rounded" />
                        {p.tipo} {p.condicao ? `(${p.condicao})` : ""} — {formatCurrency(p.valor)}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {negocio.corretores.length > 0 && (
            <div className={`text-xs px-3 py-2 rounded-lg ${comissoesFecham ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"}`}>
              Total das comissões: {somaComissoes.toFixed(1)}% {comissoesFecham ? "✓" : "(deve ser 100%)"}
            </div>
          )}
        </div>
      </div>

      {/* Posse */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">Definição de posse</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: "DATA_FIXA", label: "Data fixa" },
            { value: "PARCELA", label: "Atrelada a uma parcela" },
            { value: "PRAZO_ASSINATURA", label: "Prazo após a assinatura" },
            { value: "PRAZO_EVENTO", label: "Prazo após evento" },
          ].map((op) => (
            <button key={op.value} onClick={() => upd("posseDefinicao", op.value as any)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-left transition-colors ${
                negocio.posseDefinicao === op.value ? "bg-blue-50 border-blue-500 text-blue-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${negocio.posseDefinicao === op.value ? "bg-blue-500 border-blue-500" : "border-gray-400"}`} />
              {op.label}
            </button>
          ))}
        </div>
        {negocio.posseDefinicao && (
          <div className="mt-3 pl-4 border-l-2 border-blue-200 space-y-2">
            {negocio.posseDefinicao === "DATA_FIXA" && (
              <input type="date" value={negocio.possePrazo || ""} onChange={(e) => upd("possePrazo", e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none" />
            )}
            {negocio.posseDefinicao === "PRAZO_ASSINATURA" && (
              <div className="flex items-center gap-2">
                <input type="number" value={negocio.possePrazo || ""} onChange={(e) => upd("possePrazo", e.target.value)}
                  placeholder="Ex.: 90" className="w-24 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none" />
                <span className="text-sm text-gray-600">dias após a assinatura do instrumento</span>
              </div>
            )}
            {/* PARCELA — dropdown das parcelas cadastradas */}
            {negocio.posseDefinicao === "PARCELA" && (
              <div>
                {negocio.parcelas.length === 0 ? (
                  <p className="text-xs text-orange-600">Adicione parcelas ao fluxo de pagamento primeiro</p>
                ) : (
                  <select value={negocio.posseParcelaId || ""}
                    onChange={(e) => upd("posseParcelaId", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">Selecione a parcela</option>
                    {negocio.parcelas.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.tipo} — {formatCurrency(p.valor)} {p.condicao ? `(${p.condicao})` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
            {/* PRAZO_EVENTO — eventos específicos */}
            {negocio.posseDefinicao === "PRAZO_EVENTO" && (
              <div className="space-y-3">
                <div className="flex gap-3">
                  <button onClick={() => upd("posseEventoTipo", "NA_QUITACAO")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      negocio.posseEventoTipo === "NA_QUITACAO" ? "bg-blue-50 border-blue-500 text-blue-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                    <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${negocio.posseEventoTipo === "NA_QUITACAO" ? "bg-blue-500 border-blue-500" : "border-gray-400"}`} />
                    Na quitação integral
                  </button>
                  <button onClick={() => upd("posseEventoTipo", "DIAS_APOS_QUITACAO")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      negocio.posseEventoTipo === "DIAS_APOS_QUITACAO" ? "bg-blue-50 border-blue-500 text-blue-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                    <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${negocio.posseEventoTipo === "DIAS_APOS_QUITACAO" ? "bg-blue-500 border-blue-500" : "border-gray-400"}`} />
                    X dias após a quitação
                  </button>
                </div>
                {negocio.posseEventoTipo === "DIAS_APOS_QUITACAO" && (
                  <div className="flex items-center gap-2 pl-1">
                    <input type="number" min="1"
                      value={negocio.posseEventoDias || ""}
                      onChange={(e) => upd("posseEventoDias", parseInt(e.target.value) || 0)}
                      placeholder="Ex.: 30"
                      className="w-24 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <span className="text-sm text-gray-600">dias após a quitação integral</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Campos condicionais por tipo */}
      {(isFinanciamento || isCessao || isParcelamento) && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Dados específicos — {TIPOS_OPERACAO.find((t) => t.value === negocio.tipoOperacao)?.label}
          </h3>
          {isFinanciamento && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Banco financiador</label>
                <select value={(negocio.dadosAdicionais as any)?.bancoFinanciador || ""}
                  onChange={(e) => upd("dadosAdicionais", { ...negocio.dadosAdicionais, bancoFinanciador: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none bg-white">
                  <option value="">Selecione</option>
                  {BANCOS_BR.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Valor financiado</label>
                <CurrencyInput value={(negocio.dadosAdicionais as any)?.valorFinanciado}
                  onChange={(v) => upd("dadosAdicionais", { ...negocio.dadosAdicionais, valorFinanciado: v })} />
              </div>
              {negocio.tipoOperacao === "FINANCIAMENTO_INTERVENIENTE" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Banco credor atual</label>
                    <select value={(negocio.dadosAdicionais as any)?.bancoCredorAtual || ""}
                      onChange={(e) => upd("dadosAdicionais", { ...negocio.dadosAdicionais, bancoCredorAtual: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none bg-white">
                      <option value="">Selecione</option>
                      {BANCOS_BR.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Saldo devedor</label>
                    <CurrencyInput value={(negocio.dadosAdicionais as any)?.saldoDevedor}
                      onChange={(v) => upd("dadosAdicionais", { ...negocio.dadosAdicionais, saldoDevedor: v })} />
                  </div>
                </>
              )}
            </div>
          )}
          {isCessao && (
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Incorporadora</label>
                <input type="text" value={(negocio.dadosAdicionais as any)?.incorporadora || ""} onChange={(e) => upd("dadosAdicionais", { ...negocio.dadosAdicionais, incorporadora: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none" /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Nº contrato original</label>
                <input type="text" value={(negocio.dadosAdicionais as any)?.contratoOriginal || ""} onChange={(e) => upd("dadosAdicionais", { ...negocio.dadosAdicionais, contratoOriginal: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none" /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Valor pago pelo cedente</label>
                <CurrencyInput value={(negocio.dadosAdicionais as any)?.valorPagoCedente} onChange={(v) => upd("dadosAdicionais", { ...negocio.dadosAdicionais, valorPagoCedente: v })} /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Saldo c/ incorporadora</label>
                <CurrencyInput value={(negocio.dadosAdicionais as any)?.saldoIncorporadora} onChange={(v) => upd("dadosAdicionais", { ...negocio.dadosAdicionais, saldoIncorporadora: v })} /></div>
            </div>
          )}
          {isParcelamento && (
            <div>
              <p className="text-xs text-gray-500">Índice de correção e taxa de juros adicionados nas parcelas acima.</p>
              {negocio.tipoOperacao === "PARCELAMENTO_AF" && (
                <div className="mt-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-xs text-orange-700">
                  ⚠ Parcelamento com AF: obrigatório o registro em cartório.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
