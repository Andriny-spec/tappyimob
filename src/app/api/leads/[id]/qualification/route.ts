import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Calcular dias para revisão baseado no score
function getReviewDays(score: number): number {
  if (score >= 75) return 7;   // Potencial fechador - revisar em 7 dias
  if (score >= 60) return 14;  // Potencial com risco - revisar em 14 dias
  return 30;                    // Ainda não fechador - revisar em 30 dias
}

// Gerar descrição da tarefa baseada no score
function getReviewDescription(score: number): string {
  if (score >= 75) {
    return "🔥 Lead com alto potencial! Revisar qualificação e conduzir para proposta.";
  }
  if (score >= 60) {
    return "⚠️ Lead com potencial, mas precisa de nutrição. Revisar qualificação e identificar objeções.";
  }
  return "❄️ Lead ainda não está pronto. Revisar qualificação e verificar se houve mudanças.";
}

// PUT - Atualizar qualificação do lead
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { answers, score, createReviewTask = true } = body;

    // Verificar se o lead existe
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        schedules: {
          where: {
            type: "REVISAO_QUALIFICACAO",
            completed: false,
            cancelled: false,
          },
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
    }

    // Atualizar qualificação
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        qualificationAnswers: answers,
        qualificationScore: score,
        // Auto-classificar temperatura se score >= 75%
        ...(score >= 75 && { temperature: "QUENTE" }),
      },
    });

    // Criar ou atualizar tarefa de revisão
    let reviewSchedule = null;
    if (createReviewTask) {
      const reviewDays = getReviewDays(score);
      const reviewDate = new Date();
      reviewDate.setDate(reviewDate.getDate() + reviewDays);
      
      // Cancelar tarefas de revisão anteriores
      if (lead.schedules.length > 0) {
        await prisma.leadSchedule.updateMany({
          where: {
            leadId: id,
            type: "REVISAO_QUALIFICACAO",
            completed: false,
            cancelled: false,
          },
          data: {
            cancelled: true,
          },
        });
      }

      // Criar nova tarefa de revisão
      reviewSchedule = await prisma.leadSchedule.create({
        data: {
          leadId: id,
          type: "REVISAO_QUALIFICACAO",
          date: reviewDate,
          time: "09:00",
          notes: getReviewDescription(score),
        },
      });
    }

    return NextResponse.json({
      success: true,
      lead: updatedLead,
      reviewSchedule,
      reviewDays: createReviewTask ? getReviewDays(score) : null,
    });
  } catch (error) {
    console.error("Erro ao atualizar qualificação:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar qualificação" },
      { status: 500 }
    );
  }
}

// GET - Obter qualificação do lead
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = params;

    const lead = await prisma.lead.findUnique({
      where: { id },
      select: {
        id: true,
        qualificationAnswers: true,
        qualificationScore: true,
        temperature: true,
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      answers: lead.qualificationAnswers || {},
      score: lead.qualificationScore || 0,
      temperature: lead.temperature,
    });
  } catch (error) {
    console.error("Erro ao buscar qualificação:", error);
    return NextResponse.json(
      { error: "Erro ao buscar qualificação" },
      { status: 500 }
    );
  }
}
