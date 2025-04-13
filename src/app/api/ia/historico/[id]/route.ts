import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Obter um chat específico com suas mensagens
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
    
    // Verificar se a imobiliária tem acesso a este chat
    // @ts-ignore - O modelo existe no banco mas pode não estar corretamente tipado
    const chat = await prisma.chatIA.findFirst({
      where: {
        id,
        imobiliaria: {
          id: session.user.id
        }
      },
      include: {
        mensagens: {
          orderBy: {
            timestamp: 'asc'
          }
        }
      }
    });
    
    if (!chat) {
      return NextResponse.json(
        { erro: 'Chat não encontrado ou sem permissão' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(chat);
  } catch (error) {
    console.error('Erro ao buscar chat:', error);
    return NextResponse.json(
      { erro: 'Erro ao buscar chat' },
      { status: 500 }
    );
  }
}

// Atualizar informações do chat (título ou última pergunta)
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
    
    // Verificar se a imobiliária tem acesso a este chat
    // @ts-ignore - O modelo existe no banco mas pode não estar corretamente tipado
    const chatExistente = await prisma.chatIA.findFirst({
      where: {
        id,
        imobiliaria: {
          id: session.user.id
        }
      }
    });
    
    if (!chatExistente) {
      return NextResponse.json(
        { erro: 'Chat não encontrado ou sem permissão' },
        { status: 404 }
      );
    }
    
    const { titulo, ultimaPergunta } = await request.json();
    
    // Atualizar o chat
    // @ts-ignore - O modelo existe no banco mas pode não estar corretamente tipado
    const chatAtualizado = await prisma.chatIA.update({
      where: { id },
      data: {
        ...(titulo && { titulo }),
        ...(ultimaPergunta && { ultimaPergunta })
      }
    });
    
    return NextResponse.json(chatAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar chat:', error);
    return NextResponse.json(
      { erro: 'Erro ao atualizar chat' },
      { status: 500 }
    );
  }
}

// Excluir um chat
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
    
    // Verificar se a imobiliária tem acesso a este chat
    // @ts-ignore - O modelo existe no banco mas pode não estar corretamente tipado
    const chatExistente = await prisma.chatIA.findFirst({
      where: {
        id,
        imobiliaria: {
          id: session.user.id
        }
      }
    });
    
    if (!chatExistente) {
      return NextResponse.json(
        { erro: 'Chat não encontrado ou sem permissão' },
        { status: 404 }
      );
    }
    
    // Excluir primeiro as mensagens e depois o chat
    try {
      // Excluir as mensagens relacionadas ao chat
      // @ts-ignore - O modelo existe no banco mas pode não estar corretamente tipado
      await prisma.mensagemChatIA.deleteMany({
        where: { chatId: id }
      });
      
      // Excluir o chat
      // @ts-ignore - O modelo existe no banco mas pode não estar corretamente tipado
      await prisma.chatIA.delete({
        where: { id }
      });
    } catch (deleteError) {
      console.error('Erro ao excluir chat e mensagens:', deleteError);
      return NextResponse.json(
        { erro: 'Erro ao excluir chat e mensagens' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      sucesso: true,
      mensagem: 'Chat excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir chat:', error);
    return NextResponse.json(
      { erro: 'Erro ao excluir chat' },
      { status: 500 }
    );
  }
}
