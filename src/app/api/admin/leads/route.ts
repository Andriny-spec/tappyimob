import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { detectDuplicatesForLead } from "@/lib/detect-duplicates";
import { LeadStatus } from "@prisma/client";

// GET - Listar todos os leads com filtros
export async function GET(request: NextRequest) {
  try {
    // Auth: exigir sessão válida; corretores só podem ver seus próprios leads
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const isCorretor = session.role === "CORRETOR";

    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get("status") as LeadStatus | null;
    const statusIn = searchParams.getAll("statusIn");
    // Se é corretor, FORÇAR seu próprio ID (ignora qualquer corretorId da query)
    const corretorId = isCorretor ? session.id : searchParams.get("corretorId");
    const corretorName = searchParams.get("corretorName");
    const search = searchParams.get("search");
    const minScore = searchParams.get("minScore");
    const maxScore = searchParams.get("maxScore");
    const tags = searchParams.getAll("tags");
    const overdue = searchParams.get("overdue");
    const excludeStatus = searchParams.getAll("excludeStatus");
    const source = searchParams.get("source");
    const sourceIn = searchParams.getAll("sourceIn");
    const temperature = searchParams.get("temperature");
    const temperatureIn = searchParams.getAll("temperatureIn");
    const hasCorretor = searchParams.get("hasCorretor");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const utm = searchParams.get("utm");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = {};

    if (status) {
      where.status = status;
    } else if (statusIn.length > 0) {
      where.status = { in: statusIn as LeadStatus[] };
    }
    if (excludeStatus.length > 0 && !status && statusIn.length === 0) {
      where.status = { notIn: excludeStatus as LeadStatus[] };
    }
    if (corretorId) {
      where.corretorId = corretorId;
    } else if (corretorName) {
      where.corretor = { name: { contains: corretorName, mode: "insensitive" } };
    }
    if (hasCorretor === "true") where.corretorId = { not: null };
    if (hasCorretor === "false") where.corretorId = null;
    if (source) where.source = source;
    if (sourceIn.length > 0) where.source = { in: sourceIn };
    if (temperature) where.temperature = temperature;
    if (temperatureIn.length > 0) where.temperature = { in: temperatureIn };
    if (minScore) where.score = { ...where.score, gte: parseInt(minScore) };
    if (maxScore) where.score = { ...where.score, lte: parseInt(maxScore) };
    if (tags.length > 0) where.tags = { hasSome: tags };
    // Origem de campanha: um termo só varre origem, mídia e campanha, porque
    // na prática se busca "google" ou o nome da campanha sem saber em qual dos
    // campos o valor caiu. Parcial e sem diferenciar maiúsculas — os nomes de
    // campanha variam muito ("Black-Novembro" vs "black_novembro").
    if (utm) {
      const contem = { contains: utm, mode: "insensitive" as const };
      where.AND = where.AND || [];
      where.AND.push({
        OR: [
          { utmSource: contem },
          { utmMedium: contem },
          { utmCampaign: contem },
          { utmContent: contem },
          { utmTerm: contem },
        ],
      });
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo + "T23:59:59.999Z");
    }
    
    // Filtro para leads atrasados no follow-up
    // Leads que não estão fechados/perdidos e têm lastContact antigo
    if (overdue === "true") {
      where.status = { notIn: ["FECHADO", "PERDIDO"] };
      // Leads com último contato há mais de 2 dias (para quentes seria atrasado)
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      where.OR = [
        { lastContact: { lt: twoDaysAgo } },
        { lastContact: null },
      ];
    }
    
    if (search) {
      // Limpar busca para detectar se é telefone ou CPF
      const cleanSearch = search.replace(/\D/g, "");
      const isPhoneOrCpf = cleanSearch.length >= 8 && /^\d+$/.test(cleanSearch);
      
      where.AND = where.AND || [];
      where.AND.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
          // Busca por telefone/CPF limpo (sem formatação)
          ...(isPhoneOrCpf ? [
            { phone: { contains: cleanSearch } },
            { cpf: { contains: cleanSearch } },
          ] : []),
        ],
      });
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
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
          notes: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
          schedules: {
            where: { completed: false, cancelled: false },
            orderBy: { date: "asc" },
          },
          linkedProperties: {
            select: { type: true },
          },
          scheduledVisits: {
            select: { id: true },
          },
          _count: {
            select: {
              notes: true,
              schedules: true,
              contracts: true,
              linkedProperties: true,
              scheduledVisits: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ]);

    // Enriquecer leads com counts de linkedProperties por tipo
    const enrichedLeads = leads.map((lead) => {
      const lp = (lead as any).linkedProperties || [];
      const linkedPropertiesCount = {
        enviados: lp.filter((p: any) => p.type === "ENVIADO").length,
        visitados: lp.filter((p: any) => p.type === "VISITADO").length,
        propostas: lp.filter((p: any) => p.type === "PROPOSTA").length,
        comprados: lp.filter((p: any) => p.type === "COMPRADO").length,
      };
      const scheduledVisitsCount = (lead as any).scheduledVisits?.length || (lead as any)._count?.scheduledVisits || 0;
      return { ...lead, linkedPropertiesCount, scheduledVisitsCount };
    });

    // Agrupar por status para o Kanban
    const grouped = enrichedLeads.reduce((acc, lead) => {
      if (!acc[lead.status]) acc[lead.status] = [];
      acc[lead.status].push(lead);
      return acc;
    }, {} as Record<string, typeof enrichedLeads>);

    return NextResponse.json({
      leads: enrichedLeads,
      grouped,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Erro ao buscar leads" },
      { status: 500 }
    );
  }
}

