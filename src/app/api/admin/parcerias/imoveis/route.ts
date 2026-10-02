import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — lista imóveis cadastrados por parceiros externos + contadores gerais
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "SDR")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status"); // PENDENTE | APROVADO | REJEITADO

  // Apenas imóveis submetidos por parceiros externos
  const baseWhere = { partnerSubmittedById: { not: null } };
  const where: Record<string, unknown> = { ...baseWhere };
  if (status) where.partnerApprovalStatus = status;

  const [properties, agg, counts] = await Promise.all([
    prisma.property.findMany({
      where,
      select: {
        id: true,
        code: true,
        title: true,
        type: true,
        address: true,
        number: true,
        neighborhood: true,
        city: true,
        price: true,
        rentPrice: true,
        area: true,
        bedrooms: true,
        thumbnail: true,
        towerName: true,
        views: true,
        inPersonVisits: true,
        proposalsCount: true,
        partnerApprovalStatus: true,
        partnerSubmittedById: true,
        partnerSubmittedAt: true,
        showOnWebsite: true,
        condominium: { select: { name: true } },
        propertyOwner: { select: { name: true, cpf: true, phones: true, emails: true } },
      },
      orderBy: { partnerSubmittedAt: "desc" },
    }),
    // Contadores gerais (somente imóveis de parceiros)
    prisma.property.aggregate({
      where: baseWhere,
      _sum: { views: true, inPersonVisits: true, proposalsCount: true },
    }),
    prisma.property.groupBy({
      by: ["partnerApprovalStatus"],
      where: baseWhere,
      _count: { _all: true },
    }),
  ]);

  // Resolve nomes dos parceiros submetentes
  const partnerIds = [...new Set(properties.map((p) => p.partnerSubmittedById).filter(Boolean))] as string[];
  const partners = partnerIds.length
    ? await prisma.user.findMany({
        where: { id: { in: partnerIds } },
        select: { id: true, name: true, email: true, phone: true },
      })
    : [];
  const partnerMap = new Map(partners.map((u) => [u.id, u]));

  const byStatus: Record<string, number> = { PENDENTE: 0, APROVADO: 0, REJEITADO: 0 };
  for (const c of counts) {
    if (c.partnerApprovalStatus) byStatus[c.partnerApprovalStatus] = c._count._all;
  }

  return NextResponse.json({
    properties: properties.map((p) => ({
      ...p,
      partner: p.partnerSubmittedById ? partnerMap.get(p.partnerSubmittedById) ?? null : null,
      condominiumName: p.condominium?.name || p.towerName || null,
    })),
    stats: {
      totalViews: agg._sum.views ?? 0,
      totalVisits: agg._sum.inPersonVisits ?? 0,
      totalProposals: agg._sum.proposalsCount ?? 0,
      pendentes: byStatus.PENDENTE,
      aprovados: byStatus.APROVADO,
      rejeitados: byStatus.REJEITADO,
    },
  });
}
