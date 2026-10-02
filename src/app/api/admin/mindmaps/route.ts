import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar todos os mapas
export async function GET(request: NextRequest) {
  try {
    const maps = await (prisma as any).mindMap.findMany({
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(maps);
  } catch (error) {
    console.error("Erro ao buscar mapas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar mapas" },
      { status: 500 }
    );
  }
}

// POST - Criar novo mapa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, data } = body;

    const map = await (prisma as any).mindMap.create({
      data: {
        name: name || "Novo Mapa",
        description,
        data: data || {
          rootId: "root",
          nodes: {
            root: {
              id: "root",
              text: "Novo Mapa",
              x: 0,
              y: 0,
              color: "#3B82F6",
              parentId: null,
              children: [],
              collapsed: false,
              checklist: [],
            },
          },
        },
      },
    });

    return NextResponse.json(map, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar mapa:", error);
    return NextResponse.json(
      { error: "Erro ao criar mapa" },
      { status: 500 }
    );
  }
}
