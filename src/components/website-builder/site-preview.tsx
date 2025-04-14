import React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Header1, 
  Header2, 
  Footer1, 
  Footer2, 
  Card1, 
  Card2, 
  Cta1, 
  Cta2, 
  Grid1, 
  Grid2,
  HomePage,
  ImoveisPage,
  ImovelSingle,
  AtendimentoPage,
  SobrePage
} from '@/components/website-templates';
import { Laptop, Smartphone, ExternalLink, RefreshCw } from 'lucide-react';

// Tipo para os dados da imobiliária
interface ImobiliariaData {
  id?: string;
  nome: string;
  descricao: string;
  missao?: string;
  visao?: string;
  valores?: string[];
  historia?: string;
  telefone: string;
  email?: string;
  endereco: string;
  cnpj: string;
  creci: string;
  anoFundacao?: number;
}

// Tipos de aparelhos para visualização
type ViewportType = 'desktop' | 'mobile';

interface SitePreviewProps {
  // Informações da imobiliária
  imobiliariaData: ImobiliariaData;
  nomeSite: string;
  logoUrl?: string;
  
  // Estilos escolhidos
  corPrimaria: string;
  corSecundaria: string;
  corAcentuacao: string;
  corTexto: string;
  fonteTitulos: string;
  fonteCorpo: string;
  
  // Templates selecionados
  selectedHeader: 'header-1' | 'header-2';
  selectedFooter: 'footer-1' | 'footer-2';
  selectedCard: 'card-1' | 'card-2';
  selectedCta: 'cta-1' | 'cta-2';
  selectedGrid: 'grid-1' | 'grid-2';
}

