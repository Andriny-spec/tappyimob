import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar funis de parceiros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerType = searchParams.get("partnerType");

    const where: any = {};
    if (partnerType) {
      where.partnerTypes = { has: partnerType };
    }

    const funnels = await prisma.partnerFunnel.findMany({
      where,
      include: {
        stages: {
          orderBy: { order: "asc" },
          include: {
            _count: { select: { partners: true } },
          },
        },
        automations: true,
        _count: {
          select: { stages: true, automations: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ funnels });
  } catch (error) {
    console.error("Erro ao listar funis:", error);
    return NextResponse.json({ error: "Erro ao listar funis" }, { status: 500 });
  }
}

// POST - Criar funil
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const funnel = await prisma.partnerFunnel.create({
      data: {
        name: body.name,
        description: body.description,
        partnerTypes: body.partnerTypes || ["CORRETOR"],
        isDefault: body.isDefault || false,
        // Criar estágios padrão
        stages: {
          create: body.stages || [
            { name: "Primeiro Contato", color: "#3b82f6", order: 0, daysToStagnate: 7 },
            { name: "Qualificação", color: "#f59e0b", order: 1, daysToStagnate: 14 },
            { name: "Negociação", color: "#8b5cf6", order: 2, daysToStagnate: 30 },
            { name: "Ativo", color: "#22c55e", order: 3 },
            { name: "Premium", color: "#ec4899", order: 4 },
            { name: "Inativo", color: "#6b7280", order: 5 },
          ],
        },
      },
      include: {
        stages: { orderBy: { order: "asc" } },
      },
    });

    return NextResponse.json(funnel, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar funil:", error);
    return NextResponse.json({ error: "Erro ao criar funil" }, { status: 500 });
  }
}
