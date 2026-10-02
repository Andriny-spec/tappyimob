import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT /api/admin/tappy-summit/follow-ups/[id] - Update follow-up
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const followUp = await prisma.eventFollowUp.update({
      where: { id },
      data: {
        name: body.name,
        delayHours: body.delayHours,
        delayType: body.delayType,
        sortOrder: body.sortOrder,
        whatsappEnabled: body.whatsappEnabled,
        whatsappMessage: body.whatsappMessage,
        whatsappMediaUrl: body.whatsappMediaUrl ?? null,
        whatsappMediaType: body.whatsappMediaType ?? null,
        emailEnabled: body.emailEnabled,
        emailSubject: body.emailSubject,
        emailBody: body.emailBody,
        active: body.active,
      },
    });

    // Update scheduled dates for pending logs if delayHours changed
    if (body.delayHours !== undefined) {
      const logs = await prisma.eventFollowUpLog.findMany({
        where: {
          followUpId: id,
          whatsappSent: false,
          emailSent: false,
        },
        include: { registration: { select: { createdAt: true } } },
      });

      for (const log of logs) {
        const newScheduledFor = new Date(
          log.registration.createdAt.getTime() + (body.delayHours ?? 0) * 60 * 60 * 1000
        );
        await prisma.eventFollowUpLog.update({
          where: { id: log.id },
          data: { scheduledFor: newScheduledFor },
        });
      }
    }

    return NextResponse.json(followUp);
  } catch (error) {
    console.error("Error updating follow-up:", error);
    return NextResponse.json({ error: "Erro ao atualizar follow-up" }, { status: 500 });
  }
}

// DELETE /api/admin/tappy-summit/follow-ups/[id] - Delete follow-up
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.eventFollowUp.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting follow-up:", error);
    return NextResponse.json({ error: "Erro ao excluir follow-up" }, { status: 500 });
  }
}
