import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET - Listar tarefas
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");
    const assignedToId = searchParams.get("assignedToId");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const pending = searchParams.get("pending"); // Tarefas pendentes (vencidas ou para hoje)

    const where: any = {};

    if (propertyId) {
      where.propertyId = propertyId;
    }

    if (assignedToId) {
      where.assignedToId = assignedToId;
    } else if (session.role !== "ADMIN") {
      // Se não for admin, só vê suas próprias tarefas
      where.assignedToId = session.id;
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (startDate && endDate) {
      where.dueDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Tarefas pendentes (vencidas ou para hoje)
    if (pending === "true") {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      where.status = { in: ["PENDENTE", "EM_ANDAMENTO"] };
      where.dueDate = { lte: today };
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            code: true,
            title: true,
            thumbnail: true,
          },
        },
        lead: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: [
        { status: "asc" },
        { dueDate: "asc" },
      ],
    });

    // Contar pendências
    const pendingCount = await prisma.task.count({
      where: {
        assignedToId: session.id,
        status: { in: ["PENDENTE", "EM_ANDAMENTO"] },
        dueDate: { lte: new Date() },
      },
    });

    return NextResponse.json({ tasks, pendingCount });
  } catch (error: any) {
    console.error("Erro ao listar tarefas:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Criar tarefa
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      type = "OUTRO",
      priority = "MEDIA",
      dueDate,
      dueTime,
      reminderDate,
      propertyId,
      leadId,
      assignedToId,
    } = body;

    if (!title || !dueDate) {
      return NextResponse.json(
        { error: "Título e data são obrigatórios" },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        type,
        priority,
        dueDate: new Date(dueDate),
        dueTime,
        reminderDate: reminderDate ? new Date(reminderDate) : null,
        propertyId,
        leadId,
        createdById: session.id,
        assignedToId: assignedToId || session.id,
      },
      include: {
        property: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ task });
  } catch (error: any) {
    console.error("Erro ao criar tarefa:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
