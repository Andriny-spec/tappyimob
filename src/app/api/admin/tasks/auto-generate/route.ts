import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// POST - Auto-gerar tarefas para imóveis com previsão de entrega de obra próxima
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const now = new Date();
    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);

    // Buscar imóveis com expectedDelivery nos próximos 30 dias ou já vencidas (até 60 dias atrás)
    const past60Days = new Date();
    past60Days.setDate(past60Days.getDate() - 60);

    const properties = await prisma.property.findMany({
      where: {
        isLaunchProject: true,
        expectedDelivery: {
          gte: past60Days,
          lte: in30Days,
        },
        status: { notIn: ["VENDIDO", "LOCADO", "INATIVO"] },
      },
      select: {
        id: true,
        code: true,
        title: true,
        expectedDelivery: true,
        address: true,
        exclusivity: {
          select: {
            captadorId: true,
            captadorName: true,
          },
        },
      },
    });

    let created = 0;
    let skipped = 0;

    for (const property of properties) {
      if (!property.expectedDelivery) continue;

      const deliveryDate = new Date(property.expectedDelivery);
      const daysUntilDelivery = Math.ceil((deliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Determinar título e prioridade baseado na proximidade
      let taskTitle: string;
      let priority: string;

      if (daysUntilDelivery < 0) {
        taskTitle = `Obra vencida há ${Math.abs(daysUntilDelivery)} dias — Verificar andamento`;
        priority = "URGENTE";
      } else if (daysUntilDelivery <= 7) {
        taskTitle = `Entrega da obra em ${daysUntilDelivery} dias — Acompanhar`;
        priority = "ALTA";
      } else if (daysUntilDelivery <= 15) {
        taskTitle = `Previsão de entrega em ${daysUntilDelivery} dias — Verificar`;
        priority = "MEDIA";
      } else {
        taskTitle = `Previsão de entrega em ${daysUntilDelivery} dias`;
        priority = "BAIXA";
      }

      // Verificar se já existe tarefa similar recente (últimos 15 dias) para evitar duplicatas
      const existingTask = await prisma.task.findFirst({
        where: {
          propertyId: property.id,
          title: { contains: "obra", mode: "insensitive" },
          status: { in: ["PENDENTE", "EM_ANDAMENTO"] },
          createdAt: {
            gte: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
          },
        },
      });

      if (existingTask) {
        skipped++;
        continue;
      }

      // Também verificar por tarefas com "entrega" no título
      const existingTask2 = await prisma.task.findFirst({
        where: {
          propertyId: property.id,
          title: { contains: "entrega", mode: "insensitive" },
          status: { in: ["PENDENTE", "EM_ANDAMENTO"] },
          createdAt: {
            gte: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
          },
        },
      });

      if (existingTask2) {
        skipped++;
        continue;
      }

      // Determinar quem será responsável (captador > session user)
      const assignedToId = property.exclusivity?.captadorId || session.id;

      // Criar tarefa
      await prisma.task.create({
        data: {
          title: taskTitle,
          description: `Imóvel #${property.code} — ${property.title || property.address || ""}\nPrevisão de entrega: ${deliveryDate.toLocaleDateString("pt-BR")}`,
          type: "VISTORIA",
          priority: priority as any,
          status: "PENDENTE",
          dueDate: daysUntilDelivery > 7 ? new Date(deliveryDate.getTime() - 7 * 24 * 60 * 60 * 1000) : now,
          propertyId: property.id,
          createdById: session.id,
          assignedToId,
        },
      });

      created++;
    }

    return NextResponse.json({
      success: true,
      propertiesChecked: properties.length,
      tasksCreated: created,
      tasksSkipped: skipped,
    });
  } catch (error: any) {
    console.error("Erro ao auto-gerar tarefas:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
