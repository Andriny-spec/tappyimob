import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar exclusividades compartilhadas com parceiros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const showToPartners = searchParams.get("showToPartners");

    const where: any = {};
    if (showToPartners !== null) {
      where.showToPartners = showToPartners === "true";
    }

    const exclusives = await prisma.partnerExclusiveAccess.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // Buscar dados dos imóveis
    const propertyIds = exclusives.map((e) => e.propertyId);
    const properties = await prisma.property.findMany({
      where: { id: { in: propertyIds } },
      select: {
        id: true,
        code: true,
        title: true,
        price: true,
        thumbnail: true,
        images: true,
        videos: true,
        neighborhood: true,
        city: true,
        bedrooms: true,
        area: true,
        status: true,
      },
    });

    // Combinar dados
    const result = exclusives.map((exclusive) => ({
      ...exclusive,
      property: properties.find((p) => p.id === exclusive.propertyId),
    }));

    return NextResponse.json({ exclusives: result });
  } catch (error) {
    console.error("Erro ao listar exclusividades:", error);
    return NextResponse.json({ error: "Erro ao listar exclusividades" }, { status: 500 });
  }
}

// POST - Criar/Atualizar configuração de exclusividade
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const exclusive = await prisma.partnerExclusiveAccess.upsert({
      where: { propertyId: body.propertyId },
      create: {
        propertyId: body.propertyId,
        showToPartners: body.showToPartners ?? true,
        commissionPercent: body.commissionPercent,
        commissionNotes: body.commissionNotes,
        specialConditions: body.specialConditions,
        allowPhotoDownload: body.allowPhotoDownload ?? true,
        allowVideoDownload: body.allowVideoDownload ?? true,
        customMaterials: body.customMaterials,
        requireLogin: body.requireLogin ?? false,
        allowedPartnerIds: body.allowedPartnerIds || [],
        validUntil: body.validUntil ? new Date(body.validUntil) : null,
      },
      update: {
        showToPartners: body.showToPartners,
        commissionPercent: body.commissionPercent,
        commissionNotes: body.commissionNotes,
        specialConditions: body.specialConditions,
        allowPhotoDownload: body.allowPhotoDownload,
        allowVideoDownload: body.allowVideoDownload,
        customMaterials: body.customMaterials,
        requireLogin: body.requireLogin,
        allowedPartnerIds: body.allowedPartnerIds,
        validUntil: body.validUntil ? new Date(body.validUntil) : null,
      },
    });

    return NextResponse.json(exclusive);
  } catch (error) {
    console.error("Erro ao configurar exclusividade:", error);
    return NextResponse.json({ error: "Erro ao configurar exclusividade" }, { status: 500 });
  }
}
