"use client";

import { useCallback, useEffect, useState } from "react";
import {
  RiCheckLine,
  RiEditLine,
  RiExternalLinkLine,
  RiFileCopyLine,
  RiGlobalLine,
  RiInformationLine,
  RiSearchLine,
} from "react-icons/ri";
import {
  Botao,
  Cabecalho,
  Campo,
  Carregando,
  Cartao,
  DOMINIO,
  Modal,
  STATUS_ASSINATURA,
  STATUS_SITE,
  Selo,
  Vazio,
  chamar,
  estiloInput,
  type Assinante,
  type StatusSite,
} from "@/components/admin/saas/ui";

const FILTROS: { id: "" | StatusSite; rotulo: string }[] = [
  { id: "", rotulo: "Todos" },
  { id: "PUBLICADO", rotulo: "No ar" },
  { id: "CONFIGURANDO", rotulo: "Em configuração" },
  { id: "SUSPENSO", rotulo: "Fora do ar" },
];

export default function SitesPage() {
  const [lista, setLista] = useState<Assinante[] | null>(null);
  const [filtro, setFiltro] = useState<"" | StatusSite>("");
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState<Assinante | null>(null);
  const [form, setForm] = useState({ slug: "", dominioProprio: "" });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    const q = new URLSearchParams();
    if (filtro) q.set("siteStatus", filtro);
    if (busca.trim()) q.set("busca", busca.trim());
    try {
      const r = await chamar<{ assinantes: Assinante[] }>(`/api/admin/saas/assinantes?${q}`);
      setLista(r.assinantes);
    } catch {
      setLista([]);
    }
  }, [filtro, busca]);

  useEffect(() => {
    const t = setTimeout(carregar, busca ? 300 : 0);
    return () => clearTimeout(t);
  }, [carregar, busca]);

  const mudarStatus = async (a: Assinante, siteStatus: StatusSite) => {
    const pergunta =
      siteStatus === "SUSPENSO"
        ? `Tirar o site de ${a.nome} do ar?`
        : siteStatus === "PUBLICADO"
          ? `Publicar o site de ${a.nome}?`
          : `Voltar o site de ${a.nome} para configuração?`;
    if (!confirm(pergunta)) return;
    try {
      await chamar(`/api/admin/saas/assinantes/${a.id}`, { method: "PATCH", body: JSON.stringify({ siteStatus }) });
      carregar();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const abrirEdicao = (a: Assinante) => {
    setEditando(a);
    setForm({ slug: a.slug, dominioProprio: a.dominioProprio || "" });
    setErro("");
  };

  const salvar = async () => {
    if (!editando) return;
    setSalvando(true);
    setErro("");
    try {
      await chamar(`/api/admin/saas/assinantes/${editando.id}`, { method: "PATCH", body: JSON.stringify(form) });
      setEditando(null);
      carregar();
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-6">
      <Cabecalho icone={<RiGlobalLine />} titulo="Sites" texto="Endereço, domínio próprio e situação do site de cada assinante." />

      <div className="flex items-start gap-3 rounded-3xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200">
        <RiInformationLine className="mt-0.5 h-5 w-5 shrink-0" />
        <p>
          Aqui você reserva endereços e controla o status de cada site. Para que <b>nome.{DOMINIO}</b> abra o site do assinante, ainda
          falta ativar o roteamento por subdomínio e separar os dados por assinante (README, capítulo 9).
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1 rounded-full bg-neutral-100 p-1 dark:bg-neutral-800">
          {FILTROS.map((f) => (
            <button key={f.id} type="button" onClick={() => setFiltro(f.id)} className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${filtro === f.id ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white" : "text-neutral-500"}`}>
              {f.rotulo}
            </button>
          ))}
        </div>
        <div className="relative ml-auto w-full sm:w-72">
          <RiSearchLine className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar imobiliária ou endereço" className={`${estiloInput} h-10 rounded-full pl-10`} />
        </div>
      </div>

      {!lista ? (
        <Carregando />
      ) : lista.length === 0 ? (
        <Cartao>
          <Vazio icone={<RiGlobalLine />} titulo="Nenhum site" texto="Os sites aparecem aqui quando você cadastra assinantes em Assinaturas." />
        </Cartao>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {lista.map((a) => {
            const endereco = `${a.slug}.${DOMINIO}`;
            return (
              <Cartao key={a.id} className="flex flex-col overflow-hidden">
                {/* Prévia do navegador */}
                <div className="m-3 rounded-[22px] bg-gradient-to-br from-[#0B2545] via-[#163A6B] to-[#0f5132] p-4 text-white">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
                    <span className="ml-2 flex-1 truncate rounded-full bg-white/10 px-3 py-1 text-[11px] text-white/80">{a.dominioProprio || endereco}</span>
                  </div>
                  <p className="mt-6 text-lg font-bold">{a.nome}</p>
                  <p className="text-xs text-white/60">Imóveis, banners e páginas da imobiliária</p>
                </div>

                <div className="flex flex-1 flex-col px-5 pb-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Selo {...STATUS_SITE[a.siteStatus]} />
                    <Selo {...STATUS_ASSINATURA[a.status]} />
                  </div>
                  <dl className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-neutral-500">Endereço</dt>
                      <dd className="truncate font-medium text-neutral-900 dark:text-white">{endereco}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-neutral-500">Domínio próprio</dt>
                      <dd className="truncate font-medium text-neutral-900 dark:text-white">{a.dominioProprio || "—"}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-neutral-500">Plano</dt>
                      <dd className="font-medium text-neutral-900 dark:text-white">{a.plano.nome}</dd>
                    </div>
                  </dl>

                  <div className="mt-auto flex flex-wrap gap-2 pt-5">
                    <a href={`https://${a.dominioProprio || endereco}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-3.5 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800">
                      <RiExternalLinkLine className="h-4 w-4" /> Abrir
                    </a>
                    <Botao tipo="secundario" className="px-3.5 py-2 text-xs" onClick={() => abrirEdicao(a)}>
                      <RiEditLine /> Endereço
                    </Botao>
                    {a.siteStatus !== "PUBLICADO" ? (
                      <Botao className="px-3.5 py-2 text-xs" disabled={a.status === "SUSPENSA" || a.status === "CANCELADA"} onClick={() => mudarStatus(a, "PUBLICADO")}>
                        Publicar
                      </Botao>
                    ) : (
                      <Botao tipo="fantasma" className="px-3.5 py-2 text-xs text-rose-600" onClick={() => mudarStatus(a, "SUSPENSO")}>
                        Tirar do ar
                      </Botao>
                    )}
                  </div>
                </div>
              </Cartao>
            );
          })}
        </div>
      )}

      <Modal
        aberto={!!editando}
        onFechar={() => setEditando(null)}
        titulo={`Endereço de ${editando?.nome ?? ""}`}
        largura="max-w-lg"
        rodape={
          <>
            <Botao tipo="secundario" onClick={() => setEditando(null)}>Cancelar</Botao>
            <Botao onClick={salvar} carregando={salvando}>Salvar</Botao>
          </>
        }
      >
        <div className="space-y-4">
          <Campo rotulo="Subdomínio" ajuda="Trocar o endereço quebra links antigos do site.">
            <div className="flex items-center overflow-hidden rounded-2xl border border-neutral-200 focus-within:border-orange-500/60 focus-within:ring-4 focus-within:ring-orange-500/10 dark:border-neutral-700">
              <input className="h-11 min-w-0 flex-1 bg-transparent px-4 text-sm outline-none dark:text-white" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase() })} />
              <span className="shrink-0 bg-neutral-50 px-4 py-3 text-sm text-neutral-500 dark:bg-neutral-800">.{DOMINIO}</span>
            </div>
          </Campo>
          <Campo rotulo="Domínio próprio (opcional)" ajuda="Ex.: www.imobiliariahorizonte.com.br">
            <input className={estiloInput} value={form.dominioProprio} onChange={(e) => setForm({ ...form, dominioProprio: e.target.value })} placeholder="www.dominiodocliente.com.br" />
          </Campo>
          {form.dominioProprio.trim() && (
            <div className="rounded-3xl bg-neutral-50 p-4 dark:bg-neutral-800/60">
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">O assinante cria no DNS dele:</p>
              <div className="mt-3 grid grid-cols-[auto_1fr_1fr_auto] items-center gap-2 text-xs">
                <span className="text-neutral-500">Tipo</span>
                <span className="text-neutral-500">Nome</span>
                <span className="text-neutral-500">Valor</span>
                <span />
                <span className="rounded-full bg-white px-2.5 py-1 font-semibold dark:bg-neutral-900">CNAME</span>
                <span className="truncate font-mono">{form.dominioProprio.trim().split(".")[0]}</span>
                <span className="truncate font-mono">sites.{DOMINIO}</span>
                <Copiar texto={`sites.${DOMINIO}`} />
              </div>
              <p className="mt-3 text-[11px] text-neutral-500">O certificado HTTPS é emitido quando o DNS propagar (até 24 h).</p>
            </div>
          )}
          {erro && <p className="text-sm text-rose-600">{erro}</p>}
        </div>
      </Modal>
    </div>
  );
}

function Copiar({ texto }: { texto: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button type="button" title="Copiar" onClick={() => { navigator.clipboard?.writeText(texto); setOk(true); setTimeout(() => setOk(false), 1200); }} className="grid h-7 w-7 place-items-center rounded-full text-neutral-500 hover:bg-white dark:hover:bg-neutral-900">
      {ok ? <RiCheckLine className="text-emerald-500" /> : <RiFileCopyLine />}
    </button>
  );
}
