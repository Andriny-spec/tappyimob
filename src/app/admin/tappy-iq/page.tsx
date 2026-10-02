"use client";

import { useState, useEffect } from "react";
import {
  RiSearchEyeLine,
  RiUserSearchLine,
  RiLoader4Line,
  RiInformationLine,
  RiArrowRightLine,
  RiFileCopyLine,
  RiMapPinLine,
  RiPhoneLine,
  RiMailLine,
  RiCarLine,
  RiBriefcaseLine,
  RiBuilding2Line,
  RiGroupLine,
  RiAlertLine,
  RiFilePdf2Line,
} from "react-icons/ri";

type Source = "seekloc" | "ph3a";
type View = "seekloc" | "ph3a" | "historico";

interface FieldDef {
  key: string;
  label: string;
  placeholder?: string;
  width?: "full" | "half" | "third";
}

const SEEKLOC_TIPOS: { value: string; label: string; fields: FieldDef[] }[] = [
  { value: "documento", label: "CPF / CNPJ", fields: [{ key: "doc", label: "Documento", placeholder: "Somente números", width: "full" }] },
  {
    value: "nome",
    label: "Nome",
    fields: [
      { key: "nome", label: "Nome completo", width: "full" },
      { key: "dtnasc", label: "Nascimento (aaaammdd)", placeholder: "Ex: 19900131", width: "half" },
      { key: "uf", label: "UF", placeholder: "SP", width: "half" },
    ],
  },
  { value: "telefone", label: "Telefone", fields: [{ key: "ddd", label: "DDD", width: "third" }, { key: "fone", label: "Telefone", width: "full" }] },
  { value: "email", label: "E-mail", fields: [{ key: "email", label: "E-mail", width: "full" }] },
  {
    value: "endereco",
    label: "Endereço",
    fields: [
      { key: "logradouro", label: "Logradouro", width: "full" },
      { key: "numero", label: "Número", width: "half" },
      { key: "bairro", label: "Bairro", width: "half" },
      { key: "cidade", label: "Cidade", width: "half" },
      { key: "uf", label: "UF", width: "half" },
      { key: "cep", label: "CEP", width: "full" },
    ],
  },
  {
    value: "cep",
    label: "CEP",
    fields: [
      { key: "cep", label: "CEP (8 dígitos)", width: "full" },
      { key: "numero", label: "Número inicial", width: "half" },
      { key: "numero1", label: "Número final", width: "half" },
    ],
  },
  { value: "placa", label: "Placa", fields: [{ key: "placa", label: "Placa do veículo", width: "full" }] },
];

// PH3A: formulário avançado (mesmos campos do site /databusca/search). As chaves
// são os nomes EXATOS aceitos pela API /search. Só o documento (sozinho, válido)
// abre o dossiê direto; qualquer combinação → lista de candidatos com prévia.
const PH3A_FORM: { grupo: string; fields: FieldDef[] }[] = [
  {
    grupo: "Dados gerais",
    fields: [
      { key: "Name", label: "Nome, Razão Social ou Fantasia", placeholder: "Nome completo ou parcial", width: "full" },
      { key: "Document", label: "Documento (CPF/CNPJ)", placeholder: "Somente números", width: "half" },
      { key: "MotherName", label: "Nome da mãe", width: "half" },
      { key: "BirthDate", label: "Nascimento", placeholder: "aaaa-mm-dd", width: "half" },
    ],
  },
  {
    grupo: "Localização",
    fields: [
      { key: "State", label: "Estado (UF)", placeholder: "SP", width: "third" },
      { key: "City", label: "Cidade", placeholder: "Ex: São Paulo", width: "half" },
      { key: "Street", label: "Logradouro", placeholder: "Ex: Av. João Silva", width: "full" },
      { key: "AddressNumber", label: "Nº", placeholder: "123", width: "third" },
      { key: "ZipCode", label: "CEP", placeholder: "99999-999", width: "half" },
      { key: "Radius", label: "Raio (km)", placeholder: "10", width: "third" },
    ],
  },
  {
    grupo: "Veículo",
    fields: [
      { key: "CarPlate", label: "Placa", placeholder: "ABC-1234", width: "half" },
      { key: "Renavam", label: "Renavam", placeholder: "123456789", width: "half" },
    ],
  },
  {
    grupo: "Contato",
    fields: [
      { key: "PhoneNumber", label: "Telefone", placeholder: "(11) 97070-7070", width: "half" },
      { key: "Email", label: "E-mail", placeholder: "ex: joao@teste.com.br", width: "half" },
      { key: "Url", label: "Url", placeholder: "ex: site.com.br", width: "full" },
    ],
  },
];

function widthClass(w?: string) {
  if (w === "half") return "sm:col-span-1";
  if (w === "third") return "sm:col-span-1 sm:max-w-[120px]";
  return "sm:col-span-2";
}

