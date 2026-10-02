import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET - Buscar insights e métricas para dashboard
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get("periodo") || "30"; // dias
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - parseInt(periodo));

    // 1. TEMPO DE ATENDIMENTO - Tempo médio desde criação do lead até primeiro contato
    const leads = await prisma.lead.findMany({
      where: {
        createdAt: { gte: dataInicio },
      },
      select: {
        id: true,
        createdAt: true,
        firstContactAt: true,
        status: true,
        corretorId: true,
        corretor: {
          select: { name: true },
        },
      },
    });

    // Calcular tempo médio de primeiro atendimento
    const leadsComContato = leads.filter(l => l.firstContactAt);
    const temposAtendimento = leadsComContato.map(l => {
      const diff = new Date(l.firstContactAt!).getTime() - new Date(l.createdAt).getTime();
      return diff / (1000 * 60); // em minutos
    });
    const tempoMedioAtendimento = temposAtendimento.length > 0
      ? temposAtendimento.reduce((a, b) => a + b, 0) / temposAtendimento.length
      : 0;

    // 2. TEMPO MÉDIO EM CADA ETAPA DO FUNIL por corretor
    const statusChanges = await prisma.lead.findMany({
      where: {
        createdAt: { gte: dataInicio },
        statusChangedAt: { not: null },
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        statusChangedAt: true,
        corretorId: true,
        corretor: {
          select: { id: true, name: true },
        },
      },
    });

    // Agrupar por status e calcular tempo médio
    const temposPorEtapa: Record<string, number[]> = {};
    const temposPorCorretor: Record<string, { nome: string; tempoMedio: number; leads: number }> = {};

    statusChanges.forEach(lead => {
      if (lead.statusChangedAt) {
        const tempoNaEtapa = new Date(lead.statusChangedAt).getTime() - new Date(lead.createdAt).getTime();
        const tempoEmHoras = tempoNaEtapa / (1000 * 60 * 60);

        if (!temposPorEtapa[lead.status]) temposPorEtapa[lead.status] = [];
        temposPorEtapa[lead.status].push(tempoEmHoras);

        if (lead.corretor) {
          if (!temposPorCorretor[lead.corretor.id]) {
            temposPorCorretor[lead.corretor.id] = {
              nome: lead.corretor.name,
              tempoMedio: 0,
              leads: 0,
            };
          }
          temposPorCorretor[lead.corretor.id].leads++;
        }
      }
    });

    // Calcular médias por etapa
    const mediaPorEtapa = Object.entries(temposPorEtapa).map(([status, tempos]) => ({
      etapa: status,
      tempoMedioHoras: tempos.reduce((a, b) => a + b, 0) / tempos.length,
      quantidade: tempos.length,
    }));

    // 3. AGENDAMENTOS DE FOTOS - Concluídos
    const fotosAgendadas = await prisma.photoSchedule.findMany({
      where: {
        scheduledDate: { gte: dataInicio },
      },
      select: {
        id: true,
        status: true,
        scheduledDate: true,
        completedAt: true,
        photographerId: true,
      },
    });

    const fotosConcluidas = fotosAgendadas.filter(f => f.status === "CONCLUIDO").length;
    const fotosPendentes = fotosAgendadas.filter(f => f.status === "AGENDADO").length;
    const fotosTotal = fotosAgendadas.length;

    // 4. ATUALIZAÇÃO DE IMÓVEIS
    const imoveisAtualizados = await prisma.property.count({
      where: {
        updatedAt: { gte: dataInicio },
      },
    });

    const imoveisTotal = await prisma.property.count({
      where: { status: "DISPONIVEL" },
    });

    const imoveisSemAtualizacao = await prisma.property.count({
      where: {
        status: "DISPONIVEL",
        updatedAt: {
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 dias sem atualização
        },
      },
    });

    // 5. INSIGHTS GESTÃO DE CLIENTES
    const leadsPorStatus = await prisma.lead.groupBy({
      by: ["status"],
      _count: { id: true },
      where: {
        createdAt: { gte: dataInicio },
      },
    });

    const leadsPorOrigem = await prisma.lead.groupBy({
      by: ["source"],
      _count: { id: true },
      where: {
        createdAt: { gte: dataInicio },
      },
    });

    const leadsConvertidos = await prisma.lead.count({
      where: {
        status: { in: ["CONVERTIDO", "FECHADO"] },
        createdAt: { gte: dataInicio },
      },
    });

    const totalLeadsPeriodo = leads.length;
    const taxaConversao = totalLeadsPeriodo > 0 ? (leadsConvertidos / totalLeadsPeriodo) * 100 : 0;

    // Performance por corretor
    const leadsPorCorretor = await prisma.lead.groupBy({
      by: ["corretorId"],
      _count: { id: true },
      where: {
        createdAt: { gte: dataInicio },
        corretorId: { not: null },
      },
    });

    // Buscar nomes dos corretores
    const corretoresIds = leadsPorCorretor.map(l => l.corretorId).filter(Boolean) as string[];
    const corretores = await prisma.user.findMany({
      where: { id: { in: corretoresIds } },
      select: { id: true, name: true },
    });

    const performanceCorretores = leadsPorCorretor.map(lpc => {
      const corretor = corretores.find(c => c.id === lpc.corretorId);
      return {
        corretorId: lpc.corretorId,
        nome: corretor?.name || "Sem nome",
        leads: lpc._count.id,
      };
    }).sort((a, b) => b.leads - a.leads);

    // 6. CAPTAÇÃO - se existir a tabela
    let captacaoStats = null;
    try {
      const [radarTotal, radarCaptados, iptuTotal, iptuVinculados] = await Promise.all([
        (prisma as any).captacaoRadar?.count() || 0,
        (prisma as any).captacaoRadar?.count({ where: { status: "CAPTADO" } }) || 0,
        (prisma as any).iptuBase?.count() || 0,
        (prisma as any).iptuBase?.count({ where: { matchStatus: "VINCULADO" } }) || 0,
      ]);

      captacaoStats = {
        radarTotal,
        radarCaptados,
        taxaCaptacao: radarTotal > 0 ? (radarCaptados / radarTotal) * 100 : 0,
        iptuTotal,
        iptuVinculados,
      };
    } catch (e) {
      // Tabelas ainda não existem
    }

    return NextResponse.json({
      periodo: parseInt(periodo),
      atendimento: {
        tempoMedioMinutos: Math.round(tempoMedioAtendimento),
        tempoMedioFormatado: formatarTempo(tempoMedioAtendimento),
        totalLeads: leads.length,
        leadsAtendidos: leadsComContato.length,
        taxaAtendimento: leads.length > 0 ? (leadsComContato.length / leads.length) * 100 : 0,
      },
      funil: {
        mediaPorEtapa,
        temposPorCorretor: Object.values(temposPorCorretor),
      },
      fotos: {
        total: fotosTotal,
        concluidas: fotosConcluidas,
        pendentes: fotosPendentes,
        taxaConclusao: fotosTotal > 0 ? (fotosConcluidas / fotosTotal) * 100 : 0,
      },
      imoveis: {
        total: imoveisTotal,
        atualizados: imoveisAtualizados,
        semAtualizacao: imoveisSemAtualizacao,
        taxaAtualizacao: imoveisTotal > 0 ? (imoveisAtualizados / imoveisTotal) * 100 : 0,
      },
      clientes: {
        totalLeads: totalLeadsPeriodo,
        convertidos: leadsConvertidos,
        taxaConversao: Math.round(taxaConversao * 10) / 10,
        porStatus: leadsPorStatus.map(l => ({
          status: l.status,
          quantidade: l._count.id,
        })),
        porOrigem: leadsPorOrigem.map(l => ({
          origem: l.source || "Desconhecida",
          quantidade: l._count.id,
        })),
        performanceCorretores,
      },
      captacao: captacaoStats,
    });
  } catch (error) {
    console.error("Erro ao buscar insights:", error);
    return NextResponse.json(
      { error: "Erro ao buscar insights" },
      { status: 500 }
    );
  }
}

function formatarTempo(minutos: number): string {
  if (minutos < 60) {
    return `${Math.round(minutos)} min`;
  }
  const horas = Math.floor(minutos / 60);
  const mins = Math.round(minutos % 60);
  if (horas < 24) {
    return `${horas}h ${mins}min`;
  }
  const dias = Math.floor(horas / 24);
  const horasRestantes = horas % 24;
  return `${dias}d ${horasRestantes}h`;
}
