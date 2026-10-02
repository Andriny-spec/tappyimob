import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notifyNewProposal } from "@/lib/notifications";

// GET - Listar propostas de todos os imóveis (visão agregada por leads/corretor)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const corretorId = searchParams.get("corretorId");
    const propertyId = searchParams.get("propertyId");
    const createdFrom = searchParams.get("createdFrom");
    const createdTo = searchParams.get("createdTo");
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");

    const isAdmin = session.role === "ADMIN";

    const where: any = {
      ...(!isAdmin
        ? { OR: [{ corretorId: session.id }, { status: "RECUSADA" }] }
        : {}),
    };

    if (status) where.status = status;
    if (corretorId) where.corretorId = corretorId;
    if (propertyId) where.propertyId = propertyId;
    if (createdFrom || createdTo) {
      where.createdAt = {};
      if (createdFrom) where.createdAt.gte = new Date(createdFrom);
      if (createdTo) where.createdAt.lte = new Date(createdTo + "T23:59:59");
    }
    if (search) {
      const searchOR = [
        { clientName: { contains: search, mode: "insensitive" } },
        { property: { title: { contains: search, mode: "insensitive" } } },
        { property: { code: { contains: search, mode: "insensitive" } } },
      ];
      // Já existe um OR de visibilidade (corretor não-admin); combinar com AND
      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: searchOR }];
        delete where.OR;
      } else {
        where.OR = searchOR;
      }
    }

    const [proposals, total, statusGroups] = await Promise.all([
      prisma.propertyProposal.findMany({
        where,
        include: {
          property: { select: { id: true, code: true, title: true } },
          corretor: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.propertyProposal.count({ where }),
      prisma.propertyProposal.groupBy({
        by: ["status"],
        where,
        _count: { id: true },
      }),
    ]);

    const statusCounts = statusGroups.reduce((acc: Record<string, number>, g) => {
      acc[g.status] = g._count.id;
      return acc;
    }, {});

    // Mesma regra da listagem por imóvel: o corretor vê a proposta recusada do
    // colega para conhecer a condição negada, nunca a identidade do cliente.
    const visiveis = isAdmin
      ? proposals
      : proposals.map((p) =>
          p.corretorId === session.id
            ? p
            : {
                ...p,
                clientName: "Cliente de outro corretor",
                clientEmail: null,
                clientCpf: null,
                leadId: null,
              }
        );

    return NextResponse.json({
      proposals: visiveis,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      statusCounts,
    });
  } catch (error) {
    console.error("Erro ao listar propostas:", error);
    return NextResponse.json({ error: "Erro ao listar propostas" }, { status: 500 });
  }
}

// POST - Criar nova proposta (imóvel escolhido no formulário, não pela URL)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      propertyId,
      corretorId,
      purpose,
      clientName,
      clientEmail,
      leadId,
      originalValue,
      value,
      discountPercent,
      rentalGuarantee,
      rentalStartDate,
      hasDirectPayment,
      directPaymentOwn,
      directPaymentInstallments,
      hasCorrection,
      correctionDetails,
      hasPermuta,
      permutaValue,
      permutaType,
      permutaCity,
      permutaNeighborhood,
      permutaAddress,
      permutaBedrooms,
      permutaArea,
      permutaDetails,
      hasBankFinancing,
      bankFinancingOwn,
      bankFinancingValue,
      financingBank,
      commissionType,
      commissionPercent,
      commissionValue,
      netValueToSeller,
      hasPartnerBroker,
      partnerBrokerName,
      partnerBrokerCreci,
      scopeSummary,
      notes,
    } = body;

    if (!propertyId) {
      return NextResponse.json({ error: "Selecione o imóvel" }, { status: 400 });
    }
    if (!clientName || !value) {
      return NextResponse.json(
        { error: "Nome do cliente e valor são obrigatórios" },
        { status: 400 }
      );
    }

    const isAdmin = session.role === "ADMIN";
    const finalCorretorId = isAdmin && corretorId ? corretorId : session.id;

    const proposal = await prisma.propertyProposal.create({
      data: {
        propertyId,
        purpose: purpose || null,
        clientName,
        clientEmail: clientEmail || null,
        leadId: leadId || null,
        originalValue: originalValue || null,
        proposedValue: value,
        discountPercent: discountPercent || null,
        rentalGuarantee: rentalGuarantee || null,
        rentalStartDate: rentalStartDate ? new Date(rentalStartDate) : null,
        hasDirectPayment: hasDirectPayment || false,
        directPaymentOwn: directPaymentOwn || null,
        directPaymentInstallments: directPaymentInstallments || null,
        hasCorrection: hasCorrection || false,
        correctionDetails: correctionDetails || null,
        hasPermuta: hasPermuta || false,
        permutaValue: permutaValue || null,
        permutaType: permutaType || null,
        permutaCity: permutaCity || null,
        permutaNeighborhood: permutaNeighborhood || null,
        permutaAddress: permutaAddress || null,
        permutaBedrooms: permutaBedrooms || null,
        permutaArea: permutaArea || null,
        permutaDetails: permutaDetails || null,
        hasBankFinancing: hasBankFinancing || false,
        bankFinancingOwn: bankFinancingOwn || null,
        bankFinancingValue: bankFinancingValue || null,
        financingBank: financingBank || null,
        commissionType: commissionType || null,
        commissionPercent: commissionPercent || null,
        commissionValue: commissionValue || null,
        netValueToSeller: netValueToSeller || null,
        hasPartnerBroker: hasPartnerBroker || false,
        partnerBrokerName: partnerBrokerName || null,
        partnerBrokerCreci: partnerBrokerCreci || null,
        scopeSummary: scopeSummary || null,
        notes: notes || null,
        status: "PENDENTE",
        corretorId: finalCorretorId || null,
      },
      include: {
        property: { select: { id: true, code: true, title: true } },
        corretor: { select: { id: true, name: true, avatar: true } },
      },
    });

    await prisma.property.update({
      where: { id: propertyId },
      data: { proposalsCount: { increment: 1 } },
    });

    try {
      const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
      const adminIds = admins.map((a) => a.id);
      if (adminIds.length > 0) {
        await notifyNewProposal(adminIds, clientName, proposal.property.code, propertyId, proposal.corretor?.name);
      }
    } catch (e) {
      console.error("Erro ao notificar admins:", e);
    }

    return NextResponse.json({ proposal }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar proposta:", error);
    return NextResponse.json({ error: "Erro ao criar proposta" }, { status: 500 });
  }
}
