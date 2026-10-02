"use client";

import { motion } from "framer-motion";
import { RiArrowRightLine, RiPhoneLine, RiCalendarLine } from "react-icons/ri";
import { Button } from "@/components/ui/button";

export function CTAFooter() {
  return (
    <section id="contato" className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700" />
      
      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff20_1px,transparent_1px),linear-gradient(to_bottom,#ffffff20_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      {/* Decorative shapes */}
      <motion.div
        className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-orange-900/30 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 7, repeat: Infinity }}
      />

      <div className="relative container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            <span className="text-sm font-medium text-white">
              Mais de 10.000 corretores já transformaram seus negócios
            </span>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6"
          >
            Pronto para revolucionar
            <br />
            suas vendas imobiliárias?
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-orange-100 mb-10 max-w-2xl mx-auto"
          >
            Comece seu teste gratuito de 14 dias agora mesmo. 
            Sem cartão de crédito, sem compromisso.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Button
              size="xl"
              className="bg-white text-orange-600 hover:bg-orange-50 shadow-xl shadow-orange-900/30 group w-full sm:w-auto"
            >
              Começar gratuitamente
              <RiArrowRightLine className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="xl"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto"
            >
              <RiCalendarLine className="w-5 h-5" />
              Agendar demonstração
            </Button>
          </motion.div>

          {/* Contact options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 text-white/80"
          >
            <a
              href="tel:+5511999999999"
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <RiPhoneLine className="w-5 h-5" />
              <span>+55 (11) 99999-9999</span>
            </a>
            <span className="hidden sm:block">•</span>
            <span>Atendimento 24/7</span>
            <span className="hidden sm:block">•</span>
            <span>Suporte em português</span>
          </motion.div>

          {/* Trust logos placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-16 pt-12 border-t border-white/20"
          >
            <p className="text-sm text-white/60 mb-6">
              Empresas que confiam na Tappy Imob
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
              {["Lopes", "QuintoAndar", "ZAP Imóveis", "VivaReal", "OLX Imóveis"].map((company) => (
                <div
                  key={company}
                  className="text-white font-bold text-lg"
                >
                  {company}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
