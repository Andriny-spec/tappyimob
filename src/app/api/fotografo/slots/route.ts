import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyFotografoAccess } from "@/lib/fotografo-auth";

const verifyToken = verifyFotografoAccess;

// GET - Listar slots do fotógrafo logado
export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {
      photographerId: user.userId,
    };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const slots = await prisma.photoSessionSlot.findMany({
      where,
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Erro ao listar slots:", error);
    return NextResponse.json({ error: "Erro ao listar slots" }, { status: 500 });
  }
}

// POST - Criar novo slot
export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { date, startTime, endTime, slotType, notes } = body;

    if (!date || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Data, horário inicial e final são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se já existe slot neste horário
    const existingSlot = await prisma.photoSessionSlot.findFirst({
      where: {
        photographerId: user.userId,
        date: new Date(date),
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } },
            ],
          },
        ],
      },
    });

    if (existingSlot) {
      return NextResponse.json(
        { error: "Já existe um horário conflitante neste período" },
        { status: 400 }
      );
    }

    const slot = await prisma.photoSessionSlot.create({
      data: {
        photographerId: user.userId,
        date: new Date(date),
        startTime,
        endTime,
        slotType: slotType || "DISPONIVEL",
        notes,
      },
    });

    return NextResponse.json({ slot });
  } catch (error) {
    console.error("Erro ao criar slot:", error);
    return NextResponse.json({ error: "Erro ao criar slot" }, { status: 500 });
  }
}

// PUT - Atualizar slot
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { id, date, startTime, endTime, slotType, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    // Verificar se o slot pertence ao fotógrafo
    const existingSlot = await prisma.photoSessionSlot.findUnique({
      where: { id },
    });

    if (!existingSlot || existingSlot.photographerId !== user.userId) {
      return NextResponse.json({ error: "Slot não encontrado" }, { status: 404 });
    }

    const slot = await prisma.photoSessionSlot.update({
      where: { id },
      data: {
        ...(date !== undefined && { date: new Date(date) }),
        ...(startTime !== undefined && { startTime }),
        ...(endTime !== undefined && { endTime }),
        ...(slotType !== undefined && { slotType }),
        ...(notes !== undefined && { notes }),
      },
    });

    return NextResponse.json({ slot });
  } catch (error) {
    console.error("Erro ao atualizar slot:", error);
    return NextResponse.json({ error: "Erro ao atualizar slot" }, { status: 500 });
  }
}

// DELETE - Remover slot
export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    // Verificar se o slot pertence ao fotógrafo
    const existingSlot = await prisma.photoSessionSlot.findUnique({
      where: { id },
    });

    if (!existingSlot || existingSlot.photographerId !== user.userId) {
      return NextResponse.json({ error: "Slot não encontrado" }, { status: 404 });
    }

    await prisma.photoSessionSlot.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao remover slot:", error);
    return NextResponse.json({ error: "Erro ao remover slot" }, { status: 500 });
  }
}
