"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  RiArrowLeftLine, RiLoader4Line, RiAlertLine, RiCheckLine,
  RiCloseLine, RiEditLine, RiFileTextLine, RiDownload2Line,
  RiArrowRightLine, RiArrowLeftSLine,
} from "react-icons/ri";

// Ordem do fluxo (mesma sequência do painel)
const FASES_LABELS: Record<string, string> = {
  DADOS_RECEBIDOS: "Dados recebidos",
  EXTRACAO_IA: "Extração IA",
  PENDENTE_DOC: "Pendente Documentação",
  VALIDACAO_INTERNA: "Validação Interna",
  MINUTA_GERADA: "Minuta Gerada",
  REVISAO_JURIDICA: "Revisão Jurídica",
  VALIDACAO_PARTES: "Revisão das Partes",
  PRONTO_ASSINATURA: "Assinatura",
};

const FASES_ORDEM = Object.keys(FASES_LABELS);

function formatCurrency(v?: number | null) {
  if (!v) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function SecaoCard({ title, children, badge }: { title: string; children: React.ReactNode; badge?: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        {badge}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Campo({ label, value, sub }: { label: string; value?: string | null; sub?: string }) {
  return (
    <div className="flex items-start justify-between py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-500 w-2/5">{label}</span>
      <span className="text-xs font-medium text-gray-800 w-3/5 text-right">
        {value || <span className="text-orange-400">⚠ Pendente</span>}
        {sub && <span className="block text-gray-400 font-normal">{sub}</span>}
      </span>
    </div>
  );
}

function AnotacoesContrato({ negocioId, initialValue, onSaved }: { negocioId: string; initialValue: string; onSaved: () => void }) {
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    await fetch(`/api/admin/negocio/${negocioId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anotacoesContrato: value }),
    });
    setSaving(false);
    onSaved();
  };
  return (
    <div className="bg-white border border-blue-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
        <h3 className="text-sm font-semibold text-blue-800">📝 Caixa de anotações do contrato</h3>
        <p className="text-xs text-blue-600 mt-0.5">Comentários, considerações e orientações — alimentam a IA e ficam no histórico deste negócio</p>
      </div>
      <div className="p-4">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={5}
          placeholder="Ex.: Cláusula de preferência de compra do cônjuge deve ser incluída. Conferir concordância da incorporadora. Ajustar data de posse conforme acordo verbal..."
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <button onClick={save} disabled={saving}
          className="mt-2 flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40">
          {saving ? "Salvando..." : "Salvar anotações"}
        </button>
      </div>
    </div>
  );
}

export default function NegocioDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [negocio, setNegocio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [gerandoMinuta, setGerandoMinuta] = useState(false);
  const [salvandoObs, setSalvandoObs] = useState(false);
  const [observacoes, setObservacoes] = useState("");
  const [avancandoFase, setAvancandoFase] = useState(false);

  const fetchNegocio = async () => {
    try {
      const res = await fetch(`/api/admin/negocio/${id}`);
      const data = await res.json();
      setNegocio(data);
      setObservacoes(data.observacoesJuridico || "");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNegocio(); }, [id]);

  const salvarObservacoes = async () => {
    setSalvandoObs(true);
    await fetch(`/api/admin/negocio/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ observacoesJuridico: observacoes }),
    });
    setSalvandoObs(false);
  };

  const avancarFase = async (novaFase: string) => {
    setAvancandoFase(true);
    const res = await fetch(`/api/admin/negocio/${id}/fase`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fase: novaFase }),
    });
    if (res.ok) await fetchNegocio();
    setAvancandoFase(false);
  };

  const gerarMinuta = async () => {
    setGerandoMinuta(true);
    const res = await fetch(`/api/admin/negocio/${id}/minuta`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      if (data.docxUrl) window.open(data.docxUrl, "_blank");
      await fetchNegocio();
    }
    setGerandoMinuta(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RiLoader4Line className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }
  if (!negocio || negocio.error) {
    return <div className="p-6 text-red-500">Negócio não encontrado</div>;
  }

  const pendenciasBloqueantes = negocio.pendencias?.filter((p: any) => p.bloqueante && p.status === "ABERTA") || [];
  const pendenciasAbertas = negocio.pendencias?.filter((p: any) => p.status === "ABERTA") || [];
  const faseAtualIdx = FASES_ORDEM.indexOf(negocio.fase);
  const faseSeguinte = FASES_ORDEM[faseAtualIdx + 1];
  const faseAnterior = FASES_ORDEM[faseAtualIdx - 1];

  const podeGerarMinuta = pendenciasBloqueantes.length === 0;

  // Checklist de bloqueantes para geração da minuta
  const checklist = [
    { label: "Matrícula anexada", ok: !pendenciasBloqueantes.some((p: any) => p.campo === "imovelMatricula") },
    { label: "Fluxo financeiro fechado", ok: !pendenciasBloqueantes.some((p: any) => p.campo === "fluxoFinanceiro") },
    { label: "Comissões fechadas (100%)", ok: !pendenciasBloqueantes.some((p: any) => p.campo === "comissoesCorretores") },
    { label: "Anuência incorporadora", ok: !pendenciasBloqueantes.some((p: any) => p.campo === "anuenciaIncorporadora") },
  ];

  const vendedores = negocio.partes?.filter((p: any) => p.tipo === "VENDEDOR") || [];
  const compradores = negocio.partes?.filter((p: any) => p.tipo === "COMPRADOR") || [];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push("/admin/negocio")} className="text-gray-400 hover:text-gray-600">
          <RiArrowLeftLine className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">{negocio.codigo}</h1>
            <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
              {FASES_LABELS[negocio.fase]}
            </span>
            {pendenciasBloqueantes.length > 0 && (
              <span className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-full font-medium flex items-center gap-1">
                <RiAlertLine className="w-3 h-3" />
                {pendenciasBloqueantes.length} bloqueante(s)
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {negocio.imovelCondominio || negocio.imovelEndereco || "Sem endereço"} •{" "}
            {negocio.corretor?.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => router.push(`/admin/negocio/novo?edit=${id}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-50 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-100">
            <RiEditLine className="w-3.5 h-3.5" />
            Editar dados
          </button>
          {faseAnterior && (
            <button onClick={() => avancarFase(faseAnterior)} disabled={avancandoFase}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40">
              <RiArrowLeftSLine className="w-4 h-4" />
              Retroceder fase
            </button>
          )}
          {faseSeguinte && (
            <button onClick={() => avancarFase(faseSeguinte)} disabled={avancandoFase}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40">
              {avancandoFase ? <RiLoader4Line className="w-3 h-3 animate-spin" /> : null}
              Avançar fase
              <RiArrowRightLine className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Esteira de fases */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
        {FASES_ORDEM.map((fase, idx) => {
          const ativa = fase === negocio.fase;
          const concluida = idx < faseAtualIdx;
          return (
            <div key={fase} className="flex items-center gap-1 flex-shrink-0">
              <div className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                ativa ? "bg-blue-600 text-white" :
                concluida ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                {idx + 1}. {FASES_LABELS[fase]}
              </div>
              {idx < FASES_ORDEM.length - 1 && <div className={`w-4 h-0.5 ${concluida ? "bg-green-300" : "bg-gray-200"}`} />}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Coluna esquerda — dados do dossiê */}
        <div className="space-y-4">
          {/* Imóvel */}
          <SecaoCard title="Imóvel">
            <Campo label="Condomínio" value={negocio.imovelCondominio} />
            <Campo label="Endereço" value={[negocio.imovelLogradouro, negocio.imovelNumero, negocio.imovelCidade, negocio.imovelUf].filter(Boolean).join(", ")} />
            <Campo label="Matrícula + CRI" value={negocio.imovelMatricula ? `${negocio.imovelMatricula}${negocio.imovelCri ? ` — ${negocio.imovelCri}` : ""}` : null} />
            <Campo label="Inscrição fiscal" value={negocio.imovelInscricaoFiscal} />
            <Campo label="Situação" value={negocio.imovelSituacao} />
            {negocio.imovelSaldoDevedor && <Campo label="Saldo devedor" value={formatCurrency(negocio.imovelSaldoDevedor)} />}
            {negocio.imovelBancoCredor && <Campo label="Banco credor" value={negocio.imovelBancoCredor} />}
            {negocio.imovelLaudemioDetectado && (
              <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
                ★ Laudêmio SPU detectado — cláusula incluída automaticamente na minuta.
              </div>
            )}
          </SecaoCard>

          {/* Negócio */}
          <SecaoCard title="Negócio">
            <Campo label="Tipo de operação" value={negocio.tipoOperacao?.replace(/_/g, " ")} />
            <Campo label="Valor total" value={formatCurrency(negocio.valorTotal)} />
            <Campo label="Comissão" value={negocio.comissaoPercentual ? `${negocio.comissaoPercentual}% — ${formatCurrency(negocio.comissaoValor)}` : null} />
            <Campo label="Quem paga" value={negocio.comissaoResponsavel} />
            <Campo label="Posse" value={negocio.posseDefinicao ? `${negocio.posseDefinicao.replace(/_/g, " ")}${negocio.possePrazo ? ` — ${negocio.possePrazo}` : ""}` : null} />
            {negocio.parcelas?.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-500 mb-2">Fluxo financeiro:</p>
                <div className="border border-gray-100 rounded-lg overflow-hidden">
                  {negocio.parcelas.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between px-3 py-2 border-b border-gray-50 last:border-0 text-xs">
                      <span className="font-medium">{p.tipo}</span>
                      <span className="text-gray-500">{p.condicao || "—"}</span>
                      <span className="font-semibold">{formatCurrency(p.valor)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SecaoCard>

          {/* Corretores envolvidos */}
          {negocio.corretores?.length > 0 && (
            <SecaoCard title="Corretores envolvidos">
              {negocio.corretores.map((c: any, i: number) => (
                <div key={c.id} className="py-2 border-b last:border-0 border-gray-50">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">{c.nome}</span>
                    <span>{c.percentual}%</span>
                  </div>
                  {(c.creci || c.empresa) && (
                    <p className="text-xs text-gray-400">{[c.creci, c.empresa].filter(Boolean).join(" — ")}</p>
                  )}
                </div>
              ))}
            </SecaoCard>
          )}

          {/* Vendedores */}
          {vendedores.map((v: any, i: number) => (
            <SecaoCard key={v.id} title={`Vendedor ${i + 1}`}>
              <Campo label="Nome" value={v.nome} />
              <Campo label="CPF" value={v.cpf} />
              <Campo label="Estado civil" value={v.estadoCivil} />
              {v.regimeBens && <Campo label="Regime de bens" value={v.regimeBens} />}
              {v.conjuge && <Campo label="Cônjuge" value={v.conjuge} />}
              <Campo label="CEP" value={v.cep} />
            </SecaoCard>
          ))}

          {/* Compradores */}
          {compradores.map((c: any, i: number) => (
            <SecaoCard key={c.id} title={`Comprador ${i + 1}`}>
              <Campo label="Nome" value={c.nome} />
              <Campo label="CPF" value={c.cpf} />
              <Campo label="Estado civil" value={c.estadoCivil} />
              {c.regimeBens && <Campo label="Regime de bens" value={c.regimeBens} />}
              {c.usaFgts && <Campo label="FGTS" value={c.fgtsConta ? `Conta: ${c.fgtsConta}` : "Ativo"} />}
              {c.isEstrangeiro && (
                <div className="mt-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-xs text-amber-700">
                  ★ Comprador estrangeiro — verificar RNE e restrições SPU.
                </div>
              )}
            </SecaoCard>
          ))}

          {/* Pendências */}
          <SecaoCard title="Pendências" badge={pendenciasAbertas.length > 0 ? (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{pendenciasAbertas.length} abertas</span>
          ) : null}>
            {pendenciasAbertas.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <RiCheckLine className="w-4 h-4" /> Nenhuma pendência em aberto
              </div>
            ) : (
              <div className="space-y-2">
                {pendenciasAbertas.map((p: any) => (
                  <div key={p.id} className={`border rounded-xl p-3 ${p.bloqueante ? "border-red-200 bg-red-50" : "border-orange-200 bg-orange-50"}`}>
                    <div className="flex items-start gap-2">
                      {p.bloqueante ? <RiCloseLine className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" /> :
                        <RiAlertLine className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />}
                      <div>
                        <p className={`text-xs font-semibold ${p.bloqueante ? "text-red-700" : "text-orange-700"}`}>{p.campo}</p>
                        <p className={`text-xs mt-0.5 ${p.bloqueante ? "text-red-600" : "text-orange-600"}`}>{p.descricao}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SecaoCard>

          {/* Seção Jurídico — só admin */}
          <SecaoCard title="★ Seção Jurídico (Admin)" badge={<span className="text-xs text-purple-600 font-medium">Invisível ao corretor</span>}>
            <div className="space-y-2 mb-4">
              {pendenciasAbertas.filter((p: any) => p.responsavel === "Jurídico").length === 0 && (
                <p className="text-xs text-gray-400">Nenhum alerta jurídico no momento</p>
              )}
              {pendenciasAbertas.filter((p: any) => p.responsavel === "Jurídico").map((p: any) => (
                <div key={p.id} className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 text-xs text-purple-700">
                  ★ {p.descricao}
                </div>
              ))}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Observações para geração da minuta
                <span className="ml-1 text-gray-400 font-normal">(não vai para o contrato)</span>
              </label>
              <textarea rows={3} value={observacoes} onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Diretrizes, instruções ou alertas para quem vai revisar ou finalizar a minuta..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              <button onClick={salvarObservacoes} disabled={salvandoObs}
                className="mt-1 text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-40">
                {salvandoObs ? "Salvando..." : "Salvar observações"}
              </button>
            </div>
          </SecaoCard>

          {/* Caixa de anotações do contrato (item 15) */}
          <AnotacoesContrato negocioId={id} initialValue={negocio.anotacoesContrato || ""} onSaved={fetchNegocio} />

          {/* Log de alterações */}
          {negocio.logs?.length > 0 && (
            <SecaoCard title="Log de alterações">
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {negocio.logs.slice(0, 20).map((log: any) => (
                  <div key={log.id} className="flex items-start gap-2 text-xs py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-gray-400 w-32 flex-shrink-0">{new Date(log.createdAt).toLocaleString("pt-BR")}</span>
                    <span className="text-gray-600 flex-1">
                      <span className="font-medium">{log.campo}</span>
                      {log.valorAnterior && <span className="text-gray-400"> {log.valorAnterior} →</span>}
                      <span className="text-gray-700"> {log.valorNovo}</span>
                    </span>
                    <span className="text-gray-400 w-24 text-right truncate">{log.userName}</span>
                  </div>
                ))}
              </div>
            </SecaoCard>
          )}
        </div>

        {/* Coluna direita — painel de ações */}
        <div className="space-y-4">
          {/* Verificação de bloqueantes */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">Verificação antes de gerar</h3>
            </div>
            <div className="p-4 space-y-2">
              {checklist.map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-xs">
                  {item.ok ? (
                    <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                      <RiCheckLine className="w-3 h-3 text-green-600" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                      <RiCloseLine className="w-3 h-3 text-red-500" />
                    </div>
                  )}
                  <span className={item.ok ? "text-gray-600" : "text-red-600"}>{item.label}</span>
                </div>
              ))}
            </div>
            <div className="px-4 pb-4">
              {!podeGerarMinuta && (
                <p className="text-xs text-red-500 mb-3">Resolva os itens bloqueantes para liberar.</p>
              )}
              <button onClick={gerarMinuta} disabled={!podeGerarMinuta || gerandoMinuta}
                className={`w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                  podeGerarMinuta && !gerandoMinuta
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}>
                {gerandoMinuta ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiFileTextLine className="w-4 h-4" />}
                Gerar minuta
              </button>
            </div>
          </div>

          {/* Minutas geradas */}
          {negocio.minutas?.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700">Minutas geradas</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {negocio.minutas.map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-xs font-medium text-gray-700">Versão {m.versao}</p>
                      <p className="text-xs text-gray-400">{new Date(m.geradoAt).toLocaleString("pt-BR")} • {m.geradoPorNome}</p>
                    </div>
                    {m.docxUrl && (
                      <a href={m.docxUrl} target="_blank" rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700">
                        <RiDownload2Line className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resumo PDF */}
          <a href={`/api/admin/negocio/${id}/pdf-resumo`} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">
            <RiDownload2Line className="w-4 h-4" />
            Baixar PDF do resumo
          </a>
        </div>
      </div>
    </div>
  );
}
