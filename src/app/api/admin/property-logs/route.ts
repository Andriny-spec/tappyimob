import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar logs de atividade de imóveis
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const action = searchParams.get("action"); // CREATED, UPDATED, DELETED
    const userId = searchParams.get("userId");
    const propertyId = searchParams.get("propertyId");
    const search = searchParams.get("search");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const skip = (page - 1) * limit;

    const corretorId = searchParams.get("corretorId");

    const where: any = {};

    if (action) where.action = action;
    if (userId) where.userId = userId;
    if (propertyId) where.propertyId = propertyId;
    if (corretorId) where.userId = corretorId;

    if (search) {
      where.OR = [
        { propertyCode: { contains: search, mode: "insensitive" } },
        { propertyTitle: { contains: search, mode: "insensitive" } },
        { userName: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo + "T23:59:59.999Z");
    }

    const [logs, total, corretores] = await Promise.all([
      prisma.propertyActivityLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
              role: true,
            },
          },
          property: {
            select: {
              id: true,
              code: true,
              title: true,
              thumbnail: true,
              status: true,
              propertyOwner: {
                select: {
                  id: true,
                  name: true,
                  phones: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.propertyActivityLog.count({ where }),
      prisma.user.findMany({
        where: { role: { in: ["ADMIN", "CORRETOR"] }, isActive: true },
        select: { id: true, name: true, role: true },
        orderBy: { name: "asc" },
      }),
    ]);

    return NextResponse.json({
      logs,
      corretores,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar logs:", error);
    return NextResponse.json(
      { error: "Erro ao buscar logs de atividade" },
      { status: 500 }
    );
  }
}
