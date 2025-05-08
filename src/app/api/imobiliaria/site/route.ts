import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { SiteGenerator } from '@/lib/site-generator-instance';

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

    // Buscar informações detalhadas da imobiliária para usar o username
    const imobiliariaDetalhes = await prisma.imobiliaria.findUnique({
      where: { id: imobiliariaId },
      include: { user: true }
    });
    
    if (!imobiliariaDetalhes || !imobiliariaDetalhes.user) {
      return NextResponse.json({ error: 'Informações da imobiliária incompletas' }, { status: 400 });
    }
    
    // Gerar subdomínio com base em diferentes opções, em ordem de prioridade:
    // 1. Subdomínio sugerido pelo usuário
    // 2. Username da imobiliária
    // 3. Nome da imobiliária
    // 4. Nome do site
    let subdominio = subdominioSugerido || 
                    (imobiliariaDetalhes.user.username ? imobiliariaDetalhes.user.username.toLowerCase().replace(/[^a-z0-9]/g, '') : null) || 
                    (imobiliariaDetalhes.user.nome ? imobiliariaDetalhes.user.nome.toLowerCase().replace(/[^a-z0-9]/g, '') : null) || 
                    nome.toLowerCase().replace(/[^a-z0-9]/g, '');

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
        logoUrl: logoUrl || ''
        // O campo metadata não existe no modelo ImobiliariaSite
        // Os dadosAdicionais serão armazenados em outro lugar
      }
    });

    // Criar páginas padrão selecionadas pelo usuário
    // Mapeamento dos IDs do frontend para valores do enum TipoPagina
    const paginasMapeamento: {[key: string]: TipoPagina} = {
      'home': TipoPagina.HOME,
      'imovel': TipoPagina.IMOVEL_SINGLE,
      'imoveis': TipoPagina.IMOVEIS,
      'sobre': TipoPagina.SOBRE,
      'contato': TipoPagina.CONTATO,
      'privacidade': TipoPagina.PRIVACIDADE,
      'termos': TipoPagina.TERMOS,
      'blog': TipoPagina.BLOG,
      'faq': TipoPagina.FAQ,
      'avaliacoes': TipoPagina.CUSTOM,
      'parceiros': TipoPagina.CUSTOM,
      'corretores': TipoPagina.CUSTOM,
      'financiamento': TipoPagina.CUSTOM,
      'cookies': TipoPagina.CUSTOM,
      'reembolso': TipoPagina.CUSTOM
    };
    
    // Garantir que estamos usando os valores do enum TipoPagina
    const paginasParaCriar = paginasSelecionadas 
      ? paginasSelecionadas.map((p: string | TipoPagina) => {
          if (typeof p === 'string') {
            // Converter para minúsculo para garantir que o mapeamento funcione
            const idMapeado = paginasMapeamento[p.toLowerCase()];
            return idMapeado || TipoPagina.CUSTOM;
          }
          return p;
        })
      : [TipoPagina.HOME, TipoPagina.IMOVEIS, TipoPagina.CONTATO];
    
    // Criar uma página para cada tipo selecionado
    for (const tipoPagina of paginasParaCriar) {
      await prisma.imobiliariaSitePagina.create({
        data: {
          siteId: novoSite.id,
          tipo: tipoPagina as TipoPagina,
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
    // Usar o Promise.resolve para executar de maneira assíncrona sem bloquear o retorno da API
    Promise.resolve().then(async () => {
      try {
        await siteGenerator.gerarSite();
        console.log(`Geração do site ${novoSite.id} completada com sucesso!`);
      } catch (error) {
        console.error(`Erro na geração do site ${novoSite.id}:`, error);
      }
    });

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
        criadoEm: 'desc'
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
