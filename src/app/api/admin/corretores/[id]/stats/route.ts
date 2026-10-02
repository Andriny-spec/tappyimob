import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { id } = await params;
    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const createdAtFilter =
      startDate || endDate
        ? {
            createdAt: {
              ...(startDate ? { gte: new Date(startDate) } : {}),
              ...(endDate ? { lte: new Date(`${endDate}T23:59:59`) } : {}),
            },
          }
        : {};

    const dateAtFilter =
      startDate || endDate
        ? {
            date: {
              ...(startDate ? { gte: new Date(startDate) } : {}),
              ...(endDate ? { lte: new Date(`${endDate}T23:59:59`) } : {}),
            },
          }
        : {};

    // Filtros para mês e ano vigentes (sempre fixos, independente do filtro do usuário)
    const now = new Date();
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
    const inicioAno = new Date(now.getFullYear(), 0, 1);

    const [
      leadsByStatus,
      propertiesCount,
      propertiesCountMes,
      propertiesCountAnual,
      visitsCompleted,
      comissoesCount,
      negociosAndamento,
      propertyLogs,
      leadLogs,
      meta,
    ] = await Promise.all([
      prisma.lead.groupBy({
        by: ["status"],
        where: { corretorId: id, ...createdAtFilter },
        _count: { _all: true },
      }),
      prisma.property.count({
        where: { ownerId: id, ...createdAtFilter },
      }),
      // Captações mês vigente (período fixo)
      prisma.property.count({
        where: { ownerId: id, createdAt: { gte: inicioMes } },
      }),
      // Captações ano vigente (período fixo)
      prisma.property.count({
        where: { ownerId: id, createdAt: { gte: inicioAno } },
      }),
      prisma.scheduledVisit.count({
        where: { corretorId: id, status: "REALIZADA", ...dateAtFilter },
      }),
      prisma.comissao.count({
        where: { corretorId: id, ...createdAtFilter },
      }),
      // Negócios em andamento (não finalizados)
      prisma.negocio.count({
        where: {
          corretorId: id,
          fase: { notIn: ["PRONTO_ASSINATURA"] as any },
        },
      }),
      prisma.propertyActivityLog.count({
        where: { userId: id, ...createdAtFilter },
      }),
      prisma.leadActivity.count({
        where: { userId: id, ...createdAtFilter },
      }),
      prisma.meta.findFirst({
        where: { corretorId: id, periodo: { startsWith: new Date().getFullYear().toString() } },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const statusCounts: Record<string, number> = Object.fromEntries(
      leadsByStatus.map((l) => [l.status, l._count._all])
    );

    const LIMBO_STATUSES = ["SEM_INTERACAO", "EM_ESPERA", "RETORNO"];
    const ACERVO_STATUSES = ["ARQUIVADO", "PERDIDO"];

    const leadsTotal = leadsByStatus.reduce((sum, l) => sum + l._count._all, 0);
    const leadsLimbo = LIMBO_STATUSES.reduce((sum, s) => sum + (statusCounts[s] || 0), 0);
    const leadsAcervo = ACERVO_STATUSES.reduce((sum, s) => sum + (statusCounts[s] || 0), 0);

    return NextResponse.json({
      leadsTotal,
      leadsLimbo,
      leadsAcervo,
      leadsByStatus: statusCounts,
      propertiesCount,
      propertiesCountMes,
      propertiesCountAnual,
      visitsCompleted,
      comissoesCount,
      negociosAndamento,
      activityLogsCount: propertyLogs + leadLogs,
      meta,
    });
  } catch (error) {
    console.error("Error fetching corretor stats:", error);
    return NextResponse.json({ error: "Erro ao buscar estatísticas" }, { status: 500 });
  }
}
