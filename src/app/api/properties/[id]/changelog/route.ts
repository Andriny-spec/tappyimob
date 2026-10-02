import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET - Listar changelog unificado do imóvel (changelog + activity logs + eventos)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Buscar todas as fontes em paralelo
    const [changelog, activityLogs, exclusivity, proposals, photoSessions, visits] = await Promise.all([
      prisma.propertyChangelog.findMany({
        where: { propertyId: id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.propertyActivityLog.findMany({
        where: { propertyId: id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.propertyExclusivity.findFirst({
        where: { propertyId: id },
        select: { id: true, startDate: true, endDate: true, status: true, createdAt: true },
      }),
      prisma.propertyProposal.findMany({
        where: { propertyId: id },
        select: { id: true, clientName: true, value: true, status: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.photoSession.findMany({
        where: { propertyId: id },
        select: { id: true, status: true, scheduledDate: true, serviceTypes: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.scheduledVisitProperty.findMany({
        where: { propertyId: id },
        select: {
          id: true,
          createdAt: true,
          liked: true,
          feedback: true,
          visit: { select: { id: true, date: true, status: true, lead: { select: { name: true } }, visitorName: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Montar timeline unificada
    const timeline: any[] = [];

    // 1. Changelog entries (alterações de campo)
    for (const entry of changelog) {
      timeline.push({
        id: entry.id,
        type: "change",
        field: entry.field,
        oldValue: entry.oldValue,
        newValue: entry.newValue,
        createdAt: entry.createdAt,
        user: { id: entry.userId, name: entry.userName },
      });
    }

    // 2. Activity logs (ações gerais)
    for (const log of activityLogs) {
      // Evitar duplicatas com changelog (activity logs sem metadata de campos)
      timeline.push({
        id: log.id,
        type: "activity",
        action: log.action,
        description: log.description,
        metadata: log.metadata,
        createdAt: log.createdAt,
        user: { id: log.userId, name: log.userName },
      });
    }

    // 3. Exclusividade
    if (exclusivity) {
      timeline.push({
        id: `exc-${exclusivity.id}`,
        type: "exclusivity",
        field: "Exclusividade",
        newValue: `Status: ${exclusivity.status}`,
        oldValue: null,
        createdAt: exclusivity.createdAt,
        user: null,
        metadata: { startDate: exclusivity.startDate, endDate: exclusivity.endDate, status: exclusivity.status },
      });
    }

    // 4. Propostas
    for (const proposal of proposals) {
      const val = proposal.value
        ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(proposal.value))
        : "—";
      timeline.push({
        id: `prop-${proposal.id}`,
        type: "proposal",
        field: "Proposta",
        newValue: `${proposal.clientName || "Cliente"} — ${val} (${proposal.status})`,
        oldValue: null,
        createdAt: proposal.createdAt,
        user: null,
      });
    }

    // 5. Sessões de Fotos
    for (const ps of photoSessions) {
      const services = (ps.serviceTypes || []).join(", ");
      timeline.push({
        id: `photo-${ps.id}`,
        type: "photo",
        field: "Sessão de Fotos",
        newValue: `${services || "Foto"} — ${ps.status}`,
        oldValue: null,
        createdAt: ps.createdAt,
        user: null,
        metadata: { scheduledDate: ps.scheduledDate, status: ps.status },
      });
    }

    // 6. Visitas
    for (const vp of visits) {
      const visitor = vp.visit?.lead?.name || vp.visit?.visitorName || "Visitante";
      const dateStr = vp.visit?.date ? new Date(vp.visit.date).toLocaleDateString("pt-BR") : "";
      timeline.push({
        id: `visit-${vp.id}`,
        type: "visit",
        field: "Visita Agendada",
        newValue: `${visitor} — ${dateStr} (${vp.visit?.status || ""})`,
        oldValue: null,
        createdAt: vp.createdAt,
        user: null,
        metadata: { liked: vp.liked, feedback: vp.feedback },
      });
    }

    // Ordenar por data (mais recente primeiro)
    timeline.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ changelog: timeline });
  } catch (error) {
    console.error("Error fetching changelog:", error);
    return NextResponse.json(
      { error: "Erro ao buscar histórico" },
      { status: 500 }
    );
  }
}

// POST - Adicionar entrada no changelog (usado internamente)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { field, oldValue, newValue } = body;

    const entry = await prisma.propertyChangelog.create({
      data: {
        propertyId: id,
        userId: session.id,
        userName: session.name || "Sistema",
        field,
        oldValue: oldValue?.toString() || null,
        newValue: newValue?.toString() || null,
      },
    });

    return NextResponse.json({ 
      entry: {
        ...entry,
        user: { id: entry.userId, name: entry.userName },
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating changelog entry:", error);
    return NextResponse.json(
      { error: "Erro ao registrar alteração" },
      { status: 500 }
    );
  }
}
