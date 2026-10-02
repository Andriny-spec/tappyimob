"use client";

import { useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowLeft,
  ArrowRight,
  Barcode,
  Check,
  CheckCircle2,
  CreditCard,
  Globe,
  HardDrive,
  Monitor,
  QrCode,
  Server,
  ShieldCheck,
  X,
} from "lucide-react";
import { currency, type Billing, type Plan } from "./plans-data";

type Hosting = "none" | "own" | "tappy";
type Payment = "pix" | "card" | "boleto";
export default function Checkout({
  plan,
  billing,
  onClose,
}: {
  plan: Plan;
  billing: Billing;
  onClose: () => void;
}) {
  const returnFocus = useRef(
    typeof document !== "undefined"
      ? (document.activeElement as HTMLElement)
      : null,
  );
  const [hosting, setHosting] = useState<Hosting>("none");
  const [payment, setPayment] = useState<Payment>("pix");
  const [done, setDone] = useState(false);
  const monthly = billing === "annual" ? plan.annualPrice : plan.price;
  const hostingPrice = hosting === "tappy" ? 49 : 0;
  const multiplier = billing === "annual" ? 12 : 1;
  const total = (monthly + hostingPrice) * multiplier;
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="saas-modal-overlay" />
        <Dialog.Content
          className="saas-checkout saas"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            returnFocus.current?.focus();
          }}
        >
          <Dialog.Close
            className="saas-modal-close"
            aria-label="Fechar assinatura"
          >
            <X size={20} />
          </Dialog.Close>
          <div className="saas-checkout-main">
            <span className="saas-checkout-badge">
              <span className="saas-live-dot" /> CHECKOUT DEMONSTRATIVO
            </span>
            <Dialog.Title>
              {done
                ? "Tudo pronto para o próximo passo."
                : "Dê espaço ao seu próximo nível."}
            </Dialog.Title>
            <Dialog.Description>
              {done
                ? "Sua seleção foi simulada. Nenhuma assinatura ou cobrança foi criada."
                : "Personalize seu plano e explore as opções. Esta é uma simulação, sem cobrança e sem coleta de dados de pagamento."}
            </Dialog.Description>
            {done ? (
              <div className="saas-checkout-success">
                <CheckCircle2 size={54} strokeWidth={1.3} />
                <h3>Simulação concluída</h3>
                <p>
                  Plano {plan.name} ·{" "}
                  {billing === "annual" ? "Anual" : "Mensal"}
                  <br />
                  {hosting === "none"
                    ? "Somente o CRM"
                    : hosting === "own"
                      ? "Site em hospedagem própria"
                      : "Site no servidor Tappy"}
                  <br />
                  Pagamento por{" "}
                  {payment === "pix"
                    ? "Pix"
                    : payment === "card"
                      ? "cartão"
                      : "boleto"}
                </p>
                <span>
                  A integração de pagamento será disponibilizada posteriormente.
                </span>
                <button
                  onClick={() => setDone(false)}
                  className="saas-button saas-button-outline"
                >
                  <ArrowLeft size={16} /> Ajustar minha seleção
                </button>
              </div>
            ) : (
              <>
                <fieldset className="saas-checkout-fieldset">
                  <legend>
                    <span>01</span> Quer um site para seus imóveis?
                  </legend>
                  <p>
                    O CRM é a base. O site é uma opção adicional para expor sua
                    carteira.
                  </p>
                  {(
                    [
                      {
                        id: "none",
                        icon: Monitor,
                        title: "Por enquanto, só o CRM",
                        text: "Comece pela gestão. Adicione seu site depois.",
                        value: "Incluído",
                      },
                      {
                        id: "own",
                        icon: HardDrive,
                        title: "Usar minha própria hospedagem",
                        text: "Implantar o site conectado ao CRM no seu servidor. Configuração técnica a combinar.",
                        value: "Sob consulta",
                      },
                      {
                        id: "tappy",
                        icon: Server,
                        title: "Hospedar com a Tappy",
                        text: "Site conectado ao CRM no servidor Tappy.",
                        value: "+ R$ 49/mês",
                      },
                    ] as const
                  ).map(({ id, icon: Icon, title, text, value }) => (
                    <label
                      className={`saas-host-option ${hosting === id ? "selected" : ""}`}
                      key={id}
                    >
                      <input
                        type="radio"
                        name="hosting"
                        value={id}
                        checked={hosting === id}
                        onChange={() => setHosting(id)}
                      />
                      <Icon size={21} />
                      <span>
                        <strong>{title}</strong>
                        <small>{text}</small>
                      </span>
                      <b>{value}</b>
                    </label>
                  ))}
                </fieldset>
                <fieldset className="saas-checkout-fieldset">
                  <legend>
                    <span>02</span> Como você prefere pagar?
                  </legend>
                  <div className="saas-payment-options">
                    {(
                      [
                        { id: "pix", icon: QrCode, name: "Pix" },
                        { id: "card", icon: CreditCard, name: "Cartão" },
                        { id: "boleto", icon: Barcode, name: "Boleto" },
                      ] as const
                    ).map(({ id, icon: Icon, name }) => (
                      <label
                        key={id}
                        className={payment === id ? "selected" : ""}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={payment === id}
                          onChange={() => setPayment(id)}
                        />
                        <Icon size={23} />
                        <span>{name}</span>
                        {payment === id && <Check size={12} />}
                      </label>
                    ))}
                  </div>
                  <p className="saas-payment-note">
                    {payment === "pix"
                      ? "No checkout integrado, o QR Code e o código Pix aparecerão aqui."
                      : payment === "card"
                        ? "No checkout integrado, os dados do cartão serão coletados pelo provedor de pagamento."
                        : "No checkout integrado, seu boleto será gerado após a confirmação dos dados."}
                  </p>
                </fieldset>
              </>
            )}
          </div>
          <aside className="saas-checkout-summary">
            <span className="saas-eyebrow">SUA NOVA OPERAÇÃO</span>
            <h3>
              TappyImob <span>{plan.name}</span>
            </h3>
            <span className="saas-billing-tag">
              {billing === "annual" ? "Assinatura anual" : "Assinatura mensal"}
            </span>
            <div className="saas-checkout-price">
              {currency(monthly)}
              <small>/mês</small>
            </div>
            <ul>
              {plan.features.slice(0, 4).map((feature) => (
                <li key={feature}>
                  <Check size={13} />
                  {feature}
                </li>
              ))}
            </ul>
            <div className="saas-checkout-totals">
              <p>
                CRM · {billing === "annual" ? "12 meses" : "1 mês"}
                <span>{currency(monthly * multiplier)}</span>
              </p>
              <p>
                Site e hospedagem
                <span>
                  {hosting === "own"
                    ? "Sob consulta"
                    : hosting === "none"
                      ? "Não incluídos"
                      : currency(hostingPrice * multiplier)}
                </span>
              </p>
              <div>
                Total {billing === "annual" ? "anual" : "mensal"}
                <strong>{currency(total)}</strong>
              </div>
              {hosting === "own" && (
                <small>
                  Implantação e hospedagem própria não estão incluídas neste
                  total.
                </small>
              )}
            </div>
            {!done && (
              <button
                className="saas-button saas-button-green"
                onClick={() => setDone(true)}
              >
                Simular assinatura <ArrowRight size={16} />
              </button>
            )}
            <p className="saas-checkout-disclaimer">
              <ShieldCheck size={15} /> Valores fictícios para demonstração.
              Nenhum pagamento será processado.
            </p>
            <span className="saas-checkout-connected">
              <Globe size={14} /> Feito para conectar seu negócio.
            </span>
          </aside>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
