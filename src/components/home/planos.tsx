'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, X, Sparkles, Building, Users2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { buscarPlanos, Plano } from '@/lib/api/tappy';
import { PlanosEmailModal } from './planos-email-modal';

type PlanType = 'mensal' | 'anual';
type PlanOption = string;

// Definição dos planos padrão enquanto carrega da API
const planosInfoPadrao = {
  starter: {
    titulo: 'Starter',
    descricao: 'Ideal para corretores autônomos',
    icon: <Users2 className="h-6 w-6" />,
    mensal: 'R$ 99',
    anual: 'R$ 79',
    economiaAnual: 'Economia de R$ 240/ano',
    destaque: false,
    recursos: [
      'Até 20 imóveis cadastrados',
      'Até 50 leads',
      'App mobile básico',
      'Suporte por email',
      'Relatórios básicos',
      'Site simples incluso'
    ],
    recursosFaltantes: [
      'API para integração',
      'Marketing automation',
      'Múltiplos usuários',
      'Personalização avançada'
    ]
  },
  profissional: {
    titulo: 'Profissional',
    descricao: 'Perfeito para imobiliárias de pequeno porte',
    icon: <Building className="h-6 w-6" />,
    mensal: 'R$ 199',
    anual: 'R$ 159',
    economiaAnual: 'Economia de R$ 480/ano',
    destaque: true,
    recursos: [
      'Até 100 imóveis cadastrados',
      'Leads ilimitados',
      'App mobile completo',
      'Suporte prioritário',
      'Relatórios avançados',
      'Site personalizado',
      'API para integração',
      'Marketing automation'
    ],
    recursosFaltantes: [
      'Personalização avançada',
      'Suporte 24/7'
    ]
  },
  empresarial: {
    titulo: 'Empresarial',
    descricao: 'Para imobiliárias e incorporadoras',
    icon: <Sparkles className="h-6 w-6" />,
    mensal: 'R$ 399',
    anual: 'R$ 319',
    economiaAnual: 'Economia de R$ 960/ano',
    destaque: false,
    recursos: [
      'Imóveis ilimitados',
      'Leads ilimitados',
      'App mobile personalizado',
      'Suporte 24/7 com gerente dedicado',
      'BI completo com dashboards',
      'Site premium personalizado',
      'API completa para integração',
      'Marketing automation avançado',
      'Múltiplos usuários e perfis',
      'Personalização completa'
    ],
    recursosFaltantes: []
  }
};

