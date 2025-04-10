'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Copy, LayoutGrid, Globe, Puzzle, Zap, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Definição das integrações
const integracoes = [
  {
    id: 'portais',
    titulo: 'Portais Imobiliários',
    descricao: 'Integração com os principais portais imobiliários do Brasil, com sincronização automática de imóveis.',
    icon: <Globe className="h-6 w-6" />,
    logos: ['ZAP', 'Viva Real', 'OLX', 'Imovelweb', 'Nestoria'],
    cor: 'from-emerald-500/20 to-teal-500/20',
    animDelay: 0.1
  },
  {
    id: 'crm',
    titulo: 'CRM & Marketing',
    descricao: 'Conecte-se com as principais ferramentas de marketing e CRM para potencializar suas vendas.',
    icon: <Puzzle className="h-6 w-6" />,
    logos: ['RD Station', 'HubSpot', 'Salesforce', 'ActiveCampaign', 'MailChimp'],
    cor: 'from-indigo-500/20 to-blue-500/20',
    animDelay: 0.2
  },
  {
    id: 'financeiras',
    titulo: 'Instituições Financeiras',
    descricao: 'Aprovação de financiamentos diretamente na plataforma, agilizando o processo de venda.',
    icon: <Copy className="h-6 w-6" />,
    logos: ['Caixa', 'Banco do Brasil', 'Itaú', 'Bradesco', 'Santander'],
    cor: 'from-amber-500/20 to-yellow-500/20',
    animDelay: 0.3
  },
  {
    id: 'apps',
    titulo: 'Aplicativos Móveis',
    descricao: 'Disponibilize seus imóveis em aplicativos personalizados com sua marca.',
    icon: <Smartphone className="h-6 w-6" />,
    logos: ['iOS App', 'Android App', 'PWA', 'WhatsApp', 'Telegram'],
    cor: 'from-rose-500/20 to-pink-500/20',
    animDelay: 0.4
  },
  {
    id: 'erps',
    titulo: 'ERPs & Sistemas',
    descricao: 'Compatível com os principais sistemas de gestão empresarial do mercado imobiliário.',
    icon: <LayoutGrid className="h-6 w-6" />,
    logos: ['SAP', 'Oracle', 'Totvs', 'Senior', 'Microsoft'],
    cor: 'from-sky-500/20 to-cyan-500/20',
    animDelay: 0.5
  },
  {
    id: 'apis',
    titulo: 'API Aberta',
    descricao: 'API RESTful completa para desenvolver suas próprias integrações e aplicações.',
    icon: <Zap className="h-6 w-6" />,
    logos: ['REST API', 'GraphQL', 'Webhooks', 'OAuth 2.0', 'SDK'],
    cor: 'from-fuchsia-500/20 to-purple-500/20',
    animDelay: 0.6
  }
];

