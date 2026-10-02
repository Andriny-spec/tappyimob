import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// PUT - Atualiza imóvel
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.summitCampaignProperty.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name.trim() }),
        ...(body.referenceCode !== undefined && { referenceCode: body.referenceCode?.trim() || null }),
        ...(body.price !== undefined && { price: body.price.trim() }),
        ...(body.bonus !== undefined && { bonus: body.bonus.trim() }),
        ...(body.bonusIcon !== undefined && { bonusIcon: body.bonusIcon }),
        ...(body.specs !== undefined && { specs: body.specs?.trim() || null }),
        ...(body.photoUrl !== undefined && { photoUrl: body.photoUrl || null }),
        ...(body.driveUrl !== undefined && { driveUrl: body.driveUrl || null }),
        ...(body.highlight !== undefined && { highlight: !!body.highlight }),
        ...(body.isActive !== undefined && { isActive: !!body.isActive }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar imóvel:", error);
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}

// DELETE
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { id } = await params;
    await prisma.summitCampaignProperty.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao deletar:", error);
    return NextResponse.json({ error: "Erro ao deletar" }, { status: 500 });
  }
}
