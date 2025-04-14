'use client';

import React, { useState, useEffect } from 'react';
import { SingleImovelPage } from '@/components/website-templates/pages/single-imovel-page';
import { notFound } from 'next/navigation';

// Dados de exemplo para um imóvel
const mockImovelData = {
  id: '1',
  titulo: 'Apartamento de Luxo no Centro',
  descricao: 'Um incrível apartamento de 3 quartos com vista panorâmica para a cidade. Totalmente reformado com acabamentos de luxo. Localizado próximo a todos os serviços essenciais e transporte público.',
  preco: 850000,
  tipo: 'venda',
  categoria: 'Apartamento',
  area: 120,
  quartos: 3,
  banheiros: 2,
  vagas: 2,
  imagemUrl: 'https://placehold.co/800x600/png',
  imagens: [
    'https://placehold.co/800x600/png',
    'https://placehold.co/800x600/png',
    'https://placehold.co/800x600/png',
    'https://placehold.co/800x600/png'
  ],
  caracteristicas: [
    'Varanda gourmet',
    'Piscina',
    'Academia',
    'Segurança 24h',
    'Área de lazer completa',
    'Perto de transporte público'
  ],
  endereco: {
    rua: 'Rua das Flores',
    numero: '123',
    complemento: 'Apto 1001',
    bairro: 'Centro',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234-567',
    coordenadas: {
      latitude: -23.5505,
      longitude: -46.6333
    }
  },
  avaliacoes: [
    {
      id: '1',
      autor: 'João Silva',
      comentario: 'Excelente imóvel, muito bem localizado e com ótimo acabamento.',
      nota: 5,
      data: '2023-12-10'
    },
    {
      id: '2',
      autor: 'Maria Oliveira',
      comentario: 'Ótima experiência com a imobiliária, muito atenciosos.',
      nota: 4,
      data: '2023-11-15'
    }
  ]
};

export default function ImobiliariaImovelSinglePage({ 
  params 
}: { 
  params: { imobiliaria: string, id: string } 
}) {
  // Coletamos os valores dos parâmetros de forma segura
  const paramsData = params;
  const imobiliariaSlug = paramsData.imobiliaria;
  const imovelId = paramsData.id;
  
  const [isLoading, setIsLoading] = useState(true);
  const [imobiliariaData, setImobiliariaData] = useState<any>(null);
  const [imovelData, setImovelData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Em produção, aqui faríamos uma chamada à API real
        setIsLoading(true);
        
        // Simula um atraso de rede
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data para imobiliária
        setImobiliariaData({
          imobiliariaInfo: {
            telefone: '(11) 99999-9999',
            endereco: 'Rua das Imobiliárias, 123 - São Paulo, SP',
            cnpj: '12.345.678/0001-90',
            creci: '12345-J',
            descricao: 'Somos uma imobiliária comprometida com a excelência e satisfação dos nossos clientes.'
          },
          nomeSite: 'Exemplo Imobiliária',
          logoUrl: 'https://placehold.co/200x80/png',
          corPrimaria: '#25D366',
          corSecundaria: '#F8FAFC',
          corAcentuacao: '#FFB800',
          corTexto: '#1A202C',
          fonteTitulos: 'Raleway',
          fonteCorpo: 'Inter',
          headerType: 'header-1',
          footerType: 'footer-1',
          cardType: 'card-1',
          ctaType: 'cta-1',
          gridType: 'grid-1'
        });
        
        // Usa o mockImovelData como exemplo
        setImovelData(mockImovelData);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Não foi possível carregar os dados da imobiliária.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [imobiliariaSlug, imovelId]);

  // Mostra uma página 404 se a imobiliária ou imóvel não for encontrado
  if (!isLoading && (!imobiliariaData || !imovelData) && !error) {
    return notFound();
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-500">Erro</h1>
        <p className="mt-2">{error}</p>
      </div>
    );
  }

  return (
    <SingleImovelPage
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
      imovel={imovelData}
      imobiliariaSlug={imobiliariaSlug}
    />
  );
}
