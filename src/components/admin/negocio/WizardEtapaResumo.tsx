"use client";

import { useState, useEffect, useRef } from "react";
import {
  RiAlertLine, RiCloseLine, RiCheckLine, RiArrowRightLine,
  RiDownload2Line, RiLoader4Line, RiArrowLeftLine,
} from "react-icons/ri";
import { useWizard } from "./WizardContext";

function formatCurrency(v?: number | null) {
  if (!v) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function SecaoHeader({ title, id }: { title: string; id: string }) {
  return <h3 id={id} className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-3">{title}</h3>;
}

function CampoResumo({ label, value, origem }: { label: string; value?: string | null; origem?: "extraido" | "manual" | "pendente" }) {
  if (!value) origem = "pendente";
  return (
    <div className="flex items-start justify-between py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-500 w-1/2">{label}</span>
      <span className={`text-xs font-medium text-right w-1/2 flex items-center justify-end gap-1 ${
        origem === "pendente" ? "text-orange-500" : "text-gray-800"}`}>
        {origem === "extraido" && <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" title="Extraído" />}
        {origem === "manual" && <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" title="Manual" />}
        {origem === "pendente" && <span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block" title="Pendente" />}
        {value || "⚠ Pendente"}
      </span>
    </div>
  );
}

interface Props { onConfirmar: () => void; }

export function WizardEtapaResumo({ onConfirmar }: Props) {
  const { state, dispatch } = useWizard();
  const { imovel, negocio, vendedores, compradores, negocioId } = state;
  const [pendencias, setPendencias] = useState<any[]>([]);
  const [loadingPendencias, setLoadingPendencias] = useState(false);
  const [showConfirmarModal, setShowConfirmarModal] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [showVoltarMenu, setShowVoltarMenu] = useState(false);
  const [secaoAtiva, setSecaoAtiva] = useState("imovel");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!negocioId) return;
    setLoadingPendencias(true);
    fetch(`/api/admin/negocio/${negocioId}/pendencias`)
      .then((r) => r.json())
      .then((data) => setPendencias(Array.isArray(data) ? data : []))
      .finally(() => setLoadingPendencias(false));
  }, [negocioId]);

  // Scroll spy
  useEffect(() => {
    const secoes = ["imovel", "negocio", "vendedores", "compradores", "pendencias"];
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) setSecaoAtiva(e.target.id); }); },
      { threshold: 0.5 }
    );
    secoes.forEach((s) => { const el = document.getElementById(s); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const pendenciasBloqueantes = pendencias.filter((p) => p.bloqueante && p.status === "ABERTA");
  const pendenciasNaoBloqueantes = pendencias.filter((p) => !p.bloqueante && p.status === "ABERTA");

  const camposObrigatorios = [
    imovel.matricula, imovel.cidade, negocio.valorTotal,
    negocio.parcelas.length > 0,
    ...vendedores.map((v) => v.nome && v.cpf),
    ...compradores.map((c) => c.nome && c.cpf),
  ];
  const camposPreenchidos = camposObrigatorios.filter(Boolean).length;
  const percentualConclusao = Math.round((camposPreenchidos / camposObrigatorios.length) * 100);

  const confirmarEnvio = async () => {
    if (!negocioId) return;
    setEnviando(true);
    try {
      await fetch(`/api/admin/negocio/${negocioId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enviadoAt: new Date().toISOString() }),
      });
      await fetch(`/api/admin/negocio/${negocioId}/fase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fase: "VALIDACAO_INTERNA" }),
      });
      setShowConfirmarModal(false);
      onConfirmar();
    } finally {
      setEnviando(false);
    }
  };

  const baixarPdf = async () => {
    if (!negocioId) return;
    window.open(`/api/admin/negocio/${negocioId}/pdf-resumo`, "_blank");
  };

  const SECOES_MENU = [
    { id: "imovel", label: "Imóvel" },
    { id: "negocio", label: "Negócio" },
    { id: "vendedores", label: "Vendedores" },
    { id: "compradores", label: "Compradores" },
    { id: "pendencias", label: "Pendências" },
  ];

  return (
    <div className="pb-32">
      {/* Indicador de conclusão */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-800">Operação {percentualConclusao}% completa</span>
          {pendencias.filter((p) => p.status === "ABERTA").length > 0 && (
            <span className="text-sm text-orange-500 font-medium">
              {pendencias.filter((p) => p.status === "ABERTA").length} pendências abertas
            </span>
          )}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${percentualConclusao}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6">
        {/* Menu lateral fixo */}
        <div className="hidden lg:block">
          <div className="sticky top-4 bg-white border border-gray-200 rounded-xl overflow-hidden">
            {SECOES_MENU.map((s) => (
              <button key={s.id} onClick={() => scrollTo(s.id)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  secaoAtiva === s.id ? "bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-600" : "text-gray-600 hover:bg-gray-50"}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conteúdo */}
        <div ref={contentRef} className="space-y-8">
          {/* Seção 1 — Imóvel */}
          <div>
            <SecaoHeader title="Seção 1 — Imóvel" id="imovel" />
            <CampoResumo label="Condomínio" value={imovel.condominio} origem="manual" />
            <CampoResumo label="Endereço" value={[imovel.logradouro, imovel.numero, imovel.cidade, imovel.uf].filter(Boolean).join(", ")} origem="extraido" />
            <CampoResumo label="Matrícula + CRI" value={imovel.matricula ? `${imovel.matricula}${imovel.cri ? ` — ${imovel.cri}` : ""}` : null} origem={imovel.matricula ? "extraido" : "pendente"} />
            <CampoResumo label="Inscrição fiscal" value={imovel.inscricaoFiscal} origem={imovel.inscricaoFiscal ? "extraido" : "pendente"} />
            <CampoResumo label="Situação" value={imovel.situacao?.replace("_", " ")} origem="extraido" />
            {(imovel.situacao === "FINANCIADO" || imovel.situacao === "ALIENACAO_FIDUCIARIA") && (
              <>
                <CampoResumo label="Saldo devedor" value={formatCurrency(imovel.saldoDevedor)} />
                <CampoResumo label="Banco credor" value={imovel.bancoCredor} />
              </>
            )}
            {imovel.laudemioDetectado && (
              <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
                ★ Laudêmio SPU detectado — cláusula incluída automaticamente na minuta.
              </div>
            )}
            {imovel.mobiliario && (
              <CampoResumo label="Mobiliário" value={`Sim (${(imovel.mobiliarioItens || []).filter(Boolean).join(", ") || "itens não especificados"})`} />
            )}
          </div>

          {/* Seção 2 — Negócio */}
          <div>
            <SecaoHeader title="Seção 2 — Negócio" id="negocio" />
            <CampoResumo label="Tipo de operação" value={negocio.tipoOperacao?.replace(/_/g, " ")} />
            <CampoResumo label="Valor total da venda" value={formatCurrency(negocio.valorTotal)} />
            <CampoResumo label="Comissão total" value={negocio.comissaoPercentual ? `${negocio.comissaoPercentual}% — ${formatCurrency(negocio.valorTotal ? negocio.valorTotal * negocio.comissaoPercentual / 100 : 0)}` : null} />
            <CampoResumo label="Quem paga" value={negocio.comissaoResponsavel} />
            <CampoResumo label="Valor líquido ao vendedor" value={negocio.valorTotal && negocio.comissaoPercentual ? formatCurrency(negocio.valorTotal * (1 - negocio.comissaoPercentual / 100)) : null} />
            <CampoResumo label="Posse" value={negocio.posseDefinicao ? `${negocio.posseDefinicao.replace(/_/g, " ")}${negocio.possePrazo ? ` — ${negocio.possePrazo}` : ""}` : null} />

            {negocio.parcelas.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-500 mb-2">Fluxo financeiro destrinchado por parcela:</p>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-4 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500">
                    <span>Parcela</span><span>Data/Condição</span><span className="text-right">Total</span><span className="text-right">Comissão</span>
                  </div>
                  {negocio.parcelas.map((p) => {
                    const comissaoParcela = negocio.comissaoPercentual ? p.valor * negocio.comissaoPercentual / 100 : 0;
                    return (
                      <div key={p.id} className="grid grid-cols-4 px-3 py-2 text-xs border-t border-gray-100">
                        <span className="font-medium">{p.tipo.charAt(0) + p.tipo.slice(1).toLowerCase()}</span>
                        <span className="text-gray-500">{p.condicao || (p.data ? new Date(p.data).toLocaleDateString("pt-BR") : "—")}</span>
                        <span className="text-right font-medium">{formatCurrency(p.valor)}</span>
                        <span className="text-right text-gray-500">{formatCurrency(comissaoParcela)}</span>
                      </div>
                    );
                  })}
                  <div className="grid grid-cols-4 px-3 py-2 text-xs bg-gray-50 border-t border-gray-200 font-semibold">
                    <span>Total</span><span></span>
                    <span className="text-right">{formatCurrency(negocio.parcelas.reduce((a, p) => a + p.valor, 0))}</span>
                    <span className="text-right">{formatCurrency(negocio.parcelas.reduce((a, p) => a + p.valor * (negocio.comissaoPercentual || 0) / 100, 0))}</span>
                  </div>
                </div>
              </div>
            )}

            {negocio.corretores.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-500 mb-2">Corretores:</p>
                {negocio.corretores.map((c, i) => (
                  <div key={c.id} className="border border-gray-200 rounded-lg px-3 py-2 mb-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">{c.nome || `Corretor ${i + 1}`}{c.creci ? ` — ${c.creci}` : ""}{c.empresa ? ` — ${c.empresa}` : ""}</span>
                      <span>{c.percentual}% — {formatCurrency(negocio.valorTotal ? negocio.valorTotal * (negocio.comissaoPercentual || 0) / 100 * c.percentual / 100 : 0)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Seção 3 — Vendedores */}
          <div>
            <SecaoHeader title="Seção 3 — Vendedor(es)" id="vendedores" />
            {vendedores.map((v, i) => (
              <div key={v.id} className="mb-4 border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-purple-700 mb-2">Vendedor {i + 1}</p>
                <CampoResumo label="Nome" value={v.nome} origem={v.nome ? "extraido" : "pendente"} />
                <CampoResumo label="CPF" value={v.cpf} origem={v.cpf ? "manual" : "pendente"} />
                <CampoResumo label="Estado civil" value={v.estadoCivil} origem={v.estadoCivil ? "extraido" : "pendente"} />
                {v.regimeBens && <CampoResumo label="Regime de bens" value={v.regimeBens} origem="extraido" />}
                {v.conjuge && <CampoResumo label="Cônjuge" value={v.conjuge} origem="extraido" />}
                <CampoResumo label="Endereço" value={v.cep ? `CEP ${v.cep}` : null} origem={v.cep ? "extraido" : "pendente"} />
              </div>
            ))}
          </div>

          {/* Seção 4 — Compradores */}
          <div>
            <SecaoHeader title="Seção 4 — Comprador(es)" id="compradores" />
            {compradores.map((c, i) => (
              <div key={c.id} className="mb-4 border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-green-700 mb-2">Comprador {i + 1}</p>
                <CampoResumo label="Nome" value={c.nome} origem={c.nome ? "extraido" : "pendente"} />
                <CampoResumo label="CPF" value={c.cpf} origem={c.cpf ? "manual" : "pendente"} />
                <CampoResumo label="Estado civil" value={c.estadoCivil} />
                {c.usaFgts && <CampoResumo label="FGTS" value={c.fgtsConta ? `Conta: ${c.fgtsConta}` : "Ativo"} />}
              </div>
            ))}
          </div>

          {/* Seção 5 — Pendências */}
          <div>
            <SecaoHeader title="Seção 5 — Pendências" id="pendencias" />
            {loadingPendencias ? (
              <div className="flex justify-center py-4"><RiLoader4Line className="w-5 h-5 animate-spin text-gray-400" /></div>
            ) : pendencias.filter((p) => p.status === "ABERTA").length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">
                <RiCheckLine className="w-4 h-4" /> Nenhuma pendência em aberto
              </div>
            ) : (
              <div className="space-y-3">
                {pendenciasBloqueantes.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-red-600 mb-2">Bloqueiam a geração da minuta:</p>
                    {pendenciasBloqueantes.map((p) => (
                      <div key={p.id} className="border border-red-200 bg-red-50 rounded-xl p-3 mb-2">
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <RiCloseLine className="w-2.5 h-2.5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-red-700">{p.campo}</p>
                            <p className="text-xs text-red-600 mt-0.5">{p.descricao}</p>
                            {p.responsavel && <p className="text-xs text-red-400 mt-0.5">Responsável: {p.responsavel}</p>}
                          </div>
                        </div>
                        <button className="mt-2 text-xs text-red-600 font-medium hover:text-red-700">
                          Resolver agora →
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {pendenciasNaoBloqueantes.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-orange-600 mb-2">Pendentes na minuta (não bloqueantes):</p>
                    {pendenciasNaoBloqueantes.map((p) => (
                      <div key={p.id} className="border border-orange-200 bg-orange-50 rounded-xl p-3 mb-2">
                        <div className="flex items-start gap-2">
                          <RiAlertLine className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-orange-700">{p.campo}</p>
                            <p className="text-xs text-orange-600 mt-0.5">{p.descricao}</p>
                            <p className="text-xs text-orange-400 mt-0.5">Na minuta: campo aparecerá como [PENDENTE]</p>
                          </div>
                        </div>
                        <button className="mt-2 text-xs text-orange-600 font-medium hover:text-orange-700">
                          Resolver agora →
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmação */}
      {showConfirmarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Você está prestes a enviar este negócio para revisão.</h3>
            {pendencias.filter((p) => p.status === "ABERTA").length > 0 && (
              <p className="text-sm text-orange-600 mb-4">
                {pendencias.filter((p) => p.status === "ABERTA").length} pendências em aberto serão registradas.
              </p>
            )}
            <div className="bg-gray-50 rounded-xl p-3 mb-4 text-xs text-gray-600 space-y-1">
              <p>• Nossa equipe revisará as informações</p>
              <p>• Você pode voltar e complementar pendências a qualquer momento</p>
              <p>• Toda alteração notifica automaticamente a equipe</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirmarModal(false)} className="flex-1 py-2 text-sm font-medium border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={confirmarEnvio} disabled={enviando}
                className="flex-1 py-2 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
                {enviando ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : null}
                Confirmar envio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rodapé flutuante */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="relative">
            <button onClick={() => setShowVoltarMenu(!showVoltarMenu)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <RiArrowLeftLine className="w-4 h-4" />
              Voltar e corrigir
            </button>
            {showVoltarMenu && (
              <div className="absolute bottom-full mb-2 left-0 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden w-48">
                {["Imóvel", "Negócio", "Vendedor(es)", "Comprador(es)"].map((label, idx) => (
                  <button key={idx} onClick={() => { dispatch({ type: "SET_ETAPA", payload: idx + 1 }); setShowVoltarMenu(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-b last:border-0 border-gray-100">
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={baixarPdf}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <RiDownload2Line className="w-4 h-4" />
              Baixar PDF
            </button>
            <button onClick={() => setShowConfirmarModal(true)}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
              Confirmar e enviar
              <RiArrowRightLine className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
