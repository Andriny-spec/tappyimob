"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  RiHome4Line,
  RiMoneyDollarCircleLine,
  RiUserLine,
  RiUserAddLine,
  RiFileList3Line,
  RiCheckLine,
  RiArrowRightLine,
  RiArrowLeftLine,
  RiSaveLine,
  RiLoader4Line,
} from "react-icons/ri";
import { WizardProvider, useWizard } from "@/components/admin/negocio/WizardContext";
import { WizardEtapaImovel } from "@/components/admin/negocio/WizardEtapaImovel";
import { WizardEtapaNegocio } from "@/components/admin/negocio/WizardEtapaNegocio";
import { WizardEtapaParte } from "@/components/admin/negocio/WizardEtapaParte";
import { WizardEtapaResumo } from "@/components/admin/negocio/WizardEtapaResumo";

const ETAPAS = [
  { numero: 1, label: "Imóvel e Vendedor(es)", icon: RiHome4Line },
  { numero: 2, label: "Comprador(es)", icon: RiUserAddLine },
  { numero: 3, label: "Negócio", icon: RiMoneyDollarCircleLine },
  { numero: 4, label: "Resumo", icon: RiFileList3Line },
];

function WizardShell() {
  const router = useRouter();
  const { state, dispatch } = useWizard();
  const [saving, setSaving] = useState(false);
  const [erroFluxo, setErroFluxo] = useState<string | null>(null);

  const salvarRascunho = useCallback(async (silent = true) => {
    if (!state.negocioId) return;
    if (!silent) setSaving(true);
    try {
      const body: any = {
        tipoOperacao: state.negocio.tipoOperacao,
        tipoNegocio: state.negocio.tipoNegocio || "VENDA",
        ...state.imovel.matricula ? { imovelMatricula: state.imovel.matricula } : {},
        ...state.imovel.condominio ? { imovelCondominio: state.imovel.condominio } : {},
        ...state.imovel.endereco ? { imovelEndereco: state.imovel.endereco } : {},
        ...state.imovel.cep ? { imovelCep: state.imovel.cep } : {},
        ...state.imovel.logradouro ? { imovelLogradouro: state.imovel.logradouro } : {},
        ...state.imovel.numero ? { imovelNumero: state.imovel.numero } : {},
        ...state.imovel.complemento ? { imovelComplemento: state.imovel.complemento } : {},
        ...state.imovel.cidade ? { imovelCidade: state.imovel.cidade } : {},
        ...state.imovel.uf ? { imovelUf: state.imovel.uf } : {},
        ...state.imovel.cri ? { imovelCri: state.imovel.cri } : {},
        ...state.imovel.inscricaoFiscal ? { imovelInscricaoFiscal: state.imovel.inscricaoFiscal } : {},
        ...state.imovel.situacao ? { imovelSituacao: state.imovel.situacao } : {},
        ...state.imovel.saldoDevedor != null ? { imovelSaldoDevedor: state.imovel.saldoDevedor } : {},
        ...state.imovel.bancoCredor ? { imovelBancoCredor: state.imovel.bancoCredor } : {},
        imovelMobiliario: state.imovel.mobiliario || false,
        ...state.imovel.mobiliarioItens ? { imovelMobiliarioItens: state.imovel.mobiliarioItens } : {},
        ...state.negocio.valorTotal != null ? { valorTotal: state.negocio.valorTotal } : {},
        ...state.negocio.comissaoPercentual != null ? { comissaoPercentual: state.negocio.comissaoPercentual } : {},
        ...state.negocio.comissaoResponsavel ? { comissaoResponsavel: state.negocio.comissaoResponsavel } : {},
        ...state.negocio.posseDefinicao ? { posseDefinicao: state.negocio.posseDefinicao } : {},
        ...state.negocio.possePrazo ? { possePrazo: state.negocio.possePrazo } : {},
        permutaAtiva: state.negocio.permutaAtiva || false,
        ...state.negocio.dadosAdicionais ? { dadosAdicionais: state.negocio.dadosAdicionais } : {},
      };

      await fetch(`/api/admin/negocio/${state.negocioId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      // Sincronizar partes, parcelas, corretores
      await syncPartes();
      await syncParcelas();
      await syncCorretores();
    } finally {
      if (!silent) setSaving(false);
    }
  }, [state]);

  const syncPartes = async () => {
    if (!state.negocioId) return;
    const todasPartes = [...state.vendedores, ...state.compradores];
    for (const parte of todasPartes) {
      const { id: _id, ...dadosParte } = parte;
      await fetch(`/api/admin/negocio/${state.negocioId}/partes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosParte),
      });
    }
  };

  const syncParcelas = async () => {
    if (!state.negocioId) return;
    await fetch(`/api/admin/negocio/${state.negocioId}/parcelas`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state.negocio.parcelas),
    });
  };

  const syncCorretores = async () => {
    if (!state.negocioId) return;
    await fetch(`/api/admin/negocio/${state.negocioId}/corretores`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state.negocio.corretores),
    });
  };

  const validarEtapaAtual = (): string | null => {
    // Etapa 3 = Negócio (fluxo financeiro deve fechar)
    if (state.etapaAtual === 3) {
      if (state.negocio.valorTotal && state.negocio.parcelas.length > 0) {
        const soma = state.negocio.parcelas.reduce((acc, p) => acc + (p.valor || 0), 0);
        const diff = Math.abs(soma - state.negocio.valorTotal);
        if (diff > 0.01) {
          return `Fluxo financeiro não fecha. Diferença: R$ ${diff.toFixed(2)}`;
        }
      }
    }
    return null;
  };

  const avancar = async () => {
    const erro = validarEtapaAtual();
    if (erro) { setErroFluxo(erro); return; }
    setErroFluxo(null);
    await salvarRascunho(true);
    if (state.etapaAtual < 4) {
      dispatch({ type: "SET_ETAPA", payload: state.etapaAtual + 1 });
    }
  };

  const voltar = () => {
    setErroFluxo(null);
    if (state.etapaAtual > 1) dispatch({ type: "SET_ETAPA", payload: state.etapaAtual - 1 });
  };

  const [erroInicial, setErroInicial] = useState<string | null>(null);

  const criarNegocio = async () => {
    setSaving(true);
    setErroInicial(null);
    try {
      const res = await fetch("/api/admin/negocio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipoOperacao: "PADRAO" }),
      });
      const data = await res.json();
      if (data.id) {
        dispatch({ type: "SET_NEGOCIO_ID", payload: data.id });
      } else {
        setErroInicial(data.error || "Não foi possível iniciar o negócio. Tente novamente.");
      }
    } catch {
      setErroInicial("Falha de conexão ao iniciar o negócio. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  // Inicializar: criar novo ou carregar existente
  useEffect(() => {
    if (state.negocioId) return; // já tem ID
    if (editId) {
      // Carregar negócio existente para edição
      dispatch({ type: "SET_NEGOCIO_ID", payload: editId });
      fetch(`/api/admin/negocio/${editId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.id) {
            // Mapear dados do backend para o estado do wizard
            dispatch({ type: "UPDATE_IMOVEL", payload: {
              matricula: data.imovelMatricula,
              condominio: data.imovelCondominio,
              endereco: data.imovelEndereco,
              cep: data.imovelCep,
              logradouro: data.imovelLogradouro,
              numero: data.imovelNumero,
              complemento: data.imovelComplemento,
              cidade: data.imovelCidade,
              uf: data.imovelUf,
              cri: data.imovelCri,
              inscricaoFiscal: data.imovelInscricaoFiscal,
              situacao: data.imovelSituacao,
              saldoDevedor: data.imovelSaldoDevedor,
              bancoCredor: data.imovelBancoCredor,
              mobiliario: data.imovelMobiliario,
              mobiliarioItens: data.imovelMobiliarioItens,
            }});
            dispatch({ type: "UPDATE_NEGOCIO", payload: {
              tipoOperacao: data.tipoOperacao || "PADRAO",
              tipoNegocio: data.tipoNegocio || "VENDA",
              valorTotal: data.valorTotal,
              comissaoPercentual: data.comissaoPercentual,
              comissaoResponsavel: data.comissaoResponsavel,
              posseDefinicao: data.posseDefinicao,
              possePrazo: data.possePrazo,
              dadosAdicionais: data.dadosAdicionais,
              parcelas: (data.parcelas || []).map((p: any) => ({
                id: p.id, tipo: p.tipo, valor: p.valor, condicao: p.condicao, data: p.data,
              })),
              corretores: (data.corretores || []).map((c: any) => ({
                id: c.id, nome: c.nome, creci: c.creci, empresa: c.empresa,
                percentual: c.percentual, formaPagamento: c.formaPagamento || "ATRELADA",
              })),
            }});
            if (data.partes?.length) {
              const vend = data.partes.filter((p: any) => p.tipo === "VENDEDOR");
              const comp = data.partes.filter((p: any) => p.tipo === "COMPRADOR");
              if (vend.length) dispatch({ type: "SET_VENDEDORES", payload: vend });
              if (comp.length) dispatch({ type: "SET_COMPRADORES", payload: comp });
            }
          }
        })
        .catch(() => {});
    } else if (!saving) {
      criarNegocio();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const etapaAtual = state.etapaAtual;
  const modoEdicao = !!editId;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{modoEdicao ? "Editar Negócio" : "Novo Negócio"}</h1>
            {state.negocioId && (
              <p className="text-xs text-gray-400 mt-0.5">Rascunho salvo automaticamente</p>
            )}
          </div>
          <button
            onClick={() => router.push("/admin/negocio")}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancelar
          </button>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center gap-0">
            {ETAPAS.map((etapa, idx) => {
              const Icon = etapa.icon;
              const ativa = etapa.numero === etapaAtual;
              const concluida = etapa.numero < etapaAtual;
              return (
                <div key={etapa.numero} className="flex items-center flex-1 last:flex-none">
                  <button
                    onClick={() => concluida && dispatch({ type: "SET_ETAPA", payload: etapa.numero })}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      ativa
                        ? "bg-blue-50 text-blue-700"
                        : concluida
                        ? "text-green-600 hover:bg-green-50 cursor-pointer"
                        : "text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        ativa ? "bg-blue-600 text-white" : concluida ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {concluida ? <RiCheckLine className="w-3 h-3" /> : etapa.numero}
                    </div>
                    <span className="hidden sm:inline">{etapa.label}</span>
                  </button>
                  {idx < ETAPAS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 ${concluida ? "bg-green-300" : "bg-gray-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Conteúdo da etapa */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        {!state.negocioId ? (
          erroInicial ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <p className="text-sm text-red-600 text-center max-w-md">{erroInicial}</p>
              <button onClick={criarNegocio} disabled={saving}
                className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {saving ? "Tentando..." : "Tentar novamente"}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <RiLoader4Line className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          )
        ) : (
          <>
            {etapaAtual === 1 && (
              <div className="space-y-8">
                <WizardEtapaImovel />
                <div className="pt-6 border-t border-gray-200">
                  <WizardEtapaParte tipo="VENDEDOR" />
                </div>
              </div>
            )}
            {etapaAtual === 2 && <WizardEtapaParte tipo="COMPRADOR" />}
            {etapaAtual === 3 && <WizardEtapaNegocio erroFluxo={erroFluxo} />}
            {etapaAtual === 4 && <WizardEtapaResumo onConfirmar={() => router.push("/admin/negocio")} />}
          </>
        )}
      </div>

      {/* Rodapé de navegação */}
      {etapaAtual < 4 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 z-20">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <button
              onClick={voltar}
              disabled={etapaAtual === 1}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RiArrowLeftLine className="w-4 h-4" />
              Voltar
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => salvarRascunho(false)}
                disabled={saving || !state.negocioId}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg disabled:opacity-40"
              >
                {saving ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiSaveLine className="w-4 h-4" />}
                Salvar rascunho
              </button>

              <button
                onClick={avancar}
                disabled={saving || !state.negocioId}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40"
              >
                {etapaAtual === 3 ? "Ver resumo" : "Continuar"}
                <RiArrowRightLine className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NovoNegocioPage() {
  return (
    <Suspense>
      <WizardProvider>
        <WizardShell />
      </WizardProvider>
    </Suspense>
  );
}
