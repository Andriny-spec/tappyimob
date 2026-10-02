import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// POST - Registrar acesso a um imóvel (admin/corretor abriu a página de detalhes)
// Usa throttle de 30 minutos por (userId, propertyId) para não inflar o histórico.
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { propertyId } = await request.json();
    if (!propertyId || typeof propertyId !== "string") {
      return NextResponse.json({ error: "propertyId obrigatório" }, { status: 400 });
    }

    // Throttle: não registra se já houve acesso nos últimos 30 min
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
    const recent = await prisma.propertyActivityLog.findFirst({
      where: {
        action: "VIEWED",
        propertyId,
        userId: session.id,
        createdAt: { gte: thirtyMinAgo },
      },
      select: { id: true },
    });
    if (recent) {
      return NextResponse.json({ success: true, throttled: true });
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { code: true, title: true },
    });
    if (!property) {
      return NextResponse.json({ error: "Imóvel não encontrado" }, { status: 404 });
    }

    await prisma.propertyActivityLog.create({
      data: {
        action: "VIEWED",
        description: "Acessou a página do imóvel",
        propertyId,
        propertyCode: property.code,
        propertyTitle: property.title,
        userId: session.id,
        userName: session.name || "Usuário",
        userRole: session.role || null,
        ipAddress:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao registrar acesso:", error);
    return NextResponse.json(
      { error: "Erro ao registrar acesso" },
      { status: 500 }
    );
  }
}
