import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const createEvaluationSchema = z.object({
  propertyId: z.string(),
  value: z.number().positive(),
  notes: z.string().optional(),
  evaluator: z.string().min(2),
  date: z.string().optional(),
});

// GET - Listar avaliações
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || (session.role !== "ADMIN" && session.role !== "CORRETOR")) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");
    const search = searchParams.get("search");

    const where: any = {};
    
    if (propertyId) {
      where.propertyId = propertyId;
    }

    if (search) {
      where.OR = [
        { evaluator: { contains: search, mode: "insensitive" } },
        { property: { title: { contains: search, mode: "insensitive" } } },
        { property: { code: { contains: search, mode: "insensitive" } } },
      ];
    }

    const evaluations = await prisma.propertyEvaluation.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            code: true,
            title: true,
            address: true,
            neighborhood: true,
            city: true,
            price: true,
            thumbnail: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ evaluations });
  } catch (error) {
    console.error("Error fetching evaluations:", error);
    return NextResponse.json(
      { error: "Erro ao buscar avaliações" },
      { status: 500 }
    );
  }
}

// POST - Criar avaliação
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || (session.role !== "ADMIN" && session.role !== "CORRETOR")) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createEvaluationSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Dados inválidos", issues: validatedData.error.issues },
        { status: 400 }
      );
    }

    const data = validatedData.data;

    // Verificar se imóvel existe
    const property = await prisma.property.findUnique({
      where: { id: data.propertyId },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Imóvel não encontrado" },
        { status: 404 }
      );
    }

    const evaluation = await prisma.propertyEvaluation.create({
      data: {
        propertyId: data.propertyId,
        value: data.value,
        notes: data.notes,
        evaluator: data.evaluator,
        date: data.date ? new Date(data.date) : new Date(),
      },
      include: {
        property: {
          select: {
            id: true,
            code: true,
            title: true,
            price: true,
          },
        },
      },
    });

    return NextResponse.json({ evaluation }, { status: 201 });
  } catch (error) {
    console.error("Error creating evaluation:", error);
    return NextResponse.json(
      { error: "Erro ao criar avaliação" },
      { status: 500 }
    );
  }
}
