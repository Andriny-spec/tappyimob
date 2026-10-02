"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Cookie, MessageCircle, Send, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { salesLink } from "./config";

/* ------------------------------------------------------------------ chat */

type Msg = { de: "tappy" | "voce"; texto: string; cta?: boolean };

// Respostas da recepção. Tudo que pede uma pessoa vai para o WhatsApp comercial.
const RESPOSTAS: { pergunta: string; resposta: string }[] = [
  {
    pergunta: "Quanto custa?",
    resposta: "Temos três planos, com pagamento mensal ou anual. Os valores e o que cada um inclui estão na seção Preços desta página.",
  },
  {
    pergunta: "Quero uma demonstração",
    resposta: "Perfeito! Um especialista mostra a plataforma ao vivo, com os dados da sua imobiliária em mente. É só chamar no WhatsApp.",
  },
  {
    pergunta: "Vocês fazem o site?",
    resposta: "Sim. Cada imobiliária tem o próprio site, com seus imóveis, banners e domínio, gerenciado pelo mesmo painel do CRM.",
  },
  {
    pergunta: "Já sou cliente",
    resposta: "Bem-vindo de volta! Acesse pelo botão Entrar, no topo. Se precisar de ajuda com o acesso, o suporte responde pelo WhatsApp.",
  },
];

