import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    const members = await prisma.summitTeamMember.findMany({ orderBy: { sortOrder: "asc" } });
    return NextResponse.json({ members });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao listar" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await request.json();
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    const last = await prisma.summitTeamMember.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const member = await prisma.summitTeamMember.create({
      data: {
        name: body.name.trim(),
        phone: body.phone?.trim() || null,
        whatsappUrl: body.whatsappUrl?.trim() || null,
        photoUrl: body.photoUrl || null,
        role: body.role?.trim() || null,
        isActive: body.isActive !== false,
        sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : (last?.sortOrder ?? -1) + 1,
      },
    });
    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao criar" }, { status: 500 });
  }
}
