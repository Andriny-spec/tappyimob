import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar domínios do parceiro
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const domains = await prisma.partnerDomain.findMany({
      where: { partnerId: id },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ domains });
  } catch (error) {
    console.error("Erro ao buscar domínios:", error);
    return NextResponse.json({ error: "Erro ao buscar domínios" }, { status: 500 });
  }
}

// POST - Adicionar domínio
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { domain, isSubdomain, isPrimary } = body;

    if (!domain) {
      return NextResponse.json({ error: "Domínio é obrigatório" }, { status: 400 });
    }

    // Verificar se domínio já existe
    const existing = await prisma.partnerDomain.findUnique({ where: { domain } });
    if (existing) {
      return NextResponse.json({ error: "Domínio já está em uso" }, { status: 400 });
    }

    // Se for definido como primário, remover flag dos outros
    if (isPrimary) {
      await prisma.partnerDomain.updateMany({
        where: { partnerId: id },
        data: { isPrimary: false },
      });
    }

    const newDomain = await prisma.partnerDomain.create({
      data: {
        domain,
        isSubdomain: isSubdomain ?? false,
        isPrimary: isPrimary ?? false,
        partnerId: id,
      },
    });

    return NextResponse.json({ domain: newDomain });
  } catch (error) {
    console.error("Erro ao adicionar domínio:", error);
    return NextResponse.json({ error: "Erro ao adicionar domínio" }, { status: 500 });
  }
}

// PUT - Atualizar domínio
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: partnerId } = await params;
    const body = await request.json();
    const { id, isPrimary, isActive, dnsConfigured, sslStatus } = body;

    if (!id) {
      return NextResponse.json({ error: "ID do domínio é obrigatório" }, { status: 400 });
    }

    // Se for definido como primário, remover flag dos outros
    if (isPrimary) {
      await prisma.partnerDomain.updateMany({
        where: { partnerId, id: { not: id } },
        data: { isPrimary: false },
      });
    }

    const domain = await prisma.partnerDomain.update({
      where: { id },
      data: {
        isPrimary,
        isActive,
        dnsConfigured,
        dnsVerifiedAt: dnsConfigured ? new Date() : undefined,
        sslStatus,
      },
    });

    return NextResponse.json({ domain });
  } catch (error) {
    console.error("Erro ao atualizar domínio:", error);
    return NextResponse.json({ error: "Erro ao atualizar domínio" }, { status: 500 });
  }
}

// DELETE - Remover domínio
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const domainId = searchParams.get("domainId");

    if (!domainId) {
      return NextResponse.json({ error: "ID do domínio é obrigatório" }, { status: 400 });
    }

    await prisma.partnerDomain.delete({ where: { id: domainId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao remover domínio:", error);
    return NextResponse.json({ error: "Erro ao remover domínio" }, { status: 500 });
  }
}
