import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { leadSourceLabels, leadTicketLabels } from "@/types/lead";
import { CONDICAO_POR_AREA, ROTULO_AREA, areaDoLead, carregarRotulosDeEtapa, type Area } from "@/lib/lead-areas";

// Exportação unificada da base de clientes.
//
// O Kanban, o Acervo e o Limbo são a MESMA tabela `leads` — o que separa os
// três é o status e a categoria de arquivamento. Por isso a exportação vive
// aqui, num lugar só: qualquer tela sozinha enxerga apenas a própria fatia e
// nunca conseguiria montar a planilha completa que o marketing pede.

/** Data no formato brasileiro e no fuso de São Paulo, independente do servidor. */
function dataBR(valor: Date | null | undefined) {
  if (!valor) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(valor);
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    // A planilha inclui Acervo e Limbo, que são telas restritas ao admin.
    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso restrito ao administrador" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const areas = (searchParams.getAll("area").filter((a) => a in CONDICAO_POR_AREA) as Area[]);
    const corretorId = searchParams.get("corretorId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const apenasContagem = searchParams.get("contagem") === "1";

    // Filtros que valem para todas as áreas escolhidas.
    const filtrosComuns: any = {};
    if (corretorId) filtrosComuns.corretorId = corretorId;
    if (dateFrom || dateTo) {
      filtrosComuns.createdAt = {};
      if (dateFrom) filtrosComuns.createdAt.gte = new Date(dateFrom);
      if (dateTo) filtrosComuns.createdAt.lte = new Date(dateTo + "T23:59:59.999Z");
    }

    // Só as contagens, para a tela mostrar quanto vem em cada área antes de baixar.
    if (apenasContagem) {
      const [kanban, acervo, limbo] = await Promise.all(
        (["kanban", "acervo", "limbo"] as Area[]).map((area) =>
          prisma.lead.count({ where: { AND: [CONDICAO_POR_AREA[area], filtrosComuns] } })
        )
      );
      return NextResponse.json({ contagem: { kanban, acervo, limbo, total: kanban + acervo + limbo } });
    }

    if (areas.length === 0) {
      return NextResponse.json({ error: "Escolha ao menos uma origem" }, { status: 400 });
    }

    const where: any = {
      AND: [{ OR: areas.map((a) => CONDICAO_POR_AREA[a]) }, filtrosComuns],
    };

    const [leads, etapaDoLead, propostasPorLead] = await Promise.all([
      prisma.lead.findMany({
        where,
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          source: true,
          ticket: true,
          budget: true,
          minBudget: true,
          status: true,
          archivedCategory: true,
          createdAt: true,
          updatedAt: true,
          utmSource: true,
          utmMedium: true,
          utmCampaign: true,
          corretor: { select: { name: true } },
          scheduledVisits: { select: { id: true } },
          linkedProperties: { select: { type: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      carregarRotulosDeEtapa(),
      // PropertyProposal guarda `leadId` solto (sem relação no schema), então
      // vem numa consulta à parte em vez de um include.
      prisma.propertyProposal.findMany({
        where: { leadId: { not: null } },
        select: { leadId: true },
        distinct: ["leadId"],
      }),
    ]);

    const comProposta = new Set(propostasPorLead.map((p) => p.leadId));

    const rows = leads.map((l) => {
      const area: Area = areaDoLead(l);
      const etapa = etapaDoLead(l);

      const tipos = l.linkedProperties.map((p) => p.type);
      const temVisita = l.scheduledVisits.length > 0 || tipos.includes("VISITADO");
      // Proposta pode estar registrada no imóvel vinculado ao lead ou no módulo
      // de propostas, que é onde o corretor formaliza. Qualquer um conta.
      const temProposta = tipos.includes("PROPOSTA") || comProposta.has(l.id);

      const valorTicket = l.budget ?? l.minBudget ?? null;

      return [
        l.name || "",
        l.phone || "",
        l.email || "",
        leadSourceLabels[l.source] || l.source || "",
        l.corretor?.name || "Sem corretor",
        valorTicket ? valorTicket.toFixed(2).replace(".", ",") : "",
        temVisita ? "S" : "N",
        temProposta ? "S" : "N",
        dataBR(l.createdAt),
        dataBR(l.updatedAt),
        ROTULO_AREA[area],
        `${ROTULO_AREA[area]} › ${etapa}`,
        leadTicketLabels[l.ticket as keyof typeof leadTicketLabels] || l.ticket || "",
        l.utmSource || "",
        l.utmCampaign || "",
      ];
    });

    return NextResponse.json({
      headers: [
        "Nome do Cliente",
        "Telefone",
        "E-mail",
        "Mídia / Origem",
        "Corretor Vinculado",
        "Ticket (R$)",
        "Visitas",
        "Propostas",
        "Data de Entrada",
        "Última Atualização",
        "Área",
        "Posição",
        "Finalidade",
        "Origem da Campanha",
        "Nome da Campanha",
      ],
      rows,
      total: rows.length,
    });
  } catch (error) {
    console.error("[leads/export]", error);
    return NextResponse.json({ error: "Erro ao gerar exportação" }, { status: 500 });
  }
}
