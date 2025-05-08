'use client';

import React from 'react';
import { HomePage } from '@/components/website-templates/pages/home-page';

interface ImobiliariaHomeClientProps {
  siteData: {
    id: string;
    nome: string;
    subdominio: string;
    template: string;
    corPrimaria: string;
    corSecundaria: string;
    corAcentuacao?: string;
    corTexto?: string;
    fonteTitulos: string;
    fonteCorpo: string;
    logoUrl?: string;
    imobiliaria: {
      nome: string;
      telefone?: string;
      endereco?: string;
      email?: string;
      whatsapp?: string;
      cnpj?: string;
    };
    imoveis: Array<{
      id: string;
      titulo: string;
      descricao: string;
      precoVenda?: number;
      precoLocacao?: number;
      tipo: string;
      operacao: string;
      endereco: string;
      area?: number;
      quartos?: number;
      banheiros?: number;
      vagas?: number;
      imagens: Array<{
        url: string;
        destaque?: boolean;
      }>;
      imagemDestaque?: string;
    }>;
  };
}

export default function ImobiliariaHomeClient({ siteData }: ImobiliariaHomeClientProps) {
  // Formatar os dados para o formato esperado pelo componente HomePage
  const formattedData = {
    imobiliariaInfo: {
      id: siteData.id,
      nome: siteData.imobiliaria.nome,
      descricao: '',
      telefone: siteData.imobiliaria.telefone || '',
      endereco: siteData.imobiliaria.endereco || '',
      cnpj: siteData.imobiliaria.cnpj || '',
      creci: '',
      email: siteData.imobiliaria.email || '',
      whatsapp: siteData.imobiliaria.whatsapp || ''
    },
    nomeSite: siteData.nome,
    logoUrl: siteData.logoUrl || '/images/logo-placeholder.svg',
    corPrimaria: siteData.corPrimaria,
    corSecundaria: siteData.corSecundaria,
    corAcentuacao: siteData.corAcentuacao || '#FFB800',
    corTexto: siteData.corTexto || '#1A202C',
    fonteTitulos: siteData.fonteTitulos,
    fonteCorpo: siteData.fonteCorpo,
    headerType: 'header-1',
    footerType: 'footer-1',
    cardType: 'card-1',
    ctaType: 'cta-1',
    gridType: 'grid-1',
    imoveis: siteData.imoveis
  };

  return (
    <HomePage 
      imobiliariaInfo={formattedData.imobiliariaInfo}
      nomeSite={formattedData.nomeSite}
      logoUrl={formattedData.logoUrl}
      corPrimaria={formattedData.corPrimaria}
      corSecundaria={formattedData.corSecundaria}
      corAcentuacao={formattedData.corAcentuacao}
      corTexto={formattedData.corTexto}
      fonteTitulos={formattedData.fonteTitulos}
      fonteCorpo={formattedData.fonteCorpo}
      headerType={formattedData.headerType}
      footerType={formattedData.footerType}
      cardType={formattedData.cardType}
      ctaType={formattedData.ctaType}
      gridType={formattedData.gridType}
      imoveis={formattedData.imoveis}
    />
  );
}
