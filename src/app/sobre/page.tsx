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
import { ArrowRight, BarChart3, Code2, Rocket, Zap, Building, Users, Heart } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function SobreNos() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  
  // Timeline de marcos históricos
  const timelineEvents = [
    {
      year: "2018",
      title: "Nascimento da Tappy",
      description: "Fundada por um grupo de empreendedores visionários com o objetivo de transformar o mercado imobiliário através da tecnologia.",
      highlight: false,
    },
    {
      year: "2019",
      title: "Lançamento Tappy ID",
      description: "Nossa primeira solução de cartões virtuais inteligentes revolucionou a forma como profissionais compartilham contatos.",
      highlight: true,
    },
    {
      year: "2020",
      title: "Tappy Whats",
      description: "Lançamento da plataforma de gestão de WhatsApp para empresas, com foco em automação e multi-atendimento.",
      highlight: false,
    },
    {
      year: "2021",
      title: "Tappy Imob Beta",
      description: "Versão inicial do CRM imobiliário com recursos básicos de gestão de imóveis e clientes já mostrou resultados impressionantes.",
      highlight: true,
    },
    {
      year: "2023",
      title: "Integração de IA",
      description: "Implementação de modelos avançados de inteligência artificial em todas as plataformas, com foco especial no setor imobiliário.",
      highlight: false,
    },
    {
      year: "2025",
      title: "Tappy Imob 3.0",
      description: "Lançamento da versão completa do CRM imobiliário com Kanban, automação, IA avançada e gerador de sites personalizado.",
      highlight: true,
    },
  ];
  
  // Equipe de liderança
  const leadershipTeam = [
    {
      name: "Rafael Mendes",
      role: "CEO & Fundador",
      bio: "Empreendedor serial com mais de 15 anos de experiência em tecnologia e inovação digital. Formado em Engenharia de Software pela USP.",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      name: "Carolina Silva",
      role: "CTO",
      bio: "Especialista em IA e machine learning, liderando o desenvolvimento das soluções mais avançadas da Tappy. PhD em Ciência da Computação.",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      name: "Lucas Oliveira",
      role: "Diretor de Produto",
      bio: "Responsável pela visão e evolução do Tappy Imob. Especialista em UX e metodologias ágeis com experiência em grandes empresas de tecnologia.",
      avatar: "https://randomuser.me/api/portraits/men/62.jpg",
    },
    {
      name: "Fernanda Costa",
      role: "Head de Customer Success",
      bio: "Lidera a equipe que garante os melhores resultados para nossos clientes, com foco em treinamento e implementação personalizada.",
      avatar: "https://randomuser.me/api/portraits/women/66.jpg",
    },
  ];
  
  // Valores da empresa
  const companyValues = [
    {
      icon: <Rocket className="h-6 w-6 text-tappyGreen" />,
      title: "Inovação constante",
      description: "Buscamos sempre estar na vanguarda da tecnologia, implementando soluções que antecipam as necessidades do mercado."
    },
    {
      icon: <Users className="h-6 w-6 text-tappyGreen" />,
      title: "Foco no cliente",
      description: "Todas nossas decisões são orientadas por como podemos melhorar a experiência e os resultados de nossos usuários."
    },
    {
      icon: <Zap className="h-6 w-6 text-tappyGreen" />,
      title: "Eficiência e simplicidade",
      description: "Criamos soluções poderosas que são ao mesmo tempo intuitivas, eliminando a complexidade desnecessária."
    },
    {
      icon: <Code2 className="h-6 w-6 text-tappyGreen" />,
      title: "Excelência técnica",
      description: "Comprometidos com os mais altos padrões de desenvolvimento e segurança em cada linha de código."
    },
    {
      icon: <Heart className="h-6 w-6 text-tappyGreen" />,
      title: "Responsabilidade social",
      description: "Acreditamos no poder da tecnologia para transformar positivamente a sociedade e promover inclusão digital."
    },
    {
      icon: <Building className="h-6 w-6 text-tappyGreen" />,
      title: "Transformação imobiliária",
      description: "Dedicados a modernizar o setor imobiliário, tornando-o mais eficiente, transparente e acessível para todos."
    },
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
      
      // Animate timeline items
      gsap.from(".timeline-item", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        scrollTrigger: {
          trigger: ".timeline-section",
          start: "top 75%",
          end: "bottom 20%",
          toggleActions: "play none none none",
        },
      });
      
      // Animate team members
      gsap.from(".team-member", {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        scrollTrigger: {
          trigger: ".team-section",
          start: "top 75%",
          end: "bottom 20%",
          toggleActions: "play none none none",
        },
      });
      
      // Animate value cards
      gsap.from(".value-card", {
        scale: 0.9,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        scrollTrigger: {
          trigger: ".values-section",
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
        <section ref={heroRef} className="relative min-h-[80vh] flex items-center overflow-hidden">
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
                  Sobre a Tappy
                </motion.span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-poppins mb-6">
                  <span className="block">Transformando o</span>
                  <span className="block text-tappyGreen">mercado imobiliário</span>
                  <span className="block">com tecnologia</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8 font-poppins">
                  Somos uma empresa brasileira de tecnologia focada em criar soluções que revolucionam
                  a forma como profissionais e empresas do setor imobiliário trabalham e se relacionam com seus clientes.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button style={{backgroundColor: '#0cbc8b', color: 'white', padding: '10px 20px', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'}}>
                    Conheça nossas soluções
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                  <Button size="lg" variant="outline" className="border-tappyGreen text-tappyGreen hover:bg-tappyGreen/10">
                    Fale conosco
                  </Button>
                </div>
              </motion.div>
              
              <motion.div
                className="lg:w-1/2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.5 }}
                  className="relative"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-tappyGreen to-tappyGreen/20 rounded-lg blur opacity-30"></div>
                  <div className="relative rounded-lg overflow-hidden shadow-2xl">
                    <Image
                      src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                      width={800}
                      height={500}
                      alt="Equipe Tappy"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </motion.div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg border border-tappyGreen/10"
                  >
                    <h3 className="text-lg font-semibold mb-1">+10.000</h3>
                    <p className="text-sm text-muted-foreground">Profissionais utilizando nossas soluções</p>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg border border-tappyGreen/10"
                  >
                    <h3 className="text-lg font-semibold mb-1">+500</h3>
                    <p className="text-sm text-muted-foreground">Imobiliárias transformadas</p>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Nossa missão */}
        <section className="py-20 relative overflow-hidden">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <div className="relative rounded-xl overflow-hidden shadow-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    width={800}
                    height={500}
                    alt="Missão Tappy"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <Badge className="mb-4 bg-tappyGreen/10 text-tappyGreen border-tappyGreen/20 px-3 py-1.5">
                  Nossa Missão
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 font-poppins">
                  <span className="text-tappyGreen">
                    Simplificar e potencializar
                  </span>
                  <span className="block">o mercado imobiliário</span>
                </h2>
                <p className="text-xl text-muted-foreground mb-6 font-poppins">
                  Desenvolvemos ferramentas que eliminam a burocracia e a complexidade do setor imobiliário,
                  permitindo que profissionais se concentrem no que realmente importa: construir relacionamentos e fechar negócios.
                </p>
                <p className="text-xl text-muted-foreground mb-6 font-poppins">
                  Através da inovação e inteligência artificial, estamos criando um futuro onde cada etapa do processo imobiliário
                  é mais eficiente, transparente e acessível para todos.
                </p>
                <div className="grid grid-cols-2 gap-6 mt-8">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <BarChart3 className="h-5 w-5 text-tappyGreen" />
                      <h4 className="font-semibold">Visão</h4>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Ser a plataforma tecnológica referência no setor imobiliário, integrando todas as etapas do processo em uma experiência única.
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Rocket className="h-5 w-5 text-tappyGreen" />
                      <h4 className="font-semibold">Propósito</h4>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Capacitar pessoas a realizarem seus sonhos imobiliários através da tecnologia que conecta e simplifica.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Timeline */}
        <section className="py-24 timeline-section relative overflow-hidden">
          <div className="absolute inset-0 bg-muted/30 dark:bg-muted/10">
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.025]" />
          </div>
          
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge className="mb-4 bg-tappyGreen/10 text-tappyGreen border-tappyGreen/20 px-3 py-1.5">
                Nossa História
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 font-poppins">
                <span className="text-tappyGreen">
                  Uma jornada de inovação
                </span>
              </h2>
              <p className="text-xl text-muted-foreground font-poppins">
                Conheça os principais marcos da nossa história e como evoluímos para nos tornar
                uma referência em tecnologia para o mercado imobiliário
              </p>
            </div>
            
            <div className="relative">
              {/* Linha do tempo vertical */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-tappyGreen/80 via-tappyGreen/40 to-tappyGreen/10"></div>
              
              <div className="space-y-16">
                {timelineEvents.map((event, index) => (
                  <div 
                    key={index}
                    className={`timeline-item relative flex items-center ${
                      index % 2 === 0 ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div className="w-5 h-5 absolute left-1/2 top-9 transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-white dark:bg-gray-800 border-4 border-tappyGreen z-10"></div>
                    
                    <div className="w-1/2"></div>
                    
                    <div className={`w-1/2 px-6 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block mb-2 px-4 py-1 rounded-full text-sm font-semibold ${
                        event.highlight 
                          ? 'bg-tappyGreen/20 text-tappyGreen' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {event.year}
                      </div>
                      <h3 className="text-xl font-bold mb-2 font-poppins">{event.title}</h3>
                      <p className="text-muted-foreground">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* Nossos valores */}
        <section className="py-24 values-section relative overflow-hidden">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge className="mb-4 bg-tappyGreen/10 text-tappyGreen border-tappyGreen/20 px-3 py-1.5">
                Nossos Valores
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 font-poppins">
                <span className="text-tappyGreen">
                  O que nos guia
                </span>
              </h2>
              <p className="text-xl text-muted-foreground font-poppins">
                Nossos valores fundamentais definem quem somos e como trabalhamos para 
                transformar o mercado imobiliário com tecnologia
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {companyValues.map((value, index) => (
                <motion.div
                  key={index}
                  className="value-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full bg-background/50 border-border/50 overflow-hidden hover:border-tappyGreen/30 transition-all duration-300 shadow-sm hover:shadow-md">
                    <div className="h-1 bg-gradient-to-r from-tappyGreen to-tappyGreen/40"></div>
                    <CardContent className="p-6">
                      <div className="mb-4 inline-flex bg-tappyGreen/20 p-3 rounded-lg">
                        {value.icon}
                      </div>
                      <h3 className="text-xl font-bold mb-2 font-poppins group-hover:text-tappyGreen">
                        {value.title}
                      </h3>
                      <p className="text-muted-foreground font-poppins">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Equipe de liderança */}
        <section className="py-24 team-section relative overflow-hidden">
          <div className="absolute inset-0 bg-muted/30 dark:bg-muted/10">
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.025]" />
          </div>
          
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge className="mb-4 bg-tappyGreen/10 text-tappyGreen border-tappyGreen/20 px-3 py-1.5">
                Nossa Equipe
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 font-poppins">
                <span className="text-tappyGreen">
                  Liderança visionária
                </span>
              </h2>
              <p className="text-xl text-muted-foreground font-poppins">
                Conheça os especialistas que estão por trás da inovação do Tappy Imob e 
                transformando o setor imobiliário com tecnologia de ponta
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {leadershipTeam.map((member, index) => (
                <motion.div
                  key={index}
                  className="team-member"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                >
                  <Card className="h-full overflow-hidden hover:border-tappyGreen/30 transition-all duration-300 shadow-md hover:shadow-xl">
                    <div className="relative h-60 overflow-hidden">
                      <Image 
                        src={member.avatar} 
                        fill
                        style={{ objectFit: "cover" }}
                        alt={member.name}
                        className="transition-transform duration-500 hover:scale-110" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    </div>
                    <CardContent className="p-6 relative -mt-16">
                      <div className="relative bg-background/95 backdrop-blur-sm p-4 rounded-lg border border-border/50">
                        <h3 className="text-xl font-bold font-poppins">{member.name}</h3>
                        <p className="text-tappyGreen text-sm mb-2">{member.role}</p>
                        <p className="text-muted-foreground text-sm">{member.bio}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA */}
        <section className="py-20 relative overflow-hidden bg-tappyGreen/5">
          <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 font-poppins">
                Faça parte da revolução <span className="text-tappyGreen">imobiliária</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto font-poppins">
                Entre em contato conosco para descobrir como o Tappy Imob pode transformar seu negócio
                e potencializar seus resultados no mercado imobiliário
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button style={{backgroundColor: '#0cbc8b', color: 'white', padding: '10px 20px', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'}}>
                  Agendar demonstração
                </button>
                <Button size="lg" variant="outline" className="border-tappyGreen text-tappyGreen hover:bg-tappyGreen/10">
                  Conhecer todas soluções
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
