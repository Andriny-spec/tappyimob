import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/admin/leads/[id]/activities - Listar atividades do lead
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Corretor só pode ver atividades dos seus próprios leads
    const session = await getSession();
    if (session?.role === "CORRETOR") {
      const lead = await prisma.lead.findUnique({ where: { id }, select: { corretorId: true } });
      if (!lead || lead.corretorId !== session.id) {
        return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
      }
    }

    const activities = await prisma.leadActivity.findMany({
      where: { leadId: id },
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    // Buscar quem criou o lead
    const lead2 = await prisma.lead.findUnique({
      where: { id },
      select: {
        createdById: true,
        createdBy: { select: { id: true, name: true, avatar: true } },
        source: true,
      },
    });

    return NextResponse.json({
      activities,
      createdBy: lead2?.createdBy || null,
      leadSource: lead2?.source || null,
    });
  } catch (error) {
    console.error("Erro ao buscar atividades:", error);
    return NextResponse.json(
      { error: "Erro ao buscar atividades" },
      { status: 500 }
    );
  }
}
