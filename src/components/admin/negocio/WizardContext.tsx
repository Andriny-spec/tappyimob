"use client";

import { createContext, useContext, useReducer, ReactNode } from "react";

export type TipoOperacao =
  | "PADRAO"
  | "FINANCIAMENTO_QUITADO"
  | "FINANCIAMENTO_INTERVENIENTE"
  | "PARCELAMENTO_AF"
  | "PARCELAMENTO_SIMPLES"
  | "CESSAO_PLANTA"
  | "CESSAO_PRONTA"
  | "PERMUTA_IMOVEL"
  | "PERMUTA_VEICULO"
  | "PERMUTA_TORNA";

export type TipoNegocio = "VENDA" | "LOCACAO";
export type ParcelaTipo = "SINAL" | "INTERMEDIARIA" | "SALDO";

export interface Parcela {
  id: string;
  tipo: ParcelaTipo;
  valor: number;
  data?: string;
  condicao?: string;
  condicaoTipo?: "texto" | "marco"; // "marco" = lista predefinida
}

export interface CorretorEnvolvido {
  id: string;
  userId?: string; // vínculo com User do sistema
  nome: string;
  creci?: string;
  empresa?: string;
  percentual: number;
  formaPagamento: "ATRELADA" | "DATA_ESPECIFICA";
  parcelasVinculadas?: string[];
  dataEspecifica?: string;
}

export interface Parte {
  id: string;
  tipo: "VENDEDOR" | "COMPRADOR";
  // Pessoa física
  nome?: string;
  cpf?: string;
  rg?: string;
  rgExpedicao?: string;
  nascimento?: string;
  filiacaoMae?: string;
  filiacaoPai?: string;
  nacionalidade?: string;
  estadoCivil?: string;
  regimeBens?: string;
  conjuge?: string;
  // Endereço
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  cidade?: string;
  uf?: string;
  // Contato
  profissao?: string;
  email?: string;
  telefone?: string;
  banco?: string;
  agencia?: string;
  conta?: string;
  pix?: string;
  // Toggles
  isPessoaJuridica?: boolean;
  cnpj?: string;
  razaoSocial?: string;
  representanteNome?: string;
  representanteCpf?: string;
  temProcuracao?: boolean;
  procuradorNome?: string;
  procuradorCpf?: string;
  usaFgts?: boolean;
  fgtsConta?: string;
  fgtsBanco?: string;
  isEstrangeiro?: boolean;
}

export interface WizardState {
  negocioId: string | null;
  etapaAtual: number;
  salvandoRascunho: boolean;

  imovel: {
    condominio?: string;
    endereco?: string;
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    cidade?: string;
    uf?: string;
    matricula?: string;
    matriculaVencida?: boolean;
    cri?: string;
    inscricaoFiscal?: string;
    situacao?: "QUITADO" | "FINANCIADO" | "ALIENACAO_FIDUCIARIA";
    saldoDevedor?: number;
    bancoCredor?: string;
    mobiliario?: boolean;
    mobiliarioItens?: string[];
    laudemioDetectado?: boolean;
  };

  negocio: {
    tipoNegocio: TipoNegocio;
    tipoOperacao: TipoOperacao;
    permutaAtiva?: boolean;
    permutaDados?: Record<string, any>;
    valorTotal?: number;
    comissaoPercentual?: number;
    comissaoResponsavel?: "VENDEDOR" | "COMPRADOR" | "DIVIDIDO";
    comissaoVendedorPct?: number;
    comissaoCompradorPct?: number;
    parcelas: Parcela[];
    corretores: CorretorEnvolvido[];
    posseDefinicao?: "DATA_FIXA" | "PARCELA" | "PRAZO_ASSINATURA" | "PRAZO_EVENTO";
    possePrazo?: string;
    posseParcelaId?: string; // parcela vinculada à posse
    posseEventoTipo?: "NA_QUITACAO" | "DIAS_APOS_QUITACAO";
    posseEventoDias?: number;
    dadosAdicionais?: Record<string, any>;
  };

  vendedores: Parte[];
  compradores: Parte[];
}

