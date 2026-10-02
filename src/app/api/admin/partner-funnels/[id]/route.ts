import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Buscar funil por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const funnel = await prisma.partnerFunnel.findUnique({
      where: { id },
      include: {
        stages: {
          orderBy: { order: "asc" },
          include: {
            partners: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar: true,
                lastEmailContact: true,
                lastWhatsappContact: true,
                stageEnteredAt: true,
              },
            },
            _count: { select: { partners: true } },
          },
        },
        automations: true,
      },
    });

    if (!funnel) {
      return NextResponse.json({ error: "Funil não encontrado" }, { status: 404 });
    }

    return NextResponse.json(funnel);
  } catch (error) {
    console.error("Erro ao buscar funil:", error);
    return NextResponse.json({ error: "Erro ao buscar funil" }, { status: 500 });
  }
}

// PATCH - Atualizar funil
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const funnel = await prisma.partnerFunnel.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        partnerTypes: body.partnerTypes,
        isDefault: body.isDefault,
        isActive: body.isActive,
      },
      include: {
        stages: { orderBy: { order: "asc" } },
        automations: true,
      },
    });

    return NextResponse.json(funnel);
  } catch (error) {
    console.error("Erro ao atualizar funil:", error);
    return NextResponse.json({ error: "Erro ao atualizar funil" }, { status: 500 });
  }
}

// DELETE - Remover funil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.partnerFunnel.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao remover funil:", error);
    return NextResponse.json({ error: "Erro ao remover funil" }, { status: 500 });
  }
}
