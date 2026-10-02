"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { RiArrowRightLine, RiUserStarLine } from "react-icons/ri";

export function CTACorretor() {
  return (
    <section className="relative py-24 bg-white dark:bg-neutral-950 overflow-hidden">
      {/* Pattern Background */}
      <div className="absolute inset-0">
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231B254A' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Subtle gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0B2545]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#0B2545]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0B2545]/5 dark:bg-white/5 border border-[#0B2545]/10 dark:border-white/10 mb-6"
          >
            <RiUserStarLine className="w-4 h-4 text-[#0B2545] dark:text-sky-400" />
            <span className="text-sm font-medium text-[#0B2545] dark:text-white">
              Para Corretores
            </span>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-6"
          >
            Seja um corretor{" "}
            <span className="text-[#0B2545] dark:text-sky-400">parceiro</span>
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-neutral-600 dark:text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Junte-se à nossa rede de corretores e tenha acesso exclusivo aos melhores 
            imóveis de alto padrão de Sua Cidade e região. Comissões diferenciadas e 
            suporte completo para alavancar suas vendas.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Link
              href="/corretor"
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#0B2545] text-white font-semibold rounded-full hover:bg-[#081733] transition-all group"
            >
              Quero ser parceiro
              <RiArrowRightLine className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-8 md:gap-16 mt-14 pt-10 border-t border-neutral-200 dark:border-neutral-800"
          >
            {[
              { value: "50+", label: "Corretores parceiros" },
              { value: "R$ 2M", label: "Em comissões/mês" },
              { value: "15%", label: "Comissão média" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-2xl md:text-3xl font-bold text-[#0B2545] dark:text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-neutral-500 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
