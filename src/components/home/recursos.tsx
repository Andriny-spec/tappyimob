'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Building2, Users, Search, 
  MessageSquare, BarChart3, Calendar, Settings, Smartphone, 
  FileText, Mail, Globe, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

const recursos = [
  {
    id: 1,
    icon: <Building2 className="h-8 w-8 text-emerald-400" />,
    titulo: 'Gestão de Imóveis',
    descricao: 'Cadastre e gerencie seu portfólio de imóveis com detalhes completos, fotos, vídeos e plantas.'
  },
  {
    id: 2,
    icon: <Users className="h-8 w-8 text-emerald-400" />,
    titulo: 'Gestão de Clientes',
    descricao: 'Mantenha um banco de dados organizado com histórico de interações e preferências de cada cliente.'
  },
  {
    id: 3,
    icon: <Search className="h-8 w-8 text-emerald-400" />,
    titulo: 'Busca Avançada',
    descricao: 'Encontre imóveis rapidamente com filtros específicos e busca por geolocalização.'
  },
  {
    id: 4,
    icon: <MessageSquare className="h-8 w-8 text-emerald-400" />,
    titulo: 'Chat Integrado',
    descricao: 'Comunique-se com clientes e equipe diretamente pela plataforma, com histórico completo.'
  },
  {
    id: 5,
    icon: <BarChart3 className="h-8 w-8 text-emerald-400" />,
    titulo: 'Relatórios e Analytics',
    descricao: 'Visualize dados de performance, vendas e leads com dashboards personalizáveis.'
  },
  {
    id: 6,
    icon: <Calendar className="h-8 w-8 text-emerald-400" />,
    titulo: 'Agenda Inteligente',
    descricao: 'Agende visitas e reuniões com sincronização automática entre corretores e clientes.'
  },
  {
    id: 7,
    icon: <Settings className="h-8 w-8 text-emerald-400" />,
    titulo: 'Automações',
    descricao: 'Configure fluxos de trabalho automáticos para acompanhamento de leads e processos.'
  },
  {
    id: 8,
    icon: <Smartphone className="h-8 w-8 text-emerald-400" />,
    titulo: 'App Móvel',
    descricao: 'Acesse todas as funcionalidades pelo smartphone com nosso aplicativo nativo.'
  },
  {
    id: 9,
    icon: <FileText className="h-8 w-8 text-emerald-400" />,
    titulo: 'Documentação Digital',
    descricao: 'Gerencie contratos e documentos com assinatura digital integrada.'
  },
  {
    id: 10,
    icon: <Mail className="h-8 w-8 text-emerald-400" />,
    titulo: 'Email Marketing',
    descricao: 'Crie e envie campanhas personalizadas para seus leads e clientes.'
  },
  {
    id: 11,
    icon: <Globe className="h-8 w-8 text-emerald-400" />,
    titulo: 'Site e Portais',
    descricao: 'Integre seu site e portais imobiliários automaticamente com seu inventário.'
  },
  {
    id: 12,
    icon: <Shield className="h-8 w-8 text-emerald-400" />,
    titulo: 'Segurança Avançada',
    descricao: 'Proteja seus dados com criptografia de ponta e controle de acesso granular.'
  }
];

