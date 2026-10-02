import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type LeadPropertyType = "ORIGEM" | "ENVIADO" | "VISITADO" | "PROPOSTA" | "COMPRADO" | "INTERESSE_PERMUTA";

// GET - Listar imóveis vinculados ao lead
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const linkedProperties = await prisma.leadProperty.findMany({
      where: { leadId: id },
      include: {
        property: {
          select: {
            id: true,
            code: true,
            title: true,
            price: true,
            thumbnail: true,
            address: true,
            neighborhood: true,
            city: true,
            bedrooms: true,
            area: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Buscar imóveis de visitas agendadas vinculadas a este lead
    const scheduledVisits = await prisma.scheduledVisit.findMany({
      where: { leadId: id },
      include: {
        partner: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true, role: true } },
        properties: {
          include: {
            property: {
              select: {
                id: true,
                code: true,
                title: true,
                price: true,
                thumbnail: true,
                address: true,
                neighborhood: true,
                city: true,
                bedrooms: true,
                area: true,
              },
            },
          },
        },
      },
      orderBy: { date: "desc" },
    });

    // Converter visitas em formato compatível com linkedProperties (tipo VISITADO)
    const visitPropertyIds = new Set(linkedProperties.filter((p: any) => p.type === "VISITADO").map((p: any) => p.propertyId));
    const visitLinkedProperties: any[] = [];
    for (const visit of scheduledVisits) {
      for (const vp of visit.properties) {
        if (!visitPropertyIds.has(vp.propertyId)) {
          visitPropertyIds.add(vp.propertyId);
          const fromSite = !visit.createdById || !visit.createdBy;
          visitLinkedProperties.push({
            id: `visit-${visit.id}-${vp.propertyId}`,
            leadId: id,
            propertyId: vp.propertyId,
            type: "VISITADO",
            property: vp.property,
            createdAt: visit.date,
            visitedAt: visit.date,
            fromScheduledVisit: true,
            partnerName: visit.partner?.name || null,
            visitTime: visit.time,
            visitEndTime: visit.endTime,
            visitStatus: visit.status,
            fromSite,
            visitNotes: visit.notes,
          });
        }
      }
    }

    const allLinkedProperties = [...linkedProperties, ...visitLinkedProperties];

    // Agrupar por tipo
    const grouped = {
      origem: allLinkedProperties.filter((p: any) => p.type === "ORIGEM"),
      enviados: allLinkedProperties.filter((p: any) => p.type === "ENVIADO"),
      visitados: allLinkedProperties.filter((p: any) => p.type === "VISITADO"),
      propostas: allLinkedProperties.filter((p: any) => p.type === "PROPOSTA"),
      comprados: allLinkedProperties.filter((p: any) => p.type === "COMPRADO"),
      interessePermuta: allLinkedProperties.filter((p: any) => p.type === "INTERESSE_PERMUTA"),
    };

    // Buscar imóveis do vendedor (se o lead também é vendedor/proprietário)
    const lead = await prisma.lead.findUnique({
      where: { id },
      select: { isAlsoSeller: true, linkedOwnerId: true },
    });

    let sellerProperties: any[] = [];
    if (lead?.isAlsoSeller && lead?.linkedOwnerId) {
      sellerProperties = await prisma.property.findMany({
        where: { propertyOwnerId: lead.linkedOwnerId },
        select: {
          id: true,
          code: true,
          title: true,
          price: true,
          thumbnail: true,
          address: true,
          neighborhood: true,
          city: true,
          bedrooms: true,
          area: true,
          status: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({
      linkedProperties,
      grouped,
      sellerProperties,
      isAlsoSeller: lead?.isAlsoSeller || false,
      counts: {
        origem: grouped.origem.length,
        enviados: grouped.enviados.length,
        visitados: grouped.visitados.length,
        propostas: grouped.propostas.length,
        comprados: grouped.comprados.length,
        interessePermuta: grouped.interessePermuta.length,
        sellerProperties: sellerProperties.length,
        total: allLinkedProperties.length,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar imóveis do lead:", error);
    return NextResponse.json(
      { error: "Erro ao buscar imóveis do lead" },
      { status: 500 }
    );
  }
}

// POST - Vincular imóvel ao lead
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { propertyId, type, sentById, feedback, rating, interested, proposalValue, proposalStatus } = body;

    if (!propertyId || !type) {
      return NextResponse.json(
        { error: "propertyId e type são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o lead existe
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
    }

    // Verificar se o imóvel existe
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      return NextResponse.json({ error: "Imóvel não encontrado" }, { status: 404 });
    }

    // Criar ou atualizar o vínculo
    const linkedProperty = await prisma.leadProperty.upsert({
      where: {
        leadId_propertyId_type: {
          leadId: id,
          propertyId,
          type: type as LeadPropertyType,
        },
      },
      create: {
        leadId: id,
        propertyId,
        type: type as LeadPropertyType,
        sentById,
        sentAt: type === "ENVIADO" ? new Date() : undefined,
        visitedAt: type === "VISITADO" ? new Date() : undefined,
        proposalAt: type === "PROPOSTA" ? new Date() : undefined,
        proposalValue,
        proposalStatus,
        feedback,
        rating,
        interested,
      },
      update: {
        sentAt: type === "ENVIADO" ? new Date() : undefined,
        visitedAt: type === "VISITADO" ? new Date() : undefined,
        proposalAt: type === "PROPOSTA" ? new Date() : undefined,
        proposalValue,
        proposalStatus,
        feedback,
        rating,
        interested,
        updatedAt: new Date(),
      },
      include: {
        property: {
          select: {
            id: true,
            code: true,
            title: true,
            price: true,
            thumbnail: true,
          },
        },
      },
    });

    // Atualizar lastContact + recalcular ticket médio dos imóveis vinculados
    const allLinked = await prisma.leadProperty.findMany({
      where: { leadId: id },
      include: { property: { select: { price: true } } },
    });
    const prices = allLinked.map((lp) => lp.property?.price).filter((p): p is number => !!p && p > 0);
    const updateData: any = { lastContact: new Date() };
    if (prices.length > 0) {
      const avg = prices.reduce((s, p) => s + p, 0) / prices.length;
      updateData.minBudget = Math.round(avg * 0.8);
      updateData.maxBudget = Math.round(avg * 1.2);
    }
    await prisma.lead.update({ where: { id }, data: updateData });

    return NextResponse.json(linkedProperty, { status: 201 });
  } catch (error) {
    console.error("Erro ao vincular imóvel:", error);
    return NextResponse.json(
      { error: "Erro ao vincular imóvel ao lead" },
      { status: 500 }
    );
  }
}

// DELETE - Remover vínculo de imóvel
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");
    const type = searchParams.get("type");

    if (!propertyId || !type) {
      return NextResponse.json(
        { error: "propertyId e type são obrigatórios" },
        { status: 400 }
      );
    }

    await prisma.leadProperty.delete({
      where: {
        leadId_propertyId_type: {
          leadId: id,
          propertyId,
          type: type as LeadPropertyType,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao remover vínculo:", error);
    return NextResponse.json(
      { error: "Erro ao remover vínculo do imóvel" },
      { status: 500 }
    );
  }
}
