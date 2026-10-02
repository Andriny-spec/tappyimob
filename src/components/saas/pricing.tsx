"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ArrowUpRight, Check, CircleHelp, Sparkles } from "lucide-react";
import { Eyebrow, Reveal } from "./primitives";
import { plans, currency, type Plan, type Billing } from "./plans-data";
import { salesLink } from "./config";

const Checkout = dynamic(() => import("./checkout"));
export function Pricing() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const [selected, setSelected] = useState<Plan | null>(null);
  return (
    <section id="precos" className="saas-section saas-light saas-pricing">
      <div className="saas-container">
        <Reveal className="saas-centered-heading">
          <Eyebrow>UM PLANO PARA O SEU MOMENTO</Eyebrow>
          <h2>
            Comece do seu jeito.
            <br />
            <span>Cresça com a Tappy.</span>
          </h2>
          <p>
            Da sua primeira carteira à sua próxima expansão.
            <br />
            Escolha o espaço que o seu negócio precisa.
          </p>
          <div
            className="saas-billing-toggle"
            role="group"
            aria-label="Período de cobrança"
          >
            <button
              aria-pressed={billing === "monthly"}
              onClick={() => setBilling("monthly")}
            >
              Mensal
            </button>
            <button
              aria-pressed={billing === "annual"}
              onClick={() => setBilling("annual")}
            >
              Anual <span>economize até 20%</span>
            </button>
          </div>
        </Reveal>
        <div className="saas-plan-grid">
          {plans.map((plan, i) => (
            <Reveal
              key={plan.id}
              className={`saas-plan ${plan.featured ? "saas-plan-featured" : ""}`}
              delay={i * 0.07}
            >
              {plan.featured && (
                <div className="saas-plan-ribbon">
                  <Sparkles size={13} /> PARA CONECTAR TODA A OPERAÇÃO
                </div>
              )}
              <div className="saas-plan-top">
                <span className="saas-plan-index">0{i + 1}</span>
                {plan.featured && <span>O equilíbrio ideal</span>}
              </div>
              <h3>{plan.name}</h3>
              <p>{plan.description}</p>
              <div className="saas-plan-price">
                <small>R$</small>
                <strong>
                  {billing === "annual" ? plan.annualPrice : plan.price}
                </strong>
                <span>/mês</span>
              </div>
              <span className="saas-plan-billing">
                {billing === "annual"
                  ? `${currency(plan.annualPrice * 12)} cobrados anualmente`
                  : "Cobrança mensal · valores demonstrativos"}
              </span>
              <button
                className={`saas-button ${plan.featured ? "saas-button-green" : "saas-button-outline"}`}
                onClick={() => setSelected(plan)}
              >
                Assinar {plan.name}
                <ArrowUpRight size={16} />
              </button>
              <div className="saas-plan-divider" />
              <strong className="saas-plan-tagline">{plan.tagline}</strong>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <Check size={15} />
                    {feature}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
        <p className="saas-pricing-note">
          <CircleHelp size={14} /> Preços, limites e condições ilustrativos.
          Site e hospedagem contratados à parte.
        </p>
        <a
          href={salesLink(
            "Olá! Preciso de uma configuração personalizada para minha imobiliária.",
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="saas-pricing-contact"
        >
          Sua operação precisa de algo diferente?{" "}
          <strong>
            Vamos conversar <ArrowUpRight size={13} />
          </strong>
        </a>
      </div>
      {selected && (
        <Checkout
          plan={selected}
          billing={billing}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}
