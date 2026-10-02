import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/instagram/posts - Buscar posts do banco
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "12");

    const posts = await prisma.instagramPost.findMany({
      where: { isActive: true },
      orderBy: { timestamp: "desc" },
      take: limit,
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Erro ao buscar posts:", error);
    return NextResponse.json(
      { error: "Erro ao buscar posts" },
      { status: 500 }
    );
  }
}
