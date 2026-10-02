import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Buscar parceiro por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const partner = await prisma.partner.findUnique({
      where: { id },
      include: {
        domains: {
          orderBy: { isPrimary: "desc" },
        },
        permissions: true,
        apiKeys: {
          select: {
            id: true,
            name: true,
            keyPrefix: true,
            scopes: true,
            isActive: true,
            lastUsedAt: true,
            usageCount: true,
            expiresAt: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            analytics: true,
          },
        },
      },
    });

    if (!partner) {
      return NextResponse.json({ error: "Parceiro não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ partner });
  } catch (error) {
    console.error("Erro ao buscar parceiro:", error);
    return NextResponse.json({ error: "Erro ao buscar parceiro" }, { status: 500 });
  }
}
