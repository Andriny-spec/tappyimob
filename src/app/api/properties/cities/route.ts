import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cities = await prisma.property.findMany({
      where: {
        city: { not: '' }
      },
      select: {
        city: true
      },
      distinct: ['city'],
      orderBy: {
        city: 'asc'
      }
    });

    const uniqueCities = cities
      .map(p => p.city)
      .filter((city): city is string => city !== null && city.trim() !== '');

    return NextResponse.json({ cities: uniqueCities });
  } catch (error) {
    console.error("Erro ao buscar cidades:", error);
    return NextResponse.json({ cities: [] });
  }
}
