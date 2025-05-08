"use client";

import React, { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Check, LineChart, ArrowRight, Globe, Share2, Mail, BarChart3, Newspaper } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function MarketingDigital() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  
  // Recursos principais
  const mainFeatures = [
    {
      title: "Website Personalizado",
      description: "Site profissional para sua imobiliária ou para você como corretor, com seu domínio e identidade visual",
      icon: <Globe className="h-6 w-6 text-tappyGreen" />,
    },
    {
      title: "Compartilhamento em Redes",
      description: "Publique seus imóveis automaticamente em suas redes sociais com imagens e descrições profissionais",
      icon: <Share2 className="h-6 w-6 text-tappyGreen" />,
    },
    {
      title: "Email Marketing",
      description: "Campanhas personalizadas para nutrir leads e manter contato com clientes",
      icon: <Mail className="h-6 w-6 text-tappyGreen" />,
    },
    {
      title: "Analytics Avançado",
      description: "Métricas detalhadas sobre o desempenho das suas ações de marketing",
      icon: <LineChart className="h-6 w-6 text-tappyGreen" />,
    },
    {
      title: "Blog Corporativo",
      description: "Crie conteúdo relevante para atrair visitantes e converter leads",
      icon: <Newspaper className="h-6 w-6 text-tappyGreen" />,
    },
    {
      title: "SEO Otimizado",
      description: "Otimização para mecanismos de busca para aumentar a visibilidade dos seus imóveis",
      icon: <BarChart3 className="h-6 w-6 text-tappyGreen" />,
    }
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
      
      // Animações
      gsap.utils.toArray<HTMLElement>(".animate-on-scroll").forEach((el) => {
        gsap.from(el as HTMLElement, {
          y: 50, 
          opacity: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });
      });
    }
  }, []);
  
  return (
    <>
      <Header />
      
      <main className="overflow-x-hidden bg-background">
        {/* Hero Section */}
        <section ref={heroRef} className="relative min-h-[90vh] flex items-center overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(3,252,174,0.15),transparent_70%)]" />
          
          {/* Background pattern */}
          <motion.div 
            className="absolute inset-0 opacity-[0.03] bg-[url('/pattern-dots.svg')] bg-repeat"
            style={{ y: backgroundY }}
          />
          
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20 md:py-28">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <motion.div
                className="lg:w-1/2"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
              >
                <motion.span 
                  className="inline-block py-1.5 px-4 mb-6 rounded-full text-sm font-medium bg-tappyGreen/10 text-tappyGreen"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  Marketing Digital
                </motion.span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-poppins mb-6">
                  <span className="block text-tappyGreen">Atraia mais</span>
                  <span className="block">clientes para</span>
                  <span className="block text-tappyGreen">seu negócio</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8 font-poppins">
                  O Tappy Imob oferece ferramentas avançadas de marketing digital para 
                  potencializar sua presença online e converter mais leads em negócios.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button style={{backgroundColor: '#0cbc8b', color: 'white', padding: '10px 20px', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'}}>
                    Agendar demonstração
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                  <Button size="lg" variant="outline" className="border-tappyGreen text-tappyGreen hover:bg-tappyGreen/10">
                    Ver planos
                  </Button>
                </div>
              </motion.div>
              
              <motion.div
                className="lg:w-1/2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <div className="relative mt-10 md:mt-0 perspective-1000">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.5 }}
                    className="shadow-2xl shadow-tappyGreen/20 rounded-xl overflow-hidden border border-tappyGreen/20"
                  >
                    <Image
                      src="https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                      width={800}
                      height={500}
                      alt="Marketing Digital Imobiliário"
                      className="w-full h-auto object-cover"
                    />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Recursos principais */}
        <section className="py-24 relative overflow-hidden animate-on-scroll">
          <div className="absolute inset-0 bg-muted/30 dark:bg-muted/10">
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.025]" />
          </div>
          
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge className="mb-4 bg-tappyGreen/10 text-tappyGreen border-tappyGreen/20 px-3 py-1.5">
                Ferramentas de Marketing
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 font-poppins">
                <span className="text-tappyGreen">
                  Estratégias digitais para imobiliárias
                </span>
              </h2>
              <p className="text-xl text-muted-foreground font-poppins">
                Um conjunto completo de ferramentas para potencializar sua presença online
                e converter mais visitantes em clientes
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mainFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full bg-background/50 border-border/50 overflow-hidden hover:border-tappyGreen/30 transition-all duration-300 shadow-sm hover:shadow-md">
                    <div className="h-1 bg-gradient-to-r from-tappyGreen to-tappyGreen/40"></div>
                    <CardContent className="p-6">
                      <div className="mb-4 inline-flex bg-tappyGreen/20 p-3 rounded-lg">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-bold mb-2 font-poppins group-hover:text-tappyGreen">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground font-poppins">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Site Profissional */}
        <section className="py-24 relative overflow-hidden animate-on-scroll">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <motion.div
                className="lg:w-1/2"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <div className="relative rounded-xl overflow-hidden shadow-2xl shadow-tappyGreen/10">
                  <Image
                    src="https://images.unsplash.com/photo-1611162616475-46b635cb6868?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    width={800}
                    height={500}
                    alt="Site Imobiliário Profissional"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </motion.div>
              
              <motion.div
                className="lg:w-1/2"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <Badge className="mb-4 bg-tappyGreen/10 text-tappyGreen border-tappyGreen/20 px-3 py-1.5">
                  Presença Digital
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 font-poppins">
                  <span className="text-tappyGreen">
                    Site profissional
                  </span>
                  <span className="block">para sua marca</span>
                </h2>
                <p className="text-xl text-muted-foreground mb-6 font-poppins">
                  Destaque-se na internet com um site moderno e funcional:
                </p>
                
                <ul className="space-y-4 mb-8">
                  {[
                    "Design responsivo perfeito para todos os dispositivos",
                    "Seu domínio personalizado (suanome.com.br)",
                    "Catálogo de imóveis atualizado automaticamente do CRM",
                    "Formulários de captura de leads integrados ao sistema",
                    "SEO otimizado para melhor posicionamento no Google"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-tappyGreen/10 flex items-center justify-center">
                        <Check className="h-3 w-3 text-tappyGreen" />
                      </span>
                      <span className="text-base text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                
                <Button className="bg-tappyGreen hover:bg-tappyGreen/90 text-white">
                  Ver exemplos de sites
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Email Marketing */}
        <section className="py-24 relative overflow-hidden animate-on-scroll">
          <div className="absolute inset-0 bg-muted/30 dark:bg-muted/10">
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.025]" />
          </div>
          
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
              <motion.div
                className="lg:w-1/2"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <div className="relative rounded-xl overflow-hidden shadow-2xl shadow-tappyGreen/10">
                  <Image
                    src="https://images.unsplash.com/photo-1596526131083-e8c633c948d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    width={800}
                    height={500}
                    alt="Email Marketing Imobiliário"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </motion.div>
              
              <motion.div
                className="lg:w-1/2"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <Badge className="mb-4 bg-tappyGreen/10 text-tappyGreen border-tappyGreen/20 px-3 py-1.5">
                  Campanhas Inteligentes
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 font-poppins">
                  <span className="text-tappyGreen">
                    Email marketing 
                  </span>
                  <span className="block">que converte</span>
                </h2>
                <p className="text-xl text-muted-foreground mb-6 font-poppins">
                  Mantenha-se em contato com seus leads e clientes de forma profissional:
                </p>
                
                <ul className="space-y-4 mb-8">
                  {[
                    "Templates profissionais personalizados para sua marca",
                    "Segmentação inteligente baseada no comportamento dos leads",
                    "Automação de envio baseada em gatilhos específicos",
                    "Relatórios detalhados de abertura e engajamento",
                    "Integração completa com o funil de vendas do CRM"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-tappyGreen/10 flex items-center justify-center">
                        <Check className="h-3 w-3 text-tappyGreen" />
                      </span>
                      <span className="text-base text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                
                <Button className="bg-tappyGreen hover:bg-tappyGreen/90 text-white">
                  Ver campanhas de exemplo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* CTA */}
        <section className="py-20 relative overflow-hidden bg-tappyGreen/5 animate-on-scroll">
          <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 font-poppins">
                Potencialize seu marketing com o <span className="text-tappyGreen">Tappy Imob</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto font-poppins">
                Atraia mais clientes, converta mais leads e destaque-se da concorrência
                com nossas ferramentas de marketing digital
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button style={{backgroundColor: '#0cbc8b', color: 'white', padding: '10px 20px', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'}}>
                  Agendar demonstração
                </button>
                <Button size="lg" variant="outline" className="border-tappyGreen text-tappyGreen hover:bg-tappyGreen/10">
                  Ver planos
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
}
