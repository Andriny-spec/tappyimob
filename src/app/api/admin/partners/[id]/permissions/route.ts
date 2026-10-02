import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Buscar permissões do parceiro
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const permissions = await prisma.partnerPermission.findUnique({
      where: { partnerId: id },
    });

    if (!permissions) {
      return NextResponse.json({ error: "Permissões não encontradas" }, { status: 404 });
    }

    return NextResponse.json({ permissions });
  } catch (error) {
    console.error("Erro ao buscar permissões:", error);
    return NextResponse.json({ error: "Erro ao buscar permissões" }, { status: 500 });
  }
}

// PUT - Atualizar permissões
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const permissions = await prisma.partnerPermission.upsert({
      where: { partnerId: id },
      update: body,
      create: {
        partnerId: id,
        ...body,
      },
    });

    return NextResponse.json({ permissions });
  } catch (error) {
    console.error("Erro ao atualizar permissões:", error);
    return NextResponse.json({ error: "Erro ao atualizar permissões" }, { status: 500 });
  }
}
