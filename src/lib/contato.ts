// Contato comercial da empresa: um lugar só, vindo do ambiente.
// Defina NEXT_PUBLIC_SALES_WHATSAPP no .env com DDI + DDD + número (ex.: 5511999999999).
const numero = (process.env.NEXT_PUBLIC_SALES_WHATSAPP || "5500000000000").replace(/\D/g, "");

/** "5511999999999" → "(11) 99999-9999" */
function exibir(n: string) {
  const m = n.replace(/^55/, "").match(/^(\d{2})(\d{4,5})(\d{4})$/);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : n;
}

export const CONTATO = {
  whatsapp: numero,
  telefone: exibir(numero),
  whatsappLink: `https://wa.me/${numero}`,
};
