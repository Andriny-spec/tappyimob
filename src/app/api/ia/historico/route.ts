import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Listar todos os históricos de chat da imobiliária
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
    
    // Buscar os chats dessa imobiliária, ordenados por data (mais recentes primeiro)
    // @ts-ignore - O modelo existe no banco mas pode não estar corretamente tipado
    const historicos = await prisma.chatIA.findMany({
      where: {
        imobiliariaId: imobiliaria.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json({ historicos });
  } catch (error) {
    console.error('Erro ao buscar histórico de chats:', error);
    return NextResponse.json(
      { erro: 'Erro ao buscar histórico de chats' },
      { status: 500 }
    );
  }
}

// Criar um novo chat
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
    
    const { titulo, primeiraPergunta } = await request.json();
    
    if (!titulo) {
      return NextResponse.json(
        { erro: 'Título é obrigatório' },
        { status: 400 }
      );
    }
    
    // Criar um novo chat
    // @ts-ignore - O modelo existe no banco mas pode não estar corretamente tipado
    const novoChat = await prisma.chatIA.create({
      data: {
        titulo,
        ultimaPergunta: primeiraPergunta || null,
        imobiliariaId: imobiliaria.id
      }
    });
    
    return NextResponse.json(novoChat);
  } catch (error) {
    console.error('Erro ao criar chat:', error);
    return NextResponse.json(
      { erro: 'Erro ao criar chat' },
      { status: 500 }
    );
  }
}

// Excluir todo o histórico de chats
export async function DELETE(request: NextRequest) {
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
    
    // Buscar todos os chats dessa imobiliária
    // @ts-ignore - O modelo existe no banco mas pode não estar corretamente tipado
    const chats = await prisma.chatIA.findMany({
      where: {
        imobiliariaId: imobiliaria.id
      }
    });
    
    // Apagar todas as mensagens e depois os chats
    for (const chat of chats) {
      // @ts-ignore - O modelo existe no banco mas pode não estar corretamente tipado
      await prisma.mensagemChatIA.deleteMany({
        where: {
          chatId: chat.id
        }
      });
    }
    
    // Apagar os chats
    // @ts-ignore - O modelo existe no banco mas pode não estar corretamente tipado
    await prisma.chatIA.deleteMany({
      where: {
        imobiliariaId: imobiliaria.id
      }
    });
    
    return NextResponse.json({ 
      sucesso: true,
      mensagem: 'Todo o histórico de chats foi excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir histórico de chats:', error);
    return NextResponse.json(
      { erro: 'Erro ao excluir histórico de chats' },
      { status: 500 }
    );
  }
}
