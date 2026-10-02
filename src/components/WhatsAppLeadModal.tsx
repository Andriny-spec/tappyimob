"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiWhatsappFill, RiCloseLine, RiLoader4Line } from "react-icons/ri";

/** Tag que identifica o lead vindo dos botões de WhatsApp do site. */
export const TAG_BOTAO_WHATSAPP = "BOTAO_WHATSAPP";

interface Props {
  aberto: boolean;
  onFechar: () => void;
  /** Número de destino, só dígitos com DDI. */
  telefone: string;
  /** Mensagem que abre a conversa. */
  mensagem: string;
  /** De onde partiu o clique — aparece no CRM. */
  origem: string;
  /** Imóvel relacionado, quando o clique parte de uma ficha. */
  propertyId?: string;
  propertyCode?: string;
  titulo?: string;
}

/**
 * Pede nome, e-mail e telefone antes de abrir o WhatsApp.
 *
 * O lead é gravado no CRM ANTES do redirecionamento: se dependesse da pessoa
 * puxar assunto no WhatsApp, todo mundo que desistisse no meio se perderia — e
 * capturar esse contato é justamente o objetivo. Falha na gravação não bloqueia
 * o atendimento; a conversa abre de qualquer forma.
 */
export function WhatsAppLeadModal({
  aberto,
  onFechar,
  telefone,
  mensagem,
  origem,
  propertyId,
  propertyCode,
  titulo = "Fale com a gente no WhatsApp",
}: Props) {
  const [form, setForm] = useState({ nome: "", email: "", telefone: "" });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim() || !form.telefone.trim()) {
      setErro("Preencha ao menos nome e telefone");
      return;
    }
    setErro("");
    setEnviando(true);

    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.nome.trim(),
          email: form.email.trim() || undefined,
          phone: form.telefone.trim(),
          source: "WHATSAPP",
          propertyId,
          message: [
            `💬 Clique no botão de WhatsApp — ${origem}`,
            propertyCode ? `Imóvel: ${propertyCode}` : null,
          ]
            .filter(Boolean)
            .join("\n"),
          tags: [TAG_BOTAO_WHATSAPP],
          // Identifica o botão exato na planilha do marketing
          formOrigin: origem,
        }),
      });
    } catch {
      // registro é secundário: o cliente não pode ficar sem atendimento
    }

    window.open(
      `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`,
      "_blank",
      "noopener,noreferrer"
    );

    setEnviando(false);
    setForm({ nome: "", email: "", telefone: "" });
    onFechar();
  };

  return (
    <AnimatePresence>
      {aberto && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onFechar}
            className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-1/2 z-[91] w-[calc(100%-2.5rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-neutral-900"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 p-5 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#25D366]/15 text-[#25D366]">
                  <RiWhatsappFill className="h-5 w-5" />
                </span>
                <h3 className="font-bold text-neutral-900 dark:text-white">
                  {titulo}
                </h3>
              </div>
              <button
                onClick={onFechar}
                aria-label="Fechar"
                className="text-neutral-400 transition-colors hover:text-neutral-700 dark:hover:text-white"
              >
                <RiCloseLine className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={enviar} className="space-y-3 p-5">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Deixe seus dados e continuamos a conversa por lá.
              </p>

              <input
                type="text"
                required
                placeholder="Seu nome *"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="w-full rounded-xl bg-neutral-100 px-4 py-3 text-base text-neutral-900 outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-[#25D366]/40 sm:text-sm dark:bg-neutral-800 dark:text-white"
              />
              <input
                type="tel"
                required
                inputMode="tel"
                placeholder="Seu telefone *"
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                className="w-full rounded-xl bg-neutral-100 px-4 py-3 text-base text-neutral-900 outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-[#25D366]/40 sm:text-sm dark:bg-neutral-800 dark:text-white"
              />
              <input
                type="email"
                placeholder="Seu e-mail"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl bg-neutral-100 px-4 py-3 text-base text-neutral-900 outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-[#25D366]/40 sm:text-sm dark:bg-neutral-800 dark:text-white"
              />

              {erro && <p className="text-xs text-red-500">{erro}</p>}

              <button
                type="submit"
                disabled={enviando}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3.5 font-semibold text-white transition-colors hover:bg-[#1fb857] disabled:opacity-60"
              >
                {enviando ? (
                  <RiLoader4Line className="h-5 w-5 animate-spin" />
                ) : (
                  <RiWhatsappFill className="h-5 w-5" />
                )}
                {enviando ? "Abrindo..." : "Continuar no WhatsApp"}
              </button>

              <p className="text-center text-[11px] text-neutral-400">
                Seus dados são usados apenas para contato comercial.
              </p>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
