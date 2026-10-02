import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET - Obter status de manutenção
export async function GET() {
  try {
    let maintenance = await prisma.maintenanceMode.findFirst();
    
    if (!maintenance) {
      maintenance = await prisma.maintenanceMode.create({
        data: {
          isActive: false,
          message: "Estamos realizando melhorias para você. Voltamos em breve!",
        },
      });
    }

    return NextResponse.json(maintenance);
  } catch (error) {
    console.error("Erro ao obter status de manutenção:", error);
    return NextResponse.json(
      { error: "Erro ao obter status de manutenção" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar status de manutenção
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { isActive, message, scheduledEnd } = body;

    let maintenance = await prisma.maintenanceMode.findFirst();

    if (!maintenance) {
      maintenance = await prisma.maintenanceMode.create({
        data: {
          isActive: isActive ?? false,
          message: message ?? "Estamos realizando melhorias para você. Voltamos em breve!",
          scheduledEnd: scheduledEnd ? new Date(scheduledEnd) : null,
        },
      });
    } else {
      maintenance = await prisma.maintenanceMode.update({
        where: { id: maintenance.id },
        data: {
          isActive: isActive ?? maintenance.isActive,
          message: message ?? maintenance.message,
          scheduledEnd: scheduledEnd ? new Date(scheduledEnd) : null,
        },
      });
    }

    return NextResponse.json(maintenance);
  } catch (error) {
    console.error("Erro ao atualizar manutenção:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar manutenção" },
      { status: 500 }
    );
  }
}
