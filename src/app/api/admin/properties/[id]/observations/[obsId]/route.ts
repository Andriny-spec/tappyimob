import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// PATCH - Atualizar observação (fixar/desfixar)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; obsId: string }> }
) {
  try {
    const { id, obsId } = await params;
    const user = await getCurrentUser();
    
    if (!user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { isPinned, content } = body;

    try {
      const updateData: any = {};
      if (isPinned !== undefined) updateData.isPinned = isPinned;
      if (content !== undefined) updateData.content = content;

      const observation = await (prisma as any).propertyObservation.update({
        where: { id: obsId },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return NextResponse.json({ observation });
    } catch (error) {
      // Tabela ainda não existe ou observação não encontrada
      return NextResponse.json(
        { error: "Observação não encontrada" },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error("Erro ao atualizar observação:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar observação" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir observação
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; obsId: string }> }
) {
  try {
    const { id, obsId } = await params;
    const user = await getCurrentUser();
    
    if (!user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    try {
      await (prisma as any).propertyObservation.delete({
        where: { id: obsId },
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json(
        { error: "Observação não encontrada" },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error("Erro ao excluir observação:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao excluir observação" },
      { status: 500 }
    );
  }
}
