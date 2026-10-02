"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  RiArrowRightLine,
  RiMapPinLine,
  RiShieldCheckLine,
  RiHandHeartLine,
  RiCompassDiscoverLine,
  RiTeamLine,
  RiBuilding4Line,
  RiLineChartLine,
} from "react-icons/ri";

/* ─── Branding Tappy Imob ─── */
const BRAND = {
  azul: "#0A1E3D",
  terracota: "#1EBE5A",
  dourado: "#7EE2A8",
  bege: "#F5F0EB",
  escuro: "#0F1629",
};

/* ─── Dados ─── */
const numeros = [
  { valor: "12+", label: "Anos de mercado", suffix: "" },
  { valor: "800+", label: "Imóveis negociados", suffix: "" },
  { valor: "2.350+", label: "Parceiros de negócios", suffix: "" },
  { valor: "100%", label: "Presença em Sua Cidade", suffix: "" },
];

const pilares = [
  {
    icon: RiShieldCheckLine,
    titulo: "Confiança",
    descricao: "Segurança e transparência em cada etapa da negociação. Sua tranquilidade é nossa prioridade.",
  },
  {
    icon: RiHandHeartLine,
    titulo: "Conexão",
    descricao: "Entendemos que cada pessoa tem uma história. Conectamos você ao imóvel que faz sentido para a sua vida.",
  },
  {
    icon: RiCompassDiscoverLine,
    titulo: "Expertise",
    descricao: "Conhecimento profundo do mercado de Sua Cidade e região, com análises precisas de valorização.",
  },
  {
    icon: RiLineChartLine,
    titulo: "Valor",
    descricao: "Decisões estratégicas que protegem e multiplicam seu patrimônio ao longo do tempo.",
  },
];

const equipe = [
  {
    nome: "Juliana Takahashi",
    cargo: "COO",
    foto: "/juliana.jpeg",
  },
  {
    nome: "Jakeline Januária",
    cargo: "Diretora Comercial",
    foto: "/jakeline.jpeg",
  },
];

/* ─── Animated Counter ─── */
function AnimatedNumber({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="block"
    >
      {value}
    </motion.span>
  );
}

/* ─── Horizontal Divider ─── */
function BrandDivider() {
  return (
    <div className="flex items-center justify-center gap-3 my-2">
      <div className="h-px w-8 bg-[#7EE2A8]/40" />
      <div className="w-1.5 h-1.5 rounded-full bg-[#7EE2A8]" />
      <div className="h-px w-8 bg-[#7EE2A8]/40" />
    </div>
  );
}

