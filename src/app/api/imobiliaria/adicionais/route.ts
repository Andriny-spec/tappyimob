import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth/auth-options';

// GET - Listar adicionais
export async function GET(request: Request) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Buscar o ID da imobiliária associada ao usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { imobiliaria: true }
    });

    if (!user || !user.imobiliaria) {
      return NextResponse.json(
        { error: 'Imobiliária não encontrada' },
        { status: 404 }
      );
    }

    const imobiliariaId = user.imobiliaria.id;

    // Buscar todos os adicionais
    const adicionais = await prisma.adicional.findMany({
      orderBy: { nome: 'asc' }
    });

    return NextResponse.json(adicionais);
  } catch (error) {
    console.error('Erro ao buscar adicionais:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar um novo adicional
export async function POST(request: Request) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Buscar o ID da imobiliária associada ao usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { imobiliaria: true }
    });

    if (!user || !user.imobiliaria) {
      return NextResponse.json(
        { error: 'Imobiliária não encontrada' },
        { status: 404 }
      );
    }

    // Receber e validar os dados do body
    const body = await request.json();
    const { nome } = body;

    if (!nome || nome.trim() === '') {
      return NextResponse.json(
        { error: 'Nome do adicional é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se já existe um adicional com este nome
    const adicionalExistente = await prisma.adicional.findFirst({
      where: { nome: { equals: nome, mode: 'insensitive' } }
    });

    if (adicionalExistente) {
      return NextResponse.json(adicionalExistente);
    }

    // Criar o novo adicional
    const novoAdicional = await prisma.adicional.create({
      data: { nome }
    });

    return NextResponse.json(novoAdicional);
  } catch (error) {
    console.error('Erro ao criar adicional:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
