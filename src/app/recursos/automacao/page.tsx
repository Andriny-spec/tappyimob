"use client";

import React, { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/home/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Settings, ArrowRight, Clock, Zap, Bot, BellRing, RefreshCw } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function Automacao() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  
  // Recursos principais
  const mainFeatures = [
    {
      title: "Fluxos Automáticos",
      description: "Crie fluxos de trabalho personalizados que executam ações quando eventos específicos ocorrem",
      icon: <RefreshCw className="h-6 w-6 text-tappyGreen" />,
    },
    {
      title: "Gatilhos Inteligentes",
      description: "Configure gatilhos baseados em ações dos clientes, prazos ou características de imóveis",
      icon: <Zap className="h-6 w-6 text-tappyGreen" />,
    },
    {
      title: "Notificações Automáticas",
      description: "Envio automático de alertas para sua equipe quando tarefas importantes precisam ser realizadas",
      icon: <BellRing className="h-6 w-6 text-tappyGreen" />,
    },
    {
      title: "Agendamento de Tarefas",
      description: "Programe ações para serem executadas em datas ou horários específicos",
      icon: <Clock className="h-6 w-6 text-tappyGreen" />,
    },
    {
      title: "Chatbots Personalizados",
      description: "Construa fluxos de conversação completos para captar e qualificar leads automaticamente",
      icon: <Bot className="h-6 w-6 text-tappyGreen" />,
    },
    {
      title: "Integrações Avançadas",
      description: "Conecte o Tappy Imob com outros sistemas e aplicativos para automações multi-plataforma",
      icon: <Settings className="h-6 w-6 text-tappyGreen" />,
    }
  ];

  // Exemplos de automação
  const automationExamples = [
    {
      title: "Follow-up de Leads",
      description: "Quando um novo lead é registrado, o sistema automaticamente envia uma sequência de mensagens personalizadas ao longo de vários dias para nutrir o relacionamento.",
      impact: "70% de aumento na taxa de conversão de leads"
    },
    {
      title: "Lembretes de Visitas",
      description: "24 horas antes de uma visita agendada, o sistema envia automaticamente uma confirmação para o cliente e um lembrete para o corretor com todas as informações do imóvel.",
      impact: "Redução de 85% no não comparecimento às visitas"
    },
    {
      title: "Atualização de Status",
      description: "Quando um imóvel muda de status (vendido, alugado, etc.), o sistema automaticamente atualiza todos os portais integrados e notifica a equipe comercial.",
      impact: "Economia de 15 horas semanais em tarefas administrativas"
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
                  Recursos Avançados
                </motion.span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-poppins mb-6">
                  <span className="block text-tappyGreen">Automatize</span>
                  <span className="block">processos e libere</span>
                  <span className="block text-tappyGreen">sua equipe</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8 font-poppins">
                  Transforme sua operação imobiliária eliminando tarefas repetitivas e
                  permitindo que sua equipe foque no que realmente importa: os relacionamentos.
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
                      src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                      width={800}
                      height={500}
                      alt="Automação Tappy Imob"
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
                Recursos de Automação
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 font-poppins">
                <span className="text-tappyGreen">
                  Automação inteligente para seu negócio
                </span>
              </h2>
              <p className="text-xl text-muted-foreground font-poppins">
                O Tappy Imob oferece recursos avançados para automatizar processos,
                economizar tempo e melhorar a experiência dos seus clientes
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
        
        {/* Construtor de automações */}
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
                    src="https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    width={800}
                    height={500}
                    alt="Construtor de Fluxos Automáticos"
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
                  Construtor Visual
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 font-poppins">
                  <span className="text-tappyGreen">
                    Crie suas automações 
                  </span>
                  <span className="block">sem programação</span>
                </h2>
                <p className="text-xl text-muted-foreground mb-6 font-poppins">
                  Nosso construtor visual de fluxos permite que você crie automações poderosas:
                </p>
                
                <ul className="space-y-4 mb-8">
                  {[
                    "Interface intuitiva de arrastar e soltar para criar fluxos complexos",
                    "Biblioteca de mais de 100 ações pré-configuradas para diversos cenários",
                    "Condicionais avançadas para personalizar automações baseadas em dados",
                    "Conexão com APIs externas para integração com outros sistemas",
                    "Templates prontos para os casos de uso mais comuns"
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
                  Conhecer o construtor de fluxos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Casos de uso */}
        <section className="py-24 relative overflow-hidden animate-on-scroll">
          <div className="absolute inset-0 bg-muted/30 dark:bg-muted/10">
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.025]" />
          </div>
          
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge className="mb-4 bg-tappyGreen/10 text-tappyGreen border-tappyGreen/20 px-3 py-1.5">
                Casos de Uso
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 font-poppins">
                <span className="text-tappyGreen">
                  Exemplos reais de automação
                </span>
              </h2>
              <p className="text-xl text-muted-foreground font-poppins">
                Veja como nossos clientes estão usando a automação para transformar seus resultados
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {automationExamples.map((example, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="relative"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-tappyGreen/30 to-tappyGreen/5 rounded-lg blur opacity-30"></div>
                  <Card className="relative h-full overflow-hidden hover:border-tappyGreen/30 transition-all duration-300 shadow-md hover:shadow-xl">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-3 font-poppins text-tappyGreen">
                        {example.title}
                      </h3>
                      <p className="text-muted-foreground mb-5 font-poppins">
                        {example.description}
                      </p>
                      <div className="mt-auto">
                        <div className="p-3 rounded-lg bg-tappyGreen/5 border border-tappyGreen/10">
                          <p className="text-sm text-muted-foreground">Resultado</p>
                          <p className="text-lg font-bold text-tappyGreen">{example.impact}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA */}
        <section className="py-20 relative overflow-hidden bg-tappyGreen/5 animate-on-scroll">
          <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 font-poppins">
                Automatize seu negócio com o <span className="text-tappyGreen">Tappy Imob</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto font-poppins">
                Libere o potencial da sua equipe automatizando tarefas repetitivas
                e transformando a experiência dos seus clientes
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
