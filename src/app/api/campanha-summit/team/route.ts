import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const members = await prisma.summitTeamMember.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ members });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao carregar equipe" }, { status: 500 });
  }
}
