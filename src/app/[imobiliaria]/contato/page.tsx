import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Metadata } from 'next';
import ImobiliariaHomeClient from '@/components/website-templates/imobiliaria-home-client';

// Função para gerar metadados dinâmicos
export async function generateMetadata({
  params,
}: {
  params: { imobiliaria: string };
}): Promise<Metadata> {
  // Acessando params de forma segura no Next.js
  const imobiliaria = params?.imobiliaria;
  
  try {
    // Buscar o site pelo subdomínio
    const site = await prisma.imobiliariaSite.findFirst({
      where: {
        subdominio: imobiliaria
      },
      include: {
        imobiliaria: true
      }
    });

    if (!site) {
      return {
        title: 'Contato - Site não encontrado',
        description: 'A página de contato requisitada não foi encontrada.'
      };
    }

    return {
      title: `Contato - ${site.nome}`,
      description: `Entre em contato com ${site.nome}. ${site.descricao || ''}`
    };
  } catch (error) {
    console.error('Erro ao buscar metadados:', error);
    return {
      title: 'Erro ao carregar a página de contato',
      description: 'Ocorreu um erro ao tentar carregar as informações da página.'
    };
  }
}

// Componente servidor assíncrono
export default async function ImobiliariaContatoPage({
  params,
}: {
  params: { imobiliaria: string };
}) {
  // Acessando params de forma segura no Next.js
  const imobiliariaSlug = params?.imobiliaria;
  console.log('Renderizando página de contato para imobiliária:', imobiliariaSlug);
  
  try {
    // Buscar dados do site no banco de dados
    const site = await prisma.imobiliariaSite.findFirst({
      where: {
        subdominio: imobiliariaSlug
      },
      include: {
        imobiliaria: true,
        template: true
      }
    });
    
    if (!site) {
      console.log('Site não encontrado:', imobiliariaSlug);
      return notFound();
    }
    
    // Buscar imóveis da imobiliária para mostrar no footer ou em seções relacionadas
    const imoveis = await prisma.imovel.findMany({
      where: {
        imobiliariaId: site.imobiliariaId,
        status: 'ATIVO'
      },
      include: {
        fotos: true // Corrigido para usar fotos em vez de imagens, conforme o modelo Prisma
      },
      take: 3 // Menos imóveis para a página de contato
    });
    
    // Formatar os dados para passar ao cliente
    const siteData = {
      id: site.id,
      nome: site.nome,
      subdominio: site.subdominio,
      template: site.template.slug,
      corPrimaria: site.corPrimaria,
      corSecundaria: site.corSecundaria,
      corAcentuacao: site.corAcentuacao || undefined, // Converter null para undefined
      corTexto: site.corTexto || undefined, // Converter null para undefined
      fonteTitulos: site.fonteTitulos,
      fonteCorpo: site.fonteCorpo,
      logoUrl: site.logoUrl || undefined, // Converter null para undefined
      paginaAtual: 'contato', // Indicar qual página está ativa
      imobiliaria: {
        nome: (site.imobiliaria as any).nome || 'Imobiliária', // Usar casting para acessar o nome
        telefone: site.imobiliaria.telefone || undefined, // Converter null para undefined
        endereco: site.imobiliaria.endereco || undefined, // Converter null para undefined
        email: '',
        whatsapp: '',
        cnpj: site.imobiliaria.cnpj || undefined // Converter null para undefined
      },
      imoveis: imoveis.map(imovel => ({
        id: imovel.id,
        titulo: imovel.titulo,
        descricao: imovel.descricao,
        precoVenda: imovel.valor,
        precoLocacao: (imovel as any).valorLocacao,
        tipo: String(imovel.tipoImovel), // Converter enum para string
        operacao: String(imovel.tipoOperacao), // Converter enum para string
        endereco: `${imovel.endereco || ''}, ${imovel.numero || ''}, ${imovel.bairro || ''}, ${imovel.cidade || ''}/${imovel.estado || ''}`,
        area: (imovel as any).areaTotal || (imovel as any).areaConstruida,
        quartos: imovel.quartos || undefined, // Converter null para undefined
        banheiros: imovel.banheiros || undefined, // Converter null para undefined
        vagas: imovel.vagas || undefined, // Converter null para undefined
        imagens: imovel.fotos.map(img => ({
          url: img.url,
          destaque: img.legenda === 'destaque' // Ajustando para o formato das fotos
        })),
        imagemDestaque: imovel.fotos.find(img => img.legenda === 'destaque')?.url || 
                      (imovel.fotos.length > 0 ? imovel.fotos[0].url : '/placeholder-imovel.jpg')
      }))
    };
    
    // Renderizar o componente cliente com os dados do servidor
    return <ImobiliariaHomeClient siteData={siteData} />;
    
  } catch (error) {
    console.error('Erro ao buscar dados da página de contato:', error);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Erro</h1>
        <p className="text-gray-600 mb-4">Não foi possível carregar os dados da página de contato</p>
      </div>
    );
  }
}
