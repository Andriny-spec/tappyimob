import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const updateVisitSchema = z.object({
  date: z.string().optional(),
  time: z.string().optional(),
  notes: z.string().optional(),
  confirmed: z.boolean().optional(),
  cancelled: z.boolean().optional(),
});

// GET - Buscar visita por ID
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

    const visit = await prisma.visit.findUnique({
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
            thumbnail: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!visit) {
      return NextResponse.json(
        { error: "Visita não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ visit });
  } catch (error) {
    console.error("Error fetching visit:", error);
    return NextResponse.json(
      { error: "Erro ao buscar visita" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar visita (confirmar, cancelar, reagendar)
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
    const validatedData = updateVisitSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Dados inválidos", issues: validatedData.error.issues },
        { status: 400 }
      );
    }

    const existing = await prisma.visit.findUnique({ 
      where: { id },
      include: { property: { select: { code: true } } }
    });
    
    if (!existing) {
      return NextResponse.json(
        { error: "Visita não encontrada" },
        { status: 404 }
      );
    }

    const data = validatedData.data;
    const updateData: any = { ...data };
    
    if (data.date) {
      updateData.date = new Date(data.date);
    }

    const visit = await prisma.visit.update({
      where: { id },
      data: updateData,
      include: {
        property: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
      },
    });

    // Criar notificação se confirmado ou cancelado
    if (data.confirmed === true && (existing as any).visitorEmail) {
      // Aqui você poderia enviar email de confirmação
      console.log(`Visita confirmada para ${(existing as any).visitorEmail}`);
    }

    if (data.cancelled === true && (existing as any).visitorEmail) {
      // Aqui você poderia enviar email de cancelamento
      console.log(`Visita cancelada para ${(existing as any).visitorEmail}`);
    }

    return NextResponse.json({ visit });
  } catch (error) {
    console.error("Error updating visit:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar visita" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir visita
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

    const existing = await prisma.visit.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Visita não encontrada" },
        { status: 404 }
      );
    }

    await prisma.visit.delete({ where: { id } });

    return NextResponse.json({ message: "Visita excluída com sucesso" });
  } catch (error) {
    console.error("Error deleting visit:", error);
    return NextResponse.json(
      { error: "Erro ao excluir visita" },
      { status: 500 }
    );
  }
}