// Largura no grid de 6 colunas do formulário avançado PH3A.
function ph3aWidth(w?: string) {
  if (w === "third") return "col-span-1 sm:col-span-2";
  if (w === "half") return "col-span-1 sm:col-span-3";
  return "col-span-2 sm:col-span-6";
}

const card = "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl";
const input =
  "w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-[#0B2545] focus:border-transparent outline-none";

export default function TappyIQPage() {
  const [source, setSource] = useState<View>("seekloc");

  // ---------- Seekloc ----------
  const [skTipo, setSkTipo] = useState("documento");
  const [skFields, setSkFields] = useState<Record<string, string>>({});
  const [skLoading, setSkLoading] = useState(false);
  const [skMsg, setSkMsg] = useState<string | null>(null);
  const [skHits, setSkHits] = useState<{ id: string; doc: string; nome: string }[]>([]);
  const [detailLoading, setDetailLoading] = useState<string | null>(null);
  const [dossie, setDossie] = useState<any | null>(null);
  const [skCached, setSkCached] = useState(false);
  const [rawOpen, setRawOpen] = useState(false);
  const [raw, setRaw] = useState<any | null>(null);

  // ---------- PH3A ----------
  const [phFields, setPhFields] = useState<Record<string, string>>({});
  const [phPersonType, setPhPersonType] = useState<string>(""); // ""=Ambos, "0"=PF, "1"=PJ
  const [phLoading, setPhLoading] = useState(false);
  const [phResult, setPhResult] = useState<any | null>(null);
  const [phCands, setPhCands] = useState<any[] | null>(null);
  const [phMsg, setPhMsg] = useState<string | null>(null);
  const [phDetailLoading, setPhDetailLoading] = useState<number | null>(null);
  const [phConfigured, setPhConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/admin/tappy-iq/ph3a")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setPhConfigured(!!d.configured); })
      .catch(() => {});
  }, []);

  const skTipoDef = SEEKLOC_TIPOS.find((t) => t.value === skTipo)!;

  async function runSeeklocSearch() {
    setSkLoading(true);
    setSkMsg(null);
    setSkHits([]);
    setDossie(null);
    setRaw(null);
    setSkCached(false);
    try {
      const res = await fetch("/api/admin/tappy-iq/seekloc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "search", tipo: skTipo, params: skFields }),
      });
      const data = await res.json();
      if (!res.ok) { setSkMsg(data.error || "Erro na busca"); return; }
      setSkHits(data.hits || []);
      setSkMsg(`${data.mensagem}${data.qtde ? ` — ${data.qtde} resultado(s)` : ""}`);
    } catch {
      setSkMsg("Falha de conexão com o serviço.");
    } finally {
      setSkLoading(false);
    }
  }

  async function loadDetail(hit: { id: string; doc: string }) {
    setDetailLoading(hit.id);
    setDossie(null);
    setRaw(null);
    try {
      const res = await fetch("/api/admin/tappy-iq/seekloc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "detail", id: hit.id, doc: hit.doc }),
      });
      const data = await res.json();
      if (!res.ok) { setSkMsg(data.error || "Erro ao carregar dossiê"); return; }
      setDossie(data.dossie);
      setRaw(data.raw);
      setSkCached(!!data.cached);
    } catch {
      setSkMsg("Falha ao carregar o dossiê.");
    } finally {
      setDetailLoading(null);
    }
  }

  async function runPh3aSearch() {
    setPhLoading(true);
    setPhResult(null);
    setPhCands(null);
    setPhMsg(null);
    try {
      // Fast-path: só o documento preenchido (CPF/CNPJ válido) → abre o dossiê direto.
      // Caso contrário → busca avançada (/search) com todos os filtros preenchidos.
      const doc = (phFields.Document || "").replace(/\D/g, "");
      const outrosPreenchidos = Object.entries(phFields).some(
        ([k, v]) => k !== "Document" && String(v || "").trim()
      );
      const soDocumento = (doc.length === 11 || doc.length === 14) && !outrosPreenchidos;

      const payload = soDocumento
        ? { tipo: "documento", params: { doc } }
        : { action: "search", params: { ...phFields, PersonType: phPersonType } };

      const res = await fetch("/api/admin/tappy-iq/ph3a", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (typeof data.configured === "boolean") setPhConfigured(data.configured);
      if (soDocumento) {
        setPhResult(data);
        if (!data.ok) setPhMsg(data.mensagem || null);
      } else if (data.ok) {
        setPhCands(data.candidatos || []);
        if (!data.candidatos?.length) setPhMsg(data.mensagem || "Nenhum resultado.");
      } else {
        setPhMsg(data.mensagem || data.error || "Erro na busca.");
      }
    } catch {
      setPhMsg("Falha de conexão com o serviço.");
    } finally {
      setPhLoading(false);
    }
  }

  async function ph3aOpenCandidate(sid: number) {
    setPhDetailLoading(sid);
    setPhResult(null);
    try {
      const res = await fetch("/api/admin/tappy-iq/ph3a", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "detail", sequentialId: sid }),
      });
      const data = await res.json();
      setPhResult(data);
    } catch {
      setPhResult({ ok: false, mensagem: "Falha ao abrir o dossiê." });
    } finally {
      setPhDetailLoading(null);
    }
  }

  // Drill-down do Seekloc: clicar num nome da ficha abre o dossiê dele.
  async function seeklocDrill(doc?: string, nome?: string) {
    setSource("seekloc");
    setSkLoading(true);
    setSkMsg(null);
    setSkHits([]);
    setDossie(null);
    setRaw(null);
    setSkCached(false);
    try {
      const res = await fetch("/api/admin/tappy-iq/seekloc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "drill", doc: doc || "", nome: nome || "" }),
      });
      const data = await res.json();
      if (!res.ok) { setSkMsg(data.error || "Erro ao abrir o dossiê"); return; }
      if (data.candidatesOnly) {
        setSkHits(data.hits || []);
        setSkMsg(`${data.hits?.length || 0} resultado(s) para "${nome}". Clique para abrir.`);
      } else if (data.dossie) {
        setDossie(data.dossie);
        setRaw(data.raw);
        setSkCached(!!data.cached);
      } else {
        setSkMsg(data.mensagem || "Não foi possível abrir o dossiê.");
      }
    } catch {
      setSkMsg("Falha ao abrir o dossiê.");
    } finally {
      setSkLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-[#0B2545] flex items-center justify-center flex-shrink-0">
          <RiSearchEyeLine className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">BuscaImob</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Qualificação e enriquecimento de leads. Escolha a fonte, cole o dado e pesquise.
          </p>
        </div>
      </div>

      {/* Tabs de fonte */}
      <div className="flex gap-2">
        {(["seekloc", "ph3a", "historico"] as View[]).map((s) => (
          <button
            key={s}
            onClick={() => setSource(s)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
              source === s
                ? "bg-[#0B2545] text-white border-[#0B2545]"
                : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-[#0B2545]"
            }`}
          >
            {s === "seekloc" ? "Tier Basic" : s === "ph3a" ? "Tier Plus" : "Histórico"}
            {s === "ph3a" && phConfigured === false && (
              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">configurar</span>
            )}
          </button>
        ))}
      </div>

      {/* ---------------- SEEKLOC ---------------- */}
      {source === "seekloc" && (
        <div className="space-y-5">
          <div className={`${card} p-5`}>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Buscar por</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {SEEKLOC_TIPOS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => { setSkTipo(t.value); setSkFields({}); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    skTipo === t.value
                      ? "bg-[#0B2545]/10 text-[#0B2545] border-[#0B2545]/30 dark:text-blue-300"
                      : "bg-neutral-50 dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {skTipoDef.fields.map((f) => (
                <div key={f.key} className={widthClass(f.width)}>
                  <label className="block text-xs text-neutral-500 mb-1">{f.label}</label>
                  <input
                    className={input}
                    placeholder={f.placeholder}
                    value={skFields[f.key] || ""}
                    onChange={(e) => setSkFields((p) => ({ ...p, [f.key]: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === "Enter") runSeeklocSearch(); }}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={runSeeklocSearch}
              disabled={skLoading}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B2545] text-white text-sm font-semibold hover:bg-[#162d49] disabled:opacity-60"
            >
              {skLoading ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiSearchEyeLine className="w-4 h-4" />}
              Pesquisar no Tier Basic
            </button>
          </div>

          {skMsg && (
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
              <RiInformationLine className="w-4 h-4" /> {skMsg}
            </div>
          )}

          {/* Lista de candidatos — linha inteira clicável abre o dossiê */}
          {skHits.length > 0 && (
            <div className={`${card} divide-y divide-neutral-100 dark:divide-neutral-800`}>
              {skHits.length > 1 && (
                <p className="px-4 py-2 text-xs text-neutral-500">
                  {skHits.length} resultados — clique em um nome para abrir o dossiê.
                </p>
              )}
              {skHits.map((h) => (
                <button
                  key={h.id + h.doc}
                  onClick={() => loadDetail(h)}
                  disabled={detailLoading === h.id}
                  className="w-full text-left flex items-center justify-between gap-3 p-4 hover:bg-[#0B2545]/5 dark:hover:bg-white/5 transition-colors disabled:opacity-60"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-neutral-900 dark:text-white truncate">{h.nome || "—"}</p>
                    <p className="text-xs text-neutral-500">Doc: {h.doc} · ID: {h.id}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B2545]/10 text-[#0B2545] dark:text-blue-300 text-xs font-semibold flex-shrink-0">
                    {detailLoading === h.id ? <RiLoader4Line className="w-3.5 h-3.5 animate-spin" /> : <RiArrowRightLine className="w-3.5 h-3.5" />}
                    Ver dossiê
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Dossiê */}
          {dossie && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {skCached && <CacheBadge />}
                <PdfButton source="seekloc" nome={dossie.nome} documento={dossie.doc} dossie={dossie} />
              </div>
              <Dossie d={dossie} raw={raw} rawOpen={rawOpen} setRawOpen={setRawOpen} onDrill={seeklocDrill} />
            </div>
          )}
        </div>
      )}

      {/* ---------------- PH3A ---------------- */}
      {source === "ph3a" && (
        <div className="space-y-5">
          {phConfigured === false && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-sm">
              <RiAlertLine className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Tier Plus ainda não configurado</p>
                <p>Configure a chave do provedor no servidor. A busca abaixo funcionará assim que a chave estiver ativa.</p>
              </div>
            </div>
          )}

          <div className={`${card} p-5 space-y-5`}>
            {/* Tipo de pessoa */}
            <div>
              <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Tipo de pessoa</label>
              <div className="flex gap-2">
                {[{ v: "", l: "Ambos" }, { v: "0", l: "Pessoa física" }, { v: "1", l: "Pessoa jurídica" }].map((o) => (
                  <button
                    key={o.v}
                    onClick={() => setPhPersonType(o.v)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      phPersonType === o.v
                        ? "bg-[#0B2545] text-white border-[#0B2545]"
                        : "bg-neutral-50 dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800"
                    }`}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Grupos de campos (igual ao site da PH3A) */}
            {PH3A_FORM.map((g) => (
              <div key={g.grupo}>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">{g.grupo}</label>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                  {g.fields.map((f) => (
                    <div key={f.key} className={ph3aWidth(f.width)}>
                      <label className="block text-xs text-neutral-500 mb-1">{f.label}</label>
                      <input
                        className={input}
                        placeholder={f.placeholder}
                        value={phFields[f.key] || ""}
                        onChange={(e) => setPhFields((p) => ({ ...p, [f.key]: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === "Enter") runPh3aSearch(); }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex items-center gap-3">
              <button
                onClick={runPh3aSearch}
                disabled={phLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B2545] text-white text-sm font-semibold hover:bg-[#162d49] disabled:opacity-60"
              >
                {phLoading ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiUserSearchLine className="w-4 h-4" />}
                Pesquisar no Tier Plus
              </button>
              <button
                onClick={() => { setPhFields({}); setPhPersonType(""); setPhCands(null); setPhResult(null); setPhMsg(null); }}
                className="text-xs text-neutral-500 hover:text-[#0B2545] dark:hover:text-blue-300"
              >
                Limpar
              </button>
              <span className="text-xs text-neutral-400">Dica: só o CPF/CNPJ abre o dossiê direto; combine campos para refinar a lista.</span>
            </div>
          </div>

          {/* Mensagem / não encontrado */}
          {phMsg && (
            <div className={`${card} p-5`}>
              <div className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                <RiInformationLine className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{phMsg}</span>
              </div>
            </div>
          )}

          {/* Lista de candidatos (busca por nome/telefone/e-mail) com prévia */}
          {phCands && phCands.length > 0 && !phResult && (
            <div className={`${card} divide-y divide-neutral-100 dark:divide-neutral-800`}>
              <p className="px-4 py-2 text-xs text-neutral-500">
                {phCands.length} possível(is) resultado(s) — clique para abrir o dossiê completo.
              </p>
              {phCands.map((c) => (
                <button
                  key={c.sequentialId}
                  onClick={() => ph3aOpenCandidate(c.sequentialId)}
                  disabled={phDetailLoading === c.sequentialId}
                  className="w-full text-left flex items-center justify-between gap-3 p-4 hover:bg-[#0B2545]/5 dark:hover:bg-white/5 transition-colors disabled:opacity-60"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-neutral-900 dark:text-white truncate">
                      {c.nome}
                      {c.blacklist && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">lista restritiva</span>}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {[c.documentoMasc, c.idade != null ? `${c.idade} anos` : null, c.local, c.mae ? `mãe: ${c.mae}` : null].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B2545]/10 text-[#0B2545] dark:text-blue-300 text-xs font-semibold flex-shrink-0">
                    {phDetailLoading === c.sequentialId ? <RiLoader4Line className="w-3.5 h-3.5 animate-spin" /> : <RiArrowRightLine className="w-3.5 h-3.5" />}
                    Ver dossiê
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Dossiê PH3A */}
          {phResult && (
            phResult.ok && phResult.dossie ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {phResult.cached && <CacheBadge />}
                  <PdfButton source="ph3a" nome={phResult.dossie.nome} documento={phResult.dossie.documento} dossie={phResult.dossie} />
                  {phCands && phCands.length > 0 && (
                    <button onClick={() => setPhResult(null)} className="text-xs text-neutral-500 hover:text-[#0B2545] dark:hover:text-blue-300">← voltar aos resultados</button>
                  )}
                </div>
                <Ph3aDossie d={phResult.dossie} raw={phResult.raw} rawOpen={rawOpen} setRawOpen={setRawOpen} onName={(nome: string) => { setPhFields({ Name: nome }); setPhPersonType(""); setPhResult(null); setPhCands(null); }} />
              </div>
            ) : (
              <div className={`${card} p-5`}>
                <div className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                  <RiInformationLine className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{phResult.mensagem || "Sem resultados."}</span>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* ---------------- HISTÓRICO ---------------- */}
      {source === "historico" && <Historico />}
    </div>
  );
}

// ───────────────────────────── Cache badge ─────────────────────────────

function CacheBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs font-medium">
      <RiFileCopyLine className="w-3.5 h-3.5" /> Resultado em cache — sem nova cobrança
    </div>
  );
}

// Atalho para salvar o dossiê em PDF (nome: BuscaImob_NomeDoPesquisado).
function PdfButton({ source, nome, documento, dossie }: { source: string; nome?: string; documento?: string; dossie: any }) {
  const [loading, setLoading] = useState(false);
  async function salvar() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tappy-iq/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, nome, documento, dossie }),
      });
      if (!res.ok) { alert("Falha ao gerar o PDF."); return; }
      const blob = await res.blob();
      const safe = (nome || "Dossie").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w]+/g, "_").replace(/^_+|_+$/g, "") || "Dossie";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `BuscaImob_${safe}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert("Falha ao gerar o PDF.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <button
      onClick={salvar}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B2545] text-white text-xs font-semibold hover:bg-[#162d49] disabled:opacity-60"
    >
      {loading ? <RiLoader4Line className="w-3.5 h-3.5 animate-spin" /> : <RiFilePdf2Line className="w-3.5 h-3.5" />}
      Salvar em PDF
    </button>
  );
}

// ───────────────────────────── Histórico ─────────────────────────────

function Historico() {
  const [rows, setRows] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<{ userId: string; userName: string }[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [fUser, setFUser] = useState("");
  const [fSource, setFSource] = useState("");
  const [sel, setSel] = useState<any | null>(null);
  const [selLoading, setSelLoading] = useState<string | null>(null);
  const [selRawOpen, setSelRawOpen] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      if (q.trim()) sp.set("q", q.trim());
      if (fUser) sp.set("userId", fUser);
      if (fSource) sp.set("source", fSource);
      const res = await fetch(`/api/admin/tappy-iq/historico?${sp.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setRows(data.rows || []);
        setUsuarios(data.usuarios || []);
        setIsAdmin(!!data.isAdmin);
      }
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [fUser, fSource]);

  async function abrir(row: any) {
    setSelLoading(row.id);
    setSel(null);
    setSelRawOpen(false);
    try {
      const res = await fetch(`/api/admin/tappy-iq/historico/${row.id}`);
      const data = await res.json();
      if (res.ok) setSel({ ...data, row });
    } catch {
      /* noop */
    } finally {
      setSelLoading(null);
    }
  }

  const fmtDate = (d: string) =>
    new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const dossie = sel?.resultado?.dossie;

  return (
    <div className="space-y-5">
      {/* Filtros */}
      <div className={`${card} p-5`}>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs text-neutral-500 mb-1">Buscar por nome ou documento</label>
            <input
              className={input}
              placeholder="Digite e tecle Enter"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") load(); }}
            />
          </div>
          {isAdmin && (
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Usuário</label>
              <select className={input} value={fUser} onChange={(e) => setFUser(e.target.value)}>
                <option value="">Todos</option>
                {usuarios.map((u) => (
                  <option key={u.userId} value={u.userId}>{u.userName || u.userId}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Fonte</label>
            <select className={input} value={fSource} onChange={(e) => setFSource(e.target.value)}>
              <option value="">Todas</option>
              <option value="seekloc">Tier Basic</option>
              <option value="ph3a">Tier Plus</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista do histórico */}
      <div className={`${card} divide-y divide-neutral-100 dark:divide-neutral-800`}>
        {loading ? (
          <p className="p-5 text-sm text-neutral-500 flex items-center gap-2"><RiLoader4Line className="w-4 h-4 animate-spin" /> Carregando…</p>
        ) : rows.length === 0 ? (
          <p className="p-5 text-sm text-neutral-500">Nenhuma pesquisa registrada ainda.</p>
        ) : (
          rows.map((r) => (
            <button
              key={r.id}
              onClick={() => abrir(r)}
              disabled={selLoading === r.id}
              className="w-full text-left flex items-center justify-between gap-3 p-4 hover:bg-[#0B2545]/5 dark:hover:bg-white/5 transition-colors disabled:opacity-60"
            >
              <div className="min-w-0">
                <p className="font-medium text-neutral-900 dark:text-white truncate">{r.nome || r.documento || "—"}</p>
                <p className="text-xs text-neutral-500">
                  {r.documento ? `Doc: ${r.documento} · ` : ""}{fmtDate(r.createdAt)}
                  {isAdmin && r.userName ? ` · ${r.userName}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${r.source === "ph3a" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"}`}>
                  {r.source === "ph3a" ? "Tier Plus" : "Tier Basic"}
                </span>
                {selLoading === r.id ? <RiLoader4Line className="w-3.5 h-3.5 animate-spin" /> : <RiArrowRightLine className="w-3.5 h-3.5 text-neutral-400" />}
              </div>
            </button>
          ))
        )}
      </div>

      {/* Dossiê reaberto do cache (sem nova cobrança) */}
      {sel && dossie && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <CacheBadge />
            <PdfButton source={sel.source} nome={dossie.nome} documento={dossie.documento || dossie.doc} dossie={dossie} />
          </div>
          {sel.source === "ph3a" ? (
            <Ph3aDossie d={dossie} raw={sel.resultado?.raw} rawOpen={selRawOpen} setRawOpen={setSelRawOpen} />
          ) : (
            <Dossie d={dossie} raw={sel.resultado?.raw} rawOpen={selRawOpen} setRawOpen={setSelRawOpen} />
          )}
        </div>
      )}
    </div>
  );
}

// ───────────────────────────── Dossiê (Seekloc) ─────────────────────────────

function Section({ icon: Icon, title, count, children }: any) {
  if (count === 0) return null;
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-[#0B2545] dark:text-blue-300" />
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">{title}</h3>
        {count != null && <span className="text-xs text-neutral-400">({count})</span>}
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 py-1 text-sm border-b border-neutral-50 dark:border-neutral-800/50 last:border-0">
      <span className="text-neutral-500 min-w-[130px]">{label}</span>
      <span className="text-neutral-900 dark:text-white font-medium">{value}</span>
    </div>
  );
}

// Nome clicável → abre o dossiê da pessoa (drill ficha→ficha).
function NameLink({ nome, cpf, extra, onDrill }: { nome?: string; cpf?: string; extra?: string; onDrill?: (doc?: string, nome?: string) => void }) {
  const label = [nome, cpf, extra].filter(Boolean).join(" · ");
  if (!nome && !cpf) return null;
  if (!onDrill || (!cpf && !nome)) return <span className="text-neutral-700 dark:text-neutral-300">• {label}</span>;
  return (
    <button
      onClick={() => onDrill(cpf, nome)}
      title="Acessar dossiê desta pessoa"
      className="group inline-flex items-center gap-1 text-left text-[#0B2545] dark:text-blue-300 hover:underline"
    >
      • {label}
      <RiArrowRightLine className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}

function Dossie({ d, raw, rawOpen, setRawOpen, onDrill }: any) {
  const endereco = (e: any) =>
    [e.logradouro, e.numero, e.complemento, e.bairro, e.cidade, e.uf, e.cep].filter(Boolean).join(", ");

  return (
    <div className="space-y-4">
      <Section icon={RiUserSearchLine} title="Dados principais">
        <div className="grid sm:grid-cols-2 gap-x-6">
          <Row label="Nome" value={d.nome} />
          <Row label="Documento" value={d.doc} />
          <div className="flex gap-2 py-1 text-sm border-b border-neutral-50 dark:border-neutral-800/50">
            <span className="text-neutral-500 min-w-[130px]">Mãe</span>
            {d.mae ? <NameLink nome={d.mae} onDrill={onDrill} /> : <span className="text-neutral-400">—</span>}
          </div>
          <Row label="Sexo" value={d.sexo} />
          <Row label="Nasc./Abertura" value={d.nascimentoAbertura} />
          <Row label="Óbito" value={d.obito} />
          <Row label="Nome fantasia" value={d.fantasia} />
          <Row label="Situação" value={d.situacao} />
          <Row label="Atividade principal" value={d.atividadePrincipal} />
          <Row label="Natureza" value={d.natureza} />
        </div>
      </Section>

      <Section icon={RiPhoneLine} title="Telefones" count={d.telefones?.length || 0}>
        <div className="flex flex-wrap gap-2">
          {d.telefones?.map((t: any, i: number) => (
            <span key={i} className="px-3 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-sm">
              ({t.ddd}) {t.fone} <span className="text-xs text-neutral-400">{t.tipo}</span>
            </span>
          ))}
        </div>
      </Section>

      <Section icon={RiMailLine} title="E-mails" count={d.emails?.length || 0}>
        <div className="flex flex-wrap gap-2">
          {d.emails?.map((e: string, i: number) => (
            <span key={i} className="px-3 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-sm">{e}</span>
          ))}
        </div>
      </Section>

      <Section icon={RiMapPinLine} title="Endereços" count={d.enderecos?.length || 0}>
        <ul className="space-y-1.5 text-sm">
          {d.enderecos?.map((e: any, i: number) => (
            <li key={i} className="text-neutral-700 dark:text-neutral-300">• {endereco(e)}</li>
          ))}
        </ul>
      </Section>

      <Section icon={RiCarLine} title="Veículos" count={d.veiculos?.length || 0}>
        <ul className="space-y-1.5 text-sm">
          {d.veiculos?.map((v: any, i: number) => (
            <li key={i} className="text-neutral-700 dark:text-neutral-300">
              • {[v.modelo, v.placa, v.anofab && `${v.anofab}/${v.anomod || ""}`, v.combustivel].filter(Boolean).join(" · ")}
            </li>
          ))}
        </ul>
      </Section>

      <Section icon={RiBriefcaseLine} title="Empregos" count={d.empregos?.length || 0}>
        <ul className="space-y-1.5 text-sm">
          {d.empregos?.map((e: any, i: number) => (
            <li key={i} className="text-neutral-700 dark:text-neutral-300">
              • {[e.empresa, e.cnpj, e.admissao].filter(Boolean).join(" · ")}
            </li>
          ))}
        </ul>
      </Section>

      <Section icon={RiBuilding2Line} title="Quadro societário / participações" count={(d.societario?.length || 0) + (d.participacoes?.length || 0)}>
        <ul className="space-y-1.5 text-sm">
          {[...(d.societario || []), ...(d.participacoes || [])].map((s: any, i: number) => (
            <li key={i}>
              <NameLink nome={s.razaosocial} cpf={s.cnpj} extra={[s.qualificacao, s.particip].filter(Boolean).join(" · ")} onDrill={onDrill} />
            </li>
          ))}
        </ul>
      </Section>

      <Section icon={RiGroupLine} title="Parentes / irmãos / vizinhos" count={(d.parentes?.length || 0) + (d.irmaos?.length || 0) + (d.vizinhos?.length || 0)}>
        <p className="text-xs text-neutral-400 mb-2">Clique num nome para abrir o dossiê dele.</p>
        <ul className="space-y-1.5 text-sm">
          {[...(d.parentes || []), ...(d.irmaos || [])].map((p: any, i: number) => (
            <li key={"p" + i}><NameLink nome={p.nome} cpf={p.cpf} onDrill={onDrill} /></li>
          ))}
          {(d.vizinhos || []).map((p: any, i: number) => (
            <li key={"v" + i}><NameLink nome={p.nome} extra={[p.cidade, p.uf, "(vizinho)"].filter(Boolean).join(" · ")} onDrill={onDrill} /></li>
          ))}
        </ul>
      </Section>

      {raw && (
        <div>
          <button
            onClick={() => setRawOpen(!rawOpen)}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
          >
            <RiFileCopyLine className="w-3.5 h-3.5" /> {rawOpen ? "Ocultar" : "Ver"} dados brutos (JSON)
          </button>
          {rawOpen && (
            <pre className="mt-2 text-xs overflow-auto max-h-[400px] p-4 rounded-xl bg-neutral-950 text-neutral-300">
              {JSON.stringify(raw, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

// ───────────────────────────── Dossiê (PH3A) ─────────────────────────────

const brl = (v?: number) =>
  typeof v === "number" ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : undefined;

function Ph3aDossie({ d, raw, rawOpen, setRawOpen, onName }: any) {
  const ativos = (d.telefones || []).filter((t: any) => !t.historico);
  const histor = (d.telefones || []).filter((t: any) => t.historico);
  const temFin =
    d.rendaPessoal != null || d.rendaFamiliar != null || d.aposentadoria != null ||
    d.rendaEmpresarial != null || d.classePessoal || d.scoreD00 != null;

  return (
    <div className="space-y-4">
      {/* Cabeçalho do topo (igual ao PH3A) */}
      <div className="bg-[#0B2545] text-white rounded-2xl p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <h2 className="text-xl font-bold truncate">{d.nome}</h2>
            <p className="text-sm text-white/70">
              {[d.documento, d.idade != null ? `${d.idade} anos` : null, d.sexo].filter(Boolean).join(" · ")}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {d.scoreD00 != null && (
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wide text-white/60">Score</p>
                <p className="text-2xl font-bold leading-none">{d.scoreD00}</p>
              </div>
            )}
            {d.blacklist && <span className="text-xs px-2 py-1 rounded-full bg-red-500/90">Lista restritiva</span>}
            {(d.flags || []).map((f: string, i: number) => (
              <span key={i} className="text-xs px-2 py-1 rounded-full bg-white/15">{f}</span>
            ))}
          </div>
        </div>
      </div>

      <Section icon={RiUserSearchLine} title="Dados principais">
        <div className="grid sm:grid-cols-2 gap-x-6">
          <Row label="Nome" value={d.nome} />
          <Row label="Documento" value={d.documento} />
          <Row label="Nascimento" value={d.nascimento} />
          <Row label="Idade" value={d.idade != null ? `${d.idade} anos` : undefined} />
          <Row label="Sexo" value={d.sexo} />
          <Row label="Estado civil" value={d.estadoCivil} />
          <Row label="Escolaridade" value={d.escolaridade} />
          <Row label="Nº de dependentes" value={d.dependentes != null ? String(d.dependentes) : undefined} />
          <div className="flex gap-2 py-1 text-sm border-b border-neutral-50 dark:border-neutral-800/50">
            <span className="text-neutral-500 min-w-[130px]">Mãe</span>
            {d.mae ? (
              <button onClick={() => onName?.(d.mae)} title="Pesquisar a mãe por nome" className="text-[#0B2545] dark:text-blue-300 hover:underline text-left font-medium">
                {d.mae}
              </button>
            ) : <span className="text-neutral-400">—</span>}
          </div>
          <Row label="Pai" value={d.pai} />
        </div>
      </Section>

      {temFin && (
        <Section icon={RiBriefcaseLine} title="Financeiro & Score">
          <div className="grid sm:grid-cols-2 gap-x-6">
            <Row label="Renda pessoal" value={brl(d.rendaPessoal)} />
            <Row label="Renda familiar" value={brl(d.rendaFamiliar)} />
            <Row label="Renda presumida" value={brl(d.rendaPresumida)} />
            <Row label="Aposentadoria" value={brl(d.aposentadoria)} />
            <Row label="Renda empresarial" value={brl(d.rendaEmpresarial)} />
            <Row label="Classe social (pessoal)" value={d.classePessoal} />
            <Row label="Classe social (familiar)" value={d.classeFamiliar} />
          </div>
          {(d.scoreD00 != null || d.scoreD30 != null) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {[["D00", d.scoreD00], ["D30", d.scoreD30], ["D60", d.scoreD60], ["D90", d.scoreD90]].map(
                ([k, v]: any) => v != null && (
                  <span key={k} className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-sm">
                    <span className="text-xs text-neutral-400 mr-1">Score {k}</span><span className="font-semibold">{v}</span>
                  </span>
                )
              )}
            </div>
          )}
        </Section>
      )}

      <Section icon={RiPhoneLine} title="Telefones" count={d.telefones?.length || 0}>
        <div className="flex flex-wrap gap-2">
          {ativos.map((t: any, i: number) => (
            <span key={"a" + i} className="px-3 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-sm">
              {t.numero}
              {t.whatsapp && <span className="ml-1 text-xs text-green-600 dark:text-green-400">WhatsApp</span>}
              {t.operadora && <span className="ml-1 text-xs text-neutral-400">{t.operadora}</span>}
            </span>
          ))}
        </div>
        {histor.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-neutral-400 mb-1.5">Histórico ({histor.length})</p>
            <div className="flex flex-wrap gap-2">
              {histor.map((t: any, i: number) => (
                <span key={"h" + i} className="px-3 py-1 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 text-sm text-neutral-500">
                  {t.numero}
                  {t.whatsapp && <span className="ml-1 text-xs text-green-600 dark:text-green-400">WhatsApp</span>}
                  {t.operadora && <span className="ml-1 text-xs text-neutral-400">{t.operadora}</span>}
                </span>
              ))}
            </div>
          </div>
        )}
      </Section>

      <Section icon={RiMailLine} title="E-mails" count={d.emails?.length || 0}>
        <div className="flex flex-wrap gap-2">
          {d.emails?.map((e: any, i: number) => (
            <span key={i} className="px-3 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-sm">
              {e.email}
              {e.validado && <span className="ml-1 text-xs text-green-600 dark:text-green-400">✓</span>}
            </span>
          ))}
        </div>
      </Section>

      <Section icon={RiMapPinLine} title="Endereços" count={d.enderecos?.length || 0}>
        <ul className="space-y-1.5 text-sm">
          {d.enderecos?.map((e: any, i: number) => (
            <li key={i} className="text-neutral-700 dark:text-neutral-300">
              • {[e.endereco, e.cidade && `${e.cidade}${e.uf ? "/" + e.uf : ""}`, e.cep && `CEP ${e.cep}`].filter(Boolean).join(" — ")}
            </li>
          ))}
        </ul>
      </Section>

      {raw && (
        <div>
          <button
            onClick={() => setRawOpen(!rawOpen)}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
          >
            <RiFileCopyLine className="w-3.5 h-3.5" /> {rawOpen ? "Ocultar" : "Ver"} dados brutos (JSON)
          </button>
          {rawOpen && (
            <pre className="mt-2 text-xs overflow-auto max-h-[400px] p-4 rounded-xl bg-neutral-950 text-neutral-300">
              {JSON.stringify(raw, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
