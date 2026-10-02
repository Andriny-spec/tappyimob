import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { UTM_COOKIE, UTM_VAZIO, desserializarOrigem } from "@/lib/utm";
import { enviarLeadParaWebhook } from "@/lib/webhook-leads";
import { z } from "zod";

const createVisitSchema = z.object({
  propertyId: z.string().min(1, "ID do imóvel é obrigatório"),
  date: z.string(),
  time: z.string().optional(),
  notes: z.string().optional(),
  visitorName: z.string().min(2),
  visitorEmail: z.string().email().optional().or(z.literal("")),
  visitorPhone: z.string().optional(),
});

// GET - Listar visitas
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    // Permitir apenas admin e corretor ver todas as visitas
    if (!session || (session.role !== "ADMIN" && session.role !== "CORRETOR")) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");
    const status = searchParams.get("status"); // pending, confirmed, cancelled, past
    const search = searchParams.get("search");

    const where: any = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (propertyId) {
      where.propertyId = propertyId;
    }

    if (status) {
      switch (status) {
        case "pending":
          where.confirmed = false;
          where.cancelled = false;
          where.date = { gte: today };
          break;
        case "confirmed":
          where.confirmed = true;
          where.cancelled = false;
          where.date = { gte: today };
          break;
        case "cancelled":
          where.cancelled = true;
          break;
        case "past":
          where.date = { lt: today };
          where.cancelled = false;
          break;
      }
    }

    if (search) {
      where.OR = [
        { visitorName: { contains: search, mode: "insensitive" } },
        { visitorEmail: { contains: search, mode: "insensitive" } },
        { property: { title: { contains: search, mode: "insensitive" } } },
        { property: { code: { contains: search, mode: "insensitive" } } },
      ];
    }

    const visits = await prisma.visit.findMany({
      where,
      include: {
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ visits });
  } catch (error) {
    console.error("Error fetching visits:", error);
    return NextResponse.json(
      { error: "Erro ao buscar visitas" },
      { status: 500 }
    );
  }
}

// POST - Solicitar visita (público ou autenticado)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();
    const validatedData = createVisitSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Dados inválidos", issues: validatedData.error.issues },
        { status: 400 }
      );
    }

    const data = validatedData.data;

    // Verificar se imóvel existe
    const property = await prisma.property.findUnique({
      where: { id: data.propertyId },
      select: { id: true, ownerId: true, code: true, title: true, price: true },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Imóvel não encontrado" },
        { status: 404 }
      );
    }

    const visit = await prisma.visit.create({
      data: {
        propertyId: data.propertyId,
        date: new Date(data.date),
        time: data.time,
        notes: data.notes,
        visitorName: data.visitorName,
        visitorEmail: data.visitorEmail,
        visitorPhone: data.visitorPhone,
        userId: session?.id,
        confirmed: false,
        cancelled: false,
      },
      include: {
        property: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
      },
    });

    // Criar lead no Kanban automaticamente com tarja de visita
    try {
      const visitDateFormatted = new Date(data.date).toLocaleDateString("pt-BR");
      const messageParts = [
        `Solicitação de visita ao imóvel ${property.code}`,
        `Data preferida: ${visitDateFormatted}${data.time ? ` às ${data.time}` : ""}`,
      ];
      if (data.notes?.trim()) {
        messageParts.push(`Observações: ${data.notes.trim()}`);
      }

      // Esta rota atende tanto o visitante do site quanto o admin agendando
      // pelo painel. Só o visitante tem origem de campanha — herdar o cookie
      // do admin marcaria o lead com a navegação de quem cadastrou.
      const origem = session
        ? { ...UTM_VAZIO }
        : desserializarOrigem(request.cookies.get(UTM_COOKIE)?.value);

      const newLead = await prisma.lead.create({
        data: {
          name: data.visitorName,
          email: data.visitorEmail || null,
          phone: data.visitorPhone || null,
          status: "NOVO",
          source: "PRESENCIAL",
          tags: ["VISITA_AGENDADA"],
          score: 60,
          probability: 60,
          propertyId: data.propertyId,
          message: messageParts.join("\n"),
          ...origem,
        },
      });

      await prisma.leadActivity.create({
        data: {
          leadId: newLead.id,
          type: "LEAD_CRIADO_VIA_VISITA",
          description: `Lead criado automaticamente via solicitação de visita ao imóvel ${property.code}`,
          userId: session?.id || newLead.id,
        },
      });

      // Espelhar na planilha do marketing — só o pedido vindo do site. Visita
      // lançada pelo admin no painel não é lead de campanha.
      if (!session) {
        enviarLeadParaWebhook({
          ...newLead,
          propertyCode: property.code,
          propertyTitle: property.title,
          propertyPrice: property.price,
        }).catch((err) => console.error("Erro no webhook de leads:", err));
      }
    } catch (leadError) {
      console.error("Erro ao criar lead da visita:", leadError);
    }

    // Criar notificação para todos os admins
    try {
      const admins = await prisma.user.findMany({
        where: { role: "ADMIN", isActive: true },
        select: { id: true },
      });

      const notifData = admins.map((admin) => ({
        userId: admin.id,
        title: "📅 Nova solicitação de visita",
        message: `${data.visitorName} solicitou visita ao imóvel ${property.code}${data.time ? ` — Horário: ${data.time}` : ""}`,
        type: "visit",
        link: `/admin/imoveis/${property.id}?tab=visitas`,
        read: false,
      }));

      if (notifData.length > 0) {
        await prisma.notification.createMany({ data: notifData });
      }
    } catch (notifErr) {
      console.error("Erro ao criar notificações de visita:", notifErr);
    }

    return NextResponse.json({ 
      visit,
      message: "Solicitação de visita enviada com sucesso!" 
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating visit:", error);
    return NextResponse.json(
      { error: "Erro ao solicitar visita" },
      { status: 500 }
    );
  }
}
