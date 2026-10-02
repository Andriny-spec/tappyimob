"use client";

import { useState, useRef } from "react";
import {
  RiAddLine, RiDeleteBinLine, RiUploadLine, RiLoader4Line,
  RiCheckLine, RiUserLine, RiBuilding4Line,
} from "react-icons/ri";
import { useWizard, Parte } from "./WizardContext";

const ESTADOS_CIVIS = ["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)", "União estável"];
const REGIMES_BENS = ["Comunhão parcial de bens", "Comunhão universal de bens", "Separação total de bens", "Participação final nos aquestos"];

type DocStatus = "pendente" | "enviado" | "processando" | "validado";

interface DocInfo {
  tipo: string;
  label: string;
  status: DocStatus;
}

function getDocsIniciais(tipo: "VENDEDOR" | "COMPRADOR"): DocInfo[] {
  const base: DocInfo[] = [
    { tipo: "RG_CNH", label: "RG ou CNH", status: "pendente" },
    { tipo: "CERTIDAO_CIVIL", label: "Certidão de estado civil", status: "pendente" },
    { tipo: "COMPROVANTE_ENDERECO", label: "Comprovante de endereço", status: "pendente" },
  ];
  return base;
}

interface ParteCardProps {
  parte: Parte;
  index: number;
  tipo: "VENDEDOR" | "COMPRADOR";
  negocioId: string;
  onUpdate: (data: Partial<Parte>) => void;
  onRemove: () => void;
  canRemove: boolean;
}

