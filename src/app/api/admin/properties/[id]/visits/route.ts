import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET - Listar visitas de um imóvel
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

    const visits = await prisma.propertyVisitRecord.findMany({
      where: { propertyId: id },
      orderBy: { visitDate: "desc" },
    });

    // Mapear para formato esperado pelo frontend
    const formattedVisits = visits.map(v => ({
      id: v.id,
      clientName: v.clientName,
      clientPhone: v.clientPhone,
      date: v.visitDate,
      rating: v.rating || 3,
      feedback: v.feedback,
      brokerName: v.brokerName,
      status: v.status,
    }));

    return NextResponse.json({ visits: formattedVisits });
  } catch (error) {
    console.error("Erro ao buscar visitas:", error);
    return NextResponse.json({ error: "Erro ao buscar visitas" }, { status: 500 });
  }
}

// POST - Criar nova visita
export async function POST(
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
    const { clientName, clientPhone, date, rating, feedback, brokerName } = body;

    if (!clientName || !date) {
      return NextResponse.json(
        { error: "Nome do cliente e data são obrigatórios" },
        { status: 400 }
      );
    }

    const visit = await prisma.propertyVisitRecord.create({
      data: {
        propertyId: id,
        clientName,
        clientPhone: clientPhone || null,
        visitDate: new Date(date),
        rating: rating || 3,
        feedback: feedback || null,
        brokerName: brokerName || (session as any).name || "Corretor",
        brokerId: (session as any).id,
        status: "REALIZADA",
      },
    });

    // Retornar no formato esperado pelo frontend
    const formattedVisit = {
      id: visit.id,
      clientName: visit.clientName,
      clientPhone: visit.clientPhone,
      date: visit.visitDate,
      rating: visit.rating || 3,
      feedback: visit.feedback,
      brokerName: visit.brokerName,
      status: visit.status,
    };

    return NextResponse.json({ visit: formattedVisit }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar visita:", error);
    return NextResponse.json({ error: "Erro ao criar visita" }, { status: 500 });
  }
}
