'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

// Textos que serão alternados na animação de digitação
const rotatingTexts = [
  'Imobiliárias',
  'Corretores',
  'Incorporadoras',
  'Vendas',
  'Locações'
];

export function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Função para limpar o intervalo
  const clearTypingInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };
  
  // Efeito para gerenciar a animação de digitação
  useEffect(() => {
    // Inicia o processo de digitação
    const startTypingAnimation = () => {
      const currentWord = rotatingTexts[currentIndex];
      let charIndex = 0;
      
      // Limpa qualquer intervalo existente
      clearTypingInterval();
      
      // Configura o novo intervalo para digitação
      intervalRef.current = setInterval(() => {
        // Adiciona um caractere de cada vez
        if (charIndex <= currentWord.length) {
          setDisplayText(currentWord.substring(0, charIndex));
          charIndex++;
        } else {
          // Quando termina de digitar, espera um pouco e começa a apagar
          clearTypingInterval();
          
          setTimeout(() => {
            // Inicia o processo de apagar
            let eraseIndex = currentWord.length;
            
            intervalRef.current = setInterval(() => {
              if (eraseIndex >= 0) {
                setDisplayText(currentWord.substring(0, eraseIndex));
                eraseIndex--;
              } else {
                // Quando termina de apagar, passa para a próxima palavra
                clearTypingInterval();
                setCurrentIndex((prevIndex) => (prevIndex + 1) % rotatingTexts.length);
              }
            }, 30); // Velocidade para apagar
          }, 1500); // Pausa antes de começar a apagar
        }
      }, 80); // Velocidade para digitar
    };
    
    // Inicia a animação
    startTypingAnimation();
    
    // Limpa o intervalo quando o componente for desmontado
    return () => clearTypingInterval();
  }, [currentIndex]);

  // Variantes para animações com Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 h-[100vh] flex items-center pt-24">
      {/* Padrão de fundo estilizado */}
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:40px_40px]" />
      
      {/* Elementos decorativos */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-30" />
      <div className="absolute h-64 w-64 -top-32 -left-32 bg-blue-500/30 rounded-full blur-3xl" />
      <div className="absolute h-64 w-64 top-1/2 right-0 bg-emerald-500/20 rounded-full blur-3xl" />
      
      {/* Círculos animados no fundo */}
      <motion.div 
        className="absolute h-96 w-96 rounded-full border border-white/10"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.1 }}
        transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
        style={{ top: '20%', left: '10%' }}
      />
      <motion.div 
        className="absolute h-64 w-64 rounded-full border border-emerald-500/20"
        initial={{ scale: 1, opacity: 0 }}
        animate={{ scale: 1.2, opacity: 0.2 }}
        transition={{ duration: 8, repeat: Infinity, repeatType: 'reverse' }}
        style={{ bottom: '15%', right: '15%' }}
      />
      
      {/* Grade de pontos */}
      <div className="absolute inset-0 bg-[radial-gradient(white_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black,transparent)]" />
      
      <div className="container mx-auto px-2 relative z-10 mt-16">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="inline-block px-6 py-2 mb-6 rounded-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 backdrop-blur-sm border border-white/10 text-emerald-400 font-medium"
            variants={itemVariants}
          >
            A nova era do mercado imobiliário
          </motion.div>
          
          <motion.h1 
            className="text-3xl md:text-5xl lg:text-7xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white via-emerald-100 to-white min-h-[220px]"
            variants={itemVariants}
          >
            Transforme seu negócio imobiliário<br />
             para{' '}
            <span className="relative inline-block h-[70px] min-h-[70px]">
              <span className="text-emerald-400">{displayText}</span>
              <span className="animate-blink">|</span>
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-white/70 mb-10 max-w-3xl mx-auto"
            variants={itemVariants}
          >
            A plataforma completa para imobiliárias, corretores e incorporadoras
            automatizarem processos, captar mais leads e fechar mais negócios.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            variants={itemVariants}
          >
            <Button 
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-10 h-14 text-lg"
            >
              Ver preços <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-blue-400/30 bg-blue-900/20 text-white hover:bg-blue-800/40 hover:text-emerald-400 h-14 text-lg"
            >
              Agendar demonstração
            </Button>
          </motion.div>
          
          <motion.div 
            className="mt-12 pt-12 border-t border-white/10 flex items-center justify-center gap-8 flex-wrap"
            variants={itemVariants}
          >
            <p className="text-white/60 text-sm font-medium">Confiado por empresas líderes do mercado</p>
            <div className="flex flex-wrap justify-center gap-8 opacity-70 grayscale hover:grayscale-0 transition-all">
              {/* Aqui você pode adicionar logos de parceiros */}
              <div className="h-8 w-32 bg-white/20 rounded flex items-center justify-center">Logo 1</div>
              <div className="h-8 w-32 bg-white/20 rounded flex items-center justify-center">Logo 2</div>
              <div className="h-8 w-32 bg-white/20 rounded flex items-center justify-center">Logo 3</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
