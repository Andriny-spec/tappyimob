import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Obter um agente específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Aguardando params para evitar erro em APIs dinâmicas do Next.js 13
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { erro: 'Não autenticado' },
        { status: 401 }
      );
    }
    
    // Verificar se a imobiliária tem acesso a este agente
    // @ts-ignore - O modelo existe no banco mas pode não estar corretamente tipado
    const agente = await prisma.agenteIA.findFirst({
      where: {
        id,
        imobiliaria: {
          id: session.user.id
        }
      },
      include: {
        chats: {
          select: {
            id: true,
            titulo: true,
            createdAt: true
          },
          take: 5,
          orderBy: {
            createdAt: 'desc'
          }
        },
        integracoes: {
          select: {
            id: true,
            nome: true,
            tipo: true,
            status: true
          }
        },
        materiais: {
          select: {
            id: true,
            titulo: true,
            tipo: true,
            status: true
          }
        },
        exemplos: {
          select: {
            id: true,
            pergunta: true,
            resposta: true,
            categoria: true
          },
          take: 10
        }
      }
    });
    
    if (!agente) {
      return NextResponse.json(
        { erro: 'Agente não encontrado ou sem permissão' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(agente);
  } catch (error) {
    console.error('Erro ao buscar agente:', error);
    return NextResponse.json(
      { erro: 'Erro ao buscar agente' },
      { status: 500 }
    );
  }
}

// Atualizar um agente
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Aguardando params para evitar erro em APIs dinâmicas do Next.js 13
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { erro: 'Não autenticado' },
        { status: 401 }
      );
    }
    
    // Verificar se a imobiliária tem acesso a este agente
    // @ts-ignore - O modelo existe no banco mas pode não estar corretamente tipado
    const agenteExistente = await prisma.agenteIA.findFirst({
      where: {
        id,
        imobiliaria: {
          id: session.user.id
        }
      }
    });
    
    if (!agenteExistente) {
      return NextResponse.json(
        { erro: 'Agente não encontrado ou sem permissão' },
        { status: 404 }
      );
    }
    
    const dadosAtualizacao = await request.json();
    
    // Atualizar agente
    // @ts-ignore - O modelo existe no banco mas pode não estar corretamente tipado
    const agenteAtualizado = await prisma.agenteIA.update({
      where: { id },
      data: dadosAtualizacao
    });
    
    return NextResponse.json(agenteAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar agente:', error);
    return NextResponse.json(
      { erro: 'Erro ao atualizar agente' },
      { status: 500 }
    );
  }
}

// Excluir um agente
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Aguardando params para evitar erro em APIs dinâmicas do Next.js 13
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { erro: 'Não autenticado' },
        { status: 401 }
      );
    }
    
    // Verificar se a imobiliária tem acesso a este agente
    // @ts-ignore - O modelo existe no banco mas pode não estar corretamente tipado
    const agenteExistente = await prisma.agenteIA.findFirst({
      where: {
        id,
        imobiliaria: {
          id: session.user.id
        }
      }
    });
    
    if (!agenteExistente) {
      return NextResponse.json(
        { erro: 'Agente não encontrado ou sem permissão' },
        { status: 404 }
      );
    }
    
    // Excluir o agente (os relacionamentos serão excluídos automaticamente pelo onDelete: Cascade)
    // @ts-ignore - O modelo existe no banco mas pode não estar corretamente tipado
    await prisma.agenteIA.delete({
      where: { id }
    });
    
    return NextResponse.json({ 
      sucesso: true,
      mensagem: 'Agente excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir agente:', error);
    return NextResponse.json(
      { erro: 'Erro ao excluir agente' },
      { status: 500 }
    );
  }
}
