import React, { useState } from 'react';
import { Header1 } from '../headers/header-1';
import { Header2 } from '../headers/header-2';
import { Footer1 } from '../footers/footer-1';
import { Footer2 } from '../footers/footer-2';
import { ContactForm } from '../dynamic/contact-form';
import { PropertyReviews } from '../dynamic/property-reviews';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import Link from 'next/link';
import { 
  BedDouble, 
  Bath, 
  Maximize, 
  Home, 
  Map, 
  Share2, 
  Heart, 
  ArrowLeft, 
  Phone, 
  MessageCircle, 
  CheckCircle2, 
  Car, 
  Grid, 
  Globe,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

// Importação dinâmica do mapa para evitar problemas de SSR
const MapComponent = dynamic(() => import('../single/map-component'), { 
  ssr: false,
  loading: () => <div className="h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">Carregando mapa...</div>
});

interface ImobiliariaInfo {
  telefone: string;
  endereco: string;
  cnpj: string;
  creci: string;
  descricao: string;
}

interface Imovel {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  valor: number;
  tipoOperacao: 'venda' | 'aluguel';
  tipoImovel: string;
  status: string;
  endereco: string;
  bairro: string;
  numero: string;
  cidade: string;
  estado: string;
  cep?: string;
  latitude?: number;
  longitude?: number;
  areaTotal?: number;
  areaConstruida?: number;
  quartos?: number;
  banheiros?: number;
  suites?: number;
  vagas?: number;
  salas?: number;
  cozinhas?: number;
  fotoPrincipal?: string;
  fotos: Array<{
    id: string;
    url: string;
    legenda?: string;
    ordem: number;
  }>;
  adicionais: Array<{
    id: string;
    nome: string;
  }>;
  createdAt: Date;
}

interface Avaliacao {
  id: string;
  titulo: string;
  descricao: string;
  nota: number;
  usuarioId: string;
  usuario: {
    nome: string;
    fotoPerfil?: string;
  };
  createdAt: Date;
}

interface ImovelSingleProps {
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
  
  // Dados do imóvel
  imovel: Imovel;
  imoveisRelacionados?: Imovel[];
  avaliacoes?: Avaliacao[];
}

export function ImovelSingle({
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
  imovel,
  imoveisRelacionados = [],
  avaliacoes = []
}: ImovelSingleProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [activeTab, setActiveTab] = useState('descricao');
  
  // Formatação do preço
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0
  }).format(imovel.valor);
  
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
  
  // Lista de fotos para o carrossel
  const photos = imovel.fotos.length > 0 
    ? imovel.fotos.sort((a, b) => a.ordem - b.ordem).map(foto => foto.url)
    : imovel.fotoPrincipal 
      ? [imovel.fotoPrincipal] 
      : ['/images/property-placeholder.jpg'];
  
  // Endereço completo do imóvel
  const fullAddress = `${imovel.endereco}, ${imovel.numero}, ${imovel.bairro}, ${imovel.cidade} - ${imovel.estado}${imovel.cep ? ', ' + imovel.cep : ''}`;
  
  return (
    <div style={pageStyle}>
      {/* Header */}
      {renderHeader()}
      
      {/* Caminho de navegação */}
      <div className="bg-gray-50 py-3 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm text-gray-500">
            <Link href="/" className="hover:text-primary" style={{ '--primary': 'var(--cor-primaria)' } as React.CSSProperties}>
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/imoveis" className="hover:text-primary" style={{ '--primary': 'var(--cor-primaria)' } as React.CSSProperties}>
              Imóveis
            </Link>
            <span className="mx-2">/</span>
            <Link 
              href={`/imoveis?tipo=${imovel.tipoImovel.toLowerCase()}`} 
              className="hover:text-primary"
              style={{ '--primary': 'var(--cor-primaria)' } as React.CSSProperties}
            >
              {imovel.tipoImovel}
            </Link>
            <span className="mx-2">/</span>
            <span className="font-medium truncate" style={{ color: 'var(--cor-primaria)' }}>
              {imovel.titulo}
            </span>
          </div>
        </div>
      </div>
      
      {/* Galeria de fotos */}
      <section className="pt-6 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Coluna principal */}
            <div className="w-full lg:w-2/3">
              {/* Cabeçalho do imóvel */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge 
                    className="uppercase text-xs font-medium"
                    style={{ 
                      backgroundColor: 'var(--cor-primaria)',
                      color: 'white'
                    }}
                  >
                    {imovel.tipoOperacao === 'venda' ? 'Venda' : 'Aluguel'}
                  </Badge>
                  
                  <Badge 
                    variant="outline"
                    className="uppercase text-xs font-medium bg-white"
                  >
                    {imovel.tipoImovel}
                  </Badge>
                  
                  <Badge 
                    variant="outline"
                    className="uppercase text-xs font-medium bg-white"
                  >
                    Cód. {imovel.codigo}
                  </Badge>
                </div>
                
                <h1 
                  className="text-2xl md:text-3xl font-bold mb-2"
                  style={{ 
                    color: 'var(--cor-texto)', 
                    fontFamily: 'var(--fonte-titulos)'
                  }}
                >
                  {imovel.titulo}
                </h1>
                
                <div className="flex items-center text-gray-600 mb-4">
                  <Map className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="text-sm">{fullAddress}</span>
                </div>
                
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div 
                    className="text-2xl md:text-3xl font-bold"
                    style={{ color: 'var(--cor-primaria)' }}
                  >
                    {formattedPrice}
                    {imovel.tipoOperacao === 'aluguel' && 
                      <span className="text-base font-normal text-gray-500">/mês</span>}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-10 w-10 rounded-full"
                    >
                      <Heart className="h-5 w-5" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-10 w-10 rounded-full"
                    >
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Galeria de fotos */}
              <div className="relative mb-8 rounded-xl overflow-hidden">
                <div className="relative aspect-[16/9] w-full">
                  <Image
                    src={photos[currentImageIndex]}
                    alt={imovel.titulo}
                    fill
                    className="object-cover"
                  />
                </div>
                
                {/* Controles da galeria */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-9 bg-white/90 backdrop-blur-sm hover:bg-white"
                    onClick={() => setShowAllPhotos(true)}
                  >
                    <Grid className="h-4 w-4 mr-1" />
                    Ver todas as fotos
                  </Button>
                </div>
                
                {/* Navegação da galeria */}
                <div className="absolute inset-y-0 left-0 flex items-center">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-10 w-10 rounded-full bg-white/50 backdrop-blur-sm hover:bg-white/80 mr-2"
                    onClick={() => setCurrentImageIndex(prev => 
                      prev === 0 ? photos.length - 1 : prev - 1
                    )}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-10 w-10 rounded-full bg-white/50 backdrop-blur-sm hover:bg-white/80 ml-2"
                    onClick={() => setCurrentImageIndex(prev => 
                      prev === photos.length - 1 ? 0 : prev + 1
                    )}
                  >
                    <ArrowLeft className="h-5 w-5 transform rotate-180" />
                  </Button>
                </div>
                
                {/* Miniaturas */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-center p-2 overflow-auto">
                  <div className="flex gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full">
                    {photos.slice(0, 5).map((photo, index) => (
                      <button
                        key={index}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all",
                          currentImageIndex === index 
                            ? "bg-primary w-4" 
                            : "bg-gray-300 hover:bg-gray-400"
                        )}
                        style={currentImageIndex === index ? { backgroundColor: 'var(--cor-primaria)' } : {}}
                        onClick={() => setCurrentImageIndex(index)}
                        aria-label={`Ver foto ${index + 1}`}
                      />
                    ))}
                    {photos.length > 5 && (
                      <span className="text-xs text-gray-600">+{photos.length - 5}</span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Características principais */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {imovel.areaTotal && (
                  <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-50">
                    <Maximize 
                      className="h-6 w-6 mb-2"
                      style={{ color: 'var(--cor-primaria)' }}
                    />
                    <span className="text-lg font-semibold">{imovel.areaTotal} m²</span>
                    <span className="text-sm text-gray-500">Área total</span>
                  </div>
                )}
                
                {imovel.quartos !== undefined && (
                  <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-50">
                    <BedDouble 
                      className="h-6 w-6 mb-2"
                      style={{ color: 'var(--cor-primaria)' }}
                    />
                    <span className="text-lg font-semibold">{imovel.quartos}</span>
                    <span className="text-sm text-gray-500">
                      {imovel.quartos === 1 ? 'Quarto' : 'Quartos'}
                    </span>
                  </div>
                )}
                
                {imovel.banheiros !== undefined && (
                  <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-50">
                    <Bath 
                      className="h-6 w-6 mb-2"
                      style={{ color: 'var(--cor-primaria)' }}
                    />
                    <span className="text-lg font-semibold">{imovel.banheiros}</span>
                    <span className="text-sm text-gray-500">
                      {imovel.banheiros === 1 ? 'Banheiro' : 'Banheiros'}
                    </span>
                  </div>
                )}
                
                {imovel.vagas !== undefined && (
                  <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-50">
                    <Car 
                      className="h-6 w-6 mb-2"
                      style={{ color: 'var(--cor-primaria)' }}
                    />
                    <span className="text-lg font-semibold">{imovel.vagas}</span>
                    <span className="text-sm text-gray-500">
                      {imovel.vagas === 1 ? 'Vaga' : 'Vagas'}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Tabs de conteúdo */}
              <Tabs 
                defaultValue="descricao" 
                value={activeTab}
                onValueChange={setActiveTab}
                className="mb-8"
              >
                <TabsList 
                  className="w-full flex mb-6 bg-transparent border-b"
                  style={{ borderColor: 'var(--cor-secundaria)' }}
                >
                  <TabsTrigger 
                    value="descricao"
                    className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
                    style={{ 
                      '--primary': 'var(--cor-primaria)',
                      fontFamily: 'var(--fonte-titulos)'
                    } as React.CSSProperties}
                  >
                    Descrição
                  </TabsTrigger>
                  <TabsTrigger 
                    value="localizacao"
                    className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
                    style={{ 
                      '--primary': 'var(--cor-primaria)',
                      fontFamily: 'var(--fonte-titulos)'
                    } as React.CSSProperties}
                  >
                    Localização
                  </TabsTrigger>
                  <TabsTrigger 
                    value="avaliacoes"
                    className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
                    style={{ 
                      '--primary': 'var(--cor-primaria)',
                      fontFamily: 'var(--fonte-titulos)'
                    } as React.CSSProperties}
                  >
                    Avaliações ({avaliacoes.length})
                  </TabsTrigger>
                </TabsList>
