import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// POST - Registrar clique em telefone/WhatsApp do proprietário
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { propertyId, ownerId, contactType, phoneNumber } = await request.json();

    if (!propertyId || !contactType) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    await prisma.ownerContactLog.create({
      data: {
        propertyId,
        ownerId: ownerId || null,
        userId: session.id,
        contactType, // PHONE, WHATSAPP, EMAIL
        phoneNumber: phoneNumber || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao registrar contato:", error);
    return NextResponse.json({ error: "Erro ao registrar" }, { status: 500 });
  }
}

// GET - Buscar estatísticas de cliques (admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.id || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = {};
    if (propertyId) where.propertyId = propertyId;

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo + "T23:59:59.999Z");
    }

    const [logs, total, stats] = await Promise.all([
      prisma.ownerContactLog.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, avatar: true, role: true } },
          property: { select: { id: true, code: true, title: true, thumbnail: true } },
          owner: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.ownerContactLog.count({ where }),
      prisma.ownerContactLog.groupBy({
        by: ["contactType"],
        where,
        _count: { id: true },
      }),
    ]);

    const statsByType = {
      PHONE: stats.find((s) => s.contactType === "PHONE")?._count?.id || 0,
      WHATSAPP: stats.find((s) => s.contactType === "WHATSAPP")?._count?.id || 0,
      EMAIL: stats.find((s) => s.contactType === "EMAIL")?._count?.id || 0,
    };

    return NextResponse.json({
      logs,
      stats: statsByType,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar logs de contato:", error);
    return NextResponse.json({ error: "Erro ao buscar logs" }, { status: 500 });
  }
}
