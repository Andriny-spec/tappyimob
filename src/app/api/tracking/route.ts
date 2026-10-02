import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Registrar evento de tracking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyId, event } = body;

    if (!propertyId || !event) {
      return NextResponse.json(
        { error: "propertyId e event são obrigatórios" },
        { status: 400 }
      );
    }

    // Validar evento
    const validEvents = ["view", "click", "favorite", "unfavorite", "share", "whatsapp_contact"];
    if (!validEvents.includes(event)) {
      return NextResponse.json(
        { error: "Evento inválido" },
        { status: 400 }
      );
    }

    // Atualizar contador baseado no evento (SQL raw para não alterar updatedAt)
    switch (event) {
      case "view":
        await prisma.$executeRaw`UPDATE "properties" SET "views" = "views" + 1 WHERE "id" = ${propertyId}`;
        // Registrar no log para rankings por período
        await prisma.propertyViewLog.create({
          data: {
            propertyId,
            source: "site",
            ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || null,
            userAgent: request.headers.get("user-agent") || null,
          },
        }).catch(() => {});
        break;
      case "click":
        await prisma.$executeRaw`UPDATE "properties" SET "clicks" = "clicks" + 1 WHERE "id" = ${propertyId}`;
        break;
      case "favorite":
        await prisma.$executeRaw`UPDATE "properties" SET "favorites" = "favorites" + 1 WHERE "id" = ${propertyId}`;
        break;
      case "unfavorite":
        await prisma.$executeRaw`UPDATE "properties" SET "favorites" = GREATEST("favorites" - 1, 0) WHERE "id" = ${propertyId}`;
        break;
      case "share":
        await prisma.$executeRaw`UPDATE "properties" SET "shares" = "shares" + 1 WHERE "id" = ${propertyId}`;
        break;
      case "whatsapp_contact":
        // Contato via WhatsApp: incrementar clicks E atualizar updatedAt (único evento que atualiza a data)
        await prisma.$executeRaw`UPDATE "properties" SET "clicks" = "clicks" + 1, "updatedAt" = NOW() WHERE "id" = ${propertyId}`;
        // Registrar no changelog para aparecer no histórico do imóvel
        await prisma.propertyChangelog.create({
          data: {
            propertyId,
            userId: "system",
            userName: "Visitante do Site",
            field: "Contato via WhatsApp",
            oldValue: null,
            newValue: new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
          },
        }).catch(() => {});
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro no tracking:", error);
    return NextResponse.json(
      { error: "Erro ao registrar evento" },
      { status: 500 }
    );
  }
}
