import React, { useState } from 'react';
import { Header1 } from '../headers/header-1';
import { Header2 } from '../headers/header-2';
import { Footer1 } from '../footers/footer-1';
import { Footer2 } from '../footers/footer-2';
import { ImovelCard1 } from '../cards/card-1';
import { ImovelCard2 } from '../cards/card-2';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import Link from 'next/link';
import { Search, MapPin, Filter, Grid, List, Home, BedDouble, Bath, Maximize, X, ArrowUpDown, ChevronDown } from 'lucide-react';
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

interface ImoveisPageProps {
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
  
  // Dados (opcionais)
  imoveis?: Imovel[];
}

export function ImoveisPage({
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
  imoveis = []
}: ImoveisPageProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'todos' | 'venda' | 'aluguel'>('todos');
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Mock de dados para imóveis se não forem fornecidos
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
    },
    {
      id: '5',
      titulo: 'Cobertura duplex com terraço',
      endereco: 'Moema, São Paulo - SP',
      preco: 1800000,
      tipo: 'venda',
      categoria: 'Cobertura',
      quartos: 3,
      banheiros: 4,
      areaTotal: 200,
      imagemUrl: '/images/properties/penthouse.jpg',
      destaque: true
    },
    {
      id: '6',
      titulo: 'Kitnet mobiliada pronta para morar',
      endereco: 'Consolação, São Paulo - SP',
      preco: 1800,
      tipo: 'aluguel',
      categoria: 'Kitnet',
      quartos: 1,
      banheiros: 1,
      areaTotal: 35,
      imagemUrl: '/images/properties/studio.jpg',
      destaque: false
    }
  ];

  const imoveisToShow = imoveis.length > 0 ? imoveis : mockImoveis;
  
  // Filtragem básica por tipo (venda/aluguel/todos)
  const filteredImoveis = activeTab === 'todos' 
    ? imoveisToShow 
    : imoveisToShow.filter(imovel => imovel.tipo === activeTab);

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

  // Renderiza os cards de imóveis baseados no tipo selecionado
  const renderImovelCard = (imovel: Imovel) => {
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
      
      {/* Banner com título da página */}
      <section className="relative py-16 bg-gray-900">
        <div className="absolute inset-0 z-0 opacity-30">
          <Image
            src="/images/properties-bg.jpg"
            alt="Imóveis"
            fill
            className="object-cover"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 
              className="text-3xl md:text-4xl font-bold mb-4 text-white"
              style={{ fontFamily: 'var(--fonte-titulos)' }}
            >
              Imóveis disponíveis
            </h1>
            <p className="text-lg text-gray-200">
              Encontre o imóvel que melhor atende às suas necessidades
            </p>
          </div>
        </div>
      </section>
      
      {/* Área de busca e filtros */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          {/* Barra de busca principal */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input 
                  placeholder="Buscar por localização, tipo de imóvel..." 
                  className="pl-10 h-12 rounded-full" 
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                className="md:min-w-[120px] h-12 rounded-full"
                style={{ 
                  backgroundColor: 'var(--cor-primaria)',
                  color: 'white'
                }}
              >
                Buscar
              </Button>
              
              <Button 
                variant="outline" 
                className="h-12 px-4 rounded-full md:hidden"
                onClick={() => setFiltersOpen(!filtersOpen)}
              >
                <Filter className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Tabs para tipo de imóvel */}
          <Tabs 
            defaultValue="todos"
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as 'todos' | 'venda' | 'aluguel')}
            className="mb-6"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <TabsList className="bg-gray-100">
                <TabsTrigger 
                  value="todos"
                  className="data-[state=active]:bg-white data-[state=active]:text-primary"
                  style={{ 
                    '--primary': 'var(--cor-primaria)',
                    fontFamily: 'var(--fonte-titulos)'
                  } as React.CSSProperties}
                >
                  Todos
                </TabsTrigger>
                <TabsTrigger 
                  value="venda"
                  className="data-[state=active]:bg-white data-[state=active]:text-primary"
                  style={{ 
                    '--primary': 'var(--cor-primaria)',
                    fontFamily: 'var(--fonte-titulos)'
                  } as React.CSSProperties}
                >
                  Venda
                </TabsTrigger>
                <TabsTrigger 
                  value="aluguel"
                  className="data-[state=active]:bg-white data-[state=active]:text-primary"
                  style={{ 
                    '--primary': 'var(--cor-primaria)',
                    fontFamily: 'var(--fonte-titulos)'
                  } as React.CSSProperties}
                >
                  Aluguel
                </TabsTrigger>
              </TabsList>
              
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={cn(
                    "px-3", 
                    viewMode === 'grid' && "bg-gray-100"
                  )}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={cn(
                    "px-3", 
                    viewMode === 'list' && "bg-gray-100"
                  )}
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {/* Filtros móveis (exibidos em telas pequenas) */}
            <motion.div 
              initial={false}
              animate={filtersOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
              className="overflow-hidden md:hidden"
            >
              <div className="pt-4 pb-2 space-y-4">
                <div>
                  <Label>Preço</Label>
                  <div className="flex gap-2 mt-2">
                    <Input placeholder="Mínimo" className="flex-1" />
                    <Input placeholder="Máximo" className="flex-1" />
                  </div>
                </div>
                
                <div>
                  <Label>Quartos</Label>
                  <Select defaultValue="any">
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Qualquer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Qualquer</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Tipo de imóvel</Label>
                  <Select defaultValue="any">
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Qualquer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Qualquer</SelectItem>
                      <SelectItem value="apartamento">Apartamento</SelectItem>
                      <SelectItem value="casa">Casa</SelectItem>
                      <SelectItem value="comercial">Comercial</SelectItem>
                      <SelectItem value="terreno">Terreno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  className="w-full"
                  style={{ 
                    backgroundColor: 'var(--cor-primaria)',
                    color: 'white'
                  }}
                >
                  Aplicar filtros
                </Button>
              </div>
              
              <Separator className="my-4" />
            </motion.div>
          </Tabs>
        </div>
      </section>
      
      {/* Listagem de imóveis */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex">
            {/* Filtros laterais (visíveis apenas em telas maiores) */}
            <div className="hidden md:block w-64 mr-8 flex-shrink-0">
              <div className="sticky top-24 bg-white rounded-xl shadow-sm p-5 border">
                <h3 
                  className="text-lg font-semibold mb-4"
                  style={{ 
                    color: 'var(--cor-texto)', 
                    fontFamily: 'var(--fonte-titulos)'
                  }}
                >
                  Filtros
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Preço</h4>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input placeholder="Mín" className="flex-1" />
                        <Input placeholder="Máx" className="flex-1" />
                      </div>
                      <Slider 
                        defaultValue={[0, 100]} 
                        max={100} 
                        step={1}
                        className="py-2"
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-3">Quartos</h4>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <Badge 
                          key={num}
                          variant="outline" 
                          className="rounded-full px-3 py-1 cursor-pointer hover:bg-primary hover:text-white hover:border-primary"
                          style={{ 
                            '--primary': 'var(--cor-primaria)',
                            fontFamily: 'var(--fonte-titulos)'
                          } as React.CSSProperties}
                        >
                          {num === 5 ? '5+' : num}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-3">Banheiros</h4>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4].map((num) => (
                        <Badge 
                          key={num}
                          variant="outline" 
                          className="rounded-full px-3 py-1 cursor-pointer hover:bg-primary hover:text-white hover:border-primary"
                          style={{ 
                            '--primary': 'var(--cor-primaria)',
                            fontFamily: 'var(--fonte-titulos)'
                          } as React.CSSProperties}
                        >
                          {num === 4 ? '4+' : num}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-3">Tipo de imóvel</h4>
                    <div className="space-y-2">
                      {['Apartamento', 'Casa', 'Comercial', 'Terreno', 'Cobertura', 'Rural'].map((tipo) => (
                        <div key={tipo} className="flex items-center space-x-2">
                          <Checkbox id={`tipo-${tipo.toLowerCase()}`} />
                          <label 
                            htmlFor={`tipo-${tipo.toLowerCase()}`}
                            className="text-sm cursor-pointer"
                          >
                            {tipo}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-3">Características</h4>
                    <div className="space-y-2">
                      {['Piscina', 'Academia', 'Churrasqueira', 'Segurança 24h', 'Garagem'].map((caract) => (
                        <div key={caract} className="flex items-center space-x-2">
                          <Checkbox id={`caract-${caract.toLowerCase().replace(/\s/g, '-')}`} />
                          <label 
                            htmlFor={`caract-${caract.toLowerCase().replace(/\s/g, '-')}`}
                            className="text-sm cursor-pointer"
                          >
                            {caract}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-4"
                    style={{ 
                      backgroundColor: 'var(--cor-primaria)',
                      color: 'white'
                    }}
                  >
                    Aplicar filtros
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Listagem de imóveis */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">
                  Exibindo <strong>{filteredImoveis.length}</strong> imóveis
                </p>
                
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-sm text-gray-600">Ordenar por:</span>
                  <Select defaultValue="relevancia">
                    <SelectTrigger className="w-[180px] h-9">
                      <SelectValue placeholder="Relevância" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevancia">Relevância</SelectItem>
                      <SelectItem value="preco-menor">Menor preço</SelectItem>
                      <SelectItem value="preco-maior">Maior preço</SelectItem>
                      <SelectItem value="recentes">Mais recentes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {filteredImoveis.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg">
                  <h3 
                    className="text-lg font-semibold mb-2"
                    style={{ 
                      color: 'var(--cor-texto)', 
                      fontFamily: 'var(--fonte-titulos)'
                    }}
                  >
                    Nenhum imóvel encontrado
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Tente ajustar seus filtros para encontrar mais opções
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('todos')}
                  >
                    Limpar filtros
                  </Button>
                </div>
              ) : (
                <div className={cn(
                  viewMode === 'grid' 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                    : "space-y-4"
                )}>
                  {filteredImoveis.map((imovel) => (
                    <div key={imovel.id}>
                      {renderImovelCard(imovel)}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Paginação */}
              {filteredImoveis.length > 0 && (
                <div className="flex justify-center mt-12">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="w-10 h-10 rounded-md"
                    >
                      &lt;
                    </Button>
                    {[1, 2, 3, 4, 5].map((page) => (
                      <Button 
                        key={page}
                        variant={page === 1 ? "default" : "outline"}
                        size="icon"
                        className="w-10 h-10 rounded-md"
                        style={page === 1 ? { 
                          backgroundColor: 'var(--cor-primaria)',
                          color: 'white'
                        } : {}}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="w-10 h-10 rounded-md"
                    >
                      &gt;
                    </Button>
                  </div>
                </div>
              )}
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
