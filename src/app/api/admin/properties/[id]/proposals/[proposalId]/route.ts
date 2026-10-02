import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET - Buscar proposta específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; proposalId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id, proposalId } = await params;

    const isAdmin = session.role === "ADMIN";

    const proposal = await prisma.propertyProposal.findFirst({
      where: { 
        id: proposalId,
        propertyId: id,
      },
    });

    if (!proposal) {
      return NextResponse.json({ error: "Proposta não encontrada" }, { status: 404 });
    }

    // Corretor só vê proposta própria ou RECUSADA
    if (!isAdmin && proposal.corretorId !== session.id && proposal.status !== "RECUSADA") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    return NextResponse.json({ proposal });
  } catch (error) {
    console.error("Erro ao buscar proposta:", error);
    return NextResponse.json({ error: "Erro ao buscar proposta" }, { status: 500 });
  }
}

// PATCH - Atualizar proposta (status, etc)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; proposalId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id, proposalId } = await params;
    const body = await request.json();

    const isAdmin = session.role === "ADMIN";

    // Verificar se a proposta existe
    const existingProposal = await prisma.propertyProposal.findFirst({
      where: { 
        id: proposalId,
        propertyId: id,
      },
    });

    if (!existingProposal) {
      return NextResponse.json({ error: "Proposta não encontrada" }, { status: 404 });
    }

    // Corretor só edita proposta própria
    if (!isAdmin && existingProposal.corretorId !== session.id) {
      return NextResponse.json({ error: "Sem permissão para editar esta proposta" }, { status: 403 });
    }

    // Campos permitidos para atualização
    const allowedFields = [
      "status", "notes", "proposedValue", "counterProposal", "counterOfferDetails",
      "purpose", "clientName", "clientEmail", "clientCpf", "leadId",
      "originalValue", "discountPercent",
      "rentalGuarantee", "rentalStartDate",
      "hasDirectPayment", "directPaymentOwn", "directPaymentInstallments",
      "hasCorrection", "correctionDetails",
      "hasPermuta", "permutaValue", "permutaType", "permutaCity",
      "permutaNeighborhood", "permutaAddress", "permutaBedrooms", "permutaArea", "permutaDetails",
      "hasBankFinancing", "bankFinancingOwn", "bankFinancingValue", "financingBank",
      "commissionType", "commissionPercent", "commissionValue", "netValueToSeller",
      "hasPartnerBroker", "partnerBrokerName", "partnerBrokerCreci",
      "scopeSummary",
    ];

    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }
    // Mapear value → proposedValue se enviado pelo frontend
    if (body.value !== undefined && body.proposedValue === undefined) {
      updateData.proposedValue = body.value;
    }
    if (body.rentalStartDate) {
      updateData.rentalStartDate = new Date(body.rentalStartDate);
    }

    const proposal = await prisma.propertyProposal.update({
      where: { id: proposalId },
      data: updateData,
      include: {
        corretor: { select: { id: true, name: true, avatar: true } },
      },
    });

    return NextResponse.json({ proposal });
  } catch (error) {
    console.error("Erro ao atualizar proposta:", error);
    return NextResponse.json({ error: "Erro ao atualizar proposta" }, { status: 500 });
  }
}

// DELETE - Excluir proposta
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; proposalId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id, proposalId } = await params;

    const isAdminDel = session.role === "ADMIN";

    // Verificar se a proposta existe
    const existingProposal = await prisma.propertyProposal.findFirst({
      where: { 
        id: proposalId,
        propertyId: id,
      },
    });

    if (!existingProposal) {
      return NextResponse.json({ error: "Proposta não encontrada" }, { status: 404 });
    }

    // Corretor só deleta proposta própria
    if (!isAdminDel && existingProposal.corretorId !== session.id) {
      return NextResponse.json({ error: "Sem permissão para excluir esta proposta" }, { status: 403 });
    }

    await prisma.propertyProposal.delete({
      where: { id: proposalId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir proposta:", error);
    return NextResponse.json({ error: "Erro ao excluir proposta" }, { status: 500 });
  }
}
