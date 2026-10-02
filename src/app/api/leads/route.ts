import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { detectDuplicatesForLead } from "@/lib/detect-duplicates";
import { notifyNewLead } from "@/lib/notify-new-lead";
import { UTM_COOKIE, desserializarOrigem } from "@/lib/utm";
import { enviarLeadParaWebhook } from "@/lib/webhook-leads";

// POST - Criar novo lead (API pública para captura de leads do site)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validações básicas
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    if (!body.phone && !body.email) {
      return NextResponse.json(
        { error: "Telefone ou e-mail é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se o imóvel existe (se propertyId foi fornecido)
    let property = null;
    if (body.propertyId) {
      property = await prisma.property.findUnique({
        where: { id: body.propertyId },
        select: {
          id: true,
          code: true,
          title: true,
          price: true,
          thumbnail: true,
        },
      });
    }

    // Detectar se é avaliação de imóvel
    const tags: string[] = body.tags || [];
    const isAvaliacao = tags.includes("AVALIACAO_IMOVEL");
    const isVendaImovel = tags.includes("VENDA_IMOVEL");
    const source = isAvaliacao ? "AVALIACAO" : isVendaImovel ? "CAPTACAO" : (body.source || "SITE");

    // Origem da campanha: vem do cookie gravado quando a pessoa entrou no
    // site, não da URL do formulário — na hora do envio os parâmetros já
    // sumiram da barra de endereço na maioria dos casos.
    const origem = desserializarOrigem(request.cookies.get(UTM_COOKIE)?.value);

    // Criar o lead com status NOVO (primeira coluna do Kanban)
    const lead = await prisma.lead.create({
      data: {
        name: body.name.trim(),
        email: body.email?.trim() || null,
        phone: body.phone?.trim() || null,
        message: body.message?.trim() || null,
        status: "NOVO", // Sempre cai na primeira coluna
        source,
        propertyId: property?.id || null,
        score: isAvaliacao ? 30 : 50,
        probability: isAvaliacao ? 30 : 50,
        tags,
        ...origem,
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
      },
    });

    // Salvar anexos como nota do lead (se houver)
    if (body.attachments && Array.isArray(body.attachments) && body.attachments.length > 0) {
      try {
        const attachmentLines = body.attachments.map((url: string, i: number) => `📎 Foto ${i + 1}: ${url}`).join("\n");
        await prisma.leadNote.create({
          data: {
            leadId: lead.id,
            content: `Fotos enviadas pelo formulário do site:\n${attachmentLines}`,
            pinned: true,
          },
        });
      } catch (noteErr) {
        console.error("Erro ao salvar anexos como nota:", noteErr);
      }
    }

    // Detectar duplicados automaticamente (non-blocking)
    detectDuplicatesForLead(lead.id).catch(() => {});

    // Notificar admins + WhatsApp (non-blocking)
    notifyNewLead({
      leadId: lead.id,
      leadName: lead.name,
      leadPhone: lead.phone,
      leadEmail: lead.email,
      source,
      propertyCode: property?.code || null,
      message: body.message || null,
    }).catch((err) => console.error("Erro ao notificar novo lead:", err));

    // Espelhar na planilha do marketing, se o webhook estiver configurado
    // (non-blocking — o lead já está salvo e a equipe já foi avisada)
    enviarLeadParaWebhook({
      ...lead,
      tags,
      propertyCode: property?.code || null,
      propertyTitle: property?.title || null,
      propertyPrice: property?.price ?? null,
      botao: body.formOrigin?.trim() || null,
    }).catch((err) => console.error("Erro no webhook de leads:", err));

    // Notificação especial para avaliações → SDR
    if (isAvaliacao || isVendaImovel) {
      (async () => {
        try {
          const sdrUsers = await prisma.user.findMany({
            where: { role: { in: ["ADMIN", "SDR"] }, isActive: true },
            select: { id: true },
          });
          const tipoLabel = isAvaliacao ? "Nova Avaliação de Imóvel" : "Novo Imóvel para Captação";
          await prisma.notification.createMany({
            data: sdrUsers.map((u) => ({
              userId: u.id,
              type: "new_evaluation",
              title: `📋 ${tipoLabel}`,
              message: `${lead.name} solicitou ${isAvaliacao ? "avaliação" : "captação"} via site`,
              link: `/admin/sdr?search=${encodeURIComponent(lead.name)}`,
              read: false,
            })),
          });
        } catch (err) {
          console.error("Erro ao notificar SDR sobre avaliação:", err);
        }
      })();
    }

    return NextResponse.json({
      success: true,
      message: "Lead criado com sucesso",
      lead: {
        id: lead.id,
        name: lead.name,
        property: lead.property,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: "Erro ao enviar mensagem. Tente novamente." },
      { status: 500 }
    );
  }
}
