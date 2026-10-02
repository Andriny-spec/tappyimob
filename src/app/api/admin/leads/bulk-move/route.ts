import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// POST - Bulk move leads to a new status
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { ids, status } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Forneça uma lista de IDs" }, { status: 400 });
    }

    if (!status || typeof status !== "string") {
      return NextResponse.json({ error: "Forneça o status de destino" }, { status: 400 });
    }

    const result = await prisma.lead.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });

    return NextResponse.json({ moved: result.count });
  } catch (error) {
    console.error("Error bulk moving leads:", error);
    return NextResponse.json(
      { error: "Erro ao mover leads em massa" },
      { status: 500 }
    );
  }
}
