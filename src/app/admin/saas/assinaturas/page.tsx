"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  RiAddLine,
  RiArrowRightSLine,
  RiBankCardLine,
  RiCheckLine,
  RiExternalLinkLine,
  RiFileCopyLine,
  RiHistoryLine,
  RiRefreshLine,
  RiSearchLine,
  RiUser3Line,
  RiVipCrownLine,
} from "react-icons/ri";
import {
  Botao,
  Cabecalho,
  Campo,
  Carregando,
  Cartao,
  DOMINIO,
  Indicador,
  METODOS,
  Modal,
  STATUS_ASSINATURA,
  STATUS_PAGAMENTO,
  STATUS_SITE,
  Selo,
  Vazio,
  chamar,
  data,
  dataHora,
  estiloInput,
  moeda,
  type Assinante,
  type Pagamento,
  type Plano,
  type StatusAssinatura,
} from "@/components/admin/saas/ui";

type Resumo = {
  total: number;
  ativos: number;
  trial: number;
  inadimplentes: number;
  suspensos: number;
  cancelados: number;
  mrr: number;
  emAberto: number;
  cobrancasEmAberto: number;
};

type Ficha = Assinante & {
  plano: Plano;
  usuario: { id: string; email: string; name: string; isActive: boolean } | null;
  pagamentos: Pagamento[];
  eventos: { id: string; tipo: string; descricao: string; autor: string | null; createdAt: string }[];
};

const FILTROS: { id: "" | StatusAssinatura; rotulo: string }[] = [
  { id: "", rotulo: "Todas" },
  { id: "ATIVA", rotulo: "Ativas" },
  { id: "TRIAL", rotulo: "Em teste" },
  { id: "INADIMPLENTE", rotulo: "Inadimplentes" },
  { id: "SUSPENSA", rotulo: "Suspensas" },
  { id: "CANCELADA", rotulo: "Canceladas" },
];

const slugDe = (t: string) =>
  t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);

