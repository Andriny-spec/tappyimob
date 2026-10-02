import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const updateEvaluationSchema = z.object({
  value: z.number().positive().optional(),
  notes: z.string().optional(),
  evaluator: z.string().min(2).optional(),
  date: z.string().optional(),
});

// GET - Buscar avaliação por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    
    if (!session || (session.role !== "ADMIN" && session.role !== "CORRETOR")) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const evaluation = await prisma.propertyEvaluation.findUnique({
      where: { id },
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
    });

    if (!evaluation) {
      return NextResponse.json(
        { error: "Avaliação não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ evaluation });
  } catch (error) {
    console.error("Error fetching evaluation:", error);
    return NextResponse.json(
      { error: "Erro ao buscar avaliação" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar avaliação
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    
    if (!session || (session.role !== "ADMIN" && session.role !== "CORRETOR")) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateEvaluationSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Dados inválidos", issues: validatedData.error.issues },
        { status: 400 }
      );
    }

    const existing = await prisma.propertyEvaluation.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Avaliação não encontrada" },
        { status: 404 }
      );
    }

    const data = validatedData.data;
    const updateData: any = { ...data };
    
    if (data.date) {
      updateData.date = new Date(data.date);
    }

    const evaluation = await prisma.propertyEvaluation.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({ evaluation });
  } catch (error) {
    console.error("Error updating evaluation:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar avaliação" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir avaliação
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    
    if (!session || (session.role !== "ADMIN" && session.role !== "CORRETOR")) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const existing = await prisma.propertyEvaluation.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Avaliação não encontrada" },
        { status: 404 }
      );
    }

    await prisma.propertyEvaluation.delete({ where: { id } });

    return NextResponse.json({ message: "Avaliação excluída com sucesso" });
  } catch (error) {
    console.error("Error deleting evaluation:", error);
    return NextResponse.json(
      { error: "Erro ao excluir avaliação" },
      { status: 500 }
    );
  }
}
