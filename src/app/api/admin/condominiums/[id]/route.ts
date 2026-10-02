import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Buscar condomínio por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const condominium = await (prisma.condominium.findUnique as any)({
      where: { id },
      include: {
        towers: {
          orderBy: { name: "asc" },
        },
        builderPartner: {
          select: {
            id: true,
            name: true,
          },
        },
        properties: {
          select: {
            id: true,
            code: true,
            title: true,
            type: true,
            status: true,
            price: true,
            thumbnail: true,
          },
          take: 10,
        },
        _count: {
          select: { properties: true },
        },
      },
    });

    if (!condominium) {
      return NextResponse.json(
        { error: "Condomínio não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(condominium);
  } catch (error) {
    console.error("Erro ao buscar condomínio:", error);
    return NextResponse.json(
      { error: "Erro ao buscar condomínio" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar condomínio
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { towers, ...condoData } = body;

    // Buscar condomínio atual para comparar nome
    const current = await prisma.condominium.findUnique({ where: { id }, select: { name: true, slug: true } });
    if (!current) {
      return NextResponse.json({ error: "Condomínio não encontrado" }, { status: 404 });
    }

    // Só recalcular slug se o nome mudou
    let slug = condoData.slug || current.slug;
    if (condoData.name && condoData.name !== current.name) {
      slug = condoData.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Verificar se o novo slug já existe em outro condomínio
      const existing = await prisma.condominium.findFirst({
        where: { slug, id: { not: id } },
      });
      if (existing) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    // Atualizar condomínio
    const condominium = await (prisma.condominium.update as any)({
      where: { id },
      data: {
        name: condoData.name,
        slug: slug,
        description: condoData.description,
        condoCategory: condoData.condoCategory,
        condoType: condoData.condoType,
        builderId: condoData.builderId || null,
        address: condoData.address,
        number: condoData.number,
        neighborhood: condoData.neighborhood,
        city: condoData.city,
        state: condoData.state,
        zipCode: condoData.zipCode,
        latitude: condoData.latitude,
        longitude: condoData.longitude,
        fakeAddress: condoData.fakeAddress,
        fakeNumber: condoData.fakeNumber,
        showRealAddress: condoData.showRealAddress,
        totalUnits: condoData.totalUnits,
        totalLots: condoData.totalLots,
        yearBuilt: condoData.yearBuilt,
        builder: condoData.builder,
        availableSizes: condoData.availableSizes,
        hasApartment: condoData.hasApartment,
        hasHouse: condoData.hasHouse,
        hasTerrain: condoData.hasTerrain,
        hasCommercial: condoData.hasCommercial,
        hasCobertura: condoData.hasCobertura,
        hasGarden: condoData.hasGarden,
        hasFlat: condoData.hasFlat,
        hasStudio: condoData.hasStudio,
        hasCasaTerrea: condoData.hasCasaTerrea,
        hasSobrado: condoData.hasSobrado,
        amenities: condoData.amenities,
        hasSportsAdvisory: condoData.hasSportsAdvisory,
        activityScheduleImage: condoData.activityScheduleImage,
        adminName: condoData.adminName,
        adminPhone: condoData.adminPhone,
        adminEmail: condoData.adminEmail,
        porterPhone: condoData.porterPhone,
        // Contatos do condomínio (JSON)
        contacts: condoData.contacts,
        // Administradora
        managementCompany: condoData.managementCompany,
        managementCompanyPhone: condoData.managementCompanyPhone,
        managementCompanyEmail: condoData.managementCompanyEmail,
        managementCompanyWebsite: condoData.managementCompanyWebsite,
        // Projeto em fase de lançamento
        isLaunchProject: condoData.isLaunchProject,
        launchStage: condoData.launchStage,
        expectedDelivery: condoData.expectedDelivery ? new Date(condoData.expectedDelivery) : null,
        launchDescription: condoData.launchDescription,
        // Mídia
        thumbnail: condoData.thumbnail,
        images: condoData.images,
        videos: condoData.videos,
        virtualTour: condoData.virtualTour,
        // Documentos internos
        internalMap: condoData.internalMap,
        maps: condoData.maps,
        implantation: condoData.implantation,
        floorPlans: condoData.floorPlans,
        // SEO
        metaTitle: condoData.metaTitle,
        metaDescription: condoData.metaDescription,
        isActive: condoData.isActive,
        isFeatured: condoData.isFeatured,
      },
    });

    // Atualizar torres
    if (towers) {
      // Deletar torres removidas
      const existingTowerIds = towers.filter((t: any) => t.id).map((t: any) => t.id);
      await prisma.condoTower.deleteMany({
        where: {
          condominiumId: id,
          id: { notIn: existingTowerIds },
        },
      });

      // Atualizar ou criar torres
      for (const tower of towers) {
        if (tower.id) {
          await prisma.condoTower.update({
            where: { id: tower.id },
            data: {
              name: tower.name,
              floors: tower.floors,
              unitsPerFloor: tower.unitsPerFloor,
              totalUnits: tower.totalUnits,
              availableSizes: tower.availableSizes || [],
            },
          });
        } else {
          await prisma.condoTower.create({
            data: {
              condominiumId: id,
              name: tower.name,
              floors: tower.floors,
              unitsPerFloor: tower.unitsPerFloor,
              totalUnits: tower.totalUnits,
              availableSizes: tower.availableSizes || [],
            },
          });
        }
      }
    }

    // Retornar com torres
    const result = await prisma.condominium.findUnique({
      where: { id },
      include: { towers: true },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao atualizar condomínio:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar condomínio" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir condomínio
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verificar se há imóveis vinculados
    const propertiesCount = await prisma.property.count({
      where: { condominiumId: id },
    });

    if (propertiesCount > 0) {
      return NextResponse.json(
        {
          error: `Não é possível excluir. Existem ${propertiesCount} imóveis vinculados a este condomínio.`,
        },
        { status: 400 }
      );
    }

    await prisma.condominium.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir condomínio:", error);
    return NextResponse.json(
      { error: "Erro ao excluir condomínio" },
      { status: 500 }
    );
  }
}
