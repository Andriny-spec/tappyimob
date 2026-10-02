import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET - Buscar corretor por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const corretor = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        creci: true,
        region: true,
        role: true,
        bio: true,
        isActive: true,
        rating: true,
        ratingCount: true,
        totalSales: true,
        totalValue: true,
        conversionRate: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            leads: true,
            comissoes: true,
            properties: true,
          },
        },
      },
    });

    if (!corretor) {
      return NextResponse.json({ error: "Corretor não encontrado" }, { status: 404 });
    }

    return NextResponse.json(corretor);
  } catch (error) {
    console.error("Error fetching corretor:", error);
    return NextResponse.json(
      { error: "Erro ao buscar corretor" },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar corretor
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Campos permitidos para atualização
    const allowedFields = [
      "name", "email", "phone", "creci", "region", "bio", "isActive", "avatar", "role"
    ];

    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Suporte a alteração de senha
    if (body.password && body.password.length >= 6) {
      updateData.password = await bcrypt.hash(body.password, 10);
    }

    const corretor = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(corretor);
  } catch (error) {
    console.error("Error updating corretor:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar corretor" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir corretor
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verificar se o corretor existe
    const corretor = await prisma.user.findUnique({ where: { id } });
    if (!corretor) {
      return NextResponse.json({ error: "Corretor não encontrado" }, { status: 404 });
    }

    // Verificar se tem leads atribuídos
    const leadsCount = await prisma.lead.count({ where: { corretorId: id } });
    if (leadsCount > 0) {
      // Desatribuir leads antes de excluir
      await prisma.lead.updateMany({
        where: { corretorId: id },
        data: { corretorId: null },
      });
    }

    // Excluir corretor
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Corretor excluído com sucesso" });
  } catch (error) {
    console.error("Error deleting corretor:", error);
    return NextResponse.json(
      { error: "Erro ao excluir corretor" },
      { status: 500 }
    );
  }
}
