import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar todos os condomínios distintos dos leads
export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      where: {
        condominiumsOfInterest: { isEmpty: false },
      },
      select: {
        condominiumsOfInterest: true,
      },
    });

    // Flatten, deduplicate, and sort
    const allCondominiums = leads.flatMap((l) => l.condominiumsOfInterest);
    const unique = [...new Set(allCondominiums.map((c) => c.trim()).filter(Boolean))].sort(
      (a, b) => a.localeCompare(b, "pt-BR")
    );

    return NextResponse.json({ condominiums: unique });
  } catch (error) {
    console.error("Erro ao buscar condomínios:", error);
    return NextResponse.json({ error: "Erro ao buscar condomínios" }, { status: 500 });
  }
}
