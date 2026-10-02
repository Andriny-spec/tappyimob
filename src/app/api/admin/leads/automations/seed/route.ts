import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Criar automações padrão de funil (idempotente)
export async function POST() {
  try {
    const defaults = [
      {
        name: "Regredir lead sem progresso há 20 dias (Qualificado → Contatado)",
        description: "Lead que ficou 20 dias no status QUALIFICADO sem nenhuma atividade relevante regride para CONTATADO",
        triggerType: "FUNNEL_NO_PROGRESS",
        triggerConfig: { fromStatus: "QUALIFICADO", days: 20, requireNoActivity: true },
        actionType: "MOVE_COLUMN",
        actionConfig: { toStatus: "CONTATADO" },
        priority: 10,
      },
      {
        name: "Regredir lead sem visita há 15 dias (Contatado → Novo)",
        description: "Lead no status CONTATADO há 15 dias sem nenhuma visita agendada regride para NOVO",
        triggerType: "FUNNEL_NO_VISIT",
        triggerConfig: { fromStatus: "CONTATADO", days: 15 },
        actionType: "MOVE_COLUMN",
        actionConfig: { toStatus: "NOVO" },
        priority: 20,
      },
      {
        name: "Avançar lead com visita realizada (Contatado → Qualificado)",
        description: "Lead que teve visita realizada nos últimos 7 dias avança de CONTATADO para QUALIFICADO",
        triggerType: "FUNNEL_AUTO_PROGRESS",
        triggerConfig: { fromStatus: "CONTATADO", requiredEvent: "VISITA_REALIZADA", withinDays: 7 },
        actionType: "MOVE_COLUMN",
        actionConfig: { toStatus: "QUALIFICADO" },
        priority: 5,
      },
      {
        name: "Avançar lead com proposta (Qualificado → Em Negociação)",
        description: "Lead que teve proposta enviada nos últimos 7 dias avança de QUALIFICADO para EM_NEGOCIACAO",
        triggerType: "FUNNEL_AUTO_PROGRESS",
        triggerConfig: { fromStatus: "QUALIFICADO", requiredEvent: "proposal_sent", withinDays: 7 },
        actionType: "MOVE_COLUMN",
        actionConfig: { toStatus: "EM_NEGOCIACAO" },
        priority: 4,
      },
      {
        name: "Notificar corretor — lead sem contato há 48h",
        description: "Lead ativo sem contato há 48 horas gera notificação para o corretor responsável",
        triggerType: "NO_CONTACT",
        triggerConfig: { hours: 48 },
        actionType: "SEND_NOTIFICATION",
        actionConfig: { title: "Lead sem contato há 48h", message: "O lead \"{leadName}\" não recebe contato há mais de 48 horas." },
        priority: 30,
      },
      {
        name: "Follow-up pós visita — 24h depois",
        description: "Cria tarefa de follow-up 24h após visita realizada",
        triggerType: "VISIT_COMPLETED",
        triggerConfig: { hoursAfter: 24 },
        actionType: "CREATE_FOLLOW_UP",
        actionConfig: { delayHours: 0, followUpType: "VISIT_FOLLOWUP", channel: "WHATSAPP", message: "Olá! Como foi a visita? Gostaria de saber sua opinião." },
        priority: 15,
      },
    ];

    let created = 0;
    let skipped = 0;

    for (const auto of defaults) {
      const existing = await prisma.leadAutomation.findFirst({
        where: { name: auto.name },
      });
      if (existing) {
        skipped++;
        continue;
      }
      await prisma.leadAutomation.create({ data: auto });
      created++;
    }

    return NextResponse.json({ success: true, created, skipped });
  } catch (error: any) {
    console.error("Erro ao criar automações padrão:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