export default function AssinaturasPage() {
  const [dados, setDados] = useState<{ assinantes: Assinante[]; resumo: Resumo } | null>(null);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [filtro, setFiltro] = useState<"" | StatusAssinatura>("");
  const [planoFiltro, setPlanoFiltro] = useState("");
  const [busca, setBusca] = useState("");
  const [novo, setNovo] = useState(false);
  const [fichaId, setFichaId] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const q = new URLSearchParams();
    if (filtro) q.set("status", filtro);
    if (planoFiltro) q.set("planoId", planoFiltro);
    if (busca.trim()) q.set("busca", busca.trim());
    try {
      setDados(await chamar(`/api/admin/saas/assinantes?${q}`));
    } catch {
      setDados({ assinantes: [], resumo: { total: 0, ativos: 0, trial: 0, inadimplentes: 0, suspensos: 0, cancelados: 0, mrr: 0, emAberto: 0, cobrancasEmAberto: 0 } });
    }
  }, [filtro, planoFiltro, busca]);

  useEffect(() => {
    const t = setTimeout(carregar, busca ? 300 : 0);
    return () => clearTimeout(t);
  }, [carregar, busca]);

  useEffect(() => {
    chamar<Plano[]>("/api/admin/saas/planos").then(setPlanos).catch(() => setPlanos([]));
  }, []);

  const r = dados?.resumo;

  return (
    <div className="space-y-6">
      <Cabecalho
        icone={<RiVipCrownLine />}
        titulo="Assinaturas"
        texto="Imobiliárias assinantes, cobranças e situação de cada conta."
        acoes={
          <>
            <Botao tipo="fantasma" onClick={carregar}>
              <RiRefreshLine /> Atualizar
            </Botao>
            <Botao onClick={() => setNovo(true)} disabled={!planos.length}>
              <RiAddLine /> Novo assinante
            </Botao>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Indicador destaque rotulo="Receita recorrente mensal" valor={moeda(r?.mrr)} detalhe="Ativas e inadimplentes; anual ÷ 12" />
        <Indicador rotulo="Ativas" valor={String(r?.ativos ?? "—")} detalhe={`${r?.total ?? 0} no total`} />
        <Indicador rotulo="Em teste" valor={String(r?.trial ?? "—")} detalhe="Período grátis" />
        <Indicador rotulo="Inadimplentes" valor={String(r?.inadimplentes ?? "—")} detalhe={`${r?.suspensos ?? 0} suspensas`} />
        <Indicador rotulo="A receber" valor={moeda(r?.emAberto)} detalhe={`${r?.cobrancasEmAberto ?? 0} cobranças em aberto`} />
      </div>

      <Cartao className="p-2">
        <div className="flex flex-wrap items-center gap-2 p-2">
          <div className="flex flex-wrap gap-1 rounded-full bg-neutral-100 p-1 dark:bg-neutral-800">
            {FILTROS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFiltro(f.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  filtro === f.id ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white" : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                }`}
              >
                {f.rotulo}
              </button>
            ))}
          </div>
          <select value={planoFiltro} onChange={(e) => setPlanoFiltro(e.target.value)} className={`${estiloInput} h-9 w-auto rounded-full py-0 text-xs`}>
            <option value="">Todos os planos</option>
            {planos.map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
          <div className="relative ml-auto w-full sm:w-72">
            <RiSearchLine className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Imobiliária, responsável, e-mail ou endereço" className={`${estiloInput} h-10 rounded-full pl-10`} />
          </div>
        </div>

        {!dados ? (
          <Carregando />
        ) : dados.assinantes.length === 0 ? (
          <Vazio
            icone={<RiVipCrownLine />}
            titulo={busca || filtro || planoFiltro ? "Nada encontrado" : "Nenhum assinante ainda"}
            texto={busca || filtro || planoFiltro ? "Ajuste os filtros ou a busca." : "Cadastre a primeira imobiliária para gerar o acesso, o site e a cobrança."}
            acao={!busca && !filtro && !planoFiltro && planos.length ? <Botao onClick={() => setNovo(true)}><RiAddLine /> Novo assinante</Botao> : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  <th className="px-4 py-3">Imobiliária</th>
                  <th className="px-4 py-3">Plano</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3">Assinatura</th>
                  <th className="px-4 py-3">Última cobrança</th>
                  <th className="px-4 py-3">Site</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {dados.assinantes.map((a) => {
                  const ult = a.pagamentos?.[0];
                  return (
                    <tr key={a.id} onClick={() => setFichaId(a.id)} className="cursor-pointer border-t border-neutral-100 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/40">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#0B2545] to-[#163A6B] text-sm font-bold text-white">
                            {a.nome.slice(0, 1).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-neutral-900 dark:text-white">{a.nome}</p>
                            <p className="truncate text-xs text-neutral-500">{a.responsavel} · {a.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-neutral-700 dark:text-neutral-300">
                        {a.plano.nome}
                        <span className="block text-xs text-neutral-400">{a.ciclo === "ANUAL" ? "Anual" : "Mensal"}</span>
                      </td>
                      <td className="px-4 py-3.5 font-semibold tabular-nums text-neutral-900 dark:text-white">{moeda(a.valor)}</td>
                      <td className="px-4 py-3.5">
                        <Selo {...STATUS_ASSINATURA[a.status]} />
                        {a.status === "TRIAL" && a.trialAte && <span className="mt-1 block text-[11px] text-neutral-400">até {data(a.trialAte)}</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        {ult ? (
                          <>
                            <Selo {...STATUS_PAGAMENTO[ult.status]} />
                            <span className="mt-1 block text-[11px] text-neutral-400">vence {data(ult.vencimento)}</span>
                          </>
                        ) : (
                          <span className="text-xs text-neutral-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <Selo {...STATUS_SITE[a.siteStatus]} />
                        <span className="mt-1 block truncate text-[11px] text-neutral-400">{a.dominioProprio || `${a.slug}.${DOMINIO}`}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right text-neutral-300">
                        <RiArrowRightSLine className="ml-auto h-5 w-5" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Cartao>

      <NovoAssinante aberto={novo} planos={planos.filter((p) => p.ativo)} onFechar={() => setNovo(false)} onCriado={(id) => { carregar(); setFichaId(id); }} />
      <FichaAssinante id={fichaId} planos={planos} onFechar={() => setFichaId(null)} onMudou={carregar} />
    </div>
  );
}

// ================================================================ novo assinante

function NovoAssinante({ aberto, planos, onFechar, onCriado }: { aberto: boolean; planos: Plano[]; onFechar: () => void; onCriado: (id: string) => void }) {
  const inicial = { nome: "", responsavel: "", email: "", telefone: "", documento: "", slug: "", planoId: "", ciclo: "MENSAL" as "MENSAL" | "ANUAL", trial: true, criarLogin: true, metodo: "PIX" };
  const [f, setF] = useState(inicial);
  const [slugManual, setSlugManual] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [criado, setCriado] = useState<{ id: string; email: string; senha: string | null; slug: string } | null>(null);

  useEffect(() => {
    if (aberto) {
      setF({ ...inicial, planoId: planos.find((p) => p.destaque)?.id || planos[0]?.id || "" });
      setSlugManual(false);
      setErro("");
      setCriado(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto]);

  const plano = planos.find((p) => p.id === f.planoId);
  const valor = plano ? (f.ciclo === "ANUAL" ? plano.precoAnual * 12 : plano.precoMensal) : 0;

  const salvar = async () => {
    setSalvando(true);
    setErro("");
    try {
      const r = await chamar<{ assinante: { id: string; slug: string }; senhaProvisoria: string | null }>("/api/admin/saas/assinantes", {
        method: "POST",
        body: JSON.stringify(f),
      });
      setCriado({ id: r.assinante.id, email: f.email, senha: r.senhaProvisoria, slug: r.assinante.slug });
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setSalvando(false);
    }
  };

  if (criado) {
    return (
      <Modal aberto={aberto} onFechar={onFechar} titulo="Assinante criado" largura="max-w-lg"
        rodape={<Botao onClick={() => { onFechar(); onCriado(criado.id); }}>Abrir ficha</Botao>}>
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-3xl bg-emerald-50 p-4 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
            <RiCheckLine className="h-6 w-6 shrink-0" />
            <p className="text-sm">Conta, endereço do site e primeira cobrança criados.</p>
          </div>
          <Linha rotulo="Site" valor={`${criado.slug}.${DOMINIO}`} />
          <Linha rotulo="Login" valor={criado.email} />
          {criado.senha ? (
            <>
              <Linha rotulo="Senha provisória" valor={criado.senha} destaque />
              <p className="text-xs text-neutral-500">Anote e envie ao assinante agora: por segurança ela não aparece de novo. Ele deve trocar no primeiro acesso.</p>
            </>
          ) : (
            <p className="text-xs text-neutral-500">Este e-mail já tinha conta no sistema; ela foi ligada ao assinante com a senha que já existia.</p>
          )}
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo="Novo assinante"
      subtitulo="Cria o acesso, reserva o endereço do site e gera a primeira cobrança."
      rodape={
        <>
          <Botao tipo="secundario" onClick={onFechar}>Cancelar</Botao>
          <Botao onClick={salvar} carregando={salvando} disabled={!f.nome || !f.responsavel || !f.email || !f.planoId}>Criar assinante</Botao>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo rotulo="Imobiliária" className="sm:col-span-2">
          <input className={estiloInput} value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value, slug: slugManual ? f.slug : slugDe(e.target.value) })} placeholder="Ex.: Imobiliária Horizonte" />
        </Campo>
        <Campo rotulo="Responsável">
          <input className={estiloInput} value={f.responsavel} onChange={(e) => setF({ ...f, responsavel: e.target.value })} />
        </Campo>
        <Campo rotulo="E-mail (será o login)">
          <input className={estiloInput} type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        </Campo>
        <Campo rotulo="Telefone">
          <input className={estiloInput} value={f.telefone} onChange={(e) => setF({ ...f, telefone: e.target.value })} placeholder="(11) 99999-9999" />
        </Campo>
        <Campo rotulo="CNPJ ou CPF">
          <input className={estiloInput} value={f.documento} onChange={(e) => setF({ ...f, documento: e.target.value })} />
        </Campo>
        <Campo rotulo="Endereço do site" className="sm:col-span-2" ajuda="Letras minúsculas, números e hífen.">
          <div className="flex items-center overflow-hidden rounded-2xl border border-neutral-200 focus-within:border-orange-500/60 focus-within:ring-4 focus-within:ring-orange-500/10 dark:border-neutral-700">
            <input className="h-11 min-w-0 flex-1 bg-transparent px-4 text-sm outline-none dark:text-white" value={f.slug} onChange={(e) => { setSlugManual(true); setF({ ...f, slug: slugDe(e.target.value) }); }} />
            <span className="shrink-0 bg-neutral-50 px-4 py-3 text-sm text-neutral-500 dark:bg-neutral-800">.{DOMINIO}</span>
          </div>
        </Campo>
        <Campo rotulo="Plano">
          <select className={estiloInput} value={f.planoId} onChange={(e) => setF({ ...f, planoId: e.target.value })}>
            {planos.map((p) => (
              <option key={p.id} value={p.id}>{p.nome} · {moeda(p.precoMensal)}/mês</option>
            ))}
          </select>
        </Campo>
        <Campo rotulo="Ciclo">
          <div className="grid grid-cols-2 gap-1 rounded-2xl bg-neutral-100 p-1 dark:bg-neutral-800">
            {(["MENSAL", "ANUAL"] as const).map((c) => (
              <button key={c} type="button" onClick={() => setF({ ...f, ciclo: c })} className={`rounded-xl py-2 text-sm font-semibold ${f.ciclo === c ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white" : "text-neutral-500"}`}>
                {c === "MENSAL" ? "Mensal" : "Anual"}
              </button>
            ))}
          </div>
        </Campo>
        <Campo rotulo="Forma de pagamento">
          <select className={estiloInput} value={f.metodo} onChange={(e) => setF({ ...f, metodo: e.target.value })}>
            {Object.entries(METODOS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </Campo>
        <div className="flex flex-col justify-end rounded-2xl bg-neutral-50 px-4 py-3 dark:bg-neutral-800/60">
          <span className="text-xs text-neutral-500">Valor por {f.ciclo === "ANUAL" ? "ano" : "mês"}</span>
          <span className="text-lg font-bold tabular-nums text-neutral-900 dark:text-white">{moeda(valor)}</span>
        </div>
        <label className="flex items-center gap-3 rounded-2xl border border-neutral-200 px-4 py-3 text-sm dark:border-neutral-700 sm:col-span-2">
          <input type="checkbox" checked={f.trial} onChange={(e) => setF({ ...f, trial: e.target.checked })} className="h-4 w-4 accent-orange-500" />
          Começar com {plano?.trialDias ?? 0} dias de teste grátis (a primeira cobrança vence no fim do teste)
        </label>
        <label className="flex items-center gap-3 rounded-2xl border border-neutral-200 px-4 py-3 text-sm dark:border-neutral-700 sm:col-span-2">
          <input type="checkbox" checked={f.criarLogin} onChange={(e) => setF({ ...f, criarLogin: e.target.checked })} className="h-4 w-4 accent-orange-500" />
          Criar o login do assinante com senha provisória
        </label>
        {erro && <p className="text-sm text-rose-600 sm:col-span-2">{erro}</p>}
      </div>
    </Modal>
  );
}

function Linha({ rotulo, valor, destaque }: { rotulo: string; valor: string; destaque?: boolean }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-200 px-4 py-3 dark:border-neutral-700">
      <div className="min-w-0">
        <p className="text-[11px] text-neutral-500">{rotulo}</p>
        <p className={`truncate font-semibold text-neutral-900 dark:text-white ${destaque ? "font-mono text-base" : "text-sm"}`}>{valor}</p>
      </div>
      <button type="button" title="Copiar" onClick={() => { navigator.clipboard?.writeText(valor); setCopiado(true); setTimeout(() => setCopiado(false), 1200); }} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800">
        {copiado ? <RiCheckLine className="text-emerald-500" /> : <RiFileCopyLine />}
      </button>
    </div>
  );
}

// ================================================================ ficha

function FichaAssinante({ id, planos, onFechar, onMudou }: { id: string | null; planos: Plano[]; onFechar: () => void; onMudou: () => void }) {
  const [ficha, setFicha] = useState<Ficha | null>(null);
  const [aba, setAba] = useState<"resumo" | "cobrancas" | "historico">("resumo");
  const [editando, setEditando] = useState<Partial<Ficha> | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState("");
  const [novaCobranca, setNovaCobranca] = useState<{ valor: string; vencimento: string; metodo: string } | null>(null);

  const carregar = useCallback(async () => {
    if (!id) return;
    try {
      setFicha(await chamar<Ficha>(`/api/admin/saas/assinantes/${id}`));
    } catch (e) {
      setErro((e as Error).message);
    }
  }, [id]);

  useEffect(() => {
    setFicha(null);
    setAba("resumo");
    setEditando(null);
    setErro("");
    setNovaCobranca(null);
    carregar();
  }, [carregar]);

  const patch = async (corpo: Record<string, unknown>, confirmar?: string) => {
    if (!ficha || (confirmar && !confirm(confirmar))) return;
    setOcupado(true);
    setErro("");
    try {
      await chamar(`/api/admin/saas/assinantes/${ficha.id}`, { method: "PATCH", body: JSON.stringify(corpo) });
      setEditando(null);
      await carregar();
      onMudou();
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setOcupado(false);
    }
  };

  const mudarPagamento = async (p: Pagamento, status: string, pergunta?: string) => {
    if (pergunta && !confirm(pergunta)) return;
    try {
      await chamar(`/api/admin/saas/pagamentos/${p.id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      await carregar();
      onMudou();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const gerarCobranca = async () => {
    if (!ficha || !novaCobranca) return;
    setOcupado(true);
    try {
      await chamar(`/api/admin/saas/assinantes/${ficha.id}/pagamentos`, { method: "POST", body: JSON.stringify(novaCobranca) });
      setNovaCobranca(null);
      await carregar();
      onMudou();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setOcupado(false);
    }
  };

  const excluir = async () => {
    if (!ficha || !confirm(`Excluir ${ficha.nome} e todo o histórico? O login será desativado. Não dá para desfazer.`)) return;
    try {
      await chamar(`/api/admin/saas/assinantes/${ficha.id}`, { method: "DELETE" });
      onFechar();
      onMudou();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const totalPago = useMemo(() => (ficha?.pagamentos || []).filter((p) => p.status === "PAGO").reduce((t, p) => t + p.valor, 0), [ficha]);
  const url = ficha ? (ficha.dominioProprio ? `https://${ficha.dominioProprio}` : `https://${ficha.slug}.${DOMINIO}`) : "";

  return (
    <Modal aberto={!!id} onFechar={onFechar} titulo={ficha?.nome || "Carregando…"} subtitulo={ficha ? `${ficha.responsavel} · cliente desde ${data(ficha.inicioEm)}` : undefined} largura="max-w-4xl">
      {!ficha ? (
        <Carregando />
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Selo {...STATUS_ASSINATURA[ficha.status]} />
            <Selo {...STATUS_SITE[ficha.siteStatus]} />
            <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10">
              {url.replace("https://", "")} <RiExternalLinkLine className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="flex gap-1 rounded-full bg-neutral-100 p-1 dark:bg-neutral-800">
            {([
              ["resumo", "Resumo", <RiUser3Line key="i" />],
              ["cobrancas", `Cobranças (${ficha.pagamentos.length})`, <RiBankCardLine key="i" />],
              ["historico", "Histórico", <RiHistoryLine key="i" />],
            ] as const).map(([k, rotulo, icone]) => (
              <button key={k} type="button" onClick={() => setAba(k)} className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold [&>svg]:h-4 [&>svg]:w-4 ${aba === k ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white" : "text-neutral-500"}`}>
                {icone}
                {rotulo}
              </button>
            ))}
          </div>

          {erro && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{erro}</p>}

          {aba === "resumo" && (
            <div className="grid gap-5 lg:grid-cols-2">
              <Cartao className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-neutral-900 dark:text-white">Dados</h3>
                  {!editando && <Botao tipo="fantasma" onClick={() => setEditando({ ...ficha })}>Editar</Botao>}
                </div>
                {editando ? (
                  <div className="grid gap-3">
                    {([
                      ["nome", "Imobiliária"],
                      ["responsavel", "Responsável"],
                      ["email", "E-mail de contato"],
                      ["telefone", "Telefone"],
                      ["documento", "CNPJ ou CPF"],
                    ] as const).map(([k, r]) => (
                      <Campo key={k} rotulo={r}>
                        <input className={estiloInput} value={(editando[k] as string) || ""} onChange={(e) => setEditando({ ...editando, [k]: e.target.value })} />
                      </Campo>
                    ))}
                    <Campo rotulo="Observações internas">
                      <textarea className={`${estiloInput} h-20 py-3`} value={editando.observacoes || ""} onChange={(e) => setEditando({ ...editando, observacoes: e.target.value })} />
                    </Campo>
                    <div className="flex justify-end gap-2">
                      <Botao tipo="secundario" onClick={() => setEditando(null)}>Cancelar</Botao>
                      <Botao carregando={ocupado} onClick={() => patch({ nome: editando.nome, responsavel: editando.responsavel, email: editando.email, telefone: editando.telefone, documento: editando.documento, observacoes: editando.observacoes })}>Salvar</Botao>
                    </div>
                  </div>
                ) : (
                  <dl className="grid gap-3 text-sm">
                    {[
                      ["Responsável", ficha.responsavel],
                      ["E-mail", ficha.email],
                      ["Telefone", ficha.telefone || "—"],
                      ["CNPJ/CPF", ficha.documento || "—"],
                      ["Login", ficha.usuario ? `${ficha.usuario.email}${ficha.usuario.isActive ? "" : " (bloqueado)"}` : "Sem login"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4">
                        <dt className="text-neutral-500">{k}</dt>
                        <dd className="truncate text-right font-medium text-neutral-900 dark:text-white">{v}</dd>
                      </div>
                    ))}
                    {ficha.observacoes && <p className="rounded-2xl bg-neutral-50 p-3 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">{ficha.observacoes}</p>}
                  </dl>
                )}
              </Cartao>

              <Cartao className="p-5">
                <h3 className="mb-4 font-semibold text-neutral-900 dark:text-white">Assinatura</h3>
                <div className="grid gap-3">
                  <Campo rotulo="Plano">
                    <select className={estiloInput} value={ficha.plano.id} disabled={ocupado} onChange={(e) => patch({ planoId: e.target.value }, "Trocar de plano? O novo valor vale a partir da próxima cobrança.")}>
                      {planos.map((p) => (
                        <option key={p.id} value={p.id}>{p.nome}{p.ativo ? "" : " (inativo)"}</option>
                      ))}
                    </select>
                  </Campo>
                  <Campo rotulo="Ciclo">
                    <div className="grid grid-cols-2 gap-1 rounded-2xl bg-neutral-100 p-1 dark:bg-neutral-800">
                      {(["MENSAL", "ANUAL"] as const).map((c) => (
                        <button key={c} type="button" disabled={ocupado} onClick={() => c !== ficha.ciclo && patch({ ciclo: c }, `Mudar para o ciclo ${c === "ANUAL" ? "anual" : "mensal"}?`)} className={`rounded-xl py-2 text-sm font-semibold ${ficha.ciclo === c ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white" : "text-neutral-500"}`}>
                          {c === "MENSAL" ? "Mensal" : "Anual"}
                        </button>
                      ))}
                    </div>
                  </Campo>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-neutral-50 p-3 dark:bg-neutral-800/60">
                      <p className="text-xs text-neutral-500">Valor por {ficha.ciclo === "ANUAL" ? "ano" : "mês"}</p>
                      <p className="mt-0.5 text-lg font-bold tabular-nums text-neutral-900 dark:text-white">{moeda(ficha.valor)}</p>
                    </div>
                    <div className="rounded-2xl bg-neutral-50 p-3 dark:bg-neutral-800/60">
                      <p className="text-xs text-neutral-500">Total pago</p>
                      <p className="mt-0.5 text-lg font-bold tabular-nums text-emerald-600">{moeda(totalPago)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500">
                    {ficha.status === "TRIAL" && ficha.trialAte ? `Teste grátis até ${data(ficha.trialAte)}. ` : ""}
                    Próxima cobrança: {data(ficha.proximaCobranca)}.
                  </p>
                  <div className="flex flex-wrap gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                    {ficha.status !== "ATIVA" && ficha.status !== "CANCELADA" && (
                      <Botao tipo="secundario" carregando={ocupado} onClick={() => patch({ status: "ATIVA" }, "Ativar a assinatura manualmente?")}>Ativar</Botao>
                    )}
                    {(ficha.status === "ATIVA" || ficha.status === "INADIMPLENTE" || ficha.status === "TRIAL") && (
                      <Botao tipo="secundario" carregando={ocupado} onClick={() => patch({ status: "SUSPENSA" }, "Suspender? O site sai do ar e o login fica bloqueado até reativar.")}>Suspender</Botao>
                    )}
                    {ficha.status !== "CANCELADA" ? (
                      <Botao tipo="perigo" carregando={ocupado} onClick={() => patch({ status: "CANCELADA" }, `Cancelar a assinatura de ${ficha.nome}? Site e login são desligados.`)}>Cancelar assinatura</Botao>
                    ) : (
                      <>
                        <Botao tipo="secundario" carregando={ocupado} onClick={() => patch({ status: "ATIVA" }, "Reativar esta assinatura?")}>Reativar</Botao>
                        <Botao tipo="perigo" onClick={excluir}>Excluir</Botao>
                      </>
                    )}
                  </div>
                </div>
              </Cartao>
            </div>
          )}

          {aba === "cobrancas" && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <Botao onClick={() => setNovaCobranca({ valor: String(ficha.valor), vencimento: "", metodo: "PIX" })}>
                  <RiAddLine /> Gerar cobrança
                </Botao>
              </div>
              {novaCobranca && (
                <Cartao className="grid gap-3 p-4 sm:grid-cols-4">
                  <Campo rotulo="Valor (R$)">
                    <input className={estiloInput} inputMode="decimal" value={novaCobranca.valor} onChange={(e) => setNovaCobranca({ ...novaCobranca, valor: e.target.value })} />
                  </Campo>
                  <Campo rotulo="Vencimento" ajuda="Vazio: um ciclo após a última">
                    <input className={estiloInput} type="date" value={novaCobranca.vencimento} onChange={(e) => setNovaCobranca({ ...novaCobranca, vencimento: e.target.value })} />
                  </Campo>
                  <Campo rotulo="Forma">
                    <select className={estiloInput} value={novaCobranca.metodo} onChange={(e) => setNovaCobranca({ ...novaCobranca, metodo: e.target.value })}>
                      {Object.entries(METODOS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </Campo>
                  <div className="flex items-end gap-2">
                    <Botao tipo="secundario" onClick={() => setNovaCobranca(null)}>Cancelar</Botao>
                    <Botao carregando={ocupado} onClick={gerarCobranca}>Gerar</Botao>
                  </div>
                </Cartao>
              )}
              {ficha.pagamentos.length === 0 ? (
                <Vazio icone={<RiBankCardLine />} titulo="Nenhuma cobrança" texto="Gere a primeira cobrança deste assinante." />
              ) : (
                <div className="overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800">
                  {ficha.pagamentos.map((p) => (
                    <div key={p.id} className="flex flex-wrap items-center gap-3 border-b border-neutral-100 px-4 py-3 last:border-0 dark:border-neutral-800">
                      <div className="min-w-[140px] flex-1">
                        <p className="font-semibold text-neutral-900 dark:text-white">{p.referencia}</p>
                        <p className="text-xs text-neutral-500">
                          vence {data(p.vencimento)} · {METODOS[p.metodo]}
                          {p.pagoEm ? ` · pago em ${data(p.pagoEm)}` : ""}
                        </p>
                      </div>
                      <span className="font-bold tabular-nums text-neutral-900 dark:text-white">{moeda(p.valor)}</span>
                      <Selo {...STATUS_PAGAMENTO[p.status]} />
                      <div className="flex gap-1">
                        {(p.status === "PENDENTE" || p.status === "ATRASADO") && (
                          <>
                            <Botao tipo="secundario" className="px-3 py-1.5 text-xs" onClick={() => mudarPagamento(p, "PAGO", `Confirmar o recebimento de ${moeda(p.valor)}?`)}>Dar baixa</Botao>
                            <Botao tipo="fantasma" className="px-3 py-1.5 text-xs" onClick={() => mudarPagamento(p, "CANCELADO", "Cancelar esta cobrança?")}>Cancelar</Botao>
                          </>
                        )}
                        {p.status === "PAGO" && (
                          <Botao tipo="fantasma" className="px-3 py-1.5 text-xs" onClick={() => mudarPagamento(p, "ESTORNADO", "Registrar estorno deste pagamento?")}>Estornar</Botao>
                        )}
                        {(p.status === "CANCELADO" || p.status === "ESTORNADO") && (
                          <Botao tipo="fantasma" className="px-3 py-1.5 text-xs" onClick={() => mudarPagamento(p, "PENDENTE")}>Reabrir</Botao>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-neutral-400">
                Cobranças vencidas viram &quot;Atrasado&quot; sozinhas, e a assinatura ativa passa a inadimplente. Sem gateway integrado, a baixa é manual.
              </p>
            </div>
          )}

          {aba === "historico" && (
            <ol className="relative space-y-4 border-l-2 border-neutral-100 pl-5 dark:border-neutral-800">
              {ficha.eventos.map((e) => (
                <li key={e.id} className="relative">
                  <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white bg-orange-500 dark:border-neutral-900" />
                  <p className="text-sm text-neutral-800 dark:text-neutral-100">{e.descricao}</p>
                  <p className="text-xs text-neutral-400">
                    {dataHora(e.createdAt)}
                    {e.autor ? ` · ${e.autor}` : ""}
                  </p>
                </li>
              ))}
              {ficha.eventos.length === 0 && <p className="text-sm text-neutral-500">Sem eventos.</p>}
            </ol>
          )}
        </div>
      )}
    </Modal>
  );
}
