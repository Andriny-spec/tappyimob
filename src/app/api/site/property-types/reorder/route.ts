import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Reordenar tipos de propriedade
export async function POST(request: NextRequest) {
  try {
    const { orderedIds } = await request.json();

    if (!orderedIds || !Array.isArray(orderedIds)) {
      return NextResponse.json(
        { error: "orderedIds é obrigatório e deve ser um array" },
        { status: 400 }
      );
    }

    // Atualizar a ordem de cada tipo
    const updates = orderedIds.map((id: string, index: number) =>
      prisma.propertyTypeCard.update({
        where: { id },
        data: { order: index },
      })
    );

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao reordenar tipos:", error);
    return NextResponse.json(
      { error: "Erro ao reordenar tipos" },
      { status: 500 }
    );
  }
}
