import { prisma } from "@/lib/prisma";

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    return await prisma.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type,
        link: params.link || null,
      },
    });
  } catch (error) {
    console.error("Erro ao criar notificação:", error);
    return null;
  }
}

export async function notifyLeadAssigned(corretorId: string, leadName: string, source: string = "sistema") {
  return createNotification({
    userId: corretorId,
    title: "Novo lead atribuído",
    message: `O lead "${leadName}" foi atribuído a você via ${source}.`,
    type: "lead_assigned",
    link: "/admin/clientes/leads",
  });
}

export async function notifyLeadFromQueue(corretorId: string, leadName: string, queueName: string) {
  return createNotification({
    userId: corretorId,
    title: "Novo lead via rodízio",
    message: `O lead "${leadName}" foi atribuído a você pela fila "${queueName}".`,
    type: "lead_queue",
    link: "/admin/clientes/leads",
  });
}

export async function notifyNewProposal(adminUserIds: string[], clientName: string, propertyCode: string, propertyId: string, corretorName?: string) {
  const by = corretorName ? ` por ${corretorName}` : "";
  const promises = adminUserIds.map((userId) =>
    createNotification({
      userId,
      title: "Nova proposta recebida",
      message: `${clientName} enviou uma proposta para o imóvel ${propertyCode}${by}.`,
      type: "new_proposal",
      link: `/admin/imoveis/${propertyId}?tab=propostas`,
    })
  );
  return Promise.all(promises);
}

export async function notifyNewLead(adminUserIds: string[], leadName: string, source: string) {
  const promises = adminUserIds.map((userId) =>
    createNotification({
      userId,
      title: "Novo lead recebido",
      message: `Novo lead: ${leadName} (origem: ${source})`,
      type: "new_lead",
      link: "/admin/clientes/leads",
    })
  );
  return Promise.all(promises);
}
