"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  Check,
  MessageCircle,
  Sparkles,
  Users,
} from "lucide-react";
import { Eyebrow, Reveal } from "./primitives";

const Lottie = dynamic(
  () => import("lottie-react").then((mod) => mod.LottieLight),
  { ssr: false },
);
const chapters = [
  {
    title: "Atraia as pessoas certas.",
    label: "Conecte",
    icon: Building2,
    detail:
      "Sua carteira organizada, seu site com a sua marca e seus canais prontos para receber novas oportunidades.",
    card: "Seu imóvel, em destaque",
    sub: "Uma vitrine conectada à sua carteira",
    note: "Seu próximo cliente encontra você.",
  },
  {
    title: "Transforme interesse em conversa.",
    label: "Atenda",
    icon: MessageCircle,
    detail:
      "Reúna os leads no CRM, distribua as oportunidades e mantenha o histórico de cada conversa perto da sua equipe.",
    card: "Marina tem interesse",
    sub: "Novo lead recebido no CRM",
    note: "Cada contato merece atenção.",
  },
  {
    title: "Acompanhe cada próximo passo.",
    label: "Evolua",
    icon: CalendarCheck,
    detail:
      "Do follow-up à visita, seu funil mostra onde cada negociação está. O time ganha contexto para seguir em frente.",
    card: "Visita confirmada",
    sub: "Amanhã, às 14h · Marina Costa",
    note: "O relacionamento continua.",
  },
  {
    title: "Feche. Aprenda. Vá além.",
    label: "Cresça",
    icon: Sparkles,
    detail:
      "Conecte contratos, comissões e metas à rotina. Transforme a visão do seu negócio em decisões para o próximo ciclo.",
    card: "Um novo capítulo",
    sub: "Contrato, comissão e meta conectados",
    note: "Cada negócio abre novas possibilidades.",
  },
];

export function Process() {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "100px" });
  const reduced = useReducedMotion();
  const chapter = chapters[active];
  return (
    <section id="como-funciona" className="saas-section saas-process">
      <div className="saas-container">
        <Reveal className="saas-centered-heading">
          <Eyebrow light>DO PRIMEIRO CONTATO AO PRÓXIMO NEGÓCIO</Eyebrow>
          <h2>
            As peças se conectam.
            <br />
            <span>Sua imobiliária evolui.</span>
          </h2>
          <p>Um fluxo contínuo, pensado para a vida real do seu time.</p>
        </Reveal>
        <div className="saas-process-layout">
          <div className="saas-process-scene" ref={ref}>
            <div className="saas-orbit-poster" aria-hidden="true" />
            {inView && (
              <Lottie
                src="/saas/connections.json"
                autoplay={!reduced}
                loop={!reduced}
                className="saas-lottie"
                aria-hidden="true"
              />
            )}
            <div className="saas-process-core">
              <Image
                src="/saas/tappy-symbol.png"
                alt=""
                width={140}
                height={140}
                sizes="140px"
              />
              <span>TUDO CONECTADO</span>
            </div>
            <div
              className={`saas-orbit-node node-one ${active === 0 ? "active" : ""}`}
            >
              <Building2 />
              <span>Imóveis</span>
            </div>
            <div
              className={`saas-orbit-node node-two ${active === 1 ? "active" : ""}`}
            >
              <MessageCircle />
              <span>WhatsApp</span>
            </div>
            <div
              className={`saas-orbit-node node-three ${active === 2 ? "active" : ""}`}
            >
              <Users />
              <span>CRM & leads</span>
            </div>
            <div
              className={`saas-orbit-node node-four ${active === 3 ? "active" : ""}`}
            >
              <Sparkles />
              <span>Tappy IA</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                className="saas-process-notification"
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <span>
                  <chapter.icon size={18} />
                </span>
                <div>
                  <strong>{chapter.card}</strong>
                  <small>{chapter.sub}</small>
                </div>
                <Check size={14} />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="saas-process-story">
            <div
              className="saas-step-tabs"
              role="tablist"
              aria-label="Etapas do seu negócio"
            >
              {chapters.map((item, i) => (
                <button
                  role="tab"
                  id={`process-tab-${i}`}
                  aria-controls="process-panel"
                  aria-selected={active === i}
                  tabIndex={active === i ? 0 : -1}
                  key={item.label}
                  onClick={() => setActive(i)}
                  onKeyDown={(e) => {
                    const next =
                      e.key === "ArrowRight"
                        ? (i + 1) % 4
                        : e.key === "ArrowLeft"
                          ? (i + 3) % 4
                          : null;
                    if (next !== null) {
                      e.preventDefault();
                      setActive(next);
                      document.getElementById(`process-tab-${next}`)?.focus();
                    }
                  }}
                >
                  <span>0{i + 1}</span>
                  {item.label}
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                id="process-panel"
                role="tabpanel"
                aria-labelledby={`process-tab-${active}`}
                className="saas-process-chapter"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <span className="saas-chapter-number">
                  0{active + 1}
                  <span> / 04</span>
                </span>
                <h3>{chapter.title}</h3>
                <p>{chapter.detail}</p>
                <span className="saas-process-note">
                  <Check size={14} />
                  {chapter.note}
                </span>
              </motion.div>
            </AnimatePresence>
            <button
              className="saas-text-link"
              onClick={() => setActive((active + 1) % 4)}
            >
              {active === 3 ? "Rever a jornada" : "Próxima etapa"}
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
