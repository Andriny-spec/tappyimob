import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Cadastro público de parceiro (via site /corretor-parceiro)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validação
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }
    if (!body.phone && !body.email) {
      return NextResponse.json({ error: "Telefone ou e-mail é obrigatório" }, { status: 400 });
    }

    const type = body.type || "CORRETOR";

    // Buscar funil default para o tipo de parceiro e sua primeira etapa (order=0)
    const funnel = await prisma.partnerFunnel.findFirst({
      where: {
        isActive: true,
        isDefault: true,
        partnerTypes: { has: type },
      },
      include: {
        stages: { orderBy: { order: "asc" }, take: 1 },
      },
    });

    // Fallback: pega qualquer funil ativo compatível, se não houver default
    const funnelFallback =
      funnel ||
      (await prisma.partnerFunnel.findFirst({
        where: { isActive: true, partnerTypes: { has: type } },
        include: { stages: { orderBy: { order: "asc" }, take: 1 } },
      }));

    const initialStage = funnelFallback?.stages?.[0] ?? null;

    const partner = await prisma.businessPartner.create({
      data: {
        type,
        name: body.name.trim(),
        email: body.email?.trim() || null,
        phone: body.phone?.trim() || null,
        creci: body.creci?.trim() || null,
        creciStatus: "ATIVO",
        partnershipFormat: body.partnershipFormat || "CAPTADOR",
        partnershipTermStatus: "SEM_CONTRATO",
        isAutonomous: true,
        tags: Array.from(
          new Set(["CADASTRO_SITE", ...(Array.isArray(body.tags) ? body.tags : [])])
        ),
        funnelStageId: initialStage?.id ?? null,
        stageEnteredAt: initialStage ? new Date() : null,
      },
    });

    // Atividade de cadastro
    await prisma.businessPartnerActivity.create({
      data: {
        partnerId: partner.id,
        type: "CADASTRO",
        description: `Parceiro ${partner.name} cadastrado via site${
          initialStage ? ` · Etapa: ${initialStage.name}` : ""
        }`,
      },
    });

    // Registrar movimento inicial no funil (para histórico)
    if (initialStage) {
      await prisma.partnerStageMovement.create({
        data: {
          partnerId: partner.id,
          toStageId: initialStage.id,
          reason: "Cadastro via site",
          isAutomatic: true,
        },
      });
    }

    // Notificar admins (non-blocking)
    (async () => {
      try {
        const admins = await prisma.user.findMany({
          where: { role: "ADMIN", isActive: true },
          select: { id: true },
        });
        await prisma.notification.createMany({
          data: admins.map((u) => ({
            userId: u.id,
            type: "new_partner",
            title: "🤝 Novo parceiro cadastrado",
            message: `${partner.name} fez cadastro via site`,
            link: `/admin/parcerias/${partner.id}`,
            read: false,
          })),
        });
      } catch (err) {
        console.error("Erro ao notificar sobre novo parceiro:", err);
      }
    })();

    return NextResponse.json(
      { success: true, partner: { id: partner.id, name: partner.name } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao cadastrar parceiro via site:", error);
    return NextResponse.json({ error: "Erro ao enviar cadastro. Tente novamente." }, { status: 500 });
  }
}
