import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/admin/tappy-summit/whatsapp-blast/:id
// Retorna o blast + lista de destinatários com status individual.
// Usado para polling durante o disparo e para ver o histórico depois.
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const blast = await prisma.eventBlast.findUnique({
    where: { id },
    include: {
      recipients: {
        orderBy: [{ status: "asc" }, { sentAt: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!blast) {
    return NextResponse.json({ error: "Disparo não encontrado" }, { status: 404 });
  }

  const pending = blast.recipients.filter((r) => r.status === "pending").length;
  return NextResponse.json({
    ...blast,
    pendingCount: pending,
  });
}
