import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// POST /api/admin/properties/[id]/confirm-availability
// Confirma que o imóvel ainda está disponível (atualiza data de última verificação)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    
    // Buscar updatedAt antes de atualizar
    const propBefore = await prisma.property.findUnique({ where: { id }, select: { updatedAt: true } });
    const property = await prisma.property.update({
      where: { id },
      data: {
        lastAvailabilityCheck: new Date(),
        availabilityConfirmedById: session?.id || null,
      },
      select: {
        id: true,
        lastAvailabilityCheck: true,
        availabilityConfirmedById: true,
        availabilityConfirmedBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });
    // Preservar updatedAt original — verificação de disponibilidade não altera essa data
    if (propBefore) await prisma.$executeRaw`UPDATE "properties" SET "updatedAt" = ${propBefore.updatedAt} WHERE "id" = ${id}`;

    return NextResponse.json({
      success: true,
      lastAvailabilityCheck: property.lastAvailabilityCheck,
      confirmedBy: property.availabilityConfirmedBy,
    });
  } catch (error) {
    console.error("Erro ao confirmar disponibilidade:", error);
    return NextResponse.json(
      { error: "Erro ao confirmar disponibilidade" },
      { status: 500 }
    );
  }
}
