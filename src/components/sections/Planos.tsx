"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  RiCheckLine,
  RiCloseLine,
  RiStarFill,
  RiRocketLine,
  RiBuilding2Line,
  RiVipCrown2Line,
  RiArrowRightLine,
} from "react-icons/ri";
import { Button } from "@/components/ui/button";

const planos = [
  {
    name: "Starter",
    description: "Ideal para corretores autônomos começando no digital",
    icon: RiRocketLine,
    price: {
      monthly: 97,
      yearly: 77,
    },
    popular: false,
    features: [
      { text: "Até 50 imóveis cadastrados", included: true },
      { text: "Gestão de até 200 leads", included: true },
      { text: "1 usuário", included: true },
      { text: "Integração WhatsApp", included: true },
      { text: "Relatórios básicos", included: true },
      { text: "Suporte por email", included: true },
      { text: "App mobile", included: true },
      { text: "Contratos digitais", included: false },
      { text: "Automações IA", included: false },
      { text: "API de integração", included: false },
    ],
    cta: "Começar grátis",
    ctaVariant: "outline" as const,
  },
  {
    name: "Professional",
    description: "Para imobiliárias que querem escalar resultados",
    icon: RiBuilding2Line,
    price: {
      monthly: 197,
      yearly: 157,
    },
    popular: true,
    features: [
      { text: "Imóveis ilimitados", included: true },
      { text: "Leads ilimitados", included: true },
      { text: "Até 10 usuários", included: true },
      { text: "Integração WhatsApp", included: true },
      { text: "Relatórios avançados", included: true },
      { text: "Suporte prioritário", included: true },
      { text: "App mobile", included: true },
      { text: "Contratos digitais", included: true },
      { text: "Automações IA básicas", included: true },
      { text: "API de integração", included: false },
    ],
    cta: "Começar agora",
    ctaVariant: "glow" as const,
  },
  {
    name: "Enterprise",
    description: "Solução completa para grandes operações",
    icon: RiVipCrown2Line,
    price: {
      monthly: 497,
      yearly: 397,
    },
    popular: false,
    features: [
      { text: "Tudo ilimitado", included: true },
      { text: "Usuários ilimitados", included: true },
      { text: "Multi-filiais", included: true },
      { text: "WhatsApp Business API", included: true },
      { text: "Relatórios personalizados", included: true },
      { text: "Gerente de sucesso dedicado", included: true },
      { text: "App mobile white-label", included: true },
      { text: "Contratos digitais ilimitados", included: true },
      { text: "Automações IA avançadas", included: true },
      { text: "API de integração completa", included: true },
    ],
    cta: "Falar com vendas",
    ctaVariant: "secondary" as const,
  },
];

export function Planos() {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <section id="planos" className="py-20 lg:py-32 bg-neutral-50 dark:bg-neutral-900/50">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-3 py-1 text-xs font-semibold text-orange-500 bg-orange-100 dark:bg-orange-500/10 rounded-full mb-4">
            PLANOS E PREÇOS
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
            Escolha o plano ideal
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
              para seu negócio
            </span>
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Todos os planos incluem 14 dias de teste grátis. Sem cartão de crédito.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-sm font-medium transition-colors ${!isYearly ? "text-neutral-900 dark:text-white" : "text-neutral-500"}`}>
              Mensal
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                isYearly ? "bg-orange-500" : "bg-neutral-300 dark:bg-neutral-700"
              }`}
            >
              <motion.div
                animate={{ x: isYearly ? 28 : 2 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
              />
            </button>
            <span className={`text-sm font-medium transition-colors ${isYearly ? "text-neutral-900 dark:text-white" : "text-neutral-500"}`}>
              Anual
            </span>
            <span className="px-2 py-0.5 text-xs font-semibold text-green-600 bg-green-100 dark:bg-green-500/20 dark:text-green-400 rounded-full">
              -20% OFF
            </span>
          </div>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {planos.map((plano, i) => (
            <motion.div
              key={plano.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative bg-white dark:bg-neutral-800 rounded-3xl overflow-hidden ${
                plano.popular
                  ? "border-2 border-orange-500 shadow-xl shadow-orange-500/10"
                  : "border border-neutral-200 dark:border-neutral-700"
              }`}
            >
              {/* Popular badge */}
              {plano.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-semibold text-center py-2">
                  <RiStarFill className="inline-block w-3 h-3 mr-1" />
                  MAIS POPULAR
                </div>
              )}

              <div className={`p-8 ${plano.popular ? "pt-14" : ""}`}>
                {/* Icon & Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    plano.popular
                      ? "bg-orange-100 dark:bg-orange-500/20"
                      : "bg-neutral-100 dark:bg-neutral-700"
                  }`}>
                    <plano.icon className={`w-6 h-6 ${
                      plano.popular ? "text-orange-500" : "text-neutral-600 dark:text-neutral-400"
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                      {plano.name}
                    </h3>
                  </div>
                </div>

                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                  {plano.description}
                </p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm text-neutral-500">R$</span>
                    <span className="text-4xl font-bold text-neutral-900 dark:text-white">
                      {isYearly ? plano.price.yearly : plano.price.monthly}
                    </span>
                    <span className="text-neutral-500">/mês</span>
                  </div>
                  {isYearly && (
                    <p className="text-xs text-neutral-500 mt-1">
                      Cobrado anualmente • R$ {plano.price.yearly * 12}/ano
                    </p>
                  )}
                </div>

                {/* CTA */}
                <Button
                  variant={plano.ctaVariant}
                  size="lg"
                  className="w-full mb-8 group"
                >
                  {plano.cta}
                  <RiArrowRightLine className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>

                {/* Features */}
                <div className="space-y-3">
                  {plano.features.map((feature) => (
                    <div
                      key={feature.text}
                      className={`flex items-center gap-3 ${
                        feature.included ? "" : "opacity-50"
                      }`}
                    >
                      {feature.included ? (
                        <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center flex-shrink-0">
                          <RiCheckLine className="w-3 h-3 text-green-600 dark:text-green-400" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center flex-shrink-0">
                          <RiCloseLine className="w-3 h-3 text-neutral-400" />
                        </div>
                      )}
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom text */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-neutral-600 dark:text-neutral-400">
            Precisa de algo personalizado?{" "}
            <a href="#contato" className="text-orange-500 font-medium hover:underline">
              Entre em contato com nosso time
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
