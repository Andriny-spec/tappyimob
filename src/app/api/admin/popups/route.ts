import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET - Listar todos os popups
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const popups = await prisma.popupBanner.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ popups });
  } catch (error) {
    console.error("Erro ao listar popups:", error);
    return NextResponse.json({ error: "Erro ao listar popups" }, { status: 500 });
  }
}

// POST - Criar novo popup
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();

    const popup = await prisma.popupBanner.create({
      data: {
        title: body.title || "Novo Pop-up",
        description: body.description || null,
        imageUrl: body.imageUrl || null,
        imageUrlMobile: body.imageUrlMobile || null,
        buttonText: body.buttonText || "Saiba mais",
        buttonLink: body.buttonLink || null,
        popupType: body.popupType || "BANNER",
        bgColor: body.bgColor || "#0B2545",
        textColor: body.textColor || "#FFFFFF",
        overlayOpacity: body.overlayOpacity ?? 0.5,
        position: body.position || "CENTER",
        size: body.size || "MEDIUM",
        triggerType: body.triggerType || "PAGE_LOAD",
        triggerValue: body.triggerValue ?? 0,
        targetPages: body.targetPages || [],
        excludePages: body.excludePages || [],
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        showFrequency: body.showFrequency || "ONCE_PER_SESSION",
        formFields: body.formFields || [],
        formButtonText: body.formButtonText || "Enviar",
        clicksToShow: body.clicksToShow ?? 0,
        isActive: body.isActive ?? true,
        order: body.order ?? 0,
      },
    });

    return NextResponse.json({ popup }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar popup:", error);
    return NextResponse.json({ error: "Erro ao criar popup" }, { status: 500 });
  }
}
