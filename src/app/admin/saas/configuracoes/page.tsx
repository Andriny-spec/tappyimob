"use client";

import { useEffect, useState, type ReactNode } from "react";
import { RiBankCardLine, RiCheckLine, RiGlobalLine, RiNotification3Line, RiSettings4Line, RiTimerLine } from "react-icons/ri";
import { Alternar, Botao, Cabecalho, Campo, Carregando, Cartao, chamar, estiloInput } from "@/components/admin/saas/ui";

type Config = {
  dominioBase: string;
  trialPadraoDias: number;
  diasCarencia: number;
  suspenderSiteAposDias: number;
  gateway: "nenhum" | "asaas" | "pagarme" | "stripe";
  gatewayAmbiente: "sandbox" | "producao";
  emailCobranca: string;
  whatsappCobranca: string;
  lembreteDiasAntes: number;
  permitirDominioProprio: boolean;
  permitirTrialSemCartao: boolean;
};

const GATEWAYS: { id: Config["gateway"]; nome: string; texto: string }[] = [
  { id: "nenhum", nome: "Manual", texto: "Baixa feita à mão em Assinaturas" },
  { id: "asaas", nome: "Asaas", texto: "Pix, boleto e cartão recorrente" },
  { id: "pagarme", nome: "Pagar.me", texto: "Cartão e Pix com recorrência" },
  { id: "stripe", nome: "Stripe", texto: "Cartão internacional e assinaturas" },
];

export default function ConfiguracoesSaasPage() {
  const [c, setC] = useState<Config | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    chamar<Config>("/api/admin/saas/config").then(setC).catch((e) => setErro(e.message));
  }, []);

  const set = (patch: Partial<Config>) => {
    setC((v) => (v ? { ...v, ...patch } : v));
    setSalvo(false);
  };

  const salvar = async () => {
    if (!c) return;
    setSalvando(true);
    setErro("");
    try {
      setC(await chamar<Config>("/api/admin/saas/config", { method: "PUT", body: JSON.stringify(c) }));
      setSalvo(true);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-6">
      <Cabecalho
        icone={<RiSettings4Line />}
        titulo="Configurações do SaaS"
        texto="Regras gerais da plataforma de assinaturas."
        acoes={
          <Botao onClick={salvar} carregando={salvando} disabled={!c}>
            {salvo ? <><RiCheckLine /> Salvo</> : "Salvar alterações"}
          </Botao>
        }
      />
      {erro && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{erro}</p>}

      {!c ? (
        <Carregando />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <Bloco icone={<RiGlobalLine />} titulo="Sites dos assinantes">
            <Campo rotulo="Domínio base" ajuda={`Os sites ficam em nome.${c.dominioBase || "seudominio.com.br"}`}>
              <input className={estiloInput} value={c.dominioBase} onChange={(e) => set({ dominioBase: e.target.value.trim().toLowerCase() })} />
            </Campo>
            <Alternar rotulo="Permitir domínio próprio do assinante" ligado={c.permitirDominioProprio} onChange={(v) => set({ permitirDominioProprio: v })} />
          </Bloco>

          <Bloco icone={<RiTimerLine />} titulo="Teste e inadimplência">
            <div className="grid gap-4 sm:grid-cols-3">
              <Campo rotulo="Teste grátis (dias)" ajuda="Padrão para planos novos">
                <input className={estiloInput} inputMode="numeric" value={c.trialPadraoDias} onChange={(e) => set({ trialPadraoDias: Number(e.target.value.replace(/\D/g, "") || 0) })} />
              </Campo>
              <Campo rotulo="Carência (dias)" ajuda="Após o vencimento">
                <input className={estiloInput} inputMode="numeric" value={c.diasCarencia} onChange={(e) => set({ diasCarencia: Number(e.target.value.replace(/\D/g, "") || 0) })} />
              </Campo>
              <Campo rotulo="Suspender site após (dias)">
                <input className={estiloInput} inputMode="numeric" value={c.suspenderSiteAposDias} onChange={(e) => set({ suspenderSiteAposDias: Number(e.target.value.replace(/\D/g, "") || 0) })} />
              </Campo>
            </div>
            <Alternar rotulo="Permitir teste sem cartão cadastrado" ligado={c.permitirTrialSemCartao} onChange={(v) => set({ permitirTrialSemCartao: v })} />
          </Bloco>

          <Bloco icone={<RiBankCardLine />} titulo="Gateway de pagamento" className="lg:col-span-2">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {GATEWAYS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => set({ gateway: g.id })}
                  className={`rounded-3xl border-2 p-4 text-left transition-colors ${
                    c.gateway === g.id ? "border-orange-500 bg-orange-50/60 dark:bg-orange-500/10" : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700"
                  }`}
                >
                  <p className="font-semibold text-neutral-900 dark:text-white">{g.nome}</p>
                  <p className="mt-1 text-xs text-neutral-500">{g.texto}</p>
                </button>
              ))}
            </div>
            {c.gateway !== "nenhum" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo rotulo="Ambiente">
                  <div className="grid grid-cols-2 gap-1 rounded-2xl bg-neutral-100 p-1 dark:bg-neutral-800">
                    {(["sandbox", "producao"] as const).map((a) => (
                      <button key={a} type="button" onClick={() => set({ gatewayAmbiente: a })} className={`rounded-xl py-2 text-sm font-semibold ${c.gatewayAmbiente === a ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white" : "text-neutral-500"}`}>
                        {a === "sandbox" ? "Testes" : "Produção"}
                      </button>
                    ))}
                  </div>
                </Campo>
                <p className="self-end rounded-2xl bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
                  A chave da API do gateway fica no <b>.env</b> do servidor, nunca nesta tela. A cobrança automática entra quando a integração for ligada.
                </p>
              </div>
            )}
          </Bloco>

          <Bloco icone={<RiNotification3Line />} titulo="Avisos de cobrança" className="lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-3">
              <Campo rotulo="E-mail remetente">
                <input className={estiloInput} type="email" value={c.emailCobranca} onChange={(e) => set({ emailCobranca: e.target.value })} placeholder="financeiro@seudominio.com.br" />
              </Campo>
              <Campo rotulo="WhatsApp de cobrança" ajuda="Com DDI e DDD">
                <input className={estiloInput} value={c.whatsappCobranca} onChange={(e) => set({ whatsappCobranca: e.target.value })} placeholder="5511999999999" />
              </Campo>
              <Campo rotulo="Lembrete (dias antes do vencimento)">
                <input className={estiloInput} inputMode="numeric" value={c.lembreteDiasAntes} onChange={(e) => set({ lembreteDiasAntes: Number(e.target.value.replace(/\D/g, "") || 0) })} />
              </Campo>
            </div>
          </Bloco>
        </div>
      )}
    </div>
  );
}

function Bloco({ icone, titulo, children, className = "" }: { icone: ReactNode; titulo: string; children: ReactNode; className?: string }) {
  return (
    <Cartao className={`space-y-4 p-6 ${className}`}>
      <h2 className="flex items-center gap-2.5 font-semibold text-neutral-900 dark:text-white">
        <span className="grid h-9 w-9 place-items-center rounded-2xl bg-orange-500/10 text-orange-600 [&>svg]:h-5 [&>svg]:w-5">{icone}</span>
        {titulo}
      </h2>
      {children}
    </Cartao>
  );
}