export function Recursos() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);
  const maxIndex = Math.ceil(recursos.length / cardsPerView) - 1;
  const carouselRef = useRef<HTMLDivElement>(null);

  // Ajusta a quantidade de cards com base no tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setCardsPerView(1);
      } else if (window.innerWidth < 1024) {
        setCardsPerView(2);
      } else {
        setCardsPerView(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = () => {
    setActiveIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setActiveIndex((prev) => Math.max(prev - 1, 0));
  };

  // Variantes de animação para os cards
  const cardVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 }
      }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 500 : -500,
      opacity: 0,
      scale: 0.9,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 }
      }
    })
  };

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 -z-10" />
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px] -z-10" />
      <div className="absolute h-80 w-80 -top-40 right-0 bg-blue-500/20 rounded-full blur-3xl -z-10" />
      <div className="absolute h-80 w-80 bottom-0 left-20 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="inline-block px-6 py-2 mb-4 rounded-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 backdrop-blur-sm border border-white/10 text-emerald-400 font-medium"
          >
            Recursos Exclusivos
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-emerald-100 to-white"
          >
            Tudo que você precisa em um só lugar
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto"
          >
            Nossa plataforma foi desenvolvida especificamente para o mercado imobiliário brasileiro, 
            com recursos que simplificam processos e aumentam resultados.
          </motion.p>
        </div>
        
        <div className="relative">
          {/* Carrossel de recursos */}
          <div className="overflow-hidden" ref={carouselRef}>
            <motion.div 
              className="flex transition-all duration-500 ease-out space-x-6 px-4"
              animate={{ x: -activeIndex * (100 / cardsPerView) + '%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {recursos.map((recurso) => (
                <motion.div 
                  key={recurso.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: recurso.id * 0.05 }}
                  className={cn(
                    "flex-shrink-0 w-full sm:w-1/2 lg:w-1/3 p-1",
                    { "opacity-60 scale-95": activeIndex !== Math.floor(recurso.id / cardsPerView) }
                  )}
                  style={{ transform: `scale(${activeIndex === Math.floor((recurso.id - 1) / cardsPerView) ? 1 : 0.95})` }}
                >
                  <div className="h-full p-8 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/10 shadow-xl group transition-all duration-300 hover:from-emerald-500/20 hover:to-blue-500/20 hover:border-emerald-500/30">
                    <div className="mb-5 p-4 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/5 inline-block">
                      {recurso.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">{recurso.titulo}</h3>
                    <p className="text-white/70 mb-4">{recurso.descricao}</p>
                    <a href="#" className="inline-flex items-center text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                      Saiba mais <ChevronRight className="ml-1 h-4 w-4" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
          
          {/* Controles do carrossel */}
          <div className="flex justify-center mt-10 space-x-4">
            <button 
              onClick={prevSlide} 
              disabled={activeIndex === 0}
              className={cn(
                "w-12 h-12 rounded-full border flex items-center justify-center transition-all",
                activeIndex === 0 
                  ? "border-white/10 text-white/30 cursor-not-allowed" 
                  : "border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20"
              )}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <div className="flex space-x-2 items-center">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all",
                    activeIndex === index 
                      ? "bg-emerald-500" 
                      : "bg-white/20 hover:bg-white/40"
                  )}
                  aria-label={`Ir para slide ${index + 1}`}
                />
              ))}
            </div>
            
            <button 
              onClick={nextSlide} 
              disabled={activeIndex >= maxIndex}
              className={cn(
                "w-12 h-12 rounded-full border flex items-center justify-center transition-all",
                activeIndex >= maxIndex 
                  ? "border-white/10 text-white/30 cursor-not-allowed" 
                  : "border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20"
              )}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Destaque de estatísticas */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          <div className="p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm border border-white/10">
            <div className="text-4xl md:text-5xl font-bold text-emerald-400 mb-2">98%</div>
            <p className="text-white/70">Satisfação dos clientes</p>
          </div>
          <div className="p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm border border-white/10">
            <div className="text-4xl md:text-5xl font-bold text-emerald-400 mb-2">+500</div>
            <p className="text-white/70">Imobiliárias atendidas</p>
          </div>
          <div className="p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm border border-white/10">
            <div className="text-4xl md:text-5xl font-bold text-emerald-400 mb-2">+40%</div>
            <p className="text-white/70">Aumento em vendas</p>
          </div>
          <div className="p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm border border-white/10">
            <div className="text-4xl md:text-5xl font-bold text-emerald-400 mb-2">5.000+</div>
            <p className="text-white/70">Corretores ativos</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
