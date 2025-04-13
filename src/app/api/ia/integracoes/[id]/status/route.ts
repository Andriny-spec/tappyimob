import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Atualizar o status de uma integração
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { erro: 'ID da integração não fornecido' },
        { status: 400 }
      );
    }
    
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
    
    // Verificar se a integração existe e pertence à imobiliária
    // @ts-ignore - O modelo existe no banco mas pode não estar corretamente tipado
    const integracao = await prisma.integracaoAgenteIA.findFirst({
      where: {
        id,
        imobiliariaId: imobiliaria.id
      }
    });
    
    if (!integracao) {
      return NextResponse.json(
        { erro: 'Integração não encontrada ou sem permissão' },
        { status: 404 }
      );
    }
    
    // Obter e validar o novo status
    const { status } = await request.json();
    
    if (!status || !['ATIVA', 'CONFIGURANDO', 'PAUSADA', 'ERRO'].includes(status)) {
      return NextResponse.json(
        { erro: 'Status inválido' },
        { status: 400 }
      );
    }
    
    // Atualizar o status da integração
    // @ts-ignore - O modelo existe no banco mas pode não estar corretamente tipado
    const integracaoAtualizada = await prisma.integracaoAgenteIA.update({
      where: {
        id
      },
      data: {
        status
      }
    });
    
    return NextResponse.json(integracaoAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar status da integração:', error);
    return NextResponse.json(
      { erro: 'Erro ao atualizar status da integração' },
      { status: 500 }
    );
  }
}
