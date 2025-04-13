import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth/auth-options';
import { TipoImovel, TipoOperacao, StatusImovel } from '@prisma/client';

// GET - Listar imóveis
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const status = url.searchParams.get('status') || '';
    const tipoImovel = url.searchParams.get('tipoImovel') || '';
    const tipoOperacao = url.searchParams.get('tipoOperacao') || '';
    const skip = (page - 1) * limit;

    let imobiliariaId;
    let corretorId;

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

    // Construir o where clause baseado nos filtros
    const where: any = {};

    if (search) {
      where.OR = [
        { titulo: { contains: search, mode: 'insensitive' } },
        { descricao: { contains: search, mode: 'insensitive' } },
        { codigo: { contains: search, mode: 'insensitive' } },
        { endereco: { contains: search, mode: 'insensitive' } },
        { bairro: { contains: search, mode: 'insensitive' } },
        { cidade: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (imobiliariaId) {
      where.imobiliariaId = imobiliariaId;
    }

    if (corretorId) {
      where.corretorId = corretorId;
    }

    if (status) {
      where.status = status as StatusImovel;
    }

    if (tipoImovel) {
      where.tipoImovel = tipoImovel as TipoImovel;
    }

    if (tipoOperacao) {
      where.tipoOperacao = tipoOperacao as TipoOperacao;
    }

    // Executar a consulta para obter os imóveis com base nos filtros
    const [imoveis, total] = await Promise.all([
      prisma.imovel.findMany({
        where,
        skip,
        take: limit,
        include: {
          corretor: {
            select: {
              id: true,
              fotoPerfil: true,
              user: {
                select: {
                  nome: true,
                  email: true,
                }
              }
            }
          },
          imobiliaria: {
            select: {
              id: true,
              fotoPerfil: true,
              user: {
                select: {
                  nome: true
                }
              }
            }
          },
          fotos: {
            select: {
              id: true,
              url: true,
              ordem: true,
              legenda: true
            }
          },
          adicionais: {
            select: {
              id: true,
              nome: true,
            }
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.imovel.count({ where }),
    ]);

    return NextResponse.json({
      imoveis,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar imóveis:', error);
    return NextResponse.json({ error: 'Erro ao processar a requisição' }, { status: 500 });
  }
}

// POST - Criar imóvel
export async function POST(request: Request) {
  try {
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

    let imobiliariaId;
    let corretorId;

    if (userDetails.role === 'ADMIN') {
      if (!body.imobiliariaId) {
        return NextResponse.json({ error: 'ID da imobiliária é obrigatório' }, { status: 400 });
      }
      imobiliariaId = body.imobiliariaId;
      corretorId = body.corretorId;
    } else if (userDetails.role === 'IMOBILIARIA' && userDetails.imobiliaria) {
      imobiliariaId = userDetails.imobiliaria.id;
      corretorId = body.corretorId;
    } else if (userDetails.role === 'CORRETOR' && userDetails.corretor) {
      corretorId = userDetails.corretor.id;
      imobiliariaId = userDetails.corretor.imobiliariaId;
    } else {
      return NextResponse.json({ error: 'Perfil não autorizado' }, { status: 403 });
    }

    // Gerar código único para o imóvel
    const totalImoveis = await prisma.imovel.count({
      where: { imobiliariaId }
    });
    
    const codigoImobiliaria = imobiliariaId.substring(0, 4).toUpperCase();
    const codigo = `${codigoImobiliaria}-${(totalImoveis + 1).toString().padStart(4, '0')}`;

    // Preparar objeto para criação do imóvel
    const {
      titulo,
      descricao,
      valor,
      tipoOperacao,
      tipoImovel,
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
    } = body;

    // Criar imóvel
    const novoImovel = await prisma.imovel.create({
      data: {
        codigo,
        titulo,
        descricao,
        valor: parseFloat(valor),
        tipoOperacao: tipoOperacao as TipoOperacao,
        tipoImovel: tipoImovel as TipoImovel,
        endereco,
        bairro,
        numero,
        cidade,
        estado,
        cep,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        areaTotal: areaTotal ? parseFloat(areaTotal) : null,
        areaConstruida: areaConstruida ? parseFloat(areaConstruida) : null,
        quartos: quartos ? parseInt(quartos) : null,
        suites: suites ? parseInt(suites) : null,
        banheiros: banheiros ? parseInt(banheiros) : null,
        salas: salas ? parseInt(salas) : null,
        cozinhas: cozinhas ? parseInt(cozinhas) : null,
        vagas: vagas ? parseInt(vagas) : null,
        fotoPrincipal,
        imobiliaria: {
          connect: { id: imobiliariaId }
        },
        ...(corretorId && {
          corretor: {
            connect: { id: corretorId }
          }
        }),
        ...(adicionais && adicionais.length > 0 && {
          adicionais: {
            connectOrCreate: adicionais.map((adicional: string) => ({
              where: { nome: adicional },
              create: { nome: adicional },
            })),
          },
        }),
      },
    });

    return NextResponse.json({
      message: 'Imóvel criado com sucesso',
      imovel: novoImovel,
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar imóvel:', error);
    return NextResponse.json({ error: 'Erro ao processar a requisição' }, { status: 500 });
  }
}
