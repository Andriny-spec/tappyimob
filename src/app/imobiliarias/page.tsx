"use client";

import React, { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Building2, ArrowRight, BarChart, Users, Landmark, BriefcaseBusiness, MousePointerClick, MoveRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function Imobiliarias() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  
  // Benefícios principais para imobiliárias
  const keyBenefits = [
    {
      icon: <Building2 className="h-6 w-6 text-tappyGreen" />,
      title: "Gestão integrada",
      description: "Centralize todas as informações de imóveis, clientes e negociações em um único sistema poderoso"
    },
    {
      icon: <Users className="h-6 w-6 text-tappyGreen" />,
      title: "Equipe colaborativa",
      description: "Acompanhe em tempo real o desempenho de cada corretor e melhore a produtividade da sua equipe"
    },
    {
      icon: <Landmark className="h-6 w-6 text-tappyGreen" />,
      title: "Site imobiliário",
      description: "Gerador de sites profissionais com domínio personalizado, SEO avançado e integração com portais"
    },
    {
      icon: <BriefcaseBusiness className="h-6 w-6 text-tappyGreen" />,
      title: "Kanban imobiliário",
      description: "Visualize e otimize a jornada de cada imóvel e cliente em um sistema visual de gerenciamento"
    },
    {
      icon: <MousePointerClick className="h-6 w-6 text-tappyGreen" />,
      title: "Automação completa",
      description: "Automatize tarefas repetitivas, desde envio de mensagens até seguimento de leads"
    },
    {
      icon: <BarChart className="h-6 w-6 text-tappyGreen" />,
      title: "Análise de desempenho",
      description: "Dashboards personalizados com métricas e KPIs para decisões estratégicas baseadas em dados"
    },
  ];
  
  // Cases de sucesso
  const successCases = [
    {
      company: "Imobiliária Horizonte",
      logo: "https://images.unsplash.com/photo-1560520031-3a4dc4e9de0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      quote: "Com o Tappy Imob, conseguimos aumentar nossas vendas em 40% no primeiro trimestre. A automação dos processos e o sistema de Kanban transformaram nossa operação.",
      author: "Marcela Santos",
      role: "Diretora Comercial",
      metrics: [
        { label: "Aumento em vendas", value: "40%" },
        { label: "Redução de tempo operacional", value: "65%" },
      ]
    },
    {
      company: "Grupo Imobiliário Central",
      logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      quote: "A inteligência artificial do Tappy Imob melhorou drasticamente nossa qualificação de leads. O sistema praticamente trabalha sozinho na captação e nutrição de clientes.",
      author: "Roberto Almeida",
      role: "CEO",
      metrics: [
        { label: "Conversão de leads", value: "32%" },
        { label: "Economia anual", value: "R$ 120mil" },
      ]
    },
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
      
      // Animate feature cards
      gsap.from(".benefit-card", {
        y: 50,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        scrollTrigger: {
          trigger: ".benefits-section",
          start: "top 75%",
          end: "bottom 20%",
          toggleActions: "play none none none",
        },
      });
      
      // Animate case study cards
      gsap.from(".case-card", {
        x: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        scrollTrigger: {
          trigger: ".cases-section",
          start: "top 75%",
          end: "bottom 20%",
          toggleActions: "play none none none",
        },
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
                style={{ y: textY }}
              >
                <motion.span 
                  className="inline-block py-1.5 px-4 mb-6 rounded-full text-sm font-medium bg-tappyGreen/10 text-tappyGreen"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  Soluções para Imobiliárias
                </motion.span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-poppins mb-6">
                  <span className="block text-tappyGreen">Revolucione sua</span>
                  <span className="block">imobiliária com</span>
                  <span className="block text-tappyGreen">inteligência artificial</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8 font-poppins">
                  O Tappy Imob é um CRM completo desenvolvido especialmente para o mercado imobiliário,
                  que automatiza processos, potencializa vendas e transforma a experiência dos seus clientes.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" className="bg-tappyGreen hover:bg-tappyGreen/90 text-white shadow-lg hover:shadow-xl hover:shadow-tappyGreen/20 transition-all duration-300">
                    Agendar demonstração
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
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
                    initial={{ opacity: 0, y: 20, rotateX: -10 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ duration: 0.7, delay: 0.5 }}
                    className="shadow-2xl shadow-tappyGreen/20 rounded-xl overflow-hidden border border-tappyGreen/20"
                  >
                    <Image
                      src="https://images.unsplash.com/photo-1560520031-3a4dc4e9de0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                      width={800}
                      height={500}
                      alt="Tappy Imob Dashboard"
                      className="w-full h-auto object-cover rounded-t-xl"
                    />
                    <div className="bg-background p-6">
                      <h3 className="text-xl font-bold mb-2 text-tappyGreen">Dashboard Tappy Imob</h3>
                      <p className="text-muted-foreground">Visualize todas as métricas do seu negócio em um só lugar</p>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: 50, y: -30 }}
                    animate={{ opacity: 1, x: 0, y: -60 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    className="absolute top-0 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-10 border border-tappyGreen/20"
                    style={{ width: "200px" }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-3 h-3 rounded-full bg-green-500"></span>
                      <span className="text-sm font-medium">Vendas crescendo</span>
                    </div>
                    <div className="h-20 flex items-end gap-1">
                      {[40, 35, 60, 45, 50, 75, 65, 90].map((h, i) => (
                        <div key={i} className="h-full flex-1 flex flex-col justify-end">
                          <div 
                            className="w-full bg-gradient-to-t from-tappyGreen to-tappyGreen/70 rounded-sm" 
                            style={{ height: `${h}%` }}
                          ></div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Benefícios principais */}
        <section className="py-24 benefits-section relative overflow-hidden">
          <div className="absolute inset-0 bg-muted/30 dark:bg-muted/10">
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.025]" />
          </div>
          
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge className="mb-4 bg-tappyGreen/10 text-tappyGreen border-tappyGreen/20 px-3 py-1.5">
                Benefícios exclusivos
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 font-poppins">
                <span className="text-tappyGreen">
                  Transforme sua imobiliária
                </span>
              </h2>
              <p className="text-xl text-muted-foreground font-poppins">
                O Tappy Imob oferece todas as ferramentas que você precisa para modernizar sua imobiliária e 
                aumentar a produtividade da sua equipe
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {keyBenefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  className="benefit-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full bg-background/50 border-border/50 overflow-hidden hover:border-tappyGreen/30 transition-all duration-300 shadow-sm hover:shadow-md">
                    <div className="h-1 bg-gradient-to-r from-tappyGreen to-tappyGreen/40"></div>
                    <CardContent className="p-6">
                      <div className="mb-4 inline-flex bg-tappyGreen/20 p-3 rounded-lg">
                        {benefit.icon}
                      </div>
                      <h3 className="text-xl font-bold mb-2 font-poppins group-hover:text-tappyGreen">
                        {benefit.title}
                      </h3>
                      <p className="text-muted-foreground font-poppins">
                        {benefit.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Inteligência Artificial */}
        <section className="py-24 relative overflow-hidden">
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                  <Image
                    src="https://images.unsplash.com/photo-1558655146-9f40138edfeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    width={800}
                    height={500}
                    alt="Tappy Imob AI"
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                    <h3 className="text-2xl font-bold mb-2 text-white">Agente Inteligente Tappy</h3>
                    <p className="text-white/90">Seu assistente virtual para todas as tarefas imobiliárias</p>
                  </div>
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
                  Inteligência Artificial
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 font-poppins">
                  <span className="text-tappyGreen">
                    Potencialize seu negócio
                  </span>
                  <span className="block">com nosso assistente IA</span>
                </h2>
                <p className="text-xl text-muted-foreground mb-6 font-poppins">
                  Nosso agente de inteligência artificial trabalha 24/7 para otimizar seus processos imobiliários:
                </p>
                
                <ul className="space-y-4 mb-8">
                  {[
                    "Cria, edita e atualiza fichas de imóveis automaticamente",
                    "Qualifica leads e sugere melhores abordagens para cada cliente",
                    "Gera textos para anúncios e descrições de imóveis",
                    "Analisa dados do mercado e sugere precificação ideal",
                    "Automatiza o acompanhamento de clientes e negociações"
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
                  Conhecer o assistente IA
                  <MoveRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Cases de sucesso */}
        <section className="py-24 cases-section relative overflow-hidden">
          <div className="absolute inset-0 bg-muted/30 dark:bg-muted/10">
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.025]" />
          </div>
          
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge className="mb-4 bg-tappyGreen/10 text-tappyGreen border-tappyGreen/20 px-3 py-1.5">
                Histórias de sucesso
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 font-poppins">
                <span className="text-tappyGreen">
                  O que nossos clientes dizem
                </span>
              </h2>
              <p className="text-xl text-muted-foreground font-poppins">
                Conheça como o Tappy Imob está transformando o mercado imobiliário e 
                ajudando empresas a alcançarem resultados extraordinários
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {successCases.map((caseStudy, index) => (
                <motion.div
                  key={index}
                  className="case-card"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <Card className="h-full overflow-hidden hover:border-tappyGreen/30 transition-all duration-300 shadow-md hover:shadow-xl">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                          <Image 
                            src={caseStudy.logo} 
                            width={64} 
                            height={64} 
                            alt={caseStudy.company}
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold font-poppins">{caseStudy.company}</h3>
                          <p className="text-muted-foreground text-sm">{caseStudy.author}, {caseStudy.role}</p>
                        </div>
                      </div>
                      
                      <blockquote className="text-lg italic text-muted-foreground mb-6 border-l-4 border-tappyGreen/30 pl-4">
                        "{caseStudy.quote}"
                      </blockquote>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {caseStudy.metrics.map((metric, i) => (
                          <div key={i} className="p-3 rounded-lg bg-tappyGreen/5 border border-tappyGreen/10">
                            <p className="text-sm text-muted-foreground">{metric.label}</p>
                            <p className="text-xl font-bold text-tappyGreen">{metric.value}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-16 text-center">
              <Link href="/solucoes/imobiliarias" className="inline-flex items-center gap-2 text-tappyGreen hover:text-tappyGreen/90 text-lg font-medium transition-colors">
                Conhecer todas as soluções para imobiliárias
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
        
        {/* CTA */}
        <section className="py-20 relative overflow-hidden bg-tappyGreen/5">
          <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 font-poppins">
                Transforme sua imobiliária com o <span className="text-tappyGreen">Tappy Imob</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto font-poppins">
                Agende uma demonstração personalizada e descubra como nossa plataforma pode 
                revolucionar a gestão da sua imobiliária
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="bg-tappyGreen hover:bg-tappyGreen/90 text-white shadow-lg">
                  Agendar demonstração
                </Button>
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
