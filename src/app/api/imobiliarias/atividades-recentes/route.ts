import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar se existe uma imobiliária associada ao usuário
    const imobiliaria = await prisma.imobiliaria.findUnique({
      where: {
        id: session.user.id
      }
    });
    
    if (!imobiliaria) {
      return NextResponse.json(
        { error: 'Imobiliária não encontrada para este usuário' },
        { status: 404 }
      );
    }
    
    // Buscamos as atividades recentes relacionadas à imobiliária
    // Coletamos dados de diferentes entidades e consolidamos em um único array

    // 1. Imóveis recentes
    const imoveis = await prisma.imovel.findMany({
      where: {
        imobiliariaId: imobiliaria.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10,
      select: {
        id: true,
        titulo: true,
        createdAt: true,
        tipoImovel: true
      }
    });

    // 2. Corretores recentes
    const corretores = await prisma.corretor.findMany({
      where: {
        imobiliariaId: imobiliaria.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5,
      select: {
        id: true,
        user: {
          select: {
            nome: true
          }
        },
        createdAt: true
      }
    });

    // 3. Clientes recentes
    const clientes = await prisma.cliente.findMany({
      where: {
        imobiliariaId: imobiliaria.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5,
      select: {
        id: true,
        user: {
          select: {
            nome: true
          }
        },
        createdAt: true
      }
    });

    // 4. Avaliações recentes (se existirem)
    const avaliacoes = await prisma.avaliacao.findMany({
      where: {
        OR: [
          {
            imovel: {
              imobiliariaId: imobiliaria.id
            }
          }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5,
      select: {
        id: true,
        titulo: true,
        nota: true,
        createdAt: true
      }
    });

    // Converter os dados para o formato de atividade
    const atividadesImoveis = imoveis.map(imovel => ({
      id: `imovel-${imovel.id}`,
      tipo: 'imovel' as const,
      titulo: 'Novo imóvel cadastrado',
      descricao: imovel.titulo,
      data: imovel.createdAt,
      isRead: Math.random() > 0.3, // Simulação - alguns lidos, outros não
      entidadeId: imovel.id,
      entidadeNome: imovel.titulo,
      icone: 'Building2'
    }));

    const atividadesCorretores = corretores.map(corretor => ({
      id: `corretor-${corretor.id}`,
      tipo: 'corretor' as const,
      titulo: 'Novo corretor adicionado',
      descricao: `${corretor.user.nome} foi adicionado à sua equipe`,
      data: corretor.createdAt,
      isRead: Math.random() > 0.3,
      entidadeId: corretor.id,
      entidadeNome: corretor.user.nome,
      icone: 'User'
    }));

    const atividadesClientes = clientes.map(cliente => ({
      id: `cliente-${cliente.id}`,
      tipo: 'cliente' as const,
      titulo: 'Novo cliente cadastrado',
      descricao: `${cliente.user.nome} foi adicionado como cliente`,
      data: cliente.createdAt,
      isRead: Math.random() > 0.3,
      entidadeId: cliente.id,
      entidadeNome: cliente.user.nome,
      icone: 'User'
    }));

    const atividadesAvaliacoes = avaliacoes.map(avaliacao => ({
      id: `avaliacao-${avaliacao.id}`,
      tipo: 'avaliacao' as const,
      titulo: 'Nova avaliação recebida',
      descricao: `Avaliação de ${avaliacao.nota} estrelas: ${avaliacao.titulo}`,
      data: avaliacao.createdAt,
      isRead: Math.random() > 0.3,
      entidadeId: avaliacao.id,
      icone: 'Star'
    }));

    // Combinar todas as atividades
    const todasAtividades = [
      ...atividadesImoveis,
      ...atividadesCorretores,
      ...atividadesClientes,
      ...atividadesAvaliacoes
    ];

    // Ordenar por data (mais recentes primeiro)
    const atividadesOrdenadas = todasAtividades.sort((a, b) => 
      new Date(b.data).getTime() - new Date(a.data).getTime()
    );

    return NextResponse.json(atividadesOrdenadas);
  } catch (error) {
    console.error('[ATIVIDADES_RECENTES_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao obter atividades recentes' },
      { status: 500 }
    );
  }
}
