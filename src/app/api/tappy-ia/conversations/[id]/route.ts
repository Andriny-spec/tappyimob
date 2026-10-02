import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTappyIAAccess } from "@/lib/tappy-ia-auth";

export const dynamic = "force-dynamic";

// GET /api/tappy-ia/conversations/[id] — carrega conversa com mensagens
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireTappyIAAccess();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await ctx.params;

  const conversation = await prisma.tappyIAConversation.findFirst({
    where: { id, userId: auth.user.id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          role: true,
          content: true,
          audioUrl: true,
          imageUrl: true,
          imagePrompt: true,
          imageSize: true,
          imageModel: true,
          properties: true,
          createdAt: true,
        },
      },
    },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 });
  }

  return NextResponse.json({ conversation });
}

// PATCH — renomear título
export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireTappyIAAccess();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await ctx.params;
  const body = await request.json().catch(() => ({}));
  const title = typeof body?.title === "string" ? body.title.trim().slice(0, 120) : "";
  if (!title) return NextResponse.json({ error: "Título inválido" }, { status: 400 });

  const existing = await prisma.tappyIAConversation.findFirst({
    where: { id, userId: auth.user.id },
    select: { id: true },
  });
  if (!existing) return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 });

  const conversation = await prisma.tappyIAConversation.update({
    where: { id },
    data: { title },
    select: { id: true, title: true, updatedAt: true },
  });

  return NextResponse.json({ conversation });
}

// DELETE
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireTappyIAAccess();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await ctx.params;

  const result = await prisma.tappyIAConversation.deleteMany({
    where: { id, userId: auth.user.id },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
