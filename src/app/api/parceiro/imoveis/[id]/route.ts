import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// Garante que o imóvel pertence ao parceiro logado
async function getOwnProperty(id: string, partnerId: string) {
  const prop = await prisma.property.findUnique({
    where: { id },
    select: { id: true, partnerSubmittedById: true, partnerApprovalStatus: true, propertyOwnerId: true },
  });
  if (!prop || prop.partnerSubmittedById !== partnerId) return null;
  return prop;
}

function parseCurrency(val: unknown): number {
  if (typeof val === "number") return val;
  return parseFloat(String(val).replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
}

// GET — dados do imóvel para edição
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "PARCEIRO_EXTERNO") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const own = await getOwnProperty(id, session.id);
  if (!own) return NextResponse.json({ error: "Imóvel não encontrado" }, { status: 404 });

  const property = await prisma.property.findUnique({
    where: { id },
    select: {
      id: true, code: true, title: true, description: true, type: true, subType: true,
      category: true, price: true, rentPrice: true, condoFee: true, iptu: true,
      area: true, totalArea: true, bedrooms: true, suites: true, bathrooms: true,
      parkingSpaces: true, floor: true, totalFloors: true, amenities: true, features: true,
      images: true, thumbnail: true, neighborhood: true, city: true, state: true,
      address: true, number: true, complement: true, zipCode: true,
      partnerApprovalStatus: true, views: true, inPersonVisits: true, proposalsCount: true,
      propertyOwner: {
        select: { id: true, name: true, cpf: true, maritalStatus: true, phones: true, emails: true },
      },
    },
  });
  return NextResponse.json({ property });
}

// PATCH — parceiro edita o próprio imóvel (enquanto PENDENTE ou APROVADO)
export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "PARCEIRO_EXTERNO") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const own = await getOwnProperty(id, session.id);
  if (!own) return NextResponse.json({ error: "Imóvel não encontrado" }, { status: 404 });
  // Imóvel reprovado PODE ser editado e reenviado — o PATCH volta o status
  // para PENDENTE no fim, submetendo a uma nova aprovação da Tappy.

  const body = await request.json();
  const data: any = {};
  if (body.title !== undefined) data.title = String(body.title).trim();
  if (body.description !== undefined) data.description = body.description;
  if (body.price !== undefined) data.price = parseCurrency(body.price);
  if (body.rentPrice !== undefined) data.rentPrice = body.rentPrice ? parseCurrency(body.rentPrice) : null;
  if (body.condoFee !== undefined) data.condoFee = body.condoFee ? parseCurrency(body.condoFee) : null;
  if (body.iptu !== undefined) data.iptu = body.iptu ? parseCurrency(body.iptu) : null;
  if (body.foroExempt !== undefined) data.foroExempt = body.foroExempt === true;
  if (body.foro !== undefined) data.foro = body.foroExempt === true ? 0 : body.foro ? parseCurrency(body.foro) : null;
  if (body.area !== undefined) data.area = parseFloat(String(body.area)) || undefined;
  if (body.totalArea !== undefined) data.totalArea = body.totalArea ? parseFloat(String(body.totalArea)) : null;
  if (body.bedrooms !== undefined) data.bedrooms = parseInt(String(body.bedrooms)) || 0;
  if (body.suites !== undefined) data.suites = parseInt(String(body.suites)) || 0;
  if (body.bathrooms !== undefined) data.bathrooms = parseInt(String(body.bathrooms)) || 0;
  if (body.parkingSpaces !== undefined) data.parkingSpaces = parseInt(String(body.parkingSpaces)) || 0;
  if (Array.isArray(body.amenities)) data.amenities = body.amenities;
  if (Array.isArray(body.features)) data.features = body.features;
  if (Array.isArray(body.images)) {
    data.images = body.images;
    data.thumbnail = body.thumbnail || body.images[0] || undefined;
  }
  // Endereço — editável pelo parceiro enquanto pendente/aprovado
  if (body.address !== undefined) data.address = body.address;
  if (body.number !== undefined) data.number = body.number || null;
  if (body.complement !== undefined) data.complement = body.complement || null;
  if (body.neighborhood !== undefined) data.neighborhood = body.neighborhood;
  if (body.city !== undefined) data.city = body.city;
  if (body.state !== undefined) data.state = body.state;
  if (body.zipCode !== undefined) data.zipCode = body.zipCode || null;

  // Após editar, volta para PENDENTE (precisa nova aprovação da Tappy)
  data.partnerApprovalStatus = "PENDENTE";
  data.showOnWebsite = false;

  await prisma.property.update({ where: { id }, data });

  // Dados do proprietário — só editáveis ENQUANTO NÃO aprovado.
  // Após aprovado, o parceiro não pode mais alterar os dados do proprietário.
  const o = body.owner;
  if (o && typeof o === "object") {
    if (own.partnerApprovalStatus === "APROVADO") {
      return NextResponse.json(
        { error: "Imóvel já aprovado: os dados do proprietário não podem mais ser editados." },
        { status: 422 }
      );
    }
    const ownerData: any = {
      name: o.name?.trim() || "Proprietário",
      cpf: o.cpf?.trim() || null,
      maritalStatus: o.maritalStatus || null,
      phones: Array.isArray(o.phones) ? o.phones : o.phone ? [o.phone] : [],
      emails: Array.isArray(o.emails) ? o.emails : o.email ? [o.email] : [],
    };
    if (own.propertyOwnerId) {
      await prisma.propertyOwner.update({ where: { id: own.propertyOwnerId }, data: ownerData });
    } else if (o.name?.trim()) {
      const newOwner = await prisma.propertyOwner.create({ data: ownerData, select: { id: true } });
      await prisma.property.update({ where: { id }, data: { propertyOwnerId: newOwner.id } });
    }
  }

  return NextResponse.json({ ok: true });
}

// DELETE — parceiro remove o próprio imóvel
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "PARCEIRO_EXTERNO") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const own = await getOwnProperty(id, session.id);
  if (!own) return NextResponse.json({ error: "Imóvel não encontrado" }, { status: 404 });

  // Soft delete: marca como inativo (preserva histórico/relacionamentos)
  try {
    await prisma.property.update({
      where: { id },
      data: { status: "INATIVO", showOnWebsite: false },
    });
  } catch (error) {
    console.error("[parceiro/imoveis] erro ao remover:", error);
    return NextResponse.json({ error: "Erro ao remover o imóvel" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
