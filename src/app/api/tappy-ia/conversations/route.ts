import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTappyIAAccess } from "@/lib/tappy-ia-auth";

export const dynamic = "force-dynamic";

// GET /api/tappy-ia/conversations — lista conversas do usuário logado
export async function GET() {
  const auth = await requireTappyIAAccess();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const conversations = await prisma.tappyIAConversation.findMany({
    where: { userId: auth.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { messages: true } },
    },
  });

  return NextResponse.json({ conversations });
}

// POST /api/tappy-ia/conversations — cria conversa vazia
export async function POST(request: NextRequest) {
  const auth = await requireTappyIAAccess();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let title = "Nova conversa";
  try {
    const body = await request.json();
    if (typeof body?.title === "string" && body.title.trim()) {
      title = body.title.trim().slice(0, 120);
    }
  } catch {
    // sem body, tudo bem
  }

  const conversation = await prisma.tappyIAConversation.create({
    data: { userId: auth.user.id, title },
    select: { id: true, title: true, createdAt: true, updatedAt: true },
  });

  return NextResponse.json({ conversation });
}
