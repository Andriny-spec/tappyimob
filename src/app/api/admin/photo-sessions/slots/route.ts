import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar slots de horários
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const photographerId = searchParams.get("photographerId");
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {};

    if (photographerId) {
      where.photographerId = photographerId;
    }

    if (date) {
      where.date = new Date(date);
    } else if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const slots = await prisma.photoSessionSlot.findMany({
      where,
      include: {
        photographer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Erro ao listar slots:", error);
    return NextResponse.json(
      { error: "Erro ao listar slots" },
      { status: 500 }
    );
  }
}

// POST - Criar slot de horário
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { photographerId, date, startTime, endTime, slotType, notes } = body;

    if (!photographerId || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Fotógrafo, data, horário inicial e final são obrigatórios" },
        { status: 400 }
      );
    }

    const slot = await prisma.photoSessionSlot.create({
      data: {
        photographerId,
        date: new Date(date),
        startTime,
        endTime,
        slotType: slotType || "DISPONIVEL",
        notes,
      },
      include: {
        photographer: true,
      },
    });

    return NextResponse.json({ slot });
  } catch (error) {
    console.error("Erro ao criar slot:", error);
    return NextResponse.json(
      { error: "Erro ao criar slot" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar slot
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, date, startTime, endTime, slotType, notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID é obrigatório" },
        { status: 400 }
      );
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
    return NextResponse.json(
      { error: "Erro ao atualizar slot" },
      { status: 500 }
    );
  }
}

// DELETE - Remover slot
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID é obrigatório" },
        { status: 400 }
      );
    }

    await prisma.photoSessionSlot.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao remover slot:", error);
    return NextResponse.json(
      { error: "Erro ao remover slot" },
      { status: 500 }
    );
  }
}
