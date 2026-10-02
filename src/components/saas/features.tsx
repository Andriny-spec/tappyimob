"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  Camera,
  Check,
  FileText,
  Globe2,
  HardDrive,
  Megaphone,
  MessageCircle,
  Network,
  Search,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { Eyebrow, Reveal, SalesButton } from "./primitives";

const features = [
  {
    icon: Users,
    title: "Oportunidades, bem cuidadas.",
    name: "CRM & leads",
    description:
      "Funil visual, distribuição de leads e follow-ups. O contexto que seu time precisa para chegar à próxima conversa.",
    tags: ["Kanban", "Distribuição", "Follow-up"],
    visual: "leads",
  },
  {
    icon: Building2,
    title: "Sua carteira. Organizada.",
    name: "Gestão de imóveis",
    description:
      "Do cadastro à divulgação. Centralize informações, fotos, condomínios e disponibilidade de cada imóvel.",
    tags: ["Portfólio", "Exclusividades", "Condomínios"],
    visual: "properties",
  },
  {
    icon: Wallet,
    title: "Cada resultado, à vista.",
    name: "Financeiro & equipe",
    description:
      "Acompanhe comissões, metas e corretores. Tenha clareza para tomar decisões e planejar o próximo passo.",
    tags: ["Comissões", "Metas", "Relatórios"],
    visual: "finance",
  },
];