export function SitePreview({
  imobiliariaData,
  nomeSite,
  logoUrl = '/images/logo-placeholder.svg',
  corPrimaria,
  corSecundaria,
  corAcentuacao,
  corTexto,
  fonteTitulos,
  fonteCorpo,
  selectedHeader,
  selectedFooter,
  selectedCard,
  selectedCta,
  selectedGrid
}: SitePreviewProps) {
  // Estado para controlar o tipo de dispositivo para a visualização
  const [viewportType, setViewportType] = useState<ViewportType>('desktop');
  
  // Estado para controlar a página que está sendo visualizada
  const [currentPage, setCurrentPage] = useState<string>('home');
  
  // Mock data para imóveis
  const mockImoveis = [
    {
      id: '1',
      titulo: 'Apartamento Moderno',
      descricao: 'Lindo apartamento com acabamento de alto padrão...',
      fotoPrincipal: '/images/imovel-1.jpg',
      fotos: ['/images/imovel-1.jpg', '/images/imovel-2.jpg'],
      valor: 450000,
      tipoOperacao: 'venda',
      tipo: 'apartamento',
      quartos: 3,
      banheiros: 2,
      area: 85,
      vagas: 1,
      rua: 'Rua das Flores',
      numero: '123',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567',
      adicionais: [
        { id: '1', nome: 'Piscina' },
        { id: '2', nome: 'Academia' },
        { id: '3', nome: 'Churrasqueira' },
      ],
      imobiliariaId: imobiliariaData.id || '1'
    },
    {
      id: '2',
      titulo: 'Casa em Condomínio',
      descricao: 'Excelente casa em condomínio fechado...',
      fotoPrincipal: '/images/imovel-2.jpg',
      fotos: ['/images/imovel-2.jpg', '/images/imovel-1.jpg'],
      valor: 750000,
      tipoOperacao: 'venda',
      tipo: 'casa',
      quartos: 4,
      banheiros: 3,
      area: 180,
      vagas: 2,
      rua: 'Rua dos Ipês',
      numero: '456',
      bairro: 'Jardim Europa',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '04567-890',
      adicionais: [
        { id: '4', nome: 'Piscina' },
        { id: '5', nome: 'Churrasqueira' },
        { id: '6', nome: 'Segurança 24h' },
      ],
      imobiliariaId: imobiliariaData.id || '1'
    },
    {
      id: '3',
      titulo: 'Sala Comercial',
      descricao: 'Sala comercial em localização privilegiada...',
      fotoPrincipal: '/images/imovel-3.jpg',
      fotos: ['/images/imovel-3.jpg', '/images/imovel-1.jpg'],
      valor: 2500,
      tipoOperacao: 'aluguel',
      tipo: 'comercial',
      area: 60,
      vagas: 1,
      rua: 'Av. Paulista',
      numero: '789',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01310-100',
      adicionais: [
        { id: '7', nome: 'Recepção' },
        { id: '8', nome: 'Segurança' },
        { id: '9', nome: 'Elevador' },
      ],
      imobiliariaId: imobiliariaData.id || '1'
    }
  ];
  
  // Mock para avaliações de imóveis
  const mockAvaliacoes = [
    {
      id: '1',
      titulo: 'Ótimo imóvel',
      descricao: 'Localização excelente e estrutura bem conservada',
      nota: 5,
      usuarioId: '1',
      usuario: { nome: 'Carlos Silva', email: 'carlos@example.com' },
      imovelId: '1',
      createdAt: new Date('2023-07-15')
    },
    {
      id: '2',
      titulo: 'Bom custo-benefício',
      descricao: 'Boa localização com preço justo para a região',
      nota: 4,
      usuarioId: '2',
      usuario: { nome: 'Ana Costa', email: 'ana@example.com' },
      imovelId: '1',
      createdAt: new Date('2023-08-23')
    }
  ];
  
  // Mock para equipe
  const mockEquipe = [
    {
      id: '1',
      nome: 'Roberto Martins',
      cargo: 'Diretor',
      foto: '/images/team-1.jpg',
      descricao: 'Mais de 15 anos de experiência no mercado imobiliário',
      contato: {
        email: 'roberto@example.com',
        linkedin: 'https://linkedin.com/in/robertomartins'
      }
    },
    {
      id: '2',
      nome: 'Maria Oliveira',
      cargo: 'Corretora',
      foto: '/images/team-2.jpg',
      descricao: 'Especialista em imóveis de alto padrão',
      contato: {
        email: 'maria@example.com',
        linkedin: 'https://linkedin.com/in/mariaoliveira'
      }
    },
    {
      id: '3',
      nome: 'Pedro Santos',
      cargo: 'Gerente Comercial',
      foto: '/images/team-3.jpg',
      descricao: 'Responsável pela equipe de vendas e atendimento ao cliente',
      contato: {
        email: 'pedro@example.com',
        linkedin: 'https://linkedin.com/in/pedrosantos'
      }
    }
  ];
  
  // Props comuns para todos os componentes
  const commonProps = {
    imobiliariaInfo: {
      ...imobiliariaData,
      nome: imobiliariaData.nome,
      descricao: imobiliariaData.descricao,
      telefone: imobiliariaData.telefone,
      endereco: imobiliariaData.endereco,
      creci: imobiliariaData.creci,
      cnpj: imobiliariaData.cnpj
    },
    nomeSite,
    logoUrl,
    corPrimaria,
    corSecundaria,
    corAcentuacao,
    corTexto,
    fonteTitulos,
    fonteCorpo,
    headerType: selectedHeader,
    footerType: selectedFooter,
  };
  
  // Renderiza o conteúdo da prévia com base na página selecionada
  const renderPreviewContent = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage 
            {...commonProps}
            imoveis={mockImoveis}
            cardType={selectedCard}
            ctaType={selectedCta}
            gridType={selectedGrid}
          />
        );
      case 'imoveis':
        return (
          <ImoveisPage 
            {...commonProps}
            imoveis={mockImoveis}
            cardType={selectedCard}
          />
        );
      case 'imovel':
        return (
          <ImovelSingle 
            {...commonProps}
            imovel={mockImoveis[0]}
            imoveisRelacionados={mockImoveis.slice(1)}
            avaliacoes={mockAvaliacoes}
          />
        );
      case 'atendimento':
        return (
          <AtendimentoPage 
            {...commonProps}
          />
        );
      case 'sobre':
        return (
          <SobrePage 
            {...commonProps}
            equipe={mockEquipe}
          />
        );
      default:
        return (
          <HomePage 
            {...commonProps}
            imoveis={mockImoveis}
            cardType={selectedCard}
            ctaType={selectedCta}
            gridType={selectedGrid}
          />
        );
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 px-1">
        <Tabs defaultValue="home" value={currentPage} onValueChange={setCurrentPage}>
          <TabsList>
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="imoveis">Imóveis</TabsTrigger>
            <TabsTrigger value="imovel">Detalhes do Imóvel</TabsTrigger>
            <TabsTrigger value="atendimento">Atendimento</TabsTrigger>
            <TabsTrigger value="sobre">Sobre</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className={viewportType === 'desktop' ? 'bg-muted' : ''}
            onClick={() => setViewportType('desktop')}
          >
            <Laptop className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className={viewportType === 'mobile' ? 'bg-muted' : ''}
            onClick={() => setViewportType('mobile')}
          >
            <Smartphone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Atualizar">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="border rounded-lg flex-1 overflow-hidden relative">
        <div className="absolute inset-0 bg-gray-200 p-4 flex justify-center">
          <div 
            className={`bg-white h-full overflow-hidden transition-all transform origin-top ${
              viewportType === 'mobile' ? 'w-[375px]' : 'w-full'
            }`}
            style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}
          >
            <ScrollArea className="h-full">
              {renderPreviewContent()}
            </ScrollArea>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <Button variant="outline" size="sm" className="gap-2">
          <ExternalLink className="h-4 w-4" />
          Abrir em nova aba
        </Button>
      </div>
    </div>
  );
}
