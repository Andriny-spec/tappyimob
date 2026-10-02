import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET - Listar visitas do imóvel
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

    // Formatar para incluir info do corretor
    const formattedVisits = visits.map((visit) => ({
      ...visit,
      broker: {
        id: visit.brokerId,
        name: visit.brokerName,
      },
    }));

    return NextResponse.json({ visits: formattedVisits });
  } catch (error) {
    console.error("Error fetching visits:", error);
    return NextResponse.json(
      { error: "Erro ao buscar visitas" },
      { status: 500 }
    );
  }
}

// POST - Registrar nova visita
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
    const { 
      visitDate, 
      clientName, 
      clientPhone, 
      clientEmail, 
      feedback, 
      brokerNotes,
      rating, 
      status 
    } = body;

    if (!clientName) {
      return NextResponse.json(
        { error: "Nome do cliente é obrigatório" },
        { status: 400 }
      );
    }

    const visit = await prisma.propertyVisitRecord.create({
      data: {
        property: { connect: { id } },
        visitDate: new Date(visitDate || new Date()),
        clientName,
        clientPhone: clientPhone || null,
        clientEmail: clientEmail || null,
        feedback: feedback || null,
        brokerNotes: brokerNotes || null,
        rating: rating || null,
        status: status || "REALIZADA",
        brokerId: session.id,
        brokerName: session.name || "Corretor",
      },
    });

    // Incrementar contador de visitas sem alterar updatedAt (SQL raw)
    await prisma.$executeRaw`UPDATE "properties" SET "inPersonVisits" = "inPersonVisits" + 1 WHERE "id" = ${id}`;

    return NextResponse.json({ 
      visit: {
        ...visit,
        broker: { id: visit.brokerId, name: visit.brokerName },
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating visit:", error);
    return NextResponse.json(
      { error: "Erro ao registrar visita" },
      { status: 500 }
    );
  }
}
