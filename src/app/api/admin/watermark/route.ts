import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET - Buscar configurações de marca d'água
export async function GET() {
  try {
    const session = await getSession();
    
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Buscar ou criar configuração padrão
    let settings = await prisma.watermarkSettings.findFirst();
    
    if (!settings) {
      settings = await prisma.watermarkSettings.create({
        data: {
          position: "bottom-right",
          opacity: 50,
          scale: 20,
          margin: 20,
          isActive: false,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching watermark settings:", error);
    return NextResponse.json(
      { error: "Erro ao buscar configurações" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar configurações de marca d'água
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { logoUrl, position, opacity, scale, margin, isActive } = body;

    // Buscar configuração existente ou criar nova
    let settings = await prisma.watermarkSettings.findFirst();
    
    if (settings) {
      settings = await prisma.watermarkSettings.update({
        where: { id: settings.id },
        data: {
          logoUrl,
          position,
          opacity,
          scale,
          margin,
          isActive,
        },
      });
    } else {
      settings = await prisma.watermarkSettings.create({
        data: {
          logoUrl,
          position,
          opacity,
          scale,
          margin,
          isActive,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating watermark settings:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar configurações" },
      { status: 500 }
    );
  }
}
