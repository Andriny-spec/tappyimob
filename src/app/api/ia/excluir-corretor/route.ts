import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Extrair dados da requisição
    const { email, userEmail } = await request.json();
    
    // Verificar se temos um email (passado da rota principal)
    const adminEmail = userEmail || '';
    
    if (!adminEmail) {
      return NextResponse.json({
        sucesso: false,
        mensagem: 'Email do usuário administrador não fornecido'
      }, { status: 400 });
    }
    
    if (!email) {
      return NextResponse.json({
        sucesso: false,
        mensagem: 'Email do corretor a ser excluído não fornecido'
      }, { status: 400 });
    }
    
    // Buscar detalhes do usuário e sua imobiliária
    const userDetails = await prisma.user.findUnique({
      where: { email: adminEmail },
      include: {
        imobiliaria: true,
        corretor: true,
      },
    });

    if (!userDetails) {
      return NextResponse.json({
        sucesso: false,
        mensagem: 'Usuário administrador não encontrado'
      }, { status: 404 });
    }
    
    // Determinar a imobiliária associada
    let imobiliariaId = null;
    
    if (userDetails.role === 'IMOBILIARIA' && userDetails.imobiliaria) {
      imobiliariaId = userDetails.imobiliaria.id;
    } else if (userDetails.role === 'CORRETOR' && userDetails.corretor?.imobiliariaId) {
      imobiliariaId = userDetails.corretor.imobiliariaId;
    } else if (userDetails.role !== 'ADMIN') {
      return NextResponse.json({
        sucesso: false,
        mensagem: 'Usuário sem imobiliária associada'
      }, { status: 403 });
    }
    
    // Buscar o corretor a ser excluído
    const corretorUser = await prisma.user.findUnique({
      where: { email },
      include: {
        corretor: true
      }
    });
    
    if (!corretorUser || !corretorUser.corretor) {
      return NextResponse.json({
        sucesso: false,
        mensagem: `Corretor com email ${email} não encontrado`
      }, { status: 404 });
    }
    
    // Verificar se o corretor pertence à mesma imobiliária do usuário
    if (imobiliariaId && corretorUser.corretor.imobiliariaId !== imobiliariaId) {
      return NextResponse.json({
        sucesso: false,
        mensagem: 'Você não tem permissão para excluir este corretor'
      }, { status: 403 });
    }
    
    // Excluir o corretor e seu usuário associado
    await prisma.$transaction(async (tx) => {
      // Primeiro excluir o corretor
      await tx.corretor.delete({
        where: { id: corretorUser.corretor!.id }
      });
      
      // Depois excluir o usuário
      await tx.user.delete({
        where: { id: corretorUser.id }
      });
    });
    
    return NextResponse.json({
      sucesso: true,
      mensagem: `Corretor ${corretorUser.nome} (${email}) excluído com sucesso`
    });
    
  } catch (error: any) {
    console.error('Erro ao excluir corretor:', error);
    
    return NextResponse.json({
      sucesso: false,
      mensagem: `Erro ao excluir corretor: ${error.message || 'Erro desconhecido'}`,
      erro: error
    }, { status: 500 });
  }
}
