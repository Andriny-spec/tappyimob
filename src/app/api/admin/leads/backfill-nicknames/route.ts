import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// POST - Backfill nicknames para leads sem apelido
export async function POST() {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const leadsWithoutNickname = await prisma.lead.findMany({
      where: {
        OR: [
          { nickname: null },
          { nickname: "" },
        ],
      },
      select: { id: true, name: true },
    });

    let updated = 0;
    for (const lead of leadsWithoutNickname) {
      const nickname = lead.name?.trim().split(" ")[0] || lead.name || "Cliente";
      await prisma.lead.update({
        where: { id: lead.id },
        data: { nickname },
      });
      updated++;
    }

    return NextResponse.json({
      message: `Backfill concluído: ${updated} leads atualizados de ${leadsWithoutNickname.length} sem apelido`,
      updated,
      total: leadsWithoutNickname.length,
    });
  } catch (error) {
    console.error("Erro no backfill de nicknames:", error);
    return NextResponse.json({ error: "Erro no backfill" }, { status: 500 });
  }
}