function Chat({ aberto, onFechar }: { aberto: boolean; onFechar: () => void }) {
  const [msgs, setMsgs] = useState<Msg[]>([
    { de: "tappy", texto: "Oi! 👋 Sou a recepção da TappyImob. Como posso ajudar?" },
  ]);
  const [texto, setTexto] = useState("");
  const [digitando, setDigitando] = useState(false);
  const fim = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fim.current?.scrollIntoView({ block: "end" });
  }, [msgs, digitando]);

  const responder = (pergunta: string) => {
    const conhecida = RESPOSTAS.find((r) => r.pergunta === pergunta);
    setMsgs((m) => [...m, { de: "voce", texto: pergunta }]);
    setDigitando(true);
    window.setTimeout(() => {
      setDigitando(false);
      setMsgs((m) => [
        ...m,
        conhecida
          ? { de: "tappy", texto: conhecida.resposta, cta: true }
          : { de: "tappy", texto: "Boa pergunta! Um especialista responde isso rapidinho pelo WhatsApp.", cta: true },
      ]);
    }, 750);
  };

  const enviar = () => {
    const t = texto.trim();
    if (!t) return;
    setTexto("");
    responder(t);
  };

  return (
    <AnimatePresence>
      {aberto && (
        <motion.div
          className="saas-wchat"
          role="dialog"
          aria-label="Conversar com a TappyImob"
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <header className="saas-wchat-head">
            <span className="saas-wchat-avatar">
              <Image src="/saas/tappy-symbol.png" alt="" width={34} height={34} />
              <i />
            </span>
            <span>
              <strong>TappyImob</strong>
              <small>Online agora · responde em minutos</small>
            </span>
            <button type="button" onClick={onFechar} aria-label="Fechar conversa">
              <X size={18} />
            </button>
          </header>

          <div className="saas-wchat-body">
            {msgs.map((m, i) => (
              <div key={i} className={`saas-wchat-msg ${m.de === "voce" ? "eu" : ""}`}>
                <p>{m.texto}</p>
                {m.cta && (
                  <a href={salesLink()} target="_blank" rel="noopener noreferrer" className="saas-wchat-cta">
                    <FaWhatsapp size={15} /> Continuar no WhatsApp <ArrowUpRight size={14} />
                  </a>
                )}
              </div>
            ))}
            {digitando && (
              <div className="saas-wchat-msg">
                <p className="saas-wchat-typing" aria-label="Digitando">
                  <i /> <i /> <i />
                </p>
              </div>
            )}
            <div ref={fim} />
          </div>

          <div className="saas-wchat-quick">
            {RESPOSTAS.map((r) => (
              <button key={r.pergunta} type="button" onClick={() => responder(r.pergunta)}>
                {r.pergunta}
              </button>
            ))}
          </div>

          <form
            className="saas-wchat-input"
            onSubmit={(e) => {
              e.preventDefault();
              enviar();
            }}
          >
            <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escreva sua mensagem" aria-label="Sua mensagem" />
            <button type="submit" aria-label="Enviar" disabled={!texto.trim()}>
              <Send size={16} />
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ cookies */

const CHAVE_COOKIES = "cookie-consent";
// Mesmo formato do banner do portal: quem lê o consentimento continua funcionando
const CATEGORIAS = [
  { id: "essential", name: "Essenciais", required: true },
  { id: "analytics", name: "Analíticos", required: false },
  { id: "marketing", name: "Marketing", required: false },
  { id: "functional", name: "Funcionais", required: false },
];

function AvisoCookies() {
  const [visivel, setVisivel] = useState(false);
  const [detalhes, setDetalhes] = useState(false);
  const [escolha, setEscolha] = useState<Record<string, boolean>>({ analytics: true, marketing: false, functional: true });

  useEffect(() => {
    let jaRespondeu = false;
    try {
      jaRespondeu = !!localStorage.getItem(CHAVE_COOKIES);
    } catch {
      // sem storage: mostra o aviso, a escolha vale só nesta visita
    }
    if (jaRespondeu) return;
    const t = window.setTimeout(() => setVisivel(true), 1800);
    return () => window.clearTimeout(t);
  }, []);

  const salvar = (todos: boolean | null) => {
    const valores = CATEGORIAS.map((c) => ({
      ...c,
      enabled: c.required ? true : todos === null ? !!escolha[c.id] : todos,
    }));
    try {
      localStorage.setItem(CHAVE_COOKIES, JSON.stringify(valores));
    } catch {}
    setVisivel(false);
  };

  return (
    <AnimatePresence>
      {visivel && (
        <motion.div
          className="saas-cookies"
          role="dialog"
          aria-label="Preferências de cookies"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="saas-cookies-top">
            <span className="saas-cookies-icon">
              <Cookie size={20} />
            </span>
            <p>
              Usamos cookies para o site funcionar e para entender como ele é usado. Você escolhe o que aceita.{" "}
              <Link href="/cookies">Política de cookies</Link>
            </p>
          </div>

          {detalhes && (
            <div className="saas-cookies-opts">
              {CATEGORIAS.map((c) => (
                <label key={c.id}>
                  <span>{c.name}</span>
                  <input
                    type="checkbox"
                    checked={c.required || !!escolha[c.id]}
                    disabled={c.required}
                    onChange={(e) => setEscolha((v) => ({ ...v, [c.id]: e.target.checked }))}
                  />
                  <i aria-hidden="true" />
                </label>
              ))}
            </div>
          )}

          <div className="saas-cookies-actions">
            <button type="button" className="ghost" onClick={() => (detalhes ? salvar(null) : setDetalhes(true))}>
              {detalhes ? "Salvar escolhas" : "Personalizar"}
            </button>
            <button type="button" className="ghost" onClick={() => salvar(false)}>
              Só essenciais
            </button>
            <button type="button" className="solid" onClick={() => salvar(true)}>
              Aceitar todos
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ dock */

/** WhatsApp, chat e aviso de cookies — usados na home e no login. */
export function SaasFloating({ semChat = false }: { semChat?: boolean }) {
  const [chat, setChat] = useState(false);

  return (
    <>
      <div className="saas-float-dock">
        {!semChat && (
          <button
            type="button"
            className={`saas-float-btn saas-float-chat ${chat ? "ativo" : ""}`}
            onClick={() => setChat((v) => !v)}
            aria-label={chat ? "Fechar conversa" : "Abrir conversa"}
            aria-expanded={chat}
          >
            {chat ? <X size={22} /> : <MessageCircle size={22} />}
          </button>
        )}
        <a
          href={salesLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="saas-float-btn saas-float-whats"
          aria-label="Falar no WhatsApp"
        >
          <FaWhatsapp size={27} />
          <span className="saas-float-tip">Fale com a gente</span>
        </a>
      </div>
      {!semChat && <Chat aberto={chat} onFechar={() => setChat(false)} />}
      <AvisoCookies />
    </>
  );
}
