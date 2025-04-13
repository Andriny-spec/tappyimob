import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { Role } from "@prisma/client";

// GET - Obter detalhes de um corretor específico
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = session.user.id;
    const corretorId = params.id;
    
    // Verificar se o usuário é uma imobiliária
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { imobiliaria: true }
    });

    if (!user || user.role !== Role.IMOBILIARIA || !user.imobiliaria) {
      return NextResponse.json({ error: "Acesso permitido apenas para imobiliárias" }, { status: 403 });
    }

    const imobiliariaId = user.imobiliaria.id;

    // Buscar o corretor e verificar se pertence à imobiliária
    const corretor = await prisma.corretor.findUnique({
      where: {
        id: corretorId,
        imobiliariaId: imobiliariaId
      },
      include: {
        user: {
          select: {
            id: true,
            nome: true,
            email: true,
            status: true,
            createdAt: true,
            updatedAt: true
          }
        },
        imoveis: {
          select: {
            id: true,
            titulo: true,
            codigo: true,
            status: true,
            tipoImovel: true,
            tipoOperacao: true,
            valor: true,
            fotoPrincipal: true
          }
        },
        clientes: {
          select: {
            id: true,
            user: {
              select: {
                nome: true,
                email: true
              }
            },
            telefone: true
          }
        }
      }
    });

    if (!corretor) {
      return NextResponse.json({ error: "Corretor não encontrado" }, { status: 404 });
    }

    // Formatar resposta com dados detalhados
    const corretorDetalhado = {
      id: corretor.id,
      nome: corretor.user.nome,
      email: corretor.user.email,
      telefone: corretor.telefone || "",
      creci: corretor.creci || "",
      endereco: corretor.endereco || "",
      bairro: corretor.bairro || "",
      numero: corretor.numero || "",
      cidade: corretor.cidade || "",
      estado: corretor.estado || "",
      fotoPerfil: corretor.fotoPerfil || "",
      cpf: corretor.cpf || "",
      cnpj: corretor.cnpj || "",
      status: corretor.user.status,
      imoveis: corretor.imoveis,
      clientes: corretor.clientes,
      createdAt: corretor.user.createdAt,
      updatedAt: corretor.user.updatedAt
    };

    return NextResponse.json(corretorDetalhado);
  } catch (error) {
    console.error("Erro ao obter detalhes do corretor:", error);
    return NextResponse.json({ error: "Erro ao buscar detalhes do corretor" }, { status: 500 });
  }
}

// PATCH - Atualizar dados de um corretor
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = session.user.id;
    const corretorId = params.id;
    
    // Verificar se o usuário é uma imobiliária
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { imobiliaria: true }
    });

    if (!user || user.role !== Role.IMOBILIARIA || !user.imobiliaria) {
      return NextResponse.json({ error: "Acesso permitido apenas para imobiliárias" }, { status: 403 });
    }

    const imobiliariaId = user.imobiliaria.id;

    // Verificar se o corretor pertence à imobiliária
    const corretor = await prisma.corretor.findUnique({
      where: {
        id: corretorId,
        imobiliariaId: imobiliariaId
      },
      include: { user: true }
    });

    if (!corretor) {
      return NextResponse.json({ error: "Corretor não encontrado" }, { status: 404 });
    }

    const dados = await req.json();

    // Atualizar os dados do corretor
    await prisma.$transaction(async (tx) => {
      // Atualizar dados do usuário
      if (dados.nome || dados.email || dados.status !== undefined) {
        await tx.user.update({
          where: { id: corretor.user.id },
          data: {
            nome: dados.nome || undefined,
            email: dados.email || undefined,
            status: dados.status || undefined
          }
        });
      }

      // Atualizar dados do corretor
      await tx.corretor.update({
        where: { id: corretorId },
        data: {
          telefone: dados.telefone || undefined,
          endereco: dados.endereco || undefined,
          bairro: dados.bairro || undefined,
          numero: dados.numero || undefined,
          cidade: dados.cidade || undefined,
          estado: dados.estado || undefined,
          creci: dados.creci || undefined,
          fotoPerfil: dados.fotoPerfil || undefined,
          cpf: dados.cpf || undefined,
          cnpj: dados.cnpj || undefined
        }
      });
    });

    return NextResponse.json({ 
      message: "Corretor atualizado com sucesso"
    });
  } catch (error) {
    console.error("Erro ao atualizar corretor:", error);
    return NextResponse.json({ error: "Erro ao atualizar corretor" }, { status: 500 });
  }
}

// DELETE - Remover um corretor
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = session.user.id;
    const corretorId = params.id;
    
    // Verificar se o usuário é uma imobiliária
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { imobiliaria: true }
    });

    if (!user || user.role !== Role.IMOBILIARIA || !user.imobiliaria) {
      return NextResponse.json({ error: "Acesso permitido apenas para imobiliárias" }, { status: 403 });
    }

    const imobiliariaId = user.imobiliaria.id;

    // Verificar se o corretor pertence à imobiliária
    const corretor = await prisma.corretor.findUnique({
      where: {
        id: corretorId,
        imobiliariaId: imobiliariaId
      },
      include: { user: true }
    });

    if (!corretor) {
      return NextResponse.json({ error: "Corretor não encontrado" }, { status: 404 });
    }

    // Desativar o corretor (em vez de excluir permanentemente)
    await prisma.user.update({
      where: { id: corretor.user.id },
      data: { status: "INATIVO" }
    });

    return NextResponse.json({ 
      message: "Corretor desativado com sucesso" 
    });
  } catch (error) {
    console.error("Erro ao desativar corretor:", error);
    return NextResponse.json({ error: "Erro ao desativar corretor" }, { status: 500 });
  }
}
