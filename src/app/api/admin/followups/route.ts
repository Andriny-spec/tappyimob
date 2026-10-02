import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET - Listar follow-ups com filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = {};
    if (status && status !== "all") {
      where.status = status;
    }

    const [followups, stats] = await Promise.all([
      prisma.leadFollowUp.findMany({
        where,
        orderBy: { scheduledFor: "asc" },
        take: limit,
      }),
      Promise.all([
        prisma.leadFollowUp.count({ where: { status: "PENDING" } }),
        prisma.leadFollowUp.count({ where: { status: "SENT" } }),
        prisma.leadFollowUp.count({ where: { status: "COMPLETED" } }),
        prisma.leadFollowUp.count({ where: { status: "CANCELLED" } }),
        prisma.leadFollowUp.count(),
      ]),
    ]);

    // Enriquecer com dados do lead
    const leadIds = [...new Set(followups.map((f) => f.leadId))];
    const leads = await prisma.lead.findMany({
      where: { id: { in: leadIds } },
      select: { id: true, name: true, phone: true, email: true },
    });
    const leadMap = new Map(leads.map((l) => [l.id, l]));

    const enriched = followups.map((f) => ({
      ...f,
      lead: leadMap.get(f.leadId) || null,
    }));

    return NextResponse.json({
      followups: enriched,
      stats: {
        pending: stats[0],
        sent: stats[1],
        completed: stats[2],
        cancelled: stats[3],
        total: stats[4],
      },
    });
  } catch (error) {
    console.error("Erro ao buscar follow-ups:", error);
    return NextResponse.json(
      { error: "Erro ao buscar follow-ups" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar status de um follow-up
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "ID e status são obrigatórios" }, { status: 400 });
    }

    const updated = await prisma.leadFollowUp.update({
      where: { id },
      data: {
        status,
        ...(status === "COMPLETED" ? { completedAt: new Date() } : {}),
        ...(status === "SENT" ? { sentAt: new Date() } : {}),
      },
    });

    return NextResponse.json({ followup: updated });
  } catch (error) {
    console.error("Erro ao atualizar follow-up:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar follow-up" },
      { status: 500 }
    );
  }
}
