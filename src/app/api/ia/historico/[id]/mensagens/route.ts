import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Buscar mensagens de um chat
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
    
    // Buscar mensagens do chat
    // @ts-ignore - O modelo existe no banco mas pode não estar corretamente tipado
    const mensagens = await prisma.mensagemChatIA.findMany({
      where: {
        chatId: id
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    return NextResponse.json({
      chat: chatExistente,
      mensagens
    });
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    return NextResponse.json(
      { erro: 'Erro ao buscar mensagens' },
      { status: 500 }
    );
  }
}

// Adicionar uma nova mensagem ao chat
export async function POST(
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
    
    const { conteudo, remetente } = await request.json();
    
    if (!conteudo || !remetente) {
      return NextResponse.json(
        { erro: 'Conteúdo e remetente são obrigatórios' },
        { status: 400 }
      );
    }
    
    // Adicionar a mensagem
    // @ts-ignore - O modelo existe no banco mas pode não estar corretamente tipado
    const novaMensagem = await prisma.mensagemChatIA.create({
      data: {
        conteudo,
        remetente,
        chatId: id
      }
    });
    
    // Atualizar a última pergunta se for uma mensagem do usuário
    if (remetente === 'usuario') {
      // @ts-ignore - O modelo existe no banco mas pode não estar corretamente tipado
      await prisma.chatIA.update({
        where: { id },
        data: { ultimaPergunta: conteudo }
      });
    }
    
    return NextResponse.json(novaMensagem);
  } catch (error) {
    console.error('Erro ao adicionar mensagem:', error);
    return NextResponse.json(
      { erro: 'Erro ao adicionar mensagem' },
      { status: 500 }
    );
  }
}

// Excluir todas as mensagens de um chat
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
    
    // Excluir todas as mensagens do chat
    // @ts-ignore - O modelo existe no banco mas pode não estar corretamente tipado
    const resultado = await prisma.mensagemChatIA.deleteMany({
      where: {
        chatId: id
      }
    });
    
    return NextResponse.json({ 
      sucesso: true,
      mensagem: `${resultado.count} mensagens excluídas com sucesso` 
    });
  } catch (error) {
    console.error('Erro ao excluir mensagens:', error);
    return NextResponse.json(
      { erro: 'Erro ao excluir mensagens' },
      { status: 500 }
    );
  }
}
