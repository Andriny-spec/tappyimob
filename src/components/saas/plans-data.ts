// Valores e limites demonstrativos. Substituir por catálogo da API ao integrar billing.
export const plans = [
  {
    id: "essencial",
    name: "Essencial",
    tagline: "Seu próximo passo começa aqui.",
    price: 149,
    annualPrice: 119,
    description:
      "Para o corretor que quer organizar a rotina e dar espaço a novos negócios.",
    features: [
      "Até 2 usuários",
      "Até 300 imóveis",
      "CRM e funil de vendas",
      "Agenda e follow-ups",
      "Gestão de contatos",
      "Suporte pelo WhatsApp",
    ],
    featured: false,
  },
  {
    id: "imobiliaria",
    name: "Imobiliária",
    tagline: "Seu time inteiro, conectado.",
    price: 299,
    annualPrice: 239,
    description:
      "Para imobiliárias que querem integrar atendimento, equipe e gestão.",
    features: [
      "Até 10 usuários",
      "Até 2.000 imóveis",
      "Tudo do Essencial",
      "WhatsApp e automações",
      "Tappy IA e marketing",
      "Financeiro, metas e comissões",
    ],
    featured: true,
  },
  {
    id: "escala",
    name: "Escala",
    tagline: "Mais espaço para ir além.",
    price: 599,
    annualPrice: 479,
    description:
      "Para operações que precisam de mais capacidade, controle e conexão.",
    features: [
      "Até 30 usuários",
      "Até 10.000 imóveis",
      "Tudo do Imobiliária",
      "Gestão de parceiros",
      "Permissões por equipe",
      "Acompanhamento na implantação",
    ],
    featured: false,
  },
] as const;
export type Plan = (typeof plans)[number];
export type Billing = "monthly" | "annual";
export function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(value);
}
