import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth/auth-options';
import { TipoImovel, TipoOperacao, StatusImovel } from '@prisma/client';

// GET - Obter um imóvel específico
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar perfil do usuário e permissões
    const userDetails = await prisma.user.findUnique({
      where: { email: session.user.email || '' },
      include: {
        imobiliaria: true,
        corretor: true,
      },
    });

    if (!userDetails) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    let imobiliariaId;
    let corretorId;

    if (userDetails.role === 'ADMIN') {
      // Admin pode ver todos os imóveis
    } else if (userDetails.role === 'IMOBILIARIA' && userDetails.imobiliaria) {
      imobiliariaId = userDetails.imobiliaria.id;
    } else if (userDetails.role === 'CORRETOR' && userDetails.corretor) {
      corretorId = userDetails.corretor.id;
      imobiliariaId = userDetails.corretor.imobiliariaId;
    } else {
      return NextResponse.json({ error: 'Perfil não autorizado' }, { status: 403 });
    }

    // Buscar o imóvel completo
    const imovel = await prisma.imovel.findUnique({
      where: { id },
      include: {
        corretor: {
          select: {
            id: true,
            nome: true,
            fotoPerfil: true,
            user: {
              select: {
                email: true,
              }
            }
          }
        },
        imobiliaria: {
          select: {
            id: true,
            nome: true,
            fotoPerfil: true,
          }
        },
        fotos: {
          select: {
            id: true,
            url: true,
            principal: true,
          }
        },
        adicionais: {
          select: {
            id: true,
            nome: true,
          }
        },
      },
    });

    if (!imovel) {
      return NextResponse.json({ error: 'Imóvel não encontrado' }, { status: 404 });
    }

    // Verificar permissão baseada no papel do usuário
    if (userDetails.role !== 'ADMIN') {
      if (
        (userDetails.role === 'IMOBILIARIA' && imovel.imobiliariaId !== imobiliariaId) ||
        (userDetails.role === 'CORRETOR' && imovel.imobiliariaId !== imobiliariaId)
      ) {
        return NextResponse.json({ error: 'Você não tem permissão para acessar este imóvel' }, { status: 403 });
      }
    }

    return NextResponse.json(imovel);
  } catch (error) {
    console.error('Erro ao buscar imóvel:', error);
    return NextResponse.json({ error: 'Erro ao processar a requisição' }, { status: 500 });
  }
}

