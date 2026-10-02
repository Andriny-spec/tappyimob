import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// Configuração de tarefa automática por temperatura
const TEMPERATURE_TASK_CONFIG: Record<string, { title: string; description: string; days: number; priority: string; type: string }> = {
  QUENTE: {
    title: "🔥 Contato imediato — Lead quente",
    description: "Lead classificado como QUENTE. Entrar em contato imediatamente para agendar visita ou enviar proposta.",
    days: 1,
    priority: "URGENTE",
    type: "LIGACAO",
  },
  MORNO: {
    title: "🌡️ Follow-up — Lead morno",
    description: "Lead classificado como MORNO. Fazer follow-up para entender necessidades e aquecer o interesse.",
    days: 3,
    priority: "ALTA",
    type: "FOLLOW_UP",
  },
  FRIO: {
    title: "❄️ Nutrição — Lead frio",
    description: "Lead classificado como FRIO. Enviar materiais, manter contato periódico e nutrir o relacionamento.",
    days: 7,
    priority: "MEDIA",
    type: "FOLLOW_UP",
  },
};

// GET - Buscar lead por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    const isCorretor = session?.role === "CORRETOR";
    const { id } = await params;

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            id: true,
            code: true,
            title: true,
            price: true,
            thumbnail: true,
            address: true,
            neighborhood: true,
            city: true,
          },
        },
        corretor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        notes: {
          orderBy: { createdAt: "desc" },
        },
        schedules: {
          orderBy: { date: "asc" },
        },
        contracts: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!lead) {
      return NextResponse.json(
        { error: "Lead não encontrado" },
        { status: 404 }
      );
    }

    // Corretor só pode acessar seus próprios leads
    if (isCorretor && lead.corretorId !== session.id) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error("Error fetching lead:", error);
    return NextResponse.json(
      { error: "Erro ao buscar lead" },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar lead
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    const isCorretor = session?.role === "CORRETOR";
    const { id } = await params;
    const body = await request.json();

    // Remover campos que não devem ser atualizados diretamente
    const { notes, schedules, contracts, property, corretor, linkedProperties, linkedPropertiesCount, _count, tags, ...updateData } = body;

    // Sanitizar dados: converter strings vazias para null, birthDate string→Date
    if (updateData.birthDate !== undefined) {
      updateData.birthDate = updateData.birthDate ? new Date(updateData.birthDate) : null;
    }
    // Remover campos com valor undefined para evitar erros Prisma
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) delete updateData[key];
      if (updateData[key] === "") {
        // Campos numéricos e datas devem ser null, não string vazia
        if (["minBudget", "maxBudget", "permutaValue", "permutaArea", "permutaBedrooms"].includes(key)) {
          updateData[key] = null;
        }
      }
    });

    // Buscar dados atuais para detectar mudanças
    const currentLead = await prisma.lead.findUnique({
      where: { id },
      select: {
        status: true, temperature: true, corretorId: true, name: true, nickname: true, ticket: true, tags: true,
        corretor: { select: { name: true } },
        source: true, profile: true, phone: true, email: true,
        budget: true, minBudget: true, maxBudget: true,
        hasFinancing: true, financingApproved: true, approvedAmount: true,
        hasPermuta: true, permutaValue: true, permutaLocation: true, permutaDescription: true,
        condominiumsOfInterest: true, searchTypologies: true, searchSubtypes: true, searchBedrooms: true,
        score: true, probability: true,
        cpf: true, birthDate: true, profession: true, maritalStatus: true,
        address: true, city: true, state: true, neighborhood: true,
        createdById: true,
      },
    });

    // Auto-atualizar apelido quando nome muda (se apelido era auto-gerado ou vazio)
    if (updateData.name && currentLead) {
      const oldAutoNickname = currentLead.name?.split(" ")[0] || "";
      const currentNickname = currentLead.nickname || "";
      if (!currentNickname || currentNickname === oldAutoNickname) {
        updateData.nickname = updateData.name.trim().split(" ")[0] || updateData.name;
      }
    }

    // Corretor só pode editar seus próprios leads
    if (isCorretor && currentLead?.corretorId !== session.id) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const previousStatus = currentLead?.status || null;
    const previousTemperature = currentLead?.temperature || null;

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      include: {
        property: {
          select: {
            id: true,
            code: true,
            title: true,
            price: true,
            thumbnail: true,
          },
        },
        corretor: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Registrar mudanças na timeline de atividades
    const activityPromises: Promise<any>[] = [];
    const userName = session?.name || "Sistema";

    // Status
    if (updateData.status && previousStatus && previousStatus !== updateData.status) {
      activityPromises.push(prisma.leadActivity.create({
        data: {
          leadId: id,
          type: "status_change",
          description: `Status alterado de "${previousStatus}" para "${updateData.status}" por ${userName}`,
          metadata: { from: previousStatus, to: updateData.status, by: userName },
          userId: session?.id || null,
        },
      }));
    }

    // Temperatura
    if (updateData.temperature && previousTemperature && updateData.temperature !== previousTemperature) {
      const tempLabels: Record<string, string> = { QUENTE: "Quente", MORNO: "Morno", FRIO: "Frio" };
      activityPromises.push(prisma.leadActivity.create({
        data: {
          leadId: id,
          type: "temperature_change",
          description: `Temperatura alterada de "${tempLabels[previousTemperature] || previousTemperature}" para "${tempLabels[updateData.temperature] || updateData.temperature}" por ${userName}`,
          metadata: { from: previousTemperature, to: updateData.temperature, by: userName },
          userId: session?.id || null,
        },
      }));
    }

    // Nome
    if (updateData.name && currentLead?.name && updateData.name !== currentLead.name) {
      activityPromises.push(prisma.leadActivity.create({
        data: {
          leadId: id,
          type: "name_change",
          description: `Nome alterado de "${currentLead.name}" para "${updateData.name}" por ${userName}`,
          metadata: { from: currentLead.name, to: updateData.name, by: userName },
          userId: session?.id || null,
        },
      }));
    }

    // Ticket/Finalidade
    if (updateData.ticket && currentLead?.ticket && updateData.ticket !== currentLead.ticket) {
      const ticketLabels: Record<string, string> = { COMPRA: "Compra", LOCACAO: "Locação", AMBOS: "Compra e Locação" };
      activityPromises.push(prisma.leadActivity.create({
        data: {
          leadId: id,
          type: "ticket_change",
          description: `Finalidade alterada de "${ticketLabels[currentLead.ticket] || currentLead.ticket}" para "${ticketLabels[updateData.ticket] || updateData.ticket}" por ${userName}`,
          metadata: { from: currentLead.ticket, to: updateData.ticket, by: userName },
          userId: session?.id || null,
        },
      }));
    }

    // Corretor
    if (updateData.corretorId && currentLead?.corretorId && updateData.corretorId !== currentLead.corretorId) {
      const newCorretor = await prisma.user.findUnique({ where: { id: updateData.corretorId }, select: { name: true } });
      activityPromises.push(prisma.leadActivity.create({
        data: {
          leadId: id,
          type: "corretor_change",
          description: `Corretor transferido de "${currentLead.corretor?.name || "Sem corretor"}" para "${newCorretor?.name || "Sem corretor"}" por ${userName}`,
          metadata: { from: currentLead.corretorId, to: updateData.corretorId, fromName: currentLead.corretor?.name, toName: newCorretor?.name, by: userName },
          userId: session?.id || null,
        },
      }));
    }

    // Tags
    if (tags !== undefined && currentLead?.tags) {
      const oldTags = currentLead.tags as string[];
      const newTags = tags as string[];
      const addedTags = newTags.filter((t: string) => !oldTags.includes(t));
      const removedTags = oldTags.filter((t: string) => !newTags.includes(t));
      if (addedTags.length > 0) {
        activityPromises.push(prisma.leadActivity.create({
          data: {
            leadId: id,
            type: "tag_added",
            description: `Tag(s) adicionada(s): ${addedTags.join(", ")} por ${userName}`,
            metadata: { added: addedTags, by: userName },
            userId: session?.id || null,
          },
        }));
      }
      if (removedTags.length > 0) {
        activityPromises.push(prisma.leadActivity.create({
          data: {
            leadId: id,
            type: "tag_removed",
            description: `Tag(s) removida(s): ${removedTags.join(", ")} por ${userName}`,
            metadata: { removed: removedTags, by: userName },
            userId: session?.id || null,
          },
        }));
      }
      // Apply tags update separately since it was destructured
      await prisma.lead.update({ where: { id }, data: { tags: newTags } });
    }

    // Track genérico de edições de campos importantes
    const fieldLabels: Record<string, string> = {
      phone: "Telefone", email: "E-mail", source: "Origem", profile: "Perfil",
      budget: "Orçamento", minBudget: "Orçamento mín.", maxBudget: "Orçamento máx.",
      hasFinancing: "Tem financiamento", financingApproved: "Financ. aprovado", approvedAmount: "Valor aprovado",
      hasPermuta: "Tem permuta", permutaValue: "Valor permuta", permutaLocation: "Local permuta", permutaDescription: "Desc. permuta",
      score: "Score", probability: "Probabilidade",
      cpf: "CPF", birthDate: "Data nasc.", profession: "Profissão", maritalStatus: "Estado civil",
      address: "Endereço", city: "Cidade", state: "Estado", neighborhood: "Bairro",
      searchBedrooms: "Dormitórios busca",
    };
    const trackedFields = Object.keys(fieldLabels);
    for (const field of trackedFields) {
      if (updateData[field] !== undefined && currentLead && (updateData[field] as any) !== (currentLead as any)[field]) {
        const label = fieldLabels[field];
        const oldVal = (currentLead as any)[field];
        const newVal = updateData[field];
        const formatVal = (v: any) => v === null || v === undefined ? "vazio" : typeof v === "boolean" ? (v ? "Sim" : "Não") : String(v);
        activityPromises.push(prisma.leadActivity.create({
          data: {
            leadId: id,
            type: "field_edit",
            description: `${label} alterado de "${formatVal(oldVal)}" para "${formatVal(newVal)}" por ${userName}`,
            metadata: { field, from: oldVal, to: newVal, by: userName },
            userId: session?.id || null,
          },
        }));
      }
    }

    // Track arrays (condomínios, tipologias, subtipos)
    const arrayFields: Record<string, string> = {
      condominiumsOfInterest: "Condomínios de interesse",
      searchTypologies: "Tipologias",
      searchSubtypes: "Subtipos",
    };
    for (const [field, label] of Object.entries(arrayFields)) {
      if (updateData[field] !== undefined && currentLead) {
        const oldArr = ((currentLead as any)[field] || []) as string[];
        const newArr = (updateData[field] || []) as string[];
        const added = newArr.filter((v: string) => !oldArr.includes(v));
        const removed = oldArr.filter((v: string) => !newArr.includes(v));
        if (added.length > 0 || removed.length > 0) {
          const parts = [];
          if (added.length > 0) parts.push(`+${added.join(", ")}`);
          if (removed.length > 0) parts.push(`-${removed.join(", ")}`);
          activityPromises.push(prisma.leadActivity.create({
            data: {
              leadId: id,
              type: "field_edit",
              description: `${label} atualizado (${parts.join("; ")}) por ${userName}`,
              metadata: { field, added, removed, by: userName },
              userId: session?.id || null,
            },
          }));
        }
      }
    }

    if (activityPromises.length > 0) {
      await Promise.allSettled(activityPromises);
    }

    // Tarefa automática por temperatura do lead
    const newTemperature = updateData.temperature;
    if (newTemperature && newTemperature !== previousTemperature) {
      const config = TEMPERATURE_TASK_CONFIG[newTemperature];
      if (config) {
        const assigneeId = lead.corretorId || lead.corretor?.id;
        if (assigneeId) {
          try {
            const session = await getSession();
            const creatorId = session?.id || assigneeId;

            // Cancelar tarefas automáticas anteriores de temperatura para este lead
            await prisma.task.updateMany({
              where: {
                leadId: id,
                status: { in: ["PENDENTE", "EM_ANDAMENTO"] },
                title: { startsWith: "🔥 Contato imediato" },
              },
              data: { status: "CANCELADA" as any },
            });
            await prisma.task.updateMany({
              where: {
                leadId: id,
                status: { in: ["PENDENTE", "EM_ANDAMENTO"] },
                title: { startsWith: "🌡️ Follow-up" },
              },
              data: { status: "CANCELADA" as any },
            });
            await prisma.task.updateMany({
              where: {
                leadId: id,
                status: { in: ["PENDENTE", "EM_ANDAMENTO"] },
                title: { startsWith: "❄️ Nutrição" },
              },
              data: { status: "CANCELADA" as any },
            });

            // Criar nova tarefa
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + config.days);

            await prisma.task.create({
              data: {
                title: `${config.title} — ${currentLead?.name || "Lead"}`,
                description: config.description,
                type: config.type as any,
                priority: config.priority as any,
                dueDate,
                leadId: id,
                createdById: creatorId,
                assignedToId: assigneeId,
              },
            });

            // Criar notificação para o corretor
            await prisma.notification.create({
              data: {
                userId: assigneeId,
                title: `Temperatura do lead alterada para ${newTemperature}`,
                message: `${currentLead?.name || "Lead"}: ${config.description}`,
                type: "task_reminder",
                link: `/corretor/clientes/leads`,
              },
            });
          } catch (taskError) {
            console.error("Erro ao criar tarefa automática por temperatura:", taskError);
          }
        }
      }
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar lead" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir lead (proteção 24h para corretores)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    // Apenas ADMIN pode excluir leads
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Apenas administradores podem excluir leads" }, { status: 403 });
    }

    // Limpar relações antes de deletar (evita erro de FK constraint)
    await Promise.all([
      prisma.leadNote.deleteMany({ where: { leadId: id } }),
      prisma.leadActivity.deleteMany({ where: { leadId: id } }),
      prisma.leadSchedule.deleteMany({ where: { leadId: id } }),
      prisma.leadProperty.deleteMany({ where: { leadId: id } }),
    ]);
    await Promise.allSettled([
      prisma.scheduledVisit.deleteMany({ where: { leadId: id } }),
      prisma.task.updateMany({ where: { leadId: id }, data: { leadId: null } }),
      prisma.contract.updateMany({ where: { leadId: id }, data: { leadId: null } }),
      prisma.leadQueueAssignment.deleteMany({ where: { leadId: id } }),
      prisma.leadDuplicate.deleteMany({ where: { OR: [{ leadId1: id }, { leadId2: id }] } }),
      prisma.leadAutomationLog.deleteMany({ where: { leadId: id } }),
      prisma.leadFollowUp.deleteMany({ where: { leadId: id } }),
      prisma.leadEnrichment.deleteMany({ where: { leadId: id } }),
    ]);

    await prisma.lead.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return NextResponse.json(
      { error: "Erro ao excluir lead" },
      { status: 500 }
    );
  }
}
