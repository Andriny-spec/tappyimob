import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET - Buscar fotógrafo por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const photographer = await prisma.user.findFirst({
      where: { id, role: "FOTOGRAFO" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            photographerSessions: true,
            photographerSlots: true,
          },
        },
      },
    });

    if (!photographer) {
      return NextResponse.json(
        { error: "Fotógrafo não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ photographer });
  } catch (error) {
    console.error("Erro ao buscar fotógrafo:", error);
    return NextResponse.json(
      { error: "Erro ao buscar fotógrafo" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar fotógrafo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, phone, password, isActive } = body;

    // Verificar se fotógrafo existe
    const existing = await prisma.user.findFirst({
      where: { id, role: "FOTOGRAFO" },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Fotógrafo não encontrado" },
        { status: 404 }
      );
    }

    // Se mudou o e-mail, verificar se não existe outro usuário com esse e-mail
    if (email && email.toLowerCase() !== existing.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: "Este e-mail já está cadastrado" },
          { status: 400 }
        );
      }
    }

    // Preparar dados para atualização
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email.toLowerCase();
    if (phone !== undefined) updateData.phone = phone || null;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Se informou senha, fazer hash
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const photographer = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ photographer });
  } catch (error) {
    console.error("Erro ao atualizar fotógrafo:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar fotógrafo" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir fotógrafo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verificar se fotógrafo existe
    const existing = await prisma.user.findFirst({
      where: { id, role: "FOTOGRAFO" },
      include: {
        _count: {
          select: {
            photographerSessions: true,
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Fotógrafo não encontrado" },
        { status: 404 }
      );
    }

    // Se tem sessões vinculadas, não permitir exclusão
    if ((existing._count as any).photographerSessions > 0) {
      return NextResponse.json(
        { error: "Este fotógrafo tem sessões vinculadas. Desative-o ao invés de excluir." },
        { status: 400 }
      );
    }

    // Excluir slots primeiro
    await prisma.photoSessionSlot.deleteMany({
      where: { photographerId: id },
    });

    // Excluir fotógrafo
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir fotógrafo:", error);
    return NextResponse.json(
      { error: "Erro ao excluir fotógrafo" },
      { status: 500 }
    );
  }
}
