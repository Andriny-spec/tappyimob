import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import bcrypt from "bcryptjs";

// PUT - Atualizar role e módulos permitidos de um usuário
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { role, allowedModules, isActive, password } = body;

    // Validar role
    const validRoles = ["ADMIN", "CORRETOR", "CLIENTE", "FOTOGRAFO", "SDR", "PARCEIRO_EXTERNO"];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json({ error: "Role inválida" }, { status: 400 });
    }

    // Não permitir que o admin se auto-desative ou mude sua própria role
    if (id === currentUser.id) {
      if (role && role !== currentUser.role) {
        return NextResponse.json(
          { error: "Você não pode alterar sua própria role" },
          { status: 400 }
        );
      }
      if (isActive === false) {
        return NextResponse.json(
          { error: "Você não pode se desativar" },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (role !== undefined) updateData.role = role;
    if (allowedModules !== undefined) updateData.allowedModules = allowedModules;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (password && password.length >= 6) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Invalidate all existing sessions when password changes or user is deactivated
    if ((password && password.length >= 6) || isActive === false) {
      updateData.tokenInvalidatedAt = new Date();
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        allowedModules: true,
        isActive: true,
        creci: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
