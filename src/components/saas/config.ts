// Centraliza o contato comercial sem acoplar a landing ao conteúdo do portal.
const salesPhone = process.env.NEXT_PUBLIC_SALES_WHATSAPP || "00000000";

export function salesLink(
  message = "Olá! Quero conhecer o TappyImob e agendar uma demonstração.",
) {
  return `https://wa.me/${salesPhone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}
