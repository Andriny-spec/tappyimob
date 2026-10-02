"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  CirclePlay,
  Command,
  Layers3,
  MessageCircle,
  Sparkles,
  Zap,
} from "lucide-react";
import { ProductDemo } from "./product-demo";
import { SalesButton } from "./primitives";

export function Hero() {
  const reduced = useReducedMotion();
  const scene = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [2, -2]), {
    stiffness: 90,
    damping: 25,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-2, 2]), {
    stiffness: 90,
    damping: 25,
  });
  return (
    <section className="saas-hero" aria-labelledby="saas-hero-title">
      <div className="saas-hero-grid" aria-hidden="true" />
      <div className="saas-hero-glow" aria-hidden="true" />
      <div className="saas-container saas-hero-content">
        <div className="saas-release">
          <span className="saas-live-dot" />
          <span>O próximo capítulo da sua imobiliária</span>
          <span className="saas-release-tag">
            COMEÇA AQUI <ArrowUpRight size={11} />
          </span>
        </div>
        <h1 id="saas-hero-title">
          Seu negócio imobiliário.
          <br />
          <span>Em outro nível.</span>
          <svg
            className="saas-hero-star"
            viewBox="0 0 40 40"
            aria-hidden="true"
          >
            <path d="M20 0v40M0 20h40M6 6l28 28M6 34 34 6" />
          </svg>
        </h1>
        <p className="saas-hero-description">
          Do primeiro “olá” à entrega das chaves.
          <br className="saas-mobile-br" /> CRM, imóveis, WhatsApp e
          inteligência artificial.
          <br className="saas-desktop-br" /> Tudo conectado. Tudo no{" "}
          <strong>TappyImob.</strong>
        </p>
        <div className="saas-hero-buttons">
          <SalesButton>Conhecer o TappyImob</SalesButton>
          <a href="#como-funciona" className="saas-button saas-button-glass">
            <CirclePlay size={19} /> Veja como funciona
          </a>
        </div>
        <div className="saas-hero-proof">
          <span>
            <Check size={13} /> Feito para o mercado imobiliário
          </span>
          <i />
          <span>
            <Check size={13} /> Sua operação em um só lugar
          </span>
        </div>
        <div
          ref={scene}
          className="saas-product-stage"
          onPointerMove={(event) => {
            if (reduced || event.pointerType !== "mouse") return;
            const rect = event.currentTarget.getBoundingClientRect();
            x.set((event.clientX - rect.left) / rect.width - 0.5);
            y.set((event.clientY - rect.top) / rect.height - 0.5);
          }}
          onPointerLeave={() => {
            x.set(0);
            y.set(0);
          }}
        >
          <div className="saas-stage-label">
            <span>
              <Command size={12} /> UMA PLATAFORMA. INFINITAS POSSIBILIDADES.
            </span>
            <span>01 — VISÃO DO PRODUTO</span>
          </div>
          <motion.div
            style={reduced ? undefined : { rotateX, rotateY }}
            className="saas-product-perspective"
          >
            <ProductDemo />
          </motion.div>
          <div className="saas-float-chip saas-float-lead">
            <span>
              <MessageCircle size={18} />
            </span>
            <div>
              <strong>Uma nova oportunidade.</strong>
              <small>WhatsApp conectado ao seu CRM</small>
            </div>
            <Check size={14} />
          </div>
          <div className="saas-float-chip saas-float-ai">
            <span>
              <Sparkles size={19} />
            </span>
            <div>
              <strong>Menos tarefas. Mais negócios.</strong>
              <small>Com a inteligência da Tappy IA</small>
            </div>
          </div>
        </div>
        <div className="saas-hero-bottom">
          <span>UMA NOVA FORMA DE TRABALHAR</span>
          <a href="#servicos" aria-label="Explorar os recursos">
            <ArrowDown size={18} />
          </a>
          <span>CRIADO PARA QUEM QUER CRESCER</span>
        </div>
      </div>
      <div className="saas-capabilities">
        <div className="saas-container">
          {[
            { icon: Layers3, name: "CRM completo" },
            { icon: MessageCircle, name: "WhatsApp integrado" },
            { icon: Sparkles, name: "Inteligência artificial" },
            { icon: Zap, name: "Automação de ponta a ponta" },
          ].map(({ icon: Icon, name }) => (
            <span key={name}>
              <Icon size={18} />
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
