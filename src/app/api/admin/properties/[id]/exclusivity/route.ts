import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Checklist padrão de exclusividade (Onboarding)
const DEFAULT_CHECKLIST = {
  // Documentação
  contrato_assinado: false,
  prazo_definido: false,
  documentos_imovel: false,
  // Marketing
  fotos_profissionais: false,
  video_drone: false,
  tour_virtual: false,
  descricao_premium: false,
  // Divulgação
  destaque_site: false,
  destaque_portais: false,
  redes_sociais: false,
  email_marketing: false,
  // Offline
  placa_exclusiva: false,
  // Gestão
  relatorio_configurado: false,
  feedback_visitas: false,
  avaliacao_mercado: false,
};

// GET - Buscar dados de exclusividade
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const exclusivity = await prisma.propertyExclusivity.findUnique({
      where: { propertyId: id },
    });

    // Buscar dados do imóvel para contexto
    const property = await prisma.property.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        title: true,
        price: true,
        category: true,
        propertyOwner: {
          select: {
            id: true,
            name: true,
            email: true,
            phones: true,
          },
        },
      },
    });

    // Se não existe exclusividade, retornar estrutura vazia
    if (!exclusivity) {
      return NextResponse.json({
        exclusivity: null,
        checklist: DEFAULT_CHECKLIST,
        progress: 0,
        property,
        daysRemaining: null,
        isExpiring: false,
        isExpired: false,
      });
    }

    // Calcular progresso do checklist
    const checklist = (exclusivity.checklist as Record<string, boolean>) || DEFAULT_CHECKLIST;
    const completed = Object.values(checklist).filter(Boolean).length;
    const total = Object.keys(DEFAULT_CHECKLIST).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Calcular dias restantes e alertas
    let daysRemaining = null;
    let isExpiring = false;
    let isExpired = false;

    if (exclusivity.endDate) {
      const now = new Date();
      const end = new Date(exclusivity.endDate);
      const diffTime = end.getTime() - now.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      isExpiring = daysRemaining <= 15 && daysRemaining > 0;
      isExpired = daysRemaining <= 0;
    }

    return NextResponse.json({
      exclusivity,
      checklist,
      progress,
      completed,
      total,
      property,
      daysRemaining,
      isExpiring,
      isExpired,
    });
  } catch (error) {
    console.error("Erro ao buscar exclusividade:", error);
    return NextResponse.json(
      { error: "Erro ao buscar exclusividade" },
      { status: 500 }
    );
  }
}

// POST - Criar/Atualizar exclusividade completa
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      checklist,
      startDate,
      endDate,
      captadorId,
      captadorName,
      gestorId,
      gestorName,
      comissaoVenda,
      comissaoLocacao,
      valorMinimo,
      condicoesEspeciais,
      frequenciaRelatorio,
      notes,
      status,
      // Mídias de exposição (opcionais)
      midiaFotosProf,
      midiaVideoProf,
      midiaNowHouse,
      midiaNowHouseDate,
      midiaOpenHouse,
      midiaOpenHouseDate,
    } = body;

    const midiaFields = {
      ...(midiaFotosProf !== undefined ? { midiaFotosProf: !!midiaFotosProf } : {}),
      ...(midiaVideoProf !== undefined ? { midiaVideoProf: !!midiaVideoProf } : {}),
      ...(midiaNowHouse !== undefined ? { midiaNowHouse: !!midiaNowHouse } : {}),
      ...(midiaNowHouseDate !== undefined ? { midiaNowHouseDate: midiaNowHouseDate ? new Date(midiaNowHouseDate) : null } : {}),
      ...(midiaOpenHouse !== undefined ? { midiaOpenHouse: !!midiaOpenHouse } : {}),
      ...(midiaOpenHouseDate !== undefined ? { midiaOpenHouseDate: midiaOpenHouseDate ? new Date(midiaOpenHouseDate) : null } : {}),
    };

    const exclusivity = await prisma.propertyExclusivity.upsert({
      where: { propertyId: id },
      create: {
        propertyId: id,
        checklist: checklist || DEFAULT_CHECKLIST,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        captadorId,
        captadorName,
        gestorId,
        gestorName,
        comissaoVenda,
        comissaoLocacao,
        valorMinimo,
        condicoesEspeciais,
        frequenciaRelatorio,
        notes,
        status: status || "ATIVA",
        ...midiaFields,
      },
      update: {
        checklist,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        captadorId,
        captadorName,
        gestorId,
        gestorName,
        comissaoVenda,
        comissaoLocacao,
        valorMinimo,
        condicoesEspeciais,
        frequenciaRelatorio,
        notes,
        status,
        ...midiaFields,
      },
    });

    // Marcar imóvel como exclusividade de terceiros
    const propBeforeExcl = await prisma.property.findUnique({ where: { id }, select: { updatedAt: true } });
    await prisma.property.update({
      where: { id },
      data: { isThirdPartyExclusive: true },
    });
    if (propBeforeExcl) await prisma.$executeRaw`UPDATE "properties" SET "updatedAt" = ${propBeforeExcl.updatedAt} WHERE "id" = ${id}`;

    return NextResponse.json({ exclusivity });
  } catch (error) {
    console.error("Erro ao salvar exclusividade:", error);
    return NextResponse.json(
      { error: "Erro ao salvar exclusividade" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar item do checklist ou campo específico
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { key, value, field, fieldValue } = body;

    // Buscar exclusividade atual
    let exclusivity = await prisma.propertyExclusivity.findUnique({
      where: { propertyId: id },
    });

    // Se não existe, criar
    if (!exclusivity) {
      const createData: any = {
        propertyId: id,
        checklist: key ? { ...DEFAULT_CHECKLIST, [key]: value } : DEFAULT_CHECKLIST,
      };
      if (field) createData[field] = fieldValue;

      exclusivity = await prisma.propertyExclusivity.create({
        data: createData,
      });
      // Marcar imóvel como exclusividade de terceiros
      const propBeforeExcl2 = await prisma.property.findUnique({ where: { id }, select: { updatedAt: true } });
      await prisma.property.update({
        where: { id },
        data: { isThirdPartyExclusive: true },
      });
      if (propBeforeExcl2) await prisma.$executeRaw`UPDATE "properties" SET "updatedAt" = ${propBeforeExcl2.updatedAt} WHERE "id" = ${id}`;
    } else {
      // Atualizar
      const updateData: any = {};
      
      if (key !== undefined) {
        const currentChecklist = (exclusivity.checklist as Record<string, boolean>) || DEFAULT_CHECKLIST;
        updateData.checklist = { ...currentChecklist, [key]: value };
      }
      
      if (field !== undefined) {
        updateData[field] = fieldValue;
      }

      exclusivity = await prisma.propertyExclusivity.update({
        where: { propertyId: id },
        data: updateData,
      });
    }

    return NextResponse.json({ exclusivity });
  } catch (error) {
    console.error("Erro ao atualizar exclusividade:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar exclusividade" },
      { status: 500 }
    );
  }
}
