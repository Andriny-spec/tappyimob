'use client';

import React, { useState, useEffect } from 'react';
import { HomePage } from '@/components/website-templates/pages/home-page';
import { notFound } from 'next/navigation';

// Mock de dados da imobiliária para teste
const mockImobiliaria = {
  id: '1',
  nome: 'Imobiliária Modelo',
  descricao: 'Sua imobiliária de confiança, especializada em imóveis de alto padrão.',
  telefone: '(11) 99999-9999',
  endereco: 'Av. Paulista, 1000, São Paulo - SP',
  cnpj: '12.345.678/0001-90',
  creci: 'J-12345',
  // Dados opcionais
  missao: 'Realizar sonhos através de negócios imobiliários seguros e transparentes.',
  visao: 'Ser referência em excelência e inovação no mercado imobiliário.',
  valores: ['Ética', 'Transparência', 'Compromisso', 'Inovação'],
  historia: 'Fundada em 2010, nossa imobiliária cresceu baseada em princípios sólidos e no compromisso com a satisfação do cliente.'
};

// Mock de imóveis para teste
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
    imobiliariaId: '1'
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
    imobiliariaId: '1'
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
    imobiliariaId: '1'
  }
];

export default function ImobiliariaHomePage({ params }: { params: { imobiliaria: string } }) {
  // Coletamos o valor do parâmetro imobiliaria de forma segura
  const paramsData = params;
  const imobiliariaSlug = paramsData.imobiliaria;
  const [isLoading, setIsLoading] = useState(true);
  const [imobiliariaData, setImobiliariaData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Em um cenário real, buscaríamos os dados da imobiliária da API
    const fetchImobiliariaData = async () => {
      try {
        // Simulando uma chamada de API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Por enquanto estamos usando dados mockados
        // No futuro, isso seria uma chamada real à API:
        // const response = await fetch(`/api/imobiliarias/${params.imobiliaria}`);
        // const data = await response.json();
        
        const mockData = {
          ...mockImobiliaria,
          imobiliariaInfo: mockImobiliaria,
          nomeSite: `${mockImobiliaria.nome} - Imóveis`,
          logoUrl: '/images/logo-placeholder.svg',
          corPrimaria: '#25D366',
          corSecundaria: '#F8FAFC',
          corAcentuacao: '#FFB800',
          corTexto: '#1A202C',
          fonteTitulos: 'Inter',
          fonteCorpo: 'Inter',
          headerType: 'header-1',
          footerType: 'footer-1',
          cardType: 'card-1',
          ctaType: 'cta-1',
          gridType: 'grid-1',
          imoveis: mockImoveis
        };
        
        setImobiliariaData(mockData);
        setIsLoading(false);
      } catch (err) {
        console.error('Erro ao buscar dados da imobiliária:', err);
        setError('Não foi possível carregar as informações da imobiliária');
        setIsLoading(false);
      }
    };

    fetchImobiliariaData();
  }, [imobiliariaSlug]);

  // Mostra uma página 404 se a imobiliária não for encontrada
  if (!isLoading && !imobiliariaData && !error) {
    return notFound();
  }

  // Estado de carregamento
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-xl">Carregando site...</p>
        </div>
      </div>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro</h1>
          <p className="mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Renderiza o componente HomePage com os dados da imobiliária
  return (
    <HomePage 
      imobiliariaInfo={imobiliariaData.imobiliariaInfo}
      nomeSite={imobiliariaData.nomeSite}
      logoUrl={imobiliariaData.logoUrl}
      corPrimaria={imobiliariaData.corPrimaria}
      corSecundaria={imobiliariaData.corSecundaria}
      corAcentuacao={imobiliariaData.corAcentuacao}
      corTexto={imobiliariaData.corTexto}
      fonteTitulos={imobiliariaData.fonteTitulos}
      fonteCorpo={imobiliariaData.fonteCorpo}
      headerType={imobiliariaData.headerType}
      footerType={imobiliariaData.footerType}
      cardType={imobiliariaData.cardType}
      ctaType={imobiliariaData.ctaType}
      gridType={imobiliariaData.gridType}
      imoveisDestaque={imobiliariaData.imoveis}
    />
  );
}
