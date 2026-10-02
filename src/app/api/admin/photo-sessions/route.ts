import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET - Listar agendamentos
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const photographerId = searchParams.get("photographerId");
    const propertyId = searchParams.get("propertyId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {};

    // Filtro por role: corretor vê apenas suas sessões, fotógrafo vê apenas atribuídas
    if (session.role === "CORRETOR") {
      where.brokerId = session.id;
    } else if (session.role === "FOTOGRAFO") {
      where.OR = [
        { photographerId: session.id },
        { photographerIds: { has: session.id } },
      ];
    }
    // ADMIN vê tudo

    if (status) {
      where.status = status;
    }

    if (photographerId) {
      where.photographerId = photographerId;
    }

    if (propertyId) {
      where.propertyId = propertyId;
    }

    if (startDate && endDate) {
      where.scheduledDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      where.scheduledDate = { gte: new Date(startDate) };
    }

    const sessions = await prisma.photoSession.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            code: true,
            title: true,
            address: true,
            number: true,
            neighborhood: true,
            city: true,
            thumbnail: true,
            type: true,
            category: true,
          },
        },
        photographer: {
          select: {
            id: true,
            name: true,
            avatar: true,
            phone: true,
          },
        },
        broker: {
          select: {
            id: true,
            name: true,
            avatar: true,
            phone: true,
          },
        },
        media: {
          select: {
            id: true,
            mediaType: true,
            status: true,
          },
        },
        _count: {
          select: {
            media: true,
          },
        },
      },
      orderBy: { scheduledDate: "asc" },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Erro ao listar agendamentos:", error);
    return NextResponse.json(
      { error: "Erro ao listar agendamentos" },
      { status: 500 }
    );
  }
}

