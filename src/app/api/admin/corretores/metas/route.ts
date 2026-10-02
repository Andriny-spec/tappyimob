import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar metas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const corretorId = searchParams.get("corretorId");
    const periodo = searchParams.get("periodo");

    const where: any = {};

    if (corretorId) where.corretorId = corretorId;
    if (periodo) where.periodo = periodo;

    const metas = await prisma.meta.findMany({
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

    return NextResponse.json(metas);
  } catch (error) {
    console.error("Error fetching metas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar metas" },
      { status: 500 }
    );
  }
}

// POST - Criar ou atualizar meta
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const meta = await prisma.meta.upsert({
      where: {
        corretorId_periodo: {
          corretorId: body.corretorId,
          periodo: body.periodo,
        },
      },
      update: {
        metaVendas: body.metaVendas ?? undefined,
        metaValor: body.metaValor ?? undefined,
        metaLeads: body.metaLeads ?? undefined,
        metaComissao: body.metaComissao ?? undefined,
        comissaoRealizada: body.comissaoRealizada ?? undefined,
        bonus: body.bonus || 0,
      },
      create: {
        corretorId: body.corretorId,
        periodo: body.periodo,
        metaVendas: body.metaVendas || 0,
        metaValor: body.metaValor || 0,
        metaLeads: body.metaLeads || 0,
        metaComissao: body.metaComissao || 0,
        comissaoRealizada: body.comissaoRealizada || 0,
        bonus: body.bonus || 0,
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

    return NextResponse.json(meta, { status: 201 });
  } catch (error) {
    console.error("Error creating meta:", error);
    return NextResponse.json(
      { error: "Erro ao criar meta" },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar progresso da meta
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID da meta é obrigatório" },
        { status: 400 }
      );
    }

    // Calcular status baseado no progresso
    const meta = await prisma.meta.findUnique({ where: { id } });
    if (!meta) {
      return NextResponse.json(
        { error: "Meta não encontrada" },
        { status: 404 }
      );
    }

    const vendasPercent = ((body.vendasRealizadas || meta.vendasRealizadas) / meta.metaVendas) * 100;
    const valorPercent = ((body.valorRealizado || meta.valorRealizado) / meta.metaValor) * 100;
    const leadsPercent = ((body.leadsConvertidos || meta.leadsConvertidos) / meta.metaLeads) * 100;
    
    const avgPercent = (vendasPercent + valorPercent + leadsPercent) / 3;

    let status = "EM_ANDAMENTO";
    if (avgPercent >= 120) status = "SUPERADA";
    else if (avgPercent >= 100) status = "ATINGIDA";
    else if (avgPercent < 50) status = "NAO_ATINGIDA";

    const updatedMeta = await prisma.meta.update({
      where: { id },
      data: {
        vendasRealizadas: body.vendasRealizadas ?? undefined,
        valorRealizado: body.valorRealizado ?? undefined,
        comissaoRealizada: body.comissaoRealizada ?? undefined,
        leadsConvertidos: body.leadsConvertidos ?? undefined,
        status: status as any,
      },
    });

    return NextResponse.json(updatedMeta);
  } catch (error) {
    console.error("Error updating meta:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar meta" },
      { status: 500 }
    );
  }
}
