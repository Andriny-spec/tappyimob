import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    // Queries simples e seguras
    const [
      totalImoveis,
      imoveisAtivos,
      imoveisVendidos,
      imoveisAlugados,
      imoveisNovos,
      imoveisLastMonth,
      imoveisSemFoto,
      imoveisExclusivos,
      valorTotalCarteira,
      totalLeads,
      leadsDoMes,
      leadsLastMonth,
      leadsFechados,
      leadsRecentes,
      visitasHoje,
      visitasPendentes,
      visitasDoMes,
      contratosAssinados,
      contratosDoMes,
      valorContratos,
      totalCorretores,
      corretoresAtivos,
      totalClientes,
      clientesNovos,
      totalCondominios,
      imoveisComPlaca,
      // Parcerias
      totalParceiros,
      parceirosAtivos,
      parceirosNovos,
      parceirosLastMonth,
    ] = await Promise.all([
      prisma.property.count(),
      prisma.property.count({ where: { status: "DISPONIVEL" } }),
      prisma.property.count({ where: { status: "VENDIDO" } }),
      prisma.property.count({ where: { status: "ALUGADO" } }),
      prisma.property.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.property.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
      prisma.property.count({ where: { OR: [{ thumbnail: null }, { thumbnail: "" }] } }),
      prisma.property.count({ where: { isExclusive: true } }),
      prisma.property.aggregate({ 
        where: { status: "DISPONIVEL", category: "VENDA" }, 
        _sum: { price: true } 
      }),
      prisma.lead.count(),
      prisma.lead.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.lead.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
      prisma.lead.count({ where: { status: "FECHADO" } }),
      prisma.lead.findMany({ 
        take: 5, 
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          temperature: true,
          source: true,
          status: true,
          message: true,
          createdAt: true,
        }
      }),
      prisma.scheduledVisit.count({ where: { date: { gte: startOfDay, lt: endOfDay } } }),
      prisma.scheduledVisit.count({ where: { status: "AGENDADA" } }),
      prisma.scheduledVisit.count({ where: { date: { gte: startOfMonth } } }),
      prisma.contract.count({ where: { status: "ASSINADO" } }),
      prisma.contract.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.contract.aggregate({ where: { status: "ASSINADO" }, _sum: { valor: true } }),
      prisma.user.count({ where: { role: "CORRETOR" } }),
      prisma.user.count({ where: { role: "CORRETOR", isActive: true } }),
      prisma.user.count({ where: { role: "CLIENTE" } }),
      prisma.user.count({ where: { role: "CLIENTE", createdAt: { gte: startOfMonth } } }),
      prisma.condominium.count(),
      prisma.property.count({ where: { hasPlate: true, status: "DISPONIVEL" } }),
      // Parcerias
      prisma.businessPartner.count(),
      prisma.businessPartner.count({ where: { isActive: true } }),
      prisma.businessPartner.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.businessPartner.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
    ]);

    // Queries de agrupamento separadas (mais seguras)
    const [imoveisPorStatus, leadsPorTemperatura, proximasVisitas, corretores, parceirosPorTipo, topParceiros] = await Promise.all([
      prisma.property.groupBy({ by: ["status"], _count: true }),
      prisma.lead.groupBy({ by: ["temperature"], _count: true }),
      prisma.scheduledVisit.findMany({
        where: { date: { gte: now } },
        take: 5,
        orderBy: { date: "asc" },
        select: {
          id: true,
          date: true,
          time: true,
          status: true,
          notes: true,
          visitorName: true,
          visitorPhone: true,
          lead: { select: { name: true, phone: true } },
          corretor: { select: { name: true } },
          properties: {
            select: { property: { select: { code: true, title: true, address: true } } },
            take: 1
          },
        }
      }),
      prisma.user.findMany({
        where: { role: "CORRETOR", isActive: true },
        take: 5,
        orderBy: { totalSales: "desc" },
        select: {
          id: true,
          name: true,
          avatar: true,
          totalSales: true,
          _count: { select: { leads: true } }
        }
      }),
      prisma.businessPartner.groupBy({
        by: ["type"],
        _count: { id: true },
        where: { isActive: true },
      }),
      prisma.businessPartner.findMany({
        where: { isActive: true },
        take: 5,
        orderBy: { totalVGV: "desc" },
        select: {
          id: true,
          name: true,
          type: true,
          avatar: true,
          totalVGV: true,
          totalVisits: true,
          totalProposals: true,
          totalContracts: true,
          creci: true,
          agency: { select: { tradeName: true, companyName: true } },
        },
      }),
    ]);

    // Calcular variações
    const calcChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    // Formatar ranking
    const formattedRanking = corretores.map((c, idx) => ({
      id: c.id,
      name: c.name,
      avatar: c.avatar,
      position: idx + 1,
      points: c.totalSales || 0,
      vendas: c.totalSales || 0,
      leads: c._count.leads,
    }));

    // Formatar visitas
    const formattedVisitas = proximasVisitas.map(v => ({
      id: v.id,
      title: v.notes || v.visitorName || "Visita agendada",
      date: v.date,
      time: v.time,
      status: v.status,
      leadName: v.lead?.name || v.visitorName,
      leadPhone: v.lead?.phone || v.visitorPhone,
      corretorName: v.corretor?.name || null,
      property: v.properties[0]?.property,
    }));

    const dashboard = {
      kpis: {
        imoveis: {
          total: totalImoveis,
          ativos: imoveisAtivos,
          vendidos: imoveisVendidos,
          alugados: imoveisAlugados,
          novosNoMes: imoveisNovos,
          change: calcChange(imoveisNovos, imoveisLastMonth),
          semFoto: imoveisSemFoto,
          exclusivos: imoveisExclusivos,
          comPlaca: imoveisComPlaca,
          valorCarteira: valorTotalCarteira._sum.price || 0,
        },
        leads: {
          total: totalLeads,
          doMes: leadsDoMes,
          change: calcChange(leadsDoMes, leadsLastMonth),
          convertidos: leadsFechados,
          taxaConversao: totalLeads > 0 ? Math.round((leadsFechados / totalLeads) * 100) : 0,
        },
        visitas: {
          hoje: visitasHoje,
          pendentes: visitasPendentes,
          doMes: visitasDoMes,
        },
        contratos: {
          ativos: contratosAssinados,
          doMes: contratosDoMes,
          valorTotal: valorContratos._sum.valor || 0,
        },
        corretores: {
          total: totalCorretores,
          ativos: corretoresAtivos,
        },
        clientes: {
          total: totalClientes,
          novosNoMes: clientesNovos,
        },
        condominios: totalCondominios,
        parcerias: {
          total: totalParceiros,
          ativos: parceirosAtivos,
          novosNoMes: parceirosNovos,
          change: calcChange(parceirosNovos, parceirosLastMonth),
          porTipo: parceirosPorTipo.map(p => ({ tipo: p.type, quantidade: p._count.id })),
        },
      },
      charts: {
        imoveisPorTipo: [],
        imoveisPorStatus: imoveisPorStatus.map(i => ({ status: i.status, quantidade: i._count })),
        imoveisPorCategoria: [],
        leadsPorTemperatura: leadsPorTemperatura.map(l => ({ temperatura: l.temperature, quantidade: l._count })),
        leadsPorOrigem: [],
        topBairros: [],
        topCidades: [],
        faixaPrecos: [],
      },
      lists: {
        leadsRecentes,
        proximasVisitas: formattedVisitas,
        rankingCorretores: formattedRanking,
        topParceiros: topParceiros.map((p, idx) => ({
          id: p.id,
          name: p.name,
          type: p.type,
          avatar: p.avatar,
          totalVGV: p.totalVGV,
          totalVisits: p.totalVisits,
          totalProposals: p.totalProposals,
          totalContracts: p.totalContracts,
          creci: p.creci,
          agency: p.agency?.tradeName || p.agency?.companyName || null,
          position: idx + 1,
        })),
      },
      meta: {
        generatedAt: new Date().toISOString(),
      }
    };

    return NextResponse.json(dashboard);
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { error: "Erro ao carregar dashboard", details: String(error) },
      { status: 500 }
    );
  }
}
