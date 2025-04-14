import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/imobiliarias/[id] - Buscar dados de uma imobiliária específica
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = params;

    // Verificar se o usuário tem permissão para acessar os dados desta imobiliária
    // Apenas o próprio usuário ou um admin pode ver os dados
    if (session.user.id !== id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // Buscar dados da imobiliária
    const imobiliaria = await prisma.imobiliaria.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            nome: true,
            email: true
          }
        }
      }
    });

    if (!imobiliaria) {
      return NextResponse.json({ error: "Imobiliária não encontrada" }, { status: 404 });
    }

    // Formatar resposta combinando dados do usuário e imobiliária
    const imobiliariaData = {
      id: imobiliaria.id,
      nome: imobiliaria.user.nome,
      email: imobiliaria.user.email,
      telefone: imobiliaria.telefone || '',
      endereco: imobiliaria.endereco || '',
      bairro: imobiliaria.bairro || '',
      numero: imobiliaria.numero || '',
      cidade: imobiliaria.cidade || '',
      estado: imobiliaria.estado || '',
      cnpj: imobiliaria.cnpj || '',
      cpf: imobiliaria.cpf || '',
      fotoPerfil: imobiliaria.fotoPerfil || '',
      // Adicione outros campos que você tem no seu modelo
    };

    return NextResponse.json({ imobiliaria: imobiliariaData });
  } catch (error) {
    console.error("Erro ao buscar dados da imobiliária:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}

// PUT /api/imobiliarias/[id] - Atualizar dados de uma imobiliária
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = params;

    // Verificar se o usuário tem permissão para atualizar os dados desta imobiliária
    // Apenas o próprio usuário ou um admin pode atualizar os dados
    if (session.user.id !== id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // Obter dados da requisição
    const body = await request.json();
    
    // Verificar se a imobiliária existe
    const imobiliariaExistente = await prisma.imobiliaria.findUnique({
      where: { id },
      include: {
        user: true
      }
    });

    if (!imobiliariaExistente) {
      return NextResponse.json({ error: "Imobiliária não encontrada" }, { status: 404 });
    }

    // Separar os dados que pertencem à tabela User e Imobiliaria
    const userData = {
      nome: body.nome,
      email: body.email
      // Adicione outros campos que pertencem ao usuário
    };

    const imobiliariaData = {
      telefone: body.telefone,
      endereco: body.endereco,
      bairro: body.bairro,
      numero: body.numero,
      cidade: body.cidade,
      estado: body.estado,
      cnpj: body.cnpj,
      cpf: body.cpf,
      fotoPerfil: body.fotoPerfil
      // Adicione outros campos que pertencem à imobiliária
    };

    // Atualizar dados em uma transação para garantir consistência
    const imobiliariaAtualizada = await prisma.$transaction([
      prisma.user.update({
        where: { id },
        data: userData
      }),
      prisma.imobiliaria.update({
        where: { id },
        data: imobiliariaData
      })
    ]);

    return NextResponse.json({
      message: "Dados atualizados com sucesso",
      imobiliaria: {
        ...imobiliariaAtualizada[1],
        user: {
          nome: imobiliariaAtualizada[0].nome,
          email: imobiliariaAtualizada[0].email
        }
      }
    });
  } catch (error) {
    console.error("Erro ao atualizar dados da imobiliária:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}
