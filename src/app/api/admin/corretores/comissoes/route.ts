import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar comissões
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const corretorId = searchParams.get("corretorId");
    const status = searchParams.get("status");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const where: any = {};

    if (corretorId) where.corretorId = corretorId;
    if (status) where.status = status;
    
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const comissoes = await prisma.comissao.findMany({
      where,
      include: {
        corretor: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calcular totais
    const totals = {
      pago: comissoes.filter(c => c.status === "PAGO").reduce((acc, c) => acc + c.valorComissao, 0),
      pendente: comissoes.filter(c => c.status === "PENDENTE").reduce((acc, c) => acc + c.valorComissao, 0),
      processando: comissoes.filter(c => c.status === "PROCESSANDO").reduce((acc, c) => acc + c.valorComissao, 0),
      cancelado: comissoes.filter(c => c.status === "CANCELADO").reduce((acc, c) => acc + c.valorComissao, 0),
    };

    return NextResponse.json({ comissoes, totals });
  } catch (error) {
    console.error("Error fetching comissoes:", error);
    return NextResponse.json(
      { error: "Erro ao buscar comissões" },
      { status: 500 }
    );
  }
}

// POST - Criar comissão
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const valorComissao = (body.valorVenda * body.percentual) / 100;

    const comissao = await prisma.comissao.create({
      data: {
        valorVenda: body.valorVenda,
        percentual: body.percentual,
        valorComissao,
        imovelCodigo: body.imovelCodigo,
        imovelTitulo: body.imovelTitulo,
        corretorId: body.corretorId,
        status: "PENDENTE",
      },
      include: {
        corretor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(comissao, { status: 201 });
  } catch (error) {
    console.error("Error creating comissao:", error);
    return NextResponse.json(
      { error: "Erro ao criar comissão" },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar status da comissão
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID da comissão é obrigatório" },
        { status: 400 }
      );
    }

    const updateData: any = { status: body.status };
    
    if (body.status === "PAGO") {
      updateData.dataPagamento = new Date();
      
      // Atualizar totalValue do corretor
      const comissao = await prisma.comissao.findUnique({ where: { id } });
      if (comissao) {
        await prisma.user.update({
          where: { id: comissao.corretorId },
          data: {
            totalValue: { increment: comissao.valorComissao },
            totalSales: { increment: 1 },
          },
        });
      }
    }

    const comissao = await prisma.comissao.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(comissao);
  } catch (error) {
    console.error("Error updating comissao:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar comissão" },
      { status: 500 }
    );
  }
}
