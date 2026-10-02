"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  MessageCircle,
  Minus,
  Plus,
  Sparkles,
} from "lucide-react";
import { Brand, Eyebrow, Reveal, SalesButton } from "./primitives";
import { salesLink } from "./config";

const faqs = [
  [
    "O que é o TappyImob?",
    "É uma plataforma de gestão para o mercado imobiliário. Reúne CRM, carteira de imóveis, atendimento, agenda, equipe, financeiro, marketing e inteligência artificial em um ecossistema conectado. Os módulos disponíveis dependem do plano contratado.",
  ],
  [
    "Posso usar com a minha equipe de corretores?",
    "Sim. O sistema trabalha com diferentes perfis e permissões, incluindo gestão, corretores, SDRs, marketing e fotografia. Assim, cada pessoa acessa as ferramentas da sua função. Os limites de usuários apresentados nos planos são demonstrativos.",
  ],
  [
    "Preciso contratar um site para usar o CRM?",
    "Não. Você pode começar apenas com o CRM. O site imobiliário é uma opção adicional para publicar os imóveis da sua carteira com a identidade da sua empresa.",
  ],
  [
    "Posso usar minha própria hospedagem?",
    "Sim, essa é uma das opções previstas para o site conectado ao CRM. Você pode escolher sua própria hospedagem, sujeita à validação dos requisitos técnicos, ou o servidor Tappy. Escopo de implantação, custos e suporte são alinhados na contratação.",
  ],
  [
    "Como funciona a integração com o WhatsApp?",
    "O módulo de WhatsApp aproxima as conversas da gestão dos leads e da rotina de atendimento. Na demonstração, apresentamos os recursos disponíveis e as configurações necessárias para a sua operação.",
  ],
  [
    "Os planos e o pagamento já estão disponíveis?",
    "Os valores, limites e checkout desta página são demonstrativos. É possível explorar Pix, cartão, boleto e opções de hospedagem, mas nenhuma cobrança ou assinatura real é realizada nesta versão.",
  ],
];
export function FAQ() {
  const [active, setActive] = useState<number | null>(0);
  return (
    <section id="duvidas" className="saas-section saas-light saas-faq">
      <div className="saas-container saas-faq-layout">
        <Reveal>
          <Eyebrow>PODE PERGUNTAR</Eyebrow>
          <h2>
            Boas perguntas.
            <br />
            <span>Respostas claras.</span>
          </h2>
          <p>
            Uma decisão importante merece
            <br />
            uma conversa sem complicação.
          </p>
          <a
            href={salesLink()}
            className="saas-text-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={17} /> Fale com a nossa equipe{" "}
            <ArrowUpRight size={16} />
          </a>
        </Reveal>
        <div className="saas-faq-list">
          {faqs.map(([question, answer], i) => (
            <div
              key={question}
              className={`saas-faq-item ${active === i ? "active" : ""}`}
            >
              <h3>
                <button
                  aria-expanded={active === i}
                  aria-controls={`faq-answer-${i}`}
                  id={`faq-question-${i}`}
                  onClick={() => setActive(active === i ? null : i)}
                >
                  <span>
                    <small>0{i + 1}</small>
                    {question}
                  </span>
                  {active === i ? <Minus size={18} /> : <Plus size={18} />}
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {active === i && (
                  <motion.div
                    id={`faq-answer-${i}`}
                    role="region"
                    aria-labelledby={`faq-question-${i}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.23 }}
                  >
                    <p>{answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCTA() {
  return (
    <section id="atendimento" className="saas-final-cta">
      <div className="saas-cta-orbits" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="saas-container">
        <Reveal>
          <span className="saas-cta-spark">
            <Sparkles size={25} />
          </span>
          <Eyebrow light>O FUTURO NÃO PRECISA ESPERAR</Eyebrow>
          <h2>
            Seu próximo grande negócio
            <br />
            começa com uma <span>conexão.</span>
          </h2>
          <p>
            Conheça a TappyImob. Vamos construir o próximo
            <br className="saas-desktop-br" /> capítulo da sua imobiliária,
            juntos.
          </p>
          <SalesButton>Vamos conversar sobre o seu negócio</SalesButton>
          <span className="saas-cta-note">
            Uma conversa. Novas possibilidades.
          </span>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="saas-footer">
      <div className="saas-container">
        <div className="saas-footer-main">
          <div>
            <Brand />
            <p>
              Conectando pessoas, imóveis
              <br />e o próximo capítulo do seu negócio.
            </p>
            <a
              href={salesLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="saas-footer-whatsapp"
            >
              <MessageCircle size={16} /> Vamos conversar{" "}
              <ArrowUpRight size={14} />
            </a>
          </div>
          <div>
            <span>PLATAFORMA</span>
            <a href="#servicos">CRM & gestão</a>
            <a href="#automacao">WhatsApp & IA</a>
            <a href="#site">Site imobiliário</a>
            <a href="#gestao">Equipe & resultados</a>
          </div>
          <div>
            <span>EXPLORE</span>
            <a href="#como-funciona">Como funciona</a>
            <a href="#precos">Planos e preços</a>
            <a href="#duvidas">Dúvidas frequentes</a>
            <Link href="/portal">
              Portal de imóveis <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="saas-footer-access">
            <span>SEU PRÓXIMO NÍVEL</span>
            <h3>
              Bom ter você
              <br />
              por aqui.
            </h3>
            <Link href="/login">
              Acessar minha conta <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        <div className="saas-footer-bottom">
          <span>
            © {new Date().getFullYear()} TappyImob. Todos os direitos
            reservados.
          </span>
          <div>
            <Link href="/termos">Termos de uso</Link>
            <Link href="/privacidade">Privacidade</Link>
            <a href="#saas-main">Voltar ao topo ↑</a>
          </div>
        </div>
        <div className="saas-footer-wordmark" aria-hidden="true">
          tappy<span>imob.</span>
        </div>
      </div>
    </footer>
  );
}
