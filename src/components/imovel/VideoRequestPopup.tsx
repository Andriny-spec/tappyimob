"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiVideoLine,
  RiCloseLine,
  RiWhatsappLine,
  RiLoader4Line,
} from "react-icons/ri";

interface Props {
  aberto: boolean;
  onFechar: () => void;
  codigo: string;
  propertyId: string;
  titulo?: string;
  whatsapp?: string;
}

/**
 * Convite para pedir o vídeo do imóvel, disparado ao chegar na última foto
 * da galeria.
 *
 * O lead é gravado no CRM ANTES de mandar para o WhatsApp: se o contato só
 * fosse para o WhatsApp e a pessoa não respondesse, ele se perderia — e o
 * objetivo aqui é justamente capturar melhor.
 */
export function VideoRequestPopup({
  aberto,
  onFechar,
  codigo,
  propertyId,
  titulo,
  whatsapp = "5511958144484",
}: Props) {
  const [expandido, setExpandido] = useState(false);
  const [form, setForm] = useState({ nome: "", telefone: "" });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim() || !form.telefone.trim()) {
      setErro("Preencha nome e telefone");
      return;
    }
    setErro("");
    setEnviando(true);

    const mensagem = `Há vídeo deste imóvel (${codigo}) para me enviar, por favor?`;

    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.nome,
          phone: form.telefone,
          source: "SITE",
          propertyId,
          message: `🎥 SOLICITAÇÃO DE VÍDEO — ${codigo}${titulo ? ` (${titulo})` : ""}`,
          tags: ["VIDEO_IMOVEL"],
        }),
      });
    } catch {
      // Falha ao gravar não pode travar o contato: segue para o WhatsApp.
    }

    window.open(
      `https://wa.me/${whatsapp}?text=${encodeURIComponent(mensagem)}`,
      "_blank",
      "noopener,noreferrer"
    );

    setEnviando(false);
    onFechar();
  };

  return (
    <AnimatePresence>
      {aberto && (
        <>
          {/* No celular vira modal centralizado, com fundo escurecido — a
              tarja no rodapé competia com a galeria e passava despercebida.
              No desktop segue discreto no canto, sem cobrir o conteúdo. */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onFechar}
            className="fixed inset-0 z-[69] bg-black/70 backdrop-blur-sm sm:hidden"
          />

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed left-1/2 top-1/2 z-[70] w-[calc(100%-2.5rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/15 bg-neutral-900 shadow-2xl sm:left-auto sm:right-6 sm:top-auto sm:bottom-6 sm:translate-x-0 sm:translate-y-0"
        >
          <button
            onClick={onFechar}
            aria-label="Fechar"
            className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
          >
            <RiCloseLine className="h-4 w-4" />
          </button>

          <div className="p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#1EBE5A]/15 text-[#1EBE5A]">
                <RiVideoLine className="h-5 w-5" />
              </span>
              <div className="min-w-0 pr-6">
                <p className="font-semibold text-white">
                  Acesse o vídeo deste imóvel
                </p>
                <p className="mt-0.5 text-xs text-white/55">
                  Enviamos direto no seu WhatsApp
                </p>
              </div>
            </div>

            {!expandido ? (
              <button
                onClick={() => setExpandido(true)}
                className="mt-4 w-full rounded-xl bg-[#1EBE5A] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#15803D]"
              >
                Quero ver o vídeo
              </button>
            ) : (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.25 }}
                onSubmit={enviar}
                className="mt-4 space-y-2.5 overflow-hidden"
              >
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#1EBE5A] focus:outline-none"
                />
                <input
                  type="tel"
                  inputMode="tel"
                  placeholder="Seu telefone"
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#1EBE5A] focus:outline-none"
                />

                {erro && <p className="text-xs text-red-400">{erro}</p>}

                <button
                  type="submit"
                  disabled={enviando}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1fb857] disabled:opacity-60"
                >
                  {enviando ? (
                    <RiLoader4Line className="h-4 w-4 animate-spin" />
                  ) : (
                    <RiWhatsappLine className="h-4 w-4" />
                  )}
                  Solicitar vídeo
                </button>
              </motion.form>
            )}
          </div>
        </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
