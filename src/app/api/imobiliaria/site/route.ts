import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { SiteGenerator } from '@/lib/site-generator';
import { TipoPagina, StatusSite } from '@prisma/client';

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
    let subdominio = subdominioSugerido;
    if (!subdominio) {
      subdominio = SiteGenerator.gerarSubdominio(nome);
    }

    // Verificar se o subdomínio já existe
    const siteDuplicado = await prisma.imobiliariaSite.findUnique({
      where: { subdominio }
    });

    if (siteDuplicado) {
      return NextResponse.json({ 
        error: 'Este subdomínio já está em uso. Por favor, escolha outro.' 
      }, { status: 400 });
    }

    // Criar o site
    const novoSite = await prisma.imobiliariaSite.create({
      data: {
        nome,
        descricao,
        subdominio,
        imobiliariaId,
        templateId,
        corPrimaria: corPrimaria || '#25D366',
        corSecundaria: corSecundaria || '#F8FAFC',
        corAcentuacao: corAcentuacao || '#FFB800',
        corTexto: corTexto || '#1A202C',
        fonteTitulos: fonteTitulos || 'Inter',
        fonteCorpo: fonteCorpo || 'Inter',
        logoUrl,
        status: StatusSite.RASCUNHO
      }
    });

    // Criar páginas selecionadas
    if (paginasSelecionadas && Array.isArray(paginasSelecionadas)) {
      // Sempre inclui HOME como primeira página
      if (!paginasSelecionadas.includes(TipoPagina.HOME)) {
        paginasSelecionadas.unshift(TipoPagina.HOME);
      }

      for (let i = 0; i < paginasSelecionadas.length; i++) {
        const tipoPagina = paginasSelecionadas[i];
        const tituloPagina = this.obterTituloPagina(tipoPagina);
        const slugPagina = this.obterSlugPagina(tipoPagina);
        
        // Gerar conteúdo com IA para cada página
        let conteudoGerado = null;
        try {
          if (dadosAdicionais) {
            conteudoGerado = await SiteGenerator.gerarConteudoPagina(
              tipoPagina,
              {
                nome: nome,
                descricao: descricao,
                cidade: dadosAdicionais.cidade,
                estado: dadosAdicionais.estado,
                nicho: dadosAdicionais.nicho,
                diferenciais: dadosAdicionais.diferenciais
              },
              {
                tom: dadosAdicionais.tom || 'profissional'
              }
            );
          }
        } catch (error) {
          console.error(`Erro ao gerar conteúdo para página ${tipoPagina}:`, error);
          // Continua mesmo com erro na geração de conteúdo
        }
        
        await prisma.imobiliariaSitePagina.create({
          data: {
            titulo: tituloPagina,
            slug: slugPagina,
            tipo: tipoPagina,
            siteId: novoSite.id,
            ordem: i,
            exibirNoMenu: tipoPagina !== TipoPagina.IMOVEL_SINGLE && 
                         tipoPagina !== TipoPagina.PRIVACIDADE && 
                         tipoPagina !== TipoPagina.TERMOS,
            exibirNoRodape: tipoPagina === TipoPagina.PRIVACIDADE || 
                           tipoPagina === TipoPagina.TERMOS,
            conteudo: conteudoGerado
          }
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      site: novoSite 
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

    // Buscar sites da imobiliária
    const sites = await prisma.imobiliariaSite.findMany({
      where: { imobiliariaId },
      include: {
        template: true,
        paginas: {
          select: {
            id: true,
            titulo: true,
            slug: true,
            tipo: true,
            ativa: true,
            exibirNoMenu: true
          }
        }
      },
      orderBy: { criadoEm: 'desc' }
    });

    return NextResponse.json({ sites });

  } catch (error) {
    console.error('Erro ao listar sites:', error);
    return NextResponse.json({ error: 'Erro ao listar sites' }, { status: 500 });
  }
}

// Função auxiliar para obter título da página com base no tipo
obterTituloPagina(tipo: TipoPagina): string {
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
obterSlugPagina(tipo: TipoPagina): string {
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
