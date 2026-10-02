import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET - Buscar proprietário por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    const owner = await prisma.propertyOwner.findUnique({
      where: { id },
      include: {
        properties: {
          select: {
            id: true,
            code: true,
            title: true,
            price: true,
            status: true,
            category: true,
            thumbnail: true,
          },
        },
        attachments: true,
      },
    });

    if (!owner) {
      return NextResponse.json({ error: "Proprietário não encontrado" }, { status: 404 });
    }

    return NextResponse.json(owner);
  } catch (error) {
    console.error("Erro ao buscar proprietário:", error);
    return NextResponse.json({ error: "Erro ao buscar proprietário" }, { status: 500 });
  }
}

// PUT - Atualizar proprietário
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Verificar se proprietário existe
    const existing = await prisma.propertyOwner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Proprietário não encontrado" }, { status: 404 });
    }

    // Extrair phones flat (para backward compat) e phoneContacts (com nomes)
    const phoneContacts = body.phoneContacts || undefined;
    const phones = phoneContacts
      ? (phoneContacts as Array<{ name?: string; phone: string }>)
          .map((p: any) => p.phone?.trim())
          .filter(Boolean)
      : body.phones || undefined;

    const owner = await prisma.propertyOwner.update({
      where: { id },
      data: {
        name: body.name ?? undefined,
        email: body.email ?? undefined,
        emails: body.emails ? (body.emails as string[]).filter((e: string) => e?.trim()) : undefined,
        phones: phones ?? undefined,
        phoneContacts: phoneContacts ?? undefined,
        cpf: body.cpf ?? undefined,
        rg: body.rg ?? undefined,
        birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
        profile: body.profile ?? undefined,
        maritalStatus: body.maritalStatus ?? undefined,
        residentialAddress: body.residentialAddress ?? undefined,
        residentialNumber: body.residentialNumber ?? undefined,
        residentialComplement: body.residentialComplement ?? undefined,
        residentialNeighborhood: body.residentialNeighborhood ?? undefined,
        residentialCity: body.residentialCity ?? undefined,
        residentialState: body.residentialState ?? undefined,
        residentialZipCode: body.residentialZipCode ?? undefined,
        notes: body.notes ?? undefined,
      },
    });

    return NextResponse.json(owner);
  } catch (error) {
    console.error("Erro ao atualizar proprietário:", error);
    return NextResponse.json({ error: "Erro ao atualizar proprietário" }, { status: 500 });
  }
}
