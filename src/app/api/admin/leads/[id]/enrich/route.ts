import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enrichWithPH3A, enrichWithSeekloc, formatEnrichmentData } from "@/lib/enrichment";

// POST - Enriquecer dados do lead
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { provider, cpf, requestedById } = body;

    const lead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
    }

    let result;

    if (provider === "PH3A") {
      result = await enrichWithPH3A(cpf, lead.phone, lead.email);
    } else if (provider === "SEEKLOC") {
      result = await enrichWithSeekloc(cpf, lead.phone, lead.email);
    } else {
      // Enriquecer com ambos
      const ph3a = await enrichWithPH3A(cpf, lead.phone, lead.email);
      const seekloc = await enrichWithSeekloc(cpf, lead.phone, lead.email);
      
      // Salvar ambos os resultados
      if (ph3a.status === "SUCCESS") {
        await prisma.leadEnrichment.create({
          data: {
            leadId: id,
            provider: "PH3A",
            data: ph3a.data,
            status: ph3a.status,
            requestedById,
          },
        });
      }
      
      if (seekloc.status === "SUCCESS") {
        await prisma.leadEnrichment.create({
          data: {
            leadId: id,
            provider: "SEEKLOC",
            data: seekloc.data,
            status: seekloc.status,
            requestedById,
          },
        });
      }

      return NextResponse.json({
        success: true,
        results: { ph3a, seekloc },
        formattedData: {
          ph3a: formatEnrichmentData(ph3a.data),
          seekloc: formatEnrichmentData(seekloc.data),
        },
      });
    }

    // Salvar resultado do enriquecimento
    await prisma.leadEnrichment.create({
      data: {
        leadId: id,
        provider: result.provider,
        data: result.data || {},
        status: result.status,
        error: result.error,
        requestedById,
      },
    });

    // Registrar atividade
    await prisma.leadActivity.create({
      data: {
        leadId: id,
        type: "enrichment",
        description: `Dados enriquecidos via ${result.provider}`,
        metadata: { provider: result.provider, status: result.status },
      },
    });

    return NextResponse.json({
      success: result.status === "SUCCESS",
      result,
      formattedData: formatEnrichmentData(result.data),
    });
  } catch (error) {
    console.error("Erro ao enriquecer lead:", error);
    return NextResponse.json({ error: "Erro ao enriquecer lead" }, { status: 500 });
  }
}

// GET - Buscar dados de enriquecimento do lead
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const enrichments = await prisma.leadEnrichment.findMany({
      where: { leadId: id },
      orderBy: { createdAt: "desc" },
    });

    // Formatar dados para exibição
    const formattedEnrichments = enrichments.map((e) => ({
      id: e.id,
      provider: e.provider,
      status: e.status,
      createdAt: e.createdAt,
      data: formatEnrichmentData(e.data),
    }));

    return NextResponse.json({ enrichments: formattedEnrichments });
  } catch (error) {
    console.error("Erro ao buscar enriquecimento:", error);
    return NextResponse.json({ error: "Erro ao buscar enriquecimento" }, { status: 500 });
  }
}
