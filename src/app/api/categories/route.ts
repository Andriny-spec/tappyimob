import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const createCategorySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  icon: z.string().default("home"),
  color: z.string().default("orange"),
  isActive: z.boolean().default(true),
});

// GET - Listar categorias
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    const where = activeOnly ? { isActive: true } : {};

    const categories = await (prisma as any).category.findMany({
      where,
      orderBy: { order: "asc" },
    });

    // Contar propriedades por tipo (usando PropertyType como proxy)
    // Em produção, você teria uma relação direta Property -> Category
    const categoriesWithCount = categories.map((cat: any) => ({
      ...cat,
      propertyCount: 0, // Placeholder - seria calculado via relação
    }));

    return NextResponse.json({ categories: categoriesWithCount });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Erro ao buscar categorias" },
      { status: 500 }
    );
  }
}

// POST - Criar categoria
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createCategorySchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Dados inválidos", issues: validatedData.error.issues },
        { status: 400 }
      );
    }

    const data = validatedData.data;

    // Gerar slug
    const slug = data.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Verificar se slug já existe
    const existing = await (prisma as any).category.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "Já existe uma categoria com este nome" },
        { status: 400 }
      );
    }

    // Obter próxima ordem
    const lastCategory = await (prisma as any).category.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const nextOrder = (lastCategory?.order || 0) + 1;

    const category = await (prisma as any).category.create({
      data: {
        ...data,
        slug,
        order: nextOrder,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Erro ao criar categoria" },
      { status: 500 }
    );
  }
}
