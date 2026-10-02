import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyPartnerPropertySubmission } from "@/lib/notify-partner-property";

// CNCP + 4 dígitos (1000–9999), garantindo que não exista repetição no banco.
function generateCNCPCode(): string {
  const num = Math.floor(1000 + Math.random() * 9000); // 4 dígitos
  return `CNCP${num}`;
}

async function uniqueCNCPCode(): Promise<string> {
  // Até 9000 códigos possíveis — tenta gerar um aleatório inédito.
  for (let tries = 0; tries < 40; tries++) {
    const code = generateCNCPCode();
    const existing = await prisma.property.findUnique({ where: { code }, select: { id: true } });
    if (!existing) return code;
  }
  // Fallback: varre sequencialmente para achar o primeiro livre (esgotamento improvável)
  const usados = await prisma.property.findMany({
    where: { code: { startsWith: "CNCP" } },
    select: { code: true },
  });
  const set = new Set(usados.map((u) => u.code));
  for (let n = 1000; n <= 9999; n++) {
    const code = `CNCP${n}`;
    if (!set.has(code)) return code;
  }
  throw new Error("Esgotaram-se os códigos CNCP disponíveis");
}

function parseCurrency(val: unknown): number {
  if (typeof val === "number") return val;
  return parseFloat(String(val).replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "PARCEIRO_EXTERNO") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  // Não lista imóveis removidos (soft-delete = status INATIVO).
  const where: Record<string, unknown> = {
    partnerSubmittedById: session.id,
    status: { not: "INATIVO" },
  };
  if (status) where.partnerApprovalStatus = status;

  const properties = await prisma.property.findMany({
    where,
    select: {
      id: true, code: true, title: true, type: true,
      address: true, neighborhood: true, city: true,
      price: true, area: true, bedrooms: true,
      thumbnail: true, partnerApprovalStatus: true,
      partnerSubmittedAt: true, partnerEditableUntil: true, createdAt: true,
      views: true, inPersonVisits: true, proposalsCount: true, showOnWebsite: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ properties });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "PARCEIRO_EXTERNO") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      // Localização
      type, subType, category,
      condominiumId, towerName, unitNumber,
      zipCode, address, number, complement, neighborhood, city, state,
      // Características
      bedrooms, suites, bathrooms, parkingSpaces, floor, totalFloors,
      area, totalArea, features, amenities,
      // Valores
      price, rentPrice, condoFee, condoFeeExempt, iptu, iptuPeriod,
      foro, foroExempt,
      acceptsExchange, acceptsFinancing, acceptsDirectPayment, directPaymentMonths,
      // Mídia
      images, thumbnail,
      // Título e descrição
      title, description,
      // Proprietário
      ownerName, ownerPhone, ownerPhones, ownerEmail, ownerCPF, ownerMaritalStatus,
    } = body;

    if (!type || !city || !area) {
      return NextResponse.json({ error: "Dados obrigatórios faltando (type, city, area)" }, { status: 400 });
    }
    if (!price && !rentPrice) {
      return NextResponse.json({ error: "Informe pelo menos um valor (venda ou locação)" }, { status: 400 });
    }

    const code = await uniqueCNCPCode();
    const now = new Date();
    const editableUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const typeLabel: Record<string, string> = {
      CASA: "Casa", APARTAMENTO: "Apartamento", TERRENO: "Terreno", COMERCIAL: "Comercial",
    };
    const autoTitle = title?.trim() || `${typeLabel[type] || type} em ${neighborhood || city}`;
    const thumbUrl = thumbnail || (Array.isArray(images) && images[0]) || undefined;

    // Cria PropertyOwner se nome foi informado
    let propertyOwnerId: string | undefined;
    if (ownerName?.trim()) {
      const owner = await prisma.propertyOwner.create({
        data: {
          name: ownerName.trim(),
          cpf: ownerCPF?.trim() || undefined,
          phones: Array.isArray(ownerPhones) && ownerPhones.length
            ? ownerPhones.map((p: string) => String(p).trim()).filter(Boolean)
            : ownerPhone ? [ownerPhone.trim()] : [],
          emails: ownerEmail ? [ownerEmail.trim()] : [],
          maritalStatus: ownerMaritalStatus || undefined,
        },
        select: { id: true },
      });
      propertyOwnerId = owner.id;
    }

    const property = await prisma.property.create({
      data: {
        code,
        title: autoTitle,
        description: description || "",
        type: type as any,
        subType: subType as any || undefined,
        category: (category as any) || "VENDA",
        address: address || "",
        number: number || undefined,
        complement: complement || undefined,
        neighborhood: neighborhood || "",
        city,
        state: state || "SP",
        zipCode: zipCode || undefined,
        condominiumId: condominiumId || undefined,
        towerName: towerName || undefined,
        unitNumber: unitNumber || undefined,
        area: parseFloat(String(area)),
        totalArea: totalArea ? parseFloat(String(totalArea)) : undefined,
        bedrooms: parseInt(String(bedrooms || 0)) || 0,
        suites: parseInt(String(suites || 0)) || 0,
        bathrooms: parseInt(String(bathrooms || 0)) || 0,
        parkingSpaces: parseInt(String(parkingSpaces || 0)) || 0,
        floor: floor ? parseInt(String(floor)) : undefined,
        totalFloors: totalFloors ? parseInt(String(totalFloors)) : undefined,
        price: price ? parseCurrency(price) : 0,
        rentPrice: rentPrice ? parseCurrency(rentPrice) : undefined,
        condoFee: condoFee ? parseCurrency(condoFee) : undefined,
        condoFeeExempt: condoFeeExempt === true,
        iptu: iptu ? parseCurrency(iptu) : undefined,
        iptuPeriod: iptuPeriod || "ANUAL",
        foro: foroExempt === true ? 0 : foro ? parseCurrency(foro) : undefined,
        foroExempt: foroExempt === true,
        acceptsExchange: acceptsExchange === true,
        acceptsFinancing: acceptsFinancing !== false,
        acceptsDirectPayment: acceptsDirectPayment === true,
        directPaymentMonths: directPaymentMonths ? parseInt(String(directPaymentMonths)) : undefined,
        amenities: Array.isArray(amenities) ? amenities : [],
        features: Array.isArray(features) ? features : [],
        images: Array.isArray(images) ? images : [],
        thumbnail: thumbUrl || undefined,
        ownerId: session.id,
        propertyOwnerId: propertyOwnerId || undefined,
        showOnWebsite: false,
        partnerApprovalStatus: "PENDENTE",
        partnerSubmittedById: session.id,
        partnerSubmittedAt: now,
        partnerEditableUntil: editableUntil,
      },
      select: { id: true, code: true },
    });

    // Notifica admins (painel / e-mail / WhatsApp) — não bloqueia a resposta
    notifyPartnerPropertySubmission(property.id).catch((e) =>
      console.error("[parceiro/imoveis] notify falhou:", e)
    );

    return NextResponse.json({ property }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar imóvel parceiro:", error);
    return NextResponse.json({ error: "Erro ao cadastrar imóvel" }, { status: 500 });
  }
}
