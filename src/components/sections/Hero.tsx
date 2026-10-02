"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  RiArrowRightLine,
  RiPlayCircleLine,
  RiHome4Line,
  RiUserLine,
  RiFileList3Line,
  RiBarChartLine,
  RiCalendarLine,
  RiWhatsappLine,
  RiSparklingLine,
  RiCheckLine,
  RiStarFill,
} from "react-icons/ri";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const typingWords = [
  "transforma vendas",
  "acelera negócios",
  "conquista clientes",
  "automatiza processos",
  "gera resultados",
];

// Floating elements around the image
const floatingElements = [
  { icon: RiUserLine, label: "Novo Lead", value: "João Silva", color: "bg-blue-500", position: { top: "5%", left: "-10%" }, delay: 0 },
  { icon: RiHome4Line, label: "234", value: "imóveis", color: "bg-green-500", position: { top: "20%", right: "-15%" }, delay: 0.2 },
  { icon: RiWhatsappLine, label: "Mensagem", value: "recebida", color: "bg-emerald-500", position: { bottom: "30%", left: "-20%" }, delay: 0.4 },
  { icon: RiBarChartLine, label: "+27%", value: "vendas", color: "bg-orange-500", position: { bottom: "15%", right: "-10%" }, delay: 0.6 },
  { icon: RiCalendarLine, label: "Visita", value: "14:00", color: "bg-purple-500", position: { top: "45%", left: "-25%" }, delay: 0.8 },
  { icon: RiSparklingLine, label: "IA", value: "ativa", color: "bg-pink-500", position: { top: "60%", right: "-20%" }, delay: 1 },
];

export function Hero() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = typingWords[currentWordIndex];
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (displayText.length < currentWord.length) {
            setDisplayText(currentWord.slice(0, displayText.length + 1));
          } else {
            setTimeout(() => setIsDeleting(true), 2000);
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText(displayText.slice(0, -1));
          } else {
            setIsDeleting(false);
            setCurrentWordIndex((prev) => (prev + 1) % typingWords.length);
          }
        }
      },
      isDeleting ? 50 : 100
    );

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentWordIndex]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950" />
      
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-20 left-10 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-3xl"
        animate={{
          x: [0, -30, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:48px_48px]" />

      <div className="relative container mx-auto px-4 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
              </span>
              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                +500 imobiliárias já confiam na Tappy Imob
              </span>
            </motion.div>

            {/* Title with typing effect */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6"
            >
              <span className="text-neutral-900 dark:text-white">O CRM que</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
                {displayText}
                <motion.span
                  className="inline-block w-1 h-[1em] bg-orange-500 ml-1"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 mb-8 max-w-xl mx-auto lg:mx-0"
            >
              A plataforma completa para corretores e imobiliárias que querem 
              vender mais, organizar leads e fechar negócios em tempo recorde.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Button variant="glow" size="xl" className="group w-full sm:w-auto">
                Começar gratuitamente
                <RiArrowRightLine className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="xl" className="group w-full sm:w-auto">
                <RiPlayCircleLine className="w-5 h-5" />
                Ver demonstração
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mt-10 pt-10 border-t border-neutral-200 dark:border-neutral-800"
            >
              {[
                { value: "10K+", label: "Corretores" },
                { value: "500K", label: "Imóveis" },
                { value: "98%", label: "Satisfação" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-orange-500">{stat.value}</div>
                  <div className="text-sm text-neutral-500">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right - Hero Image with Floating Elements */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative hidden lg:flex items-center justify-center"
          >
            <div className="relative">
              {/* Glow rings */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500/20 to-emerald-500/20 blur-3xl scale-110"
                animate={{ scale: [1.1, 1.2, 1.1], opacity: [0.5, 0.7, 0.5] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.div
                className="absolute -inset-4 rounded-full border-2 border-dashed border-orange-300/30 dark:border-orange-500/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute -inset-12 rounded-full border border-orange-200/20 dark:border-orange-500/10"
                animate={{ rotate: -360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              />

              {/* Main circular image */}
              <div className="relative w-96 h-96 rounded-full overflow-hidden border-4 border-white dark:border-neutral-800 shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=90"
                  alt="Casa de luxo moderna"
                  fill
                  className="object-cover"
                  priority
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-orange-500/20 to-transparent" />
              </div>

              {/* Floating Elements */}
              {floatingElements.map((el, index) => (
                <motion.div
                  key={el.label}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + el.delay, type: "spring", stiffness: 200 }}
                  className="absolute"
                  style={el.position as React.CSSProperties}
                >
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}
                    className="bg-white dark:bg-neutral-800 rounded-2xl p-3 shadow-xl border border-neutral-100 dark:border-neutral-700"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-xl ${el.color} flex items-center justify-center`}>
                        <el.icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-neutral-900 dark:text-white">{el.label}</p>
                        <p className="text-[10px] text-neutral-500">{el.value}</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}

              {/* Stats badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white dark:bg-neutral-800 rounded-2xl px-6 py-3 shadow-xl border border-neutral-100 dark:border-neutral-700"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-orange-500">500+</p>
                    <p className="text-[10px] text-neutral-500">Imobiliárias</p>
                  </div>
                  <div className="w-px h-8 bg-neutral-200 dark:bg-neutral-700" />
                  <div className="text-center">
                    <p className="text-lg font-bold text-orange-500">10K+</p>
                    <p className="text-[10px] text-neutral-500">Corretores</p>
                  </div>
                  <div className="w-px h-8 bg-neutral-200 dark:bg-neutral-700" />
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <RiStarFill key={i} className="w-3 h-3 text-amber-400" />
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Checkmarks floating */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 }}
                className="absolute top-0 right-0 translate-x-4 -translate-y-4"
              >
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                  <RiCheckLine className="w-5 h-5 text-white" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <motion.div
          className="w-6 h-10 rounded-full border-2 border-neutral-300 dark:border-neutral-600 flex items-start justify-center p-2"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <motion.div
            className="w-1 h-2 rounded-full bg-orange-500"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
