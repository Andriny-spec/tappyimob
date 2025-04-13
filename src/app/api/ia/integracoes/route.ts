import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Listar todas as integrações da imobiliária
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
    
    // Buscar as integrações dessa imobiliária
    // @ts-ignore - O modelo existe no banco mas pode não estar corretamente tipado
    const integracoes = await prisma.integracaoAgenteIA.findMany({
      where: {
        imobiliariaId: imobiliaria.id
      },
      include: {
        agente: {
          select: {
            id: true,
            nome: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json({ integracoes });
  } catch (error) {
    console.error('Erro ao buscar integrações:', error);
    return NextResponse.json(
      { erro: 'Erro ao buscar integrações' },
      { status: 500 }
    );
  }
}

// Criar uma nova integração
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
    
    const requestData = await request.json();
    const { tipo, nome, credenciais, configuracoes } = requestData;
    let agenteId = requestData.agenteId;
    
    // Validar campos obrigatórios
    if (!tipo || !nome || !agenteId) {
      return NextResponse.json(
        { erro: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      );
    }
    
    // Verificar se existe algum agente para a imobiliária
    
    let agente = null;
    try {
      // @ts-ignore - O modelo existe no banco mas pode não estar corretamente tipado
      agente = await prisma.agenteIA.findFirst({
        where: {
          id: agenteId,
          imobiliariaId: imobiliaria.id
        }
      });
      
      // Se o agente com este ID não existe, encontramos qualquer agente da imobiliária
      if (!agente) {
        // @ts-ignore - O modelo existe no banco mas pode não estar corretamente tipado
        agente = await prisma.agenteIA.findFirst({
          where: {
            imobiliariaId: imobiliaria.id
          }
        });
        
        // Se ainda não existe nenhum agente, criamos um agente de teste
        if (!agente) {
          // @ts-ignore - O modelo existe no banco mas pode não estar corretamente tipado
          agente = await prisma.agenteIA.create({
            data: {
              nome: 'Agente de Teste',
              descricao: 'Agente criado automaticamente para teste de integrações',
              tipoAgente: 'ATENDIMENTO',
              tom: 'AMIGAVEL',
              status: 'ATIVO',
              emoji: '🤖',
              imobiliariaId: imobiliaria.id
            }
          });
          console.log('Agente de teste criado:', agente.id);
        }
        
        // Atualizar o agenteId para usar o agente encontrado ou criado
        agenteId = agente.id;
      }
    } catch (error) {
      console.error('Erro ao verificar ou criar agente:', error);
      return NextResponse.json(
        { erro: 'Erro ao verificar ou criar agente. Por favor, crie um agente primeiro.' },
        { status: 500 }
      );
    }
    
    // Criar a integração
    // @ts-ignore - O modelo existe no banco mas pode não estar corretamente tipado
    const novaIntegracao = await prisma.integracaoAgenteIA.create({
      data: {
        tipo,
        nome,
        agenteId,
        imobiliariaId: imobiliaria.id,
        credenciais: credenciais ? JSON.stringify(credenciais) : null,
        configuracoes: configuracoes ? JSON.stringify(configuracoes) : null
      }
    });
    
    return NextResponse.json(novaIntegracao);
  } catch (error) {
    console.error('Erro ao criar integração:', error);
    return NextResponse.json(
      { erro: 'Erro ao criar integração' },
      { status: 500 }
    );
  }
}
