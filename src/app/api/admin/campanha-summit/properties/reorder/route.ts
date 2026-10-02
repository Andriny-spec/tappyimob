import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// POST /api/admin/campanha-summit/properties/reorder
// Body: { ids: string[] }  — a ordem do array define o novo sortOrder
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "ids é obrigatório" }, { status: 400 });
    }

    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.summitCampaignProperty.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );

    return NextResponse.json({ ok: true, count: ids.length });
  } catch (err) {
    console.error("[properties/reorder] Error:", err);
    return NextResponse.json(
      { error: "Falha ao reordenar" },
      { status: 500 }
    );
  }
}
