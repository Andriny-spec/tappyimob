'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  ShieldCheck, Clock, Zap, Trophy, BarChart3, HeartHandshake,
  Stars, Users, MessagesSquare, Award, CheckCircle, Database
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Depoimentos de clientes
const depoimentos = [
  {
    id: 1,
    nome: 'Carlos Oliveira',
    cargo: 'Diretor Comercial',
    empresa: 'Imobiliária Jardins',
    foto: '/placeholder-avatar.jpg',
    texto: 'Desde que implementamos o Tappy Imob, nossas vendas aumentaram em 42%. A interface é incrivelmente fácil de usar e o suporte é sempre ágil e eficiente.',
    avaliacao: 5
  },
  {
    id: 2,
    nome: 'Mariana Santos',
    cargo: 'CEO',
    empresa: 'MS Imóveis',
    foto: '/placeholder-avatar.jpg',
    texto: 'Nossos corretores conseguem fechar negócios muito mais rápido com o Tappy. O aplicativo móvel mudou completamente nossa forma de trabalhar em campo.',
    avaliacao: 5
  },
  {
    id: 3,
    nome: 'Ricardo Mendes',
    cargo: 'Gerente de Tecnologia',
    empresa: 'Grupo Real',
    foto: '/placeholder-avatar.jpg',
    texto: 'A integração com portais imobiliários economiza horas do nosso time a cada semana. A API é robusta e a documentação é excelente para nossos desenvolvedores.',
    avaliacao: 5
  }
];

// Diferenciais da plataforma
const diferenciais = [
  {
    icone: <ShieldCheck className="h-6 w-6 text-emerald-400" />,
    titulo: 'Segurança Avançada',
    descricao: 'Sua infraestrutura opera com criptografia de ponta a ponta e conformidade com LGPD.'
  },
  {
    icone: <Clock className="h-6 w-6 text-emerald-400" />,
    titulo: 'Economia de Tempo',
    descricao: 'Automações inteligentes que reduzem em até 70% o tempo gasto em tarefas administrativas.'
  },
  {
    icone: <Zap className="h-6 w-6 text-emerald-400" />,
    titulo: 'Rápida Implementação',
    descricao: 'Plataforma pronta para uso em 48h, com importação de dados e treinamento inclusos.'
  },
  {
    icone: <Trophy className="h-6 w-6 text-emerald-400" />,
    titulo: 'Liderança no Mercado',
    descricao: 'Software mais bem avaliado do setor imobiliário pelos últimos 3 anos consecutivos.'
  },
  {
    icone: <BarChart3 className="h-6 w-6 text-emerald-400" />,
    titulo: 'Análises Detalhadas',
    descricao: 'Dashboards personalizáveis com métricas que realmente importam para o seu negócio.'
  },
  {
    icone: <HeartHandshake className="h-6 w-6 text-emerald-400" />,
    titulo: 'Suporte Humanizado',
    descricao: 'Atendimento personalizado por especialistas que realmente entendem do mercado imobiliário.'
  }
];

// Números impressionantes
const numeros = [
  {
    valor: '98%',
    rotulo: 'Taxa de renovação',
    icone: <Stars className="h-6 w-6 text-emerald-300" />
  },
  {
    valor: '+15.000',
    rotulo: 'Usuários ativos',
    icone: <Users className="h-6 w-6 text-emerald-300" />
  },
  {
    valor: '+500.000',
    rotulo: 'Imóveis gerenciados',
    icone: <Database className="h-6 w-6 text-emerald-300" />
  },
  {
    valor: '4.9/5',
    rotulo: 'Avaliação média',
    icone: <Award className="h-6 w-6 text-emerald-300" />
  }
];

export function Diferencial() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  
  return (
    <section className="relative py-24 md:py-32 overflow-hidden" ref={ref}>
      {/* Elementos de fundo decorativos */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 -z-10" />
      <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_80%)] bg-grid-white/[0.02] -z-10" />
      
      {/* Círculos decorativos */}
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-emerald-500/5 to-transparent -z-10" />
      <div className="absolute top-40 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-40 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="inline-block px-6 py-2 mb-4 rounded-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 backdrop-blur-sm border border-white/10 text-emerald-400 font-medium"
          >
            Por que nos escolher
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-emerald-100 to-white"
          >
            Transformando o mercado imobiliário
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto"
          >
            O Tappy Imob foi desenvolvido especificamente para o mercado brasileiro, 
            com recursos que realmente fazem a diferença nos resultados da sua empresa.
          </motion.p>
        </div>
        
        {/* Grid de diferenciais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {diferenciais.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-md border border-white/10 hover:border-emerald-500/30 transition-all group"
            >
              <div className="flex items-start">
                <div className="p-3 rounded-xl bg-slate-800/80 mr-4 group-hover:bg-emerald-900/40 transition-colors">
                  {item.icone}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                    {item.titulo}
                  </h3>
                  <p className="text-white/70">{item.descricao}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Seção de números */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24"
        >
          {numeros.map((item, index) => (
            <div 
              key={index}
              className="p-8 text-center rounded-2xl bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm border border-white/10"
            >
              <div className="inline-flex p-3 rounded-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 mb-4">
                {item.icone}
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">{item.valor}</div>
              <p className="text-white/60">{item.rotulo}</p>
            </div>
          ))}
        </motion.div>
        
        {/* Depoimentos de clientes */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              O que nossos clientes dizem
            </h3>
            <p className="text-white/70 max-w-2xl mx-auto">
              Empresas de todos os tamanhos já transformaram seus negócios com nossa plataforma.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {depoimentos.map((depoimento, index) => (
              <div 
                key={depoimento.id}
                className="p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-md border border-white/10 relative"
              >
                {/* Ícone de aspas */}
                <div className="absolute -top-4 -left-2 text-emerald-500/20 text-7xl font-serif">"</div>
                
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    {/* Avaliação em estrelas */}
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Stars 
                          key={i} 
                          className={cn(
                            "h-5 w-5 mr-1",
                            i < depoimento.avaliacao ? "text-emerald-400" : "text-white/20"
                          )}
                          fill={i < depoimento.avaliacao ? "currentColor" : "none"}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-white/80 italic mb-6">"{depoimento.texto}"</p>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mr-4">
                      <span className="text-emerald-400 font-bold">
                        {depoimento.nome.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{depoimento.nome}</h4>
                      <p className="text-white/60 text-sm">{depoimento.cargo}, {depoimento.empresa}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
        
        {/* CTA final */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="rounded-2xl p-10 md:p-16 bg-gradient-to-r from-slate-900/90 via-blue-900/30 to-slate-900/90 border border-white/10 backdrop-blur-md text-center relative overflow-hidden"
        >
          {/* Elementos decorativos */}
          <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)] bg-grid-white/[0.02] -z-10" />
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Pronto para transformar seu negócio imobiliário?
          </h2>
          
          <p className="text-white/70 text-lg max-w-3xl mx-auto mb-10">
            Junte-se a milhares de profissionais imobiliários que já estão aproveitando 
            o poder da automação e inteligência do Tappy Imob.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-10 h-14 text-lg"
            >
              Começar agora
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-blue-400/30 bg-blue-900/20 text-white hover:bg-blue-800/40 hover:text-emerald-400 h-14 text-lg"
            >
              Agendar demonstração
            </Button>
          </div>
          
          <div className="mt-8 flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-emerald-400 mr-2" />
            <span className="text-white/70">Teste gratuito por 14 dias, sem necessidade de cartão de crédito</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
