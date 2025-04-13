import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { Role } from "@prisma/client";

// GET - Obter detalhes de um cliente específico
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
    const clienteId = params.id;
    
    // Verificar se o usuário é uma imobiliária
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { imobiliaria: true }
    });

    if (!user || user.role !== Role.IMOBILIARIA || !user.imobiliaria) {
      return NextResponse.json({ error: "Acesso permitido apenas para imobiliárias" }, { status: 403 });
    }

    const imobiliariaId = user.imobiliaria.id;

    // Buscar o cliente e verificar se pertence à imobiliária
    const cliente = await prisma.cliente.findUnique({
      where: {
        id: clienteId,
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
        corretores: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                nome: true,
                email: true
              }
            },
            telefone: true
          }
        },
        mensagens: {
          select: {
            id: true,
            conteudo: true,
            lida: true,
            respondida: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!cliente) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    // Formatar resposta com dados detalhados
    const clienteDetalhado = {
      id: cliente.id,
      nome: cliente.user.nome,
      email: cliente.user.email,
      telefone: cliente.telefone || "",
      endereco: cliente.endereco || "",
      bairro: cliente.bairro || "",
      numero: cliente.numero || "",
      cidade: cliente.cidade || "",
      estado: cliente.estado || "",
      fotoPerfil: cliente.fotoPerfil || "",
      cpf: cliente.cpf || "",
      status: cliente.user.status,
      imoveis: cliente.imoveis,
      corretores: cliente.corretores,
      mensagens: cliente.mensagens,
      createdAt: cliente.user.createdAt,
      updatedAt: cliente.user.updatedAt
    };

    return NextResponse.json(clienteDetalhado);
  } catch (error) {
    console.error("Erro ao obter detalhes do cliente:", error);
    return NextResponse.json({ error: "Erro ao buscar detalhes do cliente" }, { status: 500 });
  }
}

// PATCH - Atualizar dados de um cliente
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
    const clienteId = params.id;
    
    // Verificar se o usuário é uma imobiliária
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { imobiliaria: true }
    });

    if (!user || user.role !== Role.IMOBILIARIA || !user.imobiliaria) {
      return NextResponse.json({ error: "Acesso permitido apenas para imobiliárias" }, { status: 403 });
    }

    const imobiliariaId = user.imobiliaria.id;

    // Verificar se o cliente pertence à imobiliária
    const cliente = await prisma.cliente.findUnique({
      where: {
        id: clienteId,
        imobiliariaId: imobiliariaId
      },
      include: { user: true }
    });

    if (!cliente) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    const dados = await req.json();

    // Atualizar os dados do cliente
    await prisma.$transaction(async (tx) => {
      // Atualizar dados do usuário
      if (dados.nome || dados.email || dados.status !== undefined) {
        await tx.user.update({
          where: { id: cliente.user.id },
          data: {
            nome: dados.nome || undefined,
            email: dados.email || undefined,
            status: dados.status || undefined
          }
        });
      }

      // Atualizar dados do cliente
      await tx.cliente.update({
        where: { id: clienteId },
        data: {
          telefone: dados.telefone || undefined,
          endereco: dados.endereco || undefined,
          bairro: dados.bairro || undefined,
          numero: dados.numero || undefined,
          cidade: dados.cidade || undefined,
          estado: dados.estado || undefined,
          fotoPerfil: dados.fotoPerfil || undefined,
          cpf: dados.cpf || undefined
        }
      });

      // Atualizar o corretor associado, se informado
      if (dados.corretorId) {
        // Verificar se o corretor existe e pertence à mesma imobiliária
        const corretor = await tx.corretor.findUnique({
          where: {
            id: dados.corretorId,
            imobiliariaId: imobiliariaId
          }
        });

        if (corretor) {
          // Remover associações existentes com corretores e adicionar a nova
          await tx.cliente.update({
            where: { id: clienteId },
            data: {
              corretores: {
                set: [{ id: dados.corretorId }]
              }
            }
          });
        }
      }
    });

    return NextResponse.json({ 
      message: "Cliente atualizado com sucesso"
    });
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    return NextResponse.json({ error: "Erro ao atualizar cliente" }, { status: 500 });
  }
}

// DELETE - Remover um cliente
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
    const clienteId = params.id;
    
    // Verificar se o usuário é uma imobiliária
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { imobiliaria: true }
    });

    if (!user || user.role !== Role.IMOBILIARIA || !user.imobiliaria) {
      return NextResponse.json({ error: "Acesso permitido apenas para imobiliárias" }, { status: 403 });
    }

    const imobiliariaId = user.imobiliaria.id;

    // Verificar se o cliente pertence à imobiliária
    const cliente = await prisma.cliente.findUnique({
      where: {
        id: clienteId,
        imobiliariaId: imobiliariaId
      },
      include: { user: true }
    });

    if (!cliente) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    // Desativar o cliente (em vez de excluir permanentemente)
    await prisma.user.update({
      where: { id: cliente.user.id },
      data: { status: "INATIVO" }
    });

    return NextResponse.json({ 
      message: "Cliente desativado com sucesso" 
    });
  } catch (error) {
    console.error("Erro ao desativar cliente:", error);
    return NextResponse.json({ error: "Erro ao desativar cliente" }, { status: 500 });
  }
}