// POST - Criar agendamento
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      propertyId,
      serviceTypes,
      scheduledDate,
      scheduledTime,
      estimatedDuration,
      photographerIds,
      brokerId,
      contactName,
      contactPhone,
      isOccupied,
      notes,
      address,
      accessInstructions,
    } = body;

    if (!propertyId || !scheduledDate || !scheduledTime) {
      return NextResponse.json(
        { error: "Imóvel, data e horário são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se já existe agendamento ativo para este imóvel
    const existingSession = await prisma.photoSession.findFirst({
      where: {
        propertyId,
        status: { in: ["AGENDADO", "PENDENTE_CONFIRMACAO", "EM_EDICAO"] },
      },
    });

    // Verificar se já existe sessão CONCLUIDA (requer autorização admin)
    const completedSession = await prisma.photoSession.findFirst({
      where: {
        propertyId,
        status: "CONCLUIDO",
      },
    });

    const requiresAdminApproval = !!completedSession;

    const createdSession = await prisma.photoSession.create({
      data: {
        propertyId,
        serviceTypes: serviceTypes || ["FOTO"],
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        estimatedDuration: estimatedDuration || 60,
        photographerIds: photographerIds || [],
        photographerId: photographerIds?.[0] || null,
        brokerId,
        contactName,
        contactPhone,
        isOccupied: isOccupied || false,
        notes,
        address,
        accessInstructions,
        requiresAdminApproval,
        adminApproved: false,
        history: {
          create: {
            action: "CRIADO",
            description: requiresAdminApproval 
              ? "Agendamento criado - Requer aprovação do admin (2º agendamento)"
              : "Agendamento criado",
          },
        },
      },
      include: {
        property: true,
        photographer: true,
        broker: true,
      },
    });

    return NextResponse.json({
      session: createdSession,
      hasExistingSession: !!existingSession,
      existingSession,
    });
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    return NextResponse.json(
      { error: "Erro ao criar agendamento" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar agendamento
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      serviceTypes,
      scheduledDate,
      scheduledTime,
      estimatedDuration,
      status,
      photographerIds,
      brokerId,
      brokerConfirmed,
      ownerConfirmed,
      contactName,
      notes,
      internalNotes,
      address,
      accessInstructions,
      adminApproved,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar sessão atual para histórico
    const currentSession = await prisma.photoSession.findUnique({
      where: { id },
    });

    if (!currentSession) {
      return NextResponse.json(
        { error: "Agendamento não encontrado" },
        { status: 404 }
      );
    }

    // Verificar permissão: corretor só edita suas sessões, fotógrafo campos limitados
    if (session.role === "CORRETOR" && currentSession.brokerId !== session.id) {
      return NextResponse.json({ error: "Sem permissão para editar este agendamento" }, { status: 403 });
    }
    if (session.role === "FOTOGRAFO" && currentSession.photographerId !== session.id && !currentSession.photographerIds.includes(session.id)) {
      return NextResponse.json({ error: "Sem permissão para editar este agendamento" }, { status: 403 });
    }

    // Preparar histórico de alterações
    const historyEntries: any[] = [];

    if (status && status !== currentSession.status) {
      historyEntries.push({
        action: "STATUS_ALTERADO",
        description: `Status alterado de ${currentSession.status} para ${status}`,
        metadata: { oldStatus: currentSession.status, newStatus: status },
      });
    }

    if (scheduledDate && new Date(scheduledDate).getTime() !== currentSession.scheduledDate.getTime()) {
      historyEntries.push({
        action: "REAGENDADO",
        description: `Data reagendada`,
        metadata: {
          oldDate: currentSession.scheduledDate,
          newDate: scheduledDate,
        },
      });
    }

    if (brokerConfirmed && !currentSession.brokerConfirmed) {
      historyEntries.push({
        action: "CONFIRMADO",
        description: "Corretor confirmou o agendamento",
      });
    }

    if (ownerConfirmed && !currentSession.ownerConfirmed) {
      historyEntries.push({
        action: "CONFIRMADO",
        description: "Proprietário confirmou o agendamento",
      });
    }

    const updatedSession = await prisma.photoSession.update({
      where: { id },
      data: {
        ...(serviceTypes !== undefined && { serviceTypes }),
        ...(scheduledDate !== undefined && { scheduledDate: new Date(scheduledDate) }),
        ...(scheduledTime !== undefined && { scheduledTime }),
        ...(estimatedDuration !== undefined && { estimatedDuration }),
        ...(status !== undefined && { status }),
        ...(photographerIds !== undefined && { 
          photographerIds,
          photographerId: photographerIds?.[0] || null,
        }),
        ...(brokerId !== undefined && { brokerId }),
        ...(brokerConfirmed !== undefined && {
          brokerConfirmed,
          brokerConfirmedAt: brokerConfirmed ? new Date() : null,
        }),
        ...(ownerConfirmed !== undefined && {
          ownerConfirmed,
          ownerConfirmedAt: ownerConfirmed ? new Date() : null,
        }),
        ...(contactName !== undefined && { contactName }),
        ...(notes !== undefined && { notes }),
        ...(internalNotes !== undefined && { internalNotes }),
        ...(address !== undefined && { address }),
        ...(accessInstructions !== undefined && { accessInstructions }),
        ...(adminApproved !== undefined && { 
          adminApproved,
          adminApprovedAt: adminApproved ? new Date() : null,
        }),
        ...(historyEntries.length > 0 && {
          history: {
            createMany: { data: historyEntries },
          },
        }),
      },
      include: {
        property: true,
        photographer: true,
        broker: true,
        media: true,
        history: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });

    return NextResponse.json({ session: updatedSession });
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar agendamento" },
      { status: 500 }
    );
  }
}

// DELETE - Cancelar agendamento
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Apenas ADMIN pode cancelar agendamentos
    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Apenas administradores podem cancelar agendamentos" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID é obrigatório" },
        { status: 400 }
      );
    }

    await prisma.photoSession.update({
      where: { id },
      data: {
        status: "CANCELADO",
        history: {
          create: {
            action: "CANCELADO",
            description: "Agendamento cancelado",
          },
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao cancelar agendamento:", error);
    return NextResponse.json(
      { error: "Erro ao cancelar agendamento" },
      { status: 500 }
    );
  }
}
