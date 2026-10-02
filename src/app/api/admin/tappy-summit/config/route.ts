import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const EVENT_SLUG = "tappy-summit-2026";

// GET /api/admin/tappy-summit/config
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    let config = await prisma.eventConfig.findUnique({
      where: { eventSlug: EVENT_SLUG },
    });

    if (!config) {
      config = await prisma.eventConfig.create({
        data: { eventSlug: EVENT_SLUG },
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error fetching event config:", error);
    return NextResponse.json(
      { error: "Erro ao buscar configurações" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/tappy-summit/config
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();

    const config = await prisma.eventConfig.upsert({
      where: { eventSlug: EVENT_SLUG },
      update: {
        whatsappEnabled: body.whatsappEnabled,
        whatsappMessage: body.whatsappMessage,
        whatsappSession: body.whatsappSession,
        whatsappDelay: body.whatsappDelay,
        emailEnabled: body.emailEnabled,
        emailDelay: body.emailDelay,
      },
      create: {
        eventSlug: EVENT_SLUG,
        whatsappEnabled: body.whatsappEnabled ?? false,
        whatsappMessage: body.whatsappMessage,
        whatsappSession: body.whatsappSession ?? "default",
        whatsappDelay: body.whatsappDelay ?? 5,
        emailEnabled: body.emailEnabled ?? true,
        emailDelay: body.emailDelay ?? 3,
      },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error saving event config:", error);
    return NextResponse.json(
      { error: "Erro ao salvar configurações" },
      { status: 500 }
    );
  }
}
