import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Buscar leads vinculados a um imóvel (via LeadProperty + ScheduledVisit + Lead.propertyId)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Leads com vínculo direto via LeadProperty
    const linkedProperties = await prisma.leadProperty.findMany({
      where: { propertyId: id },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            temperature: true,
            status: true,
            profile: true,
            corretor: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 2. Leads com propertyId direto (origem)
    const originLeads = await prisma.lead.findMany({
      where: { propertyId: id },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        temperature: true,
        status: true,
        profile: true,
        createdAt: true,
        corretor: { select: { name: true } },
      },
    });

    // 3. Leads vinculados via visitas agendadas
    const visits = await prisma.scheduledVisit.findMany({
      where: {
        properties: { some: { propertyId: id } },
        leadId: { not: null },
      },
      select: {
        date: true,
        lead: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            temperature: true,
            status: true,
            profile: true,
            corretor: { select: { name: true } },
          },
        },
      },
    });

    // Consolidar leads sem duplicatas
    const leadsMap = new Map<string, any>();

    for (const lp of linkedProperties) {
      if (!lp.lead) continue;
      const key = `${lp.lead.id}-${lp.type}`;
      if (!leadsMap.has(key)) {
        leadsMap.set(key, {
          id: lp.lead.id,
          name: lp.lead.name,
          phone: lp.lead.phone,
          email: lp.lead.email,
          temperature: lp.lead.temperature,
          status: lp.lead.status,
          profile: lp.lead.profile,
          corretor: lp.lead.corretor?.name || null,
          type: lp.type,
          date: lp.createdAt,
        });
      }
    }

    for (const lead of originLeads) {
      const key = `${lead.id}-ORIGEM`;
      if (!leadsMap.has(key)) {
        leadsMap.set(key, {
          id: lead.id,
          name: lead.name,
          phone: lead.phone,
          email: lead.email,
          temperature: lead.temperature,
          status: lead.status,
          profile: lead.profile,
          corretor: lead.corretor?.name || null,
          type: "ORIGEM",
          date: lead.createdAt,
        });
      }
    }

    for (const visit of visits) {
      if (!visit.lead) continue;
      const key = `${visit.lead.id}-VISITADO`;
      if (!leadsMap.has(key)) {
        leadsMap.set(key, {
          id: visit.lead.id,
          name: visit.lead.name,
          phone: visit.lead.phone,
          email: visit.lead.email,
          temperature: visit.lead.temperature,
          status: visit.lead.status,
          profile: visit.lead.profile,
          corretor: visit.lead.corretor?.name || null,
          type: "VISITADO",
          date: visit.date,
        });
      }
    }

    const leads = Array.from(leadsMap.values());

    return NextResponse.json({ leads, total: leads.length });
  } catch (error: any) {
    console.error("Erro ao buscar leads do imóvel:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
