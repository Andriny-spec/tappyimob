import React from 'react';
import { Header1 } from '../headers/header-1';
import { Header2 } from '../headers/header-2';
import { Footer1 } from '../footers/footer-1';
import { Footer2 } from '../footers/footer-2';
import { GridCategorias1 } from '../grids/grid-1';
import { GridCategorias2 } from '../grids/grid-2';
import { Cta1 } from '../ctas/cta-1';
import { Cta2 } from '../ctas/cta-2';
import { ImovelCard1 } from '../cards/card-1';
import { ImovelCard2 } from '../cards/card-2';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Search, MapPin, ArrowRight, Home, Building, Target, Stars } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ImobiliariaInfo {
  telefone: string;
  endereco: string;
  cnpj: string;
  creci: string;
  descricao: string;
}

interface Imovel {
  id: string;
  titulo: string;
  endereco: string;
  preco: number;
  tipo: 'venda' | 'aluguel';
  categoria: string;
  quartos?: number;
  banheiros?: number;
  areaTotal?: number;
  imagemUrl: string;
  destaque?: boolean;
}

interface Categoria {
  id: string;
  nome: string;
  descricao: string;
  imagemUrl: string;
  qtdImoveis: number;
  url: string;
}

interface HomePageProps {
  // Informações da imobiliária
  imobiliariaInfo: ImobiliariaInfo;
  nomeSite: string;
  logoUrl: string;
  
  // Estilo
  corPrimaria: string;
  corSecundaria: string;
  corAcentuacao: string;
  corTexto: string;
  fonteTitulos: string;
  fonteCorpo: string;
  
  // Componentes selecionados
  headerType: 'header-1' | 'header-2';
  footerType: 'footer-1' | 'footer-2';
  cardType: 'card-1' | 'card-2';
  ctaType: 'cta-1' | 'cta-2';
  gridType: 'grid-1' | 'grid-2';
  
  // Dados (opcionais)
  imoveisDestaque?: Imovel[];
  categorias?: Categoria[];
}

