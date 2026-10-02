import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET - Buscar item do radar por ID
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

    const item = await (prisma.captacaoRadar as any).findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json({ error: "Item não encontrado" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("Erro ao buscar radar:", error);
    return NextResponse.json(
      { error: "Erro ao buscar radar" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar item do radar
export async function PUT(
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

    // Se estiver atribuindo a alguém
    const assignData: any = {};
    if (body.assignToMe) {
      assignData.assignedToId = session.user.id;
      assignData.assignedToName = session.user.name;
      assignData.assignedAt = new Date();
    } else if (body.assignedToId !== undefined) {
      assignData.assignedToId = body.assignedToId;
      assignData.assignedToName = body.assignedToName;
      assignData.assignedAt = body.assignedToId ? new Date() : null;
    }

    const item = await (prisma.captacaoRadar as any).update({
      where: { id },
      data: {
        titulo: body.titulo,
        descricao: body.descricao,
        condominio: body.condominio,
        condominiumId: body.condominiumId,
        condoType: body.condoType,
        torre: body.torre,
        apartamento: body.apartamento,
        origem: body.origem,
        origemUrl: body.origemUrl,
        origemNotes: body.origemNotes,
        address: body.address,
        number: body.number,
        neighborhood: body.neighborhood,
        city: body.city,
        state: body.state,
        reference: body.reference,
        images: body.images,
        tipoImovel: body.tipoImovel,
        precoEstimado: body.precoEstimado,
        areaEstimada: body.areaEstimada,
        status: body.status,
        priority: body.priority,
        contactAttempts: body.contactAttempts,
        lastContactAt: body.lastContactAt ? new Date(body.lastContactAt) : undefined,
        contactHistory: body.contactHistory,
        capturedPropertyId: body.capturedPropertyId,
        capturedAt: body.capturedAt ? new Date(body.capturedAt) : undefined,
        ...assignData,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Erro ao atualizar radar:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar radar" },
      { status: 500 }
    );
  }
}

// DELETE - Remover item do radar
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    await (prisma.captacaoRadar as any).delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar radar:", error);
    return NextResponse.json(
      { error: "Erro ao deletar radar" },
      { status: 500 }
    );
  }
}
