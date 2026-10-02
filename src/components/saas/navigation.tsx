"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import {
  ArrowRight,
  Building2,
  ChartNoAxesCombined,
  ChevronDown,
  Globe,
  Menu,
  MessageCircle,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { Brand } from "./primitives";
import { salesLink } from "./config";

const resources = [
  {
    icon: Users,
    name: "CRM & leads",
    text: "Cada oportunidade no lugar certo",
    href: "#servicos",
  },
  {
    icon: Building2,
    name: "Gestão de imóveis",
    text: "Sua carteira, sempre organizada",
    href: "#servicos",
  },
  {
    icon: MessageCircle,
    name: "WhatsApp & automação",
    text: "Conexões que viram conversas",
    href: "#automacao",
  },
  {
    icon: Sparkles,
    name: "Tappy IA",
    text: "Inteligência para o seu dia a dia",
    href: "#automacao",
  },
  {
    icon: Globe,
    name: "Site imobiliário",
    text: "Uma vitrine com a sua marca",
    href: "#site",
  },
  {
    icon: ChartNoAxesCombined,
    name: "Gestão & resultados",
    text: "Uma visão completa do negócio",
    href: "#gestao",
  },
];

export function Navigation() {
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const header = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const mobileTrigger = useRef<HTMLButtonElement>(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  useEffect(() => {
    if (!open && !mobile) return;
    function close(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setMobile(false);
        (mobile ? mobileTrigger : trigger).current?.focus();
      }
    }
    function outside(event: PointerEvent) {
      if (!header.current?.contains(event.target as Node)) {
        setOpen(false);
        setMobile(false);
      }
    }
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", outside);
    };
  }, [open, mobile]);

  return (
    <header
      ref={header}
      className="saas-header"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
          setMobile(false);
        }
      }}
    >
      <motion.div className="saas-scroll-progress" style={{ scaleX }} />
      <div className="saas-nav saas-container">
        <Brand />
        <nav className="saas-desktop-nav" aria-label="Navegação principal">
          <button
            ref={trigger}
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="saas-mega"
          >
            Serviços{" "}
            <ChevronDown size={13} className={open ? "saas-rotate" : ""} />
          </button>
          <a href="#como-funciona">Como funciona</a>
          <a href="#precos">Preços</a>
          <a href="#duvidas">Dúvidas</a>
        </nav>
        <div className="saas-nav-actions">
          <Link href="/login" className="saas-login-link">
            Entrar <ArrowRight size={14} />
          </Link>
          <a
            className="saas-button saas-button-green saas-nav-contact"
            href={salesLink()}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={16} /> Atendimento
          </a>
          <button
            ref={mobileTrigger}
            className="saas-mobile-toggle"
            aria-label={mobile ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobile}
            aria-controls="saas-mobile-nav"
            onClick={() => setMobile(!mobile)}
          >
            {mobile ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            id="saas-mega"
            className="saas-mega saas-container"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <div className="saas-mega-intro">
              <span>UM ECOSSISTEMA COMPLETO</span>
              <h3>
                Mais conexão.
                <br />
                Mais possibilidades.
              </h3>
              <a href="#servicos" onClick={() => setOpen(false)}>
                Explorar a plataforma <ArrowRight size={16} />
              </a>
            </div>
            <div className="saas-mega-links">
              {resources.map(({ icon: Icon, name, text, href }) => (
                <a href={href} key={name} onClick={() => setOpen(false)}>
                  <Icon size={21} />
                  <div>
                    <strong>{name}</strong>
                    <span>{text}</span>
                  </div>
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {mobile && (
        <nav
          id="saas-mobile-nav"
          className="saas-mobile-nav"
          aria-label="Navegação móvel"
        >
          {[
            ["Serviços", "#servicos"],
            ["Como funciona", "#como-funciona"],
            ["Preços", "#precos"],
            ["Dúvidas", "#duvidas"],
          ].map(([label, href]) => (
            <a href={href} key={href} onClick={() => setMobile(false)}>
              {label}
              <ArrowUpRightIcon />
            </a>
          ))}
          <a
            href={salesLink()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobile(false)}
          >
            Conversar no WhatsApp
            <MessageCircle size={18} />
          </a>
        </nav>
      )}
    </header>
  );
}
function ArrowUpRightIcon() {
  return <ArrowRight size={18} />;
}