// POST - Criar novo lead
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();

    // Sanitize: empty strings to null for optional/FK fields
    const clean = (v: any) => (typeof v === "string" && v.trim() === "") ? null : v;

    // Se o criador é CORRETOR, forçar corretorId = session.id (auto-vincular)
    // Se ADMIN/SDR, usar o corretorId fornecido pelo formulário
    const resolvedCorretorId = session?.role === "CORRETOR"
      ? session.id
      : clean(body.corretorId);

    const fullName = body.name?.trim() || "Sem nome";
    const autoNickname = body.nickname?.trim() || fullName.split(" ")[0] || fullName;

    const lead = await prisma.lead.create({
      data: {
        name: fullName,
        nickname: autoNickname,
        email: clean(body.email),
        phone: clean(body.phone),
        message: clean(body.message),
        status: "NOVO",
        source: body.source || "SITE",
        budget: body.budget || undefined,
        minBudget: body.minBudget || undefined,
        maxBudget: body.maxBudget || undefined,
        tags: body.tags || [],
        propertyId: clean(body.propertyId),
        corretorId: resolvedCorretorId,
        createdById: session?.id || null,
        score: body.score || 50,
        probability: body.probability || 50,
        ticket: clean(body.ticket),
        profile: clean(body.profile),
        hasPermuta: body.hasPermuta || false,
        permutaValue: body.permutaValue || undefined,
        permutaLocation: clean(body.permutaLocation),
        // Dados pessoais do cliente
        cpf: clean(body.cpf),
        rg: clean(body.rg),
        birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
        maritalStatus: clean(body.maritalStatus),
        profession: clean(body.profession),
        // Endereço do cliente
        address: clean(body.address),
        number: clean(body.number),
        complement: clean(body.complement),
        neighborhood: clean(body.neighborhood),
        city: clean(body.city),
        state: clean(body.state),
        zipCode: clean(body.zipCode),
        // Condomínios de interesse
        condominiumsOfInterest: body.condominiumsOfInterest || [],
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

    // Detectar duplicados automaticamente (non-blocking)
    detectDuplicatesForLead(lead.id).catch(() => {});

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: "Erro ao criar lead" },
      { status: 500 }
    );
  }
}
