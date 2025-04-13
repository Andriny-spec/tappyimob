import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth/auth-options';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { 
        email: session.user.email as string 
      },
      include: {
        imobiliaria: true
      }
    });
    
    if (!user || user.role !== 'IMOBILIARIA') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }
    
    const imobiliariaId = user.imobiliaria?.id;
    
    // Contagem de imóveis da imobiliária
    const imoveisCount = await prisma.imovel.count({
      where: {
        imobiliariaId,
        status: 'ATIVO'
      }
    });
    
    // Contagem de corretores associados à imobiliária
    const corretoresCount = await prisma.corretor.count({
      where: {
        imobiliariaId,
        user: {
          status: 'ATIVO'
        }
      }
    });
    
    // Contagem de clientes associados à imobiliária
    const clientesCount = await prisma.cliente.count({
      where: {
        imobiliariaId,
        user: {
          status: 'ATIVO'
        }
      }
    });
    
    // Contagem de mensagens não lidas para a imobiliária
    const mensagensNaoLidasCount = await prisma.mensagem.count({
      where: {
        imobiliariaId,
        lida: false
      }
    });
    
    // Tipos de imóveis e suas contagens
    const tiposImoveis = await prisma.imovel.groupBy({
      by: ['tipoImovel'],
      where: {
        imobiliariaId
      },
      _count: {
        id: true
      }
    });
    
    // Status de imóveis e suas contagens
    const statusImoveis = await prisma.imovel.groupBy({
      by: ['status'],
      where: {
        imobiliariaId
      },
      _count: {
        id: true
      }
    });
    
    // Imóveis recentemente adicionados
    const imoveisRecentes = await prisma.imovel.findMany({
      where: {
        imobiliariaId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5,
      select: {
        id: true,
        codigo: true,
        titulo: true,
        valor: true,
        tipoOperacao: true,
        tipoImovel: true,
        status: true,
        fotoPrincipal: true,
        endereco: true,
        cidade: true,
        estado: true,
        createdAt: true
      }
    });
    
    // Corretores com mais imóveis cadastrados
    const corretoresDestaque = await prisma.corretor.findMany({
      where: {
        imobiliariaId
      },
      include: {
        user: {
          select: {
            nome: true,
            email: true
          }
        },
        imoveis: {
          where: {
            status: {
              in: ['VENDIDO', 'ALUGADO']
            }
          }
        }
      },
      take: 5
    });
    
    const corretoresFormatados = corretoresDestaque.map((corretor: any) => ({
      id: corretor.id,
      nome: corretor.user.nome,
      email: corretor.user.email,
      fotoPerfil: corretor.fotoPerfil,
      totalImoveis: corretor.imoveis.length,
    }));
    
    // Calcular dados de crescimento (mockados por enquanto sem registros históricos)
    const crescimentoMockado = {
      crescimentoImoveis: 5.8,
      crescimentoCorretores: 3.2,
      crescimentoClientes: 7.5,
      crescimentoFaturamento: 4.3
    };
    
    return NextResponse.json({
      imoveisAtivos: imoveisCount,
      corretoresAtivos: corretoresCount,
      clientesAtivos: clientesCount,
      mensagensNaoLidas: mensagensNaoLidasCount,
      tiposImoveis,
      statusImoveis,
      imoveisRecentes,
      corretoresDestaque: corretoresFormatados,
      ...crescimentoMockado
    });
    
  } catch (error) {
    console.error('Erro ao obter estatísticas da imobiliária:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
