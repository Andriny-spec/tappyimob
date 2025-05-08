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
import { Check, Users, ArrowRight, Smartphone, Sparkles, LineChart, Clock, MessageSquare, MoveRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function Corretores() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  
  // Benefícios principais para corretores
  const keyBenefits = [
    {
      icon: <Smartphone className="h-6 w-6 text-tappyGreen" />,
      title: "Mobilidade total",
      description: "Acesse sua carteira de imóveis e clientes de qualquer lugar, através do seu celular ou tablet"
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-tappyGreen" />,
      title: "Comunicação direta",
      description: "Integração com WhatsApp para comunicação instantânea com seus clientes e automação de mensagens"
    },
    {
      icon: <Sparkles className="h-6 w-6 text-tappyGreen" />,
      title: "Assistente IA",
      description: "Seu assistente pessoal de IA que cria, edita e atualiza imóveis e ajuda nas negociações"
    },
    {
      icon: <Clock className="h-6 w-6 text-tappyGreen" />,
      title: "Gestão de agenda",
      description: "Organize visitas, reuniões e compromissos com sistema de agenda e lembretes automáticos"
    },
    {
      icon: <Users className="h-6 w-6 text-tappyGreen" />,
      title: "Captação de leads",
      description: "Ferramentas exclusivas para prospecção e qualificação de novos clientes potenciais"
    },
    {
      icon: <LineChart className="h-6 w-6 text-tappyGreen" />,
      title: "Dashboard pessoal",
      description: "Acompanhe seu desempenho com métricas personalizadas e planeje suas estratégias de vendas"
    },
  ];
  
  // Depoimentos de corretores
  const testimonials = [
    {
      name: "Carlos Oliveira",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      role: "Corretor Autônomo",
      content: "O Tappy Imob revolucionou minha carreira. O assistente de IA cria anúncios profissionais para mim e a organização dos clientes por fase de negociação no Kanban me ajudou a fechar 5 vendas a mais por mês.",
      highlight: "30% mais produtividade no primeiro mês"
    },
    {
      name: "Marina Santos",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      role: "Corretora de imóveis de luxo",
      content: "O site personalizado que o Tappy criou para mim ampliou minha visibilidade no mercado de alto padrão. A credibilidade que ganhei com a presença digital profissional foi incrível para minha carreira.",
      highlight: "200% mais leads qualificados online"
    },
    {
      name: "Rodrigo Menezes",
      avatar: "https://randomuser.me/api/portraits/men/62.jpg",
      role: "Corretor associado",
      content: "O assistente de IA do Tappy se tornou meu parceiro de trabalho. Ele cria descrições impecáveis para meus imóveis, sugere preços competitivos baseados no mercado e automatiza o follow-up com clientes.",
      highlight: "4h economizadas por dia em tarefas administrativas"
    }
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
      
      // Animate testimonial cards
      gsap.from(".testimonial-card", {
        x: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        scrollTrigger: {
          trigger: ".testimonials-section",
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
                  Soluções para Corretores
                </motion.span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-poppins mb-6">
                  <span className="block text-tappyGreen">Potencialize</span>
                  <span className="block">suas vendxas com um</span>
                  <span className="block text-tappyGreen">assistente de IA</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8 font-poppins">
                  O Tappy Imob transforma sua produtividade com ferramentas exclusivas para corretores. 
                  Seu assistente pessoal de IA trabalha 24h por dia para você fechar mais negócios.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button style={{backgroundColor: '#0cbc8b', color: 'white', padding: '10px 20px', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'}}>
                    Começar gratuitamente
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                  <Button size="lg" variant="outline" className="border-tappyGreen text-tappyGreen hover:bg-tappyGreen/10">
                    Ver demonstração
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
                      src="https://images.unsplash.com/photo-1573497491765-dccce02b29df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                      width={800}
                      height={500}
                      alt="Corretor utilizando Tappy Imob"
                      className="w-full h-auto object-cover rounded-t-xl"
                    />
                    <div className="bg-background p-6">
                      <h3 className="text-xl font-bold mb-2 text-tappyGreen">App Tappy Imob para Corretores</h3>
                      <p className="text-muted-foreground">Acesse tudo do seu smartphone e feche mais negócios</p>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: -30, x: -50 }}
                    animate={{ opacity: 1, y: -60, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    className="absolute top-0 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-10 border border-tappyGreen/20"
                    style={{ width: "220px" }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-tappyGreen/20 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-tappyGreen" />
                      </div>
                      <span className="text-sm font-medium">Assistente IA ativo</span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-tappyGreen to-tappyGreen/70 rounded-full" style={{ width: "78%" }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>12 tarefas concluídas hoje</span>
                        <span>78%</span>
                      </div>
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
                Recursos exclusivos
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 font-poppins">
                <span className="text-tappyGreen">
                  Tudo que você precisa para vender mais
                </span>
              </h2>
              <p className="text-xl text-muted-foreground font-poppins">
                A plataforma completa que automatiza processos, organiza sua agenda e amplia seus resultados
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
        
        {/* Kanban e Automação */}
        <section className="py-24 relative overflow-hidden">
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
                    src="https://images.unsplash.com/photo-1572025442646-866d16c84a54?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    width={800}
                    height={500}
                    alt="Kanban Tappy Imob"
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent/50 z-10"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                    <h3 className="text-2xl font-bold mb-2 text-white">Kanban Imobiliário</h3>
                    <p className="text-white/90">Visualize e otimize todas as suas negociações em andamento</p>
                  </div>
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
                  Organização Visual
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 font-poppins">
                  <span className="text-tappyGreen">
                    Kanban imobiliário
                  </span>
                  <span className="block">para fechar mais negócios</span>
                </h2>
                <p className="text-xl text-muted-foreground mb-6 font-poppins">
                  Organize seus clientes e imóveis em um sistema visual que facilita o acompanhamento de cada etapa da negociação:
                </p>
                
                <ul className="space-y-4 mb-8">
                  {[
                    "Visualize todos seus leads e negociações em andamento",
                    "Arraste e solte para atualizar o status das propostas",
                    "Automação de tarefas baseada em cada etapa da negociação",
                    "Lembretes inteligentes para acompanhamento de clientes",
                    "Integração perfeita com seu funil de vendas"
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
                  Ver demonstração do Kanban
                  <MoveRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Gerador de site */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-muted/30 dark:bg-muted/10">
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.025]" />
          </div>
          
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
                    src="https://images.unsplash.com/photo-1593720213428-28a5b9e94613?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    width={800}
                    height={500}
                    alt="Site profissional gerado pelo Tappy Imob"
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
                    Seu site profissional 
                  </span>
                  <span className="block">pronto em minutos</span>
                </h2>
                <p className="text-xl text-muted-foreground mb-6 font-poppins">
                  Destaque-se no mercado com um site profissional exclusivo que atrai e converte visitantes em clientes:
                </p>
                
                <ul className="space-y-4 mb-8">
                  {[
                    "Criação automática do seu site profissional",
                    "Domínio personalizado com seu nome",
                    "Catálogo de imóveis sempre atualizado automaticamente",
                    "Formulários de captura de leads integrados ao CRM",
                    "Otimizado para SEO e conversão de visitantes"
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
                  Criar meu site agora
                  <MoveRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Depoimentos */}
        <section className="py-24 testimonials-section relative overflow-hidden">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge className="mb-4 bg-tappyGreen/10 text-tappyGreen border-tappyGreen/20 px-3 py-1.5">
                Histórias de sucesso
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 font-poppins">
                <span className="text-tappyGreen">
                  Corretores que transformaram seus resultados
                </span>
              </h2>
              <p className="text-xl text-muted-foreground font-poppins">
                Conheça quem já está utilizando o Tappy Imob para potencializar suas vendas e expandir sua carteira de clientes
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  className="testimonial-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <Card className="h-full overflow-hidden hover:border-tappyGreen/30 transition-all duration-300 shadow-md hover:shadow-xl">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
                          <Image 
                            src={testimonial.avatar} 
                            width={56} 
                            height={56} 
                            alt={testimonial.name}
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold font-poppins">{testimonial.name}</h3>
                          <p className="text-muted-foreground text-sm">{testimonial.role}</p>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground mb-6">
                        "{testimonial.content}"
                      </p>
                      
                      <div className="p-3 rounded-lg bg-tappyGreen/5 border border-tappyGreen/10">
                        <p className="text-sm text-muted-foreground">Resultado</p>
                        <p className="text-lg font-bold text-tappyGreen">{testimonial.highlight}</p>
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
                Comece hoje mesmo com o <span className="text-tappyGreen">Tappy Imob</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto font-poppins">
                Dê o próximo passo na sua carreira como corretor e experimente a plataforma completa 
                que já transformou a vida de milhares de profissionais imobiliários
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button style={{backgroundColor: '#0cbc8b', color: 'white', padding: '10px 20px', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'}}>
                  Experimentar gratuitamente
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
