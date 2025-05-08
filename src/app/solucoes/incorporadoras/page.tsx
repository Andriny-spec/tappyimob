"use client";

import React, { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Building, ArrowRight, LineChart, BarChart3, Layers, Database, Presentation, BookOpen } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function SolucoesIncorporadoras() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  
  // Recursos principais
  const mainFeatures = [
    {
      title: "Gestão de Empreendimentos",
      description: "Controle completo dos seus lançamentos e empreendimentos em todas as fases",
      icon: <Building className="h-6 w-6 text-tappyGreen" />,
    },
    {
      title: "Analytics Avançado",
      description: "Dashboards com indicadores precisos de vendas, leads e desempenho por empreendimento",
      icon: <BarChart3 className="h-6 w-6 text-tappyGreen" />,
    },
    {
      title: "Gestão de Unidades",
      description: "Controle detalhado do status de cada unidade: disponível, reservada, vendida ou entregue",
      icon: <Layers className="h-6 w-6 text-tappyGreen" />,
    },
    {
      title: "Banco de Dados Integrado",
      description: "Centralização de documentos, plantas, memoriais e documentação legal dos projetos",
      icon: <Database className="h-6 w-6 text-tappyGreen" />,
    },
    {
      title: "Apresentações Digitais",
      description: "Material digital interativo para apresentações profissionais dos empreendimentos",
      icon: <Presentation className="h-6 w-6 text-tappyGreen" />,
    },
    {
      title: "Catálogo Digital",
      description: "Catálogo completo dos empreendimentos disponível para corretores parceiros",
      icon: <BookOpen className="h-6 w-6 text-tappyGreen" />,
    }
  ];

  const boxRef = useRef(null);

  useEffect(() => {
    if (!boxRef.current) return;
    
    gsap.registerPlugin(ScrollTrigger);
    
    gsap.to(boxRef.current as HTMLElement, {
      scrollTrigger: {
        trigger: boxRef.current,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse",
      },
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.2,
    });
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
                  Soluções para Incorporadoras
                </motion.span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-poppins mb-6">
                  <span className="block text-tappyGreen">Potencialize</span>
                  <span className="block">a gestão de seus</span>
                  <span className="block text-tappyGreen">empreendimentos</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8 font-poppins">
                  O Tappy Imob oferece soluções completas para incorporadoras gerenciarem seus projetos,
                  desde o lançamento até a entrega, com controle total e insights valiosos.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button style={{backgroundColor: '#0cbc8b', color: 'white', padding: '10px 20px', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'}}>
                    Agendar demonstração
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                  <Button size="lg" variant="outline" className="border-tappyGreen text-tappyGreen hover:bg-tappyGreen/10">
                    Conhecer planos
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
                      src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                      width={800}
                      height={500}
                      alt="Gestão de Empreendimentos"
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
                Recursos Exclusivos
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 font-poppins">
                <span className="text-tappyGreen">
                  Controle total dos seus empreendimentos
                </span>
              </h2>
              <p className="text-xl text-muted-foreground font-poppins">
                Gerencie todos os aspectos dos seus lançamentos imobiliários com ferramentas 
                desenvolvidas especialmente para incorporadoras
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
        
        {/* Controle total */}
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
                    src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    width={800}
                    height={500}
                    alt="Dashboard Incorporadora"
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
                  Controle & Analytics
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 font-poppins">
                  <span className="text-tappyGreen">
                    Dashboard inteligente 
                  </span>
                  <span className="block">com insights valiosos</span>
                </h2>
                <p className="text-xl text-muted-foreground mb-6 font-poppins">
                  Tenha todas as informações importantes dos seus empreendimentos em um único lugar:
                </p>
                
                <ul className="space-y-4 mb-8">
                  {[
                    "Análise detalhada das vendas por empreendimento",
                    "Acompanhamento do desempenho dos canais de venda",
                    "Controle financeiro com projeções e realizados",
                    "Monitoramento da velocidade de vendas por tipologia",
                    "Acompanhamento da jornada do cliente desde a captura até a entrega"
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
                  Ver demonstração de dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Gerenciamento de vendas */}
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
                    src="https://images.unsplash.com/photo-1497215842964-222b430dc094?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    width={800}
                    height={500}
                    alt="Gestão de Vendas"
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
                  Gestão de Vendas
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 font-poppins">
                  <span className="text-tappyGreen">
                    Potencialize seu time 
                  </span>
                  <span className="block">de vendas</span>
                </h2>
                <p className="text-xl text-muted-foreground mb-6 font-poppins">
                  Gerencie todos os canais de venda e equipes de corretores com eficiência:
                </p>
                
                <ul className="space-y-4 mb-8">
                  {[
                    "Portal do corretor para acesso a informações atualizadas",
                    "Gestão de comissionamento e tabelas de vendas",
                    "Controle de parcerias com imobiliárias e canais de venda",
                    "Gestão de reservas e aprovações em tempo real",
                    "Distribuição inteligente de leads por empreendimento"
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
                  Ver sistema de gestão de vendas
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
                Transforme sua incorporadora com o <span className="text-tappyGreen">Tappy Imob</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto font-poppins">
                Agende uma demonstração personalizada e descubra como nossa plataforma pode 
                potencializar o controle e as vendas dos seus empreendimentos
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
