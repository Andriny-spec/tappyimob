import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar parceiros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");

    const partners = await prisma.partner.findMany({
      where: {
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { slug: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }),
        ...(status === "active" && { isActive: true }),
        ...(status === "inactive" && { isActive: false }),
      },
      include: {
        domains: {
          where: { isPrimary: true },
          take: 1,
        },
        permissions: true,
        _count: {
          select: {
            domains: true,
            apiKeys: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ partners });
  } catch (error) {
    console.error("Erro ao buscar parceiros:", error);
    return NextResponse.json({ error: "Erro ao buscar parceiros" }, { status: 500 });
  }
}

// POST - Criar parceiro
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      cnpj,
      address,
      city,
      state,
      zipCode,
      primaryColor,
      secondaryColor,
      maxProperties,
      maxLeads,
      maxUsers,
      subdomain,
      customDomain,
    } = body;

    if (!name) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    // Gerar slug
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Verificar se slug já existe
    const existing = await prisma.partner.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Já existe um parceiro com esse nome" }, { status: 400 });
    }

    // Criar parceiro com domínio e permissões padrão
    const partner = await prisma.partner.create({
      data: {
        name,
        slug,
        email,
        phone,
        cnpj,
        address,
        city,
        state,
        zipCode,
        primaryColor: primaryColor || "#25D366",
        secondaryColor: secondaryColor || "#1F2937",
        maxProperties: maxProperties || 100,
        maxLeads: maxLeads || 500,
        maxUsers: maxUsers || 5,
        domains: {
          create: [
            // Sempre criar subdomínio
            {
              domain: `${slug}.tappyimob.com.br`,
              isSubdomain: true,
              isPrimary: !customDomain,
              isActive: true,
            },
            // Se tiver domínio customizado
            ...(customDomain
              ? [
                  {
                    domain: customDomain,
                    isSubdomain: false,
                    isPrimary: true,
                    isActive: false, // Aguardando configuração DNS
                  },
                ]
              : []),
          ],
        },
        permissions: {
          create: {
            canAccessProperties: true,
            canAccessLeads: true,
            canAccessReports: true,
            hasCustomBranding: true,
            hasCustomDomain: !!customDomain,
          },
        },
      },
      include: {
        domains: true,
        permissions: true,
      },
    });

    return NextResponse.json({ partner });
  } catch (error) {
    console.error("Erro ao criar parceiro:", error);
    return NextResponse.json({ error: "Erro ao criar parceiro" }, { status: 500 });
  }
}

// PUT - Atualizar parceiro
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      email,
      phone,
      cnpj,
      address,
      city,
      state,
      zipCode,
      primaryColor,
      secondaryColor,
      maxProperties,
      maxLeads,
      maxUsers,
      isActive,
      expiresAt,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    const partner = await prisma.partner.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        cnpj,
        address,
        city,
        state,
        zipCode,
        primaryColor,
        secondaryColor,
        maxProperties,
        maxLeads,
        maxUsers,
        isActive,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      },
      include: {
        domains: true,
        permissions: true,
      },
    });

    return NextResponse.json({ partner });
  } catch (error) {
    console.error("Erro ao atualizar parceiro:", error);
    return NextResponse.json({ error: "Erro ao atualizar parceiro" }, { status: 500 });
  }
}

// DELETE - Deletar parceiro
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    await prisma.partner.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar parceiro:", error);
    return NextResponse.json({ error: "Erro ao deletar parceiro" }, { status: 500 });
  }
}
