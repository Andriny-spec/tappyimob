import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/avaliacoes - Criar uma nova avaliação
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      nome, 
      email, 
      comentario, 
      nota, 
      imovelId, 
      imobiliariaSlug 
    } = body;

    if (!nome || !comentario || !nota || !imovelId || !imobiliariaSlug) {
      return NextResponse.json(
        { error: 'Dados incompletos para criar avaliação' },
        { status: 400 }
      );
    }

    // Aqui poderia verificar se a imobiliária existe usando o slug
    // const imobiliaria = await prisma.imobiliaria.findUnique({ where: { slug: imobiliariaSlug } });
    // if (!imobiliaria) return NextResponse.json({ error: 'Imobiliária não encontrada' }, { status: 404 });

    // Criar a avaliação no banco de dados
    const avaliacao = await prisma.avaliacao.create({
      data: {
        nome,
        email,
        comentario,
        nota,
        imovelId,
        // imobiliariaId: imobiliaria.id,
        status: 'pendente', // Por padrão, avaliações precisam ser aprovadas
        createdAt: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Avaliação enviada com sucesso! Aguardando aprovação.',
      avaliacao
    });
  } catch (error) {
    console.error('Erro ao criar avaliação:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a solicitação' },
      { status: 500 }
    );
  }
}

// GET /api/avaliacoes - Listar avaliações (apenas para admin ou imobiliária)
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

    const avaliacoes = await prisma.avaliacao.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ avaliacoes });
  } catch (error) {
    console.error('Erro ao listar avaliações:', error);
    return NextResponse.json(
      { error: 'Erro ao processar a solicitação' },
      { status: 500 }
    );
  }
}