export function Planos() {
  const [planoSelecionado, setPlanoSelecionado] = useState<PlanType>('mensal');
  const [planoHover, setPlanoHover] = useState<PlanOption | null>(null);
  const [planosAPI, setPlanosAPI] = useState<Plano[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  
  // Modal de captura de email
  const [modalAberto, setModalAberto] = useState(false);
  const [planoSelecionadoId, setPlanoSelecionadoId] = useState('');
  const [planoSelecionadoNome, setPlanoSelecionadoNome] = useState('');
  
  // Buscar planos da API
  useEffect(() => {
    async function carregarPlanos() {
      try {
        setCarregando(true);
        const dados = await buscarPlanos();
        setPlanosAPI(dados);
      } catch (error) {
        console.error('Erro ao carregar planos:', error);
        setErro('Não foi possível carregar os planos. Por favor, tente novamente mais tarde.');
      } finally {
        setCarregando(false);
      }
    }
    
    carregarPlanos();
  }, []);
  
  // Mapeamento de planos da API para o formato de exibição
  const planosInfo = planosAPI.length > 0 ? planosAPI.reduce((acc, plano) => {
    // Identificar qual ícone usar com base no nome do plano
    let icon;
    if (plano.name.toLowerCase().includes('starter')) {
      icon = <Users2 className="h-6 w-6" />;
    } else if (plano.name.toLowerCase().includes('profissional')) {
      icon = <Building className="h-6 w-6" />;
    } else {
      icon = <Sparkles className="h-6 w-6" />;
    }
    
    // Separar recursos entre disponíveis e não disponíveis
    const recursos = plano.features.filter(f => !f.startsWith('❌'));
    const recursosFaltantes = plano.features
      .filter(f => f.startsWith('❌'))
      .map(f => f.replace('❌ ', ''));
    
    // Formatar preço com base no intervalo (mensal/anual)
    const precoBase = plano.price;
    const precoMensal = precoBase;
    const precoAnual = precoBase * 0.8; // 20% de desconto
    const economiaAnual = `Economia de R$ ${Math.round((precoMensal * 12) - (precoAnual * 12))}/ano`;
    
    // Determinar se é o plano em destaque
    const destaque = plano.name.toLowerCase().includes('profissional');
    
    return {
      ...acc,
      [plano.id]: {
        id: plano.id,
        titulo: plano.name,
        descricao: plano.description,
        icon,
        mensal: `R$ ${precoMensal}`,
        anual: `R$ ${precoAnual}`,
        economiaAnual,
        destaque,
        recursos,
        recursosFaltantes
      }
    };
  }, {}) : planosInfoPadrao;

  // Animações para os cards
  const cardVariants = {
    normal: { scale: 1, y: 0 },
    hover: { scale: 1.03, y: -10 }
  };

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 -z-10" />
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px] -z-10" />
      <div className="absolute h-80 w-80 -bottom-20 -left-20 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute h-80 w-80 top-40 right-0 bg-blue-500/20 rounded-full blur-3xl -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="inline-block px-6 py-2 mb-4 rounded-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 backdrop-blur-sm border border-white/10 text-emerald-400 font-medium"
          >
            Planos e Preços
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-emerald-100 to-white"
          >
            Escolha o plano ideal para seu negócio
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto mb-10"
          >
            Temos opções para todos os tamanhos de operação, desde corretores autônomos 
            até grandes redes imobiliárias.
          </motion.p>
          
          {/* Toggle de seleção entre planos mensais e anuais */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="inline-flex p-1 rounded-full bg-slate-800/50 backdrop-blur-sm border border-white/10 mb-16"
          >
            <button
              onClick={() => setPlanoSelecionado('mensal')}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all", 
                planoSelecionado === 'mensal' 
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg" 
                  : "text-white/70 hover:text-white"
              )}
            >
              Mensal
            </button>
            <button
              onClick={() => setPlanoSelecionado('anual')}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all relative", 
                planoSelecionado === 'anual' 
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg" 
                  : "text-white/70 hover:text-white"
              )}
            >
              Anual
              <span className="absolute -top-3 -right-2 px-2 py-0.5 text-xs rounded-full bg-emerald-500 text-white font-medium">
                -20%
              </span>
            </button>
          </motion.div>
        </div>
        
        {/* Estado de carregamento */}
        {carregando && (
          <div className="col-span-3 flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mb-4" />
            <p className="text-white/70 text-lg">Carregando planos disponíveis...</p>
          </div>
        )}
        
        {/* Exibição de erro */}
        {!carregando && erro && (
          <div className="col-span-3 bg-red-900/20 border border-red-500/30 rounded-xl p-8 text-center">
            <p className="text-red-300 mb-4">{erro}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="bg-red-500/10 border-red-500/30 text-white hover:bg-red-500/20"
            >
              Tentar novamente
            </Button>
          </div>
        )}
        
        {/* Grid de cards de planos */}
        {!carregando && !erro && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {Object.keys(planosInfo).map((planoId) => {
              const planoData = planosInfo[planoId];
              const preco = planoSelecionado === 'mensal' ? planoData.mensal : planoData.anual;
            
              return (
                <motion.div
                  key={planoId}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: planoId === 'starter' ? 0.1 : planoId === 'profissional' ? 0.2 : 0.3 }}
                  viewport={{ once: true }}
                  variants={cardVariants}
                  whileHover="hover"
                  animate={planoHover === planoId ? "hover" : "normal"}
                  onHoverStart={() => setPlanoHover(planoId)}
                  onHoverEnd={() => setPlanoHover(null)}
                  className={cn(
                    "relative rounded-2xl overflow-hidden border transition-all duration-300",
                    planoData.destaque 
                      ? "border-emerald-500/50 shadow-lg shadow-emerald-500/20" 
                      : "border-white/10 shadow-xl shadow-black/20"
                  )}
                >
                  {/* Rótulo de "Mais Popular" */}
                  {planoData.destaque && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold px-4 py-1 transform translate-x-6 rotate-45 shadow-md">
                      Mais Popular
                    </div>
                  )}
                  
                  {/* Conteúdo do card */}
                  <div 
                    className={cn(
                      "p-8 h-full flex flex-col",
                      planoData.destaque 
                        ? "bg-gradient-to-br from-emerald-900/30 to-blue-900/30 backdrop-blur-md" 
                        : "bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-md"
                    )}
                  >
                    {/* Cabeçalho do plano */}
                    <div className="mb-8">
                      <div className="flex items-center mb-4">
                        <div className={cn(
                          "p-2 rounded-xl mr-3",
                          planoData.destaque ? "bg-emerald-500/20" : "bg-slate-700/50"
                        )}>
                          {planoData.icon}
                        </div>
                        <h3 className={cn(
                          "text-2xl font-bold",
                          planoData.destaque ? "text-emerald-400" : "text-white"
                        )}>
                          {planoData.titulo}
                        </h3>
                      </div>
                      <p className="text-white/70 mb-6">{planoData.descricao}</p>
                      <div className="flex items-end">
                        <span className="text-4xl font-bold text-white">{preco}</span>
                        <span className="text-white/60 ml-2 mb-1">/mês</span>
                      </div>
                      {planoSelecionado === 'anual' && (
                        <p className="text-emerald-400 text-sm mt-1">{planoData.economiaAnual}</p>
                      )}
                    </div>
                    
                    {/* Botão de ação */}
                    <div className="mt-8">
                      <Button
                        onClick={() => {
                          setPlanoSelecionadoId(planoId);
                          setPlanoSelecionadoNome(planoData.titulo);
                          setModalAberto(true);
                        }}
                        className={cn(
                          "w-full py-3 px-4 rounded-lg text-center text-sm font-medium transition-all",
                          planoData.destaque
                            ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-lg hover:translate-y-[-2px]"
                            : "bg-white/10 text-white hover:bg-white/20"
                        )}
                      >
                        Contratar {planoData.titulo}
                      </Button>
                    </div>
                    
                    {/* Lista de recursos incluídos */}
                    <div className="mb-6">
                      <p className="text-sm text-white/80 font-medium mb-4">Inclui:</p>
                      <ul className="space-y-3">
                        {planoData.recursos.map((recurso, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5 mr-3" />
                            <span className="text-white/70">{recurso}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Lista de recursos não incluídos */}
                    {planoData.recursosFaltantes.length > 0 && (
                      <div className="mt-auto">
                        <p className="text-sm text-white/80 font-medium mb-4">Não inclui:</p>
                        <ul className="space-y-3">
                          {planoData.recursosFaltantes.map((recurso, index) => (
                            <li key={index} className="flex items-start">
                              <X className="h-5 w-5 text-white/40 shrink-0 mt-0.5 mr-3" />
                              <span className="text-white/40">{recurso}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
        
        {/* Seção de perguntas frequentes ou informações adicionais */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 mt-16 max-w-3xl mx-auto text-center"
        >
          <Sparkles className="h-8 w-8 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-4">Precisando de recursos personalizados?</h3>
          <p className="text-white/70 mb-6">Entre em contato com nossa equipe para discutir planos corporativos e soluções customizadas para sua imobiliária.</p>
          <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white">
            Falar com especialista
          </Button>
        </motion.div>
      </div>
      
      {/* Modal de captura de email */}
      <PlanosEmailModal 
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        planoId={planoSelecionadoId}
        planoNome={planoSelecionadoNome}
      />
    </section>
  );
}
