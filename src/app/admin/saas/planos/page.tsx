"use client";

import { useCallback, useEffect, useState } from "react";
import {
  RiAddLine,
  RiArrowDownLine,
  RiArrowUpLine,
  RiCheckLine,
  RiDeleteBinLine,
  RiEditLine,
  RiEyeOffLine,
  RiPriceTag3Line,
  RiSparkling2Fill,
  RiUserLine,
} from "react-icons/ri";
import {
  Alternar,
  Botao,
  Cabecalho,
  Campo,
  Carregando,
  Modal,
  Vazio,
  chamar,
  estiloInput,
  moeda,
  type Plano,
} from "@/components/admin/saas/ui";

type Form = {
  id?: string;
  nome: string;
  chamada: string;
  descricao: string;
  precoMensal: string;
  precoAnual: string;
  limiteUsuarios: string;
  limiteImoveis: string;
  limiteWhatsapp: string;
  limiteStorageGb: string;
  trialDias: string;
  recursos: string;
  destaque: boolean;
  ativo: boolean;
};

const VAZIO: Form = {
  nome: "",
  chamada: "",
  descricao: "",
  precoMensal: "",
  precoAnual: "",
  limiteUsuarios: "",
  limiteImoveis: "",
  limiteWhatsapp: "",
  limiteStorageGb: "",
  trialDias: "14",
  recursos: "",
  destaque: false,
  ativo: true,
};

const paraForm = (p: Plano): Form => ({
  id: p.id,
  nome: p.nome,
  chamada: p.chamada || "",
  descricao: p.descricao || "",
  precoMensal: String(p.precoMensal),
  precoAnual: String(p.precoAnual),
  limiteUsuarios: p.limiteUsuarios?.toString() ?? "",
  limiteImoveis: p.limiteImoveis?.toString() ?? "",
  limiteWhatsapp: p.limiteWhatsapp?.toString() ?? "",
  limiteStorageGb: p.limiteStorageGb?.toString() ?? "",
  trialDias: String(p.trialDias),
  recursos: p.recursos.join("\n"),
  destaque: p.destaque,
  ativo: p.ativo,
});

// Campo vazio = ilimitado
const limite = (v: string) => (v.trim() === "" ? null : Math.max(0, Math.round(Number(v))));
const textoLimite = (v: number | null, unidade: string) => (v === null ? `${unidade} ilimitados` : `${v.toLocaleString("pt-BR")} ${unidade}`);