export function Features() {
  const [active, setActive] = useState(0);
  const current = features[active];
  return (
    <section id="servicos" className="saas-section saas-light">
      <div className="saas-container">
        <Reveal className="saas-section-heading">
          <div>
            <Eyebrow>MENOS ABAS. MAIS POSSIBILIDADES.</Eyebrow>
            <h2>
              Uma operação inteira.
              <br />
              <span>Um só lugar.</span>
            </h2>
          </div>
          <p>
            Quando as ferramentas conversam,
            <br />o seu negócio vai mais longe. Conheça
            <br />o ecossistema que conecta cada ponta.
          </p>
        </Reveal>
        <div
          className="saas-feature-tabs"
          role="tablist"
          aria-label="Recursos da plataforma"
        >
          {features.map(({ icon: Icon, name }, i) => (
            <button
              key={name}
              role="tab"
              id={`feature-tab-${i}`}
              aria-selected={active === i}
              aria-controls="feature-panel"
              tabIndex={active === i ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(e) => {
                const next =
                  e.key === "ArrowRight"
                    ? (i + 1) % 3
                    : e.key === "ArrowLeft"
                      ? (i + 2) % 3
                      : null;
                if (next !== null) {
                  e.preventDefault();
                  setActive(next);
                  document.getElementById(`feature-tab-${next}`)?.focus();
                }
              }}
            >
              <Icon size={19} />
              {name}
              <span>0{i + 1}</span>
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            role="tabpanel"
            id="feature-panel"
            aria-labelledby={`feature-tab-${active}`}
            className="saas-feature-showcase"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="saas-feature-copy">
              <span className="saas-icon-tile">
                <current.icon size={25} />
              </span>
              <h3>{current.title}</h3>
              <p>{current.description}</p>
              <div className="saas-tags">
                {current.tags.map((tag) => (
                  <span key={tag}>
                    <Check size={11} />
                    {tag}
                  </span>
                ))}
              </div>
              <a href="#precos" className="saas-text-link">
                Encontre o seu plano <ArrowUpRight size={17} />
              </a>
            </div>
            <div className="saas-feature-art">
              <div className="saas-feature-orbit" />
              <div className="saas-feature-mini">
                <div className="saas-mini-toolbar">
                  <span>
                    <current.icon size={14} />
                    {current.name}
                  </span>
                  <MoreDots />
                </div>
                {active === 0 ? (
                  <>
                    <div className="saas-mini-funnel">
                      {["Novo lead", "Em contato", "Visita"].map((name, i) => (
                        <div key={name}>
                          <small>
                            <i />
                            {name}
                          </small>
                          <article>
                            <span
                              className={`saas-avatar ${i === 1 ? "blue" : "green"}`}
                            >
                              {["MC", "PA", "JS"][i]}
                            </span>
                            <strong>
                              {
                                [
                                  "Marina Costa",
                                  "Pedro Almeida",
                                  "Juliana Santos",
                                ][i]
                              }
                            </strong>
                            <p>
                              {
                                [
                                  "Apartamento · Jardins",
                                  "Casa · Alphaville",
                                  "Cobertura · Pinheiros",
                                ][i]
                              }
                            </p>
                            <span className="saas-mini-tag">
                              {
                                [
                                  "Novo interesse",
                                  "Contato realizado",
                                  "Visita confirmada",
                                ][i]
                              }
                            </span>
                          </article>
                        </div>
                      ))}
                    </div>
                    <div className="saas-mini-toast">
                      <Check size={13} /> Cada lead com o corretor certo.
                    </div>
                  </>
                ) : active === 1 ? (
                  <div className="saas-property-list">
                    {[
                      "Casa com jardim",
                      "Apartamento com varanda",
                      "Cobertura duplex",
                    ].map((title, i) => (
                      <div key={title}>
                        <span>
                          <Building2 size={23} />
                        </span>
                        <p>
                          <strong>{title}</strong>
                          <small>
                            {
                              [
                                "280 m² · 4 suítes",
                                "120 m² · 3 quartos",
                                "190 m² · 3 suítes",
                              ][i]
                            }
                          </small>
                        </p>
                        <b>Disponível</b>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="saas-finance-preview">
                    <span>COMISSÕES PREVISTAS</span>
                    <strong>
                      R$ 48.500<span>,00</span>
                    </strong>
                    <div className="saas-finance-bars">
                      {[35, 48, 40, 62, 57, 72, 64, 83, 74, 95].map(
                        (height, i) => (
                          <i key={i} style={{ height: `${height}%` }} />
                        ),
                      )}
                    </div>
                    <small>Visualização demonstrativa</small>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="saas-resource-grid">
          {[
            {
              icon: Megaphone,
              title: "Marketing que conecta",
              text: "Campanhas, blog e landing pages para dar voz à sua marca.",
            },
            {
              icon: CalendarDays,
              title: "Agenda sem desencontros",
              text: "Visitas, tarefas e compromissos conectados à sua rotina.",
            },
            {
              icon: Camera,
              title: "Imóveis no melhor ângulo",
              text: "Sessões de fotografia, galerias e organização das mídias.",
            },
            {
              icon: FileText,
              title: "Negócios bem documentados",
              text: "Contratos e informações reunidos para acompanhar cada etapa.",
            },
            {
              icon: Network,
              title: "Parcerias que somam",
              text: "Conecte parceiros, corretores e novas oportunidades.",
            },
            {
              icon: HardDrive,
              title: "Tudo no seu lugar",
              text: "Arquivos e documentos acessíveis para a sua equipe.",
            },
          ].map(({ icon: Icon, title, text }, i) => (
            <Reveal
              key={title}
              delay={(i % 3) * 0.07}
              className="saas-resource"
            >
              <Icon size={23} strokeWidth={1.5} />
              <h3>{title}</h3>
              <p>{text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
function MoreDots() {
  return <span aria-hidden="true">•••</span>;
}

export function Automation() {
  const [stage, setStage] = useState(0);
  return (
    <section id="automacao" className="saas-section saas-automation">
      <div className="saas-container saas-split">
        <Reveal className="saas-automation-art">
          <div className="saas-dot-pattern" />
          <div className="saas-chat">
            <div className="saas-chat-header">
              <span className="saas-chat-icon">
                <MessageCircle size={25} />
              </span>
              <div>
                <strong>Sua próxima oportunidade</strong>
                <span>
                  <i /> Conversa conectada ao CRM
                </span>
              </div>
              <Sparkles size={19} />
            </div>
            <div className="saas-chat-body">
              <div className="saas-chat-message">
                Olá! Gostei do apartamento com varanda. Ainda está disponível?
                <small>10:42</small>
              </div>
              <div className="saas-chat-message outgoing">
                Oi, Marina! Está sim. Separei os detalhes para você. Vamos
                agendar uma visita?
                <small>
                  10:43 <Check size={10} />
                  <Check size={10} />
                </small>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={stage}
                  className="saas-chat-event"
                  initial={{ opacity: 0, y: 7 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <span>
                    {stage === 0 ? (
                      <Users size={17} />
                    ) : stage === 1 ? (
                      <Sparkles size={17} />
                    ) : (
                      <CalendarDays size={17} />
                    )}
                  </span>
                  <div>
                    <strong>
                      {
                        [
                          "Lead criado no seu funil",
                          "Contexto para o próximo contato",
                          "Próximo passo organizado",
                        ][stage]
                      }
                    </strong>
                    <small>
                      {
                        [
                          "Marina Costa · Interesse em apartamento",
                          "Histórico e interesse reunidos no CRM",
                          "Visita · Amanhã, às 14h",
                        ][stage]
                      }
                    </small>
                  </div>
                  <Check size={14} />
                </motion.div>
              </AnimatePresence>
              <span className="saas-chat-caption">
                CONVERSA E FLUXO ILUSTRATIVOS
              </span>
            </div>
          </div>
          <div className="saas-ai-floating">
            <Sparkles size={18} />
            <span>
              Seu time + <strong>Tappy IA</strong>
            </span>
          </div>
        </Reveal>
        <Reveal className="saas-section-copy">
          <Eyebrow light>O SEU TIME, COM SUPERPODERES</Eyebrow>
          <h2>
            O lead chega.
            <br />A conexão acontece.
            <br />
            <span>O negócio avança.</span>
          </h2>
          <p>
            WhatsApp, automações e inteligência artificial no mesmo fluxo. Menos
            trabalho repetitivo. Mais tempo para ouvir, atender e vender.
          </p>
          <div className="saas-automation-steps">
            {[
              {
                icon: MessageCircle,
                title: "Conecte as conversas",
                text: "O atendimento perto de cada oportunidade.",
              },
              {
                icon: Sparkles,
                title: "Dê contexto ao seu time",
                text: "Informações para uma abordagem mais relevante.",
              },
              {
                icon: CalendarDays,
                title: "Mantenha o próximo passo à vista",
                text: "Follow-ups e agenda para seguir em frente.",
              },
            ].map(({ icon: Icon, title, text }, i) => (
              <button
                key={title}
                onClick={() => setStage(i)}
                aria-pressed={stage === i}
                className={stage === i ? "active" : ""}
              >
                <Icon size={20} />
                <span>
                  <strong>{title}</strong>
                  <small>{text}</small>
                </span>
                <ArrowRight size={16} />
              </button>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function WebsiteSection() {
  return (
    <section id="site" className="saas-section saas-light saas-website">
      <div className="saas-container saas-split">
        <Reveal className="saas-section-copy">
          <Eyebrow>SUA MARCA. SEU ENDEREÇO DIGITAL.</Eyebrow>
          <h2>
            Seu melhor imóvel
            <br />
            merece uma
            <br />
            <span>vitrine à altura.</span>
          </h2>
          <p>
            Um site com a identidade da sua imobiliária, conectado aos imóveis
            do CRM. Da descoberta ao contato, uma experiência que faz sentido.
          </p>
          <ul className="saas-check-list">
            <li>
              <Check /> Carteira de imóveis conectada ao site
            </li>
            <li>
              <Check /> Experiência que acompanha todas as telas
            </li>
            <li>
              <Check /> Hospedagem própria ou no servidor Tappy
            </li>
          </ul>
          <SalesButton>Quero minha própria vitrine</SalesButton>
          <small className="saas-under-note">
            Site e hospedagem são opções adicionais ao CRM.
          </small>
        </Reveal>
        <Reveal className="saas-website-art">
          <div className="saas-website-ring" />
          <div className="saas-browser-mock">
            <div className="saas-browser-bar">
              <span>● ● ●</span>
              <span>
                <Globe2 size={11} /> suaimobiliaria.com.br
              </span>
              <ArrowUpRight size={12} />
            </div>
            <div className="saas-estate-brand">
              <strong>
                CASA<span>·</span>
              </strong>
              <span>Imóveis &nbsp; Sobre &nbsp; Contato</span>
              <span className="saas-estate-contact">Fale com a gente ↗</span>
            </div>
            <div className="saas-estate-hero">
              <div className="saas-architectural-house" aria-hidden="true">
                <div className="saas-house-block" />
                <div className="saas-house-window" />
                <div className="saas-house-roof" />
                <div className="saas-house-tree" />
              </div>
              <div>
                <small>ENCONTRE O SEU LUGAR</small>
                <h3>
                  Um novo endereço.
                  <br />
                  Uma nova história.
                </h3>
                <span>Encontre o imóvel que combina com você.</span>
              </div>
              <div className="saas-estate-search">
                <span>Onde você quer morar?</span>
                <Search size={16} />
              </div>
            </div>
            <div className="saas-estate-list">
              <div>
                <i />
                <span>
                  Casa contemporânea<small>Alphaville · 280 m²</small>
                </span>
              </div>
              <div>
                <i />
                <span>
                  Apartamento com varanda<small>Jardins · 120 m²</small>
                </span>
              </div>
            </div>
          </div>
          <div className="saas-site-sync">
            <span>
              <Check size={18} />
            </span>
            <div>
              <strong>Cadastrou no CRM?</strong>
              <small>Seu site acompanha.</small>
            </div>
            <span className="saas-live-dot" />
          </div>
          <span className="saas-art-caption">
            EXEMPLO DE VITRINE PERSONALIZADA
          </span>
        </Reveal>
      </div>
    </section>
  );
}

export function Management() {
  return (
    <section id="gestao" className="saas-section saas-management">
      <div className="saas-container">
        <Reveal className="saas-section-heading">
          <div>
            <Eyebrow light>VISÃO DE GESTOR. LIBERDADE PARA CRESCER.</Eyebrow>
            <h2>
              Você cuida da estratégia.
              <br />
              <span>A Tappy conecta a operação.</span>
            </h2>
          </div>
          <p>
            Do corretor ao financeiro, cada pessoa
            <br />
            enxerga o que precisa. E você acompanha
            <br />o que realmente faz o negócio avançar.
          </p>
        </Reveal>
        <div className="saas-management-grid">
          <Reveal className="saas-management-card">
            <div className="saas-team-art">
              {["AC", "MC", "PA", "JS"].map((initials, i) => (
                <span key={initials} style={{ zIndex: 4 - i }}>
                  {initials}
                </span>
              ))}
              <span>+</span>
            </div>
            <h3>Um time. A mesma direção.</h3>
            <p>
              Corretores, SDRs, marketing e parceiros com funções e permissões
              para trabalhar juntos.
            </p>
            <span className="saas-card-link">
              <Users size={14} /> Pessoas conectadas
            </span>
          </Reveal>
          <Reveal className="saas-management-card" delay={0.08}>
            <div className="saas-goal-art">
              <div>
                <span>Meta da equipe</span>
                <strong>
                  78<span>%</span>
                </strong>
              </div>
              <div>
                <i />
              </div>
              <small>Visualização demonstrativa</small>
            </div>
            <h3>Resultados que você enxerga.</h3>
            <p>
              Metas, comissões e relatórios para acompanhar o desempenho sem
              depender de planilhas soltas.
            </p>
            <span className="saas-card-link">
              <Wallet size={14} /> Gestão com clareza
            </span>
          </Reveal>
          <Reveal className="saas-management-card" delay={0.16}>
            <div className="saas-connected-art">
              <Globe2 />
              <span />
              <div>
                <Building2 />
              </div>
              <span />
              <MessageCircle />
            </div>
            <h3>Cada ponto, conectado.</h3>
            <p>
              Seu portfólio, site, canais de atendimento e equipe dentro de um
              ecossistema de trabalho.
            </p>
            <span className="saas-card-link">
              <Network size={14} /> Uma operação completa
            </span>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
