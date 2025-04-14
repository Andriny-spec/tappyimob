'use client';

import React, { useState, useEffect } from 'react';
import { AtendimentoPage } from '@/components/website-templates/pages/atendimento-page';
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
};

export default function ImobiliariaAtendimentoPage({ params }: { params: { imobiliaria: string } }) {
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
          <p className="mt-4 text-xl">Carregando página...</p>
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

  // Renderiza o componente AtendimentoPage com os dados da imobiliária
  return (
    <AtendimentoPage 
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
    />
  );
}