function ParteCard({ parte, index, tipo, negocioId, onUpdate, onRemove, canRemove }: ParteCardProps) {
  const [docs, setDocs] = useState<DocInfo[]>(getDocsIniciais(tipo));
  const [camposExtraidos, setCamposExtraidos] = useState<Set<string>>(new Set());
  const [regimeBloqueado, setRegimeBloqueado] = useState(false);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const upd = (key: keyof Parte, value: any) => onUpdate({ [key]: value });

  const buscarCep = async (cep: string) => {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (!data.erro) onUpdate({ logradouro: data.logradouro, cidade: data.localidade, uf: data.uf });
    } catch {}
  };

  const uploadDoc = async (docTipo: string, file: File) => {
    setDocs((prev) => prev.map((d) => d.tipo === docTipo ? { ...d, status: "enviado" } : d));
    const formData = new FormData();
    formData.append("file", file);
    formData.append("tipo", docTipo);
    if (parte.id) formData.append("parteId", parte.id);

    const uploadRes = await fetch(`/api/admin/negocio/${negocioId}/documentos`, {
      method: "POST", body: formData,
    });
    if (!uploadRes.ok) { setDocs((prev) => prev.map((d) => d.tipo === docTipo ? { ...d, status: "pendente" } : d)); return; }

    const doc = await uploadRes.json();
    setDocs((prev) => prev.map((d) => d.tipo === docTipo ? { ...d, status: "processando" } : d));

    const extRes = await fetch(`/api/admin/negocio/${negocioId}/documentos/${doc.id}/extrair`, { method: "POST" });
    if (extRes.status === 422) {
      const errData = await extRes.json();
      setDocs((prev) => prev.map((d) => d.tipo === docTipo ? { ...d, status: "enviado" } : d));
      alert(errData.error || "PDF sem texto: converta para JPG/PNG e reenvie.");
      return;
    }
    if (!extRes.ok) { setDocs((prev) => prev.map((d) => d.tipo === docTipo ? { ...d, status: "enviado" } : d)); return; }

    const { dadosExtraidos } = await extRes.json();
    const extraidos = new Set(camposExtraidos);

    if (docTipo === "RG_CNH" && dadosExtraidos) {
      const upds: Partial<Parte> = {};
      if (dadosExtraidos.nome) { upds.nome = dadosExtraidos.nome; extraidos.add("nome"); }
      if (dadosExtraidos.cpf) { upds.cpf = dadosExtraidos.cpf; extraidos.add("cpf"); }
      if (dadosExtraidos.nascimento) { upds.nascimento = dadosExtraidos.nascimento; extraidos.add("nascimento"); }
      if (dadosExtraidos.filiacaoMae) { upds.filiacaoMae = dadosExtraidos.filiacaoMae; extraidos.add("filiacaoMae"); }
      if (dadosExtraidos.filiacaoPai) { upds.filiacaoPai = dadosExtraidos.filiacaoPai; extraidos.add("filiacaoPai"); }
      onUpdate(upds);
    }
    if (docTipo === "CERTIDAO_CIVIL" && dadosExtraidos) {
      const upds: Partial<Parte> = {};
      if (dadosExtraidos.estadoCivil) { upds.estadoCivil = dadosExtraidos.estadoCivil; extraidos.add("estadoCivil"); }
      if (dadosExtraidos.regimeBens) {
        upds.regimeBens = dadosExtraidos.regimeBens;
        extraidos.add("regimeBens");
        setRegimeBloqueado(true); // Regime de bens é somente leitura quando extraído da certidão
      }
      if (dadosExtraidos.conjuge) { upds.conjuge = dadosExtraidos.conjuge; extraidos.add("conjuge"); }
      onUpdate(upds);
    }
    if (docTipo === "COMPROVANTE_ENDERECO" && dadosExtraidos) {
      const upds: Partial<Parte> = {};
      if (dadosExtraidos.cep) { upds.cep = dadosExtraidos.cep; extraidos.add("cep"); }
      if (dadosExtraidos.logradouro) { upds.logradouro = dadosExtraidos.logradouro; extraidos.add("logradouro"); }
      if (dadosExtraidos.numero) { upds.numero = dadosExtraidos.numero; extraidos.add("numero"); }
      if (dadosExtraidos.cidade) { upds.cidade = dadosExtraidos.cidade; extraidos.add("cidade"); }
      if (dadosExtraidos.uf) { upds.uf = dadosExtraidos.uf; extraidos.add("uf"); }
      onUpdate(upds);
    }

    setCamposExtraidos(extraidos);
    // Confirmar automaticamente
    const confirmarBody = { campos: Object.fromEntries(Object.entries(dadosExtraidos || {}).map(([k, v]) => [k, { valor: v, corrigido: false }])) };
    await fetch(`/api/admin/negocio/${negocioId}/documentos/${doc.id}/confirmar`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(confirmarBody),
    });
    setDocs((prev) => prev.map((d) => d.tipo === docTipo ? { ...d, status: "validado" } : d));
  };

  const isCasadoOuUniao = parte.estadoCivil === "Casado(a)" || parte.estadoCivil === "União estável";

  const campo = (label: string, key: keyof Parte, opts?: { placeholder?: string; type?: string; readOnly?: boolean }) => {
    const extraido = camposExtraidos.has(key as string);
    return (
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
        <input
          type={opts?.type || "text"}
          value={(parte[key] as string) || ""}
          onChange={(e) => upd(key, e.target.value)}
          placeholder={opts?.placeholder}
          readOnly={opts?.readOnly}
          className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            opts?.readOnly ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""
          } ${extraido && !opts?.readOnly ? "bg-amber-50 border-amber-300" : "border-gray-300"}`}
        />
      </div>
    );
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className={`px-4 py-3 flex items-center justify-between ${tipo === "VENDEDOR" ? "bg-purple-600" : "bg-green-600"}`}>
        <span className="text-sm font-medium text-white">
          {tipo === "VENDEDOR" ? "Vendedor" : "Comprador"} {index + 1}
        </span>
        {canRemove && (
          <button onClick={onRemove} className="text-white/70 hover:text-white">
            <RiDeleteBinLine className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-0">
        {/* Campos */}
        <div className="p-4 space-y-4">
          {/* Toggles PF / PJ / Procuração */}
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => upd("isPessoaJuridica", false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors ${
                !parte.isPessoaJuridica ? "bg-blue-600 border-blue-600 text-white" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
              <RiUserLine className="w-3.5 h-3.5" />
              Pessoa Física
            </button>
            <button onClick={() => upd("isPessoaJuridica", true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors ${
                parte.isPessoaJuridica ? "bg-blue-600 border-blue-600 text-white" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
              <RiBuilding4Line className="w-3.5 h-3.5" />
              Pessoa Jurídica
            </button>
            <button onClick={() => upd("temProcuracao", !parte.temProcuracao)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors ${
                parte.temProcuracao ? "bg-amber-50 border-amber-400 text-amber-700" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
              <RiUserLine className="w-3.5 h-3.5" />
              Procuração
            </button>
            {tipo === "COMPRADOR" && (
              <>
                <button onClick={() => upd("usaFgts", !parte.usaFgts)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors ${
                    parte.usaFgts ? "bg-blue-50 border-blue-400 text-blue-700" : "border-gray-200 text-gray-500"}`}>
                  FGTS
                </button>
                <button onClick={() => upd("isEstrangeiro", !parte.isEstrangeiro)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors ${
                    parte.isEstrangeiro ? "bg-amber-50 border-amber-400 text-amber-700" : "border-gray-200 text-gray-500"}`}>
                  Estrangeiro
                </button>
              </>
            )}
          </div>

          {parte.isEstrangeiro && tipo === "COMPRADOR" && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
              ⚠ Comprador estrangeiro — verificação de RNE e restrições SPU será registrada para revisão jurídica.
            </div>
          )}

          {/* Grupo 1 — Identificação */}
          {!parte.isPessoaJuridica ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Identificação</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">{campo("Nome completo", "nome", { placeholder: "Nome conforme documento" })}</div>
                {campo("CPF (somente números)", "cpf", { placeholder: "00000000000" })}
                {campo("Data de nascimento", "nascimento", { type: "date" })}
                {campo("RG", "rg", { placeholder: "Número do RG" })}
                {campo("Data de expedição do RG", "rgExpedicao", { type: "date" })}
                {campo("Filiação — mãe", "filiacaoMae", { placeholder: "Nome da mãe" })}
                {campo("Filiação — pai", "filiacaoPai", { placeholder: "Nome do pai" })}
                {campo("Nacionalidade", "nacionalidade", { placeholder: "brasileiro(a)" })}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pessoa Jurídica</p>
              <div className="grid grid-cols-2 gap-3">
                {campo("CNPJ (somente números)", "cnpj", { placeholder: "00000000000000" })}
                <div className="col-span-2">{campo("Razão social", "razaoSocial")}</div>
                {campo("Nome do representante legal", "representanteNome")}
                {campo("CPF do representante", "representanteCpf", { placeholder: "00000000000" })}
              </div>
            </div>
          )}

          {/* Grupo 2 — Estado civil (só PF) */}
          {!parte.isPessoaJuridica && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado Civil</p>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Estado civil</label>
                <select value={parte.estadoCivil || ""} onChange={(e) => upd("estadoCivil", e.target.value)}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${camposExtraidos.has("estadoCivil") ? "bg-amber-50 border-amber-300" : "border-gray-300"}`}>
                  <option value="">Selecione</option>
                  {ESTADOS_CIVIS.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              {isCasadoOuUniao && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Regime de bens
                      {regimeBloqueado && <span className="ml-1 text-orange-500 font-normal text-xs">(extraído da certidão — somente leitura)</span>}
                    </label>
                    <select value={parte.regimeBens || ""} onChange={(e) => !regimeBloqueado && upd("regimeBens", e.target.value)}
                      disabled={regimeBloqueado}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none ${regimeBloqueado ? "bg-gray-100 cursor-not-allowed text-gray-500 border-gray-200" : "border-gray-300"}`}>
                      <option value="">Selecione</option>
                      {REGIMES_BENS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  {campo("Nome do cônjuge/companheiro", "conjuge", { placeholder: "Nome completo" })}
                </>
              )}
            </div>
          )}

          {/* Grupo 3 — Endereço */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Endereço</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">CEP</label>
                <input type="text" value={parte.cep || ""} onChange={(e) => upd("cep", e.target.value)}
                  onBlur={(e) => buscarCep(e.target.value)} placeholder="00000-000"
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none ${camposExtraidos.has("cep") ? "bg-amber-50 border-amber-300" : "border-gray-300"}`} />
              </div>
              <div className="col-span-2">{campo("Logradouro", "logradouro")}</div>
              {campo("Número", "numero")}
              {campo("Complemento", "complemento")}
              {campo("Cidade", "cidade")}
              {campo("UF", "uf")}
            </div>
          </div>

          {/* Grupo 4 — Contato e bancários */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contato e dados bancários</p>
            <div className="grid grid-cols-2 gap-3">
              {campo("Profissão", "profissao")}
              {campo("E-mail", "email", { type: "email" })}
              {campo("Telefone", "telefone", { placeholder: "(11) 99999-9999" })}
              {campo("Banco", "banco")}
              {campo("Agência", "agencia")}
              {campo("Conta", "conta")}
              <div className="col-span-2">{campo("PIX", "pix")}</div>
            </div>
          </div>

          {/* Procuração */}
          {parte.temProcuracao && (
            <div className="space-y-3 pl-4 border-l-2 border-blue-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Procurador</p>
              <div className="grid grid-cols-2 gap-3">
                {campo("Nome do procurador", "procuradorNome")}
                {campo("CPF do procurador", "procuradorCpf", { placeholder: "00000000000" })}
              </div>
            </div>
          )}

          {/* FGTS — comprador */}
          {tipo === "COMPRADOR" && parte.usaFgts && (
            <div className="space-y-3 pl-4 border-l-2 border-blue-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">FGTS</p>
              <div className="grid grid-cols-2 gap-3">
                {campo("Número da conta FGTS", "fgtsConta")}
                {campo("Banco operador", "fgtsBanco")}
              </div>
            </div>
          )}
        </div>

        {/* Documentos */}
        <div className="border-l border-gray-100 p-4">
          <h4 className="text-xs font-semibold text-gray-600 mb-3">Documentos</h4>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className={`px-3 py-2 ${tipo === "VENDEDOR" ? "bg-purple-600" : "bg-green-600"}`}>
              <p className="text-xs font-medium text-white">Documentos — {tipo === "VENDEDOR" ? "Vendedor" : "Comprador"} {index + 1}</p>
            </div>
            <div className="divide-y divide-gray-100">
              {docs.map((doc) => (
                <div key={doc.tipo} className="flex items-center gap-2 px-3 py-2.5">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    doc.status === "validado" ? "bg-green-500" :
                    doc.status === "processando" ? "bg-yellow-400 animate-pulse" :
                    doc.status === "enviado" ? "bg-blue-400" : "bg-gray-300"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">{doc.label}</p>
                    <p className="text-xs text-gray-400">
                      {doc.status === "processando" ? <span className="flex items-center gap-1"><RiLoader4Line className="w-3 h-3 animate-spin" />Extraindo...</span> :
                        doc.status === "validado" ? "Validado" :
                        doc.status === "enviado" ? "Enviado" : "Pendente"}
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
              {parte.isPessoaJuridica && (
                <>
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <div className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />
                    <p className="flex-1 text-xs text-gray-600">Contrato social</p>
                    <span className="text-xs text-gray-400">[Anexar]</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <div className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />
                    <p className="flex-1 text-xs text-gray-600">Ata de eleição de diretores</p>
                    <span className="text-xs text-gray-400">[Anexar]</span>
                  </div>
                </>
              )}
              {parte.temProcuracao && (
                <div className="flex items-center gap-2 px-3 py-2.5">
                  <div className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />
                  <p className="flex-1 text-xs text-gray-600">Procuração</p>
                  <span className="text-xs text-gray-400">[Anexar]</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WizardEtapaParte({ tipo }: { tipo: "VENDEDOR" | "COMPRADOR" }) {
  const { state, dispatch } = useWizard();
  const partes = tipo === "VENDEDOR" ? state.vendedores : state.compradores;

  const addParte = () => dispatch({ type: tipo === "VENDEDOR" ? "ADD_VENDEDOR" : "ADD_COMPRADOR" });
  const removeParte = (id: string) => dispatch({ type: tipo === "VENDEDOR" ? "REMOVE_VENDEDOR" : "REMOVE_COMPRADOR", payload: id });
  const updateParte = (id: string, data: Partial<Parte>) =>
    dispatch({ type: tipo === "VENDEDOR" ? "UPDATE_VENDEDOR" : "UPDATE_COMPRADOR", payload: { id, data } });

  return (
    <div className="pb-24 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">{tipo === "VENDEDOR" ? "Vendedor(es)" : "Comprador(es)"}</h2>
        <button onClick={addParte}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">
          <RiAddLine className="w-3.5 h-3.5" />
          Adicionar {tipo === "VENDEDOR" ? "vendedor" : "comprador"}
        </button>
      </div>

      {partes.map((parte, idx) => (
        <ParteCard
          key={parte.id}
          parte={parte}
          index={idx}
          tipo={tipo}
          negocioId={state.negocioId!}
          onUpdate={(data) => updateParte(parte.id, data)}
          onRemove={() => removeParte(parte.id)}
          canRemove={partes.length > 1}
        />
      ))}
    </div>
  );
}
