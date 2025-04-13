import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Atualizar o status de um agente
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
    
    // Obter dados do corpo da requisição
    const dados = await request.json();
    
    // Validar se o status foi fornecido
    if (!dados.status) {
      return NextResponse.json(
        { erro: 'Status do agente não informado' },
        { status: 400 }
      );
    }
    
    // Validar o status (permitir apenas os valores definidos)
    const statusPermitidos = ['EM_TREINAMENTO', 'ATIVO', 'DESATIVADO', 'EM_REVISAO'];
    if (!statusPermitidos.includes(dados.status)) {
      return NextResponse.json(
        { erro: 'Status inválido. Permitidos: EM_TREINAMENTO, ATIVO, DESATIVADO, EM_REVISAO' },
        { status: 400 }
      );
    }
    
    // Verificar se o agente existe e pertence à imobiliária autenticada
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
        { erro: 'Agente não encontrado ou não pertence à imobiliária' },
        { status: 404 }
      );
    }
    
    // Atualizar apenas o status do agente
    // @ts-ignore - O modelo existe no banco mas pode não estar corretamente tipado
    const agenteAtualizado = await prisma.agenteIA.update({
      where: {
        id
      },
      data: {
        status: dados.status
      }
    });
    
    return NextResponse.json({
      mensagem: 'Status do agente atualizado com sucesso',
      agente: {
        id: agenteAtualizado.id,
        nome: agenteAtualizado.nome,
        status: agenteAtualizado.status
      }
    });
    
  } catch (erro: any) {
    console.error('Erro ao atualizar status do agente:', erro);
    return NextResponse.json(
      { erro: erro.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