export function Integracoes() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Elementos de fundo e decorativos */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)] opacity-10 -z-10" />
      
      {/* Círculos de luz */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
      
      {/* Linhas conectoras */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent -z-10" />
      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-blue-500/30 to-transparent -z-10" />
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-16" ref={ref}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="inline-block px-6 py-2 mb-4 rounded-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 backdrop-blur-sm border border-white/10 text-emerald-400 font-medium"
          >
            Soluções & Integrações
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-emerald-100 to-white"
          >
            Conecte-se com todo o ecossistema imobiliário
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto"
          >
            Nossa plataforma se integra com dezenas de serviços e sistemas para criar 
            uma experiência completa e sem atritos para seu negócio imobiliário.
          </motion.p>
        </div>
        
        {/* Grid de integrações */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {integracoes.map((integracao) => (
            <motion.div
              key={integracao.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: integracao.animDelay }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group"
            >
              <div className="h-full p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-md hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
                {/* Cabeçalho do card */}
                <div className={cn(
                  "w-12 h-12 mb-6 rounded-xl flex items-center justify-center bg-gradient-to-br", 
                  integracao.cor
                )}>
                  {integracao.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                  {integracao.titulo}
                </h3>
                
                <p className="text-white/70 mb-6 min-h-[80px]">
                  {integracao.descricao}
                </p>
                
                {/* Logos de parceiros */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {integracao.logos.map((logo, index) => (
                    <div 
                      key={index}
                      className="py-1 px-3 text-sm rounded-full bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white/90 transition-colors cursor-pointer"
                    >
                      {logo}
                    </div>
                  ))}
                </div>
                
                <a href="#" className="inline-flex items-center text-emerald-400 hover:text-emerald-300 font-medium">
                  Saiba mais <span className="ml-1">→</span>
                </a>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Componente de destaque para API */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="relative mt-24 p-8 md:p-10 rounded-2xl overflow-hidden border border-emerald-500/30 backdrop-blur-lg"
        >
          {/* Fundo com código simulado */}
          <div className="absolute inset-0 opacity-10">
            <pre className="text-xs p-4 overflow-hidden h-full">
{`// Exemplo de código da API Tappy Imob
import { TappyClient } from 'tappy-imob-sdk';

// Inicializar cliente com suas credenciais
const client = new TappyClient({
  apiKey: 'seu-api-key',
  secretKey: 'seu-secret-key',
});

// Buscar imóveis disponíveis
async function buscarImoveis() {
  const imoveis = await client.imoveis.listar({
    tipo: 'APARTAMENTO',
    cidade: 'São Paulo',
    bairro: 'Jardins',
    preco: { min: 500000, max: 2000000 },
    status: 'DISPONIVEL',
  });
  
  return imoveis;
}

// Criar lead automaticamente
async function criarLead(dados) {
  const lead = await client.leads.criar({
    nome: dados.nome,
    email: dados.email,
    telefone: dados.telefone,
    imovelId: dados.imovelId,
    origem: 'SITE',
  });
  
  // Agendar follow-up automático
  await client.agenda.criarTarefa({
    tipo: 'FOLLOWUP',
    leadId: lead.id,
    corretorId: lead.corretorId,
    data: new Date(Date.now() + 24 * 60 * 60 * 1000),
    titulo: 'Entrar em contato com lead',
  });
  
  return lead;
}`}
            </pre>
          </div>
          
          <div className="relative z-10 md:flex items-center justify-between">
            <div className="md:w-3/5 mb-6 md:mb-0 md:pr-8">
              <h3 className="text-3xl font-bold text-white mb-4">
                API Completa e <span className="text-emerald-400">Documentada</span>
              </h3>
              <p className="text-white/70 mb-6">
                Nossa API RESTful permite que desenvolvedores integrem qualquer sistema com nossa plataforma.
                A documentação completa inclui exemplos de código, SDKs para várias linguagens e suporte técnico dedicado.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white">
                  Documentação da API
                </Button>
                <Button variant="outline" className="border-white/10 text-white/80 hover:bg-white/5">
                  Exemplos de Código
                </Button>
              </div>
            </div>
            
            <div className="md:w-2/5">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-white/10 shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="ml-auto text-xs text-white/50">tappy-api.js</div>
                </div>
                <pre className="text-xs text-emerald-300 overflow-auto max-h-[200px]">
{`// Exemplo simples
const tappy = new TappyAPI({
  apiKey: 'YOUR_API_KEY'
});

// Listar imóveis
const imoveis = await tappy.imoveis.listar();

// Criar lead
const lead = await tappy.leads.criar({
  nome: 'João Silva',
  email: 'joao@exemplo.com',
  imovelId: 12345
});

console.log(\`Lead \${lead.id} criado com sucesso!\`);`}
                </pre>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Seção de destaque para parceiros */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-24"
        >
          <h3 className="text-2xl font-bold text-white mb-8">
            Nossos Parceiros e Integrações
          </h3>
          
          <div className="flex flex-wrap justify-center items-center gap-8 max-w-4xl mx-auto">
            {[...Array(10)].map((_, i) => (
              <div 
                key={i} 
                className="w-32 h-16 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center p-4 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer"
              >
                <div className="text-white font-semibold">Logo {i+1}</div>
              </div>
            ))}
          </div>
          
          <Button 
            variant="ghost" 
            className="mt-8 text-white/70 hover:text-white hover:bg-white/5"
          >
            Ver todas as integrações disponíveis
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
