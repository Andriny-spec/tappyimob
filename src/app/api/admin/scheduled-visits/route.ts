import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET - Listar visitas agendadas
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get("leadId");
    const propertyId = searchParams.get("propertyId");
    const corretorId = searchParams.get("corretorId");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const condominiumId = searchParams.get("condominiumId");
    const propertyType = searchParams.get("propertyType");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");

    const where: any = {};

    if (leadId) {
      where.leadId = leadId;
    }

    // Filtros de propriedade (propertyId, condominiumId, propertyType, minPrice/maxPrice)
    const propertyFilter: any = {};
    if (propertyId) {
      propertyFilter.propertyId = propertyId;
    }
    const propertyWhere: any = {};
    if (condominiumId) {
      propertyWhere.condominiumId = condominiumId;
    }
    if (propertyType) {
      propertyWhere.type = propertyType;
    }
    if (minPrice || maxPrice) {
      propertyWhere.OR = [
        {
          price: {
            ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
            ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
          },
        },
        {
          rentPrice: {
            ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
            ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
          },
        },
      ];
    }
    if (Object.keys(propertyWhere).length > 0) {
      propertyFilter.property = propertyWhere;
    }
    if (Object.keys(propertyFilter).length > 0) {
      where.properties = { some: propertyFilter };
    }

    // Corretor: se não está filtrando por propriedade, só vê suas próprias visitas
    // Se está filtrando por propriedade, vê todas (filtro de visibilidade abaixo cuida da privacidade)
    if (session.role === "CORRETOR" && !propertyId) {
      where.corretorId = session.id;
    } else if (corretorId) {
      where.corretorId = corretorId;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    const [visits, total] = await Promise.all([
      prisma.scheduledVisit.findMany({
        where,
        include: {
          lead: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          corretor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          partner: {
            select: {
              id: true,
              name: true,
              creci: true,
              phone: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
          properties: {
            select: {
              id: true,
              visitOrder: true,
              liked: true,
              feedback: true,
              property: {
                select: {
                  id: true,
                  code: true,
                  title: true,
                  address: true,
                  neighborhood: true,
                  city: true,
                  thumbnail: true,
                },
              },
            },
            orderBy: {
              visitOrder: "asc",
            },
          },
        },
        orderBy: [{ date: "desc" }, { time: "desc" }],
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.scheduledVisit.count({ where }),
    ]);

    // Aplicar regras de visibilidade:
    // - AGENDADA/CONFIRMADA: só ADMIN e corretor do agendamento veem
    // - REALIZADA/NAO_COMPARECEU/CANCELADA/REAGENDADA: todos veem, mas nome do cliente oculto (exceto ADMIN + corretor do agendamento)
    const isAdmin = session.role === "ADMIN" || session.role === "SUPERADMIN";
    const userId = session.id;

    const filteredVisits = visits
      .filter((visit: any) => {
        const isOwner = visit.corretorId === userId || visit.createdById === userId;
        const pendingStatuses = ["AGENDADA", "CONFIRMADA"];
        if (pendingStatuses.includes(visit.status) && !isAdmin && !isOwner) {
          return false;
        }
        return true;
      })
      .map((visit: any) => {
        const isOwner = visit.corretorId === userId || visit.createdById === userId;
        if (!isAdmin && !isOwner) {
          // Ocultar dados do cliente para outros corretores
          return {
            ...visit,
            lead: visit.lead ? { id: visit.lead.id, name: "Cliente oculto", email: null, phone: null } : null,
            visitorName: visit.visitorName ? "Cliente oculto" : null,
            visitorEmail: null,
            visitorPhone: null,
          };
        }
        return visit;
      });

    return NextResponse.json({
      visits: filteredVisits,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erro ao listar visitas:", error);
    return NextResponse.json(
      { error: "Erro ao listar visitas" },
      { status: 500 }
    );
  }
}

// POST - Criar agendamento de visita
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      date,
      time,
      endTime,
      notes,
      internalNotes,
      leadId,
      visitorName,
      visitorEmail,
      visitorPhone,
      corretorId,
      partnerId, // Corretor parceiro vinculado
      propertyIds, // Array de IDs de imóveis
      isPartnerProperty, // Imóvel do corretor parceiro (não cadastrado)
      partnerPropertyDesc,
      partnerPropertyAddress,
    } = body;

    // Validações básicas
    if (!date || !time) {
      return NextResponse.json(
        { error: "Data e horário são obrigatórios" },
        { status: 400 }
      );
    }

    if (!leadId && !visitorName) {
      return NextResponse.json(
        { error: "Informe um lead ou dados do visitante" },
        { status: 400 }
      );
    }

    if ((!propertyIds || propertyIds.length === 0) && !isPartnerProperty) {
      return NextResponse.json(
        { error: "Selecione pelo menos um imóvel" },
        { status: 400 }
      );
    }

    // Se não tem leadId E não é visita com corretor parceiro, criar lead automaticamente
    // Quando tem partnerId, o visitante é cliente do parceiro — NÃO criar lead nosso
    let finalLeadId = leadId || null;
    if (!leadId && visitorName && !partnerId) {
      const newLead = await prisma.lead.create({
        data: {
          name: visitorName,
          email: visitorEmail || null,
          phone: visitorPhone || null,
          status: "NOVO",
          source: "PRESENCIAL",
          tags: ["VISITA_AGENDADA"],
          score: 60,
          probability: 60,
          propertyId: propertyIds[0] || null,
          corretorId: corretorId || session.id,
          createdById: session.id,
          message: `Visita agendada para ${new Date(date).toLocaleDateString("pt-BR", { timeZone: "UTC" })} às ${time}`,
        },
      });
      finalLeadId = newLead.id;

      // Registrar atividade de criação no lead
      await prisma.leadActivity.create({
        data: {
          leadId: newLead.id,
          type: "LEAD_CRIADO_VIA_VISITA",
          description: `Lead criado automaticamente ao agendar visita para ${new Date(date).toLocaleDateString("pt-BR", { timeZone: "UTC" })} às ${time}`,
          userId: session.id,
        },
      });
    }

    // Se já tinha leadId, adicionar tag VISITA_AGENDADA se não tiver
    if (leadId) {
      const existingLead = await prisma.lead.findUnique({
        where: { id: leadId },
        select: { tags: true },
      });
      if (existingLead && !existingLead.tags.includes("VISITA_AGENDADA")) {
        await prisma.lead.update({
          where: { id: leadId },
          data: { tags: { push: "VISITA_AGENDADA" } },
        });
      }
    }

    // Criar a visita (usar T12:00:00 para evitar problema de timezone UTC-3)
    const visitDate = new Date(`${date}T12:00:00`);
    const visit = await prisma.scheduledVisit.create({
      data: {
        date: visitDate,
        time,
        endTime,
        notes,
        internalNotes,
        leadId: finalLeadId,
        visitorName: visitorName || null,
        visitorEmail: visitorEmail || null,
        visitorPhone: visitorPhone || null,
        corretorId: corretorId || session.id,
        partnerId: partnerId || null,
        createdById: session.id,
        isPartnerProperty: isPartnerProperty || false,
        partnerPropertyDesc: isPartnerProperty ? (partnerPropertyDesc || null) : null,
        partnerPropertyAddress: isPartnerProperty ? (partnerPropertyAddress || null) : null,
        properties: {
          create: (propertyIds || []).map((propertyId: string, index: number) => ({
            propertyId,
            visitOrder: index,
          })),
        },
      },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        corretor: {
          select: {
            id: true,
            name: true,
          },
        },
        partner: {
          select: {
            id: true,
            name: true,
            creci: true,
            phone: true,
          },
        },
        properties: {
          include: {
            property: {
              select: {
                id: true,
                code: true,
                title: true,
                address: true,
                neighborhood: true,
                city: true,
              },
            },
          },
        },
      },
    });

    // Descrição dos imóveis (nossos ou do parceiro)
    const propertyTitles = visit.properties.length > 0
      ? visit.properties.map(p => p.property.code).join(", ")
      : isPartnerProperty ? (partnerPropertyDesc || "Imóvel do parceiro") : "";

    // Registrar visita no histórico do parceiro se houver
    if (partnerId) {
      // Criar BusinessPartnerVisit para cada imóvel nosso
      for (const prop of visit.properties) {
        await prisma.businessPartnerVisit.create({
          data: {
            partnerId,
            propertyId: prop.propertyId,
            visitDate: visitDate,
            clientName: visit.lead?.name || visitorName || null,
            clientPhone: visit.lead?.phone || visitorPhone || null,
          },
        });
      }
      // Registrar atividade do parceiro
      await prisma.businessPartnerActivity.create({
        data: {
          partnerId,
          type: "VISITA",
          description: `Visita agendada para ${new Date(date).toLocaleDateString("pt-BR", { timeZone: "UTC" })} às ${time} - ${propertyTitles}`,
        },
      });
      // Atualizar métricas do parceiro
      await prisma.businessPartner.update({
        where: { id: partnerId },
        data: {
          totalVisits: { increment: 1 },
          lastVisit: new Date(),
        },
      });
    }

    // Registrar atividade no lead se houver
    if (leadId) {
      await Promise.all([
        prisma.leadActivity.create({
          data: {
            leadId,
            type: "VISITA_AGENDADA",
            description: `Visita agendada para ${new Date(date).toLocaleDateString("pt-BR", { timeZone: "UTC" })} às ${time} - ${propertyTitles}`,
            metadata: {
              visitId: visit.id,
              propertyIds: propertyIds || [],
              isPartnerProperty: isPartnerProperty || false,
              partnerPropertyDesc: partnerPropertyDesc || null,
            },
            userId: session.id,
          },
        }),
        // Reiniciar contador de atraso ao registrar visita
        prisma.lead.update({
          where: { id: leadId },
          data: { lastContact: new Date() },
        }),
      ]);
    }

    return NextResponse.json(visit, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar visita:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Erro ao criar visita" },
      { status: 500 }
    );
  }
}
