import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET - Buscar visita por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    const visit = await prisma.scheduledVisit.findUnique({
      where: { id },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        corretor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        properties: {
          include: {
            property: {
              select: {
                id: true,
                code: true,
                title: true,
                address: true,
                neighborhood: true,
                city: true,
                thumbnail: true,
                images: true,
              },
            },
          },
          orderBy: {
            visitOrder: "asc",
          },
        },
      },
    });

    if (!visit) {
      return NextResponse.json(
        { error: "Visita não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(visit);
  } catch (error) {
    console.error("Erro ao buscar visita:", error);
    return NextResponse.json(
      { error: "Erro ao buscar visita" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar visita
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      date,
      time,
      endTime,
      status,
      notes,
      internalNotes,
      feedback,
      rating,
      corretorId,
      propertyIds,
      cancelReason,
      cancelNotes,
    } = body;

    // Verificar se visita existe
    const existingVisit = await prisma.scheduledVisit.findUnique({
      where: { id },
      include: { properties: true },
    });

    if (!existingVisit) {
      return NextResponse.json(
        { error: "Visita não encontrada" },
        { status: 404 }
      );
    }

    // Preparar dados de atualização
    const updateData: any = {};

    if (date) updateData.date = new Date(date);
    if (time) updateData.time = time;
    if (endTime !== undefined) updateData.endTime = endTime;
    if (status) {
      updateData.status = status;
      
      // Timestamps baseados no status
      if (status === "CONFIRMADA" && !existingVisit.confirmedAt) {
        updateData.confirmedAt = new Date();
      }
      if (status === "CANCELADA" && !existingVisit.cancelledAt) {
        updateData.cancelledAt = new Date();
      }
      if (status === "CANCELADA" && cancelReason) {
        updateData.cancelReason = cancelReason;
        if (cancelNotes) updateData.cancelNotes = cancelNotes;
      }
      if (status === "REALIZADA" && !existingVisit.completedAt) {
        updateData.completedAt = new Date();
      }
    }
    if (notes !== undefined) updateData.notes = notes;
    if (internalNotes !== undefined) updateData.internalNotes = internalNotes;
    if (feedback !== undefined) updateData.feedback = feedback;
    if (rating !== undefined) updateData.rating = rating;
    if (corretorId) updateData.corretorId = corretorId;
    if (cancelReason !== undefined) updateData.cancelReason = cancelReason;
    if (cancelNotes !== undefined) updateData.cancelNotes = cancelNotes;

    // Atualizar visita
    const visit = await prisma.scheduledVisit.update({
      where: { id },
      data: updateData,
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        corretor: {
          select: {
            id: true,
            name: true,
          },
        },
        properties: {
          include: {
            property: {
              select: {
                id: true,
                code: true,
                title: true,
                address: true,
                neighborhood: true,
                city: true,
              },
            },
          },
        },
      },
    });

    // Se propertyIds foi enviado, atualizar os imóveis
    if (propertyIds && Array.isArray(propertyIds)) {
      // Remover associações antigas
      await prisma.scheduledVisitProperty.deleteMany({
        where: { visitId: id },
      });

      // Criar novas associações
      await prisma.scheduledVisitProperty.createMany({
        data: propertyIds.map((propertyId: string, index: number) => ({
          visitId: id,
          propertyId,
          visitOrder: index,
        })),
      });
    }

    // Registrar atividade no lead se houver mudança de status
    if (status && existingVisit.leadId) {
      const statusLabels: Record<string, string> = {
        CONFIRMADA: "confirmada",
        REALIZADA: "realizada",
        CANCELADA: "cancelada",
        REAGENDADA: "reagendada",
        NAO_COMPARECEU: "marcada como não compareceu",
      };

      if (statusLabels[status]) {
        await prisma.leadActivity.create({
          data: {
            leadId: existingVisit.leadId,
            type: `VISITA_${status}`,
            description: `Visita ${statusLabels[status]} - ${new Date(visit.date).toLocaleDateString("pt-BR", { timeZone: "UTC" })} às ${visit.time}`,
            metadata: {
              visitId: visit.id,
              status,
            },
            userId: session.id,
          },
        });
      }
    }

    return NextResponse.json(visit);
  } catch (error) {
    console.error("Erro ao atualizar visita:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar visita" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir visita
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Verificar se visita existe
    const existingVisit = await prisma.scheduledVisit.findUnique({
      where: { id },
    });

    if (!existingVisit) {
      return NextResponse.json(
        { error: "Visita não encontrada" },
        { status: 404 }
      );
    }

    // Excluir (cascade deleta os ScheduledVisitProperty)
    await prisma.scheduledVisit.delete({
      where: { id },
    });

    // Registrar atividade no lead se houver
    if (existingVisit.leadId) {
      await prisma.leadActivity.create({
        data: {
          leadId: existingVisit.leadId,
          type: "VISITA_EXCLUIDA",
          description: `Visita excluída - ${new Date(existingVisit.date).toLocaleDateString("pt-BR", { timeZone: "UTC" })} às ${existingVisit.time}`,
          metadata: {
            visitId: id,
          },
          userId: session.id,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir visita:", error);
    return NextResponse.json(
      { error: "Erro ao excluir visita" },
      { status: 500 }
    );
  }
}
