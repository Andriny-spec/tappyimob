import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const statuses = await prisma.property.findMany({
      select: {
        status: true
      },
      distinct: ['status'],
    });

    const uniqueStatuses = statuses
      .map(p => p.status)
      .filter(Boolean);

    return NextResponse.json({ statuses: uniqueStatuses });
  } catch (error) {
    console.error("Erro ao buscar status:", error);
    return NextResponse.json({ statuses: [] });
  }
}
