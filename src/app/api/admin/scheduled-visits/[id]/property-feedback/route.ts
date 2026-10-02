import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// PATCH - Atualizar feedback de um imóvel específico na visita
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id: visitId } = await params;
    const body = await request.json();
    const { propertyId, liked, feedback } = body;

    if (!propertyId) {
      return NextResponse.json({ error: "propertyId é obrigatório" }, { status: 400 });
    }

    // Verificar se o usuário é o corretor que agendou a visita (ou admin)
    const visit = await prisma.scheduledVisit.findUnique({
      where: { id: visitId },
      select: { corretorId: true },
    });

    if (!visit) {
      return NextResponse.json({ error: "Visita não encontrada" }, { status: 404 });
    }

    if (session.role !== "ADMIN" && visit.corretorId !== session.id) {
      return NextResponse.json({ error: "Apenas o corretor responsável pode editar o feedback" }, { status: 403 });
    }

    const visitProperty = await prisma.scheduledVisitProperty.findUnique({
      where: { visitId_propertyId: { visitId, propertyId } },
    });

    if (!visitProperty) {
      return NextResponse.json({ error: "Imóvel não encontrado nesta visita" }, { status: 404 });
    }

    const updated = await prisma.scheduledVisitProperty.update({
      where: { visitId_propertyId: { visitId, propertyId } },
      data: {
        ...(liked !== undefined && { liked }),
        ...(feedback !== undefined && { feedback }),
      },
      include: {
        property: {
          select: { id: true, code: true, title: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar feedback:", error);
    return NextResponse.json({ error: "Erro ao atualizar feedback" }, { status: 500 });
  }
}
