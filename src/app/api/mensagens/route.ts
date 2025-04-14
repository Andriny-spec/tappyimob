import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/mensagens - Criar uma nova mensagem
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      nome, 
      email, 
      telefone, 
      mensagem, 
      imovelId, // opcional, caso a mensagem seja sobre um imóvel específico
      assunto,   // opcional
      imobiliariaSlug 
    } = body;

    if (!nome || !email || !mensagem || !imobiliariaSlug) {
      return NextResponse.json(
        { error: 'Dados incompletos para enviar mensagem' },
        { status: 400 }
      );
    }

    // Aqui poderia verificar se a imobiliária existe usando o slug
    // const imobiliaria = await prisma.imobiliaria.findUnique({ where: { slug: imobiliariaSlug } });
    // if (!imobiliaria) return NextResponse.json({ error: 'Imobiliária não encontrada' }, { status: 404 });

    // Criar a mensagem no banco de dados
    const mensagemObj = await prisma.mensagem.create({
      data: {
        nome,
        email,
        telefone,
        mensagem,
        imovelId,
        assunto: assunto || 'Contato via site',
        // imobiliariaId: imobiliaria.id,
        status: 'nao_lida', // Por padrão, mensagens começam como não lidas
        createdAt: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Mensagem enviada com sucesso!',
      mensagem: mensagemObj
    });
  } catch (error) {
    console.error('Erro ao criar mensagem:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a solicitação' },
      { status: 500 }
    );
  }
}

// GET /api/mensagens - Listar mensagens (apenas para admin ou imobiliária)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar se o usuário é admin ou pertence à imobiliária
    // const imobiliariaId = ... // lógica para obter ID da imobiliária do usuário

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'todas';
    const imovelId = searchParams.get('imovelId');
    
    const where: any = {};
    
    // Filtrar por status
    if (status !== 'todas') {
      where.status = status;
    }
    
    // Filtrar por imóvel
    if (imovelId) {
      where.imovelId = imovelId;
    }
    
    // TODO: Adicionar filtro por imobiliária
    // where.imobiliariaId = imobiliariaId;

    const mensagens = await prisma.mensagem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        imovel: {
          select: {
            id: true,
            titulo: true,
            endereco: true,
            preco: true,
            tipo: true
          }
        }
      }
    });

    return NextResponse.json({ mensagens });
  } catch (error) {
    console.error('Erro ao listar mensagens:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a solicitação' },
      { status: 500 }
    );
  }
}
