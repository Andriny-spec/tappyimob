import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { SiteGenerator } from '@/lib/site-generator';

// Definir os enums localmente para evitar problemas com a importação do Prisma
// Isso é uma solução temporária até resolver o problema de build com o Prisma
enum TipoPagina {
  HOME = 'HOME',
  IMOVEIS = 'IMOVEIS',
  IMOVEL_SINGLE = 'IMOVEL_SINGLE',
  SOBRE = 'SOBRE',
  CONTATO = 'CONTATO',
  FAQ = 'FAQ',
  BLOG = 'BLOG',
  PRIVACIDADE = 'PRIVACIDADE',
  TERMOS = 'TERMOS',
  CUSTOM = 'CUSTOM'
}

enum StatusSite {
  RASCUNHO = 'RASCUNHO',
  PUBLICADO = 'PUBLICADO',
  MANUTENCAO = 'MANUTENCAO',
  INATIVO = 'INATIVO'
}

// POST - Criar um novo site
export async function POST(request: Request) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const imobiliariaId = session.user.id;

    // Verificar se é uma imobiliária
    const imobiliaria = await prisma.imobiliaria.findUnique({
      where: { id: imobiliariaId }
    });

    if (!imobiliaria) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Obter dados do request
    const dados = await request.json();
    const { 
      nome, 
      descricao, 
      templateId, 
      subdominio: subdominioSugerido,
      corPrimaria,
      corSecundaria,
      corAcentuacao,
      corTexto,
      fonteTitulos,
      fonteCorpo,
      logoUrl,
      paginasSelecionadas,
      dadosAdicionais
    } = dados;

    // Validar campos obrigatórios
    if (!nome || !templateId) {
      return NextResponse.json({ error: 'Informações incompletas' }, { status: 400 });
    }

    // Gerar subdomínio a partir do nome se não for fornecido
    let subdominio = subdominioSugerido || nome.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Verificar se o subdomínio já existe
    const subdominioExistente = await prisma.imobiliariaSite.findFirst({
      where: {
        subdominio
      }
    });

    if (subdominioExistente) {
      // Adicionar um sufixo numérico aleatório para garantir unicidade
      subdominio = `${subdominio}${Math.floor(Math.random() * 1000)}`;
    }

    // Criar o site
    const novoSite = await prisma.imobiliariaSite.create({
      data: {
        nome,
        descricao: descricao || '',
        subdominio,
        imobiliariaId,
        templateId,
        status: StatusSite.RASCUNHO,
        corPrimaria: corPrimaria || '#3b82f6', // Azul como padrão
        corSecundaria: corSecundaria || '#1e3a8a',
        corAcentuacao: corAcentuacao || '#f59e0b',
        corTexto: corTexto || '#111827',
        fonteTitulos: fonteTitulos || 'Montserrat',
        fonteCorpo: fonteCorpo || 'Roboto',
        logoUrl: logoUrl || '',
        // Este campo é ajustado em um utilitário separado porque não estamos usando referências diretas
        metadata: JSON.stringify(dadosAdicionais || {})
      }
    });

    // Criar páginas padrão selecionadas pelo usuário
    const paginasParaCriar = paginasSelecionadas || [TipoPagina.HOME, TipoPagina.IMOVEIS, TipoPagina.CONTATO];
    
    // Criar uma página para cada tipo selecionado
    for (const tipoPagina of paginasParaCriar) {
      await prisma.imobiliariaSitePagina.create({
        data: {
          siteId: novoSite.id,
          tipo: tipoPagina,
          titulo: obterTituloPagina(tipoPagina),
          slug: obterSlugPagina(tipoPagina),
          conteudo: JSON.stringify({
            blocos: []
          }),
          ativa: true,
          ordem: paginasParaCriar.indexOf(tipoPagina) + 1
        }
      });
    }

    // Iniciar geração do site (em segundo plano)
    const siteGenerator = new SiteGenerator(novoSite.id);
    siteGenerator.gerarSite();

    return NextResponse.json({ 
      success: true, 
      site: {
        id: novoSite.id,
        nome: novoSite.nome,
        subdominio: novoSite.subdominio,
        status: novoSite.status
      }
    });

  } catch (error) {
    console.error('Erro ao criar site:', error);
    return NextResponse.json({ error: 'Erro ao criar site' }, { status: 500 });
  }
}

// GET - Listar sites da imobiliária
export async function GET(request: Request) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const imobiliariaId = session.user.id;

    // Verificar se é uma imobiliária
    const imobiliaria = await prisma.imobiliaria.findUnique({
      where: { id: imobiliariaId }
    });

    if (!imobiliaria) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Buscar todos os sites da imobiliária
    const sites = await prisma.imobiliariaSite.findMany({
      where: {
        imobiliariaId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ sites });

  } catch (error) {
    console.error('Erro ao listar sites:', error);
    return NextResponse.json({ error: 'Erro ao listar sites' }, { status: 500 });
  }
}

// Função auxiliar para obter título da página com base no tipo
export function obterTituloPagina(tipo: TipoPagina): string {
  const titulos = {
    [TipoPagina.HOME]: 'Página Inicial',
    [TipoPagina.IMOVEIS]: 'Imóveis',
    [TipoPagina.IMOVEL_SINGLE]: 'Detalhe do Imóvel',
    [TipoPagina.SOBRE]: 'Sobre Nós',
    [TipoPagina.CONTATO]: 'Contato',
    [TipoPagina.FAQ]: 'Dúvidas Frequentes',
    [TipoPagina.BLOG]: 'Blog',
    [TipoPagina.PRIVACIDADE]: 'Política de Privacidade',
    [TipoPagina.TERMOS]: 'Termos e Condições',
    [TipoPagina.CUSTOM]: 'Página Personalizada'
  };
  
  return titulos[tipo] || 'Nova Página';
}

// Função auxiliar para obter slug da página com base no tipo
export function obterSlugPagina(tipo: TipoPagina): string {
  const slugs = {
    [TipoPagina.HOME]: 'home',
    [TipoPagina.IMOVEIS]: 'imoveis',
    [TipoPagina.IMOVEL_SINGLE]: 'imovel',
    [TipoPagina.SOBRE]: 'sobre',
    [TipoPagina.CONTATO]: 'contato',
    [TipoPagina.FAQ]: 'duvidas-frequentes',
    [TipoPagina.BLOG]: 'blog',
    [TipoPagina.PRIVACIDADE]: 'privacidade',
    [TipoPagina.TERMOS]: 'termos',
    [TipoPagina.CUSTOM]: 'pagina-personalizada'
  };
  
  return slugs[tipo] || 'nova-pagina';
}
