import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET - Buscar popup por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    const popup = await prisma.popupBanner.findUnique({ where: { id } });
    if (!popup) {
      return NextResponse.json({ error: "Pop-up não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ popup });
  } catch (error) {
    console.error("Erro ao buscar popup:", error);
    return NextResponse.json({ error: "Erro ao buscar popup" }, { status: 500 });
  }
}

// PUT - Atualizar popup
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const popup = await prisma.popupBanner.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
        ...(body.imageUrlMobile !== undefined && { imageUrlMobile: body.imageUrlMobile }),
        ...(body.buttonText !== undefined && { buttonText: body.buttonText }),
        ...(body.buttonLink !== undefined && { buttonLink: body.buttonLink }),
        ...(body.popupType !== undefined && { popupType: body.popupType }),
        ...(body.bgColor !== undefined && { bgColor: body.bgColor }),
        ...(body.textColor !== undefined && { textColor: body.textColor }),
        ...(body.overlayOpacity !== undefined && { overlayOpacity: body.overlayOpacity }),
        ...(body.position !== undefined && { position: body.position }),
        ...(body.size !== undefined && { size: body.size }),
        ...(body.triggerType !== undefined && { triggerType: body.triggerType }),
        ...(body.triggerValue !== undefined && { triggerValue: body.triggerValue }),
        ...(body.targetPages !== undefined && { targetPages: body.targetPages }),
        ...(body.excludePages !== undefined && { excludePages: body.excludePages }),
        ...(body.startDate !== undefined && { startDate: body.startDate ? new Date(body.startDate) : null }),
        ...(body.endDate !== undefined && { endDate: body.endDate ? new Date(body.endDate) : null }),
        ...(body.showFrequency !== undefined && { showFrequency: body.showFrequency }),
        ...(body.formFields !== undefined && { formFields: body.formFields }),
        ...(body.formButtonText !== undefined && { formButtonText: body.formButtonText }),
        ...(body.clicksToShow !== undefined && { clicksToShow: body.clicksToShow }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.order !== undefined && { order: body.order }),
      },
    });

    return NextResponse.json({ popup });
  } catch (error) {
    console.error("Erro ao atualizar popup:", error);
    return NextResponse.json({ error: "Erro ao atualizar popup" }, { status: 500 });
  }
}

// DELETE - Excluir popup
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.popupBanner.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir popup:", error);
    return NextResponse.json({ error: "Erro ao excluir popup" }, { status: 500 });
  }
}
