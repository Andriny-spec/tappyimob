import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { StatusImovel, TipoImovel } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Obter o período da query string
    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get('periodo') || 'mes';
    
    // Verificar se existe uma imobiliária associada ao usuário
    const imobiliaria = await prisma.imobiliaria.findUnique({
      where: {
        id: session.user.id // O id da imobiliária é o mesmo id do usuário
      }
    });
    
    if (!imobiliaria) {
      return NextResponse.json(
        { error: 'Imobiliária não encontrada para este usuário' },
        { status: 404 }
      );
    }
    
    // Buscar imóveis da imobiliária
    const imoveis = await prisma.imovel.findMany({
      where: {
        imobiliariaId: imobiliaria.id
      }
    });

    // Contar tipos e status de imóveis
    const tiposDeImovel = await prisma.imovel.groupBy({
      by: ['tipoImovel'],
      where: { 
        imobiliariaId: imobiliaria.id 
      },
      _count: {
        id: true
      }
    });

    const statusDeImovel = await prisma.imovel.groupBy({
      by: ['status'],
      where: { 
        imobiliariaId: imobiliaria.id 
      },
      _count: {
        id: true
      }
    });

    // Buscar imóveis mais visualizados (ordenados por data de criação como substituto temporário)
    const imoveisMaisVistos = await prisma.imovel.findMany({
      where: {
        imobiliariaId: imobiliaria.id
      },
      orderBy: {
        createdAt: 'desc' // Usamos createdAt como substituto de visualizações que não existe no modelo
      },
      take: 5,
      select: {
        id: true,
        titulo: true,
        tipoImovel: true,
        valor: true
      }
    });

    // Vamos simular vendas por mês (dados mockados por enquanto)
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const vendasPorMes = {
      labels: meses,
      datasets: [
        {
          label: 'Vendas',
          data: meses.map(() => Math.floor(Math.random() * 20) + 5)
        }
      ]
    };

    // Formatação dos dados para o formato necessário da UI
    const dadosPorTipo = {
      labels: tiposDeImovel.map(item => item.tipoImovel),
      datasets: [
        {
          label: 'Quantidade',
          data: tiposDeImovel.map(item => item._count.id)
        }
      ]
    };

    const dadosPorStatus = {
      labels: statusDeImovel.map(item => item.status),
      datasets: [
        {
          label: 'Quantidade',
          data: statusDeImovel.map(item => item._count.id)
        }
      ]
    };

    // Dados de retorno formatados
    const data = {
      estatisticasGerais: [
        {
          id: '1',
          titulo: 'Imóveis Cadastrados',
          valor: imoveis.length,
          comparacao: 'Crescimento de 10.9% este mês',
          porcentagem: 10.9,
          tendencia: 'alta',
          icone: 'Building2',
          cor: 'bg-blue-500/10'
        },
        {
          id: '2',
          titulo: 'Novos Leads',
          valor: 87,
          comparacao: 'Queda de 16.3% vs mês anterior',
          porcentagem: 16.3,
          tendencia: 'baixa',
          icone: 'User',
          cor: 'bg-purple-500/10'
        },
        {
          id: '3',
          titulo: 'Visualizações',
          valor: '9.458',
          comparacao: 'Crescimento de 12.9% este mês',
          porcentagem: 12.9,
          tendencia: 'alta',
          icone: 'Eye',
          cor: 'bg-green-500/10'
        },
        {
          id: '4',
          titulo: 'Tempo Médio',
          valor: '2m 36s',
          comparacao: 'Aumento de 18.2% este mês',
          porcentagem: 18.2,
          tendencia: 'alta',
          icone: 'Clock',
          cor: 'bg-amber-500/10'
        }
      ],
      vendasPorMes,
      imoveisPorTipo: dadosPorTipo,
      imoveisPorStatus: dadosPorStatus,
      imoveisMaisVistos: imoveisMaisVistos.map(imovel => ({
        id: imovel.id,
        titulo: imovel.titulo,
        tipo: imovel.tipoImovel, // Usando tipoImovel em vez de tipo
        preco: `R$ ${Number(imovel.valor).toLocaleString('pt-BR')}`, // Usando valor em vez de preco
        visualizacoes: Math.floor(Math.random() * 1000) + 100 // Gerando valor aleatório para visualizações
      }))
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('[RELATORIOS_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro ao obter relatórios' },
      { status: 500 }
    );
  }
}
