import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET - Buscar condição especial do imóvel
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const property = await prisma.property.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        code: true,
        hasPartnerCondition: true,
        partnerConditionType: true,
        partnerConditionValue: true,
        partnerConditionDesc: true,
        partnerConditionExpiry: true,
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Imóvel não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ partnerCondition: property });
  } catch (error) {
    console.error("Erro ao buscar condição especial:", error);
    return NextResponse.json(
      { error: "Erro ao buscar condição especial" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar condição especial (apenas ADMIN)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se é ADMIN
    if (session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Apenas administradores podem gerenciar condições especiais" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      hasPartnerCondition,
      partnerConditionType,
      partnerConditionValue,
      partnerConditionDesc,
      partnerConditionExpiry,
    } = body;

    const propBeforePc = await prisma.property.findUnique({ where: { id: params.id }, select: { updatedAt: true } });
    const property = await prisma.property.update({
      where: { id: params.id },
      data: {
        hasPartnerCondition: hasPartnerCondition ?? false,
        partnerConditionType: hasPartnerCondition ? partnerConditionType : null,
        partnerConditionValue: hasPartnerCondition ? partnerConditionValue : null,
        partnerConditionDesc: hasPartnerCondition ? partnerConditionDesc : null,
        partnerConditionExpiry: hasPartnerCondition && partnerConditionExpiry
          ? new Date(partnerConditionExpiry)
          : null,
      },
      select: {
        id: true,
        code: true,
        hasPartnerCondition: true,
        partnerConditionType: true,
        partnerConditionValue: true,
        partnerConditionDesc: true,
        partnerConditionExpiry: true,
      },
    });
    // Preservar updatedAt original — condição de parceiro não altera essa data
    if (propBeforePc) await prisma.$executeRaw`UPDATE "properties" SET "updatedAt" = ${propBeforePc.updatedAt} WHERE "id" = ${params.id}`;

    return NextResponse.json({
      success: true,
      partnerCondition: property,
    });
  } catch (error) {
    console.error("Erro ao atualizar condição especial:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar condição especial" },
      { status: 500 }
    );
  }
}
