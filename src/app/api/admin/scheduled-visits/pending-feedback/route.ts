import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET - Buscar visitas realizadas com feedback pendente por imóvel
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ items: [] });
    }

    const userId = session.id;

    // Buscar ScheduledVisitProperty sem feedback para visitas REALIZADAS do corretor
    // Feedback pendente = liked é null E feedback vazio/null E visita principal sem feedback
    const pendingItems = await prisma.scheduledVisitProperty.findMany({
      where: {
        liked: null,
        OR: [
          { feedback: null },
          { feedback: "" },
        ],
        visit: {
          status: "REALIZADA",
          corretorId: userId,
          // Excluir visitas que já têm feedback no model principal
          feedback: null,
        },
      },
      select: {
        visitId: true,
        propertyId: true,
        visit: {
          select: {
            date: true,
            lead: { select: { name: true } },
            visitorName: true,
          },
        },
        property: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
      },
      orderBy: {
        visit: { date: "desc" },
      },
      take: 20,
    });

    const items = pendingItems.map((item) => ({
      visitId: item.visitId,
      visitDate: item.visit.date.toISOString().split("T")[0],
      propertyId: item.property.id,
      propertyCode: item.property.code || "",
      propertyTitle: item.property.title || "",
      visitorName: item.visit.lead?.name || item.visit.visitorName || "Visitante",
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Erro ao buscar feedbacks pendentes:", error);
    return NextResponse.json({ items: [] });
  }
}
