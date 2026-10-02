import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logPropertyActivity } from "@/lib/property-logger";
import { z } from "zod";

// Schema de validação para atualizar imóvel
// Permissivo: a validação real é feita pelo allowedScalarFields whitelist + Prisma constraints.
// Um schema restritivo rejeitava payloads inteiros quando campos nullable vinham como null
// (ex: description: null falhava em z.string().min(10).optional()).
const updatePropertySchema = z.object({}).passthrough();

// GET - Buscar imóvel por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Tentar buscar por ID primeiro, depois por slug, depois por código
    let property: any = null;
    
    // Include compartilhado para todas as buscas
    const fullInclude = {
      owner: {
        select: { id: true, name: true, avatar: true, phone: true, email: true, creci: true },
      },
      propertyOwner: true,
      condominium: {
        select: {
          id: true, name: true, slug: true, description: true, condoType: true,
          neighborhood: true, city: true, state: true, thumbnail: true, images: true,
          amenities: true, totalUnits: true, yearBuilt: true, builder: true, isFeatured: true,
        },
      },
      leadsList: {
        orderBy: { createdAt: "desc" as const },
        take: 5,
        select: { id: true, name: true, email: true, phone: true, status: true, temperature: true, createdAt: true, message: true, corretorId: true },
      },
      availabilityConfirmedBy: {
        select: { id: true, name: true, role: true },
      },
      proposals: {
        orderBy: { createdAt: "desc" as const },
        include: {
          corretor: { select: { id: true, name: true, avatar: true } },
        },
      },
      parentProperty: {
        select: { id: true, code: true, title: true, category: true, status: true, saleStatus: true, rentalStatus: true, price: true, rentPrice: true, thumbnail: true },
      },
      variations: {
        select: { id: true, code: true, title: true, category: true, status: true, saleStatus: true, rentalStatus: true, price: true, rentPrice: true, thumbnail: true },
      },
      changelog: {
        orderBy: { createdAt: "desc" as const },
        take: 50,
        select: { id: true, field: true, oldValue: true, newValue: true, userName: true, createdAt: true },
      },
      documents: true,
      photoSessions: {
        orderBy: { scheduledDate: "desc" as const },
        take: 5,
        select: { id: true, scheduledDate: true, scheduledTime: true, status: true, brokerConfirmed: true, ownerConfirmed: true, photographerId: true },
      },
      exclusivity: {
        select: { id: true, status: true, captadorName: true, captadorId: true, startDate: true, endDate: true, createdAt: true, updatedAt: true },
      },
      visitRecords: {
        orderBy: { createdAt: "desc" as const },
        take: 50,
        select: { id: true, visitDate: true, clientName: true, clientPhone: true, brokerName: true, feedback: true, status: true, rating: true, createdAt: true },
      },
      observations: {
        orderBy: { createdAt: "desc" as const },
        take: 50,
        select: { id: true, content: true, userId: true, user: { select: { name: true } }, createdAt: true },
      },
      priceHistory: {
        orderBy: { createdAt: "desc" as const },
        take: 50,
        select: { id: true, oldPrice: true, newPrice: true, priceType: true, changeType: true, changeAmount: true, changePercent: true, notes: true, createdAt: true, changedBy: { select: { name: true } } },
      },
      updatedBy: {
        select: { id: true, name: true, avatar: true, role: true },
      },
      scheduledVisitProperties: {
        include: {
          visit: {
            select: { id: true, date: true, time: true, status: true, visitorName: true, lead: { select: { name: true } }, corretor: { select: { name: true } } },
          },
        },
        orderBy: { visit: { date: "desc" as const } },
      },
    };

    // 1. Tentar por ID (CUID)
    try {
      property = await prisma.property.findUnique({ where: { id }, include: fullInclude });
    } catch (err: any) {
      console.error("[Property GET] Erro ao buscar por ID:", err?.message?.slice(0, 300));
    }

    // 2. Tentar por slug
    if (!property) {
      try {
        property = await prisma.property.findUnique({ where: { slug: id.trim() }, include: fullInclude });
      } catch (err: any) {
        console.error("[Property GET] Erro ao buscar por slug:", err?.message?.slice(0, 300));
      }
    }

    // 3. Tentar por código (ex: CNCF00123)
    if (!property) {
      try {
        property = await prisma.property.findUnique({ where: { code: id }, include: fullInclude });
      } catch (err: any) {
        console.error("[Property GET] Erro ao buscar por code:", err?.message?.slice(0, 300));
      }
    }

    if (!property) {
      return NextResponse.json(
        { error: "Imóvel não encontrado" },
        { status: 404 }
      );
    }

    // Imóveis ocultos do site (showOnWebsite=false) ou Off Market (isOffMarket=true)
    // não podem ser acessados via URL direta por quem não é da equipe interna —
    // só CLIENTE/PARCEIRO_EXTERNO/anônimo são tratados como "público" aqui.
    const session = await getSession().catch(() => null);
    const staffRoles = ["ADMIN", "CORRETOR", "SDR", "FOTOGRAFO"];
    const isStaff = !!session && staffRoles.includes(session.role);
    if (!isStaff && (property.showOnWebsite === false || property.isOffMarket === true)) {
      return NextResponse.json(
        { error: "Imóvel não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o proprietário é um gestor de parceria (BusinessPartner)
    let linkedPartner = null;
    if (property.propertyOwner) {
      const po = property.propertyOwner;
      const orConditions: any[] = [];

      // Match por CPF
      if (po.cpf) {
        orConditions.push({ cpf: po.cpf });
      }

      // Match por telefone
      if (po.phones && po.phones.length > 0) {
        for (const phone of po.phones) {
          const digits = phone.replace(/\D/g, "");
          if (digits.length >= 10) {
            orConditions.push({ phone: { contains: digits.slice(-9) } });
          }
        }
      }

      // Match por nome exato + email
      if (po.name && po.email) {
        orConditions.push({ AND: [{ name: po.name }, { email: po.email }] });
      }

      if (orConditions.length > 0) {
        linkedPartner = await prisma.businessPartner.findFirst({
          where: { OR: orConditions },
          select: {
            id: true,
            name: true,
            type: true,
            phone: true,
            email: true,
            creci: true,
            creciStatus: true,
            partnershipFormat: true,
            partnershipTermStatus: true,
            isActive: true,
            avatar: true,
            specialties: true,
            totalVGV: true,
            totalContracts: true,
            agency: {
              select: { id: true, companyName: true, tradeName: true },
            },
          },
        });
      }
    }

    // Resolver nome do gestor de exclusividade
    let exclusivityManager = null;
    if (property.isThirdPartyExclusive && property.exclusivityManagerId) {
      try {
        if (property.exclusivityManagerType === "IMOBILIARIA") {
          const agency = await prisma.realEstateAgency.findUnique({
            where: { id: property.exclusivityManagerId },
            select: { id: true, companyName: true, tradeName: true, phone: true, email: true },
          });
          if (agency) {
            exclusivityManager = { id: agency.id, name: agency.tradeName || agency.companyName, type: "IMOBILIARIA", phone: agency.phone, email: agency.email };
          }
        } else {
          // Tentar primeiro na tabela user (corretor interno)
          const user = await prisma.user.findUnique({
            where: { id: property.exclusivityManagerId },
            select: { id: true, name: true, phone: true, email: true, creci: true, avatar: true },
          });
          if (user) {
            exclusivityManager = { id: user.id, name: user.name, type: "CORRETOR", phone: user.phone, email: user.email, creci: user.creci, avatar: user.avatar };
          } else {
            // Fallback: buscar na tabela businessPartner (parceiro/corretor externo)
            const partner = await prisma.businessPartner.findUnique({
              where: { id: property.exclusivityManagerId },
              select: { id: true, name: true, phone: true, email: true, creci: true, avatar: true },
            });
            if (partner) {
              exclusivityManager = { id: partner.id, name: partner.name, type: "CORRETOR", phone: partner.phone, email: partner.email, creci: partner.creci, avatar: partner.avatar };
            }
          }
        }
      } catch (e) { /* ignore lookup errors */ }
    }

    // Filtrar leadsList com base no papel do usuário logado
    // Corretores só veem leads vinculados a eles; admins veem todos
    if (property.leadsList) {
      if (!session) {
        // Acesso público/site: remover todos os leads por segurança
        property.leadsList = [];
      } else if (session.role === "CORRETOR") {
        // Corretor só vê leads atribuídos a ele
        property.leadsList = property.leadsList.filter((l: any) => l.corretorId === session.id);
      }
      // Admin vê todos — sem filtro
    }

    // Filtrar propostas: corretor só vê as próprias + RECUSADA; admin vê todas
    if (property.proposals) {
      if (!session) {
        property.proposals = [];
      } else if (session.role === "CORRETOR") {
        property.proposals = property.proposals.filter(
          (p: any) => p.corretorId === session.id || p.status === "RECUSADA"
        );
      }
      // Mapear proposedValue → value para compatibilidade com frontend
      property.proposals = property.proposals.map((p: any) => ({
        ...p,
        value: p.proposedValue,
        description: p.scopeSummary || p.notes,
        date: p.createdAt,
      }));
    }

    // Mapear scheduledVisitProperties para visits (compatibilidade com badge de contagem)
    if (property.scheduledVisitProperties) {
      (property as any).visits = property.scheduledVisitProperties.map((svp: any) => ({
        id: svp.visit?.id,
        date: svp.visit?.date,
        time: svp.visit?.time,
        status: svp.visit?.status,
        visitorName: svp.visit?.lead?.name || svp.visit?.visitorName,
        corretorName: svp.visit?.corretor?.name,
      }));
    }

    // Views são contabilizadas exclusivamente via /api/tracking (hook useTracking no frontend)
    // para evitar contagem dupla e garantir consistência com Google Analytics

    return NextResponse.json({ property, linkedPartner, exclusivityManager }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (error) {
    console.error("Error fetching property:", error);
    return NextResponse.json(
      { error: "Erro ao buscar imóvel" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar imóvel
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    
    if (!session || (session.role !== "ADMIN" && session.role !== "CORRETOR")) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updatePropertySchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Dados inválidos", issues: validatedData.error.issues },
        { status: 400 }
      );
    }

    // Verificar se o imóvel existe
    const existingProperty = await prisma.property.findUnique({
      where: { id },
    });

    if (!existingProperty) {
      return NextResponse.json(
        { error: "Imóvel não encontrado" },
        { status: 404 }
      );
    }

    // Permissão: admin e corretor podem editar qualquer imóvel

    // Campos importantes para registrar no changelog
    const trackedFields = [
      "price", "rentPrice", "status", "saleStatus", "rentalStatus",
      "title", "description", "category", "type", "condition",
      "bedrooms", "bathrooms", "suites", "parkingSpaces",
      "area", "totalArea", "usefulArea",
      "address", "neighborhood", "city", "state", "zipCode",
      "condoFee", "iptu",
      "isFeatured", "isExclusive", "isThirdPartyExclusive",
      "isNegotiable", "acceptsExchange", "acceptsFinancing",
      "showOnWebsite", "isOffMarket", "hasPlate", "isOccupied",
      "soldBy", "soldAt", "soldPrice",
      "ownerNickname", "exclusivityManagerId",
      "thumbnail",
      "images",
    ];

    // Registrar alterações no changelog
    const changelogEntries: any[] = [];
    for (const field of trackedFields) {
      const oldValue = (existingProperty as any)[field];
      const newValue = (validatedData.data as any)[field];
      
      if (newValue !== undefined && String(oldValue) !== String(newValue)) {
        changelogEntries.push({
          propertyId: id,
          userId: session.id,
          userName: session.name || "Sistema",
          field,
          oldValue: oldValue?.toString() || null,
          newValue: newValue?.toString() || null,
        });
      }
    }

    // Criar entradas no changelog
    if (changelogEntries.length > 0) {
      await prisma.propertyChangelog.createMany({
        data: changelogEntries,
      });
    }

    // Whitelist de campos escalares válidos do model Property
    const allowedScalarFields = new Set([
      "code", "title", "marketplaceTitle", "slug", "description", "shortDescription",
      "condoDescription", "exchangeDescription",
      "towerName", "unitNumber",
      "propertyClass", "type", "subType", "category", "condition", "expectedCompletionDate", "status",
      "saleStatus", "rentalStatus",
      "price", "rentPrice", "seasonalPrice", "auctionPrice", "pricePerM2",
      "condoFee", "condoFeeExempt", "iptu", "iptuPeriod", "foro", "foroExempt",
      "isNegotiable", "acceptsExchange", "exchangeType", "exchangeTypes", "exchangeLocations",
      "exchangeMinValue", "exchangeMaxValue",
      "acceptsFinancing", "acceptsFGTS", "acceptsDirectPayment", "directPaymentMonths",
      "hasFinancingBalance", "financingBalance", "financingBank",
      "hasIrregularDocs", "irregularDocsNotes",
      "isCornerHouse", "hasNonBuildableArea", "hasWall",
      "area", "totalArea", "usefulArea", "bedrooms", "suites", "bathrooms",
      "parkingSpaces", "coveredParkingSpaces", "floor", "totalFloors", "unitsPerFloor",
      "position", "sunPosition", "yearBuilt", "propertyAge",
      "address", "number", "complement", "neighborhood", "city", "state", "country", "zipCode",
      "latitude", "longitude", "addressVisibility",
      "thumbnail", "images", "videos", "videoYoutube", "virtualTour", "plants", "hasWatermark",
      "amenities", "features", "extras", "nearbyPlaces",
      "hasElevator", "isFurnished", "hasGroundFloorSuite", "hasFreeView",
      "acceptsPets", "rentalWarranties",
      "landTopography", "landFrontWidth", "landDepth", "hasApprovedProject", "isGroundFloor",
      "metaTitle", "metaDescription", "tags", "rating", "ratingCount",
      "hasPlate", "isOccupied", "hasProfessionalPhotos",
      "showOnWebsite", "websitePublishMode", "isOffMarket", "activePortals", "portalPositions",
      "isFeatured", "isExclusive", "isThirdPartyExclusive",
      "exclusivityManagerId", "exclusivityManagerType", "ownerNickname", "ownerProfiles",
      "isNew", "isSuperFeatured", "portalHighlight", "highlights", "websiteCategories",
      "hasPartnerCondition", "partnerConditionType", "partnerConditionValue",
      "partnerConditionDesc", "partnerConditionExpiry",
      "views", "portalViews", "clicks", "favorites", "shares", "inPersonVisits", "proposalsCount",
      "soldBy", "soldAt", "soldPrice", "soldNotes",
      "rentedBy", "rentedAt", "rentedPrice", "rentedNotes", "followUpDate", "followUpMonths",
      "suspensionDays", "suspensionStartDate", "suspensionEndDate", "suspensionReason",
      "brokerNotes", "publishedAt", "expiresAt",
      "prefeituraOwnerName", "prefeituraOwnerCpf", "prefeituraInscricao", "prefeituraData",
      "lastAvailabilityCheck",
    ]);

    // Extrair FKs de relação antes de filtrar
    const rawData = { ...validatedData.data } as any;
    const condominiumId = rawData.condominiumId;
    const propertyOwnerId = rawData.propertyOwnerId;
    const parentPropertyId = rawData.parentPropertyId;
    const availabilityConfirmedById = rawData.availabilityConfirmedById;
    const ownerId = rawData.ownerId;

    // Extrair campos de PropertyDocument (não pertencem ao model Property)
    const documentFields: Record<string, string | null> = {};
    for (const key of ["matriculaNumber", "iptuNumber", "certidaoSPU"]) {
      if (rawData[key] !== undefined) {
        documentFields[key] = rawData[key] || null;
      }
    }
    // Extrair URLs de documentos enviados pelo frontend
    if (rawData._documentUrls && typeof rawData._documentUrls === "object") {
      for (const key of ["matriculaUrl", "iptuUrl", "certidaoSPUUrl"]) {
        if (rawData._documentUrls[key]) {
          documentFields[key] = rawData._documentUrls[key];
        }
      }
    }

    // Filtrar: só campos escalares válidos
    const dataToUpdate: any = {};
    for (const key of Object.keys(rawData)) {
      if (allowedScalarFields.has(key)) {
        dataToUpdate[key] = rawData[key];
      }
    }

    // Debug: confirmar que features/extras estão no payload
    console.log(`[PUT /api/properties/${id}] features recebidos:`, rawData.features);
    console.log(`[PUT /api/properties/${id}] extras recebidos:`, rawData.extras);
    console.log(`[PUT /api/properties/${id}] features no dataToUpdate:`, dataToUpdate.features);
    console.log(`[PUT /api/properties/${id}] extras no dataToUpdate:`, dataToUpdate.extras);

    // Prisma 7.x: converter FKs para sintaxe de relação (connect/disconnect)
    if (condominiumId !== undefined) {
      if (condominiumId) {
        dataToUpdate.condominium = { connect: { id: condominiumId } };
      } else {
        dataToUpdate.condominium = { disconnect: true };
      }
    }
    if (propertyOwnerId !== undefined) {
      if (propertyOwnerId) {
        dataToUpdate.propertyOwner = { connect: { id: propertyOwnerId } };
      } else {
        dataToUpdate.propertyOwner = { disconnect: true };
      }
    }
    if (parentPropertyId !== undefined) {
      if (parentPropertyId) {
        dataToUpdate.parentProperty = { connect: { id: parentPropertyId } };
      } else {
        dataToUpdate.parentProperty = { disconnect: true };
      }
    }
    if (availabilityConfirmedById !== undefined) {
      if (availabilityConfirmedById) {
        dataToUpdate.availabilityConfirmedBy = { connect: { id: availabilityConfirmedById } };
      } else {
        dataToUpdate.availabilityConfirmedBy = { disconnect: true };
      }
    }
    if (ownerId !== undefined && ownerId) {
      dataToUpdate.owner = { connect: { id: ownerId } };
    }

    // Regenerar slug SOMENTE se o código ou condomínio realmente mudou
    const codeChanged = dataToUpdate.code && dataToUpdate.code !== existingProperty.code;
    const condoChanged = condominiumId !== undefined && condominiumId !== existingProperty.condominiumId;
    const titleChanged = dataToUpdate.title && dataToUpdate.title !== existingProperty.title;
    if (codeChanged || condoChanged || titleChanged) {
      const newCode = dataToUpdate.code || existingProperty.code;
      let condoName = "";
      const resolvedCondoId = condominiumId !== undefined ? condominiumId : existingProperty.condominiumId;
      if (resolvedCondoId) {
        const condo = await prisma.condominium.findUnique({ where: { id: resolvedCondoId }, select: { name: true } });
        if (condo) condoName = condo.name;
      }
      const slugBase = (condoName || dataToUpdate.title || existingProperty.title)
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const candidateSlug = `${slugBase}-${newCode.toLowerCase()}`.trim();
      // Garantir unicidade do slug: se j\u00e1 existe em outro im\u00f3vel, adicionar sufixo
      const slugConflict = await prisma.property.findFirst({
        where: { slug: candidateSlug, id: { not: id } },
        select: { id: true },
      });
      dataToUpdate.slug = slugConflict ? `${candidateSlug}-${Date.now()}` : candidateSlug;
    }

    // Verificar unicidade do c\u00f3digo antes de tentar salvar
    if (dataToUpdate.code && dataToUpdate.code !== existingProperty.code) {
      const codeConflict = await prisma.property.findFirst({
        where: { code: dataToUpdate.code, id: { not: id } },
        select: { id: true },
      });
      if (codeConflict) {
        return NextResponse.json(
          { error: `O c\u00f3digo "${dataToUpdate.code}" j\u00e1 est\u00e1 sendo usado por outro im\u00f3vel.` },
          { status: 400 }
        );
      }
    }

    // Sanitizar subType: se for string vazia ou valor inválido, setar como null
    if (dataToUpdate.subType !== undefined) {
      if (!dataToUpdate.subType || dataToUpdate.subType === "") {
        dataToUpdate.subType = null;
      }
    }

    // Recalcular status principal server-side quando saleStatus ou rentalStatus estão presentes
    if (dataToUpdate.saleStatus !== undefined || dataToUpdate.rentalStatus !== undefined) {
      const saleStatus = dataToUpdate.saleStatus || existingProperty.saleStatus || "ATIVO";
      const rentalStatus = dataToUpdate.rentalStatus || existingProperty.rentalStatus || "ATIVO";
      const category = dataToUpdate.category || existingProperty.category;

      // Tradução direta do sub-status para o status principal.
      //
      // A versão anterior listava valor por valor e caía em DISPONIVEL no que
      // não previsse — o padrão mais perigoso, porque DISPONIVEL é o que vai
      // para os portais. Faltavam combinações que existem no cadastro:
      // LOCACAO com rentalStatus=VENDIDO e VENDA com saleStatus=ALUGADO
      // ficavam "disponíveis" e eram publicados já negociados.
      const traduzir = (s: string) => {
        if (s === "VENDIDO") return "VENDIDO";
        if (s === "ALUGADO") return "ALUGADO";
        if (s === "INATIVO") return "INATIVO";
        if (s === "SUSPENSO") return "SUSPENSO";
        return "DISPONIVEL";
      };
      const encerrado = (s: string) =>
        s === "VENDIDO" || s === "ALUGADO" || s === "INATIVO";

      let computedStatus: string;

      if (category === "VENDA") {
        computedStatus = traduzir(saleStatus);
      } else if (category === "LOCACAO") {
        computedStatus = traduzir(rentalStatus);
      } else {
        // VENDA_LOCACAO: basta uma das pontas ativa para seguir disponível
        if (saleStatus === "ATIVO" || rentalStatus === "ATIVO") {
          computedStatus = "DISPONIVEL";
        } else if (encerrado(saleStatus) && encerrado(rentalStatus)) {
          computedStatus =
            saleStatus === "INATIVO" && rentalStatus === "INATIVO"
              ? "INATIVO"
              : "INDISPONIVEL";
        } else {
          // sobra apenas suspenso (puro ou misturado com encerrado)
          computedStatus = "SUSPENSO";
        }
      }

      dataToUpdate.status = computedStatus;
    }

    // Registrar quem atualizou
    dataToUpdate.updatedBy = { connect: { id: session.id } };

    let property;
    try {
      property = await prisma.property.update({
        where: { id },
        data: dataToUpdate,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

    } catch (prismaError: any) {
      console.error("Erro Prisma ao atualizar imóvel:", prismaError.message);
      const msg = prismaError.message || "";
      // P2002: violação de constraint única (code, slug, etc.)
      if (prismaError.code === "P2002" || msg.includes("Unique constraint")) {
        const field = prismaError.meta?.target?.[0] || "campo";
        const fieldLabels: Record<string, string> = { code: "código", slug: "slug", email: "email" };
        const label = fieldLabels[field] || field;
        return NextResponse.json(
          { error: `Valor duplicado: já existe um imóvel com este ${label}.` },
          { status: 400 }
        );
      }
      // P2025: registro não encontrado para relação (ex: ownerId inválido)
      if (prismaError.code === "P2025") {
        return NextResponse.json(
          { error: "Referência inválida: um dos dados vinculados não foi encontrado." },
          { status: 400 }
        );
      }
      if (msg.includes("Invalid value") || msg.includes("Expected")) {
        return NextResponse.json(
          { error: `Valor inválido em um dos campos: ${msg.split("Expected")[1] || msg}` },
          { status: 400 }
        );
      }
      throw prismaError;
    }

    // Debug: verificar se features/extras foram realmente salvos
    console.log(`[PUT /api/properties/${id}] SALVO - features:`, property.features);
    console.log(`[PUT /api/properties/${id}] SALVO - extras:`, property.extras);

    // Salvar campos de documentos em PropertyDocument (tabela separada)
    if (Object.keys(documentFields).length > 0) {
      try {
        await prisma.propertyDocument.upsert({
          where: { propertyId: id },
          update: documentFields,
          create: { propertyId: id, ...documentFields },
        });
      } catch (docErr: any) {
        console.error("Erro ao salvar documentos do imóvel:", docErr.message);
      }
    }

    // Atualizar emails do PropertyOwner se fornecidos
    const ownerEmails = rawData.ownerEmails;
    if (ownerEmails && Array.isArray(ownerEmails)) {
      const resolvedOwnerId = propertyOwnerId || existingProperty.propertyOwnerId;
      if (resolvedOwnerId) {
        try {
          const filteredEmails = ownerEmails.filter((e: string) => e?.trim());
          await prisma.propertyOwner.update({
            where: { id: resolvedOwnerId },
            data: {
              emails: filteredEmails,
              email: filteredEmails[0] || null,
            },
          });
        } catch (emailErr: any) {
          console.error("Erro ao atualizar emails do proprietário:", emailErr.message);
        }
      }
    }

    // Registrar alteração de preço no PriceHistory
    const priceFields = [
      { field: "price", type: "SALE" },
      { field: "rentPrice", type: "RENT" },
    ];
    for (const { field, type } of priceFields) {
      const oldVal = (existingProperty as any)[field];
      const newVal = (validatedData.data as any)[field];
      if (newVal !== undefined && oldVal !== null && oldVal !== undefined && Number(oldVal) !== Number(newVal) && Number(oldVal) > 0) {
        const diff = Number(newVal) - Number(oldVal);
        const pct = (diff / Number(oldVal)) * 100;
        try {
          await prisma.propertyPriceHistory.create({
            data: {
              propertyId: id,
              oldPrice: Number(oldVal),
              newPrice: Number(newVal),
              priceType: type,
              changeType: diff < 0 ? "REDUCTION" : "INCREASE",
              changeAmount: diff,
              changePercent: Math.round(pct * 100) / 100,
              changedById: session.id,
            },
          });
        } catch (phErr: any) {
          console.error("Erro ao salvar PriceHistory:", phErr.message);
        }
      }
    }

    // Registrar log de atividade
    const changedFields = changelogEntries.map((e: any) => e.field).join(", ");
    logPropertyActivity({
      action: "UPDATED",
      propertyId: id,
      propertyCode: existingProperty.code,
      propertyTitle: existingProperty.title,
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      description: changedFields ? `Campos alterados: ${changedFields}` : "Imóvel atualizado",
      metadata: changelogEntries.length > 0 ? {
        changes: changelogEntries.map((e: any) => {
          if (e.field === "images") {
            const oldArr = Array.isArray((existingProperty as any).images) ? (existingProperty as any).images : [];
            const newArr = Array.isArray((validatedData.data as any).images) ? (validatedData.data as any).images : [];
            return { field: e.field, oldCount: oldArr.length, newCount: newArr.length, added: newArr.filter((u: string) => !oldArr.includes(u)), removed: oldArr.filter((u: string) => !newArr.includes(u)) };
          }
          return { field: e.field, old: e.oldValue, new: e.newValue };
        })
      } : undefined,
    });

    return NextResponse.json({ property });
  } catch (error) {
    console.error("Error updating property:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar imóvel" },
      { status: 500 }
    );
  }
}

// PATCH - Atualização parcial do imóvel (ex: apenas status)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    
    if (!session || (session.role !== "ADMIN" && session.role !== "CORRETOR")) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Verificar se o imóvel existe
    const existingProperty = await prisma.property.findUnique({
      where: { id },
    });

    if (!existingProperty) {
      return NextResponse.json(
        { error: "Imóvel não encontrado" },
        { status: 404 }
      );
    }

    // Corretor pode atualizar status de qualquer imóvel da imobiliária
    // Admin pode atualizar qualquer imóvel
    // (Removida verificação de ownerId para PATCH - apenas campos específicos)

    // Campos permitidos para atualização parcial
    const allowedFields = [
      "status", "saleStatus", "rentalStatus", "isFeatured", "isExclusive", "isOffMarket", "price", "rentPrice",
      "websiteCategories", "activePortals", "showOnWebsite", "highlights",
      "amenities", "features", "extras", "brokerNotes",
      // Campos de venda
      "soldBy", "soldAt", "soldPrice", "soldNotes",
      // Campos de locação
      "rentedBy", "rentedAt", "rentedPrice", "rentedNotes", "followUpMonths", "followUpDate",
      // Campos de suspensão
      "suspensionDays", "suspensionStartDate", "suspensionEndDate", "suspensionReason",
      // Feedback do proprietário
      "ownerFeedbackStatus", "ownerLastFeedbackDate", "ownerFeedbackIntervalDays",
    ];
    const updateData: any = {};
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // ownerId: tratar como relação (connect)
    if (body.ownerId) {
      updateData.owner = { connect: { id: body.ownerId } };
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Nenhum campo válido para atualizar" },
        { status: 400 }
      );
    }

    // Mapear status principal para saleStatus/rentalStatus quando enviado diretamente
    const statusToFinalityMap: Record<string, string> = {
      "DISPONIVEL": "ATIVO",
      "VENDIDO": "VENDIDO",
      "ALUGADO": "ALUGADO",
      "SUSPENSO": "SUSPENSO",
      "INDISPONIVEL": "INATIVO",
      "INATIVO": "INATIVO",
    };

    if (updateData.status && !updateData.saleStatus && !updateData.rentalStatus) {
      const mapped = statusToFinalityMap[updateData.status] || "ATIVO";
      const category = existingProperty.category;

      if (category === "VENDA") {
        updateData.saleStatus = mapped;
      } else if (category === "LOCACAO") {
        updateData.rentalStatus = mapped;
      } else if (category === "VENDA_LOCACAO") {
        // Para VENDA_LOCACAO, mapear conforme o status
        if (updateData.status === "VENDIDO") {
          updateData.saleStatus = "VENDIDO";
        } else if (updateData.status === "ALUGADO") {
          updateData.rentalStatus = "ALUGADO";
        } else if (updateData.status === "SUSPENSO") {
          updateData.saleStatus = "SUSPENSO";
          updateData.rentalStatus = "SUSPENSO";
        } else if (updateData.status === "DISPONIVEL") {
          updateData.saleStatus = "ATIVO";
          updateData.rentalStatus = "ATIVO";
        } else {
          updateData.saleStatus = mapped;
          updateData.rentalStatus = mapped;
        }
      }
    }

    // Recalcular status principal quando saleStatus ou rentalStatus mudam
    if (updateData.saleStatus || updateData.rentalStatus) {
      const saleStatus = updateData.saleStatus || existingProperty.saleStatus || "ATIVO";
      const rentalStatus = updateData.rentalStatus || existingProperty.rentalStatus || "ATIVO";
      const category = existingProperty.category;

      let computedStatus = "DISPONIVEL";

      if (category === "VENDA") {
        if (saleStatus === "VENDIDO") computedStatus = "VENDIDO";
        else if (saleStatus === "SUSPENSO") computedStatus = "SUSPENSO";
        else if (saleStatus === "INATIVO") computedStatus = "INATIVO";
      } else if (category === "LOCACAO") {
        if (rentalStatus === "ALUGADO") computedStatus = "ALUGADO";
        else if (rentalStatus === "SUSPENSO") computedStatus = "SUSPENSO";
        else if (rentalStatus === "INATIVO") computedStatus = "INATIVO";
      } else if (category === "VENDA_LOCACAO") {
        if (saleStatus === "INATIVO" && rentalStatus === "INATIVO") computedStatus = "INATIVO";
        else if (saleStatus === "VENDIDO" && rentalStatus === "ALUGADO") computedStatus = "INDISPONIVEL";
        else if (saleStatus === "ATIVO" || rentalStatus === "ATIVO") computedStatus = "DISPONIVEL";
        else if (saleStatus === "VENDIDO") computedStatus = "VENDIDO";
        else if (rentalStatus === "ALUGADO") computedStatus = "ALUGADO";
        else if (saleStatus === "SUSPENSO" && rentalStatus === "SUSPENSO") computedStatus = "SUSPENSO";
        else if ((saleStatus === "SUSPENSO" && rentalStatus === "INATIVO") || (saleStatus === "INATIVO" && rentalStatus === "SUSPENSO")) computedStatus = "SUSPENSO";
        else computedStatus = "INDISPONIVEL";
      }

      updateData.status = computedStatus;
    }

    // Registrar quem atualizou
    updateData.updatedBy = { connect: { id: session.id } };

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: updateData,
    });

    // Registrar alteração de preço no PriceHistory (PATCH)
    const patchPriceFields = [
      { field: "price", type: "SALE" },
      { field: "rentPrice", type: "RENT" },
    ];
    for (const { field, type } of patchPriceFields) {
      const oldVal = (existingProperty as any)[field];
      const newVal = body[field];
      if (newVal !== undefined && oldVal !== null && oldVal !== undefined && Number(oldVal) !== Number(newVal) && Number(oldVal) > 0) {
        const diff = Number(newVal) - Number(oldVal);
        const pct = (diff / Number(oldVal)) * 100;
        try {
          await prisma.propertyPriceHistory.create({
            data: {
              propertyId: id,
              oldPrice: Number(oldVal),
              newPrice: Number(newVal),
              priceType: type,
              changeType: diff < 0 ? "REDUCTION" : "INCREASE",
              changeAmount: diff,
              changePercent: Math.round(pct * 100) / 100,
              changedById: session.id,
            },
          });
        } catch (phErr: any) {
          console.error("Erro ao salvar PriceHistory (PATCH):", phErr.message);
        }
      }
    }

    // Registrar mudanças de status no histórico
    const statusFields = ["status", "saleStatus", "rentalStatus"];
    for (const field of statusFields) {
      if (body[field] !== undefined && body[field] !== existingProperty[field as keyof typeof existingProperty]) {
        const oldValue = existingProperty[field as keyof typeof existingProperty] as string || "N/A";
        const newValue = body[field] as string;
        
        let description = "";
        if (field === "status") {
          description = `Status alterado de "${oldValue}" para "${newValue}"`;
        } else if (field === "saleStatus") {
          description = `Status de VENDA alterado de "${oldValue}" para "${newValue}"`;
        } else if (field === "rentalStatus") {
          description = `Status de LOCAÇÃO alterado de "${oldValue}" para "${newValue}"`;
        }

        await prisma.propertyChangelog.create({
          data: {
            propertyId: id,
            field: `${field}: ${description}`,
            oldValue: oldValue,
            newValue: newValue,
            userName: session.name || session.email || "Sistema",
            userId: session.id,
          },
        });
      }
    }

    // Se o imóvel foi SUSPENSO, criar tarefa para o captador com vencimento na data fim da suspensão
    const isSuspending = (
      (body.saleStatus === "SUSPENSO" && existingProperty.saleStatus !== "SUSPENSO") ||
      (body.rentalStatus === "SUSPENSO" && existingProperty.rentalStatus !== "SUSPENSO") ||
      (body.status === "SUSPENSO" && existingProperty.status !== "SUSPENSO")
    );

    if (isSuspending && updateData.suspensionEndDate) {
      try {
        // Buscar captador da exclusividade do imóvel
        const exclusivity = await prisma.propertyExclusivity.findFirst({
          where: { propertyId: id },
          select: { captadorId: true, captadorName: true },
        });

        const assignedToId = exclusivity?.captadorId || session.id;
        const suspensionEnd = new Date(updateData.suspensionEndDate);
        const days = updateData.suspensionDays || Math.ceil((suspensionEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

        // Verificar se já não existe tarefa de suspensão pendente para este imóvel
        const existingTask = await prisma.task.findFirst({
          where: {
            propertyId: id,
            title: { contains: "suspens", mode: "insensitive" },
            status: { in: ["PENDENTE", "EM_ANDAMENTO"] },
          },
        });

        if (!existingTask) {
          await prisma.task.create({
            data: {
              title: `Suspensão encerra em ${days} dias — Retomar captação`,
              description: `Imóvel #${existingProperty.code} foi suspenso por ${days} dias.\nMotivo: ${updateData.suspensionReason || "Não informado"}\nPrazo: ${suspensionEnd.toLocaleDateString("pt-BR")}\n\nAo vencer a suspensão, verificar com o proprietário se deseja reativar o imóvel.`,
              type: "FOLLOW_UP",
              priority: "ALTA",
              status: "PENDENTE",
              dueDate: suspensionEnd,
              propertyId: id,
              createdById: session.id,
              assignedToId,
            },
          });
        }
      } catch (taskError) {
        console.error("Erro ao criar tarefa de suspensão:", taskError);
        // Não falha o PATCH por causa disso
      }
    }

    return NextResponse.json({ property: updatedProperty });
  } catch (error) {
    console.error("Error patching property:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar imóvel" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir imóvel
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    
    if (!session || (session.role !== "ADMIN" && session.role !== "CORRETOR")) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verificar se o imóvel existe
    const existingProperty = await prisma.property.findUnique({
      where: { id },
    });

    if (!existingProperty) {
      return NextResponse.json(
        { error: "Imóvel não encontrado" },
        { status: 404 }
      );
    }

    // Proteção 24h: corretores só podem excluir nas primeiras 24h
    if (session.role !== "ADMIN") {
      const diffMs = Date.now() - new Date(existingProperty.createdAt).getTime();
      const hoursElapsed = diffMs / (1000 * 60 * 60);
      if (hoursElapsed > 24) {
        return NextResponse.json(
          { error: "Imóveis só podem ser excluídos nas primeiras 24 horas após criação" },
          { status: 403 }
        );
      }
    }

    // Deletar relações que não têm onDelete: Cascade
    await prisma.visit.deleteMany({ where: { propertyId: id } });
    
    // Desvincultar leads (SetNull)
    await prisma.lead.updateMany({ where: { propertyId: id }, data: { propertyId: null } });

    // Limpar variações (parentPropertyId)
    await prisma.property.updateMany({ where: { parentPropertyId: id }, data: { parentPropertyId: null } });
    
    // Registrar log ANTES de deletar (pois o propertyId ficará null)
    logPropertyActivity({
      action: "DELETED",
      propertyId: null,
      propertyCode: existingProperty.code,
      propertyTitle: existingProperty.title,
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      description: `Imóvel ${existingProperty.code} excluído: ${existingProperty.title}`,
    });

    // Deletar imóvel (relações com onDelete: Cascade serão removidas automaticamente)
    await prisma.property.delete({ where: { id } });

    return NextResponse.json({ message: "Imóvel excluído com sucesso" });
  } catch (error) {
    console.error("Error deleting property:", error);
    return NextResponse.json(
      { error: "Erro ao excluir imóvel" },
      { status: 500 }
    );
  }
}