export default function SobrePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const [activePilar, setActivePilar] = useState(0);

  return (
    <div className="bg-white dark:bg-neutral-950 font-[family-name:var(--font-poppins),sans-serif]">

      {/* ═══════════ HERO ═══════════ */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div style={{ y, scale }} className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80"
            alt="Tappy Imob"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A1E3D]/80 via-[#0A1E3D]/60 to-[#0A1E3D]/90" />
        </motion.div>

        <motion.div style={{ opacity }} className="relative z-10 text-center px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#7EE2A8]/30 bg-white/5 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-[#7EE2A8]" />
              <span className="text-[#7EE2A8] text-sm tracking-[0.2em] uppercase font-medium">Tappy Imob</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-8"
          >
            Conexão patrimonial.{" "}
            <span className="text-[#7EE2A8]">Valor</span> que permanece.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed"
          >
            Há mais de 12 anos conectando pessoas aos melhores endereços de 
            Sua Cidade e região com expertise, confiança e sofisticação.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/imoveis"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-[#1EBE5A] text-white font-semibold rounded-xl hover:bg-[#b5613e] transition-all duration-300 hover:shadow-lg hover:shadow-[#1EBE5A]/20"
            >
              Explorar imóveis
              <RiArrowRightLine className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-[#7EE2A8]/30 flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 rounded-full bg-[#7EE2A8]"
            />
          </div>
        </motion.div>
      </section>

      {/* ═══════════ NÚMEROS ═══════════ */}
      <section className="py-20 md:py-28 bg-[#0A1E3D]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            {numeros.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="text-center"
              >
                <p className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#7EE2A8] mb-2">
                  <AnimatedNumber value={item.valor} />
                </p>
                <p className="text-white/50 text-sm tracking-wide">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ NOSSA MARCA ═══════════ */}
      <section className="py-24 md:py-36 bg-[#F5F0EB] dark:bg-neutral-900">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-2 lg:order-1"
            >
              <div className="inline-flex items-center gap-2 mb-6">
                <div className="h-px w-10 bg-[#1EBE5A]" />
                <span className="text-[#1EBE5A] text-sm tracking-[0.15em] uppercase font-medium">Nossa essência</span>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0A1E3D] dark:text-white mb-8 leading-tight">
                Construímos relações,{" "}
                <span className="text-[#1EBE5A]">não apenas negócios</span>
              </h2>

              <div className="space-y-6 text-base md:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
                <p>
                  A identidade da Tappy Imob nasce do conceito de <strong className="text-[#0A1E3D] dark:text-white font-semibold">conexão patrimonial</strong> — 
                  a relação contínua entre pessoas, imóveis e decisões estratégicas que 
                  constroem valor ao longo do tempo.
                </p>
                <p>
                  Não somos apenas intermediários. Somos consultores que entendem que 
                  cada imóvel representa um capítulo na história de quem o escolhe. 
                  Por isso, tratamos cada negociação com a atenção e o cuidado que ela merece.
                </p>
              </div>

              <div className="mt-10 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <RiBuilding4Line className="w-5 h-5 text-[#1EBE5A]" />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Alto padrão</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-neutral-300" />
                <div className="flex items-center gap-2">
                  <RiMapPinLine className="w-5 h-5 text-[#1EBE5A]" />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Sua Cidade e região</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-neutral-300" />
                <div className="flex items-center gap-2">
                  <RiTeamLine className="w-5 h-5 text-[#1EBE5A]" />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Atendimento exclusivo</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-1 lg:order-2"
            >
              <div className="relative">
                <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src="/jaque.jpeg"
                    alt="Jaqueline - Tappy Imob"
                    fill
                    className="object-cover"
                  />
                </div>
                {/* Badge flutuante */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="absolute -bottom-6 -left-6 md:-bottom-8 md:-left-8"
                >
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-[#0A1E3D] shadow-xl flex flex-col items-center justify-center">
                    <span className="text-3xl md:text-5xl font-bold text-[#7EE2A8]">12</span>
                    <span className="text-xs md:text-sm text-white/60 tracking-wider uppercase">anos</span>
                  </div>
                </motion.div>
                {/* Detalhe decorativo */}
                <div className="absolute -top-4 -right-4 w-24 h-24 border-2 border-[#7EE2A8]/20 rounded-2xl" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ EQUIPE / CARÔMETRO ═══════════ */}
      <section className="py-24 md:py-36 bg-[#F5F0EB] dark:bg-neutral-900">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="h-px w-10 bg-[#1EBE5A]/40" />
              <span className="text-[#1EBE5A] text-sm tracking-[0.15em] uppercase font-medium">Nosso time</span>
              <div className="h-px w-10 bg-[#1EBE5A]/40" />
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0A1E3D] dark:text-white mb-4">
              Quem faz acontecer
            </h2>
            <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
              Profissionais apaixonados por conectar pessoas aos melhores endereços
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {equipe.map((pessoa, i) => (
              <motion.div
                key={pessoa.nome}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="group text-center"
              >
                <div className="relative w-44 h-44 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full border-2 border-[#7EE2A8]/20 group-hover:border-[#7EE2A8]/60 transition-colors duration-500 scale-110" />
                  <div className="relative w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-[#0A1E3D] to-[#2a3a6a]">
                    {pessoa.foto ? (
                      <Image
                        src={pessoa.foto}
                        alt={pessoa.nome}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl font-bold text-[#7EE2A8]">
                          {pessoa.nome.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-[#0A1E3D] dark:text-white">
                  {pessoa.nome}
                </h3>
                <p className="text-sm text-[#1EBE5A] font-medium">{pessoa.cargo}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FRASE DESTAQUE ═══════════ */}
      <section className="py-24 md:py-36 bg-white dark:bg-neutral-950 relative overflow-hidden">
        {/* Detalhe decorativo */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#7EE2A8]/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#7EE2A8]/20 to-transparent" />

        <div className="container mx-auto px-4 lg:px-8">
          <motion.blockquote
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <BrandDivider />
            <p className="text-2xl md:text-4xl lg:text-5xl font-light text-[#0A1E3D] dark:text-white leading-relaxed mt-8 mb-8 italic">
              &ldquo;Um endereço não é apenas um lugar. É onde a vida acontece, 
              onde memórias são criadas, onde histórias começam.&rdquo;
            </p>
            <BrandDivider />
            <footer className="mt-6 text-[#1EBE5A] font-medium tracking-wide">
              Juliana Takahashi — Fundadora
            </footer>
          </motion.blockquote>
        </div>
      </section>

      {/* ═══════════ PILARES ═══════════ */}
      <section className="py-24 md:py-36 bg-[#0A1E3D]">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="h-px w-10 bg-[#7EE2A8]/40" />
              <span className="text-[#7EE2A8] text-sm tracking-[0.15em] uppercase font-medium">O que nos move</span>
              <div className="h-px w-10 bg-[#7EE2A8]/40" />
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
              Nossos pilares
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pilares.map((pilar, i) => {
              const Icon = pilar.icon;
              return (
                <motion.div
                  key={pilar.titulo}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  onMouseEnter={() => setActivePilar(i)}
                  className={`group relative p-8 rounded-2xl border transition-all duration-500 cursor-default ${
                    activePilar === i
                      ? "bg-white/10 border-[#7EE2A8]/40 scale-[1.02]"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#7EE2A8]/20"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-colors duration-500 ${
                    activePilar === i ? "bg-[#1EBE5A]" : "bg-white/10"
                  }`}>
                    <Icon className={`w-6 h-6 transition-colors duration-500 ${
                      activePilar === i ? "text-white" : "text-[#7EE2A8]"
                    }`} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">{pilar.titulo}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{pilar.descricao}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ SUA_CIDADE ═══════════ */}
      <section className="py-24 md:py-36 bg-white dark:bg-neutral-950">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-7 space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.4 }}
                    className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg relative"
                  >
                    <Image
                      src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80"
                      alt="Sua Cidade"
                      fill
                      className="object-cover"
                    />
                  </motion.div>
                </div>
                <div className="col-span-5 space-y-4 pt-12">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.4 }}
                    className="aspect-square rounded-2xl overflow-hidden shadow-lg relative"
                  >
                    <Image
                      src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80"
                      alt="Imóvel"
                      fill
                      className="object-cover"
                    />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.4 }}
                    className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg relative"
                  >
                    <Image
                      src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&q=80"
                      alt="Interior"
                      fill
                      className="object-cover"
                    />
                  </motion.div>
                </div>
              </div>
              {/* Detalhe decorativo */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 border-2 border-[#1EBE5A]/15 rounded-2xl -z-10" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 mb-6">
                <div className="h-px w-10 bg-[#1EBE5A]" />
                <span className="text-[#1EBE5A] text-sm tracking-[0.15em] uppercase font-medium">Nosso território</span>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0A1E3D] dark:text-white mb-8 leading-tight">
                Sua Cidade é{" "}
                <span className="text-[#1EBE5A]">nossa casa</span>
              </h2>

              <div className="space-y-6 text-base md:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
                <p>
                  Conhecemos cada rua, cada condomínio, cada detalhe dessa região que 
                  amamos. Não somos apenas corretores — somos moradores, vizinhos, parte 
                  da comunidade.
                </p>
                <p>
                  Essa proximidade nos permite oferecer algo que poucos conseguem: 
                  insights reais sobre valorização, qualidade de vida e o verdadeiro 
                  potencial de cada imóvel.
                </p>
              </div>

              <div className="mt-10 p-6 rounded-2xl bg-[#F5F0EB] dark:bg-neutral-900 border border-[#7EE2A8]/10">
                <div className="flex items-center gap-3 mb-3">
                  <RiMapPinLine className="w-5 h-5 text-[#1EBE5A]" />
                  <span className="font-semibold text-[#0A1E3D] dark:text-white">Regiões de atuação</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Sua Cidade", "Tamboré"].map((r) => (
                    <span key={r} className="px-3 py-1.5 text-sm rounded-lg bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  );
}
