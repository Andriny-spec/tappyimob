import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { detectDuplicatesForLead } from "@/lib/detect-duplicates";

// POST - Webhook genérico para receber leads de portais (OLX, ZAP, VivaReal, Imovelweb, etc)
// Aceita múltiplos formatos e normaliza para o formato interno
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let body: any;

    if (contentType.includes("application/json")) {
      body = await request.json();
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      body = {} as any;
      formData.forEach((value, key) => { (body as any)[key] = value; });
    } else {
      body = await request.json().catch(() => ({}));
    }

    // Normalizar dados do lead de diferentes portais
    const leadData = normalizePortalLead(body);

    if (!leadData.name || (!leadData.phone && !leadData.email)) {
      return NextResponse.json(
        { error: "Dados insuficientes: nome + (telefone ou email) obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar duplicata por telefone/email
    let existingLead = null;
    if (leadData.phone) {
      const phoneDigits = leadData.phone.replace(/\D/g, "");
      if (phoneDigits.length >= 10) {
        existingLead = await prisma.lead.findFirst({
          where: {
            phone: { contains: phoneDigits.slice(-9) },
            archivedAt: null,
          },
        });
      }
    }
    if (!existingLead && leadData.email) {
      existingLead = await prisma.lead.findFirst({
        where: {
          email: { equals: leadData.email, mode: "insensitive" },
          archivedAt: null,
        },
      });
    }

    if (existingLead) {
      // Lead já existe — registrar atividade e atualizar lastContact
      await prisma.leadActivity.create({
        data: {
          leadId: existingLead.id,
          type: "portal_lead_received",
          description: `Novo contato via portal ${leadData.source}: "${leadData.message || "sem mensagem"}"`,
          metadata: { portal: leadData.source, propertyCode: leadData.propertyCode, raw: body },
        },
      });

      await prisma.lead.update({
        where: { id: existingLead.id },
        data: { lastContact: new Date() },
      });

      return NextResponse.json({
        success: true,
        action: "updated",
        leadId: existingLead.id,
        message: "Lead já existente — atividade registrada",
      });
    }

    // Buscar imóvel pelo código (se fornecido)
    let propertyId: string | null = null;
    if (leadData.propertyCode) {
      const property = await prisma.property.findFirst({
        where: { code: leadData.propertyCode },
        select: { id: true },
      });
      if (property) propertyId = property.id;
    }

    // Criar novo lead
    const lead = await prisma.lead.create({
      data: {
        name: leadData.name,
        email: leadData.email || null,
        phone: leadData.phone || null,
        message: leadData.message || null,
        status: "NOVO",
        source: leadData.source as any || "PORTAL",
        propertyId,
        score: 50,
        probability: 50,
        tags: ["PORTAL", leadData.portalName || "OUTROS"].filter(Boolean),
        temperature: "MORNO",
      },
    });

    // Registrar atividade de criação
    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        type: "created",
        description: `Lead criado via portal ${leadData.portalName || leadData.source}`,
        metadata: { portal: leadData.source, propertyCode: leadData.propertyCode, raw: body },
      },
    });

    // Detectar duplicados (non-blocking)
    detectDuplicatesForLead(lead.id).catch(() => {});

    // Criar notificação para admins (non-blocking)
    (async () => {
      try {
        const admins = await prisma.user.findMany({
          where: { role: "ADMIN", isActive: true },
          select: { id: true },
        });
        await prisma.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            type: "new_lead",
            title: `Novo lead do portal ${leadData.portalName || ""}`,
            message: `${lead.name} entrou em contato${leadData.propertyCode ? ` — Imóvel ${leadData.propertyCode}` : ""}`,
            link: `/admin/clientes/leads?search=${encodeURIComponent(lead.name)}`,
            read: false,
          })),
        });
      } catch (err) {
        console.error("Erro ao criar notificação:", err);
      }
    })();

    return NextResponse.json({
      success: true,
      action: "created",
      leadId: lead.id,
      message: "Lead criado com sucesso",
    }, { status: 201 });
  } catch (error: any) {
    console.error("Erro no webhook de portal:", error);
    return NextResponse.json(
      { error: "Erro ao processar lead do portal", details: error.message },
      { status: 500 }
    );
  }
}

// Normalizar dados de diferentes formatos de portais
function normalizePortalLead(body: any) {
  // Formato Grupo ZAP / VivaReal / ZAP Imóveis
  if (body.lead || body.Lead) {
    const lead = body.lead || body.Lead;
    return {
      name: lead.name || lead.nome || lead.clientName || "",
      email: lead.email || lead.clientEmail || "",
      phone: lead.phone || lead.telefone || lead.cellphone || lead.clientPhone || "",
      message: lead.message || lead.mensagem || lead.description || "",
      propertyCode: lead.propertyId || lead.listingId || lead.codigoImovel || lead.propertyCode || "",
      source: "PORTAL",
      portalName: body.portal || body.source || body.origin || detectPortalName(body),
    };
  }

  // Formato OLX
  if (body.ad_id || body.advertiser_id) {
    return {
      name: body.buyer_name || body.name || "",
      email: body.buyer_email || body.email || "",
      phone: body.buyer_phone || body.phone || "",
      message: body.message || body.body || "",
      propertyCode: body.ad_id || body.listing_id || "",
      source: "PORTAL",
      portalName: "OLX",
    };
  }

  // Formato Imovelweb / Mercado Livre
  if (body.contact || body.cliente) {
    const contact = body.contact || body.cliente;
    return {
      name: contact.name || contact.nome || "",
      email: contact.email || "",
      phone: contact.phone || contact.telefone || "",
      message: contact.message || body.message || body.mensagem || "",
      propertyCode: body.property_id || body.listing_id || body.codigo || "",
      source: "PORTAL",
      portalName: body.source || body.portal || "IMOVELWEB",
    };
  }

  // Formato genérico / direto
  return {
    name: body.name || body.nome || body.clientName || body.client_name || "",
    email: body.email || body.clientEmail || body.client_email || "",
    phone: body.phone || body.telefone || body.cellphone || body.whatsapp || body.client_phone || "",
    message: body.message || body.mensagem || body.description || body.msg || "",
    propertyCode: body.propertyCode || body.property_code || body.codigo || body.code || body.listing_id || body.ad_id || "",
    source: body.source || body.origem || "PORTAL",
    portalName: body.portal || body.portalName || body.origin || detectPortalName(body),
  };
}

function detectPortalName(body: any): string {
  const raw = JSON.stringify(body).toLowerCase();
  if (raw.includes("olx")) return "OLX";
  if (raw.includes("vivareal")) return "VivaReal";
  if (raw.includes("zapimoveis") || raw.includes("zap imoveis")) return "ZAP";
  if (raw.includes("imovelweb")) return "Imovelweb";
  if (raw.includes("mercadolivre") || raw.includes("mercado livre")) return "Mercado Livre";
  if (raw.includes("chaves")) return "Chaves na Mão";
  return "PORTAL";
}
