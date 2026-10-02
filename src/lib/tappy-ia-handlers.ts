/**
 * Tappy IA — Handlers das tools de leitura
 */

import { prisma } from "@/lib/prisma";
import { clampLimit, ci, SUMMARY_USER, type ToolHandler } from "./tappy-ia-tools";
import { CONDICAO_POR_AREA, areaDoLead, type Area } from "./lead-areas";
import { generateAndUploadDueDiligencePdf } from "./due-diligence-pdf";

export const TOOL_HANDLERS: Record<string, ToolHandler> = {
  // -------- IMÓVEIS --------
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async query_properties(args: any) {
    const limit = clampLimit(args.limit);
    const orderMap: Record<string, object> = {
      views_desc: { views: "desc" },
      price_desc: { price: "desc" },
      price_asc: { price: "asc" },
      newest: { createdAt: "desc" },
      oldest: { createdAt: "asc" },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (args.status) where.status = args.status;
    else where.status = { not: "INATIVO" };
    if (args.category) where.category = args.category;
    if (args.type) where.type = args.type;
    if (args.neighborhood) where.neighborhood = ci(args.neighborhood);
    if (args.city) where.city = ci(args.city);
    if (args.minBedrooms) where.bedrooms = { gte: Number(args.minBedrooms) };
    if (args.minPrice || args.maxPrice) {
      where.price = {};
      if (args.minPrice) where.price.gte = Number(args.minPrice);
      if (args.maxPrice) where.price.lte = Number(args.maxPrice);
    }
    if (args.search) {
      where.OR = [
        { title: ci(args.search) },
        { code: ci(args.search) },
        { description: ci(args.search) },
      ];
    }
    const [items, total] = await Promise.all([
      prisma.property.findMany({
        where,
        orderBy: orderMap[args.orderBy] ?? { createdAt: "desc" },
        take: limit,
        select: {
          id: true, code: true, title: true, slug: true,
          price: true, status: true, category: true, type: true,
          bedrooms: true, bathrooms: true, area: true,
          neighborhood: true, city: true, views: true,
          images: true, createdAt: true,
        },
      }),
      prisma.property.count({ where }),
    ]);
    return { total, count: items.length, items };
  },

  // -------- CONDOMÍNIOS --------
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async query_condominiums(args: any) {
    const limit = clampLimit(args.limit);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (args.search) where.name = ci(args.search);
    if (args.city) where.city = ci(args.city);
    if (args.neighborhood) where.neighborhood = ci(args.neighborhood);
    const [items, total] = await Promise.all([
      prisma.condominium.findMany({
        where,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true, name: true, slug: true,
          condoCategory: true, condoType: true,
          neighborhood: true, city: true, totalUnits: true, yearBuilt: true,
        },
      }),
      prisma.condominium.count({ where }),
    ]);
    return { total, count: items.length, items };
  },
  // (Condominium model não possui soft-delete — sem filtro deletedAt)

  // -------- LEADS --------
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async query_leads(args: any, ctx) {
    if (ctx.role === "FOTOGRAFO") return { error: "Sem permissão" };
    const limit = clampLimit(args.limit);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const and: any[] = [];
    // "leads" era o nome antigo do bucket do funil ativo
    const bucket = args.bucket === "leads" ? "kanban" : args.bucket;
    if (bucket === "sdr") and.push({ status: "TRIAGEM" });
    else if (bucket && CONDICAO_POR_AREA[bucket as Area]) and.push(CONDICAO_POR_AREA[bucket as Area]);
    if (args.status) and.push({ status: args.status });
    if (args.temperatura) and.push({ temperature: args.temperatura });
    if (args.categoria_arquivo) and.push({ archivedCategory: ci(args.categoria_arquivo) });
    if (args.origem) and.push({ source: String(args.origem).toUpperCase() });
    if (args.minScore) and.push({ score: { gte: Number(args.minScore) } });
    if (args.sem_followup_ha_dias) {
      const limite = new Date(Date.now() - Number(args.sem_followup_ha_dias) * 86_400_000);
      and.push({ OR: [{ lastContact: { lt: limite } }, { lastContact: null, updatedAt: { lt: limite } }] });
    }
    if (args.search) {
      and.push({ OR: [{ name: ci(args.search) }, { email: ci(args.search) }, { phone: ci(args.search) }] });
    }
    if (ctx.role === "CORRETOR") and.push({ corretorId: ctx.userId });
    else if (args.corretorId) and.push({ corretorId: args.corretorId });
    else if (args.corretor) {
      const u = await prisma.user.findFirst({
        where: { OR: [{ id: args.corretor }, { name: ci(args.corretor) }] },
        select: { id: true },
      });
      if (!u) return { error: `Corretor "${args.corretor}" não encontrado.` };
      and.push({ corretorId: u.id });
    }
    const where = and.length ? { AND: and } : {};

    const orderMap: Record<string, object> = {
      newest: { createdAt: "desc" }, oldest: { createdAt: "asc" },
      score_desc: { score: "desc" }, updated_desc: { updatedAt: "desc" },
    };
    const [items, total] = await Promise.all([
      prisma.lead.findMany({
        where, take: limit,
        orderBy: orderMap[args.orderBy] ?? { createdAt: "desc" },
        select: {
          id: true, name: true, email: true, phone: true,
          status: true, archivedCategory: true, temperature: true, score: true, source: true,
          ticket: true, budget: true, condominiumsOfInterest: true,
          lastContact: true, nextFollowUp: true,
          corretor: { select: SUMMARY_USER },
          property: { select: { id: true, code: true, title: true } },
          createdAt: true, updatedAt: true,
        },
      }),
      prisma.lead.count({ where }),
    ]);
    return {
      total,
      count: items.length,
      items: items.map((l) => ({ ...l, area: areaDoLead(l) })),
    };
  },

  // -------- USUÁRIOS --------
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async query_users(args: any, ctx) {
    if (ctx.role !== "ADMIN" && ctx.role !== "CORRETOR" && ctx.role !== "FOTOGRAFO") {
      return { error: "Sem permissão" };
    }
    const limit = clampLimit(args.limit);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (args.role) where.role = args.role;
    if (args.search) {
      where.OR = [{ name: ci(args.search) }, { email: ci(args.search) }];
    }
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where, take: limit, orderBy: { createdAt: "desc" },
        select: {
          id: true, name: true, email: true, role: true,
          phone: true, avatar: true, creci: true, createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);
    return { total, count: items.length, items };
  },

  // -------- VENDEDORES --------
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async query_sellers(args: any) {
    const limit = clampLimit(args.limit);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { isAlsoSeller: true };
    if (args.search) {
      where.OR = [
        { name: ci(args.search) }, { email: ci(args.search) }, { phone: ci(args.search) },
      ];
    }
    const [items, total] = await Promise.all([
      prisma.lead.findMany({
        where, take: limit, orderBy: { updatedAt: "desc" },
        select: {
          id: true, name: true, email: true, phone: true,
          city: true, neighborhood: true, createdAt: true,
        },
      }),
      prisma.lead.count({ where }),
    ]);
    return { total, count: items.length, items };
  },

  // -------- CONTRATOS --------
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async query_contracts(args: any, ctx) {
    const limit = clampLimit(args.limit);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (args.status) where.status = args.status;
    if (args.type) where.type = args.type;
    if (args.category) where.category = args.category;
    if (args.search) {
      where.OR = [{ codigo: ci(args.search) }, { name: ci(args.search) }];
    }
    if (ctx.role === "CORRETOR") where.corretorId = ctx.userId;

    const [items, total] = await Promise.all([
      prisma.contract.findMany({
        where, take: limit, orderBy: { createdAt: "desc" },
        select: {
          id: true, codigo: true, name: true,
          type: true, category: true, status: true, valor: true,
          corretor: { select: SUMMARY_USER },
          property: { select: { id: true, code: true, title: true } },
          createdAt: true, signedAt: true,
        },
      }),
      prisma.contract.count({ where }),
    ]);
    return { total, count: items.length, items };
  },

  // -------- VISITAS --------
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async query_visits(args: any, ctx) {
    const limit = clampLimit(args.limit);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (args.status) where.status = args.status;
    if (args.corretorId) where.corretorId = args.corretorId;
    if (args.upcoming) where.date = { gte: new Date() };
    if (args.fromDate || args.toDate) {
      where.date = where.date || {};
      if (args.fromDate) where.date.gte = new Date(args.fromDate);
      if (args.toDate) where.date.lte = new Date(args.toDate);
    }
    if (ctx.role === "CORRETOR") where.corretorId = ctx.userId;

    const [items, total] = await Promise.all([
      prisma.scheduledVisit.findMany({
        where, take: limit,
        orderBy: { date: args.upcoming ? "asc" : "desc" },
        select: {
          id: true, date: true, time: true,
          status: true, notes: true,
          corretor: { select: SUMMARY_USER },
          lead: { select: { id: true, name: true, phone: true } },
          createdAt: true,
        },
      }),
      prisma.scheduledVisit.count({ where }),
    ]);
    return { total, count: items.length, items };
  },

  // -------- SESSÕES DE FOTO --------
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async query_photo_sessions(args: any, ctx) {
    const limit = clampLimit(args.limit);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (args.status) where.status = args.status;
    if (args.photographerId) {
      where.OR = [
        { photographerId: args.photographerId },
        { photographerIds: { has: args.photographerId } },
      ];
    }
    if (args.upcoming) where.scheduledDate = { gte: new Date() };
    if (ctx.role === "FOTOGRAFO") {
      where.OR = [
        { photographerId: ctx.userId },
        { photographerIds: { has: ctx.userId } },
      ];
    }
    const [items, total] = await Promise.all([
      prisma.photoSession.findMany({
        where, take: limit,
        orderBy: { scheduledDate: args.upcoming ? "asc" : "desc" },
        select: {
          id: true, scheduledDate: true, scheduledTime: true, status: true,
          serviceTypes: true, estimatedDuration: true,
          contactName: true, address: true,
          photographerIds: true, photographerId: true,
          property: { select: { id: true, code: true, title: true } },
        },
      }),
      prisma.photoSession.count({ where }),
    ]);
    return { total, count: items.length, items };
  },

  // -------- BLOG --------
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async query_blog_posts(args: any) {
    const limit = clampLimit(args.limit);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (args.status) where.status = args.status;
    if (args.search) {
      where.OR = [{ title: ci(args.search) }, { content: ci(args.search) }];
    }
    const orderMap: Record<string, object> = {
      newest: { createdAt: "desc" },
      views_desc: { views: "desc" },
    };
    const [items, total] = await Promise.all([
      prisma.post.findMany({
        where, take: limit,
        orderBy: orderMap[args.orderBy] ?? { createdAt: "desc" },
        select: {
          id: true, title: true, slug: true, status: true, views: true,
          publishedAt: true, createdAt: true,
          author: { select: SUMMARY_USER },
          category: { select: { id: true, name: true } },
        },
      }),
      prisma.post.count({ where }),
    ]);
    return { total, count: items.length, items };
  },

  // -------- TAREFAS --------
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async query_tasks(args: any, ctx) {
    const limit = clampLimit(args.limit);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { isArchived: false };
    if (args.priority) {
      const map: Record<string, string> = {
        BAIXA: "LOW", MEDIA: "MEDIUM", ALTA: "HIGH", URGENTE: "URGENT",
      };
      where.priority = map[args.priority] ?? args.priority;
    }
    if (args.status) where.status = args.status;
    if (args.assignee) where.assigneeIds = { has: args.assignee };
    if (args.overdue) {
      where.dueDate = { lt: new Date() };
      where.completedAt = null;
    }
    if (ctx.role === "CORRETOR") where.assigneeIds = { has: ctx.userId };

    const [items, total] = await Promise.all([
      prisma.taskCard.findMany({
        where, take: limit, orderBy: { dueDate: "asc" },
        select: {
          id: true, title: true, description: true,
          priority: true, status: true, dueDate: true,
          progress: true, assigneeIds: true, labels: true,
          column: { select: { id: true, name: true } },
          createdAt: true,
        },
      }),
      prisma.taskCard.count({ where }),
    ]);
    return { total, count: items.length, items };
  },

  // -------- PARCERIAS --------
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async query_partnerships(args: any) {
    const limit = clampLimit(args.limit);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (args.type) where.type = args.type;
    if (args.search) {
      where.OR = [
        { name: ci(args.search) }, { email: ci(args.search) }, { phone: ci(args.search) },
      ];
    }
    const [items, total] = await Promise.all([
      prisma.businessPartner.findMany({
        where, take: limit, orderBy: { createdAt: "desc" },
        select: {
          id: true, name: true, email: true, phone: true,
          type: true, creci: true, creciStatus: true,
          city: true, state: true,
          partnershipFormat: true, partnershipTermStatus: true,
        },
      }),
      prisma.businessPartner.count({ where }),
    ]);
    return { total, count: items.length, items };
  },

  // -------- STORAGE --------
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async query_storage_files(args: any, ctx) {
    if (ctx.role !== "ADMIN" && ctx.role !== "CORRETOR") {
      return { error: "Sem permissão" };
    }
    const limit = clampLimit(args.limit);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { isDeleted: false };
    if (args.search) {
      where.OR = [{ name: ci(args.search) }, { description: ci(args.search) }];
    }
    if (args.mimeContains) where.mimeType = ci(args.mimeContains);
    if (args.folderId) where.folderId = args.folderId;
    const [items, total] = await Promise.all([
      prisma.storageFile.findMany({
        where, take: limit, orderBy: { createdAt: "desc" },
        select: {
          id: true, name: true, key: true, size: true, mimeType: true,
          folderId: true, isPublic: true, createdAt: true,
          createdBy: { select: SUMMARY_USER },
        },
      }),
      prisma.storageFile.count({ where }),
    ]);
    return { total, count: items.length, items };
  },

  // -------- DASHBOARD STATS --------
  async get_dashboard_stats(_args, ctx) {
    const now = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const leadW: any = ctx.role === "CORRETOR" ? { corretorId: ctx.userId } : {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contractW: any = ctx.role === "CORRETOR" ? { corretorId: ctx.userId } : {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const visitW: any = ctx.role === "CORRETOR" ? { corretorId: ctx.userId } : {};

    const [
      properties, propertiesAvailable,
      leads, leadsNew30d, leadsTriagem,
      contracts, contractsAssinados,
      visitsUpcoming,
      users, corretores, fotografos,
      condominiums, partnerships,
      leadsKanban, leadsAcervo, leadsLimbo, temperaturas,
    ] = await Promise.all([
      prisma.property.count(),
      prisma.property.count({ where: { status: "DISPONIVEL" } }),
      prisma.lead.count({ where: leadW }),
      prisma.lead.count({ where: { ...leadW, createdAt: { gte: start } } }),
      prisma.lead.count({ where: { ...leadW, status: "TRIAGEM" } }),
      prisma.contract.count({ where: contractW }),
      prisma.contract.count({ where: { ...contractW, status: "ASSINADO" } }),
      prisma.scheduledVisit.count({
        where: { ...visitW, date: { gte: now }, status: { in: ["AGENDADA", "CONFIRMADA"] } },
      }),
      prisma.user.count(),
      prisma.user.count({ where: { role: "CORRETOR" } }),
      prisma.user.count({ where: { role: "FOTOGRAFO" } }),
      prisma.condominium.count(),
      prisma.businessPartner.count(),
      prisma.lead.count({ where: { AND: [CONDICAO_POR_AREA.kanban, leadW] } }),
      prisma.lead.count({ where: { AND: [CONDICAO_POR_AREA.acervo, leadW] } }),
      prisma.lead.count({ where: { AND: [CONDICAO_POR_AREA.limbo, leadW] } }),
      prisma.lead.groupBy({
        by: ["temperature"],
        where: { AND: [CONDICAO_POR_AREA.kanban, leadW] },
        _count: { _all: true },
      }),
    ]);

    return {
      properties: { total: properties, available: propertiesAvailable },
      leads: {
        total: leads, new30d: leadsNew30d, triagem: leadsTriagem,
        kanban: leadsKanban, acervo: leadsAcervo, limbo: leadsLimbo,
        temperatura_funil_ativo: Object.fromEntries(temperaturas.map((t) => [t.temperature, t._count._all])),
      },
      contracts: { total: contracts, signed: contractsAssinados },
      visits: { upcoming: visitsUpcoming },
      users: { total: users, corretores, fotografos },
      condominiums,
      partnerships,
      scope: ctx.role === "CORRETOR" ? "Apenas meus dados" : "Plataforma toda",
    };
  },

  // -------- DUE DILIGENCE (BuscaImob bridge) --------
  async run_due_diligence(args: any) {
    const baseUrl = process.env.BuscaImob_INTERNAL_URL || "http://localhost:4000";
    const key = process.env.BuscaImob_INTERNAL_KEY || "";

    const doc = String(args.document || "").replace(/\D/g, "");
    const docType = args.documentType === "cnpj" ? "cnpj" : "cpf";

    if (!doc) return { error: "Documento não informado." };
    if (docType === "cpf" && doc.length !== 11) return { error: "CPF inválido — deve ter 11 dígitos." };
    if (docType === "cnpj" && doc.length !== 14) return { error: "CNPJ inválido — deve ter 14 dígitos." };

    const res = await fetch(`${baseUrl}/api/internal/due-diligence`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ document: doc, documentType: docType, matricula: args.matricula || null }),
      signal: AbortSignal.timeout(95_000),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { error: err.error || `Erro BuscaImob (${res.status})` };
    }

    const data = await res.json();
    const result = data.result as any;
    if (!result) return { error: "Due diligence ainda em processamento. Tente novamente em alguns instantes.", queryId: data.queryId, partial: true };

    const summary = result.summary || {};
    const subject = result.subject || {};
    const certs = (result.certificates || []) as any[];

    const alerts = certs.filter((c: any) => c.status === "alert");
    const errors = certs.filter((c: any) => c.status === "error");
    const ok = certs.filter((c: any) => c.status === "ok");

    const pdfPayload = {
      queryId: data.queryId,
      partial: !!data.partial,
      subject: { name: subject.name, document: doc, documentType: docType },
      riskScore: summary.riskScore || "N/A",
      summary: { total: summary.total || certs.length, ok: ok.length, alerts: alerts.length, errors: errors.length },
      alerts: alerts.map((c: any) => ({ name: c.name, source: c.source, details: c.details })),
      enrichment: result.enrichment || null,
      completedAt: result.completedAt || null,
      certificates: certs,
    };

    const pdfUrl = await generateAndUploadDueDiligencePdf(data.queryId, pdfPayload).catch(() => null);

    return {
      ...pdfPayload,
      riskColor: summary.riskColor || "gray",
      pdfUrl: pdfUrl || null,
    };
  },

  // -------- CRECI (BuscaImob bridge) --------
  async search_creci(args: any) {
    const baseUrl = process.env.BuscaImob_INTERNAL_URL || "http://localhost:4000";
    const key = process.env.BuscaImob_INTERNAL_KEY || "";

    const searchQuery = String(args.query || "").trim();
    const searchType = args.searchType === "creci_number" ? "creci_number" : "name";
    const state = String(args.state || "sp").toLowerCase();

    if (!searchQuery) return { error: "Termo de busca não informado." };

    const res = await fetch(`${baseUrl}/api/internal/creci`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ state, searchType, query: searchQuery }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { error: err.error || `Erro BuscaImob CRECI (${res.status})` };
    }

    const data = await res.json();
    const result = data.result as any;
    if (!result) return { error: "Resultado CRECI não disponível.", queryId: data.queryId };

    return {
      queryId: data.queryId,
      broker: result.broker || null,
      contact: result.contact || null,
      details: result.details || null,
    };
  },
};
