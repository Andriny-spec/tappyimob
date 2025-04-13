import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { Role } from "@prisma/client";

// GET - Listar corretores da imobiliária
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

    // Buscar todos os corretores vinculados à imobiliária
    const corretores = await prisma.corretor.findMany({
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
        imoveis: {
          where: {
            status: {
              in: ["ATIVO", "EM_ANALISE"]
            }
          }
        }
      }
    });

    // Retornar os dados formatados
    const corretoresFormatados = corretores.map(corretor => ({
      id: corretor.id,
      nome: corretor.user.nome,
      email: corretor.user.email,
      telefone: corretor.telefone || "",
      creci: corretor.creci || "",
      endereco: corretor.endereco || "",
      cidade: corretor.cidade || "",
      estado: corretor.estado || "",
      fotoPerfil: corretor.fotoPerfil || "",
      status: corretor.user.status,
      imoveisAtivos: corretor.imoveis.length,
      createdAt: corretor.user.createdAt,
      updatedAt: corretor.user.updatedAt
    }));

    return NextResponse.json(corretoresFormatados);
  } catch (error) {
    console.error("Erro ao listar corretores:", error);
    return NextResponse.json({ error: "Erro ao buscar corretores" }, { status: 500 });
  }
}

// POST - Adicionar novo corretor à imobiliária
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

    // Criar o usuário corretor
    const novoCorretor = await prisma.user.create({
      data: {
        nome: dados.nome,
        email: dados.email,
        senha: dados.senha, // Idealmente essa senha deveria ser criptografada
        role: Role.CORRETOR,
        corretor: {
          create: {
            telefone: dados.telefone,
            endereco: dados.endereco,
            bairro: dados.bairro,
            numero: dados.numero,
            cidade: dados.cidade,
            estado: dados.estado,
            creci: dados.creci,
            cpf: dados.cpf,
            cnpj: dados.cnpj,
            imobiliariaId: imobiliariaId
          }
        }
      },
      include: {
        corretor: true
      }
    });

    return NextResponse.json({
      id: novoCorretor.id,
      nome: novoCorretor.nome,
      email: novoCorretor.email,
      telefone: novoCorretor.corretor?.telefone,
      status: novoCorretor.status
    }, { status: 201 });
  } catch (error) {
    console.error("Erro ao adicionar corretor:", error);
    return NextResponse.json({ error: "Erro ao adicionar corretor" }, { status: 500 });
  }
}
