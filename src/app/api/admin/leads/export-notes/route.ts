import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// POST /api/admin/leads/export-notes - Buscar observações dos leads para export CSV
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SDR")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { leadIds } = body;

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ notesMap: {} });
    }

    // Buscar todas as notas dos leads solicitados
    const notes = await prisma.leadNote.findMany({
      where: { leadId: { in: leadIds } },
      select: {
        leadId: true,
        content: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Agrupar notas por leadId, concatenando todas as observações
    const notesMap: Record<string, string> = {};
    for (const note of notes) {
      const existing = notesMap[note.leadId] || "";
      const separator = existing ? " | " : "";
      notesMap[note.leadId] = existing + separator + note.content.replace(/\n/g, " ").trim();
    }

    return NextResponse.json({ notesMap });
  } catch (error) {
    console.error("Erro ao buscar notas para export:", error);
    return NextResponse.json({ error: "Erro ao buscar notas" }, { status: 500 });
  }
}
