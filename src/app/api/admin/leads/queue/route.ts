import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar filas de atendimento
export async function GET() {
  try {
    const queues = await prisma.leadQueue.findMany({
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
          orderBy: { turnOrder: "asc" },
        },
        _count: {
          select: { assignments: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ queues });
  } catch (error) {
    console.error("Erro ao buscar filas:", error);
    return NextResponse.json({ error: "Erro ao buscar filas" }, { status: 500 });
  }
}

// POST - Criar nova fila
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, rotationType, rules, workingHours, memberIds, responseTimeMinutes, delayRules } = body;

    if (!name) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    const queue = await prisma.leadQueue.create({
      data: {
        name,
        description,
        rotationType: rotationType || "ROUND_ROBIN",
        responseTimeMinutes: responseTimeMinutes ? parseInt(responseTimeMinutes) : null,
        rules,
        delayRules: delayRules || null,
        workingHours,
        members: memberIds?.length
          ? {
              create: memberIds.map((userId: string, index: number) => ({
                userId,
                turnOrder: index,
              })),
            }
          : undefined,
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ queue });
  } catch (error) {
    console.error("Erro ao criar fila:", error);
    return NextResponse.json({ error: "Erro ao criar fila" }, { status: 500 });
  }
}

// PUT - Atualizar fila
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, rotationType, rules, workingHours, isActive, memberIds, responseTimeMinutes, delayRules } = body;

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    // Atualizar dados da fila
    const queue = await prisma.leadQueue.update({
      where: { id },
      data: {
        name,
        description,
        rotationType,
        responseTimeMinutes: responseTimeMinutes !== undefined
          ? (responseTimeMinutes ? parseInt(responseTimeMinutes) : null)
          : undefined,
        rules,
        delayRules: delayRules !== undefined ? (delayRules || null) : undefined,
        workingHours,
        isActive,
      },
    });

    // Atualizar membros se memberIds foi enviado
    if (memberIds !== undefined) {
      const currentMembers = await prisma.leadQueueMember.findMany({
        where: { queueId: id },
        select: { userId: true },
      });
      const currentIds = currentMembers.map((m) => m.userId);

      // Remover membros que não estão mais na lista
      const toRemove = currentIds.filter((uid) => !memberIds.includes(uid));
      if (toRemove.length > 0) {
        await prisma.leadQueueMember.deleteMany({
          where: { queueId: id, userId: { in: toRemove } },
        });
      }

      // Adicionar novos membros
      const toAdd = memberIds.filter((uid: string) => !currentIds.includes(uid));
      if (toAdd.length > 0) {
        await prisma.leadQueueMember.createMany({
          data: toAdd.map((userId: string, index: number) => ({
            queueId: id,
            userId,
            turnOrder: currentIds.length + index,
          })),
        });
      }

      // Atualizar turnOrder para todos os membros
      for (let i = 0; i < memberIds.length; i++) {
        await prisma.leadQueueMember.updateMany({
          where: { queueId: id, userId: memberIds[i] },
          data: { turnOrder: i },
        });
      }
    }

    // Retornar fila atualizada com membros
    const updatedQueue = await prisma.leadQueue.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
          orderBy: { turnOrder: "asc" },
        },
        _count: { select: { assignments: true } },
      },
    });

    return NextResponse.json({ queue: updatedQueue });
  } catch (error) {
    console.error("Erro ao atualizar fila:", error);
    return NextResponse.json({ error: "Erro ao atualizar fila" }, { status: 500 });
  }
}

// DELETE - Deletar fila
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    await prisma.leadQueue.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar fila:", error);
    return NextResponse.json({ error: "Erro ao deletar fila" }, { status: 500 });
  }
}
