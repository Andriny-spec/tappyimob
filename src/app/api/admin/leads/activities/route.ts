import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/leads/activities - Listar todas as atividades recentes dos leads
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const corretorId = searchParams.get("corretorId") || "";

    const where: any = {};
    
    if (type && type !== "all") {
      where.type = type;
    }

    if (corretorId) {
      where.lead = { ...where.lead, corretorId };
    }

    if (search) {
      where.lead = {
        ...where.lead,
        name: { contains: search, mode: "insensitive" },
      };
    }

    const activities = await prisma.leadActivity.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            source: true,
          },
        },
      },
    });

    // Also fetch recent notes as "note" type activities
    const notesWhere: any = {};
    if (corretorId) {
      notesWhere.lead = { corretorId };
    }
    const recentNotes = await prisma.leadNote.findMany({
      where: notesWhere,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            source: true,
          },
        },
      },
    });

    // Merge activities and notes into a unified timeline
    const timeline = [
      ...activities.map((a) => ({
        id: a.id,
        type: a.type,
        description: a.description,
        date: a.createdAt.toISOString(),
        lead: a.lead,
        metadata: a.metadata,
      })),
      ...recentNotes.map((n) => ({
        id: n.id,
        type: "note",
        description: `Observação: ${n.content.substring(0, 100)}${n.content.length > 100 ? "..." : ""}`,
        date: n.createdAt.toISOString(),
        lead: n.lead,
        metadata: { content: n.content, pinned: n.pinned },
      })),
    ];

    // Sort by date descending
    timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Stats
    const stats = {
      total: timeline.length,
      statusChanges: timeline.filter((t) => t.type === "status_change").length,
      notes: timeline.filter((t) => t.type === "note").length,
      newLeads: timeline.filter((t) => t.type === "created").length,
    };

    return NextResponse.json({ timeline: timeline.slice(0, limit), stats });
  } catch (error) {
    console.error("Erro ao buscar atividades:", error);
    return NextResponse.json(
      { error: "Erro ao buscar atividades" },
      { status: 500 }
    );
  }
}
