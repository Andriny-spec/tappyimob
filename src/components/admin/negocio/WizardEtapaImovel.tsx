"use client";

import { useState, useRef, useCallback } from "react";
import {
  RiUploadLine, RiEditLine, RiCheckLine, RiAlertLine,
  RiFileTextLine, RiLoader4Line, RiAddLine, RiDeleteBinLine,
  RiCloseLine, RiPencilLine,
} from "react-icons/ri";
import { useWizard } from "./WizardContext";

const SITUACOES = [
  { value: "QUITADO", label: "Quitado" },
  { value: "FINANCIADO", label: "Financiado" },
  { value: "ALIENACAO_FIDUCIARIA", label: "Alienação fiduciária" },
];

const BANCOS_BR = [
  "Banco do Brasil", "Caixa Econômica Federal", "Bradesco", "Itaú Unibanco",
  "Santander", "Nubank", "Banco Inter", "C6 Bank", "BTG Pactual",
  "Banco Safra", "Sicoob", "Sicredi", "BRB", "Banrisul", "ABC Brasil",
  "Votorantim", "BNB", "BNDES", "Banco Pan", "Daycoval", "Outra instituição",
];

type DocStatus = "pendente" | "enviado" | "processando" | "extraido" | "validado";

interface DocItem {
  tipo: string;
  label: string;
  bloqueante: boolean;
  status: DocStatus;
  fileName?: string;
}

const DOC_INICIAL: DocItem[] = [
  { tipo: "MATRICULA", label: "Matrícula do imóvel", bloqueante: true, status: "pendente" },
  { tipo: "ESPELHO_IPTU", label: "Espelho IPTU", bloqueante: false, status: "pendente" },
  { tipo: "CND_CONDOMINIO", label: "CND Condomínio", bloqueante: false, status: "pendente" },
];

