import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createCalendarEvent,
  listCalendarEvents,
  updateCalendarEvent,
  deleteCalendarEvent,
  LEAD_EVENT_COLORS,
} from "@/lib/google-calendar";

// GET - Listar eventos do calendário
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("google_access_token")?.value;
    const refreshToken = cookieStore.get("google_refresh_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Não conectado ao Google Calendar", connected: false },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeMin = searchParams.get("timeMin") || undefined;
    const timeMax = searchParams.get("timeMax") || undefined;
    const q = searchParams.get("q") || undefined;

    const events = await listCalendarEvents(accessToken, refreshToken, {
      timeMin,
      timeMax,
      q,
      maxResults: 100,
    });

    return NextResponse.json({ events, connected: true });
  } catch (error: any) {
    console.error("Erro ao listar eventos:", error);
    
    // Se o token expirou, retornar erro de autenticação
    if (error.code === 401 || error.message?.includes("invalid_grant")) {
      return NextResponse.json(
        { error: "Token expirado", connected: false },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao listar eventos" },
      { status: 500 }
    );
  }
}

// POST - Criar evento no calendário
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("google_access_token")?.value;
    const refreshToken = cookieStore.get("google_refresh_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Não conectado ao Google Calendar" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      summary,
      description,
      location,
      startDateTime,
      endDateTime,
      eventType, // LIGACAO, REUNIAO, VISITA, FOLLOWUP
      attendees,
      leadId,
      leadName,
    } = body;

    if (!summary || !startDateTime || !endDateTime) {
      return NextResponse.json(
        { error: "Título, data início e data fim são obrigatórios" },
        { status: 400 }
      );
    }

    // Construir descrição com informações do lead
    let fullDescription = description || "";
    if (leadId && leadName) {
      fullDescription = `[Lead: ${leadName}]\n\n${fullDescription}`;
    }

    const event = await createCalendarEvent(accessToken, refreshToken, {
      summary,
      description: fullDescription,
      location,
      start: {
        dateTime: startDateTime,
        timeZone: "America/Sao_Paulo",
      },
      end: {
        dateTime: endDateTime,
        timeZone: "America/Sao_Paulo",
      },
      attendees: attendees?.map((email: string) => ({ email })),
      colorId: eventType ? LEAD_EVENT_COLORS[eventType] : undefined,
    });

    return NextResponse.json({ event });
  } catch (error: any) {
    console.error("Erro ao criar evento:", error);
    return NextResponse.json(
      { error: "Erro ao criar evento" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar evento
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("google_access_token")?.value;
    const refreshToken = cookieStore.get("google_refresh_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Não conectado ao Google Calendar" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { eventId, ...eventData } = body;

    if (!eventId) {
      return NextResponse.json(
        { error: "ID do evento é obrigatório" },
        { status: 400 }
      );
    }

    const event = await updateCalendarEvent(accessToken, refreshToken, eventId, eventData);

    return NextResponse.json({ event });
  } catch (error: any) {
    console.error("Erro ao atualizar evento:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar evento" },
      { status: 500 }
    );
  }
}

// DELETE - Deletar evento
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("google_access_token")?.value;
    const refreshToken = cookieStore.get("google_refresh_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Não conectado ao Google Calendar" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { error: "ID do evento é obrigatório" },
        { status: 400 }
      );
    }

    await deleteCalendarEvent(accessToken, refreshToken, eventId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao deletar evento:", error);
    return NextResponse.json(
      { error: "Erro ao deletar evento" },
      { status: 500 }
    );
  }
}
