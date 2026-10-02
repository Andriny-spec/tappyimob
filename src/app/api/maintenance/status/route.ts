import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Rota pública para verificar se site está em manutenção
export async function GET() {
  try {
    const maintenance = await prisma.maintenanceMode.findFirst();
    
    return NextResponse.json({
      isActive: maintenance?.isActive ?? false,
      message: maintenance?.message ?? "Estamos realizando melhorias para você. Voltamos em breve!",
      scheduledEnd: maintenance?.scheduledEnd,
    });
  } catch (error) {
    console.error("Erro ao verificar manutenção:", error);
    return NextResponse.json({ isActive: false });
  }
}
