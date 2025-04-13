import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET - Listar templates disponíveis
export async function GET(request: Request) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar templates ativos
    const templates = await prisma.siteTemplate.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' }
    });

    return NextResponse.json({ templates });

  } catch (error) {
    console.error('Erro ao listar templates:', error);
    return NextResponse.json({ error: 'Erro ao listar templates' }, { status: 500 });
  }
}