const initialState: WizardState = {
  negocioId: null,
  etapaAtual: 1,
  salvandoRascunho: false,
  imovel: {},
  negocio: {
    tipoNegocio: "VENDA",
    tipoOperacao: "PADRAO",
    parcelas: [],
    corretores: [],
  },
  vendedores: [{ id: "v1", tipo: "VENDEDOR", nacionalidade: "brasileiro(a)" }],
  compradores: [{ id: "c1", tipo: "COMPRADOR", nacionalidade: "brasileiro(a)" }],
};

type Action =
  | { type: "SET_NEGOCIO_ID"; payload: string }
  | { type: "SET_ETAPA"; payload: number }
  | { type: "SET_SALVANDO"; payload: boolean }
  | { type: "UPDATE_IMOVEL"; payload: Partial<WizardState["imovel"]> }
  | { type: "UPDATE_NEGOCIO"; payload: Partial<WizardState["negocio"]> }
  | { type: "SET_PARCELAS"; payload: Parcela[] }
  | { type: "SET_CORRETORES"; payload: CorretorEnvolvido[] }
  | { type: "SET_VENDEDORES"; payload: Parte[] }
  | { type: "UPDATE_VENDEDOR"; payload: { id: string; data: Partial<Parte> } }
  | { type: "ADD_VENDEDOR" }
  | { type: "REMOVE_VENDEDOR"; payload: string }
  | { type: "SET_COMPRADORES"; payload: Parte[] }
  | { type: "UPDATE_COMPRADOR"; payload: { id: string; data: Partial<Parte> } }
  | { type: "ADD_COMPRADOR" }
  | { type: "REMOVE_COMPRADOR"; payload: string }
  | { type: "LOAD_FROM_NEGOCIO"; payload: Partial<WizardState> };

function reducer(state: WizardState, action: Action): WizardState {
  switch (action.type) {
    case "SET_NEGOCIO_ID": return { ...state, negocioId: action.payload };
    case "SET_ETAPA": return { ...state, etapaAtual: action.payload };
    case "SET_SALVANDO": return { ...state, salvandoRascunho: action.payload };
    case "UPDATE_IMOVEL": return { ...state, imovel: { ...state.imovel, ...action.payload } };
    case "UPDATE_NEGOCIO": return { ...state, negocio: { ...state.negocio, ...action.payload } };
    case "SET_PARCELAS": return { ...state, negocio: { ...state.negocio, parcelas: action.payload } };
    case "SET_CORRETORES": return { ...state, negocio: { ...state.negocio, corretores: action.payload } };
    case "SET_VENDEDORES": return { ...state, vendedores: action.payload };
    case "UPDATE_VENDEDOR":
      return { ...state, vendedores: state.vendedores.map((v) => v.id === action.payload.id ? { ...v, ...action.payload.data } : v) };
    case "ADD_VENDEDOR":
      return { ...state, vendedores: [...state.vendedores, { id: `v${Date.now()}`, tipo: "VENDEDOR", nacionalidade: "brasileiro(a)" }] };
    case "REMOVE_VENDEDOR":
      return { ...state, vendedores: state.vendedores.filter((v) => v.id !== action.payload) };
    case "SET_COMPRADORES": return { ...state, compradores: action.payload };
    case "UPDATE_COMPRADOR":
      return { ...state, compradores: state.compradores.map((c) => c.id === action.payload.id ? { ...c, ...action.payload.data } : c) };
    case "ADD_COMPRADOR":
      return { ...state, compradores: [...state.compradores, { id: `c${Date.now()}`, tipo: "COMPRADOR", nacionalidade: "brasileiro(a)" }] };
    case "REMOVE_COMPRADOR":
      return { ...state, compradores: state.compradores.filter((c) => c.id !== action.payload) };
    case "LOAD_FROM_NEGOCIO": return { ...state, ...action.payload };
    default: return state;
  }
}

const WizardContext = createContext<{ state: WizardState; dispatch: React.Dispatch<Action> } | null>(null);

export function WizardProvider({ children, initialNegocioId }: { children: ReactNode; initialNegocioId?: string }) {
  const [state, dispatch] = useReducer(reducer, { ...initialState, negocioId: initialNegocioId || null });
  return <WizardContext.Provider value={{ state, dispatch }}>{children}</WizardContext.Provider>;
}

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used within WizardProvider");
  return ctx;
}
