"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  RiHome4Line,
  RiUserLine,
  RiFileList3Line,
  RiBarChartLine,
  RiCalendarLine,
  RiMailLine,
  RiSmartphoneLine,
  RiMapPinLine,
  RiShieldCheckLine,
  RiRobot2Line,
  RiWhatsappLine,
  RiPieChartLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
} from "react-icons/ri";

const recursos = [
  {
    icon: RiHome4Line,
    title: "Gestão de Imóveis",
    description: "Cadastre e gerencie todos os seus imóveis com fotos, vídeos, plantas e tours virtuais em uma interface intuitiva.",
    color: "orange",
    image: "/features/imoveis.jpg",
  },
  {
    icon: RiUserLine,
    title: "CRM de Leads",
    description: "Capture, organize e acompanhe todos os seus leads do primeiro contato até o fechamento do negócio.",
    color: "blue",
    image: "/features/crm.jpg",
  },
  {
    icon: RiWhatsappLine,
    title: "Integração WhatsApp",
    description: "Conecte seu WhatsApp Business e responda clientes diretamente pela plataforma com templates prontos.",
    color: "green",
    image: "/features/whatsapp.jpg",
  },
  {
    icon: RiCalendarLine,
    title: "Agenda Inteligente",
    description: "Organize visitas, reuniões e follow-ups com lembretes automáticos e sincronização com Google Calendar.",
    color: "purple",
    image: "/features/agenda.jpg",
  },
  {
    icon: RiFileList3Line,
    title: "Contratos Digitais",
    description: "Gere contratos personalizados e colete assinaturas digitais com validade jurídica em minutos.",
    color: "pink",
    image: "/features/contratos.jpg",
  },
  {
    icon: RiBarChartLine,
    title: "Relatórios Avançados",
    description: "Dashboards em tempo real com métricas de vendas, conversão, performance de corretores e muito mais.",
    color: "cyan",
    image: "/features/relatorios.jpg",
  },
  {
    icon: RiRobot2Line,
    title: "Automações IA",
    description: "Automatize respostas, qualificação de leads e follow-ups com inteligência artificial integrada.",
    color: "indigo",
    image: "/features/automacao.jpg",
  },
  {
    icon: RiMapPinLine,
    title: "Mapa Interativo",
    description: "Visualize imóveis no mapa, defina áreas de atuação e encontre imóveis próximos a pontos de interesse.",
    color: "teal",
    image: "/features/mapa.jpg",
  },
  {
    icon: RiSmartphoneLine,
    title: "App Mobile",
    description: "Acesse tudo pelo celular: cadastre imóveis, responda leads e agende visitas de onde estiver.",
    color: "rose",
    image: "/features/mobile.jpg",
  },
  {
    icon: RiMailLine,
    title: "Email Marketing",
    description: "Crie campanhas segmentadas, envie novidades de imóveis e acompanhe taxas de abertura e cliques.",
    color: "amber",
    image: "/features/email.jpg",
  },
  {
    icon: RiPieChartLine,
    title: "Avaliação de Imóveis",
    description: "Calcule o valor de mercado dos imóveis com base em dados comparativos da região automaticamente.",
    color: "lime",
    image: "/features/avaliacao.jpg",
  },
  {
    icon: RiShieldCheckLine,
    title: "Segurança Total",
    description: "Seus dados protegidos com criptografia de ponta, backups automáticos e conformidade LGPD.",
    color: "slate",
    image: "/features/seguranca.jpg",
  },
];

// All icons use brand colors only (orange, black, white)
const brandColors = {
  bg: "bg-orange-100 dark:bg-orange-500/20",
  text: "text-orange-500",
  border: "border-orange-500",
};

export function Recursos() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section id="recursos" className="py-20 lg:py-32 bg-neutral-50 dark:bg-neutral-900/50 overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12"
        >
          <div>
            <span className="inline-block px-3 py-1 text-xs font-semibold text-orange-500 bg-orange-100 dark:bg-orange-500/10 rounded-full mb-4">
              RECURSOS
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
              Tudo que você precisa
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
                em um só lugar
              </span>
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-xl">
              Mais de 50 funcionalidades para transformar sua imobiliária em uma máquina de vendas.
            </p>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`p-3 rounded-full border transition-all ${
                canScrollLeft
                  ? "border-neutral-300 dark:border-neutral-700 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10"
                  : "border-neutral-200 dark:border-neutral-800 opacity-50 cursor-not-allowed"
              }`}
            >
              <RiArrowLeftSLine className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`p-3 rounded-full border transition-all ${
                canScrollRight
                  ? "border-neutral-300 dark:border-neutral-700 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10"
                  : "border-neutral-200 dark:border-neutral-800 opacity-50 cursor-not-allowed"
              }`}
            >
              <RiArrowRightSLine className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Carousel container - aligned with the header */}
      <div className="container mx-auto px-4 lg:px-8">
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mr-4 lg:-mr-8 pr-4 lg:pr-8 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {recursos.map((recurso, i) => (
            <motion.div
              key={recurso.title}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="flex-shrink-0 w-80 snap-start"
            >
              <div className="relative h-full bg-white dark:bg-neutral-800 rounded-[2rem] overflow-hidden border border-neutral-200 dark:border-neutral-700 hover:border-orange-300 dark:hover:border-orange-500/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
                {/* Gradient overlay at top - brand color */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-orange-600" />
                
                {/* Content */}
                <div className="p-6">
                  {/* Icon - brand colors only */}
                  <div className={`w-14 h-14 rounded-[1.25rem] ${brandColors.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <recurso.icon className={`w-7 h-7 ${brandColors.text}`} />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                    {recurso.title}
                  </h3>

                  {/* Description */}
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
                    {recurso.description}
                  </p>

                  {/* Learn more link - brand color */}
                  <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-700">
                    <button className="text-sm font-medium text-orange-500 hover:underline inline-flex items-center gap-1 group/link">
                      Saiba mais
                      <RiArrowRightSLine className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Decorative element - brand color */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-orange-100 dark:bg-orange-500/20 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
