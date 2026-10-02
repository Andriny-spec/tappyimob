import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

function parseCurrency(val: unknown): number {
  if (typeof val === "number") return val;
  return parseFloat(String(val).replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
}

async function ensureAdmin() {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "SDR")) return null;
  return session;
}

async function ensurePartnerProperty(id: string) {
  const prop = await prisma.property.findUnique({
    where: { id },
    select: { id: true, partnerSubmittedById: true, propertyOwnerId: true },
  });
  if (!prop || !prop.partnerSubmittedById) return null;
  return prop;
}

// GET — detalhe completo do imóvel para revisão/edição pelo admin
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await ensureAdmin();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;
  const own = await ensurePartnerProperty(id);
  if (!own) return NextResponse.json({ error: "Imóvel não encontrado" }, { status: 404 });

  const property = await prisma.property.findUnique({
    where: { id },
    select: {
      id: true, code: true, title: true, description: true, type: true, subType: true,
      category: true, price: true, rentPrice: true, condoFee: true, iptu: true,
      area: true, totalArea: true, bedrooms: true, suites: true, bathrooms: true,
      parkingSpaces: true, floor: true, totalFloors: true, amenities: true, features: true,
      images: true, thumbnail: true, neighborhood: true, city: true, state: true,
      address: true, number: true, complement: true, zipCode: true, towerName: true, unitNumber: true,
      partnerApprovalStatus: true, partnerSubmittedAt: true, showOnWebsite: true,
      views: true, inPersonVisits: true, proposalsCount: true,
      condominium: { select: { id: true, name: true } },
      propertyOwner: {
        select: {
          id: true, name: true, cpf: true, rg: true, maritalStatus: true,
          phones: true, emails: true,
          residentialAddress: true, residentialNumber: true, residentialNeighborhood: true,
          residentialCity: true, residentialState: true, residentialZipCode: true,
        },
      },
    },
  });

  let partner = null;
  if (own.partnerSubmittedById) {
    partner = await prisma.user.findUnique({
      where: { id: own.partnerSubmittedById },
      select: { id: true, name: true, email: true, phone: true },
    });
  }

  return NextResponse.json({ property, partner });
}

// PATCH — aprovar / recusar / editar dados (admin)
export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await ensureAdmin();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;
  const own = await ensurePartnerProperty(id);
  if (!own) return NextResponse.json({ error: "Imóvel não encontrado" }, { status: 404 });

  const body = await request.json();
  const action = body.action as "approve" | "reject" | "edit" | undefined;

  // --- Aprovar ---
  if (action === "approve") {
    await prisma.property.update({
      where: { id },
      data: {
        partnerApprovalStatus: "APROVADO",
        showOnWebsite: true,
        status: "DISPONIVEL",
        // a partir da aprovação, o parceiro não edita mais os dados do proprietário
        partnerEditableUntil: new Date(),
      },
    });
    return NextResponse.json({ ok: true, status: "APROVADO" });
  }

  // --- Recusar (fica oculto, com tarja reprovado, fora da lista do painel) ---
  if (action === "reject") {
    await prisma.property.update({
      where: { id },
      data: {
        partnerApprovalStatus: "REJEITADO",
        showOnWebsite: false,
      },
    });
    return NextResponse.json({ ok: true, status: "REJEITADO" });
  }

  // --- Editar (admin pode revisar/editar TODOS os dados, inclusive proprietário) ---
  if (action === "edit") {
    const d = body.data || {};
    const data: any = {};
    if (d.title !== undefined) data.title = String(d.title).trim();
    if (d.description !== undefined) data.description = d.description;
    if (d.price !== undefined) data.price = parseCurrency(d.price);
    if (d.rentPrice !== undefined) data.rentPrice = d.rentPrice ? parseCurrency(d.rentPrice) : null;
    if (d.condoFee !== undefined) data.condoFee = d.condoFee ? parseCurrency(d.condoFee) : null;
    if (d.iptu !== undefined) data.iptu = d.iptu ? parseCurrency(d.iptu) : null;
    if (d.area !== undefined) data.area = parseFloat(String(d.area)) || undefined;
    if (d.totalArea !== undefined) data.totalArea = d.totalArea ? parseFloat(String(d.totalArea)) : null;
    if (d.bedrooms !== undefined) data.bedrooms = parseInt(String(d.bedrooms)) || 0;
    if (d.suites !== undefined) data.suites = parseInt(String(d.suites)) || 0;
    if (d.bathrooms !== undefined) data.bathrooms = parseInt(String(d.bathrooms)) || 0;
    if (d.parkingSpaces !== undefined) data.parkingSpaces = parseInt(String(d.parkingSpaces)) || 0;
    // Endereço
    if (d.address !== undefined) data.address = d.address;
    if (d.number !== undefined) data.number = d.number || null;
    if (d.complement !== undefined) data.complement = d.complement || null;
    if (d.neighborhood !== undefined) data.neighborhood = d.neighborhood;
    if (d.city !== undefined) data.city = d.city;
    if (d.state !== undefined) data.state = d.state;
    if (d.zipCode !== undefined) data.zipCode = d.zipCode || null;
    if (Array.isArray(d.amenities)) data.amenities = d.amenities;
    if (Array.isArray(d.features)) data.features = d.features;
    if (Array.isArray(d.images)) {
      data.images = d.images;
      data.thumbnail = d.thumbnail || d.images[0] || undefined;
    }

    await prisma.property.update({ where: { id }, data });

    // Dados do proprietário (admin sempre pode editar)
    const o = d.owner;
    if (o && typeof o === "object") {
      const ownerData: any = {
        name: o.name?.trim() || "Proprietário",
        cpf: o.cpf?.trim() || null,
        rg: o.rg?.trim() || null,
        maritalStatus: o.maritalStatus || null,
        phones: Array.isArray(o.phones) ? o.phones : o.phone ? [o.phone] : [],
        emails: Array.isArray(o.emails) ? o.emails : o.email ? [o.email] : [],
        residentialAddress: o.residentialAddress || null,
        residentialNumber: o.residentialNumber || null,
        residentialNeighborhood: o.residentialNeighborhood || null,
        residentialCity: o.residentialCity || null,
        residentialState: o.residentialState || null,
        residentialZipCode: o.residentialZipCode || null,
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

  return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
}
