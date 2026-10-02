import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar agendamentos do lead
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const schedules = await prisma.leadSchedule.findMany({
      where: { leadId: id },
      orderBy: { date: "asc" },
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json(
      { error: "Erro ao buscar agendamentos" },
      { status: 500 }
    );
  }
}

// POST - Criar agendamento
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Append T12:00:00 to date-only string to force local timezone interpretation
    // Without this, new Date("2026-03-30") interprets as UTC midnight,
    // which in Brazil (UTC-3) becomes March 29th — shifting the date by 1 day
    const safeDate = body.date.includes("T") ? body.date : `${body.date}T12:00:00`;

    const schedule = await prisma.leadSchedule.create({
      data: {
        type: body.type,
        date: new Date(safeDate),
        time: body.time,
        notes: body.notes,
        leadId: id,
      },
    });

    // Atualizar nextFollowUp do lead
    await prisma.lead.update({
      where: { id },
      data: { nextFollowUp: new Date(safeDate) },
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error("Error creating schedule:", error);
    return NextResponse.json(
      { error: "Erro ao criar agendamento" },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar agendamento (completar/cancelar)
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get("scheduleId");
    const body = await request.json();

    if (!scheduleId) {
      return NextResponse.json(
        { error: "ID do agendamento é obrigatório" },
        { status: 400 }
      );
    }

    const schedule = await prisma.leadSchedule.update({
      where: { id: scheduleId },
      data: body,
    });

    return NextResponse.json(schedule);
  } catch (error) {
    console.error("Error updating schedule:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar agendamento" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir agendamento
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get("scheduleId");

    if (!scheduleId) {
      return NextResponse.json(
        { error: "ID do agendamento é obrigatório" },
        { status: 400 }
      );
    }

    await prisma.leadSchedule.delete({
      where: { id: scheduleId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json(
      { error: "Erro ao excluir agendamento" },
      { status: 500 }
    );
  }
}
