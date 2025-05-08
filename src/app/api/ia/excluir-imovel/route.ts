import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Extrair dados da requisição
    const { imovelId, userEmail } = await request.json();
    
    // Verificar se temos os dados necessários
    if (!userEmail) {
      return NextResponse.json({
        sucesso: false,
        mensagem: 'Email do usuário não fornecido'
      }, { status: 400 });
    }
    
    if (!imovelId) {
      return NextResponse.json({
        sucesso: false,
        mensagem: 'ID do imóvel não fornecido'
      }, { status: 400 });
    }
    
    // Buscar detalhes do usuário e sua imobiliária
    const userDetails = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        imobiliaria: true,
        corretor: true,
      },
    });

    if (!userDetails) {
      return NextResponse.json({
        sucesso: false,
        mensagem: 'Usuário não encontrado'
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
    
    // Buscar o imóvel para verificar se existe e se pertence à imobiliária
    const imovel = await prisma.imovel.findUnique({
      where: { id: imovelId },
    });
    
    if (!imovel) {
      return NextResponse.json({
        sucesso: false,
        mensagem: `Imóvel com ID ${imovelId} não encontrado`
      }, { status: 404 });
    }
    
    // Verificar se o imóvel pertence à mesma imobiliária do usuário
    if (imobiliariaId && imovel.imobiliariaId !== imobiliariaId) {
      return NextResponse.json({
        sucesso: false,
        mensagem: 'Você não tem permissão para excluir este imóvel'
      }, { status: 403 });
    }
    
    // Excluir o imóvel
    // Primeiro excluir relações - fotos, adicionais, etc.
    await prisma.$transaction(async (tx) => {
      // Excluir fotos associadas
      await tx.fotoImovel.deleteMany({
        where: { imovelId }
      });
      
      // Excluir relacionamentos com adicionais
      await tx.$executeRaw`DELETE FROM "_ImovelAdicionais" WHERE "A" = ${imovelId}`;
      
      // Finalmente excluir o imóvel
      await tx.imovel.delete({
        where: { id: imovelId }
      });
    });
    
    return NextResponse.json({
      sucesso: true,
      mensagem: `Imóvel ${imovel.titulo} (${imovel.codigo}) excluído com sucesso`
    });
    
  } catch (error: any) {
    console.error('Erro ao excluir imóvel:', error);
    
    return NextResponse.json({
      sucesso: false,
      mensagem: `Erro ao excluir imóvel: ${error.message || 'Erro desconhecido'}`,
      erro: error
    }, { status: 500 });
  }
}
