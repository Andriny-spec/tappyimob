import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// Helper: verificar se corretor é dono do lead
async function checkCorretorOwnership(leadId: string): Promise<NextResponse | null> {
  const session = await getSession();
  if (session?.role === "CORRETOR") {
    const lead = await prisma.lead.findUnique({ where: { id: leadId }, select: { corretorId: true } });
    if (!lead || lead.corretorId !== session.id) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }
  }
  return null;
}

// GET - Listar notas do lead
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const denied = await checkCorretorOwnership(id);
    if (denied) return denied;

    const notes = await prisma.leadNote.findMany({
      where: { leadId: id },
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    });

    // Enriquecer notas com nome do autor (authorId é string sem relação no schema)
    const authorIds = [...new Set(notes.map((n) => n.authorId).filter(Boolean))] as string[];
    const authors = authorIds.length > 0
      ? await prisma.user.findMany({ where: { id: { in: authorIds } }, select: { id: true, name: true, avatar: true } })
      : [];
    const authorMap = Object.fromEntries(authors.map((u) => [u.id, u]));

    const enriched = notes.map((n) => ({
      ...n,
      author: n.authorId ? (authorMap[n.authorId] || null) : null,
    }));

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Erro ao buscar notas" },
      { status: 500 }
    );
  }
}

// POST - Criar nota
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const denied = await checkCorretorOwnership(id);
    if (denied) return denied;
    const session = await getSession();
    const body = await request.json();

    const note = await prisma.leadNote.create({
      data: {
        content: body.content,
        leadId: id,
        // Usa session como autor; body.authorId como fallback (retrocompatibilidade)
        authorId: session?.id || body.authorId || null,
      },
    });

    // Atualizar lastContact do lead
    await prisma.lead.update({
      where: { id },
      data: { lastContact: new Date() },
    });
    await prisma.leadActivity.create({
      data: {
        leadId: id,
        type: "note_added",
        description: `Observação adicionada por ${session?.name || "Sistema"}: "${body.content.substring(0, 80)}${body.content.length > 80 ? "..." : ""}"`,
        metadata: { noteId: note.id, by: session?.name },
        userId: session?.id || null,
      },
    }).catch(() => {});

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Erro ao criar nota" },
      { status: 500 }
    );
  }
}

// PATCH - Toggle pin de nota
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { noteId, pinned } = body;

    if (!noteId) {
      return NextResponse.json(
        { error: "ID da nota é obrigatório" },
        { status: 400 }
      );
    }

    const note = await prisma.leadNote.update({
      where: { id: noteId },
      data: { pinned: pinned === true },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("Error toggling pin:", error);
    return NextResponse.json(
      { error: "Erro ao fixar/desfixar nota" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir nota
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get("noteId");

    if (!noteId) {
      return NextResponse.json(
        { error: "ID da nota é obrigatório" },
        { status: 400 }
      );
    }

    await prisma.leadNote.delete({
      where: { id: noteId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { error: "Erro ao excluir nota" },
      { status: 500 }
    );
  }
}
