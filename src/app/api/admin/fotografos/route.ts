import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET - Listar fotógrafos (usa a mesma rota de users com filtro)
// Este arquivo é para POST (criar novo fotógrafo)

// POST - Criar novo fotógrafo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, password, isActive } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nome, e-mail e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se e-mail já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este e-mail já está cadastrado" },
        { status: 400 }
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar fotógrafo
    const photographer = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone: phone || null,
        password: hashedPassword,
        role: "FOTOGRAFO",
        isActive: isActive ?? true,
      },
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
    console.error("Erro ao criar fotógrafo:", error);
    return NextResponse.json(
      { error: "Erro ao criar fotógrafo" },
      { status: 500 }
    );
  }
}
