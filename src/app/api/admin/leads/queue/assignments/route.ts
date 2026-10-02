import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// GET - Listar assignments pendentes do corretor logado
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded?.id) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "PENDING";

    const assignments = await prisma.leadQueueAssignment.findMany({
      where: {
        assignedToId: decoded.id,
        status,
      },
      include: {
        queue: { select: { id: true, name: true, responseTimeMinutes: true } },
      },
      orderBy: { assignedAt: "desc" },
      take: 20,
    });

    // Enriquecer com dados do lead
    const enriched = await Promise.all(
      assignments.map(async (a) => {
        const lead = await prisma.lead.findUnique({
          where: { id: a.leadId },
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            source: true,
            temperature: true,
            createdAt: true,
          },
        });
        return { ...a, lead };
      })
    );

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Erro ao listar assignments:", error);
    return NextResponse.json({ error: "Erro ao listar" }, { status: 500 });
  }
}
