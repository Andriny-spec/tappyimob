import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Buscar post por ID ou slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Tentar por ID primeiro, depois por slug
    let post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        category: true,
        tags: true,
      },
    });
    if (!post) {
      post = await prisma.post.findUnique({
        where: { slug: id },
        include: {
          author: { select: { id: true, name: true, avatar: true } },
          category: true,
          tags: true,
        },
      });
    }
    if (!post) {
      return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (error) {
    console.error("Erro ao buscar post:", error);
    return NextResponse.json({ error: "Erro ao buscar post" }, { status: 500 });
  }
}

// PUT - Atualizar post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      status,
      featured,
      categoryId,
      tags,
      seoTitle,
      seoDescription,
      publishedAt,
      scheduledAt,
    } = body;

    if (slug) {
      const existingPost = await prisma.post.findFirst({
        where: { slug, NOT: { id } },
      });
      if (existingPost) {
        return NextResponse.json({ error: "Já existe um post com este slug" }, { status: 400 });
      }
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        title,
        slug,
        excerpt,
        content,
        coverImage,
        status,
        featured,
        categoryId,
        seoTitle,
        seoDescription,
        publishedAt:
          status === "PUBLICADO" && !publishedAt ? new Date() : publishedAt,
        scheduledAt,
        tags: tags
          ? {
              set: [],
              connect: tags.map((tagId: string) => ({ id: tagId })),
            }
          : undefined,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        category: true,
        tags: true,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Erro ao atualizar post:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar post" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Post excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir post:", error);
    return NextResponse.json(
      { error: "Erro ao excluir post" },
      { status: 500 }
    );
  }
}