export default function PlanosPage() {
  const [planos, setPlanos] = useState<Plano[] | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    try {
      setPlanos(await chamar<Plano[]>("/api/admin/saas/planos"));
    } catch (e) {
      setErro((e as Error).message);
      setPlanos([]);
    }
  }, []);
  useEffect(() => {
    carregar();
  }, [carregar]);

  const set = (patch: Partial<Form>) => setForm((f) => (f ? { ...f, ...patch } : f));

  const salvar = async () => {
    if (!form) return;
    setSalvando(true);
    setErro("");
    const corpo = {
      nome: form.nome,
      chamada: form.chamada,
      descricao: form.descricao,
      precoMensal: Number(form.precoMensal.replace(",", ".")),
      precoAnual: Number((form.precoAnual || form.precoMensal).replace(",", ".")),
      limiteUsuarios: limite(form.limiteUsuarios),
      limiteImoveis: limite(form.limiteImoveis),
      limiteWhatsapp: limite(form.limiteWhatsapp),
      limiteStorageGb: limite(form.limiteStorageGb),
      trialDias: Number(form.trialDias || 0),
      recursos: form.recursos.split("\n").map((r) => r.trim()).filter(Boolean),
      destaque: form.destaque,
      ativo: form.ativo,
    };
    try {
      await chamar(form.id ? `/api/admin/saas/planos/${form.id}` : "/api/admin/saas/planos", {
        method: form.id ? "PATCH" : "POST",
        body: JSON.stringify(corpo),
      });
      setForm(null);
      await carregar();
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setSalvando(false);
    }
  };

  const atualizar = async (id: string, patch: Partial<Plano>) => {
    try {
      await chamar(`/api/admin/saas/planos/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
      await carregar();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const mover = async (i: number, direcao: -1 | 1) => {
    if (!planos) return;
    const a = planos[i];
    const b = planos[i + direcao];
    if (!a || !b) return;
    await Promise.all([
      chamar(`/api/admin/saas/planos/${a.id}`, { method: "PATCH", body: JSON.stringify({ ordem: i + direcao }) }),
      chamar(`/api/admin/saas/planos/${b.id}`, { method: "PATCH", body: JSON.stringify({ ordem: i }) }),
    ]).catch(() => null);
    carregar();
  };

  const excluir = async (p: Plano) => {
    if (!confirm(`Excluir o plano ${p.nome}? Isso não pode ser desfeito.`)) return;
    try {
      await chamar(`/api/admin/saas/planos/${p.id}`, { method: "DELETE" });
      carregar();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const economia = form && Number(form.precoMensal) > 0 && Number(form.precoAnual) > 0
    ? Math.round((1 - Number(form.precoAnual) / Number(form.precoMensal)) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <Cabecalho
        icone={<RiPriceTag3Line />}
        titulo="Planos"
        texto="Catálogo de assinatura da plataforma. Mudanças de preço valem para novas contratações."
        acoes={
          <Botao onClick={() => setForm({ ...VAZIO })}>
            <RiAddLine /> Novo plano
          </Botao>
        }
      />

      {!planos ? (
        <Carregando />
      ) : planos.length === 0 ? (
        <Vazio icone={<RiPriceTag3Line />} titulo="Nenhum plano ainda" texto="Crie o primeiro plano para começar a cadastrar assinantes." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {planos.map((p, i) => (
            <div
              key={p.id}
              className={`relative flex flex-col rounded-[28px] border p-6 transition-shadow hover:shadow-xl ${
                p.destaque
                  ? "border-transparent bg-gradient-to-br from-[#0B2545] to-[#163A6B] text-white shadow-lg shadow-[#0B2545]/20"
                  : "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
              } ${p.ativo ? "" : "opacity-60"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className={`text-lg font-bold ${p.destaque ? "" : "text-neutral-900 dark:text-white"}`}>{p.nome}</h3>
                    {p.destaque && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-200">
                        <RiSparkling2Fill className="h-3 w-3" /> Destaque
                      </span>
                    )}
                    {!p.ativo && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-neutral-200 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-600">
                        <RiEyeOffLine className="h-3 w-3" /> Inativo
                      </span>
                    )}
                  </div>
                  {p.chamada && <p className={`mt-1 text-sm ${p.destaque ? "text-white/70" : "text-neutral-500"}`}>{p.chamada}</p>}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button type="button" disabled={i === 0} onClick={() => mover(i, -1)} title="Subir" className={`grid h-8 w-8 place-items-center rounded-full disabled:opacity-30 ${p.destaque ? "hover:bg-white/10" : "text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>
                    <RiArrowUpLine />
                  </button>
                  <button type="button" disabled={i === planos.length - 1} onClick={() => mover(i, 1)} title="Descer" className={`grid h-8 w-8 place-items-center rounded-full disabled:opacity-30 ${p.destaque ? "hover:bg-white/10" : "text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>
                    <RiArrowDownLine />
                  </button>
                </div>
              </div>

              <div className="mt-5 flex items-end gap-2">
                <span className="text-3xl font-bold tabular-nums tracking-tight">{moeda(p.precoMensal)}</span>
                <span className={`pb-1 text-sm ${p.destaque ? "text-white/60" : "text-neutral-500"}`}>/mês</span>
              </div>
              <p className={`mt-1 text-xs ${p.destaque ? "text-emerald-300" : "text-emerald-600"}`}>
                {moeda(p.precoAnual)}/mês no anual · {moeda(p.precoAnual * 12)} por ano
              </p>

              <div className={`mt-5 grid grid-cols-2 gap-2 text-xs ${p.destaque ? "text-white/80" : "text-neutral-600 dark:text-neutral-300"}`}>
                {[
                  textoLimite(p.limiteUsuarios, "usuários"),
                  textoLimite(p.limiteImoveis, "imóveis"),
                  textoLimite(p.limiteWhatsapp, "WhatsApp"),
                  p.limiteStorageGb === null ? "Storage ilimitado" : `${p.limiteStorageGb} GB de storage`,
                ].map((t) => (
                  <span key={t} className={`rounded-2xl px-3 py-2 ${p.destaque ? "bg-white/10" : "bg-neutral-50 dark:bg-neutral-800"}`}>{t}</span>
                ))}
              </div>

              <ul className="mt-5 flex-1 space-y-2">
                {p.recursos.map((r) => (
                  <li key={r} className={`flex items-start gap-2 text-sm ${p.destaque ? "text-white/90" : "text-neutral-700 dark:text-neutral-300"}`}>
                    <RiCheckLine className={`mt-0.5 h-4 w-4 shrink-0 ${p.destaque ? "text-emerald-300" : "text-emerald-500"}`} />
                    {r}
                  </li>
                ))}
              </ul>

              <div className={`mt-6 flex items-center justify-between border-t pt-4 ${p.destaque ? "border-white/10" : "border-neutral-100 dark:border-neutral-800"}`}>
                <span className={`inline-flex items-center gap-1.5 text-xs ${p.destaque ? "text-white/70" : "text-neutral-500"}`}>
                  <RiUserLine className="h-4 w-4" /> {p._count?.assinantes ?? 0} assinante(s)
                </span>
                <div className="flex gap-1">
                  <button type="button" onClick={() => atualizar(p.id, { ativo: !p.ativo })} title={p.ativo ? "Desativar" : "Ativar"} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${p.destaque ? "hover:bg-white/10" : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"}`}>
                    {p.ativo ? "Desativar" : "Ativar"}
                  </button>
                  <button type="button" onClick={() => setForm(paraForm(p))} title="Editar" className={`grid h-8 w-8 place-items-center rounded-full ${p.destaque ? "hover:bg-white/10" : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>
                    <RiEditLine />
                  </button>
                  <button type="button" onClick={() => excluir(p)} title="Excluir" className="grid h-8 w-8 place-items-center rounded-full text-rose-400 hover:bg-rose-500/10">
                    <RiDeleteBinLine />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        aberto={!!form}
        onFechar={() => setForm(null)}
        titulo={form?.id ? `Editar ${form.nome || "plano"}` : "Novo plano"}
        subtitulo="Deixe um limite em branco para ilimitado."
        rodape={
          <>
            <Botao tipo="secundario" onClick={() => setForm(null)}>Cancelar</Botao>
            <Botao onClick={salvar} carregando={salvando} disabled={!form?.nome || !form?.precoMensal}>
              Salvar plano
            </Botao>
          </>
        }
      >
        {form && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Nome" className="sm:col-span-2">
              <input className={estiloInput} value={form.nome} onChange={(e) => set({ nome: e.target.value })} placeholder="Ex.: Imobiliária" />
            </Campo>
            <Campo rotulo="Chamada" className="sm:col-span-2">
              <input className={estiloInput} value={form.chamada} onChange={(e) => set({ chamada: e.target.value })} placeholder="Ex.: Seu time inteiro, conectado." />
            </Campo>
            <Campo rotulo="Descrição" className="sm:col-span-2">
              <textarea className={`${estiloInput} h-20 py-3`} value={form.descricao} onChange={(e) => set({ descricao: e.target.value })} />
            </Campo>
            <Campo rotulo="Preço mensal (R$)">
              <input className={estiloInput} inputMode="decimal" value={form.precoMensal} onChange={(e) => set({ precoMensal: e.target.value })} />
            </Campo>
            <Campo rotulo="Mensal no plano anual (R$)" ajuda={economia > 0 ? `${economia}% de desconto no anual` : "Valor por mês para quem paga o ano"}>
              <input className={estiloInput} inputMode="decimal" value={form.precoAnual} onChange={(e) => set({ precoAnual: e.target.value })} />
            </Campo>
            <Campo rotulo="Usuários">
              <input className={estiloInput} inputMode="numeric" value={form.limiteUsuarios} onChange={(e) => set({ limiteUsuarios: e.target.value })} placeholder="Ilimitado" />
            </Campo>
            <Campo rotulo="Imóveis">
              <input className={estiloInput} inputMode="numeric" value={form.limiteImoveis} onChange={(e) => set({ limiteImoveis: e.target.value })} placeholder="Ilimitado" />
            </Campo>
            <Campo rotulo="Sessões de WhatsApp">
              <input className={estiloInput} inputMode="numeric" value={form.limiteWhatsapp} onChange={(e) => set({ limiteWhatsapp: e.target.value })} placeholder="Ilimitado" />
            </Campo>
            <Campo rotulo="Storage (GB)">
              <input className={estiloInput} inputMode="numeric" value={form.limiteStorageGb} onChange={(e) => set({ limiteStorageGb: e.target.value })} placeholder="Ilimitado" />
            </Campo>
            <Campo rotulo="Dias de teste grátis">
              <input className={estiloInput} inputMode="numeric" value={form.trialDias} onChange={(e) => set({ trialDias: e.target.value })} />
            </Campo>
            <div />
            <Campo rotulo="Recursos (um por linha)" className="sm:col-span-2">
              <textarea className={`${estiloInput} h-32 py-3`} value={form.recursos} onChange={(e) => set({ recursos: e.target.value })} placeholder={"CRM e funil de vendas\nWhatsApp e automações"} />
            </Campo>
            <Alternar rotulo="Destacar na home" ligado={form.destaque} onChange={(v) => set({ destaque: v })} />
            <Alternar rotulo="Disponível para contratar" ligado={form.ativo} onChange={(v) => set({ ativo: v })} />
            {erro && <p className="text-sm text-rose-600 sm:col-span-2">{erro}</p>}
          </div>
        )}
      </Modal>
    </div>
  );
}