export function HomePage({
  imobiliariaInfo,
  nomeSite,
  logoUrl,
  corPrimaria,
  corSecundaria,
  corAcentuacao,
  corTexto,
  fonteTitulos,
  fonteCorpo,
  headerType = 'header-1',
  footerType = 'footer-1',
  cardType = 'card-1',
  ctaType = 'cta-1',
  gridType = 'grid-1',
  imoveisDestaque = [],
  categorias = []
}: HomePageProps) {
  // Mock de dados para imóveis em destaque se não forem fornecidos
  const mockImoveis: Imovel[] = [
    {
      id: '1',
      titulo: 'Apartamento com 3 quartos no Centro',
      endereco: 'Centro, São Paulo - SP',
      preco: 750000,
      tipo: 'venda',
      categoria: 'Apartamento',
      quartos: 3,
      banheiros: 2,
      areaTotal: 120,
      imagemUrl: '/images/properties/apartment1.jpg',
      destaque: true
    },
    {
      id: '2',
      titulo: 'Casa com amplo jardim',
      endereco: 'Jardim América, São Paulo - SP',
      preco: 1200000,
      tipo: 'venda',
      categoria: 'Casa',
      quartos: 4,
      banheiros: 3,
      areaTotal: 250,
      imagemUrl: '/images/properties/house1.jpg',
      destaque: true
    },
    {
      id: '3',
      titulo: 'Loft moderno e bem localizado',
      endereco: 'Vila Madalena, São Paulo - SP',
      preco: 3500,
      tipo: 'aluguel',
      categoria: 'Loft',
      quartos: 1,
      banheiros: 1,
      areaTotal: 75,
      imagemUrl: '/images/properties/loft1.jpg',
      destaque: true
    },
    {
      id: '4',
      titulo: 'Sala comercial em região nobre',
      endereco: 'Itaim Bibi, São Paulo - SP',
      preco: 5000,
      tipo: 'aluguel',
      categoria: 'Comercial',
      areaTotal: 90,
      imagemUrl: '/images/properties/commercial1.jpg',
      destaque: false
    }
  ];

  const imoveisToShow = imoveisDestaque.length > 0 ? imoveisDestaque : mockImoveis;

  // Estilo global para a página
  const pageStyle = {
    '--cor-primaria': corPrimaria,
    '--cor-secundaria': corSecundaria,
    '--cor-acentuacao': corAcentuacao,
    '--cor-texto': corTexto,
    '--fonte-titulos': fonteTitulos,
    '--fonte-corpo': fonteCorpo,
  } as React.CSSProperties;

  // Renderiza o header baseado no tipo selecionado
  const renderHeader = () => {
    const headerProps = {
      logoUrl,
      nomeSite,
      corPrimaria,
      corSecundaria,
      corTexto,
      fonteTitulos,
      telefone: imobiliariaInfo.telefone,
      endereco: imobiliariaInfo.endereco
    };

    return headerType === 'header-1' 
      ? <Header1 {...headerProps} /> 
      : <Header2 {...headerProps} />;
  };

  // Renderiza o footer baseado no tipo selecionado
  const renderFooter = () => {
    const footerProps = {
      logoUrl,
      nomeSite,
      corPrimaria,
      corSecundaria,
      corTexto,
      fonteTitulos,
      telefone: imobiliariaInfo.telefone,
      endereco: imobiliariaInfo.endereco,
      creci: imobiliariaInfo.creci,
      cnpj: imobiliariaInfo.cnpj
    };

    return footerType === 'footer-1' 
      ? <Footer1 {...footerProps} /> 
      : <Footer2 {...footerProps} />;
  };

  // Renderiza a grid de categorias baseada no tipo selecionado
  const renderGridCategorias = () => {
    const gridProps = {
      titulo: 'Explore por categorias',
      subtitulo: 'Encontre o imóvel ideal em nossas categorias',
      corPrimaria,
      corSecundaria,
      corTexto,
      fonteTitulos,
      fonteCorpo,
      categorias
    };

    return gridType === 'grid-1' 
      ? <GridCategorias1 {...gridProps} /> 
      : <GridCategorias2 {...gridProps} verTodosUrl="/imoveis" />;
  };

  // Renderiza o CTA baseado no tipo selecionado
  const renderCta = () => {
    const ctaProps = {
      titulo: 'Encontre o imóvel dos seus sonhos',
      subtitulo: 'Conte com nossa experiência para encontrar a melhor opção para você',
      botaoTexto: 'Ver imóveis disponíveis',
      botaoUrl: '/imoveis',
      corPrimaria,
      corSecundaria,
      corTexto,
      fonteTitulos,
      fonteCorpo
    };

    const cta2Props = {
      ...ctaProps,
      descricao: 'Nossa equipe está pronta para encontrar o imóvel ideal para você, com as melhores condições do mercado.',
      botaoTexto1: 'Ver imóveis',
      botaoUrl1: '/imoveis',
      botaoTexto2: 'Fale conosco',
      botaoUrl2: '/atendimento'
    };

    return ctaType === 'cta-1' 
      ? <Cta1 {...ctaProps} /> 
      : <Cta2 {...cta2Props} />;
  };

  // Renderiza os cards de imóveis baseados no tipo selecionado
  const renderImovelCard = (imovel: Imovel, index: number) => {
    const cardProps = {
      id: imovel.id,
      titulo: imovel.titulo,
      endereco: imovel.endereco,
      preco: imovel.preco,
      tipo: imovel.tipo,
      categoria: imovel.categoria,
      quartos: imovel.quartos,
      banheiros: imovel.banheiros,
      areaTotal: imovel.areaTotal,
      imagemUrl: imovel.imagemUrl,
      destaque: imovel.destaque,
      corPrimaria,
      corSecundaria,
      corTexto,
      fonteTitulos,
      fonteCorpo,
      className: 'h-full'
    };

    return cardType === 'card-1' 
      ? <ImovelCard1 key={imovel.id} {...cardProps} /> 
      : <ImovelCard2 key={imovel.id} {...cardProps} />;
  };

  return (
    <div style={pageStyle}>
      {/* Header */}
      {renderHeader()}
      
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[600px] flex items-center">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-bg.jpg"
            alt="Imóveis de qualidade"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge 
                className="mb-4 px-3 py-1 text-sm"
                style={{ backgroundColor: 'var(--cor-acentuacao)', color: 'black' }}
              >
                {imobiliariaInfo.creci ? `CRECI: ${imobiliariaInfo.creci}` : 'Imobiliária especializada'}
              </Badge>
              
              <h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white"
                style={{ fontFamily: 'var(--fonte-titulos)' }}
              >
                Encontre o imóvel perfeito para sua vida
              </h1>
              
              <p className="text-xl text-gray-200 mb-8 md:pr-12">
                Oferecemos as melhores opções de imóveis com localização privilegiada e ótimas condições.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg"
                  className="rounded-full gap-2"
                  style={{ 
                    backgroundColor: 'var(--cor-primaria)',
                    color: 'white',
                    fontFamily: 'var(--fonte-titulos)'
                  }}
                >
                  <Search className="h-5 w-5" />
                  Buscar imóveis
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  className="rounded-full gap-2 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                >
                  <MapPin className="h-5 w-5" />
                  Agendar visita
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Destaques */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span 
                className="text-sm font-medium uppercase tracking-wider mb-3 inline-block"
                style={{ color: 'var(--cor-primaria)' }}
              >
                Destaques
              </span>
              
              <h2 
                className="text-3xl md:text-4xl font-bold"
                style={{ 
                  color: 'var(--cor-texto)', 
                  fontFamily: 'var(--fonte-titulos)'
                }}
              >
                Imóveis em destaque
              </h2>
            </div>
            
            <Link 
              href="/imoveis"
              className="inline-flex items-center mt-4 md:mt-0 text-base font-medium hover:underline"
              style={{ color: 'var(--cor-primaria)' }}
            >
              Ver todos os imóveis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {imoveisToShow.map((imovel, index) => renderImovelCard(imovel, index))}
          </div>
        </div>
      </section>
      
      {/* Grid de categorias */}
      {renderGridCategorias()}
      
      {/* Diferenciais */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span 
              className="text-sm font-medium uppercase tracking-wider mb-3 inline-block"
              style={{ color: 'var(--cor-primaria)' }}
            >
              Por que nos escolher
            </span>
            
            <h2 
              className="text-3xl md:text-4xl font-bold mb-6"
              style={{ 
                color: 'var(--cor-texto)', 
                fontFamily: 'var(--fonte-titulos)'
              }}
            >
              Nossos diferenciais
            </h2>
            
            <p className="text-lg text-gray-600">
              Conheça as vantagens de contar com nossa experiência no mercado imobiliário
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div 
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center mb-6"
                style={{ backgroundColor: 'var(--cor-primaria)' }}
              >
                <Home className="h-7 w-7 text-white" />
              </div>
              
              <h3 
                className="text-xl font-semibold mb-3"
                style={{ 
                  color: 'var(--cor-texto)', 
                  fontFamily: 'var(--fonte-titulos)'
                }}
              >
                Diversidade de imóveis
              </h3>
              
              <p className="text-gray-600">
                Oferecemos uma ampla variedade de imóveis para atender todas as necessidades.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center mb-6"
                style={{ backgroundColor: 'var(--cor-primaria)' }}
              >
                <Building className="h-7 w-7 text-white" />
              </div>
              
              <h3 
                className="text-xl font-semibold mb-3"
                style={{ 
                  color: 'var(--cor-texto)', 
                  fontFamily: 'var(--fonte-titulos)'
                }}
              >
                Localização estratégica
              </h3>
              
              <p className="text-gray-600">
                Imóveis em regiões valorizadas com excelente infraestrutura.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center mb-6"
                style={{ backgroundColor: 'var(--cor-primaria)' }}
              >
                <Target className="h-7 w-7 text-white" />
              </div>
              
              <h3 
                className="text-xl font-semibold mb-3"
                style={{ 
                  color: 'var(--cor-texto)', 
                  fontFamily: 'var(--fonte-titulos)'
                }}
              >
                Atendimento personalizado
              </h3>
              
              <p className="text-gray-600">
                Profissionais qualificados para entender suas necessidades.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center mb-6"
                style={{ backgroundColor: 'var(--cor-primaria)' }}
              >
                <Stars className="h-7 w-7 text-white" />
              </div>
              
              <h3 
                className="text-xl font-semibold mb-3"
                style={{ 
                  color: 'var(--cor-texto)', 
                  fontFamily: 'var(--fonte-titulos)'
                }}
              >
                Transparência
              </h3>
              
              <p className="text-gray-600">
                Processos claros e transparentes em todas as etapas da negociação.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      {renderCta()}
      
      {/* Sobre nós (breve) */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span 
                className="text-sm font-medium uppercase tracking-wider mb-3 inline-block"
                style={{ color: 'var(--cor-primaria)' }}
              >
                Quem somos
              </span>
              
              <h2 
                className="text-3xl md:text-4xl font-bold mb-6"
                style={{ 
                  color: 'var(--cor-texto)', 
                  fontFamily: 'var(--fonte-titulos)'
                }}
              >
                {nomeSite}
              </h2>
              
              <div 
                className="text-lg text-gray-600 mb-8 space-y-4"
                style={{ fontFamily: 'var(--fonte-corpo)' }}
              >
                <p>{imobiliariaInfo.descricao || 'Nossa imobiliária atua há anos no mercado, oferecendo as melhores opções de imóveis com total segurança e transparência nas negociações.'}</p>
                <p>Nosso objetivo é proporcionar a melhor experiência na hora de comprar, vender ou alugar um imóvel, com foco total na satisfação dos nossos clientes.</p>
              </div>
              
              <Link href="/sobre">
                <Button 
                  variant="outline" 
                  className="rounded-full gap-2"
                  style={{ 
                    borderColor: 'var(--cor-primaria)',
                    color: 'var(--cor-primaria)',
                    fontFamily: 'var(--fonte-titulos)'
                  }}
                >
                  Conheça nossa história
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="relative h-[500px] rounded-xl overflow-hidden shadow-xl">
              <Image
                src="/images/about-us.jpg"
                alt="Sobre nossa imobiliária"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      {renderFooter()}
      
      {/* Badge conteúdo gerado por IA */}
      <div className="fixed bottom-4 right-4 z-50 bg-white shadow-lg rounded-full py-1 px-3 text-xs flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
        <Image src="/images/ai-badge.svg" alt="AI" width={16} height={16} />
        <span>Conteúdo gerado por I.A.</span>
      </div>
    </div>
  );
}
