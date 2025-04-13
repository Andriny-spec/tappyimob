import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { Role } from "@prisma/client";

// GET - Listar clientes da imobiliária
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = session.user.id;
    
    // Verificar se o usuário é uma imobiliária
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { imobiliaria: true }
    });

    if (!user || user.role !== Role.IMOBILIARIA || !user.imobiliaria) {
      return NextResponse.json({ error: "Acesso permitido apenas para imobiliárias" }, { status: 403 });
    }

    const imobiliariaId = user.imobiliaria.id;

    // Buscar todos os clientes vinculados à imobiliária
    const clientes = await prisma.cliente.findMany({
      where: {
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
        corretores: {
          select: {
            id: true,
            user: {
              select: {
                nome: true
              }
            }
          }
        },
        imoveis: {
          select: {
            id: true
          }
        },
        mensagens: {
          select: {
            id: true
          }
        }
      }
    });

    // Retornar os dados formatados
    const clientesFormatados = clientes.map(cliente => ({
      id: cliente.id,
      nome: cliente.user.nome,
      email: cliente.user.email,
      telefone: cliente.telefone || "",
      endereco: cliente.endereco || "",
      cidade: cliente.cidade || "",
      estado: cliente.estado || "",
      fotoPerfil: cliente.fotoPerfil || "",
      status: cliente.user.status,
      responsavel: cliente.corretores.length > 0 ? cliente.corretores[0].user.nome : "Sem corretor",
      visualizacoes: cliente.imoveis.length,
      mensagens: cliente.mensagens.length,
      createdAt: cliente.user.createdAt,
      updatedAt: cliente.user.updatedAt
    }));

    return NextResponse.json(clientesFormatados);
  } catch (error) {
    console.error("Erro ao listar clientes:", error);
    return NextResponse.json({ error: "Erro ao buscar clientes" }, { status: 500 });
  }
}

// POST - Adicionar novo cliente à imobiliária
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = session.user.id;
    
    // Verificar se o usuário é uma imobiliária
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { imobiliaria: true }
    });

    if (!user || user.role !== Role.IMOBILIARIA || !user.imobiliaria) {
      return NextResponse.json({ error: "Acesso permitido apenas para imobiliárias" }, { status: 403 });
    }

    const imobiliariaId = user.imobiliaria.id;
    const dados = await req.json();

    // Validar os dados necessários
    if (!dados.nome || !dados.email || !dados.senha) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // Verificar se o e-mail já está em uso
    const emailExistente = await prisma.user.findUnique({
      where: { email: dados.email }
    });

    if (emailExistente) {
      return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 400 });
    }

    // Criar o usuário cliente
    const novoCliente = await prisma.user.create({
      data: {
        nome: dados.nome,
        email: dados.email,
        senha: dados.senha, // Idealmente essa senha deveria ser criptografada
        role: Role.CLIENTE,
        cliente: {
          create: {
            telefone: dados.telefone,
            endereco: dados.endereco,
            bairro: dados.bairro,
            numero: dados.numero,
            cidade: dados.cidade,
            estado: dados.estado,
            cpf: dados.cpf,
            imobiliariaId: imobiliariaId,
            // Se um corretor foi informado, adicionar ao relacionamento
            ...(dados.corretorId ? {
              corretores: {
                connect: [{ id: dados.corretorId }]
              }
            } : {})
          }
        }
      },
      include: {
        cliente: true
      }
    });

    return NextResponse.json({
      id: novoCliente.id,
      nome: novoCliente.nome,
      email: novoCliente.email,
      telefone: novoCliente.cliente?.telefone,
      status: novoCliente.status
    }, { status: 201 });
  } catch (error) {
    console.error("Erro ao adicionar cliente:", error);
    return NextResponse.json({ error: "Erro ao adicionar cliente" }, { status: 500 });
  }
}
