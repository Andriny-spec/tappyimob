import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Listar todos os agentes da imobiliária
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { erro: 'Não autenticado' },
        { status: 401 }
      );
    }
    
    // Obter a imobiliária associada ao usuário logado
    const imobiliaria = await prisma.imobiliaria.findFirst({
      where: {
        id: session.user.id
      }
    });
    
    if (!imobiliaria) {
      return NextResponse.json(
        { erro: 'Imobiliária não encontrada' },
        { status: 404 }
      );
    }
    
    // Buscar os agentes dessa imobiliária
    // @ts-ignore - O modelo existe no banco mas pode não estar corretamente tipado
    const agentes = await prisma.agenteIA.findMany({
      where: {
        imobiliariaId: imobiliaria.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        chats: {
          select: {
            id: true
          }
        },
        integracoes: {
          select: {
            id: true,
            tipo: true,
            status: true
          }
        }
      }
    });
    
    // Transformar os dados para a resposta
    const agentesFormatados = agentes.map(agente => ({
      id: agente.id,
      nome: agente.nome,
      descricao: agente.descricao,
      tipoAgente: agente.tipoAgente,
      tom: agente.tom,
      status: agente.status,
      emoji: agente.emoji || '🤖',
      cor: agente.cor || '#4f46e5',
      createdAt: agente.createdAt,
      estatisticas: {
        totalChats: agente.chats.length,
        totalIntegracoes: agente.integracoes.length,
        integracoesAtivas: agente.integracoes.filter(i => i.status === 'ATIVA').length
      }
    }));
    
    return NextResponse.json({ agentes: agentesFormatados });
  } catch (error) {
    console.error('Erro ao buscar agentes:', error);
    return NextResponse.json(
      { erro: 'Erro ao buscar agentes' },
      { status: 500 }
    );
  }
}

// Criar um novo agente
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { erro: 'Não autenticado' },
        { status: 401 }
      );
    }
    
    // Obter a imobiliária associada ao usuário logado
    const imobiliaria = await prisma.imobiliaria.findFirst({
      where: {
        id: session.user.id
      }
    });
    
    if (!imobiliaria) {
      return NextResponse.json(
        { erro: 'Imobiliária não encontrada' },
        { status: 404 }
      );
    }
    
    const {
      nome,
      descricao,
      tipoAgente,
      tom,
      promptPersonalizado,
      instrucoesGerais,
      emoji,
      cor,
      status = 'EM_TREINAMENTO'
    } = await request.json();
    
    // Validar campos obrigatórios
    if (!nome || !descricao || !tipoAgente || !tom) {
      return NextResponse.json(
        { erro: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      );
    }
    
    // Criar o agente
    // @ts-ignore - O modelo existe no banco mas pode não estar corretamente tipado
    const novoAgente = await prisma.agenteIA.create({
      data: {
        nome,
        descricao,
        tipoAgente,
        tom,
        promptPersonalizado,
        instrucoesGerais,
        emoji,
        cor,
        status,
        imobiliariaId: imobiliaria.id
      }
    });
    
    return NextResponse.json(novoAgente);
  } catch (error) {
    console.error('Erro ao criar agente:', error);
    return NextResponse.json(
      { erro: 'Erro ao criar agente' },
      { status: 500 }
    );
  }
}