// PUT - Atualizar um imóvel
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();

    // Verificar perfil do usuário e permissões
    const userDetails = await prisma.user.findUnique({
      where: { email: session.user.email || '' },
      include: {
        imobiliaria: true,
        corretor: true,
      },
    });

    if (!userDetails) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Verificar se o imóvel existe
    const imovelExistente = await prisma.imovel.findUnique({
      where: { id },
      include: {
        adicionais: true,
      },
    });

    if (!imovelExistente) {
      return NextResponse.json({ error: 'Imóvel não encontrado' }, { status: 404 });
    }

    // Verificar permissão baseada no papel do usuário
    if (userDetails.role !== 'ADMIN') {
      if (
        (userDetails.role === 'IMOBILIARIA' && imovelExistente.imobiliariaId !== userDetails.imobiliaria?.id) ||
        (userDetails.role === 'CORRETOR' && imovelExistente.corretorId !== userDetails.corretor?.id)
      ) {
        return NextResponse.json({ error: 'Você não tem permissão para editar este imóvel' }, { status: 403 });
      }
    }

    // Preparar objeto para atualização do imóvel
    const {
      titulo,
      descricao,
      valor,
      tipoOperacao,
      tipoImovel,
      status,
      endereco,
      bairro,
      numero,
      cidade,
      estado,
      cep,
      latitude,
      longitude,
      areaTotal,
      areaConstruida,
      quartos,
      suites,
      banheiros,
      salas,
      cozinhas,
      vagas,
      fotoPrincipal,
      adicionais,
      corretorId,
    } = body;

    // Atualizar imóvel
    const imovelAtualizado = await prisma.imovel.update({
      where: { id },
      data: {
        titulo,
        descricao,
        ...(valor !== undefined && { valor: parseFloat(valor) }),
        ...(tipoOperacao && { tipoOperacao: tipoOperacao as TipoOperacao }),
        ...(tipoImovel && { tipoImovel: tipoImovel as TipoImovel }),
        ...(status && { status: status as StatusImovel }),
        ...(endereco && { endereco }),
        ...(bairro && { bairro }),
        ...(numero && { numero }),
        ...(cidade && { cidade }),
        ...(estado && { estado }),
        ...(cep && { cep }),
        ...(latitude !== undefined && { latitude: latitude ? parseFloat(latitude) : null }),
        ...(longitude !== undefined && { longitude: longitude ? parseFloat(longitude) : null }),
        ...(areaTotal !== undefined && { areaTotal: areaTotal ? parseFloat(areaTotal) : null }),
        ...(areaConstruida !== undefined && { areaConstruida: areaConstruida ? parseFloat(areaConstruida) : null }),
        ...(quartos !== undefined && { quartos: quartos ? parseInt(quartos) : null }),
        ...(suites !== undefined && { suites: suites ? parseInt(suites) : null }),
        ...(banheiros !== undefined && { banheiros: banheiros ? parseInt(banheiros) : null }),
        ...(salas !== undefined && { salas: salas ? parseInt(salas) : null }),
        ...(cozinhas !== undefined && { cozinhas: cozinhas ? parseInt(cozinhas) : null }),
        ...(vagas !== undefined && { vagas: vagas ? parseInt(vagas) : null }),
        ...(fotoPrincipal && { fotoPrincipal }),
        ...(corretorId && {
          corretor: {
            connect: { id: corretorId }
          }
        }),
      },
    });

    // Atualizar adicionais se necessário
    if (adicionais && adicionais.length > 0) {
      // Desconectar todos os adicionais existentes
      await prisma.imovel.update({
        where: { id },
        data: {
          adicionais: {
            disconnect: imovelExistente.adicionais.map(a => ({ id: a.id })),
          },
        },
      });

      // Conectar ou criar novos adicionais
      await prisma.imovel.update({
        where: { id },
        data: {
          adicionais: {
            connectOrCreate: adicionais.map((adicional: string) => ({
              where: { nome: adicional },
              create: { nome: adicional },
            })),
          },
        },
      });
    }

    return NextResponse.json({
      message: 'Imóvel atualizado com sucesso',
      imovel: imovelAtualizado,
    });
  } catch (error) {
    console.error('Erro ao atualizar imóvel:', error);
    return NextResponse.json({ error: 'Erro ao processar a requisição' }, { status: 500 });
  }
}

// DELETE - Excluir um imóvel
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar perfil do usuário e permissões
    const userDetails = await prisma.user.findUnique({
      where: { email: session.user.email || '' },
      include: {
        imobiliaria: true,
        corretor: true,
      },
    });

    if (!userDetails) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Verificar se o imóvel existe
    const imovelExistente = await prisma.imovel.findUnique({
      where: { id },
    });

    if (!imovelExistente) {
      return NextResponse.json({ error: 'Imóvel não encontrado' }, { status: 404 });
    }

    // Verificar permissão baseada no papel do usuário
    if (userDetails.role !== 'ADMIN') {
      if (
        (userDetails.role === 'IMOBILIARIA' && imovelExistente.imobiliariaId !== userDetails.imobiliaria?.id) ||
        (userDetails.role === 'CORRETOR' && imovelExistente.corretorId !== userDetails.corretor?.id)
      ) {
        return NextResponse.json({ error: 'Você não tem permissão para excluir este imóvel' }, { status: 403 });
      }
    }

    // Excluir imóvel
    await prisma.imovel.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Imóvel excluído com sucesso',
    });
  } catch (error) {
    console.error('Erro ao excluir imóvel:', error);
    return NextResponse.json({ error: 'Erro ao processar a requisição' }, { status: 500 });
  }
}
