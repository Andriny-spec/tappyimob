import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar duplicados pendentes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "PENDING";

    const duplicates = await prisma.leadDuplicate.findMany({
      where: { status },
      orderBy: { createdAt: "desc" },
    });

    // Buscar dados dos leads envolvidos
    const leadIds = new Set<string>();
    duplicates.forEach((d) => {
      leadIds.add(d.leadId1);
      leadIds.add(d.leadId2);
    });

    const leads = await prisma.lead.findMany({
      where: { id: { in: Array.from(leadIds) } },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        corretor: { select: { id: true, name: true } },
      },
    });

    const leadsMap = new Map(leads.map((l) => [l.id, l]));

    const enrichedDuplicates = duplicates.map((d) => ({
      ...d,
      lead1: leadsMap.get(d.leadId1),
      lead2: leadsMap.get(d.leadId2),
    }));

    return NextResponse.json({ duplicates: enrichedDuplicates });
  } catch (error) {
    console.error("Erro ao buscar duplicados:", error);
    return NextResponse.json({ error: "Erro ao buscar duplicados" }, { status: 500 });
  }
}

// POST - Detectar duplicados para um lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId, checkAll } = body;

    let leadsToCheck: any[] = [];

    if (checkAll) {
      // Verificar todos os leads
      leadsToCheck = await prisma.lead.findMany({
        select: { id: true, name: true, email: true, phone: true, cpf: true, corretorId: true },
        orderBy: { createdAt: "asc" },
      });
    } else if (leadId) {
      // Verificar apenas um lead específico
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        select: { id: true, name: true, email: true, phone: true, cpf: true, corretorId: true },
      });
      if (!lead) {
        return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
      }
      leadsToCheck = [lead];
    } else {
      return NextResponse.json({ error: "leadId ou checkAll é obrigatório" }, { status: 400 });
    }

    const allLeads = await prisma.lead.findMany({
      select: { id: true, name: true, email: true, phone: true, cpf: true, corretorId: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const duplicatesFound: any[] = [];

    for (const lead of leadsToCheck) {
      for (const other of allLeads) {
        if (lead.id === other.id) continue;
        if (lead.id > other.id) continue; // Evitar duplicatas invertidas

        let matchType = null;
        let matchScore = 0;

        // Verificar telefone (normalizado)
        const phone1 = lead.phone?.replace(/\D/g, "");
        const phone2 = other.phone?.replace(/\D/g, "");
        if (phone1 && phone2 && phone1 === phone2) {
          matchType = "PHONE";
          matchScore = 100;
        }

        // Verificar email
        if (!matchType && lead.email && other.email && lead.email.toLowerCase() === other.email.toLowerCase()) {
          matchType = "EMAIL";
          matchScore = 100;
        }

        // Verificar CPF
        if (!matchType && lead.cpf && other.cpf) {
          const cpf1 = lead.cpf.replace(/\D/g, "");
          const cpf2 = other.cpf.replace(/\D/g, "");
          if (cpf1 === cpf2) {
            matchType = "CPF";
            matchScore = 100;
          }
        }

        // Verificar nome similar + telefone parcial
        if (!matchType && lead.name && other.name) {
          const name1 = lead.name.toLowerCase().trim();
          const name2 = other.name.toLowerCase().trim();
          if (name1 === name2 && phone1 && phone2 && phone1.slice(-8) === phone2.slice(-8)) {
            matchType = "NAME_PHONE";
            matchScore = 90;
          }
        }

        if (matchType) {
          // Verificar se já existe esse par
          const existing = await prisma.leadDuplicate.findUnique({
            where: {
              leadId1_leadId2: {
                leadId1: lead.id < other.id ? lead.id : other.id,
                leadId2: lead.id < other.id ? other.id : lead.id,
              },
            },
          });

          if (!existing) {
            const duplicate = await prisma.leadDuplicate.create({
              data: {
                leadId1: lead.id < other.id ? lead.id : other.id,
                leadId2: lead.id < other.id ? other.id : lead.id,
                matchType,
                matchScore,
                corretor1Id: lead.corretorId,
                corretor2Id: other.corretorId,
              },
            });
            duplicatesFound.push(duplicate);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      found: duplicatesFound.length,
      duplicates: duplicatesFound,
    });
  } catch (error) {
    console.error("Erro ao detectar duplicados:", error);
    return NextResponse.json({ error: "Erro ao detectar duplicados" }, { status: 500 });
  }
}

// PUT - Resolver duplicado
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, resolution, mergeToLeadId } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "id e status são obrigatórios" }, { status: 400 });
    }

    const duplicate = await prisma.leadDuplicate.findUnique({ where: { id } });
    if (!duplicate) {
      return NextResponse.json({ error: "Duplicado não encontrado" }, { status: 404 });
    }

    if (status === "MERGED" && mergeToLeadId) {
      // Mesclar leads - manter o escolhido e arquivar o outro
      const leadToArchive = mergeToLeadId === duplicate.leadId1 ? duplicate.leadId2 : duplicate.leadId1;

      await prisma.lead.update({
        where: { id: leadToArchive },
        data: {
          status: "ARQUIVADO",
          archivedAt: new Date(),
          archivedReason: `Mesclado com lead ${mergeToLeadId}`,
          archivedCategory: "duplicado",
        },
      });
    }

    const updated = await prisma.leadDuplicate.update({
      where: { id },
      data: {
        status,
        resolution,
        resolvedAt: new Date(),
      },
    });

    return NextResponse.json({ duplicate: updated });
  } catch (error) {
    console.error("Erro ao resolver duplicado:", error);
    return NextResponse.json({ error: "Erro ao resolver duplicado" }, { status: 500 });
  }
}
