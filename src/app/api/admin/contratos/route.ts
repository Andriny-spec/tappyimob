import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar contratos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const category = searchParams.get("category"); // VENDA, LOCACAO, PERMUTA
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {};

    if (category) where.category = category;
    if (status) where.status = status;
    
    if (search) {
      where.OR = [
        { codigo: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { compradorNome: { contains: search, mode: "insensitive" } },
        { vendedorNome: { contains: search, mode: "insensitive" } },
        { locatarioNome: { contains: search, mode: "insensitive" } },
        { locadorNome: { contains: search, mode: "insensitive" } },
      ];
    }

    const contratos = await prisma.contract.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    
    // Buscar dados relacionados separadamente
    const contratosCompletos = await Promise.all(
      contratos.map(async (c: any) => {
        let property = null;
        let lead = null;
        let corretor = null;
        
        if (c.propertyId) {
          property = await prisma.property.findUnique({
            where: { id: c.propertyId },
            select: { id: true, code: true, title: true },
          });
        }
        if (c.leadId) {
          lead = await prisma.lead.findUnique({
            where: { id: c.leadId },
            select: { id: true, name: true, phone: true },
          });
        }
        if (c.corretorId) {
          corretor = await prisma.user.findUnique({
            where: { id: c.corretorId },
            select: { id: true, name: true },
          });
        }
        
        return { ...c, property, lead, corretor };
      })
    );

    // Calcular totais
    const totals = {
      total: contratosCompletos.length,
      rascunho: contratosCompletos.filter((c: any) => c.status === "RASCUNHO").length,
      enviado: contratosCompletos.filter((c: any) => c.status === "ENVIADO").length,
      assinado: contratosCompletos.filter((c: any) => c.status === "ASSINADO").length,
      cancelado: contratosCompletos.filter((c: any) => c.status === "CANCELADO").length,
      valorTotal: contratosCompletos.reduce((acc: number, c: any) => acc + (c.valor || 0), 0),
    };

    return NextResponse.json({ contratos: contratosCompletos, totals });
  } catch (error) {
    console.error("Error fetching contratos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar contratos" },
      { status: 500 }
    );
  }
}

// POST - Criar contrato
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Gerar código único
    const count = await prisma.contract.count();
    const prefix = body.category === "VENDA" ? "VND" : body.category === "LOCACAO" ? "LOC" : "PRM";
    const codigo = `${prefix}-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

    const contrato = await prisma.contract.create({
      data: {
        codigo,
        type: body.type || "CONTRATO",
        category: body.category,
        name: body.name,
        status: "RASCUNHO",
        valor: body.valor || 0,
        valorEntrada: body.valorEntrada,
        valorFinanciamento: body.valorFinanciamento,
        comissao: body.comissao,
        formaPagamento: body.formaPagamento,
        compradorNome: body.compradorNome,
        compradorDoc: body.compradorDoc,
        compradorEmail: body.compradorEmail,
        vendedorNome: body.vendedorNome,
        vendedorDoc: body.vendedorDoc,
        vendedorEmail: body.vendedorEmail,
        locatarioNome: body.locatarioNome,
        locatarioDoc: body.locatarioDoc,
        locadorNome: body.locadorNome,
        locadorDoc: body.locadorDoc,
        valorAluguel: body.valorAluguel,
        valorCaucao: body.valorCaucao,
        duracaoMeses: body.duracaoMeses,
        parte1Nome: body.parte1Nome,
        parte1Doc: body.parte1Doc,
        parte2Nome: body.parte2Nome,
        parte2Doc: body.parte2Doc,
        valorDiferenca: body.valorDiferenca,
        leadId: body.leadId,
        propertyId: body.propertyId,
        corretorId: body.corretorId,
      } as any,
    });

    return NextResponse.json(contrato, { status: 201 });
  } catch (error) {
    console.error("Error creating contrato:", error);
    return NextResponse.json(
      { error: "Erro ao criar contrato" },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar contrato
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID do contrato é obrigatório" },
        { status: 400 }
      );
    }

    const updateData: any = { ...body };
    
    // Se estiver assinando, registrar data
    if (body.status === "ASSINADO") {
      updateData.signedAt = new Date();
    }

    const contrato = await prisma.contract.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(contrato);
  } catch (error) {
    console.error("Error updating contrato:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar contrato" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir contrato
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID do contrato é obrigatório" },
        { status: 400 }
      );
    }

    await prisma.contract.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting contrato:", error);
    return NextResponse.json(
      { error: "Erro ao excluir contrato" },
      { status: 500 }
    );
  }
}