function CampoExtrato({ label, value, onChange, placeholder, readOnly, extraido }: any) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
          readOnly ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""
        } ${extraido ? "bg-amber-50 border-amber-300" : "border-gray-300"}`}
      />
    </div>
  );
}

export function WizardEtapaImovel() {
  const { state, dispatch } = useWizard();
  const { imovel } = state;
  const [docs, setDocs] = useState<DocItem[]>(DOC_INICIAL);
  const [modoPreenchimento, setModoPreenchimento] = useState<"inicial" | "form">("inicial");
  const [extraindoDoc, setExtraindoDoc] = useState<string | null>(null);
  const [camposExtraidos, setCamposExtraidos] = useState<Set<string>>(new Set());
  const [editandoMobIdx, setEditandoMobIdx] = useState<number | null>(null);
  const novoItemRef = useRef<HTMLInputElement>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const upd = (key: keyof typeof imovel, value: any) => {
    dispatch({ type: "UPDATE_IMOVEL", payload: { [key]: value } });
    if (camposExtraidos.has(key)) {
      const novo = new Set(camposExtraidos);
      novo.delete(key);
      setCamposExtraidos(novo);
    }
  };

  const buscarCep = useCallback(async (cep: string) => {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (!data.erro) {
        dispatch({ type: "UPDATE_IMOVEL", payload: { logradouro: data.logradouro, cidade: data.localidade, uf: data.uf } });
      }
    } catch {}
  }, [dispatch]);

  const uploadDoc = async (tipo: string, file: File) => {
    if (!state.negocioId) return;
    setDocs((prev) => prev.map((d) => d.tipo === tipo ? { ...d, status: "enviado", fileName: file.name } : d));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("tipo", tipo);

    const uploadRes = await fetch(`/api/admin/negocio/${state.negocioId}/documentos`, { method: "POST", body: formData });
    if (!uploadRes.ok) {
      setDocs((prev) => prev.map((d) => d.tipo === tipo ? { ...d, status: "pendente" } : d));
      return;
    }

    const doc = await uploadRes.json();
    setDocs((prev) => prev.map((d) => d.tipo === tipo ? { ...d, status: "processando" } : d));
    setExtraindoDoc(tipo);

    const extRes = await fetch(`/api/admin/negocio/${state.negocioId}/documentos/${doc.id}/extrair`, { method: "POST" });
    if (extRes.status === 422) {
      // PDF escaneado sem texto embutido
      const errData = await extRes.json();
      setDocs((prev) => prev.map((d) => d.tipo === tipo ? { ...d, status: "enviado" } : d));
      alert(errData.error || "PDF sem texto: converta para JPG/PNG e reenvie.");
      setExtraindoDoc(null);
      return;
    }
    if (extRes.ok) {
      const { dadosExtraidos } = await extRes.json();
      setDocs((prev) => prev.map((d) => d.tipo === tipo ? { ...d, status: "extraido" } : d));

      if (tipo === "MATRICULA" && dadosExtraidos) {
        const campos: Partial<typeof imovel> = {};
        const extraidos = new Set(camposExtraidos);
        const add = (key: keyof typeof imovel, val: any) => {
          if (val !== null && val !== undefined && val !== "") { (campos as any)[key] = val; extraidos.add(key as string); }
        };
        add("matricula", dadosExtraidos.matriculaNumero);
        add("cri", dadosExtraidos.cri);
        // Campos de endereço SEPARADOS (corrige bug de ignorar endereço/cidade)
        add("logradouro", dadosExtraidos.logradouro);
        add("numero", dadosExtraidos.numero);
        add("complemento", dadosExtraidos.complemento);
        add("cidade", dadosExtraidos.cidade);
        add("uf", dadosExtraidos.uf);
        add("cep", dadosExtraidos.cep);
        add("condominio", dadosExtraidos.condominio);
        add("inscricaoFiscal", dadosExtraidos.inscricaoFiscal);
        add("situacao", dadosExtraidos.situacao);
        add("saldoDevedor", dadosExtraidos.saldoDevedor);
        add("bancoCredor", dadosExtraidos.bancoCredor);
        // Endereço completo (fallback/legado): monta a partir dos campos
        const enderecoCompleto = [dadosExtraidos.logradouro, dadosExtraidos.numero, dadosExtraidos.bairro]
          .filter(Boolean).join(", ");
        if (enderecoCompleto) campos.endereco = enderecoCompleto;
        if (dadosExtraidos.laudemio === true || dadosExtraidos.laudemio === "true") campos.laudemioDetectado = true;
        dispatch({ type: "UPDATE_IMOVEL", payload: campos });
        setCamposExtraidos(extraidos);

        // Proprietários da matrícula → pré-preenche os Vendedores (Imóvel e Vendedor compartilham a matrícula)
        if (Array.isArray(dadosExtraidos.proprietarios) && dadosExtraidos.proprietarios.length > 0) {
          const vendedores = dadosExtraidos.proprietarios.map((p: any, i: number) => ({
            id: `v_mat_${Date.now()}_${i}`,
            tipo: "VENDEDOR" as const,
            nome: p.nome || "",
            cpf: (p.cpf || "").replace(/\D/g, "") || undefined,
            cnpj: (p.cnpj || "").replace(/\D/g, "") || undefined,
            isPessoaJuridica: !!p.cnpj,
            estadoCivil: p.estadoCivil || undefined,
            regimeBens: p.regimeBens || undefined,
            conjuge: p.conjuge || undefined,
            nacionalidade: "brasileiro(a)",
          }));
          dispatch({ type: "SET_VENDEDORES", payload: vendedores });
        }

        const confirmarBody: any = { campos: {} };
        for (const [k, v] of Object.entries(dadosExtraidos)) {
          confirmarBody.campos[k] = { valor: v, corrigido: false };
        }
        await fetch(`/api/admin/negocio/${state.negocioId}/documentos/${doc.id}/confirmar`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(confirmarBody),
        });
        setDocs((prev) => prev.map((d) => d.tipo === tipo ? { ...d, status: "validado" } : d));
      }

      if (tipo === "ESPELHO_IPTU" && dadosExtraidos?.inscricaoFiscal) {
        dispatch({ type: "UPDATE_IMOVEL", payload: { inscricaoFiscal: dadosExtraidos.inscricaoFiscal } });
      }
    } else {
      setDocs((prev) => prev.map((d) => d.tipo === tipo ? { ...d, status: "enviado" } : d));
    }
    setExtraindoDoc(null);
    if (modoPreenchimento === "inicial") setModoPreenchimento("form");
  };

  const statusColor: Record<DocStatus, string> = {
    pendente: "text-gray-400", enviado: "text-blue-500",
    processando: "text-yellow-500", extraido: "text-orange-500", validado: "text-green-500",
  };
  const statusLabel: Record<DocStatus, string> = {
    pendente: "Pendente", enviado: "Enviado",
    processando: "Processando...", extraido: "Extraído", validado: "Validado",
  };

  const mobItems: string[] = imovel.mobiliarioItens || [];

  const addMobItem = (value = "") => {
    upd("mobiliarioItens", [...mobItems, value]);
    setTimeout(() => {
      const inputs = document.querySelectorAll<HTMLInputElement>(".mob-item-input");
      inputs[inputs.length - 1]?.focus();
    }, 50);
  };

  return (
    <div className="pb-24">
      {/* Tela inicial */}
      {modoPreenchimento === "inicial" && (
        <div className="flex flex-col items-center justify-center py-16 gap-6">
          <h2 className="text-xl font-semibold text-gray-800">Como deseja preencher os dados do imóvel?</h2>
          <p className="text-sm text-gray-500 text-center max-w-md">
            Anexando a matrícula, o sistema extrai automaticamente endereço, matrícula, CRI e inscrição fiscal via IA.
          </p>
          <div className="flex gap-4">
            <button onClick={() => fileRefs.current["MATRICULA"]?.click()}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700">
              <RiUploadLine className="w-5 h-5" />
              Anexar matrícula (extração automática)
            </button>
            <button onClick={() => setModoPreenchimento("form")}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50">
              <RiEditLine className="w-5 h-5" />
              Preencher manualmente
            </button>
          </div>
          <input ref={(el) => { fileRefs.current["MATRICULA"] = el; }} type="file" accept=".pdf,.jpg,.png" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) { setModoPreenchimento("form"); uploadDoc("MATRICULA", f); } }} />
        </div>
      )}

      {modoPreenchimento === "form" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* Coluna esquerda */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">Dados do imóvel</h2>
              {extraindoDoc && (
                <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5">
                  <RiLoader4Line className="w-3.5 h-3.5 animate-spin" />
                  Extraindo dados da matrícula com IA...
                </div>
              )}
            </div>

            {imovel.laudemioDetectado && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                <RiAlertLine className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700">Laudêmio SPU detectado na matrícula. Cláusula incluída automaticamente na minuta.</p>
              </div>
            )}

            {camposExtraidos.size > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <p className="text-xs text-amber-700">
                  ✨ {camposExtraidos.size} campo(s) extraído(s) automaticamente pela IA (fundo amarelo). Verifique e corrija se necessário.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <CampoExtrato label="Condomínio / empreendimento" value={imovel.condominio} onChange={(v: string) => upd("condominio", v)}
                  placeholder="Ex.: Res. Tamboré 11" extraido={camposExtraidos.has("condominio")} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">CEP</label>
                <input type="text" value={imovel.cep || ""} placeholder="00000-000"
                  onChange={(e) => upd("cep", e.target.value)}
                  onBlur={(e) => buscarCep(e.target.value)}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${camposExtraidos.has("cep") ? "bg-amber-50 border-amber-300" : "border-gray-300"}`} />
              </div>
              <div className="col-span-2">
                <CampoExtrato label="Logradouro" value={imovel.logradouro} onChange={(v: string) => upd("logradouro", v)} placeholder="Rua/Av." extraido={camposExtraidos.has("logradouro")} />
              </div>
              <CampoExtrato label="Número" value={imovel.numero} onChange={(v: string) => upd("numero", v)} placeholder="123" extraido={false} />
              <CampoExtrato label="Complemento" value={imovel.complemento} onChange={(v: string) => upd("complemento", v)} placeholder="Apto 42" extraido={false} />
              <CampoExtrato label="Cidade" value={imovel.cidade} onChange={(v: string) => upd("cidade", v)} placeholder="Barueri" extraido={camposExtraidos.has("cidade")} />
              <CampoExtrato label="UF" value={imovel.uf} onChange={(v: string) => upd("uf", v)} placeholder="SP" extraido={camposExtraidos.has("uf")} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Matrícula
                  {docs.find((d) => d.tipo === "MATRICULA")?.status === "pendente" && (
                    <span className="ml-2 text-xs text-red-500 font-normal">• Bloqueante</span>
                  )}
                </label>
                <input type="text" value={imovel.matricula || ""}
                  onChange={(e) => upd("matricula", e.target.value)}
                  placeholder="Número da matrícula"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${camposExtraidos.has("matricula") ? "bg-amber-50 border-amber-300" : "border-gray-300"}`} />
                {imovel.matriculaVencida && (
                  <p className="text-xs text-orange-500 mt-1">⚠ Matrícula vencida (+30 dias). Solicitar nova.</p>
                )}
              </div>
              <CampoExtrato label="CRI competente" value={imovel.cri} onChange={(v: string) => upd("cri", v)} placeholder="Cartório de RI" extraido={camposExtraidos.has("cri")} />
              <div className="col-span-2">
                <CampoExtrato label="Inscrição fiscal (IPTU)" value={imovel.inscricaoFiscal} onChange={(v: string) => upd("inscricaoFiscal", v)} placeholder="Número de inscrição" extraido={camposExtraidos.has("inscricaoFiscal")} />
              </div>
            </div>

            {/* Situação */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Situação do imóvel</label>
              <div className="flex gap-3">
                {SITUACOES.map((s) => (
                  <button key={s.value} onClick={() => upd("situacao", s.value as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      imovel.situacao === s.value ? "bg-blue-50 border-blue-500 text-blue-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
                    <div className={`w-3 h-3 rounded-full border-2 ${imovel.situacao === s.value ? "bg-blue-500 border-blue-500" : "border-gray-400"}`} />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {(imovel.situacao === "FINANCIADO" || imovel.situacao === "ALIENACAO_FIDUCIARIA") && (
              <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-blue-200">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Saldo devedor (R$)</label>
                  <input type="number" value={imovel.saldoDevedor || ""} onChange={(e) => upd("saldoDevedor", parseFloat(e.target.value))}
                    placeholder="0,00" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Banco credor</label>
                  <select
                    value={imovel.bancoCredor || ""}
                    onChange={(e) => upd("bancoCredor", e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${camposExtraidos.has("bancoCredor") ? "bg-amber-50 border-amber-300" : "border-gray-300"}`}
                  >
                    <option value="">Selecione o banco</option>
                    {BANCOS_BR.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Mobiliário */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-600">Mobiliário incluso</label>
                <button onClick={() => upd("mobiliario", !imovel.mobiliario)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${imovel.mobiliario ? "bg-blue-600" : "bg-gray-300"}`}>
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${imovel.mobiliario ? "translate-x-5" : "translate-x-1"}`} />
                </button>
              </div>
              {imovel.mobiliario && (
                <div className="space-y-2 pl-4 border-l-2 border-blue-200">
                  {mobItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      {editandoMobIdx === idx ? (
                        <input
                          autoFocus
                          type="text"
                          value={item}
                          onChange={(e) => { const n = [...mobItems]; n[idx] = e.target.value; upd("mobiliarioItens", n); }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") { setEditandoMobIdx(null); if (!item.trim()) upd("mobiliarioItens", mobItems.filter((_, i) => i !== idx)); }
                            if (e.key === "Escape") { setEditandoMobIdx(null); }
                          }}
                          onBlur={() => { setEditandoMobIdx(null); if (!item.trim()) upd("mobiliarioItens", mobItems.filter((_, i) => i !== idx)); }}
                          className="mob-item-input flex-1 px-3 py-1.5 text-sm border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Item do mobiliário"
                        />
                      ) : (
                        <span className="flex-1 px-3 py-1.5 text-sm text-gray-700 bg-gray-50 rounded-lg border border-gray-200">{item || <span className="text-gray-400">item vazio</span>}</span>
                      )}
                      <button onClick={() => setEditandoMobIdx(idx)} title="Editar" className="text-blue-400 hover:text-blue-600">
                        <RiPencilLine className="w-4 h-4" />
                      </button>
                      <button onClick={() => upd("mobiliarioItens", mobItems.filter((_, i) => i !== idx))} title="Remover" className="text-red-400 hover:text-red-600">
                        <RiDeleteBinLine className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {/* Campo para novo item com Enter */}
                  <div className="flex items-center gap-2">
                    <input
                      ref={novoItemRef}
                      type="text"
                      placeholder="Novo item — pressione Enter para adicionar"
                      className="flex-1 px-3 py-1.5 text-sm border border-dashed border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const val = (e.target as HTMLInputElement).value.trim();
                          if (val) { upd("mobiliarioItens", [...mobItems, val]); (e.target as HTMLInputElement).value = ""; }
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const val = novoItemRef.current?.value.trim();
                        if (val) { upd("mobiliarioItens", [...mobItems, val]); if (novoItemRef.current) novoItemRef.current.value = ""; }
                      }}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50"
                    >
                      <RiAddLine className="w-3.5 h-3.5" /> Adicionar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Coluna direita — documentos */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Documentos do imóvel</h3>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-blue-600 px-4 py-2">
                <p className="text-xs font-medium text-white">Documentos do imóvel</p>
              </div>
              <div className="divide-y divide-gray-100">
                {docs.map((doc) => (
                  <div key={doc.tipo} className="flex items-center gap-3 px-4 py-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      doc.status === "validado" ? "bg-green-500" :
                      doc.status === "extraido" ? "bg-orange-400" :
                      doc.status === "processando" ? "bg-yellow-400 animate-pulse" :
                      doc.status === "enviado" ? "bg-blue-400" : "bg-gray-300"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 truncate">{doc.label}</p>
                      <p className={`text-xs ${statusColor[doc.status]}`}>
                        {doc.status === "processando" ? (
                          <span className="flex items-center gap-1">
                            <RiLoader4Line className="w-3 h-3 animate-spin" /> Extraindo com IA...
                          </span>
                        ) : statusLabel[doc.status]}
                      </p>
                    </div>
                    <input ref={(el) => { fileRefs.current[doc.tipo] = el; }} type="file" accept=".pdf,.jpg,.png" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadDoc(doc.tipo, f); e.target.value = ""; }} />
                    <button onClick={() => fileRefs.current[doc.tipo]?.click()}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap">
                      {doc.status === "pendente" ? "[Anexar]" : "[Reenviar]"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2 px-1">Verde = validado • Laranja = aguardando • Cinza = pendente</p>
          </div>
        </div>
      )}
    </div>
  );
}
