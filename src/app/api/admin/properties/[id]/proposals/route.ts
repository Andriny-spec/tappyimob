import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notifyNewProposal } from "@/lib/notifications";

// GET - Listar propostas de um imóvel
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    const isAdmin = session.role === "ADMIN";

    const proposals = await prisma.propertyProposal.findMany({
      where: {
        propertyId: id,
        ...(!isAdmin
          ? {
              OR: [
                { corretorId: session.id },
                { status: "RECUSADA" },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        corretor: { select: { id: true, name: true, avatar: true } },
      },
    });

    // O corretor enxerga as propostas recusadas dos colegas para saber que
    // condição já foi negada — mas não pode saber DE QUEM. A identidade do
    // cliente é removida aqui, no servidor, para não trafegar até o navegador:
    // esconder só na tela deixaria o nome visível em qualquer inspeção.
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

    return NextResponse.json({ proposals: visiveis });
  } catch (error) {
    console.error("Erro ao buscar propostas:", error);
    return NextResponse.json({ error: "Erro ao buscar propostas" }, { status: 500 });
  }
}

// POST - Criar nova proposta
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    const body = await request.json();
    const { 
      purpose,
      clientName, 
      clientEmail,
      leadId,
      originalValue,
      value,
      discountPercent,
      // Campos ALUGUEL
      rentalGuarantee,
      rentalStartDate,
      // Parcelamento Direto
      hasDirectPayment,
      directPaymentOwn,
      directPaymentInstallments,
      hasCorrection,
      correctionDetails,
      // Permuta
      hasPermuta,
      permutaValue,
      permutaType,
      permutaCity,
      permutaNeighborhood,
      permutaAddress,
      permutaBedrooms,
      permutaArea,
      permutaDetails,
      // Financiamento Bancário
      hasBankFinancing,
      bankFinancingOwn,
      bankFinancingValue,
      financingBank,
      // Comissão
      commissionType,
      commissionPercent,
      commissionValue,
      netValueToSeller,
      // Corretor Parceiro
      hasPartnerBroker,
      partnerBrokerName,
      partnerBrokerCreci,
      // Resumo
      scopeSummary,
      notes,
    } = body;

    if (!clientName || !value) {
      return NextResponse.json(
        { error: "Nome do cliente e valor são obrigatórios" },
        { status: 400 }
      );
    }

    const proposal = await prisma.propertyProposal.create({
      data: {
        propertyId: id,
        purpose: purpose || null,
        clientName,
        clientEmail: clientEmail || null,
        leadId: leadId || null,
        originalValue: originalValue || null,
        proposedValue: value,
        discountPercent: discountPercent || null,
        rentalGuarantee: rentalGuarantee || null,
        rentalStartDate: rentalStartDate ? new Date(rentalStartDate) : null,
        // Parcelamento Direto
        hasDirectPayment: hasDirectPayment || false,
        directPaymentOwn: directPaymentOwn || null,
        directPaymentInstallments: directPaymentInstallments || null,
        hasCorrection: hasCorrection || false,
        correctionDetails: correctionDetails || null,
        // Permuta
        hasPermuta: hasPermuta || false,
        permutaValue: permutaValue || null,
        permutaType: permutaType || null,
        permutaCity: permutaCity || null,
        permutaNeighborhood: permutaNeighborhood || null,
        permutaAddress: permutaAddress || null,
        permutaBedrooms: permutaBedrooms || null,
        permutaArea: permutaArea || null,
        permutaDetails: permutaDetails || null,
        // Financiamento Bancário
        hasBankFinancing: hasBankFinancing || false,
        bankFinancingOwn: bankFinancingOwn || null,
        bankFinancingValue: bankFinancingValue || null,
        financingBank: financingBank || null,
        // Comissão
        commissionType: commissionType || null,
        commissionPercent: commissionPercent || null,
        commissionValue: commissionValue || null,
        netValueToSeller: netValueToSeller || null,
        // Corretor Parceiro
        hasPartnerBroker: hasPartnerBroker || false,
        partnerBrokerName: partnerBrokerName || null,
        partnerBrokerCreci: partnerBrokerCreci || null,
        // Resumo
        scopeSummary: scopeSummary || null,
        notes: notes || null,
        status: "PENDENTE",
        corretorId: session.id || null,
      },
      include: {
        corretor: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Sincronizar proposalsCount
    await prisma.property.update({
      where: { id },
      data: { proposalsCount: { increment: 1 } },
    });

    // Notificar admins sobre nova proposta
    try {
      const property = await prisma.property.findUnique({ where: { id }, select: { code: true } });
      const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
      const adminIds = admins.map((a) => a.id);
      if (adminIds.length > 0) {
        await notifyNewProposal(adminIds, clientName, property?.code || id, id, proposal.corretor?.name);
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
